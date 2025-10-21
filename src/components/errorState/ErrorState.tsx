import type { ReactElement } from "react";

import type { ErrorStateProps } from "./types";

const ErrorState = ({
  message = "Something went wrong, please refresh the page.",
  onRetry,
}: ErrorStateProps): ReactElement => {
  const handleRefresh = () => {
    if (onRetry) onRetry();
    else window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full text-center py-12 px-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-14 h-14 text-red-500 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m0 3.75h.007v.008H12V16.5zM10.29 3.86l-7.5 13A1.125 1.125 0 003.5 18h17a1.125 1.125 0 00.97-1.64l-7.5-13a1.125 1.125 0 00-1.94 0z"
        />
      </svg>

      <p className="text-lg font-semibold text-gray-800 mb-2">
        Something went wrong
      </p>
      <p className="text-gray-600 text-sm mb-6">{message}</p>

      <button
        onClick={handleRefresh}
        className="bg-[#01777F] hover:bg-[#01666e] text-white font-semibold px-5 py-2.5 rounded-lg shadow transition-colors"
      >
        Refresh Page
      </button>
    </div>
  );
};

export default ErrorState;
