import { auth } from "../firebase/config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getUserByUID } from "../services/userService.js";
import { logoutUser } from "../auth/logout.js";
import { showToast } from "../utils/toast.js";

const profile = document.getElementById("profile");
const dropdown = document.getElementById("profile-dropdown");

const userName = document.getElementById("user-name");
const userEmail = document.getElementById("user-email");
const avatar = document.getElementById("profile-avatar");
const logoutBtn = document.getElementById("logout-btn");

onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    const result = await getUserByUID(user.uid);
    if (!result.success) return;
    const currentUser = result.data;
    userName.textContent = currentUser.name;
    userEmail.textContent = currentUser.email;
    avatar.src = currentUser.photoURL ||  "https://i.pinimg.com/236x/13/74/20/137420f5b9c39bc911e472f5d20f053e.jpg";

});

profile.addEventListener("click", (e) => {
    console.log("hello");
    e.stopPropagation();
    dropdown.classList.toggle("show");

});

document.addEventListener("click", () => {
    dropdown.classList.remove("show");

});

logoutBtn.addEventListener("click", async () => {
    const result = await logoutUser();

    if (!result.success) {

        showToast(result.error, "error");

        return;

    }

    showToast("Logged out successfully.", "success");

    setTimeout(() => {

        window.location.href = "./login.html";

    }, 1200);

});
