const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("CREATING FIRST SEREVER USING EXPRESS.JS");
});

//listener
const port = 8080;
app.listen(port, () => {
  console.log("LISTENIG ON PORT NUMBER: ", { port });
});

//The process of authorization is distinct from that of authentication. Whereas authentication is the process of verifying that "you are who you say you are", authorization is the process of verifying that "you are permitted to do what you are trying to do".
