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

