import React, { Fragment } from "react";
import axios from "axios";
import { Redirect } from "react-router-dom";
// import CanvasJS from "canvasjs";
import BarChart from "react-bar-chart";

// import { report } from "../../../functions/api";
var ip = "isaa.ddns.net";
class Report extends React.Component {
  state = {
    inSchoolTab: "all",
    isLoading: true,
    tab: "personal",
    data: [],
  };
  getPersonalStats = async () => {
    var res = await axios.get("/api/getPersonalReport", {
      headers: { "x-auth-token": localStorage.getItem("token") },
    });
    console.log(res.data);
    res = res.data;
    var dates = Object.keys(res);
    var data = [];
    for (var i = 0; i < dates.length; i++) {
      console.log(res[dates[i]]);
      var objs = Object.keys(res[dates[i]]);
      console.log(objs);
      var sum = 0;
      for (var j = 0; j < objs.length; j++) {
        console.log(res[dates[i]][objs[j]]);
        for (var k = 0; k < res[dates[i]][objs[j]].length; k++) {
          sum = sum + res[dates[i]][objs[j]][k].count;
        }

        data.unshift({ text: [objs[j]], value: sum });
      }
    }
    console.log(data);
    // console.log(options);
    // var chart = new CanvasJS.Chart("chartContainer", options);

    this.setState({ isLoading: false, reports: res, data: data });
    // chart.render();
  };
  getSchoolStats = async () => {
    var res = await axios.get("/api/getSchoolReport/SCSE");
    res = res.data;
    console.log(res);
    var dates = Object.keys(res.date);
    var data = [];
    for (var i = 0; i < dates.length; i++) {
      console.log(res.date[dates[i]]);
      var objs = Object.keys(res.date[dates[i]]);
      console.log(objs);
      var sum = 0;
      for (var j = 0; j < objs.length; j++) {
        console.log(res.date[dates[i]][objs[j]]);
        for (var k = 0; k < res.date[dates[i]][objs[j]].length; k++) {
          sum = sum + res.date[dates[i]][objs[j]][k].count;
        }

        data.unshift({ text: [objs[j]], value: sum });
      }
    }
    this.state.scse = data;
    res = await axios.get("/api/getSchoolReport/SCOPE");
    console.log(res.data);
    res = await axios.get("/api/getSchoolReport/SENCE");
    this.state.sense = res.data;
    res = await axios.get("/api/getSchoolReport/SAS");
    this.state.sas = res.data;
    res = await axios.get("/api/getSchoolReport/VITSOL");
    this.state.vitsol = res.data;
    console.log(this.state);
    // res = await axios.get("/api/getSchoolReport/SCSE");
    // this.state.=res.data;
  };
  onChange = (e) => {
    e.preventDefault();
    this.setState({ [e.target.id]: e.target.value });
    if (e.target.value === "personal") {
      this.getPersonalStats();
    } else {
      this.getSchoolStats();
    }
  };
  componentDidMount() {
    this.getPersonalStats();
  }
  render() {
    const { tab, reports, isLoading, data, inSchoolTab } = this.state;
    console.log(reports);
    return (
      <Fragment>
        {isLoading ? null : (
          <Fragment>
            <select
              className="custom-select"
              value={tab}
              onChange={(e) => this.onChange(e)}
              name="tab"
              id="tab"
              required
            >
              <option value="personal">Personal</option>
              <option value="school">School</option>
            </select>

            {tab === "personal" ? (
              <Fragment>
                <BarChart
                  data={data}
                  ylabel="Quantity"
                  margin={{ top: 20, right: 20, bottom: 30, left: 40 }}
                  width={500}
                  height={500}
                />
              </Fragment>
            ) : (
              <Fragment>
                <h3>School</h3>
                <select
                  className="custom-select"
                  value={inSchoolTab}
                  onChange={(e) => this.onChange(e)}
                  id="inSchoolTab"
                  name="inSchoolTab"
                >
                  <option value="all">All</option>
                  <option value={"scse"}>SCSE</option>
                </select>
                {inSchoolTab === "all" ? <Fragment></Fragment> : null}
              </Fragment>
            )}
          </Fragment>
        )}
      </Fragment>
    );
  }
}
export default Report;
