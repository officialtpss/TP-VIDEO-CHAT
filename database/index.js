const { initializeApp } = require("firebase/app");
const { getAuth } = require("firebase/auth");

const admin = require('firebase-admin');
const serviceAccount = require('./config.js')['production'];

/**
 * Firebase Authentication 
 * Credentials
 */
const firebaseConfig = {
    apiKey: "AIzaSyBIEaFbG4f3LvfU-FF8E1OLmN2QVwUqDJ8",
    authDomain: "videochatapp-2b084.firebaseapp.com",
    projectId: "videochatapp-2b084",
    storageBucket: "videochatapp-2b084.appspot.com",
    messagingSenderId: "186243852236",
    appId: "1:186243852236:web:b01da6df2c64a1e9e01f69",
    measurementId: "G-63V7RSKFZC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
module.exports = {
    db,
    admin,
    auth
};
