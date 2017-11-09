const fs = require('fs-extra');
const Koa = require('koa');
const router = require('koa-router')();
const serve = require('koa-static');
const app = new Koa();
const md5 = require('md5');
const koaBody = require('koa-body');

// 进入html页面
router.get('/index', async (ctx, next) => {
    ctx.response.type = 'html';
    ctx.response.body = fs.createReadStream('./pages/index.html');
});

// 检测是否有已上传到块
router.get('/checkMd5', async (ctx, next) => {
    const md5 = ctx.query.md5;
    const folderPath = `./temp/${md5}`;
    await fs.ensureDir(folderPath);
    const files = await fs.readdir(folderPath);
    ctx.response.body = {
        code: 200,
        hash: md5,
        chunkList: files.filter(item => item !== '.DS_Store').map(item => parseInt(item))
    }
});

// 传块
router.post('/sendChunk', async (ctx, next) => {
    await fs.writeFile(`./temp/${ctx.request.body.hash}/${ctx.request.body.num}`, ctx.request.body.chunk, {
        encoding: 'binary'
    })
    ctx.response.body = { code: 200 }
});

// 合并块
router.get('/mergeFile', async (ctx, next) => {
    const md5 = ctx.query.md5;
    const fileName = ctx.query.filename;
    const filePath = `./temp/${md5}`
    let files = await fs.readdir(filePath);
    files = files.filter(item => item !== '.DS_Store').sort((a, b) => { return a - b; });

    const data = await Promise.all(files.map(item => {
        return fs.readFile(`${filePath}/${item}`, { encoding: 'binary' });
    }));

    await fs.ensureDir(`./upload`);
    await fs.writeFile(`./upload/${fileName}`, data.join(''), { encoding: 'binary' });

    ctx.response.body = {
        code: 200
    }
});

// 静态资源
const main = serve('./lib');

// 统一捕获错误
app.use( async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        ctx.response.body = {
            code: 0,
            msg: JSON.stringify(err)
        }
    }
});
app.use(main);
app.use(koaBody({
    "formLimit": "5mb",
    "jsonLimit": "5mb",
    "textLimit": "5mb"
}));
app.use(router.routes());

// 监听7777端口
app.listen(7777);
console.log('app started at port 7777 ...');