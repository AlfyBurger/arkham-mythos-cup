// Installs the service worker that keeps a full copy of the app on the device.
(function () {
	var READY = "Ready for offline use.";
	var READY_TEXT = { en: READY, it: "Pronta per l'uso offline.", es: "Lista para usar sin conexión.",
		de: "Bereit für die Offline-Nutzung.", fr: "Prête pour une utilisation hors ligne." };
	// The status line lives on the Options tab, which the app builds after start-up.
	function say(t) {
		var tries = 0;
		(function apply() {
			var el = document.getElementById("offline-status");
			if (el) el.textContent = (t === READY && window.app && READY_TEXT[app.lang]) || t;
			else if (tries++ < 50) setTimeout(apply, 200);
		})();
	}
	if (!("serviceWorker" in navigator)) { say("Offline use isn't available in this browser."); return; }
	navigator.serviceWorker.register("sw.js")
		.then(function () { return navigator.serviceWorker.ready; })
		.then(function () { say(READY); })
		.catch(function () { say(navigator.onLine ? "Offline use couldn't be set up. Reload to try again." : ""); });
	if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(function () {});
})();
