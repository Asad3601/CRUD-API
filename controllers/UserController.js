const multer = require('multer');

const jwt = require('jsonwebtoken');
const User = require('../models/User')

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'media');
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });
exports.upload = upload;


exports.CreateUser = async(req, res) => {
    let { first_name, last_name, password, email } = req.body;
    try {
        let user = new User({
            first_name,
            last_name,
            email,
            password,
            image: req.file.filename
        })
        await user.save();
        res.status(200).send({ success: true, message: `${user.first_name} Add Successfully` });
    } catch (error) {
        res.status(500).send(error.message)
    }
}

exports.GetUsers = async(req, res) => {
    try {
        let users = await User.find({});
        if (users.length > 0) {
            res.status(200).json(users);
        }
    } catch (error) {
        res.status(500).send(error.message)
    }
}

exports.GetUserByID = async(req, res) => {
    try {
        let user_Id = req.params.id;

        let user = await User.findOne({ _id: user_Id });
        res.status(200).json(user);

    } catch (error) {
        res.status(500).send(error.message)
    }
}