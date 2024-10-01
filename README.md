# Tapptitude Prezenta Birou (Office Attendance)

Quick Node script I've put together that marks my attendance in the company spreadsheet whenever my laptop connects to Tapptitude Wifi.

Only works on Linux (or if you have `iwgetid` as a shell command).

This repo contains only the script. It's added as a crontab job at startup for my Linux user.

## First time setup
Run it from the terminal, and tap on the link to provide authorization to your account using OAuth.

The token is now saved locally, and will be used for subsequent requests to Google, even when running non-interactively. Refresh tokens are handled automatically.

## Running on whatever you have
Node is cross-platform, `iwgetid` is not. If it doesn't work, just edit the exported function in `get-wifi.ts` to make it return the Wifi SSID you are currently connected to, using whatever code works for you. Or just hardcode the thing in `index.ts` or do whatever the fuck you want coz this project is MIT licensed.