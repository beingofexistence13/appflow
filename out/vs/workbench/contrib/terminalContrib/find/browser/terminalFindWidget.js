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
define(["require", "exports", "vs/workbench/contrib/codeEditor/browser/find/simpleFindWidget", "vs/platform/contextview/browser/contextView", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/terminal/common/terminalContextKey", "vs/platform/theme/common/themeService", "vs/platform/configuration/common/configuration", "vs/platform/keybinding/common/keybinding", "vs/base/common/event"], function (require, exports, simpleFindWidget_1, contextView_1, contextkey_1, terminalContextKey_1, themeService_1, configuration_1, keybinding_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalFindWidget = void 0;
    const TERMINAL_FIND_WIDGET_INITIAL_WIDTH = 419;
    let TerminalFindWidget = class TerminalFindWidget extends simpleFindWidget_1.SimpleFindWidget {
        constructor(_instance, _contextViewService, keybindingService, _contextKeyService, _themeService, _configurationService) {
            super({
                showCommonFindToggles: true,
                checkImeCompletionState: true,
                showResultCount: true,
                initialWidth: TERMINAL_FIND_WIDGET_INITIAL_WIDTH,
                enableSash: true,
                appendCaseSensitiveActionId: "workbench.action.terminal.toggleFindCaseSensitive" /* TerminalCommandId.ToggleFindCaseSensitive */,
                appendRegexActionId: "workbench.action.terminal.toggleFindRegex" /* TerminalCommandId.ToggleFindRegex */,
                appendWholeWordsActionId: "workbench.action.terminal.toggleFindWholeWord" /* TerminalCommandId.ToggleFindWholeWord */,
                previousMatchActionId: "workbench.action.terminal.findPrevious" /* TerminalCommandId.FindPrevious */,
                nextMatchActionId: "workbench.action.terminal.findNext" /* TerminalCommandId.FindNext */,
                closeWidgetActionId: "workbench.action.terminal.hideFind" /* TerminalCommandId.FindHide */,
                type: 'Terminal',
                matchesLimit: 1000 /* XtermTerminalConstants.SearchHighlightLimit */
            }, _contextViewService, _contextKeyService, keybindingService);
            this._instance = _instance;
            this._contextKeyService = _contextKeyService;
            this._themeService = _themeService;
            this._configurationService = _configurationService;
            this._register(this.state.onFindReplaceStateChange(() => {
                this.show();
            }));
            this._findInputFocused = terminalContextKey_1.TerminalContextKeys.findInputFocus.bindTo(this._contextKeyService);
            this._findWidgetFocused = terminalContextKey_1.TerminalContextKeys.findFocus.bindTo(this._contextKeyService);
            this._findWidgetVisible = terminalContextKey_1.TerminalContextKeys.findVisible.bindTo(this._contextKeyService);
            this._register(this._themeService.onDidColorThemeChange(() => {
                if (this.isVisible()) {
                    this.find(true, true);
                }
            }));
            this._register(this._configurationService.onDidChangeConfiguration((e) => {
                if (e.affectsConfiguration('workbench.colorCustomizations') && this.isVisible()) {
                    this.find(true, true);
                }
            }));
            this.updateResultCount();
        }
        find(previous, update) {
            const xterm = this._instance.xterm;
            if (!xterm) {
                return;
            }
            if (previous) {
                this._findPreviousWithEvent(xterm, this.inputValue, { regex: this._getRegexValue(), wholeWord: this._getWholeWordValue(), caseSensitive: this._getCaseSensitiveValue(), incremental: update });
            }
            else {
                this._findNextWithEvent(xterm, this.inputValue, { regex: this._getRegexValue(), wholeWord: this._getWholeWordValue(), caseSensitive: this._getCaseSensitiveValue() });
            }
        }
        reveal() {
            const initialInput = this._instance.hasSelection() && !this._instance.selection.includes('\n') ? this._instance.selection : undefined;
            const inputValue = initialInput ?? this.inputValue;
            const xterm = this._instance.xterm;
            if (xterm && inputValue && inputValue !== '') {
                // trigger highlight all matches
                this._findPreviousWithEvent(xterm, inputValue, { incremental: true, regex: this._getRegexValue(), wholeWord: this._getWholeWordValue(), caseSensitive: this._getCaseSensitiveValue() }).then(foundMatch => {
                    this.updateButtons(foundMatch);
                    this._register(event_1.Event.once(xterm.onDidChangeSelection)(() => xterm.clearActiveSearchDecoration()));
                });
            }
            this.updateButtons(false);
            super.reveal(inputValue);
            this._findWidgetVisible.set(true);
        }
        show() {
            const initialInput = this._instance.hasSelection() && !this._instance.selection.includes('\n') ? this._instance.selection : undefined;
            super.show(initialInput);
            this._findWidgetVisible.set(true);
        }
        hide() {
            super.hide();
            this._findWidgetVisible.reset();
            this._instance.focus(true);
            this._instance.xterm?.clearSearchDecorations();
        }
        async _getResultCount() {
            return this._instance.xterm?.findResult;
        }
        _onInputChanged() {
            // Ignore input changes for now
            const xterm = this._instance.xterm;
            if (xterm) {
                this._findPreviousWithEvent(xterm, this.inputValue, { regex: this._getRegexValue(), wholeWord: this._getWholeWordValue(), caseSensitive: this._getCaseSensitiveValue(), incremental: true }).then(foundMatch => {
                    this.updateButtons(foundMatch);
                });
            }
            return false;
        }
        _onFocusTrackerFocus() {
            this._findWidgetFocused.set(true);
        }
        _onFocusTrackerBlur() {
            this._instance.xterm?.clearActiveSearchDecoration();
            this._findWidgetFocused.reset();
        }
        _onFindInputFocusTrackerFocus() {
            this._findInputFocused.set(true);
        }
        _onFindInputFocusTrackerBlur() {
            this._findInputFocused.reset();
        }
        findFirst() {
            const instance = this._instance;
            if (instance.hasSelection()) {
                instance.clearSelection();
            }
            const xterm = instance.xterm;
            if (xterm) {
                this._findPreviousWithEvent(xterm, this.inputValue, { regex: this._getRegexValue(), wholeWord: this._getWholeWordValue(), caseSensitive: this._getCaseSensitiveValue() });
            }
        }
        async _findNextWithEvent(xterm, term, options) {
            return xterm.findNext(term, options).then(foundMatch => {
                this._register(event_1.Event.once(xterm.onDidChangeSelection)(() => xterm.clearActiveSearchDecoration()));
                return foundMatch;
            });
        }
        async _findPreviousWithEvent(xterm, term, options) {
            return xterm.findPrevious(term, options).then(foundMatch => {
                this._register(event_1.Event.once(xterm.onDidChangeSelection)(() => xterm.clearActiveSearchDecoration()));
                return foundMatch;
            });
        }
    };
    exports.TerminalFindWidget = TerminalFindWidget;
    exports.TerminalFindWidget = TerminalFindWidget = __decorate([
        __param(1, contextView_1.IContextViewService),
        __param(2, keybinding_1.IKeybindingService),
        __param(3, contextkey_1.IContextKeyService),
        __param(4, themeService_1.IThemeService),
        __param(5, configuration_1.IConfigurationService)
    ], TerminalFindWidget);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxGaW5kV2lkZ2V0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWxDb250cmliL2ZpbmQvYnJvd3Nlci90ZXJtaW5hbEZpbmRXaWRnZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBY2hHLE1BQU0sa0NBQWtDLEdBQUcsR0FBRyxDQUFDO0lBRXhDLElBQU0sa0JBQWtCLEdBQXhCLE1BQU0sa0JBQW1CLFNBQVEsbUNBQWdCO1FBS3ZELFlBQ1MsU0FBNEIsRUFDZixtQkFBd0MsRUFDekMsaUJBQXFDLEVBQ3BCLGtCQUFzQyxFQUMzQyxhQUE0QixFQUNwQixxQkFBNEM7WUFFcEYsS0FBSyxDQUFDO2dCQUNMLHFCQUFxQixFQUFFLElBQUk7Z0JBQzNCLHVCQUF1QixFQUFFLElBQUk7Z0JBQzdCLGVBQWUsRUFBRSxJQUFJO2dCQUNyQixZQUFZLEVBQUUsa0NBQWtDO2dCQUNoRCxVQUFVLEVBQUUsSUFBSTtnQkFDaEIsMkJBQTJCLHFHQUEyQztnQkFDdEUsbUJBQW1CLHFGQUFtQztnQkFDdEQsd0JBQXdCLDZGQUF1QztnQkFDL0QscUJBQXFCLCtFQUFnQztnQkFDckQsaUJBQWlCLHVFQUE0QjtnQkFDN0MsbUJBQW1CLHVFQUE0QjtnQkFDL0MsSUFBSSxFQUFFLFVBQVU7Z0JBQ2hCLFlBQVksd0RBQTZDO2FBQ3pELEVBQUUsbUJBQW1CLEVBQUUsa0JBQWtCLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztZQXJCdkQsY0FBUyxHQUFULFNBQVMsQ0FBbUI7WUFHQyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1lBQzNDLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1lBQ3BCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFrQnBGLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLEVBQUU7Z0JBQ3ZELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsaUJBQWlCLEdBQUcsd0NBQW1CLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUM1RixJQUFJLENBQUMsa0JBQWtCLEdBQUcsd0NBQW1CLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUN4RixJQUFJLENBQUMsa0JBQWtCLEdBQUcsd0NBQW1CLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUMxRixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMscUJBQXFCLENBQUMsR0FBRyxFQUFFO2dCQUM1RCxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRTtvQkFDckIsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7aUJBQ3RCO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3hFLElBQUksQ0FBQyxDQUFDLG9CQUFvQixDQUFDLCtCQUErQixDQUFDLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFO29CQUNoRixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztpQkFDdEI7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDMUIsQ0FBQztRQUVELElBQUksQ0FBQyxRQUFpQixFQUFFLE1BQWdCO1lBQ3ZDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO1lBQ25DLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ1gsT0FBTzthQUNQO1lBQ0QsSUFBSSxRQUFRLEVBQUU7Z0JBQ2IsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixFQUFFLEVBQUUsYUFBYSxFQUFFLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO2FBQy9MO2lCQUFNO2dCQUNOLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsY0FBYyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxFQUFFLGFBQWEsRUFBRSxJQUFJLENBQUMsc0JBQXNCLEVBQUUsRUFBRSxDQUFDLENBQUM7YUFDdEs7UUFDRixDQUFDO1FBRVEsTUFBTTtZQUNkLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7WUFDdkksTUFBTSxVQUFVLEdBQUcsWUFBWSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUM7WUFDbkQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUM7WUFDbkMsSUFBSSxLQUFLLElBQUksVUFBVSxJQUFJLFVBQVUsS0FBSyxFQUFFLEVBQUU7Z0JBQzdDLGdDQUFnQztnQkFDaEMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEtBQUssRUFBRSxVQUFVLEVBQUUsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsY0FBYyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxFQUFFLGFBQWEsRUFBRSxJQUFJLENBQUMsc0JBQXNCLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFO29CQUN6TSxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUMvQixJQUFJLENBQUMsU0FBUyxDQUFDLGFBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLDJCQUEyQixFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNuRyxDQUFDLENBQUMsQ0FBQzthQUNIO1lBQ0QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUUxQixLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbkMsQ0FBQztRQUVRLElBQUk7WUFDWixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1lBQ3ZJLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDekIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuQyxDQUFDO1FBRVEsSUFBSTtZQUNaLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNiLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNoQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzQixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxzQkFBc0IsRUFBRSxDQUFDO1FBQ2hELENBQUM7UUFFUyxLQUFLLENBQUMsZUFBZTtZQUM5QixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQztRQUN6QyxDQUFDO1FBRVMsZUFBZTtZQUN4QiwrQkFBK0I7WUFDL0IsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUM7WUFDbkMsSUFBSSxLQUFLLEVBQUU7Z0JBQ1YsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixFQUFFLEVBQUUsYUFBYSxFQUFFLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRTtvQkFDOU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDaEMsQ0FBQyxDQUFDLENBQUM7YUFDSDtZQUNELE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUVTLG9CQUFvQjtZQUM3QixJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFFUyxtQkFBbUI7WUFDNUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsMkJBQTJCLEVBQUUsQ0FBQztZQUNwRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDakMsQ0FBQztRQUVTLDZCQUE2QjtZQUN0QyxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFFUyw0QkFBNEI7WUFDckMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2hDLENBQUM7UUFFRCxTQUFTO1lBQ1IsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztZQUNoQyxJQUFJLFFBQVEsQ0FBQyxZQUFZLEVBQUUsRUFBRTtnQkFDNUIsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDO2FBQzFCO1lBQ0QsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQztZQUM3QixJQUFJLEtBQUssRUFBRTtnQkFDVixJQUFJLENBQUMsc0JBQXNCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxhQUFhLEVBQUUsSUFBSSxDQUFDLHNCQUFzQixFQUFFLEVBQUUsQ0FBQyxDQUFDO2FBQzFLO1FBQ0YsQ0FBQztRQUVPLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxLQUFxQixFQUFFLElBQVksRUFBRSxPQUF1QjtZQUM1RixPQUFPLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRTtnQkFDdEQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQywyQkFBMkIsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDbEcsT0FBTyxVQUFVLENBQUM7WUFDbkIsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRU8sS0FBSyxDQUFDLHNCQUFzQixDQUFDLEtBQXFCLEVBQUUsSUFBWSxFQUFFLE9BQXVCO1lBQ2hHLE9BQU8sS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUMxRCxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLDJCQUEyQixFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNsRyxPQUFPLFVBQVUsQ0FBQztZQUNuQixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7S0FDRCxDQUFBO0lBbkpZLGdEQUFrQjtpQ0FBbEIsa0JBQWtCO1FBTzVCLFdBQUEsaUNBQW1CLENBQUE7UUFDbkIsV0FBQSwrQkFBa0IsQ0FBQTtRQUNsQixXQUFBLCtCQUFrQixDQUFBO1FBQ2xCLFdBQUEsNEJBQWEsQ0FBQTtRQUNiLFdBQUEscUNBQXFCLENBQUE7T0FYWCxrQkFBa0IsQ0FtSjlCIn0=