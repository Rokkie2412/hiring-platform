import type { RequirementOption } from '../../types'

export type ConfirmationModalProps = {
  onClose: () => void;
  onSave: () => void;
}

export type JobFormValues = {
  jobName: string;
  jobType: string;
  company_name: string;
  jobDescription: string;
  candidateNumber: string;
  salaryMin: number | string;
  salaryMax: number | string;
  requirements: {
    fullName: RequirementOption;
    photoProfile: RequirementOption;
    gender: RequirementOption;
    domicile: RequirementOption;
    email: RequirementOption;
    phoneNumber: RequirementOption;
    linkedIn: RequirementOption;
    dob: RequirementOption;
  };
}

export type CandidateRow = {
  id: string;
  job_id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  domicile?: string;
  gender?: string;
  linkedin_link?: string;
  photo_profile?: string;
};

export type CandidateAttribute = {
  key: keyof CandidateRow;
  value: string;
};

export type ApplicantRow = {
  id: string;
  job_id: string;
  attributes: CandidateAttribute[];
};