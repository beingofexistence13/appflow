/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "electron", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/uri"], function (require, exports, electron_1, async_1, event_1, lifecycle_1, platform_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$O6b = void 0;
    /**
     * A listener for URLs that are opened from the OS and handled by VSCode.
     * Depending on the platform, this works differently:
     * - Windows: we use `app.setAsDefaultProtocolClient()` to register VSCode with the OS
     *            and additionally add the `open-url` command line argument to identify.
     * - macOS:   we rely on `app.on('open-url')` to be called by the OS
     * - Linux:   we have a special shortcut installed (`resources/linux/code-url-handler.desktop`)
     *            that calls VSCode with the `open-url` command line argument
     *            (https://github.com/microsoft/vscode/pull/56727)
     */
    class $O6b {
        constructor(initialProtocolUrls, f, windowsMainService, environmentMainService, productService, g) {
            this.f = f;
            this.g = g;
            this.a = [];
            this.b = 0;
            this.c = lifecycle_1.$kc.None;
            this.d = new lifecycle_1.$jc();
            if (initialProtocolUrls) {
                g.trace('ElectronURLListener initialUrisToHandle:', initialProtocolUrls.map(url => url.originalUrl));
                // the initial set of URIs we need to handle once the window is ready
                this.a = initialProtocolUrls;
            }
            // Windows: install as protocol handler
            if (platform_1.$i) {
                const windowsParameters = environmentMainService.isBuilt ? [] : [`"${environmentMainService.appRoot}"`];
                windowsParameters.push('--open-url', '--');
                electron_1.app.setAsDefaultProtocolClient(productService.urlProtocol, process.execPath, windowsParameters);
            }
            // macOS: listen to `open-url` events from here on to handle
            const onOpenElectronUrl = event_1.Event.map(event_1.Event.fromNodeEventEmitter(electron_1.app, 'open-url', (event, url) => ({ event, url })), ({ event, url }) => {
                event.preventDefault(); // always prevent default and return the url as string
                return url;
            });
            this.d.add(onOpenElectronUrl(url => {
                const uri = this.h(url);
                if (!uri) {
                    return;
                }
                this.f.open(uri, { originalUrl: url });
            }));
            // Send initial links to the window once it has loaded
            const isWindowReady = windowsMainService.getWindows()
                .filter(window => window.isReady)
                .length > 0;
            if (isWindowReady) {
                g.trace('ElectronURLListener: window is ready to handle URLs');
                this.i();
            }
            else {
                g.trace('ElectronURLListener: waiting for window to be ready to handle URLs...');
                event_1.Event.once(windowsMainService.onDidSignalReadyWindow)(this.i, this, this.d);
            }
        }
        h(url) {
            try {
                return uri_1.URI.parse(url);
            }
            catch (e) {
                return undefined;
            }
        }
        async i() {
            if (this.b++ > 10) {
                this.g.trace('ElectronURLListener#flush(): giving up after 10 retries');
                return;
            }
            this.g.trace('ElectronURLListener#flush(): flushing URLs');
            const uris = [];
            for (const obj of this.a) {
                const handled = await this.f.open(obj.uri, { originalUrl: obj.originalUrl });
                if (handled) {
                    this.g.trace('ElectronURLListener#flush(): URL was handled', obj.originalUrl);
                }
                else {
                    this.g.trace('ElectronURLListener#flush(): URL was not yet handled', obj.originalUrl);
                    uris.push(obj);
                }
            }
            if (uris.length === 0) {
                return;
            }
            this.a = uris;
            this.c = (0, async_1.$Ig)(() => this.i(), 500);
        }
        dispose() {
            this.d.dispose();
            this.c.dispose();
        }
    }
    exports.$O6b = $O6b;
});
//# sourceMappingURL=electronUrlListener.js.map