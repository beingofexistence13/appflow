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
    var ContentHoverController_1, ContentHoverWidget_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditorHoverStatusBar = exports.ContentHoverWidget = exports.ContentHoverController = void 0;
    const $ = dom.$;
    let ContentHoverController = class ContentHoverController extends lifecycle_1.Disposable {
        static { ContentHoverController_1 = this; }
        getWidgetContent() {
            const node = this._widget.getDomNode();
            if (!node.textContent) {
                return undefined;
            }
            return node.textContent;
        }
        constructor(_editor, _instantiationService, _keybindingService) {
            super();
            this._editor = _editor;
            this._instantiationService = _instantiationService;
            this._keybindingService = _keybindingService;
            this._currentResult = null;
            this._widget = this._register(this._instantiationService.createInstance(ContentHoverWidget, this._editor));
            // Instantiate participants and sort them by `hoverOrdinal` which is relevant for rendering order.
            this._participants = [];
            for (const participant of hoverTypes_1.HoverParticipantRegistry.getAll()) {
                this._participants.push(this._instantiationService.createInstance(participant, this._editor));
            }
            this._participants.sort((p1, p2) => p1.hoverOrdinal - p2.hoverOrdinal);
            this._computer = new ContentHoverComputer(this._editor, this._participants);
            this._hoverOperation = this._register(new hoverOperation_1.HoverOperation(this._editor, this._computer));
            this._register(this._hoverOperation.onResult((result) => {
                if (!this._computer.anchor) {
                    // invalid state, ignore result
                    return;
                }
                const messages = (result.hasLoadingMessage ? this._addLoadingMessage(result.value) : result.value);
                this._withResult(new HoverResult(this._computer.anchor, messages, result.isComplete));
            }));
            this._register(dom.addStandardDisposableListener(this._widget.getDomNode(), 'keydown', (e) => {
                if (e.equals(9 /* KeyCode.Escape */)) {
                    this.hide();
                }
            }));
            this._register(languages_1.TokenizationRegistry.onDidChange(() => {
                if (this._widget.position && this._currentResult) {
                    this._setCurrentResult(this._currentResult); // render again
                }
            }));
        }
        get widget() {
            return this._widget;
        }
        /**
         * Returns true if the hover shows now or will show.
         */
        maybeShowAt(mouseEvent) {
            if (this._widget.isResizing) {
                return true;
            }
            const anchorCandidates = [];
            for (const participant of this._participants) {
                if (participant.suggestHoverAnchor) {
                    const anchor = participant.suggestHoverAnchor(mouseEvent);
                    if (anchor) {
                        anchorCandidates.push(anchor);
                    }
                }
            }
            const target = mouseEvent.target;
            if (target.type === 6 /* MouseTargetType.CONTENT_TEXT */) {
                anchorCandidates.push(new hoverTypes_1.HoverRangeAnchor(0, target.range, mouseEvent.event.posx, mouseEvent.event.posy));
            }
            if (target.type === 7 /* MouseTargetType.CONTENT_EMPTY */) {
                const epsilon = this._editor.getOption(50 /* EditorOption.fontInfo */).typicalHalfwidthCharacterWidth / 2;
                if (!target.detail.isAfterLines && typeof target.detail.horizontalDistanceToText === 'number' && target.detail.horizontalDistanceToText < epsilon) {
                    // Let hover kick in even when the mouse is technically in the empty area after a line, given the distance is small enough
                    anchorCandidates.push(new hoverTypes_1.HoverRangeAnchor(0, target.range, mouseEvent.event.posx, mouseEvent.event.posy));
                }
            }
            if (anchorCandidates.length === 0) {
                return this._startShowingOrUpdateHover(null, 0 /* HoverStartMode.Delayed */, 0 /* HoverStartSource.Mouse */, false, mouseEvent);
            }
            anchorCandidates.sort((a, b) => b.priority - a.priority);
            return this._startShowingOrUpdateHover(anchorCandidates[0], 0 /* HoverStartMode.Delayed */, 0 /* HoverStartSource.Mouse */, false, mouseEvent);
        }
        startShowingAtRange(range, mode, source, focus) {
            this._startShowingOrUpdateHover(new hoverTypes_1.HoverRangeAnchor(0, range, undefined, undefined), mode, source, focus, null);
        }
        /**
         * Returns true if the hover shows now or will show.
         */
        _startShowingOrUpdateHover(anchor, mode, source, focus, mouseEvent) {
            if (!this._widget.position || !this._currentResult) {
                // The hover is not visible
                if (anchor) {
                    this._startHoverOperationIfNecessary(anchor, mode, source, focus, false);
                    return true;
                }
                return false;
            }
            // The hover is currently visible
            const hoverIsSticky = this._editor.getOption(60 /* EditorOption.hover */).sticky;
            const isGettingCloser = (hoverIsSticky && mouseEvent && this._widget.isMouseGettingCloser(mouseEvent.event.posx, mouseEvent.event.posy));
            if (isGettingCloser) {
                // The mouse is getting closer to the hover, so we will keep the hover untouched
                // But we will kick off a hover update at the new anchor, insisting on keeping the hover visible.
                if (anchor) {
                    this._startHoverOperationIfNecessary(anchor, mode, source, focus, true);
                }
                return true;
            }
            if (!anchor) {
                this._setCurrentResult(null);
                return false;
            }
            if (anchor && this._currentResult.anchor.equals(anchor)) {
                // The widget is currently showing results for the exact same anchor, so no update is needed
                return true;
            }
            if (!anchor.canAdoptVisibleHover(this._currentResult.anchor, this._widget.position)) {
                // The new anchor is not compatible with the previous anchor
                this._setCurrentResult(null);
                this._startHoverOperationIfNecessary(anchor, mode, source, focus, false);
                return true;
            }
            // We aren't getting any closer to the hover, so we will filter existing results
            // and keep those which also apply to the new anchor.
            this._setCurrentResult(this._currentResult.filter(anchor));
            this._startHoverOperationIfNecessary(anchor, mode, source, focus, false);
            return true;
        }
        _startHoverOperationIfNecessary(anchor, mode, source, focus, insistOnKeepingHoverVisible) {
            if (this._computer.anchor && this._computer.anchor.equals(anchor)) {
                // We have to start a hover operation at the exact same anchor as before, so no work is needed
                return;
            }
            this._hoverOperation.cancel();
            this._computer.anchor = anchor;
            this._computer.shouldFocus = focus;
            this._computer.source = source;
            this._computer.insistOnKeepingHoverVisible = insistOnKeepingHoverVisible;
            this._hoverOperation.start(mode);
        }
        _setCurrentResult(hoverResult) {
            if (this._currentResult === hoverResult) {
                // avoid updating the DOM to avoid resetting the user selection
                return;
            }
            if (hoverResult && hoverResult.messages.length === 0) {
                hoverResult = null;
            }
            this._currentResult = hoverResult;
            if (this._currentResult) {
                this._renderMessages(this._currentResult.anchor, this._currentResult.messages);
            }
            else {
                this._widget.hide();
            }
        }
        hide() {
            this._computer.anchor = null;
            this._hoverOperation.cancel();
            this._setCurrentResult(null);
        }
        get isColorPickerVisible() {
            return this._widget.isColorPickerVisible;
        }
        get isVisibleFromKeyboard() {
            return this._widget.isVisibleFromKeyboard;
        }
        get isVisible() {
            return this._widget.isVisible;
        }
        get isFocused() {
            return this._widget.isFocused;
        }
        get isResizing() {
            return this._widget.isResizing;
        }
        containsNode(node) {
            return (node ? this._widget.getDomNode().contains(node) : false);
        }
        _addLoadingMessage(result) {
            if (this._computer.anchor) {
                for (const participant of this._participants) {
                    if (participant.createLoadingMessage) {
                        const loadingMessage = participant.createLoadingMessage(this._computer.anchor);
                        if (loadingMessage) {
                            return result.slice(0).concat([loadingMessage]);
                        }
                    }
                }
            }
            return result;
        }
        _withResult(hoverResult) {
            if (this._widget.position && this._currentResult && this._currentResult.isComplete) {
                // The hover is visible with a previous complete result.
                if (!hoverResult.isComplete) {
                    // Instead of rendering the new partial result, we wait for the result to be complete.
                    return;
                }
                if (this._computer.insistOnKeepingHoverVisible && hoverResult.messages.length === 0) {
                    // The hover would now hide normally, so we'll keep the previous messages
                    return;
                }
            }
            this._setCurrentResult(hoverResult);
        }
        _renderMessages(anchor, messages) {
            const { showAtPosition, showAtSecondaryPosition, highlightRange } = ContentHoverController_1.computeHoverRanges(this._editor, anchor.range, messages);
            const disposables = new lifecycle_1.DisposableStore();
            const statusBar = disposables.add(new EditorHoverStatusBar(this._keybindingService));
            const fragment = document.createDocumentFragment();
            let colorPicker = null;
            const context = {
                fragment,
                statusBar,
                setColorPicker: (widget) => colorPicker = widget,
                onContentsChanged: () => this._widget.onContentsChanged(),
                setMinimumDimensions: (dimensions) => this._widget.setMinimumDimensions(dimensions),
                hide: () => this.hide()
            };
            for (const participant of this._participants) {
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
                    const highlightDecoration = this._editor.createDecorationsCollection();
                    highlightDecoration.set([{
                            range: highlightRange,
                            options: ContentHoverController_1._DECORATION_OPTIONS
                        }]);
                    disposables.add((0, lifecycle_1.toDisposable)(() => {
                        highlightDecoration.clear();
                    }));
                }
                this._widget.showAt(fragment, new ContentHoverVisibleData(colorPicker, showAtPosition, showAtSecondaryPosition, this._editor.getOption(60 /* EditorOption.hover */).above, this._computer.shouldFocus, this._computer.source, isBeforeContent, anchor.initialMousePosX, anchor.initialMousePosY, disposables));
            }
            else {
                disposables.dispose();
            }
        }
        static { this._DECORATION_OPTIONS = textModel_1.ModelDecorationOptions.register({
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
                const anchorViewRangeStart = new position_1.Position(anchorViewRange.startLineNumber, viewModel.getLineMinColumn(anchorViewRange.startLineNumber));
                startColumnBoundary = coordinatesConverter.convertViewPositionToModelPosition(anchorViewRangeStart).column;
            }
            // The anchor range is always on a single line
            const anchorLineNumber = anchorRange.startLineNumber;
            let renderStartColumn = anchorRange.startColumn;
            let highlightRange = messages[0].range;
            let forceShowAtRange = null;
            for (const msg of messages) {
                highlightRange = range_1.Range.plusRange(highlightRange, msg.range);
                if (msg.range.startLineNumber === anchorLineNumber && msg.range.endLineNumber === anchorLineNumber) {
                    // this message has a range that is completely sitting on the line of the anchor
                    renderStartColumn = Math.max(Math.min(renderStartColumn, msg.range.startColumn), startColumnBoundary);
                }
                if (msg.forceShowAtRange) {
                    forceShowAtRange = msg.range;
                }
            }
            return {
                showAtPosition: forceShowAtRange ? forceShowAtRange.getStartPosition() : new position_1.Position(anchorLineNumber, anchorRange.startColumn),
                showAtSecondaryPosition: forceShowAtRange ? forceShowAtRange.getStartPosition() : new position_1.Position(anchorLineNumber, renderStartColumn),
                highlightRange
            };
        }
        focus() {
            this._widget.focus();
        }
        scrollUp() {
            this._widget.scrollUp();
        }
        scrollDown() {
            this._widget.scrollDown();
        }
        scrollLeft() {
            this._widget.scrollLeft();
        }
        scrollRight() {
            this._widget.scrollRight();
        }
        pageUp() {
            this._widget.pageUp();
        }
        pageDown() {
            this._widget.pageDown();
        }
        goToTop() {
            this._widget.goToTop();
        }
        goToBottom() {
            this._widget.goToBottom();
        }
    };
    exports.ContentHoverController = ContentHoverController;
    exports.ContentHoverController = ContentHoverController = ContentHoverController_1 = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, keybinding_1.IKeybindingService)
    ], ContentHoverController);
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
        constructor(original, anchor, messages, isComplete) {
            super(anchor, messages, isComplete);
            this.original = original;
        }
        filter(anchor) {
            return this.original.filter(anchor);
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
    let ContentHoverWidget = class ContentHoverWidget extends resizableContentWidget_1.ResizableContentWidget {
        static { ContentHoverWidget_1 = this; }
        static { this.ID = 'editor.contrib.resizableContentHoverWidget'; }
        static { this._lastDimensions = new dom.Dimension(0, 0); }
        get isColorPickerVisible() {
            return Boolean(this._visibleData?.colorPicker);
        }
        get isVisibleFromKeyboard() {
            return (this._visibleData?.source === 1 /* HoverStartSource.Keyboard */);
        }
        get isVisible() {
            return this._hoverVisibleKey.get() ?? false;
        }
        get isFocused() {
            return this._hoverFocusedKey.get() ?? false;
        }
        constructor(editor, contextKeyService, _configurationService, _accessibilityService, _keybindingService) {
            const minimumHeight = editor.getOption(66 /* EditorOption.lineHeight */) + 8;
            const minimumWidth = 150;
            const minimumSize = new dom.Dimension(minimumWidth, minimumHeight);
            super(editor, minimumSize);
            this._configurationService = _configurationService;
            this._accessibilityService = _accessibilityService;
            this._keybindingService = _keybindingService;
            this._hover = this._register(new hoverWidget_1.HoverWidget());
            this._minimumSize = minimumSize;
            this._hoverVisibleKey = editorContextKeys_1.EditorContextKeys.hoverVisible.bindTo(contextKeyService);
            this._hoverFocusedKey = editorContextKeys_1.EditorContextKeys.hoverFocused.bindTo(contextKeyService);
            dom.append(this._resizableNode.domNode, this._hover.containerDomNode);
            this._resizableNode.domNode.style.zIndex = '50';
            this._register(this._editor.onDidLayoutChange(() => this._layout()));
            this._register(this._editor.onDidChangeConfiguration((e) => {
                if (e.hasChanged(50 /* EditorOption.fontInfo */)) {
                    this._updateFont();
                }
            }));
            const focusTracker = this._register(dom.trackFocus(this._resizableNode.domNode));
            this._register(focusTracker.onDidFocus(() => {
                this._hoverFocusedKey.set(true);
            }));
            this._register(focusTracker.onDidBlur(() => {
                this._hoverFocusedKey.set(false);
            }));
            this._setHoverData(undefined);
            this._layout();
            this._editor.addContentWidget(this);
        }
        dispose() {
            super.dispose();
            this._visibleData?.disposables.dispose();
            this._editor.removeContentWidget(this);
        }
        getId() {
            return ContentHoverWidget_1.ID;
        }
        static _applyDimensions(container, width, height) {
            const transformedWidth = typeof width === 'number' ? `${width}px` : width;
            const transformedHeight = typeof height === 'number' ? `${height}px` : height;
            container.style.width = transformedWidth;
            container.style.height = transformedHeight;
        }
        _setContentsDomNodeDimensions(width, height) {
            const contentsDomNode = this._hover.contentsDomNode;
            return ContentHoverWidget_1._applyDimensions(contentsDomNode, width, height);
        }
        _setContainerDomNodeDimensions(width, height) {
            const containerDomNode = this._hover.containerDomNode;
            return ContentHoverWidget_1._applyDimensions(containerDomNode, width, height);
        }
        _setHoverWidgetDimensions(width, height) {
            this._setContentsDomNodeDimensions(width, height);
            this._setContainerDomNodeDimensions(width, height);
            this._layoutContentWidget();
        }
        static _applyMaxDimensions(container, width, height) {
            const transformedWidth = typeof width === 'number' ? `${width}px` : width;
            const transformedHeight = typeof height === 'number' ? `${height}px` : height;
            container.style.maxWidth = transformedWidth;
            container.style.maxHeight = transformedHeight;
        }
        _setHoverWidgetMaxDimensions(width, height) {
            ContentHoverWidget_1._applyMaxDimensions(this._hover.contentsDomNode, width, height);
            ContentHoverWidget_1._applyMaxDimensions(this._hover.containerDomNode, width, height);
            this._hover.containerDomNode.style.setProperty('--vscode-hover-maxWidth', typeof width === 'number' ? `${width}px` : width);
            this._layoutContentWidget();
        }
        _hasHorizontalScrollbar() {
            const scrollDimensions = this._hover.scrollbar.getScrollDimensions();
            const hasHorizontalScrollbar = scrollDimensions.scrollWidth > scrollDimensions.width;
            return hasHorizontalScrollbar;
        }
        _adjustContentsBottomPadding() {
            const contentsDomNode = this._hover.contentsDomNode;
            const extraBottomPadding = `${this._hover.scrollbar.options.horizontalScrollbarSize}px`;
            if (contentsDomNode.style.paddingBottom !== extraBottomPadding) {
                contentsDomNode.style.paddingBottom = extraBottomPadding;
            }
        }
        _setAdjustedHoverWidgetDimensions(size) {
            this._setHoverWidgetMaxDimensions('none', 'none');
            const width = size.width;
            const height = size.height;
            this._setHoverWidgetDimensions(width, height);
            // measure if widget has horizontal scrollbar after setting the dimensions
            if (this._hasHorizontalScrollbar()) {
                this._adjustContentsBottomPadding();
                this._setContentsDomNodeDimensions(width, height - SCROLLBAR_WIDTH);
            }
        }
        _updateResizableNodeMaxDimensions() {
            const maxRenderingWidth = this._findMaximumRenderingWidth() ?? Infinity;
            const maxRenderingHeight = this._findMaximumRenderingHeight() ?? Infinity;
            this._resizableNode.maxSize = new dom.Dimension(maxRenderingWidth, maxRenderingHeight);
            this._setHoverWidgetMaxDimensions(maxRenderingWidth, maxRenderingHeight);
        }
        _resize(size) {
            ContentHoverWidget_1._lastDimensions = new dom.Dimension(size.width, size.height);
            this._setAdjustedHoverWidgetDimensions(size);
            this._resizableNode.layout(size.height, size.width);
            this._updateResizableNodeMaxDimensions();
            this._hover.scrollbar.scanDomNode();
            this._editor.layoutContentWidget(this);
            this._visibleData?.colorPicker?.layout();
        }
        _findAvailableSpaceVertically() {
            const position = this._visibleData?.showAtPosition;
            if (!position) {
                return;
            }
            return this._positionPreference === 1 /* ContentWidgetPositionPreference.ABOVE */ ? this._availableVerticalSpaceAbove(position) : this._availableVerticalSpaceBelow(position);
        }
        _findMaximumRenderingHeight() {
            const availableSpace = this._findAvailableSpaceVertically();
            if (!availableSpace) {
                return;
            }
            // Padding needed in order to stop the resizing down to a smaller height
            let maximumHeight = CONTAINER_HEIGHT_PADDING;
            Array.from(this._hover.contentsDomNode.children).forEach((hoverPart) => {
                maximumHeight += hoverPart.clientHeight;
            });
            if (this._hasHorizontalScrollbar()) {
                maximumHeight += SCROLLBAR_WIDTH;
            }
            return Math.min(availableSpace, maximumHeight);
        }
        _isHoverTextOverflowing() {
            // To find out if the text is overflowing, we will disable wrapping, check the widths, and then re-enable wrapping
            this._hover.containerDomNode.style.setProperty('--vscode-hover-whiteSpace', 'nowrap');
            this._hover.containerDomNode.style.setProperty('--vscode-hover-sourceWhiteSpace', 'nowrap');
            const overflowing = Array.from(this._hover.contentsDomNode.children).some((hoverElement) => {
                return hoverElement.scrollWidth > hoverElement.clientWidth;
            });
            this._hover.containerDomNode.style.removeProperty('--vscode-hover-whiteSpace');
            this._hover.containerDomNode.style.removeProperty('--vscode-hover-sourceWhiteSpace');
            return overflowing;
        }
        _findMaximumRenderingWidth() {
            if (!this._editor || !this._editor.hasModel()) {
                return;
            }
            const overflowing = this._isHoverTextOverflowing();
            const initialWidth = (typeof this._contentWidth === 'undefined'
                ? 0
                : this._contentWidth - 2 // - 2 for the borders
            );
            if (overflowing || this._hover.containerDomNode.clientWidth < initialWidth) {
                const bodyBoxWidth = dom.getClientArea(this._hover.containerDomNode.ownerDocument.body).width;
                const horizontalPadding = 14;
                return bodyBoxWidth - horizontalPadding;
            }
            else {
                return this._hover.containerDomNode.clientWidth + 2;
            }
        }
        isMouseGettingCloser(posx, posy) {
            if (!this._visibleData) {
                return false;
            }
            if (typeof this._visibleData.initialMousePosX === 'undefined' || typeof this._visibleData.initialMousePosY === 'undefined') {
                this._visibleData.initialMousePosX = posx;
                this._visibleData.initialMousePosY = posy;
                return false;
            }
            const widgetRect = dom.getDomNodePagePosition(this.getDomNode());
            if (typeof this._visibleData.closestMouseDistance === 'undefined') {
                this._visibleData.closestMouseDistance = computeDistanceFromPointToRectangle(this._visibleData.initialMousePosX, this._visibleData.initialMousePosY, widgetRect.left, widgetRect.top, widgetRect.width, widgetRect.height);
            }
            const distance = computeDistanceFromPointToRectangle(posx, posy, widgetRect.left, widgetRect.top, widgetRect.width, widgetRect.height);
            if (distance > this._visibleData.closestMouseDistance + 4 /* tolerance of 4 pixels */) {
                // The mouse is getting farther away
                return false;
            }
            this._visibleData.closestMouseDistance = Math.min(this._visibleData.closestMouseDistance, distance);
            return true;
        }
        _setHoverData(hoverData) {
            this._visibleData?.disposables.dispose();
            this._visibleData = hoverData;
            this._hoverVisibleKey.set(!!hoverData);
            this._hover.containerDomNode.classList.toggle('hidden', !hoverData);
        }
        _layout() {
            const { fontSize, lineHeight } = this._editor.getOption(50 /* EditorOption.fontInfo */);
            const contentsDomNode = this._hover.contentsDomNode;
            contentsDomNode.style.fontSize = `${fontSize}px`;
            contentsDomNode.style.lineHeight = `${lineHeight / fontSize}`;
            this._updateMaxDimensions();
        }
        _updateFont() {
            const codeClasses = Array.prototype.slice.call(this._hover.contentsDomNode.getElementsByClassName('code'));
            codeClasses.forEach(node => this._editor.applyFontInfo(node));
        }
        _updateContent(node) {
            const contentsDomNode = this._hover.contentsDomNode;
            contentsDomNode.style.paddingBottom = '';
            contentsDomNode.textContent = '';
            contentsDomNode.appendChild(node);
        }
        _layoutContentWidget() {
            this._editor.layoutContentWidget(this);
            this._hover.onContentsChanged();
        }
        _updateMaxDimensions() {
            const height = Math.max(this._editor.getLayoutInfo().height / 4, 250, ContentHoverWidget_1._lastDimensions.height);
            const width = Math.max(this._editor.getLayoutInfo().width * 0.66, 500, ContentHoverWidget_1._lastDimensions.width);
            this._setHoverWidgetMaxDimensions(width, height);
        }
        _render(node, hoverData) {
            this._setHoverData(hoverData);
            this._updateFont();
            this._updateContent(node);
            this._updateMaxDimensions();
            this.onContentsChanged();
            // Simply force a synchronous render on the editor
            // such that the widget does not really render with left = '0px'
            this._editor.render();
        }
        getPosition() {
            if (!this._visibleData) {
                return null;
            }
            return {
                position: this._visibleData.showAtPosition,
                secondaryPosition: this._visibleData.showAtSecondaryPosition,
                positionAffinity: this._visibleData.isBeforeContent ? 3 /* PositionAffinity.LeftOfInjectedText */ : undefined,
                preference: [this._positionPreference ?? 1 /* ContentWidgetPositionPreference.ABOVE */]
            };
        }
        showAt(node, hoverData) {
            if (!this._editor || !this._editor.hasModel()) {
                return;
            }
            this._render(node, hoverData);
            const widgetHeight = dom.getTotalHeight(this._hover.containerDomNode);
            const widgetPosition = hoverData.showAtPosition;
            this._positionPreference = this._findPositionPreference(widgetHeight, widgetPosition) ?? 1 /* ContentWidgetPositionPreference.ABOVE */;
            // See https://github.com/microsoft/vscode/issues/140339
            // TODO: Doing a second layout of the hover after force rendering the editor
            this.onContentsChanged();
            if (hoverData.stoleFocus) {
                this._hover.containerDomNode.focus();
            }
            hoverData.colorPicker?.layout();
            // The aria label overrides the label, so if we add to it, add the contents of the hover
            const accessibleViewHint = (0, hoverWidget_1.getHoverAccessibleViewHint)(this._configurationService.getValue('accessibility.verbosity.hover') === true && this._accessibilityService.isScreenReaderOptimized(), this._keybindingService.lookupKeybinding('editor.action.accessibleView')?.getAriaLabel() ?? '');
            if (accessibleViewHint) {
                this._hover.contentsDomNode.ariaLabel = this._hover.contentsDomNode.textContent + ', ' + accessibleViewHint;
            }
        }
        hide() {
            if (!this._visibleData) {
                return;
            }
            const stoleFocus = this._visibleData.stoleFocus || this._hoverFocusedKey.get();
            this._setHoverData(undefined);
            this._resizableNode.maxSize = new dom.Dimension(Infinity, Infinity);
            this._resizableNode.clearSashHoverState();
            this._hoverFocusedKey.set(false);
            this._editor.layoutContentWidget(this);
            if (stoleFocus) {
                this._editor.focus();
            }
        }
        _removeConstraintsRenderNormally() {
            // Added because otherwise the initial size of the hover content is smaller than should be
            const layoutInfo = this._editor.getLayoutInfo();
            this._resizableNode.layout(layoutInfo.height, layoutInfo.width);
            this._setHoverWidgetDimensions('auto', 'auto');
        }
        _adjustHoverHeightForScrollbar(height) {
            const containerDomNode = this._hover.containerDomNode;
            const contentsDomNode = this._hover.contentsDomNode;
            const maxRenderingHeight = this._findMaximumRenderingHeight() ?? Infinity;
            this._setContainerDomNodeDimensions(dom.getTotalWidth(containerDomNode), Math.min(maxRenderingHeight, height));
            this._setContentsDomNodeDimensions(dom.getTotalWidth(contentsDomNode), Math.min(maxRenderingHeight, height - SCROLLBAR_WIDTH));
        }
        setMinimumDimensions(dimensions) {
            // We combine the new minimum dimensions with the previous ones
            this._minimumSize = new dom.Dimension(Math.max(this._minimumSize.width, dimensions.width), Math.max(this._minimumSize.height, dimensions.height));
            this._updateMinimumWidth();
        }
        _updateMinimumWidth() {
            const width = (typeof this._contentWidth === 'undefined'
                ? this._minimumSize.width
                : Math.min(this._contentWidth, this._minimumSize.width));
            // We want to avoid that the hover is artificially large, so we use the content width as minimum width
            this._resizableNode.minSize = new dom.Dimension(width, this._minimumSize.height);
        }
        onContentsChanged() {
            this._removeConstraintsRenderNormally();
            const containerDomNode = this._hover.containerDomNode;
            let height = dom.getTotalHeight(containerDomNode);
            let width = dom.getTotalWidth(containerDomNode);
            this._resizableNode.layout(height, width);
            this._setHoverWidgetDimensions(width, height);
            height = dom.getTotalHeight(containerDomNode);
            width = dom.getTotalWidth(containerDomNode);
            this._contentWidth = width;
            this._updateMinimumWidth();
            this._resizableNode.layout(height, width);
            if (this._hasHorizontalScrollbar()) {
                this._adjustContentsBottomPadding();
                this._adjustHoverHeightForScrollbar(height);
            }
            if (this._visibleData?.showAtPosition) {
                const widgetHeight = dom.getTotalHeight(this._hover.containerDomNode);
                this._positionPreference = this._findPositionPreference(widgetHeight, this._visibleData.showAtPosition);
            }
            this._layoutContentWidget();
        }
        focus() {
            this._hover.containerDomNode.focus();
        }
        scrollUp() {
            const scrollTop = this._hover.scrollbar.getScrollPosition().scrollTop;
            const fontInfo = this._editor.getOption(50 /* EditorOption.fontInfo */);
            this._hover.scrollbar.setScrollPosition({ scrollTop: scrollTop - fontInfo.lineHeight });
        }
        scrollDown() {
            const scrollTop = this._hover.scrollbar.getScrollPosition().scrollTop;
            const fontInfo = this._editor.getOption(50 /* EditorOption.fontInfo */);
            this._hover.scrollbar.setScrollPosition({ scrollTop: scrollTop + fontInfo.lineHeight });
        }
        scrollLeft() {
            const scrollLeft = this._hover.scrollbar.getScrollPosition().scrollLeft;
            this._hover.scrollbar.setScrollPosition({ scrollLeft: scrollLeft - HORIZONTAL_SCROLLING_BY });
        }
        scrollRight() {
            const scrollLeft = this._hover.scrollbar.getScrollPosition().scrollLeft;
            this._hover.scrollbar.setScrollPosition({ scrollLeft: scrollLeft + HORIZONTAL_SCROLLING_BY });
        }
        pageUp() {
            const scrollTop = this._hover.scrollbar.getScrollPosition().scrollTop;
            const scrollHeight = this._hover.scrollbar.getScrollDimensions().height;
            this._hover.scrollbar.setScrollPosition({ scrollTop: scrollTop - scrollHeight });
        }
        pageDown() {
            const scrollTop = this._hover.scrollbar.getScrollPosition().scrollTop;
            const scrollHeight = this._hover.scrollbar.getScrollDimensions().height;
            this._hover.scrollbar.setScrollPosition({ scrollTop: scrollTop + scrollHeight });
        }
        goToTop() {
            this._hover.scrollbar.setScrollPosition({ scrollTop: 0 });
        }
        goToBottom() {
            this._hover.scrollbar.setScrollPosition({ scrollTop: this._hover.scrollbar.getScrollDimensions().scrollHeight });
        }
    };
    exports.ContentHoverWidget = ContentHoverWidget;
    exports.ContentHoverWidget = ContentHoverWidget = ContentHoverWidget_1 = __decorate([
        __param(1, contextkey_1.IContextKeyService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, accessibility_1.IAccessibilityService),
        __param(4, keybinding_1.IKeybindingService)
    ], ContentHoverWidget);
    let EditorHoverStatusBar = class EditorHoverStatusBar extends lifecycle_1.Disposable {
        get hasContent() {
            return this._hasContent;
        }
        constructor(_keybindingService) {
            super();
            this._keybindingService = _keybindingService;
            this._hasContent = false;
            this.hoverElement = $('div.hover-row.status-bar');
            this.actionsElement = dom.append(this.hoverElement, $('div.actions'));
        }
        addAction(actionOptions) {
            const keybinding = this._keybindingService.lookupKeybinding(actionOptions.commandId);
            const keybindingLabel = keybinding ? keybinding.getLabel() : null;
            this._hasContent = true;
            return this._register(hoverWidget_1.HoverAction.render(this.actionsElement, actionOptions, keybindingLabel));
        }
        append(element) {
            const result = dom.append(this.actionsElement, element);
            this._hasContent = true;
            return result;
        }
    };
    exports.EditorHoverStatusBar = EditorHoverStatusBar;
    exports.EditorHoverStatusBar = EditorHoverStatusBar = __decorate([
        __param(0, keybinding_1.IKeybindingService)
    ], EditorHoverStatusBar);
    class ContentHoverComputer {
        get anchor() { return this._anchor; }
        set anchor(value) { this._anchor = value; }
        get shouldFocus() { return this._shouldFocus; }
        set shouldFocus(value) { this._shouldFocus = value; }
        get source() { return this._source; }
        set source(value) { this._source = value; }
        get insistOnKeepingHoverVisible() { return this._insistOnKeepingHoverVisible; }
        set insistOnKeepingHoverVisible(value) { this._insistOnKeepingHoverVisible = value; }
        constructor(_editor, _participants) {
            this._editor = _editor;
            this._participants = _participants;
            this._anchor = null;
            this._shouldFocus = false;
            this._source = 0 /* HoverStartSource.Mouse */;
            this._insistOnKeepingHoverVisible = false;
        }
        static _getLineDecorations(editor, anchor) {
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
            const anchor = this._anchor;
            if (!this._editor.hasModel() || !anchor) {
                return async_1.AsyncIterableObject.EMPTY;
            }
            const lineDecorations = ContentHoverComputer._getLineDecorations(this._editor, anchor);
            return async_1.AsyncIterableObject.merge(this._participants.map((participant) => {
                if (!participant.computeAsync) {
                    return async_1.AsyncIterableObject.EMPTY;
                }
                return participant.computeAsync(anchor, lineDecorations, token);
            }));
        }
        computeSync() {
            if (!this._editor.hasModel() || !this._anchor) {
                return [];
            }
            const lineDecorations = ContentHoverComputer._getLineDecorations(this._editor, this._anchor);
            let result = [];
            for (const participant of this._participants) {
                result = result.concat(participant.computeSync(this._anchor, lineDecorations));
            }
            return (0, arrays_1.coalesce)(result);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudEhvdmVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvaG92ZXIvYnJvd3Nlci9jb250ZW50SG92ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQTBCaEcsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUVULElBQU0sc0JBQXNCLEdBQTVCLE1BQU0sc0JBQXVCLFNBQVEsc0JBQVU7O1FBTXJELGdCQUFnQjtZQUNmLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDdkMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUU7Z0JBQ3RCLE9BQU8sU0FBUyxDQUFDO2FBQ2pCO1lBQ0QsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ3pCLENBQUM7UUFPRCxZQUNrQixPQUFvQixFQUNkLHFCQUE2RCxFQUNoRSxrQkFBdUQ7WUFFM0UsS0FBSyxFQUFFLENBQUM7WUFKUyxZQUFPLEdBQVAsT0FBTyxDQUFhO1lBQ0csMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQUMvQyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1lBTHBFLG1CQUFjLEdBQXVCLElBQUksQ0FBQztZQVNqRCxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUUzRyxrR0FBa0c7WUFDbEcsSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7WUFDeEIsS0FBSyxNQUFNLFdBQVcsSUFBSSxxQ0FBd0IsQ0FBQyxNQUFNLEVBQUUsRUFBRTtnQkFDNUQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFB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