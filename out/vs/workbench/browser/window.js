/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/dom", "vs/base/browser/event", "vs/base/browser/deviceAccess", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/severity", "vs/base/common/uri", "vs/nls", "vs/platform/commands/common/commands", "vs/platform/dialogs/common/dialogs", "vs/platform/driver/browser/driver", "vs/platform/instantiation/common/instantiation", "vs/platform/label/common/label", "vs/platform/opener/common/opener", "vs/platform/product/common/productService", "vs/workbench/services/environment/browser/environmentService", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/host/browser/host"], function (require, exports, browser_1, dom_1, event_1, deviceAccess_1, async_1, event_2, lifecycle_1, network_1, platform_1, severity_1, uri_1, nls_1, commands_1, dialogs_1, driver_1, instantiation_1, label_1, opener_1, productService_1, environmentService_1, layoutService_1, lifecycle_2, host_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BrowserWindow = void 0;
    let BrowserWindow = class BrowserWindow extends lifecycle_1.Disposable {
        constructor(openerService, lifecycleService, dialogService, labelService, productService, environmentService, layoutService, instantiationService, hostService) {
            super();
            this.openerService = openerService;
            this.lifecycleService = lifecycleService;
            this.dialogService = dialogService;
            this.labelService = labelService;
            this.productService = productService;
            this.environmentService = environmentService;
            this.layoutService = layoutService;
            this.instantiationService = instantiationService;
            this.hostService = hostService;
            this.registerListeners();
            this.create();
        }
        registerListeners() {
            // Lifecycle
            this._register(this.lifecycleService.onWillShutdown(() => this.onWillShutdown()));
            // Layout
            const viewport = platform_1.isIOS && window.visualViewport ? window.visualViewport /** Visual viewport */ : window /** Layout viewport */;
            this._register((0, dom_1.addDisposableListener)(viewport, dom_1.EventType.RESIZE, () => {
                this.layoutService.layout();
                // Sometimes the keyboard appearing scrolls the whole workbench out of view, as a workaround scroll back into view #121206
                if (platform_1.isIOS) {
                    window.scrollTo(0, 0);
                }
            }));
            // Prevent the back/forward gestures in macOS
            this._register((0, dom_1.addDisposableListener)(this.layoutService.container, dom_1.EventType.WHEEL, e => e.preventDefault(), { passive: false }));
            // Prevent native context menus in web
            this._register((0, dom_1.addDisposableListener)(this.layoutService.container, dom_1.EventType.CONTEXT_MENU, e => dom_1.EventHelper.stop(e, true)));
            // Prevent default navigation on drop
            this._register((0, dom_1.addDisposableListener)(this.layoutService.container, dom_1.EventType.DROP, e => dom_1.EventHelper.stop(e, true)));
            // Fullscreen (Browser)
            for (const event of [dom_1.EventType.FULLSCREEN_CHANGE, dom_1.EventType.WK_FULLSCREEN_CHANGE]) {
                this._register((0, dom_1.addDisposableListener)(document, event, () => (0, browser_1.setFullscreen)(!!(0, dom_1.detectFullscreen)())));
            }
            // Fullscreen (Native)
            this._register((0, dom_1.addDisposableThrottledListener)(viewport, dom_1.EventType.RESIZE, () => {
                (0, browser_1.setFullscreen)(!!(0, dom_1.detectFullscreen)());
            }, undefined, platform_1.isMacintosh ? 2000 /* adjust for macOS animation */ : 800 /* can be throttled */));
        }
        onWillShutdown() {
            // Try to detect some user interaction with the workbench
            // when shutdown has happened to not show the dialog e.g.
            // when navigation takes a longer time.
            event_2.Event.toPromise(event_2.Event.any(event_2.Event.once(new event_1.DomEmitter(document.body, dom_1.EventType.KEY_DOWN, true).event), event_2.Event.once(new event_1.DomEmitter(document.body, dom_1.EventType.MOUSE_DOWN, true).event))).then(async () => {
                // Delay the dialog in case the user interacted
                // with the page before it transitioned away
                await (0, async_1.timeout)(3000);
                // This should normally not happen, but if for some reason
                // the workbench was shutdown while the page is still there,
                // inform the user that only a reload can bring back a working
                // state.
                await this.dialogService.prompt({
                    type: severity_1.default.Error,
                    message: (0, nls_1.localize)('shutdownError', "An unexpected error occurred that requires a reload of this page."),
                    detail: (0, nls_1.localize)('shutdownErrorDetail', "The workbench was unexpectedly disposed while running."),
                    buttons: [
                        {
                            label: (0, nls_1.localize)({ key: 'reload', comment: ['&& denotes a mnemonic'] }, "&&Reload"),
                            run: () => window.location.reload() // do not use any services at this point since they are likely not functional at this point
                        }
                    ]
                });
            });
        }
        create() {
            // Handle open calls
            this.setupOpenHandlers();
            // Label formatting
            this.registerLabelFormatters();
            // Commands
            this.registerCommands();
            // Smoke Test Driver
            this.setupDriver();
        }
        setupDriver() {
            if (this.environmentService.enableSmokeTestDriver) {
                (0, driver_1.registerWindowDriver)(this.instantiationService);
            }
        }
        setupOpenHandlers() {
            // We need to ignore the `beforeunload` event while
            // we handle external links to open specifically for
            // the case of application protocols that e.g. invoke
            // vscode itself. We do not want to open these links
            // in a new window because that would leave a blank
            // window to the user, but using `window.location.href`
            // will trigger the `beforeunload`.
            this.openerService.setDefaultExternalOpener({
                openExternal: async (href) => {
                    let isAllowedOpener = false;
                    if (this.environmentService.options?.openerAllowedExternalUrlPrefixes) {
                        for (const trustedPopupPrefix of this.environmentService.options.openerAllowedExternalUrlPrefixes) {
                            if (href.startsWith(trustedPopupPrefix)) {
                                isAllowedOpener = true;
                                break;
                            }
                        }
                    }
                    // HTTP(s): open in new window and deal with potential popup blockers
                    if ((0, opener_1.matchesScheme)(href, network_1.Schemas.http) || (0, opener_1.matchesScheme)(href, network_1.Schemas.https)) {
                        if (browser_1.isSafari) {
                            const opened = (0, dom_1.windowOpenWithSuccess)(href, !isAllowedOpener);
                            if (!opened) {
                                await this.dialogService.prompt({
                                    type: severity_1.default.Warning,
                                    message: (0, nls_1.localize)('unableToOpenExternal', "The browser interrupted the opening of a new tab or window. Press 'Open' to open it anyway."),
                                    detail: href,
                                    buttons: [
                                        {
                                            label: (0, nls_1.localize)({ key: 'open', comment: ['&& denotes a mnemonic'] }, "&&Open"),
                                            run: () => isAllowedOpener ? (0, dom_1.windowOpenPopup)(href) : (0, dom_1.windowOpenNoOpener)(href)
                                        },
                                        {
                                            label: (0, nls_1.localize)({ key: 'learnMore', comment: ['&& denotes a mnemonic'] }, "&&Learn More"),
                                            run: () => this.openerService.open(uri_1.URI.parse('https://aka.ms/allow-vscode-popup'))
                                        }
                                    ],
                                    cancelButton: true
                                });
                            }
                        }
                        else {
                            isAllowedOpener
                                ? (0, dom_1.windowOpenPopup)(href)
                                : (0, dom_1.windowOpenNoOpener)(href);
                        }
                    }
                    // Anything else: set location to trigger protocol handler in the browser
                    // but make sure to signal this as an expected unload and disable unload
                    // handling explicitly to prevent the workbench from going down.
                    else {
                        const invokeProtocolHandler = () => {
                            this.lifecycleService.withExpectedShutdown({ disableShutdownHandling: true }, () => window.location.href = href);
                        };
                        invokeProtocolHandler();
                        const showProtocolUrlOpenedDialog = async () => {
                            const { downloadUrl } = this.productService;
                            let detail;
                            const buttons = [
                                {
                                    label: (0, nls_1.localize)({ key: 'openExternalDialogButtonRetry.v2', comment: ['&& denotes a mnemonic'] }, "&&Try Again"),
                                    run: () => invokeProtocolHandler()
                                }
                            ];
                            if (downloadUrl !== undefined) {
                                detail = (0, nls_1.localize)('openExternalDialogDetail.v2', "We launched {0} on your computer.\n\nIf {1} did not launch, try again or install it below.", this.productService.nameLong, this.productService.nameLong);
                                buttons.push({
                                    label: (0, nls_1.localize)({ key: 'openExternalDialogButtonInstall.v3', comment: ['&& denotes a mnemonic'] }, "&&Install"),
                                    run: async () => {
                                        await this.openerService.open(uri_1.URI.parse(downloadUrl));
                                        // Re-show the dialog so that the user can come back after installing and try again
                                        showProtocolUrlOpenedDialog();
                                    }
                                });
                            }
                            else {
                                detail = (0, nls_1.localize)('openExternalDialogDetailNoInstall', "We launched {0} on your computer.\n\nIf {1} did not launch, try again below.", this.productService.nameLong, this.productService.nameLong);
                            }
                            // While this dialog shows, closing the tab will not display a confirmation dialog
                            // to avoid showing the user two dialogs at once
                            await this.hostService.withExpectedShutdown(() => this.dialogService.prompt({
                                type: severity_1.default.Info,
                                message: (0, nls_1.localize)('openExternalDialogTitle', "All done. You can close this tab now."),
                                detail,
                                buttons,
                                cancelButton: true
                            }));
                        };
                        // We cannot know whether the protocol handler succeeded.
                        // Display guidance in case it did not, e.g. the app is not installed locally.
                        if ((0, opener_1.matchesScheme)(href, this.productService.urlProtocol)) {
                            await showProtocolUrlOpenedDialog();
                        }
                    }
                    return true;
                }
            });
        }
        registerLabelFormatters() {
            this._register(this.labelService.registerFormatter({
                scheme: network_1.Schemas.vscodeUserData,
                priority: true,
                formatting: {
                    label: '(Settings) ${path}',
                    separator: '/',
                }
            }));
        }
        registerCommands() {
            // Allow extensions to request USB devices in Web
            commands_1.CommandsRegistry.registerCommand('workbench.experimental.requestUsbDevice', async (_accessor, options) => {
                return (0, deviceAccess_1.requestUsbDevice)(options);
            });
            // Allow extensions to request Serial devices in Web
            commands_1.CommandsRegistry.registerCommand('workbench.experimental.requestSerialPort', async (_accessor, options) => {
                return (0, deviceAccess_1.requestSerialPort)(options);
            });
            // Allow extensions to request HID devices in Web
            commands_1.CommandsRegistry.registerCommand('workbench.experimental.requestHidDevice', async (_accessor, options) => {
                return (0, deviceAccess_1.requestHidDevice)(options);
            });
        }
    };
    exports.BrowserWindow = BrowserWindow;
    exports.BrowserWindow = BrowserWindow = __decorate([
        __param(0, opener_1.IOpenerService),
        __param(1, lifecycle_2.ILifecycleService),
        __param(2, dialogs_1.IDialogService),
        __param(3, label_1.ILabelService),
        __param(4, productService_1.IProductService),
        __param(5, environmentService_1.IBrowserWorkbenchEnvironmentService),
        __param(6, layoutService_1.IWorkbenchLayoutService),
        __param(7, instantiation_1.IInstantiationService),
        __param(8, host_1.IHostService)
    ], BrowserWindow);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2Jyb3dzZXIvd2luZG93LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQTJCekYsSUFBTSxhQUFhLEdBQW5CLE1BQU0sYUFBYyxTQUFRLHNCQUFVO1FBRTVDLFlBQ2tDLGFBQTZCLEVBQzFCLGdCQUF5QyxFQUM1QyxhQUE2QixFQUM5QixZQUEyQixFQUN6QixjQUErQixFQUNYLGtCQUF1RCxFQUNuRSxhQUFzQyxFQUN4QyxvQkFBMkMsRUFDcEQsV0FBeUI7WUFFeEQsS0FBSyxFQUFFLENBQUM7WUFWeUIsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBQzFCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBeUI7WUFDNUMsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBQzlCLGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBQ3pCLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUNYLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUM7WUFDbkUsa0JBQWEsR0FBYixhQUFhLENBQXlCO1lBQ3hDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDcEQsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFJeEQsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDekIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2YsQ0FBQztRQUVPLGlCQUFpQjtZQUV4QixZQUFZO1lBQ1osSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFbEYsU0FBUztZQUNULE1BQU0sUUFBUSxHQUFHLGdCQUFLLElBQUksTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFD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