import React, { useState, useContext, useRef, useEffect } from "react";
import { GoogleIcon, FacebookIcon } from "../../Components/customSvgIcon";
import AuthContext from "../../hooks/context";
import { MaterialIcons } from "@expo/vector-icons";

import { StyleSheet, View, SafeAreaView, Animated } from "react-native";
import { googleSignIn } from "../../services/auth";
import {
  Box,
  Center,
  FormControl,
  Heading,
  Input,
  ScrollView,
  useToast,
  Button,
  Divider,
  Text,
  Icon,
  Pressable,
  Row,
  useTheme,
  Checkbox,
  Spinner,
  VStack,
} from "native-base";
import { Formik } from "formik";
import * as Yup from "yup";
import ToastComponent from "../../services/CustomToast";

function Login({ navigation }) {
  console.log("Rendering login");
  //Animations
  const popInAnimation = useRef(new Animated.Value(500)).current;

  const { signIn } = React.useContext(AuthContext);

  // UI utilities
  const [show, setShow] = useState(true);
  const { colors } = useTheme();
  const [feedback, setFeedback] = useState(null);
  const toast = useToast();

  //form states
  const initialValues = {
    email: "",
    password: "",
  };

  const handleCheckboxPress = () => {
    setChecked((prev) => {
      return !prev;
    });
  };

  const handleSubmit = (data, formikActions) => {
    signIn({
      ...data,
      stayLoggedIn: true,
    }).then((res) => {
      formikActions.setSubmitting(false);
      setFeedback(res);
      toast.show({
        placement: "top",
        render: () => (
          <ToastComponent
            state={res === "Success" ? "Success" : "Error"}
            message={res === "Success" ? "Logged in Successfully" : res}
          />
        ),
      });
    });
  };

  // Object for error handling
  const validationSchema = Yup.object({
    email: Yup.string().trim().email("Invalid email").required("Required"),
    password: Yup.string().trim().min(6, "Must be at least 6 characters").required("Required"),
  });

  useEffect(() => {
    console.log("Calling login use effect");
    Animated.timing(popInAnimation, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
    // fix memory leak
    console.log("Login use effect called");
    return () => {
      popInAnimation.stopAnimation();
    };
  }, []);

  return (
    <ScrollView border="2" bg={"primary.50"} safeAreaTop pt={10}>
      {console.log("Rendering login")}
      <Center mt={20} mb={10}>
        <Heading style={{ fontFamily: "Poppins-Medium" }} fontSize={"2xl"} fontStyle="italic" color={"darkText"}>
          Login to your account
        </Heading>
      </Center>
      <Animated.View style={{ transform: [{ translateY: popInAnimation }] }}>
        <Box mx="5" bg="white" p="4" rounded="lg">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={(values, formikActions) => {
              handleSubmit(values, formikActions);
            }}
          >
            {({ handleChange, handleBlur, handleSubmit, values, touched, errors, isSubmitting }) => {
              const { email, password } = values;
              return (
                <>
                  <FormControl isRequired isInvalid={touched.email && errors.email}>
                    <FormControl.Label>
                      <Text color={"black"} style={{ fontFamily: "Poppins-Regular" }}>
                        Email
                      </Text>
                    </FormControl.Label>
                    <Input
                      value={email}
                      onChangeText={handleChange("email")}
                      onBlur={handleBlur("email")}
                      p={2}
                      placeholder="example@gmail.com"
                      placeholderTextColor="gray.400"
                      _input={{ color: "black" }}
                      style={{ fontFamily: "Poppins-Regular" }}
                      fontSize={"md"}
                    />
                    <FormControl.ErrorMessage>{touched.email && errors.email}</FormControl.ErrorMessage>
                  </FormControl>
                  <FormControl isRequired isInvalid={touched.password && errors.password}>
                    <FormControl.Label>
                      <Text color={"black"} style={{ fontFamily: "Poppins-Regular" }}>
                        Password
                      </Text>
                    </FormControl.Label>
                    <Input
                      value={password}
                      onChangeText={handleChange("password")}
                      onBlur={handleBlur("password")}
                      secureTextEntry={show}
                      p={2}
                      placeholder="password"
                      placeholderTextColor="gray.400"
                      _input={{ color: "black" }}
                      style={{ fontFamily: "Poppins-Regular" }}
                      fontSize={"md"}
                      InputRightElement={
                        <Icon
                          as={<MaterialIcons name={show ? "visibility" : "visibility-off"} />}
                          size={5}
                          mr="2"
                          color="muted.400"
                          onPress={() => setShow(!show)}
                        />
                      }
                    />
                    <FormControl.ErrorMessage>{touched.password && errors.password}</FormControl.ErrorMessage>
                  </FormControl>

                  {/* <Pressable onPress={handleCheckboxPress} w="40%" my={2} display="flex">
                    <Row alignItems={"center"}>
                      <Center w={5} h={5} m={1}>
                        <Checkbox value={checked} onValueChange={handleCheckboxPress} />
                      </Center>

                      <Text color={"black"} style={{ fontFamily: "Poppins-Regular" }}>
                        Remember Me
                      </Text>
                    </Row>
                  </Pressable> */}

                  <Center>
                    <Button
                      shadow={3}
                      width="60%"
                      colorScheme="secondary"
                      my={5}
                      onPress={!isSubmitting ? handleSubmit : null}
                    >
                      {isSubmitting ? <Spinner size="sm" color={"white"} /> : "LOGIN"}
                    </Button>
                  </Center>

                  <Center textAlign={"right"} alignItems={"flex-end"}>
                    <Button
                      width={"50%"}
                      px={0}
                      textAlign={"right"}
                      variant={"link"}
                      colorScheme="secondary"
                      onPress={() => {
                        navigation.navigate("ForgotPassword");
                      }}
                    >
                      Forgot Password
                    </Button>
                  </Center>

                  <Divider my={7} bg="gray.500" />
                  <Row space="md" justifyContent={"center"} alignItems="center">
                    <Pressable
                      onPress={() => {
                        googleSignIn();
                      }}
                    >
                      <GoogleIcon width="70" />
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        //Login code
                      }}
                    >
                      <FacebookIcon width="70" />
                    </Pressable>
                  </Row>

                  <Row space="2" justifyContent={"center"} alignItems="center">
                    <Text style={{ fontFamily: "Poppins-SemiBold" }}>Don't have an account ?</Text>

                    <Button
                      variant={"link"}
                      colorScheme="secondary"
                      onPress={() => {
                        navigation.navigate("Register");
                      }}
                    >
                      Register
                    </Button>
                  </Row>
                </>
              );
            }}
          </Formik>
        </Box>
      </Animated.View>
      {console.log("Login rendered")}
    </ScrollView>
  );
}

export default React.memo(Login);
