import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomID } from "../helper/utils.js";
import upvoteModel from "../models/upvote.model.js";
import productModel from "../models/product.model.js";

// Get a single user by ID
export const getUserById = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ error: "User ID is required" });
    }
    const user = await userModel
      .findOne({ userId: req.params.id })
      .select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    const totalSubmissions = await productModel.countDocuments({
      submittedBy: user._id,
    });
    const totalVotes = await upvoteModel.countDocuments({ user: user._id });
    const { __v, ...userDoc } = user._doc;
    res.status(200).json({ ...userDoc, totalSubmissions, totalVotes });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Register a new user
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new userModel({
      name,
      email,
      userId: randomID(10),
      password: hashedPassword,
    });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    await newUser.save();
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: { ...newUser._doc, password: undefined },
    });
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
};

// Login user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res
      .status(200)
      .json({ token, user: { ...user._doc, password: undefined } });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};

export const getSubmissionsByUser = async (req, res) => {
  const { userId, page = 1, limit = 10 } = req.query;
  try {
    const _userId = await userModel.findOne({ userId });
    if (!_userId) {
      return res.status(404).json({ error: "User not found" });
    }

    const submissions = await productModel
      .find({ submittedBy: _userId._id })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-password");
    const totalSubmissions = await productModel.countDocuments({
      submittedBy: _userId._id,
    });

    res
      .status(200)
      .json({ submissions: submissions || [], total: totalSubmissions });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
};

export const getVotedProductsByUser = async (req, res) => {
  const { userId, page = 1, limit = 10 } = req.query;
  try {
    const _userId = await userModel.findOne({ userId });
    if (!_userId) {
      return res.status(404).json({ error: "User not found" });
    }

    const totalVotes = await upvoteModel.countDocuments({ user: _userId._id });
    const votedProducts = await upvoteModel
      .find({ user: _userId._id })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("product", "-password");

    const user = await userModel.findOne({ userId }).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ votedProducts, total: totalVotes });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch voted products" });
  }
};