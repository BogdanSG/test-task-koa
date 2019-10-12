const Koa = require('koa');
const app = new Koa();
const config = require('./config/app.json');

app.use(async ctx => {
    ctx.body = 'hello';
});

app.listen(config.http.port);