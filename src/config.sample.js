
const config = {
    cloudinary: {
        cloud_name:'',
        api_key: '',
        api_secret: ''
    },
    aws: {
        config: {
            secretAccessKey: '',
            accessKeyId: '',
            region: ''
        },
        bucket: '',
        url: 'amazonaws.com'

    },
    fileSystem: {
        dir: 'public/images',
        url: 'https://127.0.0.1:5533'
    }
}


module.exports = config;