import React, { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { loadImage } from "canvas";
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
    var res;
    try {
      res = await axios.post("/api/studentLogin", {
        email,
        password,
      });
      console.log(res.status);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("status", "student");
    } catch (err) {
      console.log(err.response);
      if (err.response.status === 400) {
        try {
          res = await axios.post("/api/studentLogin", {
            email,
            password,
          });
          console.log(res.status);
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("status", "teacher");
        } catch (error) {
          console.log(error.response);
          alert("Invalid Credentials");
          return;
        }
      }
    }
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
