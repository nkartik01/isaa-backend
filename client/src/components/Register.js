import React, { Fragment, useState } from "react";
import { Link } from "react-router-dom";
// import { connect } from "react-redux";
// import { setAlert } from "../../actions/alert";
import axios from "axios";
var ip = "isaa.ddns.net";
const Register = (props) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password2: "",
    school: "SCSE",
  });
  const { name, email, password, password2, school } = formData;
  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== password2) {
      alert("Passwords do not match");
    } else {
      console.log("Success!");
      var res = await axios.post("http://" + ip + ":5000/register", {
        name,
        email,
        password,
        school,
      });
      console.log(res);

      localStorage.setItem("token", res.data.token);
      window.open("/", "_self");
    }
  };
  return (
    <Fragment>
      <section className="container">
        <h1 className="large text-primary">Sign Up</h1>
        <p className="lead">
          <i className="fas fa-user"></i> Create Your Account
        </p>
        <form className="form" onSubmit={(e) => onSubmit(e)}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Name"
              onChange={(e) => onChange(e)}
              name="name"
              value={name}
              required
            />
          </div>
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
          <div className="form-group">
            <input
              type="password"
              placeholder="Confirm Password"
              onChange={(e) => onChange(e)}
              name="password2"
              value={password2}
              minLength="6"
            />
          </div>
          <div className="form-group">
            <select
              onChange={(e) => onChange(e)}
              name="school"
              value={school}
              required
            >
              <option value="SCOPE">SCOPE</option>
              <option value="SENSE">SENSE</option>
              <option value="SAS">SAS</option>
              <option value="VITSOL">VITSOL</option>
            </select>
          </div>
          <input type="submit" className="btn btn-primary" value="Register" />
        </form>
        <p className="my-1">
          Already have an account? <Link to="login">Sign In</Link>
        </p>
      </section>
    </Fragment>
  );
};
export default Register;
