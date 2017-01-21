var express = require('express');
var router = express.Router();

/* GET routes. */
router.get('/:twitterstatus', function(req, res, next) {
	var twitterStatus = req.params.twitterstatus;
	res.send(twitterStatus);
});

module.exports = router; 