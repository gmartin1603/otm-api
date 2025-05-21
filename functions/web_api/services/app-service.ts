/**
 * @module app-service
 * @requires firebase-admin/auth
 * @description This module provides the service for the app cloud function API endpoints
 * @description app-service handles the business logic for /app endpoints
 * @description app-service is called by and returns to app-controller
 * @exports appService
 */
require("dotenv").config();
const { handlePromise, handleResponse, writeLog } = require("./common-service");
const { getAuth } = require("firebase-admin/auth");
const { db, admin } = require("../helpers/firebase");
const API_VERSION = process.env.NODE_API_VERSION;

const appService = {

  getVersion: () => {
    return { version: API_VERSION };
  },

  
};

module.exports = appService;
