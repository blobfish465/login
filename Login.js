import axios from "axios";
import FormTextInput from "components/Form/TextInput";
import Navbar from "components/Navbar/Navbar";
import { useNavigate, useLocation } from "react-router-dom";
import { withRouter } from "utils/helpers";
import * as Realm from "realm-web";
import Footer from "components/Footer/Footer";
import NavbarLogin from "components/Navbar/NavbarLogin";
import { AuthContext } from "contexts/AuthContext";
import sageLogo from "images/logo.png";
import { FirebaseContext } from "services/firebase";
import mongoDB from "services/mongoDB";import NavBar from "components/Navbar/Navbar";
import Disclaimer from "components/Disclaimer/Disclaimer";
import TelegramButton from "components/UI/Button/TelegramButton";
import TelegramPopUp from "components/Login/TelegramPopup";
import { Form, Formik } from "formik";
import { useIsMobile } from "utils/hooks";
import * as Yup from "yup";
import React, { useContext, useEffect, useState } from "react";

const Login = () => {
  let location = useLocation();
  let navigate = useNavigate();
  const firebase = useContext(FirebaseContext);
  const { state, dispatch } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [telegram, setTelegram] = useState("");
  const [otp, setOtp] = useState("");
  const isInvalid = email === "" || pass === "";
  const [newUser, isNewUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    async function verifyUser() {
      const urlParamToken = new URLSearchParams(location.search).get("token");
      const urlParamTokenID = new URLSearchParams(location.search).get(
        "tokenId"
      );

      if (urlParamTokenID === null || urlParamToken === null) {
        // Here to login
      } else {
        // Else Here to be verified
        try {
          isNewUser(true);

          const confirmUser = await mongoDB.emailPasswordAuth.confirmUser(
            urlParamToken,
            urlParamTokenID
          );
          // Successful confirmation of email BUT need to relogin (due to MongoDB user flow)
          alert("Log in to verify your account and create a profile!");
        } catch (e) {
          // Unsuccessful confirmation
          alert("Log in to verify your account and create a profile!");
        }
      }
    }
    verifyUser();
  }, []);

  const handleLogin = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      const credentials = Realm.Credentials.emailPassword(email, pass);
      const login = await mongoDB.logIn(credentials);
      // TODO: Relace newUser with "If some fields are not filled up, go to new-profile"
      if (newUser) {
        // Need check if user has already created profile (clicked link again)
        navigate("/new-profile");
      } else {
        navigate("/sages");
      }
    } catch (e) {
      alert("Server error: " + e);
    }
    setLoading(false);
  };

  const handleTelegramLogin = async (e) => {
    e.preventDefault();
    //Z4n1rCf9IUd85GSVXtz7eohLKlQ23kEz
    // exports = async function(loginPayload) {
    //   // Get a handle for the app.users collection
    //   const users = context.services
    //     .get("mongodb-atlas")
    //     .db("app")
    //     .collection("users");
    //   // Parse out custom data from the FunctionCredential
    //   const { username } = loginPayload;
    //   // Query for an existing user document with the specified username
    //   const user = await users.findOne({ username });
    //   if (user) {
    //     // If the user document exists, return its unique ID
    //     return user._id.toString();
    //   } else {
    //     // If the user document does not exist, create it and then return its unique ID
    //     const result = await users.insertOne({ username });
    //     return result.insertedId.toString();
    //   }
    // };
    //  exports = async function(loginPayload) {
    //       // Get a handle for the app.users collection
    //       const users = context.services
    //           .get("mongodb-atlas")
    //           .db("sage_development")
    //           .collection("all_profiles");
    //       // Parse out custom data from the FunctionCredential
    //       const { username } = loginPayload;
    //       // Query for an existing user document with the specified username
    //       const user = await users.findOne({ username });
    //       if (user) {
    //         // If the user document exists, return its unique ID
    //         return {"id":user._id.toString(), "name" : user.name.toString() }
    //       } else {
    //         throw "error";585066956
    //       }
    //     };
    async function getOTP(payload) {
      try {
        await axios.post(
          "https://ap-southeast-1.aws.webhooks.mongodb-realm.com/api/client/v2.0/app/sage_production-brobd/service/telegram_login/incoming_webhook/telegram",
          payload
        );
        alert("An OTP has been sent to your Telegram!");
      } catch (err) {
        alert("Please register with Sage first!");
        console.log(err);
      }
    }

    await getOTP({ username: telegram.toLowerCase() });
  };

  const handleTelegramOTP = async (e) => {
    e.preventDefault();
    async function loginMongoDB(payload) {
      // Create a Custom Function credential
      const credentials = Realm.Credentials.function(payload);
      try {
        // Authenticate the user
        const user = await mongoDB.logIn(credentials);
        // `App.currentUser` updates to match the logged in user
        // mongoDB.currentUser.id
        // Generate OTP
        console.log("Logged in");
        navigate("/sages");
        return user;
      } catch (err) {
        // Handle failed log in
        alert("Invalid OTP!");
        console.error("Failed to log in", err);
      }
    }
    // await loginMongoDB({ username: telegram.toLowerCase() , OTP : otp})
    await loginMongoDB({ username: "tianr", OTP: otp });
  };
  const [isOpen, setIsOpen] = useState(false);
  const closePopup = () => {
    setIsOpen(false);
  };
  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  const isMobile = useIsMobile();

  return (
    <>
      {isMobile ? <Navbar /> : <NavbarLogin />}
      <section className="flex flex-col items-center px-0 bg-brand-dark-grey width-full">
        <div className="py-6 px-12 md:px-16 border-t-1 border-brandgrey relative bg-white">
          <div
            className={`px-24 left-0 absolute z-10 ${
              isMobile ? "invisible" : ""
            }`}
          >
            <img alt="Company logo" className="opacity-10" src={sageLogo}></img>
          </div>
          <div className="z-20 relative">
            <h1 className="text-4xl font-bold text-center mb-2">Log In</h1>
            <p className="text-center mb-4 text-brand-text-dark">
              Don't have an account?{" "}
              <a className="text-brand-text-blue underline" href={"/signup"}>
                Sign up
              </a>{" "}
            </p>
            <TelegramButton onClick={togglePopup}></TelegramButton>
            <TelegramPopUp
              show={isOpen}
              handleClose={closePopup}
            ></TelegramPopUp>
            {/*<LinkedInButton></LinkedInButton>*/}
            {/*<SingpassButton></SingpassButton>*/}
            <div className="flex flex-row justify-center items-center">
              <div className="w-full border-t-1 border-black my-4"></div>
              <p className="mx-2 my-2 font-bold text-xl">OR</p>
              <div className="w-full border-t-1 border-black my-4"></div>
            </div>
            <Formik
              initialValues={{
                email: "",
                password: "",
              }}
              validationSchema={Yup.object({
                email: Yup.string()
                  .email("Invalid email address")
                  .required("Required"),
                password: Yup.string()
                  .required("Required")
                  .min(8, "Must be at least 8 characters long"),
              })}
              onSubmit={async (values) => {
                setLoading(true);
                handleLogin({
                  email: values.email,
                  pasword: values.password,
                });
                setLoading(false);
              }}
            > 
              <Form className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-8">
                <FormTextInput
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="abc@gmail.com"
                />
                <FormTextInput
                  label="Password"
                  name="password"
                  type="password"
                  onClickHandler={toggleShowPassword}
                  isVisible={showPassword}
                />              
                <div className="lg:col-span-2 text-center mt-4">
                  <button
                    className="py-2 px-6 rounded-full bg-brand-green text-white text-xl hover:opacity-75"
                    type="submit"
                    disabled={isInvalid}
                  >
                    {loading ? "Logging in...." : "Log In"}
                  </button>
                </div>             
                {state && state.error && (
                <p className="text-center font-bold text-sm text-red-600 mt-4">
                  {state.error}
                </p>
                )}
              </Form>
            </Formik>
            <Disclaimer></Disclaimer>
          </div>
        </div>
      </section>
      <Footer></Footer>
    </>
  )
};

export default withRouter(Login);