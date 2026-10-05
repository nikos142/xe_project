import React from "react";
import InputContainer from "../components/InputContainer";
import { PropertySchema } from "@xe/shared";

const PROPERTY_TYPES = PropertySchema.shape.type.options;

const SelectBox = ({ onChange, type, error, errorText }: SelectBoxProps) => {
  return (
    <InputContainer type="type" label="Type*">
      <select
        className="input"
        id="type"
        onChange={onChange}
        required
        value={type}
      >
        {/* <option value={"Buy"}>Buy</option>
        <option value={"Rent"}>Rent</option>
        <option value={"Exchange"}>Exchange</option>
        <option value={"Donation"}>Donation</option> */}
        {PROPERTY_TYPES.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
      {error && <span className="errorText">{errorText}</span>}
    </InputContainer>
  );
};

export default SelectBox;

interface SelectBoxProps {
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  type: string;
  error: boolean;
  errorText?: string;
}
