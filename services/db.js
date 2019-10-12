const mysql = require("mysql2");
const config = require('../config/app.json');

const connection = mysql.createConnection({
    host: config.db.host,
    user: config.db.user,
    database: config.db.database,
    password: config.db.password,
    port: config.db.port
});

connection.connect();

module.exports = connection;