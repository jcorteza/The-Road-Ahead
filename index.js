require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3020;
const axios = require("axios");

app.use(express.static("./public"));
require("./html-routes")(app);

app.use(express.urlencoded());
app.use(express.json({extended: true}));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "https://maps.googleapis.com/");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.post("/request", (req, res) => {
    axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${req.body.address}&country=US&key=${process.env.GOOGLE_UNRESTRICTED}`)
        .then((response) => {
            // console.log(JSON.stringify(response.data.results[0]));
            res.json(response.data.results[0]);
        })
        .catch((error) => {
            console.log(error);
            if(error.response) {
            console.log(error.response);
                res.json({
                    Error: {
                        status: error.response.data,
                        status: error.response.status,
                        statusText: error.response.statusText
                    }
                });
            } else if(error.request) {
                console.log(error.request);
                res.json({
                    Error: error.request
                });
            } else {
                console.log(error.message);
                res.json({
                    Error: error.message
                });
            }
        });
});

app.listen(PORT, (req, res) => {
    console.log(`Successfully connected to server on http://localhost:${PORT}`);
});