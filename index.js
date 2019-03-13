const express = require("express");
const app = express();
const PORT = process.env.PORT || 3020;

app.use(express.static("./public"));
require("./html-routes")(app);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "https://maps.googleapis.com/");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.listen(PORT, (req, res) => {
    console.log(`Successfully connected to server on http://localhost:${PORT}`);
});