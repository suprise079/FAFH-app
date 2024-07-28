import React, { useEffect, useState } from "react";
import {
  Button,
  Center,
  HStack,
  Pressable,
  useTheme,
  Heading,
  Avatar,
  FormControl,
  Input,
  VStack,
  Text,
  Select,
  CheckIcon,
  Spinner,
  useToast,
  WarningOutlineIcon,
} from "native-base";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import * as Yup from "yup";
import { Formik } from "formik";
import UploadProfilePic from "./uploadProfilePic";
import { ProfileContext } from "./profileStack";
import ToastComponent from "../../../services/CustomToast";
import AuthContext from "../../../hooks/context";
import { getUser, updateUser } from "../../../services/mongoDB/users";
import { DatePickerComponent } from "../../auth/register";
import moment from "moment";

import { LinearGradient } from "expo-linear-gradient";
import useCountries from "use-countries";
import CountryFlag from "react-native-country-flag";

function EditProfile({ navigation, route }) {
  const { colors } = useTheme();
  const { actionType } = route.params;
  const [openImagePicker, setOpenImagePicker] = React.useState(false);
  const { profilePicture } = React.useContext(ProfileContext);
  const toast = useToast();
  const { userProfileData, setUserProfileData } = React.useContext(AuthContext);
  const [fieldsToChange, setFieldsToChange] = useState({});

  console.log("userProfileData: ", userProfileData);
  // form states
  const initialValues = {
    // current user's name
    name: userProfileData?.fullName,
    profession: userProfileData?.profession,
    height: `${userProfileData?.height}`,
    heightUnit: "cm",
    weight: `${userProfileData?.weight}`,
    weightUnit: "kg",
    // doB: moment("1990-01-01").format("MMMM Do YYYY"),
    doB: `${userProfileData?.dateOfBirth}`,
    gender: `${userProfileData?.gender}`,
    country: userProfileData?.country ? `${JSON.parse(userProfileData?.country).name}` : "N/A",
  };

  // Object for error handling
  const validationSchema = Yup.object({
    name: Yup.string().trim().min(3, "Must be at least 3 characters"),
    height: Yup.number().typeError("The Height must be a number").min(1, "Must be at least 1"),
    weight: Yup.number().typeError("The Weight must be a number").min(1, "Must be at least 1"),
  });

  const onTextChange = (field, value) => {
    console.log("Field: ", field, "Value: ", value);
    setFieldsToChange({ ...fieldsToChange, [field]: value });
  };

  const onFormSubmit = async (values, formikActions) => {
    let finalVlaues = { ...fieldsToChange };
    if (values.country != initialValues.country) {
      finalVlaues = { ...finalVlaues, country: values.country };
    }
    if (values.doB != initialValues.doB) {
      finalVlaues = { ...finalVlaues, dateOfBirth: values.doB };
    }
    console.log("Fields to change: ", finalVlaues);
    formikActions.setSubmitting(true);
    updateUser(finalVlaues).then(() => {
      getUser().then((res) => {
        console.log("User data after update: ", JSON.stringify(res));
        setUserProfileData(res);
        formikActions.setSubmitting(false);

        toast.show({
          placement: "top",
          render: () => (
            <ToastComponent
              state={true ? "Success" : "Error"}
              message={true ? "Profile Updated Successfully !" : res}
            />
          ),
        });
        navigation.goBack();
      });
    });
  };

  useEffect(() => {
    return () => {
      // cleanup
    };
  }, []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.white,
      }}
    >
      <HStack space="3" alignItems="center" my={6} mx={5}>
        <Pressable
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Center bg="primary.600" p="2" pl={2.5} rounded="full">
            <MaterialIcons name="arrow-back-ios" size={24} color={colors["white"]} />
          </Center>
        </Pressable>
        <Heading style={{ fontFamily: "Poppins-SemiBold" }}>{actionType}</Heading>
      </HStack>

      <Pressable
        _pressed={{
          opacity: 0.5,
        }}
        rounded="full"
        position={"relative"}
        justifyContent="center"
        alignItems={"center"}
        onPress={() => {
          setOpenImagePicker(true);
        }}
      >
        <Center position={"absolute"} zIndex="3" opacity={0.7}>
          <AntDesign name="camera" size={34} color={colors.primary["100"]} />
        </Center>

        <Avatar
          size={"xl"}
          source={{
            uri: userProfileData?.avatar ? userProfileData?.avatar : profilePicture,
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
      <UploadProfilePic isOpen={openImagePicker} setIsOpen={setOpenImagePicker} />

      <ScrollView>
        <VStack space="5" p={5}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            handleChange={(field, value) => onTextChange(field, value)}
            onSubmit={(values, formikActions) => onFormSubmit(values, formikActions)}
          >
            {({ handleChange, setFieldValue, handleBlur, handleSubmit, values, touched, errors, isSubmitting }) => {
              const { name, profession, doB, gender, weight, height, country } = values;
              return (
                <>
                  <FormControl isInvalid={touched.name && errors.name}>
                    <FormControl.Label>
                      <Text color={"black"}>Name & Surname</Text>
                    </FormControl.Label>
                    <Input
                      value={name}
                      onChangeText={handleChange("name")}
                      onEndEditing={(e) => onTextChange("fullName", e.nativeEvent.text)}
                      onBlur={handleBlur("name")}
                      p={2}
                      placeholder="How should we call you?"
                      placeholderTextColor="gray.400"
                      _input={{ color: "black" }}
                      fontWeight={"300"}
                      fontSize={"md"}
                    />
                    <FormControl.ErrorMessage>{touched.name && errors.name}</FormControl.ErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={touched.profession && errors.profession}>
                    <FormControl.Label>
                      <Text color={"black"}>Profession</Text>
                    </FormControl.Label>
                    <Input
                      value={profession}
                      onChangeText={handleChange("profession")}
                      onEndEditing={(e) => onTextChange("profession", e.nativeEvent.text)}
                      onBlur={handleBlur("profession")}
                      p={2}
                      placeholder="Your profession"
                      placeholderTextColor="gray.400"
                      _input={{ color: "black" }}
                      fontWeight={"300"}
                      fontSize={"md"}
                    />
                    <FormControl.ErrorMessage>{touched.profession && errors.profession}</FormControl.ErrorMessage>
                  </FormControl>
                  <FormControl maxW="300">
                    <FormControl.Label fontWeight={"300"}>
                      <Text color={"black"}>Gender</Text>
                    </FormControl.Label>
                    <Select
                      selectedValue={gender}
                      minWidth="200"
                      accessibilityLabel="Choose your gender"
                      placeholder="Choose your Gender"
                      fontWeight={"300"}
                      _selectedItem={{
                        bg: "primary.100",
                        endIcon: <CheckIcon size={5} />,
                        borderRadius: "20",
                      }}
                      mt={1}
                      onValueChange={(value) => {
                        setFieldValue("gender", value);
                        onTextChange("gender", value);
                      }}
                    >
                      <Select.Item label="Male" value="Male" />
                      <Select.Item label="Female" value="Female" />
                      <Select.Item label="Other" value="Other" />
                      <Select.Item label="Prefer not to say" value="None" />
                    </Select>
                    <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                      Please make a selection!
                    </FormControl.ErrorMessage>
                  </FormControl>
                  <FormControl>
                    <FormControl.Label fontWeight={"300"}>
                      <Text color={"black"}>In which country do you reside?</Text>
                    </FormControl.Label>
                    <SelectCountry country={country} setFieldValue={setFieldValue} />
                    <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                      Please make a selection!
                    </FormControl.ErrorMessage>
                  </FormControl>
                  <HStack space={2}>
                    <FormControl width={"50%"} isInvalid={touched.weight && errors.weight}>
                      <FormControl.Label>
                        <Text color={"black"}>Weight</Text>
                      </FormControl.Label>
                      <Input
                        value={weight}
                        onChangeText={(text) => {
                          setFieldValue("weight", text);
                          onTextChange("weight", text);
                        }}
                        onBlur={handleBlur("weight")}
                        placeholder="0.0"
                        fontWeight={"300"}
                        fontSize={"md"}
                        rightElement={
                          <FormControl backgroundColor={"primary.600"} width={"50%"} p={0}>
                            <Select
                              maxWidth="100"
                              accessibilityLabel="Measurement Unit"
                              placeholder="Unit"
                              placeholderTextColor={"white"}
                              selectedValue={values.weightUnit}
                              defaultValue={values.weightUnit}
                              onValueChange={(value) => {
                                setFieldValue("weightUnit", value);
                                onTextChange("weightUnit", value);
                              }}
                              onBlur={handleBlur("weightUnit")}
                              _selectedItem={{
                                bg: "primary.100",
                                endIcon: <CheckIcon size={5} />,
                                borderRadius: "20",
                              }}
                              color={"white"}
                              borderColor={"primary.600"}
                            >
                              <Select.Item label="Kg" value="kg" />
                              <Select.Item label="Ibs" value="Ibs" />
                            </Select>
                          </FormControl>
                        }
                      />
                      <FormControl.ErrorMessage>{touched.weight && errors.weight}</FormControl.ErrorMessage>
                    </FormControl>
                    <FormControl width={"50%"} isInvalid={touched.height && errors.height}>
                      <FormControl.Label>
                        <Text color={"black"}>Height</Text>
                      </FormControl.Label>
                      <Input
                        value={height}
                        onChangeText={(value) => {
                          setFieldValue("height", value);
                          onTextChange("height", value);
                        }}
                        onBlur={handleBlur("height")}
                        placeholder="0.0"
                        fontWeight={"300"}
                        fontSize={"md"}
                        rightElement={
                          <FormControl backgroundColor={"primary.600"} width={"50%"} p={0}>
                            <Select
                              maxWidth="100"
                              accessibilityLabel="Measurement Unit"
                              placeholder="Unit"
                              placeholderTextColor={"white"}
                              selectedValue={values.heightUnit}
                              defaultValue={values.heightUnit}
                              onValueChange={(value) => {
                                setFieldValue("heightUnit", value);
                                onTextChange("heightUnit", value);
                              }}
                              onBlur={handleBlur("heightUnit")}
                              _selectedItem={{
                                bg: "primary.100",
                                endIcon: <CheckIcon size={5} />,
                                borderRadius: "20",
                              }}
                              color={"white"}
                              borderColor={"primary.600"}
                            >
                              <Select.Item label="Cm" value="cm" />
                              <Select.Item label="Feet" value="feet" />
                            </Select>
                          </FormControl>
                        }
                      />
                      <FormControl.ErrorMessage>{touched.height && errors.height}</FormControl.ErrorMessage>
                    </FormControl>
                  </HStack>
                  <DatePickerComponent doB={doB} setFieldValue={setFieldValue} handleSubmit={handleSubmit} />

                  <Button
                    size="md"
                    colorScheme="secondary"
                    background={"secondary.400"}
                    my={5}
                    onPress={!isSubmitting ? handleSubmit : null}
                  >
                    {isSubmitting ? <Spinner size="sm" color={"white"} /> : "Save"}
                  </Button>
                </>
              );
            }}
          </Formik>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

export default EditProfile;

const SelectCountry = ({ country, setFieldValue }) => {
  const { countries } = useCountries();
  const [displayValue, setDisplayValue] = useState(country);
  const validCountries = [
    "South Africa",
    "India",
    "USA",
    "UK",
    "Australia",
    "Singapore",
    "Nepal",
    "Sri Lanka ",
    "Germany",
    "Egypt",
    "Kenya",
    "Mauritius",
    "Gambia",
    "Zimbabwe ",
    "Nigeria",
  ];
  const [countriesToBeDisplayed, setCountriesToBeDisplayed] = useState(countries);

  useEffect(() => {
    let filteredCountries = countries.filter((country) => validCountries.includes(country.name));
    setCountriesToBeDisplayed(filteredCountries);
  }, []);

  const search = (text) => {
    let found = countries.find((country) => country.name.toLowerCase().includes(text.toLowerCase()));
  };
  return (
    <Select
      borderColor={"primary.100"}
      selectedValue={displayValue}
      accessibilityLabel="In which country do you reside?"
      placeholder="Choose a Country"
      fontWeight={"300"}
      _selectedItem={{
        bg: "primary.100",
        endIcon: <CheckIcon size={5} />,
        borderRadius: "20",
      }}
      mt={1}
      onValueChange={(itemValue) => {
        let cty = countriesToBeDisplayed.filter((item) => item.name == itemValue)[0];
        setDisplayValue(cty.name);
        setFieldValue("country", JSON.stringify(cty));
      }}
    >
      {countriesToBeDisplayed.map((country, index) => (
        <Select.Item
          key={Math.floor(Math.random() * 100000)}
          leftIcon={<CountryFlag key={index} isoCode={country.code} size={25} />}
          label={country.name}
          value={country.name}
        />
      ))}
    </Select>
  );
};
