/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/buffer", "vs/base/common/dataTransfer", "vs/base/common/functional", "vs/base/common/htmlContent", "vs/base/common/map", "vs/base/common/marked/marked", "vs/base/common/marshalling", "vs/base/common/mime", "vs/base/common/objects", "vs/base/common/types", "vs/base/common/uri", "vs/editor/common/core/range", "vs/editor/common/languages", "vs/platform/markers/common/markers", "vs/workbench/api/common/extHostTestingPrivateApi", "vs/workbench/common/editor", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/testing/common/testId", "vs/workbench/contrib/testing/common/testTypes", "vs/workbench/services/editor/common/editorService", "./extHostTypes"], function (require, exports, arrays_1, buffer_1, dataTransfer_1, functional_1, htmlContent, map_1, marked_1, marshalling_1, mime_1, objects_1, types_1, uri_1, editorRange, languages, markers_1, extHostTestingPrivateApi_1, editor_1, notebooks, testId_1, testTypes_1, editorService_1, types) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalQuickFix = exports.InteractiveEditorResponseFeedbackKind = exports.ChatVariableLevel = exports.ChatVariable = exports.ChatMessageRole = exports.ChatMessage = exports.ChatFollowup = exports.ChatReplyFollowup = exports.DataTransfer = exports.DataTransferItem = exports.ViewBadge = exports.TypeHierarchyItem = exports.CodeActionTriggerKind = exports.TestCoverage = exports.TestResults = exports.TestItem = exports.TestTag = exports.TestMessage = exports.NotebookRendererScript = exports.NotebookDocumentContentOptions = exports.NotebookKernelSourceAction = exports.NotebookStatusBarItem = exports.NotebookExclusiveDocumentPattern = exports.NotebookCellOutput = exports.NotebookCellOutputItem = exports.NotebookCellData = exports.NotebookData = exports.NotebookCellKind = exports.NotebookCellExecutionState = exports.NotebookCellExecutionSummary = exports.NotebookRange = exports.MappedEditsContext = exports.LanguageSelector = exports.GlobPattern = exports.TextEditorOpenOptions = exports.FoldingRangeKind = exports.FoldingRange = exports.ProgressLocation = exports.EndOfLine = exports.TextEditorLineNumbersStyle = exports.TextDocumentSaveReason = exports.SelectionRange = exports.Color = exports.ColorPresentation = exports.DocumentLink = exports.InlayHintKind = exports.InlayHintLabelPart = exports.InlayHint = exports.SignatureHelp = exports.SignatureInformation = exports.ParameterInformation = exports.CompletionItem = exports.CompletionItemKind = exports.CompletionItemTag = exports.CompletionContext = exports.CompletionTriggerKind = exports.DocumentHighlight = exports.InlineValueContext = exports.InlineValue = exports.EvaluatableExpression = exports.Hover = exports.DefinitionLink = exports.location = exports.CallHierarchyOutgoingCall = exports.CallHierarchyIncomingCall = exports.CallHierarchyItem = exports.DocumentSymbol = exports.WorkspaceSymbol = exports.SymbolTag = exports.SymbolKind = exports.WorkspaceEdit = exports.TextEdit = exports.DecorationRenderOptions = exports.DecorationRangeBehavior = exports.ThemableDecorationRenderOptions = exports.ThemableDecorationAttachmentRenderOptions = exports.pathOrURIToURI = exports.fromRangeOrRangeWithMessage = exports.MarkdownString = exports.isDecorationOptionsArr = exports.ViewColumn = exports.DiagnosticSeverity = exports.DiagnosticRelatedInformation = exports.Diagnostic = exports.DiagnosticTag = exports.DocumentSelector = exports.Position = exports.TokenType = exports.Range = exports.Selection = void 0;
    var Selection;
    (function (Selection) {
        function to(selection) {
            const { selectionStartLineNumber, selectionStartColumn, positionLineNumber, positionColumn } = selection;
            const start = new types.Position(selectionStartLineNumber - 1, selectionStartColumn - 1);
            const end = new types.Position(positionLineNumber - 1, positionColumn - 1);
            return new types.Selection(start, end);
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
            return new types.Range(startLineNumber - 1, startColumn - 1, endLineNumber - 1, endColumn - 1);
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
            return new types.Position(position.lineNumber - 1, position.column - 1);
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
            return (0, arrays_1.coalesce)((0, arrays_1.asArray)(value).map(sel => _doTransformDocumentSelector(sel, uriTransformer, extension)));
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
                if ((0, types_1.isString)(value.code) || (0, types_1.isNumber)(value.code)) {
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
                tags: Array.isArray(value.tags) ? (0, arrays_1.coalesce)(value.tags.map(DiagnosticTag.from)) : undefined,
            };
        }
        Diagnostic.from = from;
        function to(value) {
            const res = new types.Diagnostic(Range.to(value), value.message, DiagnosticSeverity.to(value.severity));
            res.source = value.source;
            res.code = (0, types_1.isString)(value.code) ? value.code : value.code?.value;
            res.relatedInformation = value.relatedInformation && value.relatedInformation.map(DiagnosticRelatedInformation.to);
            res.tags = value.tags && (0, arrays_1.coalesce)(value.tags.map(DiagnosticTag.to));
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
            return new types.DiagnosticRelatedInformation(new types.Location(value.resource, Range.to(value)), value.message);
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
                return editorService_1.SIDE_GROUP;
            }
            return editorService_1.ACTIVE_GROUP; // default is always the active group
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
    function isDecorationOptionsArr(something) {
        if (something.length === 0) {
            return true;
        }
        return isDecorationOptions(something[0]) ? true : false;
    }
    exports.isDecorationOptionsArr = isDecorationOptionsArr;
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
            else if (types.MarkdownString.isMarkdownString(markup)) {
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
            renderer.image = href => typeof href === 'string' ? collectUri(htmlContent.parseHrefAndDimensions(href).href) : '';
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
                data = (0, marshalling_1.parse)(part);
            }
            catch (e) {
                // ignore
            }
            if (!data) {
                return part;
            }
            let changed = false;
            data = (0, objects_1.cloneAndChange)(data, value => {
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
            const result = new types.MarkdownString(value.value, value.supportThemeIcons);
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
    function fromRangeOrRangeWithMessage(ranges) {
        if (isDecorationOptionsArr(ranges)) {
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
    exports.fromRangeOrRangeWithMessage = fromRangeOrRangeWithMessage;
    function pathOrURIToURI(value) {
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
    exports.pathOrURIToURI = pathOrURIToURI;
    var ThemableDecorationAttachmentRenderOptions;
    (function (ThemableDecorationAttachmentRenderOptions) {
        function from(options) {
            if (typeof options === 'undefined') {
                return options;
            }
            return {
                contentText: options.contentText,
                contentIconPath: options.contentIconPath ? pathOrURIToURI(options.contentIconPath) : undefined,
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
                gutterIconPath: options.gutterIconPath ? pathOrURIToURI(options.gutterIconPath) : undefined,
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
                gutterIconPath: options.gutterIconPath ? pathOrURIToURI(options.gutterIconPath) : undefined,
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
            const result = new types.TextEdit(Range.to(edit.range), edit.text);
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
            if (value instanceof types.WorkspaceEdit) {
                // collect all files that are to be created so that their version
                // information (in case they exist as text model already) can be ignored
                const toCreate = new map_1.ResourceSet();
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
                                contents = { type: 'base64', value: (0, buffer_1.encodeBase64)(buffer_1.VSBuffer.wrap(entry.options.contents)) };
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
            const result = new types.WorkspaceEdit();
            const edits = new map_1.ResourceMap();
            for (const edit of value.edits) {
                if (edit.textEdit) {
                    const item = edit;
                    const uri = uri_1.URI.revive(item.resource);
                    const range = Range.to(item.textEdit.range);
                    const text = item.textEdit.text;
                    const isSnippet = item.textEdit.insertAsSnippet;
                    let editOrSnippetTest;
                    if (isSnippet) {
                        editOrSnippetTest = types.SnippetTextEdit.replace(range, new types.SnippetString(text));
                    }
                    else {
                        editOrSnippetTest = types.TextEdit.replace(range, text);
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
            const result = new types.SymbolInformation(info.name, SymbolKind.to(info.kind), info.containerName, location.to(info.location));
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
            const result = new types.DocumentSymbol(info.name, info.detail, SymbolKind.to(info.kind), Range.to(info.range), Range.to(info.selectionRange));
            if ((0, arrays_1.isNonEmptyArray)(info.tags)) {
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
            const result = new types.CallHierarchyItem(SymbolKind.to(item.kind), item.name, item.detail || '', uri_1.URI.revive(item.uri), Range.to(item.range), Range.to(item.selectionRange));
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
            return new types.CallHierarchyIncomingCall(CallHierarchyItem.to(item.from), item.fromRanges.map(r => Range.to(r)));
        }
        CallHierarchyIncomingCall.to = to;
    })(CallHierarchyIncomingCall || (exports.CallHierarchyIncomingCall = CallHierarchyIncomingCall = {}));
    var CallHierarchyOutgoingCall;
    (function (CallHierarchyOutgoingCall) {
        function to(item) {
            return new types.CallHierarchyOutgoingCall(CallHierarchyItem.to(item.to), item.fromRanges.map(r => Range.to(r)));
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
            return new types.Location(uri_1.URI.revive(value.uri), Range.to(value.range));
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
            return new types.Hover(info.contents.map(MarkdownString.to), Range.to(info.range));
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
            return new types.EvaluatableExpression(Range.to(info.range), info.expression);
        }
        EvaluatableExpression.to = to;
    })(EvaluatableExpression || (exports.EvaluatableExpression = EvaluatableExpression = {}));
    var InlineValue;
    (function (InlineValue) {
        function from(inlineValue) {
            if (inlineValue instanceof types.InlineValueText) {
                return {
                    type: 'text',
                    range: Range.from(inlineValue.range),
                    text: inlineValue.text
                };
            }
            else if (inlineValue instanceof types.InlineValueVariableLookup) {
                return {
                    type: 'variable',
                    range: Range.from(inlineValue.range),
                    variableName: inlineValue.variableName,
                    caseSensitiveLookup: inlineValue.caseSensitiveLookup
                };
            }
            else if (inlineValue instanceof types.InlineValueEvaluatableExpression) {
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
            return new types.InlineValueContext(inlineValueContext.frameId, Range.to(inlineValueContext.stoppedLocation));
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
            return new types.DocumentHighlight(Range.to(occurrence.range), occurrence.kind);
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
            const result = new types.CompletionItem(suggestion.label);
            result.insertText = suggestion.insertText;
            result.kind = CompletionItemKind.to(suggestion.kind);
            result.tags = suggestion.tags?.map(CompletionItemTag.to);
            result.detail = suggestion.detail;
            result.documentation = htmlContent.isMarkdownString(suggestion.documentation) ? MarkdownString.to(suggestion.documentation) : suggestion.documentation;
            result.sortText = suggestion.sortText;
            result.filterText = suggestion.filterText;
            result.preselect = suggestion.preselect;
            result.commitCharacters = suggestion.commitCharacters;
            // range
            if (editorRange.Range.isIRange(suggestion.range)) {
                result.range = Range.to(suggestion.range);
            }
            else if (typeof suggestion.range === 'object') {
                result.range = { inserting: Range.to(suggestion.range.insert), replacing: Range.to(suggestion.range.replace) };
            }
            result.keepWhitespace = typeof suggestion.insertTextRules === 'undefined' ? false : Boolean(suggestion.insertTextRules & 1 /* languages.CompletionItemInsertTextRule.KeepWhitespace */);
            // 'insertText'-logic
            if (typeof suggestion.insertTextRules !== 'undefined' && suggestion.insertTextRules & 4 /* languages.CompletionItemInsertTextRule.InsertAsSnippet */) {
                result.insertText = new types.SnippetString(suggestion.insertText);
            }
            else {
                result.insertText = suggestion.insertText;
                result.textEdit = result.range instanceof types.Range ? new types.TextEdit(result.range, result.insertText) : undefined;
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
                documentation: htmlContent.isMarkdownString(info.documentation) ? MarkdownString.to(info.documentation) : info.documentation
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
                documentation: htmlContent.isMarkdownString(info.documentation) ? MarkdownString.to(info.documentation) : info.documentation,
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
            const res = new types.InlayHint(Position.to(hint.position), typeof hint.label === 'string' ? hint.label : hint.label.map(InlayHintLabelPart.to.bind(undefined, converter)), hint.kind && InlayHintKind.to(hint.kind));
            res.textEdits = hint.textEdits && hint.textEdits.map(TextEdit.to);
            res.tooltip = htmlContent.isMarkdownString(hint.tooltip) ? MarkdownString.to(hint.tooltip) : hint.tooltip;
            res.paddingLeft = hint.paddingLeft;
            res.paddingRight = hint.paddingRight;
            return res;
        }
        InlayHint.to = to;
    })(InlayHint || (exports.InlayHint = InlayHint = {}));
    var InlayHintLabelPart;
    (function (InlayHintLabelPart) {
        function to(converter, part) {
            const result = new types.InlayHintLabelPart(part.label);
            result.tooltip = htmlContent.isMarkdownString(part.tooltip)
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
            return new types.DocumentLink(Range.to(link.range), target);
        }
        DocumentLink.to = to;
    })(DocumentLink || (exports.DocumentLink = DocumentLink = {}));
    var ColorPresentation;
    (function (ColorPresentation) {
        function to(colorPresentation) {
            const cp = new types.ColorPresentation(colorPresentation.label);
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
            return new types.Color(c[0], c[1], c[2], c[3]);
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
            return new types.SelectionRange(Range.to(obj.range));
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
                        return languages.FoldingRangeKind.Comment;
                    case types.FoldingRangeKind.Imports:
                        return languages.FoldingRangeKind.Imports;
                    case types.FoldingRangeKind.Region:
                        return languages.FoldingRangeKind.Region;
                }
            }
            return undefined;
        }
        FoldingRangeKind.from = from;
        function to(kind) {
            if (kind) {
                switch (kind.value) {
                    case languages.FoldingRangeKind.Comment.value:
                        return types.FoldingRangeKind.Comment;
                    case languages.FoldingRangeKind.Imports.value:
                        return types.FoldingRangeKind.Imports;
                    case languages.FoldingRangeKind.Region.value:
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
                    override: typeof options.override === 'boolean' ? editor_1.DEFAULT_EDITOR_ASSOCIATION.id : undefined
                };
            }
            return undefined;
        }
        TextEditorOpenOptions.from = from;
    })(TextEditorOpenOptions || (exports.TextEditorOpenOptions = TextEditorOpenOptions = {}));
    var GlobPattern;
    (function (GlobPattern) {
        function from(pattern) {
            if (pattern instanceof types.RelativePattern) {
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
                return new types.RelativePattern(pattern.baseUri ?? pattern.base, pattern.pattern).toJSON();
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
            return new types.RelativePattern(uri_1.URI.revive(pattern.baseUri), pattern.pattern);
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
                v.selections.every(s => s instanceof types.Selection) &&
                'related' in v &&
                Array.isArray(v.related) &&
                v.related.every(e => e && typeof e === 'object' && uri_1.URI.isUri(e.uri) && e.range instanceof types.Range));
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
            return new types.NotebookRange(range.start, range.end);
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
                types.NotebookCellData.validate(cell);
                res.cells.push(NotebookCellData.from(cell));
            }
            return res;
        }
        NotebookData.from = from;
        function to(data) {
            const res = new types.NotebookData(data.cells.map(NotebookCellData.to));
            if (!(0, types_1.isEmptyObject)(data.metadata)) {
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
            return new types.NotebookCellData(NotebookCellKind.to(data.cellKind), data.source, data.language, data.mime, data.outputs ? data.outputs.map(NotebookCellOutput.to) : undefined, data.metadata, data.internalMetadata ? NotebookCellExecutionSummary.to(data.internalMetadata) : undefined);
        }
        NotebookCellData.to = to;
    })(NotebookCellData || (exports.NotebookCellData = NotebookCellData = {}));
    var NotebookCellOutputItem;
    (function (NotebookCellOutputItem) {
        function from(item) {
            return {
                mime: item.mime,
                valueBytes: buffer_1.VSBuffer.wrap(item.data),
            };
        }
        NotebookCellOutputItem.from = from;
        function to(item) {
            return new types.NotebookCellOutputItem(item.valueBytes.buffer, item.mime);
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
            return new types.NotebookCellOutput(items, output.outputId, output.metadata);
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
            return !(0, types_1.isUndefinedOrNull)(ep.include) && !(0, types_1.isUndefinedOrNull)(ep.exclude);
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
            return new types.NotebookRendererScript(uri_1.URI.revive(preload.uri), preload.provides);
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
            const message = new types.TestMessage(typeof item.message === 'string' ? item.message : MarkdownString.to(item.message));
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
        TestTag.namespace = testTypes_1.namespaceTestTag;
        TestTag.denamespace = testTypes_1.denamespaceTestTag;
    })(TestTag || (exports.TestTag = TestTag = {}));
    var TestItem;
    (function (TestItem) {
        function from(item) {
            const ctrlId = (0, extHostTestingPrivateApi_1.getPrivateApiFor)(item).controllerId;
            return {
                extId: testId_1.TestId.fromExtHostTestItem(item, ctrlId).toString(),
                label: item.label,
                uri: uri_1.URI.revive(item.uri),
                busy: item.busy,
                tags: item.tags.map(t => TestTag.namespace(ctrlId, t.id)),
                range: editorRange.Range.lift(Range.from(item.range)),
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
                id: testId_1.TestId.fromString(item.extId).localId,
                label: item.label,
                uri: uri_1.URI.revive(item.uri),
                tags: (item.tags || []).map(t => {
                    const { tagId } = TestTag.denamespace(t);
                    return new types.TestTag(tagId);
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
            return new types.TestTag(tag.id);
        }
        TestTag.to = to;
    })(TestTag || (exports.TestTag = TestTag = {}));
    var TestResults;
    (function (TestResults) {
        const convertTestResultItem = (item, byInternalId) => {
            const children = [];
            for (const [id, item] of byInternalId) {
                if (testId_1.TestId.compare(item.item.extId, id) === 2 /* TestPosition.IsChild */) {
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
                const controllerId = testId_1.TestId.root(item.item.extId);
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
            const result = new types.TypeHierarchyItem(SymbolKind.to(item.kind), item.name, item.detail || '', uri_1.URI.revive(item.uri), Range.to(item.range), Range.to(item.selectionRange));
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
                return new types.InternalFileDataTransferItem(new types.DataTransferFile(file.name, uri_1.URI.revive(file.uri), file.id, (0, functional_1.once)(() => resolveFileData(file.id))));
            }
            if (mime === mime_1.Mimes.uriList && item.uriListData) {
                return new types.InternalDataTransferItem(reviveUriList(item.uriListData));
            }
            return new types.InternalDataTransferItem(item.asString);
        }
        DataTransferItem.to = to;
        async function from(mime, item) {
            const stringValue = await item.asString();
            if (mime === mime_1.Mimes.uriList) {
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
            return dataTransfer_1.UriList.split(stringValue).map(part => {
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
            return dataTransfer_1.UriList.create(parts.map(part => {
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
            return new types.DataTransfer(init);
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
            const res = new types.ChatMessage(ChatMessageRole.to(message.role), message.content);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFR5cGVDb252ZXJ0ZXJzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9jb21tb24vZXh0SG9zdFR5cGVDb252ZXJ0ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXFFaEcsSUFBaUIsU0FBUyxDQWtCekI7SUFsQkQsV0FBaUIsU0FBUztRQUV6QixTQUFnQixFQUFFLENBQUMsU0FBcUI7WUFDdkMsTUFBTSxFQUFFLHdCQUF3QixFQUFFLG9CQUFvQixFQUFFLGtCQUFrQixFQUFFLGNBQWMsRUFBRSxHQUFHLFNBQVMsQ0FBQztZQUN6RyxNQUFNLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsd0JBQXdCLEdBQUcsQ0FBQyxFQUFFLG9CQUFvQixHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3pGLE1BQU0sR0FBRyxHQUFHLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLEVBQUUsY0FBYyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzNFLE9BQU8sSUFBSSxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN4QyxDQUFDO1FBTGUsWUFBRSxLQUtqQixDQUFBO1FBRUQsU0FBZ0IsSUFBSSxDQUFDLFNBQXdCO1lBQzVDLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsU0FBUyxDQUFDO1lBQ3JDLE9BQU87Z0JBQ04sd0JBQXdCLEVBQUUsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDO2dCQUN6QyxvQkFBb0IsRUFBRSxNQUFNLENBQUMsU0FBUyxHQUFHLENBQUM7Z0JBQzFDLGtCQUFrQixFQUFFLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQztnQkFDbkMsY0FBYyxFQUFFLE1BQU0sQ0FBQyxTQUFTLEdBQUcsQ0FBQzthQUNwQyxDQUFDO1FB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QyxLQUFLLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDO1lBQzVFLDhDQUFzQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDO1lBQ3RFLDhDQUFzQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDO1lBQ3RFLGdEQUF3QyxLQUFLLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDO1lBQzFFLDZDQUFvQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDO1lBQ2xFLDhDQUFxQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDO1lBQ3BFLGlEQUF3QyxLQUFLLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDO1lBQzFFLDZDQUFvQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDO1lBQ2xFLG1EQUEwQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDO1lBQzlFLGdEQUF1QyxLQUFLLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDO1lBQ3hFLGdEQUF1QyxLQUFLLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDO1lBQ3hFLDZDQUFvQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDO1lBQ2xFLDhDQUFxQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDO1lBQ3BFLDZDQUFvQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDO1lBQ2xFLGtEQUF5QyxLQUFLLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDO1lBQzVFLCtDQUFzQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDO1lBQ3RFLDhDQUFxQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDO1lBQ3BFLGlEQUF3QyxLQUFLLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDO1lBQzFFLHNEQUE2QyxLQUFLLENBQUMsa0JBQWtCLENBQUMsYUFBYSxDQUFDO1lBQ3BGLDZDQUFvQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDO1lBQ2xFLDhDQUFx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