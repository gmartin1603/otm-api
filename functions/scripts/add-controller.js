/**
 * Node script for adding a new controller and service template to the project
 * @param {string} name - The name of the new controller and service
 * new controller file "/functions/web_api/controllers/<name>-controller.js"
 * new service file "/functions/web_api/services/<name>-service.js"
 * @usage "npm run add-controller <name>" or "yarn add-controller <name>"
 */

const fs = require("fs");
const path = require("path");

const name = process.argv[2];
const verbose = process.argv[3] === "debug" || process.argv[3] === "true";
const controllerPath = path.join(__dirname, `../web_api/controllers/${name}-controller.js`);
const servicePath = path.join(__dirname, `../web_api/services/${name}-service.js`);

const controllerTemplate = `/**
  * Controller for the ${name} cloud function
  * @module ${name}-controller
  * @requires module:${name}-service
  * @requires module:common-service
  * @description This module provides the controller for the ${name} cloud function API endpoints
  * @description ${name}-controller handles execution of /${name} endpoints by calling the appropriate service method
  * @exports ${name}Controller
  */
const ${name}Service = require("../services/${name}-service");
const { handlePromise, handleResponse } = require("../services/common-service");

const ${name}Controller = async (req, res) => {
  // Get the ${name}Service method name from the last route of the request URL
  const method = req.url.split("/").pop();

  const ${name}_controller_api = () => ${name}Service[method](req, res);
  const [result, error] = await handlePromise(${name}_controller_api);
  let response = {};

  if (error) {
    // console.error("Error calling ${name}Service method:", error);
    response = { error: error, controller: "${name}-controller", method: method };

    handleResponse(res, "error", response);
  } else {
    console.log("Successfully called ${name}Service method:", method);
    response = {
      status: "success",
      message: "Successfully called ${name}Service method",
      data: result,
      method: \`${name}-controller => \${method}\`
    };

    handleResponse(res, "success", response);
  }

};

module.exports = ${name}Controller;
`;

const serviceTemplate = `/**
 * @module ${name}-service
 * @requires firebase-admin/auth
 * @description This module provides the service for the "/${name}/*" routes 
 * @description ${name}-service handles the business logic for /${name} endpoints
 * @description ${name}-service is called by and returns to ${name}-controller
 * @exports ${name}Service
 */
const { handlePromise, handleResponse } = require("./common-service");
// Firestore helpers (if needed)
// const { getAuth } = require("firebase-admin/auth");
// const { db, admin } = require("../../helpers/firebase");

const ${name}Service = {
  // Add service methods here
  // Example:
  ${name}Ex: async (req, res) => {
    console.log("${name}Ex fired");
    const body = req.body;
    // console.log("Req body: ", body);
    const id = body.id;

    if (!id) {
      throw new Error("No ID provided");
    }
  
    // const get_example_api = () => ** API CALL HERE **;
    // const [data, error] = await handlePromise(get_example_api);
  
    // if (error) {
    //   throw new Error(error);
    // } else {
    //   return data;
    // }
    
    return "Example data"
  },
};

module.exports = ${name}Service;
`;

// const indexImport = `const ${name}Controller = require("./${name}-controller");`;
// const indexRoute = `
// const ${name} = express();
// ${name}.post("*", (req, res) => ${name}Controller(req, res));
// exports.${name} = functions.https.onRequest(applyMiddleware(${name});
// `;

const buildController = (name) => {
  // Check if the name argument was provided
  if (!name) {
    throw new Error("Please provide a name for the new controller and service as the first argument");
  } else {
    // Check if the name is a valid string
    // Can only contain letters
    const valid_name = /[^a-zA-Z]/.test(name);
    if (valid_name) {
      throw new Error("Invalid name. Name should only contain letters");
    }
  }

  // Check if the controller and service files already exist (not the directories)
  if (fs.existsSync(controllerPath)) {
    throw new Error("Controller file already exists");
  }
  if (fs.existsSync(servicePath)) {
    throw new Error("Service file already exists");
  }

  try {
    // Assuming controllerTemplate and serviceTemplate are defined somewhere in your script
    fs.writeFileSync(controllerPath, controllerTemplate);
    fs.writeFileSync(servicePath, serviceTemplate);
  } catch (error) {
    throw new Error(`Error writing to file: ${error.message}`);
  }

  const indexImport = `const ${name}Controller = require("./web_api/controllers/${name}-controller");`;
  const indexRoute = `
  const ${name} = express();
  ${name}.post("*", (req, res) => ${name}Controller(req, res));

  exports.${name} = functions.https.onRequest(applyMiddleware(${name}));
  `;

  // Add new controller route to ../index.js
  const indexFile = path.join(__dirname, "../index.js");
  const indexData = fs.readFileSync(indexFile, "utf8");
  let indexLines = indexData.split("\n");
  
  const importStart = indexLines.findIndex((line) => line.includes("**SCRIPT** CONTROLLER IMPORT START"));
  let import_head = indexLines.slice(0, importStart + 1);
  import_head.push(indexImport);
  let import_tail = indexLines.slice(importStart + 1);
  console.log(import_head)
  indexLines = import_head.concat(import_tail);

  const routeStart = indexLines.findIndex((line) => line.includes("**SCRIPT** CONTROLLER ROUTING START"));
  let route_head = indexLines.slice(0, routeStart + 1)
  route_head.push(indexRoute);
  let route_tail = indexLines.slice(routeStart + 1);
  indexLines = route_head.concat(route_tail);

  if (routeStart === -1 || importStart === -1) {
    throw new Error("Error adding new route to index.js");
  } else {
    try {
      // console.log(indexLines)
      fs.writeFileSync(indexFile, indexLines.join("\n"));
    } catch (error) {
      throw new Error(`Error writing to file: ${error.message}`);
    }
  }

  console.log(`Controller and service files created: \n Controller File: ${path.relative(__dirname, controllerPath)}, \n Service File: ${path.relative(__dirname, servicePath)}`);


  process.exit(0);
};

try {
  buildController(name);
} catch (error) {
  console.error("ERROR: ", error.message, "\n");
  if (verbose) console.error(error.stack);
  process.exit(1);
}