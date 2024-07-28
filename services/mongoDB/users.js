import * as SecureStore from "expo-secure-store";
import mime from "mime";
import { Platform } from "react-native";
// mangoDB backend code url
import { BASE_URL } from "../../config";
const platform = Platform.OS;
// current logged user token

// create new user using firebase token
export const mongoCreateUser = async (data, userToken) => {
  // let userToken = await SecureStore.getItemAsync("userToken");
  var formdata = new FormData();
  formdata.append("userToken", userToken);
  formdata.append("fullName", data.name);
  formdata.append("email", data.email);
  formdata.append("phoneNumber", data.cell);
  formdata.append("dateOfBirth", data.doB);
  formdata.append("gender", data.gender);

  var requestOptions = {
    method: "POST",
    body: formdata,
    redirect: "follow",
  };

  fetch(`${BASE_URL}/createUser`, requestOptions)
    .then((response) => response.text())
    .then((result) => console.log("user successfully created (MangoDB): ", result))
    .catch((error) => console.log("error creating user mangoDB: ", error));
};

// update user information
export const updateUser = async (fields) => {
  let token = await SecureStore.getItemAsync("userToken");
  var formdata = new FormData();

  console.log("TOKEN:", token);
  console.log("FIELDS: ", fields);
  for (let field in fields) {
    formdata.append(field, fields[field]);
  }

  var requestOptions = {
    method: "POST",
    body: formdata,
    redirect: "follow",
  };

  await fetch(`${BASE_URL}/updateUser?userToken=` + token, requestOptions)
    .then((response) => response.text())
    .then((result) => console.log("SUccesssfully updated user: " + result))
    .catch((error) => console.log("error updating user: ", error));
};

// Get user data when logged in
export const getUser = async () => {
  var requestOptions = {
    method: "POST",
    redirect: "follow",
  };
  let token = await SecureStore.getItemAsync("userToken");
  console.log("Getting user with token: " + token);
  return fetch(`${BASE_URL}/getUser?userToken=${token}`, requestOptions)
    .then((response) => response.json())
    .then((result) => result.data)
    .catch((error) => console.log("Error signing in user: ", error));
};

//please pass the current water value as glass
export const drinkWater = async (glass) => {
  let token = await SecureStore.getItemAsync("userToken");
  var requestOptions = {
    method: "POST",
    redirect: "follow",
  };

  fetch(`${BASE_URL}/drinkWater?userToken=${token}&glass=${glass}`, requestOptions)
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.log("error", error));
};

export const getWater = async (setWater, water) => {
  let token = await SecureStore.getItemAsync("userToken");
  var requestOptions = {
    method: "POST",
    redirect: "follow",
  };

  fetch(`${BASE_URL}/getWater?userToken=${token}`, requestOptions)
    .then((response) => response.json())
    .then((result) => {
      if (result.success) {
        console.log("GET WATER RESULT: ", JSON.stringify(result));
        setWater({
          ...water,
          current: result.data.water,
        });
      } else {
        setWater({
          ...water,
          current: 0,
        });
      }
    })
    .catch((error) => {
      console.log("error", error);
      setWater({
        ...water,
        current: 0,
      });
    });
};

// pass the image data you get from image picker, exif must be set to true on the image picker
export const uploadAvatar = async (image) => {
  console.log("[UPLOADING URI]:", image);
  var formdata = new FormData();
  var token = await SecureStore.getItemAsync("userToken");
  formdata.append("userToken", token);
  formdata.append("avatar", {
    // original data to pass
    uri: image.uri,
    name: image.uri.split("/").pop(),
    type: platform === "android" ? mime.getType(image.uri) : "jpeg",
    // customize data for FAFH backend
    filepath: image.uri,
    originalFilename: image.uri.split("/").pop(),
  });

  var requestOptions = {
    method: "POST",
    body: formdata,
    redirect: "follow",
  };

  fetch(`${BASE_URL}/updateAvatar`, requestOptions)
    .then((response) => response.text())
    .then((result) => console.log("RESULT FROM UPLOADING AVATAR:", result))
    .catch((error) => console.log("error", error));
};
export const reportBug = async (data) => {
  const { title, comment, screenshots } = data;
  let userId = await SecureStore.getItemAsync("userToken");
  var formdata = new FormData();
  formdata.append("userId", userId);
  formdata.append("title", title);
  formdata.append("message", comment);
  if (screenshots.length > 0) {
    c = 1;
    for (var screenshot of screenshots) {
      formdata.append(`picture_${c}`, {
        // original data to pass
        uri: screenshot.uri,
        name: screenshot.uri.split("/").pop(),
        type: platform === "android" ? mime.getType(screenshot.uri) : "jpeg",
        // customize data for FAFH backend
        filepath: screenshot.uri,
        originalFilename: screenshot.uri.split("/").pop(),
      });
      c++;
    }
  }

  var requestOptions = {
    method: "POST",
    body: formdata,
    redirect: "follow",
  };

  fetch(`${BASE_URL}/reportBug`, requestOptions)
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.log("error", error));
};

export const getDailyQoute = async (setDailyQoute) => {
  fetch("https://type.fit/api/quotes")
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var random = Math.floor(Math.random() * data.length);
      setDailyQoute(data[random]);
    });
};
