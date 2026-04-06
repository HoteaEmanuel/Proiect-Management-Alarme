import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Input from "../../../components/Input";
import Button from "../../../components/Button";

import { FaEye } from "react-icons/fa";

import { FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { authApi } from "../api/auth.api";

const LoginForm = () => {
  const navigate = useNavigate();

  const { login } = authApi;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const [passwordVisible, setPasswordVisible] = useState(false);
  const { user, setUser } = useAuthStore();
  
  const onSubmit = (data) => {
    login(data);
    console.log("AUTH USER: ");
    console.log(user);
    reset();
    navigate("/dashboard");
  };

  console.log(errors);
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className=" w-2/3 h-2/3 md:w-1/4 md:h-1/2  flex flex-col justify-center items-center gap-4 border-2 rounded-2xl p-4 shadow-2xl has-focus:border-blue-800"
    >
      <h1 className="heading">Log in</h1>
      <label htmlFor="username" className="w-full text-left">
        Username
      </label>

      {errors.username && (
        <p className="text-red-500 w-full">{errors.username.message}</p>
      )}
      <Input
        {...register("username", {
          required: true,
          // pattern: { value: /\S+@\S+/, message: "Invalid email" },
          validate: (username) => {
            if (username.length > 100 || username.length < 3)
              return "Username must be between 3-100 characters";
            return true;
          },
          maxLength: 100,
        })}
        placeholder={"johndoe"}
        id={"username"}
      />

      <label htmlFor="password" className="w-full text-left">
        Password
      </label>
      <div className="relative w-full ">
        <div>
          <Input
            {...register("password", {
              required: true,
              minLength: 7,
              maxLength: 100,
              validate: (value) => {
                if (value.lenght > 100)
                  return "The password should have less than 100 characters";
                return;
              },
            })}
            id={"password"}
            type={passwordVisible ? "text" : "password"}
            style={{ paddingRight: "20px" }}
          />
        </div>
        {passwordVisible ? (
          <FaEyeSlash
            className="absolute top-1/3 right-1 cursor-pointer"
            onClick={() => setPasswordVisible(passwordVisible ? false : true)}
          />
        ) : (
          <FaEye
            className="absolute top-1/3 right-1 cursor-pointer"
            onClick={() => setPasswordVisible(passwordVisible ? false : true)}
          />
        )}
      </div>

      <button className="btn w-1/2">
        {isSubmitting ? "Submitting... " : "Log in"}
      </button>
    </form>
  );
};

export default LoginForm;
