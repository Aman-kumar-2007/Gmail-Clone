import { protectPage } from "../auth/authGuard.js";

const menuBtn = document.getElementById("menu-btn");
const sidebar = document.getElementById("sidebar");
const emptyState = document.getElementById("empty-state");
const emailList = document.getElementById("email-list");
const skeletonLoader = document.getElementById("skeleton-loader");
const deleteBtn = document.getElementById("delete-btn");
const searchInput = document.getElementById("search-input");
const settingsView = document.getElementById("settings-view");

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

import { getInboxEmails, getTrashEmails, restoreEmail, getSentEmails, getStarredEmails, getDraftEmails } from "../services/emailService.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { auth } from "../firebase/config.js";
import { toggleStar, deleteEmail } from "../services/emailService.js";
import { showToast } from "../utils/toast.js";
import { applyTheme } from "../utils/theme.js";

function showInboxView() {
    emailView.classList.add("hidden");
    if (settingsView) {
        settingsView.classList.add("hidden");
    }
    inboxView.classList.remove("hidden");
}


let inboxCount = 0;
let sentCount = 0;
let draftCount = 0;

let currentFolder = "inbox";
let currentUser = null;
let unsubscribe = null;

let currentEmails = [];
let currentSearch = "";

function loadInbox() {
    showInboxView();
    currentFolder = "inbox";
    showLoader();

    if (unsubscribe) {
        unsubscribe();
    }

    unsubscribe = getInboxEmails(currentUser.uid, (emails) => {
        currentEmails = emails;
        inboxCount = emails.length;
        document.getElementById("inbox-count").textContent = inboxCount;

        setTimeout(() => {
            renderInboxEmails(emails);
        }, 300);

    }
    );


}

function loadTrash() {
    showInboxView();
    currentFolder = "trash";
    showLoader();

    if (unsubscribe) {
        unsubscribe();
    }

    unsubscribe = getTrashEmails(currentUser.uid, (emails) => {
        currentEmails = emails;
        setTimeout(() => {
            renderInboxEmails(emails);
        }, 300);

    }
    );

}

function loadSent() {
    showInboxView();
    currentFolder = "sent";
    showLoader();

    if (unsubscribe) {
        unsubscribe();
    }

    unsubscribe = getSentEmails(currentUser.uid, (emails) => {
        currentEmails = emails;
        sentCount = emails.length;
        document.getElementById("sent-count").textContent = sentCount;

        setTimeout(() => {
            renderInboxEmails(emails);
        }, 300);

    });

}

async function loadStarred() {
    showInboxView();
    currentFolder = "starred";

    if (unsubscribe) {
        unsubscribe();
    }

    showLoader();

    unsubscribe = getStarredEmails(currentUser.uid, (emails) => {
        currentEmails = emails;
        setTimeout(() => {
            renderInboxEmails(emails);

        }, 300);

    });
}

function loadDrafts() {
    showInboxView();
    currentFolder = "draft";
    showLoader();

    if (unsubscribe) {
        unsubscribe();
    }
    unsubscribe = getDraftEmails(currentUser.uid, (emails) => {
        currentEmails = emails;
        draftCount = emails.length;
        document.getElementById("draft-count").textContent = draftCount;

        setTimeout(() => {
            renderInboxEmails(emails);

        }, 300);

    });

}

onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    currentUser = user;

    const result = await getUserByUID(user.uid);

    if (result.success) {
        applyTheme(result.data.theme || "dark");
    }

    loadInbox();

});

function initializeDashboard(user) {

    loadInbox();
    loadSent();
    loadDrafts();
    loadStarred();
    loadTrash();

}

protectPage((user) => {
    initializeDashboard(user);
});


function formatTime(timestamp) {

    if (!timestamp) return "";

    const date = timestamp.toDate();

    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

}

function highlightText(text, searchText) {

    if (!searchText) return text;
    const regex = new RegExp(`(${searchText})`, "gi");
    return text.replace(regex, `<mark>$1</mark>`);

}


function renderInboxEmails(emails) {
    hideLoader();
    emailList.innerHTML = "";

    if (emails.length === 0) {
        hideLoader();
        emptyState.style.display = "flex";
        return;
    }

    emptyState.style.display = "none";

    emails.forEach((email, index) => {

        const isSent =
            currentFolder === "sent" ||
            currentFolder === "draft" ||
            (currentFolder === "starred" && email.senderId === currentUser.uid);
        const name = isSent ? email.receiverName : email.senderName;
        const avatar = name ? name.charAt(0).toUpperCase() : "?";

        const isRead = isSent ? true : email.receiver.read;
        const isStarred = isSent ? email.sender.starred : email.receiver.starred;

        const preview = email.body.length > 80
            ? email.body.substring(0, 80) + "..."
            : email.body;

        const card = document.createElement("article");

        card.className = isRead ? "email-card" : "email-card unread";
        card.style.animationDelay = `${index * 70}ms`;

        card.innerHTML = `

            <div class="avatar">
                ${avatar}
            </div>

            <div class="email-details">
                <h3 class="${isRead ? "" : "unread"}">${highlightText(name, currentSearch)}</h3>
                <p>${highlightText(preview, currentSearch)}</p>

            </div>

            <div class="email-meta">
                <span>${formatTime(email.createdAt)}</span>
              ${isStarred
                ? `<i class="fa-solid fa-star star-btn starred"></i>`
                : `<i class="fa-regular fa-star star-btn"></i>`}

            </div>

        `;

        const starBtn = card.querySelector(".star-btn");

        starBtn.addEventListener("click", async (e) => {
            e.stopPropagation();

            const result = await toggleStar(
                email.id,
                isStarred,
                currentFolder
            );
            showToast(
                isStarred
                    ? "Removed from Starred."
                    : "Added to Starred.",
                "info"
            );

            if (!result.success) return;

            if (currentFolder === "sent") {
                email.sender.starred = !email.sender.starred;
            } else {
                email.receiver.starred = !email.receiver.starred;
            }

            starBtn.className =
                (currentFolder === "sent"
                    ? email.sender.starred
                    : email.receiver.starred)
                    ? "fa-solid fa-star star-btn starred"
                    : "fa-regular fa-star star-btn";

        });

        card.addEventListener("click", () => {

            if (currentFolder === "draft") {
                openDraft(email);
            } else {
                openEmail(email);
            }

        });
        emailList.appendChild(card);

    });

    lucide.createIcons();

}

// page changing email opening

import { getUserByUID } from "../services/userService.js";
import { markAsRead } from "../services/emailService.js";

const inboxView = document.getElementById("inbox-view");
const emailView = document.getElementById("email-view");
const backBtn = document.getElementById("back-btn");
const emailSubject = document.getElementById("email-subject");
const senderName = document.getElementById("sender-name");
const senderEmail = document.getElementById("sender-email");
const emailDate = document.getElementById("email-date");
const emailBody = document.getElementById("email-body");
const senderAvatar = document.getElementById("sender-avatar");
const emailStarBtn = document.getElementById("email-star-btn");

let currentEmail = null;

async function openEmail(email) {

    currentEmail = email;

    const icon = emailStarBtn.querySelector("i");
    const isStarred = currentFolder === "sent"
        ? email.sender.starred
        : email.receiver.starred;

    icon.className = isStarred
        ? "fa-solid fa-star starred"
        : "fa-regular fa-star";

    if (currentFolder !== "sent") {
        await markAsRead(email.id);
    }

    inboxView.classList.add("hidden");
    emailView.classList.remove("hidden");

    emailSubject.textContent = email.subject || "(No Subject)";

    if (currentFolder === "sent") {
        senderName.textContent = email.receiverName;
        senderEmail.textContent = email.receiverEmail;

    } else {
        senderName.textContent = email.senderName;
        senderEmail.textContent = email.senderEmail;

    }

    emailBody.textContent = email.body;
    emailDate.textContent = formatTime(email.createdAt);

    const userId = currentFolder === "sent" ? email.receiverId : email.senderId;
    const result = await getUserByUID(userId);

    if (result.success) {
        senderAvatar.src = result.data.photoURL;
    }

    if (email.createdAt) {
        emailDate.textContent =
            email.createdAt.toDate().toLocaleString();
    } else {
        emailDate.textContent = "";
    }

    const deleteIcon = deleteBtn.querySelector("i");

    if (currentFolder === "trash") {
        deleteBtn.innerHTML = `<i data-lucide="undo-2"></i>`;
        deleteBtn.title = "Restore";
    } else {
        deleteBtn.innerHTML = `<i data-lucide="trash-2"></i>`;
        deleteBtn.title = "Move to Trash";
    }

    if (currentFolder === "trash") {
        replyBtn.style.display = "none";
        forwardBtn.style.display = "none";
    } else {
        replyBtn.style.display = "flex";
        forwardBtn.style.display = "flex";
    }

    lucide.createIcons();
}

backBtn.addEventListener("click", () => {

    emailView.classList.add("hidden");
    inboxView.classList.remove("hidden");

});

// star function
emailStarBtn.addEventListener("click", async () => {

    const isStarred = currentFolder === "sent"
        ? currentEmail.sender.starred
        : currentEmail.receiver.starred;

    const result = await toggleStar(
        currentEmail.id,
        isStarred,
        currentFolder
    );

    if (result.success) {
        showToast(
            isStarred
                ? "Removed from Starred."
                : "Added to Starred.",
            "info"
        );
        if (currentFolder === "sent") {
            currentEmail.sender.starred = !currentEmail.sender.starred;
        } else {
            currentEmail.receiver.starred = !currentEmail.receiver.starred;
        }

        const updatedStar = currentFolder === "sent" ? currentEmail.sender.starred : currentEmail.receiver.starred;

        const icon = emailStarBtn.querySelector("i");

        icon.className = updatedStar
            ? "fa-solid fa-star starred"
            : "fa-regular fa-star";
    }

});


// delete function 

deleteBtn.addEventListener("click", async () => {

    let result;
    if (currentFolder === "trash") {
        result = await restoreEmail(currentEmail.id);

    } else {
        result = await deleteEmail(currentEmail.id, currentFolder);
    }

    if (result.success) {

        if (currentFolder === "trash") {
            showToast("Email restored.", "success");
        } else {
            showToast("Moved to Trash.", "success");
        }

        emailView.classList.add("hidden");
        inboxView.classList.remove("hidden");
    }

});


// effect activelink
function setActiveLink(link) {
    document.querySelectorAll("nav a").forEach(item => {
        item.classList.remove("active");

    });

    link.classList.add("active");

}

const trashLink = document.getElementById("trash-link");
const inboxLink = document.getElementById("inbox-link");
const sentLink = document.getElementById("sent-link");

// delete emails render

trashLink.addEventListener("click", () => {
    setActiveLink(trashLink);
    loadTrash();
});

// inbox emails

inboxLink.addEventListener("click", () => {
    setActiveLink(inboxLink);
    loadInbox();
});

// sent emails

sentLink.addEventListener("click", () => {
    setActiveLink(sentLink);
    loadSent();

});

// starred emails
const starredLink = document.getElementById("starred-link");
starredLink.addEventListener("click", () => {
    setActiveLink(starredLink);
    loadStarred();
});

// skeleton loader 

function showLoader() {
    skeletonLoader.classList.remove("hidden");
    emailList.classList.add("hidden");

}

function hideLoader() {
    skeletonLoader.classList.add("hidden");
    emailList.classList.remove("hidden");

}


// reply logics

const replyBtn = document.getElementById("reply-btn");

import { openCompose, openReply, openForward, openDraft } from "../compose/compose.js";

replyBtn.addEventListener("click", () => {
    if (currentFolder === "trash") return;
    openReply(currentEmail, currentFolder);

});

// search logic 

searchInput.addEventListener("input", (e) => {

    const searchText = e.target.value.toLowerCase().trim();
    currentSearch = searchText;
    if (searchText === "") {
        currentSearch = "";
        renderInboxEmails(currentEmails);
        return;
    }
    const filteredEmails = currentEmails.filter((email) => {
        return (
            email.senderName?.toLowerCase().includes(searchText) ||
            email.receiverName?.toLowerCase().includes(searchText) ||
            email.senderEmail?.toLowerCase().includes(searchText) ||
            email.receiverEmail?.toLowerCase().includes(searchText) ||
            email.subject?.toLowerCase().includes(searchText) ||
            email.body?.toLowerCase().includes(searchText)
        );

    });

    renderInboxEmails(filteredEmails);

});

searchInput.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {
        searchInput.value = "";
        currentSearch = "";
        renderInboxEmails(currentEmails);
        searchInput.blur();

    }

});

// forward logic
const forwardBtn = document.getElementById("forward-btn");

forwardBtn.addEventListener("click", () => {
    if (currentFolder === "trash") return;
    openForward(currentEmail);

});

// draft 
const draftLink = document.getElementById("draft-link");

draftLink.addEventListener("click", () => {
    setActiveLink(draftLink);
    loadDrafts();

});
