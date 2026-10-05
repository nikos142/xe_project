import { PropertySchema } from "@xe/shared";

const PROPERTY_TYPES = PropertySchema.shape.type.options;

const SelectBox = ({ error, errorText, ...props }: SelectBoxProps) => {
  return (
    <>
      <select aria-label="Type" className="input" {...props}>
        {PROPERTY_TYPES.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
      {error && <span className="errorText">{errorText}</span>}
    </>
  );
};

export default SelectBox;

interface SelectBoxProps extends React.ComponentProps<"select"> {
  error: boolean;
  errorText?: string;
}
