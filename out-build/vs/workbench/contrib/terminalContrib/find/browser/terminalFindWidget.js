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
    exports.$BWb = void 0;
    const TERMINAL_FIND_WIDGET_INITIAL_WIDTH = 419;
    let $BWb = class $BWb extends simpleFindWidget_1.$zWb {
        constructor(hb, _contextViewService, keybindingService, ib, jb, lb) {
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
            }, _contextViewService, ib, keybindingService);
            this.hb = hb;
            this.ib = ib;
            this.jb = jb;
            this.lb = lb;
            this.B(this.state.onFindReplaceStateChange(() => {
                this.show();
            }));
            this.eb = terminalContextKey_1.TerminalContextKeys.findInputFocus.bindTo(this.ib);
            this.fb = terminalContextKey_1.TerminalContextKeys.findFocus.bindTo(this.ib);
            this.gb = terminalContextKey_1.TerminalContextKeys.findVisible.bindTo(this.ib);
            this.B(this.jb.onDidColorThemeChange(() => {
                if (this.isVisible()) {
                    this.find(true, true);
                }
            }));
            this.B(this.lb.onDidChangeConfiguration((e) => {
                if (e.affectsConfiguration('workbench.colorCustomizations') && this.isVisible()) {
                    this.find(true, true);
                }
            }));
            this.updateResultCount();
        }
        find(previous, update) {
            const xterm = this.hb.xterm;
            if (!xterm) {
                return;
            }
            if (previous) {
                this.tb(xterm, this.U, { regex: this.Z(), wholeWord: this.$(), caseSensitive: this.ab(), incremental: update });
            }
            else {
                this.sb(xterm, this.U, { regex: this.Z(), wholeWord: this.$(), caseSensitive: this.ab() });
            }
        }
        reveal() {
            const initialInput = this.hb.hasSelection() && !this.hb.selection.includes('\n') ? this.hb.selection : undefined;
            const inputValue = initialInput ?? this.U;
            const xterm = this.hb.xterm;
            if (xterm && inputValue && inputValue !== '') {
                // trigger highlight all matches
                this.tb(xterm, inputValue, { incremental: true, regex: this.Z(), wholeWord: this.$(), caseSensitive: this.ab() }).then(foundMatch => {
                    this.bb(foundMatch);
                    this.B(event_1.Event.once(xterm.onDidChangeSelection)(() => xterm.clearActiveSearchDecoration()));
                });
            }
            this.bb(false);
            super.reveal(inputValue);
            this.gb.set(true);
        }
        show() {
            const initialInput = this.hb.hasSelection() && !this.hb.selection.includes('\n') ? this.hb.selection : undefined;
            super.show(initialInput);
            this.gb.set(true);
        }
        hide() {
            super.hide();
            this.gb.reset();
            this.hb.focus(true);
            this.hb.xterm?.clearSearchDecorations();
        }
        async S() {
            return this.hb.xterm?.findResult;
        }
        N() {
            // Ignore input changes for now
            const xterm = this.hb.xterm;
            if (xterm) {
                this.tb(xterm, this.U, { regex: this.Z(), wholeWord: this.$(), caseSensitive: this.ab(), incremental: true }).then(foundMatch => {
                    this.bb(foundMatch);
                });
            }
            return false;
        }
        O() {
            this.fb.set(true);
        }
        P() {
            this.hb.xterm?.clearActiveSearchDecoration();
            this.fb.reset();
        }
        Q() {
            this.eb.set(true);
        }
        R() {
            this.eb.reset();
        }
        findFirst() {
            const instance = this.hb;
            if (instance.hasSelection()) {
                instance.clearSelection();
            }
            const xterm = instance.xterm;
            if (xterm) {
                this.tb(xterm, this.U, { regex: this.Z(), wholeWord: this.$(), caseSensitive: this.ab() });
            }
        }
        async sb(xterm, term, options) {
            return xterm.findNext(term, options).then(foundMatch => {
                this.B(event_1.Event.once(xterm.onDidChangeSelection)(() => xterm.clearActiveSearchDecoration()));
                return foundMatch;
            });
        }
        async tb(xterm, term, options) {
            return xterm.findPrevious(term, options).then(foundMatch => {
                this.B(event_1.Event.once(xterm.onDidChangeSelection)(() => xterm.clearActiveSearchDecoration()));
                return foundMatch;
            });
        }
    };
    exports.$BWb = $BWb;
    exports.$BWb = $BWb = __decorate([
        __param(1, contextView_1.$VZ),
        __param(2, keybinding_1.$2D),
        __param(3, contextkey_1.$3i),
        __param(4, themeService_1.$gv),
        __param(5, configuration_1.$8h)
    ], $BWb);
});
//# sourceMappingURL=terminalFindWidget.js.map