import { Router, Route } from "@solidjs/router";
// import logo from "./assets/logo.svg";

import "./App.css";
import Layout from "./Layout";
import Booking from "./pages/Booking";
import Settings from "./pages/Settings";

function App() {
  return (
    <Router root={Layout}>
      <Route path="/" component={Booking} />
      <Route path="/settings" component={Settings} />
    </Router>
  );
}

export default App;
