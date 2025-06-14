import { Service } from "../Types/Service";

require("dotenv").config();
// const { handlePromise, handleResponse, writeLog } = require("./common-service");
// const { getAuth } = require("firebase-admin/auth");
// const { db, admin } = require("../helpers/firebase");
const API_VERSION = require("../helpers/constants").API_VERSION;

const appService: Service = {
  name: "appService",

  getVersion: async () => {
    return Promise.resolve({ version: API_VERSION });
  },
  
};

export default appService;
