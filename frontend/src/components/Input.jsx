import React from "react";
import "../styles/components/Input.css";

const Input = ({
  placeholder,
  id,
  type,
  defaultValue,
  maxSize = 100,
  handleChange,
  handleKeyDown,
  handleBlur,
  invalid,
  ...rest
}) => {
  return (
    <input
      placeholder={placeholder}
      id={id}
      defaultValue={defaultValue}
      type={type || "text"}
      maxLength={maxSize}
      onKeyDown={handleKeyDown}
      onChange={handleChange}
      onBlur={handleBlur}
      aria-invalid={invalid || undefined}
      className={invalid ? "input input-invalid" : "input"}
      {...rest}
    ></input>
  );
};

export default Input;
