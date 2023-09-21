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
define(["require", "exports", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/uuid", "vs/workbench/api/browser/mainThreadWebviews", "vs/workbench/api/common/extHost.protocol", "vs/workbench/contrib/webviewView/browser/webviewViewService", "vs/platform/telemetry/common/telemetry"], function (require, exports, errors_1, lifecycle_1, uuid_1, mainThreadWebviews_1, extHostProtocol, webviewViewService_1, telemetry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$xlb = void 0;
    let $xlb = class $xlb extends lifecycle_1.$kc {
        constructor(context, f, g, h) {
            super();
            this.f = f;
            this.g = g;
            this.h = h;
            this.b = this.B(new lifecycle_1.$sc());
            this.c = this.B(new lifecycle_1.$sc());
            this.a = context.getProxy(extHostProtocol.$2J.ExtHostWebviewViews);
        }
        $setWebviewViewTitle(handle, value) {
            const webviewView = this.j(handle);
            webviewView.title = value;
        }
        $setWebviewViewDescription(handle, value) {
            const webviewView = this.j(handle);
            webviewView.description = value;
        }
        $setWebviewViewBadge(handle, badge) {
            const webviewView = this.j(handle);
            webviewView.badge = badge;
        }
        $show(handle, preserveFocus) {
            const webviewView = this.j(handle);
            webviewView.show(preserveFocus);
        }
        $registerWebviewViewProvider(extensionData, viewType, options) {
            if (this.c.has(viewType)) {
                throw new Error(`View provider for ${viewType} already registered`);
            }
            const extension = (0, mainThreadWebviews_1.$bcb)(extensionData);
            const registration = this.h.register(viewType, {
                resolve: async (webviewView, cancellation) => {
                    const handle = (0, uuid_1.$4f)();
                    this.b.set(handle, webviewView);
                    this.f.addWebview(handle, webviewView.webview, { serializeBuffersForPostMessage: options.serializeBuffersForPostMessage });
                    let state = undefined;
                    if (webviewView.webview.state) {
                        try {
                            state = JSON.parse(webviewView.webview.state);
                        }
                        catch (e) {
                            console.error('Could not load webview state', e, webviewView.webview.state);
                        }
                    }
                    webviewView.webview.extension = extension;
                    if (options) {
                        webviewView.webview.options = options;
                    }
                    webviewView.onDidChangeVisibility(visible => {
                        this.a.$onDidChangeWebviewViewVisibility(handle, visible);
                    });
                    webviewView.onDispose(() => {
                        this.a.$disposeWebviewView(handle);
                        this.b.deleteAndDispose(handle);
                    });
                    this.g.publicLog2('webviews:createWebviewView', {
                        extensionId: extension.id.value,
                        id: viewType,
                    });
                    try {
                        await this.a.$resolveWebviewView(handle, viewType, webviewView.title, state, cancellation);
                    }
                    catch (error) {
                        (0, errors_1.$Y)(error);
                        webviewView.webview.setHtml(this.f.getWebviewResolvedFailedContent(viewType));
                    }
                }
            });
            this.c.set(viewType, registration);
        }
        $unregisterWebviewViewProvider(viewType) {
            if (!this.c.has(viewType)) {
                throw new Error(`No view provider for ${viewType} registered`);
            }
            this.c.deleteAndDispose(viewType);
        }
        j(handle) {
            const webviewView = this.b.get(handle);
            if (!webviewView) {
                throw new Error('unknown webview view');
            }
            return webviewView;
        }
    };
    exports.$xlb = $xlb;
    exports.$xlb = $xlb = __decorate([
        __param(2, telemetry_1.$9k),
        __param(3, webviewViewService_1.$vlb)
    ], $xlb);
});
//# sourceMappingURL=mainThreadWebviewViews.js.map