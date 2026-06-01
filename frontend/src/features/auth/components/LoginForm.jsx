import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Input from "../../../components/Input";
import Button from "../../../components/Button";

import { FaEye } from "react-icons/fa";

import { FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import useAuthStore from "@store/authStore";
import { authApi } from "../api/auth.api";

import "@styles/features/auth/components/LoginForm.css";
import { RiLoader2Fill } from "react-icons/ri";
import { toast } from "sonner";

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
  const [error, setError] = useState(undefined);
  const { setAuth } = useAuthStore();
  const onSubmit = async (data) => {
    setError(null);
    try {
      const response = await login(data);
      setAuth(response.user, response.access_token);
      reset();
      navigate("/dashboard");
    } catch (e) {
      console.log(e);
      setError("Invalid username or password");
      toast.error("Failed to login - invalid username or password");
    }
  };

  console.log(errors);
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="login-form">
      <h1 className="login-form-title">Log in</h1>
      {error && <p className="login-form-error">{error}</p>}
      {errors && <p className="login-form-error"> {errors.message}</p>}

      <label htmlFor="username" className="login-form-label">
        Username
      </label>

      <Input
        {...register("username", {
          required: "Username is required",
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
              required: "Password is required",
              minLength: 7,
              maxLength: 100,
              validate: (value) => {
                if (value.length > 100)
                  return "The password should have less than 100 characters";
                return true;
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

      <Button
        className="login-form-button"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <div className="flex gap-2 items-center">
            <RiLoader2Fill className="size-4 animate-spin" />
            Submitting...
          </div>
        ) : (
          "Log in"
        )}
      </Button>
    </form>
  );
};

export default LoginForm;
