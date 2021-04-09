import React, { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

class Verify extends React.Component {
  state = { isLoading: true, found: false };
  checkValidity = async () => {
    try {
      var res = await axios.post(
        "/api/verifyExistance/" + this.props.match.params.id
      );
      console.log(res.data);
    } catch (err) {
      this.setState({ isLoading: false });
      console.log(err.response, err);
    }
    try {
      res = await axios.get("/api/verify/" + this.props.match.params.id);
      console.log(res.data);
      this.setState({ isLoading: false, found: true });
    } catch (err) {
      this.setState({ isLoading: false });
      console.log(err.response, err);
    }
  };
  componentDidMount() {
    this.checkValidity();
  }
  render() {
    return (
      <Fragment>
        {!this.state.isLoading ? (
          <Fragment>
            {this.state.found ? (
              <img src={"/api/verify/" + this.props.match.params.id}></img>
            ) : (
              <p>The link is bogus or Data Tampered</p>
            )}
          </Fragment>
        ) : (
          <p>Loading Your Certificate</p>
        )}
      </Fragment>
    );
  }
}
export default Verify;
