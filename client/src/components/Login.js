import React, { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
var ip = "isaa.ddns.net";
const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { email, password } = formData;
  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const onSubmit = async (e) => {
    e.preventDefault();
    var res = await axios.post("/api/login", {
      email,
      password,
    });
    console.log(res);
    localStorage.setItem("token", res.data.token);
    console.log(formData);
    window.open("/#/", "_self");
  };
  return (
    <Fragment>
      <section className="container">
        <h1 className="large text-primary">Sign In</h1>
        <p className="lead">
          <i className="fas fa-user"></i> Sign Into Your Account
        </p>
        <form className="form" onSubmit={(e) => onSubmit(e)}>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email Address"
              onChange={(e) => onChange(e)}
              value={email}
              name="email"
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              onChange={(e) => onChange(e)}
              name="password"
              value={password}
              minLength="6"
            />
          </div>
          <input type="submit" className="btn btn-primary" value="Login" s />
        </form>
        <p className="my-1">
          Don't have an account? <Link to="/register">Sign Up</Link>
        </p>
      </section>
    </Fragment>
  );
};
export default Login;
