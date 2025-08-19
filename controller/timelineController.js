import { catchAsyncErrors } from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../middleware/error.js";
import { Timeline} from "../models/timelineSchema.js";

export const postTimeline = catchAsyncErrors(async (req, res, next) => {
 const { title, description, from, to } = req.body;
 if( !title || !description ){
   return next(new ErrorHandler("title required and Description required", 400));
 }
  const newTimeline = await Timeline.create({
    title, 
    description,
    timeline: { from, to },
  });
  res.status(200).json({
    success: true,
    message: "Timeline Added!",
    newTimeline,
  });
})
export const deleteTimeline = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const timeline = await Timeline.findById(id);
  if(!timeline) {
    return next(new ErrorHandler("TImeline not found", 404));
  }

  await timeline.deleteOne();

  res.status(200).json({
    success: true,
    message: "timeline deleted!",
  })
})
export const getAllTimeline = catchAsyncErrors(async (req, res, next) => {
  const timeline = await Timeline.find();
  res.status(200).json({
    success: true,
    timeline,
  })
})