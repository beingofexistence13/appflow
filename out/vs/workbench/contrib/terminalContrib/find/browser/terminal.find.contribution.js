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
define(["require", "exports", "vs/base/common/lazy", "vs/base/common/lifecycle", "vs/nls", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/search/browser/searchActionsFind", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/browser/terminalActions", "vs/workbench/contrib/terminal/browser/terminalExtensions", "vs/workbench/contrib/terminal/common/terminalContextKey", "vs/workbench/contrib/terminalContrib/find/browser/terminalFindWidget"], function (require, exports, lazy_1, lifecycle_1, nls_1, contextkey_1, instantiation_1, searchActionsFind_1, terminal_1, terminalActions_1, terminalExtensions_1, terminalContextKey_1, terminalFindWidget_1) {
    "use strict";
    var TerminalFindContribution_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    let TerminalFindContribution = class TerminalFindContribution extends lifecycle_1.Disposable {
        static { TerminalFindContribution_1 = this; }
        static { this.ID = 'terminal.find'; }
        static get(instance) {
            return instance.getContribution(TerminalFindContribution_1.ID);
        }
        get findWidget() { return this._findWidget.value; }
        constructor(_instance, processManager, widgetManager, instantiationService, terminalService) {
            super();
            this._instance = _instance;
            this._findWidget = new lazy_1.Lazy(() => {
                const findWidget = instantiationService.createInstance(terminalFindWidget_1.TerminalFindWidget, this._instance);
                // Track focus and set state so we can force the scroll bar to be visible
                findWidget.focusTracker.onDidFocus(() => {
                    this._instance.forceScrollbarVisibility();
                    terminalService.setActiveInstance(this._instance);
                });
                findWidget.focusTracker.onDidBlur(() => {
                    this._instance.resetScrollbarVisibility();
                });
                this._instance.domElement.appendChild(findWidget.getDomNode());
                if (this._lastLayoutDimensions) {
                    findWidget.layout(this._lastLayoutDimensions.width);
                }
                return findWidget;
            });
        }
        layout(xterm, dimension) {
            this._lastLayoutDimensions = dimension;
            this._findWidget.rawValue?.layout(dimension.width);
        }
        xtermReady(xterm) {
            this._register(xterm.onDidChangeFindResults(() => this._findWidget.rawValue?.updateResultCount()));
        }
        dispose() {
            super.dispose();
            this._findWidget.rawValue?.dispose();
        }
    };
    TerminalFindContribution = TerminalFindContribution_1 = __decorate([
        __param(3, instantiation_1.IInstantiationService),
        __param(4, terminal_1.ITerminalService)
    ], TerminalFindContribution);
    (0, terminalExtensions_1.registerTerminalContribution)(TerminalFindContribution.ID, TerminalFindContribution);
    (0, terminalActions_1.registerActiveInstanceAction)({
        id: "workbench.action.terminal.focusFind" /* TerminalCommandId.FindFocus */,
        title: { value: (0, nls_1.localize)('workbench.action.terminal.focusFind', "Focus Find"), original: 'Focus Find' },
        keybinding: {
            primary: 2048 /* KeyMod.CtrlCmd */ | 36 /* KeyCode.KeyF */,
            when: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.findFocus, terminalContextKey_1.TerminalContextKeys.focus),
            weight: 200 /* KeybindingWeight.WorkbenchContrib */
        },
        precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
        run: (activeInstance) => {
            TerminalFindContribution.get(activeInstance)?.findWidget.reveal();
        }
    });
    (0, terminalActions_1.registerActiveInstanceAction)({
        id: "workbench.action.terminal.hideFind" /* TerminalCommandId.FindHide */,
        title: { value: (0, nls_1.localize)('workbench.action.terminal.hideFind', "Hide Find"), original: 'Hide Find' },
        keybinding: {
            primary: 9 /* KeyCode.Escape */,
            secondary: [1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */],
            when: contextkey_1.ContextKeyExpr.and(terminalContextKey_1.TerminalContextKeys.focus, terminalContextKey_1.TerminalContextKeys.findVisible),
            weight: 200 /* KeybindingWeight.WorkbenchContrib */
        },
        precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
        run: (activeInstance) => {
            TerminalFindContribution.get(activeInstance)?.findWidget.hide();
        }
    });
    (0, terminalActions_1.registerActiveInstanceAction)({
        id: "workbench.action.terminal.toggleFindRegex" /* TerminalCommandId.ToggleFindRegex */,
        title: { value: (0, nls_1.localize)('workbench.action.terminal.toggleFindRegex', "Toggle Find Using Regex"), original: 'Toggle Find Using Regex' },
        keybinding: {
            primary: 512 /* KeyMod.Alt */ | 48 /* KeyCode.KeyR */,
            mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 48 /* KeyCode.KeyR */ },
            when: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.focus, terminalContextKey_1.TerminalContextKeys.findFocus),
            weight: 200 /* KeybindingWeight.WorkbenchContrib */
        },
        precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
        run: (activeInstance) => {
            const state = TerminalFindContribution.get(activeInstance)?.findWidget.state;
            state?.change({ isRegex: !state.isRegex }, false);
        }
    });
    (0, terminalActions_1.registerActiveInstanceAction)({
        id: "workbench.action.terminal.toggleFindWholeWord" /* TerminalCommandId.ToggleFindWholeWord */,
        title: { value: (0, nls_1.localize)('workbench.action.terminal.toggleFindWholeWord', "Toggle Find Using Whole Word"), original: 'Toggle Find Using Whole Word' },
        keybinding: {
            primary: 512 /* KeyMod.Alt */ | 53 /* KeyCode.KeyW */,
            mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 53 /* KeyCode.KeyW */ },
            when: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.focus, terminalContextKey_1.TerminalContextKeys.findFocus),
            weight: 200 /* KeybindingWeight.WorkbenchContrib */
        },
        precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
        run: (activeInstance) => {
            const state = TerminalFindContribution.get(activeInstance)?.findWidget.state;
            state?.change({ wholeWord: !state.wholeWord }, false);
        }
    });
    (0, terminalActions_1.registerActiveInstanceAction)({
        id: "workbench.action.terminal.toggleFindCaseSensitive" /* TerminalCommandId.ToggleFindCaseSensitive */,
        title: { value: (0, nls_1.localize)('workbench.action.terminal.toggleFindCaseSensitive', "Toggle Find Using Case Sensitive"), original: 'Toggle Find Using Case Sensitive' },
        keybinding: {
            primary: 512 /* KeyMod.Alt */ | 33 /* KeyCode.KeyC */,
            mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 33 /* KeyCode.KeyC */ },
            when: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.focus, terminalContextKey_1.TerminalContextKeys.findFocus),
            weight: 200 /* KeybindingWeight.WorkbenchContrib */
        },
        precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
        run: (activeInstance) => {
            const state = TerminalFindContribution.get(activeInstance)?.findWidget.state;
            state?.change({ matchCase: !state.matchCase }, false);
        }
    });
    (0, terminalActions_1.registerActiveInstanceAction)({
        id: "workbench.action.terminal.findNext" /* TerminalCommandId.FindNext */,
        title: { value: (0, nls_1.localize)('workbench.action.terminal.findNext', "Find Next"), original: 'Find Next' },
        keybinding: [
            {
                primary: 61 /* KeyCode.F3 */,
                mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 37 /* KeyCode.KeyG */, secondary: [61 /* KeyCode.F3 */] },
                when: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.focus, terminalContextKey_1.TerminalContextKeys.findFocus),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            {
                primary: 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */,
                when: terminalContextKey_1.TerminalContextKeys.findInputFocus,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            }
        ],
        precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
        run: (activeInstance) => {
            const widget = TerminalFindContribution.get(activeInstance)?.findWidget;
            if (widget) {
                widget.show();
                widget.find(false);
            }
        }
    });
    (0, terminalActions_1.registerActiveInstanceAction)({
        id: "workbench.action.terminal.findPrevious" /* TerminalCommandId.FindPrevious */,
        title: { value: (0, nls_1.localize)('workbench.action.terminal.findPrevious', "Find Previous"), original: 'Find Previous' },
        keybinding: [
            {
                primary: 1024 /* KeyMod.Shift */ | 61 /* KeyCode.F3 */,
                mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 37 /* KeyCode.KeyG */, secondary: [1024 /* KeyMod.Shift */ | 61 /* KeyCode.F3 */] },
                when: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.focus, terminalContextKey_1.TerminalContextKeys.findFocus),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            },
            {
                primary: 3 /* KeyCode.Enter */,
                when: terminalContextKey_1.TerminalContextKeys.findInputFocus,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            }
        ],
        precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated),
        run: (activeInstance) => {
            const widget = TerminalFindContribution.get(activeInstance)?.findWidget;
            if (widget) {
                widget.show();
                widget.find(true);
            }
        }
    });
    // Global workspace file search
    (0, terminalActions_1.registerActiveInstanceAction)({
        id: "workbench.action.terminal.searchWorkspace" /* TerminalCommandId.SearchWorkspace */,
        title: { value: (0, nls_1.localize)('workbench.action.terminal.searchWorkspace', "Search Workspace"), original: 'Search Workspace' },
        keybinding: [
            {
                primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 36 /* KeyCode.KeyF */,
                when: contextkey_1.ContextKeyExpr.and(terminalContextKey_1.TerminalContextKeys.processSupported, terminalContextKey_1.TerminalContextKeys.focus, terminalContextKey_1.TerminalContextKeys.textSelected),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 50
            }
        ],
        run: (activeInstance, c, accessor) => (0, searchActionsFind_1.findInFilesCommand)(accessor, { query: activeInstance.selection })
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWwuZmluZC5jb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbENvbnRyaWIvZmluZC9icm93c2VyL3Rlcm1pbmFsLmZpbmQuY29udHJpYnV0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQW9CaEcsSUFBTSx3QkFBd0IsR0FBOUIsTUFBTSx3QkFBeUIsU0FBUSxzQkFBVTs7aUJBQ2hDLE9BQUUsR0FBRyxlQUFlLEFBQWxCLENBQW1CO1FBRXJDLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBMkI7WUFDckMsT0FBTyxRQUFRLENBQUMsZUFBZSxDQUEyQiwwQkFBd0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN4RixDQUFDO1FBS0QsSUFBSSxVQUFVLEtBQXlCLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBRXZFLFlBQ2tCLFNBQTRCLEVBQzdDLGNBQXVDLEVBQ3ZDLGFBQW9DLEVBQ2Isb0JBQTJDLEVBQ2hELGVBQWlDO1lBRW5ELEtBQUssRUFBRSxDQUFDO1lBTlMsY0FBUyxHQUFULFNBQVMsQ0FBbUI7WUFRN0MsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLFdBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBQ2hDLE1BQU0sVUFBVSxHQUFHLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyx1Q0FBa0IsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBRTNGLHlFQUF5RTtnQkFDekUsVUFBVSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFO29CQUN2QyxJQUFJLENBQUMsU0FBUyxDQUFDLHdCQUF3QixFQUFFLENBQUM7b0JBQzFDLGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JB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