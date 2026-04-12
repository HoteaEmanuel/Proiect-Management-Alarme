import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Input from "../../../components/Input";
import Button from "../../../components/Button";

import { FaEye } from "react-icons/fa";

import { FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { authApi } from "../api/auth.api";

import "../../../styles/features/auth/components/LoginForm.css";

const LoginForm = () => {
  const navigate = useNavigate();

  const { login } = authApi;
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const [passwordVisible, setPasswordVisible] = useState(false);
  // const [error, setError] = useState(undefined);
  const { setAuth} = useAuthStore();
  const onSubmit = async (data) => {
    try {
      const response = await login(data);
      console.log(response);
      setAuth(response.user,response.access_token);
      reset();
      navigate("/dashboard");
      
    } catch (err) {
      setError("server",{
        message:err.response.data.detail
      });
    }
  };

  console.log(errors);
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="login-form"
    >
      <h1 className="login-form-title">Log in</h1>

      {errors.server && <p className="login-form-error"> {errors.server.message}</p>}

      <label htmlFor="username" className="login-form-label">
        Username
      </label>

      {errors.username && (
        <p className="login-form-error">{errors.username.message}</p>
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

      <label htmlFor="password" className="login-form-label">
        Password
      </label>

      <div className="login-form-password">
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
          />
        </div>

        {passwordVisible ? (
          <FaEyeSlash
            className="login-form-password-icon"
            onClick={() => setPasswordVisible(passwordVisible ? false : true)}
          />
        ) : (
          <FaEye
            className="login-form-password-icon"
            onClick={() => setPasswordVisible(passwordVisible ? false : true)}
          />
        )}
      </div>

      <button className="login-form-button">
        {isSubmitting ? "Submitting... " : "Log in"}
      </button>
    </form>
  );
};

export default LoginForm;
