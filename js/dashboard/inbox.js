const menuBtn = document.getElementById("menu-btn");
const sidebar = document.getElementById("sidebar");
const emptyState = document.getElementById("empty-state");
const emailList = document.getElementById("email-list");

document.addEventListener("click", (e) => {
    if (window.innerWidth <= 768 &&
        !sidebar.contains(e.target) &&
        !menuBtn.contains(e.target)
    ) {
        sidebar.classList.remove("active");
    }

});

window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
        sidebar.classList.remove("active");
    }

});

menuBtn.addEventListener("click", () => {
    if (window.innerWidth > 768) {
        sidebar.classList.toggle("collapsed");
    } else {
        sidebar.classList.toggle("active");
    }

});

import { getInboxEmails } from "../services/emailService.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { auth } from "../firebase/config.js";

onAuthStateChanged(auth, (user) => {

    if (!user) return;

    getInboxEmails(user.uid, (emails) => {

        if (emails.length === 0) {
            emptyState.style.display = "flex";
            emailList.innerHTML = "";
            return;
        }

        emptyState.style.display = "none";

        renderInboxEmails(emails);

    });

});

function formatTime(timestamp) {

    if (!timestamp) return "";

    const date = timestamp.toDate();

    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

}

