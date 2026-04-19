import { LazyStore } from "@tauri-apps/plugin-store";
import dayjs from "./dayjs";

const now = dayjs();
const currentYearStr = `${now.year()}`;
const previousYearStr = `${now.subtract(1, "year").year()}`;

const settings = new LazyStore("time-keeper/settings.json");
const currentYear = new LazyStore(`time-keeper/${currentYearStr}.json`);
const previousYear = new LazyStore(`time-keeper/${previousYearStr}.json`);

export { settings, currentYear, previousYear };
