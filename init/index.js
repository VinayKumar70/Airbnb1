require('dotenv').config({ path: '../.env' });
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const dburl = process.env.ATLAS_URL;
console.log(dburl);
main()                                                          //shows Exception
    .then((res) => {
        console.log("connectioin Successful");
        initDB();
    })
    .catch((err) => console.log(err));

async function main() {
    await mongoose.connect(dburl);         //connect mongo to localhost with the help of asynchronous function

    // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({ ...obj, owner: "69ca7f594a7f9ae5745c97a6" }));
    Listing.insertMany(initData.data);
    console.log("data was inserted");
}