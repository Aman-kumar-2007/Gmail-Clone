import { auth } from "../firebase/config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

export function protectPage(callback) {

    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.replace("./login.html");
            return;
        }
        callback(user);

    });

}

export function redirectIfAuthenticated() {

    onAuthStateChanged(auth, (user) => {

        if (user) {
            window.location.replace("./inbox.html");
        }

    });

}
