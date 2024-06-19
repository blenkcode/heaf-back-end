var express = require("express");

var router = express.Router();

require("../models/connection");
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");

//inscription

router.post("/signup", (req, res) => {
  if (!checkBody(req.body, ["pseudo", "email", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  User.findOne({ pseudo: req.body.pseudo }).then((data) => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User({
        pseudo: req.body.pseudo,
        email: req.body.email,
        password: hash,
        token: uid2(32),
      });

      newUser.save().then((newDoc) => {
        res.json({ result: true, token: newDoc.token });
      });
    } else {
      // User already exists in database
      res.json({ result: false, error: "User already exists" });
    }
  });
});

//connexion
router.post("/signin", (req, res) => {
  if (!checkBody(req.body, ["pseudo", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  User.findOne({ pseudo: req.body.pseudo }).then((data) => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({
        result: true,
        data: data,
      });
    } else {
      res.json({ result: false, error: "User not found or wrong password" });
    }
  });
});

// Route pour mettre à jour les informations de l'utilisateur avec le token
router.put("/initData/:token", (req, res) => {
  const token = req.params.token;

  User.findOne({ token })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ result: false, error: "User not found" });
      }

      // Ajouter les nouvelles entrées de poids aux poids existants
      const updatedWeights = [...user.weights, ...req.body.weights];

      // Mettre à jour les informations de l'utilisateur
      return User.findByIdAndUpdate(
        user._id,
        {
          age: req.body.age,
          gender: req.body.gender,
          height: req.body.height,
          weight: req.body.weight,
          weights: updatedWeights,
          activityLevel: req.body.activityLevel,
          BMR: req.body.BMR,
          TDEE: req.body.TDEE,
          calories: req.body.calories,
        },
        { new: true, runValidators: true } // Retourner le document mis à jour et appliquer les validations
      );
    })
    .then((updatedUser) => {
      if (!updatedUser) {
        return res.status(404).json({ result: false, error: "User not found" });
      }

      res.json({
        result: true,
        user: updatedUser,
      });
    })
    .catch((error) => {
      console.error("Error updating user:", error);
      res.status(500).json({ result: false, error: error.message });
    });
});

// route pour mettre à jour TDEE et BMR :
router.put("/updateData/:token", (req, res) => {
  const token = req.params.token;

  User.findOne({ token })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ result: false, error: "User not found" });
      }

      // Ajouter les nouvelles entrées de poids aux poids existants

      // Mettre à jour les informations de l'utilisateur
      return User.findByIdAndUpdate(
        user._id,
        {
          BMR: req.body.BMR,
          TDEE: req.body.TDEE,
        },
        { new: true, runValidators: true } // Retourner le document mis à jour et appliquer les validations
      );
    })
    .then((updatedUser) => {
      if (!updatedUser) {
        return res.status(404).json({ result: false, error: "User not found" });
      }

      res.json({
        result: true,
        user: updatedUser,
      });
    })
    .catch((error) => {
      console.error("Error updating user:", error);
      res.status(500).json({ result: false, error: error.message });
    });
});

router.get("/:token", (req, res) => {
  const token = req.params.token;

  User.findOne({ token })

    .then((user) => {
      if (!user) {
        return res.status(404).json({ result: false, error: "user not found" });
      }
      res.json({
        result: true,
        data: user,
      });
    })
    .catch((error) => {
      console.error("Error fetching user:", error);
      res.status(500).json({ result: false, error: error.message });
    });
});

router.put("/newWeight/:token", (req, res) => {
  const token = req.params.token;

  User.findOne({ token })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ result: false, error: "User not found" });
      }

      // Ajouter le nouveau poids avec la date actuelle au tableau existant des poids
      const newWeightEntry = req.body;
      const updatedWeights = [...user.weights, newWeightEntry];

      // Mettre à jour les informations de l'utilisateur
      return User.findByIdAndUpdate(
        user._id,
        {
          weights: updatedWeights,
        },
        { new: true, runValidators: true } // Retourner le document mis à jour et appliquer les validations
      );
    })
    .then((updatedUser) => {
      if (!updatedUser) {
        return res.status(404).json({ result: false, error: "User not found" });
      }

      res.json({
        result: true,
        weights: updatedUser.weights,
      });
    })
    .catch((error) => {
      console.error("Error updating user:", error);
      res.status(500).json({ result: false, error: error.message });
    });
});
router.get("/weights/:token", (req, res) => {
  const token = req.params.token;

  User.findOne({ token })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ result: false, error: "User not found" });
      }

      res.json({
        result: true,
        weights: user.weights,
      });
    })
    .catch((error) => {
      console.error("Error fetching user weights:", error);
      res.status(500).json({ result: false, error: error.message });
    });
});
module.exports = router;
