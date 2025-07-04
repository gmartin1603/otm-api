import { onRequest } from "firebase-functions/v2/https";
import express, { Request, Response } from "express";
// import { connectToMongoDB } from "./helpers/mongo";
import RequestHandler from "./handlers/RequestHandler";
import postingsService from "./services/postings-service";
import jobsService from "./services/jobs-service";
import userService from "./services/user-service";
import devAppService from "./services/devApp-service";
import mainService from "./services/main-service";


const dotenv = require("dotenv");
dotenv.config();

let env: string;
// let corsOrigin = "*";
if (process.env.NODE_ENV == "prod") {
  env = "prod";
  // corsOrigin = process.env.NODE_ENV_CORS_URL || "*";
} else {
  env = "dev";
}

console.log("CURRENT ENV: ", env);

const mainApp = express();
mainApp.post("*", (req: Request, res: Response) => RequestHandler(req, res, mainService));
export const main = onRequest({ cors: true }, mainApp);

const postingsApp = express();
postingsApp.post("*", (req: Request, res: Response) => RequestHandler(req, res, postingsService));
export const postings = onRequest({ cors: true }, postingsApp);

const jobsApp = express();
jobsApp.post("*", (req: Request, res: Response) => RequestHandler(req, res, jobsService));
export const jobs = onRequest({ cors: true }, jobsApp);

const userApp = express();
userApp.post("*", (req: Request, res: Response) => RequestHandler(req, res, userService));
export const user = onRequest({ cors: true }, userApp);

const devAppExpress = express();
devAppExpress.post("*", (req: Request, res: Response) => RequestHandler(req, res, devAppService));
export const devApp = onRequest({ cors: true }, devAppExpress);

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
