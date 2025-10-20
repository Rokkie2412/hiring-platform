import * as Yup from 'yup';

// Options for jobType, so validation can use the same values
const jobTypeOptions = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'internship', label: 'Internship' },
  { value: 'freelance', label: 'Freelance' },
];

// Create a validation schema using Yup
export const jobValidationSchema = Yup.object().shape({
  jobName: Yup.string()
    .required('Job name is a required field')
    .min(3, 'Job name must be at least 3 characters')
    .max(100, 'Job name must be at most 100 characters'),

  jobType: Yup.string()
    .required('Job type is a required field')
    // Ensure the selected value is one of the available options
    .oneOf(jobTypeOptions.map(option => option.value), 'Please select a valid job type'),
  candidateNumber: Yup.number()
    .required('Number of candidates is a required field')
    // Display an error if the input is not a number (e.g., "abc")
    .typeError('Number of candidates must be a number')
    .integer('Number of candidates must be an integer')
    .positive('Number of candidates must be greater than 0')
    .max(100, 'Number of candidates must be 100 or less'),

  salaryMin: Yup.string()
    .required('Minimum salary is a required field'),
  salaryMax: Yup.string()
    .required('Maximum salary is a required field')
});