import type { NavigateFunction } from "react-router-dom";
import type { Job } from "../../types";

export type CardJobProps = {
  job: Job;
  selectedJob: Job | null;
  onSelect: (job: Job) => void;
}

export type SelectedJobContentProps = {
  selectedJob: Job;
  navigate: NavigateFunction;
}

export type ContentProps =  {
  jobs: Job[];
  selectedJob: Job | null;
  onSelectJob: (job: Job) => void;
  navigate: NavigateFunction;
}

export type ApplicationForm = {
  full_name: string;
  photo_profile: string;
  gender: string;
  domicile: string;
  phone_number: string;
  email: string;
  linkedin_link: string;
  date_of_birth: Date;
}