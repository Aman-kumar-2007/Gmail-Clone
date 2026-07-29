const firebaseErrors = {
    "auth/email-already-in-use":
        "This email is already registered.",

    "auth/invalid-email":
        "Please enter a valid email address.",

    "auth/user-not-found":
        "No account found with this email.",

    "auth/wrong-password":
        "Incorrect password.",

    "auth/invalid-credential":
        "Invalid email or password.",

    "auth/weak-password":
        "Password must be at least 6 characters long.",

    "auth/too-many-requests":
        "Too many failed attempts. Please try again later.",

    "auth/network-request-failed":
        "Network error. Please check your internet connection.",

    "auth/user-disabled":
        "This account has been disabled.",

    "auth/operation-not-allowed":
        "This authentication method is currently unavailable."
};

export function getFirebaseErrorMessage(errorCode) {
    return firebaseErrors[errorCode] || "Something went wrong. Please try again.";
}
