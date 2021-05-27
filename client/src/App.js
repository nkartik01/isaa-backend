import React from "react";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import "./App.css";
import Landing from "./components/Landing";
import Login from "./components/Login";
import Register from "./components/Register";
import Verify from "./components/Verify";
import Report from "./components/Report";

// import ContactUs from "./components/Email";
// import Email from "./components/Email";
// import Email2 from "./components/Email2";
class App extends React.Component {
  handleFiles = (files) => {
    var reader = new FileReader();
    reader.onload = function (e) {
      // Use reader.result
      alert(reader.result);
    };
    reader.readAsText(files[0]);
  };
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h2>Kartik Narang 18BCE1199</h2>
          <h2>Sumit Ajmera 18BCE1233</h2>
          <h2>Aadhitya Swarnesh 18BCE1087</h2>
          <Router>
            <Switch>
              <Route path="/" exact component={Landing}></Route>
              <Route path="/login" exact component={Login}></Route>
              <Route path="/register" exact component={Register}></Route>
              <Route path="/report" exact component={Report} />
              <Route path="/verify/:id" exact component={Verify}></Route>
            </Switch>
          </Router>

          {/* <Email />
          <Email2 /> */}
        </header>
      </div>
    );
  }
}

export default App;
