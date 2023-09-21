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
define(["require", "exports", "vs/base/browser/ui/findinput/findInput", "vs/base/browser/ui/findinput/replaceInput", "vs/base/browser/ui/inputbox/inputBox", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybindingsRegistry", "vs/nls!vs/platform/history/browser/contextScopedHistoryWidget", "vs/base/common/lifecycle"], function (require, exports, findInput_1, replaceInput_1, inputBox_1, contextkey_1, keybindingsRegistry_1, nls_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$U5 = exports.$T5 = exports.$S5 = exports.$R5 = exports.$Q5 = void 0;
    exports.$Q5 = new contextkey_1.$2i('suggestWidgetVisible', false, (0, nls_1.localize)(0, null));
    const HistoryNavigationWidgetFocusContext = 'historyNavigationWidgetFocus';
    const HistoryNavigationForwardsEnablementContext = 'historyNavigationForwardsEnabled';
    const HistoryNavigationBackwardsEnablementContext = 'historyNavigationBackwardsEnabled';
    let lastFocusedWidget = undefined;
    const widgets = [];
    function $R5(scopedContextKeyService, widget) {
        if (widgets.includes(widget)) {
            throw new Error('Cannot register the same widget multiple times');
        }
        widgets.push(widget);
        const disposableStore = new lifecycle_1.$jc();
        const historyNavigationWidgetFocus = new contextkey_1.$2i(HistoryNavigationWidgetFocusContext, false).bindTo(scopedContextKeyService);
        const historyNavigationForwardsEnablement = new contextkey_1.$2i(HistoryNavigationForwardsEnablementContext, true).bindTo(scopedContextKeyService);
        const historyNavigationBackwardsEnablement = new contextkey_1.$2i(HistoryNavigationBackwardsEnablementContext, true).bindTo(scopedContextKeyService);
        const onDidFocus = () => {
            historyNavigationWidgetFocus.set(true);
            lastFocusedWidget = widget;
        };
        const onDidBlur = () => {
            historyNavigationWidgetFocus.set(false);
            if (lastFocusedWidget === widget) {
                lastFocusedWidget = undefined;
            }
        };
        // Check for currently being focused
        if (widget.element === document.activeElement) {
            onDidFocus();
        }
        disposableStore.add(widget.onDidFocus(() => onDidFocus()));
        disposableStore.add(widget.onDidBlur(() => onDidBlur()));
        disposableStore.add((0, lifecycle_1.$ic)(() => {
            widgets.splice(widgets.indexOf(widget), 1);
            onDidBlur();
        }));
        return {
            historyNavigationForwardsEnablement,
            historyNavigationBackwardsEnablement,
            dispose() {
                disposableStore.dispose();
            }
        };
    }
    exports.$R5 = $R5;
    let $S5 = class $S5 extends inputBox_1.$tR {
        constructor(container, contextViewProvider, options, contextKeyService) {
            super(container, contextViewProvider, options);
            const scopedContextKeyService = this.B(contextKeyService.createScoped(this.element));
            this.B($R5(scopedContextKeyService, this));
        }
    };
    exports.$S5 = $S5;
    exports.$S5 = $S5 = __decorate([
        __param(3, contextkey_1.$3i)
    ], $S5);
    let $T5 = class $T5 extends findInput_1.$HR {
        constructor(container, contextViewProvider, options, contextKeyService) {
            super(container, contextViewProvider, options);
            const scopedContextKeyService = this.B(contextKeyService.createScoped(this.inputBox.element));
            this.B($R5(scopedContextKeyService, this.inputBox));
        }
    };
    exports.$T5 = $T5;
    exports.$T5 = $T5 = __decorate([
        __param(3, contextkey_1.$3i)
    ], $T5);
    let $U5 = class $U5 extends replaceInput_1.$IR {
        constructor(container, contextViewProvider, options, contextKeyService, showReplaceOptions = false) {
            super(container, contextViewProvider, showReplaceOptions, options);
            const scopedContextKeyService = this.B(contextKeyService.createScoped(this.inputBox.element));
            this.B($R5(scopedContextKeyService, this.inputBox));
        }
    };
    exports.$U5 = $U5;
    exports.$U5 = $U5 = __decorate([
        __param(3, contextkey_1.$3i)
    ], $U5);
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'history.showPrevious',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.$Ii.and(contextkey_1.$Ii.has(HistoryNavigationWidgetFocusContext), contextkey_1.$Ii.equals(HistoryNavigationBackwardsEnablementContext, true), contextkey_1.$Ii.not('isComposing'), exports.$Q5.isEqualTo(false)),
        primary: 16 /* KeyCode.UpArrow */,
        secondary: [512 /* KeyMod.Alt */ | 16 /* KeyCode.UpArrow */],
        handler: (accessor) => {
            lastFocusedWidget?.showPreviousValue();
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'history.showNext',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.$Ii.and(contextkey_1.$Ii.has(HistoryNavigationWidgetFocusContext), contextkey_1.$Ii.equals(HistoryNavigationForwardsEnablementContext, true), contextkey_1.$Ii.not('isComposing'), exports.$Q5.isEqualTo(false)),
        primary: 18 /* KeyCode.DownArrow */,
        secondary: [512 /* KeyMod.Alt */ | 18 /* KeyCode.DownArrow */],
        handler: (accessor) => {
            lastFocusedWidget?.showNextValue();
        }
    });
});
//# sourceMappingURL=contextScopedHistoryWidget.js.map