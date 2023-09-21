/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/buffer", "vs/base/common/dataTransfer", "vs/base/common/functional", "vs/base/common/htmlContent", "vs/base/common/map", "vs/base/common/marked/marked", "vs/base/common/marshalling", "vs/base/common/mime", "vs/base/common/objects", "vs/base/common/types", "vs/base/common/uri", "vs/editor/common/core/range", "vs/editor/common/languages", "vs/platform/markers/common/markers", "vs/workbench/api/common/extHostTestingPrivateApi", "vs/workbench/common/editor", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/testing/common/testId", "vs/workbench/contrib/testing/common/testTypes", "vs/workbench/services/editor/common/editorService", "./extHostTypes"], function (require, exports, arrays_1, buffer_1, dataTransfer_1, functional_1, htmlContent, map_1, marked_1, marshalling_1, mime_1, objects_1, types_1, uri_1, editorRange, languages, markers_1, extHostTestingPrivateApi_1, editor_1, notebooks, testId_1, testTypes_1, editorService_1, types) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalQuickFix = exports.InteractiveEditorResponseFeedbackKind = exports.ChatVariableLevel = exports.ChatVariable = exports.ChatMessageRole = exports.ChatMessage = exports.ChatFollowup = exports.ChatReplyFollowup = exports.DataTransfer = exports.DataTransferItem = exports.ViewBadge = exports.TypeHierarchyItem = exports.CodeActionTriggerKind = exports.TestCoverage = exports.TestResults = exports.TestItem = exports.TestTag = exports.TestMessage = exports.NotebookRendererScript = exports.NotebookDocumentContentOptions = exports.NotebookKernelSourceAction = exports.NotebookStatusBarItem = exports.NotebookExclusiveDocumentPattern = exports.NotebookCellOutput = exports.NotebookCellOutputItem = exports.NotebookCellData = exports.NotebookData = exports.NotebookCellKind = exports.NotebookCellExecutionState = exports.NotebookCellExecutionSummary = exports.NotebookRange = exports.MappedEditsContext = exports.LanguageSelector = exports.GlobPattern = exports.TextEditorOpenOptions = exports.FoldingRangeKind = exports.FoldingRange = exports.ProgressLocation = exports.EndOfLine = exports.TextEditorLineNumbersStyle = exports.TextDocumentSaveReason = exports.SelectionRange = exports.Color = exports.ColorPresentation = exports.DocumentLink = exports.InlayHintKind = exports.InlayHintLabelPart = exports.InlayHint = exports.SignatureHelp = exports.SignatureInformation = exports.ParameterInformation = exports.CompletionItem = exports.CompletionItemKind = exports.CompletionItemTag = exports.CompletionContext = exports.CompletionTriggerKind = exports.DocumentHighlight = exports.InlineValueContext = exports.InlineValue = exports.EvaluatableExpression = exports.Hover = exports.DefinitionLink = exports.location = exports.CallHierarchyOutgoingCall = exports.CallHierarchyIncomingCall = exports.CallHierarchyItem = exports.DocumentSymbol = exports.WorkspaceSymbol = exports.SymbolTag = exports.SymbolKind = exports.WorkspaceEdit = exports.TextEdit = exports.DecorationRenderOptions = exports.DecorationRangeBehavior = exports.ThemableDecorationRenderOptions = exports.ThemableDecorationAttachmentRenderOptions = exports.$1L = exports.$ZL = exports.MarkdownString = exports.$YL = exports.ViewColumn = exports.DiagnosticSeverity = exports.DiagnosticRelatedInformation = exports.Diagnostic = exports.DiagnosticTag = exports.DocumentSelector = exports.Position = exports.TokenType = exports.Range = exports.Selection = void 0;
    var Selection;
    (function (Selection) {
        function to(selection) {
            const { selectionStartLineNumber, selectionStartColumn, positionLineNumber, positionColumn } = selection;
            const start = new types.$4J(selectionStartLineNumber - 1, selectionStartColumn - 1);
            const end = new types.$4J(positionLineNumber - 1, positionColumn - 1);
            return new types.$6J(start, end);
        }
        Selection.to = to;
        function from(selection) {
            const { anchor, active } = selection;
            return {
                selectionStartLineNumber: anchor.line + 1,
                selectionStartColumn: anchor.character + 1,
                positionLineNumber: active.line + 1,
                positionColumn: active.character + 1
            };
        }
        Selection.from = from;
    })(Selection || (exports.Selection = Selection = {}));
    var Range;
    (function (Range) {
        function from(range) {
            if (!range) {
                return undefined;
            }
            const { start, end } = range;
            return {
                startLineNumber: start.line + 1,
                startColumn: start.character + 1,
                endLineNumber: end.line + 1,
                endColumn: end.character + 1
            };
        }
        Range.from = from;
        function to(range) {
            if (!range) {
                return undefined;
            }
            const { startLineNumber, startColumn, endLineNumber, endColumn } = range;
            return new types.$5J(startLineNumber - 1, startColumn - 1, endLineNumber - 1, endColumn - 1);
        }
        Range.to = to;
    })(Range || (exports.Range = Range = {}));
    var TokenType;
    (function (TokenType) {
        function to(type) {
            switch (type) {
                case 1 /* encodedTokenAttributes.StandardTokenType.Comment */: return types.StandardTokenType.Comment;
                case 0 /* encodedTokenAttributes.StandardTokenType.Other */: return types.StandardTokenType.Other;
                case 3 /* encodedTokenAttributes.StandardTokenType.RegEx */: return types.StandardTokenType.RegEx;
                case 2 /* encodedTokenAttributes.StandardTokenType.String */: return types.StandardTokenType.String;
            }
        }
        TokenType.to = to;
    })(TokenType || (exports.TokenType = TokenType = {}));
    var Position;
    (function (Position) {
        function to(position) {
            return new types.$4J(position.lineNumber - 1, position.column - 1);
        }
        Position.to = to;
        function from(position) {
            return { lineNumber: position.line + 1, column: position.character + 1 };
        }
        Position.from = from;
    })(Position || (exports.Position = Position = {}));
    var DocumentSelector;
    (function (DocumentSelector) {
        function from(value, uriTransformer, extension) {
            return (0, arrays_1.$Fb)((0, arrays_1.$1b)(value).map(sel => _doTransformDocumentSelector(sel, uriTransformer, extension)));
        }
        DocumentSelector.from = from;
        function _doTransformDocumentSelector(selector, uriTransformer, extension) {
            if (typeof selector === 'string') {
                return {
                    $serialized: true,
                    language: selector,
                    isBuiltin: extension?.isBuiltin,
                };
            }
            if (selector) {
                return {
                    $serialized: true,
                    language: selector.language,
                    scheme: _transformScheme(selector.scheme, uriTransformer),
                    pattern: GlobPattern.from(selector.pattern) ?? undefined,
                    exclusive: selector.exclusive,
                    notebookType: selector.notebookType,
                    isBuiltin: extension?.isBuiltin
                };
            }
            return undefined;
        }
        function _transformScheme(scheme, uriTransformer) {
            if (uriTransformer && typeof scheme === 'string') {
                return uriTransformer.transformOutgoingScheme(scheme);
            }
            return scheme;
        }
    })(DocumentSelector || (exports.DocumentSelector = DocumentSelector = {}));
    var DiagnosticTag;
    (function (DiagnosticTag) {
        function from(value) {
            switch (value) {
                case types.DiagnosticTag.Unnecessary:
                    return 1 /* MarkerTag.Unnecessary */;
                case types.DiagnosticTag.Deprecated:
                    return 2 /* MarkerTag.Deprecated */;
            }
            return undefined;
        }
        DiagnosticTag.from = from;
        function to(value) {
            switch (value) {
                case 1 /* MarkerTag.Unnecessary */:
                    return types.DiagnosticTag.Unnecessary;
                case 2 /* MarkerTag.Deprecated */:
                    return types.DiagnosticTag.Deprecated;
                default:
                    return undefined;
            }
        }
        DiagnosticTag.to = to;
    })(DiagnosticTag || (exports.DiagnosticTag = DiagnosticTag = {}));
    var Diagnostic;
    (function (Diagnostic) {
        function from(value) {
            let code;
            if (value.code) {
                if ((0, types_1.$jf)(value.code) || (0, types_1.$nf)(value.code)) {
                    code = String(value.code);
                }
                else {
                    code = {
                        value: String(value.code.value),
                        target: value.code.target,
                    };
                }
            }
            return {
                ...Range.from(value.range),
                message: value.message,
                source: value.source,
                code,
                severity: DiagnosticSeverity.from(value.severity),
                relatedInformation: value.relatedInformation && value.relatedInformation.map(DiagnosticRelatedInformation.from),
                tags: Array.isArray(value.tags) ? (0, arrays_1.$Fb)(value.tags.map(DiagnosticTag.from)) : undefined,
            };
        }
        Diagnostic.from = from;
        function to(value) {
            const res = new types.$eK(Range.to(value), value.message, DiagnosticSeverity.to(value.severity));
            res.source = value.source;
            res.code = (0, types_1.$jf)(value.code) ? value.code : value.code?.value;
            res.relatedInformation = value.relatedInformation && value.relatedInformation.map(DiagnosticRelatedInformation.to);
            res.tags = value.tags && (0, arrays_1.$Fb)(value.tags.map(DiagnosticTag.to));
            return res;
        }
        Diagnostic.to = to;
    })(Diagnostic || (exports.Diagnostic = Diagnostic = {}));
    var DiagnosticRelatedInformation;
    (function (DiagnosticRelatedInformation) {
        function from(value) {
            return {
                ...Range.from(value.location.range),
                message: value.message,
                resource: value.location.uri
            };
        }
        DiagnosticRelatedInformation.from = from;
        function to(value) {
            return new types.$dK(new types.$cK(value.resource, Range.to(value)), value.message);
        }
        DiagnosticRelatedInformation.to = to;
    })(DiagnosticRelatedInformation || (exports.DiagnosticRelatedInformation = DiagnosticRelatedInformation = {}));
    var DiagnosticSeverity;
    (function (DiagnosticSeverity) {
        function from(value) {
            switch (value) {
                case types.DiagnosticSeverity.Error:
                    return markers_1.MarkerSeverity.Error;
                case types.DiagnosticSeverity.Warning:
                    return markers_1.MarkerSeverity.Warning;
                case types.DiagnosticSeverity.Information:
                    return markers_1.MarkerSeverity.Info;
                case types.DiagnosticSeverity.Hint:
                    return markers_1.MarkerSeverity.Hint;
            }
            return markers_1.MarkerSeverity.Error;
        }
        DiagnosticSeverity.from = from;
        function to(value) {
            switch (value) {
                case markers_1.MarkerSeverity.Info:
                    return types.DiagnosticSeverity.Information;
                case markers_1.MarkerSeverity.Warning:
                    return types.DiagnosticSeverity.Warning;
                case markers_1.MarkerSeverity.Error:
                    return types.DiagnosticSeverity.Error;
                case markers_1.MarkerSeverity.Hint:
                    return types.DiagnosticSeverity.Hint;
                default:
                    return types.DiagnosticSeverity.Error;
            }
        }
        DiagnosticSeverity.to = to;
    })(DiagnosticSeverity || (exports.DiagnosticSeverity = DiagnosticSeverity = {}));
    var ViewColumn;
    (function (ViewColumn) {
        function from(column) {
            if (typeof column === 'number' && column >= types.ViewColumn.One) {
                return column - 1; // adjust zero index (ViewColumn.ONE => 0)
            }
            if (column === types.ViewColumn.Beside) {
                return editorService_1.$$C;
            }
            return editorService_1.$0C; // default is always the active group
        }
        ViewColumn.from = from;
        function to(position) {
            if (typeof position === 'number' && position >= 0) {
                return position + 1; // adjust to index (ViewColumn.ONE => 1)
            }
            throw new Error(`invalid 'EditorGroupColumn'`);
        }
        ViewColumn.to = to;
    })(ViewColumn || (exports.ViewColumn = ViewColumn = {}));
    function isDecorationOptions(something) {
        return (typeof something.range !== 'undefined');
    }
    function $YL(something) {
        if (something.length === 0) {
            return true;
        }
        return isDecorationOptions(something[0]) ? true : false;
    }
    exports.$YL = $YL;
    var MarkdownString;
    (function (MarkdownString) {
        function fromMany(markup) {
            return markup.map(MarkdownString.from);
        }
        MarkdownString.fromMany = fromMany;
        function isCodeblock(thing) {
            return thing && typeof thing === 'object'
                && typeof thing.language === 'string'
                && typeof thing.value === 'string';
        }
        function from(markup) {
            let res;
            if (isCodeblock(markup)) {
                const { language, value } = markup;
                res = { value: '```' + language + '\n' + value + '\n```\n' };
            }
            else if (types.$qK.isMarkdownString(markup)) {
                res = { value: markup.value, isTrusted: markup.isTrusted, supportThemeIcons: markup.supportThemeIcons, supportHtml: markup.supportHtml, baseUri: markup.baseUri };
            }
            else if (typeof markup === 'string') {
                res = { value: markup };
            }
            else {
                res = { value: '' };
            }
            // extract uris into a separate object
            const resUris = Object.create(null);
            res.uris = resUris;
            const collectUri = (href) => {
                try {
                    let uri = uri_1.URI.parse(href, true);
                    uri = uri.with({ query: _uriMassage(uri.query, resUris) });
                    resUris[href] = uri;
                }
                catch (e) {
                    // ignore
                }
                return '';
            };
            const renderer = new marked_1.marked.Renderer();
            renderer.link = collectUri;
            renderer.image = href => typeof href === 'string' ? collectUri(htmlContent.$5j(href).href) : '';
            (0, marked_1.marked)(res.value, { renderer });
            return res;
        }
        MarkdownString.from = from;
        function _uriMassage(part, bucket) {
            if (!part) {
                return part;
            }
            let data;
            try {
                data = (0, marshalling_1.$0g)(part);
            }
            catch (e) {
                // ignore
            }
            if (!data) {
                return part;
            }
            let changed = false;
            data = (0, objects_1.$Xm)(data, value => {
                if (uri_1.URI.isUri(value)) {
                    const key = `__uri_${Math.random().toString(16).slice(2, 8)}`;
                    bucket[key] = value;
                    changed = true;
                    return key;
                }
                else {
                    return undefined;
                }
            });
            if (!changed) {
                return part;
            }
            return JSON.stringify(data);
        }
        function to(value) {
            const result = new types.$qK(value.value, value.supportThemeIcons);
            result.isTrusted = value.isTrusted;
            result.supportHtml = value.supportHtml;
            result.baseUri = value.baseUri ? uri_1.URI.from(value.baseUri) : undefined;
            return result;
        }
        MarkdownString.to = to;
        function fromStrict(value) {
            if (!value) {
                return undefined;
            }
            return typeof value === 'string' ? value : MarkdownString.from(value);
        }
        MarkdownString.fromStrict = fromStrict;
    })(MarkdownString || (exports.MarkdownString = MarkdownString = {}));
    function $ZL(ranges) {
        if ($YL(ranges)) {
            return ranges.map((r) => {
                return {
                    range: Range.from(r.range),
                    hoverMessage: Array.isArray(r.hoverMessage)
                        ? MarkdownString.fromMany(r.hoverMessage)
                        : (r.hoverMessage ? MarkdownString.from(r.hoverMessage) : undefined),
                    renderOptions: /* URI vs Uri */ r.renderOptions
                };
            });
        }
        else {
            return ranges.map((r) => {
                return {
                    range: Range.from(r)
                };
            });
        }
    }
    exports.$ZL = $ZL;
    function $1L(value) {
        if (typeof value === 'undefined') {
            return value;
        }
        if (typeof value === 'string') {
            return uri_1.URI.file(value);
        }
        else {
            return value;
        }
    }
    exports.$1L = $1L;
    var ThemableDecorationAttachmentRenderOptions;
    (function (ThemableDecorationAttachmentRenderOptions) {
        function from(options) {
            if (typeof options === 'undefined') {
                return options;
            }
            return {
                contentText: options.contentText,
                contentIconPath: options.contentIconPath ? $1L(options.contentIconPath) : undefined,
                border: options.border,
                borderColor: options.borderColor,
                fontStyle: options.fontStyle,
                fontWeight: options.fontWeight,
                textDecoration: options.textDecoration,
                color: options.color,
                backgroundColor: options.backgroundColor,
                margin: options.margin,
                width: options.width,
                height: options.height,
            };
        }
        ThemableDecorationAttachmentRenderOptions.from = from;
    })(ThemableDecorationAttachmentRenderOptions || (exports.ThemableDecorationAttachmentRenderOptions = ThemableDecorationAttachmentRenderOptions = {}));
    var ThemableDecorationRenderOptions;
    (function (ThemableDecorationRenderOptions) {
        function from(options) {
            if (typeof options === 'undefined') {
                return options;
            }
            return {
                backgroundColor: options.backgroundColor,
                outline: options.outline,
                outlineColor: options.outlineColor,
                outlineStyle: options.outlineStyle,
                outlineWidth: options.outlineWidth,
                border: options.border,
                borderColor: options.borderColor,
                borderRadius: options.borderRadius,
                borderSpacing: options.borderSpacing,
                borderStyle: options.borderStyle,
                borderWidth: options.borderWidth,
                fontStyle: options.fontStyle,
                fontWeight: options.fontWeight,
                textDecoration: options.textDecoration,
                cursor: options.cursor,
                color: options.color,
                opacity: options.opacity,
                letterSpacing: options.letterSpacing,
                gutterIconPath: options.gutterIconPath ? $1L(options.gutterIconPath) : undefined,
                gutterIconSize: options.gutterIconSize,
                overviewRulerColor: options.overviewRulerColor,
                before: options.before ? ThemableDecorationAttachmentRenderOptions.from(options.before) : undefined,
                after: options.after ? ThemableDecorationAttachmentRenderOptions.from(options.after) : undefined,
            };
        }
        ThemableDecorationRenderOptions.from = from;
    })(ThemableDecorationRenderOptions || (exports.ThemableDecorationRenderOptions = ThemableDecorationRenderOptions = {}));
    var DecorationRangeBehavior;
    (function (DecorationRangeBehavior) {
        function from(value) {
            if (typeof value === 'undefined') {
                return value;
            }
            switch (value) {
                case types.DecorationRangeBehavior.OpenOpen:
                    return 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */;
                case types.DecorationRangeBehavior.ClosedClosed:
                    return 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */;
                case types.DecorationRangeBehavior.OpenClosed:
                    return 2 /* TrackedRangeStickiness.GrowsOnlyWhenTypingBefore */;
                case types.DecorationRangeBehavior.ClosedOpen:
                    return 3 /* TrackedRangeStickiness.GrowsOnlyWhenTypingAfter */;
            }
        }
        DecorationRangeBehavior.from = from;
    })(DecorationRangeBehavior || (exports.DecorationRangeBehavior = DecorationRangeBehavior = {}));
    var DecorationRenderOptions;
    (function (DecorationRenderOptions) {
        function from(options) {
            return {
                isWholeLine: options.isWholeLine,
                rangeBehavior: options.rangeBehavior ? DecorationRangeBehavior.from(options.rangeBehavior) : undefined,
                overviewRulerLane: options.overviewRulerLane,
                light: options.light ? ThemableDecorationRenderOptions.from(options.light) : undefined,
                dark: options.dark ? ThemableDecorationRenderOptions.from(options.dark) : undefined,
                backgroundColor: options.backgroundColor,
                outline: options.outline,
                outlineColor: options.outlineColor,
                outlineStyle: options.outlineStyle,
                outlineWidth: options.outlineWidth,
                border: options.border,
                borderColor: options.borderColor,
                borderRadius: options.borderRadius,
                borderSpacing: options.borderSpacing,
                borderStyle: options.borderStyle,
                borderWidth: options.borderWidth,
                fontStyle: options.fontStyle,
                fontWeight: options.fontWeight,
                textDecoration: options.textDecoration,
                cursor: options.cursor,
                color: options.color,
                opacity: options.opacity,
                letterSpacing: options.letterSpacing,
                gutterIconPath: options.gutterIconPath ? $1L(options.gutterIconPath) : undefined,
                gutterIconSize: options.gutterIconSize,
                overviewRulerColor: options.overviewRulerColor,
                before: options.before ? ThemableDecorationAttachmentRenderOptions.from(options.before) : undefined,
                after: options.after ? ThemableDecorationAttachmentRenderOptions.from(options.after) : undefined,
            };
        }
        DecorationRenderOptions.from = from;
    })(DecorationRenderOptions || (exports.DecorationRenderOptions = DecorationRenderOptions = {}));
    var TextEdit;
    (function (TextEdit) {
        function from(edit) {
            return {
                text: edit.newText,
                eol: edit.newEol && EndOfLine.from(edit.newEol),
                range: Range.from(edit.range)
            };
        }
        TextEdit.from = from;
        function to(edit) {
            const result = new types.$0J(Range.to(edit.range), edit.text);
            result.newEol = (typeof edit.eol === 'undefined' ? undefined : EndOfLine.to(edit.eol));
            return result;
        }
        TextEdit.to = to;
    })(TextEdit || (exports.TextEdit = TextEdit = {}));
    var WorkspaceEdit;
    (function (WorkspaceEdit) {
        function from(value, versionInfo) {
            const result = {
                edits: []
            };
            if (value instanceof types.$aK) {
                // collect all files that are to be created so that their version
                // information (in case they exist as text model already) can be ignored
                const toCreate = new map_1.$Ai();
                for (const entry of value._allEntries()) {
                    if (entry._type === 1 /* types.FileEditType.File */ && uri_1.URI.isUri(entry.to) && entry.from === undefined) {
                        toCreate.add(entry.to);
                    }
                }
                for (const entry of value._allEntries()) {
                    if (entry._type === 1 /* types.FileEditType.File */) {
                        let contents;
                        if (entry.options?.contents) {
                            if (ArrayBuffer.isView(entry.options.contents)) {
                                contents = { type: 'base64', value: (0, buffer_1.$Zd)(buffer_1.$Fd.wrap(entry.options.contents)) };
                            }
                            else {
                                contents = { type: 'dataTransferItem', id: entry.options.contents._itemId };
                            }
                        }
                        // file operation
                        result.edits.push({
                            oldResource: entry.from,
                            newResource: entry.to,
                            options: { ...entry.options, contents },
                            metadata: entry.metadata
                        });
                    }
                    else if (entry._type === 2 /* types.FileEditType.Text */) {
                        // text edits
                        result.edits.push({
                            resource: entry.uri,
                            textEdit: TextEdit.from(entry.edit),
                            versionId: !toCreate.has(entry.uri) ? versionInfo?.getTextDocumentVersion(entry.uri) : undefined,
                            metadata: entry.metadata
                        });
                    }
                    else if (entry._type === 6 /* types.FileEditType.Snippet */) {
                        result.edits.push({
                            resource: entry.uri,
                            textEdit: {
                                range: Range.from(entry.range),
                                text: entry.edit.value,
                                insertAsSnippet: true
                            },
                            versionId: !toCreate.has(entry.uri) ? versionInfo?.getTextDocumentVersion(entry.uri) : undefined,
                            metadata: entry.metadata
                        });
                    }
                    else if (entry._type === 3 /* types.FileEditType.Cell */) {
                        // cell edit
                        result.edits.push({
                            metadata: entry.metadata,
                            resource: entry.uri,
                            cellEdit: entry.edit,
                            notebookMetadata: entry.notebookMetadata,
                            notebookVersionId: versionInfo?.getNotebookDocumentVersion(entry.uri)
                        });
                    }
                    else if (entry._type === 5 /* types.FileEditType.CellReplace */) {
                        // cell replace
                        result.edits.push({
                            metadata: entry.metadata,
                            resource: entry.uri,
                            notebookVersionId: versionInfo?.getNotebookDocumentVersion(entry.uri),
                            cellEdit: {
                                editType: 1 /* notebooks.CellEditType.Replace */,
                                index: entry.index,
                                count: entry.count,
                                cells: entry.cells.map(NotebookCellData.from)
                            }
                        });
                    }
                }
            }
            return result;
        }
        WorkspaceEdit.from = from;
        function to(value) {
            const result = new types.$aK();
            const edits = new map_1.$zi();
            for (const edit of value.edits) {
                if (edit.textEdit) {
                    const item = edit;
                    const uri = uri_1.URI.revive(item.resource);
                    const range = Range.to(item.textEdit.range);
                    const text = item.textEdit.text;
                    const isSnippet = item.textEdit.insertAsSnippet;
                    let editOrSnippetTest;
                    if (isSnippet) {
                        editOrSnippetTest = types.$_J.replace(range, new types.$bK(text));
                    }
                    else {
                        editOrSnippetTest = types.$0J.replace(range, text);
                    }
                    const array = edits.get(uri);
                    if (!array) {
                        edits.set(uri, [editOrSnippetTest]);
                    }
                    else {
                        array.push(editOrSnippetTest);
                    }
                }
                else {
                    result.renameFile(uri_1.URI.revive(edit.oldResource), uri_1.URI.revive(edit.newResource), edit.options);
                }
            }
            for (const [uri, array] of edits) {
                result.set(uri, array);
            }
            return result;
        }
        WorkspaceEdit.to = to;
    })(WorkspaceEdit || (exports.WorkspaceEdit = WorkspaceEdit = {}));
    var SymbolKind;
    (function (SymbolKind) {
        const _fromMapping = Object.create(null);
        _fromMapping[types.SymbolKind.File] = 0 /* languages.SymbolKind.File */;
        _fromMapping[types.SymbolKind.Module] = 1 /* languages.SymbolKind.Module */;
        _fromMapping[types.SymbolKind.Namespace] = 2 /* languages.SymbolKind.Namespace */;
        _fromMapping[types.SymbolKind.Package] = 3 /* languages.SymbolKind.Package */;
        _fromMapping[types.SymbolKind.Class] = 4 /* languages.SymbolKind.Class */;
        _fromMapping[types.SymbolKind.Method] = 5 /* languages.SymbolKind.Method */;
        _fromMapping[types.SymbolKind.Property] = 6 /* languages.SymbolKind.Property */;
        _fromMapping[types.SymbolKind.Field] = 7 /* languages.SymbolKind.Field */;
        _fromMapping[types.SymbolKind.Constructor] = 8 /* languages.SymbolKind.Constructor */;
        _fromMapping[types.SymbolKind.Enum] = 9 /* languages.SymbolKind.Enum */;
        _fromMapping[types.SymbolKind.Interface] = 10 /* languages.SymbolKind.Interface */;
        _fromMapping[types.SymbolKind.Function] = 11 /* languages.SymbolKind.Function */;
        _fromMapping[types.SymbolKind.Variable] = 12 /* languages.SymbolKind.Variable */;
        _fromMapping[types.SymbolKind.Constant] = 13 /* languages.SymbolKind.Constant */;
        _fromMapping[types.SymbolKind.String] = 14 /* languages.SymbolKind.String */;
        _fromMapping[types.SymbolKind.Number] = 15 /* languages.SymbolKind.Number */;
        _fromMapping[types.SymbolKind.Boolean] = 16 /* languages.SymbolKind.Boolean */;
        _fromMapping[types.SymbolKind.Array] = 17 /* languages.SymbolKind.Array */;
        _fromMapping[types.SymbolKind.Object] = 18 /* languages.SymbolKind.Object */;
        _fromMapping[types.SymbolKind.Key] = 19 /* languages.SymbolKind.Key */;
        _fromMapping[types.SymbolKind.Null] = 20 /* languages.SymbolKind.Null */;
        _fromMapping[types.SymbolKind.EnumMember] = 21 /* languages.SymbolKind.EnumMember */;
        _fromMapping[types.SymbolKind.Struct] = 22 /* languages.SymbolKind.Struct */;
        _fromMapping[types.SymbolKind.Event] = 23 /* languages.SymbolKind.Event */;
        _fromMapping[types.SymbolKind.Operator] = 24 /* languages.SymbolKind.Operator */;
        _fromMapping[types.SymbolKind.TypeParameter] = 25 /* languages.SymbolKind.TypeParameter */;
        function from(kind) {
            return typeof _fromMapping[kind] === 'number' ? _fromMapping[kind] : 6 /* languages.SymbolKind.Property */;
        }
        SymbolKind.from = from;
        function to(kind) {
            for (const k in _fromMapping) {
                if (_fromMapping[k] === kind) {
                    return Number(k);
                }
            }
            return types.SymbolKind.Property;
        }
        SymbolKind.to = to;
    })(SymbolKind || (exports.SymbolKind = SymbolKind = {}));
    var SymbolTag;
    (function (SymbolTag) {
        function from(kind) {
            switch (kind) {
                case types.SymbolTag.Deprecated: return 1 /* languages.SymbolTag.Deprecated */;
            }
        }
        SymbolTag.from = from;
        function to(kind) {
            switch (kind) {
                case 1 /* languages.SymbolTag.Deprecated */: return types.SymbolTag.Deprecated;
            }
        }
        SymbolTag.to = to;
    })(SymbolTag || (exports.SymbolTag = SymbolTag = {}));
    var WorkspaceSymbol;
    (function (WorkspaceSymbol) {
        function from(info) {
            return {
                name: info.name,
                kind: SymbolKind.from(info.kind),
                tags: info.tags && info.tags.map(SymbolTag.from),
                containerName: info.containerName,
                location: location.from(info.location)
            };
        }
        WorkspaceSymbol.from = from;
        function to(info) {
            const result = new types.$hK(info.name, SymbolKind.to(info.kind), info.containerName, location.to(info.location));
            result.tags = info.tags && info.tags.map(SymbolTag.to);
            return result;
        }
        WorkspaceSymbol.to = to;
    })(WorkspaceSymbol || (exports.WorkspaceSymbol = WorkspaceSymbol = {}));
    var DocumentSymbol;
    (function (DocumentSymbol) {
        function from(info) {
            const result = {
                name: info.name || '!!MISSING: name!!',
                detail: info.detail,
                range: Range.from(info.range),
                selectionRange: Range.from(info.selectionRange),
                kind: SymbolKind.from(info.kind),
                tags: info.tags?.map(SymbolTag.from) ?? []
            };
            if (info.children) {
                result.children = info.children.map(from);
            }
            return result;
        }
        DocumentSymbol.from = from;
        function to(info) {
            const result = new types.$iK(info.name, info.detail, SymbolKind.to(info.kind), Range.to(info.range), Range.to(info.selectionRange));
            if ((0, arrays_1.$Jb)(info.tags)) {
                result.tags = info.tags.map(SymbolTag.to);
            }
            if (info.children) {
                result.children = info.children.map(to);
            }
            return result;
        }
        DocumentSymbol.to = to;
    })(DocumentSymbol || (exports.DocumentSymbol = DocumentSymbol = {}));
    var CallHierarchyItem;
    (function (CallHierarchyItem) {
        function to(item) {
            const result = new types.$mK(SymbolKind.to(item.kind), item.name, item.detail || '', uri_1.URI.revive(item.uri), Range.to(item.range), Range.to(item.selectionRange));
            result._sessionId = item._sessionId;
            result._itemId = item._itemId;
            return result;
        }
        CallHierarchyItem.to = to;
        function from(item, sessionId, itemId) {
            sessionId = sessionId ?? item._sessionId;
            itemId = itemId ?? item._itemId;
            if (sessionId === undefined || itemId === undefined) {
                throw new Error('invalid item');
            }
            return {
                _sessionId: sessionId,
                _itemId: itemId,
                name: item.name,
                detail: item.detail,
                kind: SymbolKind.from(item.kind),
                uri: item.uri,
                range: Range.from(item.range),
                selectionRange: Range.from(item.selectionRange),
                tags: item.tags?.map(SymbolTag.from)
            };
        }
        CallHierarchyItem.from = from;
    })(CallHierarchyItem || (exports.CallHierarchyItem = CallHierarchyItem = {}));
    var CallHierarchyIncomingCall;
    (function (CallHierarchyIncomingCall) {
        function to(item) {
            return new types.$nK(CallHierarchyItem.to(item.from), item.fromRanges.map(r => Range.to(r)));
        }
        CallHierarchyIncomingCall.to = to;
    })(CallHierarchyIncomingCall || (exports.CallHierarchyIncomingCall = CallHierarchyIncomingCall = {}));
    var CallHierarchyOutgoingCall;
    (function (CallHierarchyOutgoingCall) {
        function to(item) {
            return new types.$oK(CallHierarchyItem.to(item.to), item.fromRanges.map(r => Range.to(r)));
        }
        CallHierarchyOutgoingCall.to = to;
    })(CallHierarchyOutgoingCall || (exports.CallHierarchyOutgoingCall = CallHierarchyOutgoingCall = {}));
    var location;
    (function (location) {
        function from(value) {
            return {
                range: value.range && Range.from(value.range),
                uri: value.uri
            };
        }
        location.from = from;
        function to(value) {
            return new types.$cK(uri_1.URI.revive(value.uri), Range.to(value.range));
        }
        location.to = to;
    })(location || (exports.location = location = {}));
    var DefinitionLink;
    (function (DefinitionLink) {
        function from(value) {
            const definitionLink = value;
            const location = value;
            return {
                originSelectionRange: definitionLink.originSelectionRange
                    ? Range.from(definitionLink.originSelectionRange)
                    : undefined,
                uri: definitionLink.targetUri ? definitionLink.targetUri : location.uri,
                range: Range.from(definitionLink.targetRange ? definitionLink.targetRange : location.range),
                targetSelectionRange: definitionLink.targetSelectionRange
                    ? Range.from(definitionLink.targetSelectionRange)
                    : undefined,
            };
        }
        DefinitionLink.from = from;
        function to(value) {
            return {
                targetUri: uri_1.URI.revive(value.uri),
                targetRange: Range.to(value.range),
                targetSelectionRange: value.targetSelectionRange
                    ? Range.to(value.targetSelectionRange)
                    : undefined,
                originSelectionRange: value.originSelectionRange
                    ? Range.to(value.originSelectionRange)
                    : undefined
            };
        }
        DefinitionLink.to = to;
    })(DefinitionLink || (exports.DefinitionLink = DefinitionLink = {}));
    var Hover;
    (function (Hover) {
        function from(hover) {
            return {
                range: Range.from(hover.range),
                contents: MarkdownString.fromMany(hover.contents)
            };
        }
        Hover.from = from;
        function to(info) {
            return new types.$fK(info.contents.map(MarkdownString.to), Range.to(info.range));
        }
        Hover.to = to;
    })(Hover || (exports.Hover = Hover = {}));
    var EvaluatableExpression;
    (function (EvaluatableExpression) {
        function from(expression) {
            return {
                range: Range.from(expression.range),
                expression: expression.expression
            };
        }
        EvaluatableExpression.from = from;
        function to(info) {
            return new types.$$K(Range.to(info.range), info.expression);
        }
        EvaluatableExpression.to = to;
    })(EvaluatableExpression || (exports.EvaluatableExpression = EvaluatableExpression = {}));
    var InlineValue;
    (function (InlineValue) {
        function from(inlineValue) {
            if (inlineValue instanceof types.$_K) {
                return {
                    type: 'text',
                    range: Range.from(inlineValue.range),
                    text: inlineValue.text
                };
            }
            else if (inlineValue instanceof types.$aL) {
                return {
                    type: 'variable',
                    range: Range.from(inlineValue.range),
                    variableName: inlineValue.variableName,
                    caseSensitiveLookup: inlineValue.caseSensitiveLookup
                };
            }
            else if (inlineValue instanceof types.$bL) {
                return {
                    type: 'expression',
                    range: Range.from(inlineValue.range),
                    expression: inlineValue.expression
                };
            }
            else {
                throw new Error(`Unknown 'InlineValue' type`);
            }
        }
        InlineValue.from = from;
        function to(inlineValue) {
            switch (inlineValue.type) {
                case 'text':
                    return {
                        range: Range.to(inlineValue.range),
                        text: inlineValue.text
                    };
                case 'variable':
                    return {
                        range: Range.to(inlineValue.range),
                        variableName: inlineValue.variableName,
                        caseSensitiveLookup: inlineValue.caseSensitiveLookup
                    };
                case 'expression':
                    return {
                        range: Range.to(inlineValue.range),
                        expression: inlineValue.expression
                    };
            }
        }
        InlineValue.to = to;
    })(InlineValue || (exports.InlineValue = InlineValue = {}));
    var InlineValueContext;
    (function (InlineValueContext) {
        function from(inlineValueContext) {
            return {
                frameId: inlineValueContext.frameId,
                stoppedLocation: Range.from(inlineValueContext.stoppedLocation)
            };
        }
        InlineValueContext.from = from;
        function to(inlineValueContext) {
            return new types.$cL(inlineValueContext.frameId, Range.to(inlineValueContext.stoppedLocation));
        }
        InlineValueContext.to = to;
    })(InlineValueContext || (exports.InlineValueContext = InlineValueContext = {}));
    var DocumentHighlight;
    (function (DocumentHighlight) {
        function from(documentHighlight) {
            return {
                range: Range.from(documentHighlight.range),
                kind: documentHighlight.kind
            };
        }
        DocumentHighlight.from = from;
        function to(occurrence) {
            return new types.$gK(Range.to(occurrence.range), occurrence.kind);
        }
        DocumentHighlight.to = to;
    })(DocumentHighlight || (exports.DocumentHighlight = DocumentHighlight = {}));
    var CompletionTriggerKind;
    (function (CompletionTriggerKind) {
        function to(kind) {
            switch (kind) {
                case 1 /* languages.CompletionTriggerKind.TriggerCharacter */:
                    return types.CompletionTriggerKind.TriggerCharacter;
                case 2 /* languages.CompletionTriggerKind.TriggerForIncompleteCompletions */:
                    return types.CompletionTriggerKind.TriggerForIncompleteCompletions;
                case 0 /* languages.CompletionTriggerKind.Invoke */:
                default:
                    return types.CompletionTriggerKind.Invoke;
            }
        }
        CompletionTriggerKind.to = to;
    })(CompletionTriggerKind || (exports.CompletionTriggerKind = CompletionTriggerKind = {}));
    var CompletionContext;
    (function (CompletionContext) {
        function to(context) {
            return {
                triggerKind: CompletionTriggerKind.to(context.triggerKind),
                triggerCharacter: context.triggerCharacter
            };
        }
        CompletionContext.to = to;
    })(CompletionContext || (exports.CompletionContext = CompletionContext = {}));
    var CompletionItemTag;
    (function (CompletionItemTag) {
        function from(kind) {
            switch (kind) {
                case types.CompletionItemTag.Deprecated: return 1 /* languages.CompletionItemTag.Deprecated */;
            }
        }
        CompletionItemTag.from = from;
        function to(kind) {
            switch (kind) {
                case 1 /* languages.CompletionItemTag.Deprecated */: return types.CompletionItemTag.Deprecated;
            }
        }
        CompletionItemTag.to = to;
    })(CompletionItemTag || (exports.CompletionItemTag = CompletionItemTag = {}));
    var CompletionItemKind;
    (function (CompletionItemKind) {
        const _from = new Map([
            [types.CompletionItemKind.Method, 0 /* languages.CompletionItemKind.Method */],
            [types.CompletionItemKind.Function, 1 /* languages.CompletionItemKind.Function */],
            [types.CompletionItemKind.Constructor, 2 /* languages.CompletionItemKind.Constructor */],
            [types.CompletionItemKind.Field, 3 /* languages.CompletionItemKind.Field */],
            [types.CompletionItemKind.Variable, 4 /* languages.CompletionItemKind.Variable */],
            [types.CompletionItemKind.Class, 5 /* languages.CompletionItemKind.Class */],
            [types.CompletionItemKind.Interface, 7 /* languages.CompletionItemKind.Interface */],
            [types.CompletionItemKind.Struct, 6 /* languages.CompletionItemKind.Struct */],
            [types.CompletionItemKind.Module, 8 /* languages.CompletionItemKind.Module */],
            [types.CompletionItemKind.Property, 9 /* languages.CompletionItemKind.Property */],
            [types.CompletionItemKind.Unit, 12 /* languages.CompletionItemKind.Unit */],
            [types.CompletionItemKind.Value, 13 /* languages.CompletionItemKind.Value */],
            [types.CompletionItemKind.Constant, 14 /* languages.CompletionItemKind.Constant */],
            [types.CompletionItemKind.Enum, 15 /* languages.CompletionItemKind.Enum */],
            [types.CompletionItemKind.EnumMember, 16 /* languages.CompletionItemKind.EnumMember */],
            [types.CompletionItemKind.Keyword, 17 /* languages.CompletionItemKind.Keyword */],
            [types.CompletionItemKind.Snippet, 27 /* languages.CompletionItemKind.Snippet */],
            [types.CompletionItemKind.Text, 18 /* languages.CompletionItemKind.Text */],
            [types.CompletionItemKind.Color, 19 /* languages.CompletionItemKind.Color */],
            [types.CompletionItemKind.File, 20 /* languages.CompletionItemKind.File */],
            [types.CompletionItemKind.Reference, 21 /* languages.CompletionItemKind.Reference */],
            [types.CompletionItemKind.Folder, 23 /* languages.CompletionItemKind.Folder */],
            [types.CompletionItemKind.Event, 10 /* languages.CompletionItemKind.Event */],
            [types.CompletionItemKind.Operator, 11 /* languages.CompletionItemKind.Operator */],
            [types.CompletionItemKind.TypeParameter, 24 /* languages.CompletionItemKind.TypeParameter */],
            [types.CompletionItemKind.Issue, 26 /* languages.CompletionItemKind.Issue */],
            [types.CompletionItemKind.User, 25 /* languages.CompletionItemKind.User */],
        ]);
        function from(kind) {
            return _from.get(kind) ?? 9 /* languages.CompletionItemKind.Property */;
        }
        CompletionItemKind.from = from;
        const _to = new Map([
            [0 /* languages.CompletionItemKind.Method */, types.CompletionItemKind.Method],
            [1 /* languages.CompletionItemKind.Function */, types.CompletionItemKind.Function],
            [2 /* languages.CompletionItemKind.Constructor */, types.CompletionItemKind.Constructor],
            [3 /* languages.CompletionItemKind.Field */, types.CompletionItemKind.Field],
            [4 /* languages.CompletionItemKind.Variable */, types.CompletionItemKind.Variable],
            [5 /* languages.CompletionItemKind.Class */, types.CompletionItemKind.Class],
            [7 /* languages.CompletionItemKind.Interface */, types.CompletionItemKind.Interface],
            [6 /* languages.CompletionItemKind.Struct */, types.CompletionItemKind.Struct],
            [8 /* languages.CompletionItemKind.Module */, types.CompletionItemKind.Module],
            [9 /* languages.CompletionItemKind.Property */, types.CompletionItemKind.Property],
            [12 /* languages.CompletionItemKind.Unit */, types.CompletionItemKind.Unit],
            [13 /* languages.CompletionItemKind.Value */, types.CompletionItemKind.Value],
            [14 /* languages.CompletionItemKind.Constant */, types.CompletionItemKind.Constant],
            [15 /* languages.CompletionItemKind.Enum */, types.CompletionItemKind.Enum],
            [16 /* languages.CompletionItemKind.EnumMember */, types.CompletionItemKind.EnumMember],
            [17 /* languages.CompletionItemKind.Keyword */, types.CompletionItemKind.Keyword],
            [27 /* languages.CompletionItemKind.Snippet */, types.CompletionItemKind.Snippet],
            [18 /* languages.CompletionItemKind.Text */, types.CompletionItemKind.Text],
            [19 /* languages.CompletionItemKind.Color */, types.CompletionItemKind.Color],
            [20 /* languages.CompletionItemKind.File */, types.CompletionItemKind.File],
            [21 /* languages.CompletionItemKind.Reference */, types.CompletionItemKind.Reference],
            [23 /* languages.CompletionItemKind.Folder */, types.CompletionItemKind.Folder],
            [10 /* languages.CompletionItemKind.Event */, types.CompletionItemKind.Event],
            [11 /* languages.CompletionItemKind.Operator */, types.CompletionItemKind.Operator],
            [24 /* languages.CompletionItemKind.TypeParameter */, types.CompletionItemKind.TypeParameter],
            [25 /* languages.CompletionItemKind.User */, types.CompletionItemKind.User],
            [26 /* languages.CompletionItemKind.Issue */, types.CompletionItemKind.Issue],
        ]);
        function to(kind) {
            return _to.get(kind) ?? types.CompletionItemKind.Property;
        }
        CompletionItemKind.to = to;
    })(CompletionItemKind || (exports.CompletionItemKind = CompletionItemKind = {}));
    var CompletionItem;
    (function (CompletionItem) {
        function to(suggestion, converter) {
            const result = new types.$wK(suggestion.label);
            result.insertText = suggestion.insertText;
            result.kind = CompletionItemKind.to(suggestion.kind);
            result.tags = suggestion.tags?.map(CompletionItemTag.to);
            result.detail = suggestion.detail;
            result.documentation = htmlContent.$Zj(suggestion.documentation) ? MarkdownString.to(suggestion.documentation) : suggestion.documentation;
            result.sortText = suggestion.sortText;
            result.filterText = suggestion.filterText;
            result.preselect = suggestion.preselect;
            result.commitCharacters = suggestion.commitCharacters;
            // range
            if (editorRange.$ks.isIRange(suggestion.range)) {
                result.range = Range.to(suggestion.range);
            }
            else if (typeof suggestion.range === 'object') {
                result.range = { inserting: Range.to(suggestion.range.insert), replacing: Range.to(suggestion.range.replace) };
            }
            result.keepWhitespace = typeof suggestion.insertTextRules === 'undefined' ? false : Boolean(suggestion.insertTextRules & 1 /* languages.CompletionItemInsertTextRule.KeepWhitespace */);
            // 'insertText'-logic
            if (typeof suggestion.insertTextRules !== 'undefined' && suggestion.insertTextRules & 4 /* languages.CompletionItemInsertTextRule.InsertAsSnippet */) {
                result.insertText = new types.$bK(suggestion.insertText);
            }
            else {
                result.insertText = suggestion.insertText;
                result.textEdit = result.range instanceof types.$5J ? new types.$0J(result.range, result.insertText) : undefined;
            }
            if (suggestion.additionalTextEdits && suggestion.additionalTextEdits.length > 0) {
                result.additionalTextEdits = suggestion.additionalTextEdits.map(e => TextEdit.to(e));
            }
            result.command = converter && suggestion.command ? converter.fromInternal(suggestion.command) : undefined;
            return result;
        }
        CompletionItem.to = to;
    })(CompletionItem || (exports.CompletionItem = CompletionItem = {}));
    var ParameterInformation;
    (function (ParameterInformation) {
        function from(info) {
            if (typeof info.label !== 'string' && !Array.isArray(info.label)) {
                throw new TypeError('Invalid label');
            }
            return {
                label: info.label,
                documentation: MarkdownString.fromStrict(info.documentation)
            };
        }
        ParameterInformation.from = from;
        function to(info) {
            return {
                label: info.label,
                documentation: htmlContent.$Zj(info.documentation) ? MarkdownString.to(info.documentation) : info.documentation
            };
        }
        ParameterInformation.to = to;
    })(ParameterInformation || (exports.ParameterInformation = ParameterInformation = {}));
    var SignatureInformation;
    (function (SignatureInformation) {
        function from(info) {
            return {
                label: info.label,
                documentation: MarkdownString.fromStrict(info.documentation),
                parameters: Array.isArray(info.parameters) ? info.parameters.map(ParameterInformation.from) : [],
                activeParameter: info.activeParameter,
            };
        }
        SignatureInformation.from = from;
        function to(info) {
            return {
                label: info.label,
                documentation: htmlContent.$Zj(info.documentation) ? MarkdownString.to(info.documentation) : info.documentation,
                parameters: Array.isArray(info.parameters) ? info.parameters.map(ParameterInformation.to) : [],
                activeParameter: info.activeParameter,
            };
        }
        SignatureInformation.to = to;
    })(SignatureInformation || (exports.SignatureInformation = SignatureInformation = {}));
    var SignatureHelp;
    (function (SignatureHelp) {
        function from(help) {
            return {
                activeSignature: help.activeSignature,
                activeParameter: help.activeParameter,
                signatures: Array.isArray(help.signatures) ? help.signatures.map(SignatureInformation.from) : [],
            };
        }
        SignatureHelp.from = from;
        function to(help) {
            return {
                activeSignature: help.activeSignature,
                activeParameter: help.activeParameter,
                signatures: Array.isArray(help.signatures) ? help.signatures.map(SignatureInformation.to) : [],
            };
        }
        SignatureHelp.to = to;
    })(SignatureHelp || (exports.SignatureHelp = SignatureHelp = {}));
    var InlayHint;
    (function (InlayHint) {
        function to(converter, hint) {
            const res = new types.$vK(Position.to(hint.position), typeof hint.label === 'string' ? hint.label : hint.label.map(InlayHintLabelPart.to.bind(undefined, converter)), hint.kind && InlayHintKind.to(hint.kind));
            res.textEdits = hint.textEdits && hint.textEdits.map(TextEdit.to);
            res.tooltip = htmlContent.$Zj(hint.tooltip) ? MarkdownString.to(hint.tooltip) : hint.tooltip;
            res.paddingLeft = hint.paddingLeft;
            res.paddingRight = hint.paddingRight;
            return res;
        }
        InlayHint.to = to;
    })(InlayHint || (exports.InlayHint = InlayHint = {}));
    var InlayHintLabelPart;
    (function (InlayHintLabelPart) {
        function to(converter, part) {
            const result = new types.$uK(part.label);
            result.tooltip = htmlContent.$Zj(part.tooltip)
                ? MarkdownString.to(part.tooltip)
                : part.tooltip;
            if (languages.Command.is(part.command)) {
                result.command = converter.fromInternal(part.command);
            }
            if (part.location) {
                result.location = location.to(part.location);
            }
            return result;
        }
        InlayHintLabelPart.to = to;
    })(InlayHintLabelPart || (exports.InlayHintLabelPart = InlayHintLabelPart = {}));
    var InlayHintKind;
    (function (InlayHintKind) {
        function from(kind) {
            return kind;
        }
        InlayHintKind.from = from;
        function to(kind) {
            return kind;
        }
        InlayHintKind.to = to;
    })(InlayHintKind || (exports.InlayHintKind = InlayHintKind = {}));
    var DocumentLink;
    (function (DocumentLink) {
        function from(link) {
            return {
                range: Range.from(link.range),
                url: link.target,
                tooltip: link.tooltip
            };
        }
        DocumentLink.from = from;
        function to(link) {
            let target = undefined;
            if (link.url) {
                try {
                    target = typeof link.url === 'string' ? uri_1.URI.parse(link.url, true) : uri_1.URI.revive(link.url);
                }
                catch (err) {
                    // ignore
                }
            }
            return new types.$BK(Range.to(link.range), target);
        }
        DocumentLink.to = to;
    })(DocumentLink || (exports.DocumentLink = DocumentLink = {}));
    var ColorPresentation;
    (function (ColorPresentation) {
        function to(colorPresentation) {
            const cp = new types.$EK(colorPresentation.label);
            if (colorPresentation.textEdit) {
                cp.textEdit = TextEdit.to(colorPresentation.textEdit);
            }
            if (colorPresentation.additionalTextEdits) {
                cp.additionalTextEdits = colorPresentation.additionalTextEdits.map(value => TextEdit.to(value));
            }
            return cp;
        }
        ColorPresentation.to = to;
        function from(colorPresentation) {
            return {
                label: colorPresentation.label,
                textEdit: colorPresentation.textEdit ? TextEdit.from(colorPresentation.textEdit) : undefined,
                additionalTextEdits: colorPresentation.additionalTextEdits ? colorPresentation.additionalTextEdits.map(value => TextEdit.from(value)) : undefined
            };
        }
        ColorPresentation.from = from;
    })(ColorPresentation || (exports.ColorPresentation = ColorPresentation = {}));
    var Color;
    (function (Color) {
        function to(c) {
            return new types.$CK(c[0], c[1], c[2], c[3]);
        }
        Color.to = to;
        function from(color) {
            return [color.red, color.green, color.blue, color.alpha];
        }
        Color.from = from;
    })(Color || (exports.Color = Color = {}));
    var SelectionRange;
    (function (SelectionRange) {
        function from(obj) {
            return { range: Range.from(obj.range) };
        }
        SelectionRange.from = from;
        function to(obj) {
            return new types.$lK(Range.to(obj.range));
        }
        SelectionRange.to = to;
    })(SelectionRange || (exports.SelectionRange = SelectionRange = {}));
    var TextDocumentSaveReason;
    (function (TextDocumentSaveReason) {
        function to(reason) {
            switch (reason) {
                case 2 /* SaveReason.AUTO */:
                    return types.TextDocumentSaveReason.AfterDelay;
                case 1 /* SaveReason.EXPLICIT */:
                    return types.TextDocumentSaveReason.Manual;
                case 3 /* SaveReason.FOCUS_CHANGE */:
                case 4 /* SaveReason.WINDOW_CHANGE */:
                    return types.TextDocumentSaveReason.FocusOut;
            }
        }
        TextDocumentSaveReason.to = to;
    })(TextDocumentSaveReason || (exports.TextDocumentSaveReason = TextDocumentSaveReason = {}));
    var TextEditorLineNumbersStyle;
    (function (TextEditorLineNumbersStyle) {
        function from(style) {
            switch (style) {
                case types.TextEditorLineNumbersStyle.Off:
                    return 0 /* RenderLineNumbersType.Off */;
                case types.TextEditorLineNumbersStyle.Relative:
                    return 2 /* RenderLineNumbersType.Relative */;
                case types.TextEditorLineNumbersStyle.On:
                default:
                    return 1 /* RenderLineNumbersType.On */;
            }
        }
        TextEditorLineNumbersStyle.from = from;
        function to(style) {
            switch (style) {
                case 0 /* RenderLineNumbersType.Off */:
                    return types.TextEditorLineNumbersStyle.Off;
                case 2 /* RenderLineNumbersType.Relative */:
                    return types.TextEditorLineNumbersStyle.Relative;
                case 1 /* RenderLineNumbersType.On */:
                default:
                    return types.TextEditorLineNumbersStyle.On;
            }
        }
        TextEditorLineNumbersStyle.to = to;
    })(TextEditorLineNumbersStyle || (exports.TextEditorLineNumbersStyle = TextEditorLineNumbersStyle = {}));
    var EndOfLine;
    (function (EndOfLine) {
        function from(eol) {
            if (eol === types.EndOfLine.CRLF) {
                return 1 /* EndOfLineSequence.CRLF */;
            }
            else if (eol === types.EndOfLine.LF) {
                return 0 /* EndOfLineSequence.LF */;
            }
            return undefined;
        }
        EndOfLine.from = from;
        function to(eol) {
            if (eol === 1 /* EndOfLineSequence.CRLF */) {
                return types.EndOfLine.CRLF;
            }
            else if (eol === 0 /* EndOfLineSequence.LF */) {
                return types.EndOfLine.LF;
            }
            return undefined;
        }
        EndOfLine.to = to;
    })(EndOfLine || (exports.EndOfLine = EndOfLine = {}));
    var ProgressLocation;
    (function (ProgressLocation) {
        function from(loc) {
            if (typeof loc === 'object') {
                return loc.viewId;
            }
            switch (loc) {
                case types.ProgressLocation.SourceControl: return 3 /* MainProgressLocation.Scm */;
                case types.ProgressLocation.Window: return 10 /* MainProgressLocation.Window */;
                case types.ProgressLocation.Notification: return 15 /* MainProgressLocation.Notification */;
            }
            throw new Error(`Unknown 'ProgressLocation'`);
        }
        ProgressLocation.from = from;
    })(ProgressLocation || (exports.ProgressLocation = ProgressLocation = {}));
    var FoldingRange;
    (function (FoldingRange) {
        function from(r) {
            const range = { start: r.start + 1, end: r.end + 1 };
            if (r.kind) {
                range.kind = FoldingRangeKind.from(r.kind);
            }
            return range;
        }
        FoldingRange.from = from;
        function to(r) {
            const range = { start: r.start - 1, end: r.end - 1 };
            if (r.kind) {
                range.kind = FoldingRangeKind.to(r.kind);
            }
            return range;
        }
        FoldingRange.to = to;
    })(FoldingRange || (exports.FoldingRange = FoldingRange = {}));
    var FoldingRangeKind;
    (function (FoldingRangeKind) {
        function from(kind) {
            if (kind) {
                switch (kind) {
                    case types.FoldingRangeKind.Comment:
                        return languages.$_s.Comment;
                    case types.FoldingRangeKind.Imports:
                        return languages.$_s.Imports;
                    case types.FoldingRangeKind.Region:
                        return languages.$_s.Region;
                }
            }
            return undefined;
        }
        FoldingRangeKind.from = from;
        function to(kind) {
            if (kind) {
                switch (kind.value) {
                    case languages.$_s.Comment.value:
                        return types.FoldingRangeKind.Comment;
                    case languages.$_s.Imports.value:
                        return types.FoldingRangeKind.Imports;
                    case languages.$_s.Region.value:
                        return types.FoldingRangeKind.Region;
                }
            }
            return undefined;
        }
        FoldingRangeKind.to = to;
    })(FoldingRangeKind || (exports.FoldingRangeKind = FoldingRangeKind = {}));
    var TextEditorOpenOptions;
    (function (TextEditorOpenOptions) {
        function from(options) {
            if (options) {
                return {
                    pinned: typeof options.preview === 'boolean' ? !options.preview : undefined,
                    inactive: options.background,
                    preserveFocus: options.preserveFocus,
                    selection: typeof options.selection === 'object' ? Range.from(options.selection) : undefined,
                    override: typeof options.override === 'boolean' ? editor_1.$HE.id : undefined
                };
            }
            return undefined;
        }
        TextEditorOpenOptions.from = from;
    })(TextEditorOpenOptions || (exports.TextEditorOpenOptions = TextEditorOpenOptions = {}));
    var GlobPattern;
    (function (GlobPattern) {
        function from(pattern) {
            if (pattern instanceof types.$YK) {
                return pattern.toJSON();
            }
            if (typeof pattern === 'string') {
                return pattern;
            }
            // This is slightly bogus because we declare this method to accept
            // `vscode.GlobPattern` which can be `vscode.RelativePattern` class,
            // but given we cannot enforce classes from our vscode.d.ts, we have
            // to probe for objects too
            // Refs: https://github.com/microsoft/vscode/issues/140771
            if (isRelativePatternShape(pattern) || isLegacyRelativePatternShape(pattern)) {
                return new types.$YK(pattern.baseUri ?? pattern.base, pattern.pattern).toJSON();
            }
            return pattern; // preserve `undefined` and `null`
        }
        GlobPattern.from = from;
        function isRelativePatternShape(obj) {
            const rp = obj;
            if (!rp) {
                return false;
            }
            return uri_1.URI.isUri(rp.baseUri) && typeof rp.pattern === 'string';
        }
        function isLegacyRelativePatternShape(obj) {
            // Before 1.64.x, `RelativePattern` did not have any `baseUri: Uri`
            // property. To preserve backwards compatibility with older extensions
            // we allow this old format when creating the `vscode.RelativePattern`.
            const rp = obj;
            if (!rp) {
                return false;
            }
            return typeof rp.base === 'string' && typeof rp.pattern === 'string';
        }
        function to(pattern) {
            if (typeof pattern === 'string') {
                return pattern;
            }
            return new types.$YK(uri_1.URI.revive(pattern.baseUri), pattern.pattern);
        }
        GlobPattern.to = to;
    })(GlobPattern || (exports.GlobPattern = GlobPattern = {}));
    var LanguageSelector;
    (function (LanguageSelector) {
        function from(selector) {
            if (!selector) {
                return undefined;
            }
            else if (Array.isArray(selector)) {
                return selector.map(from);
            }
            else if (typeof selector === 'string') {
                return selector;
            }
            else {
                const filter = selector; // TODO: microsoft/TypeScript#42768
                return {
                    language: filter.language,
                    scheme: filter.scheme,
                    pattern: GlobPattern.from(filter.pattern),
                    exclusive: filter.exclusive,
                    notebookType: filter.notebookType
                };
            }
        }
        LanguageSelector.from = from;
    })(LanguageSelector || (exports.LanguageSelector = LanguageSelector = {}));
    var MappedEditsContext;
    (function (MappedEditsContext) {
        function is(v) {
            return (!!v &&
                typeof v === 'object' &&
                'selections' in v &&
                Array.isArray(v.selections) &&
                v.selections.every(s => s instanceof types.$6J) &&
                'related' in v &&
                Array.isArray(v.related) &&
                v.related.every(e => e && typeof e === 'object' && uri_1.URI.isUri(e.uri) && e.range instanceof types.$5J));
        }
        MappedEditsContext.is = is;
        function from(extContext) {
            return {
                selections: extContext.selections.map(s => Selection.from(s)),
                related: extContext.related.map(r => ({
                    uri: uri_1.URI.from(r.uri),
                    range: Range.from(r.range)
                }))
            };
        }
        MappedEditsContext.from = from;
    })(MappedEditsContext || (exports.MappedEditsContext = MappedEditsContext = {}));
    var NotebookRange;
    (function (NotebookRange) {
        function from(range) {
            return { start: range.start, end: range.end };
        }
        NotebookRange.from = from;
        function to(range) {
            return new types.$nL(range.start, range.end);
        }
        NotebookRange.to = to;
    })(NotebookRange || (exports.NotebookRange = NotebookRange = {}));
    var NotebookCellExecutionSummary;
    (function (NotebookCellExecutionSummary) {
        function to(data) {
            return {
                timing: typeof data.runStartTime === 'number' && typeof data.runEndTime === 'number' ? { startTime: data.runStartTime, endTime: data.runEndTime } : undefined,
                executionOrder: data.executionOrder,
                success: data.lastRunSuccess
            };
        }
        NotebookCellExecutionSummary.to = to;
        function from(data) {
            return {
                lastRunSuccess: data.success,
                runStartTime: data.timing?.startTime,
                runEndTime: data.timing?.endTime,
                executionOrder: data.executionOrder
            };
        }
        NotebookCellExecutionSummary.from = from;
    })(NotebookCellExecutionSummary || (exports.NotebookCellExecutionSummary = NotebookCellExecutionSummary = {}));
    var NotebookCellExecutionState;
    (function (NotebookCellExecutionState) {
        function to(state) {
            if (state === notebooks.NotebookCellExecutionState.Unconfirmed) {
                return types.NotebookCellExecutionState.Pending;
            }
            else if (state === notebooks.NotebookCellExecutionState.Pending) {
                // Since the (proposed) extension API doesn't have the distinction between Unconfirmed and Pending, we don't want to fire an update for Pending twice
                return undefined;
            }
            else if (state === notebooks.NotebookCellExecutionState.Executing) {
                return types.NotebookCellExecutionState.Executing;
            }
            else {
                throw new Error(`Unknown state: ${state}`);
            }
        }
        NotebookCellExecutionState.to = to;
    })(NotebookCellExecutionState || (exports.NotebookCellExecutionState = NotebookCellExecutionState = {}));
    var NotebookCellKind;
    (function (NotebookCellKind) {
        function from(data) {
            switch (data) {
                case types.NotebookCellKind.Markup:
                    return notebooks.CellKind.Markup;
                case types.NotebookCellKind.Code:
                default:
                    return notebooks.CellKind.Code;
            }
        }
        NotebookCellKind.from = from;
        function to(data) {
            switch (data) {
                case notebooks.CellKind.Markup:
                    return types.NotebookCellKind.Markup;
                case notebooks.CellKind.Code:
                default:
                    return types.NotebookCellKind.Code;
            }
        }
        NotebookCellKind.to = to;
    })(NotebookCellKind || (exports.NotebookCellKind = NotebookCellKind = {}));
    var NotebookData;
    (function (NotebookData) {
        function from(data) {
            const res = {
                metadata: data.metadata ?? Object.create(null),
                cells: [],
            };
            for (const cell of data.cells) {
                types.$oL.validate(cell);
                res.cells.push(NotebookCellData.from(cell));
            }
            return res;
        }
        NotebookData.from = from;
        function to(data) {
            const res = new types.$pL(data.cells.map(NotebookCellData.to));
            if (!(0, types_1.$wf)(data.metadata)) {
                res.metadata = data.metadata;
            }
            return res;
        }
        NotebookData.to = to;
    })(NotebookData || (exports.NotebookData = NotebookData = {}));
    var NotebookCellData;
    (function (NotebookCellData) {
        function from(data) {
            return {
                cellKind: NotebookCellKind.from(data.kind),
                language: data.languageId,
                mime: data.mime,
                source: data.value,
                metadata: data.metadata,
                internalMetadata: NotebookCellExecutionSummary.from(data.executionSummary ?? {}),
                outputs: data.outputs ? data.outputs.map(NotebookCellOutput.from) : []
            };
        }
        NotebookCellData.from = from;
        function to(data) {
            return new types.$oL(NotebookCellKind.to(data.cellKind), data.source, data.language, data.mime, data.outputs ? data.outputs.map(NotebookCellOutput.to) : undefined, data.metadata, data.internalMetadata ? NotebookCellExecutionSummary.to(data.internalMetadata) : undefined);
        }
        NotebookCellData.to = to;
    })(NotebookCellData || (exports.NotebookCellData = NotebookCellData = {}));
    var NotebookCellOutputItem;
    (function (NotebookCellOutputItem) {
        function from(item) {
            return {
                mime: item.mime,
                valueBytes: buffer_1.$Fd.wrap(item.data),
            };
        }
        NotebookCellOutputItem.from = from;
        function to(item) {
            return new types.$qL(item.valueBytes.buffer, item.mime);
        }
        NotebookCellOutputItem.to = to;
    })(NotebookCellOutputItem || (exports.NotebookCellOutputItem = NotebookCellOutputItem = {}));
    var NotebookCellOutput;
    (function (NotebookCellOutput) {
        function from(output) {
            return {
                outputId: output.id,
                items: output.items.map(NotebookCellOutputItem.from),
                metadata: output.metadata
            };
        }
        NotebookCellOutput.from = from;
        function to(output) {
            const items = output.items.map(NotebookCellOutputItem.to);
            return new types.$rL(items, output.outputId, output.metadata);
        }
        NotebookCellOutput.to = to;
    })(NotebookCellOutput || (exports.NotebookCellOutput = NotebookCellOutput = {}));
    var NotebookExclusiveDocumentPattern;
    (function (NotebookExclusiveDocumentPattern) {
        function from(pattern) {
            if (isExclusivePattern(pattern)) {
                return {
                    include: GlobPattern.from(pattern.include) ?? undefined,
                    exclude: GlobPattern.from(pattern.exclude) ?? undefined,
                };
            }
            return GlobPattern.from(pattern) ?? undefined;
        }
        NotebookExclusiveDocumentPattern.from = from;
        function to(pattern) {
            if (isExclusivePattern(pattern)) {
                return {
                    include: GlobPattern.to(pattern.include),
                    exclude: GlobPattern.to(pattern.exclude)
                };
            }
            return GlobPattern.to(pattern);
        }
        NotebookExclusiveDocumentPattern.to = to;
        function isExclusivePattern(obj) {
            const ep = obj;
            if (!ep) {
                return false;
            }
            return !(0, types_1.$sf)(ep.include) && !(0, types_1.$sf)(ep.exclude);
        }
    })(NotebookExclusiveDocumentPattern || (exports.NotebookExclusiveDocumentPattern = NotebookExclusiveDocumentPattern = {}));
    var NotebookStatusBarItem;
    (function (NotebookStatusBarItem) {
        function from(item, commandsConverter, disposables) {
            const command = typeof item.command === 'string' ? { title: '', command: item.command } : item.command;
            return {
                alignment: item.alignment === types.NotebookCellStatusBarAlignment.Left ? 1 /* notebooks.CellStatusbarAlignment.Left */ : 2 /* notebooks.CellStatusbarAlignment.Right */,
                command: commandsConverter.toInternal(command, disposables),
                text: item.text,
                tooltip: item.tooltip,
                accessibilityInformation: item.accessibilityInformation,
                priority: item.priority
            };
        }
        NotebookStatusBarItem.from = from;
    })(NotebookStatusBarItem || (exports.NotebookStatusBarItem = NotebookStatusBarItem = {}));
    var NotebookKernelSourceAction;
    (function (NotebookKernelSourceAction) {
        function from(item, commandsConverter, disposables) {
            const command = typeof item.command === 'string' ? { title: '', command: item.command } : item.command;
            return {
                command: commandsConverter.toInternal(command, disposables),
                label: item.label,
                description: item.description,
                detail: item.detail,
                documentation: item.documentation
            };
        }
        NotebookKernelSourceAction.from = from;
    })(NotebookKernelSourceAction || (exports.NotebookKernelSourceAction = NotebookKernelSourceAction = {}));
    var NotebookDocumentContentOptions;
    (function (NotebookDocumentContentOptions) {
        function from(options) {
            return {
                transientOutputs: options?.transientOutputs ?? false,
                transientCellMetadata: options?.transientCellMetadata ?? {},
                transientDocumentMetadata: options?.transientDocumentMetadata ?? {},
                cellContentMetadata: options?.cellContentMetadata ?? {}
            };
        }
        NotebookDocumentContentOptions.from = from;
    })(NotebookDocumentContentOptions || (exports.NotebookDocumentContentOptions = NotebookDocumentContentOptions = {}));
    var NotebookRendererScript;
    (function (NotebookRendererScript) {
        function from(preload) {
            return {
                uri: preload.uri,
                provides: preload.provides
            };
        }
        NotebookRendererScript.from = from;
        function to(preload) {
            return new types.$tL(uri_1.URI.revive(preload.uri), preload.provides);
        }
        NotebookRendererScript.to = to;
    })(NotebookRendererScript || (exports.NotebookRendererScript = NotebookRendererScript = {}));
    var TestMessage;
    (function (TestMessage) {
        function from(message) {
            return {
                message: MarkdownString.fromStrict(message.message) || '',
                type: 0 /* TestMessageType.Error */,
                expected: message.expectedOutput,
                actual: message.actualOutput,
                contextValue: message.contextValue,
                location: message.location && ({ range: Range.from(message.location.range), uri: message.location.uri }),
            };
        }
        TestMessage.from = from;
        function to(item) {
            const message = new types.$zL(typeof item.message === 'string' ? item.message : MarkdownString.to(item.message));
            message.actualOutput = item.actual;
            message.expectedOutput = item.expected;
            message.contextValue = item.contextValue;
            message.location = item.location ? location.to(item.location) : undefined;
            return message;
        }
        TestMessage.to = to;
    })(TestMessage || (exports.TestMessage = TestMessage = {}));
    var TestTag;
    (function (TestTag) {
        TestTag.namespace = testTypes_1.$TI;
        TestTag.denamespace = testTypes_1.$UI;
    })(TestTag || (exports.TestTag = TestTag = {}));
    var TestItem;
    (function (TestItem) {
        function from(item) {
            const ctrlId = (0, extHostTestingPrivateApi_1.$XL)(item).controllerId;
            return {
                extId: testId_1.$PI.fromExtHostTestItem(item, ctrlId).toString(),
                label: item.label,
                uri: uri_1.URI.revive(item.uri),
                busy: item.busy,
                tags: item.tags.map(t => TestTag.namespace(ctrlId, t.id)),
                range: editorRange.$ks.lift(Range.from(item.range)),
                description: item.description || null,
                sortText: item.sortText || null,
                error: item.error ? (MarkdownString.fromStrict(item.error) || null) : null,
            };
        }
        TestItem.from = from;
        function toPlain(item) {
            return {
                parent: undefined,
                error: undefined,
                id: testId_1.$PI.fromString(item.extId).localId,
                label: item.label,
                uri: uri_1.URI.revive(item.uri),
                tags: (item.tags || []).map(t => {
                    const { tagId } = TestTag.denamespace(t);
                    return new types.$AL(tagId);
                }),
                children: {
                    add: () => { },
                    delete: () => { },
                    forEach: () => { },
                    *[Symbol.iterator]() { },
                    get: () => undefined,
                    replace: () => { },
                    size: 0,
                },
                range: Range.to(item.range || undefined),
                canResolveChildren: false,
                busy: item.busy,
                description: item.description || undefined,
                sortText: item.sortText || undefined,
            };
        }
        TestItem.toPlain = toPlain;
    })(TestItem || (exports.TestItem = TestItem = {}));
    (function (TestTag) {
        function from(tag) {
            return { id: tag.id };
        }
        TestTag.from = from;
        function to(tag) {
            return new types.$AL(tag.id);
        }
        TestTag.to = to;
    })(TestTag || (exports.TestTag = TestTag = {}));
    var TestResults;
    (function (TestResults) {
        const convertTestResultItem = (item, byInternalId) => {
            const children = [];
            for (const [id, item] of byInternalId) {
                if (testId_1.$PI.compare(item.item.extId, id) === 2 /* TestPosition.IsChild */) {
                    byInternalId.delete(id);
                    children.push(item);
                }
            }
            const snapshot = ({
                ...TestItem.toPlain(item.item),
                parent: undefined,
                taskStates: item.tasks.map(t => ({
                    state: t.state,
                    duration: t.duration,
                    messages: t.messages
                        .filter((m) => m.type === 0 /* TestMessageType.Error */)
                        .map(TestMessage.to),
                })),
                children: children.map(c => convertTestResultItem(c, byInternalId))
            });
            for (const child of snapshot.children) {
                child.parent = snapshot;
            }
            return snapshot;
        };
        function to(serialized) {
            const roots = [];
            const byInternalId = new Map();
            for (const item of serialized.items) {
                byInternalId.set(item.item.extId, item);
                const controllerId = testId_1.$PI.root(item.item.extId);
                if (serialized.request.targets.some(t => t.controllerId === controllerId && t.testIds.includes(item.item.extId))) {
                    roots.push(item);
                }
            }
            return {
                completedAt: serialized.completedAt,
                results: roots.map(r => convertTestResultItem(r, byInternalId)),
            };
        }
        TestResults.to = to;
    })(TestResults || (exports.TestResults = TestResults = {}));
    var TestCoverage;
    (function (TestCoverage) {
        function fromCoveredCount(count) {
            return { covered: count.covered, total: count.covered };
        }
        function fromLocation(location) {
            return 'line' in location ? Position.from(location) : Range.from(location);
        }
        function fromDetailed(coverage) {
            if ('branches' in coverage) {
                return {
                    count: coverage.executionCount,
                    location: fromLocation(coverage.location),
                    type: 1 /* DetailType.Statement */,
                    branches: coverage.branches.length
                        ? coverage.branches.map(b => ({ count: b.executionCount, location: b.location && fromLocation(b.location) }))
                        : undefined,
                };
            }
            else {
                return {
                    type: 0 /* DetailType.Function */,
                    count: coverage.executionCount,
                    location: fromLocation(coverage.location),
                };
            }
        }
        TestCoverage.fromDetailed = fromDetailed;
        function fromFile(coverage) {
            return {
                uri: coverage.uri,
                statement: fromCoveredCount(coverage.statementCoverage),
                branch: coverage.branchCoverage && fromCoveredCount(coverage.branchCoverage),
                function: coverage.functionCoverage && fromCoveredCount(coverage.functionCoverage),
                details: coverage.detailedCoverage?.map(fromDetailed),
            };
        }
        TestCoverage.fromFile = fromFile;
    })(TestCoverage || (exports.TestCoverage = TestCoverage = {}));
    var CodeActionTriggerKind;
    (function (CodeActionTriggerKind) {
        function to(value) {
            switch (value) {
                case 1 /* languages.CodeActionTriggerType.Invoke */:
                    return types.CodeActionTriggerKind.Invoke;
                case 2 /* languages.CodeActionTriggerType.Auto */:
                    return types.CodeActionTriggerKind.Automatic;
            }
        }
        CodeActionTriggerKind.to = to;
    })(CodeActionTriggerKind || (exports.CodeActionTriggerKind = CodeActionTriggerKind = {}));
    var TypeHierarchyItem;
    (function (TypeHierarchyItem) {
        function to(item) {
            const result = new types.$GL(SymbolKind.to(item.kind), item.name, item.detail || '', uri_1.URI.revive(item.uri), Range.to(item.range), Range.to(item.selectionRange));
            result._sessionId = item._sessionId;
            result._itemId = item._itemId;
            return result;
        }
        TypeHierarchyItem.to = to;
        function from(item, sessionId, itemId) {
            sessionId = sessionId ?? item._sessionId;
            itemId = itemId ?? item._itemId;
            if (sessionId === undefined || itemId === undefined) {
                throw new Error('invalid item');
            }
            return {
                _sessionId: sessionId,
                _itemId: itemId,
                kind: SymbolKind.from(item.kind),
                name: item.name,
                detail: item.detail ?? '',
                uri: item.uri,
                range: Range.from(item.range),
                selectionRange: Range.from(item.selectionRange),
                tags: item.tags?.map(SymbolTag.from)
            };
        }
        TypeHierarchyItem.from = from;
    })(TypeHierarchyItem || (exports.TypeHierarchyItem = TypeHierarchyItem = {}));
    var ViewBadge;
    (function (ViewBadge) {
        function from(badge) {
            if (!badge) {
                return undefined;
            }
            return {
                value: badge.value,
                tooltip: badge.tooltip
            };
        }
        ViewBadge.from = from;
    })(ViewBadge || (exports.ViewBadge = ViewBadge = {}));
    var DataTransferItem;
    (function (DataTransferItem) {
        function to(mime, item, resolveFileData) {
            const file = item.fileData;
            if (file) {
                return new types.$RK(new types.$SK(file.name, uri_1.URI.revive(file.uri), file.id, (0, functional_1.$bb)(() => resolveFileData(file.id))));
            }
            if (mime === mime_1.$Hr.uriList && item.uriListData) {
                return new types.$QK(reviveUriList(item.uriListData));
            }
            return new types.$QK(item.asString);
        }
        DataTransferItem.to = to;
        async function from(mime, item) {
            const stringValue = await item.asString();
            if (mime === mime_1.$Hr.uriList) {
                return {
                    asString: stringValue,
                    fileData: undefined,
                    uriListData: serializeUriList(stringValue),
                };
            }
            const fileValue = item.asFile();
            return {
                asString: stringValue,
                fileData: fileValue ? {
                    name: fileValue.name,
                    uri: fileValue.uri,
                    id: fileValue._itemId ?? fileValue.id,
                } : undefined,
            };
        }
        DataTransferItem.from = from;
        function serializeUriList(stringValue) {
            return dataTransfer_1.$Ts.split(stringValue).map(part => {
                if (part.startsWith('#')) {
                    return part;
                }
                try {
                    return uri_1.URI.parse(part);
                }
                catch {
                    // noop
                }
                return part;
            });
        }
        function reviveUriList(parts) {
            return dataTransfer_1.$Ts.create(parts.map(part => {
                return typeof part === 'string' ? part : uri_1.URI.revive(part);
            }));
        }
    })(DataTransferItem || (exports.DataTransferItem = DataTransferItem = {}));
    var DataTransfer;
    (function (DataTransfer) {
        function toDataTransfer(value, resolveFileData) {
            const init = value.items.map(([type, item]) => {
                return [type, DataTransferItem.to(type, item, resolveFileData)];
            });
            return new types.$TK(init);
        }
        DataTransfer.toDataTransfer = toDataTransfer;
        async function from(dataTransfer) {
            const newDTO = { items: [] };
            const promises = [];
            for (const [mime, value] of dataTransfer) {
                promises.push((async () => {
                    newDTO.items.push([mime, await DataTransferItem.from(mime, value)]);
                })());
            }
            await Promise.all(promises);
            return newDTO;
        }
        DataTransfer.from = from;
    })(DataTransfer || (exports.DataTransfer = DataTransfer = {}));
    var ChatReplyFollowup;
    (function (ChatReplyFollowup) {
        function to(followup) {
            return {
                message: followup.message,
                metadata: followup.metadata,
                title: followup.title,
                tooltip: followup.tooltip,
            };
        }
        ChatReplyFollowup.to = to;
        function from(followup) {
            return {
                kind: 'reply',
                message: followup.message,
                metadata: followup.metadata,
                title: followup.title,
                tooltip: followup.tooltip,
            };
        }
        ChatReplyFollowup.from = from;
    })(ChatReplyFollowup || (exports.ChatReplyFollowup = ChatReplyFollowup = {}));
    var ChatFollowup;
    (function (ChatFollowup) {
        function from(followup) {
            if (typeof followup === 'string') {
                return { title: followup, message: followup, kind: 'reply' };
            }
            else if ('commandId' in followup) {
                return {
                    kind: 'command',
                    title: followup.title ?? '',
                    commandId: followup.commandId ?? '',
                    when: followup.when ?? '',
                    args: followup.args
                };
            }
            else {
                return ChatReplyFollowup.from(followup);
            }
        }
        ChatFollowup.from = from;
    })(ChatFollowup || (exports.ChatFollowup = ChatFollowup = {}));
    var ChatMessage;
    (function (ChatMessage) {
        function to(message) {
            const res = new types.$QL(ChatMessageRole.to(message.role), message.content);
            res.name = message.name;
            return res;
        }
        ChatMessage.to = to;
        function from(message) {
            return {
                role: ChatMessageRole.from(message.role),
                content: message.content,
                name: message.name
            };
        }
        ChatMessage.from = from;
    })(ChatMessage || (exports.ChatMessage = ChatMessage = {}));
    var ChatMessageRole;
    (function (ChatMessageRole) {
        function to(role) {
            switch (role) {
                case 0 /* chatProvider.ChatMessageRole.System */: return types.ChatMessageRole.System;
                case 1 /* chatProvider.ChatMessageRole.User */: return types.ChatMessageRole.User;
                case 2 /* chatProvider.ChatMessageRole.Assistant */: return types.ChatMessageRole.Assistant;
                case 3 /* chatProvider.ChatMessageRole.Function */: return types.ChatMessageRole.Function;
            }
        }
        ChatMessageRole.to = to;
        function from(role) {
            switch (role) {
                case types.ChatMessageRole.System: return 0 /* chatProvider.ChatMessageRole.System */;
                case types.ChatMessageRole.Assistant: return 2 /* chatProvider.ChatMessageRole.Assistant */;
                case types.ChatMessageRole.Function: return 3 /* chatProvider.ChatMessageRole.Function */;
                case types.ChatMessageRole.User:
                default:
                    return 1 /* chatProvider.ChatMessageRole.User */;
            }
        }
        ChatMessageRole.from = from;
    })(ChatMessageRole || (exports.ChatMessageRole = ChatMessageRole = {}));
    var ChatVariable;
    (function (ChatVariable) {
        function to(variable) {
            return {
                level: ChatVariableLevel.to(variable.level),
                value: variable.value,
                description: variable.description
            };
        }
        ChatVariable.to = to;
        function from(variable) {
            return {
                level: ChatVariableLevel.from(variable.level),
                value: variable.value,
                description: variable.description
            };
        }
        ChatVariable.from = from;
    })(ChatVariable || (exports.ChatVariable = ChatVariable = {}));
    var ChatVariableLevel;
    (function (ChatVariableLevel) {
        function to(level) {
            switch (level) {
                case 'short': return types.ChatVariableLevel.Short;
                case 'medium': return types.ChatVariableLevel.Medium;
                case 'full':
                default:
                    return types.ChatVariableLevel.Full;
            }
        }
        ChatVariableLevel.to = to;
        function from(level) {
            switch (level) {
                case types.ChatVariableLevel.Short: return 'short';
                case types.ChatVariableLevel.Medium: return 'medium';
                case types.ChatVariableLevel.Full:
                default:
                    return 'full';
            }
        }
        ChatVariableLevel.from = from;
    })(ChatVariableLevel || (exports.ChatVariableLevel = ChatVariableLevel = {}));
    var InteractiveEditorResponseFeedbackKind;
    (function (InteractiveEditorResponseFeedbackKind) {
        function to(kind) {
            switch (kind) {
                case 1 /* InlineChatResponseFeedbackKind.Helpful */:
                    return types.InteractiveEditorResponseFeedbackKind.Helpful;
                case 0 /* InlineChatResponseFeedbackKind.Unhelpful */:
                    return types.InteractiveEditorResponseFeedbackKind.Unhelpful;
                case 2 /* InlineChatResponseFeedbackKind.Undone */:
                    return types.InteractiveEditorResponseFeedbackKind.Undone;
                case 3 /* InlineChatResponseFeedbackKind.Accepted */:
                    return types.InteractiveEditorResponseFeedbackKind.Accepted;
            }
        }
        InteractiveEditorResponseFeedbackKind.to = to;
    })(InteractiveEditorResponseFeedbackKind || (exports.InteractiveEditorResponseFeedbackKind = InteractiveEditorResponseFeedbackKind = {}));
    var TerminalQuickFix;
    (function (TerminalQuickFix) {
        function from(quickFix, converter, disposables) {
            if ('terminalCommand' in quickFix) {
                return { terminalCommand: quickFix.terminalCommand };
            }
            if ('uri' in quickFix) {
                return { uri: quickFix.uri };
            }
            return converter.toInternal(quickFix, disposables);
        }
        TerminalQuickFix.from = from;
    })(TerminalQuickFix || (exports.TerminalQuickFix = TerminalQuickFix = {}));
});
//# sourceMappingURL=extHostTypeConverters.js.map