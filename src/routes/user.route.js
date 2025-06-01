import express from "express";
import * as user from "../controllers/user.controller.js";

const router = express.Router();

router.post("/register", user.registerUser);
router.post("/login", user.loginUser);
router.get("/submissions", user.getSubmissionsByUser);
router.get("/votes", user.getVotedProductsByUser);
router.get("/:id", user.getUserById);

export default router;
