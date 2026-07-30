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
