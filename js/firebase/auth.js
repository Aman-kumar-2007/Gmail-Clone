import { auth, db } from "../firebase/config.js";
import { getFirebaseErrorMessage } from "../utils/firebaseErrors.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


export async function registerUser(name, email, password) {
    try {

        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );
        const user = userCredential.user;


        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            name,
            email,
            photoURL: "https://i.pinimg.com/236x/13/74/20/137420f5b9c39bc911e472f5d20f053e.jpg",
            createdAt: serverTimestamp()
        });

        return {
            success: true,
            user
        };

    } catch (error) {
        return {
            success: false,
            error: getFirebaseErrorMessage(error.code)
        };

    }
}


export async function loginUser(email, password) {

    try {

        const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        return {
            success: true,
            user: userCredential.user
        };

    } catch (error) {

        return {
            success: false,
            error: getFirebaseErrorMessage(error.code)
        };

    }

}

export async function logoutUser() {
    try {

        sessionStorage.clear();

        localStorage.removeItem("draftEmail");
        localStorage.removeItem("selectedMail");
        localStorage.removeItem("theme");
        localStorage.removeItem("filters");

        await signOut(auth);

        return {
            success: true
        };

    } catch (error) {

        return {
            success: false,
            error: getFirebaseErrorMessage(error.code)
        };
    }
}

export function checkAuth(callback) {

    onAuthStateChanged(auth, (user) => {

        callback(user);

    });

}
