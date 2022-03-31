const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-Parser");
var cookieParser = require("cookie-parser");
const expressValidator = require("express-validator");
const fs = require("fs");
const cors = require("cors");
//to access  .env file

dotenv.config();

//db

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true }).then(() => {
  console.log("MONGO DB IS CONNECTED TO EXPRESS SERVER");
});

mongoose.connection.on("error", (err) => {
  console.log(`DB CONNECTION ERROR : ${err.message}`);
});

//bring in routes
const routes = require("./routeForController/apiroute");
const authroutes = require("./routeForController/auth");
const userroute = require("./routeForController/user");

//apiDocs

app.get("/", (req, res) => {
  fs.readFile("docs/apiDocs.json", (err, data) => {
    if (err) {
      res.status(400).json({
        error: err,
      });
    }
    const docs = JSON.parse(data);
    res.json(docs);
  });
});

//middleware
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());
app.use("/", routes);
app.use("/", authroutes);
app.use("/", userroute);
app.use(function (err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    res.status(401).send("INVALID USER");
  }
});
app.use(cors());

//listener
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log("LISTENIG ON PORT NUMBER: ", { port });
});
