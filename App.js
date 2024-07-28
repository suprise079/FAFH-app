import "react-native-gesture-handler";
//please make sure not add any import on line 1 of file
import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useReducer, useMemo, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { LogBox } from "react-native";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import Toast from '@rimiti/react-native-toastify';

import * as SecureStore from "expo-secure-store";
import "./firebase/firebaseConfig";

import AuthContext from "./hooks/context";
import { reducer, signIn, signOut, signUp } from "./services/auth";
import { NativeBaseProvider } from "native-base";
import FAFHTHEME from "./assets/theme/extTheme";
import AuthStack from "./routes/AuthStack";
import AppStack from "./routes/AppStack";
import useFonts from "./hooks/useFonts";
import { getUser } from "./services/mongoDB/users";
import { error } from "webpack-dev-server/lib/utils/colors";

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      await useFonts();
      setFontsLoaded(true);
    };

    loadFonts();
  }, []);

  //Load fonts
  // if (!fontsLoaded) {
  //   // Render a loading indicator or return null until fonts are loaded
  //   return null;
  // }

  // user authentication
  const [userData, dispatch] = useReducer(reducer, {
    isLoading: true,
    isSignedOut: false,
    userToken: null,
    // ...
  });

  const [userProfileData, setUserProfileData] = useState(null);
  const [hasProfileChanged, setHasProfileChanged] = useState(false);

  const contextData = useMemo(
    () => ({
      signIn: async (data) => {
        let token = "";
        let isLogged;
        await signIn(data).then((res) => {
          token = res.token;
          isLogged = res.status;
        });
        if (!isLogged) {
          console.log(token);
          return token;
        } else {
          let userData = await getUser();
          Console.log("Sign In userdata: " + userData);
          if (userData._id) {
            setUserProfileData(userData);
            dispatch({ type: "SIGN_IN", token });
            return "Success";
          } else {
            return "User not found!\nPlease contact admin regarding this issue.";
          }
        }
      },
      signOut: async () => {
        const token = await signOut();
        dispatch({ type: "SIGN_OUT", token: token });
      },
      signUp: async (data) => {
        let token = "";
        await signUp(data).then((res) => {
          token = res;
        });
        if (token?.includes("Error")) {
          return token;
        } else {
          let userData = await getUser();
          setUserProfileData(userData);
          console.log("Sign Up userdata: " + userData);
          dispatch({ type: "SIGN_UP", token });
          return "Success";
        }
      },
      resetPassword: async (email) => {
        return await resetPassword(email);
      },
      googleSignIn: async () => {
        const token = await googleSignIn();
        dispatch({ type: "GOOGLE_SIGN_IN", token: token });
      },
      userToken: userData.userToken,
      getUser: async (setUserProfileData) => {
        await getUser(setUserProfileData);
      },
    }),
    []
  );
  const restoreSavedUser = async () => {
    let userToken;
    try {
      userToken = await SecureStore.getItemAsync("userToken");
      if (userToken) {
        let user = await getUser();
        if (user._id) {
          setUserProfileData(user);
          dispatch({ type: "RESTORE_TOKEN", token: userToken });
        }
      }
    } catch (e) {
      // Restoring token failed
      console.log("Error restoring user: " + e);
    }

    // After restoring token, we may need to validate it in production apps

    // This will switch to the App screen or Auth screen and this loading
    // screen will be unmounted and thrown away.
  };

  useEffect(() => {
    // Fetch the token from storage then navigate to our appropriate screen
    restoreSavedUser();
    //fix memory leak
    return () => {
      //
    };
  }, []);

  return (
    <NativeBaseProvider theme={FAFHTHEME}>
      <AuthContext.Provider
        value={{
          ...contextData,
          userProfileData,
          setUserProfileData,
          hasProfileChanged,
          setHasProfileChanged,
        }}
      >
        {fontsLoaded ? (
          <NavigationContainer>{userData.userToken == null ? <AuthStack /> : <AppStack />}</NavigationContainer>
        ) : null}
      </AuthContext.Provider>
    </NativeBaseProvider>
  );
}
