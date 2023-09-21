/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/diff/diff", "vs/base/common/uri", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/model/mirrorTextModel", "vs/editor/common/core/wordHelper", "vs/editor/common/languages/linkComputer", "vs/editor/common/languages/supports/inplaceReplaceSupport", "vs/editor/common/services/editorBaseApi", "vs/base/common/stopwatch", "vs/editor/common/services/unicodeTextModelHighlighter", "vs/editor/common/diff/legacyLinesDiffComputer", "vs/editor/common/diff/linesDiffComputers", "vs/base/common/objects", "vs/base/common/errors", "vs/editor/common/languages/defaultDocumentColorsComputer"], function (require, exports, diff_1, uri_1, position_1, range_1, mirrorTextModel_1, wordHelper_1, linkComputer_1, inplaceReplaceSupport_1, editorBaseApi_1, stopwatch_1, unicodeTextModelHighlighter_1, legacyLinesDiffComputer_1, linesDiffComputers_1, objects_1, errors_1, defaultDocumentColorsComputer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.create = exports.EditorSimpleWorker = void 0;
    /**
     * @internal
     */
    class MirrorModel extends mirrorTextModel_1.$Mu {
        get uri() {
            return this.d;
        }
        get eol() {
            return this.g;
        }
        getValue() {
            return this.getText();
        }
        findMatches(regex) {
            const matches = [];
            for (let i = 0; i < this.f.length; i++) {
                const line = this.f[i];
                const offsetToAdd = this.offsetAt(new position_1.$js(i + 1, 1));
                const iteratorOverMatches = line.matchAll(regex);
                for (const match of iteratorOverMatches) {
                    if (match.index || match.index === 0) {
                        match.index = match.index + offsetToAdd;
                    }
                    matches.push(match);
                }
            }
            return matches;
        }
        getLinesContent() {
            return this.f.slice(0);
        }
        getLineCount() {
            return this.f.length;
        }
        getLineContent(lineNumber) {
            return this.f[lineNumber - 1];
        }
        getWordAtPosition(position, wordDefinition) {
            const wordAtText = (0, wordHelper_1.$Zr)(position.column, (0, wordHelper_1.$Xr)(wordDefinition), this.f[position.lineNumber - 1], 0);
            if (wordAtText) {
                return new range_1.$ks(position.lineNumber, wordAtText.startColumn, position.lineNumber, wordAtText.endColumn);
            }
            return null;
        }
        getWordUntilPosition(position, wordDefinition) {
            const wordAtPosition = this.getWordAtPosition(position, wordDefinition);
            if (!wordAtPosition) {
                return {
                    word: '',
                    startColumn: position.column,
                    endColumn: position.column
                };
            }
            return {
                word: this.f[position.lineNumber - 1].substring(wordAtPosition.startColumn - 1, position.column - 1),
                startColumn: wordAtPosition.startColumn,
                endColumn: position.column
            };
        }
        words(wordDefinition) {
            const lines = this.f;
            const wordenize = this.q.bind(this);
            let lineNumber = 0;
            let lineText = '';
            let wordRangesIdx = 0;
            let wordRanges = [];
            return {
                *[Symbol.iterator]() {
                    while (true) {
                        if (wordRangesIdx < wordRanges.length) {
                            const value = lineText.substring(wordRanges[wordRangesIdx].start, wordRanges[wordRangesIdx].end);
                            wordRangesIdx += 1;
                            yield value;
                        }
                        else {
                            if (lineNumber < lines.length) {
                                lineText = lines[lineNumber];
                                wordRanges = wordenize(lineText, wordDefinition);
                                wordRangesIdx = 0;
                                lineNumber += 1;
                            }
                            else {
                                break;
                            }
                        }
                    }
                }
            };
        }
        getLineWords(lineNumber, wordDefinition) {
            const content = this.f[lineNumber - 1];
            const ranges = this.q(content, wordDefinition);
            const words = [];
            for (const range of ranges) {
                words.push({
                    word: content.substring(range.start, range.end),
                    startColumn: range.start + 1,
                    endColumn: range.end + 1
                });
            }
            return words;
        }
        q(content, wordDefinition) {
            const result = [];
            let match;
            wordDefinition.lastIndex = 0; // reset lastIndex just to be sure
            while (match = wordDefinition.exec(content)) {
                if (match[0].length === 0) {
                    // it did match the empty string
                    break;
                }
                result.push({ start: match.index, end: match.index + match[0].length });
            }
            return result;
        }
        getValueInRange(range) {
            range = this.r(range);
            if (range.startLineNumber === range.endLineNumber) {
                return this.f[range.startLineNumber - 1].substring(range.startColumn - 1, range.endColumn - 1);
            }
            const lineEnding = this.g;
            const startLineIndex = range.startLineNumber - 1;
            const endLineIndex = range.endLineNumber - 1;
            const resultLines = [];
            resultLines.push(this.f[startLineIndex].substring(range.startColumn - 1));
            for (let i = startLineIndex + 1; i < endLineIndex; i++) {
                resultLines.push(this.f[i]);
            }
            resultLines.push(this.f[endLineIndex].substring(0, range.endColumn - 1));
            return resultLines.join(lineEnding);
        }
        offsetAt(position) {
            position = this.s(position);
            this.l();
            return this.j.getPrefixSum(position.lineNumber - 2) + (position.column - 1);
        }
        positionAt(offset) {
            offset = Math.floor(offset);
            offset = Math.max(0, offset);
            this.l();
            const out = this.j.getIndexOf(offset);
            const lineLength = this.f[out.index].length;
            // Ensure we return a valid position
            return {
                lineNumber: 1 + out.index,
                column: 1 + Math.min(out.remainder, lineLength)
            };
        }
        r(range) {
            const start = this.s({ lineNumber: range.startLineNumber, column: range.startColumn });
            const end = this.s({ lineNumber: range.endLineNumber, column: range.endColumn });
            if (start.lineNumber !== range.startLineNumber
                || start.column !== range.startColumn
                || end.lineNumber !== range.endLineNumber
                || end.column !== range.endColumn) {
                return {
                    startLineNumber: start.lineNumber,
                    startColumn: start.column,
                    endLineNumber: end.lineNumber,
                    endColumn: end.column
                };
            }
            return range;
        }
        s(position) {
            if (!position_1.$js.isIPosition(position)) {
                throw new Error('bad position');
            }
            let { lineNumber, column } = position;
            let hasChanged = false;
            if (lineNumber < 1) {
                lineNumber = 1;
                column = 1;
                hasChanged = true;
            }
            else if (lineNumber > this.f.length) {
                lineNumber = this.f.length;
                column = this.f[lineNumber - 1].length + 1;
                hasChanged = true;
            }
            else {
                const maxCharacter = this.f[lineNumber - 1].length + 1;
                if (column < 1) {
                    column = 1;
                    hasChanged = true;
                }
                else if (column > maxCharacter) {
                    column = maxCharacter;
                    hasChanged = true;
                }
            }
            if (!hasChanged) {
                return position;
            }
            else {
                return { lineNumber, column };
            }
        }
    }
    /**
     * @internal
     */
    class EditorSimpleWorker {
        constructor(host, foreignModuleFactory) {
            this.d = host;
            this.f = Object.create(null);
            this.g = foreignModuleFactory;
            this.h = null;
        }
        dispose() {
            this.f = Object.create(null);
        }
        j(uri) {
            return this.f[uri];
        }
        k() {
            const all = [];
            Object.keys(this.f).forEach((key) => all.push(this.f[key]));
            return all;
        }
        acceptNewModel(data) {
            this.f[data.url] = new MirrorModel(uri_1.URI.parse(data.url), data.lines, data.EOL, data.versionId);
        }
        acceptModelChanged(strURL, e) {
            if (!this.f[strURL]) {
                return;
            }
            const model = this.f[strURL];
            model.onEvents(e);
        }
        acceptRemovedModel(strURL) {
            if (!this.f[strURL]) {
                return;
            }
            delete this.f[strURL];
        }
        async computeUnicodeHighlights(url, options, range) {
            const model = this.j(url);
            if (!model) {
                return { ranges: [], hasMore: false, ambiguousCharacterCount: 0, invisibleCharacterCount: 0, nonBasicAsciiCharacterCount: 0 };
            }
            return unicodeTextModelHighlighter_1.$xY.computeUnicodeHighlights(model, options, range);
        }
        // ---- BEGIN diff --------------------------------------------------------------------------
        async computeDiff(originalUrl, modifiedUrl, options, algorithm) {
            const original = this.j(originalUrl);
            const modified = this.j(modifiedUrl);
            if (!original || !modified) {
                return null;
            }
            return EditorSimpleWorker.l(original, modified, options, algorithm);
        }
        static l(originalTextModel, modifiedTextModel, options, algorithm) {
            const diffAlgorithm = algorithm === 'advanced' ? linesDiffComputers_1.$ZY.getDefault() : linesDiffComputers_1.$ZY.getLegacy();
            const originalLines = originalTextModel.getLinesContent();
            const modifiedLines = modifiedTextModel.getLinesContent();
            const result = diffAlgorithm.computeDiff(originalLines, modifiedLines, options);
            const identical = (result.changes.length > 0 ? false : this.n(originalTextModel, modifiedTextModel));
            function getLineChanges(changes) {
                return changes.map(m => ([m.original.startLineNumber, m.original.endLineNumberExclusive, m.modified.startLineNumber, m.modified.endLineNumberExclusive, m.innerChanges?.map(m => [
                        m.originalRange.startLineNumber,
                        m.originalRange.startColumn,
                        m.originalRange.endLineNumber,
                        m.originalRange.endColumn,
                        m.modifiedRange.startLineNumber,
                        m.modifiedRange.startColumn,
                        m.modifiedRange.endLineNumber,
                        m.modifiedRange.endColumn,
                    ])]));
            }
            return {
                identical,
                quitEarly: result.hitTimeout,
                changes: getLineChanges(result.changes),
                moves: result.moves.map(m => ([
                    m.lineRangeMapping.original.startLineNumber,
                    m.lineRangeMapping.original.endLineNumberExclusive,
                    m.lineRangeMapping.modified.startLineNumber,
                    m.lineRangeMapping.modified.endLineNumberExclusive,
                    getLineChanges(m.changes)
                ])),
            };
        }
        static n(original, modified) {
            const originalLineCount = original.getLineCount();
            const modifiedLineCount = modified.getLineCount();
            if (originalLineCount !== modifiedLineCount) {
                return false;
            }
            for (let line = 1; line <= originalLineCount; line++) {
                const originalLine = original.getLineContent(line);
                const modifiedLine = modified.getLineContent(line);
                if (originalLine !== modifiedLine) {
                    return false;
                }
            }
            return true;
        }
        async computeDirtyDiff(originalUrl, modifiedUrl, ignoreTrimWhitespace) {
            const original = this.j(originalUrl);
            const modified = this.j(modifiedUrl);
            if (!original || !modified) {
                return null;
            }
            const originalLines = original.getLinesContent();
            const modifiedLines = modified.getLinesContent();
            const diffComputer = new legacyLinesDiffComputer_1.$Bs(originalLines, modifiedLines, {
                shouldComputeCharChanges: false,
                shouldPostProcessCharChanges: false,
                shouldIgnoreTrimWhitespace: ignoreTrimWhitespace,
                shouldMakePrettyDiff: true,
                maxComputationTime: 1000
            });
            return diffComputer.computeDiff().changes;
        }
        // ---- END diff --------------------------------------------------------------------------
        // ---- BEGIN minimal edits ---------------------------------------------------------------
        static { this.o = 100000; }
        async computeMoreMinimalEdits(modelUrl, edits, pretty) {
            const model = this.j(modelUrl);
            if (!model) {
                return edits;
            }
            const result = [];
            let lastEol = undefined;
            edits = edits.slice(0).sort((a, b) => {
                if (a.range && b.range) {
                    return range_1.$ks.compareRangesUsingStarts(a.range, b.range);
                }
                // eol only changes should go to the end
                const aRng = a.range ? 0 : 1;
                const bRng = b.range ? 0 : 1;
                return aRng - bRng;
            });
            // merge adjacent edits
            let writeIndex = 0;
            for (let readIndex = 1; readIndex < edits.length; readIndex++) {
                if (range_1.$ks.getEndPosition(edits[writeIndex].range).equals(range_1.$ks.getStartPosition(edits[readIndex].range))) {
                    edits[writeIndex].range = range_1.$ks.fromPositions(range_1.$ks.getStartPosition(edits[writeIndex].range), range_1.$ks.getEndPosition(edits[readIndex].range));
                    edits[writeIndex].text += edits[readIndex].text;
                }
                else {
                    writeIndex++;
                    edits[writeIndex] = edits[readIndex];
                }
            }
            edits.length = writeIndex + 1;
            for (let { range, text, eol } of edits) {
                if (typeof eol === 'number') {
                    lastEol = eol;
                }
                if (range_1.$ks.isEmpty(range) && !text) {
                    // empty change
                    continue;
                }
                const original = model.getValueInRange(range);
                text = text.replace(/\r\n|\n|\r/g, model.eol);
                if (original === text) {
                    // noop
                    continue;
                }
                // make sure diff won't take too long
                if (Math.max(text.length, original.length) > EditorSimpleWorker.o) {
                    result.push({ range, text });
                    continue;
                }
                // compute diff between original and edit.text
                const changes = (0, diff_1.$ps)(original, text, pretty);
                const editOffset = model.offsetAt(range_1.$ks.lift(range).getStartPosition());
                for (const change of changes) {
                    const start = model.positionAt(editOffset + change.originalStart);
                    const end = model.positionAt(editOffset + change.originalStart + change.originalLength);
                    const newEdit = {
                        text: text.substr(change.modifiedStart, change.modifiedLength),
                        range: { startLineNumber: start.lineNumber, startColumn: start.column, endLineNumber: end.lineNumber, endColumn: end.column }
                    };
                    if (model.getValueInRange(newEdit.range) !== newEdit.text) {
                        result.push(newEdit);
                    }
                }
            }
            if (typeof lastEol === 'number') {
                result.push({ eol: lastEol, text: '', range: { startLineNumber: 0, startColumn: 0, endLineNumber: 0, endColumn: 0 } });
            }
            return result;
        }
        computeHumanReadableDiff(modelUrl, edits, options) {
            const model = this.j(modelUrl);
            if (!model) {
                return edits;
            }
            const result = [];
            let lastEol = undefined;
            edits = edits.slice(0).sort((a, b) => {
                if (a.range && b.range) {
                    return range_1.$ks.compareRangesUsingStarts(a.range, b.range);
                }
                // eol only changes should go to the end
                const aRng = a.range ? 0 : 1;
                const bRng = b.range ? 0 : 1;
                return aRng - bRng;
            });
            for (let { range, text, eol } of edits) {
                if (typeof eol === 'number') {
                    lastEol = eol;
                }
                if (range_1.$ks.isEmpty(range) && !text) {
                    // empty change
                    continue;
                }
                const original = model.getValueInRange(range);
                text = text.replace(/\r\n|\n|\r/g, model.eol);
                if (original === text) {
                    // noop
                    continue;
                }
                // make sure diff won't take too long
                if (Math.max(text.length, original.length) > EditorSimpleWorker.o) {
                    result.push({ range, text });
                    continue;
                }
                // compute diff between original and edit.text
                const originalLines = original.split(/\r\n|\n|\r/);
                const modifiedLines = text.split(/\r\n|\n|\r/);
                const diff = linesDiffComputers_1.$ZY.getDefault().computeDiff(originalLines, modifiedLines, options);
                const start = range_1.$ks.lift(range).getStartPosition();
                function addPositions(pos1, pos2) {
                    return new position_1.$js(pos1.lineNumber + pos2.lineNumber - 1, pos2.lineNumber === 1 ? pos1.column + pos2.column - 1 : pos2.column);
                }
                function getText(lines, range) {
                    const result = [];
                    for (let i = range.startLineNumber; i <= range.endLineNumber; i++) {
                        const line = lines[i - 1];
                        if (i === range.startLineNumber && i === range.endLineNumber) {
                            result.push(line.substring(range.startColumn - 1, range.endColumn - 1));
                        }
                        else if (i === range.startLineNumber) {
                            result.push(line.substring(range.startColumn - 1));
                        }
                        else if (i === range.endLineNumber) {
                            result.push(line.substring(0, range.endColumn - 1));
                        }
                        else {
                            result.push(line);
                        }
                    }
                    return result;
                }
                for (const c of diff.changes) {
                    if (c.innerChanges) {
                        for (const x of c.innerChanges) {
                            result.push({
                                range: range_1.$ks.fromPositions(addPositions(start, x.originalRange.getStartPosition()), addPositions(start, x.originalRange.getEndPosition())),
                                text: getText(modifiedLines, x.modifiedRange).join(model.eol)
                            });
                        }
                    }
                    else {
                        throw new errors_1.$ab('The experimental diff algorithm always produces inner changes');
                    }
                }
            }
            if (typeof lastEol === 'number') {
                result.push({ eol: lastEol, text: '', range: { startLineNumber: 0, startColumn: 0, endLineNumber: 0, endColumn: 0 } });
            }
            return result;
        }
        // ---- END minimal edits ---------------------------------------------------------------
        async computeLinks(modelUrl) {
            const model = this.j(modelUrl);
            if (!model) {
                return null;
            }
            return (0, linkComputer_1.$AY)(model);
        }
        // --- BEGIN default document colors -----------------------------------------------------------
        async computeDefaultDocumentColors(modelUrl) {
            const model = this.j(modelUrl);
            if (!model) {
                return null;
            }
            return (0, defaultDocumentColorsComputer_1.$1Y)(model);
        }
        // ---- BEGIN suggest --------------------------------------------------------------------------
        static { this.p = 10000; }
        async textualSuggest(modelUrls, leadingWord, wordDef, wordDefFlags) {
            const sw = new stopwatch_1.$bd();
            const wordDefRegExp = new RegExp(wordDef, wordDefFlags);
            const seen = new Set();
            outer: for (const url of modelUrls) {
                const model = this.j(url);
                if (!model) {
                    continue;
                }
                for (const word of model.words(wordDefRegExp)) {
                    if (word === leadingWord || !isNaN(Number(word))) {
                        continue;
                    }
                    seen.add(word);
                    if (seen.size > EditorSimpleWorker.p) {
                        break outer;
                    }
                }
            }
            return { words: Array.from(seen), duration: sw.elapsed() };
        }
        // ---- END suggest --------------------------------------------------------------------------
        //#region -- word ranges --
        async computeWordRanges(modelUrl, range, wordDef, wordDefFlags) {
            const model = this.j(modelUrl);
            if (!model) {
                return Object.create(null);
            }
            const wordDefRegExp = new RegExp(wordDef, wordDefFlags);
            const result = Object.create(null);
            for (let line = range.startLineNumber; line < range.endLineNumber; line++) {
                const words = model.getLineWords(line, wordDefRegExp);
                for (const word of words) {
                    if (!isNaN(Number(word.word))) {
                        continue;
                    }
                    let array = result[word.word];
                    if (!array) {
                        array = [];
                        result[word.word] = array;
                    }
                    array.push({
                        startLineNumber: line,
                        startColumn: word.startColumn,
                        endLineNumber: line,
                        endColumn: word.endColumn
                    });
                }
            }
            return result;
        }
        //#endregion
        async navigateValueSet(modelUrl, range, up, wordDef, wordDefFlags) {
            const model = this.j(modelUrl);
            if (!model) {
                return null;
            }
            const wordDefRegExp = new RegExp(wordDef, wordDefFlags);
            if (range.startColumn === range.endColumn) {
                range = {
                    startLineNumber: range.startLineNumber,
                    startColumn: range.startColumn,
                    endLineNumber: range.endLineNumber,
                    endColumn: range.endColumn + 1
                };
            }
            const selectionText = model.getValueInRange(range);
            const wordRange = model.getWordAtPosition({ lineNumber: range.startLineNumber, column: range.startColumn }, wordDefRegExp);
            if (!wordRange) {
                return null;
            }
            const word = model.getValueInRange(wordRange);
            const result = inplaceReplaceSupport_1.$BY.INSTANCE.navigateValueSet(range, selectionText, wordRange, word, up);
            return result;
        }
        // ---- BEGIN foreign module support --------------------------------------------------------------------------
        loadForeignModule(moduleId, createData, foreignHostMethods) {
            const proxyMethodRequest = (method, args) => {
                return this.d.fhr(method, args);
            };
            const foreignHost = (0, objects_1.$7m)(foreignHostMethods, proxyMethodRequest);
            const ctx = {
                host: foreignHost,
                getMirrorModels: () => {
                    return this.k();
                }
            };
            if (this.g) {
                this.h = this.g(ctx, createData);
                // static foreing module
                return Promise.resolve((0, objects_1.$6m)(this.h));
            }
            // ESM-comment-begin
            return new Promise((resolve, reject) => {
                require([moduleId], (foreignModule) => {
                    this.h = foreignModule.create(ctx, createData);
                    resolve((0, objects_1.$6m)(this.h));
                }, reject);
            });
            // ESM-comment-end
            // ESM-uncomment-begin
            // return Promise.reject(new Error(`Unexpected usage`));
            // ESM-uncomment-end
        }
        // foreign method request
        fmr(method, args) {
            if (!this.h || typeof this.h[method] !== 'function') {
                return Promise.reject(new Error('Missing requestHandler or method: ' + method));
            }
            try {
                return Promise.resolve(this.h[method].apply(this.h, args));
            }
            catch (e) {
                return Promise.reject(e);
            }
        }
    }
    exports.EditorSimpleWorker = EditorSimpleWorker;
    /**
     * Called on the worker side
     * @internal
     */
    function create(host) {
        return new EditorSimpleWorker(host, null);
    }
    exports.create = create;
    if (typeof importScripts === 'function') {
        // Running in a web worker
        globalThis.monaco = (0, editorBaseApi_1.$DY)();
    }
});
//# sourceMappingURL=editorSimpleWorker.js.map