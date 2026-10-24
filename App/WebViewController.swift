import UIKit
import WebKit

/// Hosts the bundled Mythos Cup web app (www/) in a full-screen web view.
/// Works entirely offline: every file ships inside the app.
final class WebViewController: UIViewController, WKNavigationDelegate {
    private var webView: WKWebView!

    /// Backup copy of the page's localStorage (options + current cup) kept in
    /// UserDefaults, so the game survives even if iOS clears web-view data.
    private static let storageKey = "localStorageBackup"

    override var preferredStatusBarStyle: UIStatusBarStyle { .lightContent }

    override func loadView() {
        let contentController = WKUserContentController()
        contentController.add(WeakMessageHandler(target: self), name: "storage")

        let config = WKWebViewConfiguration()
        config.userContentController = contentController
        config.websiteDataStore = .default()
        config.dataDetectorTypes = []

        webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = self
        webView.isOpaque = false
        webView.backgroundColor = .black
        webView.allowsLinkPreview = false
        webView.allowsBackForwardNavigationGestures = false
        webView.scrollView.backgroundColor = .black
        webView.scrollView.bounces = false
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.translatesAutoresizingMaskIntoConstraints = false

        let root = UIView()
        root.backgroundColor = .black
        root.addSubview(webView)
        // Keep the app clear of the notch / Dynamic Island and the home indicator.
        let guide = root.safeAreaLayoutGuide
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: guide.topAnchor),
            webView.bottomAnchor.constraint(equalTo: guide.bottomAnchor),
            webView.leadingAnchor.constraint(equalTo: guide.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: guide.trailingAnchor),
        ])
        view = root
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        loadApp()
    }

    private func loadApp() {
        guard let index = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "www") else {
            assertionFailure("www/index.html missing from bundle")
            return
        }
        // Rebuild the bootstrap script so it carries the latest backup.
        let controller = webView.configuration.userContentController
        controller.removeAllUserScripts()
        controller.addUserScript(WKUserScript(source: Self.bootstrapScript(),
                                              injectionTime: .atDocumentStart,
                                              forMainFrameOnly: true))
        webView.loadFileURL(index, allowingReadAccessTo: index.deletingLastPathComponent())
    }

    // MARK: - Bootstrap script (runs before the page's own scripts)

    private static func jsString(_ s: String) -> String {
        let data = (try? JSONEncoder().encode(s)) ?? Data("\"\"".utf8)
        return String(decoding: data, as: UTF8.self)
    }

    private static func bootstrapScript() -> String {
        let locale = Locale.preferredLanguages.first ?? "en"
        let backup = UserDefaults.standard.string(forKey: storageKey) ?? ""
        return """
        window.__nativeLocale = \(jsString(locale));
        (function () {
            var backup = \(jsString(backup));
            try {
                // Restore at most once per native load, so the page's own
                // "Clear data" + reload really starts fresh.
                var first = !sessionStorage.getItem("__restoreChecked");
                sessionStorage.setItem("__restoreChecked", "1");
                if (first && backup && localStorage.length === 0) {
                    var saved = JSON.parse(backup);
                    Object.keys(saved).forEach(function (k) { localStorage.setItem(k, saved[k]); });
                }
            } catch (e) {}
            function sync() {
                try {
                    var o = {};
                    for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); o[k] = localStorage.getItem(k); }
                    window.webkit.messageHandlers.storage.postMessage(JSON.stringify(o));
                } catch (e) {}
            }
            var S = Storage.prototype, setItem = S.setItem, removeItem = S.removeItem, clear = S.clear;
            S.setItem = function () { var r = setItem.apply(this, arguments); if (this === localStorage) sync(); return r; };
            S.removeItem = function () { var r = removeItem.apply(this, arguments); if (this === localStorage) sync(); return r; };
            S.clear = function () { var r = clear.apply(this, arguments); if (this === localStorage) sync(); return r; };
        })();
        """
    }

    fileprivate func didReceiveStorageSnapshot(_ json: String) {
        UserDefaults.standard.set(json, forKey: Self.storageKey)
    }

    // MARK: - WKNavigationDelegate

    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = navigationAction.request.url else { return decisionHandler(.cancel) }
        if url.isFileURL || url.scheme == "about" {
            decisionHandler(.allow)
        } else {
            // Any web link opens in Safari instead of replacing the app.
            if url.scheme == "http" || url.scheme == "https" { UIApplication.shared.open(url) }
            decisionHandler(.cancel)
        }
    }

    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
        // iOS may kill the web process in the background; just reload the app.
        loadApp()
    }
}

/// Avoids a retain cycle between WKUserContentController and the view controller.
private final class WeakMessageHandler: NSObject, WKScriptMessageHandler {
    weak var target: WebViewController?
    init(target: WebViewController) { self.target = target }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "storage", let json = message.body as? String else { return }
        target?.didReceiveStorageSnapshot(json)
    }
}
