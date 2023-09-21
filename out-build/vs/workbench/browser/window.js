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
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/dom", "vs/base/browser/event", "vs/base/browser/deviceAccess", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/severity", "vs/base/common/uri", "vs/nls!vs/workbench/browser/window", "vs/platform/commands/common/commands", "vs/platform/dialogs/common/dialogs", "vs/platform/driver/browser/driver", "vs/platform/instantiation/common/instantiation", "vs/platform/label/common/label", "vs/platform/opener/common/opener", "vs/platform/product/common/productService", "vs/workbench/services/environment/browser/environmentService", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/host/browser/host"], function (require, exports, browser_1, dom_1, event_1, deviceAccess_1, async_1, event_2, lifecycle_1, network_1, platform_1, severity_1, uri_1, nls_1, commands_1, dialogs_1, driver_1, instantiation_1, label_1, opener_1, productService_1, environmentService_1, layoutService_1, lifecycle_2, host_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$G2b = void 0;
    let $G2b = class $G2b extends lifecycle_1.$kc {
        constructor(a, b, c, f, g, h, j, m, n) {
            super();
            this.a = a;
            this.b = b;
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r();
            this.t();
        }
        r() {
            // Lifecycle
            this.B(this.b.onWillShutdown(() => this.s()));
            // Layout
            const viewport = platform_1.$q && window.visualViewport ? window.visualViewport /** Visual viewport */ : window /** Layout viewport */;
            this.B((0, dom_1.$nO)(viewport, dom_1.$3O.RESIZE, () => {
                this.j.layout();
                // Sometimes the keyboard appearing scrolls the whole workbench out of view, as a workaround scroll back into view #121206
                if (platform_1.$q) {
                    window.scrollTo(0, 0);
                }
            }));
            // Prevent the back/forward gestures in macOS
            this.B((0, dom_1.$nO)(this.j.container, dom_1.$3O.WHEEL, e => e.preventDefault(), { passive: false }));
            // Prevent native context menus in web
            this.B((0, dom_1.$nO)(this.j.container, dom_1.$3O.CONTEXT_MENU, e => dom_1.$5O.stop(e, true)));
            // Prevent default navigation on drop
            this.B((0, dom_1.$nO)(this.j.container, dom_1.$3O.DROP, e => dom_1.$5O.stop(e, true)));
            // Fullscreen (Browser)
            for (const event of [dom_1.$3O.FULLSCREEN_CHANGE, dom_1.$3O.WK_FULLSCREEN_CHANGE]) {
                this.B((0, dom_1.$nO)(document, event, () => (0, browser_1.$2N)(!!(0, dom_1.$sP)())));
            }
            // Fullscreen (Native)
            this.B((0, dom_1.$yO)(viewport, dom_1.$3O.RESIZE, () => {
                (0, browser_1.$2N)(!!(0, dom_1.$sP)());
            }, undefined, platform_1.$j ? 2000 /* adjust for macOS animation */ : 800 /* can be throttled */));
        }
        s() {
            // Try to detect some user interaction with the workbench
            // when shutdown has happened to not show the dialog e.g.
            // when navigation takes a longer time.
            event_2.Event.toPromise(event_2.Event.any(event_2.Event.once(new event_1.$9P(document.body, dom_1.$3O.KEY_DOWN, true).event), event_2.Event.once(new event_1.$9P(document.body, dom_1.$3O.MOUSE_DOWN, true).event))).then(async () => {
                // Delay the dialog in case the user interacted
                // with the page before it transitioned away
                await (0, async_1.$Hg)(3000);
                // This should normally not happen, but if for some reason
                // the workbench was shutdown while the page is still there,
                // inform the user that only a reload can bring back a working
                // state.
                await this.c.prompt({
                    type: severity_1.default.Error,
                    message: (0, nls_1.localize)(0, null),
                    detail: (0, nls_1.localize)(1, null),
                    buttons: [
                        {
                            label: (0, nls_1.localize)(2, null),
                            run: () => window.location.reload() // do not use any services at this point since they are likely not functional at this point
                        }
                    ]
                });
            });
        }
        t() {
            // Handle open calls
            this.w();
            // Label formatting
            this.y();
            // Commands
            this.z();
            // Smoke Test Driver
            this.u();
        }
        u() {
            if (this.h.enableSmokeTestDriver) {
                (0, driver_1.$F2b)(this.m);
            }
        }
        w() {
            // We need to ignore the `beforeunload` event while
            // we handle external links to open specifically for
            // the case of application protocols that e.g. invoke
            // vscode itself. We do not want to open these links
            // in a new window because that would leave a blank
            // window to the user, but using `window.location.href`
            // will trigger the `beforeunload`.
            this.a.setDefaultExternalOpener({
                openExternal: async (href) => {
                    let isAllowedOpener = false;
                    if (this.h.options?.openerAllowedExternalUrlPrefixes) {
                        for (const trustedPopupPrefix of this.h.options.openerAllowedExternalUrlPrefixes) {
                            if (href.startsWith(trustedPopupPrefix)) {
                                isAllowedOpener = true;
                                break;
                            }
                        }
                    }
                    // HTTP(s): open in new window and deal with potential popup blockers
                    if ((0, opener_1.$OT)(href, network_1.Schemas.http) || (0, opener_1.$OT)(href, network_1.Schemas.https)) {
                        if (browser_1.$8N) {
                            const opened = (0, dom_1.$lP)(href, !isAllowedOpener);
                            if (!opened) {
                                await this.c.prompt({
                                    type: severity_1.default.Warning,
                                    message: (0, nls_1.localize)(3, null),
                                    detail: href,
                                    buttons: [
                                        {
                                            label: (0, nls_1.localize)(4, null),
                                            run: () => isAllowedOpener ? (0, dom_1.$kP)(href) : (0, dom_1.$jP)(href)
                                        },
                                        {
                                            label: (0, nls_1.localize)(5, null),
                                            run: () => this.a.open(uri_1.URI.parse('https://aka.ms/allow-vscode-popup'))
                                        }
                                    ],
                                    cancelButton: true
                                });
                            }
                        }
                        else {
                            isAllowedOpener
                                ? (0, dom_1.$kP)(href)
                                : (0, dom_1.$jP)(href);
                        }
                    }
                    // Anything else: set location to trigger protocol handler in the browser
                    // but make sure to signal this as an expected unload and disable unload
                    // handling explicitly to prevent the workbench from going down.
                    else {
                        const invokeProtocolHandler = () => {
                            this.b.withExpectedShutdown({ disableShutdownHandling: true }, () => window.location.href = href);
                        };
                        invokeProtocolHandler();
                        const showProtocolUrlOpenedDialog = async () => {
                            const { downloadUrl } = this.g;
                            let detail;
                            const buttons = [
                                {
                                    label: (0, nls_1.localize)(6, null),
                                    run: () => invokeProtocolHandler()
                                }
                            ];
                            if (downloadUrl !== undefined) {
                                detail = (0, nls_1.localize)(7, null, this.g.nameLong, this.g.nameLong);
                                buttons.push({
                                    label: (0, nls_1.localize)(8, null),
                                    run: async () => {
                                        await this.a.open(uri_1.URI.parse(downloadUrl));
                                        // Re-show the dialog so that the user can come back after installing and try again
                                        showProtocolUrlOpenedDialog();
                                    }
                                });
                            }
                            else {
                                detail = (0, nls_1.localize)(9, null, this.g.nameLong, this.g.nameLong);
                            }
                            // While this dialog shows, closing the tab will not display a confirmation dialog
                            // to avoid showing the user two dialogs at once
                            await this.n.withExpectedShutdown(() => this.c.prompt({
                                type: severity_1.default.Info,
                                message: (0, nls_1.localize)(10, null),
                                detail,
                                buttons,
                                cancelButton: true
                            }));
                        };
                        // We cannot know whether the protocol handler succeeded.
                        // Display guidance in case it did not, e.g. the app is not installed locally.
                        if ((0, opener_1.$OT)(href, this.g.urlProtocol)) {
                            await showProtocolUrlOpenedDialog();
                        }
                    }
                    return true;
                }
            });
        }
        y() {
            this.B(this.f.registerFormatter({
                scheme: network_1.Schemas.vscodeUserData,
                priority: true,
                formatting: {
                    label: '(Settings) ${path}',
                    separator: '/',
                }
            }));
        }
        z() {
            // Allow extensions to request USB devices in Web
            commands_1.$Gr.registerCommand('workbench.experimental.requestUsbDevice', async (_accessor, options) => {
                return (0, deviceAccess_1.$XQ)(options);
            });
            // Allow extensions to request Serial devices in Web
            commands_1.$Gr.registerCommand('workbench.experimental.requestSerialPort', async (_accessor, options) => {
                return (0, deviceAccess_1.$YQ)(options);
            });
            // Allow extensions to request HID devices in Web
            commands_1.$Gr.registerCommand('workbench.experimental.requestHidDevice', async (_accessor, options) => {
                return (0, deviceAccess_1.$ZQ)(options);
            });
        }
    };
    exports.$G2b = $G2b;
    exports.$G2b = $G2b = __decorate([
        __param(0, opener_1.$NT),
        __param(1, lifecycle_2.$7y),
        __param(2, dialogs_1.$oA),
        __param(3, label_1.$Vz),
        __param(4, productService_1.$kj),
        __param(5, environmentService_1.$LT),
        __param(6, layoutService_1.$Meb),
        __param(7, instantiation_1.$Ah),
        __param(8, host_1.$VT)
    ], $G2b);
});
//# sourceMappingURL=window.js.map