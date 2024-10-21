require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const UserRoute = require('./routes/userRoutes')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const AuthMiddleware = require('./middleware/AuthMiddleware');
const path = require('path');
const app = express();
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






// server running
app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});