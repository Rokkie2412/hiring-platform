import * as Yup from "yup";

import type { JobFieldTyped } from '../../types'

export const buildValidationSchema = (applicationForm: JobFieldTyped[]) => {
  const shape: Record<string, Yup.AnySchema> = {};

  applicationForm.forEach((field) => {
    const isRequired = field?.validation?.required === true;

    switch (field.key) {
      case "full_name":
        shape.full_name = isRequired
          ? Yup.string().required("Full name is required")
          : Yup.string();
        break;

      // case "photo_profile":
      //   shape.photo_profile = isRequired
      //     ? Yup.string().required("Photo profile is required")
      //     : Yup.string();
      //   break;

      case "gender":
        shape.gender = isRequired
          ? Yup.string().oneOf(["male", "female"]).required("Gender is required")
          : Yup.string().nullable();
        break;

      case "domicile":
        shape.domicile = isRequired
          ? Yup.string().required("Domicile is required")
          : Yup.string().nullable();
        break;

      case "email":
        shape.email = isRequired
          ? Yup.string().email("Invalid email format").required("Email is required")
          : Yup.string().email("Invalid email format");
        break;

      case "phone_number":
        shape.phone_number = isRequired
          ? Yup.string()
              .matches(/^[0-9+]+$/, "Invalid phone number")
              .required("Phone number is required")
          : Yup.string().nullable();
        break;

      case "linkedin_link":
        shape.linkedin_link = isRequired
          ? Yup.string()
              .url("Invalid LinkedIn URL")
              .required("LinkedIn link is required")
          : Yup.string().url("Invalid LinkedIn URL").nullable();
        break;

      case "date_of_birth":
        shape.date_of_birth = isRequired
          ? Yup.date().required("Date of birth is required")
          : Yup.date().nullable();
        break;

      default:
        break;
    }
  });

  return Yup.object().shape(shape);
};
