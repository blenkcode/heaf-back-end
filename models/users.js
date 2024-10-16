const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: String,
  email: String,
  password: String,
  firstCo: Date,
  age: Number,
  token: String,
  weight: Number,
  height: Number,
  gender: String,
  activityLevel: Number,
  BMR: Number,
  TDEE: Number,
  weightObj: Number,
  objectif: Number,
  caloriesDeficit: Number,
  weights: [
    {
      weight: { type: Number, required: true },
      date: { type: Date, required: true },
    },
  ],
});

const User = mongoose.model("users", userSchema);

module.exports = User;
