import express from "express";
import { addNewSkills, deleteSkills, updateSkills, getAllSkills } from "../controller/skillsController.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.post("/add", isAuthenticated, addNewSkills);
router.delete("/delete/:id", isAuthenticated, deleteSkills);
router.put("/update/:id", isAuthenticated, updateSkills);
router.get("/getAll", getAllSkills);

export default router;
