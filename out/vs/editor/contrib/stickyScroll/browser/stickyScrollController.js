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
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/common/services/languageFeatures", "./stickyScrollWidget", "./stickyScrollProvider", "vs/platform/instantiation/common/instantiation", "vs/platform/contextview/browser/contextView", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/editor/common/editorContextKeys", "vs/editor/contrib/gotoSymbol/browser/link/clickLinkGesture", "vs/editor/common/core/range", "vs/editor/contrib/gotoSymbol/browser/goToSymbol", "vs/editor/contrib/inlayHints/browser/inlayHintsLocations", "vs/editor/common/core/position", "vs/base/common/cancellation", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/services/languageFeatureDebounce", "vs/base/browser/dom", "vs/editor/contrib/stickyScroll/browser/stickyScrollElement", "vs/base/browser/mouseEvent", "vs/editor/contrib/folding/browser/folding", "vs/editor/contrib/folding/browser/foldingModel"], function (require, exports, lifecycle_1, languageFeatures_1, stickyScrollWidget_1, stickyScrollProvider_1, instantiation_1, contextView_1, actions_1, contextkey_1, editorContextKeys_1, clickLinkGesture_1, range_1, goToSymbol_1, inlayHintsLocations_1, position_1, cancellation_1, languageConfigurationRegistry_1, languageFeatureDebounce_1, dom, stickyScrollElement_1, mouseEvent_1, folding_1, foldingModel_1) {
    "use strict";
    var StickyScrollController_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StickyScrollController = void 0;
    let StickyScrollController = class StickyScrollController extends lifecycle_1.Disposable {
        static { StickyScrollController_1 = this; }
        static { this.ID = 'store.contrib.stickyScrollController'; }
        constructor(_editor, _contextMenuService, _languageFeaturesService, _instaService, _languageConfigurationService, _languageFeatureDebounceService, _contextKeyService) {
            super();
            this._editor = _editor;
            this._contextMenuService = _contextMenuService;
            this._languageFeaturesService = _languageFeaturesService;
            this._instaService = _instaService;
            this._contextKeyService = _contextKeyService;
            this._sessionStore = new lifecycle_1.DisposableStore();
            this._foldingModel = null;
            this._maxStickyLines = Number.MAX_SAFE_INTEGER;
            this._candidateDefinitionsLength = -1;
            this._focusedStickyElementIndex = -1;
            this._enabled = false;
            this._focused = false;
            this._positionRevealed = false;
            this._onMouseDown = false;
            this._endLineNumbers = [];
            this._showEndForLine = null;
            this._stickyScrollWidget = new stickyScrollWidget_1.StickyScrollWidget(this._editor);
            this._stickyLineCandidateProvider = new stickyScrollProvider_1.StickyLineCandidateProvider(this._editor, _languageFeaturesService, _languageConfigurationService);
            this._register(this._stickyScrollWidget);
            this._register(this._stickyLineCandidateProvider);
            this._widgetState = new stickyScrollWidget_1.StickyScrollWidgetState([], [], 0);
            this._readConfiguration();
            const stickyScrollDomNode = this._stickyScrollWidget.getDomNode();
            this._register(this._editor.onDidChangeConfiguration(e => {
                if (e.hasChanged(114 /* EditorOption.stickyScroll */)
                    || e.hasChanged(72 /* EditorOption.minimap */)
                    || e.hasChanged(66 /* EditorOption.lineHeight */)
                    || e.hasChanged(109 /* EditorOption.showFoldingControls */)) {
                    this._readConfiguration();
                }
            }));
            this._register(dom.addDisposableListener(stickyScrollDomNode, dom.EventType.CONTEXT_MENU, async (event) => {
                this._onContextMenu(event);
            }));
            this._stickyScrollFocusedContextKey = editorContextKeys_1.EditorContextKeys.stickyScrollFocused.bindTo(this._contextKeyService);
            this._stickyScrollVisibleContextKey = editorContextKeys_1.EditorContextKeys.stickyScrollVisible.bindTo(this._contextKeyService);
            const focusTracker = this._register(dom.trackFocus(stickyScrollDomNode));
            this._register(focusTracker.onDidBlur(_ => {
                // Suppose that the blurring is caused by scrolling, then keep the focus on the sticky scroll
                // This is determined by the fact that the height of the widget has become zero and there has been no position revealing
                if (this._positionRevealed === false && stickyScrollDomNode.clientHeight === 0) {
                    this._focusedStickyElementIndex = -1;
                    this.focus();
                }
                // In all other casees, dispose the focus on the sticky scroll
                else {
                    this._disposeFocusStickyScrollStore();
                }
            }));
            this._register(focusTracker.onDidFocus(_ => {
                this.focus();
            }));
            this._registerMouseListeners();
            // Suppose that mouse down on the sticky scroll, then do not focus on the sticky scroll because this will be followed by the revealing of a position
            this._register(dom.addDisposableListener(stickyScrollDomNode, dom.EventType.MOUSE_DOWN, (e) => {
                this._onMouseDown = true;
            }));
        }
        get stickyScrollCandidateProvider() {
            return this._stickyLineCandidateProvider;
        }
        get stickyScrollWidgetState() {
            return this._widgetState;
        }
        static get(editor) {
            return editor.getContribution(StickyScrollController_1.ID);
        }
        _disposeFocusStickyScrollStore() {
            this._stickyScrollFocusedContextKey.set(false);
            this._focusDisposableStore?.dispose();
            this._focused = false;
            this._positionRevealed = false;
            this._onMouseDown = false;
        }
        focus() {
            // If the mouse is down, do not focus on the sticky scroll
            if (this._onMouseDown) {
                this._onMouseDown = false;
                this._editor.focus();
                return;
            }
            const focusState = this._stickyScrollFocusedContextKey.get();
            if (focusState === true) {
                return;
            }
            this._focused = true;
            this._focusDisposableStore = new lifecycle_1.DisposableStore();
            this._stickyScrollFocusedContextKey.set(true);
            this._focusedStickyElementIndex = this._stickyScrollWidget.lineNumbers.length - 1;
            this._stickyScrollWidget.focusLineWithIndex(this._focusedStickyElementIndex);
        }
        focusNext() {
            if (this._focusedStickyElementIndex < this._stickyScrollWidget.lineNumberCount - 1) {
                this._focusNav(true);
            }
        }
        focusPrevious() {
            if (this._focusedStickyElementIndex > 0) {
                this._focusNav(false);
            }
        }
        selectEditor() {
            this._editor.focus();
        }
        // True is next, false is previous
        _focusNav(direction) {
            this._focusedStickyElementIndex = direction ? this._focusedStickyElementIndex + 1 : this._focusedStickyElementIndex - 1;
            this._stickyScrollWidget.focusLineWithIndex(this._focusedStickyElementIndex);
        }
        goToFocused() {
            const lineNumbers = this._stickyScrollWidget.lineNumbers;
            this._disposeFocusStickyScrollStore();
            this._revealPosition({ lineNumber: lineNumbers[this._focusedStickyElementIndex], column: 1 });
        }
        _revealPosition(position) {
            this._reveaInEditor(position, () => this._editor.revealPosition(position));
        }
        _revealLineInCenterIfOutsideViewport(position) {
            this._reveaInEditor(position, () => this._editor.revealLineInCenterIfOutsideViewport(position.lineNumber, 0 /* ScrollType.Smooth */));
        }
        _reveaInEditor(position, revealFunction) {
            if (this._focused) {
                this._disposeFocusStickyScrollStore();
            }
            this._positionRevealed = true;
            revealFunction();
            this._editor.setSelection(range_1.Range.fromPositions(position));
            this._editor.focus();
        }
        _registerMouseListeners() {
            const sessionStore = this._register(new lifecycle_1.DisposableStore());
            const gesture = this._register(new clickLinkGesture_1.ClickLinkGesture(this._editor, {
                extractLineNumberFromMouseEvent: (e) => {
                    const position = this._stickyScrollWidget.getEditorPositionFromNode(e.target.element);
                    return position ? position.lineNumber : 0;
                }
            }));
            const getMouseEventTarget = (mouseEvent) => {
                if (!this._editor.hasModel()) {
                    return null;
                }
                if (mouseEvent.target.type !== 12 /* MouseTargetType.OVERLAY_WIDGET */ || mouseEvent.target.detail !== this._stickyScrollWidget.getId()) {
                    // not hovering over our widget
                    return null;
                }
                const mouseTargetElement = mouseEvent.target.element;
                if (!mouseTargetElement || mouseTargetElement.innerText !== mouseTargetElement.innerHTML) {
                    // not on a span element rendering text
                    return null;
                }
                const position = this._stickyScrollWidget.getEditorPositionFromNode(mouseTargetElement);
                if (!position) {
                    // not hovering a sticky scroll line
                    return null;
                }
                return {
                    range: new range_1.Range(position.lineNumber, position.column, position.lineNumber, position.column + mouseTargetElement.innerText.length),
                    textElement: mouseTargetElement
                };
            };
            const stickyScrollWidgetDomNode = this._stickyScrollWidget.getDomNode();
            this._register(dom.addStandardDisposableListener(stickyScrollWidgetDomNode, dom.EventType.CLICK, (mouseEvent) => {
                if (mouseEvent.ctrlKey || mouseEvent.altKey || mouseEvent.metaKey) {
                    // modifier pressed
                    return;
                }
                if (!mouseEvent.leftButton) {
                    // not left click
                    return;
                }
                if (mouseEvent.shiftKey) {
                    // shift click
                    const lineIndex = this._stickyScrollWidget.getLineIndexFromChildDomNode(mouseEvent.target);
                    if (lineIndex === null) {
                        return;
                    }
                    const position = new position_1.Position(this._endLineNumbers[lineIndex], 1);
                    this._revealLineInCenterIfOutsideViewport(position);
                    return;
                }
                const isInFoldingIconDomNode = this._stickyScrollWidget.isInFoldingIconDomNode(mouseEvent.target);
                if (isInFoldingIconDomNode) {
                    // clicked on folding icon
                    const lineNumber = this._stickyScrollWidget.getLineNumberFromChildDomNode(mouseEvent.target);
                    this._toggleFoldingRegionForLine(lineNumber);
                    return;
                }
                const isInStickyLine = this._stickyScrollWidget.isInStickyLine(mouseEvent.target);
                if (!isInStickyLine) {
                    return;
                }
                // normal click
                let position = this._stickyScrollWidget.getEditorPositionFromNode(mouseEvent.target);
                if (!position) {
                    const lineNumber = this._stickyScrollWidget.getLineNumberFromChildDomNode(mouseEvent.target);
                    if (lineNumber === null) {
                        // not hovering a sticky scroll line
                        return;
                    }
                    position = new position_1.Position(lineNumber, 1);
                }
                this._revealPosition(position);
            }));
            this._register(dom.addStandardDisposableListener(stickyScrollWidgetDomNode, dom.EventType.MOUSE_MOVE, (mouseEvent) => {
                if (mouseEvent.shiftKey) {
                    const currentEndForLineIndex = this._stickyScrollWidget.getLineIndexFromChildDomNode(mouseEvent.target);
                    if (currentEndForLineIndex === null || this._showEndForLine !== null && this._showEndForLine === currentEndForLineIndex) {
                        return;
                    }
                    this._showEndForLine = currentEndForLineIndex;
                    this._renderStickyScroll();
                    return;
                }
                if (this._showEndForLine !== null) {
                    this._showEndForLine = null;
                    this._renderStickyScroll();
                }
            }));
            this._register(dom.addDisposableListener(stickyScrollWidgetDomNode, dom.EventType.MOUSE_LEAVE, (e) => {
                if (this._showEndForLine !== null) {
                    this._showEndForLine = null;
                    this._renderStickyScroll();
                }
            }));
            this._register(gesture.onMouseMoveOrRelevantKeyDown(([mouseEvent, _keyboardEvent]) => {
                const mouseTarget = getMouseEventTarget(mouseEvent);
                if (!mouseTarget || !mouseEvent.hasTriggerModifier || !this._editor.hasModel()) {
                    sessionStore.clear();
                    return;
                }
                const { range, textElement } = mouseTarget;
                if (!range.equalsRange(this._stickyRangeProjectedOnEditor)) {
                    this._stickyRangeProjectedOnEditor = range;
                    sessionStore.clear();
                }
                else if (textElement.style.textDecoration === 'underline') {
                    return;
                }
                const cancellationToken = new cancellation_1.CancellationTokenSource();
                sessionStore.add((0, lifecycle_1.toDisposable)(() => cancellationToken.dispose(true)));
                let currentHTMLChild;
                (0, goToSymbol_1.getDefinitionsAtPosition)(this._languageFeaturesService.definitionProvider, this._editor.getModel(), new position_1.Position(range.startLineNumber, range.startColumn + 1), cancellationToken.token).then((candidateDefinitions => {
                    if (cancellationToken.token.isCancellationRequested) {
                        return;
                    }
                    if (candidateDefinitions.length !== 0) {
                        this._candidateDefinitionsLength = candidateDefinitions.length;
                        const childHTML = textElement;
                        if (currentHTMLChild !== childHTML) {
                            sessionStore.clear();
                            currentHTMLChild = childHTML;
                            currentHTMLChild.style.textDecoration = 'underline';
                            sessionStore.add((0, lifecycle_1.toDisposable)(() => {
                                currentHTMLChild.style.textDecoration = 'none';
                            }));
                        }
                        else if (!currentHTMLChild) {
                            currentHTMLChild = childHTML;
                            currentHTMLChild.style.textDecoration = 'underline';
                            sessionStore.add((0, lifecycle_1.toDisposable)(() => {
                                currentHTMLChild.style.textDecoration = 'none';
                            }));
                        }
                    }
                    else {
                        sessionStore.clear();
                    }
                }));
            }));
            this._register(gesture.onCancel(() => {
                sessionStore.clear();
            }));
            this._register(gesture.onExecute(async (e) => {
                if (e.target.type !== 12 /* MouseTargetType.OVERLAY_WIDGET */ || e.target.detail !== this._stickyScrollWidget.getId()) {
                    // not hovering over our widget
                    return;
                }
                const position = this._stickyScrollWidget.getEditorPositionFromNode(e.target.element);
                if (!position) {
                    // not hovering a sticky scroll line
                    return;
                }
                if (this._candidateDefinitionsLength > 1) {
                    if (this._focused) {
                        this._disposeFocusStickyScrollStore();
                    }
                    this._revealPosition({ lineNumber: position.lineNumber, column: 1 });
                }
                this._instaService.invokeFunction(inlayHintsLocations_1.goToDefinitionWithLocation, e, this._editor, { uri: this._editor.getModel().uri, range: this._stickyRangeProjectedOnEditor });
            }));
        }
        _onContextMenu(e) {
            const event = new mouseEvent_1.StandardMouseEvent(e);
            this._contextMenuService.showContextMenu({
                menuId: actions_1.MenuId.StickyScrollContext,
                getAnchor: () => event,
            });
        }
        _toggleFoldingRegionForLine(line) {
            if (!this._foldingModel || line === null) {
                return;
            }
            const stickyLine = this._stickyScrollWidget.getStickyLineForLine(line);
            const foldingIcon = stickyLine?.foldingIcon;
            if (!foldingIcon) {
                return;
            }
            (0, foldingModel_1.toggleCollapseState)(this._foldingModel, Number.MAX_VALUE, [line]);
            foldingIcon.isCollapsed = !foldingIcon.isCollapsed;
            const scrollTop = (foldingIcon.isCollapsed ?
                this._editor.getTopForLineNumber(foldingIcon.foldingEndLine)
                : this._editor.getTopForLineNumber(foldingIcon.foldingStartLine))
                - this._editor.getOption(66 /* EditorOption.lineHeight */) * stickyLine.index + 1;
            this._editor.setScrollTop(scrollTop);
            this._renderStickyScroll(line);
        }
        _readConfiguration() {
            const options = this._editor.getOption(114 /* EditorOption.stickyScroll */);
            if (options.enabled === false) {
                this._editor.removeOverlayWidget(this._stickyScrollWidget);
                this._sessionStore.clear();
                this._enabled = false;
                return;
            }
            else if (options.enabled && !this._enabled) {
                // When sticky scroll was just enabled, add the listeners on the sticky scroll
                this._editor.addOverlayWidget(this._stickyScrollWidget);
                this._sessionStore.add(this._editor.onDidScrollChange((e) => {
                    if (e.scrollTopChanged) {
                        this._showEndForLine = null;
                        this._renderStickyScroll();
                    }
                }));
                this._sessionStore.add(this._editor.onDidLayoutChange(() => this._onDidResize()));
                this._sessionStore.add(this._editor.onDidChangeModelTokens((e) => this._onTokensChange(e)));
                this._sessionStore.add(this._stickyLineCandidateProvider.onDidChangeStickyScroll(() => {
                    this._showEndForLine = null;
                    this._renderStickyScroll();
                }));
                this._enabled = true;
            }
            const lineNumberOption = this._editor.getOption(67 /* EditorOption.lineNumbers */);
            if (lineNumberOption.renderType === 2 /* RenderLineNumbersType.Relative */) {
                this._sessionStore.add(this._editor.onDidChangeCursorPosition(() => {
                    this._showEndForLine = null;
                    this._renderStickyScroll();
                }));
            }
        }
        _needsUpdate(event) {
            const stickyLineNumbers = this._stickyScrollWidget.getCurrentLines();
            for (const stickyLineNumber of stickyLineNumbers) {
                for (const range of event.ranges) {
                    if (stickyLineNumber >= range.fromLineNumber && stickyLineNumber <= range.toLineNumber) {
                        return true;
                    }
                }
            }
            return false;
        }
        _onTokensChange(event) {
            if (this._needsUpdate(event)) {
                // Rebuilding the whole widget from line -1
                this._renderStickyScroll(-1);
            }
        }
        _onDidResize() {
            const layoutInfo = this._editor.getLayoutInfo();
            // Make sure sticky scroll doesn't take up more than 25% of the editor
            const theoreticalLines = layoutInfo.height / this._editor.getOption(66 /* EditorOption.lineHeight */);
            this._maxStickyLines = Math.round(theoreticalLines * .25);
        }
        async _renderStickyScroll(rebuildFromLine = Infinity) {
            const model = this._editor.getModel();
            if (!model || model.isTooLargeForTokenization()) {
                this._foldingModel = null;
                this._stickyScrollWidget.setState(undefined, null, rebuildFromLine);
                return;
            }
            const stickyLineVersion = this._stickyLineCandidateProvider.getVersionId();
            if (stickyLineVersion === undefined || stickyLineVersion === model.getVersionId()) {
                this._foldingModel = await folding_1.FoldingController.get(this._editor)?.getFoldingModel() ?? null;
                this._widgetState = this.findScrollWidgetState();
                this._stickyScrollVisibleContextKey.set(!(this._widgetState.startLineNumbers.length === 0));
                if (!this._focused) {
                    this._stickyScrollWidget.setState(this._widgetState, this._foldingModel, rebuildFromLine);
                }
                else {
                    // Suppose that previously the sticky scroll widget had height 0, then if there are visible lines, set the last line as focused
                    if (this._focusedStickyElementIndex === -1) {
                        this._stickyScrollWidget.setState(this._widgetState, this._foldingModel, rebuildFromLine);
                        this._focusedStickyElementIndex = this._stickyScrollWidget.lineNumberCount - 1;
                        if (this._focusedStickyElementIndex !== -1) {
                            this._stickyScrollWidget.focusLineWithIndex(this._focusedStickyElementIndex);
                        }
                    }
                    else {
                        const focusedStickyElementLineNumber = this._stickyScrollWidget.lineNumbers[this._focusedStickyElementIndex];
                        this._stickyScrollWidget.setState(this._widgetState, this._foldingModel, rebuildFromLine);
                        // Suppose that after setting the state, there are no sticky lines, set the focused index to -1
                        if (this._stickyScrollWidget.lineNumberCount === 0) {
                            this._focusedStickyElementIndex = -1;
                        }
                        else {
                            const previousFocusedLineNumberExists = this._stickyScrollWidget.lineNumbers.includes(focusedStickyElementLineNumber);
                            // If the line number is still there, do not change anything
                            // If the line number is not there, set the new focused line to be the last line
                            if (!previousFocusedLineNumberExists) {
                                this._focusedStickyElementIndex = this._stickyScrollWidget.lineNumberCount - 1;
                            }
                            this._stickyScrollWidget.focusLineWithIndex(this._focusedStickyElementIndex);
                        }
                    }
                }
            }
        }
        findScrollWidgetState() {
            const lineHeight = this._editor.getOption(66 /* EditorOption.lineHeight */);
            const maxNumberStickyLines = Math.min(this._maxStickyLines, this._editor.getOption(114 /* EditorOption.stickyScroll */).maxLineCount);
            const scrollTop = this._editor.getScrollTop();
            let lastLineRelativePosition = 0;
            const startLineNumbers = [];
            const endLineNumbers = [];
            const arrayVisibleRanges = this._editor.getVisibleRanges();
            if (arrayVisibleRanges.length !== 0) {
                const fullVisibleRange = new stickyScrollElement_1.StickyRange(arrayVisibleRanges[0].startLineNumber, arrayVisibleRanges[arrayVisibleRanges.length - 1].endLineNumber);
                const candidateRanges = this._stickyLineCandidateProvider.getCandidateStickyLinesIntersecting(fullVisibleRange);
                for (const range of candidateRanges) {
                    const start = range.startLineNumber;
                    const end = range.endLineNumber;
                    const depth = range.nestingDepth;
                    if (end - start > 0) {
                        const topOfElementAtDepth = (depth - 1) * lineHeight;
                        const bottomOfElementAtDepth = depth * lineHeight;
                        const bottomOfBeginningLine = this._editor.getBottomForLineNumber(start) - scrollTop;
                        const topOfEndLine = this._editor.getTopForLineNumber(end) - scrollTop;
                        const bottomOfEndLine = this._editor.getBottomForLineNumber(end) - scrollTop;
                        if (topOfElementAtDepth > topOfEndLine && topOfElementAtDepth <= bottomOfEndLine) {
                            startLineNumbers.push(start);
                            endLineNumbers.push(end + 1);
                            lastLineRelativePosition = bottomOfEndLine - bottomOfElementAtDepth;
                            break;
                        }
                        else if (bottomOfElementAtDepth > bottomOfBeginningLine && bottomOfElementAtDepth <= bottomOfEndLine) {
                            startLineNumbers.push(start);
                            endLineNumbers.push(end + 1);
                        }
                        if (startLineNumbers.length === maxNumberStickyLines) {
                            break;
                        }
                    }
                }
            }
            this._endLineNumbers = endLineNumbers;
            return new stickyScrollWidget_1.StickyScrollWidgetState(startLineNumbers, endLineNumbers, lastLineRelativePosition, this._showEndForLine);
        }
        dispose() {
            super.dispose();
            this._sessionStore.dispose();
        }
    };
    exports.StickyScrollController = StickyScrollController;
    exports.StickyScrollController = StickyScrollController = StickyScrollController_1 = __decorate([
        __param(1, contextView_1.IContextMenuService),
        __param(2, languageFeatures_1.ILanguageFeaturesService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, languageConfigurationRegistry_1.ILanguageConfigurationService),
        __param(5, languageFeatureDebounce_1.ILanguageFeatureDebounceService),
        __param(6, contextkey_1.IContextKeyService)
    ], StickyScrollController);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RpY2t5U2Nyb2xsQ29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL3N0aWNreVNjcm9sbC9icm93c2VyL3N0aWNreVNjcm9sbENvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQXlDekYsSUFBTSxzQkFBc0IsR0FBNUIsTUFBTSxzQkFBdUIsU0FBUSxzQkFBVTs7aUJBRXJDLE9BQUUsR0FBRyxzQ0FBc0MsQUFBekMsQ0FBMEM7UUF5QjVELFlBQ2tCLE9BQW9CLEVBQ2hCLG1CQUF5RCxFQUNwRCx3QkFBbUUsRUFDdEUsYUFBcUQsRUFDN0MsNkJBQTRELEVBQzFELCtCQUFnRSxFQUM3RSxrQkFBdUQ7WUFFM0UsS0FBSyxFQUFFLENBQUM7WUFSUyxZQUFPLEdBQVAsT0FBTyxDQUFhO1lBQ0Msd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtZQUNuQyw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1lBQ3JELGtCQUFhLEdBQWIsYUFBYSxDQUF1QjtZQUd2Qyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1lBNUIzRCxrQkFBYSxHQUFvQixJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUdoRSxrQkFBYSxHQUF3QixJQUFJLENBQUM7WUFDMUMsb0JBQWUsR0FBVyxNQUFNLENBQUMsZ0JBQWdCLENBQUM7WUFHbEQsZ0NBQTJCLEdBQVcsQ0FBQyxDQUFDLENBQUM7WUFNekMsK0JBQTBCLEdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDeEMsYUFBUSxHQUFHLEtBQUssQ0FBQztZQUNqQixhQUFRLEdBQUcsS0FBSyxDQUFDO1lBQ2pCLHNCQUFpQixHQUFHLEtBQUssQ0FBQztZQUMxQixpQkFBWSxHQUFHLEtBQUssQ0FBQztZQUNyQixvQkFBZSxHQUFhLEVBQUUsQ0FBQztZQUMvQixvQkFBZSxHQUFrQixJ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