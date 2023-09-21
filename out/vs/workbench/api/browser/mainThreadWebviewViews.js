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
    exports.MainThreadWebviewsViews = void 0;
    let MainThreadWebviewsViews = class MainThreadWebviewsViews extends lifecycle_1.Disposable {
        constructor(context, mainThreadWebviews, _telemetryService, _webviewViewService) {
            super();
            this.mainThreadWebviews = mainThreadWebviews;
            this._telemetryService = _telemetryService;
            this._webviewViewService = _webviewViewService;
            this._webviewViews = this._register(new lifecycle_1.DisposableMap());
            this._webviewViewProviders = this._register(new lifecycle_1.DisposableMap());
            this._proxy = context.getProxy(extHostProtocol.ExtHostContext.ExtHostWebviewViews);
        }
        $setWebviewViewTitle(handle, value) {
            const webviewView = this.getWebviewView(handle);
            webviewView.title = value;
        }
        $setWebviewViewDescription(handle, value) {
            const webviewView = this.getWebviewView(handle);
            webviewView.description = value;
        }
        $setWebviewViewBadge(handle, badge) {
            const webviewView = this.getWebviewView(handle);
            webviewView.badge = badge;
        }
        $show(handle, preserveFocus) {
            const webviewView = this.getWebviewView(handle);
            webviewView.show(preserveFocus);
        }
        $registerWebviewViewProvider(extensionData, viewType, options) {
            if (this._webviewViewProviders.has(viewType)) {
                throw new Error(`View provider for ${viewType} already registered`);
            }
            const extension = (0, mainThreadWebviews_1.reviveWebviewExtension)(extensionData);
            const registration = this._webviewViewService.register(viewType, {
                resolve: async (webviewView, cancellation) => {
                    const handle = (0, uuid_1.generateUuid)();
                    this._webviewViews.set(handle, webviewView);
                    this.mainThreadWebviews.addWebview(handle, webviewView.webview, { serializeBuffersForPostMessage: options.serializeBuffersForPostMessage });
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
                        this._proxy.$onDidChangeWebviewViewVisibility(handle, visible);
                    });
                    webviewView.onDispose(() => {
                        this._proxy.$disposeWebviewView(handle);
                        this._webviewViews.deleteAndDispose(handle);
                    });
                    this._telemetryService.publicLog2('webviews:createWebviewView', {
                        extensionId: extension.id.value,
                        id: viewType,
                    });
                    try {
                        await this._proxy.$resolveWebviewView(handle, viewType, webviewView.title, state, cancellation);
                    }
                    catch (error) {
                        (0, errors_1.onUnexpectedError)(error);
                        webviewView.webview.setHtml(this.mainThreadWebviews.getWebviewResolvedFailedContent(viewType));
                    }
                }
            });
            this._webviewViewProviders.set(viewType, registration);
        }
        $unregisterWebviewViewProvider(viewType) {
            if (!this._webviewViewProviders.has(viewType)) {
                throw new Error(`No view provider for ${viewType} registered`);
            }
            this._webviewViewProviders.deleteAndDispose(viewType);
        }
        getWebviewView(handle) {
            const webviewView = this._webviewViews.get(handle);
            if (!webviewView) {
                throw new Error('unknown webview view');
            }
            return webviewView;
        }
    };
    exports.MainThreadWebviewsViews = MainThreadWebviewsViews;
    exports.MainThreadWebviewsViews = MainThreadWebviewsViews = __decorate([
        __param(2, telemetry_1.ITelemetryService),
        __param(3, webviewViewService_1.IWebviewViewService)
    ], MainThreadWebviewsViews);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZFdlYnZpZXdWaWV3cy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvYnJvd3Nlci9tYWluVGhyZWFkV2Vidmlld1ZpZXdzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWN6RixJQUFNLHVCQUF1QixHQUE3QixNQUFNLHVCQUF3QixTQUFRLHNCQUFVO1FBT3RELFlBQ0MsT0FBd0IsRUFDUCxrQkFBc0MsRUFDcEMsaUJBQXFELEVBQ25ELG1CQUF5RDtZQUU5RSxLQUFLLEVBQUUsQ0FBQztZQUpTLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7WUFDbkIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFtQjtZQUNsQyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1lBUDlELGtCQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLHlCQUFhLEVBQXVCLENBQUMsQ0FBQztZQUN6RSwwQkFBcUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUkseUJBQWEsRUFBVSxDQUFDLENBQUM7WUFVcEYsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxjQUFjLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUNwRixDQUFDO1FBRU0sb0JBQW9CLENBQUMsTUFBcUMsRUFBRSxLQUF5QjtZQUMzRixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2hELFdBQVcsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQzNCLENBQUM7UUFFTSwwQkFBMEIsQ0FBQyxNQUFxQyxFQUFFLEtBQXlCO1lBQ2pHLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDaEQsV0FBVyxDQUFDLFdBQVcsR0FB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