const router = require('koa-router')();
const db = require("../services/db");
const config = require("../config/app.json");

router.get('/', async function (ctx) {

    //обычно я так не заморачиваюсь, просто в этот раз решил сделать логику пагинации как тут https://dribbble.com/shots/5088732-Vuesax-Pagination-Component

    const limit = ctx.query.limit || "10";
    const page = +(ctx.query.page || "1");
    const search = ctx.query.search || "";
    const offset = page * limit;

    const booksData = await db.query(`SELECT book_id, title, date, author, description, image FROM books LIMIT ${limit} OFFSET ${offset}`);
    const countData = await db.query("SELECT COUNT(book_id) AS count FROM books");

    const count = countData[0][0].count;
    const countAllPages = (count - limit) / limit;
    let pagination = [];

    if (page - config.app.paginationInterval < 0 || page + config.app.paginationInterval - 1 > countAllPages) {

        const pagesData = [countAllPages];

        for (let i = 1; i <= config.app.paginationInterval; i++) {
            pagination.push(i);
            if (i < config.app.paginationInterval && countAllPages - i > i)
                pagesData.push(countAllPages - i);
        } //for

        pagination = [...pagination, false, ...pagesData.reverse()];

    } //if
    else {

        pagination.push(1, false);
        const half = config.app.paginationInterval / 2;

        for (let i = half; i >= 0; i--)
            pagination.push(page - i);

        for (let i = 1; i <= half; i++)
            pagination.push(page + i);

        pagination.push(false, countAllPages);

    } //else

    let paginationQuery = '';

    for (let prop in ctx.query) {
        if (prop === 'page') continue;
        paginationQuery += (!paginationQuery ? '/?' : '&') + `${prop}=${ctx.query[prop]}`;
    } //for

    paginationQuery += paginationQuery ? '&page=' : '?page=';

    await ctx.render('index', {
        page,
        limit,
        search,
        pagination,
        paginationQuery,
        books: booksData[0],
        prevPage: page > 1 ? page - 1 : false,
        nextPage: countAllPages > page ? page + 1 : false
    });

})

module.exports = router;