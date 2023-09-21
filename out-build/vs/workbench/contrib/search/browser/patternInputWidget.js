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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/toggle/toggle", "vs/base/browser/ui/widget", "vs/base/common/codicons", "vs/base/common/event", "vs/nls!vs/workbench/contrib/search/browser/patternInputWidget", "vs/platform/history/browser/contextScopedHistoryWidget", "vs/platform/history/browser/historyWidgetKeybindingHint", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybinding", "vs/platform/theme/browser/defaultStyles"], function (require, exports, dom, toggle_1, widget_1, codicons_1, event_1, nls, contextScopedHistoryWidget_1, historyWidgetKeybindingHint_1, configuration_1, contextkey_1, keybinding_1, defaultStyles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$uNb = exports.$tNb = exports.$sNb = void 0;
    let $sNb = class $sNb extends widget_1.$IP {
        static { this.OPTION_CHANGE = 'optionChange'; }
        constructor(parent, n, options, r, s, t) {
            super();
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.g = this.B(new event_1.$fd());
            this.onSubmit = this.g.event;
            this.h = this.B(new event_1.$fd());
            this.onCancel = this.h.event;
            options = {
                ...{
                    ariaLabel: nls.localize(0, null)
                },
                ...options,
            };
            this.a = options.width ?? 100;
            this.J(options);
            parent.appendChild(this.b);
        }
        dispose() {
            super.dispose();
            this.inputFocusTracker?.dispose();
        }
        setWidth(newWidth) {
            this.a = newWidth;
            this.n.layout();
            this.w();
        }
        getValue() {
            return this.c.value;
        }
        setValue(value) {
            if (this.c.value !== value) {
                this.c.value = value;
            }
        }
        select() {
            this.c.select();
        }
        focus() {
            this.c.focus();
        }
        inputHasFocus() {
            return this.c.hasFocus();
        }
        w() {
            this.c.width = this.a - this.y() - 2; // 2 for input box border
        }
        y() {
            return 0;
        }
        getHistory() {
            return this.c.getHistory();
        }
        clearHistory() {
            this.c.clearHistory();
        }
        prependHistory(history) {
            this.c.prependHistory(history);
        }
        clear() {
            this.setValue('');
        }
        onSearchSubmit() {
            this.c.addToHistory();
        }
        showNextTerm() {
            this.c.showNextValue();
        }
        showPreviousTerm() {
            this.c.showPreviousValue();
        }
        J(options) {
            this.b = document.createElement('div');
            this.b.classList.add('monaco-findInput');
            this.c = new contextScopedHistoryWidget_1.$S5(this.b, this.n, {
                placeholder: options.placeholder,
                showPlaceholderOnFocus: options.showPlaceholderOnFocus,
                tooltip: options.tooltip,
                ariaLabel: options.ariaLabel,
                validationOptions: {
                    validation: undefined
                },
                history: options.history || [],
                showHistoryHint: () => (0, historyWidgetKeybindingHint_1.$L7)(this.t),
                inputBoxStyles: options.inputBoxStyles
            }, this.r);
            this.B(this.c.onDidChange(() => this.g.fire(true)));
            this.inputFocusTracker = dom.$8O(this.c.inputElement);
            this.C(this.c.inputElement, (keyboardEvent) => this.M(keyboardEvent));
            const controls = document.createElement('div');
            controls.className = 'controls';
            this.L(controls);
            this.b.appendChild(controls);
            this.w();
        }
        L(_controlsDiv) {
        }
        M(keyboardEvent) {
            switch (keyboardEvent.keyCode) {
                case 3 /* KeyCode.Enter */:
                    this.onSearchSubmit();
                    this.g.fire(false);
                    return;
                case 9 /* KeyCode.Escape */:
                    this.h.fire();
                    return;
            }
        }
    };
    exports.$sNb = $sNb;
    exports.$sNb = $sNb = __decorate([
        __param(3, contextkey_1.$3i),
        __param(4, configuration_1.$8h),
        __param(5, keybinding_1.$2D)
    ], $sNb);
    let $tNb = class $tNb extends $sNb {
        constructor(parent, contextViewProvider, options, contextKeyService, configurationService, keybindingService) {
            super(parent, contextViewProvider, options, contextKeyService, configurationService, keybindingService);
            this.N = this.B(new event_1.$fd());
            this.onChangeSearchInEditorsBox = this.N.event;
        }
        dispose() {
            super.dispose();
            this.O.dispose();
        }
        onlySearchInOpenEditors() {
            return this.O.checked;
        }
        setOnlySearchInOpenEditors(value) {
            this.O.checked = value;
            this.N.fire();
        }
        y() {
            return super.y() + this.O.width();
        }
        L(controlsDiv) {
            this.O = this.B(new toggle_1.$KQ({
                icon: codicons_1.$Pj.book,
                title: nls.localize(1, null),
                isChecked: false,
                ...defaultStyles_1.$m2
            }));
            this.B(this.O.onChange(viaKeyboard => {
                this.N.fire();
                if (!viaKeyboard) {
                    this.c.focus();
                }
            }));
            controlsDiv.appendChild(this.O.domNode);
            super.L(controlsDiv);
        }
    };
    exports.$tNb = $tNb;
    exports.$tNb = $tNb = __decorate([
        __param(3, contextkey_1.$3i),
        __param(4, configuration_1.$8h),
        __param(5, keybinding_1.$2D)
    ], $tNb);
    let $uNb = class $uNb extends $sNb {
        constructor(parent, contextViewProvider, options, contextKeyService, configurationService, keybindingService) {
            super(parent, contextViewProvider, options, contextKeyService, configurationService, keybindingService);
            this.N = this.B(new event_1.$fd());
            this.onChangeIgnoreBox = this.N.event;
        }
        dispose() {
            super.dispose();
            this.O.dispose();
        }
        useExcludesAndIgnoreFiles() {
            return this.O.checked;
        }
        setUseExcludesAndIgnoreFiles(value) {
            this.O.checked = value;
            this.N.fire();
        }
        y() {
            return super.y() + this.O.width();
        }
        L(controlsDiv) {
            this.O = this.B(new toggle_1.$KQ({
                icon: codicons_1.$Pj.exclude,
                actionClassName: 'useExcludesAndIgnoreFiles',
                title: nls.localize(2, null),
                isChecked: true,
                ...defaultStyles_1.$m2
            }));
            this.B(this.O.onChange(viaKeyboard => {
                this.N.fire();
                if (!viaKeyboard) {
                    this.c.focus();
                }
            }));
            controlsDiv.appendChild(this.O.domNode);
            super.L(controlsDiv);
        }
    };
    exports.$uNb = $uNb;
    exports.$uNb = $uNb = __decorate([
        __param(3, contextkey_1.$3i),
        __param(4, configuration_1.$8h),
        __param(5, keybinding_1.$2D)
    ], $uNb);
});
//# sourceMappingURL=patternInputWidget.js.map