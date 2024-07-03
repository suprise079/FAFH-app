import React, { useState } from "react";
import {
  Box,
  Button,
  Center,
  Checkbox,
  Heading,
  HStack,
  Input,
  Select,
  Skeleton,
  Text,
  useTheme,
  VStack,
} from "native-base";
import { ScrollView, Pressable, Dimensions, StyleSheet, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { HomeContext } from "../../../hooks/context";
import { getFood, getNutrition, getSuggestions } from "../../../services/foodAI/FoodDatabase";
import { round, set } from "react-native-reanimated";
import Collapsible from "react-native-collapsible";
import { createTable, getDBConnection, saveMeals } from "../../../services/localDB/localDB";
import { recordCustomeMeal, storeCustomMeals } from "../../../services/mongoDB/foodStorage";

function AddNewFood({ navigation, route }) {
  const [wasFoodSearched, setWasFoodSearched] = React.useState(false);
  const { foodType } = route.params;
  const { setMeals, meals } = React.useContext(HomeContext);
  const { height, width } = useWindowDimensions();
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [food, setFood] = useState([]);
  const [isSearch, setIsSearch] = useState(false);
  const [nutrition, setNutrition] = useState([]);
  const [catergory, setCatergory] = useState("Generic");
  const [isSaveMeal, setIsSaveMeal] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState({ label: "", image: "" });

  //display controllers
  const scrollViewRef = React.useRef();
  const [isCollapsed, setIsCollapsed] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  // food search skeleton controller
  const [isNutritionalInfoLoaded, setIsNutritionalInfoLoaded] = useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  // dummy nutritional info data
  const nutritionalInfo = {
    "Calories/ serving": [300, "kcal"],
    Protein: [130, "g"],
    "Total Carbohydrate": [30, "g"],
    "Total Fat": [30, "g"],
    Sodium: [10, "mg"],
    Sugar: [13, "g"],
    Cholesterol: [10, "mg"],
    Fiber: [10, "g"],
    "Saturated Fat": [10, "g"],
    Potassium: [13, "mg"],
    "Vitamin A": [10, "%"],
    "Vitamin C": [13, "%"],
    Calcium: [10, "%"],
    Iron: [10, "%"],
    "Trans Fat": [10, "g"],
    "Dietary Fibre": [10, "g"],
  };

  // theme settings
  const { colors } = useTheme();

  const handleSuggest = (text) => {
    if (text.length < 0) {
      return;
    }
    // timer not working please help find another way to delay search till user is done typing
    // getSuggestions(text, setSuggestions);
  };

  const handleSearch = () => {
    let text = searchTerm;
    if (text.length == 0) {
      setIsSearch(false);
      return;
    }
    setSearchValue(text);
    setSuggestions([]);
    setIsSearch(true);
    getFood(text, setFood);
  };

  const handleFoodClick = (id, unitUri, label, image) => {
    let param = {
      ingredients: [
        {
          quantity: 1,
          measureUri: unitUri,
          foodId: id,
        },
      ],
    };
    setSelectedTitle({
      label,
      image,
    });
    setWasFoodSearched(true);
    getNutrition(param, setNutrition);
  };
  const roundToTen = (num) => {
    num = parseFloat(num);
    return num.toFixed(2);
  };

  const handleSaveMeal = () => {
    console.log("saving meal");
    // navigation.navigate("RecordFood");
    setMeals((prev) => [
      ...prev,
      {
        name: selectedTitle.label,
        nutritionalInfo: nutrition,
        catergory: catergory,
        image: selectedTitle.image,
      },
    ]);
    let dta = {
      name: selectedTitle.label,
      nutritionalInfo: nutrition,
    };

    if (isSaveMeal) recordCustomeMeal(dta, foodType);
    console.log("FoodType: ", foodType);
    navigation.navigate("CapturedMeal", { occasion: foodType });

    // save custom meal to db
    // storeCustomMeals("Tadaa012", selectedTitle, nutrition);
  };

  React.useEffect(() => {}, [searchQuery]);
  return (
    <>
      <SafeAreaView></SafeAreaView>
      <ScrollView ref={scrollViewRef}>
        <HStack space="3" alignItems="center" justifyContent={"space-between"} m={5}>
          <HStack alignItems={"center"}>
            <Pressable
              onPress={() => {
                navigation.goBack();
              }}
            >
              <Center bg="primary.600" p="2" pl={2.5} rounded="full">
                <MaterialIcons name="arrow-back-ios" size={24} color={colors["white"]} />
              </Center>
            </Pressable>
            <Heading style={{ fontFamily: "Poppins-SemiBold" }} pl={5}>
              Add New Food
            </Heading>
          </HStack>
        </HStack>
        {/* Search filters */}
        <>
          {wasFoodSearched ? (
            <Center bg="primary.30" py={5} m={3} mx={5} rounded={"xl"}>
              {/* Should be one of the selected search suggestion we get from autocomplete */}
              <Heading style={{ fontFamily: "Poppins-Medium" }} color="primary.700" textAlign={"center"} px={2}>
                {selectedTitle.label}
                {/* A very long name of the food that we are looking for */}
              </Heading>
            </Center>
          ) : (
            <>
              <Box>
                <Input
                  borderColor={colors["primary"]["30"]}
                  bg={colors["primary"]["30"]}
                  m={5}
                  mt={0}
                  rounded="2xl"
                  placeholder="Name of Food"
                  style={{ fontFamily: "Poppins-Regular" }}
                  fontSize={16}
                  //   call search api here
                  onChangeText={(text) => {
                    // handleSuggest(text);
                    setSearchTerm(text);
                  }}
                  onSubmitEditing={(e) => handleSearch()}
                />
                {/* Suggestion box */}
                <VStack
                  style={styles.suggestionContainer}
                  w="80%"
                  p={2}
                  // bg="white"
                  ml={10}
                >
                  {suggestions.map((suggestion, index) => (
                    <Pressable onPress={() => handleSearch(suggestion)} key={index}>
                      <HStack rounded={"lg"} bg={colors["secondary"]["30"]} mt={1} p="2" w={"100%"}>
                        <Heading
                          color={colors["secondary"]["600"]}
                          style={{ fontFamily: "Poppins-Regular" }}
                          fontSize={"lg"}
                        >
                          {suggestion}
                        </Heading>
                      </HStack>
                    </Pressable>
                  ))}
                </VStack>
              </Box>
              <HStack space="3" px={5} alignItems="center" mb={3}>
                <Input
                  borderColor={colors["primary"]["30"]}
                  bg={colors["primary"]["30"]}
                  rounded="2xl"
                  placeholder="Portion Size"
                  style={{ fontFamily: "Poppins-Regular" }}
                  fontSize={16}
                  w={"50%"}
                />
                <Select
                  rounded="2xl"
                  placeholder="Portion Unit"
                  style={{ fontFamily: "Poppins-Regular" }}
                  minWidth="45%"
                  fontSize={14}
                  bg={colors["primary"]["30"]}
                  borderColor={colors["primary"]["30"]}
                >
                  <Select.Item label="Grammes" value="js" />
                  <Select.Item label="Ounce" value="ts" />
                  <Select.Item label="Milliliter" value="c" />
                </Select>
              </HStack>
              {/* search results */}

              <Box width={width} p={5}>
                <Box p={2} flex={1} rounded="lg">
                  <Heading style={{ fontFamily: "Poppins-Medium" }} fontSize={"lg"} ml={-4}>
                    {!isSearch ? "" : `Showing results for '${searchValue}'`}
                  </Heading>
                  {food ? (
                    <ScrollView showsVerticalScrollIndicator={false}>
                      {food.map((item, index) => {
                        return (
                          <HStack rounded={"lg"} key={index} bg={colors["secondary"]["30"]} mt={1} p="2" w={"100%"}>
                            <Pressable
                              onPress={() => handleFoodClick(item.id, item.measureUri, item.label, item.image)}
                            >
                              <VStack>
                                <Heading
                                  color={colors["secondary"]["600"]}
                                  style={{ fontFamily: "Poppins-Regular" }}
                                  fontSize={"lg"}
                                >
                                  {item.label}
                                </Heading>
                                <Text fontSize="xs" color={"muted.500"}>
                                  {roundToTen(item.energy)} {roundToTen(item.protein, 2)} {roundToTen(item.fat)}
                                </Text>
                              </VStack>
                            </Pressable>
                          </HStack>
                        );
                      })}
                    </ScrollView>
                  ) : (
                    <Center bg="secondary.30" p="10" rounded={"full"} mt={20}>
                      <EmptyPlateIcon
                        width={250}
                        height={150}
                        background={colors["muted"]["200"]}
                        fill={colors["secondary"]["100"]}
                      />
                    </Center>
                  )}
                </Box>
              </Box>
            </>
          )}
        </>

        {wasFoodSearched ? (
          <VStack space="2" px={6} pb={10}>
            {/* Basic nutritional information */}
            <Heading color={"secondary.700"} style={{ fontFamily: "Poppins-Regular" }} pb={3}>
              Nutrients
            </Heading>

            {isCollapsed &&
              Object.keys(nutrition)
                .slice(0, 5)
                .map((item, index) => {
                  return (
                    <HStack
                      key={index}
                      borderBottomColor={"muted.300"}
                      borderBottomWidth={isNutritionalInfoLoaded ? 1 : 0}
                      justifyContent={"space-between"}
                      alignItems="center"
                    >
                      <Text style={{ fontFamily: "Poppins-Regular" }} color={"primary.700"} fontSize="md">
                        {nutrition[item].label.split(",")[0]}
                      </Text>
                      <HStack
                        justifyContent={"space-between"}
                        alignItems="baseline"
                        bg="primary.30"
                        rounded="sm"
                        px={2}
                        width={"30%"}
                      >
                        <Text style={{ fontFamily: "Poppins-Regular" }} fontSize="md">
                          {roundToTen(nutrition[item].quantity)}
                        </Text>
                        <Text style={{ fontFamily: "Poppins-Regular" }}>{nutrition[item].unit}</Text>
                      </HStack>
                    </HStack>
                  );
                })}

            {/* Collapsible controller */}
            <Button
              _text={{ style: { fontFamily: "Poppins-Regular" } }}
              colorScheme="primary"
              onPress={() => {
                setIsCollapsed((prev) => !prev);
              }}
              rightIcon={
                <MaterialIcons
                  name={isCollapsed ? "arrow-right" : "arrow-drop-down"}
                  size={24}
                  color={colors["primary"]["300"]}
                />
              }
            >
              Show All Nutritional information
            </Button>

            <Collapsible collapsed={isCollapsed}>
              {Object.keys(nutrition).map((item) => {
                return (
                  <HStack
                    key={item}
                    borderBottomColor={"muted.300"}
                    borderBottomWidth={isNutritionalInfoLoaded ? 1 : 0}
                    justifyContent={"space-between"}
                    alignItems="center"
                  >
                    <Skeleton isLoaded={isNutritionalInfoLoaded} my={1} h={5} rounded="md" startColor="secondary.30">
                      <Text style={{ fontFamily: "Poppins-Regular" }} color={"primary.700"} fontSize="md">
                        {nutrition[item].label.split(",")[0]}
                      </Text>
                    </Skeleton>
                    <HStack
                      justifyContent={"space-between"}
                      alignItems="baseline"
                      bg="primary.30"
                      rounded="sm"
                      px={2}
                      width={"30%"}
                    >
                      <Text style={{ fontFamily: "Poppins-Regular" }} fontSize="md">
                        {roundToTen(nutrition[item].quantity)}
                      </Text>
                      <Text style={{ fontFamily: "Poppins-Regular" }}>{nutrition[item].unit}</Text>
                    </HStack>
                  </HStack>
                );
              })}
            </Collapsible>
          </VStack>
        ) : (
          <Center>
            <Button
              onPress={() => {
                handleSearch();
              }}
              colorScheme={searchQuery.length > 0 ? "secondary" : "muted"}
              _text={{ style: { fontFamily: "Poppins-Regular", fontSize: 17 } }}
              leftIcon={<MaterialIcons name="search" size={30} color={colors.white} />}
              w={"40%"}
            >
              Search
            </Button>
          </Center>
        )}
        {wasFoodSearched && (
          <Center p={4}>
            <HStack space={4} mb={5}>
              <Checkbox
                // value={isSaveMeal}
                isChecked={isSaveMeal}
                onChange={() => setIsSaveMeal(!isSaveMeal)}
                accessibilityLabel="Is store custome meal"
              />
              <Text>Save meal to custome meals</Text>
            </HStack>
            <Button.Group>
              <Button
                onPress={() => {
                  setWasFoodSearched(false);
                }}
                _text={{
                  style: { fontFamily: "Poppins-Regular", fontSize: 17 },
                }}
                leftIcon={<MaterialIcons name="youtube-searched-for" size={30} color={colors.white} />}
                w={"50%"}
                colorScheme="secondary"
              >
                Search again
              </Button>
              <Button
                onPress={() => handleSaveMeal()}
                colorScheme="primary"
                _text={{
                  style: { fontFamily: "Poppins-Regular", fontSize: 17 },
                }}
                rightIcon={<MaterialIcons name="check-circle" size={30} color={colors.white} />}
                w={"40%"}
              >
                Save
              </Button>
            </Button.Group>
          </Center>
        )}
      </ScrollView>
    </>
  );
}

export default AddNewFood;
const styles = StyleSheet.create({
  searchConatiner: {
    position: "relative",
  },
  suggestionContainer: {
    // position: "absolute",
    // // top: 0,
    // top: 50,
    // left: 0,
  },
});
