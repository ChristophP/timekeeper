import { type Component, For, Show, createEffect } from "solid-js";
import { A } from "@solidjs/router";
import {
  state,
  setState,
  setBookingsForDay,
  getBookingsForDay,
  getBookingsForMonth,
  baseDataSet,
  type Booking,
  incrementExtraRows,
  resetExtraRows,
  setActiveBookingDay,
} from "../../store";
import { Button, Select, Box, Dialog, Icon } from "../../components";
import dayjs from "../../dayjs";
import { type Dayjs } from "dayjs";
import { dateRange } from "../../utils";

// make sure this gets recomputed when navigating to this page again
const now = dayjs();
const past = now.subtract(1, "year").startOf("year");
const months = dateRange(past, now, "months").sort(
  (a, b) => b.unix() - a.unix(),
);

// derived signal
const daysOfTheMonth = () => {
  if (state.bookings.selectedMonth !== null) {
    const { year, month } = state.bookings.selectedMonth;
    const firstDay = dayjs(new Date(year, month, 1));
    return dateRange(firstDay, firstDay.endOf("month"), "day");
  }
};

function formatCsv(entries: Booking[]) {
  return entries
    .map((entry: Booking): string =>
      [
        String(entry.hours).replace(".", ","), // hours
        entry.level, // level
        entry.anr, // ANR
        entry.text, // text
      ].join("\t"),
    )
    .join("\n");
}

const BookingView: Component = () => (
  <div class="min-w-[600px] mb-8">
    <Show when={!baseDataSet()}>
      <Box level="warn">
        You have not configured any settings yet.
        <br />
        Please go{" "}
        <A class="link" href="/settings">
          to the settings
        </A>{" "}
        and come back
        <br /> when you have configured your level and some ANRs.
      </Box>
    </Show>
    <section>
      <h2 class="mt-12 mb-4 text-3xl">Month</h2>
      <Select
        class="w-48"
        onInput={(e) => {
          const [yearStr, monthStr] = e.target.value.split("-");
          if (yearStr && monthStr) {
            // update app state
            setState("bookings", "selectedMonth", {
              year: Number(yearStr),
              month: Number(monthStr),
            });
            return;
          }
        }}
      >
        <For each={months}>
          {(item) => {
            const isSelected = (): boolean => {
              const selectedMonth = state.bookings.selectedMonth;
              return (
                selectedMonth.year === item.year() &&
                selectedMonth.month === item.month()
              );
            };
            return (
              <option
                value={`${item.year()}-${item.month()}`}
                selected={isSelected()}
              >
                {item.format("MMMM YYYY")}
              </option>
            );
          }}
        </For>
      </Select>
    </section>
    <section>
      <h2 class="mt-12 mb-4 text-3xl">Days</h2>
      <div class="space-y-4">
        <For each={daysOfTheMonth()}>
          {(date: Dayjs) => {
            return <BookingRow date={date} />;
          }}
        </For>
      </div>
    </section>
    <hr class="my-4" />
    <Summary
      year={state.bookings.selectedMonth.year}
      month={state.bookings.selectedMonth.month}
    />
    <BookingDialog day={state.bookings.activeDay} />
  </div>
);

function countWorkingDays(year: number, month: number) {
  const start = dayjs(new Date(year, month, 1));
  const daysInMonth = start.daysInMonth();

  return Array.from({ length: daysInMonth }).reduce<number>((count, _, i) => {
    const day = start.add(i, "day");
    const dayOfWeek = day.day(); // 0 = Sun, 6 = Sat

    return dayOfWeek !== 0 && dayOfWeek !== 6 && dayOfWeek !== 5
      ? count + 1
      : count;
  }, 0);
}

const Summary: Component<{ year: number; month: number }> = (props) => {
  createEffect(() => {
    console.log(props.year, props.month);
  });
  const monthHours = (): number => {
    const bookings = () => getBookingsForMonth(props.year, props.month);
    return bookings().reduce((acc, item) => item.hours + acc, 0);
  };

  const workingDays = () => countWorkingDays(props.year, props.month);
  const overtime = (): number => {
    return monthHours() - workingDays() * 8;
  };
  return (
    <div class="mx-2">
      <h4 class="font-bold">Summary</h4>
      <div>
        <aside class="font-italic text-gray-500">
          Overtime calculation currently counts all Mon-Thu as working days !
        </aside>
      </div>
      <div>Total hours: {monthHours().toFixed(2)}h</div>
      <div>Working days: {workingDays().toFixed(1)}</div>
      <div>Hours due: {overtime().toFixed(2)}h</div>
    </div>
  );
};

const BookingRow: Component<{ date: Dayjs }> = (props) => {
  const onCopy = (event: MouseEvent) => {
    const entries = getBookingsForDay(props.date.toDate());
    const csv: string = formatCsv(entries);
    navigator.clipboard.writeText(csv);

    // animation
    const div = document.createElement("div");
    div.className = "copy-animation";
    div.textContent = "Copied";
    div.addEventListener("animationend", () => {
      div.remove();
    });
    const button = event.currentTarget as HTMLButtonElement;
    button.appendChild(div);
  };
  const onRowClick = () => {
    setActiveBookingDay(props.date.toDate());
  };

  const onRowKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      setActiveBookingDay(props.date.toDate());
    }
  };
  const sumHours = () => {
    return getBookingsForDay(props.date.toDate()).reduce(
      (sum, item) => sum + item.hours,
      0,
    );
  };

  const isWeekendDay = () => [0, 6].includes(props.date.day());

  return (
    <div
      tabindex="0"
      classList={{
        "flex items-center gap-4 hover:ring rounded": true,
        "bg-gray-200": isWeekendDay(),
      }}
      onKeyDown={onRowKeyDown}
    >
      <div class="flex-1 py-2 px-2">
        <span class="inline-block w-12">{props.date.format("ddd")}</span>
        <span class="inline-block text-right w-8">
          {props.date.format("D.")}
        </span>{" "}
        <span class="inline-block w-20">{props.date.format("MMM")}</span>
      </div>
      <div
        classList={{
          "flex-1 py-2 px-2 text-right": true,
          "opacity-60": sumHours() === 0,
          "font-bold": sumHours() > 0,
        }}
      >
        {sumHours()}h
      </div>
      <div class="w-12">
        <Button level="secondary" onClick={onRowClick}>
          <Icon icon="edit" class="w-6 aspect-square" />
        </Button>
      </div>
      <div class="w-12">
        <Button level="primary" class="relative" onClick={onCopy}>
          <Icon icon="copy" class="w-6 aspect-square" />
        </Button>
      </div>
    </div>
  );
};

const BookingDialog: Component<{ day: Date | null }> = (props) => {
  const onCancelClick = () => {
    resetExtraRows();
    setState("bookings", { activeDay: null });
  };

  const onClose = () => {
    resetExtraRows();
    setState("bookings", { activeDay: null });
  };

  const onSubmit = (e: SubmitEvent) => {
    e.preventDefault();

    const data = new FormData(e.currentTarget as HTMLFormElement);
    const hours = data.getAll("hours[]") as string[];
    const anrs = data.getAll("anr[]") as string[];
    const descriptions = data.getAll("description[]") as string[];

    const newBookings: Booking[] = hours
      .map((_: string, index: number) => {
        return {
          anr: anrs[index],
          text: descriptions[index],
          hours: Number(hours[index]),
          date: props.day?.toISOString() ?? "",
          level: state.settings.level,
        };
      })
      .filter((item) => item.hours > 0);

    setBookingsForDay(props.day!, newBookings);
    setState("bookings", { activeDay: null });
  };

  const onExtraRowHoursInput = (event: InputEvent) => {
    const form = event.currentTarget as HTMLFormElement;

    const nodeList = form.querySelectorAll('input[name="hours[]"]');
    const inputs = Array.from(nodeList) as HTMLInputElement[];
    const allHaveHours = inputs.every((i) => Number(i.value) > 0);

    const totalHours = inputs.reduce(
      (sum, input) => sum + (input.valueAsNumber || 0),
      0,
    );

    setState("bookings", { totalHours });

    if (allHaveHours) {
      incrementExtraRows();
      return;
    }
  };

  const totalHours = () => state.bookings.totalHours.toFixed(2);

  return (
    <Dialog
      isOpen={!!state.bookings.activeDay!}
      onClose={onClose}
      extraClasses="px-4 pb-4 h-4/5"
    >
      <Show when={props.day}>
        <h2 class="text-2xl mt-8 mb-4">
          {dayjs(props.day).format("ddd, MMM DD.YYYY")}
        </h2>
        <div class="text-xl opacity-50 flex justify-between">
          <span>Add time entries</span>
          <span class="inline-block ml-auto">{totalHours()}h</span>
        </div>
        <div class="mt-2">
          <form
            id="bookings"
            onSubmit={onSubmit}
            onInput={onExtraRowHoursInput}
          >
            <div class="space-y-2">
              <For each={getBookingsForDay(props.day!)}>
                {(item) => {
                  return (
                    <AddBookingRow
                      anr={item.anr}
                      hours={item.hours}
                      description={item.text}
                    />
                  );
                }}
              </For>
              <For each={Array.from({ length: state.bookings.extraRows + 1 })}>
                {() => <AddBookingRow anr="" hours={0} description="" />}
              </For>
            </div>
            <div class="px-4 pb-4 absolute bottom-0 inset-x-0 flex gap-2 mt-6">
              <Button
                level="secondary"
                type="button"
                class="flex-1"
                onClick={onCancelClick}
              >
                Cancel
              </Button>
              <Button level="primary" type="submit" class="flex-1">
                Save
              </Button>
            </div>
          </form>
        </div>
      </Show>
    </Dialog>
  );
};

const AddBookingRow: Component<{
  anr: string;
  hours: number;
  description: string;
}> = (props) => (
  <div class="flex gap-2">
    <input
      name="hours[]"
      type="number"
      step="0.25"
      value={props.hours === 0 ? "" : props.hours}
      placeholder="1.5"
      min="0"
      class="input w-16"
    />
    <Select name="anr[]">
      <option value="">Pick ANR</option>
      <For each={Object.entries(state.settings.anrs)}>
        {([anr, name]) => {
          const isSelected = () => props.anr === anr;
          return (
            <option value={anr} selected={isSelected()}>
              {name}
            </option>
          );
        }}
      </For>
    </Select>
    <input
      name="description[]"
      class="input"
      type="text"
      placeholder="Daily, Code Review, etc ..."
      value={props.description}
      maxlength="50"
    />
  </div>
);

export default BookingView;
