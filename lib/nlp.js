// In order to expose this library's code to external
// calls we need to tell Node what functions can be called
// externalCall: actualFunctionInsideHereThatWillBeCalled
module.exports = {
	CreateSearchQuery: CreateSearchQuery
}

// Natural Language Processing
let nlp_compromise = require('nlp_compromise');

// Returns "to-the-point" search queries that can be used
// to query the yellow pages API
function CreateSearchQuery (twitterStatus) {

	twitterStatus = PreFormatText(twitterStatus);

	//var sentences = GetSentences(twitterStatus);

	//for (var k = 0; k < sentences.length; k++) {
	// Pass it to NLP compromise for processing
	var sentence = nlp_compromise.sentence(twitterStatus);

	var terms = sentence.terms;

	var words = [];

	for (var i = 0; i < terms.length; i++) {
		if ((TermIs(terms[i], ["Noun"]) || TermIs(terms[i], ["Adjective"])) &&
			TermIsNot(terms[i], ["Person", "Pronoun", "Determiner"]))
		{
			var newWord = terms[i].text.toLowerCase();
			if (!words.includes(newWord))
				words.push(newWord);
		}
	};

	return words;

	//return queries;
}

/*function GetSentences(text) {
	var indexes = [];

	for (var i = 0; i < twitterStatus.length; i++) {
		if (text[i] === ".")
			indexes.push(i+1);
	}

	var sentences = [];
	int indexesPassed = 0;
	for (var i = 0; i < indexes.length; i++)
	{
		sentences.push(text.substr(indexesPassed,indexes[i]));
		var prev = 0;
		if (i-1 >= 0)
			prev = indexes[i-1];
		indexesPassed+=indexes[i]-prev;
	}
}*/

// 1) Replace "/" with " "
// 2) Replace "." with " "
// 3) Make any sentence start with
// a lowercase letter
// 4) Remove ?
// 5) remove stopwords
function PreFormatText(text) {
	// 1)
	text = text.replace("/", " ");

	// 3)
	for (var i = 0; i < text.length; i++) {
		if (text[i] === ".") {
			for (var j = i; j < text.length; j++) {
				if (isLetter(text[j])) {
					text = text.replaceAt(j, text[j].toLowerCase());
					break;
				}
			}
		}
	}

	// 2)
	text = text.replace(".", " ");

	// 4)
	text = text.replace("?", "");

	text = RemoveStopwords(text);

	return text;
}

function RemoveStopwords(text) {
	return text;
}

String.prototype.replaceAt=function(index, character) {
    return this.substr(0, index) + character + this.substr(index+character.length);
}

function isLetter(c) {
  return c.toLowerCase() != c.toUpperCase();
}

// True if term has all the properties in
// listOfProperties
function TermIs(term, listOfProperties) {
	var hits = 0;

	for (var i = 0; i < listOfProperties.length; i++) {
		if (term.pos.hasOwnProperty(listOfProperties[i]))
			hits++;
	}
	
	if (hits === listOfProperties.length)
		return true;

	return false;
}

// True if term has none of the properties
// in listOfProperties
function TermIsNot(term, listOfProperties) {
	for (var i = 0; i < listOfProperties.length; i++) {
		if (term.pos.hasOwnProperty(listOfProperties[i]))
			return false;
	}
	return true;
}

function AddQuery(verbs, nouns, queries) {
	var verbsString = ArrayToString(verbs);
	var nounsString = ArrayToString(nouns);

	var finalString = "";
	if (verbsString.length !== 0)
		finalString += verbsString + " ";
	finalString += nounsString;

	queries.push(finalString);
}

function ArrayToString(array) {
	var string = "";

	for (var i = 0; i < array.length; i++) {
		string += array[i];
		if (i+1 != array.length)
			string += " ";
	}

	return string;
}