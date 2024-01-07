import { Store } from "tauri-plugin-store-api";
import dayjs from "./dayjs";

const now = dayjs();
const currentYearStr = `${now.year()}`;
const previousYearStr = `${now.subtract(1, "year").year()}`;

const settings = new Store("time-keeper/settings.json");
const currentYear = new Store(`time-keeper/${currentYearStr}.json`);
const previousYear = new Store(`time-keeper/${previousYearStr}.json`);

export { settings, currentYear, previousYear };
