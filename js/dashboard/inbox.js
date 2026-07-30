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

function renderInboxEmails(emails) {

    emailList.innerHTML = "";

    if (emails.length === 0) {
        emptyState.style.display = "flex";
        return;
    }

    emptyState.style.display = "none";

    emails.forEach((email) => {

        const avatar = email.senderName
            ? email.senderName.charAt(0).toUpperCase()
            : "?";

        const preview =
            email.body.length > 80
                ? email.body.substring(0, 80) + "..."
                : email.body;

        const card = document.createElement("article");

        card.className = email.receiver.read ? "email-card" : "email-card unread";

        card.innerHTML = `

            <div class="avatar">
                ${avatar}
            </div>

            <div class="email-details">
                <h3"${email.receiver.read ? "" : "unread"}">${email.senderName}</h3>
                <p>${preview}</p>

            </div>

            <div class="email-meta">
                <span>${formatTime(email.createdAt)}</span>
                <i data-lucide="star"></i>

            </div>

        `;

        card.addEventListener("click", () => {
            openEmail(email);

        });

        emailList.appendChild(card);

    });

    lucide.createIcons();

}
