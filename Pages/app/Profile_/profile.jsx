import React, { useContext, useEffect } from "react";
import { ScrollView, Animated, RefreshControl, Linking } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Center,
  HStack,
  VStack,
  Text,
  Button,
  Pressable,
  useTheme,
  Heading,
  Avatar,
  Icon,
  Box,
  Actionsheet,
  IconButton,
  Select,
  Link,
  Alert,
} from "native-base";

import { SafeAreaView } from "react-native-safe-area-context";
import {
  AntDesign,
  Entypo,
  FontAwesome,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  Zocial,
} from "@expo/vector-icons";

import {
  AgeIconProfile,
  GenderIconProfile,
  HeightIconProfile,
  WeightIconProfile,
} from "../../../Components/customSvgIcon";
import { useWindowDimensions } from "react-native";
import AuthContext from "../../../hooks/context";
import UploadProfilePic from "./uploadProfilePic";
import { ProfileContext } from "./profileStack";
import { color } from "react-native-reanimated";

function Profile({ navigation }) {
  const { userProfileData, setUserProfileData, signOut, userToken, getUser } = useContext(AuthContext);
  const { profilePicture } = useContext(ProfileContext);
  const { colors } = useTheme();
  const { height, width } = useWindowDimensions();
  const {} = useContext(AuthContext);
  const scrollY = new Animated.Value(0);
  const diffClamp = Animated.diffClamp(scrollY, 0, 100);

  const [editActionSheet, setEditActionSheet] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    calcBmi();
    getUser(setUserProfileData).then(() => {
      setRefreshing(false);
    });
  }, [userProfileData]);

  const contactData = [
    {
      title: "Email",
      icon: <Zocial name="email" size={18} color={colors.white} />,
      email: "sammicaheal@gmail.com",
    },
    // {
    //   title: "Phone",
    //   icon: <MaterialIcons name="phone" size={18} color={colors.white} />,
    //   phoneNumber: "+1 234 567 890",
    // },
  ];
  const aboutData = [
    {
      title: "About",
      icon: <Entypo name="info" size={18} color={colors.white} />,
      value: "FERL, FoodLog",
      onPress: () => Linking.openURL("https://ferl.co.za/about"),
    },
    {
      title: "Report a bug",
      icon: <MaterialCommunityIcons name="bug" size={18} color={colors.white} />,
      value: "Report a bug, Give feedback",
      onPress: () => navigation.navigate("ReportBug"),
    },
    {
      title: "Terms and Conditions",
      icon: <MaterialCommunityIcons name="file-document" size={18} color={colors.white} />,
      value: "Terms and Conditions, Ethical Clearance",
      onPress: () =>
        Linking.openURL("https://www.termsandconditionsgenerator.com/live.php?token=Y8AJxz4qsygaNxAkg0Mcu3DPqqsuXOxz"),
    },
  ];

  const [bmi, setBmi] = React.useState(0);
  const [waterGoal, setWaterGoal] = React.useState(0);
  const [currency, setCurrency] = React.useState("");

  //calculate bmi
  const calcBmi = () => {
    const heightInMeters = userProfileData?.height / 100;
    const bmi = userProfileData?.weight / (heightInMeters * heightInMeters);
    setBmi(bmi.toFixed(2));
  };

  const formatDate = (date) => {
    if (date) {
      date = date.split(" ");
      let yyyy = date[2];
      let mm = new Date(`${date[0]} 1, 2022`).getMonth() + 1;
      let dd = date[1];
      dd = dd.substring(0, dd.length - 2);

      return `${yyyy},${mm},${dd}`;
    }
  };
  const getAge = (date) => {
    if (date) {
      let [yyyy, mm, dd] = date.split(",");
      date = new Date(yyyy, mm - 1, dd);
      var diff = Date.now() - date.getTime();
      var age = new Date(diff);
      return Math.abs(age.getUTCFullYear() - 1970);
    }
  };

  const getBmiColorAndText = (bmi) => {
    return bmi < 17
      ? {
          bmiColor: colors.red[200],
          bmiText: "Underweight",
          textColor: colors.red[500],
        }
      : bmi < 25
      ? {
          bmiColor: colors.primary[30],
          bmiText: "Healthy Weight",
          textColor: colors.primary[600],
        }
      : bmi < 30
      ? {
          bmiColor: colors.secondary[100],
          bmiText: "Overweight",
          textColor: colors.secondary[600],
        }
      : {
          bmiColor: colors.red[200],
          bmiText: "Obese",
          textColor: colors.red[500],
        };
  };
  useEffect(() => {
    calcBmi();

    return () => {};
  }, [userProfileData]);

  return (
    <SafeAreaView
      style={{
        backgroundColor: colors.white,
      }}
    >
      <HStack bg="white" space="3" alignItems="center" justifyContent={"space-between"} my={3} mx={5}>
        <Heading style={{ fontFamily: "Poppins-SemiBold" }}>Profile</Heading>
        <Pressable
          _pressed={{
            opacity: 0.5,
          }}
          rounded={"full"}
          onPress={() => {
            setEditActionSheet((prev) => !prev);
          }}
        >
          <Center rounded="full" borderColor={"muted.400"} p="2">
            <FontAwesome5 name="cog" size={24} color="black" />
          </Center>
        </Pressable>
      </HStack>
      <ScrollView
        onScroll={(e) => scrollY.setValue(e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={32}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Title */}
        <Animated.View
          style={{
            opacity: diffClamp.interpolate({
              inputRange: [0, 120],
              outputRange: [1, 0],
            }),
          }}
        >
          <Box pb={2} bg={"white"}>
            <HStack space="3" alignItems="center" justifyContent={"center"} m={2} bg={"primary.30"} rounded="xl" p={5}>
              <Pressable
                _pressed={{
                  opacity: 0.5,
                }}
                rounded="full"
                position={"relative"}
                justifyContent="center"
                alignItems={"center"}
                onPress={() => {
                  navigation.navigate("EditProfile", {
                    actionType: "Edit Profile",
                    userProfileData: userProfileData,
                  });
                }}
              >
                <Center position={"absolute"} zIndex="3" opacity={0.7}>
                  <AntDesign
                    name="camera"
                    size={34}
                    color={profilePicture ? colors.primary["100"] : colors.secondary["600"]}
                  />
                </Center>

                <Avatar
                  size={"xl"}
                  source={{
                    uri: userProfileData?.avatar ? userProfileData.avatar : profilePicture ? profilePicture : null,
                  }}
                >
                  <Center h="100%" w="100%" rounded="full">
                    <LinearGradient
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: 0,
                        height: "100%",
                        borderRadius: 100,
                      }}
                      // Background Linear Gradient
                      colors={[colors.primary["100"], colors.primary["500"]]}
                    />
                  </Center>
                </Avatar>
              </Pressable>

              <VStack>
                <Heading
                  style={{
                    fontFamily: "Poppins-SemiBold",
                  }}
                  fontSize={"3xl"}
                >
                  {userProfileData?.fullName}
                </Heading>
                <Text color={"muted.500"}>
                  {userProfileData?.profession ? userProfileData.profession : "No profession set"}
                </Text>
              </VStack>
            </HStack>
          </Box>
        </Animated.View>
        {/* Profile Options */}
        <VStack space="3" p={3} h={height * 1.45} bg={"white"}>
          <Text>Physical Information</Text>
          <VStack space={2} rounded={"lg"} p="2">
            <HStack
              bg={getBmiColorAndText(bmi).bmiColor}
              rounded={"lg"}
              h={"65px"}
              p={2}
              space="7"
              px={5}
              alignItems="center"
            >
              <Center bg="primary.600" p="1.5" rounded="full">
                <FontAwesome5 name="weight" size={19} color={colors.white} />
              </Center>
              <VStack>
                <Text style={{ fontFamily: "Poppins-SemiBold" }}>BMI</Text>
                <Text alignSelf={"flex-end"}>{bmi}</Text>
              </VStack>
              <Text color={getBmiColorAndText(bmi).textColor} pl={"20%"}>
                {getBmiColorAndText(bmi).bmiText}
              </Text>
            </HStack>
            <HStack
              h={"65px"}
              bg="#00000008"
              rounded={"lg"}
              p={2}
              space="7"
              px={5}
              alignItems="center"
              justifyContent={"space-between"}
            >
              <HStack space="3" alignItems="center">
                <Center bg="primary.600" p="1.5" rounded="full">
                  <MaterialCommunityIcons name="weight-kilogram" size={20} color="white" />
                </Center>

                <VStack>
                  <Text
                    style={{
                      fontFamily: "Poppins-SemiBold",
                    }}
                  >
                    Weight
                  </Text>
                  <Text
                    color="muted.500"
                    style={{
                      fontStyle: "italic",
                    }}
                  >
                    {userProfileData?.weight} kg
                  </Text>
                </VStack>
              </HStack>
              <HStack space="3" alignItems="center">
                <Center bg="primary.600" p="1.5" rounded="full">
                  <MaterialCommunityIcons name="human-male-height" size={20} color="white" />
                </Center>

                <VStack>
                  <Text
                    style={{
                      fontFamily: "Poppins-SemiBold",
                    }}
                  >
                    Height
                  </Text>
                  <Text
                    color="muted.500"
                    style={{
                      fontStyle: "italic",
                    }}
                  >
                    {userProfileData?.height} cm
                  </Text>
                </VStack>
              </HStack>
            </HStack>
            <HStack
              h={"65px"}
              bg="#00000008"
              rounded={"lg"}
              p={2}
              space="7"
              px={5}
              alignItems="center"
              justifyContent={"space-between"}
            >
              <HStack space="3" alignItems="center">
                <Center bg="primary.600" p="1" px={2} rounded="full">
                  <FontAwesome name="genderless" size={25} color="white" />
                </Center>

                <VStack>
                  <Text
                    style={{
                      fontFamily: "Poppins-SemiBold",
                    }}
                  >
                    Gender
                  </Text>
                  <Text
                    color="muted.500"
                    style={{
                      fontStyle: "italic",
                    }}
                  >
                    {userProfileData?.gender}
                  </Text>
                </VStack>
              </HStack>
              <HStack space="3" alignItems="center">
                <Center bg="primary.600" p="1.5" rounded="full">
                  <FontAwesome name="birthday-cake" size={18} color="white" />
                </Center>
                <VStack>
                  <Text
                    style={{
                      fontFamily: "Poppins-SemiBold",
                    }}
                  >
                    Age
                  </Text>
                  <Text
                    color="muted.500"
                    style={{
                      fontStyle: "italic",
                    }}
                  >
                    {getAge(formatDate(userProfileData?.dateOfBirth))} Years
                  </Text>
                </VStack>
              </HStack>
            </HStack>
          </VStack>

          <Text>Settings</Text>
          <VStack rounded={"lg"} p="2">
            <HStack
              space="2"
              alignItems="center"
              justifyContent={"space-between"}
              h={"65px"}
              rounded={"lg"}
              bg="#00000008"
              p={2}
              px={5}
            >
              <HStack space="3" alignItems="center">
                <Center bg="primary.600" p="1.5" rounded="full">
                  <Ionicons name="water" size={24} color="white" />
                </Center>

                <Text
                  style={{
                    fontFamily: "Poppins-SemiBold",
                  }}
                >
                  Set a water Goal
                </Text>
              </HStack>
              <Center>
                <Select
                  selectedValue={waterGoal}
                  placeholder="Glasses"
                  minWidth="115px"
                  onValueChange={(itemValue) => setWaterGoal(itemValue)}
                >
                  <Select.Item label="3 Glasses" value="3" />
                  <Select.Item label="4 Glasses" value="4" />
                  <Select.Item label="5 Glasses" value="5" />
                  <Select.Item label="6 Glasses" value="6" />
                  <Select.Item label="7 Glasses" value="7" />
                  <Select.Item label="8 Glasses" value="8" />
                  <Select.Item label="9 Glasses" value="9" />
                  <Select.Item label="10 Glasses" value="10" />
                  <Select.Item label="11 Glasses" value="11" />
                  <Select.Item label="12 Glasses" value="12" />
                </Select>
              </Center>
            </HStack>
          </VStack>

          <Text>Contact Information</Text>
          <VStack space={2} rounded={"lg"} p="2">
            {contactData.map((item, index) => {
              return (
                <HStack
                  h={"65px"}
                  bg="#00000008"
                  rounded={"lg"}
                  p={2}
                  space="7"
                  px={5}
                  alignItems="center"
                  justifyContent={"space-between"}
                  key={index}
                >
                  <HStack space="3" alignItems="center">
                    <Center bg="primary.600" p="1.5" rounded="full">
                      {item.icon}
                    </Center>

                    <VStack>
                      <Text
                        style={{
                          fontFamily: "Poppins-SemiBold",
                        }}
                      >
                        {item.title}
                      </Text>
                      <Text
                        color="muted.500"
                        style={{
                          fontStyle: "italic",
                        }}
                      >
                        {userProfileData?.email}
                      </Text>
                    </VStack>
                  </HStack>
                </HStack>
              );
            })}
          </VStack>

          <Text>About Us</Text>
          <VStack space={2} rounded={"lg"} p="2">
            {aboutData.map((item, index) => {
              return (
                <Pressable
                  rounded={"lg"}
                  bg="#00000008"
                  h={"65px"}
                  key={index}
                  _pressed={
                    item.route && {
                      opacity: 0.5,
                      borderWidth: 1,
                      borderColor: "primary.600",
                      borderRadius: 10,
                    }
                  }
                  onPress={item.onPress}
                >
                  <HStack p={2} space="7" px={5} alignItems="center" justifyContent={"space-between"}>
                    <HStack space="3" alignItems="center">
                      <Center bg="primary.600" p="1.5" rounded="full">
                        {item.icon}
                      </Center>

                      <VStack>
                        <Text
                          style={{
                            fontFamily: "Poppins-SemiBold",
                          }}
                        >
                          {item.title}
                        </Text>
                        <Text
                          color="muted.500"
                          style={{
                            fontStyle: "italic",
                          }}
                        >
                          {item.value}
                        </Text>
                      </VStack>
                    </HStack>
                    {item.route && (
                      <IconButton
                        variant="ghost"
                        icon={<MaterialIcons name="navigate-next" size={34} color={colors.primary["600"]} />}
                        onPress={() => {
                          navigation.navigate(item.route, {
                            userProfileData: userProfileData,
                          });
                        }}
                      />
                    )}
                  </HStack>
                </Pressable>
              );
            })}
          </VStack>

          <Center>
            <Button
              my={10}
              colorScheme="secondary"
              onPress={() => signOut()}
              rightIcon={<AntDesign name="logout" size={24} color={colors["white"]} />}
            >
              Log out
            </Button>
          </Center>
          <Center>
            <Text color={"muted.400"} style={{ fontFamily: "Poppins-Regular" }}>
              ©4IR Pioneers 2022
            </Text>
          </Center>
        </VStack>
      </ScrollView>

      <Actionsheet isOpen={editActionSheet} onClose={() => setEditActionSheet(false)}>
        <Actionsheet.Content>
          {[
            {
              title: "Edit Profile",
              route: "EditProfile",
              icon: <FontAwesome5 name="user-edit" size={24} color={colors.primary["700"]} />,
            },
            // {
            //   title: "Change Password",
            //   route: "changePassword",
            //   icon: <AntDesign name="lock" size={24} color={colors.primary["700"]} />,
            // },
            {
              title: "Delete Account",
              route: "deleteAccount",
              icon: <MaterialIcons name="delete" size={24} color={colors["white"]} />,
            },
          ].map((item, index) => {
            return (
              <Actionsheet.Item
                my={1}
                bg={item.route == "deleteAccount" ? "danger.700" : "muted.100"}
                _text={{
                  color: item.route == "deleteAccount" ? "white" : "primary.600",
                }}
                key={index}
                rounded={"lg"}
                onPress={() => {
                  if (item.route == "deleteAccount") {
                    signOut();
                  }
                  else{navigation.navigate(item.route, {
                    actionType: item.title,
                    userProfileData: userProfileData,
                  });}
                  setEditActionSheet(false);
                }}
              >
                {item.title}
              </Actionsheet.Item>
            );
          })}
        </Actionsheet.Content>
      </Actionsheet>
    </SafeAreaView>
  );
}

export default Profile;
