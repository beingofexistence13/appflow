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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/splitview/splitview", "vs/base/common/color", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/resources", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/editor/common/core/range", "vs/editor/common/model/textModel", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/languages/modesRegistry", "vs/editor/common/languages/language", "vs/editor/common/services/resolverService", "vs/editor/contrib/gotoSymbol/browser/peek/referencesTree", "vs/editor/contrib/peekView/browser/peekView", "vs/nls", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/label/common/label", "vs/platform/list/browser/listService", "vs/platform/theme/common/themeService", "vs/platform/undoRedo/common/undoRedo", "../referencesModel", "vs/css!./referencesWidget"], function (require, exports, dom, splitview_1, color_1, event_1, lifecycle_1, network_1, resources_1, embeddedCodeEditorWidget_1, range_1, textModel_1, languageConfigurationRegistry_1, modesRegistry_1, language_1, resolverService_1, referencesTree_1, peekView, nls, instantiation_1, keybinding_1, label_1, listService_1, themeService_1, undoRedo_1, referencesModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReferenceWidget = exports.LayoutData = void 0;
    class DecorationsManager {
        static { this.DecorationOptions = textModel_1.ModelDecorationOptions.register({
            description: 'reference-decoration',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            className: 'reference-decoration'
        }); }
        constructor(_editor, _model) {
            this._editor = _editor;
            this._model = _model;
            this._decorations = new Map();
            this._decorationIgnoreSet = new Set();
            this._callOnDispose = new lifecycle_1.DisposableStore();
            this._callOnModelChange = new lifecycle_1.DisposableStore();
            this._callOnDispose.add(this._editor.onDidChangeModel(() => this._onModelChanged()));
            this._onModelChanged();
        }
        dispose() {
            this._callOnModelChange.dispose();
            this._callOnDispose.dispose();
            this.removeDecorations();
        }
        _onModelChanged() {
            this._callOnModelChange.clear();
            const model = this._editor.getModel();
            if (!model) {
                return;
            }
            for (const ref of this._model.references) {
                if (ref.uri.toString() === model.uri.toString()) {
                    this._addDecorations(ref.parent);
                    return;
                }
            }
        }
        _addDecorations(reference) {
            if (!this._editor.hasModel()) {
                return;
            }
            this._callOnModelChange.add(this._editor.getModel().onDidChangeDecorations(() => this._onDecorationChanged()));
            const newDecorations = [];
            const newDecorationsActualIndex = [];
            for (let i = 0, len = reference.children.length; i < len; i++) {
                const oneReference = reference.children[i];
                if (this._decorationIgnoreSet.has(oneReference.id)) {
                    continue;
                }
                if (oneReference.uri.toString() !== this._editor.getModel().uri.toString()) {
                    continue;
                }
                newDecorations.push({
                    range: oneReference.range,
                    options: DecorationsManager.DecorationOptions
                });
                newDecorationsActualIndex.push(i);
            }
            this._editor.changeDecorations((changeAccessor) => {
                const decorations = changeAccessor.deltaDecorations([], newDecorations);
                for (let i = 0; i < decorations.length; i++) {
                    this._decorations.set(decorations[i], reference.children[newDecorationsActualIndex[i]]);
                }
            });
        }
        _onDecorationChanged() {
            const toRemove = [];
            const model = this._editor.getModel();
            if (!model) {
                return;
            }
            for (const [decorationId, reference] of this._decorations) {
                const newRange = model.getDecorationRange(decorationId);
                if (!newRange) {
                    continue;
                }
                let ignore = false;
                if (range_1.Range.equalsRange(newRange, reference.range)) {
                    continue;
                }
                if (range_1.Range.spansMultipleLines(newRange)) {
                    ignore = true;
                }
                else {
                    const lineLength = reference.range.endColumn - reference.range.startColumn;
                    const newLineLength = newRange.endColumn - newRange.startColumn;
                    if (lineLength !== newLineLength) {
                        ignore = true;
                    }
                }
                if (ignore) {
                    this._decorationIgnoreSet.add(reference.id);
                    toRemove.push(decorationId);
                }
                else {
                    reference.range = newRange;
                }
            }
            for (let i = 0, len = toRemove.length; i < len; i++) {
                this._decorations.delete(toRemove[i]);
            }
            this._editor.removeDecorations(toRemove);
        }
        removeDecorations() {
            this._editor.removeDecorations([...this._decorations.keys()]);
            this._decorations.clear();
        }
    }
    class LayoutData {
        constructor() {
            this.ratio = 0.7;
            this.heightInLines = 18;
        }
        static fromJSON(raw) {
            let ratio;
            let heightInLines;
            try {
                const data = JSON.parse(raw);
                ratio = data.ratio;
                heightInLines = data.heightInLines;
            }
            catch {
                //
            }
            return {
                ratio: ratio || 0.7,
                heightInLines: heightInLines || 18
            };
        }
    }
    exports.LayoutData = LayoutData;
    class ReferencesTree extends listService_1.WorkbenchAsyncDataTree {
    }
    /**
     * ZoneWidget that is shown inside the editor
     */
    let ReferenceWidget = class ReferenceWidget extends peekView.PeekViewWidget {
        constructor(editor, _defaultTreeKeyboardSupport, layoutData, themeService, _textModelResolverService, _instantiationService, _peekViewService, _uriLabel, _undoRedoService, _keybindingService, _languageService, _languageConfigurationService) {
            super(editor, { showFrame: false, showArrow: true, isResizeable: true, isAccessible: true, supportOnTitleClick: true }, _instantiationService);
            this._defaultTreeKeyboardSupport = _defaultTreeKeyboardSupport;
            this.layoutData = layoutData;
            this._textModelResolverService = _textModelResolverService;
            this._instantiationService = _instantiationService;
            this._peekViewService = _peekViewService;
            this._uriLabel = _uriLabel;
            this._undoRedoService = _undoRedoService;
            this._keybindingService = _keybindingService;
            this._languageService = _languageService;
            this._languageConfigurationService = _languageConfigurationService;
            this._disposeOnNewModel = new lifecycle_1.DisposableStore();
            this._callOnDispose = new lifecycle_1.DisposableStore();
            this._onDidSelectReference = new event_1.Emitter();
            this.onDidSelectReference = this._onDidSelectReference.event;
            this._dim = new dom.Dimension(0, 0);
            this._applyTheme(themeService.getColorTheme());
            this._callOnDispose.add(themeService.onDidColorThemeChange(this._applyTheme.bind(this)));
            this._peekViewService.addExclusiveWidget(editor, this);
            this.create();
        }
        dispose() {
            this.setModel(undefined);
            this._callOnDispose.dispose();
            this._disposeOnNewModel.dispose();
            (0, lifecycle_1.dispose)(this._preview);
            (0, lifecycle_1.dispose)(this._previewNotAvailableMessage);
            (0, lifecycle_1.dispose)(this._tree);
            (0, lifecycle_1.dispose)(this._previewModelReference);
            this._splitView.dispose();
            super.dispose();
        }
        _applyTheme(theme) {
            const borderColor = theme.getColor(peekView.peekViewBorder) || color_1.Color.transparent;
            this.style({
                arrowColor: borderColor,
                frameColor: borderColor,
                headerBackgroundColor: theme.getColor(peekView.peekViewTitleBackground) || color_1.Color.transparent,
                primaryHeadingColor: theme.getColor(peekView.peekViewTitleForeground),
                secondaryHeadingColor: theme.getColor(peekView.peekViewTitleInfoForeground)
            });
        }
        show(where) {
            super.show(where, this.layoutData.heightInLines || 18);
        }
        focusOnReferenceTree() {
            this._tree.domFocus();
        }
        focusOnPreviewEditor() {
            this._preview.focus();
        }
        isPreviewEditorFocused() {
            return this._preview.hasTextFocus();
        }
        _onTitleClick(e) {
            if (this._preview && this._preview.getModel()) {
                this._onDidSelectReference.fire({
                    element: this._getFocusedReference(),
                    kind: e.ctrlKey || e.metaKey || e.altKey ? 'side' : 'open',
                    source: 'title'
                });
            }
        }
        _fillBody(containerElement) {
            this.setCssClass('reference-zone-widget');
            // message pane
            this._messageContainer = dom.append(containerElement, dom.$('div.messages'));
            dom.hide(this._messageContainer);
            this._splitView = new splitview_1.SplitView(containerElement, { orientation: 1 /* Orientation.HORIZONTAL */ });
            // editor
            this._previewContainer = dom.append(containerElement, dom.$('div.preview.inline'));
            const options = {
                scrollBeyondLastLine: false,
                scrollbar: {
                    verticalScrollbarSize: 14,
                    horizontal: 'auto',
                    useShadows: true,
                    verticalHasArrows: false,
                    horizontalHasArrows: false,
                    alwaysConsumeMouseWheel: true
                },
                overviewRulerLanes: 2,
                fixedOverflowWidgets: true,
                minimap: {
                    enabled: false
                }
            };
            this._preview = this._instantiationService.createInstance(embeddedCodeEditorWidget_1.EmbeddedCodeEditorWidget, this._previewContainer, options, {}, this.editor);
            dom.hide(this._previewContainer);
            this._previewNotAvailableMessage = new textModel_1.TextModel(nls.localize('missingPreviewMessage', "no preview available"), modesRegistry_1.PLAINTEXT_LANGUAGE_ID, textModel_1.TextModel.DEFAULT_CREATION_OPTIONS, null, this._undoRedoService, this._languageService, this._languageConfigurationService);
            // tree
            this._treeContainer = dom.append(containerElement, dom.$('div.ref-tree.inline'));
            const treeOptions = {
                keyboardSupport: this._defaultTreeKeyboardSupport,
                accessibilityProvider: new referencesTree_1.AccessibilityProvider(),
                keyboardNavigationLabelProvider: this._instantiationService.createInstance(referencesTree_1.StringRepresentationProvider),
                identityProvider: new referencesTree_1.IdentityProvider(),
                openOnSingleClick: true,
                selectionNavigation: true,
                overrideStyles: {
                    listBackground: peekView.peekViewResultsBackground
                }
            };
            if (this._defaultTreeKeyboardSupport) {
                // the tree will consume `Escape` and prevent the widget from closing
                this._callOnDispose.add(dom.addStandardDisposableListener(this._treeContainer, 'keydown', (e) => {
                    if (e.equals(9 /* KeyCode.Escape */)) {
                        this._keybindingService.dispatchEvent(e, e.target);
                        e.stopPropagation();
                    }
                }, true));
            }
            this._tree = this._instantiationService.createInstance(ReferencesTree, 'ReferencesWidget', this._treeContainer, new referencesTree_1.Delegate(), [
                this._instantiationService.createInstance(referencesTree_1.FileReferencesRenderer),
                this._instantiationService.createInstance(referencesTree_1.OneReferenceRenderer),
            ], this._instantiationService.createInstance(referencesTree_1.DataSource), treeOptions);
            // split stuff
            this._splitView.addView({
                onDidChange: event_1.Event.None,
                element: this._previewContainer,
                minimumSize: 200,
                maximumSize: Number.MAX_VALUE,
                layout: (width) => {
                    this._preview.layout({ height: this._dim.height, width });
                }
            }, splitview_1.Sizing.Distribute);
            this._splitView.addView({
                onDidChange: event_1.Event.None,
                element: this._treeContainer,
                minimumSize: 100,
                maximumSize: Number.MAX_VALUE,
                layout: (width) => {
                    this._treeContainer.style.height = `${this._dim.height}px`;
                    this._treeContainer.style.width = `${width}px`;
                    this._tree.layout(this._dim.height, width);
                }
            }, splitview_1.Sizing.Distribute);
            this._disposables.add(this._splitView.onDidSashChange(() => {
                if (this._dim.width) {
                    this.layoutData.ratio = this._splitView.getViewSize(0) / this._dim.width;
                }
            }, undefined));
            // listen on selection and focus
            const onEvent = (element, kind) => {
                if (element instanceof referencesModel_1.OneReference) {
                    if (kind === 'show') {
                        this._revealReference(element, false);
                    }
                    this._onDidSelectReference.fire({ element, kind, source: 'tree' });
                }
            };
            this._tree.onDidOpen(e => {
                if (e.sideBySide) {
                    onEvent(e.element, 'side');
                }
                else if (e.editorOptions.pinned) {
                    onEvent(e.element, 'goto');
                }
                else {
                    onEvent(e.element, 'show');
                }
            });
            dom.hide(this._treeContainer);
        }
        _onWidth(width) {
            if (this._dim) {
                this._doLayoutBody(this._dim.height, width);
            }
        }
        _doLayoutBody(heightInPixel, widthInPixel) {
            super._doLayoutBody(heightInPixel, widthInPixel);
            this._dim = new dom.Dimension(widthInPixel, heightInPixel);
            this.layoutData.heightInLines = this._viewZone ? this._viewZone.heightInLines : this.layoutData.heightInLines;
            this._splitView.layout(widthInPixel);
            this._splitView.resizeView(0, widthInPixel * this.layoutData.ratio);
        }
        setSelection(selection) {
            return this._revealReference(selection, true).then(() => {
                if (!this._model) {
                    // disposed
                    return;
                }
                // show in tree
                this._tree.setSelection([selection]);
                this._tree.setFocus([selection]);
            });
        }
        setModel(newModel) {
            // clean up
            this._disposeOnNewModel.clear();
            this._model = newModel;
            if (this._model) {
                return this._onNewModel();
            }
            return Promise.resolve();
        }
        _onNewModel() {
            if (!this._model) {
                return Promise.resolve(undefined);
            }
            if (this._model.isEmpty) {
                this.setTitle('');
                this._messageContainer.innerText = nls.localize('noResults', "No results");
                dom.show(this._messageContainer);
                return Promise.resolve(undefined);
            }
            dom.hide(this._messageContainer);
            this._decorationsManager = new DecorationsManager(this._preview, this._model);
            this._disposeOnNewModel.add(this._decorationsManager);
            // listen on model changes
            this._disposeOnNewModel.add(this._model.onDidChangeReferenceRange(reference => this._tree.rerender(reference)));
            // listen on editor
            this._disposeOnNewModel.add(this._preview.onMouseDown(e => {
                const { event, target } = e;
                if (event.detail !== 2) {
                    return;
                }
                const element = this._getFocusedReference();
                if (!element) {
                    return;
                }
                this._onDidSelectReference.fire({
                    element: { uri: element.uri, range: target.range },
                    kind: (event.ctrlKey || event.metaKey || event.altKey) ? 'side' : 'open',
                    source: 'editor'
                });
            }));
            // make sure things are rendered
            this.container.classList.add('results-loaded');
            dom.show(this._treeContainer);
            dom.show(this._previewContainer);
            this._splitView.layout(this._dim.width);
            this.focusOnReferenceTree();
            // pick input and a reference to begin with
            return this._tree.setInput(this._model.groups.length === 1 ? this._model.groups[0] : this._model);
        }
        _getFocusedReference() {
            const [element] = this._tree.getFocus();
            if (element instanceof referencesModel_1.OneReference) {
                return element;
            }
            else if (element instanceof referencesModel_1.FileReferences) {
                if (element.children.length > 0) {
                    return element.children[0];
                }
            }
            return undefined;
        }
        async revealReference(reference) {
            await this._revealReference(reference, false);
            this._onDidSelectReference.fire({ element: reference, kind: 'goto', source: 'tree' });
        }
        async _revealReference(reference, revealParent) {
            // check if there is anything to do...
            if (this._revealedReference === reference) {
                return;
            }
            this._revealedReference = reference;
            // Update widget header
            if (reference.uri.scheme !== network_1.Schemas.inMemory) {
                this.setTitle((0, resources_1.basenameOrAuthority)(reference.uri), this._uriLabel.getUriLabel((0, resources_1.dirname)(reference.uri)));
            }
            else {
                this.setTitle(nls.localize('peekView.alternateTitle', "References"));
            }
            const promise = this._textModelResolverService.createModelReference(reference.uri);
            if (this._tree.getInput() === reference.parent) {
                this._tree.reveal(reference);
            }
            else {
                if (revealParent) {
                    this._tree.reveal(reference.parent);
                }
                await this._tree.expand(reference.parent);
                this._tree.reveal(reference);
            }
            const ref = await promise;
            if (!this._model) {
                // disposed
                ref.dispose();
                return;
            }
            (0, lifecycle_1.dispose)(this._previewModelReference);
            // show in editor
            const model = ref.object;
            if (model) {
                const scrollType = this._preview.getModel() === model.textEditorModel ? 0 /* ScrollType.Smooth */ : 1 /* ScrollType.Immediate */;
                const sel = range_1.Range.lift(reference.range).collapseToStart();
                this._previewModelReference = ref;
                this._preview.setModel(model.textEditorModel);
                this._preview.setSelection(sel);
                this._preview.revealRangeInCenter(sel, scrollType);
            }
            else {
                this._preview.setModel(this._previewNotAvailableMessage);
                ref.dispose();
            }
        }
    };
    exports.ReferenceWidget = ReferenceWidget;
    exports.ReferenceWidget = ReferenceWidget = __decorate([
        __param(3, themeService_1.IThemeService),
        __param(4, resolverService_1.ITextModelService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, peekView.IPeekViewService),
        __param(7, label_1.ILabelService),
        __param(8, undoRedo_1.IUndoRedoService),
        __param(9, keybinding_1.IKeybindingService),
        __param(10, language_1.ILanguageService),
        __param(11, languageConfigurationRegistry_1.ILanguageConfigurationService)
    ], ReferenceWidget);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmZXJlbmNlc1dpZGdldC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2dvdG9TeW1ib2wvYnJvd3Nlci9wZWVrL3JlZmVyZW5jZXNXaWRnZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBcUNoRyxNQUFNLGtCQUFrQjtpQkFFQyxzQkFBaUIsR0FBRyxrQ0FBc0IsQ0FBQyxRQUFRLENBQUM7WUFDM0UsV0FBVyxFQUFFLHNCQUFzQjtZQUNuQyxVQUFVLDREQUFvRDtZQUM5RCxTQUFTLEVBQUUsc0JBQXNCO1NBQ2pDLENBQUMsQUFKdUMsQ0FJdEM7UUFPSCxZQUFvQixPQUFvQixFQUFVLE1BQXVCO1lBQXJELFlBQU8sR0FBUCxPQUFPLENBQWE7WUFBVSxXQUFNLEdBQU4sTUFBTSxDQUFpQjtZQUxqRSxpQkFBWSxHQUFHLElBQUksR0FBRyxFQUF3QixDQUFDO1lBQy9DLHlCQUFvQixHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7WUFDaEMsbUJBQWMsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUN2Qyx1QkFBa0IsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUczRCxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDckYsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3hCLENBQUM7UUFFRCxPQUFPO1lBQ04sSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2xDLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDOUIsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDMUIsQ0FBQztRQUVPLGVBQWU7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