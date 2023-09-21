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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/platform/configuration/common/configuration", "vs/platform/markers/common/markers", "vs/platform/theme/common/themeService", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/editor/contrib/documentSymbols/browser/outlineModel", "vs/workbench/contrib/notebook/browser/viewModel/notebookOutlineEntryFactory"], function (require, exports, event_1, lifecycle_1, resources_1, configuration_1, markers_1, themeService_1, notebookCommon_1, notebookExecutionStateService_1, outlineModel_1, notebookOutlineEntryFactory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$wrb = void 0;
    let $wrb = class $wrb {
        get entries() {
            return this.d;
        }
        get activeElement() {
            return this.f;
        }
        constructor(j, k, themeService, notebookExecutionStateService, l, m, n) {
            this.j = j;
            this.k = k;
            this.l = l;
            this.m = m;
            this.n = n;
            this.a = new lifecycle_1.$jc();
            this.b = new event_1.$fd();
            this.onDidChange = this.b.event;
            this.d = [];
            this.g = new lifecycle_1.$jc();
            this.outlineKind = 'notebookCells';
            this.h = new notebookOutlineEntryFactory_1.$vrb(notebookExecutionStateService);
            const selectionListener = new lifecycle_1.$lc();
            this.a.add(selectionListener);
            selectionListener.value = (0, lifecycle_1.$hc)(event_1.Event.debounce(j.onDidChangeSelection, (last, _current) => last, 200)(this.p, this), event_1.Event.debounce(j.onDidChangeViewCells, (last, _current) => last ?? _current, 200)(this.o, this));
            this.a.add(n.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('notebook.outline.showCodeCells')) {
                    this.o();
                }
            }));
            this.a.add(themeService.onDidFileIconThemeChange(() => {
                this.b.fire({});
            }));
            this.a.add(notebookExecutionStateService.onDidChangeExecution(e => {
                if (e.type === notebookExecutionStateService_1.NotebookExecutionType.cell && !!this.j.textModel && e.affectsNotebook(this.j.textModel?.uri)) {
                    this.o();
                }
            }));
            this.o();
        }
        dispose() {
            this.d.length = 0;
            this.f = undefined;
            this.g.dispose();
            this.a.dispose();
        }
        init() {
            this.o();
        }
        async setFullSymbols(cancelToken) {
            const notebookEditorWidget = this.j;
            const notebookCells = notebookEditorWidget?.getViewModel()?.viewCells.filter((cell) => cell.cellKind === notebookCommon_1.CellKind.Code);
            this.d.length = 0;
            if (notebookCells) {
                const promises = [];
                for (const cell of notebookCells) {
                    if (cell.textModel) {
                        // gather all symbols asynchronously
                        promises.push(this.h.cacheSymbols(cell.textModel, this.l, cancelToken));
                    }
                }
                await Promise.allSettled(promises);
            }
            this.o();
        }
        o() {
            this.g.clear();
            this.f = undefined;
            this.c = undefined;
            if (!this.j.hasModel()) {
                return;
            }
            this.c = this.j.textModel.uri;
            const notebookEditorWidget = this.j;
            if (notebookEditorWidget.getLength() === 0) {
                return;
            }
            let includeCodeCells = true;
            if (this.k === 1 /* OutlineTarget.OutlinePane */) {
                includeCodeCells = this.n.getValue('notebook.outline.showCodeCells');
            }
            else if (this.k === 2 /* OutlineTarget.Breadcrumbs */) {
                includeCodeCells = this.n.getValue('notebook.breadcrumbs.showCodeCells');
            }
            const notebookCells = notebookEditorWidget.getViewModel().viewCells.filter((cell) => cell.cellKind === notebookCommon_1.CellKind.Markup || includeCodeCells);
            const entries = [];
            for (const cell of notebookCells) {
                entries.push(...this.h.getOutlineEntries(cell, entries.length));
                // send an event whenever any of the cells change
                this.g.add(cell.model.onDidChangeContent(() => {
                    this.o();
                    this.b.fire({});
                }));
            }
            // build a tree from the list of entries
            if (entries.length > 0) {
                const result = [entries[0]];
                const parentStack = [entries[0]];
                for (let i = 1; i < entries.length; i++) {
                    const entry = entries[i];
                    while (true) {
                        const len = parentStack.length;
                        if (len === 0) {
                            // root node
                            result.push(entry);
                            parentStack.push(entry);
                            break;
                        }
                        else {
                            const parentCandidate = parentStack[len - 1];
                            if (parentCandidate.level < entry.level) {
                                parentCandidate.addChild(entry);
                                parentStack.push(entry);
                                break;
                            }
                            else {
                                parentStack.pop();
                            }
                        }
                    }
                }
                this.d = result;
            }
            // feature: show markers with each cell
            const markerServiceListener = new lifecycle_1.$lc();
            this.g.add(markerServiceListener);
            const updateMarkerUpdater = () => {
                if (notebookEditorWidget.isDisposed) {
                    return;
                }
                const doUpdateMarker = (clear) => {
                    for (const entry of this.d) {
                        if (clear) {
                            entry.clearMarkers();
                        }
                        else {
                            entry.updateMarkers(this.m);
                        }
                    }
                };
                if (this.n.getValue("outline.problems.enabled" /* OutlineConfigKeys.problemsEnabled */)) {
                    markerServiceListener.value = this.m.onMarkerChanged(e => {
                        if (notebookEditorWidget.isDisposed) {
                            console.error('notebook editor is disposed');
                            return;
                        }
                        if (e.some(uri => notebookEditorWidget.getCellsInRange().some(cell => (0, resources_1.$bg)(cell.uri, uri)))) {
                            doUpdateMarker(false);
                            this.b.fire({});
                        }
                    });
                    doUpdateMarker(false);
                }
                else {
                    markerServiceListener.clear();
                    doUpdateMarker(true);
                }
            };
            updateMarkerUpdater();
            this.g.add(this.n.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("outline.problems.enabled" /* OutlineConfigKeys.problemsEnabled */)) {
                    updateMarkerUpdater();
                    this.b.fire({});
                }
            }));
            this.p();
            this.b.fire({});
        }
        p() {
            let newActive;
            const notebookEditorWidget = this.j;
            if (notebookEditorWidget) { //TODO don't check for widget, only here if we do have
                if (notebookEditorWidget.hasModel() && notebookEditorWidget.getLength() > 0) {
                    const cell = notebookEditorWidget.cellAt(notebookEditorWidget.getFocus().start);
                    if (cell) {
                        for (const entry of this.d) {
                            newActive = entry.find(cell, []);
                            if (newActive) {
                                break;
                            }
                        }
                    }
                }
            }
            if (newActive !== this.f) {
                this.f = newActive;
                this.b.fire({ affectOnlyActiveElement: true });
            }
        }
        get isEmpty() {
            return this.d.length === 0;
        }
        get uri() {
            return this.c;
        }
    };
    exports.$wrb = $wrb;
    exports.$wrb = $wrb = __decorate([
        __param(2, themeService_1.$gv),
        __param(3, notebookExecutionStateService_1.$_H),
        __param(4, outlineModel_1.$R8),
        __param(5, markers_1.$3s),
        __param(6, configuration_1.$8h)
    ], $wrb);
});
//# sourceMappingURL=notebookOutlineProvider.js.map