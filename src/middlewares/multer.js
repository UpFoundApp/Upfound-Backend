import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // optional: 5MB file size limit
});

const uploadFields = upload.fields([
  { name: "logo", maxCount: 1 },
  { name: "medias", maxCount: 5 },
]);

export { upload, uploadFields };
