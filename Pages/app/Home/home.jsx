import React, { useState, useContext, useEffect } from "react";
import { View, StyleSheet, Image, Dimensions } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import * as Progress from "react-native-progress";
import { getLocales, getCalendars } from "expo-localization";
import {
  Text,
  useTheme,
  Button,
  ScrollView,
  Box,
  HStack,
  Actionsheet,
  VStack,
  Center,
  IconButton,
  Heading,
} from "native-base";
import { AntDesign, Entypo, Ionicons } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Avatar, Card, Title, Paragraph } from "react-native-paper";
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart,
} from "react-native-chart-kit";
import { useWindowDimensions } from "react-native";
import { Alert, Modal } from "react-native";
import AdditionalInformation from "./AdditionalInformation";
import * as SecureStore from "expo-secure-store";
import { Carbs, FAFH_logo, HomeFat, ProteinHome, WeightIcon } from "../../../Components/customSvgIcon";
import AuthContext, { HomeContext } from "../../../hooks/context";
import { drinkWater, getDailyQoute, getWater, mongoCreateUser } from "../../../services/mongoDB/users";
import { getDailyInsights } from "../../../services/mongoDB/insightsData";

function Home({ navigation }) {
  const { colors } = useTheme();
  const { height, width } = useWindowDimensions();
  const [data, setData] = useState({
    labels: ["Protein", "Carbs", "Fat"], // optional
    data: [0, 0, 0],
    // map:[colors.secondary[500], colors.primary[200], colors.primary[500]]
  });

  const [waterIntake, setWaterIntake] = useState({ current: 0, goal: 12 });
  const [stepsCounter, setStepsCounter] = useState({
    current: waterIntake.current * 360,
    goal: 6000,
  });
  const [quote, setQuote] = useState({});
  const loca = getLocales();

  // Type of food ActionSheet variables
  const [actionSheetVisible, setActionSheetVisible] = useState(false);

  // Additional Information Modal
  const [modalVisible, setModalVisible] = useState(false);
  const { userProfileData } = useContext(AuthContext);
  const { setMeals } = useContext(HomeContext);
  const [tipsVisible, setTipsVisible] = useState(true);

  const calcBmi = () => {
    const heightInMeters = userProfileData?.height / 100;
    const bmi = userProfileData?.weight / (heightInMeters * heightInMeters);
    if (bmi > 0) return bmi.toFixed();
    else return 0;
  };

  const composition = [
    {
      name: "Weight",
      value: userProfileData?.weight,
      unit: "kg",
      icon: () => <WeightIcon fill={colors["secondary"]["500"]} />,
    },
    {
      name: "BMI",
      value: calcBmi(),
      unit: "kg/m2",
      icon: () => <Ionicons name="ios-speedometer-outline" size={24} color={colors["secondary"]["500"]} />,
    },
    {
      name: "Height",
      value: userProfileData?.height,
      unit: "cm",
      icon: () => <MaterialCommunityIcons name="human-male-height" size={24} color={colors["secondary"]["500"]} />,
    },
  ];

  const userFirstTime = async () => {
    const userFirstTime = JSON.parse(await SecureStore.getItemAsync("userFirstTime"));

    if (userFirstTime) {
      setModalVisible(true);
      SecureStore.deleteItemAsync("userFirstTime");
    }
  };
  const chartConfig = {
    fillShadowGradientFrom: "#FFEC19",
    fillShadowGradientFromOpacity: 0.5,
    fillShadowGradientTo: "#FFEC19",
    backgroundGradientFrom: "#1E2923",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#08130D",
    backgroundGradientToOpacity: 0.0,
    color: (opacity) => `rgba(40, 155, 124, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.9,
    // useShadowColorFromDataset: true, // optional
  };

  const recordFoodClick = (item) => {
    setActionSheetVisible(false);
    // navigate to record food screen with params
    setMeals([]);
    navigation.navigate("RecordFood", {
      foodType: item,
      calories: "",
      date: "", // <-- this is done by the database automatically
      time: "", // <-- this is done by the database automatically
      location: "",
      notes: "",
    });
  };

  useEffect(() => {
    userFirstTime();
    getWater(setWaterIntake, waterIntake);
    getDailyInsights(setData);
    getDailyQoute(setQuote);
    return () => {};
  }, []);

  return (
    <>
      <HStack
        bg={"white"}
        height={height * 0.15}
        safeArea
        p={2}
        space={5}
        alignItems={"center"}
        justifyContent={"center"}
        position={"absolute"}
        top={0}
        zIndex={10}
        width={"full"}
        borderBottomRadius="3xl"
        shadow={5}
      >
        <FAFH_logo fill={colors.primary[600]} />
        <Text color={"primary.700"} fontSize={"2xl"} style={{ fontFamily: "Poppins-SemiBold" }}>
          FoodLog
        </Text>
      </HStack>

      <ScrollView bg={"primary.30"} pt={height * 0.14}>
        {/* Daily activities cards */}
        <Box style={styles.dailyActivitiesContainer}>
          <HStack py={2}>
            <VStack w="55%" ml={7}>
              <Text style={styles.activitiesTitle}>Daily Calories</Text>
              <HStack w={"100%"} justifyContent={"space-between"} alignItems="flex-end">
                <TouchableOpacity onPress={() => {}}>
                  <Center>
                    <ProteinHome />
                    <Text style={styles.activitiesText}>Protein</Text>
                  </Center>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {}}>
                  <Center>
                    <Carbs />
                    <Text style={styles.activitiesText}>Carbs</Text>
                  </Center>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {}}>
                  <Center>
                    <HomeFat />
                    <Text style={styles.activitiesText}>Fat</Text>
                  </Center>
                </TouchableOpacity>
              </HStack>
            </VStack>
            <Center>
              <ProgressChart
                colors={["#FFEC19", "#FFEC19", "#FFEC19"]}
                data={data}
                width={width * 0.4}
                height={height * 0.15}
                strokeWidth={6}
                radius={18}
                chartConfig={chartConfig}
                hideLegend={true}
                barPercentage={0}
              />
            </Center>
          </HStack>

          {/* Activities and tips container */}
          <View style={styles.activitiesAndTipsContainer}>
            {/* Tips of the day */}
            {tipsVisible && (
              <View style={styles.tipsContainer}>
                <View style={styles.messageContainer}>
                  <Text style={styles.tipsTitle}>{quote.author ? `~${quote.author}` : "Loading..."}</Text>
                  <Text style={styles.tipsText}>{quote.text ? quote.text : "Loading..."}</Text>
                </View>
                <Image style={styles.tipsImage} source={require("../../../assets/images/standing.png")} />
                <Ionicons
                  onPress={() => {
                    setTipsVisible(false);
                  }}
                  name="ios-close-circle-sharp"
                  size={24}
                  color={colors["secondary"]["500"]}
                />
              </View>
            )}
            {/* Indicators container */}
            <VStack mt={5}>
              {/* Record Food */}
              <VStack
                space={2}
                rounded={"md"}
                bg={"primary.50"}
                p={2}
                pt={3}
                pl={3}
                mb={5}
                borderWidth={0.5}
                borderColor={colors["primary"]["100"]}
              >
                <Title style={styles.cardTitle}>
                  <Ionicons name="restaurant-outline" size={20} color={colors["secondary"]["500"]} />
                  Food
                </Title>
                <Card.Content style={styles.cardContent}>
                  <View>
                    <Text
                      style={{
                        fontFamily: "Poppins-Regular",
                      }}
                    >
                      <Title>{data.data[data.data.length - 1]}</Title> cal
                    </Text>
                  </View>
                  <View>
                    <Button
                      borderColor={colors["secondary"]["600"]}
                      borderWidth={0.5}
                      // leftIcon={
                      //   <RecordFoodIcon fill={colors["primary"]["700"]} />
                      // }
                      colorScheme="tertiary"
                      onPress={() => {
                        mongoCreateUser({});
                        setActionSheetVisible(true);
                      }}
                      _text={{
                        style: { fontFamily: "Poppins-Regular" },
                        color: colors["secondary"]["600"],
                      }}
                    >
                      Record Food
                    </Button>
                  </View>
                </Card.Content>
              </VStack>
              <Actionsheet
                isOpen={actionSheetVisible}
                onClose={() => {
                  setActionSheetVisible(false);
                }}
              >
                <Actionsheet.Content>
                  {["Breakfast", "Lunch", "Dinner", "Snack", "Drink"].map((item) => {
                    return (
                      <Actionsheet.Item
                        key={item}
                        onPress={() => {
                          recordFoodClick(item);
                        }}
                      >
                        {item}
                      </Actionsheet.Item>
                    );
                  })}
                </Actionsheet.Content>
              </Actionsheet>

              {/* Water intake */}
              <VStack
                space={2}
                rounded={"md"}
                bg={"primary.50"}
                p={2}
                pt={3}
                pl={3}
                mb={5}
                borderWidth={0.5}
                borderColor={colors["primary"]["100"]}
              >
                <HStack space={2} justifyContent={"space-between"} alignItems={"center"}>
                  <HStack>
                    <Entypo name="cup" size={24} color={colors.secondary[500]} />
                    <Text style={{ fontFamily: "Poppins-Regular" }} fontSize={"16"}>
                      Water Intake
                    </Text>
                  </HStack>
                  <HStack>
                    <Button.Group>
                      <IconButton
                        size={"8"}
                        rounded="full"
                        variant="solid"
                        icon={<AntDesign name="minus" size={24} color="white" />}
                        onPress={() => {
                          if (waterIntake.current > 0) {
                            drinkWater(waterIntake.current - 1);
                            setWaterIntake({
                              ...waterIntake,
                              current: waterIntake.current - 1,
                            });

                            // to be removed
                            setStepsCounter({
                              ...stepsCounter,
                              current: (stepsCounter.current / 2).toFixed(0),
                            });
                          }
                        }}
                      />
                      <IconButton
                        size={"8"}
                        rounded="full"
                        variant="solid"
                        icon={<AntDesign name="plus" size={24} color="white" />}
                        onPress={() => {
                          if (waterIntake.current < waterIntake.goal) {
                            drinkWater(waterIntake.current + 1);
                            setWaterIntake({
                              ...waterIntake,
                              current: waterIntake.current + 1,
                            });

                            // to be removed
                            setStepsCounter({
                              ...stepsCounter,
                              current: stepsCounter.current * 2,
                            });
                          }
                        }}
                      />
                    </Button.Group>
                  </HStack>
                </HStack>
                <HStack justifyContent={"space-between"} alignItems={"center"}>
                  <Text ml={2} pt={1} style={{ fontFamily: "Poppins-Regular" }}>
                    <Heading>
                      {waterIntake.current}/{waterIntake.goal}
                    </Heading>{" "}
                    Glasses
                  </Text>
                  <View>
                    <Progress.Bar
                      progress={waterIntake.current / waterIntake.goal}
                      width={120}
                      height={8}
                      color={colors.secondary[500]}
                      unfilledColor={colors.secondary[100]}
                      borderWidth={0}
                    />
                  </View>
                </HStack>
              </VStack>
              {/* Find Recipes*/}
              {/* <VStack
                space={2}
                rounded={"md"}
                bg={"primary.50"}
                p={2}
                pt={3}
                pl={3}
                mb={5}
                borderWidth={0.5}
                borderColor={colors["primary"]["100"]}
              >
                <View style={styles.cardContent}>
                  <Title style={styles.cardTitle}>
                    <MaterialCommunityIcons name="food-apple-outline" size={30} color={colors["secondary"]["500"]} />
                    Recipes
                  </Title>
                  <Card.Content>
                    <Button
                      borderColor={colors["secondary"]["600"]}
                      borderWidth={0.5}
                      colorScheme="tertiary"
                      onPress={() => {
                        navigation.navigate("Recipes");
                      }}
                      _text={{
                        style: { fontFamily: "Poppins-Regular" },
                        color: colors["secondary"]["600"],
                      }}
                    >
                      Find Recipe
                    </Button>
                  </Card.Content>
                </View>
              </VStack> */}
              {/* Body Composition */}
              <HStack
                rounded={"md"}
                bg={"primary.50"}
                p={2}
                pt={3}
                pl={3}
                mb={height * 0.2}
                borderWidth={0.5}
                justifyContent={"space-around"}
                borderColor={colors["primary"]["100"]}
              >
                {composition.map((item, index) => (
                  <VStack space={2}>
                    <HStack space={2} justifyContent={"space-between"} alignItems={"center"}>
                      <HStack>
                        {item.icon()}
                        <Text style={{ fontFamily: "Poppins-Regular" }} fontSize={"16"} ml={3}>
                          {item.name}
                        </Text>
                      </HStack>
                    </HStack>
                    <HStack justifyContent={"space-between"} alignItems={"center"}>
                      <Text ml={2} pt={1} style={{ fontFamily: "Poppins-Regular" }}>
                        <Heading>{item.value ? item.value : 0} </Heading>
                        {item.unit}
                      </Text>
                    </HStack>
                  </VStack>
                ))}
              </HStack>
            </VStack>
          </View>
        </Box>

        {/* Additional Information Modal */}
        <Modal
          animationType="slide"
          visible={modalVisible}
          // visible={true}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <AdditionalInformation setShowModal={setModalVisible} />
        </Modal>
      </ScrollView>
    </>
  );
}

export default React.memo(Home);
const styles = StyleSheet.create({
  // Daily activities cards
  dailyActivitiesContainer: {
    // backgroundColor: "rgba(76, 203, 112, 0.12);",
    // padding: 30,
    marginTop: 10,
    borderRadius: 30,
  },
  innerContainer: {
    borderWidth: 0.5,
    padding: 0,
    width: "60%",
    paddingTop: 0,
    paddingLeft: 30,
  },
  activitiesDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
  },
  activitiesTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    fontWeight: "600",
    marginBottom: 20,
  },
  activitiesImage: {
    width: 24,
    height: 24,
  },
  activitiesText: {
    // fontSize: 18,
    fontWeight: "600",
    marginTop: 5,
    fontFamily: "Poppins-SemiBold",
  },
  diagramContainer: {},

  // Activities and tips container
  activitiesAndTipsContainer: {
    backgroundColor: "white",
    width: "100%",
    padding: 20,
    height: "100%",
    borderRadius: 30,
  },
  tipsContainer: {
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#289B7C",
    padding: 18,
    borderRadius: 8,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  messageContainer: {
    width: "60%",
    alignItems: "center",
    justifyContent: "center",
  },
  tipsTitle: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
    fontFamily: "Poppins-SemiBold",
  },
  tipsText: {
    color: "white",
    fontFamily: "Poppins-Regular",
  },

  // Indicators container (card list)

  indicatorCard: {
    backgroundColor: "#F2FFFC",
    marginBottom: 20,
    // elevation: 3,
    padding: 5,
  },
  cardTitle: {
    color: "black",
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    padding: 10,
  },
  cardContent: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  interLight: {
    fontFamily: "Poppins-Regular",
  },
});
