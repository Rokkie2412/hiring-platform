import type { JobFormValues } from "../pages/admin/types";
import type { ApplicationForm } from "../pages/applicant/types";

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

export type Attribute = {
  key: string;
  label: string;
  order: number;
  value: string;
};

export type Applicant = {
  id: string,
  job_id: string,
  attributes: Attribute[]
}

export type JobStore = {
  photoTemp: string,
  setPhotoTemp: (photo: string) => void,
  jobs: Job[],
  loading: boolean,
  error: string | null,
  applicationForm: JobFieldTyped[],
  selectedJob: Job | null,
  fetchJobs: () => Promise<void>,
  insertJob: (value: JobFormValues, jobStatus: string, fieldDb: DbRequirementsField[]) => Promise<null | undefined>,
  setSelectedJob: (job: Job | null) => void,
  fetchApplicationForm: (selectedJob: Job) => Promise<void>,
  insertApplicants: (values: ApplicationForm, photoTemp: string, selectedJobId: string) => Promise<void>,
  fetchManageJob: (id: string) => Promise<void>,
  applicants: Applicant[],
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

export interface ApplicantProfile {
  full_name: {
    label: 'Full Name';
    value: string;
    order: 1;
  };
  email: {
    label: 'Email';
    value: string;
    order: 2;
  };
  phone: {
    label: 'Phone';
    value: string;
    order: 3;
  };
  domicile: {
    label: 'Domicile';
    value: string;
    order: 4;
  };
  gender: {
    label: 'Gender';
    value: 'Female' | 'Male' | string;
    order: 5;
  };
  linkedin_link: {
    label: 'LinkedIn';
    value: string;
    order: 6;
  };
}
