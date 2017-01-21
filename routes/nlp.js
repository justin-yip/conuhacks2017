var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('Natural Language Processor here. I\'m not implemented yet.');
});

module.exports = router; 