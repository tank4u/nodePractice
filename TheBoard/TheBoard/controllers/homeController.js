(function (homeController) {
    
    var data = require("../data");
    var auth = require("../auth");

    homeController.init = function (app) {
            
        app.get("/", function (req, res) {
            //res.send("<html><body><h1>" + req.url + "</h1></body></html>");
            
            //get view and pass data to it from Controller, "title" available as @model in view.
            //res.render("jade/index", { title: "Express + Jade" });
            
            //res.render("ejs/index", { title: "Express + EJS" });
            
            data.getNoteCategories(function (err, results) {
                res.render("vash/index", {
                    title: "Vash view # The Board",
                    error: err,
                    categories: results,
                    duplicateErr: req.flash("duplicateCategory"),
                    user: req.user //populated by passport library
                });
            });
            
        });
        
        //pass "auth.ensureAuthenticated" but not execute it, it redirects to login if not already authenticated
        app.get("/notes/:categoryName",
            auth.ensureAuthenticated,
            function (req, res) {
                var categoryName = req.params.categoryName;
            
                res.render("vash/notes", {
                    title: categoryName,
                    user: req.user
                });
        });

        app.post("/newCategory", 
            auth.ensureAuthenticated,
            function (req, res) {
                var categoryName = req.body.categoryName;
                data.createCategory(categoryName, function (err) {
                    if (err) {
                        //handle error
                        console.log(err);
                        req.flash("duplicateCategory", err);
                        res.redirect("/");
                    }
                    else {
                        res.redirect("/notes/" + categoryName);
                    }
                });
        });
    }

})(module.exports);