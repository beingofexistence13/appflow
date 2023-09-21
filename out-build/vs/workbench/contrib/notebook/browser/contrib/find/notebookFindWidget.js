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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/aria/aria", "vs/base/common/lazy", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/editor/contrib/find/browser/findModel", "vs/editor/contrib/find/browser/findState", "vs/editor/contrib/find/browser/findWidget", "vs/nls!vs/workbench/contrib/notebook/browser/contrib/find/notebookFindWidget", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/notebook/browser/contrib/find/findModel", "vs/workbench/contrib/notebook/browser/contrib/find/notebookFindReplaceWidget", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/common/notebookContextKeys"], function (require, exports, DOM, aria_1, lazy_1, lifecycle_1, strings, findModel_1, findState_1, findWidget_1, nls_1, actions_1, configuration_1, contextkey_1, contextView_1, instantiation_1, findModel_2, notebookFindReplaceWidget_1, notebookBrowser_1, notebookContextKeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$nFb = void 0;
    const FIND_HIDE_TRANSITION = 'find-hide-transition';
    const FIND_SHOW_TRANSITION = 'find-show-transition';
    let MAX_MATCHES_COUNT_WIDTH = 69;
    const PROGRESS_BAR_DELAY = 200; // show progress for at least 200ms
    let $nFb = class $nFb extends lifecycle_1.$kc {
        static { this.id = 'workbench.notebook.find'; }
        constructor(b, c) {
            super();
            this.b = b;
            this.c = c;
            this.a = new lazy_1.$T(() => this.B(this.c.createInstance(NotebookFindWidget, this.b)));
        }
        show(initialInput, options) {
            return this.a.value.show(initialInput, options);
        }
        hide() {
            this.a.rawValue?.hide();
        }
        replace(searchString) {
            return this.a.value.replace(searchString);
        }
    };
    exports.$nFb = $nFb;
    exports.$nFb = $nFb = __decorate([
        __param(1, instantiation_1.$Ah)
    ], $nFb);
    let NotebookFindWidget = class NotebookFindWidget extends notebookFindReplaceWidget_1.$mFb {
        constructor(_notebookEditor, contextViewService, contextKeyService, configurationService, contextMenuService, menuService, instantiationService) {
            super(contextViewService, contextKeyService, configurationService, contextMenuService, instantiationService, new findState_1.$t7(), _notebookEditor);
            this.Gb = null;
            this.Hb = null;
            this.Jb = new findModel_2.$yob(this.eb, this.db, this.ab);
            DOM.$0O(this.eb.getDomNode(), this.getDomNode());
            this.Fb = notebookContextKeys_1.$Unb.bindTo(contextKeyService);
            this.B(this.a.onKeyDown((e) => this.Kb(e)));
            this.B(this.y.onKeyDown((e) => this.Lb(e)));
            this.B(this.db.onFindReplaceStateChange((e) => {
                this.hb();
                if (e.isSearching) {
                    if (this.db.isSearching) {
                        this.W.infinite().show(PROGRESS_BAR_DELAY);
                    }
                    else {
                        this.W.stop().hide();
                    }
                }
                if (this.Jb.currentMatch >= 0) {
                    const currentMatch = this.Jb.getCurrentMatch();
                    this.N.setEnabled(currentMatch.isModelMatch);
                }
                const matches = this.Jb.findMatches;
                this.O.setEnabled(matches.length > 0 && matches.find(match => match.webviewMatches.length > 0) === undefined);
                if (e.filters) {
                    this.a.updateFilterState(this.db.filters?.isModified() ?? false);
                }
            }));
            this.B(DOM.$nO(this.getDomNode(), DOM.$3O.FOCUS, e => {
                this.Ib = e.relatedTarget instanceof HTMLElement ? e.relatedTarget : undefined;
            }, true));
        }
        Kb(e) {
            if (e.equals(3 /* KeyCode.Enter */)) {
                this.ib(false);
                e.preventDefault();
                return;
            }
            else if (e.equals(1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */)) {
                this.ib(true);
                e.preventDefault();
                return;
            }
        }
        Lb(e) {
            if (e.equals(3 /* KeyCode.Enter */)) {
                this.kb();
                e.preventDefault();
                return;
            }
        }
        hb() {
            this.db.change({ searchString: this.sb }, false);
            // this._findModel.research();
            const findMatches = this.Jb.findMatches;
            if (findMatches && findMatches.length) {
                return true;
            }
            return false;
        }
        Nb(index) {
            this.Jb.find({ index });
        }
        ib(previous) {
            this.Jb.find({ previous });
        }
        kb() {
            if (!this.eb.hasModel()) {
                return;
            }
            if (!this.Jb.findMatches.length) {
                return;
            }
            this.Jb.ensureFindMatches();
            if (this.Jb.currentMatch < 0) {
                this.Jb.find({ previous: false });
            }
            const currentMatch = this.Jb.getCurrentMatch();
            const cell = currentMatch.cell;
            if (currentMatch.isModelMatch) {
                const match = currentMatch.match;
                this.W.infinite().show(PROGRESS_BAR_DELAY);
                const replacePattern = this.ub;
                const replaceString = replacePattern.buildReplaceString(match.matches, this.db.preserveCase);
                const viewModel = this.eb.getViewModel();
                viewModel.replaceOne(cell, match.range, replaceString).then(() => {
                    this.W.stop();
                });
            }
            else {
                // this should not work
                console.error('Replace does not work for output match');
            }
        }
        lb() {
            if (!this.eb.hasModel()) {
                return;
            }
            this.W.infinite().show(PROGRESS_BAR_DELAY);
            const replacePattern = this.ub;
            const cellFindMatches = this.Jb.findMatches;
            const replaceStrings = [];
            cellFindMatches.forEach(cellFindMatch => {
                cellFindMatch.contentMatches.forEach(match => {
                    const matches = match.matches;
                    replaceStrings.push(replacePattern.buildReplaceString(matches, this.db.preserveCase));
                });
            });
            const viewModel = this.eb.getViewModel();
            viewModel.replaceAll(this.Jb.findMatches, replaceStrings).then(() => {
                this.W.stop();
            });
        }
        jb() { }
        mb() {
            this.Fb.set(true);
        }
        nb() {
            this.Ib = undefined;
            this.Fb.reset();
        }
        qb() {
            // throw new Error('Method not implemented.');
        }
        rb() {
            // throw new Error('Method not implemented.');
        }
        ob() { }
        pb() { }
        async show(initialInput, options) {
            const searchStringUpdate = this.db.searchString !== initialInput;
            super.show(initialInput, options);
            this.db.change({ searchString: initialInput ?? this.db.searchString, isRevealed: true }, false);
            if (typeof options?.matchIndex === 'number') {
                if (!this.Jb.findMatches.length) {
                    await this.Jb.research();
                }
                this.Nb(options.matchIndex);
            }
            else {
                this.a.select();
            }
            if (!searchStringUpdate && options?.searchStringSeededFrom) {
                this.Jb.refreshCurrentMatch(options.searchStringSeededFrom);
            }
            if (this.Gb === null) {
                if (this.Hb !== null) {
                    window.clearTimeout(this.Hb);
                    this.Hb = null;
                    this.eb.removeClassName(FIND_HIDE_TRANSITION);
                }
                this.eb.addClassName(FIND_SHOW_TRANSITION);
                this.Gb = window.setTimeout(() => {
                    this.eb.removeClassName(FIND_SHOW_TRANSITION);
                    this.Gb = null;
                }, 200);
            }
            else {
                // no op
            }
        }
        replace(initialFindInput, initialReplaceInput) {
            super.showWithReplace(initialFindInput, initialReplaceInput);
            this.db.change({ searchString: initialFindInput ?? '', replaceString: initialReplaceInput ?? '', isRevealed: true }, false);
            this.y.select();
            if (this.Gb === null) {
                if (this.Hb !== null) {
                    window.clearTimeout(this.Hb);
                    this.Hb = null;
                    this.eb.removeClassName(FIND_HIDE_TRANSITION);
                }
                this.eb.addClassName(FIND_SHOW_TRANSITION);
                this.Gb = window.setTimeout(() => {
                    this.eb.removeClassName(FIND_SHOW_TRANSITION);
                    this.Gb = null;
                }, 200);
            }
            else {
                // no op
            }
        }
        hide() {
            super.hide();
            this.db.change({ isRevealed: false }, false);
            this.Jb.clear();
            this.eb.findStop();
            this.W.stop();
            if (this.Hb === null) {
                if (this.Gb !== null) {
                    window.clearTimeout(this.Gb);
                    this.Gb = null;
                    this.eb.removeClassName(FIND_SHOW_TRANSITION);
                }
                this.eb.addClassName(FIND_HIDE_TRANSITION);
                this.Hb = window.setTimeout(() => {
                    this.eb.removeClassName(FIND_HIDE_TRANSITION);
                }, 200);
            }
            else {
                // no op
            }
            if (this.Ib && this.Ib.offsetParent) {
                this.Ib.focus();
                this.Ib = undefined;
            }
            if (this.eb.hasModel()) {
                for (let i = 0; i < this.eb.getLength(); i++) {
                    const cell = this.eb.cellAt(i);
                    if (cell.getEditState() === notebookBrowser_1.CellEditState.Editing && cell.editStateSource === 'find') {
                        cell.updateEditState(notebookBrowser_1.CellEditState.Preview, 'closeFind');
                    }
                }
            }
        }
        xb() {
            if (!this.Jb || !this.Jb.findMatches) {
                return;
            }
            this.s.style.width = MAX_MATCHES_COUNT_WIDTH + 'px';
            this.s.title = '';
            // remove previous content
            if (this.s.firstChild) {
                this.s.removeChild(this.s.firstChild);
            }
            let label;
            if (this.db.matchesCount > 0) {
                let matchesCount = String(this.db.matchesCount);
                if (this.db.matchesCount >= findModel_1.$I7) {
                    matchesCount += '+';
                }
                const matchesPosition = this.Jb.currentMatch < 0 ? '?' : String((this.Jb.currentMatch + 1));
                label = strings.$ne(findWidget_1.$Q7, matchesPosition, matchesCount);
            }
            else {
                label = findWidget_1.$R7;
            }
            this.s.appendChild(document.createTextNode(label));
            (0, aria_1.$$P)(this.Zb(label, this.db.currentMatch, this.db.searchString));
            MAX_MATCHES_COUNT_WIDTH = Math.max(MAX_MATCHES_COUNT_WIDTH, this.s.clientWidth);
        }
        Zb(label, currentMatch, searchString) {
            if (label === findWidget_1.$R7) {
                return searchString === ''
                    ? (0, nls_1.localize)(0, null, label)
                    : (0, nls_1.localize)(1, null, label, searchString);
            }
            // TODO@rebornix, aria for `cell ${index}, line {line}`
            return (0, nls_1.localize)(2, null, label, searchString);
        }
        dispose() {
            this.eb?.removeClassName(FIND_SHOW_TRANSITION);
            this.eb?.removeClassName(FIND_HIDE_TRANSITION);
            this.Jb.dispose();
            super.dispose();
        }
    };
    NotebookFindWidget = __decorate([
        __param(1, contextView_1.$VZ),
        __param(2, contextkey_1.$3i),
        __param(3, configuration_1.$8h),
        __param(4, contextView_1.$WZ),
        __param(5, actions_1.$Su),
        __param(6, instantiation_1.$Ah)
    ], NotebookFindWidget);
});
//# sourceMappingURL=notebookFindWidget.js.map