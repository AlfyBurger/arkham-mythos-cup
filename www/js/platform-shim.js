// Stand-in for cordova.js: provides the few Cordova APIs this app uses
// (device, globalization, splashscreen, deviceready/pause/resume events)
// so it runs in a plain web view without the Cordova runtime.
(function () {
	window.device = { platform: "browser" }; // "browser" = in-page selector lists (work on iOS)
	navigator.globalization = {
		getLocaleName: function (ok) {
			var v = window.__nativeLocale || (navigator.languages && navigator.languages[0]) || navigator.language || "en";
			setTimeout(function () { ok({ value: v }); }, 0);
		},
	};
	navigator.splashscreen = { hide: function () {}, show: function () {} };
	document.addEventListener("DOMContentLoaded", function () {
		setTimeout(function () { document.dispatchEvent(new Event("deviceready")); }, 0);
	});
	document.addEventListener("visibilitychange", function () {
		document.dispatchEvent(new Event(document.hidden ? "pause" : "resume"));
	});
})();
