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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/strings", "vs/base/common/uri", "vs/nls!vs/workbench/api/browser/mainThreadWebviews", "vs/platform/opener/common/opener", "vs/platform/product/common/productService", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostWebviewMessaging", "vs/workbench/services/extensions/common/proxyIdentifier"], function (require, exports, lifecycle_1, network_1, platform_1, strings_1, uri_1, nls_1, opener_1, productService_1, extHostProtocol, extHostWebviewMessaging_1, proxyIdentifier_1) {
    "use strict";
    var $acb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ccb = exports.$bcb = exports.$acb = void 0;
    let $acb = class $acb extends lifecycle_1.$kc {
        static { $acb_1 = this; }
        static { this.a = new Set([
            network_1.Schemas.http,
            network_1.Schemas.https,
            network_1.Schemas.mailto,
            network_1.Schemas.vscode,
            'vscode-insider',
        ]); }
        constructor(context, f, g) {
            super();
            this.f = f;
            this.g = g;
            this.c = new Map();
            this.b = context.getProxy(extHostProtocol.$2J.ExtHostWebviews);
        }
        addWebview(handle, webview, options) {
            if (this.c.has(handle)) {
                throw new Error('Webview already registered');
            }
            this.c.set(handle, webview);
            this.h(handle, webview, options);
        }
        $setHtml(handle, value) {
            this.n(handle)?.setHtml(value);
        }
        $setOptions(handle, options) {
            const webview = this.n(handle);
            if (webview) {
                webview.contentOptions = $ccb(options);
            }
        }
        async $postMessage(handle, jsonMessage, ...buffers) {
            const webview = this.n(handle);
            if (!webview) {
                return false;
            }
            const { message, arrayBuffers } = (0, extHostWebviewMessaging_1.$_bb)(jsonMessage, buffers);
            return webview.postMessage(message, arrayBuffers);
        }
        h(handle, webview, options) {
            const disposables = new lifecycle_1.$jc();
            disposables.add(webview.onDidClickLink((uri) => this.j(handle, uri)));
            disposables.add(webview.onMessage((message) => {
                const serialized = (0, extHostWebviewMessaging_1.$$bb)(message.message, options);
                this.b.$onMessage(handle, serialized.message, new proxyIdentifier_1.$dA(serialized.buffers));
            }));
            disposables.add(webview.onMissingCsp((extension) => this.b.$onMissingCsp(handle, extension.value)));
            disposables.add(webview.onDidDispose(() => {
                disposables.dispose();
                this.c.delete(handle);
            }));
        }
        j(handle, link) {
            const webview = this.s(handle);
            if (this.m(webview, uri_1.URI.parse(link))) {
                this.f.open(link, { fromUserGesture: true, allowContributedOpeners: true, allowCommands: Array.isArray(webview.contentOptions.enableCommandUris) || webview.contentOptions.enableCommandUris === true, fromWorkspace: true });
            }
        }
        m(webview, link) {
            if ($acb_1.a.has(link.scheme)) {
                return true;
            }
            if (!platform_1.$o && this.g.urlProtocol === link.scheme) {
                return true;
            }
            if (link.scheme === network_1.Schemas.command) {
                if (Array.isArray(webview.contentOptions.enableCommandUris)) {
                    return webview.contentOptions.enableCommandUris.includes(link.path);
                }
                return webview.contentOptions.enableCommandUris === true;
            }
            return false;
        }
        n(handle) {
            return this.c.get(handle);
        }
        s(handle) {
            const webview = this.n(handle);
            if (!webview) {
                throw new Error(`Unknown webview handle:${handle}`);
            }
            return webview;
        }
        getWebviewResolvedFailedContent(viewType) {
            return `<!DOCTYPE html>
		<html>
			<head>
				<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none';">
			</head>
			<body>${(0, nls_1.localize)(0, null, (0, strings_1.$pe)(viewType))}</body>
		</html>`;
        }
    };
    exports.$acb = $acb;
    exports.$acb = $acb = $acb_1 = __decorate([
        __param(1, opener_1.$NT),
        __param(2, productService_1.$kj)
    ], $acb);
    function $bcb(extensionData) {
        return {
            id: extensionData.id,
            location: uri_1.URI.revive(extensionData.location),
        };
    }
    exports.$bcb = $bcb;
    function $ccb(webviewOptions) {
        return {
            allowScripts: webviewOptions.enableScripts,
            allowForms: webviewOptions.enableForms,
            enableCommandUris: webviewOptions.enableCommandUris,
            localResourceRoots: Array.isArray(webviewOptions.localResourceRoots) ? webviewOptions.localResourceRoots.map(r => uri_1.URI.revive(r)) : undefined,
            portMapping: webviewOptions.portMapping,
        };
    }
    exports.$ccb = $ccb;
});
//# sourceMappingURL=mainThreadWebviews.js.map