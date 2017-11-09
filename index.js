const fs = require('fs-extra');
const Koa = require('koa');
const router = require('koa-router')();
const serve = require('koa-static');
const app = new Koa();
const md5 = require('md5');
const koaBody = require('koa-body');


// fs.readFile('./pages/WX20171108-104301.png', 'binary', function(err, file){
//     console.log(md5(file));
// });

router.get('/index', async (ctx, next) => {
    ctx.response.type = 'html';
    ctx.response.body = fs.createReadStream('./pages/index.html');
});

router.get('/checkMd5', async (ctx, next) => {
    const md5 = ctx.query.md5;
    const folderPath = `./temp/${md5}`;
    await fs.ensureDir(folderPath);
    const files = await fs.readdir(folderPath);
    ctx.response.body = {
        chunkList: files
    }
});

router.post('/sendChunk', async (ctx, next) => {
    console.log(ctx.request.body);
    ctx.response.body = {}
});

const main = serve('./lib');
app.use(main);
app.use(koaBody());
app.use(router.routes());

app.listen(6789);
console.log('app started at port 6789 ...');