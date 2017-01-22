var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var id = req.query.id;
  var long = req.query.long;
  var lat = req.query.lat;
  var address = req.query.address;
  var keyword = req.query.kw;

  var arr = [{id:"2",dealUrl:"http://www.youtube.com",distance:"1232 km",dealName:"Deal 1"},{name:"Hello12",id:"2",url:"http://www.google.ca",dealUrl:"http://www.youtube.com",distance:"1232 km",dealName:"Deal 1"}]; 

  console.log(id);
  console.log(long)
  console.log(lat)
  console.log(address)
  console.log(keyword)
  res.render('index', {array: arr});
});

module.exports = router;
