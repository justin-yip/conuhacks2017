var config = require('../config/config');
var twitter = require('twitter');

var client = new twitter(config.twitter);

function sendTweet(tweet_id, username, message){
  console.log("Replying to: " + tweet_id);
  console.log(message);
  return client.post('statuses/update', {
    status: username + " " + message,
    in_reply_to_status_id: tweet_id
  }).then(res => {
    console.log("Done..");
    //console.log(JSON.stringify(res, null, 2));
  }).catch(err => {
    console.log(err);
  })
}

module.exports = {
  sendTweet: sendTweet
}
