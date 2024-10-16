require("dotenv").config();
var express = require("express");
const cors = require("cors");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

const corsOptions = {
  origin: ["https://heafv2.vercel.app", "http://localhost:3000"], // Origines autorisées
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Méthodes HTTP autorisées
  credentials: true, // Autoriser les cookies si nécessaire
  optionsSuccessStatus: 200, // Pour les navigateurs plus anciens (IE11, etc.)
};
app.use(cors(corsOptions));
const port = process.env.PORT || 3005;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
app.options("*", cors(corsOptions));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

module.exports = app;
