// import * as functions from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https";
import express, { Request, Response } from "express";
// import { connectToMongoDB } from "./helpers/mongo";
import RequestHandler from "./handlers/RequestHandler";
import postingsService from "./services/postings-service";
import jobsService from "./services/jobs-service";
import userService from "./services/user-service";
import devAppService from "./services/devApp-service";
import appService from "./services/app-service";


const dotenv = require("dotenv");
dotenv.config();

// let env: string;
// let corsOrigin = "*";
// if (process.env.NODE_ENV == "prod") {
//   env = "prod";
//   // corsOrigin = process.env.NODE_ENV_CORS_URL || "*";
// } else {
//   env = "dev";
// }

// console.log("CURRENT ENV: ", env);
// const corsHandler = cors({ origin: true });

// const activityLogger = async (req: Request, res: Response, next: () => any) => {
//   try {
//     const method = req.params[0] || "unknown";
//     await _commonUtils.writeLog("activity", {
//       message: `API call made to method: ${method}`,
//       headers: req.headers,
//       body: req.body,
//     });
//     return next();
//   } catch (error) {
//     console.error("Activity logging failed:", error);
//     return next(); // Continue even if logging fails
//   }
// };

// // To enable mongoContext, uncomment and add it to the middleware chain
// // import { connectToMongoDB } from "./helpers/mongo";
// // const mongoContext = (req: Request, res: Response, next: () => any) => {
// //   connectToMongoDB((error) => {
// //     if (error) {
// //       console.error("Failed to connect to MongoDB", error);
// //       return res.status(500).json({ error: "Failed to connect to MongoDB" });
// //     }
// //     next();
// //   });
// // };

// function applyMiddleware(handler: (req: Request, res: Response) => any) {
//   return (req: Request, res: Response) => {
//     // return corsHandler(req, res, () => {
//       // console.log("CORS Handler added");
//       return bodyParser.json()(req, res, () => {
//         // To enable mongoContext, add: mongoContext(req, res, () => { ... })
//         return activityLogger(req, res, () => {
//           return handler(req, res);
//         });
//       });
//     // });
//   };
// };


// const applyMiddleware = (handler: (req: Request, res: Response) => any) => (req, res) => {
// 	return corsHandler(req, res, (_) => {
//     console.log("CORS Handler added");
// 		return bodyParser.json()(req, res, () => {
//       // console.log("Adding MongoDB Middleware");
// 			// connectToMongoDB((error) => {
// 			// 	if (error) {
// 			// 		console.error("Failed to connect to MongoDB", error);
// 			// 		// return res.status(500).json({ error: "Failed to connect to MongoDB" });
// 			// 	}
//       const method = req.params[0] || "unknown";
//       _commonUtils.writeLog("activity", {
//         message: `API call made to method: ${method}`,
//         headers: req.headers,
//         body: req.body,
//       }).then(() => {
//         return handler(req, res);
//       });
// 			// });
// 		});
// 	});
// };

// **SCRIPT** CONTROLLER ROUTING START

const postingsApp = express();
postingsApp.post("*", (req: Request, res: Response) => RequestHandler(req, res, postingsService));
export const postings = onRequest({ cors: true }, postingsApp);
// export const postings = functions.https.onRequest(applyMiddleware(postingsApp));


const mainApp = express();
mainApp.post("*", (req: Request, res: Response) => RequestHandler(req, res, appService));
export const main = onRequest({ cors: true }, mainApp);
// export const app = functions.https.onRequest(applyMiddleware(mainApp));

const jobsApp = express();
jobsApp.post("*", (req: Request, res: Response) => RequestHandler(req, res, jobsService));
export const jobs = onRequest({ cors: true }, jobsApp);
// export const jobs = functions.https.onRequest(applyMiddleware(jobsApp));

const userApp = express();
userApp.post("*", (req: Request, res: Response) => RequestHandler(req, res, userService));
export const user = onRequest({ cors: true }, userApp);
// export const user = functions.https.onRequest(applyMiddleware(userApp));

const devAppExpress = express();
devAppExpress.post("*", (req: Request, res: Response) => RequestHandler(req, res, devAppService));
export const devApp = onRequest({ cors: true }, devAppExpress);
// export const devApp = functions.https.onRequest(applyMiddleware(devAppExpress));

// **SCRIPT** CONTROLLER ROUTING END

/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const { onRequest } = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
// 	logger.info("Hello logs!", { structuredData: true });
// 	response.send("Hello from Firebase!");
// });
