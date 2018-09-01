"use strict"
const sqlite3 = require('sqlite3').verbose();



exports.db_select = function(query, callback){
    let db = new sqlite3.Database('database/se.db'); //this opens the db, should only call it then... may
      let arr = []
      db.all(query, [], (err, rows) => {
        if (err) {
          console.log(err);
        }
        callback(rows)
        db.close();
      });
}


// add callback to all db functions that will go to a socket.emit to update the ui when an event has been updated.
exports.db_insert = function(query, callback){
    
    let db = new sqlite3.Database('database/se.db');
    // let sql = `INSERT INTO langs(name) VALUES(?)`;
    // insert one row into the langs table
    db.run(query, [], function(err) {
    if (err) {
      return console.log(err.message);
    }
    callback(query, this.lastID) //this will go to a socket.emit
    // get the last insert id
    console.log(`A row has been inserted with rowid ${this.lastID}`); //add this.changes
  });
 
  // close the database connection
  db.close();

}

//add the socket.emit callback to here too
exports.db_update = function(query, callback){
    
    let db = new sqlite3.Database('database/se.db');
    //   let data = ['Ansi C', 'C'];
    //   let sql = `UPDATE langs
    //               SET name = ?
    //               WHERE name = ?`;
   
    db.run(query, [], function(err) {
        if (err) {
            return console.error(err.message);
        }
    callback("updated"+query)
    console.log(`Row(s) updated: ${this.changes}`);
    });
   
    // close the database connection
    db.close();
}
