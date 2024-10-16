var express = require("express");

var router = express.Router();
const jwt = require("jsonwebtoken"); // Ajout du package jsonwebtoken
const uid2 = require("uid2");
require("../models/connection");
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");

const bcrypt = require("bcrypt");

//inscription

router.post("/signup", (req, res) => {
  User.findOne({ name: req.body.username }).then((data) => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User({
        name: req.body.username,
        email: req.body.email,
        password: hash,
        token: uid2(32),
        height: null,
        age: null,
        weightObj: null,
        gender: null,
        caloriesDeficit: null,
        BMR: null,
        TDEE: null,
      });

      newUser.save().then((newDoc) => {
        // Générer un token JWT avec l'ID utilisateur
        const token = jwt.sign(
          { userId: newDoc._id, name: newDoc.name },
          process.env.JWT_SECRET,
          {
            expiresIn: "7d", // Token valide pendant 7 jours par exemple
          }
        );

        res.json({ result: true, token, user: newDoc });
      });
    } else {
      // User already exists
      res.json({ result: false, error: "User already exists" });
    }
  });
});

//connexion
router.post("/signin", (req, res) => {
  User.findOne({ name: req.body.username }).then((data) => {
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

//login via GOOGLE

router.post("/google-signin", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ result: false, error: "Email is required" });
  }

  // Recherche l'utilisateur dans la BDD par email
  User.findOne({ email: email })
    .then((data) => {
      if (data) {
        res.json({
          result: true,
          data: {
            pseudo: data.pseudo,
            token: data.token,
            weights: data.weights,
            activityLevel: data.activityLevel,
            gender: data.gender,
            weight: data.weight,
            height: data.height,
            caloriesDeficit: data.caloriesDeficit,
            BMR: data.BMR,
            TDEE: data.TDEE,
            age: data.age,
          },
        });
      } else {
        res.json({ result: false, error: "User not found" });
      }
    })
    .catch((error) => {
      res.status(500).json({ result: false, error: "Server error" });
    });
});
// Route pour mettre à jour les informations de l'utilisateur avec le token
router.put("/initData/:userId", (req, res) => {
  const userId = req.params.userId;

  User.findById(userId)
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
          objectif: req.body.objectif,
          gender: req.body.gender,
          height: req.body.height,
          weightObj: req.body.weightObj,
          weights: updatedWeights,
          activityLevel: req.body.activityLevel,
          BMR: req.body.BMR,
          TDEE: req.body.TDEE,
          caloriesDeficit: req.body.caloriesDeficit,
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

router.put("/initData/:token", (req, res) => {
  const token = req.params.token;

  User.find({ token })
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
          objectif: req.body.objectif,
          gender: req.body.gender,
          height: req.body.height,
          weightObj: req.body.weightObj,
          weights: updatedWeights,
          activityLevel: req.body.activityLevel,
          BMR: req.body.BMR,
          TDEE: req.body.TDEE,
          caloriesDeficit: req.body.caloriesDeficit,
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

router.get("/:userId", (req, res) => {
  const userId = req.params.userId;

  User.findById(userId)

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

router.put("/newWeight/:userId", (req, res) => {
  const userId = req.params.userId;

  console.log("Données reçues:", req.body);

  // Trouver l'utilisateur par ID
  User.findById(userId)
    .then((user) => {
      if (!user) {
        // Si l'utilisateur n'est pas trouvé, retourner une réponse immédiatement
        return res.status(404).json({ result: false, error: "User not found" });
      }

      const { newWeightEntry, BMR, objectif, TDEE } = req.body; // Accéder au premier élément du tableau des poids

      // Vérification des données
      if (!newWeightEntry || !newWeightEntry.weight || !newWeightEntry.date) {
        // Si les données sont invalides, renvoyer une réponse immédiatement
        return res.status(400).json({
          result: false,
          error: "Both weight and date are required.",
        });
      }

      // Ajouter le nouveau poids au tableau des poids de l'utilisateur
      user.weights.push(newWeightEntry);

      // Sauvegarder les modifications et renvoyer la réponse
      if (BMR) user.BMR = BMR;
      if (objectif) user.objectif = objectif;
      if (TDEE) user.TDEE = TDEE;

      // Sauvegarder les modifications et renvoyer la réponse
      return user.save().then((updatedUser) => {
        res.json({
          result: true,
          weights: updatedUser.weights,
          BMR: updatedUser.BMR,
          objectif: updatedUser.objectif,
          TDEE: updatedUser.TDEE,
        });
      });
    })
    .catch((error) => {
      // Si une erreur survient, renvoyer une réponse d'erreur
      console.error("Error updating user:", error);
      if (!res.headersSent) {
        // Vérification pour s'assurer que les en-têtes ne sont pas déjà envoyés
        return res.status(500).json({ result: false, error: error.message });
      }
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
