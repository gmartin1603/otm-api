import CommonUtils from "../Types/class.CommonUtils";
import { db } from "../helpers/firebase";
import { CreateJobRequest, DeleteJobRequest, GetJobRequest, GetJobsRequest, Job, UpdateJobRequest } from "../Types/types.jobService";
import { Service } from "../Types/type.Service";

// const _commonUtils = new CommonUtils();
const {handlePromise, writeLog} = new CommonUtils();

const jobsService: Service = {
  name: "jobsService",

  getJobs: async ({ depts }: GetJobsRequest) => {
    console.log(depts);
    let res: Job[] = [];

    for (const dept of depts) {
      const jobs_call = () => db.collection(`${dept}-jobs`).orderBy("order").get();
      const [result, error] = await handlePromise(jobs_call);
      
      if (error) {
        throw error;
      } else {
        result.forEach((doc: any) => {
          res.push(doc.data());
        });
      }
    }

    return res;
  },

  getJob: async ({ dept, id }: GetJobRequest): Promise<Job> => {
    const get_job_api = () => db.collection(`${dept}-jobs`).doc(id).get();
    const [result, error] = await handlePromise(get_job_api);

    if (error)
      throw error;

    if (!result.exists)
      throw new Error(`Job with ID ${id} not found in department ${dept}`);

    return result.data() as Job;
  },

  addJob: async ({ dept, job }: CreateJobRequest) => {
    let name = job.label.toLowerCase().replace(/\s/g, "-");
    // Generate unique ID
    let id = `${job.group}-${name}-${Math.random().toString(36).substring(2, 9)}`;
    const ids = [];

    const get_ids_api = () => db.collection(`${dept}-jobs`).get()
    const [result, ids_error] = await handlePromise(get_ids_api);
    if (ids_error) {
      // console.error("Error getting job IDs:", ids_error);
      throw ids_error;
    } else {
      result.forEach(doc => {
        ids.push(doc.data().id);
      });
    }

    if (ids.includes(id)) {
      let i = 0;
      do {
        id = `${job.group}-${name}-${Math.random().toString(36).substring(2, 9)}`;
        i++;
      } while (ids.includes(id) || i < 100);

      if (i >= 100)
        throw new Error("Job not created: Failed to generate new ID");
      
      writeLog("activity", {
        message: `Job ID conflict resolved, new ID: ${id}`,
        job: job,
      });
    }

    job.id = id;
    job.order = ids.length + 1;

    const add_job_api = () => db.collection(`${dept}-jobs`).doc(job.id).set(job);
    const [res, error] = await handlePromise(add_job_api);
    if (error) {
      // console.error("Error adding job:", error);
      throw error;
    } else {
      // console.log("Successfully added job:", job);
      return { id: id, ...res };
    }
  },

  //TODO: Test this function
  updateJob: async ({ dept, job }: UpdateJobRequest) => {
    const update_job_api = () => db.collection(`${dept}-jobs`).doc(job.id).set(job, { merge: true });
    const [result, error] = await handlePromise(update_job_api);

    if (error) {
      // console.error("Error updating job:", error);
      throw error;
    } else {
      // console.log("Successfully updated job:", job);
      return result;
    }
  },

  //TODO: Test this function
  deleteJob: async ({ dept, id }: DeleteJobRequest) => {
    throw new Error("Not implemented yet");
    
    //TODO!: Check for dependencies before deleting
    const delete_job_api = () => db.collection(`${dept}-jobs`).doc(id).delete();
    const [result, error] = await handlePromise(delete_job_api);

    if (error) {
      // console.error("Error deleting job:", error);
      throw error;
    } else {
      // console.log("Successfully deleted job:", id);
      return result;
    }
  }
};

export default jobsService;
