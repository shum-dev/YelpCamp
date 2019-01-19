var cloudinary = require('cloudinary');

cloudinary.config({
    cloud_name: 'egorshum',
    api_key: '244394558913856',
    api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary;