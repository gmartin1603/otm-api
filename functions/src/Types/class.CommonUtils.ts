import { db } from '../helpers/firebase';
import ErrorRes from './class.ErrorRes';

export default class CommonUtils {

  async handlePromise<T>(promise: () => Promise<T>): Promise<[T | null, Error | null]> {
    try {
      const result = await promise();
      return [result, null];
    } catch (error) {
      // console.error("Error in handlePromise: \n", error);
      return [null, error];
    }
  }

  handleResponse(res, status, object): Promise<any> {
    if (status === "success") {
      return this.respondWithSuccess(res, object);
    } else {
      return this.respondWithError(res, status, object);
    }
  }

  respondWithSuccess(res, object) {
    return res.status(200).json(object);
  }

  async respondWithError(res, status, error) {
    // console.error("Error response: ", error);
    const errorResponse = new ErrorRes(error);
    
    const responseObj = errorResponse.responseObj();
    // console.log("errorResponse: ", responseObj);
    await this.writeLog("error", responseObj); // writeLog is not a function
    let res_status = Number(status) ? status : 400;
    return res.status(res_status).json(responseObj);
  }

  async writeLog(type: string, obj) {
    obj["timestamp"] = new Date();
    const logKey = `${obj.timestamp.toLocaleDateString()}-${obj.timestamp.toLocaleTimeString()}`;
    
    const write_log_api = () => db.collection("logs").doc(type).set({[logKey]: obj}, { merge: true });
    const [_, err] = await this.handlePromise(write_log_api);
    if (err) {
      console.error("Error writing to log:", err);
      throw err;
    } else {
      // console.log("Successfully wrote to log");
      return true;
    }
  }

}

export const commonServiceInstance = new CommonUtils();