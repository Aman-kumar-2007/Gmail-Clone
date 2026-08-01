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
