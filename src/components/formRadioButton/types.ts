import type { RequirementOption } from '../../types'

export type RequirementToggleProps =  {
  value?: RequirementOption;
  onChange: (value: RequirementOption) => void;
  label?: string;
  disabled?: boolean;
  disabledOptions?: RequirementOption[];
  name?: string;
  defaultValue?: RequirementOption;
}