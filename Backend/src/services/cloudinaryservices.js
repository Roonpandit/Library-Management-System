const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// Upload image to Cloudinary
const uploadImage = async (filePath) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: "book-covers",
            quality: "auto:best",
            fetch_format: "auto",
            crop: "limit",
            flags: "preserve_transparency",
        });

        // Delete temporary file
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return { url: result.secure_url, publicId: result.public_id };
    } catch (error) {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        throw new Error("Image upload failed: " + error.message);
    }
};

// Delete image from Cloudinary
const deleteImage = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error("Cloudinary delete error:", error);
    }
};

module.exports = { uploadImage, deleteImage };