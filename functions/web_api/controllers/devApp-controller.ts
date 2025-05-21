/**
  * Controller for the devApp cloud function
  * @module devApp-controller
  * @requires module:devApp-service
  * @requires module:common-service
  * @description This module provides the controller for the devApp cloud function API endpoints
  * @description devApp-controller handles execution of /devApp endpoints by calling the appropriate service method
  * @exports devAppController
  */
import devAppService from "../services/devApp-service";
import { handlePromise, handleResponse } from "../services/common-service";

const devAppController = async (req: any, res: any) => {
  // Get the devAppService method name from the last route of the request URL
  const method = req.url.split("/").pop();

  const devApp_controller_api = () => devAppService[method](req.body);
  const [result, error] = await handlePromise(devApp_controller_api);
  let response = {};

  if (error) {
    // console.error("Error calling devAppService method:", error);
    response = { error: error, controller: "devApp-controller", method: method };
    handleResponse(res, "error", response);
  } else {
    console.log("Successfully called devAppService method:", method);
    response = {
      status: "success",
      message: "Successfully called devAppService",
      data: result,
      method: `devApp-controller => ${method}`
    };

    handleResponse(res, "success", response);
  }

};

export default devAppController;
