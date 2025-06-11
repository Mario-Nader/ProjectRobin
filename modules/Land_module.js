const mongoose = require('mongoose');

const landSchema = new mongoose.Schema({
  land_no: {
    type: Number,
    required: true
  },
  patrol_ID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patrol',
    required: true
  },
  crops: {
    wheat: {
      type: Number,
       required: true
    },
    watermelon: {
      type: Number,
       required: true
    },
    apple: {
      type: Number,
      required: true
    }
  },
  houses: {
    type: Number,
     required: true
  },
  horses: {
    type: Number,
    required: true
  },
  soldiers: {
    type: Number,
    required: true
  },
  carts: {
    type: Number,
    required: true
  },
  workshop: {
    type: Boolean,
    required: true
  },inventory:{
    wheat:{
      type:Number,
      required:true,
    },watermelon:{
      type:Number,
      required:true
    },apple:{
      type:Number,
      required:true,
    }
  },
  adjacent:{
    type:[Number],
    required:true
  }
});

module.exports = mongoose.model('Land', landSchema);
