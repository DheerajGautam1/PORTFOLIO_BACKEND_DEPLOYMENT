import { catchAsyncErrors } from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../middleware/error.js";
import { Projects } from '../models/projectSchema.js'
import { v2 as cloudinary } from 'cloudinary';

export const addNewProject = catchAsyncErrors(async (req, res, next) => {
      if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Project Banner Image Required!", 404));
  }
  const { projectBanner } = req.files;
  const {
    title,
    description,
    gitRepoLink,
    projectLink,
    stack,
    technologies,
    deployed,
  } = req.body;
  if (
    !title ||
    !description ||
    !gitRepoLink ||
    !projectLink ||
    !stack ||
    !technologies ||
    !deployed
  ) {
    return next(new ErrorHandler("Please Provide All Details!", 400));
  }
  const cloudinaryResponse = await cloudinary.uploader.upload(
    projectBanner.tempFilePath,
    { folder: "PORTFOLIO PROJECT IMAGES" }
  );
  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error(
      "Cloudinary Error:",
      cloudinaryResponse.error || "Unknown Cloudinary error"
    );
    return next(new ErrorHandler("Failed to upload avatar to Cloudinary", 500));
  }
  const project = await Projects.create({
title,
description,
gitRepoLink,
projectLink,
technologies,
stack,
deployed,
 projectBanner: {
      public_id: cloudinaryResponse.public_id, // Set your cloudinary public_id here
      url: cloudinaryResponse.secure_url, // Set your cloudinary secure_url here
    },
  });
  res.status(201).json({
    success: true,
    message: "New Project Added!",
    project,
  });
})

export const updateProject = catchAsyncErrors(async (req, res, next) => {
    const newProjectData = {
        title: req.body.title,
        description: req.body.description,
        gitRepoLink: req.body.gitRepoLink,
        projectLink: req.body.projectLink,
        technologies: req.body.technologies,
        stack: req.body.stack,
        deployed: req.body.deployed,
    };
    console.log("REQ_BODY:",req.body)
    console.log("REQ_FILE:",req.files)

if (req.files && req.files.projectBanner) {
    const projectBanner = req.files.projectBanner;
    const project = await Projects.findById(req.params.id);
    const projectImageId = project.projectBanner.public_id;
    await cloudinary.uploader.destroy(projectImageId);
    const newProjectImage = await cloudinary.uploader.upload(
      projectBanner.tempFilePath,
      {
        folder: "PORTFOLIO PROJECT IMAGES",
      }
    );
    newProjectData.projectBanner = {
      public_id: newProjectImage.public_id,
      url: newProjectImage.secure_url,
    };
  } 

  const project = await Projects.findByIdAndUpdate(req.params.id, newProjectData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  })
  res.status(200).json({
    success: true,
    message: "Project Updated",
    project,
  })
})

export const deleteProject = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const project = await Projects.findById(id);
  if(!project) {
    return next(new ErrorHandler("Project Not Found", 404));
  }
  await project.deleteOne();
  res.status(200).json({
    success: true,
    message: "Project Deleted",
  })
})
export const getAllProject = catchAsyncErrors(async (req, res, next) => {
  const project = await Projects.find();
  res.status(200).json({
    success: true,
    project,
  })
})
export const getSingleProject = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const project = await Projects.findById(id);
  if(!project) {
    return next(new ErrorHandler("Project Not Found", 404));
  }
  res.status(200).json({
    success: true,
    project,
  })
});