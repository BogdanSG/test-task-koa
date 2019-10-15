const fs = require('fs');
const router = require('koa-router')();
const db = require("../services/db");

router.get('/create', async function (ctx) {

    await ctx.render('book');

});

router.get('/:id', async function (ctx) {

    const booksData = await db.query(`SELECT book_id, title, DATE_FORMAT(date, '%Y-%m-%dT%H:%i') AS date, author, description, image FROM books WHERE book_id = ?`, [ctx.params.id]);

    await ctx.render('book', {
        book: booksData[0][0]
    });

});

router.post('/set', async function (ctx) {

    const req = ctx.request.body;
    const image = ctx.request.files.image && ctx.request.files.image.size > 0 ? ctx.request.files.image : null;

    try {

        if (req.title && req.date && req.author) {

            const imgExtension = image ? `${image.name.split('.').pop()}` : null
            let imgName = imgExtension ? `${req.book_id}.${imgExtension}` : null;

            //if book_id not integer when NaN
            const query = req.book_id ? `UPDATE books SET ? WHERE book_id = ${+req.book_id}` : "INSERT INTO books SET ?";

            const result = await db.query(
                query, {
                    title: req.title,
                    date: req.date,
                    author: req.author,
                    description: req.description ? req.description : null,
                    image: imgName
                }
            );

            const id = result[0].insertId;

            if (image && !req.book_id) {

                imgName = `${id}.${imgExtension}`;

                await db.query(
                    `UPDATE books SET image = ? WHERE book_id = ${id}`, [imgName]
                );

            } //if

            if (imgName) {

                const dir = __dirname + '/../public/img/books';

                if (req.book_id) {
                    let files = fs.readdirSync(dir);
                    files = files.filter(f => f.split('.').slice(0, -1).join('.') === req.book_id);
                    files.forEach(file => {
                        fs.unlinkSync(`${dir}/${file}`);
                    });
                } //if

                const reader = fs.createReadStream(image.path);
                const stream = fs.createWriteStream(`${dir}/${imgName}`);
                reader.pipe(stream);

            } //if

            ctx.redirect(`/book/${req.book_id ? req.book_id : id}`);

        } //if


    } //try
    catch (e) {

        ctx.body = e.message;

    } //catch

});

module.exports = router;