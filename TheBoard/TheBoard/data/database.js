(function (database) {

    var mongodb = require("mongodb");
    var mongoUrl = "mongodb://localhost:27017/theBoard";
    var theDb = null;

    database.getDb = function (next) {
        if (!theDb) {
            //connect to the db, supports connection pooling so only connect once
            mongodb.MongoClient.connect(mongoUrl, function (err, db) {
                if (err) {
                    next(err, null);
                }
                else {
                    // return type instead of just DB so we can extend it later to store collections OR 
                    // metadata like UserId, whoCreated, when, etc.
                    theDb = {
                        db: db,
                        notes: db.collection("notes"),
                        users: db.collection("users")
                    };
                    next(null, theDb);
                }
            });
        }
        else {
            next(null, theDb);
        }
    };

})(module.exports);