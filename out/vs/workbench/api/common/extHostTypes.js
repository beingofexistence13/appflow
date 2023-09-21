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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/errors", "vs/base/common/htmlContent", "vs/base/common/map", "vs/base/common/mime", "vs/base/common/strings", "vs/base/common/types", "vs/base/common/uri", "vs/base/common/uuid", "vs/platform/extensions/common/extensions", "vs/platform/files/common/files", "vs/platform/remote/common/remoteAuthorityResolver", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, arrays_1, errors_1, htmlContent_1, map_1, mime_1, strings_1, types_1, uri_1, uuid_1, extensions_1, files_1, remoteAuthorityResolver_1, notebookCommon_1) {
    "use strict";
    var Disposable_1, Position_1, Range_1, Selection_1, TextEdit_1, NotebookEdit_1, SnippetString_1, Location_1, SymbolInformation_1, DocumentSymbol_1, CodeActionKind_1, MarkdownString_1, TaskGroup_1, Task_1, TreeItem_1, FileSystemError_1, TestMessage_1, FileCoverage_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RelatedInformationType = exports.ChatMessage = exports.ChatVariableLevel = exports.ChatMessageRole = exports.InteractiveEditorResponseFeedbackKind = exports.InteractiveSessionCopyKind = exports.InteractiveSessionVoteDirection = exports.InteractiveWindowInput = exports.TerminalEditorTabInput = exports.NotebookDiffEditorTabInput = exports.NotebookEditorTabInput = exports.WebviewEditorTabInput = exports.CustomEditorTabInput = exports.TextMergeTabInput = exports.TextDiffTabInput = exports.TextTabInput = exports.TypeHierarchyItem = exports.PortAutoForwardAction = exports.WorkspaceTrustState = exports.ExternalUriOpenerPriority = exports.FunctionCoverage = exports.BranchCoverage = exports.StatementCoverage = exports.FileCoverage = exports.CoveredCount = exports.TestTag = exports.TestMessage = exports.TestRunRequest = exports.TestRunProfileKind = exports.TestResultState = exports.PortAttributes = exports.LinkedEditingRanges = exports.StandardTokenType = exports.ExtensionRuntime = exports.ExtensionMode = exports.TimelineItem = exports.NotebookKernelSourceAction = exports.NotebookRendererScript = exports.NotebookControllerAffinity2 = exports.NotebookControllerAffinity = exports.NotebookCellStatusBarItem = exports.NotebookEditorRevealType = exports.NotebookCellStatusBarAlignment = exports.NotebookCellExecutionState = exports.NotebookCellKind = exports.NotebookCellOutput = exports.NotebookCellOutputItem = exports.NotebookData = exports.NotebookCellData = exports.NotebookRange = exports.ColorThemeKind = exports.ColorTheme = exports.FileDecoration = exports.ExtensionKind = exports.InputBoxValidationSeverity = exports.QuickPickItemKind = exports.QuickInputButtons = exports.DebugConsoleMode = exports.SemanticTokensEdits = exports.SemanticTokensEdit = exports.SemanticTokens = exports.SemanticTokensBuilder = exports.SemanticTokensLegend = exports.CommentThreadState = exports.CommentState = exports.CommentMode = exports.CommentThreadCollapsibleState = exports.FoldingRangeKind = exports.FoldingRange = exports.FileSystemError = exports.FileChangeType = exports.InlineValueContext = exports.InlineValueEvaluatableExpression = exports.InlineValueVariableLookup = exports.InlineValueText = exports.InlineCompletionTriggerKind = exports.EvaluatableExpression = exports.ThreadFocus = exports.StackFrameFocus = exports.DebugAdapterInlineImplementation = exports.DebugAdapterNamedPipeServer = exports.DebugAdapterServer = exports.DebugAdapterExecutable = exports.DataBreakpoint = exports.FunctionBreakpoint = exports.SourceBreakpoint = exports.Breakpoint = exports.setBreakpointId = exports.RelativePattern = exports.ConfigurationTarget = exports.ThemeColor = exports.ThemeIcon = exports.DocumentPasteEdit = exports.DocumentDropEdit = exports.DataTransfer = exports.DataTransferFile = exports.InternalFileDataTransferItem = exports.InternalDataTransferItem = exports.DataTransferItem = exports.TreeItemCheckboxState = exports.TreeItemCollapsibleState = exports.TreeItem = exports.ViewBadge = exports.ProgressLocation = exports.Task = exports.CustomExecution = exports.TaskScope = exports.ShellQuoting = exports.ShellExecution = exports.ProcessExecution = exports.TaskGroup = exports.TaskPanelKind = exports.TaskRevealKind = exports.TerminalProfile = exports.TerminalLocation = exports.TerminalQuickFixCommand = exports.TerminalQuickFixOpener = exports.TerminalLink = exports.TerminalExitReason = exports.SourceControlInputBoxValidationType = exports.ColorFormat = exports.ColorPresentation = exports.ColorInformation = exports.Color = exports.DocumentLink = exports.SyntaxTokenType = exports.DecorationRangeBehavior = exports.TextDocumentChangeReason = exports.TextEditorSelectionChangeKind = exports.TextEditorRevealType = exports.TextDocumentSaveReason = exports.TextEditorLineNumbersStyle = exports.asStatusBarItemIdentifier = exports.StatusBarAlignment = exports.ViewColumn = exports.InlineSuggestionList = exports.InlineSuggestion = exports.CompletionList = exports.CompletionItem = exports.CompletionItemTag = exports.CompletionItemKind = exports.CompletionTriggerKind = exports.InlayHint = exports.InlayHintLabelPart = exports.InlayHintKind = exports.SignatureHelpTriggerKind = exports.SignatureHelp = exports.SignatureInformation = exports.ParameterInformation = exports.MarkdownString = exports.CodeLens = exports.LanguageStatusSeverity = exports.CallHierarchyOutgoingCall = exports.CallHierarchyIncomingCall = exports.CallHierarchyItem = exports.SelectionRange = exports.CodeActionKind = exports.CodeAction = exports.CodeActionTriggerKind = exports.DocumentSymbol = exports.SymbolInformation = exports.SymbolTag = exports.SymbolKind = exports.DocumentHighlight = exports.DocumentHighlightKind = exports.Hover = exports.Diagnostic = exports.DiagnosticRelatedInformation = exports.Location = exports.DiagnosticSeverity = exports.DiagnosticTag = exports.SnippetString = exports.WorkspaceEdit = exports.FileEditType = exports.SnippetTextEdit = exports.NotebookEdit = exports.TextEdit = exports.EnvironmentVariableMutatorType = exports.EndOfLine = exports.RemoteAuthorityResolverError = exports.ManagedResolvedAuthority = exports.ResolvedAuthority = exports.Selection = exports.Range = exports.Position = exports.Disposable = exports.TerminalQuickFixType = exports.TerminalOutputAnchor = void 0;
    /**
     * @deprecated
     *
     * This utility ensures that old JS code that uses functions for classes still works. Existing usages cannot be removed
     * but new ones must not be added
     * */
    function es5ClassCompat(target) {
        const interceptFunctions = {
            apply: function (...args) {
                if (args.length === 0) {
                    return Reflect.construct(target, []);
                }
                else {
                    const argsList = args.length === 1 ? [] : args[1];
                    return Reflect.construct(target, argsList, args[0].constructor);
                }
            },
            call: function (...args) {
                if (args.length === 0) {
                    return Reflect.construct(target, []);
                }
                else {
                    const [thisArg, ...restArgs] = args;
                    return Reflect.construct(target, restArgs, thisArg.constructor);
                }
            }
        };
        return Object.assign(target, interceptFunctions);
    }
    var TerminalOutputAnchor;
    (function (TerminalOutputAnchor) {
        TerminalOutputAnchor[TerminalOutputAnchor["Top"] = 0] = "Top";
        TerminalOutputAnchor[TerminalOutputAnchor["Bottom"] = 1] = "Bottom";
    })(TerminalOutputAnchor || (exports.TerminalOutputAnchor = TerminalOutputAnchor = {}));
    var TerminalQuickFixType;
    (function (TerminalQuickFixType) {
        TerminalQuickFixType[TerminalQuickFixType["TerminalCommand"] = 0] = "TerminalCommand";
        TerminalQuickFixType[TerminalQuickFixType["Opener"] = 1] = "Opener";
        TerminalQuickFixType[TerminalQuickFixType["Command"] = 3] = "Command";
    })(TerminalQuickFixType || (exports.TerminalQuickFixType = TerminalQuickFixType = {}));
    let Disposable = Disposable_1 = class Disposable {
        static from(...inDisposables) {
            let disposables = inDisposables;
            return new Disposable_1(function () {
                if (disposables) {
                    for (const disposable of disposables) {
                        if (disposable && typeof disposable.dispose === 'function') {
                            disposable.dispose();
                        }
                    }
                    disposables = undefined;
                }
            });
        }
        #callOnDispose;
        constructor(callOnDispose) {
            this.#callOnDispose = callOnDispose;
        }
        dispose() {
            if (typeof this.#callOnDispose === 'function') {
                this.#callOnDispose();
                this.#callOnDispose = undefined;
            }
        }
    };
    exports.Disposable = Disposable;
    exports.Disposable = Disposable = Disposable_1 = __decorate([
        es5ClassCompat
    ], Disposable);
    let Position = Position_1 = class Position {
        static Min(...positions) {
            if (positions.length === 0) {
                throw new TypeError();
            }
            let result = positions[0];
            for (let i = 1; i < positions.length; i++) {
                const p = positions[i];
                if (p.isBefore(result)) {
                    result = p;
                }
            }
            return result;
        }
        static Max(...positions) {
            if (positions.length === 0) {
                throw new TypeError();
            }
            let result = positions[0];
            for (let i = 1; i < positions.length; i++) {
                const p = positions[i];
                if (p.isAfter(result)) {
                    result = p;
                }
            }
            return result;
        }
        static isPosition(other) {
            if (!other) {
                return false;
            }
            if (other instanceof Position_1) {
                return true;
            }
            const { line, character } = other;
            if (typeof line === 'number' && typeof character === 'number') {
                return true;
            }
            return false;
        }
        static of(obj) {
            if (obj instanceof Position_1) {
                return obj;
            }
            else if (this.isPosition(obj)) {
                return new Position_1(obj.line, obj.character);
            }
            throw new Error('Invalid argument, is NOT a position-like object');
        }
        get line() {
            return this._line;
        }
        get character() {
            return this._character;
        }
        constructor(line, character) {
            if (line < 0) {
                throw (0, errors_1.illegalArgument)('line must be non-negative');
            }
            if (character < 0) {
                throw (0, errors_1.illegalArgument)('character must be non-negative');
            }
            this._line = line;
            this._character = character;
        }
        isBefore(other) {
            if (this._line < other._line) {
                return true;
            }
            if (other._line < this._line) {
                return false;
            }
            return this._character < other._character;
        }
        isBeforeOrEqual(other) {
            if (this._line < other._line) {
                return true;
            }
            if (other._line < this._line) {
                return false;
            }
            return this._character <= other._character;
        }
        isAfter(other) {
            return !this.isBeforeOrEqual(other);
        }
        isAfterOrEqual(other) {
            return !this.isBefore(other);
        }
        isEqual(other) {
            return this._line === other._line && this._character === other._character;
        }
        compareTo(other) {
            if (this._line < other._line) {
                return -1;
            }
            else if (this._line > other.line) {
                return 1;
            }
            else {
                // equal line
                if (this._character < other._character) {
                    return -1;
                }
                else if (this._character > other._character) {
                    return 1;
                }
                else {
                    // equal line and character
                    return 0;
                }
            }
        }
        translate(lineDeltaOrChange, characterDelta = 0) {
            if (lineDeltaOrChange === null || characterDelta === null) {
                throw (0, errors_1.illegalArgument)();
            }
            let lineDelta;
            if (typeof lineDeltaOrChange === 'undefined') {
                lineDelta = 0;
            }
            else if (typeof lineDeltaOrChange === 'number') {
                lineDelta = lineDeltaOrChange;
            }
            else {
                lineDelta = typeof lineDeltaOrChange.lineDelta === 'number' ? lineDeltaOrChange.lineDelta : 0;
                characterDelta = typeof lineDeltaOrChange.characterDelta === 'number' ? lineDeltaOrChange.characterDelta : 0;
            }
            if (lineDelta === 0 && characterDelta === 0) {
                return this;
            }
            return new Position_1(this.line + lineDelta, this.character + characterDelta);
        }
        with(lineOrChange, character = this.character) {
            if (lineOrChange === null || character === null) {
                throw (0, errors_1.illegalArgument)();
            }
            let line;
            if (typeof lineOrChange === 'undefined') {
                line = this.line;
            }
            else if (typeof lineOrChange === 'number') {
                line = lineOrChange;
            }
            else {
                line = typeof lineOrChange.line === 'number' ? lineOrChange.line : this.line;
                character = typeof lineOrChange.character === 'number' ? lineOrChange.character : this.character;
            }
            if (line === this.line && character === this.character) {
                return this;
            }
            return new Position_1(line, character);
        }
        toJSON() {
            return { line: this.line, character: this.character };
        }
    };
    exports.Position = Position;
    exports.Position = Position = Position_1 = __decorate([
        es5ClassCompat
    ], Position);
    let Range = Range_1 = class Range {
        static isRange(thing) {
            if (thing instanceof Range_1) {
                return true;
            }
            if (!thing) {
                return false;
            }
            return Position.isPosition(thing.start)
                && Position.isPosition(thing.end);
        }
        static of(obj) {
            if (obj instanceof Range_1) {
                return obj;
            }
            if (this.isRange(obj)) {
                return new Range_1(obj.start, obj.end);
            }
            throw new Error('Invalid argument, is NOT a range-like object');
        }
        get start() {
            return this._start;
        }
        get end() {
            return this._end;
        }
        constructor(startLineOrStart, startColumnOrEnd, endLine, endColumn) {
            let start;
            let end;
            if (typeof startLineOrStart === 'number' && typeof startColumnOrEnd === 'number' && typeof endLine === 'number' && typeof endColumn === 'number') {
                start = new Position(startLineOrStart, startColumnOrEnd);
                end = new Position(endLine, endColumn);
            }
            else if (Position.isPosition(startLineOrStart) && Position.isPosition(startColumnOrEnd)) {
                start = Position.of(startLineOrStart);
                end = Position.of(startColumnOrEnd);
            }
            if (!start || !end) {
                throw new Error('Invalid arguments');
            }
            if (start.isBefore(end)) {
                this._start = start;
                this._end = end;
            }
            else {
                this._start = end;
                this._end = start;
            }
        }
        contains(positionOrRange) {
            if (Range_1.isRange(positionOrRange)) {
                return this.contains(positionOrRange.start)
                    && this.contains(positionOrRange.end);
            }
            else if (Position.isPosition(positionOrRange)) {
                if (Position.of(positionOrRange).isBefore(this._start)) {
                    return false;
                }
                if (this._end.isBefore(positionOrRange)) {
                    return false;
                }
                return true;
            }
            return false;
        }
        isEqual(other) {
            return this._start.isEqual(other._start) && this._end.isEqual(other._end);
        }
        intersection(other) {
            const start = Position.Max(other.start, this._start);
            const end = Position.Min(other.end, this._end);
            if (start.isAfter(end)) {
                // this happens when there is no overlap:
                // |-----|
                //          |----|
                return undefined;
            }
            return new Range_1(start, end);
        }
        union(other) {
            if (this.contains(other)) {
                return this;
            }
            else if (other.contains(this)) {
                return other;
            }
            const start = Position.Min(other.start, this._start);
            const end = Position.Max(other.end, this.end);
            return new Range_1(start, end);
        }
        get isEmpty() {
            return this._start.isEqual(this._end);
        }
        get isSingleLine() {
            return this._start.line === this._end.line;
        }
        with(startOrChange, end = this.end) {
            if (startOrChange === null || end === null) {
                throw (0, errors_1.illegalArgument)();
            }
            let start;
            if (!startOrChange) {
                start = this.start;
            }
            else if (Position.isPosition(startOrChange)) {
                start = startOrChange;
            }
            else {
                start = startOrChange.start || this.start;
                end = startOrChange.end || this.end;
            }
            if (start.isEqual(this._start) && end.isEqual(this.end)) {
                return this;
            }
            return new Range_1(start, end);
        }
        toJSON() {
            return [this.start, this.end];
        }
    };
    exports.Range = Range;
    exports.Range = Range = Range_1 = __decorate([
        es5ClassCompat
    ], Range);
    let Selection = Selection_1 = class Selection extends Range {
        static isSelection(thing) {
            if (thing instanceof Selection_1) {
                return true;
            }
            if (!thing) {
                return false;
            }
            return Range.isRange(thing)
                && Position.isPosition(thing.anchor)
                && Position.isPosition(thing.active)
                && typeof thing.isReversed === 'boolean';
        }
        get anchor() {
            return this._anchor;
        }
        get active() {
            return this._active;
        }
        constructor(anchorLineOrAnchor, anchorColumnOrActive, activeLine, activeColumn) {
            let anchor;
            let active;
            if (typeof anchorLineOrAnchor === 'number' && typeof anchorColumnOrActive === 'number' && typeof activeLine === 'number' && typeof activeColumn === 'number') {
                anchor = new Position(anchorLineOrAnchor, anchorColumnOrActive);
                active = new Position(activeLine, activeColumn);
            }
            else if (Position.isPosition(anchorLineOrAnchor) && Position.isPosition(anchorColumnOrActive)) {
                anchor = Position.of(anchorLineOrAnchor);
                active = Position.of(anchorColumnOrActive);
            }
            if (!anchor || !active) {
                throw new Error('Invalid arguments');
            }
            super(anchor, active);
            this._anchor = anchor;
            this._active = active;
        }
        get isReversed() {
            return this._anchor === this._end;
        }
        toJSON() {
            return {
                start: this.start,
                end: this.end,
                active: this.active,
                anchor: this.anchor
            };
        }
    };
    exports.Selection = Selection;
    exports.Selection = Selection = Selection_1 = __decorate([
        es5ClassCompat
    ], Selection);
    const validateConnectionToken = (connectionToken) => {
        if (typeof connectionToken !== 'string' || connectionToken.length === 0 || !/^[0-9A-Za-z_\-]+$/.test(connectionToken)) {
            throw (0, errors_1.illegalArgument)('connectionToken');
        }
    };
    class ResolvedAuthority {
        static isResolvedAuthority(resolvedAuthority) {
            return resolvedAuthority
                && typeof resolvedAuthority === 'object'
                && typeof resolvedAuthority.host === 'string'
                && typeof resolvedAuthority.port === 'number'
                && (resolvedAuthority.connectionToken === undefined || typeof resolvedAuthority.connectionToken === 'string');
        }
        constructor(host, port, connectionToken) {
            if (typeof host !== 'string' || host.length === 0) {
                throw (0, errors_1.illegalArgument)('host');
            }
            if (typeof port !== 'number' || port === 0 || Math.round(port) !== port) {
                throw (0, errors_1.illegalArgument)('port');
            }
            if (typeof connectionToken !== 'undefined') {
                validateConnectionToken(connectionToken);
            }
            this.host = host;
            this.port = Math.round(port);
            this.connectionToken = connectionToken;
        }
    }
    exports.ResolvedAuthority = ResolvedAuthority;
    class ManagedResolvedAuthority {
        static isManagedResolvedAuthority(resolvedAuthority) {
            return resolvedAuthority
                && typeof resolvedAuthority === 'object'
                && typeof resolvedAuthority.makeConnection === 'function'
                && (resolvedAuthority.connectionToken === undefined || typeof resolvedAuthority.connectionToken === 'string');
        }
        constructor(makeConnection, connectionToken) {
            this.makeConnection = makeConnection;
            this.connectionToken = connectionToken;
            if (typeof connectionToken !== 'undefined') {
                validateConnectionToken(connectionToken);
            }
        }
    }
    exports.ManagedResolvedAuthority = ManagedResolvedAuthority;
    class RemoteAuthorityResolverError extends Error {
        static NotAvailable(message, handled) {
            return new RemoteAuthorityResolverError(message, remoteAuthorityResolver_1.RemoteAuthorityResolverErrorCode.NotAvailable, handled);
        }
        static TemporarilyNotAvailable(message) {
            return new RemoteAuthorityResolverError(message, remoteAuthorityResolver_1.RemoteAuthorityResolverErrorCode.TemporarilyNotAvailable);
        }
        constructor(message, code = remoteAuthorityResolver_1.RemoteAuthorityResolverErrorCode.Unknown, detail) {
            super(message);
            this._message = message;
            this._code = code;
            this._detail = detail;
            // workaround when extending builtin objects and when compiling to ES5, see:
            // https://github.com/microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
            Object.setPrototypeOf(this, RemoteAuthorityResolverError.prototype);
        }
    }
    exports.RemoteAuthorityResolverError = RemoteAuthorityResolverError;
    var EndOfLine;
    (function (EndOfLine) {
        EndOfLine[EndOfLine["LF"] = 1] = "LF";
        EndOfLine[EndOfLine["CRLF"] = 2] = "CRLF";
    })(EndOfLine || (exports.EndOfLine = EndOfLine = {}));
    var EnvironmentVariableMutatorType;
    (function (EnvironmentVariableMutatorType) {
        EnvironmentVariableMutatorType[EnvironmentVariableMutatorType["Replace"] = 1] = "Replace";
        EnvironmentVariableMutatorType[EnvironmentVariableMutatorType["Append"] = 2] = "Append";
        EnvironmentVariableMutatorType[EnvironmentVariableMutatorType["Prepend"] = 3] = "Prepend";
    })(EnvironmentVariableMutatorType || (exports.EnvironmentVariableMutatorType = EnvironmentVariableMutatorType = {}));
    let TextEdit = TextEdit_1 = class TextEdit {
        static isTextEdit(thing) {
            if (thing instanceof TextEdit_1) {
                return true;
            }
            if (!thing) {
                return false;
            }
            return Range.isRange(thing)
                && typeof thing.newText === 'string';
        }
        static replace(range, newText) {
            return new TextEdit_1(range, newText);
        }
        static insert(position, newText) {
            return TextEdit_1.replace(new Range(position, position), newText);
        }
        static delete(range) {
            return TextEdit_1.replace(range, '');
        }
        static setEndOfLine(eol) {
            const ret = new TextEdit_1(new Range(new Position(0, 0), new Position(0, 0)), '');
            ret.newEol = eol;
            return ret;
        }
        get range() {
            return this._range;
        }
        set range(value) {
            if (value && !Range.isRange(value)) {
                throw (0, errors_1.illegalArgument)('range');
            }
            this._range = value;
        }
        get newText() {
            return this._newText || '';
        }
        set newText(value) {
            if (value && typeof value !== 'string') {
                throw (0, errors_1.illegalArgument)('newText');
            }
            this._newText = value;
        }
        get newEol() {
            return this._newEol;
        }
        set newEol(value) {
            if (value && typeof value !== 'number') {
                throw (0, errors_1.illegalArgument)('newEol');
            }
            this._newEol = value;
        }
        constructor(range, newText) {
            this._range = range;
            this._newText = newText;
        }
        toJSON() {
            return {
                range: this.range,
                newText: this.newText,
                newEol: this._newEol
            };
        }
    };
    exports.TextEdit = TextEdit;
    exports.TextEdit = TextEdit = TextEdit_1 = __decorate([
        es5ClassCompat
    ], TextEdit);
    let NotebookEdit = NotebookEdit_1 = class NotebookEdit {
        static isNotebookCellEdit(thing) {
            if (thing instanceof NotebookEdit_1) {
                return true;
            }
            if (!thing) {
                return false;
            }
            return NotebookRange.isNotebookRange(thing)
                && Array.isArray(thing.newCells);
        }
        static replaceCells(range, newCells) {
            return new NotebookEdit_1(range, newCells);
        }
        static insertCells(index, newCells) {
            return new NotebookEdit_1(new NotebookRange(index, index), newCells);
        }
        static deleteCells(range) {
            return new NotebookEdit_1(range, []);
        }
        static updateCellMetadata(index, newMetadata) {
            const edit = new NotebookEdit_1(new NotebookRange(index, index), []);
            edit.newCellMetadata = newMetadata;
            return edit;
        }
        static updateNotebookMetadata(newMetadata) {
            const edit = new NotebookEdit_1(new NotebookRange(0, 0), []);
            edit.newNotebookMetadata = newMetadata;
            return edit;
        }
        constructor(range, newCells) {
            this.range = range;
            this.newCells = newCells;
        }
    };
    exports.NotebookEdit = NotebookEdit;
    exports.NotebookEdit = NotebookEdit = NotebookEdit_1 = __decorate([
        es5ClassCompat
    ], NotebookEdit);
    class SnippetTextEdit {
        static isSnippetTextEdit(thing) {
            if (thing instanceof SnippetTextEdit) {
                return true;
            }
            if (!thing) {
                return false;
            }
            return Range.isRange(thing.range)
                && SnippetString.isSnippetString(thing.snippet);
        }
        static replace(range, snippet) {
            return new SnippetTextEdit(range, snippet);
        }
        static insert(position, snippet) {
            return SnippetTextEdit.replace(new Range(position, position), snippet);
        }
        constructor(range, snippet) {
            this.range = range;
            this.snippet = snippet;
        }
    }
    exports.SnippetTextEdit = SnippetTextEdit;
    var FileEditType;
    (function (FileEditType) {
        FileEditType[FileEditType["File"] = 1] = "File";
        FileEditType[FileEditType["Text"] = 2] = "Text";
        FileEditType[FileEditType["Cell"] = 3] = "Cell";
        FileEditType[FileEditType["CellReplace"] = 5] = "CellReplace";
        FileEditType[FileEditType["Snippet"] = 6] = "Snippet";
    })(FileEditType || (exports.FileEditType = FileEditType = {}));
    let WorkspaceEdit = class WorkspaceEdit {
        constructor() {
            this._edits = [];
        }
        _allEntries() {
            return this._edits;
        }
        // --- file
        renameFile(from, to, options, metadata) {
            this._edits.push({ _type: 1 /* FileEditType.File */, from, to, options, metadata });
        }
        createFile(uri, options, metadata) {
            this._edits.push({ _type: 1 /* FileEditType.File */, from: undefined, to: uri, options, metadata });
        }
        deleteFile(uri, options, metadata) {
            this._edits.push({ _type: 1 /* FileEditType.File */, from: uri, to: undefined, options, metadata });
        }
        // --- notebook
        replaceNotebookMetadata(uri, value, metadata) {
            this._edits.push({ _type: 3 /* FileEditType.Cell */, metadata, uri, edit: { editType: 5 /* CellEditType.DocumentMetadata */, metadata: value }, notebookMetadata: value });
        }
        replaceNotebookCells(uri, startOrRange, cellData, metadata) {
            const start = startOrRange.start;
            const end = startOrRange.end;
            if (start !== end || cellData.length > 0) {
                this._edits.push({ _type: 5 /* FileEditType.CellReplace */, uri, index: start, count: end - start, cells: cellData, metadata });
            }
        }
        replaceNotebookCellMetadata(uri, index, cellMetadata, metadata) {
            this._edits.push({ _type: 3 /* FileEditType.Cell */, metadata, uri, edit: { editType: 3 /* CellEditType.Metadata */, index, metadata: cellMetadata } });
        }
        // --- text
        replace(uri, range, newText, metadata) {
            this._edits.push({ _type: 2 /* FileEditType.Text */, uri, edit: new TextEdit(range, newText), metadata });
        }
        insert(resource, position, newText, metadata) {
            this.replace(resource, new Range(position, position), newText, metadata);
        }
        delete(resource, range, metadata) {
            this.replace(resource, range, '', metadata);
        }
        // --- text (Maplike)
        has(uri) {
            return this._edits.some(edit => edit._type === 2 /* FileEditType.Text */ && edit.uri.toString() === uri.toString());
        }
        set(uri, edits) {
            if (!edits) {
                // remove all text, snippet, or notebook edits for `uri`
                for (let i = 0; i < this._edits.length; i++) {
                    const element = this._edits[i];
                    switch (element._type) {
                        case 2 /* FileEditType.Text */:
                        case 6 /* FileEditType.Snippet */:
                        case 3 /* FileEditType.Cell */:
                        case 5 /* FileEditType.CellReplace */:
                            if (element.uri.toString() === uri.toString()) {
                                this._edits[i] = undefined; // will be coalesced down below
                            }
                            break;
                    }
                }
                (0, arrays_1.coalesceInPlace)(this._edits);
            }
            else {
                // append edit to the end
                for (const editOrTuple of edits) {
                    if (!editOrTuple) {
                        continue;
                    }
                    let edit;
                    let metadata;
                    if (Array.isArray(editOrTuple)) {
                        edit = editOrTuple[0];
                        metadata = editOrTuple[1];
                    }
                    else {
                        edit = editOrTuple;
                    }
                    if (NotebookEdit.isNotebookCellEdit(edit)) {
                        if (edit.newCellMetadata) {
                            this.replaceNotebookCellMetadata(uri, edit.range.start, edit.newCellMetadata, metadata);
                        }
                        else if (edit.newNotebookMetadata) {
                            this.replaceNotebookMetadata(uri, edit.newNotebookMetadata, metadata);
                        }
                        else {
                            this.replaceNotebookCells(uri, edit.range, edit.newCells, metadata);
                        }
                    }
                    else if (SnippetTextEdit.isSnippetTextEdit(edit)) {
                        this._edits.push({ _type: 6 /* FileEditType.Snippet */, uri, range: edit.range, edit: edit.snippet, metadata });
                    }
                    else {
                        this._edits.push({ _type: 2 /* FileEditType.Text */, uri, edit, metadata });
                    }
                }
            }
        }
        get(uri) {
            const res = [];
            for (const candidate of this._edits) {
                if (candidate._type === 2 /* FileEditType.Text */ && candidate.uri.toString() === uri.toString()) {
                    res.push(candidate.edit);
                }
            }
            return res;
        }
        entries() {
            const textEdits = new map_1.ResourceMap();
            for (const candidate of this._edits) {
                if (candidate._type === 2 /* FileEditType.Text */) {
                    let textEdit = textEdits.get(candidate.uri);
                    if (!textEdit) {
                        textEdit = [candidate.uri, []];
                        textEdits.set(candidate.uri, textEdit);
                    }
                    textEdit[1].push(candidate.edit);
                }
            }
            return [...textEdits.values()];
        }
        get size() {
            return this.entries().length;
        }
        toJSON() {
            return this.entries();
        }
    };
    exports.WorkspaceEdit = WorkspaceEdit;
    exports.WorkspaceEdit = WorkspaceEdit = __decorate([
        es5ClassCompat
    ], WorkspaceEdit);
    let SnippetString = SnippetString_1 = class SnippetString {
        static isSnippetString(thing) {
            if (thing instanceof SnippetString_1) {
                return true;
            }
            if (!thing) {
                return false;
            }
            return typeof thing.value === 'string';
        }
        static _escape(value) {
            return value.replace(/\$|}|\\/g, '\\$&');
        }
        constructor(value) {
            this._tabstop = 1;
            this.value = value || '';
        }
        appendText(string) {
            this.value += SnippetString_1._escape(string);
            return this;
        }
        appendTabstop(number = this._tabstop++) {
            this.value += '$';
            this.value += number;
            return this;
        }
        appendPlaceholder(value, number = this._tabstop++) {
            if (typeof value === 'function') {
                const nested = new SnippetString_1();
                nested._tabstop = this._tabstop;
                value(nested);
                this._tabstop = nested._tabstop;
                value = nested.value;
            }
            else {
                value = SnippetString_1._escape(value);
            }
            this.value += '${';
            this.value += number;
            this.value += ':';
            this.value += value;
            this.value += '}';
            return this;
        }
        appendChoice(values, number = this._tabstop++) {
            const value = values.map(s => s.replace(/\$|}|\\|,/g, '\\$&')).join(',');
            this.value += '${';
            this.value += number;
            this.value += '|';
            this.value += value;
            this.value += '|}';
            return this;
        }
        appendVariable(name, defaultValue) {
            if (typeof defaultValue === 'function') {
                const nested = new SnippetString_1();
                nested._tabstop = this._tabstop;
                defaultValue(nested);
                this._tabstop = nested._tabstop;
                defaultValue = nested.value;
            }
            else if (typeof defaultValue === 'string') {
                defaultValue = defaultValue.replace(/\$|}/g, '\\$&'); // CodeQL [SM02383] I do not want to escape backslashes here
            }
            this.value += '${';
            this.value += name;
            if (defaultValue) {
                this.value += ':';
                this.value += defaultValue;
            }
            this.value += '}';
            return this;
        }
    };
    exports.SnippetString = SnippetString;
    exports.SnippetString = SnippetString = SnippetString_1 = __decorate([
        es5ClassCompat
    ], SnippetString);
    var DiagnosticTag;
    (function (DiagnosticTag) {
        DiagnosticTag[DiagnosticTag["Unnecessary"] = 1] = "Unnecessary";
        DiagnosticTag[DiagnosticTag["Deprecated"] = 2] = "Deprecated";
    })(DiagnosticTag || (exports.DiagnosticTag = DiagnosticTag = {}));
    var DiagnosticSeverity;
    (function (DiagnosticSeverity) {
        DiagnosticSeverity[DiagnosticSeverity["Hint"] = 3] = "Hint";
        DiagnosticSeverity[DiagnosticSeverity["Information"] = 2] = "Information";
        DiagnosticSeverity[DiagnosticSeverity["Warning"] = 1] = "Warning";
        DiagnosticSeverity[DiagnosticSeverity["Error"] = 0] = "Error";
    })(DiagnosticSeverity || (exports.DiagnosticSeverity = DiagnosticSeverity = {}));
    let Location = Location_1 = class Location {
        static isLocation(thing) {
            if (thing instanceof Location_1) {
                return true;
            }
            if (!thing) {
                return false;
            }
            return Range.isRange(thing.range)
                && uri_1.URI.isUri(thing.uri);
        }
        constructor(uri, rangeOrPosition) {
            this.uri = uri;
            if (!rangeOrPosition) {
                //that's OK
            }
            else if (Range.isRange(rangeOrPosition)) {
                this.range = Range.of(rangeOrPosition);
            }
            else if (Position.isPosition(rangeOrPosition)) {
                this.range = new Range(rangeOrPosition, rangeOrPosition);
            }
            else {
                throw new Error('Illegal argument');
            }
        }
        toJSON() {
            return {
                uri: this.uri,
                range: this.range
            };
        }
    };
    exports.Location = Location;
    exports.Location = Location = Location_1 = __decorate([
        es5ClassCompat
    ], Location);
    let DiagnosticRelatedInformation = class DiagnosticRelatedInformation {
        static is(thing) {
            if (!thing) {
                return false;
            }
            return typeof thing.message === 'string'
                && thing.location
                && Range.isRange(thing.location.range)
                && uri_1.URI.isUri(thing.location.uri);
        }
        constructor(location, message) {
            this.location = location;
            this.message = message;
        }
        static isEqual(a, b) {
            if (a === b) {
                return true;
            }
            if (!a || !b) {
                return false;
            }
            return a.message === b.message
                && a.location.range.isEqual(b.location.range)
                && a.location.uri.toString() === b.location.uri.toString();
        }
    };
    exports.DiagnosticRelatedInformation = DiagnosticRelatedInformation;
    exports.DiagnosticRelatedInformation = DiagnosticRelatedInformation = __decorate([
        es5ClassCompat
    ], DiagnosticRelatedInformation);
    let Diagnostic = class Diagnostic {
        constructor(range, message, severity = DiagnosticSeverity.Error) {
            if (!Range.isRange(range)) {
                throw new TypeError('range must be set');
            }
            if (!message) {
                throw new TypeError('message must be set');
            }
            this.range = range;
            this.message = message;
            this.severity = severity;
        }
        toJSON() {
            return {
                severity: DiagnosticSeverity[this.severity],
                message: this.message,
                range: this.range,
                source: this.source,
                code: this.code,
            };
        }
        static isEqual(a, b) {
            if (a === b) {
                return true;
            }
            if (!a || !b) {
                return false;
            }
            return a.message === b.message
                && a.severity === b.severity
                && a.code === b.code
                && a.severity === b.severity
                && a.source === b.source
                && a.range.isEqual(b.range)
                && (0, arrays_1.equals)(a.tags, b.tags)
                && (0, arrays_1.equals)(a.relatedInformation, b.relatedInformation, DiagnosticRelatedInformation.isEqual);
        }
    };
    exports.Diagnostic = Diagnostic;
    exports.Diagnostic = Diagnostic = __decorate([
        es5ClassCompat
    ], Diagnostic);
    let Hover = class Hover {
        constructor(contents, range) {
            if (!contents) {
                throw new Error('Illegal argument, contents must be defined');
            }
            if (Array.isArray(contents)) {
                this.contents = contents;
            }
            else {
                this.contents = [contents];
            }
            this.range = range;
        }
    };
    exports.Hover = Hover;
    exports.Hover = Hover = __decorate([
        es5ClassCompat
    ], Hover);
    var DocumentHighlightKind;
    (function (DocumentHighlightKind) {
        DocumentHighlightKind[DocumentHighlightKind["Text"] = 0] = "Text";
        DocumentHighlightKind[DocumentHighlightKind["Read"] = 1] = "Read";
        DocumentHighlightKind[DocumentHighlightKind["Write"] = 2] = "Write";
    })(DocumentHighlightKind || (exports.DocumentHighlightKind = DocumentHighlightKind = {}));
    let DocumentHighlight = class DocumentHighlight {
        constructor(range, kind = DocumentHighlightKind.Text) {
            this.range = range;
            this.kind = kind;
        }
        toJSON() {
            return {
                range: this.range,
                kind: DocumentHighlightKind[this.kind]
            };
        }
    };
    exports.DocumentHighlight = DocumentHighlight;
    exports.DocumentHighlight = DocumentHighlight = __decorate([
        es5ClassCompat
    ], DocumentHighlight);
    var SymbolKind;
    (function (SymbolKind) {
        SymbolKind[SymbolKind["File"] = 0] = "File";
        SymbolKind[SymbolKind["Module"] = 1] = "Module";
        SymbolKind[SymbolKind["Namespace"] = 2] = "Namespace";
        SymbolKind[SymbolKind["Package"] = 3] = "Package";
        SymbolKind[SymbolKind["Class"] = 4] = "Class";
        SymbolKind[SymbolKind["Method"] = 5] = "Method";
        SymbolKind[SymbolKind["Property"] = 6] = "Property";
        SymbolKind[SymbolKind["Field"] = 7] = "Field";
        SymbolKind[SymbolKind["Constructor"] = 8] = "Constructor";
        SymbolKind[SymbolKind["Enum"] = 9] = "Enum";
        SymbolKind[SymbolKind["Interface"] = 10] = "Interface";
        SymbolKind[SymbolKind["Function"] = 11] = "Function";
        SymbolKind[SymbolKind["Variable"] = 12] = "Variable";
        SymbolKind[SymbolKind["Constant"] = 13] = "Constant";
        SymbolKind[SymbolKind["String"] = 14] = "String";
        SymbolKind[SymbolKind["Number"] = 15] = "Number";
        SymbolKind[SymbolKind["Boolean"] = 16] = "Boolean";
        SymbolKind[SymbolKind["Array"] = 17] = "Array";
        SymbolKind[SymbolKind["Object"] = 18] = "Object";
        SymbolKind[SymbolKind["Key"] = 19] = "Key";
        SymbolKind[SymbolKind["Null"] = 20] = "Null";
        SymbolKind[SymbolKind["EnumMember"] = 21] = "EnumMember";
        SymbolKind[SymbolKind["Struct"] = 22] = "Struct";
        SymbolKind[SymbolKind["Event"] = 23] = "Event";
        SymbolKind[SymbolKind["Operator"] = 24] = "Operator";
        SymbolKind[SymbolKind["TypeParameter"] = 25] = "TypeParameter";
    })(SymbolKind || (exports.SymbolKind = SymbolKind = {}));
    var SymbolTag;
    (function (SymbolTag) {
        SymbolTag[SymbolTag["Deprecated"] = 1] = "Deprecated";
    })(SymbolTag || (exports.SymbolTag = SymbolTag = {}));
    let SymbolInformation = SymbolInformation_1 = class SymbolInformation {
        static validate(candidate) {
            if (!candidate.name) {
                throw new Error('name must not be falsy');
            }
        }
        constructor(name, kind, rangeOrContainer, locationOrUri, containerName) {
            this.name = name;
            this.kind = kind;
            this.containerName = containerName;
            if (typeof rangeOrContainer === 'string') {
                this.containerName = rangeOrContainer;
            }
            if (locationOrUri instanceof Location) {
                this.location = locationOrUri;
            }
            else if (rangeOrContainer instanceof Range) {
                this.location = new Location(locationOrUri, rangeOrContainer);
            }
            SymbolInformation_1.validate(this);
        }
        toJSON() {
            return {
                name: this.name,
                kind: SymbolKind[this.kind],
                location: this.location,
                containerName: this.containerName
            };
        }
    };
    exports.SymbolInformation = SymbolInformation;
    exports.SymbolInformation = SymbolInformation = SymbolInformation_1 = __decorate([
        es5ClassCompat
    ], SymbolInformation);
    let DocumentSymbol = DocumentSymbol_1 = class DocumentSymbol {
        static validate(candidate) {
            if (!candidate.name) {
                throw new Error('name must not be falsy');
            }
            if (!candidate.range.contains(candidate.selectionRange)) {
                throw new Error('selectionRange must be contained in fullRange');
            }
            candidate.children?.forEach(DocumentSymbol_1.validate);
        }
        constructor(name, detail, kind, range, selectionRange) {
            this.name = name;
            this.detail = detail;
            this.kind = kind;
            this.range = range;
            this.selectionRange = selectionRange;
            this.children = [];
            DocumentSymbol_1.validate(this);
        }
    };
    exports.DocumentSymbol = DocumentSymbol;
    exports.DocumentSymbol = DocumentSymbol = DocumentSymbol_1 = __decorate([
        es5ClassCompat
    ], DocumentSymbol);
    var CodeActionTriggerKind;
    (function (CodeActionTriggerKind) {
        CodeActionTriggerKind[CodeActionTriggerKind["Invoke"] = 1] = "Invoke";
        CodeActionTriggerKind[CodeActionTriggerKind["Automatic"] = 2] = "Automatic";
    })(CodeActionTriggerKind || (exports.CodeActionTriggerKind = CodeActionTriggerKind = {}));
    let CodeAction = class CodeAction {
        constructor(title, kind) {
            this.title = title;
            this.kind = kind;
        }
    };
    exports.CodeAction = CodeAction;
    exports.CodeAction = CodeAction = __decorate([
        es5ClassCompat
    ], CodeAction);
    let CodeActionKind = class CodeActionKind {
        static { CodeActionKind_1 = this; }
        static { this.sep = '.'; }
        constructor(value) {
            this.value = value;
        }
        append(parts) {
            return new CodeActionKind_1(this.value ? this.value + CodeActionKind_1.sep + parts : parts);
        }
        intersects(other) {
            return this.contains(other) || other.contains(this);
        }
        contains(other) {
            return this.value === other.value || other.value.startsWith(this.value + CodeActionKind_1.sep);
        }
    };
    exports.CodeActionKind = CodeActionKind;
    exports.CodeActionKind = CodeActionKind = CodeActionKind_1 = __decorate([
        es5ClassCompat
    ], CodeActionKind);
    CodeActionKind.Empty = new CodeActionKind('');
    CodeActionKind.QuickFix = CodeActionKind.Empty.append('quickfix');
    CodeActionKind.Refactor = CodeActionKind.Empty.append('refactor');
    CodeActionKind.RefactorExtract = CodeActionKind.Refactor.append('extract');
    CodeActionKind.RefactorInline = CodeActionKind.Refactor.append('inline');
    CodeActionKind.RefactorMove = CodeActionKind.Refactor.append('move');
    CodeActionKind.RefactorRewrite = CodeActionKind.Refactor.append('rewrite');
    CodeActionKind.Source = CodeActionKind.Empty.append('source');
    CodeActionKind.SourceOrganizeImports = CodeActionKind.Source.append('organizeImports');
    CodeActionKind.SourceFixAll = CodeActionKind.Source.append('fixAll');
    CodeActionKind.Notebook = CodeActionKind.Empty.append('notebook');
    let SelectionRange = class SelectionRange {
        constructor(range, parent) {
            this.range = range;
            this.parent = parent;
            if (parent && !parent.range.contains(this.range)) {
                throw new Error('Invalid argument: parent must contain this range');
            }
        }
    };
    exports.SelectionRange = SelectionRange;
    exports.SelectionRange = SelectionRange = __decorate([
        es5ClassCompat
    ], SelectionRange);
    class CallHierarchyItem {
        constructor(kind, name, detail, uri, range, selectionRange) {
            this.kind = kind;
            this.name = name;
            this.detail = detail;
            this.uri = uri;
            this.range = range;
            this.selectionRange = selectionRange;
        }
    }
    exports.CallHierarchyItem = CallHierarchyItem;
    class CallHierarchyIncomingCall {
        constructor(item, fromRanges) {
            this.fromRanges = fromRanges;
            this.from = item;
        }
    }
    exports.CallHierarchyIncomingCall = CallHierarchyIncomingCall;
    class CallHierarchyOutgoingCall {
        constructor(item, fromRanges) {
            this.fromRanges = fromRanges;
            this.to = item;
        }
    }
    exports.CallHierarchyOutgoingCall = CallHierarchyOutgoingCall;
    var LanguageStatusSeverity;
    (function (LanguageStatusSeverity) {
        LanguageStatusSeverity[LanguageStatusSeverity["Information"] = 0] = "Information";
        LanguageStatusSeverity[LanguageStatusSeverity["Warning"] = 1] = "Warning";
        LanguageStatusSeverity[LanguageStatusSeverity["Error"] = 2] = "Error";
    })(LanguageStatusSeverity || (exports.LanguageStatusSeverity = LanguageStatusSeverity = {}));
    let CodeLens = class CodeLens {
        constructor(range, command) {
            this.range = range;
            this.command = command;
        }
        get isResolved() {
            return !!this.command;
        }
    };
    exports.CodeLens = CodeLens;
    exports.CodeLens = CodeLens = __decorate([
        es5ClassCompat
    ], CodeLens);
    let MarkdownString = MarkdownString_1 = class MarkdownString {
        #delegate;
        static isMarkdownString(thing) {
            if (thing instanceof MarkdownString_1) {
                return true;
            }
            return thing && thing.appendCodeblock && thing.appendMarkdown && thing.appendText && (thing.value !== undefined);
        }
        constructor(value, supportThemeIcons = false) {
            this.#delegate = new htmlContent_1.MarkdownString(value, { supportThemeIcons });
        }
        get value() {
            return this.#delegate.value;
        }
        set value(value) {
            this.#delegate.value = value;
        }
        get isTrusted() {
            return this.#delegate.isTrusted;
        }
        set isTrusted(value) {
            this.#delegate.isTrusted = value;
        }
        get supportThemeIcons() {
            return this.#delegate.supportThemeIcons;
        }
        set supportThemeIcons(value) {
            this.#delegate.supportThemeIcons = value;
        }
        get supportHtml() {
            return this.#delegate.supportHtml;
        }
        set supportHtml(value) {
            this.#delegate.supportHtml = value;
        }
        get baseUri() {
            return this.#delegate.baseUri;
        }
        set baseUri(value) {
            this.#delegate.baseUri = value;
        }
        appendText(value) {
            this.#delegate.appendText(value);
            return this;
        }
        appendMarkdown(value) {
            this.#delegate.appendMarkdown(value);
            return this;
        }
        appendCodeblock(value, language) {
            this.#delegate.appendCodeblock(language ?? '', value);
            return this;
        }
    };
    exports.MarkdownString = MarkdownString;
    exports.MarkdownString = MarkdownString = MarkdownString_1 = __decorate([
        es5ClassCompat
    ], MarkdownString);
    let ParameterInformation = class ParameterInformation {
        constructor(label, documentation) {
            this.label = label;
            this.documentation = documentation;
        }
    };
    exports.ParameterInformation = ParameterInformation;
    exports.ParameterInformation = ParameterInformation = __decorate([
        es5ClassCompat
    ], ParameterInformation);
    let SignatureInformation = class SignatureInformation {
        constructor(label, documentation) {
            this.label = label;
            this.documentation = documentation;
            this.parameters = [];
        }
    };
    exports.SignatureInformation = SignatureInformation;
    exports.SignatureInformation = SignatureInformation = __decorate([
        es5ClassCompat
    ], SignatureInformation);
    let SignatureHelp = class SignatureHelp {
        constructor() {
            this.activeSignature = 0;
            this.activeParameter = 0;
            this.signatures = [];
        }
    };
    exports.SignatureHelp = SignatureHelp;
    exports.SignatureHelp = SignatureHelp = __decorate([
        es5ClassCompat
    ], SignatureHelp);
    var SignatureHelpTriggerKind;
    (function (SignatureHelpTriggerKind) {
        SignatureHelpTriggerKind[SignatureHelpTriggerKind["Invoke"] = 1] = "Invoke";
        SignatureHelpTriggerKind[SignatureHelpTriggerKind["TriggerCharacter"] = 2] = "TriggerCharacter";
        SignatureHelpTriggerKind[SignatureHelpTriggerKind["ContentChange"] = 3] = "ContentChange";
    })(SignatureHelpTriggerKind || (exports.SignatureHelpTriggerKind = SignatureHelpTriggerKind = {}));
    var InlayHintKind;
    (function (InlayHintKind) {
        InlayHintKind[InlayHintKind["Type"] = 1] = "Type";
        InlayHintKind[InlayHintKind["Parameter"] = 2] = "Parameter";
    })(InlayHintKind || (exports.InlayHintKind = InlayHintKind = {}));
    let InlayHintLabelPart = class InlayHintLabelPart {
        constructor(value) {
            this.value = value;
        }
    };
    exports.InlayHintLabelPart = InlayHintLabelPart;
    exports.InlayHintLabelPart = InlayHintLabelPart = __decorate([
        es5ClassCompat
    ], InlayHintLabelPart);
    let InlayHint = class InlayHint {
        constructor(position, label, kind) {
            this.position = position;
            this.label = label;
            this.kind = kind;
        }
    };
    exports.InlayHint = InlayHint;
    exports.InlayHint = InlayHint = __decorate([
        es5ClassCompat
    ], InlayHint);
    var CompletionTriggerKind;
    (function (CompletionTriggerKind) {
        CompletionTriggerKind[CompletionTriggerKind["Invoke"] = 0] = "Invoke";
        CompletionTriggerKind[CompletionTriggerKind["TriggerCharacter"] = 1] = "TriggerCharacter";
        CompletionTriggerKind[CompletionTriggerKind["TriggerForIncompleteCompletions"] = 2] = "TriggerForIncompleteCompletions";
    })(CompletionTriggerKind || (exports.CompletionTriggerKind = CompletionTriggerKind = {}));
    var CompletionItemKind;
    (function (CompletionItemKind) {
        CompletionItemKind[CompletionItemKind["Text"] = 0] = "Text";
        CompletionItemKind[CompletionItemKind["Method"] = 1] = "Method";
        CompletionItemKind[CompletionItemKind["Function"] = 2] = "Function";
        CompletionItemKind[CompletionItemKind["Constructor"] = 3] = "Constructor";
        CompletionItemKind[CompletionItemKind["Field"] = 4] = "Field";
        CompletionItemKind[CompletionItemKind["Variable"] = 5] = "Variable";
        CompletionItemKind[CompletionItemKind["Class"] = 6] = "Class";
        CompletionItemKind[CompletionItemKind["Interface"] = 7] = "Interface";
        CompletionItemKind[CompletionItemKind["Module"] = 8] = "Module";
        CompletionItemKind[CompletionItemKind["Property"] = 9] = "Property";
        CompletionItemKind[CompletionItemKind["Unit"] = 10] = "Unit";
        CompletionItemKind[CompletionItemKind["Value"] = 11] = "Value";
        CompletionItemKind[CompletionItemKind["Enum"] = 12] = "Enum";
        CompletionItemKind[CompletionItemKind["Keyword"] = 13] = "Keyword";
        CompletionItemKind[CompletionItemKind["Snippet"] = 14] = "Snippet";
        CompletionItemKind[CompletionItemKind["Color"] = 15] = "Color";
        CompletionItemKind[CompletionItemKind["File"] = 16] = "File";
        CompletionItemKind[CompletionItemKind["Reference"] = 17] = "Reference";
        CompletionItemKind[CompletionItemKind["Folder"] = 18] = "Folder";
        CompletionItemKind[CompletionItemKind["EnumMember"] = 19] = "EnumMember";
        CompletionItemKind[CompletionItemKind["Constant"] = 20] = "Constant";
        CompletionItemKind[CompletionItemKind["Struct"] = 21] = "Struct";
        CompletionItemKind[CompletionItemKind["Event"] = 22] = "Event";
        CompletionItemKind[CompletionItemKind["Operator"] = 23] = "Operator";
        CompletionItemKind[CompletionItemKind["TypeParameter"] = 24] = "TypeParameter";
        CompletionItemKind[CompletionItemKind["User"] = 25] = "User";
        CompletionItemKind[CompletionItemKind["Issue"] = 26] = "Issue";
    })(CompletionItemKind || (exports.CompletionItemKind = CompletionItemKind = {}));
    var CompletionItemTag;
    (function (CompletionItemTag) {
        CompletionItemTag[CompletionItemTag["Deprecated"] = 1] = "Deprecated";
    })(CompletionItemTag || (exports.CompletionItemTag = CompletionItemTag = {}));
    let CompletionItem = class CompletionItem {
        constructor(label, kind) {
            this.label = label;
            this.kind = kind;
        }
        toJSON() {
            return {
                label: this.label,
                kind: this.kind && CompletionItemKind[this.kind],
                detail: this.detail,
                documentation: this.documentation,
                sortText: this.sortText,
                filterText: this.filterText,
                preselect: this.preselect,
                insertText: this.insertText,
                textEdit: this.textEdit
            };
        }
    };
    exports.CompletionItem = CompletionItem;
    exports.CompletionItem = CompletionItem = __decorate([
        es5ClassCompat
    ], CompletionItem);
    let CompletionList = class CompletionList {
        constructor(items = [], isIncomplete = false) {
            this.items = items;
            this.isIncomplete = isIncomplete;
        }
    };
    exports.CompletionList = CompletionList;
    exports.CompletionList = CompletionList = __decorate([
        es5ClassCompat
    ], CompletionList);
    let InlineSuggestion = class InlineSuggestion {
        constructor(insertText, range, command) {
            this.insertText = insertText;
            this.range = range;
            this.command = command;
        }
    };
    exports.InlineSuggestion = InlineSuggestion;
    exports.InlineSuggestion = InlineSuggestion = __decorate([
        es5ClassCompat
    ], InlineSuggestion);
    let InlineSuggestionList = class InlineSuggestionList {
        constructor(items) {
            this.commands = undefined;
            this.suppressSuggestions = undefined;
            this.items = items;
        }
    };
    exports.InlineSuggestionList = InlineSuggestionList;
    exports.InlineSuggestionList = InlineSuggestionList = __decorate([
        es5ClassCompat
    ], InlineSuggestionList);
    var ViewColumn;
    (function (ViewColumn) {
        ViewColumn[ViewColumn["Active"] = -1] = "Active";
        ViewColumn[ViewColumn["Beside"] = -2] = "Beside";
        ViewColumn[ViewColumn["One"] = 1] = "One";
        ViewColumn[ViewColumn["Two"] = 2] = "Two";
        ViewColumn[ViewColumn["Three"] = 3] = "Three";
        ViewColumn[ViewColumn["Four"] = 4] = "Four";
        ViewColumn[ViewColumn["Five"] = 5] = "Five";
        ViewColumn[ViewColumn["Six"] = 6] = "Six";
        ViewColumn[ViewColumn["Seven"] = 7] = "Seven";
        ViewColumn[ViewColumn["Eight"] = 8] = "Eight";
        ViewColumn[ViewColumn["Nine"] = 9] = "Nine";
    })(ViewColumn || (exports.ViewColumn = ViewColumn = {}));
    var StatusBarAlignment;
    (function (StatusBarAlignment) {
        StatusBarAlignment[StatusBarAlignment["Left"] = 1] = "Left";
        StatusBarAlignment[StatusBarAlignment["Right"] = 2] = "Right";
    })(StatusBarAlignment || (exports.StatusBarAlignment = StatusBarAlignment = {}));
    function asStatusBarItemIdentifier(extension, id) {
        return `${extensions_1.ExtensionIdentifier.toKey(extension)}.${id}`;
    }
    exports.asStatusBarItemIdentifier = asStatusBarItemIdentifier;
    var TextEditorLineNumbersStyle;
    (function (TextEditorLineNumbersStyle) {
        TextEditorLineNumbersStyle[TextEditorLineNumbersStyle["Off"] = 0] = "Off";
        TextEditorLineNumbersStyle[TextEditorLineNumbersStyle["On"] = 1] = "On";
        TextEditorLineNumbersStyle[TextEditorLineNumbersStyle["Relative"] = 2] = "Relative";
    })(TextEditorLineNumbersStyle || (exports.TextEditorLineNumbersStyle = TextEditorLineNumbersStyle = {}));
    var TextDocumentSaveReason;
    (function (TextDocumentSaveReason) {
        TextDocumentSaveReason[TextDocumentSaveReason["Manual"] = 1] = "Manual";
        TextDocumentSaveReason[TextDocumentSaveReason["AfterDelay"] = 2] = "AfterDelay";
        TextDocumentSaveReason[TextDocumentSaveReason["FocusOut"] = 3] = "FocusOut";
    })(TextDocumentSaveReason || (exports.TextDocumentSaveReason = TextDocumentSaveReason = {}));
    var TextEditorRevealType;
    (function (TextEditorRevealType) {
        TextEditorRevealType[TextEditorRevealType["Default"] = 0] = "Default";
        TextEditorRevealType[TextEditorRevealType["InCenter"] = 1] = "InCenter";
        TextEditorRevealType[TextEditorRevealType["InCenterIfOutsideViewport"] = 2] = "InCenterIfOutsideViewport";
        TextEditorRevealType[TextEditorRevealType["AtTop"] = 3] = "AtTop";
    })(TextEditorRevealType || (exports.TextEditorRevealType = TextEditorRevealType = {}));
    var TextEditorSelectionChangeKind;
    (function (TextEditorSelectionChangeKind) {
        TextEditorSelectionChangeKind[TextEditorSelectionChangeKind["Keyboard"] = 1] = "Keyboard";
        TextEditorSelectionChangeKind[TextEditorSelectionChangeKind["Mouse"] = 2] = "Mouse";
        TextEditorSelectionChangeKind[TextEditorSelectionChangeKind["Command"] = 3] = "Command";
    })(TextEditorSelectionChangeKind || (exports.TextEditorSelectionChangeKind = TextEditorSelectionChangeKind = {}));
    var TextDocumentChangeReason;
    (function (TextDocumentChangeReason) {
        TextDocumentChangeReason[TextDocumentChangeReason["Undo"] = 1] = "Undo";
        TextDocumentChangeReason[TextDocumentChangeReason["Redo"] = 2] = "Redo";
    })(TextDocumentChangeReason || (exports.TextDocumentChangeReason = TextDocumentChangeReason = {}));
    /**
     * These values match very carefully the values of `TrackedRangeStickiness`
     */
    var DecorationRangeBehavior;
    (function (DecorationRangeBehavior) {
        /**
         * TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges
         */
        DecorationRangeBehavior[DecorationRangeBehavior["OpenOpen"] = 0] = "OpenOpen";
        /**
         * TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
         */
        DecorationRangeBehavior[DecorationRangeBehavior["ClosedClosed"] = 1] = "ClosedClosed";
        /**
         * TrackedRangeStickiness.GrowsOnlyWhenTypingBefore
         */
        DecorationRangeBehavior[DecorationRangeBehavior["OpenClosed"] = 2] = "OpenClosed";
        /**
         * TrackedRangeStickiness.GrowsOnlyWhenTypingAfter
         */
        DecorationRangeBehavior[DecorationRangeBehavior["ClosedOpen"] = 3] = "ClosedOpen";
    })(DecorationRangeBehavior || (exports.DecorationRangeBehavior = DecorationRangeBehavior = {}));
    (function (TextEditorSelectionChangeKind) {
        function fromValue(s) {
            switch (s) {
                case 'keyboard': return TextEditorSelectionChangeKind.Keyboard;
                case 'mouse': return TextEditorSelectionChangeKind.Mouse;
                case 'api': return TextEditorSelectionChangeKind.Command;
            }
            return undefined;
        }
        TextEditorSelectionChangeKind.fromValue = fromValue;
    })(TextEditorSelectionChangeKind || (exports.TextEditorSelectionChangeKind = TextEditorSelectionChangeKind = {}));
    var SyntaxTokenType;
    (function (SyntaxTokenType) {
        SyntaxTokenType[SyntaxTokenType["Other"] = 0] = "Other";
        SyntaxTokenType[SyntaxTokenType["Comment"] = 1] = "Comment";
        SyntaxTokenType[SyntaxTokenType["String"] = 2] = "String";
        SyntaxTokenType[SyntaxTokenType["RegEx"] = 3] = "RegEx";
    })(SyntaxTokenType || (exports.SyntaxTokenType = SyntaxTokenType = {}));
    (function (SyntaxTokenType) {
        function toString(v) {
            switch (v) {
                case SyntaxTokenType.Other: return 'other';
                case SyntaxTokenType.Comment: return 'comment';
                case SyntaxTokenType.String: return 'string';
                case SyntaxTokenType.RegEx: return 'regex';
            }
            return 'other';
        }
        SyntaxTokenType.toString = toString;
    })(SyntaxTokenType || (exports.SyntaxTokenType = SyntaxTokenType = {}));
    let DocumentLink = class DocumentLink {
        constructor(range, target) {
            if (target && !(uri_1.URI.isUri(target))) {
                throw (0, errors_1.illegalArgument)('target');
            }
            if (!Range.isRange(range) || range.isEmpty) {
                throw (0, errors_1.illegalArgument)('range');
            }
            this.range = range;
            this.target = target;
        }
    };
    exports.DocumentLink = DocumentLink;
    exports.DocumentLink = DocumentLink = __decorate([
        es5ClassCompat
    ], DocumentLink);
    let Color = class Color {
        constructor(red, green, blue, alpha) {
            this.red = red;
            this.green = green;
            this.blue = blue;
            this.alpha = alpha;
        }
    };
    exports.Color = Color;
    exports.Color = Color = __decorate([
        es5ClassCompat
    ], Color);
    let ColorInformation = class ColorInformation {
        constructor(range, color) {
            if (color && !(color instanceof Color)) {
                throw (0, errors_1.illegalArgument)('color');
            }
            if (!Range.isRange(range) || range.isEmpty) {
                throw (0, errors_1.illegalArgument)('range');
            }
            this.range = range;
            this.color = color;
        }
    };
    exports.ColorInformation = ColorInformation;
    exports.ColorInformation = ColorInformation = __decorate([
        es5ClassCompat
    ], ColorInformation);
    let ColorPresentation = class ColorPresentation {
        constructor(label) {
            if (!label || typeof label !== 'string') {
                throw (0, errors_1.illegalArgument)('label');
            }
            this.label = label;
        }
    };
    exports.ColorPresentation = ColorPresentation;
    exports.ColorPresentation = ColorPresentation = __decorate([
        es5ClassCompat
    ], ColorPresentation);
    var ColorFormat;
    (function (ColorFormat) {
        ColorFormat[ColorFormat["RGB"] = 0] = "RGB";
        ColorFormat[ColorFormat["HEX"] = 1] = "HEX";
        ColorFormat[ColorFormat["HSL"] = 2] = "HSL";
    })(ColorFormat || (exports.ColorFormat = ColorFormat = {}));
    var SourceControlInputBoxValidationType;
    (function (SourceControlInputBoxValidationType) {
        SourceControlInputBoxValidationType[SourceControlInputBoxValidationType["Error"] = 0] = "Error";
        SourceControlInputBoxValidationType[SourceControlInputBoxValidationType["Warning"] = 1] = "Warning";
        SourceControlInputBoxValidationType[SourceControlInputBoxValidationType["Information"] = 2] = "Information";
    })(SourceControlInputBoxValidationType || (exports.SourceControlInputBoxValidationType = SourceControlInputBoxValidationType = {}));
    var TerminalExitReason;
    (function (TerminalExitReason) {
        TerminalExitReason[TerminalExitReason["Unknown"] = 0] = "Unknown";
        TerminalExitReason[TerminalExitReason["Shutdown"] = 1] = "Shutdown";
        TerminalExitReason[TerminalExitReason["Process"] = 2] = "Process";
        TerminalExitReason[TerminalExitReason["User"] = 3] = "User";
        TerminalExitReason[TerminalExitReason["Extension"] = 4] = "Extension";
    })(TerminalExitReason || (exports.TerminalExitReason = TerminalExitReason = {}));
    class TerminalLink {
        constructor(startIndex, length, tooltip) {
            this.startIndex = startIndex;
            this.length = length;
            this.tooltip = tooltip;
            if (typeof startIndex !== 'number' || startIndex < 0) {
                throw (0, errors_1.illegalArgument)('startIndex');
            }
            if (typeof length !== 'number' || length < 1) {
                throw (0, errors_1.illegalArgument)('length');
            }
            if (tooltip !== undefined && typeof tooltip !== 'string') {
                throw (0, errors_1.illegalArgument)('tooltip');
            }
        }
    }
    exports.TerminalLink = TerminalLink;
    class TerminalQuickFixOpener {
        constructor(uri) {
            this.uri = uri;
        }
    }
    exports.TerminalQuickFixOpener = TerminalQuickFixOpener;
    class TerminalQuickFixCommand {
        constructor(terminalCommand) {
            this.terminalCommand = terminalCommand;
        }
    }
    exports.TerminalQuickFixCommand = TerminalQuickFixCommand;
    var TerminalLocation;
    (function (TerminalLocation) {
        TerminalLocation[TerminalLocation["Panel"] = 1] = "Panel";
        TerminalLocation[TerminalLocation["Editor"] = 2] = "Editor";
    })(TerminalLocation || (exports.TerminalLocation = TerminalLocation = {}));
    class TerminalProfile {
        constructor(options) {
            this.options = options;
            if (typeof options !== 'object') {
                throw (0, errors_1.illegalArgument)('options');
            }
        }
    }
    exports.TerminalProfile = TerminalProfile;
    var TaskRevealKind;
    (function (TaskRevealKind) {
        TaskRevealKind[TaskRevealKind["Always"] = 1] = "Always";
        TaskRevealKind[TaskRevealKind["Silent"] = 2] = "Silent";
        TaskRevealKind[TaskRevealKind["Never"] = 3] = "Never";
    })(TaskRevealKind || (exports.TaskRevealKind = TaskRevealKind = {}));
    var TaskPanelKind;
    (function (TaskPanelKind) {
        TaskPanelKind[TaskPanelKind["Shared"] = 1] = "Shared";
        TaskPanelKind[TaskPanelKind["Dedicated"] = 2] = "Dedicated";
        TaskPanelKind[TaskPanelKind["New"] = 3] = "New";
    })(TaskPanelKind || (exports.TaskPanelKind = TaskPanelKind = {}));
    let TaskGroup = class TaskGroup {
        static { TaskGroup_1 = this; }
        static { this.Clean = new TaskGroup_1('clean', 'Clean'); }
        static { this.Build = new TaskGroup_1('build', 'Build'); }
        static { this.Rebuild = new TaskGroup_1('rebuild', 'Rebuild'); }
        static { this.Test = new TaskGroup_1('test', 'Test'); }
        static from(value) {
            switch (value) {
                case 'clean':
                    return TaskGroup_1.Clean;
                case 'build':
                    return TaskGroup_1.Build;
                case 'rebuild':
                    return TaskGroup_1.Rebuild;
                case 'test':
                    return TaskGroup_1.Test;
                default:
                    return undefined;
            }
        }
        constructor(id, label) {
            this.label = label;
            if (typeof id !== 'string') {
                throw (0, errors_1.illegalArgument)('name');
            }
            if (typeof label !== 'string') {
                throw (0, errors_1.illegalArgument)('name');
            }
            this._id = id;
        }
        get id() {
            return this._id;
        }
    };
    exports.TaskGroup = TaskGroup;
    exports.TaskGroup = TaskGroup = TaskGroup_1 = __decorate([
        es5ClassCompat
    ], TaskGroup);
    function computeTaskExecutionId(values) {
        let id = '';
        for (let i = 0; i < values.length; i++) {
            id += values[i].replace(/,/g, ',,') + ',';
        }
        return id;
    }
    let ProcessExecution = class ProcessExecution {
        constructor(process, varg1, varg2) {
            if (typeof process !== 'string') {
                throw (0, errors_1.illegalArgument)('process');
            }
            this._args = [];
            this._process = process;
            if (varg1 !== undefined) {
                if (Array.isArray(varg1)) {
                    this._args = varg1;
                    this._options = varg2;
                }
                else {
                    this._options = varg1;
                }
            }
        }
        get process() {
            return this._process;
        }
        set process(value) {
            if (typeof value !== 'string') {
                throw (0, errors_1.illegalArgument)('process');
            }
            this._process = value;
        }
        get args() {
            return this._args;
        }
        set args(value) {
            if (!Array.isArray(value)) {
                value = [];
            }
            this._args = value;
        }
        get options() {
            return this._options;
        }
        set options(value) {
            this._options = value;
        }
        computeId() {
            const props = [];
            props.push('process');
            if (this._process !== undefined) {
                props.push(this._process);
            }
            if (this._args && this._args.length > 0) {
                for (const arg of this._args) {
                    props.push(arg);
                }
            }
            return computeTaskExecutionId(props);
        }
    };
    exports.ProcessExecution = ProcessExecution;
    exports.ProcessExecution = ProcessExecution = __decorate([
        es5ClassCompat
    ], ProcessExecution);
    let ShellExecution = class ShellExecution {
        constructor(arg0, arg1, arg2) {
            this._args = [];
            if (Array.isArray(arg1)) {
                if (!arg0) {
                    throw (0, errors_1.illegalArgument)('command can\'t be undefined or null');
                }
                if (typeof arg0 !== 'string' && typeof arg0.value !== 'string') {
                    throw (0, errors_1.illegalArgument)('command');
                }
                this._command = arg0;
                this._args = arg1;
                this._options = arg2;
            }
            else {
                if (typeof arg0 !== 'string') {
                    throw (0, errors_1.illegalArgument)('commandLine');
                }
                this._commandLine = arg0;
                this._options = arg1;
            }
        }
        get commandLine() {
            return this._commandLine;
        }
        set commandLine(value) {
            if (typeof value !== 'string') {
                throw (0, errors_1.illegalArgument)('commandLine');
            }
            this._commandLine = value;
        }
        get command() {
            return this._command ? this._command : '';
        }
        set command(value) {
            if (typeof value !== 'string' && typeof value.value !== 'string') {
                throw (0, errors_1.illegalArgument)('command');
            }
            this._command = value;
        }
        get args() {
            return this._args;
        }
        set args(value) {
            this._args = value || [];
        }
        get options() {
            return this._options;
        }
        set options(value) {
            this._options = value;
        }
        computeId() {
            const props = [];
            props.push('shell');
            if (this._commandLine !== undefined) {
                props.push(this._commandLine);
            }
            if (this._command !== undefined) {
                props.push(typeof this._command === 'string' ? this._command : this._command.value);
            }
            if (this._args && this._args.length > 0) {
                for (const arg of this._args) {
                    props.push(typeof arg === 'string' ? arg : arg.value);
                }
            }
            return computeTaskExecutionId(props);
        }
    };
    exports.ShellExecution = ShellExecution;
    exports.ShellExecution = ShellExecution = __decorate([
        es5ClassCompat
    ], ShellExecution);
    var ShellQuoting;
    (function (ShellQuoting) {
        ShellQuoting[ShellQuoting["Escape"] = 1] = "Escape";
        ShellQuoting[ShellQuoting["Strong"] = 2] = "Strong";
        ShellQuoting[ShellQuoting["Weak"] = 3] = "Weak";
    })(ShellQuoting || (exports.ShellQuoting = ShellQuoting = {}));
    var TaskScope;
    (function (TaskScope) {
        TaskScope[TaskScope["Global"] = 1] = "Global";
        TaskScope[TaskScope["Workspace"] = 2] = "Workspace";
    })(TaskScope || (exports.TaskScope = TaskScope = {}));
    class CustomExecution {
        constructor(callback) {
            this._callback = callback;
        }
        computeId() {
            return 'customExecution' + (0, uuid_1.generateUuid)();
        }
        set callback(value) {
            this._callback = value;
        }
        get callback() {
            return this._callback;
        }
    }
    exports.CustomExecution = CustomExecution;
    let Task = class Task {
        static { Task_1 = this; }
        static { this.ExtensionCallbackType = 'customExecution'; }
        static { this.ProcessType = 'process'; }
        static { this.ShellType = 'shell'; }
        static { this.EmptyType = '$empty'; }
        constructor(definition, arg2, arg3, arg4, arg5, arg6) {
            this.__deprecated = false;
            this._definition = this.definition = definition;
            let problemMatchers;
            if (typeof arg2 === 'string') {
                this._name = this.name = arg2;
                this._source = this.source = arg3;
                this.execution = arg4;
                problemMatchers = arg5;
                this.__deprecated = true;
            }
            else if (arg2 === TaskScope.Global || arg2 === TaskScope.Workspace) {
                this.target = arg2;
                this._name = this.name = arg3;
                this._source = this.source = arg4;
                this.execution = arg5;
                problemMatchers = arg6;
            }
            else {
                this.target = arg2;
                this._name = this.name = arg3;
                this._source = this.source = arg4;
                this.execution = arg5;
                problemMatchers = arg6;
            }
            if (typeof problemMatchers === 'string') {
                this._problemMatchers = [problemMatchers];
                this._hasDefinedMatchers = true;
            }
            else if (Array.isArray(problemMatchers)) {
                this._problemMatchers = problemMatchers;
                this._hasDefinedMatchers = true;
            }
            else {
                this._problemMatchers = [];
                this._hasDefinedMatchers = false;
            }
            this._isBackground = false;
            this._presentationOptions = Object.create(null);
            this._runOptions = Object.create(null);
        }
        get _id() {
            return this.__id;
        }
        set _id(value) {
            this.__id = value;
        }
        get _deprecated() {
            return this.__deprecated;
        }
        clear() {
            if (this.__id === undefined) {
                return;
            }
            this.__id = undefined;
            this._scope = undefined;
            this.computeDefinitionBasedOnExecution();
        }
        computeDefinitionBasedOnExecution() {
            if (this._execution instanceof ProcessExecution) {
                this._definition = {
                    type: Task_1.ProcessType,
                    id: this._execution.computeId()
                };
            }
            else if (this._execution instanceof ShellExecution) {
                this._definition = {
                    type: Task_1.ShellType,
                    id: this._execution.computeId()
                };
            }
            else if (this._execution instanceof CustomExecution) {
                this._definition = {
                    type: Task_1.ExtensionCallbackType,
                    id: this._execution.computeId()
                };
            }
            else {
                this._definition = {
                    type: Task_1.EmptyType,
                    id: (0, uuid_1.generateUuid)()
                };
            }
        }
        get definition() {
            return this._definition;
        }
        set definition(value) {
            if (value === undefined || value === null) {
                throw (0, errors_1.illegalArgument)('Kind can\'t be undefined or null');
            }
            this.clear();
            this._definition = value;
        }
        get scope() {
            return this._scope;
        }
        set target(value) {
            this.clear();
            this._scope = value;
        }
        get name() {
            return this._name;
        }
        set name(value) {
            if (typeof value !== 'string') {
                throw (0, errors_1.illegalArgument)('name');
            }
            this.clear();
            this._name = value;
        }
        get execution() {
            return this._execution;
        }
        set execution(value) {
            if (value === null) {
                value = undefined;
            }
            this.clear();
            this._execution = value;
            const type = this._definition.type;
            if (Task_1.EmptyType === type || Task_1.ProcessType === type || Task_1.ShellType === type || Task_1.ExtensionCallbackType === type) {
                this.computeDefinitionBasedOnExecution();
            }
        }
        get problemMatchers() {
            return this._problemMatchers;
        }
        set problemMatchers(value) {
            if (!Array.isArray(value)) {
                this.clear();
                this._problemMatchers = [];
                this._hasDefinedMatchers = false;
                return;
            }
            else {
                this.clear();
                this._problemMatchers = value;
                this._hasDefinedMatchers = true;
            }
        }
        get hasDefinedMatchers() {
            return this._hasDefinedMatchers;
        }
        get isBackground() {
            return this._isBackground;
        }
        set isBackground(value) {
            if (value !== true && value !== false) {
                value = false;
            }
            this.clear();
            this._isBackground = value;
        }
        get source() {
            return this._source;
        }
        set source(value) {
            if (typeof value !== 'string' || value.length === 0) {
                throw (0, errors_1.illegalArgument)('source must be a string of length > 0');
            }
            this.clear();
            this._source = value;
        }
        get group() {
            return this._group;
        }
        set group(value) {
            if (value === null) {
                value = undefined;
            }
            this.clear();
            this._group = value;
        }
        get detail() {
            return this._detail;
        }
        set detail(value) {
            if (value === null) {
                value = undefined;
            }
            this._detail = value;
        }
        get presentationOptions() {
            return this._presentationOptions;
        }
        set presentationOptions(value) {
            if (value === null || value === undefined) {
                value = Object.create(null);
            }
            this.clear();
            this._presentationOptions = value;
        }
        get runOptions() {
            return this._runOptions;
        }
        set runOptions(value) {
            if (value === null || value === undefined) {
                value = Object.create(null);
            }
            this.clear();
            this._runOptions = value;
        }
    };
    exports.Task = Task;
    exports.Task = Task = Task_1 = __decorate([
        es5ClassCompat
    ], Task);
    var ProgressLocation;
    (function (ProgressLocation) {
        ProgressLocation[ProgressLocation["SourceControl"] = 1] = "SourceControl";
        ProgressLocation[ProgressLocation["Window"] = 10] = "Window";
        ProgressLocation[ProgressLocation["Notification"] = 15] = "Notification";
    })(ProgressLocation || (exports.ProgressLocation = ProgressLocation = {}));
    var ViewBadge;
    (function (ViewBadge) {
        function isViewBadge(thing) {
            const viewBadgeThing = thing;
            if (!(0, types_1.isNumber)(viewBadgeThing.value)) {
                console.log('INVALID view badge, invalid value', viewBadgeThing.value);
                return false;
            }
            if (viewBadgeThing.tooltip && !(0, types_1.isString)(viewBadgeThing.tooltip)) {
                console.log('INVALID view badge, invalid tooltip', viewBadgeThing.tooltip);
                return false;
            }
            return true;
        }
        ViewBadge.isViewBadge = isViewBadge;
    })(ViewBadge || (exports.ViewBadge = ViewBadge = {}));
    let TreeItem = TreeItem_1 = class TreeItem {
        static isTreeItem(thing, extension) {
            const treeItemThing = thing;
            if (treeItemThing.checkboxState !== undefined) {
                const checkbox = (0, types_1.isNumber)(treeItemThing.checkboxState) ? treeItemThing.checkboxState :
                    (0, types_1.isObject)(treeItemThing.checkboxState) && (0, types_1.isNumber)(treeItemThing.checkboxState.state) ? treeItemThing.checkboxState.state : undefined;
                const tooltip = !(0, types_1.isNumber)(treeItemThing.checkboxState) && (0, types_1.isObject)(treeItemThing.checkboxState) ? treeItemThing.checkboxState.tooltip : undefined;
                if (checkbox === undefined || (checkbox !== TreeItemCheckboxState.Checked && checkbox !== TreeItemCheckboxState.Unchecked) || (tooltip !== undefined && !(0, types_1.isString)(tooltip))) {
                    console.log('INVALID tree item, invalid checkboxState', treeItemThing.checkboxState);
                    return false;
                }
            }
            if (thing instanceof TreeItem_1) {
                return true;
            }
            if (treeItemThing.label !== undefined && !(0, types_1.isString)(treeItemThing.label) && !(treeItemThing.label?.label)) {
                console.log('INVALID tree item, invalid label', treeItemThing.label);
                return false;
            }
            if ((treeItemThing.id !== undefined) && !(0, types_1.isString)(treeItemThing.id)) {
                console.log('INVALID tree item, invalid id', treeItemThing.id);
                return false;
            }
            if ((treeItemThing.iconPath !== undefined) && !(0, types_1.isString)(treeItemThing.iconPath) && !uri_1.URI.isUri(treeItemThing.iconPath) && (!treeItemThing.iconPath || !(0, types_1.isString)(treeItemThing.iconPath.id))) {
                const asLightAndDarkThing = treeItemThing.iconPath;
                if (!asLightAndDarkThing || (!(0, types_1.isString)(asLightAndDarkThing.light) && !uri_1.URI.isUri(asLightAndDarkThing.light) && !(0, types_1.isString)(asLightAndDarkThing.dark) && !uri_1.URI.isUri(asLightAndDarkThing.dark))) {
                    console.log('INVALID tree item, invalid iconPath', treeItemThing.iconPath);
                    return false;
                }
            }
            if ((treeItemThing.description !== undefined) && !(0, types_1.isString)(treeItemThing.description) && (typeof treeItemThing.description !== 'boolean')) {
                console.log('INVALID tree item, invalid description', treeItemThing.description);
                return false;
            }
            if ((treeItemThing.resourceUri !== undefined) && !uri_1.URI.isUri(treeItemThing.resourceUri)) {
                console.log('INVALID tree item, invalid resourceUri', treeItemThing.resourceUri);
                return false;
            }
            if ((treeItemThing.tooltip !== undefined) && !(0, types_1.isString)(treeItemThing.tooltip) && !(treeItemThing.tooltip instanceof MarkdownString)) {
                console.log('INVALID tree item, invalid tooltip', treeItemThing.tooltip);
                return false;
            }
            if ((treeItemThing.command !== undefined) && !treeItemThing.command.command) {
                console.log('INVALID tree item, invalid command', treeItemThing.command);
                return false;
            }
            if ((treeItemThing.collapsibleState !== undefined) && (treeItemThing.collapsibleState < TreeItemCollapsibleState.None) && (treeItemThing.collapsibleState > TreeItemCollapsibleState.Expanded)) {
                console.log('INVALID tree item, invalid collapsibleState', treeItemThing.collapsibleState);
                return false;
            }
            if ((treeItemThing.contextValue !== undefined) && !(0, types_1.isString)(treeItemThing.contextValue)) {
                console.log('INVALID tree item, invalid contextValue', treeItemThing.contextValue);
                return false;
            }
            if ((treeItemThing.accessibilityInformation !== undefined) && !treeItemThing.accessibilityInformation?.label) {
                console.log('INVALID tree item, invalid accessibilityInformation', treeItemThing.accessibilityInformation);
                return false;
            }
            return true;
        }
        constructor(arg1, collapsibleState = TreeItemCollapsibleState.None) {
            this.collapsibleState = collapsibleState;
            if (uri_1.URI.isUri(arg1)) {
                this.resourceUri = arg1;
            }
            else {
                this.label = arg1;
            }
        }
    };
    exports.TreeItem = TreeItem;
    exports.TreeItem = TreeItem = TreeItem_1 = __decorate([
        es5ClassCompat
    ], TreeItem);
    var TreeItemCollapsibleState;
    (function (TreeItemCollapsibleState) {
        TreeItemCollapsibleState[TreeItemCollapsibleState["None"] = 0] = "None";
        TreeItemCollapsibleState[TreeItemCollapsibleState["Collapsed"] = 1] = "Collapsed";
        TreeItemCollapsibleState[TreeItemCollapsibleState["Expanded"] = 2] = "Expanded";
    })(TreeItemCollapsibleState || (exports.TreeItemCollapsibleState = TreeItemCollapsibleState = {}));
    var TreeItemCheckboxState;
    (function (TreeItemCheckboxState) {
        TreeItemCheckboxState[TreeItemCheckboxState["Unchecked"] = 0] = "Unchecked";
        TreeItemCheckboxState[TreeItemCheckboxState["Checked"] = 1] = "Checked";
    })(TreeItemCheckboxState || (exports.TreeItemCheckboxState = TreeItemCheckboxState = {}));
    let DataTransferItem = class DataTransferItem {
        async asString() {
            return typeof this.value === 'string' ? this.value : JSON.stringify(this.value);
        }
        asFile() {
            return undefined;
        }
        constructor(value) {
            this.value = value;
        }
    };
    exports.DataTransferItem = DataTransferItem;
    exports.DataTransferItem = DataTransferItem = __decorate([
        es5ClassCompat
    ], DataTransferItem);
    /**
     * A data transfer item that has been created by VS Code instead of by a extension.
     *
     * Intentionally not exported to extensions.
     */
    class InternalDataTransferItem extends DataTransferItem {
    }
    exports.InternalDataTransferItem = InternalDataTransferItem;
    /**
     * A data transfer item for a file.
     *
     * Intentionally not exported to extensions as only we can create these.
     */
    class InternalFileDataTransferItem extends InternalDataTransferItem {
        #file;
        constructor(file) {
            super('');
            this.#file = file;
        }
        asFile() {
            return this.#file;
        }
    }
    exports.InternalFileDataTransferItem = InternalFileDataTransferItem;
    /**
     * Intentionally not exported to extensions
     */
    class DataTransferFile {
        constructor(name, uri, itemId, getData) {
            this.name = name;
            this.uri = uri;
            this._itemId = itemId;
            this._getData = getData;
        }
        data() {
            return this._getData();
        }
    }
    exports.DataTransferFile = DataTransferFile;
    let DataTransfer = class DataTransfer {
        #items = new Map();
        constructor(init) {
            for (const [mime, item] of init ?? []) {
                const existing = this.#items.get(this.#normalizeMime(mime));
                if (existing) {
                    existing.push(item);
                }
                else {
                    this.#items.set(this.#normalizeMime(mime), [item]);
                }
            }
        }
        get(mimeType) {
            return this.#items.get(this.#normalizeMime(mimeType))?.[0];
        }
        set(mimeType, value) {
            // This intentionally overwrites all entries for a given mimetype.
            // This is similar to how the DOM DataTransfer type works
            this.#items.set(this.#normalizeMime(mimeType), [value]);
        }
        forEach(callbackfn, thisArg) {
            for (const [mime, items] of this.#items) {
                for (const item of items) {
                    callbackfn.call(thisArg, item, mime, this);
                }
            }
        }
        *[Symbol.iterator]() {
            for (const [mime, items] of this.#items) {
                for (const item of items) {
                    yield [mime, item];
                }
            }
        }
        #normalizeMime(mimeType) {
            return mimeType.toLowerCase();
        }
    };
    exports.DataTransfer = DataTransfer;
    exports.DataTransfer = DataTransfer = __decorate([
        es5ClassCompat
    ], DataTransfer);
    let DocumentDropEdit = class DocumentDropEdit {
        constructor(insertText) {
            this.insertText = insertText;
        }
    };
    exports.DocumentDropEdit = DocumentDropEdit;
    exports.DocumentDropEdit = DocumentDropEdit = __decorate([
        es5ClassCompat
    ], DocumentDropEdit);
    let DocumentPasteEdit = class DocumentPasteEdit {
        constructor(insertText, label) {
            this.label = label;
            this.insertText = insertText;
        }
    };
    exports.DocumentPasteEdit = DocumentPasteEdit;
    exports.DocumentPasteEdit = DocumentPasteEdit = __decorate([
        es5ClassCompat
    ], DocumentPasteEdit);
    let ThemeIcon = class ThemeIcon {
        constructor(id, color) {
            this.id = id;
            this.color = color;
        }
        static isThemeIcon(thing) {
            if (typeof thing.id !== 'string') {
                console.log('INVALID ThemeIcon, invalid id', thing.id);
                return false;
            }
            return true;
        }
    };
    exports.ThemeIcon = ThemeIcon;
    exports.ThemeIcon = ThemeIcon = __decorate([
        es5ClassCompat
    ], ThemeIcon);
    ThemeIcon.File = new ThemeIcon('file');
    ThemeIcon.Folder = new ThemeIcon('folder');
    let ThemeColor = class ThemeColor {
        constructor(id) {
            this.id = id;
        }
    };
    exports.ThemeColor = ThemeColor;
    exports.ThemeColor = ThemeColor = __decorate([
        es5ClassCompat
    ], ThemeColor);
    var ConfigurationTarget;
    (function (ConfigurationTarget) {
        ConfigurationTarget[ConfigurationTarget["Global"] = 1] = "Global";
        ConfigurationTarget[ConfigurationTarget["Workspace"] = 2] = "Workspace";
        ConfigurationTarget[ConfigurationTarget["WorkspaceFolder"] = 3] = "WorkspaceFolder";
    })(ConfigurationTarget || (exports.ConfigurationTarget = ConfigurationTarget = {}));
    let RelativePattern = class RelativePattern {
        get base() {
            return this._base;
        }
        set base(base) {
            this._base = base;
            this._baseUri = uri_1.URI.file(base);
        }
        get baseUri() {
            return this._baseUri;
        }
        set baseUri(baseUri) {
            this._baseUri = baseUri;
            this._base = baseUri.fsPath;
        }
        constructor(base, pattern) {
            if (typeof base !== 'string') {
                if (!base || !uri_1.URI.isUri(base) && !uri_1.URI.isUri(base.uri)) {
                    throw (0, errors_1.illegalArgument)('base');
                }
            }
            if (typeof pattern !== 'string') {
                throw (0, errors_1.illegalArgument)('pattern');
            }
            if (typeof base === 'string') {
                this.baseUri = uri_1.URI.file(base);
            }
            else if (uri_1.URI.isUri(base)) {
                this.baseUri = base;
            }
            else {
                this.baseUri = base.uri;
            }
            this.pattern = pattern;
        }
        toJSON() {
            return {
                pattern: this.pattern,
                base: this.base,
                baseUri: this.baseUri.toJSON()
            };
        }
    };
    exports.RelativePattern = RelativePattern;
    exports.RelativePattern = RelativePattern = __decorate([
        es5ClassCompat
    ], RelativePattern);
    const breakpointIds = new WeakMap();
    /**
     * We want to be able to construct Breakpoints internally that have a particular id, but we don't want extensions to be
     * able to do this with the exposed Breakpoint classes in extension API.
     * We also want "instanceof" to work with debug.breakpoints and the exposed breakpoint classes.
     * And private members will be renamed in the built js, so casting to any and setting a private member is not safe.
     * So, we store internal breakpoint IDs in a WeakMap. This function must be called after constructing a Breakpoint
     * with a known id.
     */
    function setBreakpointId(bp, id) {
        breakpointIds.set(bp, id);
    }
    exports.setBreakpointId = setBreakpointId;
    let Breakpoint = class Breakpoint {
        constructor(enabled, condition, hitCondition, logMessage) {
            this.enabled = typeof enabled === 'boolean' ? enabled : true;
            if (typeof condition === 'string') {
                this.condition = condition;
            }
            if (typeof hitCondition === 'string') {
                this.hitCondition = hitCondition;
            }
            if (typeof logMessage === 'string') {
                this.logMessage = logMessage;
            }
        }
        get id() {
            if (!this._id) {
                this._id = breakpointIds.get(this) ?? (0, uuid_1.generateUuid)();
            }
            return this._id;
        }
    };
    exports.Breakpoint = Breakpoint;
    exports.Breakpoint = Breakpoint = __decorate([
        es5ClassCompat
    ], Breakpoint);
    let SourceBreakpoint = class SourceBreakpoint extends Breakpoint {
        constructor(location, enabled, condition, hitCondition, logMessage) {
            super(enabled, condition, hitCondition, logMessage);
            if (location === null) {
                throw (0, errors_1.illegalArgument)('location');
            }
            this.location = location;
        }
    };
    exports.SourceBreakpoint = SourceBreakpoint;
    exports.SourceBreakpoint = SourceBreakpoint = __decorate([
        es5ClassCompat
    ], SourceBreakpoint);
    let FunctionBreakpoint = class FunctionBreakpoint extends Breakpoint {
        constructor(functionName, enabled, condition, hitCondition, logMessage) {
            super(enabled, condition, hitCondition, logMessage);
            this.functionName = functionName;
        }
    };
    exports.FunctionBreakpoint = FunctionBreakpoint;
    exports.FunctionBreakpoint = FunctionBreakpoint = __decorate([
        es5ClassCompat
    ], FunctionBreakpoint);
    let DataBreakpoint = class DataBreakpoint extends Breakpoint {
        constructor(label, dataId, canPersist, enabled, condition, hitCondition, logMessage) {
            super(enabled, condition, hitCondition, logMessage);
            if (!dataId) {
                throw (0, errors_1.illegalArgument)('dataId');
            }
            this.label = label;
            this.dataId = dataId;
            this.canPersist = canPersist;
        }
    };
    exports.DataBreakpoint = DataBreakpoint;
    exports.DataBreakpoint = DataBreakpoint = __decorate([
        es5ClassCompat
    ], DataBreakpoint);
    let DebugAdapterExecutable = class DebugAdapterExecutable {
        constructor(command, args, options) {
            this.command = command;
            this.args = args || [];
            this.options = options;
        }
    };
    exports.DebugAdapterExecutable = DebugAdapterExecutable;
    exports.DebugAdapterExecutable = DebugAdapterExecutable = __decorate([
        es5ClassCompat
    ], DebugAdapterExecutable);
    let DebugAdapterServer = class DebugAdapterServer {
        constructor(port, host) {
            this.port = port;
            this.host = host;
        }
    };
    exports.DebugAdapterServer = DebugAdapterServer;
    exports.DebugAdapterServer = DebugAdapterServer = __decorate([
        es5ClassCompat
    ], DebugAdapterServer);
    let DebugAdapterNamedPipeServer = class DebugAdapterNamedPipeServer {
        constructor(path) {
            this.path = path;
        }
    };
    exports.DebugAdapterNamedPipeServer = DebugAdapterNamedPipeServer;
    exports.DebugAdapterNamedPipeServer = DebugAdapterNamedPipeServer = __decorate([
        es5ClassCompat
    ], DebugAdapterNamedPipeServer);
    let DebugAdapterInlineImplementation = class DebugAdapterInlineImplementation {
        constructor(impl) {
            this.implementation = impl;
        }
    };
    exports.DebugAdapterInlineImplementation = DebugAdapterInlineImplementation;
    exports.DebugAdapterInlineImplementation = DebugAdapterInlineImplementation = __decorate([
        es5ClassCompat
    ], DebugAdapterInlineImplementation);
    let StackFrameFocus = class StackFrameFocus {
        constructor(session, threadId, frameId) {
            this.session = session;
            this.threadId = threadId;
            this.frameId = frameId;
        }
    };
    exports.StackFrameFocus = StackFrameFocus;
    exports.StackFrameFocus = StackFrameFocus = __decorate([
        es5ClassCompat
    ], StackFrameFocus);
    let ThreadFocus = class ThreadFocus {
        constructor(session, threadId) {
            this.session = session;
            this.threadId = threadId;
        }
    };
    exports.ThreadFocus = ThreadFocus;
    exports.ThreadFocus = ThreadFocus = __decorate([
        es5ClassCompat
    ], ThreadFocus);
    let EvaluatableExpression = class EvaluatableExpression {
        constructor(range, expression) {
            this.range = range;
            this.expression = expression;
        }
    };
    exports.EvaluatableExpression = EvaluatableExpression;
    exports.EvaluatableExpression = EvaluatableExpression = __decorate([
        es5ClassCompat
    ], EvaluatableExpression);
    var InlineCompletionTriggerKind;
    (function (InlineCompletionTriggerKind) {
        InlineCompletionTriggerKind[InlineCompletionTriggerKind["Invoke"] = 0] = "Invoke";
        InlineCompletionTriggerKind[InlineCompletionTriggerKind["Automatic"] = 1] = "Automatic";
    })(InlineCompletionTriggerKind || (exports.InlineCompletionTriggerKind = InlineCompletionTriggerKind = {}));
    let InlineValueText = class InlineValueText {
        constructor(range, text) {
            this.range = range;
            this.text = text;
        }
    };
    exports.InlineValueText = InlineValueText;
    exports.InlineValueText = InlineValueText = __decorate([
        es5ClassCompat
    ], InlineValueText);
    let InlineValueVariableLookup = class InlineValueVariableLookup {
        constructor(range, variableName, caseSensitiveLookup = true) {
            this.range = range;
            this.variableName = variableName;
            this.caseSensitiveLookup = caseSensitiveLookup;
        }
    };
    exports.InlineValueVariableLookup = InlineValueVariableLookup;
    exports.InlineValueVariableLookup = InlineValueVariableLookup = __decorate([
        es5ClassCompat
    ], InlineValueVariableLookup);
    let InlineValueEvaluatableExpression = class InlineValueEvaluatableExpression {
        constructor(range, expression) {
            this.range = range;
            this.expression = expression;
        }
    };
    exports.InlineValueEvaluatableExpression = InlineValueEvaluatableExpression;
    exports.InlineValueEvaluatableExpression = InlineValueEvaluatableExpression = __decorate([
        es5ClassCompat
    ], InlineValueEvaluatableExpression);
    let InlineValueContext = class InlineValueContext {
        constructor(frameId, range) {
            this.frameId = frameId;
            this.stoppedLocation = range;
        }
    };
    exports.InlineValueContext = InlineValueContext;
    exports.InlineValueContext = InlineValueContext = __decorate([
        es5ClassCompat
    ], InlineValueContext);
    //#region file api
    var FileChangeType;
    (function (FileChangeType) {
        FileChangeType[FileChangeType["Changed"] = 1] = "Changed";
        FileChangeType[FileChangeType["Created"] = 2] = "Created";
        FileChangeType[FileChangeType["Deleted"] = 3] = "Deleted";
    })(FileChangeType || (exports.FileChangeType = FileChangeType = {}));
    let FileSystemError = FileSystemError_1 = class FileSystemError extends Error {
        static FileExists(messageOrUri) {
            return new FileSystemError_1(messageOrUri, files_1.FileSystemProviderErrorCode.FileExists, FileSystemError_1.FileExists);
        }
        static FileNotFound(messageOrUri) {
            return new FileSystemError_1(messageOrUri, files_1.FileSystemProviderErrorCode.FileNotFound, FileSystemError_1.FileNotFound);
        }
        static FileNotADirectory(messageOrUri) {
            return new FileSystemError_1(messageOrUri, files_1.FileSystemProviderErrorCode.FileNotADirectory, FileSystemError_1.FileNotADirectory);
        }
        static FileIsADirectory(messageOrUri) {
            return new FileSystemError_1(messageOrUri, files_1.FileSystemProviderErrorCode.FileIsADirectory, FileSystemError_1.FileIsADirectory);
        }
        static NoPermissions(messageOrUri) {
            return new FileSystemError_1(messageOrUri, files_1.FileSystemProviderErrorCode.NoPermissions, FileSystemError_1.NoPermissions);
        }
        static Unavailable(messageOrUri) {
            return new FileSystemError_1(messageOrUri, files_1.FileSystemProviderErrorCode.Unavailable, FileSystemError_1.Unavailable);
        }
        constructor(uriOrMessage, code = files_1.FileSystemProviderErrorCode.Unknown, terminator) {
            super(uri_1.URI.isUri(uriOrMessage) ? uriOrMessage.toString(true) : uriOrMessage);
            this.code = terminator?.name ?? 'Unknown';
            // mark the error as file system provider error so that
            // we can extract the error code on the receiving side
            (0, files_1.markAsFileSystemProviderError)(this, code);
            // workaround when extending builtin objects and when compiling to ES5, see:
            // https://github.com/microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
            Object.setPrototypeOf(this, FileSystemError_1.prototype);
            if (typeof Error.captureStackTrace === 'function' && typeof terminator === 'function') {
                // nice stack traces
                Error.captureStackTrace(this, terminator);
            }
        }
    };
    exports.FileSystemError = FileSystemError;
    exports.FileSystemError = FileSystemError = FileSystemError_1 = __decorate([
        es5ClassCompat
    ], FileSystemError);
    //#endregion
    //#region folding api
    let FoldingRange = class FoldingRange {
        constructor(start, end, kind) {
            this.start = start;
            this.end = end;
            this.kind = kind;
        }
    };
    exports.FoldingRange = FoldingRange;
    exports.FoldingRange = FoldingRange = __decorate([
        es5ClassCompat
    ], FoldingRange);
    var FoldingRangeKind;
    (function (FoldingRangeKind) {
        FoldingRangeKind[FoldingRangeKind["Comment"] = 1] = "Comment";
        FoldingRangeKind[FoldingRangeKind["Imports"] = 2] = "Imports";
        FoldingRangeKind[FoldingRangeKind["Region"] = 3] = "Region";
    })(FoldingRangeKind || (exports.FoldingRangeKind = FoldingRangeKind = {}));
    //#endregion
    //#region Comment
    var CommentThreadCollapsibleState;
    (function (CommentThreadCollapsibleState) {
        /**
         * Determines an item is collapsed
         */
        CommentThreadCollapsibleState[CommentThreadCollapsibleState["Collapsed"] = 0] = "Collapsed";
        /**
         * Determines an item is expanded
         */
        CommentThreadCollapsibleState[CommentThreadCollapsibleState["Expanded"] = 1] = "Expanded";
    })(CommentThreadCollapsibleState || (exports.CommentThreadCollapsibleState = CommentThreadCollapsibleState = {}));
    var CommentMode;
    (function (CommentMode) {
        CommentMode[CommentMode["Editing"] = 0] = "Editing";
        CommentMode[CommentMode["Preview"] = 1] = "Preview";
    })(CommentMode || (exports.CommentMode = CommentMode = {}));
    var CommentState;
    (function (CommentState) {
        CommentState[CommentState["Published"] = 0] = "Published";
        CommentState[CommentState["Draft"] = 1] = "Draft";
    })(CommentState || (exports.CommentState = CommentState = {}));
    var CommentThreadState;
    (function (CommentThreadState) {
        CommentThreadState[CommentThreadState["Unresolved"] = 0] = "Unresolved";
        CommentThreadState[CommentThreadState["Resolved"] = 1] = "Resolved";
    })(CommentThreadState || (exports.CommentThreadState = CommentThreadState = {}));
    //#endregion
    //#region Semantic Coloring
    class SemanticTokensLegend {
        constructor(tokenTypes, tokenModifiers = []) {
            this.tokenTypes = tokenTypes;
            this.tokenModifiers = tokenModifiers;
        }
    }
    exports.SemanticTokensLegend = SemanticTokensLegend;
    function isStrArrayOrUndefined(arg) {
        return ((typeof arg === 'undefined') || (0, types_1.isStringArray)(arg));
    }
    class SemanticTokensBuilder {
        constructor(legend) {
            this._prevLine = 0;
            this._prevChar = 0;
            this._dataIsSortedAndDeltaEncoded = true;
            this._data = [];
            this._dataLen = 0;
            this._tokenTypeStrToInt = new Map();
            this._tokenModifierStrToInt = new Map();
            this._hasLegend = false;
            if (legend) {
                this._hasLegend = true;
                for (let i = 0, len = legend.tokenTypes.length; i < len; i++) {
                    this._tokenTypeStrToInt.set(legend.tokenTypes[i], i);
                }
                for (let i = 0, len = legend.tokenModifiers.length; i < len; i++) {
                    this._tokenModifierStrToInt.set(legend.tokenModifiers[i], i);
                }
            }
        }
        push(arg0, arg1, arg2, arg3, arg4) {
            if (typeof arg0 === 'number' && typeof arg1 === 'number' && typeof arg2 === 'number' && typeof arg3 === 'number' && (typeof arg4 === 'number' || typeof arg4 === 'undefined')) {
                if (typeof arg4 === 'undefined') {
                    arg4 = 0;
                }
                // 1st overload
                return this._pushEncoded(arg0, arg1, arg2, arg3, arg4);
            }
            if (Range.isRange(arg0) && typeof arg1 === 'string' && isStrArrayOrUndefined(arg2)) {
                // 2nd overload
                return this._push(arg0, arg1, arg2);
            }
            throw (0, errors_1.illegalArgument)();
        }
        _push(range, tokenType, tokenModifiers) {
            if (!this._hasLegend) {
                throw new Error('Legend must be provided in constructor');
            }
            if (range.start.line !== range.end.line) {
                throw new Error('`range` cannot span multiple lines');
            }
            if (!this._tokenTypeStrToInt.has(tokenType)) {
                throw new Error('`tokenType` is not in the provided legend');
            }
            const line = range.start.line;
            const char = range.start.character;
            const length = range.end.character - range.start.character;
            const nTokenType = this._tokenTypeStrToInt.get(tokenType);
            let nTokenModifiers = 0;
            if (tokenModifiers) {
                for (const tokenModifier of tokenModifiers) {
                    if (!this._tokenModifierStrToInt.has(tokenModifier)) {
                        throw new Error('`tokenModifier` is not in the provided legend');
                    }
                    const nTokenModifier = this._tokenModifierStrToInt.get(tokenModifier);
                    nTokenModifiers |= (1 << nTokenModifier) >>> 0;
                }
            }
            this._pushEncoded(line, char, length, nTokenType, nTokenModifiers);
        }
        _pushEncoded(line, char, length, tokenType, tokenModifiers) {
            if (this._dataIsSortedAndDeltaEncoded && (line < this._prevLine || (line === this._prevLine && char < this._prevChar))) {
                // push calls were ordered and are no longer ordered
                this._dataIsSortedAndDeltaEncoded = false;
                // Remove delta encoding from data
                const tokenCount = (this._data.length / 5) | 0;
                let prevLine = 0;
                let prevChar = 0;
                for (let i = 0; i < tokenCount; i++) {
                    let line = this._data[5 * i];
                    let char = this._data[5 * i + 1];
                    if (line === 0) {
                        // on the same line as previous token
                        line = prevLine;
                        char += prevChar;
                    }
                    else {
                        // on a different line than previous token
                        line += prevLine;
                    }
                    this._data[5 * i] = line;
                    this._data[5 * i + 1] = char;
                    prevLine = line;
                    prevChar = char;
                }
            }
            let pushLine = line;
            let pushChar = char;
            if (this._dataIsSortedAndDeltaEncoded && this._dataLen > 0) {
                pushLine -= this._prevLine;
                if (pushLine === 0) {
                    pushChar -= this._prevChar;
                }
            }
            this._data[this._dataLen++] = pushLine;
            this._data[this._dataLen++] = pushChar;
            this._data[this._dataLen++] = length;
            this._data[this._dataLen++] = tokenType;
            this._data[this._dataLen++] = tokenModifiers;
            this._prevLine = line;
            this._prevChar = char;
        }
        static _sortAndDeltaEncode(data) {
            const pos = [];
            const tokenCount = (data.length / 5) | 0;
            for (let i = 0; i < tokenCount; i++) {
                pos[i] = i;
            }
            pos.sort((a, b) => {
                const aLine = data[5 * a];
                const bLine = data[5 * b];
                if (aLine === bLine) {
                    const aChar = data[5 * a + 1];
                    const bChar = data[5 * b + 1];
                    return aChar - bChar;
                }
                return aLine - bLine;
            });
            const result = new Uint32Array(data.length);
            let prevLine = 0;
            let prevChar = 0;
            for (let i = 0; i < tokenCount; i++) {
                const srcOffset = 5 * pos[i];
                const line = data[srcOffset + 0];
                const char = data[srcOffset + 1];
                const length = data[srcOffset + 2];
                const tokenType = data[srcOffset + 3];
                const tokenModifiers = data[srcOffset + 4];
                const pushLine = line - prevLine;
                const pushChar = (pushLine === 0 ? char - prevChar : char);
                const dstOffset = 5 * i;
                result[dstOffset + 0] = pushLine;
                result[dstOffset + 1] = pushChar;
                result[dstOffset + 2] = length;
                result[dstOffset + 3] = tokenType;
                result[dstOffset + 4] = tokenModifiers;
                prevLine = line;
                prevChar = char;
            }
            return result;
        }
        build(resultId) {
            if (!this._dataIsSortedAndDeltaEncoded) {
                return new SemanticTokens(SemanticTokensBuilder._sortAndDeltaEncode(this._data), resultId);
            }
            return new SemanticTokens(new Uint32Array(this._data), resultId);
        }
    }
    exports.SemanticTokensBuilder = SemanticTokensBuilder;
    class SemanticTokens {
        constructor(data, resultId) {
            this.resultId = resultId;
            this.data = data;
        }
    }
    exports.SemanticTokens = SemanticTokens;
    class SemanticTokensEdit {
        constructor(start, deleteCount, data) {
            this.start = start;
            this.deleteCount = deleteCount;
            this.data = data;
        }
    }
    exports.SemanticTokensEdit = SemanticTokensEdit;
    class SemanticTokensEdits {
        constructor(edits, resultId) {
            this.resultId = resultId;
            this.edits = edits;
        }
    }
    exports.SemanticTokensEdits = SemanticTokensEdits;
    //#endregion
    //#region debug
    var DebugConsoleMode;
    (function (DebugConsoleMode) {
        /**
         * Debug session should have a separate debug console.
         */
        DebugConsoleMode[DebugConsoleMode["Separate"] = 0] = "Separate";
        /**
         * Debug session should share debug console with its parent session.
         * This value has no effect for sessions which do not have a parent session.
         */
        DebugConsoleMode[DebugConsoleMode["MergeWithParent"] = 1] = "MergeWithParent";
    })(DebugConsoleMode || (exports.DebugConsoleMode = DebugConsoleMode = {}));
    //#endregion
    let QuickInputButtons = class QuickInputButtons {
        static { this.Back = { iconPath: new ThemeIcon('arrow-left') }; }
        constructor() { }
    };
    exports.QuickInputButtons = QuickInputButtons;
    exports.QuickInputButtons = QuickInputButtons = __decorate([
        es5ClassCompat
    ], QuickInputButtons);
    var QuickPickItemKind;
    (function (QuickPickItemKind) {
        QuickPickItemKind[QuickPickItemKind["Separator"] = -1] = "Separator";
        QuickPickItemKind[QuickPickItemKind["Default"] = 0] = "Default";
    })(QuickPickItemKind || (exports.QuickPickItemKind = QuickPickItemKind = {}));
    var InputBoxValidationSeverity;
    (function (InputBoxValidationSeverity) {
        InputBoxValidationSeverity[InputBoxValidationSeverity["Info"] = 1] = "Info";
        InputBoxValidationSeverity[InputBoxValidationSeverity["Warning"] = 2] = "Warning";
        InputBoxValidationSeverity[InputBoxValidationSeverity["Error"] = 3] = "Error";
    })(InputBoxValidationSeverity || (exports.InputBoxValidationSeverity = InputBoxValidationSeverity = {}));
    var ExtensionKind;
    (function (ExtensionKind) {
        ExtensionKind[ExtensionKind["UI"] = 1] = "UI";
        ExtensionKind[ExtensionKind["Workspace"] = 2] = "Workspace";
    })(ExtensionKind || (exports.ExtensionKind = ExtensionKind = {}));
    class FileDecoration {
        static validate(d) {
            if (typeof d.badge === 'string') {
                let len = (0, strings_1.nextCharLength)(d.badge, 0);
                if (len < d.badge.length) {
                    len += (0, strings_1.nextCharLength)(d.badge, len);
                }
                if (d.badge.length > len) {
                    throw new Error(`The 'badge'-property must be undefined or a short character`);
                }
            }
            else if (d.badge) {
                if (!ThemeIcon.isThemeIcon(d.badge)) {
                    throw new Error(`The 'badge'-property is not a valid ThemeIcon`);
                }
            }
            if (!d.color && !d.badge && !d.tooltip) {
                throw new Error(`The decoration is empty`);
            }
            return true;
        }
        constructor(badge, tooltip, color) {
            this.badge = badge;
            this.tooltip = tooltip;
            this.color = color;
        }
    }
    exports.FileDecoration = FileDecoration;
    //#region Theming
    let ColorTheme = class ColorTheme {
        constructor(kind) {
            this.kind = kind;
        }
    };
    exports.ColorTheme = ColorTheme;
    exports.ColorTheme = ColorTheme = __decorate([
        es5ClassCompat
    ], ColorTheme);
    var ColorThemeKind;
    (function (ColorThemeKind) {
        ColorThemeKind[ColorThemeKind["Light"] = 1] = "Light";
        ColorThemeKind[ColorThemeKind["Dark"] = 2] = "Dark";
        ColorThemeKind[ColorThemeKind["HighContrast"] = 3] = "HighContrast";
        ColorThemeKind[ColorThemeKind["HighContrastLight"] = 4] = "HighContrastLight";
    })(ColorThemeKind || (exports.ColorThemeKind = ColorThemeKind = {}));
    //#endregion Theming
    //#region Notebook
    class NotebookRange {
        static isNotebookRange(thing) {
            if (thing instanceof NotebookRange) {
                return true;
            }
            if (!thing) {
                return false;
            }
            return typeof thing.start === 'number'
                && typeof thing.end === 'number';
        }
        get start() {
            return this._start;
        }
        get end() {
            return this._end;
        }
        get isEmpty() {
            return this._start === this._end;
        }
        constructor(start, end) {
            if (start < 0) {
                throw (0, errors_1.illegalArgument)('start must be positive');
            }
            if (end < 0) {
                throw (0, errors_1.illegalArgument)('end must be positive');
            }
            if (start <= end) {
                this._start = start;
                this._end = end;
            }
            else {
                this._start = end;
                this._end = start;
            }
        }
        with(change) {
            let start = this._start;
            let end = this._end;
            if (change.start !== undefined) {
                start = change.start;
            }
            if (change.end !== undefined) {
                end = change.end;
            }
            if (start === this._start && end === this._end) {
                return this;
            }
            return new NotebookRange(start, end);
        }
    }
    exports.NotebookRange = NotebookRange;
    class NotebookCellData {
        static validate(data) {
            if (typeof data.kind !== 'number') {
                throw new Error('NotebookCellData MUST have \'kind\' property');
            }
            if (typeof data.value !== 'string') {
                throw new Error('NotebookCellData MUST have \'value\' property');
            }
            if (typeof data.languageId !== 'string') {
                throw new Error('NotebookCellData MUST have \'languageId\' property');
            }
        }
        static isNotebookCellDataArray(value) {
            return Array.isArray(value) && value.every(elem => NotebookCellData.isNotebookCellData(elem));
        }
        static isNotebookCellData(value) {
            // return value instanceof NotebookCellData;
            return true;
        }
        constructor(kind, value, languageId, mime, outputs, metadata, executionSummary) {
            this.kind = kind;
            this.value = value;
            this.languageId = languageId;
            this.mime = mime;
            this.outputs = outputs ?? [];
            this.metadata = metadata;
            this.executionSummary = executionSummary;
            NotebookCellData.validate(this);
        }
    }
    exports.NotebookCellData = NotebookCellData;
    class NotebookData {
        constructor(cells) {
            this.cells = cells;
        }
    }
    exports.NotebookData = NotebookData;
    class NotebookCellOutputItem {
        static isNotebookCellOutputItem(obj) {
            if (obj instanceof NotebookCellOutputItem) {
                return true;
            }
            if (!obj) {
                return false;
            }
            return typeof obj.mime === 'string'
                && obj.data instanceof Uint8Array;
        }
        static error(err) {
            const obj = {
                name: err.name,
                message: err.message,
                stack: err.stack
            };
            return NotebookCellOutputItem.json(obj, 'application/vnd.code.notebook.error');
        }
        static stdout(value) {
            return NotebookCellOutputItem.text(value, 'application/vnd.code.notebook.stdout');
        }
        static stderr(value) {
            return NotebookCellOutputItem.text(value, 'application/vnd.code.notebook.stderr');
        }
        static bytes(value, mime = 'application/octet-stream') {
            return new NotebookCellOutputItem(value, mime);
        }
        static #encoder = new TextEncoder();
        static text(value, mime = mime_1.Mimes.text) {
            const bytes = NotebookCellOutputItem.#encoder.encode(String(value));
            return new NotebookCellOutputItem(bytes, mime);
        }
        static json(value, mime = 'text/x-json') {
            const rawStr = JSON.stringify(value, undefined, '\t');
            return NotebookCellOutputItem.text(rawStr, mime);
        }
        constructor(data, mime) {
            this.data = data;
            this.mime = mime;
            const mimeNormalized = (0, mime_1.normalizeMimeType)(mime, true);
            if (!mimeNormalized) {
                throw new Error(`INVALID mime type: ${mime}. Must be in the format "type/subtype[;optionalparameter]"`);
            }
            this.mime = mimeNormalized;
        }
    }
    exports.NotebookCellOutputItem = NotebookCellOutputItem;
    class NotebookCellOutput {
        static isNotebookCellOutput(candidate) {
            if (candidate instanceof NotebookCellOutput) {
                return true;
            }
            if (!candidate || typeof candidate !== 'object') {
                return false;
            }
            return typeof candidate.id === 'string' && Array.isArray(candidate.items);
        }
        static ensureUniqueMimeTypes(items, warn = false) {
            const seen = new Set();
            const removeIdx = new Set();
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const normalMime = (0, mime_1.normalizeMimeType)(item.mime);
                // We can have multiple text stream mime types in the same output.
                if (!seen.has(normalMime) || (0, notebookCommon_1.isTextStreamMime)(normalMime)) {
                    seen.add(normalMime);
                    continue;
                }
                // duplicated mime types... first has won
                removeIdx.add(i);
                if (warn) {
                    console.warn(`DUPLICATED mime type '${item.mime}' will be dropped`);
                }
            }
            if (removeIdx.size === 0) {
                return items;
            }
            return items.filter((_item, index) => !removeIdx.has(index));
        }
        constructor(items, idOrMetadata, metadata) {
            this.items = NotebookCellOutput.ensureUniqueMimeTypes(items, true);
            if (typeof idOrMetadata === 'string') {
                this.id = idOrMetadata;
                this.metadata = metadata;
            }
            else {
                this.id = (0, uuid_1.generateUuid)();
                this.metadata = idOrMetadata ?? metadata;
            }
        }
    }
    exports.NotebookCellOutput = NotebookCellOutput;
    var NotebookCellKind;
    (function (NotebookCellKind) {
        NotebookCellKind[NotebookCellKind["Markup"] = 1] = "Markup";
        NotebookCellKind[NotebookCellKind["Code"] = 2] = "Code";
    })(NotebookCellKind || (exports.NotebookCellKind = NotebookCellKind = {}));
    var NotebookCellExecutionState;
    (function (NotebookCellExecutionState) {
        NotebookCellExecutionState[NotebookCellExecutionState["Idle"] = 1] = "Idle";
        NotebookCellExecutionState[NotebookCellExecutionState["Pending"] = 2] = "Pending";
        NotebookCellExecutionState[NotebookCellExecutionState["Executing"] = 3] = "Executing";
    })(NotebookCellExecutionState || (exports.NotebookCellExecutionState = NotebookCellExecutionState = {}));
    var NotebookCellStatusBarAlignment;
    (function (NotebookCellStatusBarAlignment) {
        NotebookCellStatusBarAlignment[NotebookCellStatusBarAlignment["Left"] = 1] = "Left";
        NotebookCellStatusBarAlignment[NotebookCellStatusBarAlignment["Right"] = 2] = "Right";
    })(NotebookCellStatusBarAlignment || (exports.NotebookCellStatusBarAlignment = NotebookCellStatusBarAlignment = {}));
    var NotebookEditorRevealType;
    (function (NotebookEditorRevealType) {
        NotebookEditorRevealType[NotebookEditorRevealType["Default"] = 0] = "Default";
        NotebookEditorRevealType[NotebookEditorRevealType["InCenter"] = 1] = "InCenter";
        NotebookEditorRevealType[NotebookEditorRevealType["InCenterIfOutsideViewport"] = 2] = "InCenterIfOutsideViewport";
        NotebookEditorRevealType[NotebookEditorRevealType["AtTop"] = 3] = "AtTop";
    })(NotebookEditorRevealType || (exports.NotebookEditorRevealType = NotebookEditorRevealType = {}));
    class NotebookCellStatusBarItem {
        constructor(text, alignment) {
            this.text = text;
            this.alignment = alignment;
        }
    }
    exports.NotebookCellStatusBarItem = NotebookCellStatusBarItem;
    var NotebookControllerAffinity;
    (function (NotebookControllerAffinity) {
        NotebookControllerAffinity[NotebookControllerAffinity["Default"] = 1] = "Default";
        NotebookControllerAffinity[NotebookControllerAffinity["Preferred"] = 2] = "Preferred";
    })(NotebookControllerAffinity || (exports.NotebookControllerAffinity = NotebookControllerAffinity = {}));
    var NotebookControllerAffinity2;
    (function (NotebookControllerAffinity2) {
        NotebookControllerAffinity2[NotebookControllerAffinity2["Default"] = 1] = "Default";
        NotebookControllerAffinity2[NotebookControllerAffinity2["Preferred"] = 2] = "Preferred";
        NotebookControllerAffinity2[NotebookControllerAffinity2["Hidden"] = -1] = "Hidden";
    })(NotebookControllerAffinity2 || (exports.NotebookControllerAffinity2 = NotebookControllerAffinity2 = {}));
    class NotebookRendererScript {
        constructor(uri, provides = []) {
            this.uri = uri;
            this.provides = (0, arrays_1.asArray)(provides);
        }
    }
    exports.NotebookRendererScript = NotebookRendererScript;
    class NotebookKernelSourceAction {
        constructor(label) {
            this.label = label;
        }
    }
    exports.NotebookKernelSourceAction = NotebookKernelSourceAction;
    //#endregion
    //#region Timeline
    let TimelineItem = class TimelineItem {
        constructor(label, timestamp) {
            this.label = label;
            this.timestamp = timestamp;
        }
    };
    exports.TimelineItem = TimelineItem;
    exports.TimelineItem = TimelineItem = __decorate([
        es5ClassCompat
    ], TimelineItem);
    //#endregion Timeline
    //#region ExtensionContext
    var ExtensionMode;
    (function (ExtensionMode) {
        /**
         * The extension is installed normally (for example, from the marketplace
         * or VSIX) in VS Code.
         */
        ExtensionMode[ExtensionMode["Production"] = 1] = "Production";
        /**
         * The extension is running from an `--extensionDevelopmentPath` provided
         * when launching VS Code.
         */
        ExtensionMode[ExtensionMode["Development"] = 2] = "Development";
        /**
         * The extension is running from an `--extensionDevelopmentPath` and
         * the extension host is running unit tests.
         */
        ExtensionMode[ExtensionMode["Test"] = 3] = "Test";
    })(ExtensionMode || (exports.ExtensionMode = ExtensionMode = {}));
    var ExtensionRuntime;
    (function (ExtensionRuntime) {
        /**
         * The extension is running in a NodeJS extension host. Runtime access to NodeJS APIs is available.
         */
        ExtensionRuntime[ExtensionRuntime["Node"] = 1] = "Node";
        /**
         * The extension is running in a Webworker extension host. Runtime access is limited to Webworker APIs.
         */
        ExtensionRuntime[ExtensionRuntime["Webworker"] = 2] = "Webworker";
    })(ExtensionRuntime || (exports.ExtensionRuntime = ExtensionRuntime = {}));
    //#endregion ExtensionContext
    var StandardTokenType;
    (function (StandardTokenType) {
        StandardTokenType[StandardTokenType["Other"] = 0] = "Other";
        StandardTokenType[StandardTokenType["Comment"] = 1] = "Comment";
        StandardTokenType[StandardTokenType["String"] = 2] = "String";
        StandardTokenType[StandardTokenType["RegEx"] = 3] = "RegEx";
    })(StandardTokenType || (exports.StandardTokenType = StandardTokenType = {}));
    class LinkedEditingRanges {
        constructor(ranges, wordPattern) {
            this.ranges = ranges;
            this.wordPattern = wordPattern;
        }
    }
    exports.LinkedEditingRanges = LinkedEditingRanges;
    //#region ports
    class PortAttributes {
        constructor(autoForwardAction) {
            this._autoForwardAction = autoForwardAction;
        }
        get autoForwardAction() {
            return this._autoForwardAction;
        }
    }
    exports.PortAttributes = PortAttributes;
    //#endregion ports
    //#region Testing
    var TestResultState;
    (function (TestResultState) {
        TestResultState[TestResultState["Queued"] = 1] = "Queued";
        TestResultState[TestResultState["Running"] = 2] = "Running";
        TestResultState[TestResultState["Passed"] = 3] = "Passed";
        TestResultState[TestResultState["Failed"] = 4] = "Failed";
        TestResultState[TestResultState["Skipped"] = 5] = "Skipped";
        TestResultState[TestResultState["Errored"] = 6] = "Errored";
    })(TestResultState || (exports.TestResultState = TestResultState = {}));
    var TestRunProfileKind;
    (function (TestRunProfileKind) {
        TestRunProfileKind[TestRunProfileKind["Run"] = 1] = "Run";
        TestRunProfileKind[TestRunProfileKind["Debug"] = 2] = "Debug";
        TestRunProfileKind[TestRunProfileKind["Coverage"] = 3] = "Coverage";
    })(TestRunProfileKind || (exports.TestRunProfileKind = TestRunProfileKind = {}));
    let TestRunRequest = class TestRunRequest {
        constructor(include = undefined, exclude = undefined, profile = undefined, continuous = false) {
            this.include = include;
            this.exclude = exclude;
            this.profile = profile;
            this.continuous = continuous;
        }
    };
    exports.TestRunRequest = TestRunRequest;
    exports.TestRunRequest = TestRunRequest = __decorate([
        es5ClassCompat
    ], TestRunRequest);
    let TestMessage = TestMessage_1 = class TestMessage {
        static diff(message, expected, actual) {
            const msg = new TestMessage_1(message);
            msg.expectedOutput = expected;
            msg.actualOutput = actual;
            return msg;
        }
        constructor(message) {
            this.message = message;
        }
    };
    exports.TestMessage = TestMessage;
    exports.TestMessage = TestMessage = TestMessage_1 = __decorate([
        es5ClassCompat
    ], TestMessage);
    let TestTag = class TestTag {
        constructor(id) {
            this.id = id;
        }
    };
    exports.TestTag = TestTag;
    exports.TestTag = TestTag = __decorate([
        es5ClassCompat
    ], TestTag);
    //#endregion
    //#region Test Coverage
    let CoveredCount = class CoveredCount {
        constructor(covered, total) {
            this.covered = covered;
            this.total = total;
        }
    };
    exports.CoveredCount = CoveredCount;
    exports.CoveredCount = CoveredCount = __decorate([
        es5ClassCompat
    ], CoveredCount);
    let FileCoverage = FileCoverage_1 = class FileCoverage {
        static fromDetails(uri, details) {
            const statements = new CoveredCount(0, 0);
            const branches = new CoveredCount(0, 0);
            const fn = new CoveredCount(0, 0);
            for (const detail of details) {
                if ('branches' in detail) {
                    statements.total += 1;
                    statements.covered += detail.executionCount > 0 ? 1 : 0;
                    for (const branch of detail.branches) {
                        branches.total += 1;
                        branches.covered += branch.executionCount > 0 ? 1 : 0;
                    }
                }
                else {
                    fn.total += 1;
                    fn.covered += detail.executionCount > 0 ? 1 : 0;
                }
            }
            const coverage = new FileCoverage_1(uri, statements, branches.total > 0 ? branches : undefined, fn.total > 0 ? fn : undefined);
            coverage.detailedCoverage = details;
            return coverage;
        }
        constructor(uri, statementCoverage, branchCoverage, functionCoverage) {
            this.uri = uri;
            this.statementCoverage = statementCoverage;
            this.branchCoverage = branchCoverage;
            this.functionCoverage = functionCoverage;
        }
    };
    exports.FileCoverage = FileCoverage;
    exports.FileCoverage = FileCoverage = FileCoverage_1 = __decorate([
        es5ClassCompat
    ], FileCoverage);
    let StatementCoverage = class StatementCoverage {
        constructor(executionCount, location, branches = []) {
            this.executionCount = executionCount;
            this.location = location;
            this.branches = branches;
        }
    };
    exports.StatementCoverage = StatementCoverage;
    exports.StatementCoverage = StatementCoverage = __decorate([
        es5ClassCompat
    ], StatementCoverage);
    let BranchCoverage = class BranchCoverage {
        constructor(executionCount, location) {
            this.executionCount = executionCount;
            this.location = location;
        }
    };
    exports.BranchCoverage = BranchCoverage;
    exports.BranchCoverage = BranchCoverage = __decorate([
        es5ClassCompat
    ], BranchCoverage);
    let FunctionCoverage = class FunctionCoverage {
        constructor(executionCount, location) {
            this.executionCount = executionCount;
            this.location = location;
        }
    };
    exports.FunctionCoverage = FunctionCoverage;
    exports.FunctionCoverage = FunctionCoverage = __decorate([
        es5ClassCompat
    ], FunctionCoverage);
    //#endregion
    var ExternalUriOpenerPriority;
    (function (ExternalUriOpenerPriority) {
        ExternalUriOpenerPriority[ExternalUriOpenerPriority["None"] = 0] = "None";
        ExternalUriOpenerPriority[ExternalUriOpenerPriority["Option"] = 1] = "Option";
        ExternalUriOpenerPriority[ExternalUriOpenerPriority["Default"] = 2] = "Default";
        ExternalUriOpenerPriority[ExternalUriOpenerPriority["Preferred"] = 3] = "Preferred";
    })(ExternalUriOpenerPriority || (exports.ExternalUriOpenerPriority = ExternalUriOpenerPriority = {}));
    var WorkspaceTrustState;
    (function (WorkspaceTrustState) {
        WorkspaceTrustState[WorkspaceTrustState["Untrusted"] = 0] = "Untrusted";
        WorkspaceTrustState[WorkspaceTrustState["Trusted"] = 1] = "Trusted";
        WorkspaceTrustState[WorkspaceTrustState["Unspecified"] = 2] = "Unspecified";
    })(WorkspaceTrustState || (exports.WorkspaceTrustState = WorkspaceTrustState = {}));
    var PortAutoForwardAction;
    (function (PortAutoForwardAction) {
        PortAutoForwardAction[PortAutoForwardAction["Notify"] = 1] = "Notify";
        PortAutoForwardAction[PortAutoForwardAction["OpenBrowser"] = 2] = "OpenBrowser";
        PortAutoForwardAction[PortAutoForwardAction["OpenPreview"] = 3] = "OpenPreview";
        PortAutoForwardAction[PortAutoForwardAction["Silent"] = 4] = "Silent";
        PortAutoForwardAction[PortAutoForwardAction["Ignore"] = 5] = "Ignore";
        PortAutoForwardAction[PortAutoForwardAction["OpenBrowserOnce"] = 6] = "OpenBrowserOnce";
    })(PortAutoForwardAction || (exports.PortAutoForwardAction = PortAutoForwardAction = {}));
    class TypeHierarchyItem {
        constructor(kind, name, detail, uri, range, selectionRange) {
            this.kind = kind;
            this.name = name;
            this.detail = detail;
            this.uri = uri;
            this.range = range;
            this.selectionRange = selectionRange;
        }
    }
    exports.TypeHierarchyItem = TypeHierarchyItem;
    //#region Tab Inputs
    class TextTabInput {
        constructor(uri) {
            this.uri = uri;
        }
    }
    exports.TextTabInput = TextTabInput;
    class TextDiffTabInput {
        constructor(original, modified) {
            this.original = original;
            this.modified = modified;
        }
    }
    exports.TextDiffTabInput = TextDiffTabInput;
    class TextMergeTabInput {
        constructor(base, input1, input2, result) {
            this.base = base;
            this.input1 = input1;
            this.input2 = input2;
            this.result = result;
        }
    }
    exports.TextMergeTabInput = TextMergeTabInput;
    class CustomEditorTabInput {
        constructor(uri, viewType) {
            this.uri = uri;
            this.viewType = viewType;
        }
    }
    exports.CustomEditorTabInput = CustomEditorTabInput;
    class WebviewEditorTabInput {
        constructor(viewType) {
            this.viewType = viewType;
        }
    }
    exports.WebviewEditorTabInput = WebviewEditorTabInput;
    class NotebookEditorTabInput {
        constructor(uri, notebookType) {
            this.uri = uri;
            this.notebookType = notebookType;
        }
    }
    exports.NotebookEditorTabInput = NotebookEditorTabInput;
    class NotebookDiffEditorTabInput {
        constructor(original, modified, notebookType) {
            this.original = original;
            this.modified = modified;
            this.notebookType = notebookType;
        }
    }
    exports.NotebookDiffEditorTabInput = NotebookDiffEditorTabInput;
    class TerminalEditorTabInput {
        constructor() { }
    }
    exports.TerminalEditorTabInput = TerminalEditorTabInput;
    class InteractiveWindowInput {
        constructor(uri, inputBoxUri) {
            this.uri = uri;
            this.inputBoxUri = inputBoxUri;
        }
    }
    exports.InteractiveWindowInput = InteractiveWindowInput;
    //#endregion
    //#region Interactive session
    var InteractiveSessionVoteDirection;
    (function (InteractiveSessionVoteDirection) {
        InteractiveSessionVoteDirection[InteractiveSessionVoteDirection["Up"] = 1] = "Up";
        InteractiveSessionVoteDirection[InteractiveSessionVoteDirection["Down"] = 2] = "Down";
    })(InteractiveSessionVoteDirection || (exports.InteractiveSessionVoteDirection = InteractiveSessionVoteDirection = {}));
    var InteractiveSessionCopyKind;
    (function (InteractiveSessionCopyKind) {
        InteractiveSessionCopyKind[InteractiveSessionCopyKind["Action"] = 1] = "Action";
        InteractiveSessionCopyKind[InteractiveSessionCopyKind["Toolbar"] = 2] = "Toolbar";
    })(InteractiveSessionCopyKind || (exports.InteractiveSessionCopyKind = InteractiveSessionCopyKind = {}));
    //#endregion
    //#region Interactive Editor
    var InteractiveEditorResponseFeedbackKind;
    (function (InteractiveEditorResponseFeedbackKind) {
        InteractiveEditorResponseFeedbackKind[InteractiveEditorResponseFeedbackKind["Unhelpful"] = 0] = "Unhelpful";
        InteractiveEditorResponseFeedbackKind[InteractiveEditorResponseFeedbackKind["Helpful"] = 1] = "Helpful";
        InteractiveEditorResponseFeedbackKind[InteractiveEditorResponseFeedbackKind["Undone"] = 2] = "Undone";
        InteractiveEditorResponseFeedbackKind[InteractiveEditorResponseFeedbackKind["Accepted"] = 3] = "Accepted";
    })(InteractiveEditorResponseFeedbackKind || (exports.InteractiveEditorResponseFeedbackKind = InteractiveEditorResponseFeedbackKind = {}));
    var ChatMessageRole;
    (function (ChatMessageRole) {
        ChatMessageRole[ChatMessageRole["System"] = 0] = "System";
        ChatMessageRole[ChatMessageRole["User"] = 1] = "User";
        ChatMessageRole[ChatMessageRole["Assistant"] = 2] = "Assistant";
        ChatMessageRole[ChatMessageRole["Function"] = 3] = "Function";
    })(ChatMessageRole || (exports.ChatMessageRole = ChatMessageRole = {}));
    var ChatVariableLevel;
    (function (ChatVariableLevel) {
        ChatVariableLevel[ChatVariableLevel["Short"] = 1] = "Short";
        ChatVariableLevel[ChatVariableLevel["Medium"] = 2] = "Medium";
        ChatVariableLevel[ChatVariableLevel["Full"] = 3] = "Full";
    })(ChatVariableLevel || (exports.ChatVariableLevel = ChatVariableLevel = {}));
    class ChatMessage {
        constructor(role, content) {
            this.role = role;
            this.content = content;
        }
    }
    exports.ChatMessage = ChatMessage;
    //#endregion
    //#region ai
    var RelatedInformationType;
    (function (RelatedInformationType) {
        RelatedInformationType[RelatedInformationType["SymbolInformation"] = 1] = "SymbolInformation";
        RelatedInformationType[RelatedInformationType["CommandInformation"] = 2] = "CommandInformation";
        RelatedInformationType[RelatedInformationType["SearchInformation"] = 3] = "SearchInformation";
        RelatedInformationType[RelatedInformationType["SettingInformation"] = 4] = "SettingInformation";
    })(RelatedInformationType || (exports.RelatedInformationType = RelatedInformationType = {}));
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFR5cGVzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9jb21tb24vZXh0SG9zdFR5cGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7SUFxQmhHOzs7OztTQUtLO0lBQ0wsU0FBUyxjQUFjLENBQUMsTUFBZ0I7UUFDdkMsTUFBTSxrQkFBa0IsR0FBRztZQUMxQixLQUFLLEVBQUUsVUFBVSxHQUFHLElBQVc7Z0JBQzlCLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7b0JBQ3RCLE9BQU8sT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7aUJBQ3JDO3FCQUFNO29CQUNOLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDbEQsT0FBTyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2lCQUNoRTtZQUNGLENBQUM7WUFDRCxJQUFJLEVBQUUsVUFBVSxHQUFHLElBQVc7Z0JBQzdCLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7b0JBQ3RCLE9BQU8sT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7aUJBQ3JDO3FCQUFNO29CQUNOLE1BQU0sQ0FBQyxPQUFPLEVBQUUsR0FBRyxRQUFRLENBQUMsR0FBRyxJQUFJLENBQUM7b0JBQ3BDLE9BQU8sT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztpQkFDaEU7WUFDRixDQUFD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