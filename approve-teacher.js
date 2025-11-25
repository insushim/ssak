// Helper script to approve teacher account
// Run this in browser console while logged into Firebase Console

// Instructions:
// 1. Go to Firebase Console: https://console.firebase.google.com/project/isw-writing/firestore
// 2. Navigate to 'users' collection
// 3. Find the teacher@example.com user document
// 4. Edit the 'approved' field and set it to true
// 5. Save

// Or use Firebase Admin SDK (requires serviceAccountKey.json):
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function approveTeacher() {
    // Find teacher by email
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', 'teacher@example.com').get();

    if (snapshot.empty) {
        console.log('No matching documents.');
        return;
    }

    snapshot.forEach(async doc => {
        await doc.ref.update({
            approved: true
        });
        console.log(`Approved teacher: ${doc.id}`);
    });
}

approveTeacher();
