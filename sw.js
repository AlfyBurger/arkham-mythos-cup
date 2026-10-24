// Keeps a full copy of the app on the device so it runs offline.
// The cache name changes automatically whenever any app file changes.
const CACHE = "mythos-cup-f64607529ae5";
const ASSETS = [
 "./",
 "apple-touch-icon.png",
 "css/home-screen.css",
 "css/index.css",
 "css/selector.css",
 "css/switch.css",
 "css/tab-bar.css",
 "favicon-32x32.png",
 "favicon.ico",
 "fonts/arkham-horror-3rd-edition-icons/fonts/arkham-horror-3rd-edition-icons.ttf",
 "fonts/arkham-horror-3rd-edition-icons/fonts/arkham-horror-3rd-edition-icons.woff",
 "fonts/arkham-horror-3rd-edition-icons/styles.css",
 "icon-192x192.png",
 "icon-512x512.png",
 "img/gear.svg",
 "img/logo.png",
 "img/token_blank-empty.png",
 "img/token_clue.png",
 "img/token_doom.png",
 "img/token_gate-burst.png",
 "img/token_headline.png",
 "img/token_monster.png",
 "img/token_reckoning.png",
 "img/token_terror.png",
 "index.html",
 "js/color.min.js",
 "js/data/expansions.js",
 "js/data/mythos-tokens.js",
 "js/data/scenarios.js",
 "js/index.js",
 "js/lib/Color.js",
 "js/lib/Deck.js",
 "js/lib/Expansion.js",
 "js/lib/InvestigatorsTokens.js",
 "js/lib/Language.js",
 "js/lib/MythosCup.js",
 "js/lib/MythosCupMetadata.js",
 "js/lib/MythosToken.js",
 "js/lib/Scenario.js",
 "js/lib/StoredObject.js",
 "js/options.js",
 "js/platform-shim.js",
 "js/vendor/jquery/jquery-3.6.0.min.js",
 "js/vendor/underscore.string/underscore.string.min.js",
 "js/vendor/underscore/underscore-min.js",
 "languages/de.js",
 "languages/en.js",
 "languages/es.js",
 "languages/fr.js",
 "languages/it.js",
 "languages/languages.js",
 "manifest.webmanifest",
 "register-offline.js"
];

self.addEventListener("install", (event) => {
	event.waitUntil(caches.open(CACHE)
		.then((c) => c.addAll(ASSETS.map((u) => new Request(u, { cache: "reload" }))))
		.then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
	event.waitUntil(caches.keys()
		.then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
		.then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
	const req = event.request;
	if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
	if (req.mode === "navigate") {
		event.respondWith(caches.match("index.html", { ignoreSearch: true }).then((hit) => hit || fetch(req)));
		return;
	}
	event.respondWith(caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req)));
});
