import { useFormik } from 'formik';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, type NavigateFunction } from 'react-router-dom';

import closeIcon from '../../assets/close.png';
import {
  FormDropdown,
  FormInputNumber,
  FormInputText,
  FormInputTextArea,
  FormRadioButton,
  Loading
} from '../../components';
import { useJobStore } from '../../store/jobStore';
import type { ConfirmationModalProps, JobFormValues } from './types';
import type { DbRequirementsField } from '../../types';
import { jobValidationSchema } from './utils';

const jobTypeOptions = [
  { value: 'Full-Time', label: 'Full-Time' },
  { value: 'Contract', label: 'Contract' },
  { value: 'Part-Time', label: 'Part-Time' },
  { value: 'Internship', label: 'Internship' },
  { value: 'Freelance', label: 'Freelance' },
];

const disabledRequirementKeys = ['fullName', 'photoProfile', 'email'];

const convertRequirement = (value: 'mandatory' | 'optional' | 'off') => {
  switch (value) {
    case 'mandatory':
      return true;
    case 'off':
      return false;
    default:
      return 'optional';
  }
};

const mappingRequirement = (values: JobFormValues): DbRequirementsField[] => {
  const requirementMapping = {
    fullName: 'full_name',
    photoProfile: 'photo_profile',
    gender: 'gender',
    domicile: 'domicile',
    email: 'email',
    phoneNumber: 'phone_number',
    linkedIn: 'linkedin_link',
    dob: 'date_of_birth',
  };

  return Object.entries(requirementMapping).map(([formKey, dbKey]) => ({
    key: dbKey,
    validation: {
      required: convertRequirement(values.requirements[formKey as keyof typeof values.requirements]),
    },
  }));
};

const ConfirmationModal = ({ onClose, onSave }: ConfirmationModalProps) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 text-black p-4">
    <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] flex flex-col relative border-none">
      <p className="py-6 px-4 sm:px-10 text-center font-bold">
        You are about to close this page. Save current changes as a draft?
      </p>
      <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0 p-4 sm:p-6 border-t border-gray-300 flex-shrink-0">
        <button
          onClick={onClose}
          className="px-4 sm:px-6 py-2 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-teal-600 transition-colors"
        >
          Close
        </button>
        <button
          onClick={onSave}
          className="px-4 sm:px-6 py-2 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-teal-600 transition-colors"
        >
          Save as draft
        </button>
      </div>
    </div>
  </div>
);

const ModalForm = () => {
  const navigate: NavigateFunction = useNavigate();
  const { insertJob, loading } = useJobStore();
  const [showModalConfirmation, setShowModalConfirmation] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const formik = useFormik<JobFormValues>({
    initialValues: {
      jobName: '',
      jobType: '',
      jobDescription: '',
      candidateNumber: '',
      company_name: '',
      salaryMin: '',
      salaryMax: '',
      requirements: {
        fullName: 'mandatory',
        photoProfile: 'mandatory',
        gender: 'mandatory',
        domicile: 'mandatory',
        email: 'mandatory',
        phoneNumber: 'mandatory',
        linkedIn: 'mandatory',
        dob: 'mandatory',
      },
    },
    validationSchema: jobValidationSchema,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: async (values) => {
      const field = mappingRequirement(values);
      await insertJobForm(values, 'Active', field)();
    },
  });

  const insertJobForm = (
    values: JobFormValues,
    status: 'Active' | 'Draft' | 'Inactive',
    field: DbRequirementsField[],
  ) => async () => {
    try {
      await insertJob(values, status, field);
      setTimeout(() => window.location.href = "/admin", 1000);
    } catch (error) {
      console.error('Failed to insert job:', error);
    }
  };

  const handleClose = () => {
    setShowModalConfirmation(false);
    navigate('/admin');
  };

  const handleSaveAsDraft = () => {
    insertJobForm(formik.values, 'Draft', mappingRequirement(formik.values))();
    setShowModalConfirmation(false);
    setTimeout(() => window.location.href = "/admin", 1000);
  };

  useEffect(() => {
    const formElement = formRef.current;
    if (!formElement) return;

    const checkScroll = () => {
      const hasScroll = formElement.scrollHeight > formElement.clientHeight;
      const isNotAtBottom = formElement.scrollTop + formElement.clientHeight < formElement.scrollHeight - 10;
      setShowScrollIndicator(hasScroll && isNotAtBottom);
    };

    checkScroll();
    formElement.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    return () => {
      formElement.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const requirementLabels: Record<string, string> = {
    fullName: 'Full Name',
    photoProfile: 'Photo Profile',
    gender: 'Gender',
    domicile: 'Domicile',
    email: 'Email',
    phoneNumber: 'Phone Number',
    linkedIn: 'LinkedIn',
    dob: 'Date of Birth',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {showModalConfirmation && (
        <ConfirmationModal onClose={handleClose} onSave={handleSaveAsDraft} />
      )}
      {loading && <Loading text="Loading..." />}
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col relative">
        <div className="flex flex-row justify-between p-4 sm:p-6 border-b border-gray-300 flex-shrink-0">
          <p className="text-lg font-bold text-black">Job Opening</p>
          <img
            onClick={() => setShowModalConfirmation(true)}
            className="w-6 h-6 cursor-pointer"
            src={closeIcon}
            alt="Close modal"
          />
        </div>

        <form onSubmit={formik.handleSubmit} ref={formRef} className="flex flex-col space-y-4 overflow-y-auto">
          <div className="px-4 sm:px-6 space-y-4 mt-4">
            <FormInputText
              label="Job Name"
              name="jobName"
              value={formik.values.jobName}
              onChange={(e) => formik.setFieldValue('jobName', e.target.value)}
              error={formik.errors.jobName}
              required
              placeholder="Ex. Front End Engineer"
            />
            <FormInputText
              label="Company Name"
              name="company_name"
              value={formik.values.company_name}
              onChange={(e) => formik.setFieldValue('company_name', e.target.value)}
              error={formik.errors.company_name}
              required
              placeholder="Ex. Rakamin"
            />
            <FormDropdown
              options={jobTypeOptions}
              label="Job Type"
              name="jobType"
              value={formik.values.jobType}
              onChange={(e) => formik.setFieldValue('jobType', e)}
              error={formik.errors.jobType}
              required
              placeholder="Select job type"
            />
            <FormInputTextArea
              label="Job Description"
              name="jobDescription"
              value={formik.values.jobDescription}
              onChange={(e) => {
                formik.setFieldValue('jobDescription', e.target.value);
              }}
              error={formik.errors.jobDescription}
              required
              placeholder="Ex. Write each responsibility on a new line"
            />
            <FormInputText
              label="Number of Candidate Needed"
              name="candidateNumber"
              value={formik.values.candidateNumber}
              onChange={(e) => Number(formik.setFieldValue('candidateNumber', e.target.value))}
              error={formik.errors.candidateNumber}
              required
              placeholder="Ex. 2"
            />
          </div>

          <hr className="border-t border-dashed border-gray-200 my-2" />
          <p className="text-black text-xs mt-4 px-4 sm:px-6">Job Salary</p>
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 px-4 sm:px-6">
            <div className="flex-1 w-full">
              <FormInputNumber
                label="Minimum Estimated Salary"
                name="salaryMin"
                value={formik.values.salaryMin}
                onChange={(e) => formik.setFieldValue('salaryMin', e.target.value)}
                error={formik.errors.salaryMin}
                required
                placeholder="7.000.000"
              />
            </div>
            <div className="hidden sm:block w-6 h-0.5 bg-gray-300 mt-10" />
            <div className="flex-1 w-full">
              <FormInputNumber
                label="Maximum Estimated Salary"
                name="salaryMax"
                value={formik.values.salaryMax}
                onChange={(e) => formik.setFieldValue('salaryMax', e.target.value)}
                error={formik.errors.salaryMax}
                required
                placeholder="8.000.000"
              />
            </div>
          </div>

          <hr className="border-t border-dashed border-gray-200 my-2" />
          <p className="px-4 sm:px-6 text-black text-sm font-medium mt-4">Minimum Profile Information Required</p>
          <div className="flex flex-col gap-2 px-4 sm:px-6">
            {Object.keys(formik.values.requirements).map((key, index) => (
              <div key={key}>
                <FormRadioButton
                  disabledOptions={disabledRequirementKeys.includes(key) ? ['off', 'optional'] : []}
                  value={formik.values.requirements[key as keyof typeof formik.values.requirements]}
                  onChange={(value) => formik.setFieldValue(`requirements.${key}`, value)}
                  name={key}
                  label={requirementLabels[key]}
                />
                {index < Object.keys(formik.values.requirements).length - 1 && (
                  <div className="w-full h-0.5 bg-gray-300 my-2" />
                )}
              </div>
            ))}
          </div>

          <div className="p-4 sm:p-6 border-t border-gray-300 flex justify-end">
            <button type="submit" className="bg-teal-600 text-sm text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-teal-700 transition-colors">
              Publish Job
            </button>
          </div>
        </form>

        {showScrollIndicator && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none flex items-end justify-center pb-4">
            <div className="animate-bounce">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalForm;