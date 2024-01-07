# 🕒 Timekeeper

A UI to make booking your work hours a breeze.

- 😌 **minimize repetitive work:** configure a list of ANRs and your level for reuse across your bookings
- 📁 **control your data:** the booking data is not sent anywhere, it's stored on your machine in a json format
- 🚚 **easy transfer:** do your bookings withing timekeeper and simply transfer them day-by-day in the SAP client via copy-paste.

## Installing

TODO (still need to pre-build and make available these binaries)
Download Timekeeper from the release page of the repo. Make sure to get the correct binary for your OS/architecture combination.
There are installers for different operating systems.

### How to use

1. Go to the settings page and add your level and ANRs.
2. Then go to the booking page and add bookings.
3. Open the SAP Client, use the Copy Button in Timekeeper to copy hours for a day. Then paste them into the correct day in the SAP client. 

### Recommended Workflow

Use Timekeeper every day to book your our for that day. Then at the end of the month copy-paste your ours into the SAP client. That way you can minimize the amount of time you need to spend using the SAP client.

## Developing

```sh
npm ci # install UI dependencies
npx tauri dev # compile and run rust code, run UI dev server
```

The UI code can be found in `src`.
The Rust code can be found in `src-tauri`.

## Building for prod

```sh
npx tauri build
```

The compiled executable can then be found at `src-tauri/target/release/timekeeper`.

It can be executed by double clicking from a file browser or running it from the terminal.

## What is tauri?

Tauri is a cross-platform UI framework for native apps built with web technologies. It uses a webview that communicates with a Rust process.
Here's some more infos on [tauri's architecture](https://tauri.app/v1/references/architecture/) and [here](https://tauri.app/v1/references/architecture/process-model) some info on how the Rust process and the WebView process communicate.
