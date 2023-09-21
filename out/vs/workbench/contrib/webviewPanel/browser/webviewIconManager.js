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
define(["require", "exports", "vs/base/browser/dom", "vs/platform/configuration/common/configuration", "vs/workbench/services/lifecycle/common/lifecycle"], function (require, exports, dom, configuration_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebviewIconManager = void 0;
    let WebviewIconManager = class WebviewIconManager {
        constructor(_lifecycleService, _configService) {
            this._lifecycleService = _lifecycleService;
            this._configService = _configService;
            this._icons = new Map();
            this._configService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('workbench.iconTheme')) {
                    this.updateStyleSheet();
                }
            });
        }
        dispose() {
            this._styleElement?.remove();
            this._styleElement = undefined;
        }
        get styleElement() {
            if (!this._styleElement) {
                this._styleElement = dom.createStyleSheet();
                this._styleElement.className = 'webview-icons';
            }
            return this._styleElement;
        }
        setIcons(webviewId, iconPath) {
            if (iconPath) {
                this._icons.set(webviewId, iconPath);
            }
            else {
                this._icons.delete(webviewId);
            }
            this.updateStyleSheet();
        }
        async updateStyleSheet() {
            await this._lifecycleService.when(1 /* LifecyclePhase.Starting */);
            const cssRules = [];
            if (this._configService.getValue('workbench.iconTheme') !== null) {
                for (const [key, value] of this._icons) {
                    const webviewSelector = `.show-file-icons .webview-${key}-name-file-icon::before`;
                    try {
                        cssRules.push(`.monaco-workbench.vs ${webviewSelector}, .monaco-workbench.hc-light ${webviewSelector} { content: ""; background-image: ${dom.asCSSUrl(value.light)}; }`, `.monaco-workbench.vs-dark ${webviewSelector}, .monaco-workbench.hc-black ${webviewSelector} { content: ""; background-image: ${dom.asCSSUrl(value.dark)}; }`);
                    }
                    catch {
                        // noop
                    }
                }
            }
            this.styleElement.textContent = cssRules.join('\n');
        }
    };
    exports.WebviewIconManager = WebviewIconManager;
    exports.WebviewIconManager = WebviewIconManager = __decorate([
        __param(0, lifecycle_1.ILifecycleService),
        __param(1, configuration_1.IConfigurationService)
    ], WebviewIconManager);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vidmlld0ljb25NYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvd2Vidmlld1BhbmVsL2Jyb3dzZXIvd2Vidmlld0ljb25NYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWF6RixJQUFNLGtCQUFrQixHQUF4QixNQUFNLGtCQUFrQjtRQU05QixZQUNvQixpQkFBcUQsRUFDakQsY0FBc0Q7WUFEekMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFtQjtZQUNoQyxtQkFBYyxHQUFkLGNBQWMsQ0FBdUI7WUFON0QsV0FBTSxHQUFHLElBQUksR0FBRyxFQUF3QixDQUFDO1lBUXpELElBQUksQ0FBQyxjQUFjLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ2hELElBQUksQ0FBQyxDQUFDLG9CQUFvQixDQUFDLHFCQUFxQixDQUFDLEVBQUU7b0JBQ2xELElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2lCQUN4QjtZQUNGLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELE9BQU87WUFDTixJQUFJLENBQUMsYUFBYSxFQUFFLE1BQU0sRUFBRSxDQUFDO1lBQzdCLElBQUksQ0FBQyxhQUFhLEdBQUcsU0FBUyxDQUFDO1FBQ2hDLENBQUM7UUFFRCxJQUFZLFlBQVk7WUFDdkIsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUU7Z0JBQ3hCLElBQUksQ0FBQyxhQUFhLEdBQUcsR0FBRyxDQUFDLGdCQUFnQixFQUFFLENBQUM7Z0JBQzVDLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxHQUFHLGVBQWUsQ0FBQzthQUMvQztZQUNELE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztRQUMzQixDQUFDO1FBRU0sUUFBUSxDQUNkLFNBQWlCLEVBQ2pCLFFBQWtDO1lBRWxDLElBQUksUUFBUSxFQUFFO2dCQUNiLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQzthQUNyQztpQkFBTTtnQkFDTixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUM5QjtZQUVELElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3pCLENBQUM7UUFFTyxLQUFLLENBQUMsZ0JBQWdCO1lBQzdCLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksaUNBQXlCLENBQUM7WUFFM0QsTUFBTSxRQUFRLEdBQWEsRUFBRSxDQUFDO1lBQzlCLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMscUJBQXFCLENBQUMsS0FBSyxJQUFJLEVBQUU7Z0JBQ2pFLEtBQUssTUFBTSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO29CQUN2QyxNQUFNLGVBQWUsR0FBRyw2QkFBNkIsR0FBRyx5QkFBeUIsQ0FBQztvQkFDbEYsSUFBSTt3QkFDSCxRQUFRLENBQUMsSUFBSSxDQUNaLHdCQUF3QixlQUFlLGdDQUFnQyxlQUFlLHFDQUFxQyxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUN6Siw2QkFBNkIsZUFBZSxnQ0FBZ0MsZUFBZSxxQ0FBcUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FDN0osQ0FBQztxQkFDRjtvQkFBQyxNQUFNO3dCQUNQLE9BQU87cUJBQ1A7aUJBQ0Q7YUFDRDtZQUNELElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckQsQ0FBQztLQUNELENBQUE7SUE5RFksZ0RBQWtCO2lDQUFsQixrQkFBa0I7UUFPNUIsV0FBQSw2QkFBaUIsQ0FBQTtRQUNqQixXQUFBLHFDQUFxQixDQUFBO09BUlgsa0JBQWtCLENBOEQ5QiJ9