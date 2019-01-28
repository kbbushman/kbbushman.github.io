const path = require('path');
const express = require('express');
const app = express();
const methodOverride = require('method-override');;
const bodyParser = require('body-parser');
require('./db/db');
const authorsController = require('./controllers/authors');
const articlesController = require('./controllers/articles');
const usersController = require('./controllers/users');
const session = require('express-session');

app.use((req, res, next) => {
  req.myProp = 'This is my prop';
  next();
});

app.use(session({
  secret: 'Shhhh, this is a secret...!',
  resave: false,
  saveUninitialized: false // Only save the session if a property has been added to req.session
}));

app.use(express.static(__dirname + '/public'));

app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({extended: false}));

// Use Controllers
app.use('/auth', usersController);
app.use('/authors', authorsController);
app.use('/articles', articlesController);

app.get('/', (req, res) => {
  res.render('index.ejs', { message: req.session.message })
});


app.listen(3000, () => {
  console.log('listening on port 3000');
});
