import React, { useState, useContext, useRef, useEffect } from "react";
import { GoogleIcon, FacebookIcon } from "../../Components/customSvgIcon";
import AuthContext from "../../hooks/context";
import { MaterialIcons } from "@expo/vector-icons";

import { StyleSheet, View, SafeAreaView, Animated } from "react-native";
import { googleSignIn, resetPassword } from "../../services/auth";
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

function ForgotPassword({ navigation }) {
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
    resetPassword(data.email).then((res) => {
      formikActions.setSubmitting(false);
      setFeedback(res);
      toast.show({
        placement: "top",
        render: () => (
          <ToastComponent
            state={res === "Success" ? "Success" : "Error"}
            message={res === "Success" ? "Follow the link sent to your email to reset password!" : res}
          />
        ),
      });
      navigation.navigate("Login");
    });
  };

  // Object for error handling
  const validationSchema = Yup.object({
    email: Yup.string().trim().email("Invalid email").required("Required"),
  });

  useEffect(() => {
    Animated.timing(popInAnimation, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
    // fix memory leak
    return () => {
      popInAnimation.stopAnimation();
    };
  }, []);

  return (
    <ScrollView border="2" bg={"primary.50"} safeAreaTop pt={10}>
      <Center mt={20} mb={10}>
        <Heading style={{ fontFamily: "Poppins-Medium" }} fontSize={"2xl"} fontStyle="italic" color={"darkText"}>
          Reset your password!
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
              const { email } = values;
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

                  <Center>
                    <Button
                      shadow={3}
                      width="60%"
                      colorScheme="secondary"
                      my={5}
                      onPress={!isSubmitting ? handleSubmit : null}
                    >
                      {isSubmitting ? <Spinner size="sm" color={"white"} /> : "Reset"}
                    </Button>
                  </Center>

                  <Center textAlign={"right"} alignItems={"flex-end"}>
                    <Button
                      width={"100%"}
                      px={0}
                      textAlign={"right"}
                      variant={"link"}
                      colorScheme="secondary"
                      onPress={() => {
                        navigation.navigate("Login");
                      }}
                    >
                      Already have an account?
                    </Button>
                  </Center>

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
    </ScrollView>
  );
}

export default React.memo(ForgotPassword);
