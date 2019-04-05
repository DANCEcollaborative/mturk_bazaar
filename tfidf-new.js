var tfidf = require("tfidf");
var fs = require('fs');

exports.buildcorpus = function () {
	
//	tfidf.addFileSync('data_files/one.txt');
//	tfidf.addFileSync('data_files/two.txt');

// Analyze the data
var corpus = ['this document is about nodee', 'this document is about ruby ', 'this document is about ruby and nodee', 'this document is about nodee it has node examples'];

if(!(corpus instanceof Array))
{
 	console.log("wrong");
}

var data = tfidf.analyze("about", corpus);
fs.writeFileSync("japherwockyFrequency.json", data.asJSON());

console.log("here  "+data.tfidf("nodee", corpus[0]));
console.log("here  "+data.tfidf("nodee", corpus[1]));
console.log("here  "+data.tfidf("ruby", corpus[2]));
}
