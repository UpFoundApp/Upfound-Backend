import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tagline: { type: String, required: true },
  description: String,
  website: String,
  logo: String,
  category: {
    type: String,
    default: "Global",
  },
  medias: {
    type: [String],
    validate: {
      validator: function (val) {
        return val.length >= 1 && val.length <= 5;
      },
      message: "You must provide between 1 and 5 media URLs.",
    },
    required: true,
    default: undefined,
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  upvotes: {
    type: Number,
    default: 0,
    min: 0,
  },
  comments: {
    type: Number,
    default: 0,
    min: 0,
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Product", productSchema);
