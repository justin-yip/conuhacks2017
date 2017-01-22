var request = require('request');
var twitter = require('./twitter');
var tiny = require('tinyurl');
var config = require('../config/config');

function find(tweetData) {
  console.log("Querying Yellow Pages");

    if(tweetData.coordinates && tweetData.coordinates.length == 2){
        findDeal(tweetData);
    }else{
        findBusiness(tweetData)
    }
}

function findDeal(tweetData){
    let url = "http://dcr.yp.ca/api/search/popular?";
    let data = {
        latitude: tweetData.coordinates[0],
        longitude: tweetData.coordinates[1],
        radius: 5,
        show: "deal",
        keyword: (tweetData.text).join("+"),
        lang: "en",
    };
    url += encodeQueryData(data)

    request.get(url, function(err, res, body) {
        if (err) {
            console.log(err)
            response.status(500).send(err);
        }
        var body = JSON.parse(body);
        // console.log(body);
        if(body.data && body.data.length > 0){
            let deal = body.data[0].result.Translation.en;
            let merchant = body.data[0].result.Merchants[0].Translation.en;
            let str = "\nWe suggest " + merchant.name +"\nDeal: " + deal.short_title +"\n";

            if(deal.url && deal.url!=null){
                str += deal.url;
            }else if(merchant.url && merchant.url!=null){
                str += merchant.url;
            }
            createTinyAndSend(tweetData.tweet_id, tweetData.username, str, data, true);
            // twitter.sendTweet(tweetData.tweet_id, tweetData.username, str);

        }else{
            findBusiness(tweetData)
        }

    });
}

function findBusiness(tweetData){
    let url = "http://api.sandbox.yellowapi.com/FindBusiness/?";
    data = {
        what: (tweetData.text).join("+"),
        pgLen: 5,
        pg: 1,
        dist: 5,
        fmt: "JSON",
        lang: "en",
        UID: "1",
        apikey: "uvu5duaqz94wexb8sqghqm4q"
    }
    if (tweetData.coordinates && tweetData.coordinates.length ==2){
        data.where = tweetData.coordinates[0]+","+tweetData.coordinates[1];
    // }else if(tweetData.place){
    //     data.where = tweetData.place;
    }else{
        data.where = "45.5534868972,-73.5795593262";
    }
     url += encodeQueryData(data)
    //  console.log(data);
     console.log(url);
     request.get(url, function(err, res, body) {
         if (err) {
             console.log(err)
             response.status(500).send(err);
         }
         console.log(body);
         var body = JSON.parse(body);
         if(body.listings && body.listings.length > 0){
            let str = "\nWe suggest " + body.listings[0].name;
            let address = !body.listings[0].address.street ? "" : "\nhttps://www.google.com/maps?q="+
                encodeURIComponent(body.listings[0].address.street.replace(/\s/g, "+")) +","+
                encodeURIComponent(body.listings[0].address.city.replace(/\s/g, "+")) +","+
                encodeURIComponent(body.listings[0].address.prov.replace(/\s/g, "+")) +","+
                encodeURIComponent(body.listings[0].address.pcode.replace(/\s/g, "+"));
            str += address;
            createTinyAndSend(tweetData.tweet_id, tweetData.username, str, data, true);
            // twitter.sendTweet(tweetData.tweet_id, tweetData.username, str);
         }else{
            let str = "\nSorry, we couldn't find anything";
            createTinyAndSend(tweetData.tweet_id, tweetData.username, str, data, false);
            // twitter.sendTweet(tweetData.tweet_id, tweetData.username, str);
         }
     });
}

function encodeQueryData(data) {
   let ret = [];
   for (let d in data)
     ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
   return ret.join('&');
}


function createTinyAndSend(tweet_id, username, str, data, generateTiny){
  if(generateTiny){
    var splitCoords = data.where ? data.where.split(",") : [data.latitude, data.longitude];
    // console.log(data);
    var tinyurl = config.ngrok + "?lat=" + splitCoords[0] + "&long=" + splitCoords[1] + "&kw=" + (data.keyword || data.what) + "&address=" + data.where;
    tiny.shorten(tinyurl, function(res) {
      str += "\nMore results: " + res;
      console.log(res);
      twitter.sendTweet(tweet_id, username, str);
    });
  } else {
    twitter.sendTweet(tweet_id, username, str);
  }
}

module.exports = {
  find: find
}
