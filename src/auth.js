import { auth } from './firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    setPersistence,
    browserSessionPersistence
} from "firebase/auth";

export const registerUser = async (username, email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: username });
    return userCredential;
};

export const updateUsername = async (user, newUsername) => {
    return updateProfile(user, { displayName: newUsername });
};



export const loginUser = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = () => {
    return signOut(auth);
};

export const initAuth = async (onUserChanged) => {
    try {
        await setPersistence(auth, browserSessionPersistence);
    } catch (error) {
        console.error("Error setting persistence:", error);
    }
    onAuthStateChanged(auth, onUserChanged);
};
