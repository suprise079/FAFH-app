import * as SecureStore from "expo-secure-store";
import firebase from "firebase";
import { mongoCreateUser } from "./mongoDB/users";
// import "react-toastify/dist/ReactToastify.css";

//SignIn using email and address
export const signIn = async (data) => {
  var token = null;
  var status = false;
  try {
    await firebase
      .auth()
      .signInWithEmailAndPassword(data?.email, data?.password)
      .then(async (res) => {
        token = res.user.uid;
        status = true;
        // alert("Sign In Successful");
        // WriteData(userId, Fname, Sname, Email, Photo)
        if (data.stayLoggedIn) {
          await SecureStore.setItemAsync("userToken", token);
        }
      })
      .catch((error) => {
        console.log("Error code: ", error.code);
        //will write code for error
        if (error.code === "auth/user-not-found") {
          // alert("User not found");
          token = "Error: User not found";
        } else if (error.code === "auth/wrong-password") {
          // alert("Wrong password");
          token = "Error: Wrong password";
        } else {
          console.log("Something went wrong", error);
          // alert("Something went wrong", error);
          token = `Incorrect Passwored or Email.\nPlease try again or sign up.`;
        }
      });
  } catch (e) {
    console.log("This is the error:", e);
    alert("Error!", e);
  }

  return { token, status };
};

export const signUp = async (data) => {
  //register user and sign them in then
  // alert(data);
  var token = null;
  try {
    await firebase
      .auth()
      .createUserWithEmailAndPassword(data?.email, data?.password)
      .then(async (res) => {
        token = res.user.uid;
        await mongoCreateUser(data, token);
        await SecureStore.setItemAsync("userToken", token);
        await SecureStore.setItemAsync("userFirstTime", "true");
      })
      .catch((error) => {
        //will write code for error
        if (error.code === "auth/email-already-in-use") {
          // alert("Email already in use");
          token = "Error: Email already in use";
        } else if (error.code === "auth/weak-password") {
          // alert("Weak password");
          token = "Error: Weak password";
        } else {
          console.log("Something went wrong", error);
          // alert("Something went wrong", error);
          token = `${error}`;
        }
      });
  } catch (e) {
    console.log("This is the error:", e);
    alert("Error!", e);
  }

  // save it to secure store if user wants to stay logged in
  console.log("Signup token: " + token);
  return token;
};

export const resetPassword = async (email) => {
  console.log("Callingreset method!");
  console.log("Email to reset password: " + email);
  //reset password
  try {
    await firebase.auth().sendPasswordResetEmail(email);
    return "Success";
  } catch (e) {
    console.log("This is the error:", e);
    return "Error";
  }
};

export const signOut = async () => {
  //sign out
  try {
    await firebase.auth().signOut();
    await SecureStore.deleteItemAsync("userToken");
    await SecureStore.deleteItemAsync("userFirstTime");
  } catch (e) {
    alert("Error!", e.message);
  }
  return null;
};

export const googleSignIn = async () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.addScope("profile");
  provider.addScope("https://www.googleapis.com/auth/drive");
  try {
    await firebase.auth().signInWithRedirect(provider);
    firebase
      .auth()
      .getRedirectResult()
      .then(function (authData) {
        console.log(authData);
      })
      .catch(function (error) {
        console.log(error);
      });
  } catch (e) {
    console.log(e);
  }
};

//standalone functions
export const reducer = (prevState, action) => {
  switch (action.type) {
    case "RESTORE_TOKEN":
      return {
        ...prevState,
        userToken: action.token,
        isLoading: false,
      };
    case "SIGN_UP":
      return {
        ...prevState,
        isSignedOut: false,
        userToken: action.token,
      };
    case "SIGN_IN":
      return {
        ...prevState,
        isSignedOut: false,
        userToken: action.token,
      };
    case "GOOGLE_SIGN_IN":
      return {
        ...prevState,
        isSignedOut: false,
        userToken: action.token,
      };
    case "SIGN_OUT":
      return {
        ...prevState,
        isSignedOut: true,
        userToken: null,
      };
  }
};
//   We are gonna use the useReducer hook to manage
// the state of the user's authentication throughout the whole App.
// please communicate before editing.
