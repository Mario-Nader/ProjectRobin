const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema({
asset:{
    type:string,
    required:True,
},
cost:{
    type:Number,
    required:True,
}
}
)