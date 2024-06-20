const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  pseudo: String,
  email: String,
  password: String,
  token: String,
  firstCo: Date,
  age: Number,
  weight: Number,
  height: Number,
  gender: String,
  activityLevel: Number,
  BMR: Number,
  TDEE: Number,
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
