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
    var $3J_1, $4J_1, $5J_1, $6J_1, $0J_1, $$J_1, $bK_1, $cK_1, $hK_1, $iK_1, $kK_1, $qK_1, $JK_1, $NK_1, $OK_1, $dL_1, $zL_1, $CL_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RelatedInformationType = exports.$QL = exports.ChatVariableLevel = exports.ChatMessageRole = exports.InteractiveEditorResponseFeedbackKind = exports.InteractiveSessionCopyKind = exports.InteractiveSessionVoteDirection = exports.$PL = exports.$OL = exports.$NL = exports.$ML = exports.$LL = exports.$KL = exports.$JL = exports.$IL = exports.$HL = exports.$GL = exports.PortAutoForwardAction = exports.WorkspaceTrustState = exports.ExternalUriOpenerPriority = exports.$FL = exports.$EL = exports.$DL = exports.$CL = exports.$BL = exports.$AL = exports.$zL = exports.$yL = exports.TestRunProfileKind = exports.TestResultState = exports.$xL = exports.$wL = exports.StandardTokenType = exports.ExtensionRuntime = exports.ExtensionMode = exports.$vL = exports.$uL = exports.$tL = exports.NotebookControllerAffinity2 = exports.NotebookControllerAffinity = exports.$sL = exports.NotebookEditorRevealType = exports.NotebookCellStatusBarAlignment = exports.NotebookCellExecutionState = exports.NotebookCellKind = exports.$rL = exports.$qL = exports.$pL = exports.$oL = exports.$nL = exports.ColorThemeKind = exports.$mL = exports.$lL = exports.ExtensionKind = exports.InputBoxValidationSeverity = exports.QuickPickItemKind = exports.$kL = exports.DebugConsoleMode = exports.$jL = exports.$iL = exports.$hL = exports.$gL = exports.$fL = exports.CommentThreadState = exports.CommentState = exports.CommentMode = exports.CommentThreadCollapsibleState = exports.FoldingRangeKind = exports.$eL = exports.$dL = exports.FileChangeType = exports.$cL = exports.$bL = exports.$aL = exports.$_K = exports.InlineCompletionTriggerKind = exports.$$K = exports.$0K = exports.$9K = exports.$8K = exports.$7K = exports.$6K = exports.$5K = exports.$4K = exports.$3K = exports.$2K = exports.$1K = exports.$ZK = exports.$YK = exports.ConfigurationTarget = exports.$XK = exports.$WK = exports.$VK = exports.$UK = exports.$TK = exports.$SK = exports.$RK = exports.$QK = exports.$PK = exports.TreeItemCheckboxState = exports.TreeItemCollapsibleState = exports.$OK = exports.ViewBadge = exports.ProgressLocation = exports.$NK = exports.$MK = exports.TaskScope = exports.ShellQuoting = exports.$LK = exports.$KK = exports.$JK = exports.TaskPanelKind = exports.TaskRevealKind = exports.$IK = exports.TerminalLocation = exports.$HK = exports.$GK = exports.$FK = exports.TerminalExitReason = exports.SourceControlInputBoxValidationType = exports.ColorFormat = exports.$EK = exports.$DK = exports.$CK = exports.$BK = exports.SyntaxTokenType = exports.DecorationRangeBehavior = exports.TextDocumentChangeReason = exports.TextEditorSelectionChangeKind = exports.TextEditorRevealType = exports.TextDocumentSaveReason = exports.TextEditorLineNumbersStyle = exports.$AK = exports.StatusBarAlignment = exports.ViewColumn = exports.$zK = exports.$yK = exports.$xK = exports.$wK = exports.CompletionItemTag = exports.CompletionItemKind = exports.CompletionTriggerKind = exports.$vK = exports.$uK = exports.InlayHintKind = exports.SignatureHelpTriggerKind = exports.$tK = exports.$sK = exports.$rK = exports.$qK = exports.$pK = exports.LanguageStatusSeverity = exports.$oK = exports.$nK = exports.$mK = exports.$lK = exports.$kK = exports.$jK = exports.CodeActionTriggerKind = exports.$iK = exports.$hK = exports.SymbolTag = exports.SymbolKind = exports.$gK = exports.DocumentHighlightKind = exports.$fK = exports.$eK = exports.$dK = exports.$cK = exports.DiagnosticSeverity = exports.DiagnosticTag = exports.$bK = exports.$aK = exports.FileEditType = exports.$_J = exports.$$J = exports.$0J = exports.EnvironmentVariableMutatorType = exports.EndOfLine = exports.$9J = exports.$8J = exports.$7J = exports.$6J = exports.$5J = exports.$4J = exports.$3J = exports.TerminalQuickFixType = exports.TerminalOutputAnchor = void 0;
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
    let $3J = $3J_1 = class $3J {
        static from(...inDisposables) {
            let disposables = inDisposables;
            return new $3J_1(function () {
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
    exports.$3J = $3J;
    exports.$3J = $3J = $3J_1 = __decorate([
        es5ClassCompat
    ], $3J);
    let $4J = $4J_1 = class $4J {
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
            if (other instanceof $4J_1) {
                return true;
            }
            const { line, character } = other;
            if (typeof line === 'number' && typeof character === 'number') {
                return true;
            }
            return false;
        }
        static of(obj) {
            if (obj instanceof $4J_1) {
                return obj;
            }
            else if (this.isPosition(obj)) {
                return new $4J_1(obj.line, obj.character);
            }
            throw new Error('Invalid argument, is NOT a position-like object');
        }
        get line() {
            return this.c;
        }
        get character() {
            return this.e;
        }
        constructor(line, character) {
            if (line < 0) {
                throw (0, errors_1.$5)('line must be non-negative');
            }
            if (character < 0) {
                throw (0, errors_1.$5)('character must be non-negative');
            }
            this.c = line;
            this.e = character;
        }
        isBefore(other) {
            if (this.c < other.c) {
                return true;
            }
            if (other.c < this.c) {
                return false;
            }
            return this.e < other.e;
        }
        isBeforeOrEqual(other) {
            if (this.c < other.c) {
                return true;
            }
            if (other.c < this.c) {
                return false;
            }
            return this.e <= other.e;
        }
        isAfter(other) {
            return !this.isBeforeOrEqual(other);
        }
        isAfterOrEqual(other) {
            return !this.isBefore(other);
        }
        isEqual(other) {
            return this.c === other.c && this.e === other.e;
        }
        compareTo(other) {
            if (this.c < other.c) {
                return -1;
            }
            else if (this.c > other.line) {
                return 1;
            }
            else {
                // equal line
                if (this.e < other.e) {
                    return -1;
                }
                else if (this.e > other.e) {
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
                throw (0, errors_1.$5)();
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
            return new $4J_1(this.line + lineDelta, this.character + characterDelta);
        }
        with(lineOrChange, character = this.character) {
            if (lineOrChange === null || character === null) {
                throw (0, errors_1.$5)();
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
            return new $4J_1(line, character);
        }
        toJSON() {
            return { line: this.line, character: this.character };
        }
    };
    exports.$4J = $4J;
    exports.$4J = $4J = $4J_1 = __decorate([
        es5ClassCompat
    ], $4J);
    let $5J = $5J_1 = class $5J {
        static isRange(thing) {
            if (thing instanceof $5J_1) {
                return true;
            }
            if (!thing) {
                return false;
            }
            return $4J.isPosition(thing.start)
                && $4J.isPosition(thing.end);
        }
        static of(obj) {
            if (obj instanceof $5J_1) {
                return obj;
            }
            if (this.isRange(obj)) {
                return new $5J_1(obj.start, obj.end);
            }
            throw new Error('Invalid argument, is NOT a range-like object');
        }
        get start() {
            return this.c;
        }
        get end() {
            return this.e;
        }
        constructor(startLineOrStart, startColumnOrEnd, endLine, endColumn) {
            let start;
            let end;
            if (typeof startLineOrStart === 'number' && typeof startColumnOrEnd === 'number' && typeof endLine === 'number' && typeof endColumn === 'number') {
                start = new $4J(startLineOrStart, startColumnOrEnd);
                end = new $4J(endLine, endColumn);
            }
            else if ($4J.isPosition(startLineOrStart) && $4J.isPosition(startColumnOrEnd)) {
                start = $4J.of(startLineOrStart);
                end = $4J.of(startColumnOrEnd);
            }
            if (!start || !end) {
                throw new Error('Invalid arguments');
            }
            if (start.isBefore(end)) {
                this.c = start;
                this.e = end;
            }
            else {
                this.c = end;
                this.e = start;
            }
        }
        contains(positionOrRange) {
            if ($5J_1.isRange(positionOrRange)) {
                return this.contains(positionOrRange.start)
                    && this.contains(positionOrRange.end);
            }
            else if ($4J.isPosition(positionOrRange)) {
                if ($4J.of(positionOrRange).isBefore(this.c)) {
                    return false;
                }
                if (this.e.isBefore(positionOrRange)) {
                    return false;
                }
                return true;
            }
            return false;
        }
        isEqual(other) {
            return this.c.isEqual(other.c) && this.e.isEqual(other.e);
        }
        intersection(other) {
            const start = $4J.Max(other.start, this.c);
            const end = $4J.Min(other.end, this.e);
            if (start.isAfter(end)) {
                // this happens when there is no overlap:
                // |-----|
                //          |----|
                return undefined;
            }
            return new $5J_1(start, end);
        }
        union(other) {
            if (this.contains(other)) {
                return this;
            }
            else if (other.contains(this)) {
                return other;
            }
            const start = $4J.Min(other.start, this.c);
            const end = $4J.Max(other.end, this.end);
            return new $5J_1(start, end);
        }
        get isEmpty() {
            return this.c.isEqual(this.e);
        }
        get isSingleLine() {
            return this.c.line === this.e.line;
        }
        with(startOrChange, end = this.end) {
            if (startOrChange === null || end === null) {
                throw (0, errors_1.$5)();
            }
            let start;
            if (!startOrChange) {
                start = this.start;
            }
            else if ($4J.isPosition(startOrChange)) {
                start = startOrChange;
            }
            else {
                start = startOrChange.start || this.start;
                end = startOrChange.end || this.end;
            }
            if (start.isEqual(this.c) && end.isEqual(this.end)) {
                return this;
            }
            return new $5J_1(start, end);
        }
        toJSON() {
            return [this.start, this.end];
        }
    };
    exports.$5J = $5J;
    exports.$5J = $5J = $5J_1 = __decorate([
        es5ClassCompat
    ], $5J);
    let $6J = $6J_1 = class $6J extends $5J {
        static isSelection(thing) {
            if (thing instanceof $6J_1) {
                return true;
            }
            if (!thing) {
                return false;
            }
            return $5J.isRange(thing)
                && $4J.isPosition(thing.anchor)
                && $4J.isPosition(thing.active)
                && typeof thing.isReversed === 'boolean';
        }
        get anchor() {
            return this.f;
        }
        get active() {
            return this.g;
        }
        constructor(anchorLineOrAnchor, anchorColumnOrActive, activeLine, activeColumn) {
            let anchor;
            let active;
            if (typeof anchorLineOrAnchor === 'number' && typeof anchorColumnOrActive === 'number' && typeof activeLine === 'number' && typeof activeColumn === 'number') {
                anchor = new $4J(anchorLineOrAnchor, anchorColumnOrActive);
                active = new $4J(activeLine, activeColumn);
            }
            else if ($4J.isPosition(anchorLineOrAnchor) && $4J.isPosition(anchorColumnOrActive)) {
                anchor = $4J.of(anchorLineOrAnchor);
                active = $4J.of(anchorColumnOrActive);
            }
            if (!anchor || !active) {
                throw new Error('Invalid arguments');
            }
            super(anchor, active);
            this.f = anchor;
            this.g = active;
        }
        get isReversed() {
            return this.f === this.e;
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
    exports.$6J = $6J;
    exports.$6J = $6J = $6J_1 = __decorate([
        es5ClassCompat
    ], $6J);
    const validateConnectionToken = (connectionToken) => {
        if (typeof connectionToken !== 'string' || connectionToken.length === 0 || !/^[0-9A-Za-z_\-]+$/.test(connectionToken)) {
            throw (0, errors_1.$5)('connectionToken');
        }
    };
    class $7J {
        static isResolvedAuthority(resolvedAuthority) {
            return resolvedAuthority
                && typeof resolvedAuthority === 'object'
                && typeof resolvedAuthority.host === 'string'
                && typeof resolvedAuthority.port === 'number'
                && (resolvedAuthority.connectionToken === undefined || typeof resolvedAuthority.connectionToken === 'string');
        }
        constructor(host, port, connectionToken) {
            if (typeof host !== 'string' || host.length === 0) {
                throw (0, errors_1.$5)('host');
            }
            if (typeof port !== 'number' || port === 0 || Math.round(port) !== port) {
                throw (0, errors_1.$5)('port');
            }
            if (typeof connectionToken !== 'undefined') {
                validateConnectionToken(connectionToken);
            }
            this.host = host;
            this.port = Math.round(port);
            this.connectionToken = connectionToken;
        }
    }
    exports.$7J = $7J;
    class $8J {
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
    exports.$8J = $8J;
    class $9J extends Error {
        static NotAvailable(message, handled) {
            return new $9J(message, remoteAuthorityResolver_1.RemoteAuthorityResolverErrorCode.NotAvailable, handled);
        }
        static TemporarilyNotAvailable(message) {
            return new $9J(message, remoteAuthorityResolver_1.RemoteAuthorityResolverErrorCode.TemporarilyNotAvailable);
        }
        constructor(message, code = remoteAuthorityResolver_1.RemoteAuthorityResolverErrorCode.Unknown, detail) {
            super(message);
            this._message = message;
            this._code = code;
            this._detail = detail;
            // workaround when extending builtin objects and when compiling to ES5, see:
            // https://github.com/microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
            Object.setPrototypeOf(this, $9J.prototype);
        }
    }
    exports.$9J = $9J;
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
    let $0J = $0J_1 = class $0J {
        static isTextEdit(thing) {
            if (thing instanceof $0J_1) {
                return true;
            }
            if (!thing) {
                return false;
            }
            return $5J.isRange(thing)
                && typeof thing.newText === 'string';
        }
        static replace(range, newText) {
            return new $0J_1(range, newText);
        }
        static insert(position, newText) {
            return $0J_1.replace(new $5J(position, position), newText);
        }
        static delete(range) {
            return $0J_1.replace(range, '');
        }
        static setEndOfLine(eol) {
            const ret = new $0J_1(new $5J(new $4J(0, 0), new $4J(0, 0)), '');
            ret.newEol = eol;
            return ret;
        }
        get range() {
            return this.c;
        }
        set range(value) {
            if (value && !$5J.isRange(value)) {
                throw (0, errors_1.$5)('range');
            }
            this.c = value;
        }
        get newText() {
            return this.e || '';
        }
        set newText(value) {
            if (value && typeof value !== 'string') {
                throw (0, errors_1.$5)('newText');
            }
            this.e = value;
        }
        get newEol() {
            return this.f;
        }
        set newEol(value) {
            if (value && typeof value !== 'number') {
                throw (0, errors_1.$5)('newEol');
            }
            this.f = value;
        }
        constructor(range, newText) {
            this.c = range;
            this.e = newText;
        }
        toJSON() {
            return {
                range: this.range,
                newText: this.newText,
                newEol: this.f
            };
        }
    };
    exports.$0J = $0J;
    exports.$0J = $0J = $0J_1 = __decorate([
        es5ClassCompat
    ], $0J);
    let $$J = $$J_1 = class $$J {
        static isNotebookCellEdit(thing) {
            if (thing instanceof $$J_1) {
                return true;
            }
            if (!thing) {
                return false;
            }
            return $nL.isNotebookRange(thing)
                && Array.isArray(thing.newCells);
        }
        static replaceCells(range, newCells) {
            return new $$J_1(range, newCells);
        }
        static insertCells(index, newCells) {
            return new $$J_1(new $nL(index, index), newCells);
        }
        static deleteCells(range) {
            return new $$J_1(range, []);
        }
        static updateCellMetadata(index, newMetadata) {
            const edit = new $$J_1(new $nL(index, index), []);
            edit.newCellMetadata = newMetadata;
            return edit;
        }
        static updateNotebookMetadata(newMetadata) {
            const edit = new $$J_1(new $nL(0, 0), []);
            edit.newNotebookMetadata = newMetadata;
            return edit;
        }
        constructor(range, newCells) {
            this.range = range;
            this.newCells = newCells;
        }
    };
    exports.$$J = $$J;
    exports.$$J = $$J = $$J_1 = __decorate([
        es5ClassCompat
    ], $$J);
    class $_J {
        static isSnippetTextEdit(thing) {
            if (thing instanceof $_J) {
                return true;
            }
            if (!thing) {
                return false;
            }
            return $5J.isRange(thing.range)
                && $bK.isSnippetString(thing.snippet);
        }
        static replace(range, snippet) {
            return new $_J(range, snippet);
        }
        static insert(position, snippet) {
            return $_J.replace(new $5J(position, position), snippet);
        }
        constructor(range, snippet) {
            this.range = range;
            this.snippet = snippet;
        }
    }
    exports.$_J = $_J;
    var FileEditType;
    (function (FileEditType) {
        FileEditType[FileEditType["File"] = 1] = "File";
        FileEditType[FileEditType["Text"] = 2] = "Text";
        FileEditType[FileEditType["Cell"] = 3] = "Cell";
        FileEditType[FileEditType["CellReplace"] = 5] = "CellReplace";
        FileEditType[FileEditType["Snippet"] = 6] = "Snippet";
    })(FileEditType || (exports.FileEditType = FileEditType = {}));
    let $aK = class $aK {
        constructor() {
            this.c = [];
        }
        _allEntries() {
            return this.c;
        }
        // --- file
        renameFile(from, to, options, metadata) {
            this.c.push({ _type: 1 /* FileEditType.File */, from, to, options, metadata });
        }
        createFile(uri, options, metadata) {
            this.c.push({ _type: 1 /* FileEditType.File */, from: undefined, to: uri, options, metadata });
        }
        deleteFile(uri, options, metadata) {
            this.c.push({ _type: 1 /* FileEditType.File */, from: uri, to: undefined, options, metadata });
        }
        // --- notebook
        e(uri, value, metadata) {
            this.c.push({ _type: 3 /* FileEditType.Cell */, metadata, uri, edit: { editType: 5 /* CellEditType.DocumentMetadata */, metadata: value }, notebookMetadata: value });
        }
        f(uri, startOrRange, cellData, metadata) {
            const start = startOrRange.start;
            const end = startOrRange.end;
            if (start !== end || cellData.length > 0) {
                this.c.push({ _type: 5 /* FileEditType.CellReplace */, uri, index: start, count: end - start, cells: cellData, metadata });
            }
        }
        g(uri, index, cellMetadata, metadata) {
            this.c.push({ _type: 3 /* FileEditType.Cell */, metadata, uri, edit: { editType: 3 /* CellEditType.Metadata */, index, metadata: cellMetadata } });
        }
        // --- text
        replace(uri, range, newText, metadata) {
            this.c.push({ _type: 2 /* FileEditType.Text */, uri, edit: new $0J(range, newText), metadata });
        }
        insert(resource, position, newText, metadata) {
            this.replace(resource, new $5J(position, position), newText, metadata);
        }
        delete(resource, range, metadata) {
            this.replace(resource, range, '', metadata);
        }
        // --- text (Maplike)
        has(uri) {
            return this.c.some(edit => edit._type === 2 /* FileEditType.Text */ && edit.uri.toString() === uri.toString());
        }
        set(uri, edits) {
            if (!edits) {
                // remove all text, snippet, or notebook edits for `uri`
                for (let i = 0; i < this.c.length; i++) {
                    const element = this.c[i];
                    switch (element._type) {
                        case 2 /* FileEditType.Text */:
                        case 6 /* FileEditType.Snippet */:
                        case 3 /* FileEditType.Cell */:
                        case 5 /* FileEditType.CellReplace */:
                            if (element.uri.toString() === uri.toString()) {
                                this.c[i] = undefined; // will be coalesced down below
                            }
                            break;
                    }
                }
                (0, arrays_1.$Gb)(this.c);
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
                    if ($$J.isNotebookCellEdit(edit)) {
                        if (edit.newCellMetadata) {
                            this.g(uri, edit.range.start, edit.newCellMetadata, metadata);
                        }
                        else if (edit.newNotebookMetadata) {
                            this.e(uri, edit.newNotebookMetadata, metadata);
                        }
                        else {
                            this.f(uri, edit.range, edit.newCells, metadata);
                        }
                    }
                    else if ($_J.isSnippetTextEdit(edit)) {
                        this.c.push({ _type: 6 /* FileEditType.Snippet */, uri, range: edit.range, edit: edit.snippet, metadata });
                    }
                    else {
                        this.c.push({ _type: 2 /* FileEditType.Text */, uri, edit, metadata });
                    }
                }
            }
        }
        get(uri) {
            const res = [];
            for (const candidate of this.c) {
                if (candidate._type === 2 /* FileEditType.Text */ && candidate.uri.toString() === uri.toString()) {
                    res.push(candidate.edit);
                }
            }
            return res;
        }
        entries() {
            const textEdits = new map_1.$zi();
            for (const candidate of this.c) {
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
    exports.$aK = $aK;
    exports.$aK = $aK = __decorate([
        es5ClassCompat
    ], $aK);
    let $bK = $bK_1 = class $bK {
        static isSnippetString(thing) {
            if (thing instanceof $bK_1) {
                return true;
            }
            if (!thing) {
                return false;
            }
            return typeof thing.value === 'string';
        }
        static c(value) {
            return value.replace(/\$|}|\\/g, '\\$&');
        }
        constructor(value) {
            this.e = 1;
            this.value = value || '';
        }
        appendText(string) {
            this.value += $bK_1.c(string);
            return this;
        }
        appendTabstop(number = this.e++) {
            this.value += '$';
            this.value += number;
            return this;
        }
        appendPlaceholder(value, number = this.e++) {
            if (typeof value === 'function') {
                const nested = new $bK_1();
                nested.e = this.e;
                value(nested);
                this.e = nested.e;
                value = nested.value;
            }
            else {
                value = $bK_1.c(value);
            }
            this.value += '${';
            this.value += number;
            this.value += ':';
            this.value += value;
            this.value += '}';
            return this;
        }
        appendChoice(values, number = this.e++) {
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
                const nested = new $bK_1();
                nested.e = this.e;
                defaultValue(nested);
                this.e = nested.e;
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
    exports.$bK = $bK;
    exports.$bK = $bK = $bK_1 = __decorate([
        es5ClassCompat
    ], $bK);
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
    let $cK = $cK_1 = class $cK {
        static isLocation(thing) {
            if (thing instanceof $cK_1) {
                return true;
            }
            if (!thing) {
                return false;
            }
            return $5J.isRange(thing.range)
                && uri_1.URI.isUri(thing.uri);
        }
        constructor(uri, rangeOrPosition) {
            this.uri = uri;
            if (!rangeOrPosition) {
                //that's OK
            }
            else if ($5J.isRange(rangeOrPosition)) {
                this.range = $5J.of(rangeOrPosition);
            }
            else if ($4J.isPosition(rangeOrPosition)) {
                this.range = new $5J(rangeOrPosition, rangeOrPosition);
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
    exports.$cK = $cK;
    exports.$cK = $cK = $cK_1 = __decorate([
        es5ClassCompat
    ], $cK);
    let $dK = class $dK {
        static is(thing) {
            if (!thing) {
                return false;
            }
            return typeof thing.message === 'string'
                && thing.location
                && $5J.isRange(thing.location.range)
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
    exports.$dK = $dK;
    exports.$dK = $dK = __decorate([
        es5ClassCompat
    ], $dK);
    let $eK = class $eK {
        constructor(range, message, severity = DiagnosticSeverity.Error) {
            if (!$5J.isRange(range)) {
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
                && (0, arrays_1.$sb)(a.tags, b.tags)
                && (0, arrays_1.$sb)(a.relatedInformation, b.relatedInformation, $dK.isEqual);
        }
    };
    exports.$eK = $eK;
    exports.$eK = $eK = __decorate([
        es5ClassCompat
    ], $eK);
    let $fK = class $fK {
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
    exports.$fK = $fK;
    exports.$fK = $fK = __decorate([
        es5ClassCompat
    ], $fK);
    var DocumentHighlightKind;
    (function (DocumentHighlightKind) {
        DocumentHighlightKind[DocumentHighlightKind["Text"] = 0] = "Text";
        DocumentHighlightKind[DocumentHighlightKind["Read"] = 1] = "Read";
        DocumentHighlightKind[DocumentHighlightKind["Write"] = 2] = "Write";
    })(DocumentHighlightKind || (exports.DocumentHighlightKind = DocumentHighlightKind = {}));
    let $gK = class $gK {
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
    exports.$gK = $gK;
    exports.$gK = $gK = __decorate([
        es5ClassCompat
    ], $gK);
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
    let $hK = $hK_1 = class $hK {
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
            if (locationOrUri instanceof $cK) {
                this.location = locationOrUri;
            }
            else if (rangeOrContainer instanceof $5J) {
                this.location = new $cK(locationOrUri, rangeOrContainer);
            }
            $hK_1.validate(this);
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
    exports.$hK = $hK;
    exports.$hK = $hK = $hK_1 = __decorate([
        es5ClassCompat
    ], $hK);
    let $iK = $iK_1 = class $iK {
        static validate(candidate) {
            if (!candidate.name) {
                throw new Error('name must not be falsy');
            }
            if (!candidate.range.contains(candidate.selectionRange)) {
                throw new Error('selectionRange must be contained in fullRange');
            }
            candidate.children?.forEach($iK_1.validate);
        }
        constructor(name, detail, kind, range, selectionRange) {
            this.name = name;
            this.detail = detail;
            this.kind = kind;
            this.range = range;
            this.selectionRange = selectionRange;
            this.children = [];
            $iK_1.validate(this);
        }
    };
    exports.$iK = $iK;
    exports.$iK = $iK = $iK_1 = __decorate([
        es5ClassCompat
    ], $iK);
    var CodeActionTriggerKind;
    (function (CodeActionTriggerKind) {
        CodeActionTriggerKind[CodeActionTriggerKind["Invoke"] = 1] = "Invoke";
        CodeActionTriggerKind[CodeActionTriggerKind["Automatic"] = 2] = "Automatic";
    })(CodeActionTriggerKind || (exports.CodeActionTriggerKind = CodeActionTriggerKind = {}));
    let $jK = class $jK {
        constructor(title, kind) {
            this.title = title;
            this.kind = kind;
        }
    };
    exports.$jK = $jK;
    exports.$jK = $jK = __decorate([
        es5ClassCompat
    ], $jK);
    let $kK = class $kK {
        static { $kK_1 = this; }
        static { this.c = '.'; }
        constructor(value) {
            this.value = value;
        }
        append(parts) {
            return new $kK_1(this.value ? this.value + $kK_1.c + parts : parts);
        }
        intersects(other) {
            return this.contains(other) || other.contains(this);
        }
        contains(other) {
            return this.value === other.value || other.value.startsWith(this.value + $kK_1.c);
        }
    };
    exports.$kK = $kK;
    exports.$kK = $kK = $kK_1 = __decorate([
        es5ClassCompat
    ], $kK);
    $kK.Empty = new $kK('');
    $kK.QuickFix = $kK.Empty.append('quickfix');
    $kK.Refactor = $kK.Empty.append('refactor');
    $kK.RefactorExtract = $kK.Refactor.append('extract');
    $kK.RefactorInline = $kK.Refactor.append('inline');
    $kK.RefactorMove = $kK.Refactor.append('move');
    $kK.RefactorRewrite = $kK.Refactor.append('rewrite');
    $kK.Source = $kK.Empty.append('source');
    $kK.SourceOrganizeImports = $kK.Source.append('organizeImports');
    $kK.SourceFixAll = $kK.Source.append('fixAll');
    $kK.Notebook = $kK.Empty.append('notebook');
    let $lK = class $lK {
        constructor(range, parent) {
            this.range = range;
            this.parent = parent;
            if (parent && !parent.range.contains(this.range)) {
                throw new Error('Invalid argument: parent must contain this range');
            }
        }
    };
    exports.$lK = $lK;
    exports.$lK = $lK = __decorate([
        es5ClassCompat
    ], $lK);
    class $mK {
        constructor(kind, name, detail, uri, range, selectionRange) {
            this.kind = kind;
            this.name = name;
            this.detail = detail;
            this.uri = uri;
            this.range = range;
            this.selectionRange = selectionRange;
        }
    }
    exports.$mK = $mK;
    class $nK {
        constructor(item, fromRanges) {
            this.fromRanges = fromRanges;
            this.from = item;
        }
    }
    exports.$nK = $nK;
    class $oK {
        constructor(item, fromRanges) {
            this.fromRanges = fromRanges;
            this.to = item;
        }
    }
    exports.$oK = $oK;
    var LanguageStatusSeverity;
    (function (LanguageStatusSeverity) {
        LanguageStatusSeverity[LanguageStatusSeverity["Information"] = 0] = "Information";
        LanguageStatusSeverity[LanguageStatusSeverity["Warning"] = 1] = "Warning";
        LanguageStatusSeverity[LanguageStatusSeverity["Error"] = 2] = "Error";
    })(LanguageStatusSeverity || (exports.LanguageStatusSeverity = LanguageStatusSeverity = {}));
    let $pK = class $pK {
        constructor(range, command) {
            this.range = range;
            this.command = command;
        }
        get isResolved() {
            return !!this.command;
        }
    };
    exports.$pK = $pK;
    exports.$pK = $pK = __decorate([
        es5ClassCompat
    ], $pK);
    let $qK = $qK_1 = class $qK {
        #delegate;
        static isMarkdownString(thing) {
            if (thing instanceof $qK_1) {
                return true;
            }
            return thing && thing.appendCodeblock && thing.appendMarkdown && thing.appendText && (thing.value !== undefined);
        }
        constructor(value, supportThemeIcons = false) {
            this.#delegate = new htmlContent_1.$Xj(value, { supportThemeIcons });
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
    exports.$qK = $qK;
    exports.$qK = $qK = $qK_1 = __decorate([
        es5ClassCompat
    ], $qK);
    let $rK = class $rK {
        constructor(label, documentation) {
            this.label = label;
            this.documentation = documentation;
        }
    };
    exports.$rK = $rK;
    exports.$rK = $rK = __decorate([
        es5ClassCompat
    ], $rK);
    let $sK = class $sK {
        constructor(label, documentation) {
            this.label = label;
            this.documentation = documentation;
            this.parameters = [];
        }
    };
    exports.$sK = $sK;
    exports.$sK = $sK = __decorate([
        es5ClassCompat
    ], $sK);
    let $tK = class $tK {
        constructor() {
            this.activeSignature = 0;
            this.activeParameter = 0;
            this.signatures = [];
        }
    };
    exports.$tK = $tK;
    exports.$tK = $tK = __decorate([
        es5ClassCompat
    ], $tK);
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
    let $uK = class $uK {
        constructor(value) {
            this.value = value;
        }
    };
    exports.$uK = $uK;
    exports.$uK = $uK = __decorate([
        es5ClassCompat
    ], $uK);
    let $vK = class $vK {
        constructor(position, label, kind) {
            this.position = position;
            this.label = label;
            this.kind = kind;
        }
    };
    exports.$vK = $vK;
    exports.$vK = $vK = __decorate([
        es5ClassCompat
    ], $vK);
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
    let $wK = class $wK {
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
    exports.$wK = $wK;
    exports.$wK = $wK = __decorate([
        es5ClassCompat
    ], $wK);
    let $xK = class $xK {
        constructor(items = [], isIncomplete = false) {
            this.items = items;
            this.isIncomplete = isIncomplete;
        }
    };
    exports.$xK = $xK;
    exports.$xK = $xK = __decorate([
        es5ClassCompat
    ], $xK);
    let $yK = class $yK {
        constructor(insertText, range, command) {
            this.insertText = insertText;
            this.range = range;
            this.command = command;
        }
    };
    exports.$yK = $yK;
    exports.$yK = $yK = __decorate([
        es5ClassCompat
    ], $yK);
    let $zK = class $zK {
        constructor(items) {
            this.commands = undefined;
            this.suppressSuggestions = undefined;
            this.items = items;
        }
    };
    exports.$zK = $zK;
    exports.$zK = $zK = __decorate([
        es5ClassCompat
    ], $zK);
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
    function $AK(extension, id) {
        return `${extensions_1.$Vl.toKey(extension)}.${id}`;
    }
    exports.$AK = $AK;
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
    let $BK = class $BK {
        constructor(range, target) {
            if (target && !(uri_1.URI.isUri(target))) {
                throw (0, errors_1.$5)('target');
            }
            if (!$5J.isRange(range) || range.isEmpty) {
                throw (0, errors_1.$5)('range');
            }
            this.range = range;
            this.target = target;
        }
    };
    exports.$BK = $BK;
    exports.$BK = $BK = __decorate([
        es5ClassCompat
    ], $BK);
    let $CK = class $CK {
        constructor(red, green, blue, alpha) {
            this.red = red;
            this.green = green;
            this.blue = blue;
            this.alpha = alpha;
        }
    };
    exports.$CK = $CK;
    exports.$CK = $CK = __decorate([
        es5ClassCompat
    ], $CK);
    let $DK = class $DK {
        constructor(range, color) {
            if (color && !(color instanceof $CK)) {
                throw (0, errors_1.$5)('color');
            }
            if (!$5J.isRange(range) || range.isEmpty) {
                throw (0, errors_1.$5)('range');
            }
            this.range = range;
            this.color = color;
        }
    };
    exports.$DK = $DK;
    exports.$DK = $DK = __decorate([
        es5ClassCompat
    ], $DK);
    let $EK = class $EK {
        constructor(label) {
            if (!label || typeof label !== 'string') {
                throw (0, errors_1.$5)('label');
            }
            this.label = label;
        }
    };
    exports.$EK = $EK;
    exports.$EK = $EK = __decorate([
        es5ClassCompat
    ], $EK);
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
    class $FK {
        constructor(startIndex, length, tooltip) {
            this.startIndex = startIndex;
            this.length = length;
            this.tooltip = tooltip;
            if (typeof startIndex !== 'number' || startIndex < 0) {
                throw (0, errors_1.$5)('startIndex');
            }
            if (typeof length !== 'number' || length < 1) {
                throw (0, errors_1.$5)('length');
            }
            if (tooltip !== undefined && typeof tooltip !== 'string') {
                throw (0, errors_1.$5)('tooltip');
            }
        }
    }
    exports.$FK = $FK;
    class $GK {
        constructor(uri) {
            this.uri = uri;
        }
    }
    exports.$GK = $GK;
    class $HK {
        constructor(terminalCommand) {
            this.terminalCommand = terminalCommand;
        }
    }
    exports.$HK = $HK;
    var TerminalLocation;
    (function (TerminalLocation) {
        TerminalLocation[TerminalLocation["Panel"] = 1] = "Panel";
        TerminalLocation[TerminalLocation["Editor"] = 2] = "Editor";
    })(TerminalLocation || (exports.TerminalLocation = TerminalLocation = {}));
    class $IK {
        constructor(options) {
            this.options = options;
            if (typeof options !== 'object') {
                throw (0, errors_1.$5)('options');
            }
        }
    }
    exports.$IK = $IK;
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
    let $JK = class $JK {
        static { $JK_1 = this; }
        static { this.Clean = new $JK_1('clean', 'Clean'); }
        static { this.Build = new $JK_1('build', 'Build'); }
        static { this.Rebuild = new $JK_1('rebuild', 'Rebuild'); }
        static { this.Test = new $JK_1('test', 'Test'); }
        static from(value) {
            switch (value) {
                case 'clean':
                    return $JK_1.Clean;
                case 'build':
                    return $JK_1.Build;
                case 'rebuild':
                    return $JK_1.Rebuild;
                case 'test':
                    return $JK_1.Test;
                default:
                    return undefined;
            }
        }
        constructor(id, label) {
            this.label = label;
            if (typeof id !== 'string') {
                throw (0, errors_1.$5)('name');
            }
            if (typeof label !== 'string') {
                throw (0, errors_1.$5)('name');
            }
            this.c = id;
        }
        get id() {
            return this.c;
        }
    };
    exports.$JK = $JK;
    exports.$JK = $JK = $JK_1 = __decorate([
        es5ClassCompat
    ], $JK);
    function computeTaskExecutionId(values) {
        let id = '';
        for (let i = 0; i < values.length; i++) {
            id += values[i].replace(/,/g, ',,') + ',';
        }
        return id;
    }
    let $KK = class $KK {
        constructor(process, varg1, varg2) {
            if (typeof process !== 'string') {
                throw (0, errors_1.$5)('process');
            }
            this.e = [];
            this.c = process;
            if (varg1 !== undefined) {
                if (Array.isArray(varg1)) {
                    this.e = varg1;
                    this.f = varg2;
                }
                else {
                    this.f = varg1;
                }
            }
        }
        get process() {
            return this.c;
        }
        set process(value) {
            if (typeof value !== 'string') {
                throw (0, errors_1.$5)('process');
            }
            this.c = value;
        }
        get args() {
            return this.e;
        }
        set args(value) {
            if (!Array.isArray(value)) {
                value = [];
            }
            this.e = value;
        }
        get options() {
            return this.f;
        }
        set options(value) {
            this.f = value;
        }
        computeId() {
            const props = [];
            props.push('process');
            if (this.c !== undefined) {
                props.push(this.c);
            }
            if (this.e && this.e.length > 0) {
                for (const arg of this.e) {
                    props.push(arg);
                }
            }
            return computeTaskExecutionId(props);
        }
    };
    exports.$KK = $KK;
    exports.$KK = $KK = __decorate([
        es5ClassCompat
    ], $KK);
    let $LK = class $LK {
        constructor(arg0, arg1, arg2) {
            this.f = [];
            if (Array.isArray(arg1)) {
                if (!arg0) {
                    throw (0, errors_1.$5)('command can\'t be undefined or null');
                }
                if (typeof arg0 !== 'string' && typeof arg0.value !== 'string') {
                    throw (0, errors_1.$5)('command');
                }
                this.e = arg0;
                this.f = arg1;
                this.g = arg2;
            }
            else {
                if (typeof arg0 !== 'string') {
                    throw (0, errors_1.$5)('commandLine');
                }
                this.c = arg0;
                this.g = arg1;
            }
        }
        get commandLine() {
            return this.c;
        }
        set commandLine(value) {
            if (typeof value !== 'string') {
                throw (0, errors_1.$5)('commandLine');
            }
            this.c = value;
        }
        get command() {
            return this.e ? this.e : '';
        }
        set command(value) {
            if (typeof value !== 'string' && typeof value.value !== 'string') {
                throw (0, errors_1.$5)('command');
            }
            this.e = value;
        }
        get args() {
            return this.f;
        }
        set args(value) {
            this.f = value || [];
        }
        get options() {
            return this.g;
        }
        set options(value) {
            this.g = value;
        }
        computeId() {
            const props = [];
            props.push('shell');
            if (this.c !== undefined) {
                props.push(this.c);
            }
            if (this.e !== undefined) {
                props.push(typeof this.e === 'string' ? this.e : this.e.value);
            }
            if (this.f && this.f.length > 0) {
                for (const arg of this.f) {
                    props.push(typeof arg === 'string' ? arg : arg.value);
                }
            }
            return computeTaskExecutionId(props);
        }
    };
    exports.$LK = $LK;
    exports.$LK = $LK = __decorate([
        es5ClassCompat
    ], $LK);
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
    class $MK {
        constructor(callback) {
            this.c = callback;
        }
        computeId() {
            return 'customExecution' + (0, uuid_1.$4f)();
        }
        set callback(value) {
            this.c = value;
        }
        get callback() {
            return this.c;
        }
    }
    exports.$MK = $MK;
    let $NK = class $NK {
        static { $NK_1 = this; }
        static { this.c = 'customExecution'; }
        static { this.e = 'process'; }
        static { this.f = 'shell'; }
        static { this.g = '$empty'; }
        constructor(definition, arg2, arg3, arg4, arg5, arg6) {
            this.j = false;
            this.k = this.definition = definition;
            let problemMatchers;
            if (typeof arg2 === 'string') {
                this.m = this.name = arg2;
                this.t = this.source = arg3;
                this.execution = arg4;
                problemMatchers = arg5;
                this.j = true;
            }
            else if (arg2 === TaskScope.Global || arg2 === TaskScope.Workspace) {
                this.target = arg2;
                this.m = this.name = arg3;
                this.t = this.source = arg4;
                this.execution = arg5;
                problemMatchers = arg6;
            }
            else {
                this.target = arg2;
                this.m = this.name = arg3;
                this.t = this.source = arg4;
                this.execution = arg5;
                problemMatchers = arg6;
            }
            if (typeof problemMatchers === 'string') {
                this.o = [problemMatchers];
                this.q = true;
            }
            else if (Array.isArray(problemMatchers)) {
                this.o = problemMatchers;
                this.q = true;
            }
            else {
                this.o = [];
                this.q = false;
            }
            this.r = false;
            this.w = Object.create(null);
            this.x = Object.create(null);
        }
        get _id() {
            return this.h;
        }
        set _id(value) {
            this.h = value;
        }
        get _deprecated() {
            return this.j;
        }
        z() {
            if (this.h === undefined) {
                return;
            }
            this.h = undefined;
            this.l = undefined;
            this.A();
        }
        A() {
            if (this.n instanceof $KK) {
                this.k = {
                    type: $NK_1.e,
                    id: this.n.computeId()
                };
            }
            else if (this.n instanceof $LK) {
                this.k = {
                    type: $NK_1.f,
                    id: this.n.computeId()
                };
            }
            else if (this.n instanceof $MK) {
                this.k = {
                    type: $NK_1.c,
                    id: this.n.computeId()
                };
            }
            else {
                this.k = {
                    type: $NK_1.g,
                    id: (0, uuid_1.$4f)()
                };
            }
        }
        get definition() {
            return this.k;
        }
        set definition(value) {
            if (value === undefined || value === null) {
                throw (0, errors_1.$5)('Kind can\'t be undefined or null');
            }
            this.z();
            this.k = value;
        }
        get scope() {
            return this.l;
        }
        set target(value) {
            this.z();
            this.l = value;
        }
        get name() {
            return this.m;
        }
        set name(value) {
            if (typeof value !== 'string') {
                throw (0, errors_1.$5)('name');
            }
            this.z();
            this.m = value;
        }
        get execution() {
            return this.n;
        }
        set execution(value) {
            if (value === null) {
                value = undefined;
            }
            this.z();
            this.n = value;
            const type = this.k.type;
            if ($NK_1.g === type || $NK_1.e === type || $NK_1.f === type || $NK_1.c === type) {
                this.A();
            }
        }
        get problemMatchers() {
            return this.o;
        }
        set problemMatchers(value) {
            if (!Array.isArray(value)) {
                this.z();
                this.o = [];
                this.q = false;
                return;
            }
            else {
                this.z();
                this.o = value;
                this.q = true;
            }
        }
        get hasDefinedMatchers() {
            return this.q;
        }
        get isBackground() {
            return this.r;
        }
        set isBackground(value) {
            if (value !== true && value !== false) {
                value = false;
            }
            this.z();
            this.r = value;
        }
        get source() {
            return this.t;
        }
        set source(value) {
            if (typeof value !== 'string' || value.length === 0) {
                throw (0, errors_1.$5)('source must be a string of length > 0');
            }
            this.z();
            this.t = value;
        }
        get group() {
            return this.u;
        }
        set group(value) {
            if (value === null) {
                value = undefined;
            }
            this.z();
            this.u = value;
        }
        get detail() {
            return this.y;
        }
        set detail(value) {
            if (value === null) {
                value = undefined;
            }
            this.y = value;
        }
        get presentationOptions() {
            return this.w;
        }
        set presentationOptions(value) {
            if (value === null || value === undefined) {
                value = Object.create(null);
            }
            this.z();
            this.w = value;
        }
        get runOptions() {
            return this.x;
        }
        set runOptions(value) {
            if (value === null || value === undefined) {
                value = Object.create(null);
            }
            this.z();
            this.x = value;
        }
    };
    exports.$NK = $NK;
    exports.$NK = $NK = $NK_1 = __decorate([
        es5ClassCompat
    ], $NK);
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
            if (!(0, types_1.$nf)(viewBadgeThing.value)) {
                console.log('INVALID view badge, invalid value', viewBadgeThing.value);
                return false;
            }
            if (viewBadgeThing.tooltip && !(0, types_1.$jf)(viewBadgeThing.tooltip)) {
                console.log('INVALID view badge, invalid tooltip', viewBadgeThing.tooltip);
                return false;
            }
            return true;
        }
        ViewBadge.isViewBadge = isViewBadge;
    })(ViewBadge || (exports.ViewBadge = ViewBadge = {}));
    let $OK = $OK_1 = class $OK {
        static isTreeItem(thing, extension) {
            const treeItemThing = thing;
            if (treeItemThing.checkboxState !== undefined) {
                const checkbox = (0, types_1.$nf)(treeItemThing.checkboxState) ? treeItemThing.checkboxState :
                    (0, types_1.$lf)(treeItemThing.checkboxState) && (0, types_1.$nf)(treeItemThing.checkboxState.state) ? treeItemThing.checkboxState.state : undefined;
                const tooltip = !(0, types_1.$nf)(treeItemThing.checkboxState) && (0, types_1.$lf)(treeItemThing.checkboxState) ? treeItemThing.checkboxState.tooltip : undefined;
                if (checkbox === undefined || (checkbox !== TreeItemCheckboxState.Checked && checkbox !== TreeItemCheckboxState.Unchecked) || (tooltip !== undefined && !(0, types_1.$jf)(tooltip))) {
                    console.log('INVALID tree item, invalid checkboxState', treeItemThing.checkboxState);
                    return false;
                }
            }
            if (thing instanceof $OK_1) {
                return true;
            }
            if (treeItemThing.label !== undefined && !(0, types_1.$jf)(treeItemThing.label) && !(treeItemThing.label?.label)) {
                console.log('INVALID tree item, invalid label', treeItemThing.label);
                return false;
            }
            if ((treeItemThing.id !== undefined) && !(0, types_1.$jf)(treeItemThing.id)) {
                console.log('INVALID tree item, invalid id', treeItemThing.id);
                return false;
            }
            if ((treeItemThing.iconPath !== undefined) && !(0, types_1.$jf)(treeItemThing.iconPath) && !uri_1.URI.isUri(treeItemThing.iconPath) && (!treeItemThing.iconPath || !(0, types_1.$jf)(treeItemThing.iconPath.id))) {
                const asLightAndDarkThing = treeItemThing.iconPath;
                if (!asLightAndDarkThing || (!(0, types_1.$jf)(asLightAndDarkThing.light) && !uri_1.URI.isUri(asLightAndDarkThing.light) && !(0, types_1.$jf)(asLightAndDarkThing.dark) && !uri_1.URI.isUri(asLightAndDarkThing.dark))) {
                    console.log('INVALID tree item, invalid iconPath', treeItemThing.iconPath);
                    return false;
                }
            }
            if ((treeItemThing.description !== undefined) && !(0, types_1.$jf)(treeItemThing.description) && (typeof treeItemThing.description !== 'boolean')) {
                console.log('INVALID tree item, invalid description', treeItemThing.description);
                return false;
            }
            if ((treeItemThing.resourceUri !== undefined) && !uri_1.URI.isUri(treeItemThing.resourceUri)) {
                console.log('INVALID tree item, invalid resourceUri', treeItemThing.resourceUri);
                return false;
            }
            if ((treeItemThing.tooltip !== undefined) && !(0, types_1.$jf)(treeItemThing.tooltip) && !(treeItemThing.tooltip instanceof $qK)) {
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
            if ((treeItemThing.contextValue !== undefined) && !(0, types_1.$jf)(treeItemThing.contextValue)) {
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
    exports.$OK = $OK;
    exports.$OK = $OK = $OK_1 = __decorate([
        es5ClassCompat
    ], $OK);
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
    let $PK = class $PK {
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
    exports.$PK = $PK;
    exports.$PK = $PK = __decorate([
        es5ClassCompat
    ], $PK);
    /**
     * A data transfer item that has been created by VS Code instead of by a extension.
     *
     * Intentionally not exported to extensions.
     */
    class $QK extends $PK {
    }
    exports.$QK = $QK;
    /**
     * A data transfer item for a file.
     *
     * Intentionally not exported to extensions as only we can create these.
     */
    class $RK extends $QK {
        #file;
        constructor(file) {
            super('');
            this.#file = file;
        }
        asFile() {
            return this.#file;
        }
    }
    exports.$RK = $RK;
    /**
     * Intentionally not exported to extensions
     */
    class $SK {
        constructor(name, uri, itemId, getData) {
            this.name = name;
            this.uri = uri;
            this._itemId = itemId;
            this.c = getData;
        }
        data() {
            return this.c();
        }
    }
    exports.$SK = $SK;
    let $TK = class $TK {
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
    exports.$TK = $TK;
    exports.$TK = $TK = __decorate([
        es5ClassCompat
    ], $TK);
    let $UK = class $UK {
        constructor(insertText) {
            this.insertText = insertText;
        }
    };
    exports.$UK = $UK;
    exports.$UK = $UK = __decorate([
        es5ClassCompat
    ], $UK);
    let $VK = class $VK {
        constructor(insertText, label) {
            this.label = label;
            this.insertText = insertText;
        }
    };
    exports.$VK = $VK;
    exports.$VK = $VK = __decorate([
        es5ClassCompat
    ], $VK);
    let $WK = class $WK {
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
    exports.$WK = $WK;
    exports.$WK = $WK = __decorate([
        es5ClassCompat
    ], $WK);
    $WK.File = new $WK('file');
    $WK.Folder = new $WK('folder');
    let $XK = class $XK {
        constructor(id) {
            this.id = id;
        }
    };
    exports.$XK = $XK;
    exports.$XK = $XK = __decorate([
        es5ClassCompat
    ], $XK);
    var ConfigurationTarget;
    (function (ConfigurationTarget) {
        ConfigurationTarget[ConfigurationTarget["Global"] = 1] = "Global";
        ConfigurationTarget[ConfigurationTarget["Workspace"] = 2] = "Workspace";
        ConfigurationTarget[ConfigurationTarget["WorkspaceFolder"] = 3] = "WorkspaceFolder";
    })(ConfigurationTarget || (exports.ConfigurationTarget = ConfigurationTarget = {}));
    let $YK = class $YK {
        get base() {
            return this.c;
        }
        set base(base) {
            this.c = base;
            this.e = uri_1.URI.file(base);
        }
        get baseUri() {
            return this.e;
        }
        set baseUri(baseUri) {
            this.e = baseUri;
            this.c = baseUri.fsPath;
        }
        constructor(base, pattern) {
            if (typeof base !== 'string') {
                if (!base || !uri_1.URI.isUri(base) && !uri_1.URI.isUri(base.uri)) {
                    throw (0, errors_1.$5)('base');
                }
            }
            if (typeof pattern !== 'string') {
                throw (0, errors_1.$5)('pattern');
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
    exports.$YK = $YK;
    exports.$YK = $YK = __decorate([
        es5ClassCompat
    ], $YK);
    const breakpointIds = new WeakMap();
    /**
     * We want to be able to construct Breakpoints internally that have a particular id, but we don't want extensions to be
     * able to do this with the exposed Breakpoint classes in extension API.
     * We also want "instanceof" to work with debug.breakpoints and the exposed breakpoint classes.
     * And private members will be renamed in the built js, so casting to any and setting a private member is not safe.
     * So, we store internal breakpoint IDs in a WeakMap. This function must be called after constructing a Breakpoint
     * with a known id.
     */
    function $ZK(bp, id) {
        breakpointIds.set(bp, id);
    }
    exports.$ZK = $ZK;
    let $1K = class $1K {
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
            if (!this.c) {
                this.c = breakpointIds.get(this) ?? (0, uuid_1.$4f)();
            }
            return this.c;
        }
    };
    exports.$1K = $1K;
    exports.$1K = $1K = __decorate([
        es5ClassCompat
    ], $1K);
    let $2K = class $2K extends $1K {
        constructor(location, enabled, condition, hitCondition, logMessage) {
            super(enabled, condition, hitCondition, logMessage);
            if (location === null) {
                throw (0, errors_1.$5)('location');
            }
            this.location = location;
        }
    };
    exports.$2K = $2K;
    exports.$2K = $2K = __decorate([
        es5ClassCompat
    ], $2K);
    let $3K = class $3K extends $1K {
        constructor(functionName, enabled, condition, hitCondition, logMessage) {
            super(enabled, condition, hitCondition, logMessage);
            this.functionName = functionName;
        }
    };
    exports.$3K = $3K;
    exports.$3K = $3K = __decorate([
        es5ClassCompat
    ], $3K);
    let $4K = class $4K extends $1K {
        constructor(label, dataId, canPersist, enabled, condition, hitCondition, logMessage) {
            super(enabled, condition, hitCondition, logMessage);
            if (!dataId) {
                throw (0, errors_1.$5)('dataId');
            }
            this.label = label;
            this.dataId = dataId;
            this.canPersist = canPersist;
        }
    };
    exports.$4K = $4K;
    exports.$4K = $4K = __decorate([
        es5ClassCompat
    ], $4K);
    let $5K = class $5K {
        constructor(command, args, options) {
            this.command = command;
            this.args = args || [];
            this.options = options;
        }
    };
    exports.$5K = $5K;
    exports.$5K = $5K = __decorate([
        es5ClassCompat
    ], $5K);
    let $6K = class $6K {
        constructor(port, host) {
            this.port = port;
            this.host = host;
        }
    };
    exports.$6K = $6K;
    exports.$6K = $6K = __decorate([
        es5ClassCompat
    ], $6K);
    let $7K = class $7K {
        constructor(path) {
            this.path = path;
        }
    };
    exports.$7K = $7K;
    exports.$7K = $7K = __decorate([
        es5ClassCompat
    ], $7K);
    let $8K = class $8K {
        constructor(impl) {
            this.implementation = impl;
        }
    };
    exports.$8K = $8K;
    exports.$8K = $8K = __decorate([
        es5ClassCompat
    ], $8K);
    let $9K = class $9K {
        constructor(session, threadId, frameId) {
            this.session = session;
            this.threadId = threadId;
            this.frameId = frameId;
        }
    };
    exports.$9K = $9K;
    exports.$9K = $9K = __decorate([
        es5ClassCompat
    ], $9K);
    let $0K = class $0K {
        constructor(session, threadId) {
            this.session = session;
            this.threadId = threadId;
        }
    };
    exports.$0K = $0K;
    exports.$0K = $0K = __decorate([
        es5ClassCompat
    ], $0K);
    let $$K = class $$K {
        constructor(range, expression) {
            this.range = range;
            this.expression = expression;
        }
    };
    exports.$$K = $$K;
    exports.$$K = $$K = __decorate([
        es5ClassCompat
    ], $$K);
    var InlineCompletionTriggerKind;
    (function (InlineCompletionTriggerKind) {
        InlineCompletionTriggerKind[InlineCompletionTriggerKind["Invoke"] = 0] = "Invoke";
        InlineCompletionTriggerKind[InlineCompletionTriggerKind["Automatic"] = 1] = "Automatic";
    })(InlineCompletionTriggerKind || (exports.InlineCompletionTriggerKind = InlineCompletionTriggerKind = {}));
    let $_K = class $_K {
        constructor(range, text) {
            this.range = range;
            this.text = text;
        }
    };
    exports.$_K = $_K;
    exports.$_K = $_K = __decorate([
        es5ClassCompat
    ], $_K);
    let $aL = class $aL {
        constructor(range, variableName, caseSensitiveLookup = true) {
            this.range = range;
            this.variableName = variableName;
            this.caseSensitiveLookup = caseSensitiveLookup;
        }
    };
    exports.$aL = $aL;
    exports.$aL = $aL = __decorate([
        es5ClassCompat
    ], $aL);
    let $bL = class $bL {
        constructor(range, expression) {
            this.range = range;
            this.expression = expression;
        }
    };
    exports.$bL = $bL;
    exports.$bL = $bL = __decorate([
        es5ClassCompat
    ], $bL);
    let $cL = class $cL {
        constructor(frameId, range) {
            this.frameId = frameId;
            this.stoppedLocation = range;
        }
    };
    exports.$cL = $cL;
    exports.$cL = $cL = __decorate([
        es5ClassCompat
    ], $cL);
    //#region file api
    var FileChangeType;
    (function (FileChangeType) {
        FileChangeType[FileChangeType["Changed"] = 1] = "Changed";
        FileChangeType[FileChangeType["Created"] = 2] = "Created";
        FileChangeType[FileChangeType["Deleted"] = 3] = "Deleted";
    })(FileChangeType || (exports.FileChangeType = FileChangeType = {}));
    let $dL = $dL_1 = class $dL extends Error {
        static FileExists(messageOrUri) {
            return new $dL_1(messageOrUri, files_1.FileSystemProviderErrorCode.FileExists, $dL_1.FileExists);
        }
        static FileNotFound(messageOrUri) {
            return new $dL_1(messageOrUri, files_1.FileSystemProviderErrorCode.FileNotFound, $dL_1.FileNotFound);
        }
        static FileNotADirectory(messageOrUri) {
            return new $dL_1(messageOrUri, files_1.FileSystemProviderErrorCode.FileNotADirectory, $dL_1.FileNotADirectory);
        }
        static FileIsADirectory(messageOrUri) {
            return new $dL_1(messageOrUri, files_1.FileSystemProviderErrorCode.FileIsADirectory, $dL_1.FileIsADirectory);
        }
        static NoPermissions(messageOrUri) {
            return new $dL_1(messageOrUri, files_1.FileSystemProviderErrorCode.NoPermissions, $dL_1.NoPermissions);
        }
        static Unavailable(messageOrUri) {
            return new $dL_1(messageOrUri, files_1.FileSystemProviderErrorCode.Unavailable, $dL_1.Unavailable);
        }
        constructor(uriOrMessage, code = files_1.FileSystemProviderErrorCode.Unknown, terminator) {
            super(uri_1.URI.isUri(uriOrMessage) ? uriOrMessage.toString(true) : uriOrMessage);
            this.code = terminator?.name ?? 'Unknown';
            // mark the error as file system provider error so that
            // we can extract the error code on the receiving side
            (0, files_1.$hk)(this, code);
            // workaround when extending builtin objects and when compiling to ES5, see:
            // https://github.com/microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
            Object.setPrototypeOf(this, $dL_1.prototype);
            if (typeof Error.captureStackTrace === 'function' && typeof terminator === 'function') {
                // nice stack traces
                Error.captureStackTrace(this, terminator);
            }
        }
    };
    exports.$dL = $dL;
    exports.$dL = $dL = $dL_1 = __decorate([
        es5ClassCompat
    ], $dL);
    //#endregion
    //#region folding api
    let $eL = class $eL {
        constructor(start, end, kind) {
            this.start = start;
            this.end = end;
            this.kind = kind;
        }
    };
    exports.$eL = $eL;
    exports.$eL = $eL = __decorate([
        es5ClassCompat
    ], $eL);
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
    class $fL {
        constructor(tokenTypes, tokenModifiers = []) {
            this.tokenTypes = tokenTypes;
            this.tokenModifiers = tokenModifiers;
        }
    }
    exports.$fL = $fL;
    function isStrArrayOrUndefined(arg) {
        return ((typeof arg === 'undefined') || (0, types_1.$kf)(arg));
    }
    class $gL {
        constructor(legend) {
            this.c = 0;
            this.e = 0;
            this.f = true;
            this.g = [];
            this.h = 0;
            this.j = new Map();
            this.k = new Map();
            this.l = false;
            if (legend) {
                this.l = true;
                for (let i = 0, len = legend.tokenTypes.length; i < len; i++) {
                    this.j.set(legend.tokenTypes[i], i);
                }
                for (let i = 0, len = legend.tokenModifiers.length; i < len; i++) {
                    this.k.set(legend.tokenModifiers[i], i);
                }
            }
        }
        push(arg0, arg1, arg2, arg3, arg4) {
            if (typeof arg0 === 'number' && typeof arg1 === 'number' && typeof arg2 === 'number' && typeof arg3 === 'number' && (typeof arg4 === 'number' || typeof arg4 === 'undefined')) {
                if (typeof arg4 === 'undefined') {
                    arg4 = 0;
                }
                // 1st overload
                return this.n(arg0, arg1, arg2, arg3, arg4);
            }
            if ($5J.isRange(arg0) && typeof arg1 === 'string' && isStrArrayOrUndefined(arg2)) {
                // 2nd overload
                return this.m(arg0, arg1, arg2);
            }
            throw (0, errors_1.$5)();
        }
        m(range, tokenType, tokenModifiers) {
            if (!this.l) {
                throw new Error('Legend must be provided in constructor');
            }
            if (range.start.line !== range.end.line) {
                throw new Error('`range` cannot span multiple lines');
            }
            if (!this.j.has(tokenType)) {
                throw new Error('`tokenType` is not in the provided legend');
            }
            const line = range.start.line;
            const char = range.start.character;
            const length = range.end.character - range.start.character;
            const nTokenType = this.j.get(tokenType);
            let nTokenModifiers = 0;
            if (tokenModifiers) {
                for (const tokenModifier of tokenModifiers) {
                    if (!this.k.has(tokenModifier)) {
                        throw new Error('`tokenModifier` is not in the provided legend');
                    }
                    const nTokenModifier = this.k.get(tokenModifier);
                    nTokenModifiers |= (1 << nTokenModifier) >>> 0;
                }
            }
            this.n(line, char, length, nTokenType, nTokenModifiers);
        }
        n(line, char, length, tokenType, tokenModifiers) {
            if (this.f && (line < this.c || (line === this.c && char < this.e))) {
                // push calls were ordered and are no longer ordered
                this.f = false;
                // Remove delta encoding from data
                const tokenCount = (this.g.length / 5) | 0;
                let prevLine = 0;
                let prevChar = 0;
                for (let i = 0; i < tokenCount; i++) {
                    let line = this.g[5 * i];
                    let char = this.g[5 * i + 1];
                    if (line === 0) {
                        // on the same line as previous token
                        line = prevLine;
                        char += prevChar;
                    }
                    else {
                        // on a different line than previous token
                        line += prevLine;
                    }
                    this.g[5 * i] = line;
                    this.g[5 * i + 1] = char;
                    prevLine = line;
                    prevChar = char;
                }
            }
            let pushLine = line;
            let pushChar = char;
            if (this.f && this.h > 0) {
                pushLine -= this.c;
                if (pushLine === 0) {
                    pushChar -= this.e;
                }
            }
            this.g[this.h++] = pushLine;
            this.g[this.h++] = pushChar;
            this.g[this.h++] = length;
            this.g[this.h++] = tokenType;
            this.g[this.h++] = tokenModifiers;
            this.c = line;
            this.e = char;
        }
        static o(data) {
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
            if (!this.f) {
                return new $hL($gL.o(this.g), resultId);
            }
            return new $hL(new Uint32Array(this.g), resultId);
        }
    }
    exports.$gL = $gL;
    class $hL {
        constructor(data, resultId) {
            this.resultId = resultId;
            this.data = data;
        }
    }
    exports.$hL = $hL;
    class $iL {
        constructor(start, deleteCount, data) {
            this.start = start;
            this.deleteCount = deleteCount;
            this.data = data;
        }
    }
    exports.$iL = $iL;
    class $jL {
        constructor(edits, resultId) {
            this.resultId = resultId;
            this.edits = edits;
        }
    }
    exports.$jL = $jL;
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
    let $kL = class $kL {
        static { this.Back = { iconPath: new $WK('arrow-left') }; }
        constructor() { }
    };
    exports.$kL = $kL;
    exports.$kL = $kL = __decorate([
        es5ClassCompat
    ], $kL);
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
    class $lL {
        static validate(d) {
            if (typeof d.badge === 'string') {
                let len = (0, strings_1.$We)(d.badge, 0);
                if (len < d.badge.length) {
                    len += (0, strings_1.$We)(d.badge, len);
                }
                if (d.badge.length > len) {
                    throw new Error(`The 'badge'-property must be undefined or a short character`);
                }
            }
            else if (d.badge) {
                if (!$WK.isThemeIcon(d.badge)) {
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
    exports.$lL = $lL;
    //#region Theming
    let $mL = class $mL {
        constructor(kind) {
            this.kind = kind;
        }
    };
    exports.$mL = $mL;
    exports.$mL = $mL = __decorate([
        es5ClassCompat
    ], $mL);
    var ColorThemeKind;
    (function (ColorThemeKind) {
        ColorThemeKind[ColorThemeKind["Light"] = 1] = "Light";
        ColorThemeKind[ColorThemeKind["Dark"] = 2] = "Dark";
        ColorThemeKind[ColorThemeKind["HighContrast"] = 3] = "HighContrast";
        ColorThemeKind[ColorThemeKind["HighContrastLight"] = 4] = "HighContrastLight";
    })(ColorThemeKind || (exports.ColorThemeKind = ColorThemeKind = {}));
    //#endregion Theming
    //#region Notebook
    class $nL {
        static isNotebookRange(thing) {
            if (thing instanceof $nL) {
                return true;
            }
            if (!thing) {
                return false;
            }
            return typeof thing.start === 'number'
                && typeof thing.end === 'number';
        }
        get start() {
            return this.c;
        }
        get end() {
            return this.e;
        }
        get isEmpty() {
            return this.c === this.e;
        }
        constructor(start, end) {
            if (start < 0) {
                throw (0, errors_1.$5)('start must be positive');
            }
            if (end < 0) {
                throw (0, errors_1.$5)('end must be positive');
            }
            if (start <= end) {
                this.c = start;
                this.e = end;
            }
            else {
                this.c = end;
                this.e = start;
            }
        }
        with(change) {
            let start = this.c;
            let end = this.e;
            if (change.start !== undefined) {
                start = change.start;
            }
            if (change.end !== undefined) {
                end = change.end;
            }
            if (start === this.c && end === this.e) {
                return this;
            }
            return new $nL(start, end);
        }
    }
    exports.$nL = $nL;
    class $oL {
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
            return Array.isArray(value) && value.every(elem => $oL.isNotebookCellData(elem));
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
            $oL.validate(this);
        }
    }
    exports.$oL = $oL;
    class $pL {
        constructor(cells) {
            this.cells = cells;
        }
    }
    exports.$pL = $pL;
    class $qL {
        static isNotebookCellOutputItem(obj) {
            if (obj instanceof $qL) {
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
            return $qL.json(obj, 'application/vnd.code.notebook.error');
        }
        static stdout(value) {
            return $qL.text(value, 'application/vnd.code.notebook.stdout');
        }
        static stderr(value) {
            return $qL.text(value, 'application/vnd.code.notebook.stderr');
        }
        static bytes(value, mime = 'application/octet-stream') {
            return new $qL(value, mime);
        }
        static #encoder = new TextEncoder();
        static text(value, mime = mime_1.$Hr.text) {
            const bytes = $qL.#encoder.encode(String(value));
            return new $qL(bytes, mime);
        }
        static json(value, mime = 'text/x-json') {
            const rawStr = JSON.stringify(value, undefined, '\t');
            return $qL.text(rawStr, mime);
        }
        constructor(data, mime) {
            this.data = data;
            this.mime = mime;
            const mimeNormalized = (0, mime_1.$Lr)(mime, true);
            if (!mimeNormalized) {
                throw new Error(`INVALID mime type: ${mime}. Must be in the format "type/subtype[;optionalparameter]"`);
            }
            this.mime = mimeNormalized;
        }
    }
    exports.$qL = $qL;
    class $rL {
        static isNotebookCellOutput(candidate) {
            if (candidate instanceof $rL) {
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
                const normalMime = (0, mime_1.$Lr)(item.mime);
                // We can have multiple text stream mime types in the same output.
                if (!seen.has(normalMime) || (0, notebookCommon_1.$9H)(normalMime)) {
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
            this.items = $rL.ensureUniqueMimeTypes(items, true);
            if (typeof idOrMetadata === 'string') {
                this.id = idOrMetadata;
                this.metadata = metadata;
            }
            else {
                this.id = (0, uuid_1.$4f)();
                this.metadata = idOrMetadata ?? metadata;
            }
        }
    }
    exports.$rL = $rL;
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
    class $sL {
        constructor(text, alignment) {
            this.text = text;
            this.alignment = alignment;
        }
    }
    exports.$sL = $sL;
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
    class $tL {
        constructor(uri, provides = []) {
            this.uri = uri;
            this.provides = (0, arrays_1.$1b)(provides);
        }
    }
    exports.$tL = $tL;
    class $uL {
        constructor(label) {
            this.label = label;
        }
    }
    exports.$uL = $uL;
    //#endregion
    //#region Timeline
    let $vL = class $vL {
        constructor(label, timestamp) {
            this.label = label;
            this.timestamp = timestamp;
        }
    };
    exports.$vL = $vL;
    exports.$vL = $vL = __decorate([
        es5ClassCompat
    ], $vL);
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
    class $wL {
        constructor(ranges, wordPattern) {
            this.ranges = ranges;
            this.wordPattern = wordPattern;
        }
    }
    exports.$wL = $wL;
    //#region ports
    class $xL {
        constructor(autoForwardAction) {
            this.c = autoForwardAction;
        }
        get autoForwardAction() {
            return this.c;
        }
    }
    exports.$xL = $xL;
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
    let $yL = class $yL {
        constructor(include = undefined, exclude = undefined, profile = undefined, continuous = false) {
            this.include = include;
            this.exclude = exclude;
            this.profile = profile;
            this.continuous = continuous;
        }
    };
    exports.$yL = $yL;
    exports.$yL = $yL = __decorate([
        es5ClassCompat
    ], $yL);
    let $zL = $zL_1 = class $zL {
        static diff(message, expected, actual) {
            const msg = new $zL_1(message);
            msg.expectedOutput = expected;
            msg.actualOutput = actual;
            return msg;
        }
        constructor(message) {
            this.message = message;
        }
    };
    exports.$zL = $zL;
    exports.$zL = $zL = $zL_1 = __decorate([
        es5ClassCompat
    ], $zL);
    let $AL = class $AL {
        constructor(id) {
            this.id = id;
        }
    };
    exports.$AL = $AL;
    exports.$AL = $AL = __decorate([
        es5ClassCompat
    ], $AL);
    //#endregion
    //#region Test Coverage
    let $BL = class $BL {
        constructor(covered, total) {
            this.covered = covered;
            this.total = total;
        }
    };
    exports.$BL = $BL;
    exports.$BL = $BL = __decorate([
        es5ClassCompat
    ], $BL);
    let $CL = $CL_1 = class $CL {
        static fromDetails(uri, details) {
            const statements = new $BL(0, 0);
            const branches = new $BL(0, 0);
            const fn = new $BL(0, 0);
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
            const coverage = new $CL_1(uri, statements, branches.total > 0 ? branches : undefined, fn.total > 0 ? fn : undefined);
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
    exports.$CL = $CL;
    exports.$CL = $CL = $CL_1 = __decorate([
        es5ClassCompat
    ], $CL);
    let $DL = class $DL {
        constructor(executionCount, location, branches = []) {
            this.executionCount = executionCount;
            this.location = location;
            this.branches = branches;
        }
    };
    exports.$DL = $DL;
    exports.$DL = $DL = __decorate([
        es5ClassCompat
    ], $DL);
    let $EL = class $EL {
        constructor(executionCount, location) {
            this.executionCount = executionCount;
            this.location = location;
        }
    };
    exports.$EL = $EL;
    exports.$EL = $EL = __decorate([
        es5ClassCompat
    ], $EL);
    let $FL = class $FL {
        constructor(executionCount, location) {
            this.executionCount = executionCount;
            this.location = location;
        }
    };
    exports.$FL = $FL;
    exports.$FL = $FL = __decorate([
        es5ClassCompat
    ], $FL);
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
    class $GL {
        constructor(kind, name, detail, uri, range, selectionRange) {
            this.kind = kind;
            this.name = name;
            this.detail = detail;
            this.uri = uri;
            this.range = range;
            this.selectionRange = selectionRange;
        }
    }
    exports.$GL = $GL;
    //#region Tab Inputs
    class $HL {
        constructor(uri) {
            this.uri = uri;
        }
    }
    exports.$HL = $HL;
    class $IL {
        constructor(original, modified) {
            this.original = original;
            this.modified = modified;
        }
    }
    exports.$IL = $IL;
    class $JL {
        constructor(base, input1, input2, result) {
            this.base = base;
            this.input1 = input1;
            this.input2 = input2;
            this.result = result;
        }
    }
    exports.$JL = $JL;
    class $KL {
        constructor(uri, viewType) {
            this.uri = uri;
            this.viewType = viewType;
        }
    }
    exports.$KL = $KL;
    class $LL {
        constructor(viewType) {
            this.viewType = viewType;
        }
    }
    exports.$LL = $LL;
    class $ML {
        constructor(uri, notebookType) {
            this.uri = uri;
            this.notebookType = notebookType;
        }
    }
    exports.$ML = $ML;
    class $NL {
        constructor(original, modified, notebookType) {
            this.original = original;
            this.modified = modified;
            this.notebookType = notebookType;
        }
    }
    exports.$NL = $NL;
    class $OL {
        constructor() { }
    }
    exports.$OL = $OL;
    class $PL {
        constructor(uri, inputBoxUri) {
            this.uri = uri;
            this.inputBoxUri = inputBoxUri;
        }
    }
    exports.$PL = $PL;
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
    class $QL {
        constructor(role, content) {
            this.role = role;
            this.content = content;
        }
    }
    exports.$QL = $QL;
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
//# sourceMappingURL=extHostTypes.js.map