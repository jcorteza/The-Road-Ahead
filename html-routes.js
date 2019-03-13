const path = require("path");

module.exports = function(app) {
    app.get("/", (req, res) => {
        res.sendFile(path.join(__dirname,"public/index.html"));
    });

    app.get("/results", (req, res) => {
        res.sendFile(path.join(__dirname,"public/results.html"))
    });

    app.get("/about", (req, res) => {
        res.sendFile(path.join(__dirname,"public/about.html"))
    });
}