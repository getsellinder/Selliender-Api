import { v4 as uuidv4 } from "uuid";

import fs from "fs";
import { fileApi, uploadManager } from "./bytescale.js";

// subjectImage {
//   name: 'thought-catalog-sCKtNbIKOuQ-unsplash.jpg',
//   data: <Buffer >,
//   size: 33757,
//   encoding: '7bit',
//   tempFilePath: 'D:\\neonflake\\AudioStremingProject\\Audio-Stream-Api\\tmp\\tmp-2-1755592229405',
//   truncated: false,
//   mimetype: 'image/jpeg',
//   md5: '08f83f1f540ec60f1721442bb7be3e05',
//   mv: [Function: mv]
// }

export const uploadFile = async (file, customPath = null) => {
  try {
    const uniqueFileName = `${uuidv4()}-${file.name}`;
    const result = await uploadManager.upload({
      data: fs.createReadStream(file.tempFilePath),
      mime: file.mimetype,
      originalFileName: file.name,
      size: file.size,
      path: `/Frameji/chapter/${uniqueFileName}`,

      overwriteIfExists: true,
    });
    return {
      fileUrl: result.fileUrl, // public link
      filePath: result.filePath, // internal path for delete
      mimeType: file.mimetype, // helpful if audio vs image
    };
  } catch (error) {
    console.error("Bytscale upload error:", error);
    throw new Error("error uploading to Bytscale.");
  }
};
export const deleteFile = async (file) => {
  try {
    await fileApi.deleteFile({
      accountId: process.env.ACCOUNTID,
      filePath: file,
    });
    console.log("File deleted successfully");
  } catch (error) {
    console.error("Bytescale delete error:", error);
    throw new Error("Error deleting file from Bytescale.");
  }
};

export const audioFile = async (file) => {
  try {
    await fileApi.deleteFile({
      accountId: process.env.ACCOUNTID,
      filePath: file,
    });
    console.log("File deleted successfully");
  } catch (error) {
    console.error("Bytescale audioFile error:", error);
    throw new Error("Error audioFile file from Bytescale.");
  }
};
