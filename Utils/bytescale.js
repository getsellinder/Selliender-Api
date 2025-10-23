import * as Bytescale from "@bytescale/sdk";
import nodeFetch from "node-fetch";
// import { FileApi } from "@bytescale/sdk";

// export const upload = multer({ dest: "uploads/" });

export const uploadManager = new Bytescale.UploadManager({
  fetchApi: nodeFetch,
  apiKey: process.env.BYTESCALE_SECRET_API_KEY,
});

export const fileApi = new Bytescale.FileApi({
  fetchApi: nodeFetch,
  apiKey: process.env.BYTESCALE_SECRET_API_KEY,
  //   accountId: process.env.ACCOUNTID,
  //   accountId: "223k2MT",
});
