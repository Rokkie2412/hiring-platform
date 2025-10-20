import type { JobFormValues } from "../pages/admin/types";

export type Job = {
  id: string,
  slug?: string,
  title: string,
  status: string,
  jobs_type: string,
  company_name: string,
  description: string[],
  candidate_number: number,
  salary_range?: {
    min: number,
    max: number,
    currency: string,
    display_text: string
  },
  list_card?: {
    badge: string,
    cta: string,
    started_on_text: string
  }
}

export type JobFieldKey = 
  | "full_name"
  | "photo_profile"
  | "gender"
  | "domicile"
  | "email"
  | "phone_number"
  | "linkedin_link"
  | "date_of_birth";

  export interface FieldValidation {
    required: boolean | 'optional';
  }

  export interface JobFieldTyped {
    key: JobFieldKey;
    validation: FieldValidation;
  }

  export type ApplicationFormType = {
    created_at: string;
    title: string;
    field: JobFieldTyped[];
  };

export type JobStore = {
  jobs: Job[],
  loading: boolean,
  error: string | null,
  applicationForm: JobFieldTyped[],
  selectedJob: Job | null,
  fetchJobs: () => Promise<void>,
  insertJob: (value: JobFormValues, jobStatus: string, fieldDb: DbRequirementsField[]) => Promise<null | undefined>,
  setSelectedJob: (job: Job | null) => void,
  fetchApplicationForm: (selectedJob: Job) => Promise<void>
}

export type RequirementOption = "mandatory" | "optional" | "off";

export type DbFieldKey = 
  | "full_name"
  | "photo_profile"
  | "gender"
  | "domicile"
  | "email"
  | "phone_number"
  | "linkedin_link"
  | "date_of_birth";

export type DbRequirementsField = {
  key: string
  validation: {
    required: boolean | string;
  }
}

export type RequirementsForm = {
  fullName: RequirementOption;
  photoProfile: RequirementOption;
  gender: RequirementOption;
  domicile: RequirementOption;
  email: RequirementOption;
  phoneNumber: RequirementOption;
  linkedIn: RequirementOption;
  dob: RequirementOption;
}

