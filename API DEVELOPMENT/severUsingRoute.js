const express = require("express");
const app = express();

//middleware
const morgan = require("morgan");
app.use(morgan("dev"));
const ownMiddleware = (req, res, next) => {
  console.log("our own middleware");
  next(); //it will allow  nodejs's "event loop" to move forward
};
app.use(ownMiddleware);

//M1
//const routes = require("./route/apiroute");
//app.get("/", routes.route1);

//M2
const { route1 } = require("./route/apiroute");
app.get("/", route1);

//listener
const port = 8080;
app.listen(port, () => {
  console.log("LISTENIG ON PORT NUMBER: ", { port });
});
