# Arkham III Mythos Cup — iOS sideload build

Native iOS wrapper (Swift + WKWebView) around
[Arkham III Mythos Cup](https://github.com/mephitrpg/arkham-iii-mythos-cup) by Jure di Mephit,
with every expansion always included. Runs fully offline.

- `www/` — the web app (Cordova runtime replaced by `js/platform-shim.js`; expansion switches removed)
- `App/` — Swift app shell, icon and launch screen
- `project.yml` — XcodeGen spec; `.github/workflows/build-ios.yml` builds an unsigned `.ipa`
  on a GitHub macOS runner and publishes it to the `ios-build` branch
  (also downloadable from the run's artifacts). The website lives on the `main` branch.

Install the `.ipa` with a sideloading tool (Sideloadly, AltStore), which signs it with your Apple ID.

Original app © Jure di Mephit, Apache-2.0. Arkham Horror is © Fantasy Flight Games.
