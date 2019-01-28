const mongoose = require('mongoose');

const Article = require('./articles');

const authorSchema = mongoose.Schema({
  name: String,
  articles: [Article.schema],
});


// Making a mongo collection named authors, The schema,
// is the blueprint for all the documents going into the collection
const Author = mongoose.model('Author', authorSchema);

//Author model which has all those methods to perform crud updates
module.exports = Author;
