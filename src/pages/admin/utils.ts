import * as Yup from 'yup';

// Options for jobType, so validation can use the same values
const jobTypeOptions = [
  { value: 'Full-Time', label: 'Full-time' },
  { value: 'Contract', label: 'Contract' },
  { value: 'Part-Time', label: 'Part-time' },
  { value: 'Internship', label: 'Internship' },
  { value: 'Freelance', label: 'Freelance' },
];

// Create a validation schema using Yup
export const jobValidationSchema = Yup.object().shape({
  jobName: Yup.string()
    .required('Job name is a required field')
    .min(3, 'Job name must be at least 3 characters')
    .max(100, 'Job name must be at most 100 characters'),
  company_name: Yup.string()
    .required("Company name is a required field")
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must be at most 100 characters"),
  jobType: Yup.string()
    .required('Job type is a required field')
    // Ensure the selected value is one of the available options
    .oneOf(jobTypeOptions.map(option => option.value), 'Please select a valid job type'),
  jobDescription: Yup.string()
    .required("Job description is a required field")
    .min(10, "Job description must be at least 10 characters")
    .max(1000, "Job description must be at most 1000 characters"),
  candidateNumber: Yup.number()
    .required('Number of candidates is a required field')
    .typeError('Number of candidates must be a number')
    .integer('Number of candidates must be an integer')
    .positive('Number of candidates must be greater than 0')
    .max(100, 'Number of candidates must be 100 or less'),

  salaryMin: Yup.string()
    .required('Minimum salary is a required field'),
  salaryMax: Yup.string()
    .required('Maximum salary is a required field')
});