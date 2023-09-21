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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/workbench/services/outline/browser/outline", "vs/workbench/common/contributions", "vs/platform/registry/common/platform", "vs/workbench/contrib/codeEditor/browser/outline/documentSymbolsTree", "vs/editor/browser/editorBrowser", "vs/editor/contrib/documentSymbols/browser/outlineModel", "vs/base/common/cancellation", "vs/base/common/async", "vs/base/common/errors", "vs/editor/common/services/textResourceConfiguration", "vs/platform/instantiation/common/instantiation", "vs/editor/common/core/range", "vs/editor/browser/services/codeEditorService", "vs/platform/configuration/common/configuration", "vs/nls!vs/workbench/contrib/codeEditor/browser/outline/documentSymbolsOutline", "vs/editor/common/services/markerDecorations", "vs/platform/markers/common/markers", "vs/base/common/resources", "vs/editor/common/services/languageFeatures"], function (require, exports, event_1, lifecycle_1, outline_1, contributions_1, platform_1, documentSymbolsTree_1, editorBrowser_1, outlineModel_1, cancellation_1, async_1, errors_1, textResourceConfiguration_1, instantiation_1, range_1, codeEditorService_1, configuration_1, nls_1, markerDecorations_1, markers_1, resources_1, languageFeatures_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let DocumentSymbolBreadcrumbsSource = class DocumentSymbolBreadcrumbsSource {
        constructor(b, c) {
            this.b = b;
            this.c = c;
            this.a = [];
        }
        getBreadcrumbElements() {
            return this.a;
        }
        clear() {
            this.a = [];
        }
        update(model, position) {
            const newElements = this.d(model, position);
            this.a = newElements;
        }
        d(model, position) {
            let item = model.getItemEnclosingPosition(position);
            if (!item) {
                return [];
            }
            const chain = [];
            while (item) {
                chain.push(item);
                const parent = item.parent;
                if (parent instanceof outlineModel_1.$Q8) {
                    break;
                }
                if (parent instanceof outlineModel_1.$P8 && parent.parent && parent.parent.children.size === 1) {
                    break;
                }
                item = parent;
            }
            const result = [];
            for (let i = chain.length - 1; i >= 0; i--) {
                const element = chain[i];
                if (this.f(element)) {
                    break;
                }
                result.push(element);
            }
            if (result.length === 0) {
                return [];
            }
            return result;
        }
        f(element) {
            if (!(element instanceof outlineModel_1.$O8)) {
                return false;
            }
            const key = `breadcrumbs.${documentSymbolsTree_1.$yZb.kindToConfigName[element.symbol.kind]}`;
            let uri;
            if (this.b && this.b.getModel()) {
                const model = this.b.getModel();
                uri = model.uri;
            }
            return !this.c.getValue(uri, key);
        }
    };
    DocumentSymbolBreadcrumbsSource = __decorate([
        __param(1, textResourceConfiguration_1.$FA)
    ], DocumentSymbolBreadcrumbsSource);
    let DocumentSymbolsOutline = class DocumentSymbolsOutline {
        get activeElement() {
            const posistion = this.g.getPosition();
            if (!posistion || !this.c) {
                return undefined;
            }
            else {
                return this.c.getItemEnclosingPosition(posistion);
            }
        }
        constructor(g, target, firstLoadBarrier, h, j, k, l, m, textResourceConfigurationService, instantiationService) {
            this.g = g;
            this.h = h;
            this.j = j;
            this.k = k;
            this.l = l;
            this.m = m;
            this.a = new lifecycle_1.$jc();
            this.b = new event_1.$fd();
            this.onDidChange = this.b.event;
            this.d = new lifecycle_1.$jc();
            this.outlineKind = 'documentSymbols';
            this.f = new DocumentSymbolBreadcrumbsSource(g, textResourceConfigurationService);
            const delegate = new documentSymbolsTree_1.$vZb();
            const renderers = [new documentSymbolsTree_1.$wZb(), instantiationService.createInstance(documentSymbolsTree_1.$xZb, true)];
            const treeDataSource = {
                getChildren: (parent) => {
                    if (parent instanceof outlineModel_1.$O8 || parent instanceof outlineModel_1.$P8) {
                        return parent.children.values();
                    }
                    if (parent === this && this.c) {
                        return this.c.children.values();
                    }
                    return [];
                }
            };
            const comparator = new documentSymbolsTree_1.$zZb();
            const initialState = textResourceConfigurationService.getValue(g.getModel()?.uri, "outline.collapseItems" /* OutlineConfigKeys.collapseItems */);
            const options = {
                collapseByDefault: target === 2 /* OutlineTarget.Breadcrumbs */ || (target === 1 /* OutlineTarget.OutlinePane */ && initialState === "alwaysCollapse" /* OutlineConfigCollapseItemsValues.Collapsed */),
                expandOnlyOnTwistieClick: true,
                multipleSelectionSupport: false,
                identityProvider: new documentSymbolsTree_1.$uZb(),
                keyboardNavigationLabelProvider: new documentSymbolsTree_1.$sZb(),
                accessibilityProvider: new documentSymbolsTree_1.$tZb((0, nls_1.localize)(0, null)),
                filter: target === 1 /* OutlineTarget.OutlinePane */
                    ? instantiationService.createInstance(documentSymbolsTree_1.$yZb, 'outline')
                    : target === 2 /* OutlineTarget.Breadcrumbs */
                        ? instantiationService.createInstance(documentSymbolsTree_1.$yZb, 'breadcrumbs')
                        : undefined
            };
            this.config = {
                breadcrumbsDataSource: this.f,
                delegate,
                renderers,
                treeDataSource,
                comparator,
                options,
                quickPickDataSource: { getQuickPickElements: () => { throw new Error('not implemented'); } }
            };
            // update as language, model, providers changes
            this.a.add(h.documentSymbolProvider.onDidChange(_ => this.n()));
            this.a.add(this.g.onDidChangeModel(_ => this.n()));
            this.a.add(this.g.onDidChangeModelLanguage(_ => this.n()));
            // update soon'ish as model content change
            const updateSoon = new async_1.$Qg();
            this.a.add(updateSoon);
            this.a.add(this.g.onDidChangeModelContent(event => {
                const model = this.g.getModel();
                if (model) {
                    const timeout = k.getDebounceValue(model);
                    updateSoon.cancelAndSet(() => this.n(event), timeout);
                }
            }));
            // stop when editor dies
            this.a.add(this.g.onDidDispose(() => this.d.clear()));
            // initial load
            this.n().finally(() => firstLoadBarrier.open());
        }
        dispose() {
            this.a.dispose();
            this.d.dispose();
        }
        get isEmpty() {
            return !this.c || outlineModel_1.$N8.empty(this.c);
        }
        get uri() {
            return this.c?.uri;
        }
        async reveal(entry, options, sideBySide) {
            const model = outlineModel_1.$Q8.get(entry);
            if (!model || !(entry instanceof outlineModel_1.$O8)) {
                return;
            }
            await this.j.openCodeEditor({
                resource: model.uri,
                options: {
                    ...options,
                    selection: range_1.$ks.collapseToStart(entry.symbol.selectionRange),
                    selectionRevealType: 3 /* TextEditorSelectionRevealType.NearTopIfOutsideViewport */,
                }
            }, this.g, sideBySide);
        }
        preview(entry) {
            if (!(entry instanceof outlineModel_1.$O8)) {
                return lifecycle_1.$kc.None;
            }
            const { symbol } = entry;
            this.g.revealRangeInCenterIfOutsideViewport(symbol.range, 0 /* ScrollType.Smooth */);
            const decorationsCollection = this.g.createDecorationsCollection([{
                    range: symbol.range,
                    options: {
                        description: 'document-symbols-outline-range-highlight',
                        className: 'rangeHighlight',
                        isWholeLine: true
                    }
                }]);
            return (0, lifecycle_1.$ic)(() => decorationsCollection.clear());
        }
        captureViewState() {
            const viewState = this.g.saveViewState();
            return (0, lifecycle_1.$ic)(() => {
                if (viewState) {
                    this.g.restoreViewState(viewState);
                }
            });
        }
        async n(contentChangeEvent) {
            this.d.clear();
            if (!contentChangeEvent) {
                this.p(undefined);
            }
            if (!this.g.hasModel()) {
                return;
            }
            const buffer = this.g.getModel();
            if (!this.h.documentSymbolProvider.has(buffer)) {
                return;
            }
            const cts = new cancellation_1.$pd();
            const versionIdThen = buffer.getVersionId();
            const timeoutTimer = new async_1.$Qg();
            this.d.add(timeoutTimer);
            this.d.add((0, lifecycle_1.$ic)(() => cts.dispose(true)));
            try {
                const model = await this.k.getOrCreate(buffer, cts.token);
                if (cts.token.isCancellationRequested) {
                    // cancelled -> do nothing
                    return;
                }
                if (outlineModel_1.$N8.empty(model) || !this.g.hasModel()) {
                    // empty -> no outline elements
                    this.p(model);
                    return;
                }
                // heuristic: when the symbols-to-lines ratio changes by 50% between edits
                // wait a little (and hope that the next change isn't as drastic).
                if (contentChangeEvent && this.c && buffer.getLineCount() >= 25) {
                    const newSize = outlineModel_1.$N8.size(model);
                    const newLength = buffer.getValueLength();
                    const newRatio = newSize / newLength;
                    const oldSize = outlineModel_1.$N8.size(this.c);
                    const oldLength = newLength - contentChangeEvent.changes.reduce((prev, value) => prev + value.rangeLength, 0);
                    const oldRatio = oldSize / oldLength;
                    if (newRatio <= oldRatio * 0.5 || newRatio >= oldRatio * 1.5) {
                        // wait for a better state and ignore current model when more
                        // typing has happened
                        const value = await (0, async_1.$vg)((0, async_1.$Hg)(2000).then(() => true), cts.token, false);
                        if (!value) {
                            return;
                        }
                    }
                }
                // feature: show markers with outline element
                this.o(model);
                this.d.add(this.m.onDidChangeMarker(textModel => {
                    if ((0, resources_1.$bg)(model.uri, textModel.uri)) {
                        this.o(model);
                        this.b.fire({});
                    }
                }));
                this.d.add(this.l.onDidChangeConfiguration(e => {
                    if (e.affectsConfiguration("outline.problems.enabled" /* OutlineConfigKeys.problemsEnabled */)) {
                        if (this.l.getValue("outline.problems.enabled" /* OutlineConfigKeys.problemsEnabled */)) {
                            this.o(model);
                        }
                        else {
                            model.updateMarker([]);
                        }
                        this.b.fire({});
                    }
                    if (e.affectsConfiguration('outline')) {
                        // outline filtering, problems on/off
                        this.b.fire({});
                    }
                    if (e.affectsConfiguration('breadcrumbs') && this.g.hasModel()) {
                        // breadcrumbs filtering
                        this.f.update(model, this.g.getPosition());
                        this.b.fire({});
                    }
                }));
                // feature: toggle icons
                this.d.add(this.l.onDidChangeConfiguration(e => {
                    if (e.affectsConfiguration("outline.icons" /* OutlineConfigKeys.icons */)) {
                        this.b.fire({});
                    }
                    if (e.affectsConfiguration('outline')) {
                        this.b.fire({});
                    }
                }));
                // feature: update active when cursor changes
                this.d.add(this.g.onDidChangeCursorPosition(_ => {
                    timeoutTimer.cancelAndSet(() => {
                        if (!buffer.isDisposed() && versionIdThen === buffer.getVersionId() && this.g.hasModel()) {
                            this.f.update(model, this.g.getPosition());
                            this.b.fire({ affectOnlyActiveElement: true });
                        }
                    }, 150);
                }));
                // update properties, send event
                this.p(model);
            }
            catch (err) {
                this.p(undefined);
                (0, errors_1.$Y)(err);
            }
        }
        o(model) {
            if (!model || !this.l.getValue("outline.problems.enabled" /* OutlineConfigKeys.problemsEnabled */)) {
                return;
            }
            const markers = [];
            for (const [range, marker] of this.m.getLiveMarkers(model.uri)) {
                if (marker.severity === markers_1.MarkerSeverity.Error || marker.severity === markers_1.MarkerSeverity.Warning) {
                    markers.push({ ...range, severity: marker.severity });
                }
            }
            model.updateMarker(markers);
        }
        p(model) {
            const position = this.g.getPosition();
            if (!position || !model) {
                this.c = undefined;
                this.f.clear();
            }
            else {
                if (!this.c?.merge(model)) {
                    this.c = model;
                }
                this.f.update(model, position);
            }
            this.b.fire({});
        }
    };
    DocumentSymbolsOutline = __decorate([
        __param(3, languageFeatures_1.$hF),
        __param(4, codeEditorService_1.$nV),
        __param(5, outlineModel_1.$R8),
        __param(6, configuration_1.$8h),
        __param(7, markerDecorations_1.$hW),
        __param(8, textResourceConfiguration_1.$FA),
        __param(9, instantiation_1.$Ah)
    ], DocumentSymbolsOutline);
    let DocumentSymbolsOutlineCreator = class DocumentSymbolsOutlineCreator {
        constructor(outlineService) {
            const reg = outlineService.registerOutlineCreator(this);
            this.dispose = () => reg.dispose();
        }
        matches(candidate) {
            const ctrl = candidate.getControl();
            return (0, editorBrowser_1.$iV)(ctrl) || (0, editorBrowser_1.$jV)(ctrl);
        }
        async createOutline(pane, target, _token) {
            const control = pane.getControl();
            let editor;
            if ((0, editorBrowser_1.$iV)(control)) {
                editor = control;
            }
            else if ((0, editorBrowser_1.$jV)(control)) {
                editor = control.getModifiedEditor();
            }
            if (!editor) {
                return undefined;
            }
            const firstLoadBarrier = new async_1.$Fg();
            const result = editor.invokeWithinContext(accessor => accessor.get(instantiation_1.$Ah).createInstance(DocumentSymbolsOutline, editor, target, firstLoadBarrier));
            await firstLoadBarrier.wait();
            return result;
        }
    };
    DocumentSymbolsOutlineCreator = __decorate([
        __param(0, outline_1.$trb)
    ], DocumentSymbolsOutlineCreator);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(DocumentSymbolsOutlineCreator, 4 /* LifecyclePhase.Eventually */);
});
//# sourceMappingURL=documentSymbolsOutline.js.map