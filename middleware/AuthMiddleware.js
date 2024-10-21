const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authenticateJWT = (req, res, next) => {
    const token = req.cookies.jwt; // Get JWT token from the cookie
    console.log('Token in cookie:', token); // Log the token to see if it's present

    if (!token) {
        return res.status(403).json({ success: false, message: "Not Logged In Any User At That Time" });
    }

    // Verify the token
    jwt.verify(token, process.env.secret_key, async(err, decodedToken) => {
        if (err) {
            console.log('JWT verification error:', err); // Log any verification errors
            return res.status(403).send("Unauthorized");
        }

        // Fetch user from the database using decoded token's userID
        try {
            const user = await User.findById(decodedToken.userID, 'first_name last_name email');
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            // Add user data to request object for later use
            req.user = user;
            next(); // Move to the next middleware or route
        } catch (error) {
            console.error("Error fetching user:", error); // Log any errors fetching user
            return res.status(500).send({ success: false, message: "Server error" });
        }
    });
};

module.exports = authenticateJWT;