import { sendEmail } from "../services/emailService.js";
import { showToast } from "../utils/toast.js";
import { auth } from "../firebase/config.js";

const composeBtn = document.getElementById("compose-btn");
const composeOverlay = document.getElementById("compose-overlay");
const composeForm = document.getElementById("compose-form");
const closeComposeBtn = document.getElementById("close-compose");
const cancelComposeBtn = document.getElementById("cancel-compose");
const receiverEmail = document.getElementById("receiver-email");
const sendBtn = document.getElementById("send-btn");

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

composeBtn.addEventListener("click", openCompose);

closeComposeBtn.addEventListener("click", closeCompose);

cancelComposeBtn.addEventListener("click", closeCompose);


composeOverlay.addEventListener("click", (event) => {

    if (event.target === composeOverlay) {
        closeCompose();
    }

});


document.addEventListener("keydown", (event) => {

    if (event.key === "Escape" && composeOverlay.classList.contains("active")) {
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
        const result = await sendEmail(emailData);

        console.log(result);

        if (!result.success) {
            showToast(result.error, "error");
            return;

        }

        showToast("Email sent successfully.", "success");
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
