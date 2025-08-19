import express from "express";
import { deleteTimeline, getAllTimeline, postTimeline } from "../controller/timelineController.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.post("/add", isAuthenticated, postTimeline);
router.delete("/delete/:id", isAuthenticated, deleteTimeline);
router.get("/getAll", getAllTimeline);

export default router;
