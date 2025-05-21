import functions from "firebase-functions";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import pkg from "./package.json";
import { writeLog } from "./web_api/services/common-service";

// **SCRIPT** CONTROLLER IMPORT START
import postingsController from "./web_api/controllers/postings-controller";
import jobsController from "./web_api/controllers/jobs-controller";
import userController from "./web_api/controllers/user-controller";
import appController from "./web_api/controllers/app-controller";
import devAppController from "./web_api/controllers/devApp-controller";
// **SCRIPT** CONTROLLER IMPORT END

import dotenv from "dotenv";
dotenv.config();

let env = "";
let corsOrigin: string = "*";
if (process.env.NODE_ENV == "prod") {
  env = "prod";
  corsOrigin = process.env.NODE_ENV_CORS_URL || "*";
} else {
  env = "dev";
}
// console.log("env: ", env)
console.log("env: ", env);

// Mongo Connection
import { connectToMongoDB } from "./web_api/helpers/mongo";

const corsHandler = cors({ origin: true });

const applyMiddleware = (handler: (req: any, res: any) => any) => (req: any, res: any) => {
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
				writeLog("activity", {
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
postingsApp.post("*", (req, res) => postingsController(req, res));
export const postings = functions.https.onRequest(applyMiddleware(postingsApp));

const mainApp = express();
mainApp.post("*", (req, res) => appController(req, res));
export const app = functions.https.onRequest(applyMiddleware(mainApp));

const jobsApp = express();
jobsApp.post("*", (req, res) => jobsController(req, res));
export const jobs = functions.https.onRequest(applyMiddleware(jobsApp));

const userApp = express();
userApp.post("*", (req, res) => userController(req, res));
export const user = functions.https.onRequest(applyMiddleware(userApp));

const devAppExpress = express();
devAppExpress.post("*", (req, res) => devAppController(req, res));
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
