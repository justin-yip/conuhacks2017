var express = require('express');
var router = express.Router();
var request = require('request');

router.post('/find', function(req, res, next) {
    let data = {
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        radius: 5,
        show: "deal",
        keyword: (req.body.keyword).join("+"),
        lang: "en",
    }
    // let data = {
    //     what: req.body.what,
    //     where : req.body.where,
    //     pgLen: 5,
    //     pg: 1,
    //     dist: 5,
    //     fmt: "JSON",
    //     lang: "en",
    //     UID: "1",
    //     apikey: "uvu5duaqz94wexb8sqghqm4q"
    // };

    findBusiness(data, res);
});

function findBusiness(data, response){
    let url = "http://dcr.yp.ca/api/search/popular?";
    url += encodeQueryData(data)

    request.get(url, function(err, res, body) {
        if (err) {
            console.log(err)
            response.status(500).send(err);
        }
        var body = JSON.parse(body);
        if(body.data && body.data.length > 0){
            let deal = body.data[0].result.Translation.en;
            let merchant = body.data[0].result.Merchants[0].Translation.en;
            let str = "\n" + merchant.name +"\nDeal: " + deal.title +"\n";
            if(deal.url && deal.url!=null){
                str += deal.url;
            }else if(merchant.url && merchant.url!=null){
                str += merchant.url;
            }
            response.send(str)
        }else{

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
