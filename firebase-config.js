// Firebase Configuration - MUNCHIES & SHUKISHA
const firebaseConfig = {
    apiKey: "AIzaSyCNulf_lX3VcwmameFUvkAf3D6d5c8w5CA",
    authDomain: "munchies-and-shukisha.firebaseapp.com",
    projectId: "munchies-and-shukisha",
    storageBucket: "munchies-and-shukisha.firebasestorage.app",
    messagingSenderId: "349555107843",
    appId: "1:349555107843:web:2e23b5a31b460cb33c0636"
};

// Initialize Firebase
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
} catch (error) {
    console.error('Firebase initialization error:', error);
}

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Firebase Authentication Functions
async function firebaseLogin(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        let errorMessage = 'Login failed. Please try again.';
        switch (error.code) {
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address.';
                break;
            case 'auth/user-disabled':
                errorMessage = 'This account has been disabled.';
                break;
            case 'auth/user-not-found':
                errorMessage = 'No account found with this email.';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Incorrect password.';
                break;
        }
        return { success: false, error: errorMessage };
    }
}

async function firebaseSignup(email, password, userData) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Save user data to Firestore
        await db.collection('users').doc(user.uid).set({
            email: user.email,
            name: userData.name,
            userType: userData.userType,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // If user is a seller, create vendor profile
        if (userData.userType === 'seller') {
            await createVendorProfile(user.uid, userData);
        }
        
        return { success: true, user: user };
    } catch (error) {
        let errorMessage = 'Signup failed. Please try again.';
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'Email already in use.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address.';
                break;
            case 'auth/operation-not-allowed':
                errorMessage = 'Operation not allowed.';
                break;
            case 'auth/weak-password':
                errorMessage = 'Password is too weak.';
                break;
        }
        return { success: false, error: errorMessage };
    }
}

async function createVendorProfile(uid, userData) {
    try {
        await db.collection('vendors').doc(uid).set({
            businessName: userData.businessName || '',
            businessLocation: userData.businessLocation || '',
            description: userData.description || '',
            businessType: userData.businessType || 'Food Vendor',
            owner: userData.email,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Error creating vendor profile:', error);
        throw error;
    }
}

async function firebaseLogout() {
    try {
        await auth.signOut();
        return { success: true };
    } catch (error) {
        console.error('Error logging out:', error);
        return { success: false, error: error.message };
    }
}

// Password reset function
async function firebaseResetPassword(email) {
    try {
        await auth.sendPasswordResetEmail(email);
        return { success: true };
    } catch (error) {
        let errorMessage = 'Password reset failed. Please try again.';
        switch (error.code) {
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address.';
                break;
            case 'auth/user-not-found':
                errorMessage = 'No account found with this email.';
                break;
        }
        return { success: false, error: errorMessage };
    }
}

// Export for use in other files
window.firebaseAuth = { 
    login: firebaseLogin, 
    signup: firebaseSignup, 
    logout: firebaseLogout,
    resetPassword: firebaseResetPassword,
    auth: auth,
    db: db,
    storage: storage
};

console.log('✅ Firebase configured successfully');