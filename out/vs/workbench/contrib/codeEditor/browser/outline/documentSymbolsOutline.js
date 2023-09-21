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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/workbench/services/outline/browser/outline", "vs/workbench/common/contributions", "vs/platform/registry/common/platform", "vs/workbench/contrib/codeEditor/browser/outline/documentSymbolsTree", "vs/editor/browser/editorBrowser", "vs/editor/contrib/documentSymbols/browser/outlineModel", "vs/base/common/cancellation", "vs/base/common/async", "vs/base/common/errors", "vs/editor/common/services/textResourceConfiguration", "vs/platform/instantiation/common/instantiation", "vs/editor/common/core/range", "vs/editor/browser/services/codeEditorService", "vs/platform/configuration/common/configuration", "vs/nls", "vs/editor/common/services/markerDecorations", "vs/platform/markers/common/markers", "vs/base/common/resources", "vs/editor/common/services/languageFeatures"], function (require, exports, event_1, lifecycle_1, outline_1, contributions_1, platform_1, documentSymbolsTree_1, editorBrowser_1, outlineModel_1, cancellation_1, async_1, errors_1, textResourceConfiguration_1, instantiation_1, range_1, codeEditorService_1, configuration_1, nls_1, markerDecorations_1, markers_1, resources_1, languageFeatures_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let DocumentSymbolBreadcrumbsSource = class DocumentSymbolBreadcrumbsSource {
        constructor(_editor, _textResourceConfigurationService) {
            this._editor = _editor;
            this._textResourceConfigurationService = _textResourceConfigurationService;
            this._breadcrumbs = [];
        }
        getBreadcrumbElements() {
            return this._breadcrumbs;
        }
        clear() {
            this._breadcrumbs = [];
        }
        update(model, position) {
            const newElements = this._computeBreadcrumbs(model, position);
            this._breadcrumbs = newElements;
        }
        _computeBreadcrumbs(model, position) {
            let item = model.getItemEnclosingPosition(position);
            if (!item) {
                return [];
            }
            const chain = [];
            while (item) {
                chain.push(item);
                const parent = item.parent;
                if (parent instanceof outlineModel_1.OutlineModel) {
                    break;
                }
                if (parent instanceof outlineModel_1.OutlineGroup && parent.parent && parent.parent.children.size === 1) {
                    break;
                }
                item = parent;
            }
            const result = [];
            for (let i = chain.length - 1; i >= 0; i--) {
                const element = chain[i];
                if (this._isFiltered(element)) {
                    break;
                }
                result.push(element);
            }
            if (result.length === 0) {
                return [];
            }
            return result;
        }
        _isFiltered(element) {
            if (!(element instanceof outlineModel_1.OutlineElement)) {
                return false;
            }
            const key = `breadcrumbs.${documentSymbolsTree_1.DocumentSymbolFilter.kindToConfigName[element.symbol.kind]}`;
            let uri;
            if (this._editor && this._editor.getModel()) {
                const model = this._editor.getModel();
                uri = model.uri;
            }
            return !this._textResourceConfigurationService.getValue(uri, key);
        }
    };
    DocumentSymbolBreadcrumbsSource = __decorate([
        __param(1, textResourceConfiguration_1.ITextResourceConfigurationService)
    ], DocumentSymbolBreadcrumbsSource);
    let DocumentSymbolsOutline = class DocumentSymbolsOutline {
        get activeElement() {
            const posistion = this._editor.getPosition();
            if (!posistion || !this._outlineModel) {
                return undefined;
            }
            else {
                return this._outlineModel.getItemEnclosingPosition(posistion);
            }
        }
        constructor(_editor, target, firstLoadBarrier, _languageFeaturesService, _codeEditorService, _outlineModelService, _configurationService, _markerDecorationsService, textResourceConfigurationService, instantiationService) {
            this._editor = _editor;
            this._languageFeaturesService = _languageFeaturesService;
            this._codeEditorService = _codeEditorService;
            this._outlineModelService = _outlineModelService;
            this._configurationService = _configurationService;
            this._markerDecorationsService = _markerDecorationsService;
            this._disposables = new lifecycle_1.DisposableStore();
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this._outlineDisposables = new lifecycle_1.DisposableStore();
            this.outlineKind = 'documentSymbols';
            this._breadcrumbsDataSource = new DocumentSymbolBreadcrumbsSource(_editor, textResourceConfigurationService);
            const delegate = new documentSymbolsTree_1.DocumentSymbolVirtualDelegate();
            const renderers = [new documentSymbolsTree_1.DocumentSymbolGroupRenderer(), instantiationService.createInstance(documentSymbolsTree_1.DocumentSymbolRenderer, true)];
            const treeDataSource = {
                getChildren: (parent) => {
                    if (parent instanceof outlineModel_1.OutlineElement || parent instanceof outlineModel_1.OutlineGroup) {
                        return parent.children.values();
                    }
                    if (parent === this && this._outlineModel) {
                        return this._outlineModel.children.values();
                    }
                    return [];
                }
            };
            const comparator = new documentSymbolsTree_1.DocumentSymbolComparator();
            const initialState = textResourceConfigurationService.getValue(_editor.getModel()?.uri, "outline.collapseItems" /* OutlineConfigKeys.collapseItems */);
            const options = {
                collapseByDefault: target === 2 /* OutlineTarget.Breadcrumbs */ || (target === 1 /* OutlineTarget.OutlinePane */ && initialState === "alwaysCollapse" /* OutlineConfigCollapseItemsValues.Collapsed */),
                expandOnlyOnTwistieClick: true,
                multipleSelectionSupport: false,
                identityProvider: new documentSymbolsTree_1.DocumentSymbolIdentityProvider(),
                keyboardNavigationLabelProvider: new documentSymbolsTree_1.DocumentSymbolNavigationLabelProvider(),
                accessibilityProvider: new documentSymbolsTree_1.DocumentSymbolAccessibilityProvider((0, nls_1.localize)('document', "Document Symbols")),
                filter: target === 1 /* OutlineTarget.OutlinePane */
                    ? instantiationService.createInstance(documentSymbolsTree_1.DocumentSymbolFilter, 'outline')
                    : target === 2 /* OutlineTarget.Breadcrumbs */
                        ? instantiationService.createInstance(documentSymbolsTree_1.DocumentSymbolFilter, 'breadcrumbs')
                        : undefined
            };
            this.config = {
                breadcrumbsDataSource: this._breadcrumbsDataSource,
                delegate,
                renderers,
                treeDataSource,
                comparator,
                options,
                quickPickDataSource: { getQuickPickElements: () => { throw new Error('not implemented'); } }
            };
            // update as language, model, providers changes
            this._disposables.add(_languageFeaturesService.documentSymbolProvider.onDidChange(_ => this._createOutline()));
            this._disposables.add(this._editor.onDidChangeModel(_ => this._createOutline()));
            this._disposables.add(this._editor.onDidChangeModelLanguage(_ => this._createOutline()));
            // update soon'ish as model content change
            const updateSoon = new async_1.TimeoutTimer();
            this._disposables.add(updateSoon);
            this._disposables.add(this._editor.onDidChangeModelContent(event => {
                const model = this._editor.getModel();
                if (model) {
                    const timeout = _outlineModelService.getDebounceValue(model);
                    updateSoon.cancelAndSet(() => this._createOutline(event), timeout);
                }
            }));
            // stop when editor dies
            this._disposables.add(this._editor.onDidDispose(() => this._outlineDisposables.clear()));
            // initial load
            this._createOutline().finally(() => firstLoadBarrier.open());
        }
        dispose() {
            this._disposables.dispose();
            this._outlineDisposables.dispose();
        }
        get isEmpty() {
            return !this._outlineModel || outlineModel_1.TreeElement.empty(this._outlineModel);
        }
        get uri() {
            return this._outlineModel?.uri;
        }
        async reveal(entry, options, sideBySide) {
            const model = outlineModel_1.OutlineModel.get(entry);
            if (!model || !(entry instanceof outlineModel_1.OutlineElement)) {
                return;
            }
            await this._codeEditorService.openCodeEditor({
                resource: model.uri,
                options: {
                    ...options,
                    selection: range_1.Range.collapseToStart(entry.symbol.selectionRange),
                    selectionRevealType: 3 /* TextEditorSelectionRevealType.NearTopIfOutsideViewport */,
                }
            }, this._editor, sideBySide);
        }
        preview(entry) {
            if (!(entry instanceof outlineModel_1.OutlineElement)) {
                return lifecycle_1.Disposable.None;
            }
            const { symbol } = entry;
            this._editor.revealRangeInCenterIfOutsideViewport(symbol.range, 0 /* ScrollType.Smooth */);
            const decorationsCollection = this._editor.createDecorationsCollection([{
                    range: symbol.range,
                    options: {
                        description: 'document-symbols-outline-range-highlight',
                        className: 'rangeHighlight',
                        isWholeLine: true
                    }
                }]);
            return (0, lifecycle_1.toDisposable)(() => decorationsCollection.clear());
        }
        captureViewState() {
            const viewState = this._editor.saveViewState();
            return (0, lifecycle_1.toDisposable)(() => {
                if (viewState) {
                    this._editor.restoreViewState(viewState);
                }
            });
        }
        async _createOutline(contentChangeEvent) {
            this._outlineDisposables.clear();
            if (!contentChangeEvent) {
                this._setOutlineModel(undefined);
            }
            if (!this._editor.hasModel()) {
                return;
            }
            const buffer = this._editor.getModel();
            if (!this._languageFeaturesService.documentSymbolProvider.has(buffer)) {
                return;
            }
            const cts = new cancellation_1.CancellationTokenSource();
            const versionIdThen = buffer.getVersionId();
            const timeoutTimer = new async_1.TimeoutTimer();
            this._outlineDisposables.add(timeoutTimer);
            this._outlineDisposables.add((0, lifecycle_1.toDisposable)(() => cts.dispose(true)));
            try {
                const model = await this._outlineModelService.getOrCreate(buffer, cts.token);
                if (cts.token.isCancellationRequested) {
                    // cancelled -> do nothing
                    return;
                }
                if (outlineModel_1.TreeElement.empty(model) || !this._editor.hasModel()) {
                    // empty -> no outline elements
                    this._setOutlineModel(model);
                    return;
                }
                // heuristic: when the symbols-to-lines ratio changes by 50% between edits
                // wait a little (and hope that the next change isn't as drastic).
                if (contentChangeEvent && this._outlineModel && buffer.getLineCount() >= 25) {
                    const newSize = outlineModel_1.TreeElement.size(model);
                    const newLength = buffer.getValueLength();
                    const newRatio = newSize / newLength;
                    const oldSize = outlineModel_1.TreeElement.size(this._outlineModel);
                    const oldLength = newLength - contentChangeEvent.changes.reduce((prev, value) => prev + value.rangeLength, 0);
                    const oldRatio = oldSize / oldLength;
                    if (newRatio <= oldRatio * 0.5 || newRatio >= oldRatio * 1.5) {
                        // wait for a better state and ignore current model when more
                        // typing has happened
                        const value = await (0, async_1.raceCancellation)((0, async_1.timeout)(2000).then(() => true), cts.token, false);
                        if (!value) {
                            return;
                        }
                    }
                }
                // feature: show markers with outline element
                this._applyMarkersToOutline(model);
                this._outlineDisposables.add(this._markerDecorationsService.onDidChangeMarker(textModel => {
                    if ((0, resources_1.isEqual)(model.uri, textModel.uri)) {
                        this._applyMarkersToOutline(model);
                        this._onDidChange.fire({});
                    }
                }));
                this._outlineDisposables.add(this._configurationService.onDidChangeConfiguration(e => {
                    if (e.affectsConfiguration("outline.problems.enabled" /* OutlineConfigKeys.problemsEnabled */)) {
                        if (this._configurationService.getValue("outline.problems.enabled" /* OutlineConfigKeys.problemsEnabled */)) {
                            this._applyMarkersToOutline(model);
                        }
                        else {
                            model.updateMarker([]);
                        }
                        this._onDidChange.fire({});
                    }
                    if (e.affectsConfiguration('outline')) {
                        // outline filtering, problems on/off
                        this._onDidChange.fire({});
                    }
                    if (e.affectsConfiguration('breadcrumbs') && this._editor.hasModel()) {
                        // breadcrumbs filtering
                        this._breadcrumbsDataSource.update(model, this._editor.getPosition());
                        this._onDidChange.fire({});
                    }
                }));
                // feature: toggle icons
                this._outlineDisposables.add(this._configurationService.onDidChangeConfiguration(e => {
                    if (e.affectsConfiguration("outline.icons" /* OutlineConfigKeys.icons */)) {
                        this._onDidChange.fire({});
                    }
                    if (e.affectsConfiguration('outline')) {
                        this._onDidChange.fire({});
                    }
                }));
                // feature: update active when cursor changes
                this._outlineDisposables.add(this._editor.onDidChangeCursorPosition(_ => {
                    timeoutTimer.cancelAndSet(() => {
                        if (!buffer.isDisposed() && versionIdThen === buffer.getVersionId() && this._editor.hasModel()) {
                            this._breadcrumbsDataSource.update(model, this._editor.getPosition());
                            this._onDidChange.fire({ affectOnlyActiveElement: true });
                        }
                    }, 150);
                }));
                // update properties, send event
                this._setOutlineModel(model);
            }
            catch (err) {
                this._setOutlineModel(undefined);
                (0, errors_1.onUnexpectedError)(err);
            }
        }
        _applyMarkersToOutline(model) {
            if (!model || !this._configurationService.getValue("outline.problems.enabled" /* OutlineConfigKeys.problemsEnabled */)) {
                return;
            }
            const markers = [];
            for (const [range, marker] of this._markerDecorationsService.getLiveMarkers(model.uri)) {
                if (marker.severity === markers_1.MarkerSeverity.Error || marker.severity === markers_1.MarkerSeverity.Warning) {
                    markers.push({ ...range, severity: marker.severity });
                }
            }
            model.updateMarker(markers);
        }
        _setOutlineModel(model) {
            const position = this._editor.getPosition();
            if (!position || !model) {
                this._outlineModel = undefined;
                this._breadcrumbsDataSource.clear();
            }
            else {
                if (!this._outlineModel?.merge(model)) {
                    this._outlineModel = model;
                }
                this._breadcrumbsDataSource.update(model, position);
            }
            this._onDidChange.fire({});
        }
    };
    DocumentSymbolsOutline = __decorate([
        __param(3, languageFeatures_1.ILanguageFeaturesService),
        __param(4, codeEditorService_1.ICodeEditorService),
        __param(5, outlineModel_1.IOutlineModelService),
        __param(6, configuration_1.IConfigurationService),
        __param(7, markerDecorations_1.IMarkerDecorationsService),
        __param(8, textResourceConfiguration_1.ITextResourceConfigurationService),
        __param(9, instantiation_1.IInstantiationService)
    ], DocumentSymbolsOutline);
    let DocumentSymbolsOutlineCreator = class DocumentSymbolsOutlineCreator {
        constructor(outlineService) {
            const reg = outlineService.registerOutlineCreator(this);
            this.dispose = () => reg.dispose();
        }
        matches(candidate) {
            const ctrl = candidate.getControl();
            return (0, editorBrowser_1.isCodeEditor)(ctrl) || (0, editorBrowser_1.isDiffEditor)(ctrl);
        }
        async createOutline(pane, target, _token) {
            const control = pane.getControl();
            let editor;
            if ((0, editorBrowser_1.isCodeEditor)(control)) {
                editor = control;
            }
            else if ((0, editorBrowser_1.isDiffEditor)(control)) {
                editor = control.getModifiedEditor();
            }
            if (!editor) {
                return undefined;
            }
            const firstLoadBarrier = new async_1.Barrier();
            const result = editor.invokeWithinContext(accessor => accessor.get(instantiation_1.IInstantiationService).createInstance(DocumentSymbolsOutline, editor, target, firstLoadBarrier));
            await firstLoadBarrier.wait();
            return result;
        }
    };
    DocumentSymbolsOutlineCreator = __decorate([
        __param(0, outline_1.IOutlineService)
    ], DocumentSymbolsOutlineCreator);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(DocumentSymbolsOutlineCreator, 4 /* LifecyclePhase.Eventually */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9jdW1lbnRTeW1ib2xzT3V0bGluZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NvZGVFZGl0b3IvYnJvd3Nlci9vdXRsaW5lL2RvY3VtZW50U3ltYm9sc091dGxpbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7SUFtQ2hHLElBQU0sK0JBQStCLEdBQXJDLE1BQU0sK0JBQStCO1FBSXBDLFlBQ2tCLE9BQW9CLEVBQ0YsaUNBQXFGO1lBRHZHLFlBQU8sR0FBUCxPQUFPLENBQWE7WUFDZSxzQ0FBaUMsR0FBakMsaUNBQWlDLENBQW1DO1lBSmpILGlCQUFZLEdBQXNDLEVBQUUsQ0FBQztRQUt6RCxDQUFDO1FBRUwscUJBQXFCO1lBQ3BCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztRQUMxQixDQUFDO1FBRUQsS0FBSztZQUNKLElBQUksQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDO1FBQ3hCLENBQUM7UUFFRCxNQUFNLENBQUMsS0FBbUIsRUFBRSxRQUFtQjtZQUM5QyxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQzlELElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO1FBQ2pDLENBQUM7UUFFTyxtQkFBbUIsQ0FBQyxLQUFtQixFQUFFLFFBQW1CO1lBQ25FLElBQUksSUFBSSxHQUE4QyxLQUFLLENBQUMsd0JBQXdCLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDL0YsSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDVixPQUFPLEVBQUUsQ0FBQzthQUNWO1lBQ0QsTUFBTSxLQUFLLEdBQXlDLEVBQUUsQ0FBQztZQUN2RCxPQUFPLElBQUksRUFBRTtnQkFDWixLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNqQixNQUFN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