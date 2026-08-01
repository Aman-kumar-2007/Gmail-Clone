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

            isDraft: false,
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

export async function sendDraft(draftId, emailData) {

    try {

        const firebaseUser = auth.currentUser;

        if (!firebaseUser) {
            return {
                success: false,
                error: "User not authenticated."
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

        const receiver = receiverResult.data;

        await updateDoc(doc(db, "emails", draftId), {

            receiverId: receiver.uid,
            receiverName: receiver.name,
            receiverEmail: receiver.email,

            subject: emailData.subject.trim(),
            body: emailData.body.trim(),

            isDraft: false,

            updatedAt: serverTimestamp()

        });

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


export async function markAsRead(emailId) {

    try {
        const emailRef = doc(db, "emails", emailId);

        await updateDoc(emailRef, {
            "receiver.read": true
        });

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

export async function restoreEmail(emailId) {

    try {

        await updateDoc(doc(db, "emails", emailId), {
            "receiver.deleted": false
        });

        return {
            success: true
        };

    } catch (error) {

        return {
            success: false,
            error
        };

    }

}

export function getSentEmails(uid, callback) {

    const q = query(
        collection(db, "emails"),
        where("senderId", "==", uid),
        where("sender.deleted", "==", false),
        where("isDraft", "==", false),
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

export function getStarredEmails(userId, callback) {

    let inboxEmails = [];
    let sentEmails = [];

    const inboxQuery = query(
        collection(db, "emails"),
        where("receiverId", "==", userId),
        where("receiver.starred", "==", true),
        where("receiver.deleted", "==", false),
        orderBy("createdAt", "desc")
    );

    const sentQuery = query(
        collection(db, "emails"),
        where("senderId", "==", userId),
        where("sender.starred", "==", true),
        where("sender.deleted", "==", false),
        orderBy("createdAt", "desc")
    );

    const unsubscribeInbox = onSnapshot(inboxQuery, (snapshot) => {
        inboxEmails = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        const allEmails = [...inboxEmails, ...sentEmails];
        allEmails.sort((a, b) => {
            return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
        });

        callback(allEmails);
    });

    const unsubscribeSent = onSnapshot(sentQuery, (snapshot) => {
        sentEmails = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        const allEmails = [...inboxEmails, ...sentEmails];
        allEmails.sort((a, b) => {
            return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
        });

        callback(allEmails);
    });

    return () => {
        unsubscribeInbox();
        unsubscribeSent();
    };
}

export async function saveDraft(draftData) {

    try {
        const docRef = await addDoc(collection(db, "emails"), {

            senderId: draftData.senderId,
            senderName: draftData.senderName,
            senderEmail: draftData.senderEmail,

            receiverId: null,
            receiverName: "",
            receiverEmail: draftData.receiverEmail,

            subject: draftData.subject,
            body: draftData.body,

            sender: {
                starred: false,
                deleted: false
            },

            receiver: {
                read: false,
                starred: false,
                deleted: false
            },

            isDraft: true,

            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()

        });

        return {
            success: true,
            draftId: docRef.id
        };

    } catch (error) {

        return {
            success: false,
            error: error.message
        };

    }

}

export async function updateDraft(draftId, draftData) {

    try {
        await updateDoc(doc(db, "emails", draftId), {
            receiverEmail: draftData.receiverEmail,
            subject: draftData.subject,
            body: draftData.body,
            updatedAt: serverTimestamp()

        });

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

export function getDraftEmails(userId, callback) {

    const q = query(
        collection(db, "emails"),
        where("senderId", "==", userId),
        where("isDraft", "==", true),
        orderBy("updatedAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {

        const drafts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        callback(drafts);

    });

}
