// In order to expose this library's code to external
// calls we need to tell Node what functions can be called
// externalCall: actualFunctionInsideHereThatWillBeCalled
module.exports = {
	CreateSearchQuery: CreateSearchQuery
}

// Natural Language Processing
let nlp_compromise = require('nlp_compromise');

// For spell correction
var Typo = require("typo-js");

var STOP_WORDS = require('./stopWords.js');

var SYMBOLS = ["!", "\"", "#", "$", "%", "&", "/", "\\", "(", ")", "=", "-", "_", "€", "{", "[", "]", "}", "@", "'", "~", "*", ":", ";", "µ", "<", ">", "|", "?", "+", "´", "^"];

// Returns a "to-the-point" search query that can be used
// to query the yellow pages API
function CreateSearchQuery (twitterStatus) {
	console.log("Building query");

	var formatted = PreFormatText(twitterStatus);
	var spellCorrected = SpellCorrect(formatted);

	// Pass it to NLP compromise for processing
	var sentence = nlp_compromise.sentence(spellCorrected);

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

	return RemoveStopWords(words);
}

// 1) Replace "/" with " "
// 2) Replace "." with " "
// 3) Make any sentence start with
// a lowercase letter
// 4) Remove ?
// 5) remove stopwords
function PreFormatText(text) {

	// Replace every single symbol to trim the text
	// exclamation marks, etc.
	for (var i = 0; i < SYMBOLS.length; i++) {
		text = text.replace(SYMBOLS[i], " ");
	}

	return text.toLowerCase();
}

// Takes a string of text and returns a string
// of corected text
function SpellCorrect(text) {
	var dictionary = new Typo( "en_US" );

	words = text.split(" ");

	fixedWords = [];

	var sentence = nlp_compromise.sentence(text);
	var terms = sentence.terms;

	for (var i = 0; i < terms.length; i++) {
		var wordPushed = false;

		// If it´s neither an organization nor a name
		if (!TermIs(terms[i], ["Organization"])
			&& (terms[i].firstName !== null
			|| terms[i].middleName !== null
			|| terms[i].LastName !== null)) {

			// We spell correct if needed
			var splitWord = terms[i].text.split(" ");

			for (var j = 0; j < splitWord.length; j++) {
				var termPushed = false;

				// If the word is misspelled
				if (!dictionary.check(splitWord[j])) {
					var suggestions = dictionary.suggest(splitWord[j]);

					if (suggestions.length > 0) {
						// Push a corrected version
						fixedWords.push(suggestions[0]);
						termPushed = true;
					}
				}
				// If we failed to correct the word,
				// or it was spelled correctly
				if (termPushed === false) {
					fixedWords.push(splitWord[j]);
				}
			}
		}
		else {
			// If it is a name or an organization, we push it
			// unchanged
			fixedWords.push(terms[i].text);
		}
	}

	/*for (var i = 0; i < words.length; i++) {
		var wordPushed = false;

		// If the word is misspelled
		if (!dictionary.check(words[i])) {
			var suggestions = dictionary.suggest(words[i]);

			if (suggestions.length > 0) {
				// Push a corrected version
				fixedWords.push(suggestions[0]);
				wordPushed = true;
			}
		}
		// If we failed to correct the word,
		// or it was spelled correctly
		if (wordPushed === false) {
			fixedWords.push(words[i]);
		}
	}*/

	return ArrayToString(fixedWords);
}

// array is an array of strings
// returns an array of strings that doesn't
// contain any stop words
function RemoveStopWords(array) {
	
	var noStopWordsArray = [];

	for (var i = 0; i < array.length; i++) {
		var subArray = array[i].split(" ");

		for (var j = 0; j < subArray.length; j++) {
			// If this word is not in the stop words
			// add it to the noStopWordsArray
			if (!STOP_WORDS.includes(subArray[j].replace("'", "")))
				noStopWordsArray.push(subArray[j]);
		}
	}

	return noStopWordsArray;
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
