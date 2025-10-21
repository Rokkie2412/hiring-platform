import type { ReactElement } from "react";

import type { StatusType, StatusBadgeProps } from "./types";

const STATUS_STYLES: Record<
  StatusType,
  { border: string; text: string; bg: string }
> = {
  active: {
    border: "border-green-600",
    text: "text-green-700",
    bg: "bg-green-50",
  },
  inactive: {
    border: "border-red-500",
    text: "text-red-600",
    bg: "bg-red-50",
  },
  draft: {
    border: "border-amber-400",
    text: "text-amber-500",
    bg: "bg-amber-50",
  },
};

const TEXT_VARIANT: Record<StatusType, string> = {
  active: "Active",
  inactive: "Inactive",
  draft: "Draft",
};

const StatusBadge = ({ type }: StatusBadgeProps): ReactElement => {
  const normalizedType = type.toLowerCase() as StatusType;
  const style = STATUS_STYLES[normalizedType];

  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-0.5 rounded-md text-xs font-semibold border ${style.border} ${style.text} ${style.bg}`}
    >
      {TEXT_VARIANT[normalizedType]}
    </span>
  );
};

export default StatusBadge;
