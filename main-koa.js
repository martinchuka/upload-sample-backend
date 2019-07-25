const koa = require('koa');
const parser = require('koa-parser');
const router = require('koa-router');
const uploader = require('./src/index');
const cors = require('@koa/cors');
const mount = require('koa-mount');
const stat = require('koa-static');

global.rootDir = __dirname;
const app = new koa();
app.use(cors({origin: '*'}))

const route = new router();

app.use(parser());
route.post('/CLOUDINARY', async (ctx) => {
    /**
     * setting up new upload
     */
    let upload = new uploader.FileUploader(ctx);
    upload.file = ctx.request.body.file;
    ctx.body = await upload.upload('CLOUDINARY');

}).post('/FILESYSTEM', async (ctx) => {
    /**
     * setting up new upload
     */
    let upload = new uploader.FileUploader(ctx);

    upload.file = ctx.request.body.file;
    ctx.body = await upload.upload('FILESYSTEM');

}).post('/S3', async (ctx) => {

    /**
     * setting up new upload for Amazon S3
     */
    let upload = new uploader.FileUploader(ctx);
    upload.file = ctx.request.body.file;
    ctx.body = await upload.upload('S3');
});


app.use(mount('/', stat('./public/images')));

const port = 5533;

app
    .use(route.routes())
    .use(route.allowedMethods())
    .listen(port, '127.0.0.1', () => {
        console.log('currently listening on port ' + port);
    })