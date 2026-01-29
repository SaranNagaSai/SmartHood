const cloudinary = require("../config/cloudinary");
const logger = require("../utils/logger");

/**
 * Uploads a file (base64, buffer, or local path) to Cloudinary
 * Handles images, audio (voice notes), and video
 * @param {string} fileStr - Media file string or path
 * @param {string} folder - Destination folder (e.g. 'emergencies', 'voice_notes')
 */
const uploadMedia = async (fileStr, folder = 'smarthood') => {
    try {
        const uploadResponse = await cloudinary.uploader.upload(fileStr, {
            resource_type: "auto",
            folder: folder,
            use_filename: true,
            unique_filename: true,
            overwrite: false,
        });

        logger.info(`Media uploaded successfully to Cloudinary: ${uploadResponse.secure_url}`);
        return uploadResponse.secure_url;
    } catch (error) {
        logger.error(`Cloudinary upload error in folder ${folder}: ${error.message}`);
        throw new Error("Failed to upload media. Please check your network and file format.");
    }
};

/**
 * Deletes a file from Cloudinary
 * @param {string} publicId - The public ID of the file to delete
 */
const deleteMedia = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        logger.info(`Media deleted from Cloudinary: ${publicId}`);
        return result;
    } catch (error) {
        logger.error(`Cloudinary deletion error for ${publicId}: ${error.message}`);
        throw new Error("Failed to delete media.");
    }
};

module.exports = {
    uploadMedia,
    deleteMedia
};
