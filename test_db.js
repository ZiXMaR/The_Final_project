var mysql = require('mysql');

var connection = mysql.createConnection({

    host: 'localhost',

    user: 'root',

    password: '',

    database: 'demo_project'

});

connection.connect();

connection.query('SELECT * FROM activity', function (error, results, fields) {
    if (error) throw error;

    console.log(results);

});

connection.end();