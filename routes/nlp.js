var express = require('express');
var router = express.Router();

// Natural Language Processing
let nlp = require('nlp_compromise');

router.get('/', function(req, res, next) {
	var response = "To use NLP, "
	+"you could do: "
	+"localhost:3000/nlp/I want some Nike shoes";
	res.send(response)
});

/* GET routes. */
router.get('/:twitterstatus', function(req, res, next) {
	// Retrieve GET parameter
	var twitterStatus = req.params.twitterstatus;

	// Pass it to NLP compromise for processing
	var sentence = nlp.sentence(twitterStatus);

	var jsonResult = JSON.stringify(sentence);

	// Return result for debugging
	res.send(jsonResult);
});

module.exports = router; 