const express = require('express');
const router  = express.Router();
const Article  = require('../models/articles');

const Author = require('../models/authors');

// INDEX Route
router.get('/', (req, res)=>{
  Article.find({}, (err, foundArticles) => {
    if (err) {
      res.send(err);
    } else {
      res.render('articles/index.ejs', {
        articles: foundArticles
      });
    }
  })
});


// NEW Route
router.get('/new', (req, res)=>{
  Author.find({}, (err, authors) => {
    res.render('articles/new.ejs', {
      authors
    });
  });
});


// SHOW Route
router.get('/:id', (req, res)=>{
  Article.findById(req.params.id, (err, foundArticle) => {
    if (err) throw err;
    Author.findOne({'articles._id': req.params.id}, (err, foundAuthor) => {
      if (err) {
        res.send(err);
      } else {
        res.render('articles/show.ejs', {
            article: foundArticle,
            author: foundAuthor
        });
      }
    });

  });
});


// EDIT Route
router.get('/:id/edit', async (req, res)=>{

  try {
    const foundArticle = Article.findById(req.params.id);
    const allAuthors = Author.find({});
    const articleAuthor = Author.findOne({'articles._id': req.params.id});

    await Promise.all([foundArticle, allAuthors, articleAuthor])
      .then(results => res.render('articles/edit.ejs', {
        article: results[0],
        authors: results[1],
        articleAuthor: results[2]
      }));
  } catch (err) {
    res.send(err);
  }



  // Article.findById(req.params.id, (err, foundArticle) => {

  //   // Get all authors for dropdown menu
  //   Author.find({}, (err, allAuthors) => {

  //     // Find the one author that wrote the article
  //     Author.findOne({'articles._id': req.params.id}, (err, articleAuthor) => {
  //       if (err) {
  //         res.send(err);
  //       } else {
  //         res.render('articles/edit.ejs', {
  //           article: foundArticle,
  //           authors: allAuthors,
  //           articleAuthor: articleAuthor
  //         });
  //       }
  //     });
  //   });
  // });
});


// CREATE Route
router.post('/', (req, res)=>{
  // console.log(req.body);

  if (req.session.loggedIn) {
    return Author.findById(req.body.authorId, (err, author) => {

      Article.create(req.body, (err, createdArticle) => {
        // console.log(req.body)
        if (err) {
          res.send(err);
        } else {
          // This action is happening is Mongoose, not Mongo
          author.articles.push(createdArticle);
          // Now add it to Mongo
          author.save((err, savedAuthor) => {
            res.redirect('/articles');
          });
        }
      });
    });
  } else {
    req.session.message = 'You have to login before you can create an article.'
    res.redirect('/');
  }
});


// UPDATE Route
router.put('/:id', (req, res)=>{
  Article.findByIdAndUpdate(req.params.id, req.body, {new: true}, (err, updatedArticle) => {

    Author.findOne({'articles._id': req.params.id}, (err, foundAuthor) => {

      // If the Article Author has been updated...
      if (foundAuthor._id.toString() !== req.body.authorId) {
        // Remove article from previous author
        foundAuthor.articles.id(req.params.id).remove();
        foundAuthor.save((err, savedAuthor) => {
          if (err) {
            res.send(err)
          } else {
              Author.findById(req.body.authorId, (err, newAuthor) => {
                newAuthor.articles.push(updatedArticle);
                newAuthor.save((err, savedNewAuthor) => {
                  if (err) {
                    res.send(err);
                  } else {
                    res.redirect('/articles/' + req.params.id)
                  }
                });
              });
          }
        });
      } else {
        // Add article to new author
        foundAuthor.articles.push(updatedArticle);
        foundAuthor.save((err, savedAuthor) => {
          if (err) {
            res.send(err);
          } else {
            res.redirect('/articles/' + req.params.id);
          }
        });
      }
    });
  });
});


// DESTROY Route
router.delete('/:id', (req, res)=>{
  Article.findByIdAndRemove(req.params.id, (err, deletedArticle) => {

    Author.findOne({'articles._id': req.params.id}, (err, foundAuthor) => {

      // .id() and .remove() are mongoose array helper methods
      foundAuthor.articles.id(req.params.id).remove();

      foundAuthor.save((err, savedAuthor) => {
        if (err) {
          res.send(err);
        } else {
          res.redirect('/articles');
        }
      });
    });
  });
});

module.exports = router;
