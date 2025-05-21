/**
  * Controller for the postings cloud function
  * @module postings-controller
  * @requires module:postings-service
  * @requires module:common-service
  * @description This module provides the controller for the postings cloud function API endpoints
  * @description postings-controller handles execution of /postings endpoints by calling the appropriate service method
  * @exports postingsController
  */
import postingsService from "../services/postings-service";
import { handlePromise, handleResponse } from "../services/common-service";

const postingsController = async (req: any, res: any) => {
  // Get the postingsService method name from the last route of the request URL
  const method = req.url.split("/").pop();

  const postings_controller_api = () => postingsService[method](req.body);
  const [result, error] = await handlePromise(postings_controller_api);
  let response = {};

  if (error) {
    // console.error("Error calling postingsService method:", error);
    response = { error: error, controller: "postings-controller", method: method };

    handleResponse(res, "error", response);
  } else {
    console.log("Successfully called postingsService method:", method);
    response = {
      status: "success",
      message: "Successfully called postingsService method",
      data: result,
      method: `postings-controller => ${method}`
    };

    handleResponse(res, "success", response);
  }

};

export default postingsController;
