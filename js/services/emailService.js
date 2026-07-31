import { db, auth } from "../firebase/config.js";

import {

    collection,
    addDoc,
    serverTimestamp,
    query,
    where,
    orderBy,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    getUserByUID,
    getUserByEmail
} from "./userService.js";

import {
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

export async function sendEmail(emailData) {

    try {
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) {
            return {
                success: false,
                error: "User not authenticated."
            };
        }

        if (
            !emailData.receiverEmail.trim() ||
            !emailData.subject.trim() ||
            !emailData.body.trim()
        ) {
            return {
                success: false,
                error: "Please fill all fields."
            };
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(emailData.receiverEmail)) {
            return {
                success: false,
                error: "Invalid email address."
            };
        }

        const senderResult = await getUserByUID(firebaseUser.uid);

        if (!senderResult.success) {
            return senderResult;
        }

        const receiverResult = await getUserByEmail(
            emailData.receiverEmail.trim().toLowerCase()
        );

        if (!receiverResult.success) {
            return {
                success: false,
                error: "Recipient not found."
            };
        }

        const sender = senderResult.data;
        const receiver = receiverResult.data;

        if (
            sender.email.toLowerCase() ===
            receiver.email.toLowerCase()
        ) {
            return {
                success: false,
                error: "You can't send an email to yourself."
            };
        }

        await addDoc(collection(db, "emails"), {

            senderId: sender.uid,
            senderName: sender.name,
            senderEmail: sender.email,

            receiverId: receiver.uid,
            receiverName: receiver.name,
            receiverEmail: receiver.email,

            subject: emailData.subject.trim(),
            body: emailData.body.trim(),

            sender: {
                starred: false,
                deleted: false
            },

            receiver: {
                read: false,
                starred: false,
                deleted: false
            },

            createdAt: serverTimestamp()

        });

        return {
            success: true
        };

    } catch (error) {

        console.error(error);

        return {
            success: false,
            error: error.message
        };

    }
}

export function getInboxEmails(uid, callback) {


    const q = query(
        collection(db, "emails"),
        where("receiverId", "==", uid),
        where("receiver.deleted", "==", false),
        orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {

        const emails = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        callback(emails);

    });

}

export async function markAsRead(emailId){

    try{
        const emailRef = doc(db,"emails",emailId);
        
        await updateDoc(emailRef,{
            "receiver.read": true
        });

        return {
            success:true
        };

    }catch(error){

        return{
            success:false,
            error:error.message
        };

    }

}

export async function toggleStar(emailId, isStarred, folder) {
    try {
        const updateData = {};

        if (folder === "sent") {
            updateData["sender.starred"] = !isStarred;
        } else {
            updateData["receiver.starred"] = !isStarred;
        }

        await updateDoc(doc(db, "emails", emailId), updateData);

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

export async function deleteEmail(emailId, folder) {

    try {
        const updateData = {};

        if (folder === "sent") {
            updateData["sender.deleted"] = true;
        } else {
            updateData["receiver.deleted"] = true;
        }

        await updateDoc(doc(db, "emails", emailId), updateData);

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


export function getTrashEmails(uid, callback) {

    const q = query(
        collection(db, "emails"),
        where("receiverId", "==", uid),
        where("receiver.deleted", "==", true),
        orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {

        const emails = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        callback(emails);

    });

}
