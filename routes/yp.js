var express = require('express');
var router = express.Router();
var request = require('request');
var twitter = require('../lib/twitter');

router.get('/', function (req, res, next) {
    console.log("Querying Yellow Pages");

    if(req.query.lat && req.query.long){
        console.log("coord")
        findDeal(req.query, res);
    }else if (req.query.address) {
        findBbusiness(req.query, [], res);
    }else{
        res.render('index', {array: []});
    }
});

function findDeal(tweetData, response){
    let url = "http://dcr.yp.ca/api/search/popular?";
    let data = {
        latitude: tweetData.lat,
        longitude: tweetData.long,
        radius: 5,
        show: "deal",
        keyword: tweetData.kw,
        lang: "en",
    };
    url += encodeQueryData(data)

    request.get(url, function(err, res, body) {
        if (err) {
            console.log(err)
            response.status(500).send(err);
        }
        var body = JSON.parse(body);
        let items = [];
        if(body.data && body.data.length > 0){
            for(i=0;(i<11 && i<body.data.length);i++){
                let deal = body.data[i].result.Translation.en;
                let merchant = body.data[i].result.Merchants[0].Translation.en;
                let item = {
                    id: merchant.id,
                    name: merchant.name,
                    dealName: deal.title,
                    distance: body.data[i].kilometers+""
                }
                if(deal.url && deal.url!=null){
                    item.dealUrl = deal.url;
                }else if(merchant.url && merchant.url!=null){
                    item.dealUrl = merchant.url;
                }
                items.push(item);
            }
            findBusiness(tweetData, items, response);
        }else{
            findBusiness(tweetData, [], response);
        }

    });
}
//hack is forever
function findBusiness(tweetData, dealItems, response){
    console.log("business")
    let url = "http://api.sandbox.yellowapi.com/FindBusiness/?";
    data = {
        what: tweetData.kw,
        pgLen: 5,
        pg: 1,
        dist: 5,
        fmt: "JSON",
        lang: "en",
        UID: "1",
        apikey: "uvu5duaqz94wexb8sqghqm4q"
    }
    if (tweetData.coordinates && tweetData.coordinates.length ==2){
        data.where = tweetData.lat+","+tweetData.long;
    }else if(tweetData.address){
        data.where = tweetData.address;
    }else{
        data.where = "montreal";
    }
     url += encodeQueryData(data)
     console.log(data);
     console.log(url);
     request.get(url, function(err, res, body) {
         if (err) {
             console.log(err)
             response.status(500).send(err);
         }
         console.log(body);
         var body = JSON.parse(body);
         if(body.listings && body.listings.length > 0){
            let items = [];
            for(i=0;(i<11 && i<body.listings.length);i++){
                let item = {
                    id: body.listings[i].id,
                    name: body.listings[i].name,
                    distance: body.listings[i].distance+""
                }
                if(body.listings[i].address.street){
                    item.url = "https://www.google.com/maps?q="+
                      encodeURIComponent(body.listings[0].address.street.replace(/\s/g, "+")) +","+
                      encodeURIComponent(body.listings[0].address.city.replace(/\s/g, "+")) +","+
                      encodeURIComponent(body.listings[0].address.prov.replace(/\s/g, "+")) +","+
                      encodeURIComponent(body.listings[0].address.pcode.replace(/\s/g, "+"));
                }else{
                    item.url = null;
                }
                for (j in dealItems){
                    if(dealItems[j].id == item.id){
                        item.dealName = dealItems[j].dealName;
                        item.dealUrl = dealItems[j].dealUrl || null;
                        dealItems.splice(j, 1);
                        break;
                    }
                }
                items.push(item);
            }
            items.push.apply(items, dealItems);
            console.log("ITEMSSS " + JSON.stringify(items, null, 2));
            response.render('index', {array: items});
            // response.json(items);
         }else{
            // response.json(null);
            response.render('index', {array: []});
         }
     });
}

function encodeQueryData(data) {
   let ret = [];
   for (let d in data)
     ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
   return ret.join('&');
}

module.exports = router;
