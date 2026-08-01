import { auth } from "../firebase/config.js";
import { getUserByUID, updateUserProfile, subscribeUserProfile, } from "../services/userService.js";
import { showToast } from "../utils/toast.js";
import { updateTheme } from "../services/userService.js";
import { applyTheme, syncThemeToggle } from "../utils/theme.js";

const settingsLink = document.getElementById("settings-link");
const settingsView = document.getElementById("settings-view");
const inboxView = document.getElementById("inbox-view");
const emailView = document.getElementById("email-view");
const settingsBackBtn = document.getElementById("settings-back-btn");
const settingsAvatar = document.getElementById("settings-avatar");
const settingsName = document.getElementById("settings-name");
const settingsEmail = document.getElementById("settings-email");
const saveProfileBtn = document.getElementById("save-profile-btn");
const themeToggle = document.getElementById("theme-toggle");
const emailSignature = document.getElementById("email-signature");
const saveSignatureBtn = document.getElementById("save-signature-btn");

let unsubscribeProfile = null;

function openSettings() {
    inboxView.classList.add("hidden");
    emailView.classList.add("hidden");
    settingsView.classList.remove("hidden");

    const savedTheme = localStorage.getItem("theme") || "dark";
    themeToggle.checked = savedTheme === "dark";

    if (unsubscribeProfile) {
        unsubscribeProfile();
    }

    unsubscribeProfile = subscribeUserProfile(
        auth.currentUser.uid,
        (profile) => {
            const theme = profile.theme || "dark";
            applyTheme(theme);
            themeToggle.checked = theme === "dark";
            settingsName.value = profile.name;
            settingsEmail.value = profile.email;
            emailSignature.value = profile.signature || "";
            settingsAvatar.src = profile.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}`;

        }
    );

}

function closeSettings() {

    if (unsubscribeProfile) {
        unsubscribeProfile();
    }
    settingsView.classList.add("hidden");
    inboxView.classList.remove("hidden");

}

settingsLink.addEventListener("click", openSettings);
settingsBackBtn.addEventListener("click", closeSettings);

lucide.createIcons();

saveProfileBtn.addEventListener("click", saveProfile);

async function saveProfile() {

    const result = await updateUserProfile(auth.currentUser.uid,
        {
            name: settingsName.value.trim()
        }
    );
    if (result.success) {
        showToast("Profile updated.", "success");
    }

}

themeToggle.addEventListener("change", async () => {

    const theme = themeToggle.checked ? "dark" : "light";
    applyTheme(theme);

    await updateTheme(
        auth.currentUser.uid,
        theme
    );

    showToast("Theme updated.", "success");

});


saveSignatureBtn.addEventListener("click", saveSignature);

async function saveSignature() {
    const result =
        await updateUserProfile(auth.currentUser.uid,
            {
                signature: emailSignature.value
            }
        );

    if (result.success) {
        showToast("Signature updated.", "success");

    }

}



