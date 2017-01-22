var request = require('request');
var twitter = require('./twitter');

function find(tweetData) {
  console.log("Querying Yellow Pages");

    if(tweetData.coordinates && tweetData.coordinates.length == 2){
        findDeal(tweetData);
    }else{
        findBbusiness(tweetData)
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
        if(body.data && body.data.length > 0){
            let deal = body.data[0].result.Translation.en;
            let merchant = body.data[0].result.Merchants[0].Translation.en;
            let str = "\n" + merchant.name +"\nDeal: " + deal.title +"\n";

            if(deal.url && deal.url!=null){
                str += deal.url;
            }else if(merchant.url && merchant.url!=null){
                str += merchant.url;
            }

            twitter.sendTweet(tweetData.tweet_id, tweetData.username, str);

        }else{
            findBusiness(tweetData)
        }

    });
}

function findBbusiness(tweetData){
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
    }else if(tweetData.place){
        data.where = tweetData.place;
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
            let str = "\n" + body.listings[0].name;
            twitter.sendTweet(tweetData.tweet_id, tweetData.username, str);
         }else{
            let str = "\nSorry, we couuldn'y find anything";
            twitter.sendTweet(tweetData.tweet_id, tweetData.username, str);
         }
     });
}

function encodeQueryData(data) {
   let ret = [];
   for (let d in data)
     ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
   return ret.join('&');
}


module.exports = {
  find: find
}
