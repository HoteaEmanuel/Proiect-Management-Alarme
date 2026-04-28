import React from "react";
import "../styles/components/Input.css";

const Input = ({
  placeholder,
  id,
  type,
  defaultValue,
  maxSize,
  handleChange,
  handleKeyDown,
  handleBlur,
  ...rest
}) => {
  console.log(handleChange, handleKeyDown, handleBlur);
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
      className="input"
      {...rest}
    ></input>
  );
};

export default Input;
