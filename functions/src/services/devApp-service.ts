import { Service } from "../Types/type.Service";
import CommonUtils from "../Types/class.CommonUtils";
import { db } from "../helpers/firebase";
const buildArchive = require("../helpers/buildArchive");

const { handlePromise, writeLog } = new CommonUtils();

declare type DevAppRequest = {
  [key: string]: any;
};

const devAppService: Service = {
  name: "devAppService",

  buildArchiveDev: async ({ dept, start }: DevAppRequest) => {
    console.log(dept, start);
    if (!dept || !start) {
      throw new Error("Department and start date must be provided");
    } else if (new Date(start).toDateString() === "Invalid Date") {
      throw new Error("Invalid start date");
    } else if (new Date(start).getDay() !== 1) {
      throw new Error("Start date must be a Monday");
    }

    let date = start;
    let remaining = 1;
    let handled = 0;
    const week = 7*24*60*60*1000;
  
    while (remaining > 0) {

      const obj = await buildArchive(dept, date);

      const create_doc_call = () => (db.collection(dept).doc("rota").collection("archive").doc(`${new Date(date).toDateString()}`).set(obj));
      const [_, error] = await handlePromise(create_doc_call);
      if (error) {
        writeLog('error', `Error archiving document for ${dept} on ${new Date(date).toDateString()}: ${error.message}`);
        throw error;
      }
      
      remaining--;
      handled++;
      date = new Date(date).getTime() + week;
    }

    return `${handled} Documents successfully archived. Start date: ${new Date(start).toDateString()}`;
  },

  updateArchive: async ({ dept }: DevAppRequest) => {
    let endDate = new Date();

    const collection = db.collection(`${dept}-archive`);

    const query = collection.where("date", "<=", endDate);
    const snapshot = await query.get();
    console.log("Update result: ", snapshot);
    return `Successfully updated ${snapshot.size} docs`;
  },

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

export default devAppService;
