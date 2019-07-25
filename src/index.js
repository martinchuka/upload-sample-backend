const aws = require('aws-sdk');
const fs = require('fs');
const configuration = require('./config');
const cloudinary = require('cloudinary').v2;
const path = require('path');
cloudinary.config(configuration.cloudinary);

export class FileUploader {


    constructor(ctx) {
        // aws s3 acl default is public-read
        this._acl = null;

        // cloudinary configuration

        // initialize file 
        this._file = null;
        /**
         * setting S3 and configuration files
         */
        aws.config.update(configuration.aws.config);
        this._s3Instance = new aws.S3();

        this._ctx = ctx;
    }

    get s3Url() {
        return `https://s3.${configuration.aws.config.region}.${configuration.aws.bucket}`;
    }

    async _createBuffer() {
        return new Promise((resolve, reject) => {
            fs.readFile(this._file.path, (error, buffer) => {
                if (error) {
                    reject(error);
                }
                resolve(buffer);
            })
        })
    }

    _validFile(file) {
        if (!file || file.size < 100) {
            throw new Error('File invalid file or file too small');

        }

        /**
         * add your custom validation here for the files being uploaded
         */
    }

    _response(path, meta) {
        try {
            this._ctx.response.status = 201;
        } catch (e) {
            console.log(e);
            this._ctx.status(201);
        }
        return {
            path,
            meta
        }
    }

    async _uploadCloudinary() {
        //validate your file before starting uploading
        this._validFile(this._file);
        let response = await new Promise((resolve, reject) => {

            cloudinary.uploader.upload(this._file.path, (error, res) => {
                if (error) {
                    reject(error);

                }
                resolve(res);
            });

        });

        if (!response || !response.public_id) {
            throw new Error('Cloudinary upload failed');
        }

        return this._response(response.url, response);
    }

    async _uploadS3() {
        //validate your file before starting uploading
        this._validFile(this._file);

        const name = (new Date()).getTime().toString();

        const params = {
            Bucket: configuration.aws.bucket,
            Key: name,
            Body: await this._createBuffer(),
            ACL: this._acl || 'public-read',
            ContentType: this._file.type
        }

        const response = await this._s3Instance.putObject(params).promise();

        if (!response) {
            throw new Error('File transfer failed');

        }
        return this._response(
            `${this.s3Url}/${configuration.aws.bucket}/${params.Key}`,
            response
        )


    }


    async _uploadFileSystem() {
        //validate your file before starting uploading
        this._validFile(this._file);

        try {
            await new Promise((resolve, reject) => {
                fs.readdir(configuration.fileSystem.dir, (error, response) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(response)
                })
            })
        } catch (e) {
            await new Promise((resolve, reject) => {
                fs.mkdir(path.join(global.rootDir, configuration.fileSystem.dir), {recursive: true}, (error, response) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(response);
                });
            })
        }

        const name = (new Date()).getTime();
        let created = await new Promise((resolve, reject) => {
            fs.rename(
                this._file.path,
                path.join(global.rootDir, configuration.fileSystem.dir + '/' + name + (this._file.name || this._file.originalFilename)), (error, res) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(res);
                });
        })

        return this._response(
            `${configuration.fileSystem.url}/${configuration.fileSystem.dir}/${name}${this._file.name || this._file.originalFilename}`,
            created
        )

    }

    /**
     * @param {'CLOUDINDARY', 'S3', 'FILESYSTEM'} type
     */
    async upload(type) {
        if (type === 'CLOUDINARY') {
            return await this._uploadCloudinary();
        } else if (type === 'FILESYSTEM') {
            return await this._uploadFileSystem();
        } else if (type === 'S3') {
            return await this._uploadS3();

        }
        return 'Available upload type are CLOUDINARY | S3 | FILESYSTEM';
    }

    set file(file) {
        this._validFile(file);
        this._file = file;
    }

    set acl(acl) {
        this._acl = acl;
    }
}