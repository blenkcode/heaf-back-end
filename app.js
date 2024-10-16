require("dotenv").config();
var express = require("express");

var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();
const cors = require("cors");
const corsOptions = {
  origin: ["https://heafv2.vercel.app", "http://localhost:3000"], // Autoriser ces domaines
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Méthodes HTTP autorisées
  credentials: true, // Autorise l'envoi de cookies ou d'headers d'authentification
  optionsSuccessStatus: 200, // Pour les navigateurs anciens
};
const port = process.env.PORT || 3005;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
app.use(cors(corsOptions));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

module.exports = app;
