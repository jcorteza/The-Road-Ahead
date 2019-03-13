module.exports = function(app) {
    app.get("/", (req, res) => {
        res.sendFile("index.html");
    });

    app.get("/results", (req, res) => {
        res.sendFile("results.html");
    });

    app.get("/about", (req, res) => {
        res.sendFile("about.html");
    });
}