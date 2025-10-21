import { Slide, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import CloseIcon from "../../assets/close.png";

import "./CustomToast.css";

const showSuccessToast = (message = "Job vacancy successfully created") => {
  toast.success(message, {
    position: "bottom-left",
    hideProgressBar: true,
    transition: Slide,
    icon: false,
    className: "custom-toast",
    closeButton: ({ closeToast }) => (
      <img
        src={CloseIcon}
        alt="close"
        className="custom-toast-close"
        width={16}
        height={16}
        onClick={closeToast}
      />
    ),
  });
};

const showErrorToast = (message = "Failed to create job vacancy") => {
  toast.error(message, {
    position: "bottom-left",
    hideProgressBar: true,
    transition: Slide,
    icon: false,
    className: "custom-error-toast",
    closeButton: ({ closeToast }) => (
      <img
        src={CloseIcon}
        alt="close"
        className="custom-error-toast-close"
        width={16}
        height={16}
        onClick={closeToast}
      />
    ),
  });
};

export { showSuccessToast, showErrorToast };
