// import ReactFileReader from "react-file-reader";
import React, { Fragment } from "react";
import axios from "axios";
import TagImg from "./Tag1";
import { Redirect } from "react-router-dom";
class Landing extends React.Component {
  state = {};
  handleChange = (name) => (event) => {
    const value = event.target.files[0];
    console.log(name, value);
    if (name === "csv") {
      this.formData1.set(name, value);
      console.log(1);
    } else {
      this.formData2.set(name, value);
    }
    this.state[name] = value;
    console.log(this.state);
  };
  formData1 = new FormData();
  formData2 = new FormData();
  uploadCSV = async (e) => {
    e.preventDefault();
    let data = this.formData1;
    console.log(this.state.csv);
    data.csv = this.state.csv;
    console.log(data);
    var res = await axios.post(
      "/api/" + localStorage.getItem("status") + "/saveCSV",
      data,
      {
        headers: {
          "x-auth-token": localStorage.getItem("token"),
          "Content-Type": "application/json",
        },
      }
    );
    console.log(res);
    var res1 = await axios.get(
      "/api/" +
        localStorage.getItem("status") +
        "/getFields/" +
        res.data.csvFile,
      {
        headers: { "x-auth-token": localStorage.getItem("token") },
      }
    );
    res1 = res1.data;
    if (res1.indexOf("email") === -1) {
      return alert("'email' Field is not available in CSV.");
    }
    // this.setState({ fields: res.data });
    this.state.uuid = res.data.uuid;
    this.state.csvFile = res.data.csvFile;
    document.getElementById("csvForm").hidden = true;
    document.getElementById("certForm").hidden = false;
  };
  uploadCert = async (e) => {
    e.preventDefault();
    let data = this.formData2;
    var ext = this.state.cert.name.split(".")[
      this.state.cert.name.split(".").length - 1
    ];
    console.log(ext);
    // data.append("cert", this.state.cert);

    var config = {
      headers: {
        "x-auth-token": localStorage.getItem("token"),
        extension: ext,
      },
    };
    console.log(data);
    var res = await axios.post(
      "/api/" + localStorage.getItem("status") + "/saveCert/" + this.state.uuid,
      data,
      config
    );
    console.log(res);
    this.state.certFile = res.data.certFile;
    document.getElementById("csvForm").hidden = true;
    document.getElementById("certForm").hidden = true;
    this.setState({ a: "a" });
  };

  render() {
    return (
      <Fragment>
        {!localStorage.getItem("token") ? (
          <Redirect to="/login" />
        ) : (
          <Fragment>
            {/* <img src="http://"+ip+":5000/verify/5f394d9882277871f882ede4"></img> */}

            <form id="csvForm">
              <label>Upload CSV here</label>
              <div className="form-group">
                <label className="btn btn-block btn-success">
                  <input
                    onChange={this.handleChange("csv")}
                    type="file"
                    name="csv"
                    accept=".csv"
                    placeholder="chooseAFile"
                  />
                </label>
              </div>
              <button
                onClick={(e) => this.uploadCSV(e)}
                className="btn btn-success m-3"
              >
                Upload CSV
              </button>
            </form>
            <form id="certForm" hidden>
              <div className="form-group">
                <label>Upload Certificate pic here</label>
                <input
                  onChange={this.handleChange("cert")}
                  type="file"
                  name="cert"
                  accept="image/*"
                  placeholder="chooseAFile"
                />
              </div>
              <button
                className="btn"
                onClick={(e) => {
                  this.uploadCert(e);
                }}
              >
                Upload
              </button>
            </form>
            {this.state.certFile ? (
              <TagImg
                hidden
                path={this.state.certFile}
                csv={this.state.csvFile}
              />
            ) : null}
          </Fragment>
        )}
      </Fragment>
    );
  }
}
export default Landing;
