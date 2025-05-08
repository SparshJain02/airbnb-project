const { default: mongoose } = require("mongoose");

mongoose.connect('mongodb://127.0.0.1:27017/wanderlust')
  .then(() => console.log('Connected!'));
  // model
  const listing = require("../models/listening");
  // data
  const initData = require("./data.js");

  async function insertData(){
    // await listing.deleteMany({});
    initData.sampleListings = initData.sampleListings.map((obj)=>({...obj,owner: "6810e5e42d89368f1e5ee25c"}))
    // console.log(initData);
    await listing.insertMany(initData.sampleListings);
  }
  insertData();