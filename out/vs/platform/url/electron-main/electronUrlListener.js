/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "electron", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/uri"], function (require, exports, electron_1, async_1, event_1, lifecycle_1, platform_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ElectronURLListener = void 0;
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
    class ElectronURLListener {
        constructor(initialProtocolUrls, urlService, windowsMainService, environmentMainService, productService, logService) {
            this.urlService = urlService;
            this.logService = logService;
            this.uris = [];
            this.retryCount = 0;
            this.flushDisposable = lifecycle_1.Disposable.None;
            this.disposables = new lifecycle_1.DisposableStore();
            if (initialProtocolUrls) {
                logService.trace('ElectronURLListener initialUrisToHandle:', initialProtocolUrls.map(url => url.originalUrl));
                // the initial set of URIs we need to handle once the window is ready
                this.uris = initialProtocolUrls;
            }
            // Windows: install as protocol handler
            if (platform_1.isWindows) {
                const windowsParameters = environmentMainService.isBuilt ? [] : [`"${environmentMainService.appRoot}"`];
                windowsParameters.push('--open-url', '--');
                electron_1.app.setAsDefaultProtocolClient(productService.urlProtocol, process.execPath, windowsParameters);
            }
            // macOS: listen to `open-url` events from here on to handle
            const onOpenElectronUrl = event_1.Event.map(event_1.Event.fromNodeEventEmitter(electron_1.app, 'open-url', (event, url) => ({ event, url })), ({ event, url }) => {
                event.preventDefault(); // always prevent default and return the url as string
                return url;
            });
            this.disposables.add(onOpenElectronUrl(url => {
                const uri = this.uriFromRawUrl(url);
                if (!uri) {
                    return;
                }
                this.urlService.open(uri, { originalUrl: url });
            }));
            // Send initial links to the window once it has loaded
            const isWindowReady = windowsMainService.getWindows()
                .filter(window => window.isReady)
                .length > 0;
            if (isWindowReady) {
                logService.trace('ElectronURLListener: window is ready to handle URLs');
                this.flush();
            }
            else {
                logService.trace('ElectronURLListener: waiting for window to be ready to handle URLs...');
                event_1.Event.once(windowsMainService.onDidSignalReadyWindow)(this.flush, this, this.disposables);
            }
        }
        uriFromRawUrl(url) {
            try {
                return uri_1.URI.parse(url);
            }
            catch (e) {
                return undefined;
            }
        }
        async flush() {
            if (this.retryCount++ > 10) {
                this.logService.trace('ElectronURLListener#flush(): giving up after 10 retries');
                return;
            }
            this.logService.trace('ElectronURLListener#flush(): flushing URLs');
            const uris = [];
            for (const obj of this.uris) {
                const handled = await this.urlService.open(obj.uri, { originalUrl: obj.originalUrl });
                if (handled) {
                    this.logService.trace('ElectronURLListener#flush(): URL was handled', obj.originalUrl);
                }
                else {
                    this.logService.trace('ElectronURLListener#flush(): URL was not yet handled', obj.originalUrl);
                    uris.push(obj);
                }
            }
            if (uris.length === 0) {
                return;
            }
            this.uris = uris;
            this.flushDisposable = (0, async_1.disposableTimeout)(() => this.flush(), 500);
        }
        dispose() {
            this.disposables.dispose();
            this.flushDisposable.dispose();
        }
    }
    exports.ElectronURLListener = ElectronURLListener;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxlY3Ryb25VcmxMaXN0ZW5lci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3VybC9lbGVjdHJvbi1tYWluL2VsZWN0cm9uVXJsTGlzdGVuZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBZWhHOzs7Ozs7Ozs7T0FTRztJQUNILE1BQWEsbUJBQW1CO1FBTy9CLFlBQ0MsbUJBQStDLEVBQzlCLFVBQXVCLEVBQ3hDLGtCQUF1QyxFQUN2QyxzQkFBK0MsRUFDL0MsY0FBK0IsRUFDZCxVQUF1QjtZQUp2QixlQUFVLEdBQVYsVUFBVSxDQUFhO1lBSXZCLGVBQVUsR0FBVixVQUFVLENBQWE7WUFYakMsU0FBSSxHQUFtQixFQUFFLENBQUM7WUFDMUIsZUFBVSxHQUFHLENBQUMsQ0FBQztZQUNmLG9CQUFlLEdBQWdCLHNCQUFVLENBQUMsSUFBSSxDQUFDO1lBQ3RDLGdCQUFXLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFVcEQsSUFBSSxtQkFBbUIsRUFBRTtnQkFDeEIsVUFBVSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsRUFBRSxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztnQkFFOUcscUVBQXFFO2dCQUNyRSxJQUFJLENBQUMsSUFBSSxHQUFHLG1CQUFtQixDQUFDO2FBQ2hDO1lBRUQsdUNBQXVDO1lBQ3ZDLElBQUksb0JBQVMsRUFBRTtnQkFDZCxNQUFNLGlCQUFpQixHQUFHLHNCQUFzQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksc0JBQXNCLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztnQkFDeEcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDM0Ms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