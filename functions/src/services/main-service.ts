import { Service } from "../Types/type.Service";
import CommonUtils from "../Types/class.CommonUtils";
import { db } from "../helpers/firebase";


const _commonUtils = new CommonUtils();
require("dotenv").config();
const API_VERSION = require("../helpers/constants").API_VERSION;

const mainService: Service = {
  name: "mainService",

  getVersion: async () => {
    return Promise.resolve({ version: API_VERSION });
  },

  sendPasswordResetEmail: async (email, link) => {
    // console.log("Sending password reset email to: ", email);
    const send_password_reset_email_api = () => {
      // Send email here
      return Promise.reject(new Error("This function is not implemented yet."));
    }
    const [_, error] = await _commonUtils.handlePromise(send_password_reset_email_api);
    if (error) {
      console.error("Error sending password reset email:", error);
      throw error;
    } else {
      // console.log("Successfully sent password reset email");
      return true;
    }
  },

  getRota: async ({dept}) => {
    if (!dept) {
      throw new Error("Department must be provided");
    }
    const get_rota_api = () => db.collection(dept).doc("rota").get();
    const [data, error] = await _commonUtils.handlePromise(get_rota_api);
    if (error) {
      throw error;
    }
    if (!data.exists) {
      throw new Error(`Rota for department ${dept} does not exist`);
    }
    return data.data();
  },

  editRota: async ({dept, changes}) => {
    throw new Error("This function is not implemented yet.");
  },

};

export default mainService;
