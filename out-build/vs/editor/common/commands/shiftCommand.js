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
define(["require", "exports", "vs/base/common/strings", "vs/editor/common/core/cursorColumns", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/languages/enterAction", "vs/editor/common/languages/languageConfigurationRegistry"], function (require, exports, strings, cursorColumns_1, range_1, selection_1, enterAction_1, languageConfigurationRegistry_1) {
    "use strict";
    var $8V_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$8V = void 0;
    const repeatCache = Object.create(null);
    function cachedStringRepeat(str, count) {
        if (count <= 0) {
            return '';
        }
        if (!repeatCache[str]) {
            repeatCache[str] = ['', str];
        }
        const cache = repeatCache[str];
        for (let i = cache.length; i <= count; i++) {
            cache[i] = cache[i - 1] + str;
        }
        return cache[count];
    }
    let $8V = $8V_1 = class $8V {
        static unshiftIndent(line, column, tabSize, indentSize, insertSpaces) {
            // Determine the visible column where the content starts
            const contentStartVisibleColumn = cursorColumns_1.$mt.visibleColumnFromColumn(line, column, tabSize);
            if (insertSpaces) {
                const indent = cachedStringRepeat(' ', indentSize);
                const desiredTabStop = cursorColumns_1.$mt.prevIndentTabStop(contentStartVisibleColumn, indentSize);
                const indentCount = desiredTabStop / indentSize; // will be an integer
                return cachedStringRepeat(indent, indentCount);
            }
            else {
                const indent = '\t';
                const desiredTabStop = cursorColumns_1.$mt.prevRenderTabStop(contentStartVisibleColumn, tabSize);
                const indentCount = desiredTabStop / tabSize; // will be an integer
                return cachedStringRepeat(indent, indentCount);
            }
        }
        static shiftIndent(line, column, tabSize, indentSize, insertSpaces) {
            // Determine the visible column where the content starts
            const contentStartVisibleColumn = cursorColumns_1.$mt.visibleColumnFromColumn(line, column, tabSize);
            if (insertSpaces) {
                const indent = cachedStringRepeat(' ', indentSize);
                const desiredTabStop = cursorColumns_1.$mt.nextIndentTabStop(contentStartVisibleColumn, indentSize);
                const indentCount = desiredTabStop / indentSize; // will be an integer
                return cachedStringRepeat(indent, indentCount);
            }
            else {
                const indent = '\t';
                const desiredTabStop = cursorColumns_1.$mt.nextRenderTabStop(contentStartVisibleColumn, tabSize);
                const indentCount = desiredTabStop / tabSize; // will be an integer
                return cachedStringRepeat(indent, indentCount);
            }
        }
        constructor(range, opts, f) {
            this.f = f;
            this.a = opts;
            this.b = range;
            this.c = null;
            this.d = false;
            this.e = false;
        }
        g(builder, range, text) {
            if (this.d) {
                builder.addTrackedEditOperation(range, text);
            }
            else {
                builder.addEditOperation(range, text);
            }
        }
        getEditOperations(model, builder) {
            const startLine = this.b.startLineNumber;
            let endLine = this.b.endLineNumber;
            if (this.b.endColumn === 1 && startLine !== endLine) {
                endLine = endLine - 1;
            }
            const { tabSize, indentSize, insertSpaces } = this.a;
            const shouldIndentEmptyLines = (startLine === endLine);
            if (this.a.useTabStops) {
                // if indenting or outdenting on a whitespace only line
                if (this.b.isEmpty()) {
                    if (/^\s*$/.test(model.getLineContent(startLine))) {
                        this.d = true;
                    }
                }
                // keep track of previous line's "miss-alignment"
                let previousLineExtraSpaces = 0, extraSpaces = 0;
                for (let lineNumber = startLine; lineNumber <= endLine; lineNumber++, previousLineExtraSpaces = extraSpaces) {
                    extraSpaces = 0;
                    const lineText = model.getLineContent(lineNumber);
                    let indentationEndIndex = strings.$Be(lineText);
                    if (this.a.isUnshift && (lineText.length === 0 || indentationEndIndex === 0)) {
                        // empty line or line with no leading whitespace => nothing to do
                        continue;
                    }
                    if (!shouldIndentEmptyLines && !this.a.isUnshift && lineText.length === 0) {
                        // do not indent empty lines => nothing to do
                        continue;
                    }
                    if (indentationEndIndex === -1) {
                        // the entire line is whitespace
                        indentationEndIndex = lineText.length;
                    }
                    if (lineNumber > 1) {
                        const contentStartVisibleColumn = cursorColumns_1.$mt.visibleColumnFromColumn(lineText, indentationEndIndex + 1, tabSize);
                        if (contentStartVisibleColumn % indentSize !== 0) {
                            // The current line is "miss-aligned", so let's see if this is expected...
                            // This can only happen when it has trailing commas in the indent
                            if (model.tokenization.isCheapToTokenize(lineNumber - 1)) {
                                const enterAction = (0, enterAction_1.$7V)(this.a.autoIndent, model, new range_1.$ks(lineNumber - 1, model.getLineMaxColumn(lineNumber - 1), lineNumber - 1, model.getLineMaxColumn(lineNumber - 1)), this.f);
                                if (enterAction) {
                                    extraSpaces = previousLineExtraSpaces;
                                    if (enterAction.appendText) {
                                        for (let j = 0, lenJ = enterAction.appendText.length; j < lenJ && extraSpaces < indentSize; j++) {
                                            if (enterAction.appendText.charCodeAt(j) === 32 /* CharCode.Space */) {
                                                extraSpaces++;
                                            }
                                            else {
                                                break;
                                            }
                                        }
                                    }
                                    if (enterAction.removeText) {
                                        extraSpaces = Math.max(0, extraSpaces - enterAction.removeText);
                                    }
                                    // Act as if `prefixSpaces` is not part of the indentation
                                    for (let j = 0; j < extraSpaces; j++) {
                                        if (indentationEndIndex === 0 || lineText.charCodeAt(indentationEndIndex - 1) !== 32 /* CharCode.Space */) {
                                            break;
                                        }
                                        indentationEndIndex--;
                                    }
                                }
                            }
                        }
                    }
                    if (this.a.isUnshift && indentationEndIndex === 0) {
                        // line with no leading whitespace => nothing to do
                        continue;
                    }
                    let desiredIndent;
                    if (this.a.isUnshift) {
                        desiredIndent = $8V_1.unshiftIndent(lineText, indentationEndIndex + 1, tabSize, indentSize, insertSpaces);
                    }
                    else {
                        desiredIndent = $8V_1.shiftIndent(lineText, indentationEndIndex + 1, tabSize, indentSize, insertSpaces);
                    }
                    this.g(builder, new range_1.$ks(lineNumber, 1, lineNumber, indentationEndIndex + 1), desiredIndent);
                    if (lineNumber === startLine && !this.b.isEmpty()) {
                        // Force the startColumn to stay put because we're inserting after it
                        this.e = (this.b.startColumn <= indentationEndIndex + 1);
                    }
                }
            }
            else {
                // if indenting or outdenting on a whitespace only line
                if (!this.a.isUnshift && this.b.isEmpty() && model.getLineLength(startLine) === 0) {
                    this.d = true;
                }
                const oneIndent = (insertSpaces ? cachedStringRepeat(' ', indentSize) : '\t');
                for (let lineNumber = startLine; lineNumber <= endLine; lineNumber++) {
                    const lineText = model.getLineContent(lineNumber);
                    let indentationEndIndex = strings.$Be(lineText);
                    if (this.a.isUnshift && (lineText.length === 0 || indentationEndIndex === 0)) {
                        // empty line or line with no leading whitespace => nothing to do
                        continue;
                    }
                    if (!shouldIndentEmptyLines && !this.a.isUnshift && lineText.length === 0) {
                        // do not indent empty lines => nothing to do
                        continue;
                    }
                    if (indentationEndIndex === -1) {
                        // the entire line is whitespace
                        indentationEndIndex = lineText.length;
                    }
                    if (this.a.isUnshift && indentationEndIndex === 0) {
                        // line with no leading whitespace => nothing to do
                        continue;
                    }
                    if (this.a.isUnshift) {
                        indentationEndIndex = Math.min(indentationEndIndex, indentSize);
                        for (let i = 0; i < indentationEndIndex; i++) {
                            const chr = lineText.charCodeAt(i);
                            if (chr === 9 /* CharCode.Tab */) {
                                indentationEndIndex = i + 1;
                                break;
                            }
                        }
                        this.g(builder, new range_1.$ks(lineNumber, 1, lineNumber, indentationEndIndex + 1), '');
                    }
                    else {
                        this.g(builder, new range_1.$ks(lineNumber, 1, lineNumber, 1), oneIndent);
                        if (lineNumber === startLine && !this.b.isEmpty()) {
                            // Force the startColumn to stay put because we're inserting after it
                            this.e = (this.b.startColumn === 1);
                        }
                    }
                }
            }
            this.c = builder.trackSelection(this.b);
        }
        computeCursorState(model, helper) {
            if (this.d) {
                const lastOp = helper.getInverseEditOperations()[0];
                return new selection_1.$ms(lastOp.range.endLineNumber, lastOp.range.endColumn, lastOp.range.endLineNumber, lastOp.range.endColumn);
            }
            const result = helper.getTrackedSelection(this.c);
            if (this.e) {
                // The selection start should not move
                const initialStartColumn = this.b.startColumn;
                const resultStartColumn = result.startColumn;
                if (resultStartColumn <= initialStartColumn) {
                    return result;
                }
                if (result.getDirection() === 0 /* SelectionDirection.LTR */) {
                    return new selection_1.$ms(result.startLineNumber, initialStartColumn, result.endLineNumber, result.endColumn);
                }
                return new selection_1.$ms(result.endLineNumber, result.endColumn, result.startLineNumber, initialStartColumn);
            }
            return result;
        }
    };
    exports.$8V = $8V;
    exports.$8V = $8V = $8V_1 = __decorate([
        __param(2, languageConfigurationRegistry_1.$2t)
    ], $8V);
});
//# sourceMappingURL=shiftCommand.js.map