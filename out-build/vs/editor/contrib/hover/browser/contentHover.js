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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/hover/hoverWidget", "vs/base/common/arrays", "vs/base/common/lifecycle", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/model/textModel", "vs/editor/common/languages", "vs/editor/contrib/hover/browser/hoverOperation", "vs/editor/contrib/hover/browser/hoverTypes", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/base/common/async", "vs/editor/common/editorContextKeys", "vs/platform/contextkey/common/contextkey", "vs/editor/contrib/hover/browser/resizableContentWidget", "vs/platform/configuration/common/configuration", "vs/platform/accessibility/common/accessibility"], function (require, exports, dom, hoverWidget_1, arrays_1, lifecycle_1, position_1, range_1, textModel_1, languages_1, hoverOperation_1, hoverTypes_1, instantiation_1, keybinding_1, async_1, editorContextKeys_1, contextkey_1, resizableContentWidget_1, configuration_1, accessibility_1) {
    "use strict";
    var $24_1, $34_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$44 = exports.$34 = exports.$24 = void 0;
    const $ = dom.$;
    let $24 = class $24 extends lifecycle_1.$kc {
        static { $24_1 = this; }
        getWidgetContent() {
            const node = this.f.getDomNode();
            if (!node.textContent) {
                return undefined;
            }
            return node.textContent;
        }
        constructor(n, r, s) {
            super();
            this.n = n;
            this.r = r;
            this.s = s;
            this.j = null;
            this.f = this.B(this.r.createInstance($34, this.n));
            // Instantiate participants and sort them by `hoverOrdinal` which is relevant for rendering order.
            this.c = [];
            for (const participant of hoverTypes_1.$j3.getAll()) {
                this.c.push(this.r.createInstance(participant, this.n));
            }
            this.c.sort((p1, p2) => p1.hoverOrdinal - p2.hoverOrdinal);
            this.g = new ContentHoverComputer(this.n, this.c);
            this.h = this.B(new hoverOperation_1.$Z4(this.n, this.g));
            this.B(this.h.onResult((result) => {
                if (!this.g.anchor) {
                    // invalid state, ignore result
                    return;
                }
                const messages = (result.hasLoadingMessage ? this.z(result.value) : result.value);
                this.C(new HoverResult(this.g.anchor, messages, result.isComplete));
            }));
            this.B(dom.$oO(this.f.getDomNode(), 'keydown', (e) => {
                if (e.equals(9 /* KeyCode.Escape */)) {
                    this.hide();
                }
            }));
            this.B(languages_1.$bt.onDidChange(() => {
                if (this.f.position && this.j) {
                    this.w(this.j); // render again
                }
            }));
        }
        get widget() {
            return this.f;
        }
        /**
         * Returns true if the hover shows now or will show.
         */
        maybeShowAt(mouseEvent) {
            if (this.f.isResizing) {
                return true;
            }
            const anchorCandidates = [];
            for (const participant of this.c) {
                if (participant.suggestHoverAnchor) {
                    const anchor = participant.suggestHoverAnchor(mouseEvent);
                    if (anchor) {
                        anchorCandidates.push(anchor);
                    }
                }
            }
            const target = mouseEvent.target;
            if (target.type === 6 /* MouseTargetType.CONTENT_TEXT */) {
                anchorCandidates.push(new hoverTypes_1.$h3(0, target.range, mouseEvent.event.posx, mouseEvent.event.posy));
            }
            if (target.type === 7 /* MouseTargetType.CONTENT_EMPTY */) {
                const epsilon = this.n.getOption(50 /* EditorOption.fontInfo */).typicalHalfwidthCharacterWidth / 2;
                if (!target.detail.isAfterLines && typeof target.detail.horizontalDistanceToText === 'number' && target.detail.horizontalDistanceToText < epsilon) {
                    // Let hover kick in even when the mouse is technically in the empty area after a line, given the distance is small enough
                    anchorCandidates.push(new hoverTypes_1.$h3(0, target.range, mouseEvent.event.posx, mouseEvent.event.posy));
                }
            }
            if (anchorCandidates.length === 0) {
                return this.t(null, 0 /* HoverStartMode.Delayed */, 0 /* HoverStartSource.Mouse */, false, mouseEvent);
            }
            anchorCandidates.sort((a, b) => b.priority - a.priority);
            return this.t(anchorCandidates[0], 0 /* HoverStartMode.Delayed */, 0 /* HoverStartSource.Mouse */, false, mouseEvent);
        }
        startShowingAtRange(range, mode, source, focus) {
            this.t(new hoverTypes_1.$h3(0, range, undefined, undefined), mode, source, focus, null);
        }
        /**
         * Returns true if the hover shows now or will show.
         */
        t(anchor, mode, source, focus, mouseEvent) {
            if (!this.f.position || !this.j) {
                // The hover is not visible
                if (anchor) {
                    this.u(anchor, mode, source, focus, false);
                    return true;
                }
                return false;
            }
            // The hover is currently visible
            const hoverIsSticky = this.n.getOption(60 /* EditorOption.hover */).sticky;
            const isGettingCloser = (hoverIsSticky && mouseEvent && this.f.isMouseGettingCloser(mouseEvent.event.posx, mouseEvent.event.posy));
            if (isGettingCloser) {
                // The mouse is getting closer to the hover, so we will keep the hover untouched
                // But we will kick off a hover update at the new anchor, insisting on keeping the hover visible.
                if (anchor) {
                    this.u(anchor, mode, source, focus, true);
                }
                return true;
            }
            if (!anchor) {
                this.w(null);
                return false;
            }
            if (anchor && this.j.anchor.equals(anchor)) {
                // The widget is currently showing results for the exact same anchor, so no update is needed
                return true;
            }
            if (!anchor.canAdoptVisibleHover(this.j.anchor, this.f.position)) {
                // The new anchor is not compatible with the previous anchor
                this.w(null);
                this.u(anchor, mode, source, focus, false);
                return true;
            }
            // We aren't getting any closer to the hover, so we will filter existing results
            // and keep those which also apply to the new anchor.
            this.w(this.j.filter(anchor));
            this.u(anchor, mode, source, focus, false);
            return true;
        }
        u(anchor, mode, source, focus, insistOnKeepingHoverVisible) {
            if (this.g.anchor && this.g.anchor.equals(anchor)) {
                // We have to start a hover operation at the exact same anchor as before, so no work is needed
                return;
            }
            this.h.cancel();
            this.g.anchor = anchor;
            this.g.shouldFocus = focus;
            this.g.source = source;
            this.g.insistOnKeepingHoverVisible = insistOnKeepingHoverVisible;
            this.h.start(mode);
        }
        w(hoverResult) {
            if (this.j === hoverResult) {
                // avoid updating the DOM to avoid resetting the user selection
                return;
            }
            if (hoverResult && hoverResult.messages.length === 0) {
                hoverResult = null;
            }
            this.j = hoverResult;
            if (this.j) {
                this.D(this.j.anchor, this.j.messages);
            }
            else {
                this.f.hide();
            }
        }
        hide() {
            this.g.anchor = null;
            this.h.cancel();
            this.w(null);
        }
        get isColorPickerVisible() {
            return this.f.isColorPickerVisible;
        }
        get isVisibleFromKeyboard() {
            return this.f.isVisibleFromKeyboard;
        }
        get isVisible() {
            return this.f.isVisible;
        }
        get isFocused() {
            return this.f.isFocused;
        }
        get isResizing() {
            return this.f.isResizing;
        }
        containsNode(node) {
            return (node ? this.f.getDomNode().contains(node) : false);
        }
        z(result) {
            if (this.g.anchor) {
                for (const participant of this.c) {
                    if (participant.createLoadingMessage) {
                        const loadingMessage = participant.createLoadingMessage(this.g.anchor);
                        if (loadingMessage) {
                            return result.slice(0).concat([loadingMessage]);
                        }
                    }
                }
            }
            return result;
        }
        C(hoverResult) {
            if (this.f.position && this.j && this.j.isComplete) {
                // The hover is visible with a previous complete result.
                if (!hoverResult.isComplete) {
                    // Instead of rendering the new partial result, we wait for the result to be complete.
                    return;
                }
                if (this.g.insistOnKeepingHoverVisible && hoverResult.messages.length === 0) {
                    // The hover would now hide normally, so we'll keep the previous messages
                    return;
                }
            }
            this.w(hoverResult);
        }
        D(anchor, messages) {
            const { showAtPosition, showAtSecondaryPosition, highlightRange } = $24_1.computeHoverRanges(this.n, anchor.range, messages);
            const disposables = new lifecycle_1.$jc();
            const statusBar = disposables.add(new $44(this.s));
            const fragment = document.createDocumentFragment();
            let colorPicker = null;
            const context = {
                fragment,
                statusBar,
                setColorPicker: (widget) => colorPicker = widget,
                onContentsChanged: () => this.f.onContentsChanged(),
                setMinimumDimensions: (dimensions) => this.f.setMinimumDimensions(dimensions),
                hide: () => this.hide()
            };
            for (const participant of this.c) {
                const hoverParts = messages.filter(msg => msg.owner === participant);
                if (hoverParts.length > 0) {
                    disposables.add(participant.renderHoverParts(context, hoverParts));
                }
            }
            const isBeforeContent = messages.some(m => m.isBeforeContent);
            if (statusBar.hasContent) {
                fragment.appendChild(statusBar.hoverElement);
            }
            if (fragment.hasChildNodes()) {
                if (highlightRange) {
                    const highlightDecoration = this.n.createDecorationsCollection();
                    highlightDecoration.set([{
                            range: highlightRange,
                            options: $24_1.F
                        }]);
                    disposables.add((0, lifecycle_1.$ic)(() => {
                        highlightDecoration.clear();
                    }));
                }
                this.f.showAt(fragment, new ContentHoverVisibleData(colorPicker, showAtPosition, showAtSecondaryPosition, this.n.getOption(60 /* EditorOption.hover */).above, this.g.shouldFocus, this.g.source, isBeforeContent, anchor.initialMousePosX, anchor.initialMousePosY, disposables));
            }
            else {
                disposables.dispose();
            }
        }
        static { this.F = textModel_1.$RC.register({
            description: 'content-hover-highlight',
            className: 'hoverHighlight'
        }); }
        static computeHoverRanges(editor, anchorRange, messages) {
            let startColumnBoundary = 1;
            if (editor.hasModel()) {
                // Ensure the range is on the current view line
                const viewModel = editor._getViewModel();
                const coordinatesConverter = viewModel.coordinatesConverter;
                const anchorViewRange = coordinatesConverter.convertModelRangeToViewRange(anchorRange);
                const anchorViewRangeStart = new position_1.$js(anchorViewRange.startLineNumber, viewModel.getLineMinColumn(anchorViewRange.startLineNumber));
                startColumnBoundary = coordinatesConverter.convertViewPositionToModelPosition(anchorViewRangeStart).column;
            }
            // The anchor range is always on a single line
            const anchorLineNumber = anchorRange.startLineNumber;
            let renderStartColumn = anchorRange.startColumn;
            let highlightRange = messages[0].range;
            let forceShowAtRange = null;
            for (const msg of messages) {
                highlightRange = range_1.$ks.plusRange(highlightRange, msg.range);
                if (msg.range.startLineNumber === anchorLineNumber && msg.range.endLineNumber === anchorLineNumber) {
                    // this message has a range that is completely sitting on the line of the anchor
                    renderStartColumn = Math.max(Math.min(renderStartColumn, msg.range.startColumn), startColumnBoundary);
                }
                if (msg.forceShowAtRange) {
                    forceShowAtRange = msg.range;
                }
            }
            return {
                showAtPosition: forceShowAtRange ? forceShowAtRange.getStartPosition() : new position_1.$js(anchorLineNumber, anchorRange.startColumn),
                showAtSecondaryPosition: forceShowAtRange ? forceShowAtRange.getStartPosition() : new position_1.$js(anchorLineNumber, renderStartColumn),
                highlightRange
            };
        }
        focus() {
            this.f.focus();
        }
        scrollUp() {
            this.f.scrollUp();
        }
        scrollDown() {
            this.f.scrollDown();
        }
        scrollLeft() {
            this.f.scrollLeft();
        }
        scrollRight() {
            this.f.scrollRight();
        }
        pageUp() {
            this.f.pageUp();
        }
        pageDown() {
            this.f.pageDown();
        }
        goToTop() {
            this.f.goToTop();
        }
        goToBottom() {
            this.f.goToBottom();
        }
    };
    exports.$24 = $24;
    exports.$24 = $24 = $24_1 = __decorate([
        __param(1, instantiation_1.$Ah),
        __param(2, keybinding_1.$2D)
    ], $24);
    class HoverResult {
        constructor(anchor, messages, isComplete) {
            this.anchor = anchor;
            this.messages = messages;
            this.isComplete = isComplete;
        }
        filter(anchor) {
            const filteredMessages = this.messages.filter((m) => m.isValidForHoverAnchor(anchor));
            if (filteredMessages.length === this.messages.length) {
                return this;
            }
            return new FilteredHoverResult(this, this.anchor, filteredMessages, this.isComplete);
        }
    }
    class FilteredHoverResult extends HoverResult {
        constructor(c, anchor, messages, isComplete) {
            super(anchor, messages, isComplete);
            this.c = c;
        }
        filter(anchor) {
            return this.c.filter(anchor);
        }
    }
    class ContentHoverVisibleData {
        constructor(colorPicker, showAtPosition, showAtSecondaryPosition, preferAbove, stoleFocus, source, isBeforeContent, initialMousePosX, initialMousePosY, disposables) {
            this.colorPicker = colorPicker;
            this.showAtPosition = showAtPosition;
            this.showAtSecondaryPosition = showAtSecondaryPosition;
            this.preferAbove = preferAbove;
            this.stoleFocus = stoleFocus;
            this.source = source;
            this.isBeforeContent = isBeforeContent;
            this.initialMousePosX = initialMousePosX;
            this.initialMousePosY = initialMousePosY;
            this.disposables = disposables;
            this.closestMouseDistance = undefined;
        }
    }
    const HORIZONTAL_SCROLLING_BY = 30;
    const SCROLLBAR_WIDTH = 10;
    const CONTAINER_HEIGHT_PADDING = 6;
    let $34 = class $34 extends resizableContentWidget_1.$14 {
        static { $34_1 = this; }
        static { this.ID = 'editor.contrib.resizableContentHoverWidget'; }
        static { this.t = new dom.$BO(0, 0); }
        get isColorPickerVisible() {
            return Boolean(this.u?.colorPicker);
        }
        get isVisibleFromKeyboard() {
            return (this.u?.source === 1 /* HoverStartSource.Keyboard */);
        }
        get isVisible() {
            return this.F.get() ?? false;
        }
        get isFocused() {
            return this.G.get() ?? false;
        }
        constructor(editor, contextKeyService, H, I, J) {
            const minimumHeight = editor.getOption(66 /* EditorOption.lineHeight */) + 8;
            const minimumWidth = 150;
            const minimumSize = new dom.$BO(minimumWidth, minimumHeight);
            super(editor, minimumSize);
            this.H = H;
            this.I = I;
            this.J = J;
            this.D = this.B(new hoverWidget_1.$VP());
            this.z = minimumSize;
            this.F = editorContextKeys_1.EditorContextKeys.hoverVisible.bindTo(contextKeyService);
            this.G = editorContextKeys_1.EditorContextKeys.hoverFocused.bindTo(contextKeyService);
            dom.$0O(this.c.domNode, this.D.containerDomNode);
            this.c.domNode.style.zIndex = '50';
            this.B(this.h.onDidLayoutChange(() => this.db()));
            this.B(this.h.onDidChangeConfiguration((e) => {
                if (e.hasChanged(50 /* EditorOption.fontInfo */)) {
                    this.eb();
                }
            }));
            const focusTracker = this.B(dom.$8O(this.c.domNode));
            this.B(focusTracker.onDidFocus(() => {
                this.G.set(true);
            }));
            this.B(focusTracker.onDidBlur(() => {
                this.G.set(false);
            }));
            this.cb(undefined);
            this.db();
            this.h.addContentWidget(this);
        }
        dispose() {
            super.dispose();
            this.u?.disposables.dispose();
            this.h.removeContentWidget(this);
        }
        getId() {
            return $34_1.ID;
        }
        static L(container, width, height) {
            const transformedWidth = typeof width === 'number' ? `${width}px` : width;
            const transformedHeight = typeof height === 'number' ? `${height}px` : height;
            container.style.width = transformedWidth;
            container.style.height = transformedHeight;
        }
        M(width, height) {
            const contentsDomNode = this.D.contentsDomNode;
            return $34_1.L(contentsDomNode, width, height);
        }
        N(width, height) {
            const containerDomNode = this.D.containerDomNode;
            return $34_1.L(containerDomNode, width, height);
        }
        O(width, height) {
            this.M(width, height);
            this.N(width, height);
            this.gb();
        }
        static P(container, width, height) {
            const transformedWidth = typeof width === 'number' ? `${width}px` : width;
            const transformedHeight = typeof height === 'number' ? `${height}px` : height;
            container.style.maxWidth = transformedWidth;
            container.style.maxHeight = transformedHeight;
        }
        Q(width, height) {
            $34_1.P(this.D.contentsDomNode, width, height);
            $34_1.P(this.D.containerDomNode, width, height);
            this.D.containerDomNode.style.setProperty('--vscode-hover-maxWidth', typeof width === 'number' ? `${width}px` : width);
            this.gb();
        }
        R() {
            const scrollDimensions = this.D.scrollbar.getScrollDimensions();
            const hasHorizontalScrollbar = scrollDimensions.scrollWidth > scrollDimensions.width;
            return hasHorizontalScrollbar;
        }
        S() {
            const contentsDomNode = this.D.contentsDomNode;
            const extraBottomPadding = `${this.D.scrollbar.options.horizontalScrollbarSize}px`;
            if (contentsDomNode.style.paddingBottom !== extraBottomPadding) {
                contentsDomNode.style.paddingBottom = extraBottomPadding;
            }
        }
        U(size) {
            this.Q('none', 'none');
            const width = size.width;
            const height = size.height;
            this.O(width, height);
            // measure if widget has horizontal scrollbar after setting the dimensions
            if (this.R()) {
                this.S();
                this.M(width, height - SCROLLBAR_WIDTH);
            }
        }
        W() {
            const maxRenderingWidth = this.bb() ?? Infinity;
            const maxRenderingHeight = this.Z() ?? Infinity;
            this.c.maxSize = new dom.$BO(maxRenderingWidth, maxRenderingHeight);
            this.Q(maxRenderingWidth, maxRenderingHeight);
        }
        s(size) {
            $34_1.t = new dom.$BO(size.width, size.height);
            this.U(size);
            this.c.layout(size.height, size.width);
            this.W();
            this.D.scrollbar.scanDomNode();
            this.h.layoutContentWidget(this);
            this.u?.colorPicker?.layout();
        }
        Y() {
            const position = this.u?.showAtPosition;
            if (!position) {
                return;
            }
            return this.w === 1 /* ContentWidgetPositionPreference.ABOVE */ ? this.j(position) : this.n(position);
        }
        Z() {
            const availableSpace = this.Y();
            if (!availableSpace) {
                return;
            }
            // Padding needed in order to stop the resizing down to a smaller height
            let maximumHeight = CONTAINER_HEIGHT_PADDING;
            Array.from(this.D.contentsDomNode.children).forEach((hoverPart) => {
                maximumHeight += hoverPart.clientHeight;
            });
            if (this.R()) {
                maximumHeight += SCROLLBAR_WIDTH;
            }
            return Math.min(availableSpace, maximumHeight);
        }
        ab() {
            // To find out if the text is overflowing, we will disable wrapping, check the widths, and then re-enable wrapping
            this.D.containerDomNode.style.setProperty('--vscode-hover-whiteSpace', 'nowrap');
            this.D.containerDomNode.style.setProperty('--vscode-hover-sourceWhiteSpace', 'nowrap');
            const overflowing = Array.from(this.D.contentsDomNode.children).some((hoverElement) => {
                return hoverElement.scrollWidth > hoverElement.clientWidth;
            });
            this.D.containerDomNode.style.removeProperty('--vscode-hover-whiteSpace');
            this.D.containerDomNode.style.removeProperty('--vscode-hover-sourceWhiteSpace');
            return overflowing;
        }
        bb() {
            if (!this.h || !this.h.hasModel()) {
                return;
            }
            const overflowing = this.ab();
            const initialWidth = (typeof this.C === 'undefined'
                ? 0
                : this.C - 2 // - 2 for the borders
            );
            if (overflowing || this.D.containerDomNode.clientWidth < initialWidth) {
                const bodyBoxWidth = dom.$AO(this.D.containerDomNode.ownerDocument.body).width;
                const horizontalPadding = 14;
                return bodyBoxWidth - horizontalPadding;
            }
            else {
                return this.D.containerDomNode.clientWidth + 2;
            }
        }
        isMouseGettingCloser(posx, posy) {
            if (!this.u) {
                return false;
            }
            if (typeof this.u.initialMousePosX === 'undefined' || typeof this.u.initialMousePosY === 'undefined') {
                this.u.initialMousePosX = posx;
                this.u.initialMousePosY = posy;
                return false;
            }
            const widgetRect = dom.$FO(this.getDomNode());
            if (typeof this.u.closestMouseDistance === 'undefined') {
                this.u.closestMouseDistance = computeDistanceFromPointToRectangle(this.u.initialMousePosX, this.u.initialMousePosY, widgetRect.left, widgetRect.top, widgetRect.width, widgetRect.height);
            }
            const distance = computeDistanceFromPointToRectangle(posx, posy, widgetRect.left, widgetRect.top, widgetRect.width, widgetRect.height);
            if (distance > this.u.closestMouseDistance + 4 /* tolerance of 4 pixels */) {
                // The mouse is getting farther away
                return false;
            }
            this.u.closestMouseDistance = Math.min(this.u.closestMouseDistance, distance);
            return true;
        }
        cb(hoverData) {
            this.u?.disposables.dispose();
            this.u = hoverData;
            this.F.set(!!hoverData);
            this.D.containerDomNode.classList.toggle('hidden', !hoverData);
        }
        db() {
            const { fontSize, lineHeight } = this.h.getOption(50 /* EditorOption.fontInfo */);
            const contentsDomNode = this.D.contentsDomNode;
            contentsDomNode.style.fontSize = `${fontSize}px`;
            contentsDomNode.style.lineHeight = `${lineHeight / fontSize}`;
            this.hb();
        }
        eb() {
            const codeClasses = Array.prototype.slice.call(this.D.contentsDomNode.getElementsByClassName('code'));
            codeClasses.forEach(node => this.h.applyFontInfo(node));
        }
        fb(node) {
            const contentsDomNode = this.D.contentsDomNode;
            contentsDomNode.style.paddingBottom = '';
            contentsDomNode.textContent = '';
            contentsDomNode.appendChild(node);
        }
        gb() {
            this.h.layoutContentWidget(this);
            this.D.onContentsChanged();
        }
        hb() {
            const height = Math.max(this.h.getLayoutInfo().height / 4, 250, $34_1.t.height);
            const width = Math.max(this.h.getLayoutInfo().width * 0.66, 500, $34_1.t.width);
            this.Q(width, height);
        }
        ib(node, hoverData) {
            this.cb(hoverData);
            this.eb();
            this.fb(node);
            this.hb();
            this.onContentsChanged();
            // Simply force a synchronous render on the editor
            // such that the widget does not really render with left = '0px'
            this.h.render();
        }
        getPosition() {
            if (!this.u) {
                return null;
            }
            return {
                position: this.u.showAtPosition,
                secondaryPosition: this.u.showAtSecondaryPosition,
                positionAffinity: this.u.isBeforeContent ? 3 /* PositionAffinity.LeftOfInjectedText */ : undefined,
                preference: [this.w ?? 1 /* ContentWidgetPositionPreference.ABOVE */]
            };
        }
        showAt(node, hoverData) {
            if (!this.h || !this.h.hasModel()) {
                return;
            }
            this.ib(node, hoverData);
            const widgetHeight = dom.$LO(this.D.containerDomNode);
            const widgetPosition = hoverData.showAtPosition;
            this.w = this.r(widgetHeight, widgetPosition) ?? 1 /* ContentWidgetPositionPreference.ABOVE */;
            // See https://github.com/microsoft/vscode/issues/140339
            // TODO: Doing a second layout of the hover after force rendering the editor
            this.onContentsChanged();
            if (hoverData.stoleFocus) {
                this.D.containerDomNode.focus();
            }
            hoverData.colorPicker?.layout();
            // The aria label overrides the label, so if we add to it, add the contents of the hover
            const accessibleViewHint = (0, hoverWidget_1.$XP)(this.H.getValue('accessibility.verbosity.hover') === true && this.I.isScreenReaderOptimized(), this.J.lookupKeybinding('editor.action.accessibleView')?.getAriaLabel() ?? '');
            if (accessibleViewHint) {
                this.D.contentsDomNode.ariaLabel = this.D.contentsDomNode.textContent + ', ' + accessibleViewHint;
            }
        }
        hide() {
            if (!this.u) {
                return;
            }
            const stoleFocus = this.u.stoleFocus || this.G.get();
            this.cb(undefined);
            this.c.maxSize = new dom.$BO(Infinity, Infinity);
            this.c.clearSashHoverState();
            this.G.set(false);
            this.h.layoutContentWidget(this);
            if (stoleFocus) {
                this.h.focus();
            }
        }
        jb() {
            // Added because otherwise the initial size of the hover content is smaller than should be
            const layoutInfo = this.h.getLayoutInfo();
            this.c.layout(layoutInfo.height, layoutInfo.width);
            this.O('auto', 'auto');
        }
        kb(height) {
            const containerDomNode = this.D.containerDomNode;
            const contentsDomNode = this.D.contentsDomNode;
            const maxRenderingHeight = this.Z() ?? Infinity;
            this.N(dom.$HO(containerDomNode), Math.min(maxRenderingHeight, height));
            this.M(dom.$HO(contentsDomNode), Math.min(maxRenderingHeight, height - SCROLLBAR_WIDTH));
        }
        setMinimumDimensions(dimensions) {
            // We combine the new minimum dimensions with the previous ones
            this.z = new dom.$BO(Math.max(this.z.width, dimensions.width), Math.max(this.z.height, dimensions.height));
            this.lb();
        }
        lb() {
            const width = (typeof this.C === 'undefined'
                ? this.z.width
                : Math.min(this.C, this.z.width));
            // We want to avoid that the hover is artificially large, so we use the content width as minimum width
            this.c.minSize = new dom.$BO(width, this.z.height);
        }
        onContentsChanged() {
            this.jb();
            const containerDomNode = this.D.containerDomNode;
            let height = dom.$LO(containerDomNode);
            let width = dom.$HO(containerDomNode);
            this.c.layout(height, width);
            this.O(width, height);
            height = dom.$LO(containerDomNode);
            width = dom.$HO(containerDomNode);
            this.C = width;
            this.lb();
            this.c.layout(height, width);
            if (this.R()) {
                this.S();
                this.kb(height);
            }
            if (this.u?.showAtPosition) {
                const widgetHeight = dom.$LO(this.D.containerDomNode);
                this.w = this.r(widgetHeight, this.u.showAtPosition);
            }
            this.gb();
        }
        focus() {
            this.D.containerDomNode.focus();
        }
        scrollUp() {
            const scrollTop = this.D.scrollbar.getScrollPosition().scrollTop;
            const fontInfo = this.h.getOption(50 /* EditorOption.fontInfo */);
            this.D.scrollbar.setScrollPosition({ scrollTop: scrollTop - fontInfo.lineHeight });
        }
        scrollDown() {
            const scrollTop = this.D.scrollbar.getScrollPosition().scrollTop;
            const fontInfo = this.h.getOption(50 /* EditorOption.fontInfo */);
            this.D.scrollbar.setScrollPosition({ scrollTop: scrollTop + fontInfo.lineHeight });
        }
        scrollLeft() {
            const scrollLeft = this.D.scrollbar.getScrollPosition().scrollLeft;
            this.D.scrollbar.setScrollPosition({ scrollLeft: scrollLeft - HORIZONTAL_SCROLLING_BY });
        }
        scrollRight() {
            const scrollLeft = this.D.scrollbar.getScrollPosition().scrollLeft;
            this.D.scrollbar.setScrollPosition({ scrollLeft: scrollLeft + HORIZONTAL_SCROLLING_BY });
        }
        pageUp() {
            const scrollTop = this.D.scrollbar.getScrollPosition().scrollTop;
            const scrollHeight = this.D.scrollbar.getScrollDimensions().height;
            this.D.scrollbar.setScrollPosition({ scrollTop: scrollTop - scrollHeight });
        }
        pageDown() {
            const scrollTop = this.D.scrollbar.getScrollPosition().scrollTop;
            const scrollHeight = this.D.scrollbar.getScrollDimensions().height;
            this.D.scrollbar.setScrollPosition({ scrollTop: scrollTop + scrollHeight });
        }
        goToTop() {
            this.D.scrollbar.setScrollPosition({ scrollTop: 0 });
        }
        goToBottom() {
            this.D.scrollbar.setScrollPosition({ scrollTop: this.D.scrollbar.getScrollDimensions().scrollHeight });
        }
    };
    exports.$34 = $34;
    exports.$34 = $34 = $34_1 = __decorate([
        __param(1, contextkey_1.$3i),
        __param(2, configuration_1.$8h),
        __param(3, accessibility_1.$1r),
        __param(4, keybinding_1.$2D)
    ], $34);
    let $44 = class $44 extends lifecycle_1.$kc {
        get hasContent() {
            return this.f;
        }
        constructor(g) {
            super();
            this.g = g;
            this.f = false;
            this.hoverElement = $('div.hover-row.status-bar');
            this.c = dom.$0O(this.hoverElement, $('div.actions'));
        }
        addAction(actionOptions) {
            const keybinding = this.g.lookupKeybinding(actionOptions.commandId);
            const keybindingLabel = keybinding ? keybinding.getLabel() : null;
            this.f = true;
            return this.B(hoverWidget_1.$WP.render(this.c, actionOptions, keybindingLabel));
        }
        append(element) {
            const result = dom.$0O(this.c, element);
            this.f = true;
            return result;
        }
    };
    exports.$44 = $44;
    exports.$44 = $44 = __decorate([
        __param(0, keybinding_1.$2D)
    ], $44);
    class ContentHoverComputer {
        get anchor() { return this.c; }
        set anchor(value) { this.c = value; }
        get shouldFocus() { return this.f; }
        set shouldFocus(value) { this.f = value; }
        get source() { return this.g; }
        set source(value) { this.g = value; }
        get insistOnKeepingHoverVisible() { return this.h; }
        set insistOnKeepingHoverVisible(value) { this.h = value; }
        constructor(i, j) {
            this.i = i;
            this.j = j;
            this.c = null;
            this.f = false;
            this.g = 0 /* HoverStartSource.Mouse */;
            this.h = false;
        }
        static k(editor, anchor) {
            if (anchor.type !== 1 /* HoverAnchorType.Range */ && !anchor.supportsMarkerHover) {
                return [];
            }
            const model = editor.getModel();
            const lineNumber = anchor.range.startLineNumber;
            if (lineNumber > model.getLineCount()) {
                // invalid line
                return [];
            }
            const maxColumn = model.getLineMaxColumn(lineNumber);
            return editor.getLineDecorations(lineNumber).filter((d) => {
                if (d.options.isWholeLine) {
                    return true;
                }
                const startColumn = (d.range.startLineNumber === lineNumber) ? d.range.startColumn : 1;
                const endColumn = (d.range.endLineNumber === lineNumber) ? d.range.endColumn : maxColumn;
                if (d.options.showIfCollapsed) {
                    // Relax check around `showIfCollapsed` decorations to also include +/- 1 character
                    if (startColumn > anchor.range.startColumn + 1 || anchor.range.endColumn - 1 > endColumn) {
                        return false;
                    }
                }
                else {
                    if (startColumn > anchor.range.startColumn || anchor.range.endColumn > endColumn) {
                        return false;
                    }
                }
                return true;
            });
        }
        computeAsync(token) {
            const anchor = this.c;
            if (!this.i.hasModel() || !anchor) {
                return async_1.$3g.EMPTY;
            }
            const lineDecorations = ContentHoverComputer.k(this.i, anchor);
            return async_1.$3g.merge(this.j.map((participant) => {
                if (!participant.computeAsync) {
                    return async_1.$3g.EMPTY;
                }
                return participant.computeAsync(anchor, lineDecorations, token);
            }));
        }
        computeSync() {
            if (!this.i.hasModel() || !this.c) {
                return [];
            }
            const lineDecorations = ContentHoverComputer.k(this.i, this.c);
            let result = [];
            for (const participant of this.j) {
                result = result.concat(participant.computeSync(this.c, lineDecorations));
            }
            return (0, arrays_1.$Fb)(result);
        }
    }
    function computeDistanceFromPointToRectangle(pointX, pointY, left, top, width, height) {
        const x = (left + width / 2); // x center of rectangle
        const y = (top + height / 2); // y center of rectangle
        const dx = Math.max(Math.abs(pointX - x) - width / 2, 0);
        const dy = Math.max(Math.abs(pointY - y) - height / 2, 0);
        return Math.sqrt(dx * dx + dy * dy);
    }
});
//# sourceMappingURL=contentHover.js.map