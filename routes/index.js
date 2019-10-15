const mcache = require('memory-cache');
const router = require('koa-router')();
const db = require("../services/db");
const config = require("../config/app.json");

router.get('/', async (ctx, next) => { //кеширование страницы (доп функционал к 2.2 по тз)
    if (ctx.request.method === "GET") {
        const cachedBody = mcache.get(ctx.URL.href);
        if (cachedBody) {
            ctx.body = cachedBody;
        } //if
        else {
            await next();
            if (typeof ctx.response.body === "string")
                mcache.put(ctx.URL.href, ctx.response.body, config.app.cacheTimeSeconds * 1000);
        } //else 
    } //if
    else
        next();
});

router.get('/', async function (ctx) {

    //обычно я так не заморачиваюсь, просто в этот раз решил сделать логику пагинации как тут https://dribbble.com/shots/5088732-Vuesax-Pagination-Component

    const limit = ctx.query.limit || "10";
    const page = Math.ceil(+(ctx.query.page || "1"));
    const search = (ctx.query.search || "").trim();
    const offset = (page - 1) * limit;
    //all columns books for search
    const searchColumns = ['title', 'date', 'author', 'description'];

    let where = "";

    if (search) {

        where = "WHERE ";

        searchColumns.forEach((column, index) => {
            where += `${index === 0 ? "" : " OR "}LOWER(${column}) LIKE LOWER(?)`;
        });

    } //if

    const queryVariables = where ? searchColumns.map(() => `%${search}%`) : [];

    const booksData = await db.query(`SELECT book_id, title, date, author, description, image FROM books ${where} ORDER BY book_id DESC LIMIT ${limit} OFFSET ${offset}`, queryVariables);
    const countData = await db.query(`SELECT COUNT(book_id) AS count FROM books ${where}`, queryVariables);

    const count = countData[0][0].count;
    const countAllPages = Math.ceil(count / limit);
    let pagination = [];
    let paginationQuery = '';

    if (countAllPages > 1) {

        if (config.app.paginationInterval >= countAllPages) {

            for (let i = 1; i <= countAllPages; i++)
                pagination.push(i);

        } //if
        else if (page - config.app.paginationInterval < 0 || page + config.app.paginationInterval - 1 > countAllPages) {

            const pagesData = [countAllPages];

            for (let i = 1; i <= config.app.paginationInterval; i++)
                pagination.push(i);

            for (let i = 1; i < config.app.paginationInterval; i++)
                if (Math.max(...pagination) < countAllPages - i)
                    pagesData.push(countAllPages - i);

            pagination = [...pagination, false, ...pagesData.reverse()];

        } //if
        else {

            pagination.push(1, false);
            const half = Math.ceil(config.app.paginationInterval / 2);

            for (let i = half; i >= 0; i--)
                pagination.push(page - i);

            for (let i = 1; i <= half; i++)
                pagination.push(page + i);

            pagination.push(false, countAllPages);

        } //else

        for (let prop in ctx.query) {
            if (prop === 'page') continue;
            paginationQuery += (!paginationQuery ? '/?' : '&') + `${prop}=${ctx.query[prop]}`;
        } //for

        paginationQuery += paginationQuery ? '&page=' : '?page=';

    } //if

    await ctx.render('index', {
        page,
        limit,
        offset,
        search,
        pagination,
        paginationQuery,
        books: booksData[0],
        prevPage: page > 1 ? page - 1 : false,
        nextPage: countAllPages > page ? page + 1 : false
    });

})

module.exports = router;