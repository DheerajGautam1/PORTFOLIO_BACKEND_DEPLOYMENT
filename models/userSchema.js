import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, "Please enter your full name"],
        trim: true,
    },
    email:  {
        type: String,
        required: [true, "Please enter  your email.address"],
        unique: true,
        trim: true,
    },
    phone: {
        type: String,
        required: [true, "Please enter your phone number"],
    },
    aboutMe: {
        type: String,
        required: [true, "Please tell us about yourself"],
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        minlength: [6, "Password must be at least 6 characters"],
        select: false, // This will not return the password in queries
    },
    avatar: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
    },
    resume: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
    },
    portFolio: {
        type: String,
        required: [true, "Please enter your portfolio link"],
    },
    github: String,
    linkedIn: String,
    instagram: String,
    resetPasswordToken : String,
    resetPasswordExpire : Date,
})

// Middleware to hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
})

// Method to compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

// Method to generate reset password token
userSchema.methods.generateJsonWebToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES,
    });
};  

userSchema.methods.getResetPasswordToken = function () {
    // Generate a token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash the token and set it to resetPasswordToken field
    this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // Token valid for 30 minutes

    return resetToken; // Return the plain token to send to the user
}

export const User = mongoose.model("User", userSchema);