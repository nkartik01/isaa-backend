import React, { Component, Fragment } from "react";
import { render } from "react-dom";
import { Row } from "react-bootstrap";
import ReactRegionSelect from "react-region-select";
import RegionSelect from "./RegionSelect";
import objectAssign from "object-assign";
import Axios from "axios";
var ip = "isaa.ddns.net";
class TagImg extends Component {
  constructor(props) {
    super(props);
    this.regionRenderer = this.regionRenderer.bind(this);
    this.onChange = this.onChange.bind(this);
    this.state = {
      textBox: {},
      fields: [],
      regions: [],
    };
  }
  getFields = async () => {
    console.log(this.props);
    var res = await Axios.get(
      "/api/" + localStorage.getItem("status") + "/getFields/" + this.props.csv,
      {
        headers: { "x-auth-token": localStorage.getItem("token") },
      }
    );
    console.log(res.data);
    this.setState({ fields: res.data });
  };
  onChange(regions) {
    this.setState({
      regions: regions,
    });
  }
  componentDidMount() {
    this.getFields();
  }
  changeRegionData(index, event) {
    const region = this.state.regions[index];
    let color;
    switch (event.target.value) {
      case "1":
        color = "rgba(0, 255, 0, 0.5)";
        break;
      case "2":
        color = "rgba(0, 0, 255, 0.5)";
        break;
      case "3":
        color = "rgba(255, 0, 0, 0.5)";
        break;
      default:
        color = "rgba(0, 0, 0, 0.5)";
    }

    region.data.regionStyle = {
      background: color,
    };
    this.onChange([
      ...this.state.regions.slice(0, index),
      objectAssign({}, region, {
        data: objectAssign({}, region.data, { dataType: event.target.value }),
      }),
      ...this.state.regions.slice(index + 1),
    ]);
  }
  regionRenderer(regionProps) {
    if (!regionProps.isChanging) {
      return (
        <div style={{ position: "absolute", right: 0, bottom: "-1.5em" }}>
          <select
            onChange={(event) =>
              this.changeRegionData(regionProps.index, event)
            }
            value={regionProps.data.dataType}
          >
            <option default value={0}>
              Choose
            </option>
            {this.state.fields.map((field) => {
              return <option value={field}>{field}</option>;
            })}
          </select>
        </div>
      );
    }
  }
  SaveCoordinates = () => {
    try {
      if (!this.state.regions[0].data.dataType) {
        alert("Choose a field");
      } else {
        this.state.textBox[
          this.state.regions[0].data.dataType
        ] = this.state.regions[0];
        console.log(this.state.textBox);
        this.setState({ regions: [] });
      }
    } catch (err) {}
  };
  SendCoordinate = async () => {
    try {
      var name = document.getElementById("name").value;
      if (name.length === 0) {
        return alert("Name cant be empty");
      }
      var msg = document.getElementById("msg").value;
      if (msg.length === 0) {
        return alert("Message Cant be Empty");
      }
      console.log(this.state.textBox);
      var body = { name: name, msg: msg };
      body.cert = this.props.path;
      body.csv = this.props.csv;
      body.coordinates = [];
      var keys = Object.keys(this.state.textBox);
      for (var i = 0; i < keys.length; i++) {
        body.coordinates.push({
          fieldName: keys[i],
          x: this.state.textBox[keys[i]].x * 12,
          y: this.state.textBox[keys[i]].y * 6,
          width: this.state.textBox[keys[i]].width * 12,
          height: this.state.textBox[keys[i]].height * 6,
        });
      }
      var res = await Axios.post(
        "/api/" + localStorage.getItem("status") + "/saveCoordinates",
        body,
        {
          headers: { "x-auth-token": localStorage.getItem("token") },
        }
      );
      console.log(res);
      res = await Axios.post(
        "/api/" + localStorage.getItem("status") + "/putName/" + res.data._id,
        {},
        {
          headers: { "x-auth-token": localStorage.getItem("token") },
        }
      );
      console.log(res);
      alert(
        "Process Initiated. Sending Mails Now. Thank you for Using this site."
      );
      localStorage.removeItem("token");
      window.location.reload(false);
    } catch (err) {
      console.log(err);
      alert("Something went wrong.");
    }
  };
  render() {
    const regionStyle = {
      background: "rgba(255, 0, 0, 0.5)",
    };
    var textBoxKeys = Object.keys(this.state.textBox);
    return (
      <Fragment>
        <Fragment>
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <input type="text" id="name" placeholder="Enter Event Name" />
            <input
              type="text"
              id="msg"
              placeholder="Enter message to be sent"
            />
            <input type="email" id="email" placeholder="Feedback Email"></input>
          </form>
          <div style={{ display: "flex" }}>
            <div style={{ flexGrow: 1, flexShrink: 1, width: "50%" }}>
              <RegionSelect
                maxRegions={1}
                regions={this.state.regions}
                regionStyle={regionStyle}
                constraint
                onChange={this.onChange}
                regionRenderer={this.regionRenderer}
                style={{ border: "1px solid black" }}
              >
                <img
                  src={"/api/sendImage/" + this.props.path}
                  width="1164"
                  height="800"
                />
              </RegionSelect>
            </div>
          </div>
          <button
            onClick={() => {
              this.SaveCoordinates();
            }}
          >
            Set Box
          </button>
          <button
            onClick={() => {
              this.SendCoordinate();
            }}
          >
            Submit Details
          </button>
          <div>
            {textBoxKeys.length > 0 ? (
              <Fragment>
                <h3>Selected Boxes</h3>
                <div>
                  <ul>
                    {Object.keys(this.state.textBox).map((box) => {
                      console.log(this.state.textBox[box]);
                      return (
                        <li>{`${box} (${this.state.textBox[box].x}+${this.state.textBox[box].width},${this.state.textBox[box].y}+${this.state.textBox[box].height})`}</li>
                      );
                    })}
                  </ul>
                </div>
              </Fragment>
            ) : null}
          </div>
          <p>Select something with your mouse on the left side</p>
        </Fragment>
      </Fragment>
    );
  }
}

export default TagImg;
