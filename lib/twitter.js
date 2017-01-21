var config = require('../config/config');
var twitter = require('twitter');

var client = new twitter(config.twitter);

function sendTweet(tweet_id, username, message){
  console.log("TWEET_ID " + tweet_id);

  

  return client.post('statuses/update', {
    status: username + " " + message,
    in_reply_to_status_id: tweet_id
  }).then(res => {
    console.log(JSON.stringify(res, null, 2));
  })
}

module.exports = {
  sendTweet: sendTweet
}
