const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync.js')
const Campground = require('../models/campground')
const Review = require('../models/review');
const reviews = require('../controllers/reviews')
const ExpressError = require('../utils/ExpressErrors');
const { reviewSchema } = require('../schemas.js');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;
