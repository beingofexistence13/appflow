/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/editorDom", "vs/editor/browser/view/viewPart", "vs/editor/browser/viewParts/lines/viewLine", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/cursorColumns", "vs/base/browser/dom", "vs/editor/common/cursor/cursorAtomicMoveOperations"], function (require, exports, editorDom_1, viewPart_1, viewLine_1, position_1, range_1, cursorColumns_1, dom, cursorAtomicMoveOperations_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MouseTargetFactory = exports.HitTestContext = exports.MouseTarget = exports.PointerHandlerLastRenderData = void 0;
    var HitTestResultType;
    (function (HitTestResultType) {
        HitTestResultType[HitTestResultType["Unknown"] = 0] = "Unknown";
        HitTestResultType[HitTestResultType["Content"] = 1] = "Content";
    })(HitTestResultType || (HitTestResultType = {}));
    class UnknownHitTestResult {
        constructor(hitTarget = null) {
            this.hitTarget = hitTarget;
            this.type = 0 /* HitTestResultType.Unknown */;
        }
    }
    class ContentHitTestResult {
        constructor(position, spanNode, injectedText) {
            this.position = position;
            this.spanNode = spanNode;
            this.injectedText = injectedText;
            this.type = 1 /* HitTestResultType.Content */;
        }
    }
    var HitTestResult;
    (function (HitTestResult) {
        function createFromDOMInfo(ctx, spanNode, offset) {
            const position = ctx.getPositionFromDOMInfo(spanNode, offset);
            if (position) {
                return new ContentHitTestResult(position, spanNode, null);
            }
            return new UnknownHitTestResult(spanNode);
        }
        HitTestResult.createFromDOMInfo = createFromDOMInfo;
    })(HitTestResult || (HitTestResult = {}));
    class PointerHandlerLastRenderData {
        constructor(lastViewCursorsRenderData, lastTextareaPosition) {
            this.lastViewCursorsRenderData = lastViewCursorsRenderData;
            this.lastTextareaPosition = lastTextareaPosition;
        }
    }
    exports.PointerHandlerLastRenderData = PointerHandlerLastRenderData;
    class MouseTarget {
        static _deduceRage(position, range = null) {
            if (!range && position) {
                return new range_1.Range(position.lineNumber, position.column, position.lineNumber, position.column);
            }
            return range ?? null;
        }
        static createUnknown(element, mouseColumn, position) {
            return { type: 0 /* MouseTargetType.UNKNOWN */, element, mouseColumn, position, range: this._deduceRage(position) };
        }
        static createTextarea(element, mouseColumn) {
            return { type: 1 /* MouseTargetType.TEXTAREA */, element, mouseColumn, position: null, range: null };
        }
        static createMargin(type, element, mouseColumn, position, range, detail) {
            return { type, element, mouseColumn, position, range, detail };
        }
        static createViewZone(type, element, mouseColumn, position, detail) {
            return { type, element, mouseColumn, position, range: this._deduceRage(position), detail };
        }
        static createContentText(element, mouseColumn, position, range, detail) {
            return { type: 6 /* MouseTargetType.CONTENT_TEXT */, element, mouseColumn, position, range: this._deduceRage(position, range), detail };
        }
        static createContentEmpty(element, mouseColumn, position, detail) {
            return { type: 7 /* MouseTargetType.CONTENT_EMPTY */, element, mouseColumn, position, range: this._deduceRage(position), detail };
        }
        static createContentWidget(element, mouseColumn, detail) {
            return { type: 9 /* MouseTargetType.CONTENT_WIDGET */, element, mouseColumn, position: null, range: null, detail };
        }
        static createScrollbar(element, mouseColumn, position) {
            return { type: 11 /* MouseTargetType.SCROLLBAR */, element, mouseColumn, position, range: this._deduceRage(position) };
        }
        static createOverlayWidget(element, mouseColumn, detail) {
            return { type: 12 /* MouseTargetType.OVERLAY_WIDGET */, element, mouseColumn, position: null, range: null, detail };
        }
        static createOutsideEditor(mouseColumn, position, outsidePosition, outsideDistance) {
            return { type: 13 /* MouseTargetType.OUTSIDE_EDITOR */, element: null, mouseColumn, position, range: this._deduceRage(position), outsidePosition, outsideDistance };
        }
        static _typeToString(type) {
            if (type === 1 /* MouseTargetType.TEXTAREA */) {
                return 'TEXTAREA';
            }
            if (type === 2 /* MouseTargetType.GUTTER_GLYPH_MARGIN */) {
                return 'GUTTER_GLYPH_MARGIN';
            }
            if (type === 3 /* MouseTargetType.GUTTER_LINE_NUMBERS */) {
                return 'GUTTER_LINE_NUMBERS';
            }
            if (type === 4 /* MouseTargetType.GUTTER_LINE_DECORATIONS */) {
                return 'GUTTER_LINE_DECORATIONS';
            }
            if (type === 5 /* MouseTargetType.GUTTER_VIEW_ZONE */) {
                return 'GUTTER_VIEW_ZONE';
            }
            if (type === 6 /* MouseTargetType.CONTENT_TEXT */) {
                return 'CONTENT_TEXT';
            }
            if (type === 7 /* MouseTargetType.CONTENT_EMPTY */) {
                return 'CONTENT_EMPTY';
            }
            if (type === 8 /* MouseTargetType.CONTENT_VIEW_ZONE */) {
                return 'CONTENT_VIEW_ZONE';
            }
            if (type === 9 /* MouseTargetType.CONTENT_WIDGET */) {
                return 'CONTENT_WIDGET';
            }
            if (type === 10 /* MouseTargetType.OVERVIEW_RULER */) {
                return 'OVERVIEW_RULER';
            }
            if (type === 11 /* MouseTargetType.SCROLLBAR */) {
                return 'SCROLLBAR';
            }
            if (type === 12 /* MouseTargetType.OVERLAY_WIDGET */) {
                return 'OVERLAY_WIDGET';
            }
            return 'UNKNOWN';
        }
        static toString(target) {
            return this._typeToString(target.type) + ': ' + target.position + ' - ' + target.range + ' - ' + JSON.stringify(target.detail);
        }
    }
    exports.MouseTarget = MouseTarget;
    class ElementPath {
        static isTextArea(path) {
            return (path.length === 2
                && path[0] === 3 /* PartFingerprint.OverflowGuard */
                && path[1] === 6 /* PartFingerprint.TextArea */);
        }
        static isChildOfViewLines(path) {
            return (path.length >= 4
                && path[0] === 3 /* PartFingerprint.OverflowGuard */
                && path[3] === 7 /* PartFingerprint.ViewLines */);
        }
        static isStrictChildOfViewLines(path) {
            return (path.length > 4
                && path[0] === 3 /* PartFingerprint.OverflowGuard */
                && path[3] === 7 /* PartFingerprint.ViewLines */);
        }
        static isChildOfScrollableElement(path) {
            return (path.length >= 2
                && path[0] === 3 /* PartFingerprint.OverflowGuard */
                && path[1] === 5 /* PartFingerprint.ScrollableElement */);
        }
        static isChildOfMinimap(path) {
            return (path.length >= 2
                && path[0] === 3 /* PartFingerprint.OverflowGuard */
                && path[1] === 8 /* PartFingerprint.Minimap */);
        }
        static isChildOfContentWidgets(path) {
            return (path.length >= 4
                && path[0] === 3 /* PartFingerprint.OverflowGuard */
                && path[3] === 1 /* PartFingerprint.ContentWidgets */);
        }
        static isChildOfOverflowGuard(path) {
            return (path.length >= 1
                && path[0] === 3 /* PartFingerprint.OverflowGuard */);
        }
        static isChildOfOverflowingContentWidgets(path) {
            return (path.length >= 1
                && path[0] === 2 /* PartFingerprint.OverflowingContentWidgets */);
        }
        static isChildOfOverlayWidgets(path) {
            return (path.length >= 2
                && path[0] === 3 /* PartFingerprint.OverflowGuard */
                && path[1] === 4 /* PartFingerprint.OverlayWidgets */);
        }
    }
    class HitTestContext {
        constructor(context, viewHelper, lastRenderData) {
            this.viewModel = context.viewModel;
            const options = context.configuration.options;
            this.layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this.viewDomNode = viewHelper.viewDomNode;
            this.lineHeight = options.get(66 /* EditorOption.lineHeight */);
            this.stickyTabStops = options.get(115 /* EditorOption.stickyTabStops */);
            this.typicalHalfwidthCharacterWidth = options.get(50 /* EditorOption.fontInfo */).typicalHalfwidthCharacterWidth;
            this.lastRenderData = lastRenderData;
            this._context = context;
            this._viewHelper = viewHelper;
        }
        getZoneAtCoord(mouseVerticalOffset) {
            return HitTestContext.getZoneAtCoord(this._context, mouseVerticalOffset);
        }
        static getZoneAtCoord(context, mouseVerticalOffset) {
            // The target is either a view zone or the empty space after the last view-line
            const viewZoneWhitespace = context.viewLayout.getWhitespaceAtVerticalOffset(mouseVerticalOffset);
            if (viewZoneWhitespace) {
                const viewZoneMiddle = viewZoneWhitespace.verticalOffset + viewZoneWhitespace.height / 2;
                const lineCount = context.viewModel.getLineCount();
                let positionBefore = null;
                let position;
                let positionAfter = null;
                if (viewZoneWhitespace.afterLineNumber !== lineCount) {
                    // There are more lines after this view zone
                    positionAfter = new position_1.Position(viewZoneWhitespace.afterLineNumber + 1, 1);
                }
                if (viewZoneWhitespace.afterLineNumber > 0) {
                    // There are more lines above this view zone
                    positionBefore = new position_1.Position(viewZoneWhitespace.afterLineNumber, context.viewModel.getLineMaxColumn(viewZoneWhitespace.afterLineNumber));
                }
                if (positionAfter === null) {
                    position = positionBefore;
                }
                else if (positionBefore === null) {
                    position = positionAfter;
                }
                else if (mouseVerticalOffset < viewZoneMiddle) {
                    position = positionBefore;
                }
                else {
                    position = positionAfter;
                }
                return {
                    viewZoneId: viewZoneWhitespace.id,
                    afterLineNumber: viewZoneWhitespace.afterLineNumber,
                    positionBefore: positionBefore,
                    positionAfter: positionAfter,
                    position: position
                };
            }
            return null;
        }
        getFullLineRangeAtCoord(mouseVerticalOffset) {
            if (this._context.viewLayout.isAfterLines(mouseVerticalOffset)) {
                // Below the last line
                const lineNumber = this._context.viewModel.getLineCount();
                const maxLineColumn = this._context.viewModel.getLineMaxColumn(lineNumber);
                return {
                    range: new range_1.Range(lineNumber, maxLineColumn, lineNumber, maxLineColumn),
                    isAfterLines: true
                };
            }
            const lineNumber = this._context.viewLayout.getLineNumberAtVerticalOffset(mouseVerticalOffset);
            const maxLineColumn = this._context.viewModel.getLineMaxColumn(lineNumber);
            return {
                range: new range_1.Range(lineNumber, 1, lineNumber, maxLineColumn),
                isAfterLines: false
            };
        }
        getLineNumberAtVerticalOffset(mouseVerticalOffset) {
            return this._context.viewLayout.getLineNumberAtVerticalOffset(mouseVerticalOffset);
        }
        isAfterLines(mouseVerticalOffset) {
            return this._context.viewLayout.isAfterLines(mouseVerticalOffset);
        }
        isInTopPadding(mouseVerticalOffset) {
            return this._context.viewLayout.isInTopPadding(mouseVerticalOffset);
        }
        isInBottomPadding(mouseVerticalOffset) {
            return this._context.viewLayout.isInBottomPadding(mouseVerticalOffset);
        }
        getVerticalOffsetForLineNumber(lineNumber) {
            return this._context.viewLayout.getVerticalOffsetForLineNumber(lineNumber);
        }
        findAttribute(element, attr) {
            return HitTestContext._findAttribute(element, attr, this._viewHelper.viewDomNode);
        }
        static _findAttribute(element, attr, stopAt) {
            while (element && element !== element.ownerDocument.body) {
                if (element.hasAttribute && element.hasAttribute(attr)) {
                    return element.getAttribute(attr);
                }
                if (element === stopAt) {
                    return null;
                }
                element = element.parentNode;
            }
            return null;
        }
        getLineWidth(lineNumber) {
            return this._viewHelper.getLineWidth(lineNumber);
        }
        visibleRangeForPosition(lineNumber, column) {
            return this._viewHelper.visibleRangeForPosition(lineNumber, column);
        }
        getPositionFromDOMInfo(spanNode, offset) {
            return this._viewHelper.getPositionFromDOMInfo(spanNode, offset);
        }
        getCurrentScrollTop() {
            return this._context.viewLayout.getCurrentScrollTop();
        }
        getCurrentScrollLeft() {
            return this._context.viewLayout.getCurrentScrollLeft();
        }
    }
    exports.HitTestContext = HitTestContext;
    class BareHitTestRequest {
        constructor(ctx, editorPos, pos, relativePos) {
            this.editorPos = editorPos;
            this.pos = pos;
            this.relativePos = relativePos;
            this.mouseVerticalOffset = Math.max(0, ctx.getCurrentScrollTop() + this.relativePos.y);
            this.mouseContentHorizontalOffset = ctx.getCurrentScrollLeft() + this.relativePos.x - ctx.layoutInfo.contentLeft;
            this.isInMarginArea = (this.relativePos.x < ctx.layoutInfo.contentLeft && this.relativePos.x >= ctx.layoutInfo.glyphMarginLeft);
            this.isInContentArea = !this.isInMarginArea;
            this.mouseColumn = Math.max(0, MouseTargetFactory._getMouseColumn(this.mouseContentHorizontalOffset, ctx.typicalHalfwidthCharacterWidth));
        }
    }
    class HitTestRequest extends BareHitTestRequest {
        constructor(ctx, editorPos, pos, relativePos, target) {
            super(ctx, editorPos, pos, relativePos);
            this._ctx = ctx;
            if (target) {
                this.target = target;
                this.targetPath = viewPart_1.PartFingerprints.collect(target, ctx.viewDomNode);
            }
            else {
                this.target = null;
                this.targetPath = new Uint8Array(0);
            }
        }
        toString() {
            return `pos(${this.pos.x},${this.pos.y}), editorPos(${this.editorPos.x},${this.editorPos.y}), relativePos(${this.relativePos.x},${this.relativePos.y}), mouseVerticalOffset: ${this.mouseVerticalOffset}, mouseContentHorizontalOffset: ${this.mouseContentHorizontalOffset}\n\ttarget: ${this.target ? this.target.outerHTML : null}`;
        }
        _getMouseColumn(position = null) {
            if (position && position.column < this._ctx.viewModel.getLineMaxColumn(position.lineNumber)) {
                // Most likely, the line contains foreign decorations...
                return cursorColumns_1.CursorColumns.visibleColumnFromColumn(this._ctx.viewModel.getLineContent(position.lineNumber), position.column, this._ctx.viewModel.model.getOptions().tabSize) + 1;
            }
            return this.mouseColumn;
        }
        fulfillUnknown(position = null) {
            return MouseTarget.createUnknown(this.target, this._getMouseColumn(position), position);
        }
        fulfillTextarea() {
            return MouseTarget.createTextarea(this.target, this._getMouseColumn());
        }
        fulfillMargin(type, position, range, detail) {
            return MouseTarget.createMargin(type, this.target, this._getMouseColumn(position), position, range, detail);
        }
        fulfillViewZone(type, position, detail) {
            return MouseTarget.createViewZone(type, this.target, this._getMouseColumn(position), position, detail);
        }
        fulfillContentText(position, range, detail) {
            return MouseTarget.createContentText(this.target, this._getMouseColumn(position), position, range, detail);
        }
        fulfillContentEmpty(position, detail) {
            return MouseTarget.createContentEmpty(this.target, this._getMouseColumn(position), position, detail);
        }
        fulfillContentWidget(detail) {
            return MouseTarget.createContentWidget(this.target, this._getMouseColumn(), detail);
        }
        fulfillScrollbar(position) {
            return MouseTarget.createScrollbar(this.target, this._getMouseColumn(position), position);
        }
        fulfillOverlayWidget(detail) {
            return MouseTarget.createOverlayWidget(this.target, this._getMouseColumn(), detail);
        }
        withTarget(target) {
            return new HitTestRequest(this._ctx, this.editorPos, this.pos, this.relativePos, target);
        }
    }
    const EMPTY_CONTENT_AFTER_LINES = { isAfterLines: true };
    function createEmptyContentDataInLines(horizontalDistanceToText) {
        return {
            isAfterLines: false,
            horizontalDistanceToText: horizontalDistanceToText
        };
    }
    class MouseTargetFactory {
        constructor(context, viewHelper) {
            this._context = context;
            this._viewHelper = viewHelper;
        }
        mouseTargetIsWidget(e) {
            const t = e.target;
            const path = viewPart_1.PartFingerprints.collect(t, this._viewHelper.viewDomNode);
            // Is it a content widget?
            if (ElementPath.isChildOfContentWidgets(path) || ElementPath.isChildOfOverflowingContentWidgets(path)) {
                return true;
            }
            // Is it an overlay widget?
            if (ElementPath.isChildOfOverlayWidgets(path)) {
                return true;
            }
            return false;
        }
        createMouseTarget(lastRenderData, editorPos, pos, relativePos, target) {
            const ctx = new HitTestContext(this._context, this._viewHelper, lastRenderData);
            const request = new HitTestRequest(ctx, editorPos, pos, relativePos, target);
            try {
                const r = MouseTargetFactory._createMouseTarget(ctx, request, false);
                if (r.type === 6 /* MouseTargetType.CONTENT_TEXT */) {
                    // Snap to the nearest soft tab boundary if atomic soft tabs are enabled.
                    if (ctx.stickyTabStops && r.position !== null) {
                        const position = MouseTargetFactory._snapToSoftTabBoundary(r.position, ctx.viewModel);
                        const range = range_1.Range.fromPositions(position, position).plusRange(r.range);
                        return request.fulfillContentText(position, range, r.detail);
                    }
                }
                // console.log(MouseTarget.toString(r));
                return r;
            }
            catch (err) {
                // console.log(err);
                return request.fulfillUnknown();
            }
        }
        static _createMouseTarget(ctx, request, domHitTestExecuted) {
            // console.log(`${domHitTestExecuted ? '=>' : ''}CAME IN REQUEST: ${request}`);
            // First ensure the request has a target
            if (request.target === null) {
                if (domHitTestExecuted) {
                    // Still no target... and we have already executed hit test...
                    return request.fulfillUnknown();
                }
                const hitTestResult = MouseTargetFactory._doHitTest(ctx, request);
                if (hitTestResult.type === 1 /* HitTestResultType.Content */) {
                    return MouseTargetFactory.createMouseTargetFromHitTestPosition(ctx, request, hitTestResult.spanNode, hitTestResult.position, hitTestResult.injectedText);
                }
                return this._createMouseTarget(ctx, request.withTarget(hitTestResult.hitTarget), true);
            }
            // we know for a fact that request.target is not null
            const resolvedRequest = request;
            let result = null;
            if (!ElementPath.isChildOfOverflowGuard(request.targetPath) && !ElementPath.isChildOfOverflowingContentWidgets(request.targetPath)) {
                // We only render dom nodes inside the overflow guard or in the overflowing content widgets
                result = result || request.fulfillUnknown();
            }
            result = result || MouseTargetFactory._hitTestContentWidget(ctx, resolvedRequest);
            result = result || MouseTargetFactory._hitTestOverlayWidget(ctx, resolvedRequest);
            result = result || MouseTargetFactory._hitTestMinimap(ctx, resolvedRequest);
            result = result || MouseTargetFactory._hitTestScrollbarSlider(ctx, resolvedRequest);
            result = result || MouseTargetFactory._hitTestViewZone(ctx, resolvedRequest);
            result = result || MouseTargetFactory._hitTestMargin(ctx, resolvedRequest);
            result = result || MouseTargetFactory._hitTestViewCursor(ctx, resolvedRequest);
            result = result || MouseTargetFactory._hitTestTextArea(ctx, resolvedRequest);
            result = result || MouseTargetFactory._hitTestViewLines(ctx, resolvedRequest, domHitTestExecuted);
            result = result || MouseTargetFactory._hitTestScrollbar(ctx, resolvedRequest);
            return (result || request.fulfillUnknown());
        }
        static _hitTestContentWidget(ctx, request) {
            // Is it a content widget?
            if (ElementPath.isChildOfContentWidgets(request.targetPath) || ElementPath.isChildOfOverflowingContentWidgets(request.targetPath)) {
                const widgetId = ctx.findAttribute(request.target, 'widgetId');
                if (widgetId) {
                    return request.fulfillContentWidget(widgetId);
                }
                else {
                    return request.fulfillUnknown();
                }
            }
            return null;
        }
        static _hitTestOverlayWidget(ctx, request) {
            // Is it an overlay widget?
            if (ElementPath.isChildOfOverlayWidgets(request.targetPath)) {
                const widgetId = ctx.findAttribute(request.target, 'widgetId');
                if (widgetId) {
                    return request.fulfillOverlayWidget(widgetId);
                }
                else {
                    return request.fulfillUnknown();
                }
            }
            return null;
        }
        static _hitTestViewCursor(ctx, request) {
            if (request.target) {
                // Check if we've hit a painted cursor
                const lastViewCursorsRenderData = ctx.lastRenderData.lastViewCursorsRenderData;
                for (const d of lastViewCursorsRenderData) {
                    if (request.target === d.domNode) {
                        return request.fulfillContentText(d.position, null, { mightBeForeignElement: false, injectedText: null });
                    }
                }
            }
            if (request.isInContentArea) {
                // Edge has a bug when hit-testing the exact position of a cursor,
                // instead of returning the correct dom node, it returns the
                // first or last rendered view line dom node, therefore help it out
                // and first check if we are on top of a cursor
                const lastViewCursorsRenderData = ctx.lastRenderData.lastViewCursorsRenderData;
                const mouseContentHorizontalOffset = request.mouseContentHorizontalOffset;
                const mouseVerticalOffset = request.mouseVerticalOffset;
                for (const d of lastViewCursorsRenderData) {
                    if (mouseContentHorizontalOffset < d.contentLeft) {
                        // mouse position is to the left of the cursor
                        continue;
                    }
                    if (mouseContentHorizontalOffset > d.contentLeft + d.width) {
                        // mouse position is to the right of the cursor
                        continue;
                    }
                    const cursorVerticalOffset = ctx.getVerticalOffsetForLineNumber(d.position.lineNumber);
                    if (cursorVerticalOffset <= mouseVerticalOffset
                        && mouseVerticalOffset <= cursorVerticalOffset + d.height) {
                        return request.fulfillContentText(d.position, null, { mightBeForeignElement: false, injectedText: null });
                    }
                }
            }
            return null;
        }
        static _hitTestViewZone(ctx, request) {
            const viewZoneData = ctx.getZoneAtCoord(request.mouseVerticalOffset);
            if (viewZoneData) {
                const mouseTargetType = (request.isInContentArea ? 8 /* MouseTargetType.CONTENT_VIEW_ZONE */ : 5 /* MouseTargetType.GUTTER_VIEW_ZONE */);
                return request.fulfillViewZone(mouseTargetType, viewZoneData.position, viewZoneData);
            }
            return null;
        }
        static _hitTestTextArea(ctx, request) {
            // Is it the textarea?
            if (ElementPath.isTextArea(request.targetPath)) {
                if (ctx.lastRenderData.lastTextareaPosition) {
                    return request.fulfillContentText(ctx.lastRenderData.lastTextareaPosition, null, { mightBeForeignElement: false, injectedText: null });
                }
                return request.fulfillTextarea();
            }
            return null;
        }
        static _hitTestMargin(ctx, request) {
            if (request.isInMarginArea) {
                const res = ctx.getFullLineRangeAtCoord(request.mouseVerticalOffset);
                const pos = res.range.getStartPosition();
                let offset = Math.abs(request.relativePos.x);
                const detail = {
                    isAfterLines: res.isAfterLines,
                    glyphMarginLeft: ctx.layoutInfo.glyphMarginLeft,
                    glyphMarginWidth: ctx.layoutInfo.glyphMarginWidth,
                    lineNumbersWidth: ctx.layoutInfo.lineNumbersWidth,
                    offsetX: offset
                };
                offset -= ctx.layoutInfo.glyphMarginLeft;
                if (offset <= ctx.layoutInfo.glyphMarginWidth) {
                    // On the glyph margin
                    return request.fulfillMargin(2 /* MouseTargetType.GUTTER_GLYPH_MARGIN */, pos, res.range, detail);
                }
                offset -= ctx.layoutInfo.glyphMarginWidth;
                if (offset <= ctx.layoutInfo.lineNumbersWidth) {
                    // On the line numbers
                    return request.fulfillMargin(3 /* MouseTargetType.GUTTER_LINE_NUMBERS */, pos, res.range, detail);
                }
                offset -= ctx.layoutInfo.lineNumbersWidth;
                // On the line decorations
                return request.fulfillMargin(4 /* MouseTargetType.GUTTER_LINE_DECORATIONS */, pos, res.range, detail);
            }
            return null;
        }
        static _hitTestViewLines(ctx, request, domHitTestExecuted) {
            if (!ElementPath.isChildOfViewLines(request.targetPath)) {
                return null;
            }
            if (ctx.isInTopPadding(request.mouseVerticalOffset)) {
                return request.fulfillContentEmpty(new position_1.Position(1, 1), EMPTY_CONTENT_AFTER_LINES);
            }
            // Check if it is below any lines and any view zones
            if (ctx.isAfterLines(request.mouseVerticalOffset) || ctx.isInBottomPadding(request.mouseVerticalOffset)) {
                // This most likely indicates it happened after the last view-line
                const lineCount = ctx.viewModel.getLineCount();
                const maxLineColumn = ctx.viewModel.getLineMaxColumn(lineCount);
                return request.fulfillContentEmpty(new position_1.Position(lineCount, maxLineColumn), EMPTY_CONTENT_AFTER_LINES);
            }
            if (domHitTestExecuted) {
                // Check if we are hitting a view-line (can happen in the case of inline decorations on empty lines)
                // See https://github.com/microsoft/vscode/issues/46942
                if (ElementPath.isStrictChildOfViewLines(request.targetPath)) {
                    const lineNumber = ctx.getLineNumberAtVerticalOffset(request.mouseVerticalOffset);
                    if (ctx.viewModel.getLineLength(lineNumber) === 0) {
                        const lineWidth = ctx.getLineWidth(lineNumber);
                        const detail = createEmptyContentDataInLines(request.mouseContentHorizontalOffset - lineWidth);
                        return request.fulfillContentEmpty(new position_1.Position(lineNumber, 1), detail);
                    }
                    const lineWidth = ctx.getLineWidth(lineNumber);
                    if (request.mouseContentHorizontalOffset >= lineWidth) {
                        const detail = createEmptyContentDataInLines(request.mouseContentHorizontalOffset - lineWidth);
                        const pos = new position_1.Position(lineNumber, ctx.viewModel.getLineMaxColumn(lineNumber));
                        return request.fulfillContentEmpty(pos, detail);
                    }
                }
                // We have already executed hit test...
                return request.fulfillUnknown();
            }
            const hitTestResult = MouseTargetFactory._doHitTest(ctx, request);
            if (hitTestResult.type === 1 /* HitTestResultType.Content */) {
                return MouseTargetFactory.createMouseTargetFromHitTestPosition(ctx, request, hitTestResult.spanNode, hitTestResult.position, hitTestResult.injectedText);
            }
            return this._createMouseTarget(ctx, request.withTarget(hitTestResult.hitTarget), true);
        }
        static _hitTestMinimap(ctx, request) {
            if (ElementPath.isChildOfMinimap(request.targetPath)) {
                const possibleLineNumber = ctx.getLineNumberAtVerticalOffset(request.mouseVerticalOffset);
                const maxColumn = ctx.viewModel.getLineMaxColumn(possibleLineNumber);
                return request.fulfillScrollbar(new position_1.Position(possibleLineNumber, maxColumn));
            }
            return null;
        }
        static _hitTestScrollbarSlider(ctx, request) {
            if (ElementPath.isChildOfScrollableElement(request.targetPath)) {
                if (request.target && request.target.nodeType === 1) {
                    const className = request.target.className;
                    if (className && /\b(slider|scrollbar)\b/.test(className)) {
                        const possibleLineNumber = ctx.getLineNumberAtVerticalOffset(request.mouseVerticalOffset);
                        const maxColumn = ctx.viewModel.getLineMaxColumn(possibleLineNumber);
                        return request.fulfillScrollbar(new position_1.Position(possibleLineNumber, maxColumn));
                    }
                }
            }
            return null;
        }
        static _hitTestScrollbar(ctx, request) {
            // Is it the overview ruler?
            // Is it a child of the scrollable element?
            if (ElementPath.isChildOfScrollableElement(request.targetPath)) {
                const possibleLineNumber = ctx.getLineNumberAtVerticalOffset(request.mouseVerticalOffset);
                const maxColumn = ctx.viewModel.getLineMaxColumn(possibleLineNumber);
                return request.fulfillScrollbar(new position_1.Position(possibleLineNumber, maxColumn));
            }
            return null;
        }
        getMouseColumn(relativePos) {
            const options = this._context.configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            const mouseContentHorizontalOffset = this._context.viewLayout.getCurrentScrollLeft() + relativePos.x - layoutInfo.contentLeft;
            return MouseTargetFactory._getMouseColumn(mouseContentHorizontalOffset, options.get(50 /* EditorOption.fontInfo */).typicalHalfwidthCharacterWidth);
        }
        static _getMouseColumn(mouseContentHorizontalOffset, typicalHalfwidthCharacterWidth) {
            if (mouseContentHorizontalOffset < 0) {
                return 1;
            }
            const chars = Math.round(mouseContentHorizontalOffset / typicalHalfwidthCharacterWidth);
            return (chars + 1);
        }
        static createMouseTargetFromHitTestPosition(ctx, request, spanNode, pos, injectedText) {
            const lineNumber = pos.lineNumber;
            const column = pos.column;
            const lineWidth = ctx.getLineWidth(lineNumber);
            if (request.mouseContentHorizontalOffset > lineWidth) {
                const detail = createEmptyContentDataInLines(request.mouseContentHorizontalOffset - lineWidth);
                return request.fulfillContentEmpty(pos, detail);
            }
            const visibleRange = ctx.visibleRangeForPosition(lineNumber, column);
            if (!visibleRange) {
                return request.fulfillUnknown(pos);
            }
            const columnHorizontalOffset = visibleRange.left;
            if (Math.abs(request.mouseContentHorizontalOffset - columnHorizontalOffset) < 1) {
                return request.fulfillContentText(pos, null, { mightBeForeignElement: !!injectedText, injectedText });
            }
            const points = [];
            points.push({ offset: visibleRange.left, column: column });
            if (column > 1) {
                const visibleRange = ctx.visibleRangeForPosition(lineNumber, column - 1);
                if (visibleRange) {
                    points.push({ offset: visibleRange.left, column: column - 1 });
                }
            }
            const lineMaxColumn = ctx.viewModel.getLineMaxColumn(lineNumber);
            if (column < lineMaxColumn) {
                const visibleRange = ctx.visibleRangeForPosition(lineNumber, column + 1);
                if (visibleRange) {
                    points.push({ offset: visibleRange.left, column: column + 1 });
                }
            }
            points.sort((a, b) => a.offset - b.offset);
            const mouseCoordinates = request.pos.toClientCoordinates();
            const spanNodeClientRect = spanNode.getBoundingClientRect();
            const mouseIsOverSpanNode = (spanNodeClientRect.left <= mouseCoordinates.clientX && mouseCoordinates.clientX <= spanNodeClientRect.right);
            let rng = null;
            for (let i = 1; i < points.length; i++) {
                const prev = points[i - 1];
                const curr = points[i];
                if (prev.offset <= request.mouseContentHorizontalOffset && request.mouseContentHorizontalOffset <= curr.offset) {
                    rng = new range_1.Range(lineNumber, prev.column, lineNumber, curr.column);
                    // See https://github.com/microsoft/vscode/issues/152819
                    // Due to the use of zwj, the browser's hit test result is skewed towards the left
                    // Here we try to correct that if the mouse horizontal offset is closer to the right than the left
                    const prevDelta = Math.abs(prev.offset - request.mouseContentHorizontalOffset);
                    const nextDelta = Math.abs(curr.offset - request.mouseContentHorizontalOffset);
                    pos = (prevDelta < nextDelta
                        ? new position_1.Position(lineNumber, prev.column)
                        : new position_1.Position(lineNumber, curr.column));
                    break;
                }
            }
            return request.fulfillContentText(pos, rng, { mightBeForeignElement: !mouseIsOverSpanNode || !!injectedText, injectedText });
        }
        /**
         * Most probably WebKit browsers and Edge
         */
        static _doHitTestWithCaretRangeFromPoint(ctx, request) {
            // In Chrome, especially on Linux it is possible to click between lines,
            // so try to adjust the `hity` below so that it lands in the center of a line
            const lineNumber = ctx.getLineNumberAtVerticalOffset(request.mouseVerticalOffset);
            const lineStartVerticalOffset = ctx.getVerticalOffsetForLineNumber(lineNumber);
            const lineEndVerticalOffset = lineStartVerticalOffset + ctx.lineHeight;
            const isBelowLastLine = (lineNumber === ctx.viewModel.getLineCount()
                && request.mouseVerticalOffset > lineEndVerticalOffset);
            if (!isBelowLastLine) {
                const lineCenteredVerticalOffset = Math.floor((lineStartVerticalOffset + lineEndVerticalOffset) / 2);
                let adjustedPageY = request.pos.y + (lineCenteredVerticalOffset - request.mouseVerticalOffset);
                if (adjustedPageY <= request.editorPos.y) {
                    adjustedPageY = request.editorPos.y + 1;
                }
                if (adjustedPageY >= request.editorPos.y + request.editorPos.height) {
                    adjustedPageY = request.editorPos.y + request.editorPos.height - 1;
                }
                const adjustedPage = new editorDom_1.PageCoordinates(request.pos.x, adjustedPageY);
                const r = this._actualDoHitTestWithCaretRangeFromPoint(ctx, adjustedPage.toClientCoordinates());
                if (r.type === 1 /* HitTestResultType.Content */) {
                    return r;
                }
            }
            // Also try to hit test without the adjustment (for the edge cases that we are near the top or bottom)
            return this._actualDoHitTestWithCaretRangeFromPoint(ctx, request.pos.toClientCoordinates());
        }
        static _actualDoHitTestWithCaretRangeFromPoint(ctx, coords) {
            const shadowRoot = dom.getShadowRoot(ctx.viewDomNode);
            let range;
            if (shadowRoot) {
                if (typeof shadowRoot.caretRangeFromPoint === 'undefined') {
                    range = shadowCaretRangeFromPoint(shadowRoot, coords.clientX, coords.clientY);
                }
                else {
                    range = shadowRoot.caretRangeFromPoint(coords.clientX, coords.clientY);
                }
            }
            else {
                range = ctx.viewDomNode.ownerDocument.caretRangeFromPoint(coords.clientX, coords.clientY);
            }
            if (!range || !range.startContainer) {
                return new UnknownHitTestResult();
            }
            // Chrome always hits a TEXT_NODE, while Edge sometimes hits a token span
            const startContainer = range.startContainer;
            if (startContainer.nodeType === startContainer.TEXT_NODE) {
                // startContainer is expected to be the token text
                const parent1 = startContainer.parentNode; // expected to be the token span
                const parent2 = parent1 ? parent1.parentNode : null; // expected to be the view line container span
                const parent3 = parent2 ? parent2.parentNode : null; // expected to be the view line div
                const parent3ClassName = parent3 && parent3.nodeType === parent3.ELEMENT_NODE ? parent3.className : null;
                if (parent3ClassName === viewLine_1.ViewLine.CLASS_NAME) {
                    return HitTestResult.createFromDOMInfo(ctx, parent1, range.startOffset);
                }
                else {
                    return new UnknownHitTestResult(startContainer.parentNode);
                }
            }
            else if (startContainer.nodeType === startContainer.ELEMENT_NODE) {
                // startContainer is expected to be the token span
                const parent1 = startContainer.parentNode; // expected to be the view line container span
                const parent2 = parent1 ? parent1.parentNode : null; // expected to be the view line div
                const parent2ClassName = parent2 && parent2.nodeType === parent2.ELEMENT_NODE ? parent2.className : null;
                if (parent2ClassName === viewLine_1.ViewLine.CLASS_NAME) {
                    return HitTestResult.createFromDOMInfo(ctx, startContainer, startContainer.textContent.length);
                }
                else {
                    return new UnknownHitTestResult(startContainer);
                }
            }
            return new UnknownHitTestResult();
        }
        /**
         * Most probably Gecko
         */
        static _doHitTestWithCaretPositionFromPoint(ctx, coords) {
            const hitResult = ctx.viewDomNode.ownerDocument.caretPositionFromPoint(coords.clientX, coords.clientY);
            if (hitResult.offsetNode.nodeType === hitResult.offsetNode.TEXT_NODE) {
                // offsetNode is expected to be the token text
                const parent1 = hitResult.offsetNode.parentNode; // expected to be the token span
                const parent2 = parent1 ? parent1.parentNode : null; // expected to be the view line container span
                const parent3 = parent2 ? parent2.parentNode : null; // expected to be the view line div
                const parent3ClassName = parent3 && parent3.nodeType === parent3.ELEMENT_NODE ? parent3.className : null;
                if (parent3ClassName === viewLine_1.ViewLine.CLASS_NAME) {
                    return HitTestResult.createFromDOMInfo(ctx, hitResult.offsetNode.parentNode, hitResult.offset);
                }
                else {
                    return new UnknownHitTestResult(hitResult.offsetNode.parentNode);
                }
            }
            // For inline decorations, Gecko sometimes returns the `<span>` of the line and the offset is the `<span>` with the inline decoration
            // Some other times, it returns the `<span>` with the inline decoration
            if (hitResult.offsetNode.nodeType === hitResult.offsetNode.ELEMENT_NODE) {
                const parent1 = hitResult.offsetNode.parentNode;
                const parent1ClassName = parent1 && parent1.nodeType === parent1.ELEMENT_NODE ? parent1.className : null;
                const parent2 = parent1 ? parent1.parentNode : null;
                const parent2ClassName = parent2 && parent2.nodeType === parent2.ELEMENT_NODE ? parent2.className : null;
                if (parent1ClassName === viewLine_1.ViewLine.CLASS_NAME) {
                    // it returned the `<span>` of the line and the offset is the `<span>` with the inline decoration
                    const tokenSpan = hitResult.offsetNode.childNodes[Math.min(hitResult.offset, hitResult.offsetNode.childNodes.length - 1)];
                    if (tokenSpan) {
                        return HitTestResult.createFromDOMInfo(ctx, tokenSpan, 0);
                    }
                }
                else if (parent2ClassName === viewLine_1.ViewLine.CLASS_NAME) {
                    // it returned the `<span>` with the inline decoration
                    return HitTestResult.createFromDOMInfo(ctx, hitResult.offsetNode, 0);
                }
            }
            return new UnknownHitTestResult(hitResult.offsetNode);
        }
        static _snapToSoftTabBoundary(position, viewModel) {
            const lineContent = viewModel.getLineContent(position.lineNumber);
            const { tabSize } = viewModel.model.getOptions();
            const newPosition = cursorAtomicMoveOperations_1.AtomicTabMoveOperations.atomicPosition(lineContent, position.column - 1, tabSize, 2 /* Direction.Nearest */);
            if (newPosition !== -1) {
                return new position_1.Position(position.lineNumber, newPosition + 1);
            }
            return position;
        }
        static _doHitTest(ctx, request) {
            let result = new UnknownHitTestResult();
            if (typeof ctx.viewDomNode.ownerDocument.caretRangeFromPoint === 'function') {
                result = this._doHitTestWithCaretRangeFromPoint(ctx, request);
            }
            else if (ctx.viewDomNode.ownerDocument.caretPositionFromPoint) {
                result = this._doHitTestWithCaretPositionFromPoint(ctx, request.pos.toClientCoordinates());
            }
            if (result.type === 1 /* HitTestResultType.Content */) {
                const injectedText = ctx.viewModel.getInjectedTextAt(result.position);
                const normalizedPosition = ctx.viewModel.normalizePosition(result.position, 2 /* PositionAffinity.None */);
                if (injectedText || !normalizedPosition.equals(result.position)) {
                    result = new ContentHitTestResult(normalizedPosition, result.spanNode, injectedText);
                }
            }
            return result;
        }
    }
    exports.MouseTargetFactory = MouseTargetFactory;
    function shadowCaretRangeFromPoint(shadowRoot, x, y) {
        const range = document.createRange();
        // Get the element under the point
        let el = shadowRoot.elementFromPoint(x, y);
        if (el !== null) {
            // Get the last child of the element until its firstChild is a text node
            // This assumes that the pointer is on the right of the line, out of the tokens
            // and that we want to get the offset of the last token of the line
            while (el && el.firstChild && el.firstChild.nodeType !== el.firstChild.TEXT_NODE && el.lastChild && el.lastChild.firstChild) {
                el = el.lastChild;
            }
            // Grab its rect
            const rect = el.getBoundingClientRect();
            // And its font (the computed shorthand font property might be empty, see #3217)
            const fontStyle = window.getComputedStyle(el, null).getPropertyValue('font-style');
            const fontVariant = window.getComputedStyle(el, null).getPropertyValue('font-variant');
            const fontWeight = window.getComputedStyle(el, null).getPropertyValue('font-weight');
            const fontSize = window.getComputedStyle(el, null).getPropertyValue('font-size');
            const lineHeight = window.getComputedStyle(el, null).getPropertyValue('line-height');
            const fontFamily = window.getComputedStyle(el, null).getPropertyValue('font-family');
            const font = `${fontStyle} ${fontVariant} ${fontWeight} ${fontSize}/${lineHeight} ${fontFamily}`;
            // And also its txt content
            const text = el.innerText;
            // Position the pixel cursor at the left of the element
            let pixelCursor = rect.left;
            let offset = 0;
            let step;
            // If the point is on the right of the box put the cursor after the last character
            if (x > rect.left + rect.width) {
                offset = text.length;
            }
            else {
                const charWidthReader = CharWidthReader.getInstance();
                // Goes through all the characters of the innerText, and checks if the x of the point
                // belongs to the character.
                for (let i = 0; i < text.length + 1; i++) {
                    // The step is half the width of the character
                    step = charWidthReader.getCharWidth(text.charAt(i), font) / 2;
                    // Move to the center of the character
                    pixelCursor += step;
                    // If the x of the point is smaller that the position of the cursor, the point is over that character
                    if (x < pixelCursor) {
                        offset = i;
                        break;
                    }
                    // Move between the current character and the next
                    pixelCursor += step;
                }
            }
            // Creates a range with the text node of the element and set the offset found
            range.setStart(el.firstChild, offset);
            range.setEnd(el.firstChild, offset);
        }
        return range;
    }
    class CharWidthReader {
        static { this._INSTANCE = null; }
        static getInstance() {
            if (!CharWidthReader._INSTANCE) {
                CharWidthReader._INSTANCE = new CharWidthReader();
            }
            return CharWidthReader._INSTANCE;
        }
        constructor() {
            this._cache = {};
            this._canvas = document.createElement('canvas');
        }
        getCharWidth(char, font) {
            const cacheKey = char + font;
            if (this._cache[cacheKey]) {
                return this._cache[cacheKey];
            }
            const context = this._canvas.getContext('2d');
            context.font = font;
            const metrics = context.measureText(char);
            const width = metrics.width;
            this._cache[cacheKey] = width;
            return width;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW91c2VUYXJnZXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvYnJvd3Nlci9jb250cm9sbGVyL21vdXNlVGFyZ2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQW9CaEcsSUFBVyxpQkFHVjtJQUhELFdBQVcsaUJBQWlCO1FBQzNCLCtEQUFPLENBQUE7UUFDUCwrREFBTyxDQUFBO0lBQ1IsQ0FBQyxFQUhVLGlCQUFpQixLQUFqQixpQkFBaUIsUUFHM0I7SUFFRCxNQUFNLG9CQUFvQjtRQUV6QixZQUNVLFlBQWdDLElBQUk7WUFBcEMsY0FBUyxHQUFULFNBQVMsQ0FBMkI7WUFGckMsU0FBSSxxQ0FBNkI7UUFHdEMsQ0FBQztLQUNMO0lBRUQsTUFBTSxvQkFBb0I7UUFFekIsWUFDVSxRQUFrQixFQUNsQixRQUFxQixFQUNyQixZQUFpQztZQUZqQyxhQUFRLEdBQVIsUUFBUSxDQUFVO1lBQ2xCLGFBQVEsR0FBUixRQUFRLENBQWE7WUFDckIsaUJBQVksR0FBWixZQUFZLENBQXFCO1lBSmxDLFNBQUkscUNBQTZCO1FBS3RDLENBQUM7S0FDTDtJQUlELElBQVUsYUFBYSxDQVF0QjtJQVJELFdBQVUsYUFBYTtRQUN0QixTQUFnQixpQkFBaUIsQ0FBQyxHQUFtQixFQUFFLFFBQXFCLEVBQUUsTUFBYztZQUMzRixNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsc0JBQXNCLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzlELElBQUksUUFBUSxFQUFFO2dCQUNiLE9BQU8sSUFBSSxvQkFBb0IsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO2FBQzFEO1lBQ0QsT0FBTyxJQUFJLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzNDLENBQUM7UUFOZSwrQkFBaUIsb0JBTWhDLENBQUE7SUFDRixDQUFDLEVBUlMs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