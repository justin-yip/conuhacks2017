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

// List of stop words
var STOP_WORDS = ["a",
"about",
"above",
"after",
"again",
"against",
"all",
"am",
"an",
"and",
"any",
"are",
"aren't",
"as",
"at",
"be",
"because",
"been",
"before",
"being",
"below",
"between",
"both",
"but",
"by",
"can't",
"cannot",
"could",
"couldn't",
"did",
"didn't",
"do",
"does",
"doesn't",
"doing",
"don't",
"down",
"during",
"each",
"few",
"for",
"from",
"further",
"had",
"hadn't",
"has",
"hasn't",
"have",
"haven't",
"having",
"he",
"he'd",
"he'll",
"he's",
"her",
"here",
"here's",
"hers",
"herself",
"him",
"himself",
"his",
"how",
"how's",
"i",
"i'd",
"i'll",
"i'm",
"i've",
"if",
"in",
"into",
"is",
"isn't",
"it",
"it's",
"its",
"itself",
"let's",
"me",
"more",
"most",
"mustn't",
"my",
"myself",
"no",
"nor",
"not",
"of",
"off",
"on",
"once",
"only",
"or",
"other",
"ought",
"our",
"ours	ourselves",
"out",
"over",
"own",
"same",
"shan't",
"she",
"she'd",
"she'll",
"she's",
"should",
"shouldn't",
"so",
"some",
"such",
"than",
"that",
"that's",
"the",
"their",
"theirs",
"them",
"themselves",
"then",
"there",
"there's",
"these",
"they",
"they'd",
"they'll",
"they're",
"they've",
"this",
"those",
"through",
"to",
"too",
"under",
"until",
"up",
"very",
"was",
"wasn't",
"we",
"we'd",
"we'll",
"we're",
"we've",
"were",
"weren't",
"what",
"what's",
"when",
"when's",
"where",
"where's",
"which",
"while",
"who",
"who's",
"whom",
"why",
"why's",
"with",
"won't",
"would",
"wouldn't",
"you",
"you'd",
"you'll",
"you're",
"you've",
"your",
"yours",
"yourself",
"yourselves"]

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

	return text;
}

// Takes a string of text and returns a string
// of corected text
function SpellCorrect(text) {
	var dictionary = new Typo( "en_US" );

	words = text.split(" ");

	fixedWords = [];

	for (var i = 0; i < words.length; i++) {
		var wordPushed = false;

		// If the word is misspelled
		if (!dictionary.check(words[i])) {
			console.log("obe");
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
	}

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
			if (!STOP_WORDS.includes(subArray[j]))
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
