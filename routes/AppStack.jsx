import { ScrollView, Text } from "native-base";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "../Pages/home/home";
import Profile from "../Pages/home/profile";
import Insights from "../Pages/home/insights";
import { useEffect } from "react";
//route settings
const Tab = createBottomTabNavigator();

useEffect(()=>{
  //fix memory leak
  return ()=>{
    console.log("unmounting");
  }
})

function AppStack() {
  return (
    <Tab.Navigator screenOptions={{headerShown:false}}>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Insights" component={Insights} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

export default AppStack;
