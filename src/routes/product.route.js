import express from "express";
import * as product from "../controllers/product.controller.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { uploadFields } from "../middlewares/multer.js";
const router = express.Router();

// Get all products
router.get("/", product.getAllProducts);

// Get single product by ID
router.get("/:id", product.getProductById);
// Create a product
router.post(
  "/",
  isAuthenticated,
  uploadFields,
  product.createProduct
);
// Update a product
router.put("/:id", isAuthenticated, product.updateProduct);
// Toggle vote for a product
router.put("/:id/upvote", isAuthenticated, product.toggleVote);
// Delete a product
router.delete("/:id", isAuthenticated, product.deleteProduct);
// Add a comment to a product
router.post("/:id/comment", isAuthenticated, product.addComment);
// // Remove upvote from a product
// router.delete("/:id/upvote", isAuthenticated, product.removeUpvote);
// Get all comments for a product
router.get("/:id/comments", product.getProductComments);
// // Get all upvotes for a product
// router.get("/:id/upvotes", product.getProductUpvotes);
// // Get products by search query
// router.get("/search", product.searchProducts);

export default router;
