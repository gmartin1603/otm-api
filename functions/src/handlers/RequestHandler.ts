import { handlePromise, handleResponse } from "../services/common-service";
import { Request, Response } from "express";
import { Service } from "../Types/type.Service";
import { SuccessResponse } from "../Types/types.http";

async function RequestHandler(req: Request, res: Response, service: Service) {
  const serviceName = service.name || "unknown-service";
  // Get the service method name from the request URL
  const methodName = req.params[0].replace("/", "") || "";

  const service_api = () => service[methodName](req.body);
  const [result, error] = await handlePromise(service_api);
  let response: SuccessResponse<typeof result>;

  if (error) 
    return handleResponse(res, "error", { error: error, controller: serviceName, method: methodName });


  console.log(`Successfully called ${serviceName} => ${methodName}`);
  
  response = {
    success: true,
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

  return handleResponse(res, "success", response);
};

export default RequestHandler;
