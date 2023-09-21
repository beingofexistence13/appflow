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
    var TextModel_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AttachedViews = exports.ModelDecorationOptions = exports.ModelDecorationInjectedTextOptions = exports.ModelDecorationMinimapOptions = exports.ModelDecorationGlyphMarginOptions = exports.ModelDecorationOverviewRulerOptions = exports.TextModel = exports.createTextBuffer = exports.createTextBufferFactoryFromSnapshot = exports.createTextBufferFactoryFromStream = exports.createTextBufferFactory = void 0;
    function createTextBufferFactory(text) {
        const builder = new pieceTreeTextBufferBuilder_1.PieceTreeTextBufferBuilder();
        builder.acceptChunk(text);
        return builder.finish();
    }
    exports.createTextBufferFactory = createTextBufferFactory;
    function createTextBufferFactoryFromStream(stream) {
        return new Promise((resolve, reject) => {
            const builder = new pieceTreeTextBufferBuilder_1.PieceTreeTextBufferBuilder();
            let done = false;
            (0, stream_1.listenStream)(stream, {
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
    exports.createTextBufferFactoryFromStream = createTextBufferFactoryFromStream;
    function createTextBufferFactoryFromSnapshot(snapshot) {
        const builder = new pieceTreeTextBufferBuilder_1.PieceTreeTextBufferBuilder();
        let chunk;
        while (typeof (chunk = snapshot.read()) === 'string') {
            builder.acceptChunk(chunk);
        }
        return builder.finish();
    }
    exports.createTextBufferFactoryFromSnapshot = createTextBufferFactoryFromSnapshot;
    function createTextBuffer(value, defaultEOL) {
        let factory;
        if (typeof value === 'string') {
            factory = createTextBufferFactory(value);
        }
        else if (model.isITextSnapshot(value)) {
            factory = createTextBufferFactoryFromSnapshot(value);
        }
        else {
            factory = value;
        }
        return factory.create(defaultEOL);
    }
    exports.createTextBuffer = createTextBuffer;
    let MODEL_ID = 0;
    const LIMIT_FIND_COUNT = 999;
    const LONG_LINE_BOUNDARY = 10000;
    class TextModelSnapshot {
        constructor(source) {
            this._source = source;
            this._eos = false;
        }
        read() {
            if (this._eos) {
                return null;
            }
            const result = [];
            let resultCnt = 0;
            let resultLength = 0;
            do {
                const tmp = this._source.read();
                if (tmp === null) {
                    // end-of-stream
                    this._eos = true;
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
    let TextModel = class TextModel extends lifecycle_1.Disposable {
        static { TextModel_1 = this; }
        static { this._MODEL_SYNC_LIMIT = 50 * 1024 * 1024; } // 50 MB,  // used in tests
        static { this.LARGE_FILE_SIZE_THRESHOLD = 20 * 1024 * 1024; } // 20 MB;
        static { this.LARGE_FILE_LINE_COUNT_THRESHOLD = 300 * 1000; } // 300K lines
        static { this.LARGE_FILE_HEAP_OPERATION_THRESHOLD = 256 * 1024 * 1024; } // 256M characters, usually ~> 512MB memory usage
        static { this.DEFAULT_CREATION_OPTIONS = {
            isForSimpleWidget: false,
            tabSize: textModelDefaults_1.EDITOR_MODEL_DEFAULTS.tabSize,
            indentSize: textModelDefaults_1.EDITOR_MODEL_DEFAULTS.indentSize,
            insertSpaces: textModelDefaults_1.EDITOR_MODEL_DEFAULTS.insertSpaces,
            detectIndentation: false,
            defaultEOL: 1 /* model.DefaultEndOfLine.LF */,
            trimAutoWhitespace: textModelDefaults_1.EDITOR_MODEL_DEFAULTS.trimAutoWhitespace,
            largeFileOptimizations: textModelDefaults_1.EDITOR_MODEL_DEFAULTS.largeFileOptimizations,
            bracketPairColorizationOptions: textModelDefaults_1.EDITOR_MODEL_DEFAULTS.bracketPairColorizationOptions,
        }; }
        static resolveOptions(textBuffer, options) {
            if (options.detectIndentation) {
                const guessedIndentation = (0, indentationGuesser_1.guessIndentation)(textBuffer, options.tabSize, options.insertSpaces);
                return new model.TextModelResolvedOptions({
                    tabSize: guessedIndentation.tabSize,
                    indentSize: 'tabSize',
                    insertSpaces: guessedIndentation.insertSpaces,
                    trimAutoWhitespace: options.trimAutoWhitespace,
                    defaultEOL: options.defaultEOL,
                    bracketPairColorizationOptions: options.bracketPairColorizationOptions,
                });
            }
            return new model.TextModelResolvedOptions(options);
        }
        get onDidChangeLanguage() { return this._tokenizationTextModelPart.onDidChangeLanguage; }
        get onDidChangeLanguageConfiguration() { return this._tokenizationTextModelPart.onDidChangeLanguageConfiguration; }
        get onDidChangeTokens() { return this._tokenizationTextModelPart.onDidChangeTokens; }
        onDidChangeContent(listener) {
            return this._eventEmitter.slowEvent((e) => listener(e.contentChangedEvent));
        }
        onDidChangeContentOrInjectedText(listener) {
            return (0, lifecycle_1.combinedDisposable)(this._eventEmitter.fastEvent(e => listener(e)), this._onDidChangeInjectedText.event(e => listener(e)));
        }
        _isDisposing() { return this.__isDisposing; }
        get tokenization() { return this._tokenizationTextModelPart; }
        get bracketPairs() { return this._bracketPairs; }
        get guides() { return this._guidesTextModelPart; }
        constructor(source, languageIdOrSelection, creationOptions, associatedResource = null, _undoRedoService, _languageService, _languageConfigurationService) {
            super();
            this._undoRedoService = _undoRedoService;
            this._languageService = _languageService;
            this._languageConfigurationService = _languageConfigurationService;
            //#region Events
            this._onWillDispose = this._register(new event_1.Emitter());
            this.onWillDispose = this._onWillDispose.event;
            this._onDidChangeDecorations = this._register(new DidChangeDecorationsEmitter(affectedInjectedTextLines => this.handleBeforeFireDecorationsChangedEvent(affectedInjectedTextLines)));
            this.onDidChangeDecorations = this._onDidChangeDecorations.event;
            this._onDidChangeOptions = this._register(new event_1.Emitter());
            this.onDidChangeOptions = this._onDidChangeOptions.event;
            this._onDidChangeAttached = this._register(new event_1.Emitter());
            this.onDidChangeAttached = this._onDidChangeAttached.event;
            this._onDidChangeInjectedText = this._register(new event_1.Emitter());
            this._eventEmitter = this._register(new DidChangeContentEmitter());
            this._languageSelectionListener = this._register(new lifecycle_1.MutableDisposable());
            this._deltaDecorationCallCnt = 0;
            this._attachedViews = new AttachedViews();
            // Generate a new unique model id
            MODEL_ID++;
            this.id = '$model' + MODEL_ID;
            this.isForSimpleWidget = creationOptions.isForSimpleWidget;
            if (typeof associatedResource === 'undefined' || associatedResource === null) {
                this._associatedResource = uri_1.URI.parse('inmemory://model/' + MODEL_ID);
            }
            else {
                this._associatedResource = associatedResource;
            }
            this._attachedEditorCount = 0;
            const { textBuffer, disposable } = createTextBuffer(source, creationOptions.defaultEOL);
            this._buffer = textBuffer;
            this._bufferDisposable = disposable;
            this._options = TextModel_1.resolveOptions(this._buffer, creationOptions);
            const languageId = (typeof languageIdOrSelection === 'string' ? languageIdOrSelection : languageIdOrSelection.languageId);
            if (typeof languageIdOrSelection !== 'string') {
                this._languageSelectionListener.value = languageIdOrSelection.onDidChange(() => this._setLanguage(languageIdOrSelection.languageId));
            }
            this._bracketPairs = this._register(new bracketPairsImpl_1.BracketPairsTextModelPart(this, this._languageConfigurationService));
            this._guidesTextModelPart = this._register(new guidesTextModelPart_1.GuidesTextModelPart(this, this._languageConfigurationService));
            this._decorationProvider = this._register(new colorizedBracketPairsDecorationProvider_1.ColorizedBracketPairsDecorationProvider(this));
            this._tokenizationTextModelPart = new tokenizationTextModelPart_1.TokenizationTextModelPart(this._languageService, this._languageConfigurationService, this, this._bracketPairs, languageId, this._attachedViews);
            const bufferLineCount = this._buffer.getLineCount();
            const bufferTextLength = this._buffer.getValueLengthInRange(new range_1.Range(1, 1, bufferLineCount, this._buffer.getLineLength(bufferLineCount) + 1), 0 /* model.EndOfLinePreference.TextDefined */);
            // !!! Make a decision in the ctor and permanently respect this decision !!!
            // If a model is too large at construction time, it will never get tokenized,
            // under no circumstances.
            if (creationOptions.largeFileOptimizations) {
                this._isTooLargeForTokenization = ((bufferTextLength > TextModel_1.LARGE_FILE_SIZE_THRESHOLD)
                    || (bufferLineCount > TextModel_1.LARGE_FILE_LINE_COUNT_THRESHOLD));
                this._isTooLargeForHeapOperation = bufferTextLength > TextModel_1.LARGE_FILE_HEAP_OPERATION_THRESHOLD;
            }
            else {
                this._isTooLargeForTokenization = false;
                this._isTooLargeForHeapOperation = false;
            }
            this._isTooLargeForSyncing = (bufferTextLength > TextModel_1._MODEL_SYNC_LIMIT);
            this._versionId = 1;
            this._alternativeVersionId = 1;
            this._initialUndoRedoSnapshot = null;
            this._isDisposed = false;
            this.__isDisposing = false;
            this._instanceId = strings.singleLetterHash(MODEL_ID);
            this._lastDecorationId = 0;
            this._decorations = Object.create(null);
            this._decorationsTree = new DecorationsTrees();
            this._commandManager = new editStack_1.EditStack(this, this._undoRedoService);
            this._isUndoing = false;
            this._isRedoing = false;
            this._trimAutoWhitespaceLines = null;
            this._register(this._decorationProvider.onDidChange(() => {
                this._onDidChangeDecorations.beginDeferredEmit();
                this._onDidChangeDecorations.fire();
                this._onDidChangeDecorations.endDeferredEmit();
            }));
            this._languageService.requestRichLanguageFeatures(languageId);
        }
        dispose() {
            this.__isDisposing = true;
            this._onWillDispose.fire();
            this._tokenizationTextModelPart.dispose();
            this._isDisposed = true;
            super.dispose();
            this._bufferDisposable.dispose();
            this.__isDisposing = false;
            // Manually release reference to previous text buffer to avoid large leaks
            // in case someone leaks a TextModel reference
            const emptyDisposedTextBuffer = new pieceTreeTextBuffer_1.PieceTreeTextBuffer([], '', '\n', false, false, true, true);
            emptyDisposedTextBuffer.dispose();
            this._buffer = emptyDisposedTextBuffer;
            this._bufferDisposable = lifecycle_1.Disposable.None;
        }
        _hasListeners() {
            return (this._onWillDispose.hasListeners()
                || this._onDidChangeDecorations.hasListeners()
                || this._tokenizationTextModelPart._hasListeners()
                || this._onDidChangeOptions.hasListeners()
                || this._onDidChangeAttached.hasListeners()
                || this._onDidChangeInjectedText.hasListeners()
                || this._eventEmitter.hasListeners());
        }
        _assertNotDisposed() {
            if (this._isDisposed) {
                throw new Error('Model is disposed!');
            }
        }
        equalsTextBuffer(other) {
            this._assertNotDisposed();
            return this._buffer.equals(other);
        }
        getTextBuffer() {
            this._assertNotDisposed();
            return this._buffer;
        }
        _emitContentChangedEvent(rawChange, change) {
            if (this.__isDisposing) {
                // Do not confuse listeners by emitting any event after disposing
                return;
            }
            this._tokenizationTextModelPart.handleDidChangeContent(change);
            this._bracketPairs.handleDidChangeContent(change);
            this._eventEmitter.fire(new textModelEvents_1.InternalModelContentChangeEvent(rawChange, change));
        }
        setValue(value) {
            this._assertNotDisposed();
            if (value === null || value === undefined) {
                throw (0, errors_1.illegalArgument)();
            }
            const { textBuffer, disposable } = createTextBuffer(value, this._options.defaultEOL);
            this._setValueFromTextBuffer(textBuffer, disposable);
        }
        _createContentChanged2(range, rangeOffset, rangeLength, text, isUndoing, isRedoing, isFlush, isEolChange) {
            return {
                changes: [{
                        range: range,
                        rangeOffset: rangeOffset,
                        rangeLength: rangeLength,
                        text: text,
                    }],
                eol: this._buffer.getEOL(),
                isEolChange: isEolChange,
                versionId: this.getVersionId(),
                isUndoing: isUndoing,
                isRedoing: isRedoing,
                isFlush: isFlush
            };
        }
        _setValueFromTextBuffer(textBuffer, textBufferDisposable) {
            this._assertNotDisposed();
            const oldFullModelRange = this.getFullModelRange();
            const oldModelValueLength = this.getValueLengthInRange(oldFullModelRange);
            const endLineNumber = this.getLineCount();
            const endColumn = this.getLineMaxColumn(endLineNumber);
            this._buffer = textBuffer;
            this._bufferDisposable.dispose();
            this._bufferDisposable = textBufferDisposable;
            this._increaseVersionId();
            // Destroy all my decorations
            this._decorations = Object.create(null);
            this._decorationsTree = new DecorationsTrees();
            // Destroy my edit history and settings
            this._commandManager.clear();
            this._trimAutoWhitespaceLines = null;
            this._emitContentChangedEvent(new textModelEvents_1.ModelRawContentChangedEvent([
                new textModelEvents_1.ModelRawFlush()
            ], this._versionId, false, false), this._createContentChanged2(new range_1.Range(1, 1, endLineNumber, endColumn), 0, oldModelValueLength, this.getValue(), false, false, true, false));
        }
        setEOL(eol) {
            this._assertNotDisposed();
            const newEOL = (eol === 1 /* model.EndOfLineSequence.CRLF */ ? '\r\n' : '\n');
            if (this._buffer.getEOL() === newEOL) {
                // Nothing to do
                return;
            }
            const oldFullModelRange = this.getFullModelRange();
            const oldModelValueLength = this.getValueLengthInRange(oldFullModelRange);
            const endLineNumber = this.getLineCount();
            const endColumn = this.getLineMaxColumn(endLineNumber);
            this._onBeforeEOLChange();
            this._buffer.setEOL(newEOL);
            this._increaseVersionId();
            this._onAfterEOLChange();
            this._emitContentChangedEvent(new textModelEvents_1.ModelRawContentChangedEvent([
                new textModelEvents_1.ModelRawEOLChanged()
            ], this._versionId, false, false), this._createContentChanged2(new range_1.Range(1, 1, endLineNumber, endColumn), 0, oldModelValueLength, this.getValue(), false, false, false, true));
        }
        _onBeforeEOLChange() {
            // Ensure all decorations get their `range` set.
            this._decorationsTree.ensureAllNodesHaveRanges(this);
        }
        _onAfterEOLChange() {
            // Transform back `range` to offsets
            const versionId = this.getVersionId();
            const allDecorations = this._decorationsTree.collectNodesPostOrder();
            for (let i = 0, len = allDecorations.length; i < len; i++) {
                const node = allDecorations[i];
                const range = node.range; // the range is defined due to `_onBeforeEOLChange`
                const delta = node.cachedAbsoluteStart - node.start;
                const startOffset = this._buffer.getOffsetAt(range.startLineNumber, range.startColumn);
                const endOffset = this._buffer.getOffsetAt(range.endLineNumber, range.endColumn);
                node.cachedAbsoluteStart = startOffset;
                node.cachedAbsoluteEnd = endOffset;
                node.cachedVersionId = versionId;
                node.start = startOffset - delta;
                node.end = endOffset - delta;
                (0, intervalTree_1.recomputeMaxEnd)(node);
            }
        }
        onBeforeAttached() {
            this._attachedEditorCount++;
            if (this._attachedEditorCount === 1) {
                this._tokenizationTextModelPart.handleDidChangeAttached();
                this._onDidChangeAttached.fire(undefined);
            }
            return this._attachedViews.attachView();
        }
        onBeforeDetached(view) {
            this._attachedEditorCount--;
            if (this._attachedEditorCount === 0) {
                this._tokenizationTextModelPart.handleDidChangeAttached();
                this._onDidChangeAttached.fire(undefined);
            }
            this._attachedViews.detachView(view);
        }
        isAttachedToEditor() {
            return this._attachedEditorCount > 0;
        }
        getAttachedEditorCount() {
            return this._attachedEditorCount;
        }
        isTooLargeForSyncing() {
            return this._isTooLargeForSyncing;
        }
        isTooLargeForTokenization() {
            return this._isTooLargeForTokenization;
        }
        isTooLargeForHeapOperation() {
            return this._isTooLargeForHeapOperation;
        }
        isDisposed() {
            return this._isDisposed;
        }
        isDominatedByLongLines() {
            this._assertNotDisposed();
            if (this.isTooLargeForTokenization()) {
                // Cannot word wrap huge files anyways, so it doesn't really matter
                return false;
            }
            let smallLineCharCount = 0;
            let longLineCharCount = 0;
            const lineCount = this._buffer.getLineCount();
            for (let lineNumber = 1; lineNumber <= lineCount; lineNumber++) {
                const lineLength = this._buffer.getLineLength(lineNumber);
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
            return this._associatedResource;
        }
        //#region Options
        getOptions() {
            this._assertNotDisposed();
            return this._options;
        }
        getFormattingOptions() {
            return {
                tabSize: this._options.indentSize,
                insertSpaces: this._options.insertSpaces
            };
        }
        updateOptions(_newOpts) {
            this._assertNotDisposed();
            const tabSize = (typeof _newOpts.tabSize !== 'undefined') ? _newOpts.tabSize : this._options.tabSize;
            const indentSize = (typeof _newOpts.indentSize !== 'undefined') ? _newOpts.indentSize : this._options.originalIndentSize;
            const insertSpaces = (typeof _newOpts.insertSpaces !== 'undefined') ? _newOpts.insertSpaces : this._options.insertSpaces;
            const trimAutoWhitespace = (typeof _newOpts.trimAutoWhitespace !== 'undefined') ? _newOpts.trimAutoWhitespace : this._options.trimAutoWhitespace;
            const bracketPairColorizationOptions = (typeof _newOpts.bracketColorizationOptions !== 'undefined') ? _newOpts.bracketColorizationOptions : this._options.bracketPairColorizationOptions;
            const newOpts = new model.TextModelResolvedOptions({
                tabSize: tabSize,
                indentSize: indentSize,
                insertSpaces: insertSpaces,
                defaultEOL: this._options.defaultEOL,
                trimAutoWhitespace: trimAutoWhitespace,
                bracketPairColorizationOptions,
            });
            if (this._options.equals(newOpts)) {
                return;
            }
            const e = this._options.createChangeEvent(newOpts);
            this._options = newOpts;
            this._bracketPairs.handleDidChangeOptions(e);
            this._decorationProvider.handleDidChangeOptions(e);
            this._onDidChangeOptions.fire(e);
        }
        detectIndentation(defaultInsertSpaces, defaultTabSize) {
            this._assertNotDisposed();
            const guessedIndentation = (0, indentationGuesser_1.guessIndentation)(this._buffer, defaultTabSize, defaultInsertSpaces);
            this.updateOptions({
                insertSpaces: guessedIndentation.insertSpaces,
                tabSize: guessedIndentation.tabSize,
                indentSize: guessedIndentation.tabSize, // TODO@Alex: guess indentSize independent of tabSize
            });
        }
        normalizeIndentation(str) {
            this._assertNotDisposed();
            return (0, indentation_1.normalizeIndentation)(str, this._options.indentSize, this._options.insertSpaces);
        }
        //#endregion
        //#region Reading
        getVersionId() {
            this._assertNotDisposed();
            return this._versionId;
        }
        mightContainRTL() {
            return this._buffer.mightContainRTL();
        }
        mightContainUnusualLineTerminators() {
            return this._buffer.mightContainUnusualLineTerminators();
        }
        removeUnusualLineTerminators(selections = null) {
            const matches = this.findMatches(strings.UNUSUAL_LINE_TERMINATORS.source, false, true, false, null, false, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */);
            this._buffer.resetMightContainUnusualLineTerminators();
            this.pushEditOperations(selections, matches.map(m => ({ range: m.range, text: null })), () => null);
        }
        mightContainNonBasicASCII() {
            return this._buffer.mightContainNonBasicASCII();
        }
        getAlternativeVersionId() {
            this._assertNotDisposed();
            return this._alternativeVersionId;
        }
        getInitialUndoRedoSnapshot() {
            this._assertNotDisposed();
            return this._initialUndoRedoSnapshot;
        }
        getOffsetAt(rawPosition) {
            this._assertNotDisposed();
            const position = this._validatePosition(rawPosition.lineNumber, rawPosition.column, 0 /* StringOffsetValidationType.Relaxed */);
            return this._buffer.getOffsetAt(position.lineNumber, position.column);
        }
        getPositionAt(rawOffset) {
            this._assertNotDisposed();
            const offset = (Math.min(this._buffer.getLength(), Math.max(0, rawOffset)));
            return this._buffer.getPositionAt(offset);
        }
        _increaseVersionId() {
            this._versionId = this._versionId + 1;
            this._alternativeVersionId = this._versionId;
        }
        _overwriteVersionId(versionId) {
            this._versionId = versionId;
        }
        _overwriteAlternativeVersionId(newAlternativeVersionId) {
            this._alternativeVersionId = newAlternativeVersionId;
        }
        _overwriteInitialUndoRedoSnapshot(newInitialUndoRedoSnapshot) {
            this._initialUndoRedoSnapshot = newInitialUndoRedoSnapshot;
        }
        getValue(eol, preserveBOM = false) {
            this._assertNotDisposed();
            if (this.isTooLargeForHeapOperation()) {
                throw new errors_1.BugIndicatingError('Operation would exceed heap memory limits');
            }
            const fullModelRange = this.getFullModelRange();
            const fullModelValue = this.getValueInRange(fullModelRange, eol);
            if (preserveBOM) {
                return this._buffer.getBOM() + fullModelValue;
            }
            return fullModelValue;
        }
        createSnapshot(preserveBOM = false) {
            return new TextModelSnapshot(this._buffer.createSnapshot(preserveBOM));
        }
        getValueLength(eol, preserveBOM = false) {
            this._assertNotDisposed();
            const fullModelRange = this.getFullModelRange();
            const fullModelValue = this.getValueLengthInRange(fullModelRange, eol);
            if (preserveBOM) {
                return this._buffer.getBOM().length + fullModelValue;
            }
            return fullModelValue;
        }
        getValueInRange(rawRange, eol = 0 /* model.EndOfLinePreference.TextDefined */) {
            this._assertNotDisposed();
            return this._buffer.getValueInRange(this.validateRange(rawRange), eol);
        }
        getValueLengthInRange(rawRange, eol = 0 /* model.EndOfLinePreference.TextDefined */) {
            this._assertNotDisposed();
            return this._buffer.getValueLengthInRange(this.validateRange(rawRange), eol);
        }
        getCharacterCountInRange(rawRange, eol = 0 /* model.EndOfLinePreference.TextDefined */) {
            this._assertNotDisposed();
            return this._buffer.getCharacterCountInRange(this.validateRange(rawRange), eol);
        }
        getLineCount() {
            this._assertNotDisposed();
            return this._buffer.getLineCount();
        }
        getLineContent(lineNumber) {
            this._assertNotDisposed();
            if (lineNumber < 1 || lineNumber > this.getLineCount()) {
                throw new errors_1.BugIndicatingError('Illegal value for lineNumber');
            }
            return this._buffer.getLineContent(lineNumber);
        }
        getLineLength(lineNumber) {
            this._assertNotDisposed();
            if (lineNumber < 1 || lineNumber > this.getLineCount()) {
                throw new errors_1.BugIndicatingError('Illegal value for lineNumber');
            }
            return this._buffer.getLineLength(lineNumber);
        }
        getLinesContent() {
            this._assertNotDisposed();
            if (this.isTooLargeForHeapOperation()) {
                throw new errors_1.BugIndicatingError('Operation would exceed heap memory limits');
            }
            return this._buffer.getLinesContent();
        }
        getEOL() {
            this._assertNotDisposed();
            return this._buffer.getEOL();
        }
        getEndOfLineSequence() {
            this._assertNotDisposed();
            return (this._buffer.getEOL() === '\n'
                ? 0 /* model.EndOfLineSequence.LF */
                : 1 /* model.EndOfLineSequence.CRLF */);
        }
        getLineMinColumn(lineNumber) {
            this._assertNotDisposed();
            return 1;
        }
        getLineMaxColumn(lineNumber) {
            this._assertNotDisposed();
            if (lineNumber < 1 || lineNumber > this.getLineCount()) {
                throw new errors_1.BugIndicatingError('Illegal value for lineNumber');
            }
            return this._buffer.getLineLength(lineNumber) + 1;
        }
        getLineFirstNonWhitespaceColumn(lineNumber) {
            this._assertNotDisposed();
            if (lineNumber < 1 || lineNumber > this.getLineCount()) {
                throw new errors_1.BugIndicatingError('Illegal value for lineNumber');
            }
            return this._buffer.getLineFirstNonWhitespaceColumn(lineNumber);
        }
        getLineLastNonWhitespaceColumn(lineNumber) {
            this._assertNotDisposed();
            if (lineNumber < 1 || lineNumber > this.getLineCount()) {
                throw new errors_1.BugIndicatingError('Illegal value for lineNumber');
            }
            return this._buffer.getLineLastNonWhitespaceColumn(lineNumber);
        }
        /**
         * Validates `range` is within buffer bounds, but allows it to sit in between surrogate pairs, etc.
         * Will try to not allocate if possible.
         */
        _validateRangeRelaxedNoAllocations(range) {
            const linesCount = this._buffer.getLineCount();
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
                && range instanceof range_1.Range
                && !(range instanceof selection_1.Selection)) {
                return range;
            }
            return new range_1.Range(startLineNumber, startColumn, endLineNumber, endColumn);
        }
        _isValidPosition(lineNumber, column, validationType) {
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
            const lineCount = this._buffer.getLineCount();
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
                const charCodeBefore = this._buffer.getLineCharCode(lineNumber, column - 2);
                if (strings.isHighSurrogate(charCodeBefore)) {
                    return false;
                }
            }
            return true;
        }
        _validatePosition(_lineNumber, _column, validationType) {
            const lineNumber = Math.floor((typeof _lineNumber === 'number' && !isNaN(_lineNumber)) ? _lineNumber : 1);
            const column = Math.floor((typeof _column === 'number' && !isNaN(_column)) ? _column : 1);
            const lineCount = this._buffer.getLineCount();
            if (lineNumber < 1) {
                return new position_1.Position(1, 1);
            }
            if (lineNumber > lineCount) {
                return new position_1.Position(lineCount, this.getLineMaxColumn(lineCount));
            }
            if (column <= 1) {
                return new position_1.Position(lineNumber, 1);
            }
            const maxColumn = this.getLineMaxColumn(lineNumber);
            if (column >= maxColumn) {
                return new position_1.Position(lineNumber, maxColumn);
            }
            if (validationType === 1 /* StringOffsetValidationType.SurrogatePairs */) {
                // If the position would end up in the middle of a high-low surrogate pair,
                // we move it to before the pair
                // !!At this point, column > 1
                const charCodeBefore = this._buffer.getLineCharCode(lineNumber, column - 2);
                if (strings.isHighSurrogate(charCodeBefore)) {
                    return new position_1.Position(lineNumber, column - 1);
                }
            }
            return new position_1.Position(lineNumber, column);
        }
        validatePosition(position) {
            const validationType = 1 /* StringOffsetValidationType.SurrogatePairs */;
            this._assertNotDisposed();
            // Avoid object allocation and cover most likely case
            if (position instanceof position_1.Position) {
                if (this._isValidPosition(position.lineNumber, position.column, validationType)) {
                    return position;
                }
            }
            return this._validatePosition(position.lineNumber, position.column, validationType);
        }
        _isValidRange(range, validationType) {
            const startLineNumber = range.startLineNumber;
            const startColumn = range.startColumn;
            const endLineNumber = range.endLineNumber;
            const endColumn = range.endColumn;
            if (!this._isValidPosition(startLineNumber, startColumn, 0 /* StringOffsetValidationType.Relaxed */)) {
                return false;
            }
            if (!this._isValidPosition(endLineNumber, endColumn, 0 /* StringOffsetValidationType.Relaxed */)) {
                return false;
            }
            if (validationType === 1 /* StringOffsetValidationType.SurrogatePairs */) {
                const charCodeBeforeStart = (startColumn > 1 ? this._buffer.getLineCharCode(startLineNumber, startColumn - 2) : 0);
                const charCodeBeforeEnd = (endColumn > 1 && endColumn <= this._buffer.getLineLength(endLineNumber) ? this._buffer.getLineCharCode(endLineNumber, endColumn - 2) : 0);
                const startInsideSurrogatePair = strings.isHighSurrogate(charCodeBeforeStart);
                const endInsideSurrogatePair = strings.isHighSurrogate(charCodeBeforeEnd);
                if (!startInsideSurrogatePair && !endInsideSurrogatePair) {
                    return true;
                }
                return false;
            }
            return true;
        }
        validateRange(_range) {
            const validationType = 1 /* StringOffsetValidationType.SurrogatePairs */;
            this._assertNotDisposed();
            // Avoid object allocation and cover most likely case
            if ((_range instanceof range_1.Range) && !(_range instanceof selection_1.Selection)) {
                if (this._isValidRange(_range, validationType)) {
                    return _range;
                }
            }
            const start = this._validatePosition(_range.startLineNumber, _range.startColumn, 0 /* StringOffsetValidationType.Relaxed */);
            const end = this._validatePosition(_range.endLineNumber, _range.endColumn, 0 /* StringOffsetValidationType.Relaxed */);
            const startLineNumber = start.lineNumber;
            const startColumn = start.column;
            const endLineNumber = end.lineNumber;
            const endColumn = end.column;
            if (validationType === 1 /* StringOffsetValidationType.SurrogatePairs */) {
                const charCodeBeforeStart = (startColumn > 1 ? this._buffer.getLineCharCode(startLineNumber, startColumn - 2) : 0);
                const charCodeBeforeEnd = (endColumn > 1 && endColumn <= this._buffer.getLineLength(endLineNumber) ? this._buffer.getLineCharCode(endLineNumber, endColumn - 2) : 0);
                const startInsideSurrogatePair = strings.isHighSurrogate(charCodeBeforeStart);
                const endInsideSurrogatePair = strings.isHighSurrogate(charCodeBeforeEnd);
                if (!startInsideSurrogatePair && !endInsideSurrogatePair) {
                    return new range_1.Range(startLineNumber, startColumn, endLineNumber, endColumn);
                }
                if (startLineNumber === endLineNumber && startColumn === endColumn) {
                    // do not expand a collapsed range, simply move it to a valid location
                    return new range_1.Range(startLineNumber, startColumn - 1, endLineNumber, endColumn - 1);
                }
                if (startInsideSurrogatePair && endInsideSurrogatePair) {
                    // expand range at both ends
                    return new range_1.Range(startLineNumber, startColumn - 1, endLineNumber, endColumn + 1);
                }
                if (startInsideSurrogatePair) {
                    // only expand range at the start
                    return new range_1.Range(startLineNumber, startColumn - 1, endLineNumber, endColumn);
                }
                // only expand range at the end
                return new range_1.Range(startLineNumber, startColumn, endLineNumber, endColumn + 1);
            }
            return new range_1.Range(startLineNumber, startColumn, endLineNumber, endColumn);
        }
        modifyPosition(rawPosition, offset) {
            this._assertNotDisposed();
            const candidate = this.getOffsetAt(rawPosition) + offset;
            return this.getPositionAt(Math.min(this._buffer.getLength(), Math.max(0, candidate)));
        }
        getFullModelRange() {
            this._assertNotDisposed();
            const lineCount = this.getLineCount();
            return new range_1.Range(1, 1, lineCount, this.getLineMaxColumn(lineCount));
        }
        findMatchesLineByLine(searchRange, searchData, captureMatches, limitResultCount) {
            return this._buffer.findMatchesLineByLine(searchRange, searchData, captureMatches, limitResultCount);
        }
        findMatches(searchString, rawSearchScope, isRegex, matchCase, wordSeparators, captureMatches, limitResultCount = LIMIT_FIND_COUNT) {
            this._assertNotDisposed();
            let searchRanges = null;
            if (rawSearchScope !== null) {
                if (!Array.isArray(rawSearchScope)) {
                    rawSearchScope = [rawSearchScope];
                }
                if (rawSearchScope.every((searchScope) => range_1.Range.isIRange(searchScope))) {
                    searchRanges = rawSearchScope.map((searchScope) => this.validateRange(searchScope));
                }
            }
            if (searchRanges === null) {
                searchRanges = [this.getFullModelRange()];
            }
            searchRanges = searchRanges.sort((d1, d2) => d1.startLineNumber - d2.startLineNumber || d1.startColumn - d2.startColumn);
            const uniqueSearchRanges = [];
            uniqueSearchRanges.push(searchRanges.reduce((prev, curr) => {
                if (range_1.Range.areIntersecting(prev, curr)) {
                    return prev.plusRange(curr);
                }
                uniqueSearchRanges.push(prev);
                return curr;
            }));
            let matchMapper;
            if (!isRegex && searchString.indexOf('\n') < 0) {
                // not regex, not multi line
                const searchParams = new textModelSearch_1.SearchParams(searchString, isRegex, matchCase, wordSeparators);
                const searchData = searchParams.parseSearchRequest();
                if (!searchData) {
                    return [];
                }
                matchMapper = (searchRange) => this.findMatchesLineByLine(searchRange, searchData, captureMatches, limitResultCount);
            }
            else {
                matchMapper = (searchRange) => textModelSearch_1.TextModelSearch.findMatches(this, new textModelSearch_1.SearchParams(searchString, isRegex, matchCase, wordSeparators), searchRange, captureMatches, limitResultCount);
            }
            return uniqueSearchRanges.map(matchMapper).reduce((arr, matches) => arr.concat(matches), []);
        }
        findNextMatch(searchString, rawSearchStart, isRegex, matchCase, wordSeparators, captureMatches) {
            this._assertNotDisposed();
            const searchStart = this.validatePosition(rawSearchStart);
            if (!isRegex && searchString.indexOf('\n') < 0) {
                const searchParams = new textModelSearch_1.SearchParams(searchString, isRegex, matchCase, wordSeparators);
                const searchData = searchParams.parseSearchRequest();
                if (!searchData) {
                    return null;
                }
                const lineCount = this.getLineCount();
                let searchRange = new range_1.Range(searchStart.lineNumber, searchStart.column, lineCount, this.getLineMaxColumn(lineCount));
                let ret = this.findMatchesLineByLine(searchRange, searchData, captureMatches, 1);
                textModelSearch_1.TextModelSearch.findNextMatch(this, new textModelSearch_1.SearchParams(searchString, isRegex, matchCase, wordSeparators), searchStart, captureMatches);
                if (ret.length > 0) {
                    return ret[0];
                }
                searchRange = new range_1.Range(1, 1, searchStart.lineNumber, this.getLineMaxColumn(searchStart.lineNumber));
                ret = this.findMatchesLineByLine(searchRange, searchData, captureMatches, 1);
                if (ret.length > 0) {
                    return ret[0];
                }
                return null;
            }
            return textModelSearch_1.TextModelSearch.findNextMatch(this, new textModelSearch_1.SearchParams(searchString, isRegex, matchCase, wordSeparators), searchStart, captureMatches);
        }
        findPreviousMatch(searchString, rawSearchStart, isRegex, matchCase, wordSeparators, captureMatches) {
            this._assertNotDisposed();
            const searchStart = this.validatePosition(rawSearchStart);
            return textModelSearch_1.TextModelSearch.findPreviousMatch(this, new textModelSearch_1.SearchParams(searchString, isRegex, matchCase, wordSeparators), searchStart, captureMatches);
        }
        //#endregion
        //#region Editing
        pushStackElement() {
            this._commandManager.pushStackElement();
        }
        popStackElement() {
            this._commandManager.popStackElement();
        }
        pushEOL(eol) {
            const currentEOL = (this.getEOL() === '\n' ? 0 /* model.EndOfLineSequence.LF */ : 1 /* model.EndOfLineSequence.CRLF */);
            if (currentEOL === eol) {
                return;
            }
            try {
                this._onDidChangeDecorations.beginDeferredEmit();
                this._eventEmitter.beginDeferredEmit();
                if (this._initialUndoRedoSnapshot === null) {
                    this._initialUndoRedoSnapshot = this._undoRedoService.createSnapshot(this.uri);
                }
                this._commandManager.pushEOL(eol);
            }
            finally {
                this._eventEmitter.endDeferredEmit();
                this._onDidChangeDecorations.endDeferredEmit();
            }
        }
        _validateEditOperation(rawOperation) {
            if (rawOperation instanceof model.ValidAnnotatedEditOperation) {
                return rawOperation;
            }
            return new model.ValidAnnotatedEditOperation(rawOperation.identifier || null, this.validateRange(rawOperation.range), rawOperation.text, rawOperation.forceMoveMarkers || false, rawOperation.isAutoWhitespaceEdit || false, rawOperation._isTracked || false);
        }
        _validateEditOperations(rawOperations) {
            const result = [];
            for (let i = 0, len = rawOperations.length; i < len; i++) {
                result[i] = this._validateEditOperation(rawOperations[i]);
            }
            return result;
        }
        pushEditOperations(beforeCursorState, editOperations, cursorStateComputer, group) {
            try {
                this._onDidChangeDecorations.beginDeferredEmit();
                this._eventEmitter.beginDeferredEmit();
                return this._pushEditOperations(beforeCursorState, this._validateEditOperations(editOperations), cursorStateComputer, group);
            }
            finally {
                this._eventEmitter.endDeferredEmit();
                this._onDidChangeDecorations.endDeferredEmit();
            }
        }
        _pushEditOperations(beforeCursorState, editOperations, cursorStateComputer, group) {
            if (this._options.trimAutoWhitespace && this._trimAutoWhitespaceLines) {
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
                    for (let i = 0, len = this._trimAutoWhitespaceLines.length; i < len; i++) {
                        const trimLineNumber = this._trimAutoWhitespaceLines[i];
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
                            const trimRange = new range_1.Range(trimLineNumber, 1, trimLineNumber, maxLineColumn);
                            editOperations.push(new model.ValidAnnotatedEditOperation(null, trimRange, null, false, false, false));
                        }
                    }
                }
                this._trimAutoWhitespaceLines = null;
            }
            if (this._initialUndoRedoSnapshot === null) {
                this._initialUndoRedoSnapshot = this._undoRedoService.createSnapshot(this.uri);
            }
            return this._commandManager.pushEditOperation(beforeCursorState, editOperations, cursorStateComputer, group);
        }
        _applyUndo(changes, eol, resultingAlternativeVersionId, resultingSelection) {
            const edits = changes.map((change) => {
                const rangeStart = this.getPositionAt(change.newPosition);
                const rangeEnd = this.getPositionAt(change.newEnd);
                return {
                    range: new range_1.Range(rangeStart.lineNumber, rangeStart.column, rangeEnd.lineNumber, rangeEnd.column),
                    text: change.oldText
                };
            });
            this._applyUndoRedoEdits(edits, eol, true, false, resultingAlternativeVersionId, resultingSelection);
        }
        _applyRedo(changes, eol, resultingAlternativeVersionId, resultingSelection) {
            const edits = changes.map((change) => {
                const rangeStart = this.getPositionAt(change.oldPosition);
                const rangeEnd = this.getPositionAt(change.oldEnd);
                return {
                    range: new range_1.Range(rangeStart.lineNumber, rangeStart.column, rangeEnd.lineNumber, rangeEnd.column),
                    text: change.newText
                };
            });
            this._applyUndoRedoEdits(edits, eol, false, true, resultingAlternativeVersionId, resultingSelection);
        }
        _applyUndoRedoEdits(edits, eol, isUndoing, isRedoing, resultingAlternativeVersionId, resultingSelection) {
            try {
                this._onDidChangeDecorations.beginDeferredEmit();
                this._eventEmitter.beginDeferredEmit();
                this._isUndoing = isUndoing;
                this._isRedoing = isRedoing;
                this.applyEdits(edits, false);
                this.setEOL(eol);
                this._overwriteAlternativeVersionId(resultingAlternativeVersionId);
            }
            finally {
                this._isUndoing = false;
                this._isRedoing = false;
                this._eventEmitter.endDeferredEmit(resultingSelection);
                this._onDidChangeDecorations.endDeferredEmit();
            }
        }
        applyEdits(rawOperations, computeUndoEdits = false) {
            try {
                this._onDidChangeDecorations.beginDeferredEmit();
                this._eventEmitter.beginDeferredEmit();
                const operations = this._validateEditOperations(rawOperations);
                return this._doApplyEdits(operations, computeUndoEdits);
            }
            finally {
                this._eventEmitter.endDeferredEmit();
                this._onDidChangeDecorations.endDeferredEmit();
            }
        }
        _doApplyEdits(rawOperations, computeUndoEdits) {
            const oldLineCount = this._buffer.getLineCount();
            const result = this._buffer.applyEdits(rawOperations, this._options.trimAutoWhitespace, computeUndoEdits);
            const newLineCount = this._buffer.getLineCount();
            const contentChanges = result.changes;
            this._trimAutoWhitespaceLines = result.trimAutoWhitespaceLineNumbers;
            if (contentChanges.length !== 0) {
                // We do a first pass to update decorations
                // because we want to read decorations in the second pass
                // where we will emit content change events
                // and we want to read the final decorations
                for (let i = 0, len = contentChanges.length; i < len; i++) {
                    const change = contentChanges[i];
                    this._decorationsTree.acceptReplace(change.rangeOffset, change.rangeLength, change.text.length, change.forceMoveMarkers);
                }
                const rawContentChanges = [];
                this._increaseVersionId();
                let lineCount = oldLineCount;
                for (let i = 0, len = contentChanges.length; i < len; i++) {
                    const change = contentChanges[i];
                    const [eolCount] = (0, eolCounter_1.countEOL)(change.text);
                    this._onDidChangeDecorations.fire();
                    const startLineNumber = change.range.startLineNumber;
                    const endLineNumber = change.range.endLineNumber;
                    const deletingLinesCnt = endLineNumber - startLineNumber;
                    const insertingLinesCnt = eolCount;
                    const editingLinesCnt = Math.min(deletingLinesCnt, insertingLinesCnt);
                    const changeLineCountDelta = (insertingLinesCnt - deletingLinesCnt);
                    const currentEditStartLineNumber = newLineCount - lineCount - changeLineCountDelta + startLineNumber;
                    const firstEditLineNumber = currentEditStartLineNumber;
                    const lastInsertedLineNumber = currentEditStartLineNumber + insertingLinesCnt;
                    const decorationsWithInjectedTextInEditedRange = this._decorationsTree.getInjectedTextInInterval(this, this.getOffsetAt(new position_1.Position(firstEditLineNumber, 1)), this.getOffsetAt(new position_1.Position(lastInsertedLineNumber, this.getLineMaxColumn(lastInsertedLineNumber))), 0);
                    const injectedTextInEditedRange = textModelEvents_1.LineInjectedText.fromDecorations(decorationsWithInjectedTextInEditedRange);
                    const injectedTextInEditedRangeQueue = new arrays_1.ArrayQueue(injectedTextInEditedRange);
                    for (let j = editingLinesCnt; j >= 0; j--) {
                        const editLineNumber = startLineNumber + j;
                        const currentEditLineNumber = currentEditStartLineNumber + j;
                        injectedTextInEditedRangeQueue.takeFromEndWhile(r => r.lineNumber > currentEditLineNumber);
                        const decorationsInCurrentLine = injectedTextInEditedRangeQueue.takeFromEndWhile(r => r.lineNumber === currentEditLineNumber);
                        rawContentChanges.push(new textModelEvents_1.ModelRawLineChanged(editLineNumber, this.getLineContent(currentEditLineNumber), decorationsInCurrentLine));
                    }
                    if (editingLinesCnt < deletingLinesCnt) {
                        // Must delete some lines
                        const spliceStartLineNumber = startLineNumber + editingLinesCnt;
                        rawContentChanges.push(new textModelEvents_1.ModelRawLinesDeleted(spliceStartLineNumber + 1, endLineNumber));
                    }
                    if (editingLinesCnt < insertingLinesCnt) {
                        const injectedTextInEditedRangeQueue = new arrays_1.ArrayQueue(injectedTextInEditedRange);
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
                        rawContentChanges.push(new textModelEvents_1.ModelRawLinesInserted(spliceLineNumber + 1, startLineNumber + insertingLinesCnt, newLines, injectedTexts));
                    }
                    lineCount += changeLineCountDelta;
                }
                this._emitContentChangedEvent(new textModelEvents_1.ModelRawContentChangedEvent(rawContentChanges, this.getVersionId(), this._isUndoing, this._isRedoing), {
                    changes: contentChanges,
                    eol: this._buffer.getEOL(),
                    isEolChange: false,
                    versionId: this.getVersionId(),
                    isUndoing: this._isUndoing,
                    isRedoing: this._isRedoing,
                    isFlush: false
                });
            }
            return (result.reverseEdits === null ? undefined : result.reverseEdits);
        }
        undo() {
            return this._undoRedoService.undo(this.uri);
        }
        canUndo() {
            return this._undoRedoService.canUndo(this.uri);
        }
        redo() {
            return this._undoRedoService.redo(this.uri);
        }
        canRedo() {
            return this._undoRedoService.canRedo(this.uri);
        }
        //#endregion
        //#region Decorations
        handleBeforeFireDecorationsChangedEvent(affectedInjectedTextLines) {
            // This is called before the decoration changed event is fired.
            if (affectedInjectedTextLines === null || affectedInjectedTextLines.size === 0) {
                return;
            }
            const affectedLines = Array.from(affectedInjectedTextLines);
            const lineChangeEvents = affectedLines.map(lineNumber => new textModelEvents_1.ModelRawLineChanged(lineNumber, this.getLineContent(lineNumber), this._getInjectedTextInLine(lineNumber)));
            this._onDidChangeInjectedText.fire(new textModelEvents_1.ModelInjectedTextChangedEvent(lineChangeEvents));
        }
        changeDecorations(callback, ownerId = 0) {
            this._assertNotDisposed();
            try {
                this._onDidChangeDecorations.beginDeferredEmit();
                return this._changeDecorations(ownerId, callback);
            }
            finally {
                this._onDidChangeDecorations.endDeferredEmit();
            }
        }
        _changeDecorations(ownerId, callback) {
            const changeAccessor = {
                addDecoration: (range, options) => {
                    return this._deltaDecorationsImpl(ownerId, [], [{ range: range, options: options }])[0];
                },
                changeDecoration: (id, newRange) => {
                    this._changeDecorationImpl(id, newRange);
                },
                changeDecorationOptions: (id, options) => {
                    this._changeDecorationOptionsImpl(id, _normalizeOptions(options));
                },
                removeDecoration: (id) => {
                    this._deltaDecorationsImpl(ownerId, [id], []);
                },
                deltaDecorations: (oldDecorations, newDecorations) => {
                    if (oldDecorations.length === 0 && newDecorations.length === 0) {
                        // nothing to do
                        return [];
                    }
                    return this._deltaDecorationsImpl(ownerId, oldDecorations, newDecorations);
                }
            };
            let result = null;
            try {
                result = callback(changeAccessor);
            }
            catch (e) {
                (0, errors_1.onUnexpectedError)(e);
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
            this._assertNotDisposed();
            if (!oldDecorations) {
                oldDecorations = [];
            }
            if (oldDecorations.length === 0 && newDecorations.length === 0) {
                // nothing to do
                return [];
            }
            try {
                this._deltaDecorationCallCnt++;
                if (this._deltaDecorationCallCnt > 1) {
                    console.warn(`Invoking deltaDecorations recursively could lead to leaking decorations.`);
                    (0, errors_1.onUnexpectedError)(new Error(`Invoking deltaDecorations recursively could lead to leaking decorations.`));
                }
                this._onDidChangeDecorations.beginDeferredEmit();
                return this._deltaDecorationsImpl(ownerId, oldDecorations, newDecorations);
            }
            finally {
                this._onDidChangeDecorations.endDeferredEmit();
                this._deltaDecorationCallCnt--;
            }
        }
        _getTrackedRange(id) {
            return this.getDecorationRange(id);
        }
        _setTrackedRange(id, newRange, newStickiness) {
            const node = (id ? this._decorations[id] : null);
            if (!node) {
                if (!newRange) {
                    // node doesn't exist, the request is to delete => nothing to do
                    return null;
                }
                // node doesn't exist, the request is to set => add the tracked range
                return this._deltaDecorationsImpl(0, [], [{ range: newRange, options: TRACKED_RANGE_OPTIONS[newStickiness] }], true)[0];
            }
            if (!newRange) {
                // node exists, the request is to delete => delete node
                this._decorationsTree.delete(node);
                delete this._decorations[node.id];
                return null;
            }
            // node exists, the request is to set => change the tracked range and its options
            const range = this._validateRangeRelaxedNoAllocations(newRange);
            const startOffset = this._buffer.getOffsetAt(range.startLineNumber, range.startColumn);
            const endOffset = this._buffer.getOffsetAt(range.endLineNumber, range.endColumn);
            this._decorationsTree.delete(node);
            node.reset(this.getVersionId(), startOffset, endOffset, range);
            node.setOptions(TRACKED_RANGE_OPTIONS[newStickiness]);
            this._decorationsTree.insert(node);
            return node.id;
        }
        removeAllDecorationsWithOwnerId(ownerId) {
            if (this._isDisposed) {
                return;
            }
            const nodes = this._decorationsTree.collectNodesFromOwner(ownerId);
            for (let i = 0, len = nodes.length; i < len; i++) {
                const node = nodes[i];
                this._decorationsTree.delete(node);
                delete this._decorations[node.id];
            }
        }
        getDecorationOptions(decorationId) {
            const node = this._decorations[decorationId];
            if (!node) {
                return null;
            }
            return node.options;
        }
        getDecorationRange(decorationId) {
            const node = this._decorations[decorationId];
            if (!node) {
                return null;
            }
            return this._decorationsTree.getNodeRange(this, node);
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
            const range = new range_1.Range(startLineNumber, 1, endLineNumber, endColumn);
            const decorations = this._getDecorationsInRange(range, ownerId, filterOutValidation, onlyMarginDecorations);
            (0, arrays_1.pushMany)(decorations, this._decorationProvider.getDecorationsInRange(range, ownerId, filterOutValidation));
            return decorations;
        }
        getDecorationsInRange(range, ownerId = 0, filterOutValidation = false, onlyMinimapDecorations = false, onlyMarginDecorations = false) {
            const validatedRange = this.validateRange(range);
            const decorations = this._getDecorationsInRange(validatedRange, ownerId, filterOutValidation, onlyMarginDecorations);
            (0, arrays_1.pushMany)(decorations, this._decorationProvider.getDecorationsInRange(validatedRange, ownerId, filterOutValidation, onlyMinimapDecorations));
            return decorations;
        }
        getOverviewRulerDecorations(ownerId = 0, filterOutValidation = false) {
            return this._decorationsTree.getAll(this, ownerId, filterOutValidation, true, false);
        }
        getInjectedTextDecorations(ownerId = 0) {
            return this._decorationsTree.getAllInjectedText(this, ownerId);
        }
        _getInjectedTextInLine(lineNumber) {
            const startOffset = this._buffer.getOffsetAt(lineNumber, 1);
            const endOffset = startOffset + this._buffer.getLineLength(lineNumber);
            const result = this._decorationsTree.getInjectedTextInInterval(this, startOffset, endOffset, 0);
            return textModelEvents_1.LineInjectedText.fromDecorations(result).filter(t => t.lineNumber === lineNumber);
        }
        getAllDecorations(ownerId = 0, filterOutValidation = false) {
            let result = this._decorationsTree.getAll(this, ownerId, filterOutValidation, false, false);
            result = result.concat(this._decorationProvider.getAllDecorations(ownerId, filterOutValidation));
            return result;
        }
        getAllMarginDecorations(ownerId = 0) {
            return this._decorationsTree.getAll(this, ownerId, false, false, true);
        }
        _getDecorationsInRange(filterRange, filterOwnerId, filterOutValidation, onlyMarginDecorations) {
            const startOffset = this._buffer.getOffsetAt(filterRange.startLineNumber, filterRange.startColumn);
            const endOffset = this._buffer.getOffsetAt(filterRange.endLineNumber, filterRange.endColumn);
            return this._decorationsTree.getAllInInterval(this, startOffset, endOffset, filterOwnerId, filterOutValidation, onlyMarginDecorations);
        }
        getRangeAt(start, end) {
            return this._buffer.getRangeAt(start, end - start);
        }
        _changeDecorationImpl(decorationId, _range) {
            const node = this._decorations[decorationId];
            if (!node) {
                return;
            }
            if (node.options.after) {
                const oldRange = this.getDecorationRange(decorationId);
                this._onDidChangeDecorations.recordLineAffectedByInjectedText(oldRange.endLineNumber);
            }
            if (node.options.before) {
                const oldRange = this.getDecorationRange(decorationId);
                this._onDidChangeDecorations.recordLineAffectedByInjectedText(oldRange.startLineNumber);
            }
            const range = this._validateRangeRelaxedNoAllocations(_range);
            const startOffset = this._buffer.getOffsetAt(range.startLineNumber, range.startColumn);
            const endOffset = this._buffer.getOffsetAt(range.endLineNumber, range.endColumn);
            this._decorationsTree.delete(node);
            node.reset(this.getVersionId(), startOffset, endOffset, range);
            this._decorationsTree.insert(node);
            this._onDidChangeDecorations.checkAffectedAndFire(node.options);
            if (node.options.after) {
                this._onDidChangeDecorations.recordLineAffectedByInjectedText(range.endLineNumber);
            }
            if (node.options.before) {
                this._onDidChangeDecorations.recordLineAffectedByInjectedText(range.startLineNumber);
            }
        }
        _changeDecorationOptionsImpl(decorationId, options) {
            const node = this._decorations[decorationId];
            if (!node) {
                return;
            }
            const nodeWasInOverviewRuler = (node.options.overviewRuler && node.options.overviewRuler.color ? true : false);
            const nodeIsInOverviewRuler = (options.overviewRuler && options.overviewRuler.color ? true : false);
            this._onDidChangeDecorations.checkAffectedAndFire(node.options);
            this._onDidChangeDecorations.checkAffectedAndFire(options);
            if (node.options.after || options.after) {
                const nodeRange = this._decorationsTree.getNodeRange(this, node);
                this._onDidChangeDecorations.recordLineAffectedByInjectedText(nodeRange.endLineNumber);
            }
            if (node.options.before || options.before) {
                const nodeRange = this._decorationsTree.getNodeRange(this, node);
                this._onDidChangeDecorations.recordLineAffectedByInjectedText(nodeRange.startLineNumber);
            }
            if (nodeWasInOverviewRuler !== nodeIsInOverviewRuler) {
                // Delete + Insert due to an overview ruler status change
                this._decorationsTree.delete(node);
                node.setOptions(options);
                this._decorationsTree.insert(node);
            }
            else {
                node.setOptions(options);
            }
        }
        _deltaDecorationsImpl(ownerId, oldDecorationsIds, newDecorations, suppressEvents = false) {
            const versionId = this.getVersionId();
            const oldDecorationsLen = oldDecorationsIds.length;
            let oldDecorationIndex = 0;
            const newDecorationsLen = newDecorations.length;
            let newDecorationIndex = 0;
            this._onDidChangeDecorations.beginDeferredEmit();
            try {
                const result = new Array(newDecorationsLen);
                while (oldDecorationIndex < oldDecorationsLen || newDecorationIndex < newDecorationsLen) {
                    let node = null;
                    if (oldDecorationIndex < oldDecorationsLen) {
                        // (1) get ourselves an old node
                        do {
                            node = this._decorations[oldDecorationsIds[oldDecorationIndex++]];
                        } while (!node && oldDecorationIndex < oldDecorationsLen);
                        // (2) remove the node from the tree (if it exists)
                        if (node) {
                            if (node.options.after) {
                                const nodeRange = this._decorationsTree.getNodeRange(this, node);
                                this._onDidChangeDecorations.recordLineAffectedByInjectedText(nodeRange.endLineNumber);
                            }
                            if (node.options.before) {
                                const nodeRange = this._decorationsTree.getNodeRange(this, node);
                                this._onDidChangeDecorations.recordLineAffectedByInjectedText(nodeRange.startLineNumber);
                            }
                            this._decorationsTree.delete(node);
                            if (!suppressEvents) {
                                this._onDidChangeDecorations.checkAffectedAndFire(node.options);
                            }
                        }
                    }
                    if (newDecorationIndex < newDecorationsLen) {
                        // (3) create a new node if necessary
                        if (!node) {
                            const internalDecorationId = (++this._lastDecorationId);
                            const decorationId = `${this._instanceId};${internalDecorationId}`;
                            node = new intervalTree_1.IntervalNode(decorationId, 0, 0);
                            this._decorations[decorationId] = node;
                        }
                        // (4) initialize node
                        const newDecoration = newDecorations[newDecorationIndex];
                        const range = this._validateRangeRelaxedNoAllocations(newDecoration.range);
                        const options = _normalizeOptions(newDecoration.options);
                        const startOffset = this._buffer.getOffsetAt(range.startLineNumber, range.startColumn);
                        const endOffset = this._buffer.getOffsetAt(range.endLineNumber, range.endColumn);
                        node.ownerId = ownerId;
                        node.reset(versionId, startOffset, endOffset, range);
                        node.setOptions(options);
                        if (node.options.after) {
                            this._onDidChangeDecorations.recordLineAffectedByInjectedText(range.endLineNumber);
                        }
                        if (node.options.before) {
                            this._onDidChangeDecorations.recordLineAffectedByInjectedText(range.startLineNumber);
                        }
                        if (!suppressEvents) {
                            this._onDidChangeDecorations.checkAffectedAndFire(options);
                        }
                        this._decorationsTree.insert(node);
                        result[newDecorationIndex] = node.id;
                        newDecorationIndex++;
                    }
                    else {
                        if (node) {
                            delete this._decorations[node.id];
                        }
                    }
                }
                return result;
            }
            finally {
                this._onDidChangeDecorations.endDeferredEmit();
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
                this._languageSelectionListener.clear();
                this._setLanguage(languageIdOrSelection, source);
            }
            else {
                this._languageSelectionListener.value = languageIdOrSelection.onDidChange(() => this._setLanguage(languageIdOrSelection.languageId, source));
                this._setLanguage(languageIdOrSelection.languageId, source);
            }
        }
        _setLanguage(languageId, source) {
            this.tokenization.setLanguageId(languageId, source);
            this._languageService.requestRichLanguageFeatures(languageId);
        }
        getLanguageIdAtPosition(lineNumber, column) {
            return this.tokenization.getLanguageIdAtPosition(lineNumber, column);
        }
        getWordAtPosition(position) {
            return this._tokenizationTextModelPart.getWordAtPosition(position);
        }
        getWordUntilPosition(position) {
            return this._tokenizationTextModelPart.getWordUntilPosition(position);
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
    exports.TextModel = TextModel;
    exports.TextModel = TextModel = TextModel_1 = __decorate([
        __param(4, undoRedo_1.IUndoRedoService),
        __param(5, language_1.ILanguageService),
        __param(6, languageConfigurationRegistry_1.ILanguageConfigurationService)
    ], TextModel);
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
            this._decorationsTree0 = new intervalTree_1.IntervalTree();
            this._decorationsTree1 = new intervalTree_1.IntervalTree();
            this._injectedTextDecorationsTree = new intervalTree_1.IntervalTree();
        }
        ensureAllNodesHaveRanges(host) {
            this.getAll(host, 0, false, false, false);
        }
        _ensureNodesHaveRanges(host, nodes) {
            for (const node of nodes) {
                if (node.range === null) {
                    node.range = host.getRangeAt(node.cachedAbsoluteStart, node.cachedAbsoluteEnd);
                }
            }
            return nodes;
        }
        getAllInInterval(host, start, end, filterOwnerId, filterOutValidation, onlyMarginDecorations) {
            const versionId = host.getVersionId();
            const result = this._intervalSearch(start, end, filterOwnerId, filterOutValidation, versionId, onlyMarginDecorations);
            return this._ensureNodesHaveRanges(host, result);
        }
        _intervalSearch(start, end, filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations) {
            const r0 = this._decorationsTree0.intervalSearch(start, end, filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations);
            const r1 = this._decorationsTree1.intervalSearch(start, end, filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations);
            const r2 = this._injectedTextDecorationsTree.intervalSearch(start, end, filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations);
            return r0.concat(r1).concat(r2);
        }
        getInjectedTextInInterval(host, start, end, filterOwnerId) {
            const versionId = host.getVersionId();
            const result = this._injectedTextDecorationsTree.intervalSearch(start, end, filterOwnerId, false, versionId, false);
            return this._ensureNodesHaveRanges(host, result).filter((i) => i.options.showIfCollapsed || !i.range.isEmpty());
        }
        getAllInjectedText(host, filterOwnerId) {
            const versionId = host.getVersionId();
            const result = this._injectedTextDecorationsTree.search(filterOwnerId, false, versionId, false);
            return this._ensureNodesHaveRanges(host, result).filter((i) => i.options.showIfCollapsed || !i.range.isEmpty());
        }
        getAll(host, filterOwnerId, filterOutValidation, overviewRulerOnly, onlyMarginDecorations) {
            const versionId = host.getVersionId();
            const result = this._search(filterOwnerId, filterOutValidation, overviewRulerOnly, versionId, onlyMarginDecorations);
            return this._ensureNodesHaveRanges(host, result);
        }
        _search(filterOwnerId, filterOutValidation, overviewRulerOnly, cachedVersionId, onlyMarginDecorations) {
            if (overviewRulerOnly) {
                return this._decorationsTree1.search(filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations);
            }
            else {
                const r0 = this._decorationsTree0.search(filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations);
                const r1 = this._decorationsTree1.search(filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations);
                const r2 = this._injectedTextDecorationsTree.search(filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations);
                return r0.concat(r1).concat(r2);
            }
        }
        collectNodesFromOwner(ownerId) {
            const r0 = this._decorationsTree0.collectNodesFromOwner(ownerId);
            const r1 = this._decorationsTree1.collectNodesFromOwner(ownerId);
            const r2 = this._injectedTextDecorationsTree.collectNodesFromOwner(ownerId);
            return r0.concat(r1).concat(r2);
        }
        collectNodesPostOrder() {
            const r0 = this._decorationsTree0.collectNodesPostOrder();
            const r1 = this._decorationsTree1.collectNodesPostOrder();
            const r2 = this._injectedTextDecorationsTree.collectNodesPostOrder();
            return r0.concat(r1).concat(r2);
        }
        insert(node) {
            if (isNodeInjectedText(node)) {
                this._injectedTextDecorationsTree.insert(node);
            }
            else if (isNodeInOverviewRuler(node)) {
                this._decorationsTree1.insert(node);
            }
            else {
                this._decorationsTree0.insert(node);
            }
        }
        delete(node) {
            if (isNodeInjectedText(node)) {
                this._injectedTextDecorationsTree.delete(node);
            }
            else if (isNodeInOverviewRuler(node)) {
                this._decorationsTree1.delete(node);
            }
            else {
                this._decorationsTree0.delete(node);
            }
        }
        getNodeRange(host, node) {
            const versionId = host.getVersionId();
            if (node.cachedVersionId !== versionId) {
                this._resolveNode(node, versionId);
            }
            if (node.range === null) {
                node.range = host.getRangeAt(node.cachedAbsoluteStart, node.cachedAbsoluteEnd);
            }
            return node.range;
        }
        _resolveNode(node, cachedVersionId) {
            if (isNodeInjectedText(node)) {
                this._injectedTextDecorationsTree.resolveNode(node, cachedVersionId);
            }
            else if (isNodeInOverviewRuler(node)) {
                this._decorationsTree1.resolveNode(node, cachedVersionId);
            }
            else {
                this._decorationsTree0.resolveNode(node, cachedVersionId);
            }
        }
        acceptReplace(offset, length, textLength, forceMoveMarkers) {
            this._decorationsTree0.acceptReplace(offset, length, textLength, forceMoveMarkers);
            this._decorationsTree1.acceptReplace(offset, length, textLength, forceMoveMarkers);
            this._injectedTextDecorationsTree.acceptReplace(offset, length, textLength, forceMoveMarkers);
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
    class ModelDecorationOverviewRulerOptions extends DecorationOptions {
        constructor(options) {
            super(options);
            this._resolvedColor = null;
            this.position = (typeof options.position === 'number' ? options.position : model.OverviewRulerLane.Center);
        }
        getColor(theme) {
            if (!this._resolvedColor) {
                if (theme.type !== 'light' && this.darkColor) {
                    this._resolvedColor = this._resolveColor(this.darkColor, theme);
                }
                else {
                    this._resolvedColor = this._resolveColor(this.color, theme);
                }
            }
            return this._resolvedColor;
        }
        invalidateCachedColor() {
            this._resolvedColor = null;
        }
        _resolveColor(color, theme) {
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
    exports.ModelDecorationOverviewRulerOptions = ModelDecorationOverviewRulerOptions;
    class ModelDecorationGlyphMarginOptions {
        constructor(options) {
            this.position = options?.position ?? model.GlyphMarginLane.Left;
        }
    }
    exports.ModelDecorationGlyphMarginOptions = ModelDecorationGlyphMarginOptions;
    class ModelDecorationMinimapOptions extends DecorationOptions {
        constructor(options) {
            super(options);
            this.position = options.position;
        }
        getColor(theme) {
            if (!this._resolvedColor) {
                if (theme.type !== 'light' && this.darkColor) {
                    this._resolvedColor = this._resolveColor(this.darkColor, theme);
                }
                else {
                    this._resolvedColor = this._resolveColor(this.color, theme);
                }
            }
            return this._resolvedColor;
        }
        invalidateCachedColor() {
            this._resolvedColor = undefined;
        }
        _resolveColor(color, theme) {
            if (typeof color === 'string') {
                return color_1.Color.fromHex(color);
            }
            return theme.getColor(color.id);
        }
    }
    exports.ModelDecorationMinimapOptions = ModelDecorationMinimapOptions;
    class ModelDecorationInjectedTextOptions {
        static from(options) {
            if (options instanceof ModelDecorationInjectedTextOptions) {
                return options;
            }
            return new ModelDecorationInjectedTextOptions(options);
        }
        constructor(options) {
            this.content = options.content || '';
            this.inlineClassName = options.inlineClassName || null;
            this.inlineClassNameAffectsLetterSpacing = options.inlineClassNameAffectsLetterSpacing || false;
            this.attachedData = options.attachedData || null;
            this.cursorStops = options.cursorStops || null;
        }
    }
    exports.ModelDecorationInjectedTextOptions = ModelDecorationInjectedTextOptions;
    class ModelDecorationOptions {
        static register(options) {
            return new ModelDecorationOptions(options);
        }
        static createDynamic(options) {
            return new ModelDecorationOptions(options);
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
            this.overviewRuler = options.overviewRuler ? new ModelDecorationOverviewRulerOptions(options.overviewRuler) : null;
            this.minimap = options.minimap ? new ModelDecorationMinimapOptions(options.minimap) : null;
            this.glyphMargin = options.glyphMarginClassName ? new ModelDecorationGlyphMarginOptions(options.glyphMargin) : null;
            this.glyphMarginClassName = options.glyphMarginClassName ? cleanClassName(options.glyphMarginClassName) : null;
            this.linesDecorationsClassName = options.linesDecorationsClassName ? cleanClassName(options.linesDecorationsClassName) : null;
            this.firstLineDecorationClassName = options.firstLineDecorationClassName ? cleanClassName(options.firstLineDecorationClassName) : null;
            this.marginClassName = options.marginClassName ? cleanClassName(options.marginClassName) : null;
            this.inlineClassName = options.inlineClassName ? cleanClassName(options.inlineClassName) : null;
            this.inlineClassNameAffectsLetterSpacing = options.inlineClassNameAffectsLetterSpacing || false;
            this.beforeContentClassName = options.beforeContentClassName ? cleanClassName(options.beforeContentClassName) : null;
            this.afterContentClassName = options.afterContentClassName ? cleanClassName(options.afterContentClassName) : null;
            this.after = options.after ? ModelDecorationInjectedTextOptions.from(options.after) : null;
            this.before = options.before ? ModelDecorationInjectedTextOptions.from(options.before) : null;
            this.hideInCommentTokens = options.hideInCommentTokens ?? false;
            this.hideInStringTokens = options.hideInStringTokens ?? false;
        }
    }
    exports.ModelDecorationOptions = ModelDecorationOptions;
    ModelDecorationOptions.EMPTY = ModelDecorationOptions.register({ description: 'empty' });
    /**
     * The order carefully matches the values of the enum.
     */
    const TRACKED_RANGE_OPTIONS = [
        ModelDecorationOptions.register({ description: 'tracked-range-always-grows-when-typing-at-edges', stickiness: 0 /* model.TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */ }),
        ModelDecorationOptions.register({ description: 'tracked-range-never-grows-when-typing-at-edges', stickiness: 1 /* model.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */ }),
        ModelDecorationOptions.register({ description: 'tracked-range-grows-only-when-typing-before', stickiness: 2 /* model.TrackedRangeStickiness.GrowsOnlyWhenTypingBefore */ }),
        ModelDecorationOptions.register({ description: 'tracked-range-grows-only-when-typing-after', stickiness: 3 /* model.TrackedRangeStickiness.GrowsOnlyWhenTypingAfter */ }),
    ];
    function _normalizeOptions(options) {
        if (options instanceof ModelDecorationOptions) {
            return options;
        }
        return ModelDecorationOptions.createDynamic(options);
    }
    class DidChangeDecorationsEmitter extends lifecycle_1.Disposable {
        constructor(handleBeforeFire) {
            super();
            this.handleBeforeFire = handleBeforeFire;
            this._actual = this._register(new event_1.Emitter());
            this.event = this._actual.event;
            this._affectedInjectedTextLines = null;
            this._deferredCnt = 0;
            this._shouldFireDeferred = false;
            this._affectsMinimap = false;
            this._affectsOverviewRuler = false;
            this._affectsGlyphMargin = false;
        }
        hasListeners() {
            return this._actual.hasListeners();
        }
        beginDeferredEmit() {
            this._deferredCnt++;
        }
        endDeferredEmit() {
            this._deferredCnt--;
            if (this._deferredCnt === 0) {
                if (this._shouldFireDeferred) {
                    this.doFire();
                }
                this._affectedInjectedTextLines?.clear();
                this._affectedInjectedTextLines = null;
            }
        }
        recordLineAffectedByInjectedText(lineNumber) {
            if (!this._affectedInjectedTextLines) {
                this._affectedInjectedTextLines = new Set();
            }
            this._affectedInjectedTextLines.add(lineNumber);
        }
        checkAffectedAndFire(options) {
            if (!this._affectsMinimap) {
                this._affectsMinimap = options.minimap && options.minimap.position ? true : false;
            }
            if (!this._affectsOverviewRuler) {
                this._affectsOverviewRuler = options.overviewRuler && options.overviewRuler.color ? true : false;
            }
            if (!this._affectsGlyphMargin) {
                this._affectsGlyphMargin = options.glyphMarginClassName ? true : false;
            }
            this.tryFire();
        }
        fire() {
            this._affectsMinimap = true;
            this._affectsOverviewRuler = true;
            this._affectsGlyphMargin = true;
            this.tryFire();
        }
        tryFire() {
            if (this._deferredCnt === 0) {
                this.doFire();
            }
            else {
                this._shouldFireDeferred = true;
            }
        }
        doFire() {
            this.handleBeforeFire(this._affectedInjectedTextLines);
            const event = {
                affectsMinimap: this._affectsMinimap,
                affectsOverviewRuler: this._affectsOverviewRuler,
                affectsGlyphMargin: this._affectsGlyphMargin
            };
            this._shouldFireDeferred = false;
            this._affectsMinimap = false;
            this._affectsOverviewRuler = false;
            this._affectsGlyphMargin = false;
            this._actual.fire(event);
        }
    }
    //#endregion
    class DidChangeContentEmitter extends lifecycle_1.Disposable {
        constructor() {
            super();
            /**
             * Both `fastEvent` and `slowEvent` work the same way and contain the same events, but first we invoke `fastEvent` and then `slowEvent`.
             */
            this._fastEmitter = this._register(new event_1.Emitter());
            this.fastEvent = this._fastEmitter.event;
            this._slowEmitter = this._register(new event_1.Emitter());
            this.slowEvent = this._slowEmitter.event;
            this._deferredCnt = 0;
            this._deferredEvent = null;
        }
        hasListeners() {
            return (this._fastEmitter.hasListeners()
                || this._slowEmitter.hasListeners());
        }
        beginDeferredEmit() {
            this._deferredCnt++;
        }
        endDeferredEmit(resultingSelection = null) {
            this._deferredCnt--;
            if (this._deferredCnt === 0) {
                if (this._deferredEvent !== null) {
                    this._deferredEvent.rawContentChangedEvent.resultingSelection = resultingSelection;
                    const e = this._deferredEvent;
                    this._deferredEvent = null;
                    this._fastEmitter.fire(e);
                    this._slowEmitter.fire(e);
                }
            }
        }
        fire(e) {
            if (this._deferredCnt > 0) {
                if (this._deferredEvent) {
                    this._deferredEvent = this._deferredEvent.merge(e);
                }
                else {
                    this._deferredEvent = e;
                }
                return;
            }
            this._fastEmitter.fire(e);
            this._slowEmitter.fire(e);
        }
    }
    /**
     * @internal
     */
    class AttachedViews {
        constructor() {
            this._onDidChangeVisibleRanges = new event_1.Emitter();
            this.onDidChangeVisibleRanges = this._onDidChangeVisibleRanges.event;
            this._views = new Set();
        }
        attachView() {
            const view = new AttachedViewImpl((state) => {
                this._onDidChangeVisibleRanges.fire({ view, state });
            });
            this._views.add(view);
            return view;
        }
        detachView(view) {
            this._views.delete(view);
            this._onDidChangeVisibleRanges.fire({ view, state: undefined });
        }
    }
    exports.AttachedViews = AttachedViews;
    class AttachedViewImpl {
        constructor(handleStateChange) {
            this.handleStateChange = handleStateChange;
        }
        setVisibleLines(visibleLines, stabilized) {
            const visibleLineRanges = visibleLines.map((line) => new lineRange_1.LineRange(line.startLineNumber, line.endLineNumber + 1));
            this.handleStateChange({ visibleLineRanges, stabilized });
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dE1vZGVsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9tb2RlbC90ZXh0TW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQTZDaEcsU0FBZ0IsdUJBQXVCLENBQUMsSUFBWTtRQUNuRCxNQUFNLE9BQU8sR0FBRyxJQUFJLHVEQUEwQixFQUFFLENBQUM7UUFDakQsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMxQixPQUFPLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUN6QixDQUFDO0lBSkQsMERBSUM7SUFXRCxTQUFnQixpQ0FBaUMsQ0FBQyxNQUE0QztRQUM3RixPQUFPLElBQUksT0FBTyxDQUEyQixDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUNoRSxNQUFNLE9BQU8sR0FBRyxJQUFJLHVEQUEwQixFQUFFLENBQUM7WUFFakQsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDO1lBRWpCLElBQUEscUJBQVksRUFBb0IsTUFBTSxFQUFFO2dCQUN2QyxNQUFNLEVBQUUsS0FBSyxDQUFDLEVBQUU7b0JBQ2YsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO2dCQUM3RSxDQUFDO2dCQUNELE9BQU8sRUFBRSxLQUFLLENBQUMsRUFBRTtvQkFDaEIsSUFBSSxDQUFDLElBQUksRUFBRTt3QkFDVixJQUFJLEdBQUcsSUFBSSxDQUFDO3dCQUNaLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztxQkFDZDtnQkFDRixDQUFDO2dCQUNELEtBQUssRUFBRSxHQUFHLEVBQUU7b0JBQ1gsSUFBSSxDQUFDLElBQUksRUFBRTt3QkFD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