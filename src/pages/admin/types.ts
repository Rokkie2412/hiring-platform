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