import { Service } from "../Types/type.Service";
import CommonUtils from "../Types/class.CommonUtils";
// Firestore helpers (if needed)
// const { getAuth } = require("firebase-admin/auth");
// const { db } = require("../helpers/firebase");
import { db } from "../helpers/firebase";
// const { getConnection } = require("../helpers/mongo");
// const buildArchive = require("../helpers/buildArchive");

const { handlePromise, writeLog } = new CommonUtils();

declare type DevAppRequest = {
  [key: string]: any;
};

const mongoAppService: Service = {
  name: "mongoAppService",

	// copyCollectionToMongo: async (body) => {
	// 	//Get all department docs from Firestore
	// 	const get_example_api = () => db.collection(body.collection).get();
	// 	const [data, error] = await handlePromise(get_example_api);
	// 	console.log("Firebase data: ", data.docs.length);
	// 	let firebaseDocs = data.docs.map((doc) => doc.data());

	// 	if (error) {
	// 		throw error;
	// 	} else {
	// 		if (firebaseDocs.length === 0) {
	// 			throw new Error("Target Collection Empty");
	// 		}

	// 		try {
	// 			const mdb = getConnection();
	// 			const collection = mdb.collection(body.collection);
	// 			const result = await collection.insertMany(firebaseDocs);
	// 			console.log(result.insertedCount, "docs inserted");
	// 			return `Successfully copied ${result.insertedCount} docs`;
	// 		} catch (err) {
	// 			console.error("Error writing to MongoDb: ", err);
	// 			throw err;
	// 		}
	// 	}
	// },

	// copyArchiveToMongo: async (body) => {
	// 	const get_example_api = () =>
	// 		db.collection(body.dept).doc("rota").collection("archive").get();
	// 	const [data, error] = await _commonUtils.handlePromise(get_example_api);
	// 	console.log("Firebase data: ", data.docs.length);
	// 	let firebaseDocs = data.docs.map((doc) => {
  //     return {
  //       ...doc.data(),
  //       id: doc.id
  //     }
  //   });

	// 	if (error) {
	// 		throw error;
	// 	} else {
	// 		if (firebaseDocs.length === 0) {
	// 			throw new Error("Target Collection Empty");
	// 		}

	// 		try {
	// 			const mdb = getConnection();
	// 			const collection = mdb.collection(`${body.dept}-archive`);

  //       const currentArchiveBackUp = await collection.find().toArray();
  //       console.log("Current Archive: ", currentArchiveBackUp.length);
  //       if (currentArchiveBackUp.length === firebaseDocs.length) {
  //         return "Archive already up to date";
  //       }

  //       // Insert new documents into the collection
	// 			// const result = await collection.insertMany(firebaseDocs);
  //       let result = { insertedCount: 0, errors: [] };
  //       for (let doc of firebaseDocs) {
  //         if (currentArchiveBackUp.find((d) => d.id === doc.id)) {
  //           // console.log("Doc already exists: ", doc.id);
  //           continue;
  //         }
  //         console.log("Inserting doc: ", doc.id);
  //         const upRes = await collection.insertOne(doc);
  //         console.log("Insert result: ", upRes);
  //         if (upRes.acknowledged) {
  //           result.insertedCount += upRes.insertedCount;
  //         } else {
  //           result.errors.push(doc.id);
  //         }
  //       }
				
  //       let message = `Successfully copied ${result.insertedCount} docs`;
  //       if (result.errors.length > 0) {
  //         message += ` with ${result.errors.length} errors`;
  //         console.error("Errors:\n", result.errors);
  //       }

  //       console.log(message);
	// 			return message;
			
  //     } catch (err) {
	// 			console.error("Error writing to MongoDb: ", err);
	// 			throw err;
	// 		}
	// 	}
	// },

  // buildArchiveDev: async (body) => {
  //   const { dept, start } = body;
  //   console.log(dept, start);

  //   let date = start;
  //   let remaining = 1;
  //   let updated = 0;
  //   const week = 7*24*60*60*1000;
  
  //   while (remaining > 0) {

  //     const obj = await buildArchive(dept, date);
  //     // return obj;
    
  //     await db
  //       .collection(dept)
  //       .doc("rota")
  //       .collection("archive")
  //       .doc(`${new Date(date).toDateString()}`)
  //       .set(obj)
  //       .then(() => {
  //         console.log(
  //           `Doc written to ${dept}/rota/archive/${new Date(
  //             date
  //           ).toDateString()}`
  //         );
  //       })
  //       .catch((error) => {
  //         // console.error("Error writing document: ", message);
  //         // errorResponse(res, error);
  //         throw new Error(error);
  //       });

  //     const mdb = getConnection();
  //     const collection = mdb.collection(`${dept}-archive`);

  //     obj["id"] = new Date(date).toDateString();

  //     const result = await collection.insertOne(obj);
  //     console.log("Insert result: ", result);

  //     remaining--;
  //     updated++;
  //     date = new Date(date).getTime() + week;
  //   }

  //   return `${updated} Documents successfully archived. Start date: ${new Date(start).toDateString()}`;
  // },

  // updateArchive: async (body) => {
  //   let endDate = new Date();

  //   const mdb = getConnection();
  //   const collection = mdb.collection(`${body.dept}-archive`);

  //   const result = await collection.updateOne({ id: doc }, { $set: update });
  //   console.log("Update result: ", result);
  //   return `Successfully updated ${result.modifiedCount} docs`;
  // },

  deleteAllButRota: async ({ dept }: DevAppRequest) => {
    if (!dept) {
      throw new Error("Department must be provided");
    }
    const get_docs_api = () => db.collection(dept).get();
    const [data, error] = await handlePromise(get_docs_api);

    if (error) {
      throw error;
    } else {
      if (data.docs.length === 0) {
        throw new Error("Target Collection Empty");
      }
      let docsToDelete = data.docs.filter((doc) => doc.id !== "rota").map((doc) => doc.id);
      if (docsToDelete.length === 0) {
        return "No documents to delete";
      }
      const batch = db.batch();
      docsToDelete.forEach((docId) => {
        const docRef = db.collection(dept).doc(docId);
        batch.delete(docRef);
      });
      await batch.commit();
      writeLog('dev', `Successfully deleted ${docsToDelete.length} documents from ${dept}`);
      return `Successfully deleted ${docsToDelete.length} documents from ${dept}`;
    }
  },

  moveDocs: async ({ source, target }: DevAppRequest) => {

    if (!source || !target) {
      throw new Error("Source and target collections must be provided");
    }

    const get_docs_api = () => db.collection(source).get();
    const [data, error] = await handlePromise(get_docs_api);

    if (error) {
      throw error;
    } else {
      if (data.docs.length === 0) {
        throw new Error("Source Collection Empty");
      }

      let docsToMove = data.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const batch = db.batch();
      docsToMove.forEach((doc) => {
        const docRef = db.collection(target).doc(doc.id);
        batch.set(docRef, doc);
      });

      await batch.commit();
      writeLog('dev', `Successfully moved ${docsToMove.length} documents from ${source} to ${target}`);
      return `Successfully moved ${docsToMove.length} documents from ${source} to ${target}`;
    }
  }
};

export default mongoAppService;
