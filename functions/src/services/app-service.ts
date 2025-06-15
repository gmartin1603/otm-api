import { Service } from "../Types/type.Service";
import { handlePromise } from "./common-service";

require("dotenv").config();
// const { handlePromise, handleResponse, writeLog } = require("./common-service");
// const { getAuth } = require("firebase-admin/auth");
// const { db, admin } = require("../helpers/firebase");
const API_VERSION = require("../helpers/constants").API_VERSION;

const appService: Service = {
  name: "appService",

  getVersion: async () => {
    return Promise.resolve({ version: API_VERSION });
  },

  sendPasswordResetEmail: async (email, link) => {
    // console.log("Sending password reset email to: ", email);
    const send_password_reset_email_api = () => {
      // Send email here
    }
    const [_, error] = await handlePromise(send_password_reset_email_api);
    if (error) {
      console.error("Error sending password reset email:", error);
      throw error;
    } else {
      // console.log("Successfully sent password reset email");
      return true;
    }
  },
  
};

export default appService;
