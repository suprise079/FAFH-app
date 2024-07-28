import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Welcome from "../Pages/auth/welcome";
import Login from "../Pages/auth/login";
import Register from "../Pages/auth/register";
import ForgotPassword from "../Pages/auth/forgotPassword";
import { useTheme } from "native-base";
import OnboardingComponent from "../Pages/auth/onBoarding";

const Stack = createNativeStackNavigator();
function AuthStack() {
  const { colors } = useTheme();
  console.log("Running AuthStack");
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors["primary"]["600"] },
        headerTitleStyle: {
          color: colors["light"]["100"],
        },
        headerTintColor: colors["light"]["100"],
        headerTransparent: true,
      }}
    >
      <Stack.Screen options={{ headerShown: false }} name="Welcome" component={Welcome} />
      <Stack.Screen
        name="Onboarding"
        options={{
          headerShown: false,
        }}
        component={OnboardingComponent}
      />
      <Stack.Screen
        name="Login"
        options={{
          headerTitle: "",
          headerStyle: { backgroundColor: "transparent" },
          headerTintColor: colors["secondary"]["500"],
        }}
        component={Login}
      />
      <Stack.Screen
        name="Register"
        component={Register}
        options={{
          headerTitle: "",
          headerStyle: { backgroundColor: "transparent" },
          headerTintColor: colors.primary,
          headerShown: false,
        }}
      />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
    </Stack.Navigator>
  );
}

export default AuthStack;
