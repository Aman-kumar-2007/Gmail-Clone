import { auth } from "../firebase/config.js";

import {
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

export async function logoutUser() {

    try {

        await signOut(auth);

        return {
            success: true
        };

    } catch (error) {

        return {
            success: false,
            error: error.message
        };

    }

}
