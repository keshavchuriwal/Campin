if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express')
const path = require('path')
const mongoose = require('mongoose');
const Campground = require('./models/campground')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const ExpressErrors = require('./utils/ExpressErrors');
const ExpressError = require('./utils/ExpressErrors');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const Review = require('./models/review');
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')

const userRoutes = require('./routes/user')
const campgroundsRoutes = require('./routes/campgrounds')
const reviewsRoutes = require('./routes/reviews');
const { Store } = require('express-session');
const mongoSanitize=require('express-mongo-sanitize')
const helmet=require('helmet');
const dburl=process.env.DB_URL||'mongodb://localhost:27017/yelp-camp';
const secret=process.env.SECRET || 'thisshouldbeabettersecret!'

const MongoDBStore=require("connect-mongo")
const store = MongoDBStore.create({
    mongoUrl: dburl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret,
    }
})

mongoose.connect(dburl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", () => {
    console.log("Database Connected")
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"))
app.use(mongoSanitize({
    replaceWith:'_'
}))
app.use(helmet({contentSecurityPolicy:false}))
app.use(express.static(path.join(__dirname, 'public')))


store.on("error",function(e){
    console.log("Session store error",e)
})
const sessionConfig = {
    store,
    name:'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure:true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash())

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes)
app.use('/campgrounds', campgroundsRoutes)
app.use('/campgrounds/:id/reviews', reviewsRoutes)

app.get('/', (req, res) => {
    res.render('home')
});

app.all('*', (req, res, next) => {
    next(new ExpressErrors('Page not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.meassage = 'Oh No,Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})
const port=process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})