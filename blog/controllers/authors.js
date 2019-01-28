const express = require('express');
const router  = express.Router();
const Author  = require('../models/authors');

// Require Articles Model
const Article = require('../models/articles');

// NEW Route
router.get('/new', (req, res) => {
  res.render('authors/new.ejs');
});

// INDEX Route
router.get('/', (req, res) => {
  Author.find({}, (err, allAuthors) => {
    // res.json(allAuthors);
    res.render('authors/index.ejs', {
      authors: allAuthors
    });
  });
});


// SHOW route
router.get('/:id', (req, res) => {
  Author.findById(req.params.id, (err, foundAuthor) => {
    if (err) {
      res.send(err);
    } else {
      res.render('authors/show.ejs', {
        author: foundAuthor
      });
    }
  })
});

// EDIT Route
router.get('/:id/edit', (req, res) => {
  Author.findById(req.params.id, (err, foundAuthor) => {
    res.render('authors/edit.ejs', {
      author: foundAuthor
    });
  });
});


// NEW Route
router.post('/', (req, res) => {
  // console.log(req.body);
  Author.create(req.body, (err, createdAuthor) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect('/authors');
    }
  });
});

// DESTROY Route
router.delete('/:id', (req, res) => {
  Author.findByIdAndRemove(req.params.id, (err, deletedAuthor) => {

    // Get All Author Article Id's
    const articleIds = [];
    deletedAuthor.articles.forEach(article => {
      articleIds.push(article._id)
    });

    // Remove all Articles from the Author.articles collection
    Article.deleteMany({
      _id: {
        $in: articleIds
      }
    }, (err, result) => {
      if (err) {
        res.send(err);
      } else {
        res.redirect('/authors')
      }
    });
  });
});


// UPDATE Route
router.put('/:id', (req, res) => {
  Author.findByIdAndUpdate(req.params.id, req.body, {new: true},(err, updatedAuthor) => {
    if (err) {
      res.send(err);
    } else {
      res.redirect('/authors');
    }
  });
});


module.exports = router;
