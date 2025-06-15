import { handlePromise } from "./common-service";
import { db } from "../helpers/firebase";
import { CreateJobRequest, DeleteJobRequest, GetJobRequest, GetJobsRequest, Job, UpdateJobRequest } from "../Types/types.jobService";
import { Service } from "../Types/type.Service";


const jobsService: Service = {
  name: "jobsService",

  getJobs: async ({ depts }: GetJobsRequest) => {
    console.log(depts);
    let jobs: Job[] = [];

    // Get all jobs for each department
    for (const dept of depts) {
      const [result, error] = await handlePromise(() => db.collection(dept).where("id", "!=", "rota").orderBy("id").get());
      if (error) {
        throw error;
      } else {
        result.forEach((doc: any) => {
          jobs.push(doc.data());
        });
      }
    }

    // Order jobs by order with groups by dept
    let res = [];
    let map: { [key: string]: Job[] } = {};
    jobs.forEach(job => {
      if (!map[job.dept]) {
        map[job.dept] = [];
      }
      map[job.dept].push(job);
    });

    for (const dept in map) {
      map[dept].sort((a, b) => a.order - b.order);
      res.push(...map[dept]);
    }

    return res;
  },

  getJob: async ({ dept, id }: GetJobRequest): Promise<Job> => {

    const get_job_api = () => db.collection(dept).doc(id).get();
    const [result, error] = await handlePromise(get_job_api);

    if (error)
      throw error;

    if (!result.exists) {
      throw new Error(`Job with ID ${id} not found in department ${dept}`);
    }
    const jobData = result.data() as Job;
    // console.log("Job data:", jobData);
    return jobData;
  },

  addJob: async ({ dept, job }: CreateJobRequest) => {
    // console.log(job)
    let name = job.label.toLowerCase().replace(/\s/g, "-");
    // Generate unique ID
    let id = `${job.group}-${name}-${Math.random()
        .toString(36)
        .substring(2, 9)}`;
    let ids = [];

    const get_ids_api = () => db.collection(dept).get()
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
          console.warn("Generating new ID attempt: " + i);
          id = `${job.group}-${name}-${Math.random()
              .toString(36)
              .substring(2, 9)}`;
          i++;
      } while (ids.includes(id) || i < 100);

      if (i >= 100) {
          console.error("Failed to generate new ID");
          throw new Error("Job not created: Failed to generate new ID");
      } else {
        console.log("New ID generated: " + id);
      }
    }

    job.id = id;
    job.order = ids.length + 1;

    const add_job_api = () => db.collection(dept).doc(job.id).set(job);
    const [jobDoc, error] = await handlePromise(add_job_api);
    if (error) {
      // console.error("Error adding job:", error);
      throw error;
    } else {
      // console.log("Successfully added job:", job);
      return { id: id, ...jobDoc };
    }
  },

  //TODO: Test this function
  updateJob: async ({ dept, job }: UpdateJobRequest) => {

    const update_job_api = () => db.collection(dept).doc(job.id).set(job, { merge: true });
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

    const delete_job_api = () => db.collection(dept).doc(id).delete();
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
