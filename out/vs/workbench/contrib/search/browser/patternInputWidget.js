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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/toggle/toggle", "vs/base/browser/ui/widget", "vs/base/common/codicons", "vs/base/common/event", "vs/nls", "vs/platform/history/browser/contextScopedHistoryWidget", "vs/platform/history/browser/historyWidgetKeybindingHint", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybinding", "vs/platform/theme/browser/defaultStyles"], function (require, exports, dom, toggle_1, widget_1, codicons_1, event_1, nls, contextScopedHistoryWidget_1, historyWidgetKeybindingHint_1, configuration_1, contextkey_1, keybinding_1, defaultStyles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExcludePatternInputWidget = exports.IncludePatternInputWidget = exports.PatternInputWidget = void 0;
    let PatternInputWidget = class PatternInputWidget extends widget_1.Widget {
        static { this.OPTION_CHANGE = 'optionChange'; }
        constructor(parent, contextViewProvider, options, contextKeyService, configurationService, keybindingService) {
            super();
            this.contextViewProvider = contextViewProvider;
            this.contextKeyService = contextKeyService;
            this.configurationService = configurationService;
            this.keybindingService = keybindingService;
            this._onSubmit = this._register(new event_1.Emitter());
            this.onSubmit = this._onSubmit.event;
            this._onCancel = this._register(new event_1.Emitter());
            this.onCancel = this._onCancel.event;
            options = {
                ...{
                    ariaLabel: nls.localize('defaultLabel', "input")
                },
                ...options,
            };
            this.width = options.width ?? 100;
            this.render(options);
            parent.appendChild(this.domNode);
        }
        dispose() {
            super.dispose();
            this.inputFocusTracker?.dispose();
        }
        setWidth(newWidth) {
            this.width = newWidth;
            this.contextViewProvider.layout();
            this.setInputWidth();
        }
        getValue() {
            return this.inputBox.value;
        }
        setValue(value) {
            if (this.inputBox.value !== value) {
                this.inputBox.value = value;
            }
        }
        select() {
            this.inputBox.select();
        }
        focus() {
            this.inputBox.focus();
        }
        inputHasFocus() {
            return this.inputBox.hasFocus();
        }
        setInputWidth() {
            this.inputBox.width = this.width - this.getSubcontrolsWidth() - 2; // 2 for input box border
        }
        getSubcontrolsWidth() {
            return 0;
        }
        getHistory() {
            return this.inputBox.getHistory();
        }
        clearHistory() {
            this.inputBox.clearHistory();
        }
        prependHistory(history) {
            this.inputBox.prependHistory(history);
        }
        clear() {
            this.setValue('');
        }
        onSearchSubmit() {
            this.inputBox.addToHistory();
        }
        showNextTerm() {
            this.inputBox.showNextValue();
        }
        showPreviousTerm() {
            this.inputBox.showPreviousValue();
        }
        render(options) {
            this.domNode = document.createElement('div');
            this.domNode.classList.add('monaco-findInput');
            this.inputBox = new contextScopedHistoryWidget_1.ContextScopedHistoryInputBox(this.domNode, this.contextViewProvider, {
                placeholder: options.placeholder,
                showPlaceholderOnFocus: options.showPlaceholderOnFocus,
                tooltip: options.tooltip,
                ariaLabel: options.ariaLabel,
                validationOptions: {
                    validation: undefined
                },
                history: options.history || [],
                showHistoryHint: () => (0, historyWidgetKeybindingHint_1.showHistoryKeybindingHint)(this.keybindingService),
                inputBoxStyles: options.inputBoxStyles
            }, this.contextKeyService);
            this._register(this.inputBox.onDidChange(() => this._onSubmit.fire(true)));
            this.inputFocusTracker = dom.trackFocus(this.inputBox.inputElement);
            this.onkeyup(this.inputBox.inputElement, (keyboardEvent) => this.onInputKeyUp(keyboardEvent));
            const controls = document.createElement('div');
            controls.className = 'controls';
            this.renderSubcontrols(controls);
            this.domNode.appendChild(controls);
            this.setInputWidth();
        }
        renderSubcontrols(_controlsDiv) {
        }
        onInputKeyUp(keyboardEvent) {
            switch (keyboardEvent.keyCode) {
                case 3 /* KeyCode.Enter */:
                    this.onSearchSubmit();
                    this._onSubmit.fire(false);
                    return;
                case 9 /* KeyCode.Escape */:
                    this._onCancel.fire();
                    return;
            }
        }
    };
    exports.PatternInputWidget = PatternInputWidget;
    exports.PatternInputWidget = PatternInputWidget = __decorate([
        __param(3, contextkey_1.IContextKeyService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, keybinding_1.IKeybindingService)
    ], PatternInputWidget);
    let IncludePatternInputWidget = class IncludePatternInputWidget extends PatternInputWidget {
        constructor(parent, contextViewProvider, options, contextKeyService, configurationService, keybindingService) {
            super(parent, contextViewProvider, options, contextKeyService, configurationService, keybindingService);
            this._onChangeSearchInEditorsBoxEmitter = this._register(new event_1.Emitter());
            this.onChangeSearchInEditorsBox = this._onChangeSearchInEditorsBoxEmitter.event;
        }
        dispose() {
            super.dispose();
            this.useSearchInEditorsBox.dispose();
        }
        onlySearchInOpenEditors() {
            return this.useSearchInEditorsBox.checked;
        }
        setOnlySearchInOpenEditors(value) {
            this.useSearchInEditorsBox.checked = value;
            this._onChangeSearchInEditorsBoxEmitter.fire();
        }
        getSubcontrolsWidth() {
            return super.getSubcontrolsWidth() + this.useSearchInEditorsBox.width();
        }
        renderSubcontrols(controlsDiv) {
            this.useSearchInEditorsBox = this._register(new toggle_1.Toggle({
                icon: codicons_1.Codicon.book,
                title: nls.localize('onlySearchInOpenEditors', "Search only in Open Editors"),
                isChecked: false,
                ...defaultStyles_1.defaultToggleStyles
            }));
            this._register(this.useSearchInEditorsBox.onChange(viaKeyboard => {
                this._onChangeSearchInEditorsBoxEmitter.fire();
                if (!viaKeyboard) {
                    this.inputBox.focus();
                }
            }));
            controlsDiv.appendChild(this.useSearchInEditorsBox.domNode);
            super.renderSubcontrols(controlsDiv);
        }
    };
    exports.IncludePatternInputWidget = IncludePatternInputWidget;
    exports.IncludePatternInputWidget = IncludePatternInputWidget = __decorate([
        __param(3, contextkey_1.IContextKeyService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, keybinding_1.IKeybindingService)
    ], IncludePatternInputWidget);
    let ExcludePatternInputWidget = class ExcludePatternInputWidget extends PatternInputWidget {
        constructor(parent, contextViewProvider, options, contextKeyService, configurationService, keybindingService) {
            super(parent, contextViewProvider, options, contextKeyService, configurationService, keybindingService);
            this._onChangeIgnoreBoxEmitter = this._register(new event_1.Emitter());
            this.onChangeIgnoreBox = this._onChangeIgnoreBoxEmitter.event;
        }
        dispose() {
            super.dispose();
            this.useExcludesAndIgnoreFilesBox.dispose();
        }
        useExcludesAndIgnoreFiles() {
            return this.useExcludesAndIgnoreFilesBox.checked;
        }
        setUseExcludesAndIgnoreFiles(value) {
            this.useExcludesAndIgnoreFilesBox.checked = value;
            this._onChangeIgnoreBoxEmitter.fire();
        }
        getSubcontrolsWidth() {
            return super.getSubcontrolsWidth() + this.useExcludesAndIgnoreFilesBox.width();
        }
        renderSubcontrols(controlsDiv) {
            this.useExcludesAndIgnoreFilesBox = this._register(new toggle_1.Toggle({
                icon: codicons_1.Codicon.exclude,
                actionClassName: 'useExcludesAndIgnoreFiles',
                title: nls.localize('useExcludesAndIgnoreFilesDescription', "Use Exclude Settings and Ignore Files"),
                isChecked: true,
                ...defaultStyles_1.defaultToggleStyles
            }));
            this._register(this.useExcludesAndIgnoreFilesBox.onChange(viaKeyboard => {
                this._onChangeIgnoreBoxEmitter.fire();
                if (!viaKeyboard) {
                    this.inputBox.focus();
                }
            }));
            controlsDiv.appendChild(this.useExcludesAndIgnoreFilesBox.domNode);
            super.renderSubcontrols(controlsDiv);
        }
    };
    exports.ExcludePatternInputWidget = ExcludePatternInputWidget;
    exports.ExcludePatternInputWidget = ExcludePatternInputWidget = __decorate([
        __param(3, contextkey_1.IContextKeyService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, keybinding_1.IKeybindingService)
    ], ExcludePatternInputWidget);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0dGVybklucHV0V2lkZ2V0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvc2VhcmNoL2Jyb3dzZXIvcGF0dGVybklucHV0V2lkZ2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQTZCekYsSUFBTSxrQkFBa0IsR0FBeEIsTUFBTSxrQkFBbUIsU0FBUSxlQUFNO2lCQUV0QyxrQkFBYSxHQUFXLGNBQWMsQUFBekIsQ0FBMEI7UUFlOUMsWUFBWSxNQUFtQixFQUFVLG1CQUF5QyxFQUFFLE9BQWlCLEVBQ2hGLGlCQUFzRCxFQUNuRCxvQkFBOEQsRUFDakUsaUJBQXNEO1lBRTFFLEtBQUssRUFBRSxDQUFDO1lBTGdDLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBc0I7WUFDNUMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUNoQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQ2hELHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFUbkUsY0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVcsQ0FBQyxDQUFDO1lBQzNELGFBQVEsR0FBK0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUM7WUFFcEUsY0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQ3hELGFBQVEsR0FBc0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUM7WUFRbEQsT0FBTyxHQUFHO2dCQUNULEdBQUc7b0JBQ0YsU0FBUyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQztpQkFDaEQ7Z0JBQ0QsR0FBRyxPQUFPO2FBQ1YsQ0FBQztZQUNGLElBQUksQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssSUFBSSxH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