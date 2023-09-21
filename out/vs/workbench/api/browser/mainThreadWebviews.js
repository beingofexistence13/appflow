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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/strings", "vs/base/common/uri", "vs/nls", "vs/platform/opener/common/opener", "vs/platform/product/common/productService", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostWebviewMessaging", "vs/workbench/services/extensions/common/proxyIdentifier"], function (require, exports, lifecycle_1, network_1, platform_1, strings_1, uri_1, nls_1, opener_1, productService_1, extHostProtocol, extHostWebviewMessaging_1, proxyIdentifier_1) {
    "use strict";
    var MainThreadWebviews_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.reviveWebviewContentOptions = exports.reviveWebviewExtension = exports.MainThreadWebviews = void 0;
    let MainThreadWebviews = class MainThreadWebviews extends lifecycle_1.Disposable {
        static { MainThreadWebviews_1 = this; }
        static { this.standardSupportedLinkSchemes = new Set([
            network_1.Schemas.http,
            network_1.Schemas.https,
            network_1.Schemas.mailto,
            network_1.Schemas.vscode,
            'vscode-insider',
        ]); }
        constructor(context, _openerService, _productService) {
            super();
            this._openerService = _openerService;
            this._productService = _productService;
            this._webviews = new Map();
            this._proxy = context.getProxy(extHostProtocol.ExtHostContext.ExtHostWebviews);
        }
        addWebview(handle, webview, options) {
            if (this._webviews.has(handle)) {
                throw new Error('Webview already registered');
            }
            this._webviews.set(handle, webview);
            this.hookupWebviewEventDelegate(handle, webview, options);
        }
        $setHtml(handle, value) {
            this.tryGetWebview(handle)?.setHtml(value);
        }
        $setOptions(handle, options) {
            const webview = this.tryGetWebview(handle);
            if (webview) {
                webview.contentOptions = reviveWebviewContentOptions(options);
            }
        }
        async $postMessage(handle, jsonMessage, ...buffers) {
            const webview = this.tryGetWebview(handle);
            if (!webview) {
                return false;
            }
            const { message, arrayBuffers } = (0, extHostWebviewMessaging_1.deserializeWebviewMessage)(jsonMessage, buffers);
            return webview.postMessage(message, arrayBuffers);
        }
        hookupWebviewEventDelegate(handle, webview, options) {
            const disposables = new lifecycle_1.DisposableStore();
            disposables.add(webview.onDidClickLink((uri) => this.onDidClickLink(handle, uri)));
            disposables.add(webview.onMessage((message) => {
                const serialized = (0, extHostWebviewMessaging_1.serializeWebviewMessage)(message.message, options);
                this._proxy.$onMessage(handle, serialized.message, new proxyIdentifier_1.SerializableObjectWithBuffers(serialized.buffers));
            }));
            disposables.add(webview.onMissingCsp((extension) => this._proxy.$onMissingCsp(handle, extension.value)));
            disposables.add(webview.onDidDispose(() => {
                disposables.dispose();
                this._webviews.delete(handle);
            }));
        }
        onDidClickLink(handle, link) {
            const webview = this.getWebview(handle);
            if (this.isSupportedLink(webview, uri_1.URI.parse(link))) {
                this._openerService.open(link, { fromUserGesture: true, allowContributedOpeners: true, allowCommands: Array.isArray(webview.contentOptions.enableCommandUris) || webview.contentOptions.enableCommandUris === true, fromWorkspace: true });
            }
        }
        isSupportedLink(webview, link) {
            if (MainThreadWebviews_1.standardSupportedLinkSchemes.has(link.scheme)) {
                return true;
            }
            if (!platform_1.isWeb && this._productService.urlProtocol === link.scheme) {
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
        tryGetWebview(handle) {
            return this._webviews.get(handle);
        }
        getWebview(handle) {
            const webview = this.tryGetWebview(handle);
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
			<body>${(0, nls_1.localize)('errorMessage', "An error occurred while loading view: {0}", (0, strings_1.escape)(viewType))}</body>
		</html>`;
        }
    };
    exports.MainThreadWebviews = MainThreadWebviews;
    exports.MainThreadWebviews = MainThreadWebviews = MainThreadWebviews_1 = __decorate([
        __param(1, opener_1.IOpenerService),
        __param(2, productService_1.IProductService)
    ], MainThreadWebviews);
    function reviveWebviewExtension(extensionData) {
        return {
            id: extensionData.id,
            location: uri_1.URI.revive(extensionData.location),
        };
    }
    exports.reviveWebviewExtension = reviveWebviewExtension;
    function reviveWebviewContentOptions(webviewOptions) {
        return {
            allowScripts: webviewOptions.enableScripts,
            allowForms: webviewOptions.enableForms,
            enableCommandUris: webviewOptions.enableCommandUris,
            localResourceRoots: Array.isArray(webviewOptions.localResourceRoots) ? webviewOptions.localResourceRoots.map(r => uri_1.URI.revive(r)) : undefined,
            portMapping: webviewOptions.portMapping,
        };
    }
    exports.reviveWebviewContentOptions = reviveWebviewContentOptions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZFdlYnZpZXdzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9icm93c2VyL21haW5UaHJlYWRXZWJ2aWV3cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBa0J6RixJQUFNLGtCQUFrQixHQUF4QixNQUFNLGtCQUFtQixTQUFRLHNCQUFVOztpQkFFekIsaUNBQTRCLEdBQUcsSUFBSSxHQUFHLENBQUM7WUFDOUQsaUJBQU8sQ0FBQyxJQUFJO1lBQ1osaUJBQU8sQ0FBQyxLQUFLO1lBQ2IsaUJBQU8sQ0FBQyxNQUFNO1lBQ2QsaUJBQU8sQ0FBQyxNQUFNO1lBQ2QsZ0JBQWdCO1NBQ2hCLENBQUMsQUFOa0QsQ0FNakQ7UUFNSCxZQUNDLE9BQXdCLEVBQ1IsY0FBK0MsRUFDOUMsZUFBaUQ7WUFFbEUsS0FBSyxFQUFFLENBQUM7WUFIeUIsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1lBQzdCLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtZQUxsRCxjQUFTLEdBQUcsSUFBSSxHQUFHLEVBQW9CLENBQUM7WUFTeEQsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDaEYsQ0FBQztRQUVNLFVBQVUsQ0FBQyxNQUFxQyxFQUFFLE9BQXdCLEVBQUUsT0FBb0Q7WUFDdEksSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDL0IsTUFBTSxJQUFJLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO2FBQzlDO1lBRUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3BDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxNQUFNLEVBQUUsT0FB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