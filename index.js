import express from "express";
import secrets from "./secrets.js";
import { connectDB } from "./src/connection/db.js";
import userRoutes from "./src/routes/user.route.js";
import productRoutes from "./src/routes/product.route.js";
import cors from "cors";

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://upfound-backend.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);

app.listen(secrets.PORT, () => {
  console.log(`Server is running on http://localhost:${secrets.PORT}`);
});
