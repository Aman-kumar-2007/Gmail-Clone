export function applyTheme(theme) {
    document.body.classList.toggle("light", theme === "light");
    localStorage.setItem("theme", theme);
}

export function syncThemeToggle() {
    const themeToggle = document.getElementById("theme-toggle");

    if (themeToggle) {
        const theme = localStorage.getItem("theme") || "dark";
        themeToggle.checked = theme === "dark";
    }
}
