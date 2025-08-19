import {catchAsyncErrors} from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../middleware/error.js';
import {User} from "../models/userSchema.js";
import {v2 as cloudinary} from 'cloudinary';
import { generateToken } from '../utils/jwtToken.js';
import { sendEmail } from '../utils/sendEmail.js';
import crypto from 'crypto';

export const register = catchAsyncErrors(async (req, res, next) => {
    if(!req.files || Object.keys(req.files).length === 0){
        return next(new ErrorHandler("Avatar and Resume are Required", 400));
    }
    const {avatar, resume} = req.files;

    if(!avatar || !resume){
        return next(new ErrorHandler("Avatar and Resume are Required", 400));
    }

    console.log("AVATAR",avatar, "RESUME", resume);

    const cloudinaryResponseAvatar = await cloudinary.uploader.upload(
        avatar.tempFilePath, 
        { folder: "AVATARS", }
    );
    if(!cloudinaryResponseAvatar || cloudinaryResponseAvatar.error){
        console.error(
            "Cloudinary Error:", 
            cloudinaryResponseAvatar.error || "Unknown Cloudinary Error"
        );
    }

    const cloudinaryResponseResume = await cloudinary.uploader.upload(
        resume.tempFilePath, 
        { folder: "RESUMES", }
    );
    if(!cloudinaryResponseResume || cloudinaryResponseResume.error){
        console.error(
            "Cloudinary Error:", 
            cloudinaryResponseResume.error || "Unknown Cloudinary Error"
        );
    }

    const {  
    fullName,
    email,
    phone,
    aboutMe,
    password,
    portFolio,
    github,
    linkedIn,
    instagram,
     } = req.body;

     let user = await User.create({
    fullName,
    email,
    phone,
    aboutMe,
    password,
    portFolio,
    github,
    linkedIn,
    instagram,
    avatar: {
        public_id: cloudinaryResponseAvatar.public_id,
        url: cloudinaryResponseAvatar.secure_url,
    },
    resume: {
        public_id: cloudinaryResponseResume.public_id,
        url: cloudinaryResponseResume.secure_url,
    },
     });
    generateToken(user, "user registered successfuly", 201, res);
});

export const login = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;
    if(!email || !password){
        return next(new ErrorHandler("Please enter email and password", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if(!user){
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    const isPasswordMatched = await user.comparePassword(password);
    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid email or password", 401));
    }
    generateToken(user, "User logged in successfully", 200, res);
})

export const logout = catchAsyncErrors(async (req, res, next) => {
    res.status(200).cookie("token", "", {
        expires: new Date(Date.now()),
        httpOnly: true,
        secure: true,
        sameSite: "None",
    }).json({
        success: true,
        message: "Logged Out",
    });
});

export const getuser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    if(!user){
        return next(new ErrorHandler("User not found", 404));
    }
    res.status(200).json({
        success: true,
        user
    });
})

export const updateProfile = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
    fullName: req.body.fullName,
    email: req.body.email,
    phone: req.body.phone,
    aboutMe: req.body.aboutMe,
    portFolio: req.body.portFolio,
    github: req.body.github,
    linkedIn: req.body.linkedIn,
    instagram: req.body.instagram,
    }
       if(req.files && req.files.avatar) {
        const avatar = req.files.avatar;
        const user = await User.findById(req.user._id);
        const profileImageId = user.avatar.public_id;
        await cloudinary.uploader.destroy(profileImageId);
        const cloudinaryResponse = await cloudinary.uploader.upload(
        avatar.tempFilePath, 
        { folder: "AVATARS", }
       );
       newUserData.avatar = {
         public_id: cloudinaryResponse.public_id,
         url: cloudinaryResponse.secure_url,
       }
    } 

         if(req.files && req.files.resume) {
        const resume = req.files.resume;
        const user = await User.findById(req.user._id);
        const resumeId = user.resume.public_id;
        await cloudinary.uploader.destroy(resumeId);
        const cloudinaryResponse = await cloudinary.uploader.upload(
        resume.tempFilePath, 
        { folder: "RESUMES", }
       );
       newUserData.resume = {
         public_id: cloudinaryResponse.public_id,
         url: cloudinaryResponse.secure_url,
       }
    } 

    const user = await User.findByIdAndUpdate(req.user._id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
    res.status(200).json({
        success: true,
        message: "Profile Updated Successfully",
        user,
    });
});


export const updatePassword = catchAsyncErrors(async (req, res, next) => {
    const {currentPassword, newPassword, confirmPassword} = req.body;
    if(!currentPassword || !newPassword || !confirmPassword){
        return next(new ErrorHandler("Please enter all fields", 400));
    }
    const user = await User.findById(req.user._id).select("+password");

    const isPasswordMatched = await user.comparePassword(currentPassword);
    if(!isPasswordMatched){
        return next(new ErrorHandler("Incorrect current password", 401));
    }
    if(newPassword !== confirmPassword){
        return next(new ErrorHandler("New password and confirm password do not match", 400));
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({
        success: true,
        message: "Password Updated Successfully",
    });
});

export const getUserPortfolio = catchAsyncErrors(async (req, res, next) => {
    const id = "688f23574ed2f67bbaf5b223";
    const user = await User.findById(id);
    res.status(200).json({
        success: true,
        user,
    }) 
})

export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if(!user){
        return next(new ErrorHandler("User not found", 404));
    }
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${process.env.DASHBOARD_URL}/password/reset/${resetToken}`;
    const message = `Your password reset token is as follows:\n\n${resetPasswordUrl}\n\nIf you have not requested this, please ignore this email.`;

    try {
     await sendEmail({
        email: user.email,
        subject: "Personal PortFolio Dashboard Recovery Password",
        message
    });
    res.status(200).json({
        success: true,
        message: `Email sent to ${user.email} successfully`
    })
    } catch (error) {
        user.resetPasswordExpire = undefined;
        user.resetPasswordToken = undefined;
        await user.save();
        return next(new ErrorHandler(error.message, 500));
    }
})

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
    const token = req.params.token;

    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })

    if(!user) {
        return next(new ErrorHandler("Reset Password Token is invalid or has expired", 400));
    }
    if(req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password and confirm password do not  match", 400));
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    generateToken(user, "Password reset successfully", 200, res);
})
