import { useFormik } from "formik";
import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import backIcon from "../../assets/backIcon.png";
import { showErrorToast, showSuccessToast } from '../../components/'
import photoAvatar from "../../assets/photoAvatar.png";
import UploadIcon from "../../assets/uploadIcon.png";
import {
  DomicilePicker,
  FormDatePicker,
  FormInputLinkvalidation,
  FormInputText,
  FormPhoneNumber,
  LoadingLayer,
} from "../../components";
import { useJobStore } from "../../store/jobStore";

import CapturePhotoModal from "./CapturePhotoModal";
import "./styles.css";
import { buildValidationSchema } from "./utils";
import type { ApplicationForm } from "./types";

const Loading = (loading: boolean): ReactNode => {
  if (loading) return <LoadingLayer text="Loading..." />;
  return null;
};

const ApplicationForm = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const navigate = useNavigate();
  const { selectedJob, fetchApplicationForm, applicationForm, loading, photoTemp, setPhotoTemp, insertApplicants } = useJobStore();

  const formik = useFormik<ApplicationForm>({
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
        insertApplicants(values, photoTemp, selectedJob?.id || '')
        showSuccessToast()
        setPhotoTemp("")
        navigate("/")
      } catch (error) {
        showErrorToast()
      }
    },
  });

  useEffect(() => {
    if (selectedJob) {
      fetchApplicationForm(selectedJob);
    } else {
      navigate("/");
      window.location.reload();
    }
  }, [selectedJob, fetchApplicationForm, navigate]);

  useEffect(() => {
    formik.values.photo_profile = photoTemp
  }, [photoTemp])

  const PhotoSection = (isRequired: boolean, error?: string) => (
    <div className="text-black mt-6 gap-2">
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
        className="flex flex-row items-center gap-2 cursor-pointer py-1 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
      >
        <img className="w-4 h-4" src={UploadIcon} alt="Upload" />
        <p className="font-medium text-sm">Take a Picture</p>
      </button>
      <p className="text-xs text-red-600 mt-2">{error || ''}</p>
    </div>
  );

  const PronounSelector = (isRequired: boolean, error?: string) => (
    <div className="max-w-md">
      <label className="block mb-2 text-xs">
        <span className="text-black font-medium">Pronoun (gender)</span>
        {isRequired && <span className="text-red-500">*</span>}
      </label>
      <div className="flex gap-8">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="gender"
            value="female"
            checked={formik.values.gender === "female"}
            onChange={formik.handleChange}
            className="w-5 h-5 cursor-pointer accent-teal-700"
          />
          <span className="text-black">She/her (Female)</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="gender"
            value="male"
            checked={formik.values.gender === "male"}
            onChange={formik.handleChange}
            className="w-5 h-5 cursor-pointer accent-teal-700"
          />
          <span className="text-black">He/him (Male)</span>
        </label>
      </div>
      <p className="text-xs text-red-600 mt-2">{error || ''}</p>
    </div>
  );

  // Urutan field sesuai tampilan di gambar
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

  // Filter visible fields
  const visibleFields = applicationForm.filter(
    (item) => item.validation?.required === true || item?.validation.required === "optional"
  );

  // Urutkan sesuai orderedKeys
  const orderedFields = orderedKeys
    .map((key) => visibleFields.find((f) => f.key === key))
    .filter(Boolean);

  return (
    <div className="w-full h-full bg-white flex flex-col items-center justify-center">
      {Loading(loading)}
      {showModal && <CapturePhotoModal setter={setShowModal} />}

      <form
        onSubmit={formik.handleSubmit}
        className="h-[90%] w-3/5 bg-white border border-gray-300 flex flex-col rounded shadow-sm"
      >
        {/* Header */}
        <div className="flex flex-row items-center text-black gap-2 pt-10 px-10">
          <img
            onClick={() => navigate("/")}
            className="w-6 h-6 border border-gray-300 rounded-lg p-0.5 cursor-pointer"
            src={backIcon}
            alt="Back"
          />
          <p className="font-bold text-lg">
            {`Apply ${selectedJob?.title} at ${selectedJob?.company_name}`}
          </p>
        </div>

        {/* Field Area */}
        <div className="flex flex-col overflow-y-auto h-full mx-16 space-y-4 pb-10">
          {orderedFields.map((field) =>
            renderField(
              field?.key || "",
              field?.validation?.required === true
            )
          )}
        </div>

        {/* Submit */}
        <div className="flex flex-row justify-center items-end border-t py-6 px-10 border-gray-300">
          <button
            type="submit"
            className="bg-teal-700 text-white px-4 py-2 rounded font-bold w-full hover:bg-teal-800 transition"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApplicationForm;
