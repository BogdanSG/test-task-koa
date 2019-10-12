const LoremIpsum = require("lorem-ipsum").LoremIpsum;

const lorem = new LoremIpsum({
    format: "plain",
    sentencesPerParagraph: {
        max: 10,
        min: 3
    },
    wordsPerSentence: {
        max: 16,
        min: 4
    }
});

function randomInteger(min, max) {

    return Math.floor(min + Math.random() * (max + 1 - min));

} //randomInteger

module.exports = function () {

    const book = {};

    book.title = lorem.generateWords();
    book.author = `${lorem.generateWords(1)} ${lorem.generateWords(1)}`;
    book.description = lorem.generateSentences();
    book.date = new Date(randomInteger(1e10, +new Date())).toISOString().slice(0, 19).replace('T', ' ');

    return book;

};