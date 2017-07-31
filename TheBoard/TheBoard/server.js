var http = require("http");
var express = require("express");
var ejsEngine = require("ejs-locals");
var bodyParser = require("body-parser");
var flash = require("connect-flash");
var cookieParser = require("cookie-parser");
var session = require("express-session");

var controllers = require("./controllers"); //calls index.js

var app = express();

//Opt into services
app.use(bodyParser.urlencoded({ extend: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
     secret: "TankSecretTheBoard"}));
app.use(flash());

//set the view engine
//app.set("view engine", "jade");

//app.engine("ejs", ejsEngine); //to use Master pages
//app.set("view engine", "ejs"); //ejs view engine

app.set("view engine", "vash");

//set the public static resource folder
app.use(express.static(__dirname + "/public"));

//Use authentication [NOTE: before any route gets registered]
var auth = require("./auth");
auth.init(app);

//Map the routes
controllers.init(app);

app.get("/api/users", function (req, res) {
    res.set("Content-Type", "application/json"); // set HTTP  headers
    res.send({user: "rakesh", isAdmin: true, role: "Admin"});
});

var server = http.createServer(app);

//var server = http.createServer(function (req, res) {
//    console.log(req.url);
//    res.write("<html><body><h1>" + req.url + "</h1></body></html>");
//    res.end();
//});

server.listen(3000);

//pass "server" to listen websocket connections
var updater = require("./updater");
updater.init(server);