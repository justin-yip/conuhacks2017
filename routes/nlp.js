var express = require('express');
var router = express.Router();

// The actual language processing happens in this .js file
var nlp = require('../lib/nlp');

// localhost:3000/nlp/
/*router.get('/', function(req, res, next) {
	var response = "To use NLP, "
	+"you could do: "
	+"localhost:3000/nlp/I want some Nike shoes";
	res.send(response)
});*/

router.get('/ui', function(req, res) {
	res.render('nlpUI', { output: "" });
});

// localhost:3000/nlp/ui
// Returns a html page with an input box, button and an output
router.post('/ui', function(req, res) {
	var input = req.body.twitterStatus;
	var output = nlp.CreateSearchQuery(input);

	//res.render('nlpUI', { output: output });
	res.render('nlpUI', {
		input: input,
		output: JSON.stringify(output)
	});
});

// localhost:3000/nlp/:twitterstatus
router.get('/:twitterstatus', function(req, res, next) {
	// Retrieve GET parameter
	var twitterStatus = req.params.twitterstatus;

	var searchQuery = nlp.CreateSearchQuery(twitterStatus);

	// Return result for debugging
	res.send(searchQuery);
});

module.exports = router; 