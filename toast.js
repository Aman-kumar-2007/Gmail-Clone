const toastContainer = document.getElementById("toast-container");

export function showToast(message, type = "success") {

    const toast = document.createElement("div");
    toast.classList.add("toast", type);

    const icons = {
        success: "✓",
        error: "✕",
        warning: "⚠",
        info: "ℹ"
    };

    const titles = {
        success: "Success",
        error: "Error",
        warning: "Warning",
        info: "Information"
    };

    toast.innerHTML = `
    
        <div class="toast-icon">
            ${icons[type]}
        </div>

        <div class="toast-content">

            <div class="toast-title">
                ${titles[type]}
            </div>

            <div class="toast-message">
                ${message}
            </div>

        </div>

        <button class="toast-close">
            &times;
        </button>

    `;

    toastContainer.appendChild(toast);

    const removeToast = () => {

        toast.classList.add("hide");

        setTimeout(() => {

            toast.remove();

        }, 300);

    };

    toast.querySelector(".toast-close")
        .addEventListener("click", removeToast);

    setTimeout(removeToast, 4000);

}
