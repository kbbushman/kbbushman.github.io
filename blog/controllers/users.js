const express = require('express');
const bcrypt = require('bcryptjs');
const router  = express.Router();

const User = require('../models/users');

router.post('/registration', async (req, res) => {
  console.log('In Reg ===================', req.body);
  const password = req.body.password;
  const hashedPassword = await bcrypt.hashSync(password, bcrypt.genSaltSync(10));
  const newUser = {};
  newUser.username = req.body.username;
  newUser.email = req.body.email;
  newUser.password = hashedPassword;

  try {
    console.log('In New User ===================', newUser);
    const createdUser = await User.create(newUser);
    req.session.username = createdUser.username;
    req.session.loggedIn = true;
    console.log('In User Session ===================', req.session);
    res.redirect('/authors');
  } catch (err) {
    res.send(err)
  }
});


router.post('/login', async (req, res) => {
  try {
    const foundUser = await User.findOne({username: req.body.username});
    if (foundUser) {
      const passwordsMatch = bcrypt.compareSync(req.body.password, foundUser.password);
      if (passwordsMatch) {
        req.session.message = '';
        req.session.username = foundUser.username;
        req.session.loggedIn = true;
        res.redirect('/authors');
      } else {
        req.session.message = 'Username or password are incorrect';
        res.redirect('/');
      }
    } else {
      req.session.message = 'Username or password are incorrect';
      res.redirect('/');
    }
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});


router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.send(err);
    } else {
      res.redirect('/');
    }
  })
})

module.exports = router;
