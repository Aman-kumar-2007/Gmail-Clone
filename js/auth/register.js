import { registerUser } from "../firebase/auth.js";
import {
    isValidName,
    isValidEmail,
    validatePassword,
    isPasswordMatch,
    isTermsAccepted,
    isNotEmpty
} from "../utils/validators.js";
import { showToast } from "../utils/toast.js";

const registerForm = document.getElementById("register-form");

const fullName = document.getElementById("full-name");
const email = document.getElementById("email");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirm-password");
const terms = document.getElementById("terms");

const registerBtn = registerForm.querySelector("button[type='submit']");

registerForm.addEventListener("submit", handleRegister);

async function handleRegister(e) {
    e.preventDefault();
    const name = fullName.value.trim();
    const userEmail = email.value.trim().toLowerCase();
    const userPassword = password.value;
    const confirm = confirmPassword.value;

    if (
        !isNotEmpty(name) ||
        !isNotEmpty(userEmail) ||
        !isNotEmpty(userPassword) ||
        !isNotEmpty(confirm)
    ) {
        showToast("Please fill all fields.", "warning");
        return;
    }

    if (!isValidName(name)) {
        showToast("Name must be between 3 and 50 characters.", "warning");
        return;
    }

    if (!isValidEmail(userEmail)) {
        showToast("Please enter a valid email address.", "warning");
        return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
        showToast(passwordValidation.errors.join("<br>"), "warning");
        return;
    }

    if (!isPasswordMatch(userPassword, confirm)) {
        showToast("Passwords do not match.", "error");
        return;
    }

    if (!isTermsAccepted(terms)) {
        showToast("Please accept the Terms & Conditions.", "warning");
        return;
    }

    registerBtn.disabled = true;
    registerBtn.textContent = "Creating Account...";


    try {

        const result = await registerUser(
            name,
            userEmail,
            userPassword
        );

        if (result.success) {
            showToast("Account created successfully.");
            registerForm.reset();
            setTimeout(() => {
                window.location.href = "./login.html";
            }, 1500);


        } else {
            showToast(result.error, "error");
        }

    } catch (error) {
        showToast("Something went wrong. Please try again.", "error");

    } finally {
        registerBtn.disabled = false;
        registerBtn.textContent = "Create Account";

    }



}
