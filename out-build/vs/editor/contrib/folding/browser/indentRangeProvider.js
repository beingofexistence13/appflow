/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/model/utils", "vs/editor/contrib/folding/browser/foldingRanges"], function (require, exports, utils_1, foldingRanges_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$r8 = exports.$q8 = exports.$p8 = void 0;
    const MAX_FOLDING_REGIONS_FOR_INDENT_DEFAULT = 5000;
    const ID_INDENT_PROVIDER = 'indent';
    class $p8 {
        constructor(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.id = ID_INDENT_PROVIDER;
        }
        dispose() { }
        compute(cancelationToken) {
            const foldingRules = this.b.getLanguageConfiguration(this.a.getLanguageId()).foldingRules;
            const offSide = foldingRules && !!foldingRules.offSide;
            const markers = foldingRules && foldingRules.markers;
            return Promise.resolve($r8(this.a, offSide, markers, this.c));
        }
    }
    exports.$p8 = $p8;
    // public only for testing
    class $q8 {
        constructor(foldingRangesLimit) {
            this.a = [];
            this.b = [];
            this.c = [];
            this.d = 0;
            this.e = foldingRangesLimit;
        }
        insertFirst(startLineNumber, endLineNumber, indent) {
            if (startLineNumber > foldingRanges_1.$_7 || endLineNumber > foldingRanges_1.$_7) {
                return;
            }
            const index = this.d;
            this.a[index] = startLineNumber;
            this.b[index] = endLineNumber;
            this.d++;
            if (indent < 1000) {
                this.c[indent] = (this.c[indent] || 0) + 1;
            }
        }
        toIndentRanges(model) {
            const limit = this.e.limit;
            if (this.d <= limit) {
                this.e.update(this.d, false);
                // reverse and create arrays of the exact length
                const startIndexes = new Uint32Array(this.d);
                const endIndexes = new Uint32Array(this.d);
                for (let i = this.d - 1, k = 0; i >= 0; i--, k++) {
                    startIndexes[k] = this.a[i];
                    endIndexes[k] = this.b[i];
                }
                return new foldingRanges_1.$a8(startIndexes, endIndexes);
            }
            else {
                this.e.update(this.d, limit);
                let entries = 0;
                let maxIndent = this.c.length;
                for (let i = 0; i < this.c.length; i++) {
                    const n = this.c[i];
                    if (n) {
                        if (n + entries > limit) {
                            maxIndent = i;
                            break;
                        }
                        entries += n;
                    }
                }
                const tabSize = model.getOptions().tabSize;
                // reverse and create arrays of the exact length
                const startIndexes = new Uint32Array(limit);
                const endIndexes = new Uint32Array(limit);
                for (let i = this.d - 1, k = 0; i >= 0; i--) {
                    const startIndex = this.a[i];
                    const lineContent = model.getLineContent(startIndex);
                    const indent = (0, utils_1.$XB)(lineContent, tabSize);
                    if (indent < maxIndent || (indent === maxIndent && entries++ < limit)) {
                        startIndexes[k] = startIndex;
                        endIndexes[k] = this.b[i];
                        k++;
                    }
                }
                return new foldingRanges_1.$a8(startIndexes, endIndexes);
            }
        }
    }
    exports.$q8 = $q8;
    const foldingRangesLimitDefault = {
        limit: MAX_FOLDING_REGIONS_FOR_INDENT_DEFAULT,
        update: () => { }
    };
    function $r8(model, offSide, markers, foldingRangesLimit = foldingRangesLimitDefault) {
        const tabSize = model.getOptions().tabSize;
        const result = new $q8(foldingRangesLimit);
        let pattern = undefined;
        if (markers) {
            pattern = new RegExp(`(${markers.start.source})|(?:${markers.end.source})`);
        }
        const previousRegions = [];
        const line = model.getLineCount() + 1;
        previousRegions.push({ indent: -1, endAbove: line, line }); // sentinel, to make sure there's at least one entry
        for (let line = model.getLineCount(); line > 0; line--) {
            const lineContent = model.getLineContent(line);
            const indent = (0, utils_1.$XB)(lineContent, tabSize);
            let previous = previousRegions[previousRegions.length - 1];
            if (indent === -1) {
                if (offSide) {
                    // for offSide languages, empty lines are associated to the previous block
                    // note: the next block is already written to the results, so this only
                    // impacts the end position of the block before
                    previous.endAbove = line;
                }
                continue; // only whitespace
            }
            let m;
            if (pattern && (m = lineContent.match(pattern))) {
                // folding pattern match
                if (m[1]) { // start pattern match
                    // discard all regions until the folding pattern
                    let i = previousRegions.length - 1;
                    while (i > 0 && previousRegions[i].indent !== -2) {
                        i--;
                    }
                    if (i > 0) {
                        previousRegions.length = i + 1;
                        previous = previousRegions[i];
                        // new folding range from pattern, includes the end line
                        result.insertFirst(line, previous.line, indent);
                        previous.line = line;
                        previous.indent = indent;
                        previous.endAbove = line;
                        continue;
                    }
                    else {
                        // no end marker found, treat line as a regular line
                    }
                }
                else { // end pattern match
                    previousRegions.push({ indent: -2, endAbove: line, line });
                    continue;
                }
            }
            if (previous.indent > indent) {
                // discard all regions with larger indent
                do {
                    previousRegions.pop();
                    previous = previousRegions[previousRegions.length - 1];
                } while (previous.indent > indent);
                // new folding range
                const endLineNumber = previous.endAbove - 1;
                if (endLineNumber - line >= 1) { // needs at east size 1
                    result.insertFirst(line, endLineNumber, indent);
                }
            }
            if (previous.indent === indent) {
                previous.endAbove = line;
            }
            else { // previous.indent < indent
                // new region with a bigger indent
                previousRegions.push({ indent, endAbove: line, line });
            }
        }
        return result.toIndentRanges(model);
    }
    exports.$r8 = $r8;
});
//# sourceMappingURL=indentRangeProvider.js.map