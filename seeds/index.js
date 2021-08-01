const mongoose = require('mongoose');
const cities = require('./cities')
const { places, descriptors } = require("./seedHelpers")
const Campground = require('../models/campground')

mongoose.connect('mongodb://localhost:27017/yelp-camp', { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", () => {
    console.log("Database Connected")
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (i = 0; i < 300; i++) {
        const rand1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '6103b9e2b8bcc8148830a22b',
            location: `${cities[rand1000].city},${cities[rand1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ut sit placeat, aliquid doloremque voluptate iure facilis modi.Alias,iure a est saepe minima obcaecati dolorum ab dolore dolor sequi quidem!",
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[rand1000].longitude,
                    cities[rand1000].latitude,
                ]
            },

            images: [
                {
                    url: 'https://res.cloudinary.com/dcvnbkt1y/image/upload/v1627741804/YelpCamp/f2jrpxmlnajyybdaluqv.jpg',
                    filename: 'YelpCamp/f2jrpxmlnajyybdaluqv'
                }
            ]
        })
        await camp.save();

    }

}

seedDB().then(() => {
    mongoose.connection.close();
});