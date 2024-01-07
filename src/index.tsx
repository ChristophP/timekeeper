/* @refresh reload */
import { render } from "solid-js/web";
import "./storage.ts";

import "./styles.css";
import App from "./App";

render(() => <App />, document.getElementById("root") as HTMLElement);
