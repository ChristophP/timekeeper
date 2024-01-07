import { createStore } from "solid-js/store";
import { createEffect } from "solid-js";
import {
  settings as settingsStorage,
  currentYear as currentYearStorage,
  previousYear as previousYearStorage,
} from "./storage";
import Booking from "./pages/Booking";
import dayjs from "./dayjs";

type Settings = {
  level: string;
  anrs: Record<string, string>;
  deleteCount: number;
  clearDeleteCountResetTimeout: (() => void) | null;
};

type Booking = {
  anr: string;
  text: string;
  hours: number;
  date: string;
  level: string;
};

type AppState = {
  settings: Settings;
  bookings: {
    entries: Booking[];
    selectedMonth: { year: number; month: number } | null;
    activeDay: Date | null;
    extraRows: number;
  };
};

const getDefaultStore = (): AppState => ({
  settings: {
    level: "",
    anrs: {},
    deleteCount: 5,
    clearDeleteCountResetTimeout: null,
  },
  bookings: {
    entries: [],
    selectedMonth: null,
    activeDay: null,
    extraRows: 0,
  },
});

const [state, setState] = createStore<AppState>(getDefaultStore());

// populate from storage
const level = await settingsStorage.get<string>("level");
const anrs = await settingsStorage.get<Settings["anrs"]>("anrs");
const newEntries: Booking[][][] =
  (await currentYearStorage.values<Booking[][]>()) ?? [];
const previousEntries: Booking[][][] =
  (await previousYearStorage.values<Booking[][]>()) ?? [];

setState("settings", { level: level ?? "", anrs: anrs ?? {} });
setState("bookings", {
  entries: [...newEntries, ...previousEntries].flat().flat(),
});

// DATA SYNC
// Synchronize persistent storage with application store
createEffect(async () => {
  console.log("Settings level changed", state.settings.level);
  // write new value to persistent storage
  await settingsStorage.set("level", state.settings.level);
  await settingsStorage.save();
});

createEffect(async () => {
  console.log("Settings ANRs changed", state.settings.anrs);
  // update persistent storage
  await settingsStorage.set("anrs", state.settings.anrs);
  await settingsStorage.save();
});

createEffect(async () => {
  console.log("Data booked");
  if (state.bookings.activeDay !== null) {
    const date = dayjs(state.bookings.activeDay);
    const currentYear = new Date().getFullYear();
    const daysInMonth = date.daysInMonth();

    const entries = Array.from({ length: daysInMonth }, (_, index) => {
      return getBookingsForDay(new Date(date.year(), date.month(), index + 1));
    });

    if (date.year() === currentYear) {
      // update current year
      await currentYearStorage.set(`month/${date.month()}`, entries);
      await currentYearStorage.save();
    }
    if (date.year() === currentYear - 1) {
      // update previous year
      await previousYearStorage.set(`month/${date.month()}`, entries);
      await previousYearStorage.save();
    }
  }
});

// HELPERS

const getBookingsForMonth = (year: number, month: number): Booking[] => {
  return state.bookings.entries.filter((entry) => {
    const date = new Date(entry.date);
    return date.getFullYear() === year && date.getMonth() === month;
  });
};

const getBookingsForDay = (day: Date): Booking[] => {
  return state.bookings.entries.filter((entry) => {
    const entryDate = dayjs(entry.date);
    return entryDate.isSame(day, "day");
  });
};

const setBookingsForDay = (date: Date, bookings: Booking[]): void => {
  setState("bookings", "entries", (entries: Booking[]) => {
    const filteredEntries: Booking[] = entries.filter(
      (entry: Booking) => !dayjs(entry.date).isSame(date, "day"),
    );
    return [...filteredEntries, ...bookings];
  });
};

function resetStore(): void {
  if (state.settings.deleteCount > 0) {
    setState("settings", "deleteCount", (c) => c - 1);
    if (state.settings.clearDeleteCountResetTimeout) {
      state.settings.clearDeleteCountResetTimeout();
    }
    const timeoutId = setTimeout(
      () => setState("settings", "deleteCount", 5),
      3500,
    );
    setState("settings", {
      clearDeleteCountResetTimeout: () => clearTimeout(timeoutId),
    });

    return;
  }
  setState(getDefaultStore());
}

function baseDataSet(): boolean {
  return (
    state.settings.level !== "" && Object.keys(state.settings.anrs).length > 0
  );
}

function hasBookingData(): boolean {
  return state.bookings.entries.length > 0;
}

function incrementExtraRows() {
  setState("bookings", "extraRows", (c) => c + 1);
}

function resetExtraRows() {
  setState("bookings", { extraRows: 0 });
}

export {
  state,
  setState,
  getBookingsForMonth,
  getBookingsForDay,
  setBookingsForDay,
  baseDataSet,
  hasBookingData,
  resetStore,
  incrementExtraRows,
  resetExtraRows,
  type Booking,
};
