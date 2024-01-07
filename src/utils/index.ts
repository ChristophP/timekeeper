import { type Dayjs, type ManipulateType } from "dayjs";

// create an array of dates from start till end date
function dateRange(
  fromDate: Dayjs,
  toDate: Dayjs,
  unit: ManipulateType = "days",
) {
  const length = toDate.diff(fromDate, unit) + 1;
  return Array.from({ length }, (_, i) => fromDate.add(i, unit));
}

export { dateRange };
