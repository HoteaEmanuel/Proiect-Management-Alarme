import React from "react";
import LoginForm from "../../features/auth/components/LoginForm.jsx";
import "../../styles/auth/Login.css";

const Login = () => {
  return (
    <div className="login-page">
      <LoginForm />
    </div>
  );
};

export default Login;
