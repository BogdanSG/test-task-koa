const fs = require('fs');
const router = require('koa-router')();
const db = require("../services/db");

router.get('/:id', async function (ctx) {

    const booksData = await db.query(`SELECT book_id, title, DATE_FORMAT(date, '%Y-%m-%dT%H:%i') AS date, author, description, image FROM books WHERE book_id = ?`, [ctx.params.id]);

    await ctx.render('book', {
        book: booksData[0][0]
    });

});

router.post('/update', async function (ctx) {

    const req = ctx.request.body;
    const image = ctx.request.files.image;

    if (req.book_id && req.title && req.date && req.author) {

        const imgName = image ? `${req.book_id}.${image.name.split('.').pop()}` : null;

        //if book_id not integer when NaN
        await db.query(
            `UPDATE books SET ? WHERE book_id = ${+req.book_id}`, {
                title: req.title,
                date: req.date,
                author: req.author,
                description: req.description ? req.description : null,
                image: imgName
            }
        );

        if (imgName) {

            const dir = __dirname + '/../public/img/books';

            let files = fs.readdirSync(dir);
            files = files.filter(f => f.split('.').slice(0, -1).join('.') === req.book_id);
            files.forEach(file => {
                fs.unlinkSync(`${dir}/${file}`);
            });

            const reader = fs.createReadStream(image.path);
            const stream = fs.createWriteStream(`${dir}/${imgName}`);
            reader.pipe(stream);

        } //if

        ctx.redirect(`/book/${req.book_id}`);

    } //if

});

module.exports = router;