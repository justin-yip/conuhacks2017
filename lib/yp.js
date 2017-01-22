var request = require('request');
var twitter = require('./twitter');

function find(tweetData) {
  console.log("Querying Yellow Pages");
    let data = {
        latitude: tweetData.coordinates[0],
        longitude: tweetData.coordinates[1],
        radius: 5,
        show: "deal",
        keyword: (tweetData.text).join("+"),
        lang: "en",
    };
    findBusiness(data, tweetData);
}

function findBusiness(data, original){
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

            twitter.sendTweet(original.tweet_id, original.username, str);

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


module.exports = {
  find: find
}
