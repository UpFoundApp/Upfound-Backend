import cloudinary from "./config.js";

const uploadImagesToCloudinary = async (req, res) => {
  try {
    const uploadPromises = req.files.map((file) =>
      cloudinary.uploader
        .upload_stream({ folder: "Upfound" }, (error, result) => {
          if (error) throw error;
          return result.secure_url;
        })
        .end(file.buffer)
    );

    const urls = await Promise.all(uploadPromises);
    res.status(200).json({ urls });
  } catch (err) {
    res.status(500).json({ error: "Upload failed" });
  }
};

export { uploadImagesToCloudinary };
