const express = require('express');
const router = express.Router();
const User = require('../models/user')
const catchAsync = require('../utils/catchAsync.js')
const passport = require('passport');
const user = require('../controllers/users')

router.route('/register')
    .get(user.renderRegister)
    .post(catchAsync(user.register))

router.route('/login')
    .get(user.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), user.login)

router.get('/logout', user.logout)

module.exports = router;