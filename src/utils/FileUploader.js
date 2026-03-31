/**
 * FileUploader utility for handling single and multiple file uploads.
 */
const FileUploader = {
  /**
   * Upload a file to the specified endpoint.
   * 
   * @param {Object} options
   * @param {string} options.endpoint - API endpoint for upload
   * @param {File} options.file - File object to upload
   * @param {string} [options.entityData=""] - Optional entity metadata
   * @param {string[]} [options.uploadedImageNames=[]] - Existing image names
   * @returns {Promise<{status: boolean, content: any}>}
   */
  uploadFile: async ({ endpoint, file, entityData = "", uploadedImageNames = [] }) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("entityData", entityData);
    
    if (uploadedImageNames && Array.isArray(uploadedImageNames)) {
      uploadedImageNames.forEach((name) => {
        formData.append("uploadedImages", name);
      });
    }

    try {
      // Get token from ce_token (primary) or authToken (fallback)
      const token = localStorage.getItem("ce_token") || localStorage.getItem("authToken");
      
      if (!token) {
        console.error("Authentication token not found");
        return { status: false, content: "Authentication token not found" };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          // Content-Type is set automatically for FormData
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        console.error("File upload failed:", response.status, response.statusText);
        const errorText = await response.text();
        console.error("Error details:", errorText);
        return { status: false, content: `Upload failed: ${response.status} ${response.statusText}` };
      }

      const data = await response.json();
      return { status: true, content: data.content || data };
    } catch (error) {
      console.error("File upload error:", error);
      return { status: false, content: error.message || "File upload failed" };
    }
  },

  /**
   * Upload multiple files sequentially.
   * 
   * @param {Object} options
   * @param {string} options.endpoint - API endpoint
   * @param {File[]} options.files - Array of files
   * @param {string[]} [options.entityData=[]] - Array of entity metadata matching files
   * @param {string[]} [options.uploadedImageNames=[]] - Existing image names
   * @returns {Promise<string[]>} Array of uploaded file identifiers/filenames
   */
  uploadMultipleFiles: async ({ endpoint, files, entityData = [], uploadedImageNames = [] }) => {
    const uploadedNames = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const entity = entityData[i] || "";

      const result = await FileUploader.uploadFile({
        endpoint,
        file,
        entityData: entity,
        uploadedImageNames,
      });

      if (result.status) {
        // Handle both string and object content
        const fileName = typeof result.content === 'string' ? result.content : (result.content?.fileName || result.content?.id);
        if (fileName) uploadedNames.push(fileName);
      } else {
        console.error("Upload failed for a file:", result.content);
      }
    }

    return uploadedNames;
  },
};

export default FileUploader;
