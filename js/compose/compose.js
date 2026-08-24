import { sendEmail } from "../services/emailService.js";
import { showToast } from "../utils/toast.js";
import { auth } from "../firebase/config.js";
import { saveDraft, updateDraft, sendDraft } from "../services/emailService.js";

import { getUserByUID } from "../services/userService.js";

const composeBtn = document.getElementById("compose-btn");
const composeOverlay = document.getElementById("compose-overlay");
const composeForm = document.getElementById("compose-form");
const closeComposeBtn = document.getElementById("close-compose");
const cancelComposeBtn = document.getElementById("cancel-compose");
const receiverEmail = document.getElementById("receiver-email");
const sendBtn = document.getElementById("send-btn");


let currentDraftId = null;

export function setCurrentDraftId(draftId) {
    currentDraftId = draftId;
}

export function getCurrentDraftId() {
    return currentDraftId;
}

async function getUserSignature() {
    const currentUser = auth.currentUser;

    if (!currentUser) return "";

    const result = await getUserByUID(currentUser.uid);

    if (!result.success) {
        return "";
    }

    return result.data.signature || "";
}


function setLoading(isLoading) {
    sendBtn.disabled = isLoading;
    sendBtn.textContent = isLoading
        ? "Sending..."
        : "Send";

}

export function openCompose() {
    composeOverlay.classList.add("active");
    receiverEmail.focus();

}



export function closeCompose() {
    composeOverlay.classList.remove("active");
    composeForm.reset();

}

composeBtn.addEventListener("click", () => {
    currentDraftId = null;
    openCompose();
});

closeComposeBtn.addEventListener("click", async () => {
    await handleDraftSave();
    closeCompose();

});

cancelComposeBtn.addEventListener("click", async () => {
    await handleDraftSave();
    closeCompose();

});


composeOverlay.addEventListener("click", async (event) => {

    if (event.target === composeOverlay) {
        await handleDraftSave();
        closeCompose();
    }

});


document.addEventListener("keydown", async (event) => {

    if (event.key === "Escape" && composeOverlay.classList.contains("active")) {
        await handleDraftSave();
        closeCompose();
    }

});

composeForm.addEventListener("submit", handleComposeSubmit);

async function handleComposeSubmit(event) {
    event.preventDefault();

    const emailData = {
        receiverEmail: receiverEmail.value.trim(),
        subject: subject.value.trim(),
        body: message.value.trim()

    };

    if (
        !emailData.receiverEmail ||
        !emailData.subject ||
        !emailData.body
    ) {
        showToast("Please fill all fields.", "warning");
        return;
    }

    const currentUser = auth.currentUser;

    if (
        emailData.receiverEmail.toLowerCase() ===
        currentUser.email.toLowerCase()
    ) {
        showToast("You can't send an email to yourself.", "warning");
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(emailData.receiverEmail)) {
        showToast("Please enter a valid email address.", "error");
        return;
    }

    try {
        setLoading(true);
        let result;

        if (currentDraftId) {
            result = await sendDraft(currentDraftId, emailData);

        } else {
            result = await sendEmail(emailData);

        }

        if (!result.success) {
            showToast(result.error, "error");
            return;

        }

        showToast(
            subject.value.startsWith("Re:")
                ? "Reply sent."
                : subject.value.startsWith("Fwd:")
                    ? "Email forwarded."
                    : "Email sent successfully.",
            "success"
        );
        currentDraftId = null;
        composeForm.reset();
        closeCompose();

    } catch (error) {
        console.error(error);
        showToast("Something went wrong.", "error");

    } finally {
        setLoading(false);

    }

}


export function openReply(email, currentFolder) {

    openCompose();

    receiverEmail.value = currentFolder === "sent" ? email.receiverEmail : email.senderEmail;

    subject.value = email.subject.startsWith("Re:")
        ? email.subject
        : `Re: ${email.subject}`;

    message.value = `

----------------------------

On ${email.createdAt.toDate().toLocaleString()},
${email.senderName} wrote:
${email.body}

`;

    message.focus();
    message.setSelectionRange(0, 0);

}

export function openForward(email) {

    openCompose();
    receiverEmail.value = "";

    const originalSubject = email.subject.trim();
    subject.value = originalSubject.match(/^Fwd:/i)
        ? originalSubject
        : `Fwd: ${originalSubject}`;

    message.value = `

---------- Forwarded message ----------

From: ${email.senderName} <${email.senderEmail}>
Date: ${email.createdAt.toDate().toLocaleString()}
Subject: ${email.subject}
To: ${email.receiverName} <${email.receiverEmail}>

------------------------------------------------------------

${email.body}`;

    receiverEmail.focus();

}

export function openDraft(draft) {

    openCompose();
    setCurrentDraftId(draft.id);
    receiverEmail.value = draft.receiverEmail || "";
    subject.value = draft.subject || "";
    message.value = draft.body || "";
    receiverEmail.focus();

}



async function handleDraftSave() {

    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const receiver = receiverEmail.value.trim();
    const subjectText = subject.value.trim();
    const bodyText = message.value.trim();

    if (!receiver && !subjectText && !bodyText) {
        return;
    }

    const senderResult = await getUserByUID(auth.currentUser.uid);

    if (!senderResult.success) {
        return senderResult;
    }

    const sender = senderResult.data;

    const draftData = {
        senderId: sender.uid,
        senderName: sender.name,
        senderEmail: sender.email,
        receiverEmail: receiver,
        subject: subjectText,
        body: bodyText
    };

    if (currentDraftId === null) {
        const result = await saveDraft(draftData);
        if (result.success) {
            showToast("Draft saved.", "success");
            currentDraftId = result.draftId;
        }

    } else {
        await updateDraft(currentDraftId, draftData);
        showToast("Draft updated.", "info");

    }

}
