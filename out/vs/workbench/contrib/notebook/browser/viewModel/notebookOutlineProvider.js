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
    exports.NotebookCellOutlineProvider = void 0;
    let NotebookCellOutlineProvider = class NotebookCellOutlineProvider {
        get entries() {
            return this._entries;
        }
        get activeElement() {
            return this._activeEntry;
        }
        constructor(_editor, _target, themeService, notebookExecutionStateService, _outlineModelService, _markerService, _configurationService) {
            this._editor = _editor;
            this._target = _target;
            this._outlineModelService = _outlineModelService;
            this._markerService = _markerService;
            this._configurationService = _configurationService;
            this._dispoables = new lifecycle_1.DisposableStore();
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this._entries = [];
            this._entriesDisposables = new lifecycle_1.DisposableStore();
            this.outlineKind = 'notebookCells';
            this._outlineEntryFactory = new notebookOutlineEntryFactory_1.NotebookOutlineEntryFactory(notebookExecutionStateService);
            const selectionListener = new lifecycle_1.MutableDisposable();
            this._dispoables.add(selectionListener);
            selectionListener.value = (0, lifecycle_1.combinedDisposable)(event_1.Event.debounce(_editor.onDidChangeSelection, (last, _current) => last, 200)(this._recomputeActive, this), event_1.Event.debounce(_editor.onDidChangeViewCells, (last, _current) => last ?? _current, 200)(this._recomputeState, this));
            this._dispoables.add(_configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('notebook.outline.showCodeCells')) {
                    this._recomputeState();
                }
            }));
            this._dispoables.add(themeService.onDidFileIconThemeChange(() => {
                this._onDidChange.fire({});
            }));
            this._dispoables.add(notebookExecutionStateService.onDidChangeExecution(e => {
                if (e.type === notebookExecutionStateService_1.NotebookExecutionType.cell && !!this._editor.textModel && e.affectsNotebook(this._editor.textModel?.uri)) {
                    this._recomputeState();
                }
            }));
            this._recomputeState();
        }
        dispose() {
            this._entries.length = 0;
            this._activeEntry = undefined;
            this._entriesDisposables.dispose();
            this._dispoables.dispose();
        }
        init() {
            this._recomputeState();
        }
        async setFullSymbols(cancelToken) {
            const notebookEditorWidget = this._editor;
            const notebookCells = notebookEditorWidget?.getViewModel()?.viewCells.filter((cell) => cell.cellKind === notebookCommon_1.CellKind.Code);
            this._entries.length = 0;
            if (notebookCells) {
                const promises = [];
                for (const cell of notebookCells) {
                    if (cell.textModel) {
                        // gather all symbols asynchronously
                        promises.push(this._outlineEntryFactory.cacheSymbols(cell.textModel, this._outlineModelService, cancelToken));
                    }
                }
                await Promise.allSettled(promises);
            }
            this._recomputeState();
        }
        _recomputeState() {
            this._entriesDisposables.clear();
            this._activeEntry = undefined;
            this._uri = undefined;
            if (!this._editor.hasModel()) {
                return;
            }
            this._uri = this._editor.textModel.uri;
            const notebookEditorWidget = this._editor;
            if (notebookEditorWidget.getLength() === 0) {
                return;
            }
            let includeCodeCells = true;
            if (this._target === 1 /* OutlineTarget.OutlinePane */) {
                includeCodeCells = this._configurationService.getValue('notebook.outline.showCodeCells');
            }
            else if (this._target === 2 /* OutlineTarget.Breadcrumbs */) {
                includeCodeCells = this._configurationService.getValue('notebook.breadcrumbs.showCodeCells');
            }
            const notebookCells = notebookEditorWidget.getViewModel().viewCells.filter((cell) => cell.cellKind === notebookCommon_1.CellKind.Markup || includeCodeCells);
            const entries = [];
            for (const cell of notebookCells) {
                entries.push(...this._outlineEntryFactory.getOutlineEntries(cell, entries.length));
                // send an event whenever any of the cells change
                this._entriesDisposables.add(cell.model.onDidChangeContent(() => {
                    this._recomputeState();
                    this._onDidChange.fire({});
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
                this._entries = result;
            }
            // feature: show markers with each cell
            const markerServiceListener = new lifecycle_1.MutableDisposable();
            this._entriesDisposables.add(markerServiceListener);
            const updateMarkerUpdater = () => {
                if (notebookEditorWidget.isDisposed) {
                    return;
                }
                const doUpdateMarker = (clear) => {
                    for (const entry of this._entries) {
                        if (clear) {
                            entry.clearMarkers();
                        }
                        else {
                            entry.updateMarkers(this._markerService);
                        }
                    }
                };
                if (this._configurationService.getValue("outline.problems.enabled" /* OutlineConfigKeys.problemsEnabled */)) {
                    markerServiceListener.value = this._markerService.onMarkerChanged(e => {
                        if (notebookEditorWidget.isDisposed) {
                            console.error('notebook editor is disposed');
                            return;
                        }
                        if (e.some(uri => notebookEditorWidget.getCellsInRange().some(cell => (0, resources_1.isEqual)(cell.uri, uri)))) {
                            doUpdateMarker(false);
                            this._onDidChange.fire({});
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
            this._entriesDisposables.add(this._configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("outline.problems.enabled" /* OutlineConfigKeys.problemsEnabled */)) {
                    updateMarkerUpdater();
                    this._onDidChange.fire({});
                }
            }));
            this._recomputeActive();
            this._onDidChange.fire({});
        }
        _recomputeActive() {
            let newActive;
            const notebookEditorWidget = this._editor;
            if (notebookEditorWidget) { //TODO don't check for widget, only here if we do have
                if (notebookEditorWidget.hasModel() && notebookEditorWidget.getLength() > 0) {
                    const cell = notebookEditorWidget.cellAt(notebookEditorWidget.getFocus().start);
                    if (cell) {
                        for (const entry of this._entries) {
                            newActive = entry.find(cell, []);
                            if (newActive) {
                                break;
                            }
                        }
                    }
                }
            }
            if (newActive !== this._activeEntry) {
                this._activeEntry = newActive;
                this._onDidChange.fire({ affectOnlyActiveElement: true });
            }
        }
        get isEmpty() {
            return this._entries.length === 0;
        }
        get uri() {
            return this._uri;
        }
    };
    exports.NotebookCellOutlineProvider = NotebookCellOutlineProvider;
    exports.NotebookCellOutlineProvider = NotebookCellOutlineProvider = __decorate([
        __param(2, themeService_1.IThemeService),
        __param(3, notebookExecutionStateService_1.INotebookExecutionStateService),
        __param(4, outlineModel_1.IOutlineModelService),
        __param(5, markers_1.IMarkerService),
        __param(6, configuration_1.IConfigurationService)
    ], NotebookCellOutlineProvider);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tPdXRsaW5lUHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL3ZpZXdNb2RlbC9ub3RlYm9va091dGxpbmVQcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFrQnpGLElBQU0sMkJBQTJCLEdBQWpDLE1BQU0sMkJBQTJCO1FBUXZDLElBQUksT0FBTztZQUNWLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUN0QixDQUFDO1FBT0QsSUFBSSxhQUFhO1lBQ2hCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztRQUMxQixDQUFDO1FBSUQsWUFDa0IsT0FBd0IsRUFDeEIsT0FBc0IsRUFDeEIsWUFBMkIsRUFDViw2QkFBNkQsRUFDdkUsb0JBQTJELEVBQ2pFLGNBQStDLEVBQ3hDLHFCQUE2RDtZQU5uRSxZQUFPLEdBQVAsT0FBTyxDQUFpQjtZQUN4QixZQUFPLEdBQVAsT0FBTyxDQUFlO1lBR0EseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFzQjtZQUNoRCxtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7WUFDdkIsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQTdCcEUsZ0JBQVcsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUNwQyxpQkFBWSxHQUFHLElBQUksZUFBTyxFQUFzQixDQUFDO1lBRXpELGdCQUFXLEdBQThCLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDO1lBR2xFLGFBQVEsR0FBbUIsRUFBRSxDQUFDO1lBTXJCLHdCQUFtQixHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBRXBELGdCQUFXLEdBQUcsZUFBZSxDQUFDO1lBaUJ0QyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSx5REFBMkIsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFD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