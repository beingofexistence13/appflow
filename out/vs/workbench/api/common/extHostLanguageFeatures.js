/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/base/common/objects", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes", "vs/editor/common/languages", "./extHost.protocol", "vs/base/common/strings", "vs/editor/common/core/range", "vs/base/common/arrays", "vs/base/common/types", "vs/editor/common/core/selection", "vs/base/common/cancellation", "vs/platform/extensions/common/extensions", "vs/base/common/lifecycle", "vs/editor/common/services/semanticTokensDto", "vs/base/common/idGenerator", "./cache", "vs/base/common/stopwatch", "vs/base/common/errors", "vs/base/common/async", "vs/workbench/services/extensions/common/extensions", "vs/nls"], function (require, exports, uri_1, objects_1, typeConvert, extHostTypes_1, languages, extHostProtocol, strings_1, range_1, arrays_1, types_1, selection_1, cancellation_1, extensions_1, lifecycle_1, semanticTokensDto_1, idGenerator_1, cache_1, stopwatch_1, errors_1, async_1, extensions_2, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostLanguageFeatures = void 0;
    // --- adapter
    class DocumentSymbolAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
        }
        async provideDocumentSymbols(resource, token) {
            const doc = this._documents.getDocument(resource);
            const value = await this._provider.provideDocumentSymbols(doc, token);
            if ((0, arrays_1.isFalsyOrEmpty)(value)) {
                return undefined;
            }
            else if (value[0] instanceof extHostTypes_1.DocumentSymbol) {
                return value.map(typeConvert.DocumentSymbol.from);
            }
            else {
                return DocumentSymbolAdapter._asDocumentSymbolTree(value);
            }
        }
        static _asDocumentSymbolTree(infos) {
            // first sort by start (and end) and then loop over all elements
            // and build a tree based on containment.
            infos = infos.slice(0).sort((a, b) => {
                let res = a.location.range.start.compareTo(b.location.range.start);
                if (res === 0) {
                    res = b.location.range.end.compareTo(a.location.range.end);
                }
                return res;
            });
            const res = [];
            const parentStack = [];
            for (const info of infos) {
                const element = {
                    name: info.name || '!!MISSING: name!!',
                    kind: typeConvert.SymbolKind.from(info.kind),
                    tags: info.tags?.map(typeConvert.SymbolTag.from) || [],
                    detail: '',
                    containerName: info.containerName,
                    range: typeConvert.Range.from(info.location.range),
                    selectionRange: typeConvert.Range.from(info.location.range),
                    children: []
                };
                while (true) {
                    if (parentStack.length === 0) {
                        parentStack.push(element);
                        res.push(element);
                        break;
                    }
                    const parent = parentStack[parentStack.length - 1];
                    if (range_1.Range.containsRange(parent.range, element.range) && !range_1.Range.equalsRange(parent.range, element.range)) {
                        parent.children?.push(element);
                        parentStack.push(element);
                        break;
                    }
                    parentStack.pop();
                }
            }
            return res;
        }
    }
    class CodeLensAdapter {
        static { this._badCmd = { command: 'missing', title: '!!MISSING: command!!' }; }
        constructor(_documents, _commands, _provider) {
            this._documents = _documents;
            this._commands = _commands;
            this._provider = _provider;
            this._cache = new cache_1.Cache('CodeLens');
            this._disposables = new Map();
        }
        async provideCodeLenses(resource, token) {
            const doc = this._documents.getDocument(resource);
            const lenses = await this._provider.provideCodeLenses(doc, token);
            if (!lenses || token.isCancellationRequested) {
                return undefined;
            }
            const cacheId = this._cache.add(lenses);
            const disposables = new lifecycle_1.DisposableStore();
            this._disposables.set(cacheId, disposables);
            const result = {
                cacheId,
                lenses: [],
            };
            for (let i = 0; i < lenses.length; i++) {
                result.lenses.push({
                    cacheId: [cacheId, i],
                    range: typeConvert.Range.from(lenses[i].range),
                    command: this._commands.toInternal(lenses[i].command, disposables)
                });
            }
            return result;
        }
        async resolveCodeLens(symbol, token) {
            const lens = symbol.cacheId && this._cache.get(...symbol.cacheId);
            if (!lens) {
                return undefined;
            }
            let resolvedLens;
            if (typeof this._provider.resolveCodeLens !== 'function' || lens.isResolved) {
                resolvedLens = lens;
            }
            else {
                resolvedLens = await this._provider.resolveCodeLens(lens, token);
            }
            if (!resolvedLens) {
                resolvedLens = lens;
            }
            if (token.isCancellationRequested) {
                return undefined;
            }
            const disposables = symbol.cacheId && this._disposables.get(symbol.cacheId[0]);
            if (!disposables) {
                // disposed in the meantime
                return undefined;
            }
            symbol.command = this._commands.toInternal(resolvedLens.command ?? CodeLensAdapter._badCmd, disposables);
            return symbol;
        }
        releaseCodeLenses(cachedId) {
            this._disposables.get(cachedId)?.dispose();
            this._disposables.delete(cachedId);
            this._cache.delete(cachedId);
        }
    }
    function convertToLocationLinks(value) {
        if (Array.isArray(value)) {
            return value.map(typeConvert.DefinitionLink.from);
        }
        else if (value) {
            return [typeConvert.DefinitionLink.from(value)];
        }
        return [];
    }
    class DefinitionAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
        }
        async provideDefinition(resource, position, token) {
            const doc = this._documents.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            const value = await this._provider.provideDefinition(doc, pos, token);
            return convertToLocationLinks(value);
        }
    }
    class DeclarationAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
        }
        async provideDeclaration(resource, position, token) {
            const doc = this._documents.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            const value = await this._provider.provideDeclaration(doc, pos, token);
            return convertToLocationLinks(value);
        }
    }
    class ImplementationAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
        }
        async provideImplementation(resource, position, token) {
            const doc = this._documents.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            const value = await this._provider.provideImplementation(doc, pos, token);
            return convertToLocationLinks(value);
        }
    }
    class TypeDefinitionAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
        }
        async provideTypeDefinition(resource, position, token) {
            const doc = this._documents.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            const value = await this._provider.provideTypeDefinition(doc, pos, token);
            return convertToLocationLinks(value);
        }
    }
    class HoverAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
        }
        async provideHover(resource, position, token) {
            const doc = this._documents.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            const value = await this._provider.provideHover(doc, pos, token);
            if (!value || (0, arrays_1.isFalsyOrEmpty)(value.contents)) {
                return undefined;
            }
            if (!value.range) {
                value.range = doc.getWordRangeAtPosition(pos);
            }
            if (!value.range) {
                value.range = new extHostTypes_1.Range(pos, pos);
            }
            return typeConvert.Hover.from(value);
        }
    }
    class EvaluatableExpressionAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
        }
        async provideEvaluatableExpression(resource, position, token) {
            const doc = this._documents.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            const value = await this._provider.provideEvaluatableExpression(doc, pos, token);
            if (value) {
                return typeConvert.EvaluatableExpression.from(value);
            }
            return undefined;
        }
    }
    class InlineValuesAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
        }
        async provideInlineValues(resource, viewPort, context, token) {
            const doc = this._documents.getDocument(resource);
            const value = await this._provider.provideInlineValues(doc, typeConvert.Range.to(viewPort), typeConvert.InlineValueContext.to(context), token);
            if (Array.isArray(value)) {
                return value.map(iv => typeConvert.InlineValue.from(iv));
            }
            return undefined;
        }
    }
    class DocumentHighlightAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
        }
        async provideDocumentHighlights(resource, position, token) {
            const doc = this._documents.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            const value = await this._provider.provideDocumentHighlights(doc, pos, token);
            if (Array.isArray(value)) {
                return value.map(typeConvert.DocumentHighlight.from);
            }
            return undefined;
        }
    }
    class LinkedEditingRangeAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
        }
        async provideLinkedEditingRanges(resource, position, token) {
            const doc = this._documents.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            const value = await this._provider.provideLinkedEditingRanges(doc, pos, token);
            if (value && Array.isArray(value.ranges)) {
                return {
                    ranges: (0, arrays_1.coalesce)(value.ranges.map(typeConvert.Range.from)),
                    wordPattern: value.wordPattern
                };
            }
            return undefined;
        }
    }
    class ReferenceAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
        }
        async provideReferences(resource, position, context, token) {
            const doc = this._documents.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            const value = await this._provider.provideReferences(doc, pos, context, token);
            if (Array.isArray(value)) {
                return value.map(typeConvert.location.from);
            }
            return undefined;
        }
    }
    class CodeActionAdapter {
        static { this._maxCodeActionsPerFile = 1000; }
        constructor(_documents, _commands, _diagnostics, _provider, _logService, _extension, _apiDeprecation) {
            this._documents = _documents;
            this._commands = _commands;
            this._diagnostics = _diagnostics;
            this._provider = _provider;
            this._logService = _logService;
            this._extension = _extension;
            this._apiDeprecation = _apiDeprecation;
            this._cache = new cache_1.Cache('CodeAction');
            this._disposables = new Map();
        }
        async provideCodeActions(resource, rangeOrSelection, context, token) {
            const doc = this._documents.getDocument(resource);
            const ran = selection_1.Selection.isISelection(rangeOrSelection)
                ? typeConvert.Selection.to(rangeOrSelection)
                : typeConvert.Range.to(rangeOrSelection);
            const allDiagnostics = [];
            for (const diagnostic of this._diagnostics.getDiagnostics(resource)) {
                if (ran.intersection(diagnostic.range)) {
                    const newLen = allDiagnostics.push(diagnostic);
                    if (newLen > CodeActionAdapter._maxCodeActionsPerFile) {
                        break;
                    }
                }
            }
            const codeActionContext = {
                diagnostics: allDiagnostics,
                only: context.only ? new extHostTypes_1.CodeActionKind(context.only) : undefined,
                triggerKind: typeConvert.CodeActionTriggerKind.to(context.trigger),
            };
            const commandsOrActions = await this._provider.provideCodeActions(doc, ran, codeActionContext, token);
            if (!(0, arrays_1.isNonEmptyArray)(commandsOrActions) || token.isCancellationRequested) {
                return undefined;
            }
            const cacheId = this._cache.add(commandsOrActions);
            const disposables = new lifecycle_1.DisposableStore();
            this._disposables.set(cacheId, disposables);
            const actions = [];
            for (let i = 0; i < commandsOrActions.length; i++) {
                const candidate = commandsOrActions[i];
                if (!candidate) {
                    continue;
                }
                if (CodeActionAdapter._isCommand(candidate)) {
                    // old school: synthetic code action
                    this._apiDeprecation.report('CodeActionProvider.provideCodeActions - return commands', this._extension, `Return 'CodeAction' instances instead.`);
                    actions.push({
                        _isSynthetic: true,
                        title: candidate.title,
                        command: this._commands.toInternal(candidate, disposables),
                    });
                }
                else {
                    if (codeActionContext.only) {
                        if (!candidate.kind) {
                            this._logService.warn(`${this._extension.identifier.value} - Code actions of kind '${codeActionContext.only.value} 'requested but returned code action does not have a 'kind'. Code action will be dropped. Please set 'CodeAction.kind'.`);
                        }
                        else if (!codeActionContext.only.contains(candidate.kind)) {
                            this._logService.warn(`${this._extension.identifier.value} - Code actions of kind '${codeActionContext.only.value} 'requested but returned code action is of kind '${candidate.kind.value}'. Code action will be dropped. Please check 'CodeActionContext.only' to only return requested code actions.`);
                        }
                    }
                    // new school: convert code action
                    actions.push({
                        cacheId: [cacheId, i],
                        title: candidate.title,
                        command: candidate.command && this._commands.toInternal(candidate.command, disposables),
                        diagnostics: candidate.diagnostics && candidate.diagnostics.map(typeConvert.Diagnostic.from),
                        edit: candidate.edit && typeConvert.WorkspaceEdit.from(candidate.edit, undefined),
                        kind: candidate.kind && candidate.kind.value,
                        isPreferred: candidate.isPreferred,
                        disabled: candidate.disabled?.reason
                    });
                }
            }
            return { cacheId, actions };
        }
        async resolveCodeAction(id, token) {
            const [sessionId, itemId] = id;
            const item = this._cache.get(sessionId, itemId);
            if (!item || CodeActionAdapter._isCommand(item)) {
                return {}; // code actions only!
            }
            if (!this._provider.resolveCodeAction) {
                return {}; // this should not happen...
            }
            const resolvedItem = (await this._provider.resolveCodeAction(item, token)) ?? item;
            let resolvedEdit;
            if (resolvedItem.edit) {
                resolvedEdit = typeConvert.WorkspaceEdit.from(resolvedItem.edit, undefined);
            }
            let resolvedCommand;
            if (resolvedItem.command) {
                const disposables = this._disposables.get(sessionId);
                if (disposables) {
                    resolvedCommand = this._commands.toInternal(resolvedItem.command, disposables);
                }
            }
            return { edit: resolvedEdit, command: resolvedCommand };
        }
        releaseCodeActions(cachedId) {
            this._disposables.get(cachedId)?.dispose();
            this._disposables.delete(cachedId);
            this._cache.delete(cachedId);
        }
        static _isCommand(thing) {
            return typeof thing.command === 'string' && typeof thing.title === 'string';
        }
    }
    class DocumentPasteEditProvider {
        static toInternalProviderId(extId, editId) {
            return extId + '.' + editId;
        }
        constructor(_proxy, _documents, _provider, _handle, _extension) {
            this._proxy = _proxy;
            this._documents = _documents;
            this._provider = _provider;
            this._handle = _handle;
            this._extension = _extension;
        }
        async prepareDocumentPaste(resource, ranges, dataTransferDto, token) {
            if (!this._provider.prepareDocumentPaste) {
                return;
            }
            const doc = this._documents.getDocument(resource);
            const vscodeRanges = ranges.map(range => typeConvert.Range.to(range));
            const dataTransfer = typeConvert.DataTransfer.toDataTransfer(dataTransferDto, () => {
                throw new errors_1.NotImplementedError();
            });
            await this._provider.prepareDocumentPaste(doc, vscodeRanges, dataTransfer, token);
            if (token.isCancellationRequested) {
                return;
            }
            // Only send back values that have been added to the data transfer
            const entries = Array.from(dataTransfer).filter(([, value]) => !(value instanceof extHostTypes_1.InternalDataTransferItem));
            return typeConvert.DataTransfer.from(entries);
        }
        async providePasteEdits(requestId, resource, ranges, dataTransferDto, token) {
            if (!this._provider.provideDocumentPasteEdits) {
                return;
            }
            const doc = this._documents.getDocument(resource);
            const vscodeRanges = ranges.map(range => typeConvert.Range.to(range));
            const dataTransfer = typeConvert.DataTransfer.toDataTransfer(dataTransferDto, async (id) => {
                return (await this._proxy.$resolvePasteFileData(this._handle, requestId, id)).buffer;
            });
            const edit = await this._provider.provideDocumentPasteEdits(doc, vscodeRanges, dataTransfer, token);
            if (!edit) {
                return;
            }
            return {
                label: edit.label ?? (0, nls_1.localize)('defaultPasteLabel', "Paste using '{0}' extension", this._extension.displayName || this._extension.name),
                detail: this._extension.displayName || this._extension.name,
                yieldTo: edit.yieldTo?.map(yTo => {
                    return 'mimeType' in yTo ? yTo : { providerId: DocumentPasteEditProvider.toInternalProviderId(yTo.extensionId, yTo.providerId) };
                }),
                insertText: typeof edit.insertText === 'string' ? edit.insertText : { snippet: edit.insertText.value },
                additionalEdit: edit.additionalEdit ? typeConvert.WorkspaceEdit.from(edit.additionalEdit, undefined) : undefined,
            };
        }
    }
    class DocumentFormattingAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
        }
        async provideDocumentFormattingEdits(resource, options, token) {
            const document = this._documents.getDocument(resource);
            const value = await this._provider.provideDocumentFormattingEdits(document, options, token);
            if (Array.isArray(value)) {
                return value.map(typeConvert.TextEdit.from);
            }
            return undefined;
        }
    }
    class RangeFormattingAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
        }
        async provideDocumentRangeFormattingEdits(resource, range, options, token) {
            const document = this._documents.getDocument(resource);
            const ran = typeConvert.Range.to(range);
            const value = await this._provider.provideDocumentRangeFormattingEdits(document, ran, options, token);
            if (Array.isArray(value)) {
                return value.map(typeConvert.TextEdit.from);
            }
            return undefined;
        }
        async provideDocumentRangesFormattingEdits(resource, ranges, options, token) {
            (0, types_1.assertType)(typeof this._provider.provideDocumentRangesFormattingEdits === 'function', 'INVALID invocation of `provideDocumentRangesFormattingEdits`');
            const document = this._documents.getDocument(resource);
            const _ranges = ranges.map(typeConvert.Range.to);
            const value = await this._provider.provideDocumentRangesFormattingEdits(document, _ranges, options, token);
            if (Array.isArray(value)) {
                return value.map(typeConvert.TextEdit.from);
            }
            return undefined;
        }
    }
    class OnTypeFormattingAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
            this.autoFormatTriggerCharacters = []; // not here
        }
        async provideOnTypeFormattingEdits(resource, position, ch, options, token) {
            const document = this._documents.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            const value = await this._provider.provideOnTypeFormattingEdits(document, pos, ch, options, token);
            if (Array.isArray(value)) {
                return value.map(typeConvert.TextEdit.from);
            }
            return undefined;
        }
    }
    class NavigateTypeAdapter {
        constructor(_provider, _logService) {
            this._provider = _provider;
            this._logService = _logService;
            this._cache = new cache_1.Cache('WorkspaceSymbols');
        }
        async provideWorkspaceSymbols(search, token) {
            const value = await this._provider.provideWorkspaceSymbols(search, token);
            if (!(0, arrays_1.isNonEmptyArray)(value)) {
                return { symbols: [] };
            }
            const sid = this._cache.add(value);
            const result = {
                cacheId: sid,
                symbols: []
            };
            for (let i = 0; i < value.length; i++) {
                const item = value[i];
                if (!item || !item.name) {
                    this._logService.warn('INVALID SymbolInformation', item);
                    continue;
                }
                result.symbols.push({
                    ...typeConvert.WorkspaceSymbol.from(item),
                    cacheId: [sid, i]
                });
            }
            return result;
        }
        async resolveWorkspaceSymbol(symbol, token) {
            if (typeof this._provider.resolveWorkspaceSymbol !== 'function') {
                return symbol;
            }
            if (!symbol.cacheId) {
                return symbol;
            }
            const item = this._cache.get(...symbol.cacheId);
            if (item) {
                const value = await this._provider.resolveWorkspaceSymbol(item, token);
                return value && (0, objects_1.mixin)(symbol, typeConvert.WorkspaceSymbol.from(value), true);
            }
            return undefined;
        }
        releaseWorkspaceSymbols(id) {
            this._cache.delete(id);
        }
    }
    class RenameAdapter {
        static supportsResolving(provider) {
            return typeof provider.prepareRename === 'function';
        }
        constructor(_documents, _provider, _logService) {
            this._documents = _documents;
            this._provider = _provider;
            this._logService = _logService;
        }
        async provideRenameEdits(resource, position, newName, token) {
            const doc = this._documents.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            try {
                const value = await this._provider.provideRenameEdits(doc, pos, newName, token);
                if (!value) {
                    return undefined;
                }
                return typeConvert.WorkspaceEdit.from(value);
            }
            catch (err) {
                const rejectReason = RenameAdapter._asMessage(err);
                if (rejectReason) {
                    return { rejectReason, edits: undefined };
                }
                else {
                    // generic error
                    return Promise.reject(err);
                }
            }
        }
        async resolveRenameLocation(resource, position, token) {
            if (typeof this._provider.prepareRename !== 'function') {
                return Promise.resolve(undefined);
            }
            const doc = this._documents.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            try {
                const rangeOrLocation = await this._provider.prepareRename(doc, pos, token);
                let range;
                let text;
                if (extHostTypes_1.Range.isRange(rangeOrLocation)) {
                    range = rangeOrLocation;
                    text = doc.getText(rangeOrLocation);
                }
                else if ((0, types_1.isObject)(rangeOrLocation)) {
                    range = rangeOrLocation.range;
                    text = rangeOrLocation.placeholder;
                }
                if (!range || !text) {
                    return undefined;
                }
                if (range.start.line > pos.line || range.end.line < pos.line) {
                    this._logService.warn('INVALID rename location: position line must be within range start/end lines');
                    return undefined;
                }
                return { range: typeConvert.Range.from(range), text };
            }
            catch (err) {
                const rejectReason = RenameAdapter._asMessage(err);
                if (rejectReason) {
                    return { rejectReason, range: undefined, text: undefined };
                }
                else {
                    return Promise.reject(err);
                }
            }
        }
        static _asMessage(err) {
            if (typeof err === 'string') {
                return err;
            }
            else if (err instanceof Error && typeof err.message === 'string') {
                return err.message;
            }
            else {
                return undefined;
            }
        }
    }
    class SemanticTokensPreviousResult {
        constructor(resultId, tokens) {
            this.resultId = resultId;
            this.tokens = tokens;
        }
    }
    class DocumentSemanticTokensAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
            this._nextResultId = 1;
            this._previousResults = new Map();
        }
        async provideDocumentSemanticTokens(resource, previousResultId, token) {
            const doc = this._documents.getDocument(resource);
            const previousResult = (previousResultId !== 0 ? this._previousResults.get(previousResultId) : null);
            let value = typeof previousResult?.resultId === 'string' && typeof this._provider.provideDocumentSemanticTokensEdits === 'function'
                ? await this._provider.provideDocumentSemanticTokensEdits(doc, previousResult.resultId, token)
                : await this._provider.provideDocumentSemanticTokens(doc, token);
            if (previousResult) {
                this._previousResults.delete(previousResultId);
            }
            if (!value) {
                return null;
            }
            value = DocumentSemanticTokensAdapter._fixProvidedSemanticTokens(value);
            return this._send(DocumentSemanticTokensAdapter._convertToEdits(previousResult, value), value);
        }
        async releaseDocumentSemanticColoring(semanticColoringResultId) {
            this._previousResults.delete(semanticColoringResultId);
        }
        static _fixProvidedSemanticTokens(v) {
            if (DocumentSemanticTokensAdapter._isSemanticTokens(v)) {
                if (DocumentSemanticTokensAdapter._isCorrectSemanticTokens(v)) {
                    return v;
                }
                return new extHostTypes_1.SemanticTokens(new Uint32Array(v.data), v.resultId);
            }
            else if (DocumentSemanticTokensAdapter._isSemanticTokensEdits(v)) {
                if (DocumentSemanticTokensAdapter._isCorrectSemanticTokensEdits(v)) {
                    return v;
                }
                return new extHostTypes_1.SemanticTokensEdits(v.edits.map(edit => new extHostTypes_1.SemanticTokensEdit(edit.start, edit.deleteCount, edit.data ? new Uint32Array(edit.data) : edit.data)), v.resultId);
            }
            return v;
        }
        static _isSemanticTokens(v) {
            return v && !!(v.data);
        }
        static _isCorrectSemanticTokens(v) {
            return (v.data instanceof Uint32Array);
        }
        static _isSemanticTokensEdits(v) {
            return v && Array.isArray(v.edits);
        }
        static _isCorrectSemanticTokensEdits(v) {
            for (const edit of v.edits) {
                if (!(edit.data instanceof Uint32Array)) {
                    return false;
                }
            }
            return true;
        }
        static _convertToEdits(previousResult, newResult) {
            if (!DocumentSemanticTokensAdapter._isSemanticTokens(newResult)) {
                return newResult;
            }
            if (!previousResult || !previousResult.tokens) {
                return newResult;
            }
            const oldData = previousResult.tokens;
            const oldLength = oldData.length;
            const newData = newResult.data;
            const newLength = newData.length;
            let commonPrefixLength = 0;
            const maxCommonPrefixLength = Math.min(oldLength, newLength);
            while (commonPrefixLength < maxCommonPrefixLength && oldData[commonPrefixLength] === newData[commonPrefixLength]) {
                commonPrefixLength++;
            }
            if (commonPrefixLength === oldLength && commonPrefixLength === newLength) {
                // complete overlap!
                return new extHostTypes_1.SemanticTokensEdits([], newResult.resultId);
            }
            let commonSuffixLength = 0;
            const maxCommonSuffixLength = maxCommonPrefixLength - commonPrefixLength;
            while (commonSuffixLength < maxCommonSuffixLength && oldData[oldLength - commonSuffixLength - 1] === newData[newLength - commonSuffixLength - 1]) {
                commonSuffixLength++;
            }
            return new extHostTypes_1.SemanticTokensEdits([{
                    start: commonPrefixLength,
                    deleteCount: (oldLength - commonPrefixLength - commonSuffixLength),
                    data: newData.subarray(commonPrefixLength, newLength - commonSuffixLength)
                }], newResult.resultId);
        }
        _send(value, original) {
            if (DocumentSemanticTokensAdapter._isSemanticTokens(value)) {
                const myId = this._nextResultId++;
                this._previousResults.set(myId, new SemanticTokensPreviousResult(value.resultId, value.data));
                return (0, semanticTokensDto_1.encodeSemanticTokensDto)({
                    id: myId,
                    type: 'full',
                    data: value.data
                });
            }
            if (DocumentSemanticTokensAdapter._isSemanticTokensEdits(value)) {
                const myId = this._nextResultId++;
                if (DocumentSemanticTokensAdapter._isSemanticTokens(original)) {
                    // store the original
                    this._previousResults.set(myId, new SemanticTokensPreviousResult(original.resultId, original.data));
                }
                else {
                    this._previousResults.set(myId, new SemanticTokensPreviousResult(value.resultId));
                }
                return (0, semanticTokensDto_1.encodeSemanticTokensDto)({
                    id: myId,
                    type: 'delta',
                    deltas: (value.edits || []).map(edit => ({ start: edit.start, deleteCount: edit.deleteCount, data: edit.data }))
                });
            }
            return null;
        }
    }
    class DocumentRangeSemanticTokensAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
        }
        async provideDocumentRangeSemanticTokens(resource, range, token) {
            const doc = this._documents.getDocument(resource);
            const value = await this._provider.provideDocumentRangeSemanticTokens(doc, typeConvert.Range.to(range), token);
            if (!value) {
                return null;
            }
            return this._send(value);
        }
        _send(value) {
            return (0, semanticTokensDto_1.encodeSemanticTokensDto)({
                id: 0,
                type: 'full',
                data: value.data
            });
        }
    }
    class CompletionsAdapter {
        static supportsResolving(provider) {
            return typeof provider.resolveCompletionItem === 'function';
        }
        constructor(_documents, _commands, _provider, _apiDeprecation, _extension) {
            this._documents = _documents;
            this._commands = _commands;
            this._provider = _provider;
            this._apiDeprecation = _apiDeprecation;
            this._extension = _extension;
            this._cache = new cache_1.Cache('CompletionItem');
            this._disposables = new Map();
        }
        async provideCompletionItems(resource, position, context, token) {
            const doc = this._documents.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            // The default insert/replace ranges. It's important to compute them
            // before asynchronously asking the provider for its results. See
            // https://github.com/microsoft/vscode/issues/83400#issuecomment-546851421
            const replaceRange = doc.getWordRangeAtPosition(pos) || new extHostTypes_1.Range(pos, pos);
            const insertRange = replaceRange.with({ end: pos });
            const sw = new stopwatch_1.StopWatch();
            const itemsOrList = await this._provider.provideCompletionItems(doc, pos, token, typeConvert.CompletionContext.to(context));
            if (!itemsOrList) {
                // undefined and null are valid results
                return undefined;
            }
            if (token.isCancellationRequested) {
                // cancelled -> return without further ado, esp no caching
                // of results as they will leak
                return undefined;
            }
            const list = Array.isArray(itemsOrList) ? new extHostTypes_1.CompletionList(itemsOrList) : itemsOrList;
            // keep result for providers that support resolving
            const pid = CompletionsAdapter.supportsResolving(this._provider) ? this._cache.add(list.items) : this._cache.add([]);
            const disposables = new lifecycle_1.DisposableStore();
            this._disposables.set(pid, disposables);
            const completions = [];
            const result = {
                x: pid,
                ["b" /* extHostProtocol.ISuggestResultDtoField.completions */]: completions,
                ["a" /* extHostProtocol.ISuggestResultDtoField.defaultRanges */]: { replace: typeConvert.Range.from(replaceRange), insert: typeConvert.Range.from(insertRange) },
                ["c" /* extHostProtocol.ISuggestResultDtoField.isIncomplete */]: list.isIncomplete || undefined,
                ["d" /* extHostProtocol.ISuggestResultDtoField.duration */]: sw.elapsed()
            };
            for (let i = 0; i < list.items.length; i++) {
                const item = list.items[i];
                // check for bad completion item first
                const dto = this._convertCompletionItem(item, [pid, i], insertRange, replaceRange);
                completions.push(dto);
            }
            return result;
        }
        async resolveCompletionItem(id, token) {
            if (typeof this._provider.resolveCompletionItem !== 'function') {
                return undefined;
            }
            const item = this._cache.get(...id);
            if (!item) {
                return undefined;
            }
            const dto1 = this._convertCompletionItem(item, id);
            const resolvedItem = await this._provider.resolveCompletionItem(item, token);
            if (!resolvedItem) {
                return undefined;
            }
            const dto2 = this._convertCompletionItem(resolvedItem, id);
            if (dto1["h" /* extHostProtocol.ISuggestDataDtoField.insertText */] !== dto2["h" /* extHostProtocol.ISuggestDataDtoField.insertText */]
                || dto1["i" /* extHostProtocol.ISuggestDataDtoField.insertTextRules */] !== dto2["i" /* extHostProtocol.ISuggestDataDtoField.insertTextRules */]) {
                this._apiDeprecation.report('CompletionItem.insertText', this._extension, 'extension MAY NOT change \'insertText\' of a CompletionItem during resolve');
            }
            if (dto1["n" /* extHostProtocol.ISuggestDataDtoField.commandIdent */] !== dto2["n" /* extHostProtocol.ISuggestDataDtoField.commandIdent */]
                || dto1["o" /* extHostProtocol.ISuggestDataDtoField.commandId */] !== dto2["o" /* extHostProtocol.ISuggestDataDtoField.commandId */]
                || !(0, objects_1.equals)(dto1["p" /* extHostProtocol.ISuggestDataDtoField.commandArguments */], dto2["p" /* extHostProtocol.ISuggestDataDtoField.commandArguments */])) {
                this._apiDeprecation.report('CompletionItem.command', this._extension, 'extension MAY NOT change \'command\' of a CompletionItem during resolve');
            }
            return {
                ...dto1,
                ["d" /* extHostProtocol.ISuggestDataDtoField.documentation */]: dto2["d" /* extHostProtocol.ISuggestDataDtoField.documentation */],
                ["c" /* extHostProtocol.ISuggestDataDtoField.detail */]: dto2["c" /* extHostProtocol.ISuggestDataDtoField.detail */],
                ["l" /* extHostProtocol.ISuggestDataDtoField.additionalTextEdits */]: dto2["l" /* extHostProtocol.ISuggestDataDtoField.additionalTextEdits */],
                // (fishy) async insertText
                ["h" /* extHostProtocol.ISuggestDataDtoField.insertText */]: dto2["h" /* extHostProtocol.ISuggestDataDtoField.insertText */],
                ["i" /* extHostProtocol.ISuggestDataDtoField.insertTextRules */]: dto2["i" /* extHostProtocol.ISuggestDataDtoField.insertTextRules */],
                // (fishy) async command
                ["n" /* extHostProtocol.ISuggestDataDtoField.commandIdent */]: dto2["n" /* extHostProtocol.ISuggestDataDtoField.commandIdent */],
                ["o" /* extHostProtocol.ISuggestDataDtoField.commandId */]: dto2["o" /* extHostProtocol.ISuggestDataDtoField.commandId */],
                ["p" /* extHostProtocol.ISuggestDataDtoField.commandArguments */]: dto2["p" /* extHostProtocol.ISuggestDataDtoField.commandArguments */],
            };
        }
        releaseCompletionItems(id) {
            this._disposables.get(id)?.dispose();
            this._disposables.delete(id);
            this._cache.delete(id);
        }
        _convertCompletionItem(item, id, defaultInsertRange, defaultReplaceRange) {
            const disposables = this._disposables.get(id[0]);
            if (!disposables) {
                throw Error('DisposableStore is missing...');
            }
            const command = this._commands.toInternal(item.command, disposables);
            const result = {
                //
                x: id,
                //
                ["a" /* extHostProtocol.ISuggestDataDtoField.label */]: item.label,
                ["b" /* extHostProtocol.ISuggestDataDtoField.kind */]: item.kind !== undefined ? typeConvert.CompletionItemKind.from(item.kind) : undefined,
                ["m" /* extHostProtocol.ISuggestDataDtoField.kindModifier */]: item.tags && item.tags.map(typeConvert.CompletionItemTag.from),
                ["c" /* extHostProtocol.ISuggestDataDtoField.detail */]: item.detail,
                ["d" /* extHostProtocol.ISuggestDataDtoField.documentation */]: typeof item.documentation === 'undefined' ? undefined : typeConvert.MarkdownString.fromStrict(item.documentation),
                ["e" /* extHostProtocol.ISuggestDataDtoField.sortText */]: item.sortText !== item.label ? item.sortText : undefined,
                ["f" /* extHostProtocol.ISuggestDataDtoField.filterText */]: item.filterText !== item.label ? item.filterText : undefined,
                ["g" /* extHostProtocol.ISuggestDataDtoField.preselect */]: item.preselect || undefined,
                ["i" /* extHostProtocol.ISuggestDataDtoField.insertTextRules */]: item.keepWhitespace ? 1 /* languages.CompletionItemInsertTextRule.KeepWhitespace */ : 0 /* languages.CompletionItemInsertTextRule.None */,
                ["k" /* extHostProtocol.ISuggestDataDtoField.commitCharacters */]: item.commitCharacters?.join(''),
                ["l" /* extHostProtocol.ISuggestDataDtoField.additionalTextEdits */]: item.additionalTextEdits && item.additionalTextEdits.map(typeConvert.TextEdit.from),
                ["n" /* extHostProtocol.ISuggestDataDtoField.commandIdent */]: command?.$ident,
                ["o" /* extHostProtocol.ISuggestDataDtoField.commandId */]: command?.id,
                ["p" /* extHostProtocol.ISuggestDataDtoField.commandArguments */]: command?.$ident ? undefined : command?.arguments, // filled in on main side from $ident
            };
            // 'insertText'-logic
            if (item.textEdit) {
                this._apiDeprecation.report('CompletionItem.textEdit', this._extension, `Use 'CompletionItem.insertText' and 'CompletionItem.range' instead.`);
                result["h" /* extHostProtocol.ISuggestDataDtoField.insertText */] = item.textEdit.newText;
            }
            else if (typeof item.insertText === 'string') {
                result["h" /* extHostProtocol.ISuggestDataDtoField.insertText */] = item.insertText;
            }
            else if (item.insertText instanceof extHostTypes_1.SnippetString) {
                result["h" /* extHostProtocol.ISuggestDataDtoField.insertText */] = item.insertText.value;
                result["i" /* extHostProtocol.ISuggestDataDtoField.insertTextRules */] |= 4 /* languages.CompletionItemInsertTextRule.InsertAsSnippet */;
            }
            // 'overwrite[Before|After]'-logic
            let range;
            if (item.textEdit) {
                range = item.textEdit.range;
            }
            else if (item.range) {
                range = item.range;
            }
            if (extHostTypes_1.Range.isRange(range)) {
                // "old" range
                result["j" /* extHostProtocol.ISuggestDataDtoField.range */] = typeConvert.Range.from(range);
            }
            else if (range && (!defaultInsertRange?.isEqual(range.inserting) || !defaultReplaceRange?.isEqual(range.replacing))) {
                // ONLY send range when it's different from the default ranges (safe bandwidth)
                result["j" /* extHostProtocol.ISuggestDataDtoField.range */] = {
                    insert: typeConvert.Range.from(range.inserting),
                    replace: typeConvert.Range.from(range.replacing)
                };
            }
            return result;
        }
    }
    class InlineCompletionAdapterBase {
        async provideInlineCompletions(resource, position, context, token) {
            return undefined;
        }
        disposeCompletions(pid) { }
        handleDidShowCompletionItem(pid, idx, updatedInsertText) { }
        handlePartialAccept(pid, idx, acceptedCharacters) { }
    }
    class InlineCompletionAdapter extends InlineCompletionAdapterBase {
        constructor(_extension, _documents, _provider, _commands) {
            super();
            this._extension = _extension;
            this._documents = _documents;
            this._provider = _provider;
            this._commands = _commands;
            this._references = new ReferenceMap();
            this._isAdditionsProposedApiEnabled = (0, extensions_2.isProposedApiEnabled)(this._extension, 'inlineCompletionsAdditions');
            this.languageTriggerKindToVSCodeTriggerKind = {
                [languages.InlineCompletionTriggerKind.Automatic]: extHostTypes_1.InlineCompletionTriggerKind.Automatic,
                [languages.InlineCompletionTriggerKind.Explicit]: extHostTypes_1.InlineCompletionTriggerKind.Invoke,
            };
        }
        get supportsHandleEvents() {
            return (0, extensions_2.isProposedApiEnabled)(this._extension, 'inlineCompletionsAdditions')
                && (typeof this._provider.handleDidShowCompletionItem === 'function'
                    || typeof this._provider.handleDidPartiallyAcceptCompletionItem === 'function');
        }
        async provideInlineCompletions(resource, position, context, token) {
            const doc = this._documents.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            const result = await this._provider.provideInlineCompletionItems(doc, pos, {
                selectedCompletionInfo: context.selectedSuggestionInfo
                    ? {
                        range: typeConvert.Range.to(context.selectedSuggestionInfo.range),
                        text: context.selectedSuggestionInfo.text
                    }
                    : undefined,
                triggerKind: this.languageTriggerKindToVSCodeTriggerKind[context.triggerKind]
            }, token);
            if (!result) {
                // undefined and null are valid results
                return undefined;
            }
            if (token.isCancellationRequested) {
                // cancelled -> return without further ado, esp no caching
                // of results as they will leak
                return undefined;
            }
            const normalizedResult = Array.isArray(result) ? result : result.items;
            const commands = this._isAdditionsProposedApiEnabled ? Array.isArray(result) ? [] : result.commands || [] : [];
            const enableForwardStability = this._isAdditionsProposedApiEnabled && !Array.isArray(result) ? result.enableForwardStability : undefined;
            let disposableStore = undefined;
            const pid = this._references.createReferenceId({
                dispose() {
                    disposableStore?.dispose();
                },
                items: normalizedResult
            });
            return {
                pid,
                items: normalizedResult.map((item, idx) => {
                    let command = undefined;
                    if (item.command) {
                        if (!disposableStore) {
                            disposableStore = new lifecycle_1.DisposableStore();
                        }
                        command = this._commands.toInternal(item.command, disposableStore);
                    }
                    const insertText = item.insertText;
                    return ({
                        insertText: typeof insertText === 'string' ? insertText : { snippet: insertText.value },
                        filterText: item.filterText,
                        range: item.range ? typeConvert.Range.from(item.range) : undefined,
                        command,
                        idx: idx,
                        completeBracketPairs: this._isAdditionsProposedApiEnabled ? item.completeBracketPairs : false,
                    });
                }),
                commands: commands.map(c => {
                    if (!disposableStore) {
                        disposableStore = new lifecycle_1.DisposableStore();
                    }
                    return this._commands.toInternal(c, disposableStore);
                }),
                suppressSuggestions: false,
                enableForwardStability,
            };
        }
        disposeCompletions(pid) {
            const data = this._references.disposeReferenceId(pid);
            data?.dispose();
        }
        handleDidShowCompletionItem(pid, idx, updatedInsertText) {
            const completionItem = this._references.get(pid)?.items[idx];
            if (completionItem) {
                if (this._provider.handleDidShowCompletionItem && this._isAdditionsProposedApiEnabled) {
                    this._provider.handleDidShowCompletionItem(completionItem, updatedInsertText);
                }
            }
        }
        handlePartialAccept(pid, idx, acceptedCharacters) {
            const completionItem = this._references.get(pid)?.items[idx];
            if (completionItem) {
                if (this._provider.handleDidPartiallyAcceptCompletionItem && this._isAdditionsProposedApiEnabled) {
                    this._provider.handleDidPartiallyAcceptCompletionItem(completionItem, acceptedCharacters);
                }
            }
        }
    }
    class ReferenceMap {
        constructor() {
            this._references = new Map();
            this._idPool = 1;
        }
        createReferenceId(value) {
            const id = this._idPool++;
            this._references.set(id, value);
            return id;
        }
        disposeReferenceId(referenceId) {
            const value = this._references.get(referenceId);
            this._references.delete(referenceId);
            return value;
        }
        get(referenceId) {
            return this._references.get(referenceId);
        }
    }
    class SignatureHelpAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
            this._cache = new cache_1.Cache('SignatureHelp');
        }
        async provideSignatureHelp(resource, position, context, token) {
            const doc = this._documents.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            const vscodeContext = this.reviveContext(context);
            const value = await this._provider.provideSignatureHelp(doc, pos, token, vscodeContext);
            if (value) {
                const id = this._cache.add([value]);
                return { ...typeConvert.SignatureHelp.from(value), id };
            }
            return undefined;
        }
        reviveContext(context) {
            let activeSignatureHelp = undefined;
            if (context.activeSignatureHelp) {
                const revivedSignatureHelp = typeConvert.SignatureHelp.to(context.activeSignatureHelp);
                const saved = this._cache.get(context.activeSignatureHelp.id, 0);
                if (saved) {
                    activeSignatureHelp = saved;
                    activeSignatureHelp.activeSignature = revivedSignatureHelp.activeSignature;
                    activeSignatureHelp.activeParameter = revivedSignatureHelp.activeParameter;
                }
                else {
                    activeSignatureHelp = revivedSignatureHelp;
                }
            }
            return { ...context, activeSignatureHelp };
        }
        releaseSignatureHelp(id) {
            this._cache.delete(id);
        }
    }
    class InlayHintsAdapter {
        constructor(_documents, _commands, _provider, _logService, _extension) {
            this._documents = _documents;
            this._commands = _commands;
            this._provider = _provider;
            this._logService = _logService;
            this._extension = _extension;
            this._cache = new cache_1.Cache('InlayHints');
            this._disposables = new Map();
        }
        async provideInlayHints(resource, ran, token) {
            const doc = this._documents.getDocument(resource);
            const range = typeConvert.Range.to(ran);
            const hints = await this._provider.provideInlayHints(doc, range, token);
            if (!Array.isArray(hints) || hints.length === 0) {
                // bad result
                this._logService.trace(`[InlayHints] NO inlay hints from '${this._extension.identifier.value}' for ${ran}`);
                return undefined;
            }
            if (token.isCancellationRequested) {
                // cancelled -> return without further ado, esp no caching
                // of results as they will leak
                return undefined;
            }
            const pid = this._cache.add(hints);
            this._disposables.set(pid, new lifecycle_1.DisposableStore());
            const result = { hints: [], cacheId: pid };
            for (let i = 0; i < hints.length; i++) {
                if (this._isValidInlayHint(hints[i], range)) {
                    result.hints.push(this._convertInlayHint(hints[i], [pid, i]));
                }
            }
            this._logService.trace(`[InlayHints] ${result.hints.length} inlay hints from '${this._extension.identifier.value}' for ${ran}`);
            return result;
        }
        async resolveInlayHint(id, token) {
            if (typeof this._provider.resolveInlayHint !== 'function') {
                return undefined;
            }
            const item = this._cache.get(...id);
            if (!item) {
                return undefined;
            }
            const hint = await this._provider.resolveInlayHint(item, token);
            if (!hint) {
                return undefined;
            }
            if (!this._isValidInlayHint(hint)) {
                return undefined;
            }
            return this._convertInlayHint(hint, id);
        }
        releaseHints(id) {
            this._disposables.get(id)?.dispose();
            this._disposables.delete(id);
            this._cache.delete(id);
        }
        _isValidInlayHint(hint, range) {
            if (hint.label.length === 0 || Array.isArray(hint.label) && hint.label.every(part => part.value.length === 0)) {
                console.log('INVALID inlay hint, empty label', hint);
                return false;
            }
            if (range && !range.contains(hint.position)) {
                // console.log('INVALID inlay hint, position outside range', range, hint);
                return false;
            }
            return true;
        }
        _convertInlayHint(hint, id) {
            const disposables = this._disposables.get(id[0]);
            if (!disposables) {
                throw Error('DisposableStore is missing...');
            }
            const result = {
                label: '',
                cacheId: id,
                tooltip: typeConvert.MarkdownString.fromStrict(hint.tooltip),
                position: typeConvert.Position.from(hint.position),
                textEdits: hint.textEdits && hint.textEdits.map(typeConvert.TextEdit.from),
                kind: hint.kind && typeConvert.InlayHintKind.from(hint.kind),
                paddingLeft: hint.paddingLeft,
                paddingRight: hint.paddingRight,
            };
            if (typeof hint.label === 'string') {
                result.label = hint.label;
            }
            else {
                result.label = hint.label.map(part => {
                    const result = { label: part.value };
                    result.tooltip = typeConvert.MarkdownString.fromStrict(part.tooltip);
                    if (extHostTypes_1.Location.isLocation(part.location)) {
                        result.location = typeConvert.location.from(part.location);
                    }
                    if (part.command) {
                        result.command = this._commands.toInternal(part.command, disposables);
                    }
                    return result;
                });
            }
            return result;
        }
    }
    class LinkProviderAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
            this._cache = new cache_1.Cache('DocumentLink');
        }
        async provideLinks(resource, token) {
            const doc = this._documents.getDocument(resource);
            const links = await this._provider.provideDocumentLinks(doc, token);
            if (!Array.isArray(links) || links.length === 0) {
                // bad result
                return undefined;
            }
            if (token.isCancellationRequested) {
                // cancelled -> return without further ado, esp no caching
                // of results as they will leak
                return undefined;
            }
            if (typeof this._provider.resolveDocumentLink !== 'function') {
                // no resolve -> no caching
                return { links: links.filter(LinkProviderAdapter._validateLink).map(typeConvert.DocumentLink.from) };
            }
            else {
                // cache links for future resolving
                const pid = this._cache.add(links);
                const result = { links: [], cacheId: pid };
                for (let i = 0; i < links.length; i++) {
                    if (!LinkProviderAdapter._validateLink(links[i])) {
                        continue;
                    }
                    const dto = typeConvert.DocumentLink.from(links[i]);
                    dto.cacheId = [pid, i];
                    result.links.push(dto);
                }
                return result;
            }
        }
        static _validateLink(link) {
            if (link.target && link.target.path.length > 50000) {
                console.warn('DROPPING link because it is too long');
                return false;
            }
            return true;
        }
        async resolveLink(id, token) {
            if (typeof this._provider.resolveDocumentLink !== 'function') {
                return undefined;
            }
            const item = this._cache.get(...id);
            if (!item) {
                return undefined;
            }
            const link = await this._provider.resolveDocumentLink(item, token);
            if (!link || !LinkProviderAdapter._validateLink(link)) {
                return undefined;
            }
            return typeConvert.DocumentLink.from(link);
        }
        releaseLinks(id) {
            this._cache.delete(id);
        }
    }
    class ColorProviderAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
        }
        async provideColors(resource, token) {
            const doc = this._documents.getDocument(resource);
            const colors = await this._provider.provideDocumentColors(doc, token);
            if (!Array.isArray(colors)) {
                return [];
            }
            const colorInfos = colors.map(ci => {
                return {
                    color: typeConvert.Color.from(ci.color),
                    range: typeConvert.Range.from(ci.range)
                };
            });
            return colorInfos;
        }
        async provideColorPresentations(resource, raw, token) {
            const document = this._documents.getDocument(resource);
            const range = typeConvert.Range.to(raw.range);
            const color = typeConvert.Color.to(raw.color);
            const value = await this._provider.provideColorPresentations(color, { document, range }, token);
            if (!Array.isArray(value)) {
                return undefined;
            }
            return value.map(typeConvert.ColorPresentation.from);
        }
    }
    class FoldingProviderAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
        }
        async provideFoldingRanges(resource, context, token) {
            const doc = this._documents.getDocument(resource);
            const ranges = await this._provider.provideFoldingRanges(doc, context, token);
            if (!Array.isArray(ranges)) {
                return undefined;
            }
            return ranges.map(typeConvert.FoldingRange.from);
        }
    }
    class SelectionRangeAdapter {
        constructor(_documents, _provider, _logService) {
            this._documents = _documents;
            this._provider = _provider;
            this._logService = _logService;
        }
        async provideSelectionRanges(resource, pos, token) {
            const document = this._documents.getDocument(resource);
            const positions = pos.map(typeConvert.Position.to);
            const allProviderRanges = await this._provider.provideSelectionRanges(document, positions, token);
            if (!(0, arrays_1.isNonEmptyArray)(allProviderRanges)) {
                return [];
            }
            if (allProviderRanges.length !== positions.length) {
                this._logService.warn('BAD selection ranges, provider must return ranges for each position');
                return [];
            }
            const allResults = [];
            for (let i = 0; i < positions.length; i++) {
                const oneResult = [];
                allResults.push(oneResult);
                let last = positions[i];
                let selectionRange = allProviderRanges[i];
                while (true) {
                    if (!selectionRange.range.contains(last)) {
                        throw new Error('INVALID selection range, must contain the previous range');
                    }
                    oneResult.push(typeConvert.SelectionRange.from(selectionRange));
                    if (!selectionRange.parent) {
                        break;
                    }
                    last = selectionRange.range;
                    selectionRange = selectionRange.parent;
                }
            }
            return allResults;
        }
    }
    class CallHierarchyAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
            this._idPool = new idGenerator_1.IdGenerator('');
            this._cache = new Map();
        }
        async prepareSession(uri, position, token) {
            const doc = this._documents.getDocument(uri);
            const pos = typeConvert.Position.to(position);
            const items = await this._provider.prepareCallHierarchy(doc, pos, token);
            if (!items) {
                return undefined;
            }
            const sessionId = this._idPool.nextId();
            this._cache.set(sessionId, new Map());
            if (Array.isArray(items)) {
                return items.map(item => this._cacheAndConvertItem(sessionId, item));
            }
            else {
                return [this._cacheAndConvertItem(sessionId, items)];
            }
        }
        async provideCallsTo(sessionId, itemId, token) {
            const item = this._itemFromCache(sessionId, itemId);
            if (!item) {
                throw new Error('missing call hierarchy item');
            }
            const calls = await this._provider.provideCallHierarchyIncomingCalls(item, token);
            if (!calls) {
                return undefined;
            }
            return calls.map(call => {
                return {
                    from: this._cacheAndConvertItem(sessionId, call.from),
                    fromRanges: call.fromRanges.map(r => typeConvert.Range.from(r))
                };
            });
        }
        async provideCallsFrom(sessionId, itemId, token) {
            const item = this._itemFromCache(sessionId, itemId);
            if (!item) {
                throw new Error('missing call hierarchy item');
            }
            const calls = await this._provider.provideCallHierarchyOutgoingCalls(item, token);
            if (!calls) {
                return undefined;
            }
            return calls.map(call => {
                return {
                    to: this._cacheAndConvertItem(sessionId, call.to),
                    fromRanges: call.fromRanges.map(r => typeConvert.Range.from(r))
                };
            });
        }
        releaseSession(sessionId) {
            this._cache.delete(sessionId);
        }
        _cacheAndConvertItem(sessionId, item) {
            const map = this._cache.get(sessionId);
            const dto = typeConvert.CallHierarchyItem.from(item, sessionId, map.size.toString(36));
            map.set(dto._itemId, item);
            return dto;
        }
        _itemFromCache(sessionId, itemId) {
            const map = this._cache.get(sessionId);
            return map?.get(itemId);
        }
    }
    class TypeHierarchyAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
            this._idPool = new idGenerator_1.IdGenerator('');
            this._cache = new Map();
        }
        async prepareSession(uri, position, token) {
            const doc = this._documents.getDocument(uri);
            const pos = typeConvert.Position.to(position);
            const items = await this._provider.prepareTypeHierarchy(doc, pos, token);
            if (!items) {
                return undefined;
            }
            const sessionId = this._idPool.nextId();
            this._cache.set(sessionId, new Map());
            if (Array.isArray(items)) {
                return items.map(item => this._cacheAndConvertItem(sessionId, item));
            }
            else {
                return [this._cacheAndConvertItem(sessionId, items)];
            }
        }
        async provideSupertypes(sessionId, itemId, token) {
            const item = this._itemFromCache(sessionId, itemId);
            if (!item) {
                throw new Error('missing type hierarchy item');
            }
            const supertypes = await this._provider.provideTypeHierarchySupertypes(item, token);
            if (!supertypes) {
                return undefined;
            }
            return supertypes.map(supertype => {
                return this._cacheAndConvertItem(sessionId, supertype);
            });
        }
        async provideSubtypes(sessionId, itemId, token) {
            const item = this._itemFromCache(sessionId, itemId);
            if (!item) {
                throw new Error('missing type hierarchy item');
            }
            const subtypes = await this._provider.provideTypeHierarchySubtypes(item, token);
            if (!subtypes) {
                return undefined;
            }
            return subtypes.map(subtype => {
                return this._cacheAndConvertItem(sessionId, subtype);
            });
        }
        releaseSession(sessionId) {
            this._cache.delete(sessionId);
        }
        _cacheAndConvertItem(sessionId, item) {
            const map = this._cache.get(sessionId);
            const dto = typeConvert.TypeHierarchyItem.from(item, sessionId, map.size.toString(36));
            map.set(dto._itemId, item);
            return dto;
        }
        _itemFromCache(sessionId, itemId) {
            const map = this._cache.get(sessionId);
            return map?.get(itemId);
        }
    }
    class DocumentOnDropEditAdapter {
        static toInternalProviderId(extId, editId) {
            return extId + '.' + editId;
        }
        constructor(_proxy, _documents, _provider, _handle, _extension) {
            this._proxy = _proxy;
            this._documents = _documents;
            this._provider = _provider;
            this._handle = _handle;
            this._extension = _extension;
        }
        async provideDocumentOnDropEdits(requestId, uri, position, dataTransferDto, token) {
            const doc = this._documents.getDocument(uri);
            const pos = typeConvert.Position.to(position);
            const dataTransfer = typeConvert.DataTransfer.toDataTransfer(dataTransferDto, async (id) => {
                return (await this._proxy.$resolveDocumentOnDropFileData(this._handle, requestId, id)).buffer;
            });
            const edit = await this._provider.provideDocumentDropEdits(doc, pos, dataTransfer, token);
            if (!edit) {
                return undefined;
            }
            return {
                label: edit.label ?? (0, nls_1.localize)('defaultDropLabel', "Drop using '{0}' extension", this._extension.displayName || this._extension.name),
                yieldTo: edit.yieldTo?.map(yTo => {
                    return 'mimeType' in yTo ? yTo : { providerId: DocumentOnDropEditAdapter.toInternalProviderId(yTo.extensionId, yTo.providerId) };
                }),
                insertText: typeof edit.insertText === 'string' ? edit.insertText : { snippet: edit.insertText.value },
                additionalEdit: edit.additionalEdit ? typeConvert.WorkspaceEdit.from(edit.additionalEdit, undefined) : undefined,
            };
        }
    }
    class MappedEditsAdapter {
        constructor(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
        }
        async provideMappedEdits(resource, codeBlocks, context, token) {
            const uri = uri_1.URI.revive(resource);
            const doc = this._documents.getDocument(uri);
            const ctx = {
                selections: context.selections.map(s => typeConvert.Selection.to(s)),
                related: context.related.map(r => ({ uri: uri_1.URI.revive(r.uri), range: typeConvert.Range.to(r.range) })),
            };
            const mappedEdits = await this._provider.provideMappedEdits(doc, codeBlocks, ctx, token);
            return mappedEdits ? typeConvert.WorkspaceEdit.from(mappedEdits) : null;
        }
    }
    class AdapterData {
        constructor(adapter, extension) {
            this.adapter = adapter;
            this.extension = extension;
        }
    }
    class ExtHostLanguageFeatures {
        static { this._handlePool = 0; }
        constructor(mainContext, _uriTransformer, _documents, _commands, _diagnostics, _logService, _apiDeprecation, _extensionTelemetry) {
            this._uriTransformer = _uriTransformer;
            this._documents = _documents;
            this._commands = _commands;
            this._diagnostics = _diagnostics;
            this._logService = _logService;
            this._apiDeprecation = _apiDeprecation;
            this._extensionTelemetry = _extensionTelemetry;
            this._adapter = new Map();
            this._proxy = mainContext.getProxy(extHostProtocol.MainContext.MainThreadLanguageFeatures);
        }
        _transformDocumentSelector(selector, extension) {
            return typeConvert.DocumentSelector.from(selector, this._uriTransformer, extension);
        }
        _createDisposable(handle) {
            return new extHostTypes_1.Disposable(() => {
                this._adapter.delete(handle);
                this._proxy.$unregister(handle);
            });
        }
        _nextHandle() {
            return ExtHostLanguageFeatures._handlePool++;
        }
        async _withAdapter(handle, ctor, callback, fallbackValue, tokenToRaceAgainst, doNotLog = false) {
            const data = this._adapter.get(handle);
            if (!data || !(data.adapter instanceof ctor)) {
                return fallbackValue;
            }
            const t1 = Date.now();
            if (!doNotLog) {
                this._logService.trace(`[${data.extension.identifier.value}] INVOKE provider '${callback.toString().replace(/[\r\n]/g, '')}'`);
            }
            const result = callback(data.adapter, data.extension);
            // logging,tracing
            Promise.resolve(result).catch(err => {
                if (!(0, errors_1.isCancellationError)(err)) {
                    this._logService.error(`[${data.extension.identifier.value}] provider FAILED`);
                    this._logService.error(err);
                    this._extensionTelemetry.onExtensionError(data.extension.identifier, err);
                }
            }).finally(() => {
                if (!doNotLog) {
                    this._logService.trace(`[${data.extension.identifier.value}] provider DONE after ${Date.now() - t1}ms`);
                }
            });
            if (cancellation_1.CancellationToken.isCancellationToken(tokenToRaceAgainst)) {
                return (0, async_1.raceCancellationError)(result, tokenToRaceAgainst);
            }
            return result;
        }
        _addNewAdapter(adapter, extension) {
            const handle = this._nextHandle();
            this._adapter.set(handle, new AdapterData(adapter, extension));
            return handle;
        }
        static _extLabel(ext) {
            return ext.displayName || ext.name;
        }
        // --- outline
        registerDocumentSymbolProvider(extension, selector, provider, metadata) {
            const handle = this._addNewAdapter(new DocumentSymbolAdapter(this._documents, provider), extension);
            const displayName = (metadata && metadata.label) || ExtHostLanguageFeatures._extLabel(extension);
            this._proxy.$registerDocumentSymbolProvider(handle, this._transformDocumentSelector(selector, extension), displayName);
            return this._createDisposable(handle);
        }
        $provideDocumentSymbols(handle, resource, token) {
            return this._withAdapter(handle, DocumentSymbolAdapter, adapter => adapter.provideDocumentSymbols(uri_1.URI.revive(resource), token), undefined, token);
        }
        // --- code lens
        registerCodeLensProvider(extension, selector, provider) {
            const handle = this._nextHandle();
            const eventHandle = typeof provider.onDidChangeCodeLenses === 'function' ? this._nextHandle() : undefined;
            this._adapter.set(handle, new AdapterData(new CodeLensAdapter(this._documents, this._commands.converter, provider), extension));
            this._proxy.$registerCodeLensSupport(handle, this._transformDocumentSelector(selector, extension), eventHandle);
            let result = this._createDisposable(handle);
            if (eventHandle !== undefined) {
                const subscription = provider.onDidChangeCodeLenses(_ => this._proxy.$emitCodeLensEvent(eventHandle));
                result = extHostTypes_1.Disposable.from(result, subscription);
            }
            return result;
        }
        $provideCodeLenses(handle, resource, token) {
            return this._withAdapter(handle, CodeLensAdapter, adapter => adapter.provideCodeLenses(uri_1.URI.revive(resource), token), undefined, token);
        }
        $resolveCodeLens(handle, symbol, token) {
            return this._withAdapter(handle, CodeLensAdapter, adapter => adapter.resolveCodeLens(symbol, token), undefined, undefined);
        }
        $releaseCodeLenses(handle, cacheId) {
            this._withAdapter(handle, CodeLensAdapter, adapter => Promise.resolve(adapter.releaseCodeLenses(cacheId)), undefined, undefined);
        }
        // --- declaration
        registerDefinitionProvider(extension, selector, provider) {
            const handle = this._addNewAdapter(new DefinitionAdapter(this._documents, provider), extension);
            this._proxy.$registerDefinitionSupport(handle, this._transformDocumentSelector(selector, extension));
            return this._createDisposable(handle);
        }
        $provideDefinition(handle, resource, position, token) {
            return this._withAdapter(handle, DefinitionAdapter, adapter => adapter.provideDefinition(uri_1.URI.revive(resource), position, token), [], token);
        }
        registerDeclarationProvider(extension, selector, provider) {
            const handle = this._addNewAdapter(new DeclarationAdapter(this._documents, provider), extension);
            this._proxy.$registerDeclarationSupport(handle, this._transformDocumentSelector(selector, extension));
            return this._createDisposable(handle);
        }
        $provideDeclaration(handle, resource, position, token) {
            return this._withAdapter(handle, DeclarationAdapter, adapter => adapter.provideDeclaration(uri_1.URI.revive(resource), position, token), [], token);
        }
        registerImplementationProvider(extension, selector, provider) {
            const handle = this._addNewAdapter(new ImplementationAdapter(this._documents, provider), extension);
            this._proxy.$registerImplementationSupport(handle, this._transformDocumentSelector(selector, extension));
            return this._createDisposable(handle);
        }
        $provideImplementation(handle, resource, position, token) {
            return this._withAdapter(handle, ImplementationAdapter, adapter => adapter.provideImplementation(uri_1.URI.revive(resource), position, token), [], token);
        }
        registerTypeDefinitionProvider(extension, selector, provider) {
            const handle = this._addNewAdapter(new TypeDefinitionAdapter(this._documents, provider), extension);
            this._proxy.$registerTypeDefinitionSupport(handle, this._transformDocumentSelector(selector, extension));
            return this._createDisposable(handle);
        }
        $provideTypeDefinition(handle, resource, position, token) {
            return this._withAdapter(handle, TypeDefinitionAdapter, adapter => adapter.provideTypeDefinition(uri_1.URI.revive(resource), position, token), [], token);
        }
        // --- extra info
        registerHoverProvider(extension, selector, provider, extensionId) {
            const handle = this._addNewAdapter(new HoverAdapter(this._documents, provider), extension);
            this._proxy.$registerHoverProvider(handle, this._transformDocumentSelector(selector, extension));
            return this._createDisposable(handle);
        }
        $provideHover(handle, resource, position, token) {
            return this._withAdapter(handle, HoverAdapter, adapter => adapter.provideHover(uri_1.URI.revive(resource), position, token), undefined, token);
        }
        // --- debug hover
        registerEvaluatableExpressionProvider(extension, selector, provider, extensionId) {
            const handle = this._addNewAdapter(new EvaluatableExpressionAdapter(this._documents, provider), extension);
            this._proxy.$registerEvaluatableExpressionProvider(handle, this._transformDocumentSelector(selector, extension));
            return this._createDisposable(handle);
        }
        $provideEvaluatableExpression(handle, resource, position, token) {
            return this._withAdapter(handle, EvaluatableExpressionAdapter, adapter => adapter.provideEvaluatableExpression(uri_1.URI.revive(resource), position, token), undefined, token);
        }
        // --- debug inline values
        registerInlineValuesProvider(extension, selector, provider, extensionId) {
            const eventHandle = typeof provider.onDidChangeInlineValues === 'function' ? this._nextHandle() : undefined;
            const handle = this._addNewAdapter(new InlineValuesAdapter(this._documents, provider), extension);
            this._proxy.$registerInlineValuesProvider(handle, this._transformDocumentSelector(selector, extension), eventHandle);
            let result = this._createDisposable(handle);
            if (eventHandle !== undefined) {
                const subscription = provider.onDidChangeInlineValues(_ => this._proxy.$emitInlineValuesEvent(eventHandle));
                result = extHostTypes_1.Disposable.from(result, subscription);
            }
            return result;
        }
        $provideInlineValues(handle, resource, range, context, token) {
            return this._withAdapter(handle, InlineValuesAdapter, adapter => adapter.provideInlineValues(uri_1.URI.revive(resource), range, context, token), undefined, token);
        }
        // --- occurrences
        registerDocumentHighlightProvider(extension, selector, provider) {
            const handle = this._addNewAdapter(new DocumentHighlightAdapter(this._documents, provider), extension);
            this._proxy.$registerDocumentHighlightProvider(handle, this._transformDocumentSelector(selector, extension));
            return this._createDisposable(handle);
        }
        $provideDocumentHighlights(handle, resource, position, token) {
            return this._withAdapter(handle, DocumentHighlightAdapter, adapter => adapter.provideDocumentHighlights(uri_1.URI.revive(resource), position, token), undefined, token);
        }
        // --- linked editing
        registerLinkedEditingRangeProvider(extension, selector, provider) {
            const handle = this._addNewAdapter(new LinkedEditingRangeAdapter(this._documents, provider), extension);
            this._proxy.$registerLinkedEditingRangeProvider(handle, this._transformDocumentSelector(selector, extension));
            return this._createDisposable(handle);
        }
        $provideLinkedEditingRanges(handle, resource, position, token) {
            return this._withAdapter(handle, LinkedEditingRangeAdapter, async (adapter) => {
                const res = await adapter.provideLinkedEditingRanges(uri_1.URI.revive(resource), position, token);
                if (res) {
                    return {
                        ranges: res.ranges,
                        wordPattern: res.wordPattern ? ExtHostLanguageFeatures._serializeRegExp(res.wordPattern) : undefined
                    };
                }
                return undefined;
            }, undefined, token);
        }
        // --- references
        registerReferenceProvider(extension, selector, provider) {
            const handle = this._addNewAdapter(new ReferenceAdapter(this._documents, provider), extension);
            this._proxy.$registerReferenceSupport(handle, this._transformDocumentSelector(selector, extension));
            return this._createDisposable(handle);
        }
        $provideReferences(handle, resource, position, context, token) {
            return this._withAdapter(handle, ReferenceAdapter, adapter => adapter.provideReferences(uri_1.URI.revive(resource), position, context, token), undefined, token);
        }
        // --- quick fix
        registerCodeActionProvider(extension, selector, provider, metadata) {
            const store = new lifecycle_1.DisposableStore();
            const handle = this._addNewAdapter(new CodeActionAdapter(this._documents, this._commands.converter, this._diagnostics, provider, this._logService, extension, this._apiDeprecation), extension);
            this._proxy.$registerQuickFixSupport(handle, this._transformDocumentSelector(selector, extension), {
                providedKinds: metadata?.providedCodeActionKinds?.map(kind => kind.value),
                documentation: metadata?.documentation?.map(x => ({
                    kind: x.kind.value,
                    command: this._commands.converter.toInternal(x.command, store),
                }))
            }, ExtHostLanguageFeatures._extLabel(extension), Boolean(provider.resolveCodeAction));
            store.add(this._createDisposable(handle));
            return store;
        }
        $provideCodeActions(handle, resource, rangeOrSelection, context, token) {
            return this._withAdapter(handle, CodeActionAdapter, adapter => adapter.provideCodeActions(uri_1.URI.revive(resource), rangeOrSelection, context, token), undefined, token);
        }
        $resolveCodeAction(handle, id, token) {
            return this._withAdapter(handle, CodeActionAdapter, adapter => adapter.resolveCodeAction(id, token), {}, undefined);
        }
        $releaseCodeActions(handle, cacheId) {
            this._withAdapter(handle, CodeActionAdapter, adapter => Promise.resolve(adapter.releaseCodeActions(cacheId)), undefined, undefined);
        }
        // --- formatting
        registerDocumentFormattingEditProvider(extension, selector, provider) {
            const handle = this._addNewAdapter(new DocumentFormattingAdapter(this._documents, provider), extension);
            this._proxy.$registerDocumentFormattingSupport(handle, this._transformDocumentSelector(selector, extension), extension.identifier, extension.displayName || extension.name);
            return this._createDisposable(handle);
        }
        $provideDocumentFormattingEdits(handle, resource, options, token) {
            return this._withAdapter(handle, DocumentFormattingAdapter, adapter => adapter.provideDocumentFormattingEdits(uri_1.URI.revive(resource), options, token), undefined, token);
        }
        registerDocumentRangeFormattingEditProvider(extension, selector, provider) {
            const canFormatMultipleRanges = typeof provider.provideDocumentRangesFormattingEdits === 'function';
            const handle = this._addNewAdapter(new RangeFormattingAdapter(this._documents, provider), extension);
            this._proxy.$registerRangeFormattingSupport(handle, this._transformDocumentSelector(selector, extension), extension.identifier, extension.displayName || extension.name, canFormatMultipleRanges);
            return this._createDisposable(handle);
        }
        $provideDocumentRangeFormattingEdits(handle, resource, range, options, token) {
            return this._withAdapter(handle, RangeFormattingAdapter, adapter => adapter.provideDocumentRangeFormattingEdits(uri_1.URI.revive(resource), range, options, token), undefined, token);
        }
        $provideDocumentRangesFormattingEdits(handle, resource, ranges, options, token) {
            return this._withAdapter(handle, RangeFormattingAdapter, adapter => adapter.provideDocumentRangesFormattingEdits(uri_1.URI.revive(resource), ranges, options, token), undefined, token);
        }
        registerOnTypeFormattingEditProvider(extension, selector, provider, triggerCharacters) {
            const handle = this._addNewAdapter(new OnTypeFormattingAdapter(this._documents, provider), extension);
            this._proxy.$registerOnTypeFormattingSupport(handle, this._transformDocumentSelector(selector, extension), triggerCharacters, extension.identifier);
            return this._createDisposable(handle);
        }
        $provideOnTypeFormattingEdits(handle, resource, position, ch, options, token) {
            return this._withAdapter(handle, OnTypeFormattingAdapter, adapter => adapter.provideOnTypeFormattingEdits(uri_1.URI.revive(resource), position, ch, options, token), undefined, token);
        }
        // --- navigate types
        registerWorkspaceSymbolProvider(extension, provider) {
            const handle = this._addNewAdapter(new NavigateTypeAdapter(provider, this._logService), extension);
            this._proxy.$registerNavigateTypeSupport(handle, typeof provider.resolveWorkspaceSymbol === 'function');
            return this._createDisposable(handle);
        }
        $provideWorkspaceSymbols(handle, search, token) {
            return this._withAdapter(handle, NavigateTypeAdapter, adapter => adapter.provideWorkspaceSymbols(search, token), { symbols: [] }, token);
        }
        $resolveWorkspaceSymbol(handle, symbol, token) {
            return this._withAdapter(handle, NavigateTypeAdapter, adapter => adapter.resolveWorkspaceSymbol(symbol, token), undefined, undefined);
        }
        $releaseWorkspaceSymbols(handle, id) {
            this._withAdapter(handle, NavigateTypeAdapter, adapter => adapter.releaseWorkspaceSymbols(id), undefined, undefined);
        }
        // --- rename
        registerRenameProvider(extension, selector, provider) {
            const handle = this._addNewAdapter(new RenameAdapter(this._documents, provider, this._logService), extension);
            this._proxy.$registerRenameSupport(handle, this._transformDocumentSelector(selector, extension), RenameAdapter.supportsResolving(provider));
            return this._createDisposable(handle);
        }
        $provideRenameEdits(handle, resource, position, newName, token) {
            return this._withAdapter(handle, RenameAdapter, adapter => adapter.provideRenameEdits(uri_1.URI.revive(resource), position, newName, token), undefined, token);
        }
        $resolveRenameLocation(handle, resource, position, token) {
            return this._withAdapter(handle, RenameAdapter, adapter => adapter.resolveRenameLocation(uri_1.URI.revive(resource), position, token), undefined, token);
        }
        //#region semantic coloring
        registerDocumentSemanticTokensProvider(extension, selector, provider, legend) {
            const handle = this._addNewAdapter(new DocumentSemanticTokensAdapter(this._documents, provider), extension);
            const eventHandle = (typeof provider.onDidChangeSemanticTokens === 'function' ? this._nextHandle() : undefined);
            this._proxy.$registerDocumentSemanticTokensProvider(handle, this._transformDocumentSelector(selector, extension), legend, eventHandle);
            let result = this._createDisposable(handle);
            if (eventHandle) {
                const subscription = provider.onDidChangeSemanticTokens(_ => this._proxy.$emitDocumentSemanticTokensEvent(eventHandle));
                result = extHostTypes_1.Disposable.from(result, subscription);
            }
            return result;
        }
        $provideDocumentSemanticTokens(handle, resource, previousResultId, token) {
            return this._withAdapter(handle, DocumentSemanticTokensAdapter, adapter => adapter.provideDocumentSemanticTokens(uri_1.URI.revive(resource), previousResultId, token), null, token);
        }
        $releaseDocumentSemanticTokens(handle, semanticColoringResultId) {
            this._withAdapter(handle, DocumentSemanticTokensAdapter, adapter => adapter.releaseDocumentSemanticColoring(semanticColoringResultId), undefined, undefined);
        }
        registerDocumentRangeSemanticTokensProvider(extension, selector, provider, legend) {
            const handle = this._addNewAdapter(new DocumentRangeSemanticTokensAdapter(this._documents, provider), extension);
            this._proxy.$registerDocumentRangeSemanticTokensProvider(handle, this._transformDocumentSelector(selector, extension), legend);
            return this._createDisposable(handle);
        }
        $provideDocumentRangeSemanticTokens(handle, resource, range, token) {
            return this._withAdapter(handle, DocumentRangeSemanticTokensAdapter, adapter => adapter.provideDocumentRangeSemanticTokens(uri_1.URI.revive(resource), range, token), null, token);
        }
        //#endregion
        // --- suggestion
        registerCompletionItemProvider(extension, selector, provider, triggerCharacters) {
            const handle = this._addNewAdapter(new CompletionsAdapter(this._documents, this._commands.converter, provider, this._apiDeprecation, extension), extension);
            this._proxy.$registerCompletionsProvider(handle, this._transformDocumentSelector(selector, extension), triggerCharacters, CompletionsAdapter.supportsResolving(provider), extension.identifier);
            return this._createDisposable(handle);
        }
        $provideCompletionItems(handle, resource, position, context, token) {
            return this._withAdapter(handle, CompletionsAdapter, adapter => adapter.provideCompletionItems(uri_1.URI.revive(resource), position, context, token), undefined, token);
        }
        $resolveCompletionItem(handle, id, token) {
            return this._withAdapter(handle, CompletionsAdapter, adapter => adapter.resolveCompletionItem(id, token), undefined, token);
        }
        $releaseCompletionItems(handle, id) {
            this._withAdapter(handle, CompletionsAdapter, adapter => adapter.releaseCompletionItems(id), undefined, undefined);
        }
        // --- ghost test
        registerInlineCompletionsProvider(extension, selector, provider, metadata) {
            const adapter = new InlineCompletionAdapter(extension, this._documents, provider, this._commands.converter);
            const handle = this._addNewAdapter(adapter, extension);
            this._proxy.$registerInlineCompletionsSupport(handle, this._transformDocumentSelector(selector, extension), adapter.supportsHandleEvents, extensions_1.ExtensionIdentifier.toKey(extension.identifier.value), metadata?.yieldTo?.map(extId => extensions_1.ExtensionIdentifier.toKey(extId)) || []);
            return this._createDisposable(handle);
        }
        $provideInlineCompletions(handle, resource, position, context, token) {
            return this._withAdapter(handle, InlineCompletionAdapterBase, adapter => adapter.provideInlineCompletions(uri_1.URI.revive(resource), position, context, token), undefined, token);
        }
        $handleInlineCompletionDidShow(handle, pid, idx, updatedInsertText) {
            this._withAdapter(handle, InlineCompletionAdapterBase, async (adapter) => {
                adapter.handleDidShowCompletionItem(pid, idx, updatedInsertText);
            }, undefined, undefined);
        }
        $handleInlineCompletionPartialAccept(handle, pid, idx, acceptedCharacters) {
            this._withAdapter(handle, InlineCompletionAdapterBase, async (adapter) => {
                adapter.handlePartialAccept(pid, idx, acceptedCharacters);
            }, undefined, undefined);
        }
        $freeInlineCompletionsList(handle, pid) {
            this._withAdapter(handle, InlineCompletionAdapterBase, async (adapter) => { adapter.disposeCompletions(pid); }, undefined, undefined);
        }
        // --- parameter hints
        registerSignatureHelpProvider(extension, selector, provider, metadataOrTriggerChars) {
            const metadata = Array.isArray(metadataOrTriggerChars)
                ? { triggerCharacters: metadataOrTriggerChars, retriggerCharacters: [] }
                : metadataOrTriggerChars;
            const handle = this._addNewAdapter(new SignatureHelpAdapter(this._documents, provider), extension);
            this._proxy.$registerSignatureHelpProvider(handle, this._transformDocumentSelector(selector, extension), metadata);
            return this._createDisposable(handle);
        }
        $provideSignatureHelp(handle, resource, position, context, token) {
            return this._withAdapter(handle, SignatureHelpAdapter, adapter => adapter.provideSignatureHelp(uri_1.URI.revive(resource), position, context, token), undefined, token);
        }
        $releaseSignatureHelp(handle, id) {
            this._withAdapter(handle, SignatureHelpAdapter, adapter => adapter.releaseSignatureHelp(id), undefined, undefined);
        }
        // --- inline hints
        registerInlayHintsProvider(extension, selector, provider) {
            const eventHandle = typeof provider.onDidChangeInlayHints === 'function' ? this._nextHandle() : undefined;
            const handle = this._addNewAdapter(new InlayHintsAdapter(this._documents, this._commands.converter, provider, this._logService, extension), extension);
            this._proxy.$registerInlayHintsProvider(handle, this._transformDocumentSelector(selector, extension), typeof provider.resolveInlayHint === 'function', eventHandle, ExtHostLanguageFeatures._extLabel(extension));
            let result = this._createDisposable(handle);
            if (eventHandle !== undefined) {
                const subscription = provider.onDidChangeInlayHints(uri => this._proxy.$emitInlayHintsEvent(eventHandle));
                result = extHostTypes_1.Disposable.from(result, subscription);
            }
            return result;
        }
        $provideInlayHints(handle, resource, range, token) {
            return this._withAdapter(handle, InlayHintsAdapter, adapter => adapter.provideInlayHints(uri_1.URI.revive(resource), range, token), undefined, token);
        }
        $resolveInlayHint(handle, id, token) {
            return this._withAdapter(handle, InlayHintsAdapter, adapter => adapter.resolveInlayHint(id, token), undefined, token);
        }
        $releaseInlayHints(handle, id) {
            this._withAdapter(handle, InlayHintsAdapter, adapter => adapter.releaseHints(id), undefined, undefined);
        }
        // --- links
        registerDocumentLinkProvider(extension, selector, provider) {
            const handle = this._addNewAdapter(new LinkProviderAdapter(this._documents, provider), extension);
            this._proxy.$registerDocumentLinkProvider(handle, this._transformDocumentSelector(selector, extension), typeof provider.resolveDocumentLink === 'function');
            return this._createDisposable(handle);
        }
        $provideDocumentLinks(handle, resource, token) {
            return this._withAdapter(handle, LinkProviderAdapter, adapter => adapter.provideLinks(uri_1.URI.revive(resource), token), undefined, token, resource.scheme === 'output');
        }
        $resolveDocumentLink(handle, id, token) {
            return this._withAdapter(handle, LinkProviderAdapter, adapter => adapter.resolveLink(id, token), undefined, undefined, true);
        }
        $releaseDocumentLinks(handle, id) {
            this._withAdapter(handle, LinkProviderAdapter, adapter => adapter.releaseLinks(id), undefined, undefined, true);
        }
        registerColorProvider(extension, selector, provider) {
            const handle = this._addNewAdapter(new ColorProviderAdapter(this._documents, provider), extension);
            this._proxy.$registerDocumentColorProvider(handle, this._transformDocumentSelector(selector, extension));
            return this._createDisposable(handle);
        }
        $provideDocumentColors(handle, resource, token) {
            return this._withAdapter(handle, ColorProviderAdapter, adapter => adapter.provideColors(uri_1.URI.revive(resource), token), [], token);
        }
        $provideColorPresentations(handle, resource, colorInfo, token) {
            return this._withAdapter(handle, ColorProviderAdapter, adapter => adapter.provideColorPresentations(uri_1.URI.revive(resource), colorInfo, token), undefined, token);
        }
        registerFoldingRangeProvider(extension, selector, provider) {
            const handle = this._nextHandle();
            const eventHandle = typeof provider.onDidChangeFoldingRanges === 'function' ? this._nextHandle() : undefined;
            this._adapter.set(handle, new AdapterData(new FoldingProviderAdapter(this._documents, provider), extension));
            this._proxy.$registerFoldingRangeProvider(handle, this._transformDocumentSelector(selector, extension), extension.identifier, eventHandle);
            let result = this._createDisposable(handle);
            if (eventHandle !== undefined) {
                const subscription = provider.onDidChangeFoldingRanges(() => this._proxy.$emitFoldingRangeEvent(eventHandle));
                result = extHostTypes_1.Disposable.from(result, subscription);
            }
            return result;
        }
        $provideFoldingRanges(handle, resource, context, token) {
            return this._withAdapter(handle, FoldingProviderAdapter, (adapter) => adapter.provideFoldingRanges(uri_1.URI.revive(resource), context, token), undefined, token);
        }
        // --- smart select
        registerSelectionRangeProvider(extension, selector, provider) {
            const handle = this._addNewAdapter(new SelectionRangeAdapter(this._documents, provider, this._logService), extension);
            this._proxy.$registerSelectionRangeProvider(handle, this._transformDocumentSelector(selector, extension));
            return this._createDisposable(handle);
        }
        $provideSelectionRanges(handle, resource, positions, token) {
            return this._withAdapter(handle, SelectionRangeAdapter, adapter => adapter.provideSelectionRanges(uri_1.URI.revive(resource), positions, token), [], token);
        }
        // --- call hierarchy
        registerCallHierarchyProvider(extension, selector, provider) {
            const handle = this._addNewAdapter(new CallHierarchyAdapter(this._documents, provider), extension);
            this._proxy.$registerCallHierarchyProvider(handle, this._transformDocumentSelector(selector, extension));
            return this._createDisposable(handle);
        }
        $prepareCallHierarchy(handle, resource, position, token) {
            return this._withAdapter(handle, CallHierarchyAdapter, adapter => Promise.resolve(adapter.prepareSession(uri_1.URI.revive(resource), position, token)), undefined, token);
        }
        $provideCallHierarchyIncomingCalls(handle, sessionId, itemId, token) {
            return this._withAdapter(handle, CallHierarchyAdapter, adapter => adapter.provideCallsTo(sessionId, itemId, token), undefined, token);
        }
        $provideCallHierarchyOutgoingCalls(handle, sessionId, itemId, token) {
            return this._withAdapter(handle, CallHierarchyAdapter, adapter => adapter.provideCallsFrom(sessionId, itemId, token), undefined, token);
        }
        $releaseCallHierarchy(handle, sessionId) {
            this._withAdapter(handle, CallHierarchyAdapter, adapter => Promise.resolve(adapter.releaseSession(sessionId)), undefined, undefined);
        }
        // --- type hierarchy
        registerTypeHierarchyProvider(extension, selector, provider) {
            const handle = this._addNewAdapter(new TypeHierarchyAdapter(this._documents, provider), extension);
            this._proxy.$registerTypeHierarchyProvider(handle, this._transformDocumentSelector(selector, extension));
            return this._createDisposable(handle);
        }
        $prepareTypeHierarchy(handle, resource, position, token) {
            return this._withAdapter(handle, TypeHierarchyAdapter, adapter => Promise.resolve(adapter.prepareSession(uri_1.URI.revive(resource), position, token)), undefined, token);
        }
        $provideTypeHierarchySupertypes(handle, sessionId, itemId, token) {
            return this._withAdapter(handle, TypeHierarchyAdapter, adapter => adapter.provideSupertypes(sessionId, itemId, token), undefined, token);
        }
        $provideTypeHierarchySubtypes(handle, sessionId, itemId, token) {
            return this._withAdapter(handle, TypeHierarchyAdapter, adapter => adapter.provideSubtypes(sessionId, itemId, token), undefined, token);
        }
        $releaseTypeHierarchy(handle, sessionId) {
            this._withAdapter(handle, TypeHierarchyAdapter, adapter => Promise.resolve(adapter.releaseSession(sessionId)), undefined, undefined);
        }
        // --- Document on drop
        registerDocumentOnDropEditProvider(extension, selector, provider, metadata) {
            const handle = this._nextHandle();
            this._adapter.set(handle, new AdapterData(new DocumentOnDropEditAdapter(this._proxy, this._documents, provider, handle, extension), extension));
            const id = (0, extensions_2.isProposedApiEnabled)(extension, 'dropMetadata') && metadata ? DocumentOnDropEditAdapter.toInternalProviderId(extension.identifier.value, metadata.id) : undefined;
            this._proxy.$registerDocumentOnDropEditProvider(handle, this._transformDocumentSelector(selector, extension), id, (0, extensions_2.isProposedApiEnabled)(extension, 'dropMetadata') ? metadata : undefined);
            return this._createDisposable(handle);
        }
        $provideDocumentOnDropEdits(handle, requestId, resource, position, dataTransferDto, token) {
            return this._withAdapter(handle, DocumentOnDropEditAdapter, adapter => Promise.resolve(adapter.provideDocumentOnDropEdits(requestId, uri_1.URI.revive(resource), position, dataTransferDto, token)), undefined, undefined);
        }
        // --- mapped edits
        registerMappedEditsProvider(extension, selector, provider) {
            const handle = this._addNewAdapter(new MappedEditsAdapter(this._documents, provider), extension);
            this._proxy.$registerMappedEditsProvider(handle, this._transformDocumentSelector(selector, extension));
            return this._createDisposable(handle);
        }
        $provideMappedEdits(handle, document, codeBlocks, context, token) {
            return this._withAdapter(handle, MappedEditsAdapter, adapter => Promise.resolve(adapter.provideMappedEdits(document, codeBlocks, context, token)), null, token);
        }
        // --- copy/paste actions
        registerDocumentPasteEditProvider(extension, selector, provider, metadata) {
            const handle = this._nextHandle();
            this._adapter.set(handle, new AdapterData(new DocumentPasteEditProvider(this._proxy, this._documents, provider, handle, extension), extension));
            const internalId = DocumentPasteEditProvider.toInternalProviderId(extension.identifier.value, metadata.id);
            this._proxy.$registerPasteEditProvider(handle, this._transformDocumentSelector(selector, extension), internalId, {
                supportsCopy: !!provider.prepareDocumentPaste,
                supportsPaste: !!provider.provideDocumentPasteEdits,
                copyMimeTypes: metadata.copyMimeTypes,
                pasteMimeTypes: metadata.pasteMimeTypes,
            });
            return this._createDisposable(handle);
        }
        $prepareDocumentPaste(handle, resource, ranges, dataTransfer, token) {
            return this._withAdapter(handle, DocumentPasteEditProvider, adapter => adapter.prepareDocumentPaste(uri_1.URI.revive(resource), ranges, dataTransfer, token), undefined, token);
        }
        $providePasteEdits(handle, requestId, resource, ranges, dataTransferDto, token) {
            return this._withAdapter(handle, DocumentPasteEditProvider, adapter => adapter.providePasteEdits(requestId, uri_1.URI.revive(resource), ranges, dataTransferDto, token), undefined, token);
        }
        // --- configuration
        static _serializeRegExp(regExp) {
            return {
                pattern: regExp.source,
                flags: regExp.flags,
            };
        }
        static _serializeIndentationRule(indentationRule) {
            return {
                decreaseIndentPattern: ExtHostLanguageFeatures._serializeRegExp(indentationRule.decreaseIndentPattern),
                increaseIndentPattern: ExtHostLanguageFeatures._serializeRegExp(indentationRule.increaseIndentPattern),
                indentNextLinePattern: indentationRule.indentNextLinePattern ? ExtHostLanguageFeatures._serializeRegExp(indentationRule.indentNextLinePattern) : undefined,
                unIndentedLinePattern: indentationRule.unIndentedLinePattern ? ExtHostLanguageFeatures._serializeRegExp(indentationRule.unIndentedLinePattern) : undefined,
            };
        }
        static _serializeOnEnterRule(onEnterRule) {
            return {
                beforeText: ExtHostLanguageFeatures._serializeRegExp(onEnterRule.beforeText),
                afterText: onEnterRule.afterText ? ExtHostLanguageFeatures._serializeRegExp(onEnterRule.afterText) : undefined,
                previousLineText: onEnterRule.previousLineText ? ExtHostLanguageFeatures._serializeRegExp(onEnterRule.previousLineText) : undefined,
                action: onEnterRule.action
            };
        }
        static _serializeOnEnterRules(onEnterRules) {
            return onEnterRules.map(ExtHostLanguageFeatures._serializeOnEnterRule);
        }
        static _serializeAutoClosingPair(autoClosingPair) {
            return {
                open: autoClosingPair.open,
                close: autoClosingPair.close,
                notIn: autoClosingPair.notIn ? autoClosingPair.notIn.map(v => extHostTypes_1.SyntaxTokenType.toString(v)) : undefined,
            };
        }
        static _serializeAutoClosingPairs(autoClosingPairs) {
            return autoClosingPairs.map(ExtHostLanguageFeatures._serializeAutoClosingPair);
        }
        setLanguageConfiguration(extension, languageId, configuration) {
            const { wordPattern } = configuration;
            // check for a valid word pattern
            if (wordPattern && (0, strings_1.regExpLeadsToEndlessLoop)(wordPattern)) {
                throw new Error(`Invalid language configuration: wordPattern '${wordPattern}' is not allowed to match the empty string.`);
            }
            // word definition
            if (wordPattern) {
                this._documents.setWordDefinitionFor(languageId, wordPattern);
            }
            else {
                this._documents.setWordDefinitionFor(languageId, undefined);
            }
            if (configuration.__electricCharacterSupport) {
                this._apiDeprecation.report('LanguageConfiguration.__electricCharacterSupport', extension, `Do not use.`);
            }
            if (configuration.__characterPairSupport) {
                this._apiDeprecation.report('LanguageConfiguration.__characterPairSupport', extension, `Do not use.`);
            }
            const handle = this._nextHandle();
            const serializedConfiguration = {
                comments: configuration.comments,
                brackets: configuration.brackets,
                wordPattern: configuration.wordPattern ? ExtHostLanguageFeatures._serializeRegExp(configuration.wordPattern) : undefined,
                indentationRules: configuration.indentationRules ? ExtHostLanguageFeatures._serializeIndentationRule(configuration.indentationRules) : undefined,
                onEnterRules: configuration.onEnterRules ? ExtHostLanguageFeatures._serializeOnEnterRules(configuration.onEnterRules) : undefined,
                __electricCharacterSupport: configuration.__electricCharacterSupport,
                __characterPairSupport: configuration.__characterPairSupport,
                autoClosingPairs: configuration.autoClosingPairs ? ExtHostLanguageFeatures._serializeAutoClosingPairs(configuration.autoClosingPairs) : undefined,
            };
            this._proxy.$setLanguageConfiguration(handle, languageId, serializedConfiguration);
            return this._createDisposable(handle);
        }
        $setWordDefinitions(wordDefinitions) {
            for (const wordDefinition of wordDefinitions) {
                this._documents.setWordDefinitionFor(wordDefinition.languageId, new RegExp(wordDefinition.regexSource, wordDefinition.regexFlags));
            }
        }
    }
    exports.ExtHostLanguageFeatures = ExtHostLanguageFeatures;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdExhbmd1YWdlRmVhdHVyZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2NvbW1vbi9leHRIb3N0TGFuZ3VhZ2VGZWF0dXJlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFxQ2hHLGNBQWM7SUFFZCxNQUFNLHFCQUFxQjtRQUUxQixZQUNrQixVQUE0QixFQUM1QixTQUF3QztZQUR4QyxlQUFVLEdBQVYsVUFBVSxDQUFrQjtZQUM1QixjQUFTLEdBQVQsU0FBUyxDQUErQjtRQUN0RCxDQUFDO1FBRUwsS0FBSyxDQUFDLHNCQUFzQixDQUFDLFFBQWEsRUFBRSxLQUF3QjtZQUNuRSxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNsRCxNQUFNLEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsc0JBQXNCLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3RFLElBQUksSUFBQSx1QkFBYyxFQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUMxQixPQUFPLFNBQVMsQ0FBQzthQUNqQjtpQkFBTSxJQUFJLEtBQU0sQ0FBQyxDQUFDLENBQUMsWUFBWSw2QkFBYyxFQUFFO2dCQUMvQyxPQUEwQixLQUFNLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDdEU7aUJBQU07Z0JBQ04sT0FBTyxxQkFBcUIsQ0FBQyxxQkFBcUIsQ0FBc0IsS0FBSyxDQUFDLENBQUM7YUFDL0U7UUFDRixDQUFDO1FBRU8sTUFBTSxDQUFDLHFCQUFxQixDQUFDLEtBQTBCO1lBQzlELGdFQUFnRTtZQUNoRSx5Q0FBeUM7WUFDekMsS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFD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