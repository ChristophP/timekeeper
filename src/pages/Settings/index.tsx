import { type Component, For } from "solid-js";
import {
  state,
  setState,
  baseDataSet,
  resetStore,
  hasBookingData,
} from "../../store";
import { Button, Select, Icon } from "../../components";

const levels: string[] = ["VL1", "VL2", "VL3", "VL4"];

const SettingsView: Component = () => {
  const disableDelete = () => {
    return !baseDataSet() && !hasBookingData();
  };
  return (
    <div class="min-w-[600px]">
      <section>
        <h2 class="mt-12 mb-4 text-3xl">Level</h2>
        <Select
          class="w-48"
          onInput={(e) => {
            const newVal = e.target.value;
            // update app state
            setState("settings", "level", newVal);
          }}
        >
          <option value="">Pick level</option>
          <For each={levels}>
            {(item) => (
              <option value={item} selected={item === state.settings.level}>
                {item}
              </option>
            )}
          </For>
        </Select>
      </section>

      <section>
        <h2 class="mt-12 mb-4 text-3xl">ANRs</h2>
        <div class="space-y-4">
          <For each={Object.entries(state.settings.anrs)}>
            {([anr, description]) => <AnrRow name={description} anr={anr} />}
          </For>
        </div>
        <AnrAddRow />
      </section>
      <section>
        <h2 class="mt-12 mb-4 text-3xl">Data</h2>
        <div
          classList={{
            "p-4 bg-red-200 text-red-500": true,
            "opacity-50": disableDelete(),
          }}
        >
          <p>Clear app data.</p>
          <p class="mt-2">
            This will clear all data stored for this app.
            <br />
            All your settings and booking data will be lost.
          </p>
          <Button
            level="danger"
            class="mt-2"
            onClick={() => {
              resetStore();
            }}
            disabled={disableDelete()}
          >
            I don't care. Delete all data from my computer now.
          </Button>
          <span class="ml-5">{state.settings.deleteCount}</span>
        </div>
      </section>
    </div>
  );
};

const AnrRow: Component<{ name: string; anr: string }> = (props) => {
  const onEdit = () => {
    console.log(
      "Not implemented yet. Please delete and recreate to chage existing entries.",
    );
  };
  const onDelete = () => {
    // remove from store
    setState("settings", "anrs", { [props.anr]: undefined });
  };

  return (
    <div class="flex items-center gap-4">
      <div class="flex-1 py-2 px-2 bg-gray-300">{props.name}</div>
      <div class="flex-1 py-2 px-2 text-right  bg-gray-300">{props.anr}</div>
      <div class="w-12">
        <Button level="secondary" class="invisible" onClick={onEdit}>
          <Icon icon="edit" class="w-6 aspect-square" />
        </Button>
      </div>
      <div class="w-12">
        <Button level="danger" onClick={onDelete}>
          <Icon icon="delete" class="w-6 aspect-square" />
        </Button>
      </div>
    </div>
  );
};

function parseForm(form: FormData) {
  const anr = form.get("anr") as string | null;
  const description = form.get("description") as string | null;

  if (!anr || !description) {
    return null;
  }

  const match = anr.trim().match(/^\d{5,}$/);
  const parsedAnr = match ? match[0] : null;

  if (parsedAnr && description.length >= 3) {
    return { anr: parsedAnr, description };
  }
  return null;
}

const AnrAddRow: Component = () => {
  const onSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const data: FormData = new FormData(form);

    const result = parseForm(data);
    if (result) {
      // add to state
      setState("settings", "anrs", result.anr, result.description);
      // clear the form
      form.reset();
    }
  };
  return (
    <div class="mt-12 flex items-center gap-4">
      <form class="contents" onSubmit={onSubmit}>
        <div class="flex-1 py-2 px-2 bg-gray-300">
          <input
            name="description"
            type="text"
            required
            placeholder="ANR description"
            class="input invalid:border-red-500 invalid:border"
          />
        </div>
        <div class="flex-1 py-2 px-2 text-right  bg-gray-300">
          <input
            name="anr"
            type="text"
            placeholder="ANR"
            pattern="^\\d{5,}$"
            class="input invalid:border-red-500 invalid:border"
          />
        </div>
        <div class="w-28">
          <Button level="primary" class="w-full" type="submit">
            <Icon icon="add" class="mx-auto w-6 aspect-square" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SettingsView;
