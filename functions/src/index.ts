import * as functions from "firebase-functions";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import CommonUtils from "./Types/class.CommonUtils";
import { connectToMongoDB } from "./helpers/mongo";
import { Request, Response } from "express";
import RequestHandler from "./handlers/RequestHandler";
import postingsService from "./services/postings-service";
import jobsService from "./services/jobs-service";
import userService from "./services/user-service";
import devAppService from "./services/devApp-service";
import appService from "./services/app-service";


const dotenv = require("dotenv");
dotenv.config();
const _commonUtils = new CommonUtils();

let env: string;
// let corsOrigin = "*";
if (process.env.NODE_ENV == "prod") {
  env = "prod";
  // corsOrigin = process.env.NODE_ENV_CORS_URL || "*";
} else {
  env = "dev";
}

console.log("CURRENT ENV: ", env);
const corsHandler = cors({ origin: true });

const applyMiddleware = (handler: (req: Request, res: Response) => any) => (req, res) => {
	return corsHandler(req, res, (_) => {
    console.log("CORS Handler added");
		return bodyParser.json()(req, res, () => {
      console.log("Adding MongoDB Middleware");
			connectToMongoDB((error) => {
				if (error) {
					console.error("Failed to connect to MongoDB", error);
					// return res.status(500).json({ error: "Failed to connect to MongoDB" });
				}
				const method = req.url.split("/").pop();
				_commonUtils.writeLog("activity", {
					message: `API call made to method: ${method}`,
					headers: req.headers,
					body: req.body,
				}).then(() => {
					return handler(req, res);
				});
			});
		});
	});
};


// **SCRIPT** CONTROLLER ROUTING START

const postingsApp = express();
postingsApp.post("*", (req: Request, res: Response) => RequestHandler(req, res, postingsService));
export const postings = functions.https.onRequest(applyMiddleware(postingsApp));

const mainApp = express();
mainApp.post("*", (req: Request, res: Response) => RequestHandler(req, res, appService));
export const app = functions.https.onRequest(applyMiddleware(mainApp));

const jobsApp = express();
jobsApp.post("*", (req: Request, res: Response) => RequestHandler(req, res, jobsService));
export const jobs = functions.https.onRequest(applyMiddleware(jobsApp));

const userApp = express();
userApp.post("*", (req: Request, res: Response) => RequestHandler(req, res, userService));
export const user = functions.https.onRequest(applyMiddleware(userApp));

const devAppExpress = express();
devAppExpress.post("*", (req: Request, res: Response) => RequestHandler(req, res, devAppService));
export const devApp = functions.https.onRequest(applyMiddleware(devAppExpress));

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


/**
 * DEV MODE
 * This section runs the express app in watch mode during development.
 * Dev mode does not use the Firebase CLI or Emulator.
 * It is intended for local development and testing.
 * To run the app in dev mode, use the command: npm run dev
 * The app will be available at http://localhost:5000/otm-staging-725a6/us-central1/
 */
// if (env === "dev") {
//   const baseApiUrl = process.env.BASE_API_URL || "/otm-staging-725a6/us-central1";
//   const app = express();
//   app.use(cors({ origin: true }));
//   app.use(bodyParser.json());

//   // **SCRIPT** CONTROLLER ROUTING START
//   app.post(`${baseApiUrl}/postings`, (req: Request, res: Response) => postingsController(req, res));
//   app.post("/jobs", (req: Request, res: Response) => jobsController(req, res));
//   app.post("/user", (req: Request, res: Response) => userController(req, res));
//   app.post(`${baseApiUrl}/app`, (req: Request, res: Response) => appController(req, res));
//   app.post("/devApp", (req: Request, res: Response) => devAppController(req, res));
//   // **SCRIPT** CONTROLLER ROUTING END

//   const PORT = process.env.PORT || 5000;
//   app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
//   });
// }