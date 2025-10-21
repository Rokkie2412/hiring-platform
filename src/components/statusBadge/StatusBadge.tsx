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

const TEXT_VARIANT = {
  active: "Active",
  inactive: "Inactive",
  draft: "Draft",
}

const StatusBadge = (props: StatusBadgeProps): ReactElement => {
  const style = STATUS_STYLES[props.type.toLowerCase() as StatusType];

  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-0.5 rounded-md text-xs font-semibold border ${style.border} ${style.text} ${style.bg}`}
    >
      {TEXT_VARIANT[props.type.toLowerCase() as StatusType]}
    </span>
  );
};

export default StatusBadge;
