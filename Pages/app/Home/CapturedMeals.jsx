import React, { useContext } from "react";
import {
  Box,
  Button,
  Center,
  Checkbox,
  FormControl,
  Heading,
  HStack,
  IconButton,
  Input,
  ScrollView,
  Text,
  useTheme,
  VStack,
} from "native-base";
import { Alert, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import AuthContext, { HomeContext } from "../../../hooks/context";
import { recordFood } from "../../../services/mongoDB/foodStorage";
import { getLocales } from "expo-localization";

function CapturedMeals({ navigation, route }) {
  const { colors } = useTheme();
  const { occasion } = route.params;
  const { meals, setMeals } = React.useContext(HomeContext);
  const { userProfileData } = useContext(AuthContext);
  const [totalCost, setTotalCost] = React.useState(0);
  const [isFAFH, setIsFAFH] = React.useState({
    state: true,
    location: "",
  });
  const userCountry = userProfileData?.country ? JSON.parse(userProfileData.country) : {};
  const { currencyCode, currencySymbol } = getLocales()[0];

  // function to get a random number
  const getRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // generate random food id
  const generateFoodId = () => {
    let foodId = "food";
    for (let i = 0; i < 10; i++) {
      foodId += getRandomNumber(0, 9);
    }
    return foodId;
  };

  // Meal Name
  const MealName = ({ meal }) => {
    let text = "";
    if (meal?.userSuggestion?.Other.length > 0) {
      text =
        meal.userSuggestion["Other"].length > 30
          ? meal.userSuggestion["Other"].substring(0, 30) + "..."
          : meal.userSuggestion["Other"];
    } else if (meal.name?.length > 0) {
      text = meal.name;
    } else {
      text =
        meal.userSuggestion["0"]?.length > 30
          ? meal.userSuggestion["0"].slice(0, 30) + "..."
          : meal.userSuggestion["0"];
    }
    return <Text style={{ fontFamily: "Poppins-Regular" }}>{text}</Text>;
  };

  const handleSubmitMeal = () => {
    let foodId = generateFoodId();
    recordFood(occasion, meals, isFAFH, totalCost);
    Alert.alert("Meal recorded successfully!");
    navigation.navigate("Home");
  };

  React.useEffect(() => {
    // console.log("List of meals: ", meals);
  });

  return (
    <>
      <SafeAreaView></SafeAreaView>
      <ScrollView py={10} px={5}>
        <Heading>{occasion}</Heading>

        {meals.map((meal, index) => {
          console.log(meal.userSuggestion);
          return (
            <HStack
              key={`${index}${meal}${getRandomNumber(1000, 100000)}`}
              bg="primary.50"
              rounded="lg"
              justifyContent={"space-between"}
              my={1}
              alignItems={"center"}
            >
              <HStack alignItems={"center"} space={2}>
                <Box size={12} h={"100%"}>
                  {meal.photo ? (
                    <Image
                      source={{
                        uri: meal.photo,
                      }}
                      alt="Image Preview"
                      style={{
                        alignSelf: "stretch",
                        flex: 1,
                        borderTopLeftRadius: 8,
                        borderBottomLeftRadius: 8,
                      }}
                    />
                  ) : (
                    <Center size={10}>
                      <MaterialIcons name="fastfood" size={30} color={colors["primary"]["700"]} />
                    </Center>
                  )}
                </Box>
              </HStack>
              <MealName meal={meal} />
              <IconButton
                rounded={"none"}
                colorScheme="danger"
                variant="solid"
                borderRightRadius={"lg"}
                icon={<MaterialIcons name="remove-circle" size={24} color={colors.white} />}
                onPress={() => {
                  Alert.alert(
                    "Remove the selected Meal",
                    `Are you sure you want to remove ${meal.name} from your list?\nThis action cannot be undone.`,
                    [
                      {
                        text: "Cancel",
                        style: "cancel",
                      },
                      {
                        text: "Yes",
                        onPress: () => {
                          setMeals((prev) => prev.filter((item) => item.name !== meal.name));
                        },
                      },
                    ],
                    { cancelable: true }
                  );
                }}
              />
            </HStack>
          );
        })}
        <HStack pl={3} bg="primary.50" rounded="lg" justifyContent={"space-between"} alignItems={"center"} my={1}>
          <Text style={{ fontFamily: "Poppins-Regular" }}>Add More</Text>
          <IconButton
            rounded={"none"}
            colorScheme="secondary"
            variant="solid"
            borderRightRadius={"lg"}
            icon={<MaterialIcons name="add-circle" size={24} color={colors.white} />}
            onPress={() => {
              navigation.navigate("RecordFood", { foodType: occasion });
            }}
          />
        </HStack>
        <VStack mb={5} mt={10}>
          <HStack space={2} mb={5}>
            <Checkbox
              // value={isSaveMeal}
              isChecked={isFAFH.state}
              onChange={() => setIsFAFH({ ...isFAFH, state: !isFAFH.state })}
              accessibilityLabel="Check if meal was consumed at home"
            />
            <Text>Check if meal was not consumed at home.</Text>
          </HStack>
          {isFAFH.state ? (
            <FormControl>
              <Input
                borderColor={colors["primary"]["30"]}
                bg={colors["primary"]["30"]}
                rounded="md"
                value={isFAFH.location}
                placeholder="Enter meal location..."
                style={{ fontFamily: "Poppins-Regular" }}
                fontSize={14}
                w={"80%"}
                onChangeText={(text) => setIsFAFH({ ...isFAFH, location: text })}
              />
            </FormControl>
          ) : null}
        </VStack>
        <HStack space="3" justifyContent={"flex-end"} alignItems="center">
          {isFAFH.state ? (
            <FormControl>
              <Input
                borderColor={colors["primary"]["30"]}
                bg={colors["primary"]["30"]}
                rounded="2xl"
                placeholder="Total Cost"
                style={{ fontFamily: "Poppins-Regular" }}
                fontSize={16}
                w={"50%"}
                leftElement={
                  <Center>
                    <Text px={5} color={"muted.400"} fontSize={userCountry.currency ? "sm" : "xl"}>
                      {userCountry.currency ? userCountry.currency : currencySymbol}
                    </Text>
                  </Center>
                }
                onChangeText={(text) => setTotalCost(parseInt(text))}
              />
              <FormControl.HelperText>
                {"This helps you track your expenses...\nWe'll keep this between us."}
              </FormControl.HelperText>
            </FormControl>
          ) : null}
        </HStack>
        <Center pt={10}>
          <Button.Group>
            <Button
              _text={{
                style: { fontFamily: "Poppins-Regular" },
              }}
              onPress={() => {
                Alert.alert(
                  `Discard ${occasion}`,
                  `Are you sure you want to discard ${occasion}?\nThis action cannot be undone.`,
                  [
                    {
                      text: "Cancel",
                      style: "cancel",
                    },
                    {
                      text: "Yes",
                      onPress: () => {
                        // toast Meal Cancelled
                        navigation.navigate("Home");
                        console.log("OK Pressed");
                      },
                    },
                  ],
                  { cancelable: true }
                );
              }}
              colorScheme="danger"
            >
              Discard
            </Button>
            <Button
              _text={{
                style: { fontFamily: "Poppins-Regular" },
              }}
              onPress={() => {
                handleSubmitMeal();

                console.log("Food Submitted");
              }}
              colorScheme="primary"
            >
              Submit
            </Button>
          </Button.Group>
        </Center>
      </ScrollView>
    </>
  );
}

export default CapturedMeals;
