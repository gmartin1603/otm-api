/**
 * @module devApp-service
 * @requires firebase-admin/auth
 * @description This module provides the service for the "/devApp/*" routes
 * @description devApp-service handles the business logic for /devApp endpoints
 * @description devApp-service is called by and returns to devApp-controller
 * @exports devAppService
 */
const { handlePromise, handleResponse } = require("./common-service");
// Firestore helpers (if needed)
// const { getAuth } = require("firebase-admin/auth");
const { db, admin } = require("../helpers/firebase");

const { getConnection } = require("../helpers/mongo");

const devAppService = {
	copyCollectionToMongo: async (body) => {
		//Get all department docs from Firestore
		const get_example_api = () => db.collection(body.collection).get();
		const [data, error] = await handlePromise(get_example_api);
		console.log("Firebase data: ", data.docs.length);
		let firebaseDocs = data.docs.map((doc) => doc.data());

		if (error) {
			throw error;
		} else {
			if (firebaseDocs.length === 0) {
				throw new Error("Target Collection Empty");
			}

			try {
				const mdb = getConnection();
				const collection = mdb.collection(body.collection);
				const result = await collection.insertMany(firebaseDocs);
				console.log(result.insertedCount, "docs inserted");
				return `Successfully copied ${result.insertedCount} docs`;
			} catch (err) {
				console.error("Error writing to MongoDb: ", err);
				throw err;
			}
		}
	},

	copyArchiveToMongo: async (body) => {
		const get_example_api = () =>
			db.collection(body.dept).doc("rota").collection("archive").get();
		const [data, error] = await handlePromise(get_example_api);
		console.log("Firebase data: ", data.docs.length);
		let firebaseDocs = data.docs.map((doc) => {
      return {
        ...doc.data(),
        id: doc.id
      }
    });

		if (error) {
			throw error;
		} else {
			if (firebaseDocs.length === 0) {
				throw new Error("Target Collection Empty");
			}

			try {
				const mdb = getConnection();
				const collection = mdb.collection(`${body.dept}-archive`);
				const result = await collection.insertMany(firebaseDocs);
				console.log(result.insertedCount, "docs inserted");
				return `Successfully copied ${result.insertedCount} docs`;
			} catch (err) {
				console.error("Error writing to MongoDb: ", err);
				throw err;
			}
		}
	},
};

export default devAppService;
