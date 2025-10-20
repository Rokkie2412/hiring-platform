import { Slide, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CloseIcon from "../../assets/close.png";
import "./CustomToast.css";

const showSuccessToast = () => {
  toast.success("Job vacancy successfully created", {
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

// Fungsi baru untuk Error Toast
const showErrorToast = (message: string = "Failed to create job vacancy") => {
  toast.error(message, {
    position: "bottom-left",
    hideProgressBar: true,
    transition: Slide,
    icon: false,
    className: "custom-error-toast", // Menggunakan kelas CSS yang berbeda
    closeButton: ({ closeToast }) => (
      <img
        src={CloseIcon}
        alt="close"
        className="custom-error-toast-close" // Kelas CSS untuk tombol close
        width={16}
        height={16}
        onClick={closeToast}
      />
    ),
  });
};

export {
  showSuccessToast,
  showErrorToast,
}