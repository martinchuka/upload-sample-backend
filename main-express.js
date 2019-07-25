const express = require('express');
const uploader = require('./src/index');
const cors = require('cors');

const multiparty = require('multiparty');

const app = new express();
app.use(cors());
global.rootDir = __dirname;


const getFiles = (req) => {
    return new Promise((resolve, reject) => {
        new multiparty.Form().parse(req, async (error, fields, files) => {
            if (files && files.file && files.file.length) {
                resolve(files.file[0])
            }

            reject(error);

        })
    })

}
app.post('/CLOUDINARY', async (req, res) => {
    /**
     * setting up new upload
     */
    let upload = new uploader.FileUploader(res);
    upload.file = await getFiles(req);

    res.json(await upload.upload('CLOUDINARY'));
}).post('/FILESYSTEM', async (req, res) => {
    /**
     * setting up new upload
     */
    let upload = new uploader.FileUploader(res);


    upload.file = await getFiles(req);
    res.json(await upload.upload('FILESYSTEM'));

}).post('/S3', async (req, res) => {

    /**
     * setting up new upload for Amazon S3
     */
    let upload = new uploader.FileUploader(res);
    upload.file = await getFiles(req);

    res.json(await upload.upload('S3'));
});
const port = 5533;

app.listen(port, '127.0.0.1', () => {
    console.log('currently listening on port ' + port);
})