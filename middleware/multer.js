var multer = require('multer');
    // set storage engine
var storage = multer.diskStorage({   // set storage engine (when file uploaded it create custom name to this file and save it in temp folder)
    filename: function(req, file, callback){
        callback(null, Date.now() + file.originalname);
    }
});

var imageFilter = function(req, file, cb){
    var filetypes = /jpg|jpeg|png|gif/i;
    //accept image files only
    if(!filetypes.test(file.originalname) && !filetypes.test(file.mimetype)){
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

var upload = multer({
    storage: storage,
    fileFilter: imageFilter,
    limits:{fileSize: 6000000}
});

module.exports = upload;
