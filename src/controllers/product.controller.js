import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import Comment from "../models/comment.model.js";
import Upvote from "../models/upvote.model.js";
import cloudinary from "../cloudinary/config.js";
import commentModel from "../models/comment.model.js";
import jwt from "jsonwebtoken";

// Get all products
export const getAllProducts = async (req, res) => {
  const { limit = 10, offset = 0, sort = "all", category = "all" } = req.query;

  if (isNaN(limit) || isNaN(offset)) {
    return res.status(400).json({ error: "Invalid limit or offset" });
  }

  let sortQuery = {};
  if (sort === "latest") {
    sortQuery = { createdAt: -1 };
  } else if (sort === "trending") {
    sortQuery = { upvotes: -1 };
  } else if (sort !== "all") {
    return res.status(400).json({ error: "Invalid sort option" });
  }

  let filterQuery = {};
  if (category !== "all") {
    filterQuery.category = { $regex: `^${category}$`, $options: "i" };
  }

  try {
    const [products, totalCount] = await Promise.all([
      Product.find(filterQuery)
        .populate("submittedBy", "name email")
        .sort(sortQuery)
        .skip(Number(offset))
        .limit(Number(limit)),
      Product.countDocuments(filterQuery),
    ]);

    res.status(200).json({ products, totalCount });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get single product by ID
export const getProductById = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    let user;
    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          token = null;
        }
        user = decoded;
      });
    }

    const product = await Product.findById(req.params.id)
      .populate("submittedBy", "name email userId")
      .populate("comments");

    if (!product) return res.status(404).json({ error: "Product not found" });

    const isUpvoted = await Upvote.exists({
      product: product._id,
      user: user?.id || null,
    });

    const { __v, ...productData } = product._doc;
    res
      .status(200)
      .json({ ...productData, isUpvoted: isUpvoted ? true : false });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Create a product
export const createProduct = async (req, res) => {
  try {
    // Validate input
    const { name, tagline, description, website, category } = req.body;

    if (!name || !tagline || !description || !website || !category) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!req.files || !req.files.logo || req.files.logo.length === 0) {
      return res.status(400).json({ error: "Logo image is required" });
    }

    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    //Uploading logo to Cloudinary
    const logoFile = req.files.logo[0];
    const logoUrl = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "Upfound" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        }
      );
      stream.end(logoFile.buffer);
    });

    // Handling media uploads
    let mediaUrls = [];
    if (req.files.medias && req.files.medias.length > 0) {
      const mediaUploadPromises = req.files.medias.map(
        (file) =>
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "Upfound" },
              (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
              }
            );
            stream.end(file.buffer);
          })
      );
      mediaUrls = await Promise.all(mediaUploadPromises);
    }

    const product = new Product({
      name,
      tagline,
      description,
      website,
      logo: logoUrl,
      medias: mediaUrls,
      category,
      submittedBy: userId,
    });

    await product.save();

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: "Product creation failed" });
  }
};

// Update a product
export const updateProduct = async (req, res) => {
  const updates = req.body;
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
};

// Delete a product
export const deleteProduct = async (req, res) => {
  try {
    const user = req.user.id;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    if (product.submittedBy.toString() !== user) {
      return res.status(403).json({ error: "Not authorized" });
    }
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
};

// Toggle upvote
export const toggleVote = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    const isVoted = await Upvote.exists({
      user: user._id,
      product: id,
    });
    if (isVoted) {
      // User has already voted, remove the vote
      await Upvote.deleteOne({ user: user._id, product: id });
      await Product.findByIdAndUpdate(
        id,
        { $inc: { upvotes: -1 } },
        { new: true }
      );
      await User.findByIdAndUpdate(
        user._id,
        { $inc: { upvotes: -1 } },
        { new: true }
      );
      return res.status(200).json({ message: "Vote removed successfully" });
    } else {
      // User has not voted, add the vote
      const newVote = new Upvote({
        user: user._id,
        product: id,
      });
      await newVote.save();
      await Product.findByIdAndUpdate(
        id,
        { $inc: { upvotes: 1 } },
        { new: true }
      );
      await User.findByIdAndUpdate(
        user._id,
        { $inc: { upvotes: 1 } },
        { new: true }
      );
      res.status(200).json({ message: "Vote recorded successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to record vote" });
  }
};

export const addComment = async (req, res) => {
  const { content, authorId } = req.body;
  if (!req.params.id || !content || !authorId) {
    return res
      .status(400)
      .json({ error: "Product ID, content, and author ID are required" });
  }
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const author = await User.findOne({ userId: authorId });
    if (!author) return res.status(404).json({ error: "Author not found" });

    const comment = new Comment({
      content,
      author: author._id,
      product: product._id,
    });

    await comment.save();

    const updateCommentCount = await Product.findByIdAndUpdate(
      product._id,
      { $inc: { comments: 1 } },
      { new: true }
    );

    if (!updateCommentCount) {
      return res.status(404).json({ error: "Failed to update comment count" });
    }
    res.status(201).json({
      message: "Comment added successfully",
      comment,
    });
  } catch (error) {
    res.status(500).json({ error: "Comment addition failed" });
  }
};

export const getProductComments = async (req, res) => {
  const { limit = 10, offset = 0 } = req.query;
  const { id: productId } = req.params;

  try {
    const comments = await commentModel
      .find({ product: productId })
      .populate({
        path: "author",
        select: "name",
      })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .sort({ createdAt: -1 });

    const commentsCount = await commentModel.countDocuments({
      product: productId,
    });

    res.status(200).json({ comments, total: commentsCount });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve comments" });
  }
};

export const removeComment = async (req, res) => {
  const { commentId } = req.params;
  try {
    const comment = await commentModel.findByIdAndDelete(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    // Also remove the comment reference from the product
    await Product.findByIdAndUpdate(comment.product, {
      $pull: { comments: comment._id },
    });

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Delete comment failed" });
  }
};
