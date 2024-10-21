// const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User')

// const storage = multer.diskStorage({
//     destination: function(req, file, cb) {
//         cb(null, 'media');
//     },
//     filename: function(req, file, cb) {
//         cb(null, file.originalname);
//     }
// });
// const upload = multer({ storage: storage });
// exports.upload = upload;


exports.CreateUser = async(req, res) => {
    try {
        const { first_name, last_name, email, password } = req.query;
        console.log(req.query);
        // Validate required fields
        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const newUser = new User({
            first_name,
            last_name,
            email,
            password // Don't forget to hash the password in real use
        });

        // Save the user with async/await
        const savedUser = await newUser.save();

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: savedUser
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating user",
            error: error.message
        });
    }
};



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
        if (user) {
            res.status(200).json({ success: true, user });
        } else {
            res.status(200).json({ success: false, message: "User Not Found" });
        }

    } catch (error) {
        res.status(500).send(error.message)
    }
}

exports.LoginUser = async(req, res) => {
    let { email, password } = req.query;
    try {
        let user = await User.findOne({ email });
        // console.log(user);
        if (!user) {
            return res.status(404).send("User not found");
        }

        // Compare the input password with the hashed password stored in the database
        let isPasswordMatch = await bcrypt.compare(password, user.password);
        if (isPasswordMatch) {
            // If passwords match, send a success response
            const token = jwt.sign({ userID: user._id }, process.env.secret_key, { expiresIn: '7d' })
            res.cookie('jwt', token, { httpOnly: true, secure: true })
                // res.redirect('/');

            return res.status(200).json({ success: true, message: "User Login Successfully" });
        } else {
            // If passwords don't match, send a failure response
            return res.status(401).json({ success: false, message: "Invalid password" });
        }

    } catch (error) {
        console.error("Error:", error); // Log any error
        res.status(500).send({ success: false, message: error.message });
    }
}

exports.UserProfile = async(req, res) => {
    try {
        const user = req.user;
        if (user) {
            res.status(200).json({ success: true, user: user });
        } else {
            res.status(200).json({ success: false, message: "User Not Found..!" });

        }
    } catch (error) {
        res.status(200).send({ success: false, message: "Internal Server Error" });

    }
}

exports.LogoutUser = (req, res) => {
    try {
        const user = req.user;
        // console.log(user);
        if (user) {
            res.clearCookie('jwt'); // Clear the JWT cookie
            res.status(200).send({ success: true, message: "User Logout Successfully..!" })
        } else {
            res.status(200).send({ success: false, message: "Not Any User LoggedIn...!" })
        }
    } catch (error) {
        res.status(200).send({ success: false, message: "Internal Server Error" });
    }
}

exports.DeleteUser = async(req, res) => {
    let user_id = req.params.id;
    try {
        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        await User.findByIdAndDelete(user_id);
        res.status(200).json({ success: true, message: "Delete User Successfully" });

    } catch (error) {
        res.status(500).send(error.message);
    }
}

exports.UpdateUser = async(req, res) => {
    let { first_name, last_name } = req.query; // Get fields from request body
    try {
        let user_id = req.params.id; // Get user ID from URL params

        // Find and update the user's details, return the updated user
        let updatedUser = await User.findByIdAndUpdate(
            user_id, { $set: { first_name, last_name } }, // Update fields
            { new: true } // Ensure the updated document is returned and validated
        );

        if (updatedUser) {
            res.status(200).send({ success: true, message: "User Updated successfully", user: updatedUser });
        } else {
            res.status(404).send({ success: false, message: "User Not Found" });
        }

    } catch (error) {
        console.error("Error:", error); // Log any error
        res.status(500).send({ success: false, message: error.message });
    }

}