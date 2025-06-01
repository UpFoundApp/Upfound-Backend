import express from "express";
import * as product from "../controllers/product.controller.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { uploadFields } from "../middlewares/multer.js";
const router = express.Router();

router.get("/", product.getAllProducts);

router.get("/:id", product.getProductById);
router.post(
  "/",
  isAuthenticated,
  uploadFields,
  product.createProduct
);
router.put("/:id", isAuthenticated, product.updateProduct);
router.put("/:id/upvote", isAuthenticated, product.toggleVote);
router.delete("/:id", isAuthenticated, product.deleteProduct);
router.post("/:id/comment", isAuthenticated, product.addComment);
router.get("/:id/comments", product.getProductComments);

export default router;
