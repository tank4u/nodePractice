(function (data) {
    
    var seedData = require("./seedData.js");
    var database = require("./database.js");
    
    data.getUser = function (username, next) {
        database.getDb(function (err, db) {
            if (err) {
                next(err);
            }
            else {
                db.users.findOne({username: username}, next);
            }
        });
    }
    
    data.addUser = function (user, next) {
        database.getDb(function (err, db) {
            if (err) {
                next(err);
            }
            else {
                db.users.insert(user, next);
            }
        });
    };

    data.getNoteCategories = function (next) {        
        //next(null, seedData.initialNotes);//call back to handle/bind the results
        database.getDb(function (err, db) {
            if (err) {
                next(err, null);
            }
            else {
                //find({notes : { $size:5}})
                db.notes.find().sort({ name : 1 }).toArray(function (err, results) {
                    if (err) {
                        next(err, null);
                    }
                    else {
                        next(null, results);
                    }
                });
            }
        });
    };
    
    data.addNote = function (categoryName, newNote, next) {
        database.getDb(function (err, db) {
            if (err) {
                next(err, null);
            }
            else {
                //add new note to existing category.notes collection with $push
                //update(document to be updated, action, callback - function(err) which matches with 'next')
                db.notes.update({ name: categoryName }
                    , { $push: { notes: newNote } }
                    , next);
            }
        });
    };
    
    data.getNotes = function (categoryName, next) {
        database.getDb(function (err, db) {
            if (err) {
                next(err, null);
            }
            else {
                db.notes.findOne({ name: categoryName }, next);
            //if callback signature is exactly same as passed callback then we can pass it directly
            //Here the notesController is passing "function (err, notes)" and that is same required by findOne so we can pass "next" to it
            }
        });
    };
    
    var logMessage = function (msg) {
        console.log(msg);   
    }
    
    data.createCategory = function (categoryName, next) {
        database.getDb(function (err, db) {
            if (err) {
                next(err);
            }
            else {
                
                db.notes.find({ name: categoryName }).count(function (err, count) {                    
                    if (err) {
                        next(err);
                    }
                    else {                        
                        if (count != 0) {
                            next("Category already exist.. Duplicate category!!");
                        }                        
                        else {
                            var category = {
                                name: categoryName,
                                notes : []
                            };
                            
                            db.notes.insert(category, function (err) {
                                if (err) {
                                    next(err);
                                }
                                else {
                                    next(null);
                                }
                            });
                        }
                    }
                });
            }
        });
    };
    
    var seedDatabase = function() {
        database.getDb(function (err, db) {
            if (err) {
                logMessage("Failed to get DB : " + err);
            }
            else {
                //check if notes exist
                db.notes.count(function (err, notesCount) {
                    if (err) {
                        logMessage("Failed to read notes: " + err);
                    }
                    else {
                        if (notesCount == 0) {
                            logMessage("Seeding the database...");
                            seedData.initialNotes.forEach(function (item) {
                                db.notes.insert(item, function (err) {
                                    if (err) {
                                        logMessage("Db insert failed : " + err);
                                    }
                                });
                            });
                        }
                        else {
                            logMessage("Database already seeded");
                        }
                    }
                });

            }
                });
    };

    seedDatabase();

})(module.exports);