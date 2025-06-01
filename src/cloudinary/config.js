import { v2 as cloudinary } from "cloudinary";
import secrets from '../../secrets.js';

cloudinary.config({
  cloud_name: secrets.CLOUDINARY_CLOUD_NAME,
  api_key: secrets.CLOUDINARY_API_KEY,
  api_secret: secrets.CLOUDINARY_API_SECRET,
});

export default cloudinary;
