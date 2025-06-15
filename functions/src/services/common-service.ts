import Success from '../models/response/success';
import { db } from '../helpers/firebase';
import { Service } from '../Types/type.Service';
import ErrorRes from '../Types/class.ErrorRes';

export const commonService: Service = {
  name: "commonService",

  handlePromise: async (promise) => {
    try {
      const result = await promise();
      return [result, null];
    } catch (error) {
      // console.error("Error in handlePromise: \n", error);
      return [null, error];
    }
  },

  handleResponse: (res, status, object) => {
    if (status === "success") {
      return commonService.handleSuccess(res, object);
    } else {
      return commonService.handleError(res, status, object);
    }
  },

  handleSuccess: (res, object) => {
    return res.status(200).json(object);
  },

  handleError: async (res, status, error) => {
    // console.error("Error response: ", error);
    const errorResponse = new ErrorRes(error);
    
    const responseObj = errorResponse.responseObj();
    // console.log("errorResponse: ", responseObj);
    await commonService.writeLog("error", responseObj); // writeLog is not a function
    let res_status = Number(status) ? status : 400;
    return res.status(res_status).json(responseObj);
  },

  sendPasswordResetEmail: async (email, link) => {
    // console.log("Sending password reset email to: ", email);
    const send_password_reset_email_api = () => {
      // Send email here
    }
    const [_, error] = await commonService.handlePromise(send_password_reset_email_api);
    if (error) {
      console.error("Error sending password reset email:", error);
      throw error;
    } else {
      // console.log("Successfully sent password reset email");
      return true;
    }
  },

  writeLog: async (type, obj) => {
    const get_logs_api = () => db.collection("logs").doc(type).get();
    const [doc, error] = await commonService.handlePromise(get_logs_api);
    if (error) {
      console.error("Error fetching logs:", error);
      throw error;
    } else {
      let logs = [];
      if (doc.exists) {
        logs = doc.data().logs;
      }
      obj["timestamp"] = new Date();
      logs.push(obj);
      // console.log("Writing to log: ", obj);
      const write_log_api = () => db.collection("logs").doc(type).set({logs: logs}, { merge: true });
      const [_, err] = await commonService.handlePromise(write_log_api);
      if (err) {
        console.error("Error writing to log:", err);
        throw err;
      } else {
        // console.log("Successfully wrote to log");
        return true;
      }
    }
  },

}

export const { handlePromise, validateModel, handleResponse, handleSuccess, handleError, writeLog } = commonService;