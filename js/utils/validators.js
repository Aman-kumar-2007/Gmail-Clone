// Name Validation

export function isValidName(name) {

    const trimmedName = name.trim();

    return trimmedName.length >= 3 &&
        trimmedName.length <= 50;

}

// Email Validation

export function isValidEmail(email) {

    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(email.trim());

}

// Password Validation

export function validatePassword(password) {

    const errors = [];

    // Minimum Length
    if (password.length < 8) {
        errors.push("Password must be at least 8 characters long.");
    }

    // Lowercase Letter
    if (!/[a-z]/.test(password)) {
        errors.push("Password must contain at least one lowercase letter.");
    }

    // Uppercase Letter
    if (!/[A-Z]/.test(password)) {
        errors.push("Password must contain at least one uppercase letter.");
    }

    // Number
    if (/\d/.test(password)) {
        errors.push("Password must contain at least one number.");
    }

    // Special Character
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
        errors.push("Password must contain at least one special character.");
    }

    return {
        valid: errors.length === 0,
        errors
    };

}

// Password Match

export function isPasswordMatch(
    password,
    confirmPassword
) {

    return password === confirmPassword;

}

// Empty Field Validation

export function isNotEmpty(value) {
    return value.trim() !== "";
}

// Terms Validation

export function isTermsAccepted(checkbox) {

    return checkbox.checked;

}
