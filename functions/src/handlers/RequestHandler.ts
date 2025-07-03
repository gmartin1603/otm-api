import { Request, Response } from "express";
import { Service } from "../Types/type.Service";
import { SuccessResponse } from "../Types/types.http";
import CommonUtils from "../Types/class.CommonUtils";
import bodyParser from "body-parser";

const _commonUtils = new CommonUtils();

async function activityLogger(req: Request, message: string) {
  try {
    await _commonUtils.writeLog("activity", {
      message: message,
      headers: req.headers,
      body: req.body,
    });
  } catch (error) {
    console.error("Activity logging failed:", error);
  }
};

// To enable mongoContext, uncomment and add it to the middleware chain
// import { connectToMongoDB } from "./helpers/mongo";
// const mongoContext = (req: Request, res: Response, next: () => any) => {
//   connectToMongoDB((error) => {
//     if (error) {
//       console.error("Failed to connect to MongoDB", error);
//       return res.status(500).json({ error: "Failed to connect to MongoDB" });
//     }
//     next();
//   });
// };

function applyMiddleware(handler: (req: Request, res: Response) => any) {
  return (req: Request, res: Response) => {
    // return corsHandler(req, res, () => {
      // console.log("CORS Handler added");
      return bodyParser.json()(req, res, () => {
        // To enable mongoContext, add: mongoContext(req, res, () => { ... })
        // return activityLogger(req, res, () => {
        // });
        return handler(req, res);
      });
    // });
  };
};

async function RequestHandler(req: Request, res: Response, service: Service) {
  const serviceName = service.name;
  // Get the service method name from the request URL
  const methodName = req.params[0].replace("/", "") || "";

  const wrappedHandler = applyMiddleware(async (req: Request, res: Response) => {
    try {
      // Log the activity
      await activityLogger(req, `API call made to ${serviceName} => ${methodName}`);

      const service_api = () => service[methodName](req.body);
      const [result, error] = await _commonUtils.handlePromise(service_api);
      
      let response: SuccessResponse<typeof result>;
      
      if (error) 
        return _commonUtils.handleResponse(res, "error", { error: error, controller: serviceName, method: methodName });
      
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
      
      return _commonUtils.handleResponse(res, "success", response);
    } catch (error) {
      // console.error("RequestHandler error:", error);
      return _commonUtils.handleResponse(res, "error", { error: error, controller: serviceName, method: methodName });
    }
  });

  // Execute the wrapped handler
  wrappedHandler(req, res);
};

export default RequestHandler;
