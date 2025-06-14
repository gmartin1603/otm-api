
// import postingsService from "../services/postings-service";
import { handlePromise, handleResponse } from "../services/common-service";
import { Request, Response } from "express";

async function RequestHandler(req: Request, res: Response, service: any) {
  const serviceName = service.getName ? service.getName() : "unknown-service";
  // Get the service method name from the request URL
  const methodName = req.params[0].replace("/", "") || "";

  const service_api = () => service[methodName](req.body);
  const [result, error] = await handlePromise(service_api);
  let response = {};

  if (error) {
    // console.error("Error calling postingsService method:", error);
    response = { error: error, controller: serviceName, method: methodName };

    handleResponse(res, "error", response);
  } else {
    console.log(`Successfully called ${serviceName} => ${methodName}`);
    response = {
      status: "success",
      message: `Successfully called ${serviceName} => ${methodName}`,
      data: result,
      service: {
        library: serviceName,
        method: methodName,
      },
      request: {
        httpVersion: req.httpVersion,
        method: req.method,
        url: req.url,
        params: req.params,
        headers: JSON.stringify(req.headers),
        query: req.query,
        body: JSON.stringify(req.body),
      }
    };

    handleResponse(res, "success", response);
  }

};

export default RequestHandler;
