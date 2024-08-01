/**
 * @file index.js is the root file for this project.
 * It is the first file that runs when you start your server.
 * Leave comments that start with "**SCRIPT**" in place so that the project scripts can inject code in the correct places.
 *
 */
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const API_VERSION = require("./package.json").version;
const { writeLog } = require("./web_api/services/common-service");

// **SCRIPT** CONTROLLER IMPORT START
const postingsController = require("./web_api/controllers/postings-controller");
const jobsController = require("./web_api/controllers/jobs-controller");
const userController = require("./web_api/controllers/user-controller");
const appController = require("./web_api/controllers/app-controller");
const devAppController = require("./web_api/controllers/devApp-controller");
// **SCRIPT** CONTROLLER IMPORT END

require("dotenv").config();

let env = "";
let corsOrigin = "*";
if (process.env.NODE_ENV == "prod") {
	env = "prod";
	corsOrigin = process.env.NODE_ENV_CORS_URL;
} else {
	env = "dev";
}
// console.log("env: ", env)
console.log("env: ", env);

// Mongo Connection
const { connectToMongoDB } = require("./web_api/helpers/mongo");

const corsHandler = cors({ origin: true });

const applyMiddleware = (handler) => (req, res) => {
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

  const postings = express();
  postings.post("*", (req, res) => postingsController(req, res));

  exports.postings = functions.https.onRequest(applyMiddleware(postings));
  

const app = express();
app.post("*", (req, res) => appController(req, res));

exports.app = functions.https.onRequest(applyMiddleware(app));

const jobs = express();
jobs.post("*", (req, res) => jobsController(req, res));

exports.jobs = functions.https.onRequest(applyMiddleware(jobs));

const user = express();
user.post("*", (req, res) => userController(req, res));

exports.user = functions.https.onRequest(applyMiddleware(user));

const devApp = express();
devApp.post("*", (req, res) => devAppController(req, res));

exports.devApp = functions.https.onRequest(applyMiddleware(devApp));

// **SCRIPT** CONTROLLER ROUTING END

/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

exports.helloWorld = onRequest((request, response) => {
	logger.info("Hello logs!", { structuredData: true });
	response.send("Hello from Firebase!");
});
