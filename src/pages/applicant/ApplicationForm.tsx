import { useEffect, useState, type ReactNode } from "react";
import { useFormik } from "formik";
import { useNavigate, type NavigateFunction, useParams } from "react-router-dom";

import backIcon from "../../assets/backIcon.png";
import photoAvatar from "../../assets/photoAvatar.png";
import UploadIcon from "../../assets/uploadIcon.png";
import succesFormImage from '../../assets/succesFormImage.png'
import {
  DomicilePicker,
  FormDatePicker,
  FormInputLinkvalidation,
  FormInputText,
  FormPhoneNumber,
  Loading,
  showErrorToast,
  showSuccessToast,
} from "../../components";
import { useJobStore } from "../../store/jobStore";

import "./styles.css";
import CapturePhotoModal from "./CapturePhotoModal";
import { buildValidationSchema } from "./utils";
import type { ApplicationForm as ApplicationFormType } from "./types";

const LoadingSection = (loading: boolean): ReactNode => {
  if (loading) return <Loading text="Loading..." />;
  return null;
};

const successScreen = (isSuccess: boolean, loading: boolean, navigate: NavigateFunction) => {
  if (!isSuccess || loading) return null;

  return (
    <div className="flex flex-col items-center gap-4">
      <img className="w-40 h-40" src={succesFormImage} alt="Success Form" />
      <p className="text-2xl font-bold text-black">🎉 Your application was sent!</p>
      <p className="text-base text-black text-center">
        Congratulations! You've taken the first step towards a rewarding career at Rakamin.
        <br />
        We look forward to learning more about you during the application process.
      </p>
      <button onClick={() => navigate("/", { replace: true })} className="bg-[#01959F] text-white py-2 px-4 rounded-lg font-bold w-1/2 cursor-pointer">
        Back to Menu
      </button>
    </div>
  )
}

const ApplicationForm = () => {
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const { job_id } = useParams();
  const navigate = useNavigate();
  const {
    selectedJob,
    fetchApplicationForm,
    applicationForm,
    loading,
    photoTemp,
    setPhotoTemp,
    insertApplicants,
  } = useJobStore();

  const formik = useFormik<ApplicationFormType>({
    initialValues: {
      full_name: "",
      photo_profile: photoTemp,
      gender: "",
      domicile: "",
      email: "",
      phone_number: "",
      linkedin_link: "",
      date_of_birth: new Date(),
    },
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: buildValidationSchema(applicationForm),
    onSubmit: (values) => {
      try {
        insertApplicants(values, photoTemp, selectedJob?.id || "");
        showSuccessToast();
        setPhotoTemp("");
        setIsSuccess(true);
      } catch {
        setIsSuccess(false);
        showErrorToast();
      }
    },
  });

  useEffect(() => {
    if (selectedJob) {
      fetchApplicationForm(selectedJob);
      if (job_id !== selectedJob.id) {
        navigate("/", { replace: true });
        window.location.reload();
      }
    } else {
      navigate("/", { replace: true });
      window.location.reload();
    }
  }, [selectedJob, fetchApplicationForm, navigate, job_id]);

  useEffect(() => {
    formik.values.photo_profile = photoTemp;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoTemp]);

  const PhotoSection = (isRequired: boolean, error?: string) => (
    <div className="text-black gap-2">
      {isRequired && <p className="font-bold text-xs text-red-600 pb-2">* Required</p>}
      <p className="font-bold text-xs mb-2">Photo Profile</p>

      <img
        className="w-32 h-32 my-2 rounded-md object-cover"
        src={photoTemp || photoAvatar}
        alt="Photo"
      />

      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="flex flex-row items-center justify-center gap-2 cursor-pointer py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition w-full sm:w-auto"
      >
        <img className="w-4 h-4" src={UploadIcon} alt="Upload" />
        <p className="font-medium text-sm text-center">Take a Picture</p>
      </button>

      <p className="text-xs text-red-600 mt-2">{error || ""}</p>
    </div>
  );

  const PronounSelector = (isRequired: boolean, error?: string) => (
    <div className="max-w-md">
      <label className="block mb-2 text-xs">
        <span className="text-black font-medium">Pronoun (gender)</span>
        {isRequired && <span className="text-red-500">*</span>}
      </label>

      <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="gender"
            value="female"
            checked={formik.values.gender === "female"}
            onChange={formik.handleChange}
            className="w-5 h-5 cursor-pointer accent-[#01959F]"
          />
          <span className="text-black text-sm sm:text-base">She/her (Female)</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="gender"
            value="male"
            checked={formik.values.gender === "male"}
            onChange={formik.handleChange}
            className="w-5 h-5 cursor-pointer accent-[#01959F]"
          />
          <span className="text-black text-sm sm:text-base">He/him (Male)</span>
        </label>
      </div>

      <p className="text-xs text-red-600 mt-2">{error || ""}</p>
    </div>
  );

  const orderedKeys = [
    "photo_profile",
    "full_name",
    "date_of_birth",
    "gender",
    "domicile",
    "phone_number",
    "email",
    "linkedin_link",
  ];

  const renderField = (key: string, isRequired: boolean) => {
    switch (key) {
      case "photo_profile":
        return <div key={key}>{PhotoSection(isRequired, formik.errors.photo_profile)}</div>;
      case "full_name":
        return (
          <FormInputText
            key={key}
            label="Full Name"
            name="full_name"
            required={isRequired}
            value={formik.values.full_name}
            onChange={formik.handleChange}
            error={formik.errors.full_name}
          />
        );
      case "date_of_birth":
        return (
          <FormDatePicker
            key={key}
            label="Date of Birth"
            required={isRequired}
            onChange={(e) => formik.setFieldValue(key, e)}
            value={formik.values.date_of_birth}
          />
        );
      case "gender":
        return <div key={key}>{PronounSelector(isRequired, formik.errors.gender)}</div>;
      case "domicile":
        return (
          <DomicilePicker
            key={key}
            label="Domicile"
            required={isRequired}
            name="domicile"
            value={formik.values.domicile}
            onChange={(name, value) => formik.setFieldValue(name, value)}
            error={formik.errors.domicile}
            touched={formik.touched.domicile}
          />
        );
      case "phone_number":
        return (
          <FormPhoneNumber
            key={key}
            label="Phone Number"
            required={isRequired}
            value={formik.values.phone_number}
            onChange={(e) => formik.setFieldValue(key, e)}
            error={formik.errors.phone_number}
          />
        );
      case "email":
        return (
          <FormInputText
            key={key}
            label="Email"
            required={isRequired}
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.errors.email}
          />
        );
      case "linkedin_link":
        return (
          <FormInputLinkvalidation
            key={key}
            label="Link LinkedIn"
            required={isRequired}
            name="linkedin_link"
            value={formik.values.linkedin_link}
            onChange={formik.handleChange}
          />
        );
      default:
        return null;
    }
  };

  const visibleFields = applicationForm.filter(
    (item) => item.validation?.required === true || item?.validation.required === "optional"
  );

  const orderedFields = orderedKeys
    .map((key) => visibleFields.find((f) => f.key === key))
    .filter(Boolean);

  return (
    <div
      className="
        w-full 
        max-h-dvh 
        bg-gray-50 
        flex justify-center items-center 
        overflow-hidden 
        fixed inset-0
      "
    >
      {LoadingSection(loading)}
      {showModal && <CapturePhotoModal setter={setShowModal} />}
      {successScreen(isSuccess, loading, navigate)}
      <form
        onSubmit={formik.handleSubmit}
        className={`
          ${isSuccess && !loading ? "hidden" : ""}
          w-full sm:w-4/5 lg:w-3/5 
          bg-white 
          border border-gray-300 
          flex flex-col 
          shadow-md
          overflow-hidden
          max-h-[95vh]
        `}
      >
        <div className="flex items-center gap-2 p-4 sm:p-6 bg-white sticky top-0 z-10">
          <img
            onClick={() => navigate(-1)}
            className="w-6 h-6 border border-gray-300 rounded-md p-0.5 cursor-pointer hover:bg-gray-100"
            src={backIcon}
            alt="Back"
          />
          <p className="font-bold text-base sm:text-lg text-black text-center sm:text-left">
            Apply {selectedJob?.title} at {selectedJob?.company_name}
          </p>
        </div>

        <div
          className="
            flex flex-col gap-6
            px-4 sm:px-8 
            py-6 sm:py-8 
            overflow-y-auto
            scrollbar-gutter-stable
          "
        >
          {orderedFields.map((field) =>
            renderField(field?.key || "", field?.validation?.required === true)
          )}
        </div>

        <div className="flex w-full justify-center border-t border-gray-200 bg-white py-4 sm:py-6 px-4 sm:px-8">
          <button
            type="submit"
            className="
              bg-[#01959F] hover:bg-[#018189]
              text-white font-semibold
              px-4 sm:px-6 py-2 sm:py-3
              rounded-lg w-full
              transition
            "
          >
            Submit Application
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApplicationForm;
