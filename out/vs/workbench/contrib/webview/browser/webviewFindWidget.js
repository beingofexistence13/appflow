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
define(["require", "exports", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/keybinding/common/keybinding", "vs/workbench/contrib/codeEditor/browser/find/simpleFindWidget", "vs/workbench/contrib/webview/browser/webview"], function (require, exports, contextkey_1, contextView_1, keybinding_1, simpleFindWidget_1, webview_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebviewFindWidget = void 0;
    let WebviewFindWidget = class WebviewFindWidget extends simpleFindWidget_1.SimpleFindWidget {
        async _getResultCount(dataChanged) {
            return undefined;
        }
        constructor(_delegate, contextViewService, contextKeyService, keybindingService) {
            super({
                showCommonFindToggles: false,
                checkImeCompletionState: _delegate.checkImeCompletionState,
                enableSash: true,
            }, contextViewService, contextKeyService, keybindingService);
            this._delegate = _delegate;
            this._findWidgetFocused = webview_1.KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_FOCUSED.bindTo(contextKeyService);
            this._register(_delegate.hasFindResult(hasResult => {
                this.updateButtons(hasResult);
                this.focusFindBox();
            }));
            this._register(_delegate.onDidStopFind(() => {
                this.updateButtons(false);
            }));
        }
        find(previous) {
            const val = this.inputValue;
            if (val) {
                this._delegate.find(val, previous);
            }
        }
        hide(animated = true) {
            super.hide(animated);
            this._delegate.stopFind(true);
            this._delegate.focus();
        }
        _onInputChanged() {
            const val = this.inputValue;
            if (val) {
                this._delegate.updateFind(val);
            }
            else {
                this._delegate.stopFind(false);
            }
            return false;
        }
        _onFocusTrackerFocus() {
            this._findWidgetFocused.set(true);
        }
        _onFocusTrackerBlur() {
            this._findWidgetFocused.reset();
        }
        _onFindInputFocusTrackerFocus() { }
        _onFindInputFocusTrackerBlur() { }
        findFirst() { }
    };
    exports.WebviewFindWidget = WebviewFindWidget;
    exports.WebviewFindWidget = WebviewFindWidget = __decorate([
        __param(1, contextView_1.IContextViewService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, keybinding_1.IKeybindingService)
    ], WebviewFindWidget);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vidmlld0ZpbmRXaWRnZXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi93ZWJ2aWV3L2Jyb3dzZXIvd2Vidmlld0ZpbmRXaWRnZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBbUJ6RixJQUFNLGlCQUFpQixHQUF2QixNQUFNLGlCQUFrQixTQUFRLG1DQUFnQjtRQUM1QyxLQUFLLENBQUMsZUFBZSxDQUFDLFdBQXFCO1lBQ3BELE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFJRCxZQUNrQixTQUE4QixFQUMxQixrQkFBdUMsRUFDeEMsaUJBQXFDLEVBQ3JDLGlCQUFxQztZQUV6RCxLQUFLLENBQUM7Z0JBQ0wscUJBQXFCLEVBQUUsS0FBSztnQkFDNUIsdUJBQXVCLEVBQUUsU0FBUyxDQUFDLHVCQUF1QjtnQkFDMUQsVUFBVSxFQUFFLElBQUk7YUFDaEIsRUFBRSxrQkFBa0IsRUFBRSxpQkFBaUIsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1lBVDVDLGNBQVMsR0FBVCxTQUFTLENBQXFCO1lBVS9DLElBQUksQ0FBQyxrQkFBa0IsR0FBRyx3REFBOEMsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUVuRyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQ2xELElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQzlCLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNyQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLEdBQUcsRUFBRTtnQkFDM0MsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMzQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVNLElBQUksQ0FBQyxRQUFpQjtZQUM1QixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1lBQzVCLElBQUksR0FBRyxFQUFFO2dCQUNSLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQzthQUNuQztRQUNGLENBQUM7UUFFZSxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUk7WUFDbkMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNyQixJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM5QixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3hCLENBQUM7UUFFUyxlQUFlO1lBQ3hCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7WUFDNUIsSUFBSSxHQUFHLEVBQUU7Z0JBQ1IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDL0I7aUJBQU07Z0JBQ04sSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDL0I7WUFDRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFUyxvQkFBb0I7WUFDN0IsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuQyxDQUFDO1FBRVMsbUJBQW1CO1lBQzVCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNqQyxDQUFDO1FBRVMsNkJBQTZCLEtBQUssQ0FBQztRQUVuQyw0QkFBNEIsS0FBSyxDQUFDO1FBRTVDLFNBQVMsS0FBSyxDQUFDO0tBQ2YsQ0FBQTtJQWxFWSw4Q0FBaUI7Z0NBQWpCLGlCQUFpQjtRQVMzQixXQUFBLGlDQUFtQixDQUFBO1FBQ25CLFdBQUEsK0JBQWtCLENBQUE7UUFDbEIsV0FBQSwrQkFBa0IsQ0FBQTtPQVhSLGlCQUFpQixDQWtFN0IifQ==