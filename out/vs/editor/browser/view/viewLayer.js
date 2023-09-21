/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/fastDomNode", "vs/base/browser/trustedTypes", "vs/base/common/errors", "vs/editor/common/core/stringBuilder"], function (require, exports, fastDomNode_1, trustedTypes_1, errors_1, stringBuilder_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.VisibleLinesCollection = exports.RenderedLinesCollection = void 0;
    class RenderedLinesCollection {
        constructor(createLine) {
            this._createLine = createLine;
            this._set(1, []);
        }
        flush() {
            this._set(1, []);
        }
        _set(rendLineNumberStart, lines) {
            this._lines = lines;
            this._rendLineNumberStart = rendLineNumberStart;
        }
        _get() {
            return {
                rendLineNumberStart: this._rendLineNumberStart,
                lines: this._lines
            };
        }
        /**
         * @returns Inclusive line number that is inside this collection
         */
        getStartLineNumber() {
            return this._rendLineNumberStart;
        }
        /**
         * @returns Inclusive line number that is inside this collection
         */
        getEndLineNumber() {
            return this._rendLineNumberStart + this._lines.length - 1;
        }
        getCount() {
            return this._lines.length;
        }
        getLine(lineNumber) {
            const lineIndex = lineNumber - this._rendLineNumberStart;
            if (lineIndex < 0 || lineIndex >= this._lines.length) {
                throw new errors_1.BugIndicatingError('Illegal value for lineNumber');
            }
            return this._lines[lineIndex];
        }
        /**
         * @returns Lines that were removed from this collection
         */
        onLinesDeleted(deleteFromLineNumber, deleteToLineNumber) {
            if (this.getCount() === 0) {
                // no lines
                return null;
            }
            const startLineNumber = this.getStartLineNumber();
            const endLineNumber = this.getEndLineNumber();
            if (deleteToLineNumber < startLineNumber) {
                // deleting above the viewport
                const deleteCnt = deleteToLineNumber - deleteFromLineNumber + 1;
                this._rendLineNumberStart -= deleteCnt;
                return null;
            }
            if (deleteFromLineNumber > endLineNumber) {
                // deleted below the viewport
                return null;
            }
            // Record what needs to be deleted
            let deleteStartIndex = 0;
            let deleteCount = 0;
            for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
                const lineIndex = lineNumber - this._rendLineNumberStart;
                if (deleteFromLineNumber <= lineNumber && lineNumber <= deleteToLineNumber) {
                    // this is a line to be deleted
                    if (deleteCount === 0) {
                        // this is the first line to be deleted
                        deleteStartIndex = lineIndex;
                        deleteCount = 1;
                    }
                    else {
                        deleteCount++;
                    }
                }
            }
            // Adjust this._rendLineNumberStart for lines deleted above
            if (deleteFromLineNumber < startLineNumber) {
                // Something was deleted above
                let deleteAboveCount = 0;
                if (deleteToLineNumber < startLineNumber) {
                    // the entire deleted lines are above
                    deleteAboveCount = deleteToLineNumber - deleteFromLineNumber + 1;
                }
                else {
                    deleteAboveCount = startLineNumber - deleteFromLineNumber;
                }
                this._rendLineNumberStart -= deleteAboveCount;
            }
            const deleted = this._lines.splice(deleteStartIndex, deleteCount);
            return deleted;
        }
        onLinesChanged(changeFromLineNumber, changeCount) {
            const changeToLineNumber = changeFromLineNumber + changeCount - 1;
            if (this.getCount() === 0) {
                // no lines
                return false;
            }
            const startLineNumber = this.getStartLineNumber();
            const endLineNumber = this.getEndLineNumber();
            let someoneNotified = false;
            for (let changedLineNumber = changeFromLineNumber; changedLineNumber <= changeToLineNumber; changedLineNumber++) {
                if (changedLineNumber >= startLineNumber && changedLineNumber <= endLineNumber) {
                    // Notify the line
                    this._lines[changedLineNumber - this._rendLineNumberStart].onContentChanged();
                    someoneNotified = true;
                }
            }
            return someoneNotified;
        }
        onLinesInserted(insertFromLineNumber, insertToLineNumber) {
            if (this.getCount() === 0) {
                // no lines
                return null;
            }
            const insertCnt = insertToLineNumber - insertFromLineNumber + 1;
            const startLineNumber = this.getStartLineNumber();
            const endLineNumber = this.getEndLineNumber();
            if (insertFromLineNumber <= startLineNumber) {
                // inserting above the viewport
                this._rendLineNumberStart += insertCnt;
                return null;
            }
            if (insertFromLineNumber > endLineNumber) {
                // inserting below the viewport
                return null;
            }
            if (insertCnt + insertFromLineNumber > endLineNumber) {
                // insert inside the viewport in such a way that all remaining lines are pushed outside
                const deleted = this._lines.splice(insertFromLineNumber - this._rendLineNumberStart, endLineNumber - insertFromLineNumber + 1);
                return deleted;
            }
            // insert inside the viewport, push out some lines, but not all remaining lines
            const newLines = [];
            for (let i = 0; i < insertCnt; i++) {
                newLines[i] = this._createLine();
            }
            const insertIndex = insertFromLineNumber - this._rendLineNumberStart;
            const beforeLines = this._lines.slice(0, insertIndex);
            const afterLines = this._lines.slice(insertIndex, this._lines.length - insertCnt);
            const deletedLines = this._lines.slice(this._lines.length - insertCnt, this._lines.length);
            this._lines = beforeLines.concat(newLines).concat(afterLines);
            return deletedLines;
        }
        onTokensChanged(ranges) {
            if (this.getCount() === 0) {
                // no lines
                return false;
            }
            const startLineNumber = this.getStartLineNumber();
            const endLineNumber = this.getEndLineNumber();
            let notifiedSomeone = false;
            for (let i = 0, len = ranges.length; i < len; i++) {
                const rng = ranges[i];
                if (rng.toLineNumber < startLineNumber || rng.fromLineNumber > endLineNumber) {
                    // range outside viewport
                    continue;
                }
                const from = Math.max(startLineNumber, rng.fromLineNumber);
                const to = Math.min(endLineNumber, rng.toLineNumber);
                for (let lineNumber = from; lineNumber <= to; lineNumber++) {
                    const lineIndex = lineNumber - this._rendLineNumberStart;
                    this._lines[lineIndex].onTokensChanged();
                    notifiedSomeone = true;
                }
            }
            return notifiedSomeone;
        }
    }
    exports.RenderedLinesCollection = RenderedLinesCollection;
    class VisibleLinesCollection {
        constructor(host) {
            this._host = host;
            this.domNode = this._createDomNode();
            this._linesCollection = new RenderedLinesCollection(() => this._host.createVisibleLine());
        }
        _createDomNode() {
            const domNode = (0, fastDomNode_1.createFastDomNode)(document.createElement('div'));
            domNode.setClassName('view-layer');
            domNode.setPosition('absolute');
            domNode.domNode.setAttribute('role', 'presentation');
            domNode.domNode.setAttribute('aria-hidden', 'true');
            return domNode;
        }
        // ---- begin view event handlers
        onConfigurationChanged(e) {
            if (e.hasChanged(143 /* EditorOption.layoutInfo */)) {
                return true;
            }
            return false;
        }
        onFlushed(e) {
            this._linesCollection.flush();
            // No need to clear the dom node because a full .innerHTML will occur in ViewLayerRenderer._render
            return true;
        }
        onLinesChanged(e) {
            return this._linesCollection.onLinesChanged(e.fromLineNumber, e.count);
        }
        onLinesDeleted(e) {
            const deleted = this._linesCollection.onLinesDeleted(e.fromLineNumber, e.toLineNumber);
            if (deleted) {
                // Remove from DOM
                for (let i = 0, len = deleted.length; i < len; i++) {
                    const lineDomNode = deleted[i].getDomNode();
                    if (lineDomNode) {
                        this.domNode.domNode.removeChild(lineDomNode);
                    }
                }
            }
            return true;
        }
        onLinesInserted(e) {
            const deleted = this._linesCollection.onLinesInserted(e.fromLineNumber, e.toLineNumber);
            if (deleted) {
                // Remove from DOM
                for (let i = 0, len = deleted.length; i < len; i++) {
                    const lineDomNode = deleted[i].getDomNode();
                    if (lineDomNode) {
                        this.domNode.domNode.removeChild(lineDomNode);
                    }
                }
            }
            return true;
        }
        onScrollChanged(e) {
            return e.scrollTopChanged;
        }
        onTokensChanged(e) {
            return this._linesCollection.onTokensChanged(e.ranges);
        }
        onZonesChanged(e) {
            return true;
        }
        // ---- end view event handlers
        getStartLineNumber() {
            return this._linesCollection.getStartLineNumber();
        }
        getEndLineNumber() {
            return this._linesCollection.getEndLineNumber();
        }
        getVisibleLine(lineNumber) {
            return this._linesCollection.getLine(lineNumber);
        }
        renderLines(viewportData) {
            const inp = this._linesCollection._get();
            const renderer = new ViewLayerRenderer(this.domNode.domNode, this._host, viewportData);
            const ctx = {
                rendLineNumberStart: inp.rendLineNumberStart,
                lines: inp.lines,
                linesLength: inp.lines.length
            };
            // Decide if this render will do a single update (single large .innerHTML) or many updates (inserting/removing dom nodes)
            const resCtx = renderer.render(ctx, viewportData.startLineNumber, viewportData.endLineNumber, viewportData.relativeVerticalOffset);
            this._linesCollection._set(resCtx.rendLineNumberStart, resCtx.lines);
        }
    }
    exports.VisibleLinesCollection = VisibleLinesCollection;
    class ViewLayerRenderer {
        static { this._ttPolicy = (0, trustedTypes_1.createTrustedTypesPolicy)('editorViewLayer', { createHTML: value => value }); }
        constructor(domNode, host, viewportData) {
            this.domNode = domNode;
            this.host = host;
            this.viewportData = viewportData;
        }
        render(inContext, startLineNumber, stopLineNumber, deltaTop) {
            const ctx = {
                rendLineNumberStart: inContext.rendLineNumberStart,
                lines: inContext.lines.slice(0),
                linesLength: inContext.linesLength
            };
            if ((ctx.rendLineNumberStart + ctx.linesLength - 1 < startLineNumber) || (stopLineNumber < ctx.rendLineNumberStart)) {
                // There is no overlap whatsoever
                ctx.rendLineNumberStart = startLineNumber;
                ctx.linesLength = stopLineNumber - startLineNumber + 1;
                ctx.lines = [];
                for (let x = startLineNumber; x <= stopLineNumber; x++) {
                    ctx.lines[x - startLineNumber] = this.host.createVisibleLine();
                }
                this._finishRendering(ctx, true, deltaTop);
                return ctx;
            }
            // Update lines which will remain untouched
            this._renderUntouchedLines(ctx, Math.max(startLineNumber - ctx.rendLineNumberStart, 0), Math.min(stopLineNumber - ctx.rendLineNumberStart, ctx.linesLength - 1), deltaTop, startLineNumber);
            if (ctx.rendLineNumberStart > startLineNumber) {
                // Insert lines before
                const fromLineNumber = startLineNumber;
                const toLineNumber = Math.min(stopLineNumber, ctx.rendLineNumberStart - 1);
                if (fromLineNumber <= toLineNumber) {
                    this._insertLinesBefore(ctx, fromLineNumber, toLineNumber, deltaTop, startLineNumber);
                    ctx.linesLength += toLineNumber - fromLineNumber + 1;
                }
            }
            else if (ctx.rendLineNumberStart < startLineNumber) {
                // Remove lines before
                const removeCnt = Math.min(ctx.linesLength, startLineNumber - ctx.rendLineNumberStart);
                if (removeCnt > 0) {
                    this._removeLinesBefore(ctx, removeCnt);
                    ctx.linesLength -= removeCnt;
                }
            }
            ctx.rendLineNumberStart = startLineNumber;
            if (ctx.rendLineNumberStart + ctx.linesLength - 1 < stopLineNumber) {
                // Insert lines after
                const fromLineNumber = ctx.rendLineNumberStart + ctx.linesLength;
                const toLineNumber = stopLineNumber;
                if (fromLineNumber <= toLineNumber) {
                    this._insertLinesAfter(ctx, fromLineNumber, toLineNumber, deltaTop, startLineNumber);
                    ctx.linesLength += toLineNumber - fromLineNumber + 1;
                }
            }
            else if (ctx.rendLineNumberStart + ctx.linesLength - 1 > stopLineNumber) {
                // Remove lines after
                const fromLineNumber = Math.max(0, stopLineNumber - ctx.rendLineNumberStart + 1);
                const toLineNumber = ctx.linesLength - 1;
                const removeCnt = toLineNumber - fromLineNumber + 1;
                if (removeCnt > 0) {
                    this._removeLinesAfter(ctx, removeCnt);
                    ctx.linesLength -= removeCnt;
                }
            }
            this._finishRendering(ctx, false, deltaTop);
            return ctx;
        }
        _renderUntouchedLines(ctx, startIndex, endIndex, deltaTop, deltaLN) {
            const rendLineNumberStart = ctx.rendLineNumberStart;
            const lines = ctx.lines;
            for (let i = startIndex; i <= endIndex; i++) {
                const lineNumber = rendLineNumberStart + i;
                lines[i].layoutLine(lineNumber, deltaTop[lineNumber - deltaLN]);
            }
        }
        _insertLinesBefore(ctx, fromLineNumber, toLineNumber, deltaTop, deltaLN) {
            const newLines = [];
            let newLinesLen = 0;
            for (let lineNumber = fromLineNumber; lineNumber <= toLineNumber; lineNumber++) {
                newLines[newLinesLen++] = this.host.createVisibleLine();
            }
            ctx.lines = newLines.concat(ctx.lines);
        }
        _removeLinesBefore(ctx, removeCount) {
            for (let i = 0; i < removeCount; i++) {
                const lineDomNode = ctx.lines[i].getDomNode();
                if (lineDomNode) {
                    this.domNode.removeChild(lineDomNode);
                }
            }
            ctx.lines.splice(0, removeCount);
        }
        _insertLinesAfter(ctx, fromLineNumber, toLineNumber, deltaTop, deltaLN) {
            const newLines = [];
            let newLinesLen = 0;
            for (let lineNumber = fromLineNumber; lineNumber <= toLineNumber; lineNumber++) {
                newLines[newLinesLen++] = this.host.createVisibleLine();
            }
            ctx.lines = ctx.lines.concat(newLines);
        }
        _removeLinesAfter(ctx, removeCount) {
            const removeIndex = ctx.linesLength - removeCount;
            for (let i = 0; i < removeCount; i++) {
                const lineDomNode = ctx.lines[removeIndex + i].getDomNode();
                if (lineDomNode) {
                    this.domNode.removeChild(lineDomNode);
                }
            }
            ctx.lines.splice(removeIndex, removeCount);
        }
        _finishRenderingNewLines(ctx, domNodeIsEmpty, newLinesHTML, wasNew) {
            if (ViewLayerRenderer._ttPolicy) {
                newLinesHTML = ViewLayerRenderer._ttPolicy.createHTML(newLinesHTML);
            }
            const lastChild = this.domNode.lastChild;
            if (domNodeIsEmpty || !lastChild) {
                this.domNode.innerHTML = newLinesHTML; // explains the ugly casts -> https://github.com/microsoft/vscode/issues/106396#issuecomment-692625393;
            }
            else {
                lastChild.insertAdjacentHTML('afterend', newLinesHTML);
            }
            let currChild = this.domNode.lastChild;
            for (let i = ctx.linesLength - 1; i >= 0; i--) {
                const line = ctx.lines[i];
                if (wasNew[i]) {
                    line.setDomNode(currChild);
                    currChild = currChild.previousSibling;
                }
            }
        }
        _finishRenderingInvalidLines(ctx, invalidLinesHTML, wasInvalid) {
            const hugeDomNode = document.createElement('div');
            if (ViewLayerRenderer._ttPolicy) {
                invalidLinesHTML = ViewLayerRenderer._ttPolicy.createHTML(invalidLinesHTML);
            }
            hugeDomNode.innerHTML = invalidLinesHTML;
            for (let i = 0; i < ctx.linesLength; i++) {
                const line = ctx.lines[i];
                if (wasInvalid[i]) {
                    const source = hugeDomNode.firstChild;
                    const lineDomNode = line.getDomNode();
                    lineDomNode.parentNode.replaceChild(source, lineDomNode);
                    line.setDomNode(source);
                }
            }
        }
        static { this._sb = new stringBuilder_1.StringBuilder(100000); }
        _finishRendering(ctx, domNodeIsEmpty, deltaTop) {
            const sb = ViewLayerRenderer._sb;
            const linesLength = ctx.linesLength;
            const lines = ctx.lines;
            const rendLineNumberStart = ctx.rendLineNumberStart;
            const wasNew = [];
            {
                sb.reset();
                let hadNewLine = false;
                for (let i = 0; i < linesLength; i++) {
                    const line = lines[i];
                    wasNew[i] = false;
                    const lineDomNode = line.getDomNode();
                    if (lineDomNode) {
                        // line is not new
                        continue;
                    }
                    const renderResult = line.renderLine(i + rendLineNumberStart, deltaTop[i], this.viewportData, sb);
                    if (!renderResult) {
                        // line does not need rendering
                        continue;
                    }
                    wasNew[i] = true;
                    hadNewLine = true;
                }
                if (hadNewLine) {
                    this._finishRenderingNewLines(ctx, domNodeIsEmpty, sb.build(), wasNew);
                }
            }
            {
                sb.reset();
                let hadInvalidLine = false;
                const wasInvalid = [];
                for (let i = 0; i < linesLength; i++) {
                    const line = lines[i];
                    wasInvalid[i] = false;
                    if (wasNew[i]) {
                        // line was new
                        continue;
                    }
                    const renderResult = line.renderLine(i + rendLineNumberStart, deltaTop[i], this.viewportData, sb);
                    if (!renderResult) {
                        // line does not need rendering
                        continue;
                    }
                    wasInvalid[i] = true;
                    hadInvalidLine = true;
                }
                if (hadInvalidLine) {
                    this._finishRenderingInvalidLines(ctx, sb.build(), wasInvalid);
                }
            }
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld0xheWVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2Jyb3dzZXIvdmlldy92aWV3TGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBa0NoRyxNQUFhLHVCQUF1QjtRQUtuQyxZQUFZLFVBQW1CO1lBQzlCLElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO1lBQzlCLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ2xCLENBQUM7UUFFTSxLQUFLO1lBQ1gsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDbEIsQ0FBQztRQUVELElBQUksQ0FBQyxtQkFBMkIsRUFBRSxLQUFVO1lBQzNDLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1lBQ3BCLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxtQkFBbUIsQ0FBQztRQUNqRCxDQUFDO1FBRUQsSUFBSTtZQUNILE9BQU87Z0JBQ04sbUJBQW1CLEVBQUUsSUFBSSxDQUFDLG9CQUFvQjtnQkFDOUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNO2FBQ2xCLENBQUM7UUFDSCxDQUFDO1FBRUQ7O1dBRUc7UUFDSSxrQkFBa0I7WUFDeEIsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUM7UUFDbEMsQ0FBQztRQUVEOztXQUVHO1FBQ0ksZ0JBQWdCO1lBQ3RCLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUMzRCxDQUFDO1FBRU0sUUFBUTtZQUNkLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDM0IsQ0FBQztRQUVNLE9BQU8sQ0FBQyxVQUFrQjtZQUNoQyxNQUFNLFNBQVMsR0FBRyxVQUFVLEdBQUcsSUFBSSxDQUFD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