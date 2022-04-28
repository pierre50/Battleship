var mysql = require('mysql');

var db = mysql.createConnection({
    host     : 'mysql3.gear.host',
    user     : 'battleship',
    password : 'Zh76yXVtB?-f',
    database : 'battleship'
});

module.exports = db;