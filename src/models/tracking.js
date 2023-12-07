const mongoose = require('mongoose');
const { Schema } = mongoose;

const foodTrackingSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    food: [
      {
        foodId: {
          type: mongoose.ObjectId,
          require: true,
          ref: 'Food',
        },
        portion: {
          type: Number,
          required: true,
        },
        time: {
          type: String,
          required: true,
        },
        dataFood: {
          name: {
            type: String,
            maxlengh: 255,
            required: true,
          },
          image: {
            type: String,
            required: true,
          },
          category: {
            type: String,
            ref: 'Category',
          },
          cal: {
            type: Number,
            required: true,
          },
          protein: {
            type: Number,
            required: true,
          },
          carb: {
            type: Number,
            required: true,
          },
          fat: {
            type: Number,
            required: true,
          },
        },
      },
      { _id: false },
    ],
  },
  { _id: false }
);

const trackingSchema = new Schema(
  {
    user: {
      type: mongoose.ObjectId,
      requires: true,
      ref: 'User',
    },
    tracking: [foodTrackingSchema],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const trackingModel = mongoose.model('Tracking', trackingSchema);

module.exports = trackingModel;
