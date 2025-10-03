import multer from "multer";

// ✅ Store file in memory instead of disk
export const upload = multer({ storage: multer.memoryStorage() });
