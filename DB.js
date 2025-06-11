const mongoose = require('mongoose');
require("dotenv").config()
const connectDB = async () =>{
    try{
        const conn = await mongoose.connect(process.env.mongoConnectionString,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("connected succesfully");
    }catch(err){
        console.log("could not connect to the database");
        console.log(err);
    }
}
module.exports = {connectDB};