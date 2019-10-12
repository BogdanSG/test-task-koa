const mysql = require("mysql2");
const generateBook = require("./generate-book");
const config = require('../config/app.json');

//Тут нет database по сравнению с ../services/db.js
const db = mysql.createConnection({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    port: config.db.port
}).promise();

(async () => {

    await db.connect();

    await db.query(`
    CREATE DATABASE IF NOT EXISTS ${config.db.database}
    CHARACTER SET utf8
    COLLATE utf8_general_ci`);

    await db.query(`DROP TABLE IF EXISTS ${config.db.database}.books`);

    await db.query(`CREATE TABLE ${config.db.database}.books (
            book_id BIGINT NOT NULL AUTO_INCREMENT,
            title VARCHAR(500) NOT NULL,
            date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            author VARCHAR(255) NOT NULL,
            description VARCHAR(5000),
            image TEXT,
            PRIMARY KEY (book_id))`);

    let count = 0;
    let chunk = 0;
    let values = '';

    for (i = 0; i < config.generator.count; i++) {
        const book = generateBook();
        values += ` ('${book.title}', '${book.date}', '${book.author}', '${book.description}')${chunk + 1 >= config.generator.chunk ? ';' : ','}`;
        chunk++;

        //insert данных кусками - не особо забивает временную память + хорошая производительность
        if (chunk >= config.generator.chunk) {

            db.query(`INSERT INTO ${config.db.database}.books (title, date, author, description)
            VALUES 
            ${values}`).then(() => {
                count++;
                console.log(count * config.generator.chunk);
            });
            values = '';
            chunk = 0;

        } //if

    } //for        

    await db.end();

    console.log("DB generate success");

})();