import { db } from "../firebase/config.js";

import {
    doc,
    getDoc,
    collection,
    getDocs,
    query,
    where,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

export async function getUserByUID(uid) {

    try {
        const userRef = doc(db, "users", uid);
        const snapshot = await getDoc(userRef);

        if (!snapshot.exists()) {
            return {
                success: false,
                error: "User not found."
            };

        }

        return {
            success: true,
            data: snapshot.data()
        };

    } catch (error) {
        return {
            success: false,
            error: error.message
        };

    }

}

export async function getUserByEmail(email) {

    try {
        const q = query(
            collection(db, "users"),
            where("email", "==", email.toLowerCase())
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {

            return {
                success: false,
                error: "User not found."
            };

        }

        return {
            success: true,
            data: snapshot.docs[0].data()
        };

    } catch (error) {

        return {
            success: false,
            error: error.message
        };

    }

}

export async function updateUserProfile(uid, data) {

    try {
        const userRef = doc(db, "users", uid);
        await updateDoc(userRef, data);

        return {
            success: true
        };

    } catch (error) {

        return {
            success: false,
            error: error.message
        };

    }

}

export function subscribeUserProfile(uid, callback) {
    
    const userRef = doc(db, "users", uid);
    return onSnapshot(userRef, (snapshot) => {

        if (!snapshot.exists()) return;

        callback({
            uid: snapshot.id,
            ...snapshot.data()
        });

    });

}


