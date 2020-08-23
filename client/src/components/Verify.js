import React, { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
var ip = "isaa.ddns.net";
const Verify = (props) => {
  return (
    <img src={"http://" + ip + ":5000/verify/" + props.match.params.id}></img>
  );
};
export default Verify;
