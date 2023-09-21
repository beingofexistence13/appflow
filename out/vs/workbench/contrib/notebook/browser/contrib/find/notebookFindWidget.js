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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/aria/aria", "vs/base/common/lazy", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/editor/contrib/find/browser/findModel", "vs/editor/contrib/find/browser/findState", "vs/editor/contrib/find/browser/findWidget", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/notebook/browser/contrib/find/findModel", "vs/workbench/contrib/notebook/browser/contrib/find/notebookFindReplaceWidget", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/common/notebookContextKeys"], function (require, exports, DOM, aria_1, lazy_1, lifecycle_1, strings, findModel_1, findState_1, findWidget_1, nls_1, actions_1, configuration_1, contextkey_1, contextView_1, instantiation_1, findModel_2, notebookFindReplaceWidget_1, notebookBrowser_1, notebookContextKeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookFindContrib = void 0;
    const FIND_HIDE_TRANSITION = 'find-hide-transition';
    const FIND_SHOW_TRANSITION = 'find-show-transition';
    let MAX_MATCHES_COUNT_WIDTH = 69;
    const PROGRESS_BAR_DELAY = 200; // show progress for at least 200ms
    let NotebookFindContrib = class NotebookFindContrib extends lifecycle_1.Disposable {
        static { this.id = 'workbench.notebook.find'; }
        constructor(notebookEditor, instantiationService) {
            super();
            this.notebookEditor = notebookEditor;
            this.instantiationService = instantiationService;
            this.widget = new lazy_1.Lazy(() => this._register(this.instantiationService.createInstance(NotebookFindWidget, this.notebookEditor)));
        }
        show(initialInput, options) {
            return this.widget.value.show(initialInput, options);
        }
        hide() {
            this.widget.rawValue?.hide();
        }
        replace(searchString) {
            return this.widget.value.replace(searchString);
        }
    };
    exports.NotebookFindContrib = NotebookFindContrib;
    exports.NotebookFindContrib = NotebookFindContrib = __decorate([
        __param(1, instantiation_1.IInstantiationService)
    ], NotebookFindContrib);
    let NotebookFindWidget = class NotebookFindWidget extends notebookFindReplaceWidget_1.SimpleFindReplaceWidget {
        constructor(_notebookEditor, contextViewService, contextKeyService, configurationService, contextMenuService, menuService, instantiationService) {
            super(contextViewService, contextKeyService, configurationService, contextMenuService, instantiationService, new findState_1.FindReplaceState(), _notebookEditor);
            this._showTimeout = null;
            this._hideTimeout = null;
            this._findModel = new findModel_2.FindModel(this._notebookEditor, this._state, this._configurationService);
            DOM.append(this._notebookEditor.getDomNode(), this.getDomNode());
            this._findWidgetFocused = notebookContextKeys_1.KEYBINDING_CONTEXT_NOTEBOOK_FIND_WIDGET_FOCUSED.bindTo(contextKeyService);
            this._register(this._findInput.onKeyDown((e) => this._onFindInputKeyDown(e)));
            this._register(this._replaceInput.onKeyDown((e) => this._onReplaceInputKeyDown(e)));
            this._register(this._state.onFindReplaceStateChange((e) => {
                this.onInputChanged();
                if (e.isSearching) {
                    if (this._state.isSearching) {
                        this._progressBar.infinite().show(PROGRESS_BAR_DELAY);
                    }
                    else {
                        this._progressBar.stop().hide();
                    }
                }
                if (this._findModel.currentMatch >= 0) {
                    const currentMatch = this._findModel.getCurrentMatch();
                    this._replaceBtn.setEnabled(currentMatch.isModelMatch);
                }
                const matches = this._findModel.findMatches;
                this._replaceAllBtn.setEnabled(matches.length > 0 && matches.find(match => match.webviewMatches.length > 0) === undefined);
                if (e.filters) {
                    this._findInput.updateFilterState(this._state.filters?.isModified() ?? false);
                }
            }));
            this._register(DOM.addDisposableListener(this.getDomNode(), DOM.EventType.FOCUS, e => {
                this._previousFocusElement = e.relatedTarget instanceof HTMLElement ? e.relatedTarget : undefined;
            }, true));
        }
        _onFindInputKeyDown(e) {
            if (e.equals(3 /* KeyCode.Enter */)) {
                this.find(false);
                e.preventDefault();
                return;
            }
            else if (e.equals(1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */)) {
                this.find(true);
                e.preventDefault();
                return;
            }
        }
        _onReplaceInputKeyDown(e) {
            if (e.equals(3 /* KeyCode.Enter */)) {
                this.replaceOne();
                e.preventDefault();
                return;
            }
        }
        onInputChanged() {
            this._state.change({ searchString: this.inputValue }, false);
            // this._findModel.research();
            const findMatches = this._findModel.findMatches;
            if (findMatches && findMatches.length) {
                return true;
            }
            return false;
        }
        findIndex(index) {
            this._findModel.find({ index });
        }
        find(previous) {
            this._findModel.find({ previous });
        }
        replaceOne() {
            if (!this._notebookEditor.hasModel()) {
                return;
            }
            if (!this._findModel.findMatches.length) {
                return;
            }
            this._findModel.ensureFindMatches();
            if (this._findModel.currentMatch < 0) {
                this._findModel.find({ previous: false });
            }
            const currentMatch = this._findModel.getCurrentMatch();
            const cell = currentMatch.cell;
            if (currentMatch.isModelMatch) {
                const match = currentMatch.match;
                this._progressBar.infinite().show(PROGRESS_BAR_DELAY);
                const replacePattern = this.replacePattern;
                const replaceString = replacePattern.buildReplaceString(match.matches, this._state.preserveCase);
                const viewModel = this._notebookEditor.getViewModel();
                viewModel.replaceOne(cell, match.range, replaceString).then(() => {
                    this._progressBar.stop();
                });
            }
            else {
                // this should not work
                console.error('Replace does not work for output match');
            }
        }
        replaceAll() {
            if (!this._notebookEditor.hasModel()) {
                return;
            }
            this._progressBar.infinite().show(PROGRESS_BAR_DELAY);
            const replacePattern = this.replacePattern;
            const cellFindMatches = this._findModel.findMatches;
            const replaceStrings = [];
            cellFindMatches.forEach(cellFindMatch => {
                cellFindMatch.contentMatches.forEach(match => {
                    const matches = match.matches;
                    replaceStrings.push(replacePattern.buildReplaceString(matches, this._state.preserveCase));
                });
            });
            const viewModel = this._notebookEditor.getViewModel();
            viewModel.replaceAll(this._findModel.findMatches, replaceStrings).then(() => {
                this._progressBar.stop();
            });
        }
        findFirst() { }
        onFocusTrackerFocus() {
            this._findWidgetFocused.set(true);
        }
        onFocusTrackerBlur() {
            this._previousFocusElement = undefined;
            this._findWidgetFocused.reset();
        }
        onReplaceInputFocusTrackerFocus() {
            // throw new Error('Method not implemented.');
        }
        onReplaceInputFocusTrackerBlur() {
            // throw new Error('Method not implemented.');
        }
        onFindInputFocusTrackerFocus() { }
        onFindInputFocusTrackerBlur() { }
        async show(initialInput, options) {
            const searchStringUpdate = this._state.searchString !== initialInput;
            super.show(initialInput, options);
            this._state.change({ searchString: initialInput ?? this._state.searchString, isRevealed: true }, false);
            if (typeof options?.matchIndex === 'number') {
                if (!this._findModel.findMatches.length) {
                    await this._findModel.research();
                }
                this.findIndex(options.matchIndex);
            }
            else {
                this._findInput.select();
            }
            if (!searchStringUpdate && options?.searchStringSeededFrom) {
                this._findModel.refreshCurrentMatch(options.searchStringSeededFrom);
            }
            if (this._showTimeout === null) {
                if (this._hideTimeout !== null) {
                    window.clearTimeout(this._hideTimeout);
                    this._hideTimeout = null;
                    this._notebookEditor.removeClassName(FIND_HIDE_TRANSITION);
                }
                this._notebookEditor.addClassName(FIND_SHOW_TRANSITION);
                this._showTimeout = window.setTimeout(() => {
                    this._notebookEditor.removeClassName(FIND_SHOW_TRANSITION);
                    this._showTimeout = null;
                }, 200);
            }
            else {
                // no op
            }
        }
        replace(initialFindInput, initialReplaceInput) {
            super.showWithReplace(initialFindInput, initialReplaceInput);
            this._state.change({ searchString: initialFindInput ?? '', replaceString: initialReplaceInput ?? '', isRevealed: true }, false);
            this._replaceInput.select();
            if (this._showTimeout === null) {
                if (this._hideTimeout !== null) {
                    window.clearTimeout(this._hideTimeout);
                    this._hideTimeout = null;
                    this._notebookEditor.removeClassName(FIND_HIDE_TRANSITION);
                }
                this._notebookEditor.addClassName(FIND_SHOW_TRANSITION);
                this._showTimeout = window.setTimeout(() => {
                    this._notebookEditor.removeClassName(FIND_SHOW_TRANSITION);
                    this._showTimeout = null;
                }, 200);
            }
            else {
                // no op
            }
        }
        hide() {
            super.hide();
            this._state.change({ isRevealed: false }, false);
            this._findModel.clear();
            this._notebookEditor.findStop();
            this._progressBar.stop();
            if (this._hideTimeout === null) {
                if (this._showTimeout !== null) {
                    window.clearTimeout(this._showTimeout);
                    this._showTimeout = null;
                    this._notebookEditor.removeClassName(FIND_SHOW_TRANSITION);
                }
                this._notebookEditor.addClassName(FIND_HIDE_TRANSITION);
                this._hideTimeout = window.setTimeout(() => {
                    this._notebookEditor.removeClassName(FIND_HIDE_TRANSITION);
                }, 200);
            }
            else {
                // no op
            }
            if (this._previousFocusElement && this._previousFocusElement.offsetParent) {
                this._previousFocusElement.focus();
                this._previousFocusElement = undefined;
            }
            if (this._notebookEditor.hasModel()) {
                for (let i = 0; i < this._notebookEditor.getLength(); i++) {
                    const cell = this._notebookEditor.cellAt(i);
                    if (cell.getEditState() === notebookBrowser_1.CellEditState.Editing && cell.editStateSource === 'find') {
                        cell.updateEditState(notebookBrowser_1.CellEditState.Preview, 'closeFind');
                    }
                }
            }
        }
        _updateMatchesCount() {
            if (!this._findModel || !this._findModel.findMatches) {
                return;
            }
            this._matchesCount.style.width = MAX_MATCHES_COUNT_WIDTH + 'px';
            this._matchesCount.title = '';
            // remove previous content
            if (this._matchesCount.firstChild) {
                this._matchesCount.removeChild(this._matchesCount.firstChild);
            }
            let label;
            if (this._state.matchesCount > 0) {
                let matchesCount = String(this._state.matchesCount);
                if (this._state.matchesCount >= findModel_1.MATCHES_LIMIT) {
                    matchesCount += '+';
                }
                const matchesPosition = this._findModel.currentMatch < 0 ? '?' : String((this._findModel.currentMatch + 1));
                label = strings.format(findWidget_1.NLS_MATCHES_LOCATION, matchesPosition, matchesCount);
            }
            else {
                label = findWidget_1.NLS_NO_RESULTS;
            }
            this._matchesCount.appendChild(document.createTextNode(label));
            (0, aria_1.alert)(this._getAriaLabel(label, this._state.currentMatch, this._state.searchString));
            MAX_MATCHES_COUNT_WIDTH = Math.max(MAX_MATCHES_COUNT_WIDTH, this._matchesCount.clientWidth);
        }
        _getAriaLabel(label, currentMatch, searchString) {
            if (label === findWidget_1.NLS_NO_RESULTS) {
                return searchString === ''
                    ? (0, nls_1.localize)('ariaSearchNoResultEmpty', "{0} found", label)
                    : (0, nls_1.localize)('ariaSearchNoResult', "{0} found for '{1}'", label, searchString);
            }
            // TODO@rebornix, aria for `cell ${index}, line {line}`
            return (0, nls_1.localize)('ariaSearchNoResultWithLineNumNoCurrentMatch', "{0} found for '{1}'", label, searchString);
        }
        dispose() {
            this._notebookEditor?.removeClassName(FIND_SHOW_TRANSITION);
            this._notebookEditor?.removeClassName(FIND_HIDE_TRANSITION);
            this._findModel.dispose();
            super.dispose();
        }
    };
    NotebookFindWidget = __decorate([
        __param(1, contextView_1.IContextViewService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, contextView_1.IContextMenuService),
        __param(5, actions_1.IMenuService),
        __param(6, instantiation_1.IInstantiationService)
    ], NotebookFindWidget);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tGaW5kV2lkZ2V0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci9jb250cmliL2ZpbmQvbm90ZWJvb2tGaW5kV2lkZ2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQTBCaEcsTUFBTSxvQkFBb0IsR0FBRyxzQkFBc0IsQ0FBQztJQUNwRCxNQUFNLG9CQUFvQixHQUFHLHNCQUFzQixDQUFDO0lBQ3BELElBQUksdUJBQXVCLEdBQUcsRUFBRSxDQUFDO0lBQ2pDLE1BQU0sa0JBQWtCLEdBQUcsR0FBRyxDQUFDLENBQUMsbUNBQW1DO0lBVzVELElBQU0sbUJBQW1CLEdBQXpCLE1BQU0sbUJBQW9CLFNBQVEsc0JBQVU7aUJBRWxDLE9BQUUsR0FBVyx5QkFBeUIsQUFBcEMsQ0FBcUM7UUFJdkQsWUFDa0IsY0FBK0IsRUFDUixvQkFBMkM7WUFFbkYsS0FBSyxFQUFFLENBQUM7WUFIUyxtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDUix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBSW5GLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxXQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakksQ0FBQztRQUVELElBQUksQ0FBQyxZQUFxQixFQUFFLE9BQXdDO1lBQ25FLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBRUQsSUFBSTtZQUNILElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLElB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