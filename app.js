const Koa = require("koa");
const static = require("koa-static");
const views = require("koa-views");
const router = require('koa-router')();
const koaBody = require('koa-body');
const mcache = require('memory-cache');
const app = new Koa();
const config = require("./config/app.json");
const index = require("./routes/index");
const book = require("./routes/book");

//middlewares
app.use(async (ctx, next) => { //кеширование страницы (доп функционал к 2.2 по тз)
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
app.use(static(__dirname + "/public", {
    defer: false
}));
app.use(
    views(__dirname + "/views", {
        extension: "pug"
    })
);
app.use(koaBody({
    multipart: true
}));

//route
router.use('/', index.routes(), index.allowedMethods());
router.use('/book', book.routes(), book.allowedMethods());

app.use(router.routes(), router.allowedMethods());

app.listen(config.http.port);