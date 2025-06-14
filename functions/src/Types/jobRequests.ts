export type Job = {
  id: string;
  label: string;
  group: string;
  dept: string;
  order: number;
  [key: string]: any; // Allow additional properties
}

export type GetJobRequest = {
  dept: string;
  id: string;
}

export type GetJobsRequest = {
  depts: string[];
}

export type CreateJobRequest = {
  dept: string;
  label: string;
  group: string;
  order: number;
  [key: string]: any; // This allows for additional properties to be added dynamically
}

export type UpdateJobRequest = {
  dept: string;
  id: string;
  label?: string;
  group?: string;
  order?: number;
  [key: string]: any; // This allows for additional properties to be added dynamically
}

export type DeleteJobRequest = {
  dept: string;
  id: string;
  [key: string]: any; // This allows for additional properties to be added dynamically
}
