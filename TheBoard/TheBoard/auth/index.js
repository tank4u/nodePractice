(function (auth) {
    var data = require("../data");
    var hashUtil = require("./hashUtil");
    
    var passport = require("passport");
    var localStrategy = require("passport-local").Strategy;
    
    function validateUser(username, password, next) {
        data.getUser(username, function (err, user) {
            if (!err && user) {
                //verify password
                var currentHash = hashUtil.computeHash(password, user.salt);
                if (currentHash === user.passwordHash) {
                    next(null, user);
                    return; //to stop further execution, otherwise returns failure as well
                }
            }
            next(null, false, { message: "Invalid credentials" }); //passport uses special callback signature
        });
    }
    
    //to allow only authenticated access
    auth.ensureApiAuthenticated = function (req, res, next) {
        //"isAuthenticated" is added by passport middleware
        if (req.isAuthenticated()) {
            next();
        }
        else {
            res.send(401, "Not authorized");
        }
    };
    
    //to enforce login for each page
    auth.ensureAuthenticated = function (req, res, next) {
        //"isAuthenticated" is added by passport middleware
        if (req.isAuthenticated()) {
            next();
        }
        else {
            res.redirect("/login");
        }
    };

    auth.init = function (app) {
        
        passport.use(new localStrategy(validateUser)); //we can register multiple strategies
        
        //serialize/deserialize required by "passport" to handle user, 
        //it populates "req.user" for all the authenticated requests using deserialize, which we can use in other views
        passport.serializeUser(function (user, next) {
            next(null, user.username); //return key to lookup user in deserialize
        });
        passport.deserializeUser(function (key, next) {
            data.getUser(key, function (err, user) {
                if (err) {
                    next(null, false, { message: "Failed to retrieve user" });
                }
                else {
                    next(null, user);
                }
            });
        });

        app.use(passport.initialize());
        app.use(passport.session()); //session for storing user cookie
        
        app.get("/login", function (req, res) {
            res.render("vash/login", { title: "Login for The Board", message: req.flash("loginErr") });
        });
        
        //next required by the passport to return authentication result after post completion
        app.post("/login", function (req, res, next) {
            var authFunction = passport.authenticate("local", function (err, user, info) {
                if (err) {
                    next(err);
                }
                else {
                    //logIn
                    req.logIn(user, function (err) {
                        if (err) {
                            next(err);
                        }
                        else {
                            res.redirect("/"); //redirect to Home page
                        }
                    });
                }
            });
            authFunction(req, res, next); //does authentication
        });

        app.get("/register", function (req, res) {
            res.render("vash/register", { title: "Register for The Board", message: req.flash("registrationErr") });
        });

        app.post("/register", function (req, res) {
            
            var salt = hashUtil.createSalt();

            var user = {
                name : req.body.name,
                email : req.body.email,
                username: req.body.username,
                passwordHash: hashUtil.computeHash(req.body.password, salt),
                salt: salt
            };

            data.addUser(user, function (err) {
                if (err) {
                    req.flash("registrationErr", err);
                    res.redirect("/register");
                }
                else {
                    res.redirect("/login");
                }
            });

        });
    }

})(module.exports);