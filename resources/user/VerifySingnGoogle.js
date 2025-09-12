// firebaseAdmin.js
import admin from "firebase-admin";

// Check if Firebase Admin is already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), // or admin.credential.cert(serviceAccount)
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

export default admin;
