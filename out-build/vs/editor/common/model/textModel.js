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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/color", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/stream", "vs/base/common/strings", "vs/base/common/uri", "vs/editor/common/core/eolCounter", "vs/editor/common/core/indentation", "vs/editor/common/core/lineRange", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/core/textModelDefaults", "vs/editor/common/languages/language", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/model", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsImpl", "vs/editor/common/model/bracketPairsTextModelPart/colorizedBracketPairsDecorationProvider", "vs/editor/common/model/editStack", "vs/editor/common/model/guidesTextModelPart", "vs/editor/common/model/indentationGuesser", "vs/editor/common/model/intervalTree", "vs/editor/common/model/pieceTreeTextBuffer/pieceTreeTextBuffer", "vs/editor/common/model/pieceTreeTextBuffer/pieceTreeTextBufferBuilder", "vs/editor/common/model/textModelSearch", "vs/editor/common/model/tokenizationTextModelPart", "vs/editor/common/textModelEvents", "vs/platform/undoRedo/common/undoRedo"], function (require, exports, arrays_1, color_1, errors_1, event_1, lifecycle_1, stream_1, strings, uri_1, eolCounter_1, indentation_1, lineRange_1, position_1, range_1, selection_1, textModelDefaults_1, language_1, languageConfigurationRegistry_1, model, bracketPairsImpl_1, colorizedBracketPairsDecorationProvider_1, editStack_1, guidesTextModelPart_1, indentationGuesser_1, intervalTree_1, pieceTreeTextBuffer_1, pieceTreeTextBufferBuilder_1, textModelSearch_1, tokenizationTextModelPart_1, textModelEvents_1, undoRedo_1) {
    "use strict";
    var $MC_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$SC = exports.$RC = exports.$QC = exports.$PC = exports.$OC = exports.$NC = exports.$MC = exports.$LC = exports.$KC = exports.$JC = exports.$IC = void 0;
    function $IC(text) {
        const builder = new pieceTreeTextBufferBuilder_1.$tC();
        builder.acceptChunk(text);
        return builder.finish();
    }
    exports.$IC = $IC;
    function $JC(stream) {
        return new Promise((resolve, reject) => {
            const builder = new pieceTreeTextBufferBuilder_1.$tC();
            let done = false;
            (0, stream_1.$xd)(stream, {
                onData: chunk => {
                    builder.acceptChunk((typeof chunk === 'string') ? chunk : chunk.toString());
                },
                onError: error => {
                    if (!done) {
                        done = true;
                        reject(error);
                    }
                },
                onEnd: () => {
                    if (!done) {
                        done = true;
                        resolve(builder.finish());
                    }
                }
            });
        });
    }
    exports.$JC = $JC;
    function $KC(snapshot) {
        const builder = new pieceTreeTextBufferBuilder_1.$tC();
        let chunk;
        while (typeof (chunk = snapshot.read()) === 'string') {
            builder.acceptChunk(chunk);
        }
        return builder.finish();
    }
    exports.$KC = $KC;
    function $LC(value, defaultEOL) {
        let factory;
        if (typeof value === 'string') {
            factory = $IC(value);
        }
        else if (model.$Cu(value)) {
            factory = $KC(value);
        }
        else {
            factory = value;
        }
        return factory.create(defaultEOL);
    }
    exports.$LC = $LC;
    let MODEL_ID = 0;
    const LIMIT_FIND_COUNT = 999;
    const LONG_LINE_BOUNDARY = 10000;
    class TextModelSnapshot {
        constructor(source) {
            this.a = source;
            this.b = false;
        }
        read() {
            if (this.b) {
                return null;
            }
            const result = [];
            let resultCnt = 0;
            let resultLength = 0;
            do {
                const tmp = this.a.read();
                if (tmp === null) {
                    // end-of-stream
                    this.b = true;
                    if (resultCnt === 0) {
                        return null;
                    }
                    else {
                        return result.join('');
                    }
                }
                if (tmp.length > 0) {
                    result[resultCnt++] = tmp;
                    resultLength += tmp.length;
                }
                if (resultLength >= 64 * 1024) {
                    return result.join('');
                }
            } while (true);
        }
    }
    const invalidFunc = () => { throw new Error(`Invalid change accessor`); };
    var StringOffsetValidationType;
    (function (StringOffsetValidationType) {
        /**
         * Even allowed in surrogate pairs
         */
        StringOffsetValidationType[StringOffsetValidationType["Relaxed"] = 0] = "Relaxed";
        /**
         * Not allowed in surrogate pairs
         */
        StringOffsetValidationType[StringOffsetValidationType["SurrogatePairs"] = 1] = "SurrogatePairs";
    })(StringOffsetValidationType || (StringOffsetValidationType = {}));
    let $MC = class $MC extends lifecycle_1.$kc {
        static { $MC_1 = this; }
        static { this._MODEL_SYNC_LIMIT = 50 * 1024 * 1024; } // 50 MB,  // used in tests
        static { this.a = 20 * 1024 * 1024; } // 20 MB;
        static { this.b = 300 * 1000; } // 300K lines
        static { this.f = 256 * 1024 * 1024; } // 256M characters, usually ~> 512MB memory usage
        static { this.DEFAULT_CREATION_OPTIONS = {
            isForSimpleWidget: false,
            tabSize: textModelDefaults_1.$Ur.tabSize,
            indentSize: textModelDefaults_1.$Ur.indentSize,
            insertSpaces: textModelDefaults_1.$Ur.insertSpaces,
            detectIndentation: false,
            defaultEOL: 1 /* model.DefaultEndOfLine.LF */,
            trimAutoWhitespace: textModelDefaults_1.$Ur.trimAutoWhitespace,
            largeFileOptimizations: textModelDefaults_1.$Ur.largeFileOptimizations,
            bracketPairColorizationOptions: textModelDefaults_1.$Ur.bracketPairColorizationOptions,
        }; }
        static resolveOptions(textBuffer, options) {
            if (options.detectIndentation) {
                const guessedIndentation = (0, indentationGuesser_1.$1B)(textBuffer, options.tabSize, options.insertSpaces);
                return new model.$Au({
                    tabSize: guessedIndentation.tabSize,
                    indentSize: 'tabSize',
                    insertSpaces: guessedIndentation.insertSpaces,
                    trimAutoWhitespace: options.trimAutoWhitespace,
                    defaultEOL: options.defaultEOL,
                    bracketPairColorizationOptions: options.bracketPairColorizationOptions,
                });
            }
            return new model.$Au(options);
        }
        get onDidChangeLanguage() { return this.bb.onDidChangeLanguage; }
        get onDidChangeLanguageConfiguration() { return this.bb.onDidChangeLanguageConfiguration; }
        get onDidChangeTokens() { return this.bb.onDidChangeTokens; }
        onDidChangeContent(listener) {
            return this.w.slowEvent((e) => listener(e.contentChangedEvent));
        }
        onDidChangeContentOrInjectedText(listener) {
            return (0, lifecycle_1.$hc)(this.w.fastEvent(e => listener(e)), this.u.event(e => listener(e)));
        }
        _isDisposing() { return this.I; }
        get tokenization() { return this.bb; }
        get bracketPairs() { return this.cb; }
        get guides() { return this.db; }
        constructor(source, languageIdOrSelection, creationOptions, associatedResource = null, fb, gb, hb) {
            super();
            this.fb = fb;
            this.gb = gb;
            this.hb = hb;
            //#region Events
            this.g = this.B(new event_1.$fd());
            this.onWillDispose = this.g.event;
            this.h = this.B(new DidChangeDecorationsEmitter(affectedInjectedTextLines => this.yb(affectedInjectedTextLines)));
            this.onDidChangeDecorations = this.h.event;
            this.n = this.B(new event_1.$fd());
            this.onDidChangeOptions = this.n.event;
            this.s = this.B(new event_1.$fd());
            this.onDidChangeAttached = this.s.event;
            this.u = this.B(new event_1.$fd());
            this.w = this.B(new DidChangeContentEmitter());
            this.G = this.B(new lifecycle_1.$lc());
            this.X = 0;
            this.eb = new $SC();
            // Generate a new unique model id
            MODEL_ID++;
            this.id = '$model' + MODEL_ID;
            this.isForSimpleWidget = creationOptions.isForSimpleWidget;
            if (typeof associatedResource === 'undefined' || associatedResource === null) {
                this.y = uri_1.URI.parse('inmemory://model/' + MODEL_ID);
            }
            else {
                this.y = associatedResource;
            }
            this.z = 0;
            const { textBuffer, disposable } = $LC(source, creationOptions.defaultEOL);
            this.C = textBuffer;
            this.D = disposable;
            this.F = $MC_1.resolveOptions(this.C, creationOptions);
            const languageId = (typeof languageIdOrSelection === 'string' ? languageIdOrSelection : languageIdOrSelection.languageId);
            if (typeof languageIdOrSelection !== 'string') {
                this.G.value = languageIdOrSelection.onDidChange(() => this.Fb(languageIdOrSelection.languageId));
            }
            this.cb = this.B(new bracketPairsImpl_1.$QA(this, this.hb));
            this.db = this.B(new guidesTextModelPart_1.$YB(this, this.hb));
            this.ab = this.B(new colorizedBracketPairsDecorationProvider_1.$QB(this));
            this.bb = new tokenizationTextModelPart_1.$HC(this.gb, this.hb, this, this.cb, languageId, this.eb);
            const bufferLineCount = this.C.getLineCount();
            const bufferTextLength = this.C.getValueLengthInRange(new range_1.$ks(1, 1, bufferLineCount, this.C.getLineLength(bufferLineCount) + 1), 0 /* model.EndOfLinePreference.TextDefined */);
            // !!! Make a decision in the ctor and permanently respect this decision !!!
            // If a model is too large at construction time, it will never get tokenized,
            // under no circumstances.
            if (creationOptions.largeFileOptimizations) {
                this.O = ((bufferTextLength > $MC_1.a)
                    || (bufferLineCount > $MC_1.b));
                this.P = bufferTextLength > $MC_1.f;
            }
            else {
                this.O = false;
                this.P = false;
            }
            this.N = (bufferTextLength > $MC_1._MODEL_SYNC_LIMIT);
            this.J = 1;
            this.L = 1;
            this.M = null;
            this.H = false;
            this.I = false;
            this.W = strings.$df(MODEL_ID);
            this.Y = 0;
            this.Z = Object.create(null);
            this.$ = new DecorationsTrees();
            this.Q = new editStack_1.$VB(this, this.fb);
            this.R = false;
            this.S = false;
            this.U = null;
            this.B(this.ab.onDidChange(() => {
                this.h.beginDeferredEmit();
                this.h.fire();
                this.h.endDeferredEmit();
            }));
            this.gb.requestRichLanguageFeatures(languageId);
        }
        dispose() {
            this.I = true;
            this.g.fire();
            this.bb.dispose();
            this.H = true;
            super.dispose();
            this.D.dispose();
            this.I = false;
            // Manually release reference to previous text buffer to avoid large leaks
            // in case someone leaks a TextModel reference
            const emptyDisposedTextBuffer = new pieceTreeTextBuffer_1.$sC([], '', '\n', false, false, true, true);
            emptyDisposedTextBuffer.dispose();
            this.C = emptyDisposedTextBuffer;
            this.D = lifecycle_1.$kc.None;
        }
        _hasListeners() {
            return (this.g.hasListeners()
                || this.h.hasListeners()
                || this.bb._hasListeners()
                || this.n.hasListeners()
                || this.s.hasListeners()
                || this.u.hasListeners()
                || this.w.hasListeners());
        }
        ib() {
            if (this.H) {
                throw new Error('Model is disposed!');
            }
        }
        equalsTextBuffer(other) {
            this.ib();
            return this.C.equals(other);
        }
        getTextBuffer() {
            this.ib();
            return this.C;
        }
        jb(rawChange, change) {
            if (this.I) {
                // Do not confuse listeners by emitting any event after disposing
                return;
            }
            this.bb.handleDidChangeContent(change);
            this.cb.handleDidChangeContent(change);
            this.w.fire(new textModelEvents_1.$ru(rawChange, change));
        }
        setValue(value) {
            this.ib();
            if (value === null || value === undefined) {
                throw (0, errors_1.$5)();
            }
            const { textBuffer, disposable } = $LC(value, this.F.defaultEOL);
            this.lb(textBuffer, disposable);
        }
        kb(range, rangeOffset, rangeLength, text, isUndoing, isRedoing, isFlush, isEolChange) {
            return {
                changes: [{
                        range: range,
                        rangeOffset: rangeOffset,
                        rangeLength: rangeLength,
                        text: text,
                    }],
                eol: this.C.getEOL(),
                isEolChange: isEolChange,
                versionId: this.getVersionId(),
                isUndoing: isUndoing,
                isRedoing: isRedoing,
                isFlush: isFlush
            };
        }
        lb(textBuffer, textBufferDisposable) {
            this.ib();
            const oldFullModelRange = this.getFullModelRange();
            const oldModelValueLength = this.getValueLengthInRange(oldFullModelRange);
            const endLineNumber = this.getLineCount();
            const endColumn = this.getLineMaxColumn(endLineNumber);
            this.C = textBuffer;
            this.D.dispose();
            this.D = textBufferDisposable;
            this.ob();
            // Destroy all my decorations
            this.Z = Object.create(null);
            this.$ = new DecorationsTrees();
            // Destroy my edit history and settings
            this.Q.clear();
            this.U = null;
            this.jb(new textModelEvents_1.$pu([
                new textModelEvents_1.$ju()
            ], this.J, false, false), this.kb(new range_1.$ks(1, 1, endLineNumber, endColumn), 0, oldModelValueLength, this.getValue(), false, false, true, false));
        }
        setEOL(eol) {
            this.ib();
            const newEOL = (eol === 1 /* model.EndOfLineSequence.CRLF */ ? '\r\n' : '\n');
            if (this.C.getEOL() === newEOL) {
                // Nothing to do
                return;
            }
            const oldFullModelRange = this.getFullModelRange();
            const oldModelValueLength = this.getValueLengthInRange(oldFullModelRange);
            const endLineNumber = this.getLineCount();
            const endColumn = this.getLineMaxColumn(endLineNumber);
            this.mb();
            this.C.setEOL(newEOL);
            this.ob();
            this.nb();
            this.jb(new textModelEvents_1.$pu([
                new textModelEvents_1.$ou()
            ], this.J, false, false), this.kb(new range_1.$ks(1, 1, endLineNumber, endColumn), 0, oldModelValueLength, this.getValue(), false, false, false, true));
        }
        mb() {
            // Ensure all decorations get their `range` set.
            this.$.ensureAllNodesHaveRanges(this);
        }
        nb() {
            // Transform back `range` to offsets
            const versionId = this.getVersionId();
            const allDecorations = this.$.collectNodesPostOrder();
            for (let i = 0, len = allDecorations.length; i < len; i++) {
                const node = allDecorations[i];
                const range = node.range; // the range is defined due to `_onBeforeEOLChange`
                const delta = node.cachedAbsoluteStart - node.start;
                const startOffset = this.C.getOffsetAt(range.startLineNumber, range.startColumn);
                const endOffset = this.C.getOffsetAt(range.endLineNumber, range.endColumn);
                node.cachedAbsoluteStart = startOffset;
                node.cachedAbsoluteEnd = endOffset;
                node.cachedVersionId = versionId;
                node.start = startOffset - delta;
                node.end = endOffset - delta;
                (0, intervalTree_1.$8B)(node);
            }
        }
        onBeforeAttached() {
            this.z++;
            if (this.z === 1) {
                this.bb.handleDidChangeAttached();
                this.s.fire(undefined);
            }
            return this.eb.attachView();
        }
        onBeforeDetached(view) {
            this.z--;
            if (this.z === 0) {
                this.bb.handleDidChangeAttached();
                this.s.fire(undefined);
            }
            this.eb.detachView(view);
        }
        isAttachedToEditor() {
            return this.z > 0;
        }
        getAttachedEditorCount() {
            return this.z;
        }
        isTooLargeForSyncing() {
            return this.N;
        }
        isTooLargeForTokenization() {
            return this.O;
        }
        isTooLargeForHeapOperation() {
            return this.P;
        }
        isDisposed() {
            return this.H;
        }
        isDominatedByLongLines() {
            this.ib();
            if (this.isTooLargeForTokenization()) {
                // Cannot word wrap huge files anyways, so it doesn't really matter
                return false;
            }
            let smallLineCharCount = 0;
            let longLineCharCount = 0;
            const lineCount = this.C.getLineCount();
            for (let lineNumber = 1; lineNumber <= lineCount; lineNumber++) {
                const lineLength = this.C.getLineLength(lineNumber);
                if (lineLength >= LONG_LINE_BOUNDARY) {
                    longLineCharCount += lineLength;
                }
                else {
                    smallLineCharCount += lineLength;
                }
            }
            return (longLineCharCount > smallLineCharCount);
        }
        get uri() {
            return this.y;
        }
        //#region Options
        getOptions() {
            this.ib();
            return this.F;
        }
        getFormattingOptions() {
            return {
                tabSize: this.F.indentSize,
                insertSpaces: this.F.insertSpaces
            };
        }
        updateOptions(_newOpts) {
            this.ib();
            const tabSize = (typeof _newOpts.tabSize !== 'undefined') ? _newOpts.tabSize : this.F.tabSize;
            const indentSize = (typeof _newOpts.indentSize !== 'undefined') ? _newOpts.indentSize : this.F.originalIndentSize;
            const insertSpaces = (typeof _newOpts.insertSpaces !== 'undefined') ? _newOpts.insertSpaces : this.F.insertSpaces;
            const trimAutoWhitespace = (typeof _newOpts.trimAutoWhitespace !== 'undefined') ? _newOpts.trimAutoWhitespace : this.F.trimAutoWhitespace;
            const bracketPairColorizationOptions = (typeof _newOpts.bracketColorizationOptions !== 'undefined') ? _newOpts.bracketColorizationOptions : this.F.bracketPairColorizationOptions;
            const newOpts = new model.$Au({
                tabSize: tabSize,
                indentSize: indentSize,
                insertSpaces: insertSpaces,
                defaultEOL: this.F.defaultEOL,
                trimAutoWhitespace: trimAutoWhitespace,
                bracketPairColorizationOptions,
            });
            if (this.F.equals(newOpts)) {
                return;
            }
            const e = this.F.createChangeEvent(newOpts);
            this.F = newOpts;
            this.cb.handleDidChangeOptions(e);
            this.ab.handleDidChangeOptions(e);
            this.n.fire(e);
        }
        detectIndentation(defaultInsertSpaces, defaultTabSize) {
            this.ib();
            const guessedIndentation = (0, indentationGuesser_1.$1B)(this.C, defaultTabSize, defaultInsertSpaces);
            this.updateOptions({
                insertSpaces: guessedIndentation.insertSpaces,
                tabSize: guessedIndentation.tabSize,
                indentSize: guessedIndentation.tabSize, // TODO@Alex: guess indentSize independent of tabSize
            });
        }
        normalizeIndentation(str) {
            this.ib();
            return (0, indentation_1.$HA)(str, this.F.indentSize, this.F.insertSpaces);
        }
        //#endregion
        //#region Reading
        getVersionId() {
            this.ib();
            return this.J;
        }
        mightContainRTL() {
            return this.C.mightContainRTL();
        }
        mightContainUnusualLineTerminators() {
            return this.C.mightContainUnusualLineTerminators();
        }
        removeUnusualLineTerminators(selections = null) {
            const matches = this.findMatches(strings.$3e.source, false, true, false, null, false, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */);
            this.C.resetMightContainUnusualLineTerminators();
            this.pushEditOperations(selections, matches.map(m => ({ range: m.range, text: null })), () => null);
        }
        mightContainNonBasicASCII() {
            return this.C.mightContainNonBasicASCII();
        }
        getAlternativeVersionId() {
            this.ib();
            return this.L;
        }
        getInitialUndoRedoSnapshot() {
            this.ib();
            return this.M;
        }
        getOffsetAt(rawPosition) {
            this.ib();
            const position = this.qb(rawPosition.lineNumber, rawPosition.column, 0 /* StringOffsetValidationType.Relaxed */);
            return this.C.getOffsetAt(position.lineNumber, position.column);
        }
        getPositionAt(rawOffset) {
            this.ib();
            const offset = (Math.min(this.C.getLength(), Math.max(0, rawOffset)));
            return this.C.getPositionAt(offset);
        }
        ob() {
            this.J = this.J + 1;
            this.L = this.J;
        }
        _overwriteVersionId(versionId) {
            this.J = versionId;
        }
        _overwriteAlternativeVersionId(newAlternativeVersionId) {
            this.L = newAlternativeVersionId;
        }
        _overwriteInitialUndoRedoSnapshot(newInitialUndoRedoSnapshot) {
            this.M = newInitialUndoRedoSnapshot;
        }
        getValue(eol, preserveBOM = false) {
            this.ib();
            if (this.isTooLargeForHeapOperation()) {
                throw new errors_1.$ab('Operation would exceed heap memory limits');
            }
            const fullModelRange = this.getFullModelRange();
            const fullModelValue = this.getValueInRange(fullModelRange, eol);
            if (preserveBOM) {
                return this.C.getBOM() + fullModelValue;
            }
            return fullModelValue;
        }
        createSnapshot(preserveBOM = false) {
            return new TextModelSnapshot(this.C.createSnapshot(preserveBOM));
        }
        getValueLength(eol, preserveBOM = false) {
            this.ib();
            const fullModelRange = this.getFullModelRange();
            const fullModelValue = this.getValueLengthInRange(fullModelRange, eol);
            if (preserveBOM) {
                return this.C.getBOM().length + fullModelValue;
            }
            return fullModelValue;
        }
        getValueInRange(rawRange, eol = 0 /* model.EndOfLinePreference.TextDefined */) {
            this.ib();
            return this.C.getValueInRange(this.validateRange(rawRange), eol);
        }
        getValueLengthInRange(rawRange, eol = 0 /* model.EndOfLinePreference.TextDefined */) {
            this.ib();
            return this.C.getValueLengthInRange(this.validateRange(rawRange), eol);
        }
        getCharacterCountInRange(rawRange, eol = 0 /* model.EndOfLinePreference.TextDefined */) {
            this.ib();
            return this.C.getCharacterCountInRange(this.validateRange(rawRange), eol);
        }
        getLineCount() {
            this.ib();
            return this.C.getLineCount();
        }
        getLineContent(lineNumber) {
            this.ib();
            if (lineNumber < 1 || lineNumber > this.getLineCount()) {
                throw new errors_1.$ab('Illegal value for lineNumber');
            }
            return this.C.getLineContent(lineNumber);
        }
        getLineLength(lineNumber) {
            this.ib();
            if (lineNumber < 1 || lineNumber > this.getLineCount()) {
                throw new errors_1.$ab('Illegal value for lineNumber');
            }
            return this.C.getLineLength(lineNumber);
        }
        getLinesContent() {
            this.ib();
            if (this.isTooLargeForHeapOperation()) {
                throw new errors_1.$ab('Operation would exceed heap memory limits');
            }
            return this.C.getLinesContent();
        }
        getEOL() {
            this.ib();
            return this.C.getEOL();
        }
        getEndOfLineSequence() {
            this.ib();
            return (this.C.getEOL() === '\n'
                ? 0 /* model.EndOfLineSequence.LF */
                : 1 /* model.EndOfLineSequence.CRLF */);
        }
        getLineMinColumn(lineNumber) {
            this.ib();
            return 1;
        }
        getLineMaxColumn(lineNumber) {
            this.ib();
            if (lineNumber < 1 || lineNumber > this.getLineCount()) {
                throw new errors_1.$ab('Illegal value for lineNumber');
            }
            return this.C.getLineLength(lineNumber) + 1;
        }
        getLineFirstNonWhitespaceColumn(lineNumber) {
            this.ib();
            if (lineNumber < 1 || lineNumber > this.getLineCount()) {
                throw new errors_1.$ab('Illegal value for lineNumber');
            }
            return this.C.getLineFirstNonWhitespaceColumn(lineNumber);
        }
        getLineLastNonWhitespaceColumn(lineNumber) {
            this.ib();
            if (lineNumber < 1 || lineNumber > this.getLineCount()) {
                throw new errors_1.$ab('Illegal value for lineNumber');
            }
            return this.C.getLineLastNonWhitespaceColumn(lineNumber);
        }
        /**
         * Validates `range` is within buffer bounds, but allows it to sit in between surrogate pairs, etc.
         * Will try to not allocate if possible.
         */
        _validateRangeRelaxedNoAllocations(range) {
            const linesCount = this.C.getLineCount();
            const initialStartLineNumber = range.startLineNumber;
            const initialStartColumn = range.startColumn;
            let startLineNumber = Math.floor((typeof initialStartLineNumber === 'number' && !isNaN(initialStartLineNumber)) ? initialStartLineNumber : 1);
            let startColumn = Math.floor((typeof initialStartColumn === 'number' && !isNaN(initialStartColumn)) ? initialStartColumn : 1);
            if (startLineNumber < 1) {
                startLineNumber = 1;
                startColumn = 1;
            }
            else if (startLineNumber > linesCount) {
                startLineNumber = linesCount;
                startColumn = this.getLineMaxColumn(startLineNumber);
            }
            else {
                if (startColumn <= 1) {
                    startColumn = 1;
                }
                else {
                    const maxColumn = this.getLineMaxColumn(startLineNumber);
                    if (startColumn >= maxColumn) {
                        startColumn = maxColumn;
                    }
                }
            }
            const initialEndLineNumber = range.endLineNumber;
            const initialEndColumn = range.endColumn;
            let endLineNumber = Math.floor((typeof initialEndLineNumber === 'number' && !isNaN(initialEndLineNumber)) ? initialEndLineNumber : 1);
            let endColumn = Math.floor((typeof initialEndColumn === 'number' && !isNaN(initialEndColumn)) ? initialEndColumn : 1);
            if (endLineNumber < 1) {
                endLineNumber = 1;
                endColumn = 1;
            }
            else if (endLineNumber > linesCount) {
                endLineNumber = linesCount;
                endColumn = this.getLineMaxColumn(endLineNumber);
            }
            else {
                if (endColumn <= 1) {
                    endColumn = 1;
                }
                else {
                    const maxColumn = this.getLineMaxColumn(endLineNumber);
                    if (endColumn >= maxColumn) {
                        endColumn = maxColumn;
                    }
                }
            }
            if (initialStartLineNumber === startLineNumber
                && initialStartColumn === startColumn
                && initialEndLineNumber === endLineNumber
                && initialEndColumn === endColumn
                && range instanceof range_1.$ks
                && !(range instanceof selection_1.$ms)) {
                return range;
            }
            return new range_1.$ks(startLineNumber, startColumn, endLineNumber, endColumn);
        }
        pb(lineNumber, column, validationType) {
            if (typeof lineNumber !== 'number' || typeof column !== 'number') {
                return false;
            }
            if (isNaN(lineNumber) || isNaN(column)) {
                return false;
            }
            if (lineNumber < 1 || column < 1) {
                return false;
            }
            if ((lineNumber | 0) !== lineNumber || (column | 0) !== column) {
                return false;
            }
            const lineCount = this.C.getLineCount();
            if (lineNumber > lineCount) {
                return false;
            }
            if (column === 1) {
                return true;
            }
            const maxColumn = this.getLineMaxColumn(lineNumber);
            if (column > maxColumn) {
                return false;
            }
            if (validationType === 1 /* StringOffsetValidationType.SurrogatePairs */) {
                // !!At this point, column > 1
                const charCodeBefore = this.C.getLineCharCode(lineNumber, column - 2);
                if (strings.$Qe(charCodeBefore)) {
                    return false;
                }
            }
            return true;
        }
        qb(_lineNumber, _column, validationType) {
            const lineNumber = Math.floor((typeof _lineNumber === 'number' && !isNaN(_lineNumber)) ? _lineNumber : 1);
            const column = Math.floor((typeof _column === 'number' && !isNaN(_column)) ? _column : 1);
            const lineCount = this.C.getLineCount();
            if (lineNumber < 1) {
                return new position_1.$js(1, 1);
            }
            if (lineNumber > lineCount) {
                return new position_1.$js(lineCount, this.getLineMaxColumn(lineCount));
            }
            if (column <= 1) {
                return new position_1.$js(lineNumber, 1);
            }
            const maxColumn = this.getLineMaxColumn(lineNumber);
            if (column >= maxColumn) {
                return new position_1.$js(lineNumber, maxColumn);
            }
            if (validationType === 1 /* StringOffsetValidationType.SurrogatePairs */) {
                // If the position would end up in the middle of a high-low surrogate pair,
                // we move it to before the pair
                // !!At this point, column > 1
                const charCodeBefore = this.C.getLineCharCode(lineNumber, column - 2);
                if (strings.$Qe(charCodeBefore)) {
                    return new position_1.$js(lineNumber, column - 1);
                }
            }
            return new position_1.$js(lineNumber, column);
        }
        validatePosition(position) {
            const validationType = 1 /* StringOffsetValidationType.SurrogatePairs */;
            this.ib();
            // Avoid object allocation and cover most likely case
            if (position instanceof position_1.$js) {
                if (this.pb(position.lineNumber, position.column, validationType)) {
                    return position;
                }
            }
            return this.qb(position.lineNumber, position.column, validationType);
        }
        rb(range, validationType) {
            const startLineNumber = range.startLineNumber;
            const startColumn = range.startColumn;
            const endLineNumber = range.endLineNumber;
            const endColumn = range.endColumn;
            if (!this.pb(startLineNumber, startColumn, 0 /* StringOffsetValidationType.Relaxed */)) {
                return false;
            }
            if (!this.pb(endLineNumber, endColumn, 0 /* StringOffsetValidationType.Relaxed */)) {
                return false;
            }
            if (validationType === 1 /* StringOffsetValidationType.SurrogatePairs */) {
                const charCodeBeforeStart = (startColumn > 1 ? this.C.getLineCharCode(startLineNumber, startColumn - 2) : 0);
                const charCodeBeforeEnd = (endColumn > 1 && endColumn <= this.C.getLineLength(endLineNumber) ? this.C.getLineCharCode(endLineNumber, endColumn - 2) : 0);
                const startInsideSurrogatePair = strings.$Qe(charCodeBeforeStart);
                const endInsideSurrogatePair = strings.$Qe(charCodeBeforeEnd);
                if (!startInsideSurrogatePair && !endInsideSurrogatePair) {
                    return true;
                }
                return false;
            }
            return true;
        }
        validateRange(_range) {
            const validationType = 1 /* StringOffsetValidationType.SurrogatePairs */;
            this.ib();
            // Avoid object allocation and cover most likely case
            if ((_range instanceof range_1.$ks) && !(_range instanceof selection_1.$ms)) {
                if (this.rb(_range, validationType)) {
                    return _range;
                }
            }
            const start = this.qb(_range.startLineNumber, _range.startColumn, 0 /* StringOffsetValidationType.Relaxed */);
            const end = this.qb(_range.endLineNumber, _range.endColumn, 0 /* StringOffsetValidationType.Relaxed */);
            const startLineNumber = start.lineNumber;
            const startColumn = start.column;
            const endLineNumber = end.lineNumber;
            const endColumn = end.column;
            if (validationType === 1 /* StringOffsetValidationType.SurrogatePairs */) {
                const charCodeBeforeStart = (startColumn > 1 ? this.C.getLineCharCode(startLineNumber, startColumn - 2) : 0);
                const charCodeBeforeEnd = (endColumn > 1 && endColumn <= this.C.getLineLength(endLineNumber) ? this.C.getLineCharCode(endLineNumber, endColumn - 2) : 0);
                const startInsideSurrogatePair = strings.$Qe(charCodeBeforeStart);
                const endInsideSurrogatePair = strings.$Qe(charCodeBeforeEnd);
                if (!startInsideSurrogatePair && !endInsideSurrogatePair) {
                    return new range_1.$ks(startLineNumber, startColumn, endLineNumber, endColumn);
                }
                if (startLineNumber === endLineNumber && startColumn === endColumn) {
                    // do not expand a collapsed range, simply move it to a valid location
                    return new range_1.$ks(startLineNumber, startColumn - 1, endLineNumber, endColumn - 1);
                }
                if (startInsideSurrogatePair && endInsideSurrogatePair) {
                    // expand range at both ends
                    return new range_1.$ks(startLineNumber, startColumn - 1, endLineNumber, endColumn + 1);
                }
                if (startInsideSurrogatePair) {
                    // only expand range at the start
                    return new range_1.$ks(startLineNumber, startColumn - 1, endLineNumber, endColumn);
                }
                // only expand range at the end
                return new range_1.$ks(startLineNumber, startColumn, endLineNumber, endColumn + 1);
            }
            return new range_1.$ks(startLineNumber, startColumn, endLineNumber, endColumn);
        }
        modifyPosition(rawPosition, offset) {
            this.ib();
            const candidate = this.getOffsetAt(rawPosition) + offset;
            return this.getPositionAt(Math.min(this.C.getLength(), Math.max(0, candidate)));
        }
        getFullModelRange() {
            this.ib();
            const lineCount = this.getLineCount();
            return new range_1.$ks(1, 1, lineCount, this.getLineMaxColumn(lineCount));
        }
        sb(searchRange, searchData, captureMatches, limitResultCount) {
            return this.C.findMatchesLineByLine(searchRange, searchData, captureMatches, limitResultCount);
        }
        findMatches(searchString, rawSearchScope, isRegex, matchCase, wordSeparators, captureMatches, limitResultCount = LIMIT_FIND_COUNT) {
            this.ib();
            let searchRanges = null;
            if (rawSearchScope !== null) {
                if (!Array.isArray(rawSearchScope)) {
                    rawSearchScope = [rawSearchScope];
                }
                if (rawSearchScope.every((searchScope) => range_1.$ks.isIRange(searchScope))) {
                    searchRanges = rawSearchScope.map((searchScope) => this.validateRange(searchScope));
                }
            }
            if (searchRanges === null) {
                searchRanges = [this.getFullModelRange()];
            }
            searchRanges = searchRanges.sort((d1, d2) => d1.startLineNumber - d2.startLineNumber || d1.startColumn - d2.startColumn);
            const uniqueSearchRanges = [];
            uniqueSearchRanges.push(searchRanges.reduce((prev, curr) => {
                if (range_1.$ks.areIntersecting(prev, curr)) {
                    return prev.plusRange(curr);
                }
                uniqueSearchRanges.push(prev);
                return curr;
            }));
            let matchMapper;
            if (!isRegex && searchString.indexOf('\n') < 0) {
                // not regex, not multi line
                const searchParams = new textModelSearch_1.$hC(searchString, isRegex, matchCase, wordSeparators);
                const searchData = searchParams.parseSearchRequest();
                if (!searchData) {
                    return [];
                }
                matchMapper = (searchRange) => this.sb(searchRange, searchData, captureMatches, limitResultCount);
            }
            else {
                matchMapper = (searchRange) => textModelSearch_1.$kC.findMatches(this, new textModelSearch_1.$hC(searchString, isRegex, matchCase, wordSeparators), searchRange, captureMatches, limitResultCount);
            }
            return uniqueSearchRanges.map(matchMapper).reduce((arr, matches) => arr.concat(matches), []);
        }
        findNextMatch(searchString, rawSearchStart, isRegex, matchCase, wordSeparators, captureMatches) {
            this.ib();
            const searchStart = this.validatePosition(rawSearchStart);
            if (!isRegex && searchString.indexOf('\n') < 0) {
                const searchParams = new textModelSearch_1.$hC(searchString, isRegex, matchCase, wordSeparators);
                const searchData = searchParams.parseSearchRequest();
                if (!searchData) {
                    return null;
                }
                const lineCount = this.getLineCount();
                let searchRange = new range_1.$ks(searchStart.lineNumber, searchStart.column, lineCount, this.getLineMaxColumn(lineCount));
                let ret = this.sb(searchRange, searchData, captureMatches, 1);
                textModelSearch_1.$kC.findNextMatch(this, new textModelSearch_1.$hC(searchString, isRegex, matchCase, wordSeparators), searchStart, captureMatches);
                if (ret.length > 0) {
                    return ret[0];
                }
                searchRange = new range_1.$ks(1, 1, searchStart.lineNumber, this.getLineMaxColumn(searchStart.lineNumber));
                ret = this.sb(searchRange, searchData, captureMatches, 1);
                if (ret.length > 0) {
                    return ret[0];
                }
                return null;
            }
            return textModelSearch_1.$kC.findNextMatch(this, new textModelSearch_1.$hC(searchString, isRegex, matchCase, wordSeparators), searchStart, captureMatches);
        }
        findPreviousMatch(searchString, rawSearchStart, isRegex, matchCase, wordSeparators, captureMatches) {
            this.ib();
            const searchStart = this.validatePosition(rawSearchStart);
            return textModelSearch_1.$kC.findPreviousMatch(this, new textModelSearch_1.$hC(searchString, isRegex, matchCase, wordSeparators), searchStart, captureMatches);
        }
        //#endregion
        //#region Editing
        pushStackElement() {
            this.Q.pushStackElement();
        }
        popStackElement() {
            this.Q.popStackElement();
        }
        pushEOL(eol) {
            const currentEOL = (this.getEOL() === '\n' ? 0 /* model.EndOfLineSequence.LF */ : 1 /* model.EndOfLineSequence.CRLF */);
            if (currentEOL === eol) {
                return;
            }
            try {
                this.h.beginDeferredEmit();
                this.w.beginDeferredEmit();
                if (this.M === null) {
                    this.M = this.fb.createSnapshot(this.uri);
                }
                this.Q.pushEOL(eol);
            }
            finally {
                this.w.endDeferredEmit();
                this.h.endDeferredEmit();
            }
        }
        tb(rawOperation) {
            if (rawOperation instanceof model.$Du) {
                return rawOperation;
            }
            return new model.$Du(rawOperation.identifier || null, this.validateRange(rawOperation.range), rawOperation.text, rawOperation.forceMoveMarkers || false, rawOperation.isAutoWhitespaceEdit || false, rawOperation._isTracked || false);
        }
        ub(rawOperations) {
            const result = [];
            for (let i = 0, len = rawOperations.length; i < len; i++) {
                result[i] = this.tb(rawOperations[i]);
            }
            return result;
        }
        pushEditOperations(beforeCursorState, editOperations, cursorStateComputer, group) {
            try {
                this.h.beginDeferredEmit();
                this.w.beginDeferredEmit();
                return this.vb(beforeCursorState, this.ub(editOperations), cursorStateComputer, group);
            }
            finally {
                this.w.endDeferredEmit();
                this.h.endDeferredEmit();
            }
        }
        vb(beforeCursorState, editOperations, cursorStateComputer, group) {
            if (this.F.trimAutoWhitespace && this.U) {
                // Go through each saved line number and insert a trim whitespace edit
                // if it is safe to do so (no conflicts with other edits).
                const incomingEdits = editOperations.map((op) => {
                    return {
                        range: this.validateRange(op.range),
                        text: op.text
                    };
                });
                // Sometimes, auto-formatters change ranges automatically which can cause undesired auto whitespace trimming near the cursor
                // We'll use the following heuristic: if the edits occur near the cursor, then it's ok to trim auto whitespace
                let editsAreNearCursors = true;
                if (beforeCursorState) {
                    for (let i = 0, len = beforeCursorState.length; i < len; i++) {
                        const sel = beforeCursorState[i];
                        let foundEditNearSel = false;
                        for (let j = 0, lenJ = incomingEdits.length; j < lenJ; j++) {
                            const editRange = incomingEdits[j].range;
                            const selIsAbove = editRange.startLineNumber > sel.endLineNumber;
                            const selIsBelow = sel.startLineNumber > editRange.endLineNumber;
                            if (!selIsAbove && !selIsBelow) {
                                foundEditNearSel = true;
                                break;
                            }
                        }
                        if (!foundEditNearSel) {
                            editsAreNearCursors = false;
                            break;
                        }
                    }
                }
                if (editsAreNearCursors) {
                    for (let i = 0, len = this.U.length; i < len; i++) {
                        const trimLineNumber = this.U[i];
                        const maxLineColumn = this.getLineMaxColumn(trimLineNumber);
                        let allowTrimLine = true;
                        for (let j = 0, lenJ = incomingEdits.length; j < lenJ; j++) {
                            const editRange = incomingEdits[j].range;
                            const editText = incomingEdits[j].text;
                            if (trimLineNumber < editRange.startLineNumber || trimLineNumber > editRange.endLineNumber) {
                                // `trimLine` is completely outside this edit
                                continue;
                            }
                            // At this point:
                            //   editRange.startLineNumber <= trimLine <= editRange.endLineNumber
                            if (trimLineNumber === editRange.startLineNumber && editRange.startColumn === maxLineColumn
                                && editRange.isEmpty() && editText && editText.length > 0 && editText.charAt(0) === '\n') {
                                // This edit inserts a new line (and maybe other text) after `trimLine`
                                continue;
                            }
                            if (trimLineNumber === editRange.startLineNumber && editRange.startColumn === 1
                                && editRange.isEmpty() && editText && editText.length > 0 && editText.charAt(editText.length - 1) === '\n') {
                                // This edit inserts a new line (and maybe other text) before `trimLine`
                                continue;
                            }
                            // Looks like we can't trim this line as it would interfere with an incoming edit
                            allowTrimLine = false;
                            break;
                        }
                        if (allowTrimLine) {
                            const trimRange = new range_1.$ks(trimLineNumber, 1, trimLineNumber, maxLineColumn);
                            editOperations.push(new model.$Du(null, trimRange, null, false, false, false));
                        }
                    }
                }
                this.U = null;
            }
            if (this.M === null) {
                this.M = this.fb.createSnapshot(this.uri);
            }
            return this.Q.pushEditOperation(beforeCursorState, editOperations, cursorStateComputer, group);
        }
        _applyUndo(changes, eol, resultingAlternativeVersionId, resultingSelection) {
            const edits = changes.map((change) => {
                const rangeStart = this.getPositionAt(change.newPosition);
                const rangeEnd = this.getPositionAt(change.newEnd);
                return {
                    range: new range_1.$ks(rangeStart.lineNumber, rangeStart.column, rangeEnd.lineNumber, rangeEnd.column),
                    text: change.oldText
                };
            });
            this.wb(edits, eol, true, false, resultingAlternativeVersionId, resultingSelection);
        }
        _applyRedo(changes, eol, resultingAlternativeVersionId, resultingSelection) {
            const edits = changes.map((change) => {
                const rangeStart = this.getPositionAt(change.oldPosition);
                const rangeEnd = this.getPositionAt(change.oldEnd);
                return {
                    range: new range_1.$ks(rangeStart.lineNumber, rangeStart.column, rangeEnd.lineNumber, rangeEnd.column),
                    text: change.newText
                };
            });
            this.wb(edits, eol, false, true, resultingAlternativeVersionId, resultingSelection);
        }
        wb(edits, eol, isUndoing, isRedoing, resultingAlternativeVersionId, resultingSelection) {
            try {
                this.h.beginDeferredEmit();
                this.w.beginDeferredEmit();
                this.R = isUndoing;
                this.S = isRedoing;
                this.applyEdits(edits, false);
                this.setEOL(eol);
                this._overwriteAlternativeVersionId(resultingAlternativeVersionId);
            }
            finally {
                this.R = false;
                this.S = false;
                this.w.endDeferredEmit(resultingSelection);
                this.h.endDeferredEmit();
            }
        }
        applyEdits(rawOperations, computeUndoEdits = false) {
            try {
                this.h.beginDeferredEmit();
                this.w.beginDeferredEmit();
                const operations = this.ub(rawOperations);
                return this.xb(operations, computeUndoEdits);
            }
            finally {
                this.w.endDeferredEmit();
                this.h.endDeferredEmit();
            }
        }
        xb(rawOperations, computeUndoEdits) {
            const oldLineCount = this.C.getLineCount();
            const result = this.C.applyEdits(rawOperations, this.F.trimAutoWhitespace, computeUndoEdits);
            const newLineCount = this.C.getLineCount();
            const contentChanges = result.changes;
            this.U = result.trimAutoWhitespaceLineNumbers;
            if (contentChanges.length !== 0) {
                // We do a first pass to update decorations
                // because we want to read decorations in the second pass
                // where we will emit content change events
                // and we want to read the final decorations
                for (let i = 0, len = contentChanges.length; i < len; i++) {
                    const change = contentChanges[i];
                    this.$.acceptReplace(change.rangeOffset, change.rangeLength, change.text.length, change.forceMoveMarkers);
                }
                const rawContentChanges = [];
                this.ob();
                let lineCount = oldLineCount;
                for (let i = 0, len = contentChanges.length; i < len; i++) {
                    const change = contentChanges[i];
                    const [eolCount] = (0, eolCounter_1.$Ws)(change.text);
                    this.h.fire();
                    const startLineNumber = change.range.startLineNumber;
                    const endLineNumber = change.range.endLineNumber;
                    const deletingLinesCnt = endLineNumber - startLineNumber;
                    const insertingLinesCnt = eolCount;
                    const editingLinesCnt = Math.min(deletingLinesCnt, insertingLinesCnt);
                    const changeLineCountDelta = (insertingLinesCnt - deletingLinesCnt);
                    const currentEditStartLineNumber = newLineCount - lineCount - changeLineCountDelta + startLineNumber;
                    const firstEditLineNumber = currentEditStartLineNumber;
                    const lastInsertedLineNumber = currentEditStartLineNumber + insertingLinesCnt;
                    const decorationsWithInjectedTextInEditedRange = this.$.getInjectedTextInInterval(this, this.getOffsetAt(new position_1.$js(firstEditLineNumber, 1)), this.getOffsetAt(new position_1.$js(lastInsertedLineNumber, this.getLineMaxColumn(lastInsertedLineNumber))), 0);
                    const injectedTextInEditedRange = textModelEvents_1.$ku.fromDecorations(decorationsWithInjectedTextInEditedRange);
                    const injectedTextInEditedRangeQueue = new arrays_1.$0b(injectedTextInEditedRange);
                    for (let j = editingLinesCnt; j >= 0; j--) {
                        const editLineNumber = startLineNumber + j;
                        const currentEditLineNumber = currentEditStartLineNumber + j;
                        injectedTextInEditedRangeQueue.takeFromEndWhile(r => r.lineNumber > currentEditLineNumber);
                        const decorationsInCurrentLine = injectedTextInEditedRangeQueue.takeFromEndWhile(r => r.lineNumber === currentEditLineNumber);
                        rawContentChanges.push(new textModelEvents_1.$lu(editLineNumber, this.getLineContent(currentEditLineNumber), decorationsInCurrentLine));
                    }
                    if (editingLinesCnt < deletingLinesCnt) {
                        // Must delete some lines
                        const spliceStartLineNumber = startLineNumber + editingLinesCnt;
                        rawContentChanges.push(new textModelEvents_1.$mu(spliceStartLineNumber + 1, endLineNumber));
                    }
                    if (editingLinesCnt < insertingLinesCnt) {
                        const injectedTextInEditedRangeQueue = new arrays_1.$0b(injectedTextInEditedRange);
                        // Must insert some lines
                        const spliceLineNumber = startLineNumber + editingLinesCnt;
                        const cnt = insertingLinesCnt - editingLinesCnt;
                        const fromLineNumber = newLineCount - lineCount - cnt + spliceLineNumber + 1;
                        const injectedTexts = [];
                        const newLines = [];
                        for (let i = 0; i < cnt; i++) {
                            const lineNumber = fromLineNumber + i;
                            newLines[i] = this.getLineContent(lineNumber);
                            injectedTextInEditedRangeQueue.takeWhile(r => r.lineNumber < lineNumber);
                            injectedTexts[i] = injectedTextInEditedRangeQueue.takeWhile(r => r.lineNumber === lineNumber);
                        }
                        rawContentChanges.push(new textModelEvents_1.$nu(spliceLineNumber + 1, startLineNumber + insertingLinesCnt, newLines, injectedTexts));
                    }
                    lineCount += changeLineCountDelta;
                }
                this.jb(new textModelEvents_1.$pu(rawContentChanges, this.getVersionId(), this.R, this.S), {
                    changes: contentChanges,
                    eol: this.C.getEOL(),
                    isEolChange: false,
                    versionId: this.getVersionId(),
                    isUndoing: this.R,
                    isRedoing: this.S,
                    isFlush: false
                });
            }
            return (result.reverseEdits === null ? undefined : result.reverseEdits);
        }
        undo() {
            return this.fb.undo(this.uri);
        }
        canUndo() {
            return this.fb.canUndo(this.uri);
        }
        redo() {
            return this.fb.redo(this.uri);
        }
        canRedo() {
            return this.fb.canRedo(this.uri);
        }
        //#endregion
        //#region Decorations
        yb(affectedInjectedTextLines) {
            // This is called before the decoration changed event is fired.
            if (affectedInjectedTextLines === null || affectedInjectedTextLines.size === 0) {
                return;
            }
            const affectedLines = Array.from(affectedInjectedTextLines);
            const lineChangeEvents = affectedLines.map(lineNumber => new textModelEvents_1.$lu(lineNumber, this.getLineContent(lineNumber), this.Ab(lineNumber)));
            this.u.fire(new textModelEvents_1.$qu(lineChangeEvents));
        }
        changeDecorations(callback, ownerId = 0) {
            this.ib();
            try {
                this.h.beginDeferredEmit();
                return this.zb(ownerId, callback);
            }
            finally {
                this.h.endDeferredEmit();
            }
        }
        zb(ownerId, callback) {
            const changeAccessor = {
                addDecoration: (range, options) => {
                    return this.Eb(ownerId, [], [{ range: range, options: options }])[0];
                },
                changeDecoration: (id, newRange) => {
                    this.Cb(id, newRange);
                },
                changeDecorationOptions: (id, options) => {
                    this.Db(id, _normalizeOptions(options));
                },
                removeDecoration: (id) => {
                    this.Eb(ownerId, [id], []);
                },
                deltaDecorations: (oldDecorations, newDecorations) => {
                    if (oldDecorations.length === 0 && newDecorations.length === 0) {
                        // nothing to do
                        return [];
                    }
                    return this.Eb(ownerId, oldDecorations, newDecorations);
                }
            };
            let result = null;
            try {
                result = callback(changeAccessor);
            }
            catch (e) {
                (0, errors_1.$Y)(e);
            }
            // Invalidate change accessor
            changeAccessor.addDecoration = invalidFunc;
            changeAccessor.changeDecoration = invalidFunc;
            changeAccessor.changeDecorationOptions = invalidFunc;
            changeAccessor.removeDecoration = invalidFunc;
            changeAccessor.deltaDecorations = invalidFunc;
            return result;
        }
        deltaDecorations(oldDecorations, newDecorations, ownerId = 0) {
            this.ib();
            if (!oldDecorations) {
                oldDecorations = [];
            }
            if (oldDecorations.length === 0 && newDecorations.length === 0) {
                // nothing to do
                return [];
            }
            try {
                this.X++;
                if (this.X > 1) {
                    console.warn(`Invoking deltaDecorations recursively could lead to leaking decorations.`);
                    (0, errors_1.$Y)(new Error(`Invoking deltaDecorations recursively could lead to leaking decorations.`));
                }
                this.h.beginDeferredEmit();
                return this.Eb(ownerId, oldDecorations, newDecorations);
            }
            finally {
                this.h.endDeferredEmit();
                this.X--;
            }
        }
        _getTrackedRange(id) {
            return this.getDecorationRange(id);
        }
        _setTrackedRange(id, newRange, newStickiness) {
            const node = (id ? this.Z[id] : null);
            if (!node) {
                if (!newRange) {
                    // node doesn't exist, the request is to delete => nothing to do
                    return null;
                }
                // node doesn't exist, the request is to set => add the tracked range
                return this.Eb(0, [], [{ range: newRange, options: TRACKED_RANGE_OPTIONS[newStickiness] }], true)[0];
            }
            if (!newRange) {
                // node exists, the request is to delete => delete node
                this.$.delete(node);
                delete this.Z[node.id];
                return null;
            }
            // node exists, the request is to set => change the tracked range and its options
            const range = this._validateRangeRelaxedNoAllocations(newRange);
            const startOffset = this.C.getOffsetAt(range.startLineNumber, range.startColumn);
            const endOffset = this.C.getOffsetAt(range.endLineNumber, range.endColumn);
            this.$.delete(node);
            node.reset(this.getVersionId(), startOffset, endOffset, range);
            node.setOptions(TRACKED_RANGE_OPTIONS[newStickiness]);
            this.$.insert(node);
            return node.id;
        }
        removeAllDecorationsWithOwnerId(ownerId) {
            if (this.H) {
                return;
            }
            const nodes = this.$.collectNodesFromOwner(ownerId);
            for (let i = 0, len = nodes.length; i < len; i++) {
                const node = nodes[i];
                this.$.delete(node);
                delete this.Z[node.id];
            }
        }
        getDecorationOptions(decorationId) {
            const node = this.Z[decorationId];
            if (!node) {
                return null;
            }
            return node.options;
        }
        getDecorationRange(decorationId) {
            const node = this.Z[decorationId];
            if (!node) {
                return null;
            }
            return this.$.getNodeRange(this, node);
        }
        getLineDecorations(lineNumber, ownerId = 0, filterOutValidation = false) {
            if (lineNumber < 1 || lineNumber > this.getLineCount()) {
                return [];
            }
            return this.getLinesDecorations(lineNumber, lineNumber, ownerId, filterOutValidation);
        }
        getLinesDecorations(_startLineNumber, _endLineNumber, ownerId = 0, filterOutValidation = false, onlyMarginDecorations = false) {
            const lineCount = this.getLineCount();
            const startLineNumber = Math.min(lineCount, Math.max(1, _startLineNumber));
            const endLineNumber = Math.min(lineCount, Math.max(1, _endLineNumber));
            const endColumn = this.getLineMaxColumn(endLineNumber);
            const range = new range_1.$ks(startLineNumber, 1, endLineNumber, endColumn);
            const decorations = this.Bb(range, ownerId, filterOutValidation, onlyMarginDecorations);
            (0, arrays_1.$Yb)(decorations, this.ab.getDecorationsInRange(range, ownerId, filterOutValidation));
            return decorations;
        }
        getDecorationsInRange(range, ownerId = 0, filterOutValidation = false, onlyMinimapDecorations = false, onlyMarginDecorations = false) {
            const validatedRange = this.validateRange(range);
            const decorations = this.Bb(validatedRange, ownerId, filterOutValidation, onlyMarginDecorations);
            (0, arrays_1.$Yb)(decorations, this.ab.getDecorationsInRange(validatedRange, ownerId, filterOutValidation, onlyMinimapDecorations));
            return decorations;
        }
        getOverviewRulerDecorations(ownerId = 0, filterOutValidation = false) {
            return this.$.getAll(this, ownerId, filterOutValidation, true, false);
        }
        getInjectedTextDecorations(ownerId = 0) {
            return this.$.getAllInjectedText(this, ownerId);
        }
        Ab(lineNumber) {
            const startOffset = this.C.getOffsetAt(lineNumber, 1);
            const endOffset = startOffset + this.C.getLineLength(lineNumber);
            const result = this.$.getInjectedTextInInterval(this, startOffset, endOffset, 0);
            return textModelEvents_1.$ku.fromDecorations(result).filter(t => t.lineNumber === lineNumber);
        }
        getAllDecorations(ownerId = 0, filterOutValidation = false) {
            let result = this.$.getAll(this, ownerId, filterOutValidation, false, false);
            result = result.concat(this.ab.getAllDecorations(ownerId, filterOutValidation));
            return result;
        }
        getAllMarginDecorations(ownerId = 0) {
            return this.$.getAll(this, ownerId, false, false, true);
        }
        Bb(filterRange, filterOwnerId, filterOutValidation, onlyMarginDecorations) {
            const startOffset = this.C.getOffsetAt(filterRange.startLineNumber, filterRange.startColumn);
            const endOffset = this.C.getOffsetAt(filterRange.endLineNumber, filterRange.endColumn);
            return this.$.getAllInInterval(this, startOffset, endOffset, filterOwnerId, filterOutValidation, onlyMarginDecorations);
        }
        getRangeAt(start, end) {
            return this.C.getRangeAt(start, end - start);
        }
        Cb(decorationId, _range) {
            const node = this.Z[decorationId];
            if (!node) {
                return;
            }
            if (node.options.after) {
                const oldRange = this.getDecorationRange(decorationId);
                this.h.recordLineAffectedByInjectedText(oldRange.endLineNumber);
            }
            if (node.options.before) {
                const oldRange = this.getDecorationRange(decorationId);
                this.h.recordLineAffectedByInjectedText(oldRange.startLineNumber);
            }
            const range = this._validateRangeRelaxedNoAllocations(_range);
            const startOffset = this.C.getOffsetAt(range.startLineNumber, range.startColumn);
            const endOffset = this.C.getOffsetAt(range.endLineNumber, range.endColumn);
            this.$.delete(node);
            node.reset(this.getVersionId(), startOffset, endOffset, range);
            this.$.insert(node);
            this.h.checkAffectedAndFire(node.options);
            if (node.options.after) {
                this.h.recordLineAffectedByInjectedText(range.endLineNumber);
            }
            if (node.options.before) {
                this.h.recordLineAffectedByInjectedText(range.startLineNumber);
            }
        }
        Db(decorationId, options) {
            const node = this.Z[decorationId];
            if (!node) {
                return;
            }
            const nodeWasInOverviewRuler = (node.options.overviewRuler && node.options.overviewRuler.color ? true : false);
            const nodeIsInOverviewRuler = (options.overviewRuler && options.overviewRuler.color ? true : false);
            this.h.checkAffectedAndFire(node.options);
            this.h.checkAffectedAndFire(options);
            if (node.options.after || options.after) {
                const nodeRange = this.$.getNodeRange(this, node);
                this.h.recordLineAffectedByInjectedText(nodeRange.endLineNumber);
            }
            if (node.options.before || options.before) {
                const nodeRange = this.$.getNodeRange(this, node);
                this.h.recordLineAffectedByInjectedText(nodeRange.startLineNumber);
            }
            if (nodeWasInOverviewRuler !== nodeIsInOverviewRuler) {
                // Delete + Insert due to an overview ruler status change
                this.$.delete(node);
                node.setOptions(options);
                this.$.insert(node);
            }
            else {
                node.setOptions(options);
            }
        }
        Eb(ownerId, oldDecorationsIds, newDecorations, suppressEvents = false) {
            const versionId = this.getVersionId();
            const oldDecorationsLen = oldDecorationsIds.length;
            let oldDecorationIndex = 0;
            const newDecorationsLen = newDecorations.length;
            let newDecorationIndex = 0;
            this.h.beginDeferredEmit();
            try {
                const result = new Array(newDecorationsLen);
                while (oldDecorationIndex < oldDecorationsLen || newDecorationIndex < newDecorationsLen) {
                    let node = null;
                    if (oldDecorationIndex < oldDecorationsLen) {
                        // (1) get ourselves an old node
                        do {
                            node = this.Z[oldDecorationsIds[oldDecorationIndex++]];
                        } while (!node && oldDecorationIndex < oldDecorationsLen);
                        // (2) remove the node from the tree (if it exists)
                        if (node) {
                            if (node.options.after) {
                                const nodeRange = this.$.getNodeRange(this, node);
                                this.h.recordLineAffectedByInjectedText(nodeRange.endLineNumber);
                            }
                            if (node.options.before) {
                                const nodeRange = this.$.getNodeRange(this, node);
                                this.h.recordLineAffectedByInjectedText(nodeRange.startLineNumber);
                            }
                            this.$.delete(node);
                            if (!suppressEvents) {
                                this.h.checkAffectedAndFire(node.options);
                            }
                        }
                    }
                    if (newDecorationIndex < newDecorationsLen) {
                        // (3) create a new node if necessary
                        if (!node) {
                            const internalDecorationId = (++this.Y);
                            const decorationId = `${this.W};${internalDecorationId}`;
                            node = new intervalTree_1.$4B(decorationId, 0, 0);
                            this.Z[decorationId] = node;
                        }
                        // (4) initialize node
                        const newDecoration = newDecorations[newDecorationIndex];
                        const range = this._validateRangeRelaxedNoAllocations(newDecoration.range);
                        const options = _normalizeOptions(newDecoration.options);
                        const startOffset = this.C.getOffsetAt(range.startLineNumber, range.startColumn);
                        const endOffset = this.C.getOffsetAt(range.endLineNumber, range.endColumn);
                        node.ownerId = ownerId;
                        node.reset(versionId, startOffset, endOffset, range);
                        node.setOptions(options);
                        if (node.options.after) {
                            this.h.recordLineAffectedByInjectedText(range.endLineNumber);
                        }
                        if (node.options.before) {
                            this.h.recordLineAffectedByInjectedText(range.startLineNumber);
                        }
                        if (!suppressEvents) {
                            this.h.checkAffectedAndFire(options);
                        }
                        this.$.insert(node);
                        result[newDecorationIndex] = node.id;
                        newDecorationIndex++;
                    }
                    else {
                        if (node) {
                            delete this.Z[node.id];
                        }
                    }
                }
                return result;
            }
            finally {
                this.h.endDeferredEmit();
            }
        }
        //#endregion
        //#region Tokenization
        // TODO move them to the tokenization part.
        getLanguageId() {
            return this.tokenization.getLanguageId();
        }
        setLanguage(languageIdOrSelection, source) {
            if (typeof languageIdOrSelection === 'string') {
                this.G.clear();
                this.Fb(languageIdOrSelection, source);
            }
            else {
                this.G.value = languageIdOrSelection.onDidChange(() => this.Fb(languageIdOrSelection.languageId, source));
                this.Fb(languageIdOrSelection.languageId, source);
            }
        }
        Fb(languageId, source) {
            this.tokenization.setLanguageId(languageId, source);
            this.gb.requestRichLanguageFeatures(languageId);
        }
        getLanguageIdAtPosition(lineNumber, column) {
            return this.tokenization.getLanguageIdAtPosition(lineNumber, column);
        }
        getWordAtPosition(position) {
            return this.bb.getWordAtPosition(position);
        }
        getWordUntilPosition(position) {
            return this.bb.getWordUntilPosition(position);
        }
        //#endregion
        normalizePosition(position, affinity) {
            return position;
        }
        /**
         * Gets the column at which indentation stops at a given line.
         * @internal
        */
        getLineIndentColumn(lineNumber) {
            // Columns start with 1.
            return indentOfLine(this.getLineContent(lineNumber)) + 1;
        }
    };
    exports.$MC = $MC;
    exports.$MC = $MC = $MC_1 = __decorate([
        __param(4, undoRedo_1.$wu),
        __param(5, language_1.$ct),
        __param(6, languageConfigurationRegistry_1.$2t)
    ], $MC);
    function indentOfLine(line) {
        let indent = 0;
        for (const c of line) {
            if (c === ' ' || c === '\t') {
                indent++;
            }
            else {
                break;
            }
        }
        return indent;
    }
    //#region Decorations
    function isNodeInOverviewRuler(node) {
        return (node.options.overviewRuler && node.options.overviewRuler.color ? true : false);
    }
    function isNodeInjectedText(node) {
        return !!node.options.after || !!node.options.before;
    }
    class DecorationsTrees {
        constructor() {
            this.a = new intervalTree_1.$6B();
            this.b = new intervalTree_1.$6B();
            this.d = new intervalTree_1.$6B();
        }
        ensureAllNodesHaveRanges(host) {
            this.getAll(host, 0, false, false, false);
        }
        f(host, nodes) {
            for (const node of nodes) {
                if (node.range === null) {
                    node.range = host.getRangeAt(node.cachedAbsoluteStart, node.cachedAbsoluteEnd);
                }
            }
            return nodes;
        }
        getAllInInterval(host, start, end, filterOwnerId, filterOutValidation, onlyMarginDecorations) {
            const versionId = host.getVersionId();
            const result = this.g(start, end, filterOwnerId, filterOutValidation, versionId, onlyMarginDecorations);
            return this.f(host, result);
        }
        g(start, end, filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations) {
            const r0 = this.a.intervalSearch(start, end, filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations);
            const r1 = this.b.intervalSearch(start, end, filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations);
            const r2 = this.d.intervalSearch(start, end, filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations);
            return r0.concat(r1).concat(r2);
        }
        getInjectedTextInInterval(host, start, end, filterOwnerId) {
            const versionId = host.getVersionId();
            const result = this.d.intervalSearch(start, end, filterOwnerId, false, versionId, false);
            return this.f(host, result).filter((i) => i.options.showIfCollapsed || !i.range.isEmpty());
        }
        getAllInjectedText(host, filterOwnerId) {
            const versionId = host.getVersionId();
            const result = this.d.search(filterOwnerId, false, versionId, false);
            return this.f(host, result).filter((i) => i.options.showIfCollapsed || !i.range.isEmpty());
        }
        getAll(host, filterOwnerId, filterOutValidation, overviewRulerOnly, onlyMarginDecorations) {
            const versionId = host.getVersionId();
            const result = this.h(filterOwnerId, filterOutValidation, overviewRulerOnly, versionId, onlyMarginDecorations);
            return this.f(host, result);
        }
        h(filterOwnerId, filterOutValidation, overviewRulerOnly, cachedVersionId, onlyMarginDecorations) {
            if (overviewRulerOnly) {
                return this.b.search(filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations);
            }
            else {
                const r0 = this.a.search(filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations);
                const r1 = this.b.search(filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations);
                const r2 = this.d.search(filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations);
                return r0.concat(r1).concat(r2);
            }
        }
        collectNodesFromOwner(ownerId) {
            const r0 = this.a.collectNodesFromOwner(ownerId);
            const r1 = this.b.collectNodesFromOwner(ownerId);
            const r2 = this.d.collectNodesFromOwner(ownerId);
            return r0.concat(r1).concat(r2);
        }
        collectNodesPostOrder() {
            const r0 = this.a.collectNodesPostOrder();
            const r1 = this.b.collectNodesPostOrder();
            const r2 = this.d.collectNodesPostOrder();
            return r0.concat(r1).concat(r2);
        }
        insert(node) {
            if (isNodeInjectedText(node)) {
                this.d.insert(node);
            }
            else if (isNodeInOverviewRuler(node)) {
                this.b.insert(node);
            }
            else {
                this.a.insert(node);
            }
        }
        delete(node) {
            if (isNodeInjectedText(node)) {
                this.d.delete(node);
            }
            else if (isNodeInOverviewRuler(node)) {
                this.b.delete(node);
            }
            else {
                this.a.delete(node);
            }
        }
        getNodeRange(host, node) {
            const versionId = host.getVersionId();
            if (node.cachedVersionId !== versionId) {
                this.k(node, versionId);
            }
            if (node.range === null) {
                node.range = host.getRangeAt(node.cachedAbsoluteStart, node.cachedAbsoluteEnd);
            }
            return node.range;
        }
        k(node, cachedVersionId) {
            if (isNodeInjectedText(node)) {
                this.d.resolveNode(node, cachedVersionId);
            }
            else if (isNodeInOverviewRuler(node)) {
                this.b.resolveNode(node, cachedVersionId);
            }
            else {
                this.a.resolveNode(node, cachedVersionId);
            }
        }
        acceptReplace(offset, length, textLength, forceMoveMarkers) {
            this.a.acceptReplace(offset, length, textLength, forceMoveMarkers);
            this.b.acceptReplace(offset, length, textLength, forceMoveMarkers);
            this.d.acceptReplace(offset, length, textLength, forceMoveMarkers);
        }
    }
    function cleanClassName(className) {
        return className.replace(/[^a-z0-9\-_]/gi, ' ');
    }
    class DecorationOptions {
        constructor(options) {
            this.color = options.color || '';
            this.darkColor = options.darkColor || '';
        }
    }
    class $NC extends DecorationOptions {
        constructor(options) {
            super(options);
            this.a = null;
            this.position = (typeof options.position === 'number' ? options.position : model.OverviewRulerLane.Center);
        }
        getColor(theme) {
            if (!this.a) {
                if (theme.type !== 'light' && this.darkColor) {
                    this.a = this.b(this.darkColor, theme);
                }
                else {
                    this.a = this.b(this.color, theme);
                }
            }
            return this.a;
        }
        invalidateCachedColor() {
            this.a = null;
        }
        b(color, theme) {
            if (typeof color === 'string') {
                return color;
            }
            const c = color ? theme.getColor(color.id) : null;
            if (!c) {
                return '';
            }
            return c.toString();
        }
    }
    exports.$NC = $NC;
    class $OC {
        constructor(options) {
            this.position = options?.position ?? model.GlyphMarginLane.Left;
        }
    }
    exports.$OC = $OC;
    class $PC extends DecorationOptions {
        constructor(options) {
            super(options);
            this.position = options.position;
        }
        getColor(theme) {
            if (!this.a) {
                if (theme.type !== 'light' && this.darkColor) {
                    this.a = this.b(this.darkColor, theme);
                }
                else {
                    this.a = this.b(this.color, theme);
                }
            }
            return this.a;
        }
        invalidateCachedColor() {
            this.a = undefined;
        }
        b(color, theme) {
            if (typeof color === 'string') {
                return color_1.$Os.fromHex(color);
            }
            return theme.getColor(color.id);
        }
    }
    exports.$PC = $PC;
    class $QC {
        static from(options) {
            if (options instanceof $QC) {
                return options;
            }
            return new $QC(options);
        }
        constructor(options) {
            this.content = options.content || '';
            this.inlineClassName = options.inlineClassName || null;
            this.inlineClassNameAffectsLetterSpacing = options.inlineClassNameAffectsLetterSpacing || false;
            this.attachedData = options.attachedData || null;
            this.cursorStops = options.cursorStops || null;
        }
    }
    exports.$QC = $QC;
    class $RC {
        static register(options) {
            return new $RC(options);
        }
        static createDynamic(options) {
            return new $RC(options);
        }
        constructor(options) {
            this.description = options.description;
            this.blockClassName = options.blockClassName ? cleanClassName(options.blockClassName) : null;
            this.blockDoesNotCollapse = options.blockDoesNotCollapse ?? null;
            this.blockIsAfterEnd = options.blockIsAfterEnd ?? null;
            this.blockPadding = options.blockPadding ?? null;
            this.stickiness = options.stickiness || 0 /* model.TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */;
            this.zIndex = options.zIndex || 0;
            this.className = options.className ? cleanClassName(options.className) : null;
            this.shouldFillLineOnLineBreak = options.shouldFillLineOnLineBreak ?? null;
            this.hoverMessage = options.hoverMessage || null;
            this.glyphMarginHoverMessage = options.glyphMarginHoverMessage || null;
            this.isWholeLine = options.isWholeLine || false;
            this.showIfCollapsed = options.showIfCollapsed || false;
            this.collapseOnReplaceEdit = options.collapseOnReplaceEdit || false;
            this.overviewRuler = options.overviewRuler ? new $NC(options.overviewRuler) : null;
            this.minimap = options.minimap ? new $PC(options.minimap) : null;
            this.glyphMargin = options.glyphMarginClassName ? new $OC(options.glyphMargin) : null;
            this.glyphMarginClassName = options.glyphMarginClassName ? cleanClassName(options.glyphMarginClassName) : null;
            this.linesDecorationsClassName = options.linesDecorationsClassName ? cleanClassName(options.linesDecorationsClassName) : null;
            this.firstLineDecorationClassName = options.firstLineDecorationClassName ? cleanClassName(options.firstLineDecorationClassName) : null;
            this.marginClassName = options.marginClassName ? cleanClassName(options.marginClassName) : null;
            this.inlineClassName = options.inlineClassName ? cleanClassName(options.inlineClassName) : null;
            this.inlineClassNameAffectsLetterSpacing = options.inlineClassNameAffectsLetterSpacing || false;
            this.beforeContentClassName = options.beforeContentClassName ? cleanClassName(options.beforeContentClassName) : null;
            this.afterContentClassName = options.afterContentClassName ? cleanClassName(options.afterContentClassName) : null;
            this.after = options.after ? $QC.from(options.after) : null;
            this.before = options.before ? $QC.from(options.before) : null;
            this.hideInCommentTokens = options.hideInCommentTokens ?? false;
            this.hideInStringTokens = options.hideInStringTokens ?? false;
        }
    }
    exports.$RC = $RC;
    $RC.EMPTY = $RC.register({ description: 'empty' });
    /**
     * The order carefully matches the values of the enum.
     */
    const TRACKED_RANGE_OPTIONS = [
        $RC.register({ description: 'tracked-range-always-grows-when-typing-at-edges', stickiness: 0 /* model.TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */ }),
        $RC.register({ description: 'tracked-range-never-grows-when-typing-at-edges', stickiness: 1 /* model.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */ }),
        $RC.register({ description: 'tracked-range-grows-only-when-typing-before', stickiness: 2 /* model.TrackedRangeStickiness.GrowsOnlyWhenTypingBefore */ }),
        $RC.register({ description: 'tracked-range-grows-only-when-typing-after', stickiness: 3 /* model.TrackedRangeStickiness.GrowsOnlyWhenTypingAfter */ }),
    ];
    function _normalizeOptions(options) {
        if (options instanceof $RC) {
            return options;
        }
        return $RC.createDynamic(options);
    }
    class DidChangeDecorationsEmitter extends lifecycle_1.$kc {
        constructor(u) {
            super();
            this.u = u;
            this.a = this.B(new event_1.$fd());
            this.event = this.a.event;
            this.n = null;
            this.b = 0;
            this.f = false;
            this.g = false;
            this.h = false;
            this.s = false;
        }
        hasListeners() {
            return this.a.hasListeners();
        }
        beginDeferredEmit() {
            this.b++;
        }
        endDeferredEmit() {
            this.b--;
            if (this.b === 0) {
                if (this.f) {
                    this.y();
                }
                this.n?.clear();
                this.n = null;
            }
        }
        recordLineAffectedByInjectedText(lineNumber) {
            if (!this.n) {
                this.n = new Set();
            }
            this.n.add(lineNumber);
        }
        checkAffectedAndFire(options) {
            if (!this.g) {
                this.g = options.minimap && options.minimap.position ? true : false;
            }
            if (!this.h) {
                this.h = options.overviewRuler && options.overviewRuler.color ? true : false;
            }
            if (!this.s) {
                this.s = options.glyphMarginClassName ? true : false;
            }
            this.w();
        }
        fire() {
            this.g = true;
            this.h = true;
            this.s = true;
            this.w();
        }
        w() {
            if (this.b === 0) {
                this.y();
            }
            else {
                this.f = true;
            }
        }
        y() {
            this.u(this.n);
            const event = {
                affectsMinimap: this.g,
                affectsOverviewRuler: this.h,
                affectsGlyphMargin: this.s
            };
            this.f = false;
            this.g = false;
            this.h = false;
            this.s = false;
            this.a.fire(event);
        }
    }
    //#endregion
    class DidChangeContentEmitter extends lifecycle_1.$kc {
        constructor() {
            super();
            /**
             * Both `fastEvent` and `slowEvent` work the same way and contain the same events, but first we invoke `fastEvent` and then `slowEvent`.
             */
            this.a = this.B(new event_1.$fd());
            this.fastEvent = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.slowEvent = this.b.event;
            this.f = 0;
            this.g = null;
        }
        hasListeners() {
            return (this.a.hasListeners()
                || this.b.hasListeners());
        }
        beginDeferredEmit() {
            this.f++;
        }
        endDeferredEmit(resultingSelection = null) {
            this.f--;
            if (this.f === 0) {
                if (this.g !== null) {
                    this.g.rawContentChangedEvent.resultingSelection = resultingSelection;
                    const e = this.g;
                    this.g = null;
                    this.a.fire(e);
                    this.b.fire(e);
                }
            }
        }
        fire(e) {
            if (this.f > 0) {
                if (this.g) {
                    this.g = this.g.merge(e);
                }
                else {
                    this.g = e;
                }
                return;
            }
            this.a.fire(e);
            this.b.fire(e);
        }
    }
    /**
     * @internal
     */
    class $SC {
        constructor() {
            this.a = new event_1.$fd();
            this.onDidChangeVisibleRanges = this.a.event;
            this.b = new Set();
        }
        attachView() {
            const view = new AttachedViewImpl((state) => {
                this.a.fire({ view, state });
            });
            this.b.add(view);
            return view;
        }
        detachView(view) {
            this.b.delete(view);
            this.a.fire({ view, state: undefined });
        }
    }
    exports.$SC = $SC;
    class AttachedViewImpl {
        constructor(a) {
            this.a = a;
        }
        setVisibleLines(visibleLines, stabilized) {
            const visibleLineRanges = visibleLines.map((line) => new lineRange_1.$ts(line.startLineNumber, line.endLineNumber + 1));
            this.a({ visibleLineRanges, stabilized });
        }
    }
});
//# sourceMappingURL=textModel.js.map