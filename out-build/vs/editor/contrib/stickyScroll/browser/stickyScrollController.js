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
    var $U0_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$U0 = void 0;
    let $U0 = class $U0 extends lifecycle_1.$kc {
        static { $U0_1 = this; }
        static { this.ID = 'store.contrib.stickyScrollController'; }
        constructor(F, G, H, I, _languageConfigurationService, _languageFeatureDebounceService, J) {
            super();
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.J = J;
            this.c = new lifecycle_1.$jc();
            this.g = null;
            this.h = Number.MAX_SAFE_INTEGER;
            this.m = -1;
            this.t = -1;
            this.u = false;
            this.w = false;
            this.y = false;
            this.z = false;
            this.C = [];
            this.D = null;
            this.a = new stickyScrollWidget_1.$N0(this.F);
            this.b = new stickyScrollProvider_1.$T0(this.F, H, _languageConfigurationService);
            this.B(this.a);
            this.B(this.b);
            this.f = new stickyScrollWidget_1.$M0([], [], 0);
            this.U();
            const stickyScrollDomNode = this.a.getDomNode();
            this.B(this.F.onDidChangeConfiguration(e => {
                if (e.hasChanged(114 /* EditorOption.stickyScroll */)
                    || e.hasChanged(72 /* EditorOption.minimap */)
                    || e.hasChanged(66 /* EditorOption.lineHeight */)
                    || e.hasChanged(109 /* EditorOption.showFoldingControls */)) {
                    this.U();
                }
            }));
            this.B(dom.$nO(stickyScrollDomNode, dom.$3O.CONTEXT_MENU, async (event) => {
                this.R(event);
            }));
            this.n = editorContextKeys_1.EditorContextKeys.stickyScrollFocused.bindTo(this.J);
            this.r = editorContextKeys_1.EditorContextKeys.stickyScrollVisible.bindTo(this.J);
            const focusTracker = this.B(dom.$8O(stickyScrollDomNode));
            this.B(focusTracker.onDidBlur(_ => {
                // Suppose that the blurring is caused by scrolling, then keep the focus on the sticky scroll
                // This is determined by the fact that the height of the widget has become zero and there has been no position revealing
                if (this.y === false && stickyScrollDomNode.clientHeight === 0) {
                    this.t = -1;
                    this.focus();
                }
                // In all other casees, dispose the focus on the sticky scroll
                else {
                    this.L();
                }
            }));
            this.B(focusTracker.onDidFocus(_ => {
                this.focus();
            }));
            this.Q();
            // Suppose that mouse down on the sticky scroll, then do not focus on the sticky scroll because this will be followed by the revealing of a position
            this.B(dom.$nO(stickyScrollDomNode, dom.$3O.MOUSE_DOWN, (e) => {
                this.z = true;
            }));
        }
        get stickyScrollCandidateProvider() {
            return this.b;
        }
        get stickyScrollWidgetState() {
            return this.f;
        }
        static get(editor) {
            return editor.getContribution($U0_1.ID);
        }
        L() {
            this.n.set(false);
            this.s?.dispose();
            this.w = false;
            this.y = false;
            this.z = false;
        }
        focus() {
            // If the mouse is down, do not focus on the sticky scroll
            if (this.z) {
                this.z = false;
                this.F.focus();
                return;
            }
            const focusState = this.n.get();
            if (focusState === true) {
                return;
            }
            this.w = true;
            this.s = new lifecycle_1.$jc();
            this.n.set(true);
            this.t = this.a.lineNumbers.length - 1;
            this.a.focusLineWithIndex(this.t);
        }
        focusNext() {
            if (this.t < this.a.lineNumberCount - 1) {
                this.M(true);
            }
        }
        focusPrevious() {
            if (this.t > 0) {
                this.M(false);
            }
        }
        selectEditor() {
            this.F.focus();
        }
        // True is next, false is previous
        M(direction) {
            this.t = direction ? this.t + 1 : this.t - 1;
            this.a.focusLineWithIndex(this.t);
        }
        goToFocused() {
            const lineNumbers = this.a.lineNumbers;
            this.L();
            this.N({ lineNumber: lineNumbers[this.t], column: 1 });
        }
        N(position) {
            this.P(position, () => this.F.revealPosition(position));
        }
        O(position) {
            this.P(position, () => this.F.revealLineInCenterIfOutsideViewport(position.lineNumber, 0 /* ScrollType.Smooth */));
        }
        P(position, revealFunction) {
            if (this.w) {
                this.L();
            }
            this.y = true;
            revealFunction();
            this.F.setSelection(range_1.$ks.fromPositions(position));
            this.F.focus();
        }
        Q() {
            const sessionStore = this.B(new lifecycle_1.$jc());
            const gesture = this.B(new clickLinkGesture_1.$v3(this.F, {
                extractLineNumberFromMouseEvent: (e) => {
                    const position = this.a.getEditorPositionFromNode(e.target.element);
                    return position ? position.lineNumber : 0;
                }
            }));
            const getMouseEventTarget = (mouseEvent) => {
                if (!this.F.hasModel()) {
                    return null;
                }
                if (mouseEvent.target.type !== 12 /* MouseTargetType.OVERLAY_WIDGET */ || mouseEvent.target.detail !== this.a.getId()) {
                    // not hovering over our widget
                    return null;
                }
                const mouseTargetElement = mouseEvent.target.element;
                if (!mouseTargetElement || mouseTargetElement.innerText !== mouseTargetElement.innerHTML) {
                    // not on a span element rendering text
                    return null;
                }
                const position = this.a.getEditorPositionFromNode(mouseTargetElement);
                if (!position) {
                    // not hovering a sticky scroll line
                    return null;
                }
                return {
                    range: new range_1.$ks(position.lineNumber, position.column, position.lineNumber, position.column + mouseTargetElement.innerText.length),
                    textElement: mouseTargetElement
                };
            };
            const stickyScrollWidgetDomNode = this.a.getDomNode();
            this.B(dom.$oO(stickyScrollWidgetDomNode, dom.$3O.CLICK, (mouseEvent) => {
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
                    const lineIndex = this.a.getLineIndexFromChildDomNode(mouseEvent.target);
                    if (lineIndex === null) {
                        return;
                    }
                    const position = new position_1.$js(this.C[lineIndex], 1);
                    this.O(position);
                    return;
                }
                const isInFoldingIconDomNode = this.a.isInFoldingIconDomNode(mouseEvent.target);
                if (isInFoldingIconDomNode) {
                    // clicked on folding icon
                    const lineNumber = this.a.getLineNumberFromChildDomNode(mouseEvent.target);
                    this.S(lineNumber);
                    return;
                }
                const isInStickyLine = this.a.isInStickyLine(mouseEvent.target);
                if (!isInStickyLine) {
                    return;
                }
                // normal click
                let position = this.a.getEditorPositionFromNode(mouseEvent.target);
                if (!position) {
                    const lineNumber = this.a.getLineNumberFromChildDomNode(mouseEvent.target);
                    if (lineNumber === null) {
                        // not hovering a sticky scroll line
                        return;
                    }
                    position = new position_1.$js(lineNumber, 1);
                }
                this.N(position);
            }));
            this.B(dom.$oO(stickyScrollWidgetDomNode, dom.$3O.MOUSE_MOVE, (mouseEvent) => {
                if (mouseEvent.shiftKey) {
                    const currentEndForLineIndex = this.a.getLineIndexFromChildDomNode(mouseEvent.target);
                    if (currentEndForLineIndex === null || this.D !== null && this.D === currentEndForLineIndex) {
                        return;
                    }
                    this.D = currentEndForLineIndex;
                    this.Z();
                    return;
                }
                if (this.D !== null) {
                    this.D = null;
                    this.Z();
                }
            }));
            this.B(dom.$nO(stickyScrollWidgetDomNode, dom.$3O.MOUSE_LEAVE, (e) => {
                if (this.D !== null) {
                    this.D = null;
                    this.Z();
                }
            }));
            this.B(gesture.onMouseMoveOrRelevantKeyDown(([mouseEvent, _keyboardEvent]) => {
                const mouseTarget = getMouseEventTarget(mouseEvent);
                if (!mouseTarget || !mouseEvent.hasTriggerModifier || !this.F.hasModel()) {
                    sessionStore.clear();
                    return;
                }
                const { range, textElement } = mouseTarget;
                if (!range.equalsRange(this.j)) {
                    this.j = range;
                    sessionStore.clear();
                }
                else if (textElement.style.textDecoration === 'underline') {
                    return;
                }
                const cancellationToken = new cancellation_1.$pd();
                sessionStore.add((0, lifecycle_1.$ic)(() => cancellationToken.dispose(true)));
                let currentHTMLChild;
                (0, goToSymbol_1.$P4)(this.H.definitionProvider, this.F.getModel(), new position_1.$js(range.startLineNumber, range.startColumn + 1), cancellationToken.token).then((candidateDefinitions => {
                    if (cancellationToken.token.isCancellationRequested) {
                        return;
                    }
                    if (candidateDefinitions.length !== 0) {
                        this.m = candidateDefinitions.length;
                        const childHTML = textElement;
                        if (currentHTMLChild !== childHTML) {
                            sessionStore.clear();
                            currentHTMLChild = childHTML;
                            currentHTMLChild.style.textDecoration = 'underline';
                            sessionStore.add((0, lifecycle_1.$ic)(() => {
                                currentHTMLChild.style.textDecoration = 'none';
                            }));
                        }
                        else if (!currentHTMLChild) {
                            currentHTMLChild = childHTML;
                            currentHTMLChild.style.textDecoration = 'underline';
                            sessionStore.add((0, lifecycle_1.$ic)(() => {
                                currentHTMLChild.style.textDecoration = 'none';
                            }));
                        }
                    }
                    else {
                        sessionStore.clear();
                    }
                }));
            }));
            this.B(gesture.onCancel(() => {
                sessionStore.clear();
            }));
            this.B(gesture.onExecute(async (e) => {
                if (e.target.type !== 12 /* MouseTargetType.OVERLAY_WIDGET */ || e.target.detail !== this.a.getId()) {
                    // not hovering over our widget
                    return;
                }
                const position = this.a.getEditorPositionFromNode(e.target.element);
                if (!position) {
                    // not hovering a sticky scroll line
                    return;
                }
                if (this.m > 1) {
                    if (this.w) {
                        this.L();
                    }
                    this.N({ lineNumber: position.lineNumber, column: 1 });
                }
                this.I.invokeFunction(inlayHintsLocations_1.$p9, e, this.F, { uri: this.F.getModel().uri, range: this.j });
            }));
        }
        R(e) {
            const event = new mouseEvent_1.$eO(e);
            this.G.showContextMenu({
                menuId: actions_1.$Ru.StickyScrollContext,
                getAnchor: () => event,
            });
        }
        S(line) {
            if (!this.g || line === null) {
                return;
            }
            const stickyLine = this.a.getStickyLineForLine(line);
            const foldingIcon = stickyLine?.foldingIcon;
            if (!foldingIcon) {
                return;
            }
            (0, foldingModel_1.$d8)(this.g, Number.MAX_VALUE, [line]);
            foldingIcon.isCollapsed = !foldingIcon.isCollapsed;
            const scrollTop = (foldingIcon.isCollapsed ?
                this.F.getTopForLineNumber(foldingIcon.foldingEndLine)
                : this.F.getTopForLineNumber(foldingIcon.foldingStartLine))
                - this.F.getOption(66 /* EditorOption.lineHeight */) * stickyLine.index + 1;
            this.F.setScrollTop(scrollTop);
            this.Z(line);
        }
        U() {
            const options = this.F.getOption(114 /* EditorOption.stickyScroll */);
            if (options.enabled === false) {
                this.F.removeOverlayWidget(this.a);
                this.c.clear();
                this.u = false;
                return;
            }
            else if (options.enabled && !this.u) {
                // When sticky scroll was just enabled, add the listeners on the sticky scroll
                this.F.addOverlayWidget(this.a);
                this.c.add(this.F.onDidScrollChange((e) => {
                    if (e.scrollTopChanged) {
                        this.D = null;
                        this.Z();
                    }
                }));
                this.c.add(this.F.onDidLayoutChange(() => this.Y()));
                this.c.add(this.F.onDidChangeModelTokens((e) => this.X(e)));
                this.c.add(this.b.onDidChangeStickyScroll(() => {
                    this.D = null;
                    this.Z();
                }));
                this.u = true;
            }
            const lineNumberOption = this.F.getOption(67 /* EditorOption.lineNumbers */);
            if (lineNumberOption.renderType === 2 /* RenderLineNumbersType.Relative */) {
                this.c.add(this.F.onDidChangeCursorPosition(() => {
                    this.D = null;
                    this.Z();
                }));
            }
        }
        W(event) {
            const stickyLineNumbers = this.a.getCurrentLines();
            for (const stickyLineNumber of stickyLineNumbers) {
                for (const range of event.ranges) {
                    if (stickyLineNumber >= range.fromLineNumber && stickyLineNumber <= range.toLineNumber) {
                        return true;
                    }
                }
            }
            return false;
        }
        X(event) {
            if (this.W(event)) {
                // Rebuilding the whole widget from line -1
                this.Z(-1);
            }
        }
        Y() {
            const layoutInfo = this.F.getLayoutInfo();
            // Make sure sticky scroll doesn't take up more than 25% of the editor
            const theoreticalLines = layoutInfo.height / this.F.getOption(66 /* EditorOption.lineHeight */);
            this.h = Math.round(theoreticalLines * .25);
        }
        async Z(rebuildFromLine = Infinity) {
            const model = this.F.getModel();
            if (!model || model.isTooLargeForTokenization()) {
                this.g = null;
                this.a.setState(undefined, null, rebuildFromLine);
                return;
            }
            const stickyLineVersion = this.b.getVersionId();
            if (stickyLineVersion === undefined || stickyLineVersion === model.getVersionId()) {
                this.g = await folding_1.$z8.get(this.F)?.getFoldingModel() ?? null;
                this.f = this.findScrollWidgetState();
                this.r.set(!(this.f.startLineNumbers.length === 0));
                if (!this.w) {
                    this.a.setState(this.f, this.g, rebuildFromLine);
                }
                else {
                    // Suppose that previously the sticky scroll widget had height 0, then if there are visible lines, set the last line as focused
                    if (this.t === -1) {
                        this.a.setState(this.f, this.g, rebuildFromLine);
                        this.t = this.a.lineNumberCount - 1;
                        if (this.t !== -1) {
                            this.a.focusLineWithIndex(this.t);
                        }
                    }
                    else {
                        const focusedStickyElementLineNumber = this.a.lineNumbers[this.t];
                        this.a.setState(this.f, this.g, rebuildFromLine);
                        // Suppose that after setting the state, there are no sticky lines, set the focused index to -1
                        if (this.a.lineNumberCount === 0) {
                            this.t = -1;
                        }
                        else {
                            const previousFocusedLineNumberExists = this.a.lineNumbers.includes(focusedStickyElementLineNumber);
                            // If the line number is still there, do not change anything
                            // If the line number is not there, set the new focused line to be the last line
                            if (!previousFocusedLineNumberExists) {
                                this.t = this.a.lineNumberCount - 1;
                            }
                            this.a.focusLineWithIndex(this.t);
                        }
                    }
                }
            }
        }
        findScrollWidgetState() {
            const lineHeight = this.F.getOption(66 /* EditorOption.lineHeight */);
            const maxNumberStickyLines = Math.min(this.h, this.F.getOption(114 /* EditorOption.stickyScroll */).maxLineCount);
            const scrollTop = this.F.getScrollTop();
            let lastLineRelativePosition = 0;
            const startLineNumbers = [];
            const endLineNumbers = [];
            const arrayVisibleRanges = this.F.getVisibleRanges();
            if (arrayVisibleRanges.length !== 0) {
                const fullVisibleRange = new stickyScrollElement_1.$O0(arrayVisibleRanges[0].startLineNumber, arrayVisibleRanges[arrayVisibleRanges.length - 1].endLineNumber);
                const candidateRanges = this.b.getCandidateStickyLinesIntersecting(fullVisibleRange);
                for (const range of candidateRanges) {
                    const start = range.startLineNumber;
                    const end = range.endLineNumber;
                    const depth = range.nestingDepth;
                    if (end - start > 0) {
                        const topOfElementAtDepth = (depth - 1) * lineHeight;
                        const bottomOfElementAtDepth = depth * lineHeight;
                        const bottomOfBeginningLine = this.F.getBottomForLineNumber(start) - scrollTop;
                        const topOfEndLine = this.F.getTopForLineNumber(end) - scrollTop;
                        const bottomOfEndLine = this.F.getBottomForLineNumber(end) - scrollTop;
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
            this.C = endLineNumbers;
            return new stickyScrollWidget_1.$M0(startLineNumbers, endLineNumbers, lastLineRelativePosition, this.D);
        }
        dispose() {
            super.dispose();
            this.c.dispose();
        }
    };
    exports.$U0 = $U0;
    exports.$U0 = $U0 = $U0_1 = __decorate([
        __param(1, contextView_1.$WZ),
        __param(2, languageFeatures_1.$hF),
        __param(3, instantiation_1.$Ah),
        __param(4, languageConfigurationRegistry_1.$2t),
        __param(5, languageFeatureDebounce_1.$52),
        __param(6, contextkey_1.$3i)
    ], $U0);
});
//# sourceMappingURL=stickyScrollController.js.map