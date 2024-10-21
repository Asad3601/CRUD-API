const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;
const userSchema = new Schema({
    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

userSchema.pre("save", async function(next) {
    let user = this;
    if (!user.isModified("password")) {
        next();
    }
    try {
        const hash_password = await bcrypt.hash(user.password, 10);
        user.password = hash_password;
    } catch (error) {
        next(error);
    }
});

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;