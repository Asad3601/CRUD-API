require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const UserRoute = require('./routes/userRoutes')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const path = require('path');
const app = express();
const secret_key = "user_auth"
app.use(express.static(path.join(__dirname, 'media')));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true })); // For form data (application/x-www-form-urlencoded)
app.use(bodyParser.json()); // For JSON payloads
// mongodb connection
mongoose.connect(process.env.DB_URI)
    .then(() => {
        console.log("Connected with MongoDB");
    })
    .catch(() => {
        console.log("Failed to connect with MongoDB");
    });
// multer settings
app.use('/users', UserRoute);
// create user
app.get('/', (req, res) => {
    res.send("My Api");
});

// get all users

// get specific User

// delete specific user
app.delete('/delete-user/:id', async(req, res) => {
    try {
        let user_id = req.params.id;

        // Check if user exists before deleting
        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).send("User not found");
        }

        await User.findByIdAndDelete(user_id);
        res.status(200).send("Delete User Successfully");

    } catch (error) {
        res.status(500).send(error.message);
    }
});
// edit-update specific user
// app.post('/edit-user/:id', upload.single('image'), async(req, res) => {
//     try {
//         let { first_name, last_name } = req.body; // Get fields from request body
//         let user_id = req.params.id; // Get user ID from URL params
//         let image = req.file.filename

//         // Find and update the user's details, return the updated user
//         let updatedUser = await User.findByIdAndUpdate(
//             user_id, { $set: { first_name, last_name, image } }, // Update fields
//             { new: true } // Ensure the updated document is returned and validated
//         );



//         if (updatedUser) {
//             res.status(200).send({ success: true, message: "User updated successfully", user: updatedUser });
//         } else {
//             res.status(404).send({ success: false, message: "User Not Found" });
//         }

//     } catch (error) {
//         console.error("Error:", error); // Log any error
//         res.status(500).send({ success: false, message: error.message });
//     }
// });

// login 
app.post('/login', async(req, res) => {
    let { email, password } = req.body;
    try {
        // Check if the user exists in the database
        let user = await User.findOne({ email });
        console.log(user);
        if (!user) {
            return res.status(404).send("User not found");
        }

        // Compare the input password with the hashed password stored in the database
        let isPasswordMatch = await bcrypt.compare(password, user.password);
        if (isPasswordMatch) {
            // If passwords match, send a success response
            const token = jwt.sign({ userID: user._id }, secret_key, { expiresIn: '3h' })
            res.cookie('jwt', token, { httpOnly: true })
                // res.redirect('/');

            return res.status(200).send({ success: true, message: "User Login Successfully" });
        } else {
            // If passwords don't match, send a failure response
            return res.status(401).send({ success: false, message: "Invalid password" });
        }
    } catch (error) {
        console.error("Error:", error); // Log any error
        res.status(500).send({ success: false, message: error.message });
    }
});


// autenticate jwt 
const authenticateJWT = (req, res, next) => {
    const token = req.cookies.jwt; // Get JWT token from the cookie
    if (!token) {
        return res.status(403).send("User Not Login");
    }

    // Verify the token
    jwt.verify(token, secret_key, async(err, decodedToken) => {
        if (err) {
            return res.status(403).send("Unauthorized");
        }

        // Fetch user from the database using decoded token's userID
        try {
            const user = await User.findById(decodedToken.userID, 'first_name last_name email');
            if (!user) {
                return res.status(404).send("User not found");
            }

            // Add user data to request object for later use
            req.user = user;
            next(); // Move to the next middleware or route
        } catch (error) {
            console.error("Error fetching user:", error);
            return res.status(500).send({ success: false, message: "Server error" });
        }
    });
};

/// login success
app.get('/', authenticateJWT, (req, res) => {
    // `req.user` now contains the user data retrieved from the database
    res.status(200).send({ success: true, user: req.user });
});

app.get('/logout', (req, res) => {
    res.clearCookie('jwt'); // Clear the JWT cookie
    res.status(200).send({ success: true, message: "User Logout" })
})

// server running
app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});