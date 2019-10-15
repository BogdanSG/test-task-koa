const Koa = require("koa");
const static = require("koa-static");
const views = require("koa-views");
const router = require('koa-router')();
const koaBody = require('koa-body');
const app = new Koa();
const config = require("./config/app.json");
const index = require("./routes/index");
const book = require("./routes/book");

//middlewares
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