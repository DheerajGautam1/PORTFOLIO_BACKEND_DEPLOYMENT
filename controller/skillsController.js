import { catchAsyncErrors } from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../middleware/error.js";
import { Skills } from '../models/skillsSchema.js'
import { v2 as cloudinary } from 'cloudinary';

export const addNewSkills = catchAsyncErrors(async (req, res, next) => {
      if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Image For Skill Required!", 404));
  }
  const { svg } = req.files;
  const { title, proficiency } = req.body;
  if (!title || !proficiency) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }
  const cloudinaryResponse = await cloudinary.uploader.upload(
    svg.tempFilePath,
    { folder: "PORTFOLIO SKILL IMAGES" }
  );
  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error(
      "Cloudinary Error:",
      cloudinaryResponse.error || "Unknown Cloudinary error"
    );
    return next(new ErrorHandler("Failed to upload avatar to Cloudinary", 500));
  }
  const skill = await Skills.create({
    title,
    proficiency,
    svg: {
      public_id: cloudinaryResponse.public_id, // Set your cloudinary public_id here
      url: cloudinaryResponse.secure_url, // Set your cloudinary secure_url here
    },
  });
  res.status(201).json({
    success: true,
    message: "New Skill Added",
    skill,
  });    
})


export const deleteSkills = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const skills = await Skills.findById(id);
    if(!skills) {
        return next(new ErrorHandler("Skills is Not Found", 404));
    }

    const skillsSvgId = skills.svg. public_id;
    await cloudinary.uploader.destroy(skillsSvgId);
    await skills.deleteOne();
    res.status(200).json({
        success: true,
        message: "Skill Deleted Successfully",
    })
})
export const updateSkills = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    let skills = await Skills.findById(id);
    if(!skills) {
        return next(new ErrorHandler("Skills is Not Found", 404));
    }
    const {proficiency} = req.body;
    skills = await Skills.findByIdAndUpdate(id, {proficiency}, {
        new: true,
        runValidators: true,
        useFindAndModify: true,
    })
    res.status(200).json({
        success: true,
        message: "Skill Updated",
        skills,
    })
})
export const getAllSkills = catchAsyncErrors(async (req, res, next) => {
    const skills = await Skills.find();
    res.status(200).json({
        success: true,
        skills,
    })    
})

