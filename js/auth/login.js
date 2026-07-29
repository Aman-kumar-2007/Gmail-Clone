import { loginUser } from "../firebase/auth.js";
import { showToast } from "../utils/toast.js";

import {
    isNotEmpty,
    isValidEmail
} from "../utils/validators.js";

const loginForm = document.getElementById("login-form");
const email = document.getElementById("email");
const password = document.getElementById("password");
const loginBtn = loginForm.querySelector("button[type='submit']");

loginForm.addEventListener("submit", handleLogin);

async function handleLogin(e) {

    e.preventDefault();

    const userEmail = email.value.trim().toLowerCase();
    const userPassword = password.value;

    if (
        !isNotEmpty(userEmail) ||
        !isNotEmpty(userPassword)
    ) {
        showToast("Please fill all fields.", "warning");
        return;
    }

    if (!isValidEmail(userEmail)) {
        showToast("Please enter a valid email address.", "warning");
        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "Signing In...";

    try {

        const result = await loginUser(
            userEmail,
            userPassword
        );

        if (result.success) {
            loginForm.reset();
            showToast("Login successful.", "success");
            setTimeout(() => {
                window.location.href = "./inbox.html";
            }, 1500);

        } else {
            showToast(result.error, "error");
        }
    } catch (error) {
        showToast("Something went wrong. Please try again.", "error");

    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = "Sign In";
    }

}
