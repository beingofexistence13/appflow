/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/base/common/objects", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes", "vs/editor/common/languages", "./extHost.protocol", "vs/base/common/strings", "vs/editor/common/core/range", "vs/base/common/arrays", "vs/base/common/types", "vs/editor/common/core/selection", "vs/base/common/cancellation", "vs/platform/extensions/common/extensions", "vs/base/common/lifecycle", "vs/editor/common/services/semanticTokensDto", "vs/base/common/idGenerator", "./cache", "vs/base/common/stopwatch", "vs/base/common/errors", "vs/base/common/async", "vs/workbench/services/extensions/common/extensions", "vs/nls!vs/workbench/api/common/extHostLanguageFeatures"], function (require, exports, uri_1, objects_1, typeConvert, extHostTypes_1, languages, extHostProtocol, strings_1, range_1, arrays_1, types_1, selection_1, cancellation_1, extensions_1, lifecycle_1, semanticTokensDto_1, idGenerator_1, cache_1, stopwatch_1, errors_1, async_1, extensions_2, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$cbc = void 0;
    // --- adapter
    class DocumentSymbolAdapter {
        constructor(d, e) {
            this.d = d;
            this.e = e;
        }
        async provideDocumentSymbols(resource, token) {
            const doc = this.d.getDocument(resource);
            const value = await this.e.provideDocumentSymbols(doc, token);
            if ((0, arrays_1.$Ib)(value)) {
                return undefined;
            }
            else if (value[0] instanceof extHostTypes_1.$iK) {
                return value.map(typeConvert.DocumentSymbol.from);
            }
            else {
                return DocumentSymbolAdapter.f(value);
            }
        }
        static f(infos) {
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
                    if (range_1.$ks.containsRange(parent.range, element.range) && !range_1.$ks.equalsRange(parent.range, element.range)) {
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
        static { this.d = { command: 'missing', title: '!!MISSING: command!!' }; }
        constructor(g, h, j) {
            this.g = g;
            this.h = h;
            this.j = j;
            this.e = new cache_1.$6ac('CodeLens');
            this.f = new Map();
        }
        async provideCodeLenses(resource, token) {
            const doc = this.g.getDocument(resource);
            const lenses = await this.j.provideCodeLenses(doc, token);
            if (!lenses || token.isCancellationRequested) {
                return undefined;
            }
            const cacheId = this.e.add(lenses);
            const disposables = new lifecycle_1.$jc();
            this.f.set(cacheId, disposables);
            const result = {
                cacheId,
                lenses: [],
            };
            for (let i = 0; i < lenses.length; i++) {
                result.lenses.push({
                    cacheId: [cacheId, i],
                    range: typeConvert.Range.from(lenses[i].range),
                    command: this.h.toInternal(lenses[i].command, disposables)
                });
            }
            return result;
        }
        async resolveCodeLens(symbol, token) {
            const lens = symbol.cacheId && this.e.get(...symbol.cacheId);
            if (!lens) {
                return undefined;
            }
            let resolvedLens;
            if (typeof this.j.resolveCodeLens !== 'function' || lens.isResolved) {
                resolvedLens = lens;
            }
            else {
                resolvedLens = await this.j.resolveCodeLens(lens, token);
            }
            if (!resolvedLens) {
                resolvedLens = lens;
            }
            if (token.isCancellationRequested) {
                return undefined;
            }
            const disposables = symbol.cacheId && this.f.get(symbol.cacheId[0]);
            if (!disposables) {
                // disposed in the meantime
                return undefined;
            }
            symbol.command = this.h.toInternal(resolvedLens.command ?? CodeLensAdapter.d, disposables);
            return symbol;
        }
        releaseCodeLenses(cachedId) {
            this.f.get(cachedId)?.dispose();
            this.f.delete(cachedId);
            this.e.delete(cachedId);
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
        constructor(d, e) {
            this.d = d;
            this.e = e;
        }
        async provideDefinition(resource, position, token) {
            const doc = this.d.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            const value = await this.e.provideDefinition(doc, pos, token);
            return convertToLocationLinks(value);
        }
    }
    class DeclarationAdapter {
        constructor(d, e) {
            this.d = d;
            this.e = e;
        }
        async provideDeclaration(resource, position, token) {
            const doc = this.d.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            const value = await this.e.provideDeclaration(doc, pos, token);
            return convertToLocationLinks(value);
        }
    }
    class ImplementationAdapter {
        constructor(d, e) {
            this.d = d;
            this.e = e;
        }
        async provideImplementation(resource, position, token) {
            const doc = this.d.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            const value = await this.e.provideImplementation(doc, pos, token);
            return convertToLocationLinks(value);
        }
    }
    class TypeDefinitionAdapter {
        constructor(d, e) {
            this.d = d;
            this.e = e;
        }
        async provideTypeDefinition(resource, position, token) {
            const doc = this.d.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            const value = await this.e.provideTypeDefinition(doc, pos, token);
            return convertToLocationLinks(value);
        }
    }
    class HoverAdapter {
        constructor(d, e) {
            this.d = d;
            this.e = e;
        }
        async provideHover(resource, position, token) {
            const doc = this.d.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            const value = await this.e.provideHover(doc, pos, token);
            if (!value || (0, arrays_1.$Ib)(value.contents)) {
                return undefined;
            }
            if (!value.range) {
                value.range = doc.getWordRangeAtPosition(pos);
            }
            if (!value.range) {
                value.range = new extHostTypes_1.$5J(pos, pos);
            }
            return typeConvert.Hover.from(value);
        }
    }
    class EvaluatableExpressionAdapter {
        constructor(d, e) {
            this.d = d;
            this.e = e;
        }
        async provideEvaluatableExpression(resource, position, token) {
            const doc = this.d.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            const value = await this.e.provideEvaluatableExpression(doc, pos, token);
            if (value) {
                return typeConvert.EvaluatableExpression.from(value);
            }
            return undefined;
        }
    }
    class InlineValuesAdapter {
        constructor(d, e) {
            this.d = d;
            this.e = e;
        }
        async provideInlineValues(resource, viewPort, context, token) {
            const doc = this.d.getDocument(resource);
            const value = await this.e.provideInlineValues(doc, typeConvert.Range.to(viewPort), typeConvert.InlineValueContext.to(context), token);
            if (Array.isArray(value)) {
                return value.map(iv => typeConvert.InlineValue.from(iv));
            }
            return undefined;
        }
    }
    class DocumentHighlightAdapter {
        constructor(d, e) {
            this.d = d;
            this.e = e;
        }
        async provideDocumentHighlights(resource, position, token) {
            const doc = this.d.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            const value = await this.e.provideDocumentHighlights(doc, pos, token);
            if (Array.isArray(value)) {
                return value.map(typeConvert.DocumentHighlight.from);
            }
            return undefined;
        }
    }
    class LinkedEditingRangeAdapter {
        constructor(d, e) {
            this.d = d;
            this.e = e;
        }
        async provideLinkedEditingRanges(resource, position, token) {
            const doc = this.d.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            const value = await this.e.provideLinkedEditingRanges(doc, pos, token);
            if (value && Array.isArray(value.ranges)) {
                return {
                    ranges: (0, arrays_1.$Fb)(value.ranges.map(typeConvert.Range.from)),
                    wordPattern: value.wordPattern
                };
            }
            return undefined;
        }
    }
    class ReferenceAdapter {
        constructor(d, e) {
            this.d = d;
            this.e = e;
        }
        async provideReferences(resource, position, context, token) {
            const doc = this.d.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            const value = await this.e.provideReferences(doc, pos, context, token);
            if (Array.isArray(value)) {
                return value.map(typeConvert.location.from);
            }
            return undefined;
        }
    }
    class CodeActionAdapter {
        static { this.d = 1000; }
        constructor(g, h, j, k, l, m, n) {
            this.g = g;
            this.h = h;
            this.j = j;
            this.k = k;
            this.l = l;
            this.m = m;
            this.n = n;
            this.e = new cache_1.$6ac('CodeAction');
            this.f = new Map();
        }
        async provideCodeActions(resource, rangeOrSelection, context, token) {
            const doc = this.g.getDocument(resource);
            const ran = selection_1.$ms.isISelection(rangeOrSelection)
                ? typeConvert.Selection.to(rangeOrSelection)
                : typeConvert.Range.to(rangeOrSelection);
            const allDiagnostics = [];
            for (const diagnostic of this.j.getDiagnostics(resource)) {
                if (ran.intersection(diagnostic.range)) {
                    const newLen = allDiagnostics.push(diagnostic);
                    if (newLen > CodeActionAdapter.d) {
                        break;
                    }
                }
            }
            const codeActionContext = {
                diagnostics: allDiagnostics,
                only: context.only ? new extHostTypes_1.$kK(context.only) : undefined,
                triggerKind: typeConvert.CodeActionTriggerKind.to(context.trigger),
            };
            const commandsOrActions = await this.k.provideCodeActions(doc, ran, codeActionContext, token);
            if (!(0, arrays_1.$Jb)(commandsOrActions) || token.isCancellationRequested) {
                return undefined;
            }
            const cacheId = this.e.add(commandsOrActions);
            const disposables = new lifecycle_1.$jc();
            this.f.set(cacheId, disposables);
            const actions = [];
            for (let i = 0; i < commandsOrActions.length; i++) {
                const candidate = commandsOrActions[i];
                if (!candidate) {
                    continue;
                }
                if (CodeActionAdapter.o(candidate)) {
                    // old school: synthetic code action
                    this.n.report('CodeActionProvider.provideCodeActions - return commands', this.m, `Return 'CodeAction' instances instead.`);
                    actions.push({
                        _isSynthetic: true,
                        title: candidate.title,
                        command: this.h.toInternal(candidate, disposables),
                    });
                }
                else {
                    if (codeActionContext.only) {
                        if (!candidate.kind) {
                            this.l.warn(`${this.m.identifier.value} - Code actions of kind '${codeActionContext.only.value} 'requested but returned code action does not have a 'kind'. Code action will be dropped. Please set 'CodeAction.kind'.`);
                        }
                        else if (!codeActionContext.only.contains(candidate.kind)) {
                            this.l.warn(`${this.m.identifier.value} - Code actions of kind '${codeActionContext.only.value} 'requested but returned code action is of kind '${candidate.kind.value}'. Code action will be dropped. Please check 'CodeActionContext.only' to only return requested code actions.`);
                        }
                    }
                    // new school: convert code action
                    actions.push({
                        cacheId: [cacheId, i],
                        title: candidate.title,
                        command: candidate.command && this.h.toInternal(candidate.command, disposables),
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
            const item = this.e.get(sessionId, itemId);
            if (!item || CodeActionAdapter.o(item)) {
                return {}; // code actions only!
            }
            if (!this.k.resolveCodeAction) {
                return {}; // this should not happen...
            }
            const resolvedItem = (await this.k.resolveCodeAction(item, token)) ?? item;
            let resolvedEdit;
            if (resolvedItem.edit) {
                resolvedEdit = typeConvert.WorkspaceEdit.from(resolvedItem.edit, undefined);
            }
            let resolvedCommand;
            if (resolvedItem.command) {
                const disposables = this.f.get(sessionId);
                if (disposables) {
                    resolvedCommand = this.h.toInternal(resolvedItem.command, disposables);
                }
            }
            return { edit: resolvedEdit, command: resolvedCommand };
        }
        releaseCodeActions(cachedId) {
            this.f.get(cachedId)?.dispose();
            this.f.delete(cachedId);
            this.e.delete(cachedId);
        }
        static o(thing) {
            return typeof thing.command === 'string' && typeof thing.title === 'string';
        }
    }
    class DocumentPasteEditProvider {
        static toInternalProviderId(extId, editId) {
            return extId + '.' + editId;
        }
        constructor(d, e, f, g, h) {
            this.d = d;
            this.e = e;
            this.f = f;
            this.g = g;
            this.h = h;
        }
        async prepareDocumentPaste(resource, ranges, dataTransferDto, token) {
            if (!this.f.prepareDocumentPaste) {
                return;
            }
            const doc = this.e.getDocument(resource);
            const vscodeRanges = ranges.map(range => typeConvert.Range.to(range));
            const dataTransfer = typeConvert.DataTransfer.toDataTransfer(dataTransferDto, () => {
                throw new errors_1.$9();
            });
            await this.f.prepareDocumentPaste(doc, vscodeRanges, dataTransfer, token);
            if (token.isCancellationRequested) {
                return;
            }
            // Only send back values that have been added to the data transfer
            const entries = Array.from(dataTransfer).filter(([, value]) => !(value instanceof extHostTypes_1.$QK));
            return typeConvert.DataTransfer.from(entries);
        }
        async providePasteEdits(requestId, resource, ranges, dataTransferDto, token) {
            if (!this.f.provideDocumentPasteEdits) {
                return;
            }
            const doc = this.e.getDocument(resource);
            const vscodeRanges = ranges.map(range => typeConvert.Range.to(range));
            const dataTransfer = typeConvert.DataTransfer.toDataTransfer(dataTransferDto, async (id) => {
                return (await this.d.$resolvePasteFileData(this.g, requestId, id)).buffer;
            });
            const edit = await this.f.provideDocumentPasteEdits(doc, vscodeRanges, dataTransfer, token);
            if (!edit) {
                return;
            }
            return {
                label: edit.label ?? (0, nls_1.localize)(0, null, this.h.displayName || this.h.name),
                detail: this.h.displayName || this.h.name,
                yieldTo: edit.yieldTo?.map(yTo => {
                    return 'mimeType' in yTo ? yTo : { providerId: DocumentPasteEditProvider.toInternalProviderId(yTo.extensionId, yTo.providerId) };
                }),
                insertText: typeof edit.insertText === 'string' ? edit.insertText : { snippet: edit.insertText.value },
                additionalEdit: edit.additionalEdit ? typeConvert.WorkspaceEdit.from(edit.additionalEdit, undefined) : undefined,
            };
        }
    }
    class DocumentFormattingAdapter {
        constructor(d, e) {
            this.d = d;
            this.e = e;
        }
        async provideDocumentFormattingEdits(resource, options, token) {
            const document = this.d.getDocument(resource);
            const value = await this.e.provideDocumentFormattingEdits(document, options, token);
            if (Array.isArray(value)) {
                return value.map(typeConvert.TextEdit.from);
            }
            return undefined;
        }
    }
    class RangeFormattingAdapter {
        constructor(d, e) {
            this.d = d;
            this.e = e;
        }
        async provideDocumentRangeFormattingEdits(resource, range, options, token) {
            const document = this.d.getDocument(resource);
            const ran = typeConvert.Range.to(range);
            const value = await this.e.provideDocumentRangeFormattingEdits(document, ran, options, token);
            if (Array.isArray(value)) {
                return value.map(typeConvert.TextEdit.from);
            }
            return undefined;
        }
        async provideDocumentRangesFormattingEdits(resource, ranges, options, token) {
            (0, types_1.$tf)(typeof this.e.provideDocumentRangesFormattingEdits === 'function', 'INVALID invocation of `provideDocumentRangesFormattingEdits`');
            const document = this.d.getDocument(resource);
            const _ranges = ranges.map(typeConvert.Range.to);
            const value = await this.e.provideDocumentRangesFormattingEdits(document, _ranges, options, token);
            if (Array.isArray(value)) {
                return value.map(typeConvert.TextEdit.from);
            }
            return undefined;
        }
    }
    class OnTypeFormattingAdapter {
        constructor(d, e) {
            this.d = d;
            this.e = e;
            this.autoFormatTriggerCharacters = []; // not here
        }
        async provideOnTypeFormattingEdits(resource, position, ch, options, token) {
            const document = this.d.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            const value = await this.e.provideOnTypeFormattingEdits(document, pos, ch, options, token);
            if (Array.isArray(value)) {
                return value.map(typeConvert.TextEdit.from);
            }
            return undefined;
        }
    }
    class NavigateTypeAdapter {
        constructor(e, f) {
            this.e = e;
            this.f = f;
            this.d = new cache_1.$6ac('WorkspaceSymbols');
        }
        async provideWorkspaceSymbols(search, token) {
            const value = await this.e.provideWorkspaceSymbols(search, token);
            if (!(0, arrays_1.$Jb)(value)) {
                return { symbols: [] };
            }
            const sid = this.d.add(value);
            const result = {
                cacheId: sid,
                symbols: []
            };
            for (let i = 0; i < value.length; i++) {
                const item = value[i];
                if (!item || !item.name) {
                    this.f.warn('INVALID SymbolInformation', item);
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
            if (typeof this.e.resolveWorkspaceSymbol !== 'function') {
                return symbol;
            }
            if (!symbol.cacheId) {
                return symbol;
            }
            const item = this.d.get(...symbol.cacheId);
            if (item) {
                const value = await this.e.resolveWorkspaceSymbol(item, token);
                return value && (0, objects_1.$Ym)(symbol, typeConvert.WorkspaceSymbol.from(value), true);
            }
            return undefined;
        }
        releaseWorkspaceSymbols(id) {
            this.d.delete(id);
        }
    }
    class RenameAdapter {
        static supportsResolving(provider) {
            return typeof provider.prepareRename === 'function';
        }
        constructor(d, e, f) {
            this.d = d;
            this.e = e;
            this.f = f;
        }
        async provideRenameEdits(resource, position, newName, token) {
            const doc = this.d.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            try {
                const value = await this.e.provideRenameEdits(doc, pos, newName, token);
                if (!value) {
                    return undefined;
                }
                return typeConvert.WorkspaceEdit.from(value);
            }
            catch (err) {
                const rejectReason = RenameAdapter.g(err);
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
            if (typeof this.e.prepareRename !== 'function') {
                return Promise.resolve(undefined);
            }
            const doc = this.d.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            try {
                const rangeOrLocation = await this.e.prepareRename(doc, pos, token);
                let range;
                let text;
                if (extHostTypes_1.$5J.isRange(rangeOrLocation)) {
                    range = rangeOrLocation;
                    text = doc.getText(rangeOrLocation);
                }
                else if ((0, types_1.$lf)(rangeOrLocation)) {
                    range = rangeOrLocation.range;
                    text = rangeOrLocation.placeholder;
                }
                if (!range || !text) {
                    return undefined;
                }
                if (range.start.line > pos.line || range.end.line < pos.line) {
                    this.f.warn('INVALID rename location: position line must be within range start/end lines');
                    return undefined;
                }
                return { range: typeConvert.Range.from(range), text };
            }
            catch (err) {
                const rejectReason = RenameAdapter.g(err);
                if (rejectReason) {
                    return { rejectReason, range: undefined, text: undefined };
                }
                else {
                    return Promise.reject(err);
                }
            }
        }
        static g(err) {
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
        constructor(f, g) {
            this.f = f;
            this.g = g;
            this.e = 1;
            this.d = new Map();
        }
        async provideDocumentSemanticTokens(resource, previousResultId, token) {
            const doc = this.f.getDocument(resource);
            const previousResult = (previousResultId !== 0 ? this.d.get(previousResultId) : null);
            let value = typeof previousResult?.resultId === 'string' && typeof this.g.provideDocumentSemanticTokensEdits === 'function'
                ? await this.g.provideDocumentSemanticTokensEdits(doc, previousResult.resultId, token)
                : await this.g.provideDocumentSemanticTokens(doc, token);
            if (previousResult) {
                this.d.delete(previousResultId);
            }
            if (!value) {
                return null;
            }
            value = DocumentSemanticTokensAdapter.h(value);
            return this.o(DocumentSemanticTokensAdapter.n(previousResult, value), value);
        }
        async releaseDocumentSemanticColoring(semanticColoringResultId) {
            this.d.delete(semanticColoringResultId);
        }
        static h(v) {
            if (DocumentSemanticTokensAdapter.j(v)) {
                if (DocumentSemanticTokensAdapter.k(v)) {
                    return v;
                }
                return new extHostTypes_1.$hL(new Uint32Array(v.data), v.resultId);
            }
            else if (DocumentSemanticTokensAdapter.l(v)) {
                if (DocumentSemanticTokensAdapter.m(v)) {
                    return v;
                }
                return new extHostTypes_1.$jL(v.edits.map(edit => new extHostTypes_1.$iL(edit.start, edit.deleteCount, edit.data ? new Uint32Array(edit.data) : edit.data)), v.resultId);
            }
            return v;
        }
        static j(v) {
            return v && !!(v.data);
        }
        static k(v) {
            return (v.data instanceof Uint32Array);
        }
        static l(v) {
            return v && Array.isArray(v.edits);
        }
        static m(v) {
            for (const edit of v.edits) {
                if (!(edit.data instanceof Uint32Array)) {
                    return false;
                }
            }
            return true;
        }
        static n(previousResult, newResult) {
            if (!DocumentSemanticTokensAdapter.j(newResult)) {
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
                return new extHostTypes_1.$jL([], newResult.resultId);
            }
            let commonSuffixLength = 0;
            const maxCommonSuffixLength = maxCommonPrefixLength - commonPrefixLength;
            while (commonSuffixLength < maxCommonSuffixLength && oldData[oldLength - commonSuffixLength - 1] === newData[newLength - commonSuffixLength - 1]) {
                commonSuffixLength++;
            }
            return new extHostTypes_1.$jL([{
                    start: commonPrefixLength,
                    deleteCount: (oldLength - commonPrefixLength - commonSuffixLength),
                    data: newData.subarray(commonPrefixLength, newLength - commonSuffixLength)
                }], newResult.resultId);
        }
        o(value, original) {
            if (DocumentSemanticTokensAdapter.j(value)) {
                const myId = this.e++;
                this.d.set(myId, new SemanticTokensPreviousResult(value.resultId, value.data));
                return (0, semanticTokensDto_1.$v0)({
                    id: myId,
                    type: 'full',
                    data: value.data
                });
            }
            if (DocumentSemanticTokensAdapter.l(value)) {
                const myId = this.e++;
                if (DocumentSemanticTokensAdapter.j(original)) {
                    // store the original
                    this.d.set(myId, new SemanticTokensPreviousResult(original.resultId, original.data));
                }
                else {
                    this.d.set(myId, new SemanticTokensPreviousResult(value.resultId));
                }
                return (0, semanticTokensDto_1.$v0)({
                    id: myId,
                    type: 'delta',
                    deltas: (value.edits || []).map(edit => ({ start: edit.start, deleteCount: edit.deleteCount, data: edit.data }))
                });
            }
            return null;
        }
    }
    class DocumentRangeSemanticTokensAdapter {
        constructor(d, e) {
            this.d = d;
            this.e = e;
        }
        async provideDocumentRangeSemanticTokens(resource, range, token) {
            const doc = this.d.getDocument(resource);
            const value = await this.e.provideDocumentRangeSemanticTokens(doc, typeConvert.Range.to(range), token);
            if (!value) {
                return null;
            }
            return this.f(value);
        }
        f(value) {
            return (0, semanticTokensDto_1.$v0)({
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
        constructor(f, g, h, j, k) {
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.k = k;
            this.d = new cache_1.$6ac('CompletionItem');
            this.e = new Map();
        }
        async provideCompletionItems(resource, position, context, token) {
            const doc = this.f.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            // The default insert/replace ranges. It's important to compute them
            // before asynchronously asking the provider for its results. See
            // https://github.com/microsoft/vscode/issues/83400#issuecomment-546851421
            const replaceRange = doc.getWordRangeAtPosition(pos) || new extHostTypes_1.$5J(pos, pos);
            const insertRange = replaceRange.with({ end: pos });
            const sw = new stopwatch_1.$bd();
            const itemsOrList = await this.h.provideCompletionItems(doc, pos, token, typeConvert.CompletionContext.to(context));
            if (!itemsOrList) {
                // undefined and null are valid results
                return undefined;
            }
            if (token.isCancellationRequested) {
                // cancelled -> return without further ado, esp no caching
                // of results as they will leak
                return undefined;
            }
            const list = Array.isArray(itemsOrList) ? new extHostTypes_1.$xK(itemsOrList) : itemsOrList;
            // keep result for providers that support resolving
            const pid = CompletionsAdapter.supportsResolving(this.h) ? this.d.add(list.items) : this.d.add([]);
            const disposables = new lifecycle_1.$jc();
            this.e.set(pid, disposables);
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
                const dto = this.l(item, [pid, i], insertRange, replaceRange);
                completions.push(dto);
            }
            return result;
        }
        async resolveCompletionItem(id, token) {
            if (typeof this.h.resolveCompletionItem !== 'function') {
                return undefined;
            }
            const item = this.d.get(...id);
            if (!item) {
                return undefined;
            }
            const dto1 = this.l(item, id);
            const resolvedItem = await this.h.resolveCompletionItem(item, token);
            if (!resolvedItem) {
                return undefined;
            }
            const dto2 = this.l(resolvedItem, id);
            if (dto1["h" /* extHostProtocol.ISuggestDataDtoField.insertText */] !== dto2["h" /* extHostProtocol.ISuggestDataDtoField.insertText */]
                || dto1["i" /* extHostProtocol.ISuggestDataDtoField.insertTextRules */] !== dto2["i" /* extHostProtocol.ISuggestDataDtoField.insertTextRules */]) {
                this.j.report('CompletionItem.insertText', this.k, 'extension MAY NOT change \'insertText\' of a CompletionItem during resolve');
            }
            if (dto1["n" /* extHostProtocol.ISuggestDataDtoField.commandIdent */] !== dto2["n" /* extHostProtocol.ISuggestDataDtoField.commandIdent */]
                || dto1["o" /* extHostProtocol.ISuggestDataDtoField.commandId */] !== dto2["o" /* extHostProtocol.ISuggestDataDtoField.commandId */]
                || !(0, objects_1.$Zm)(dto1["p" /* extHostProtocol.ISuggestDataDtoField.commandArguments */], dto2["p" /* extHostProtocol.ISuggestDataDtoField.commandArguments */])) {
                this.j.report('CompletionItem.command', this.k, 'extension MAY NOT change \'command\' of a CompletionItem during resolve');
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
            this.e.get(id)?.dispose();
            this.e.delete(id);
            this.d.delete(id);
        }
        l(item, id, defaultInsertRange, defaultReplaceRange) {
            const disposables = this.e.get(id[0]);
            if (!disposables) {
                throw Error('DisposableStore is missing...');
            }
            const command = this.g.toInternal(item.command, disposables);
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
                this.j.report('CompletionItem.textEdit', this.k, `Use 'CompletionItem.insertText' and 'CompletionItem.range' instead.`);
                result["h" /* extHostProtocol.ISuggestDataDtoField.insertText */] = item.textEdit.newText;
            }
            else if (typeof item.insertText === 'string') {
                result["h" /* extHostProtocol.ISuggestDataDtoField.insertText */] = item.insertText;
            }
            else if (item.insertText instanceof extHostTypes_1.$bK) {
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
            if (extHostTypes_1.$5J.isRange(range)) {
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
        constructor(f, g, h, j) {
            super();
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.d = new ReferenceMap();
            this.e = (0, extensions_2.$PF)(this.f, 'inlineCompletionsAdditions');
            this.k = {
                [languages.InlineCompletionTriggerKind.Automatic]: extHostTypes_1.InlineCompletionTriggerKind.Automatic,
                [languages.InlineCompletionTriggerKind.Explicit]: extHostTypes_1.InlineCompletionTriggerKind.Invoke,
            };
        }
        get supportsHandleEvents() {
            return (0, extensions_2.$PF)(this.f, 'inlineCompletionsAdditions')
                && (typeof this.h.handleDidShowCompletionItem === 'function'
                    || typeof this.h.handleDidPartiallyAcceptCompletionItem === 'function');
        }
        async provideInlineCompletions(resource, position, context, token) {
            const doc = this.g.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            const result = await this.h.provideInlineCompletionItems(doc, pos, {
                selectedCompletionInfo: context.selectedSuggestionInfo
                    ? {
                        range: typeConvert.Range.to(context.selectedSuggestionInfo.range),
                        text: context.selectedSuggestionInfo.text
                    }
                    : undefined,
                triggerKind: this.k[context.triggerKind]
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
            const commands = this.e ? Array.isArray(result) ? [] : result.commands || [] : [];
            const enableForwardStability = this.e && !Array.isArray(result) ? result.enableForwardStability : undefined;
            let disposableStore = undefined;
            const pid = this.d.createReferenceId({
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
                            disposableStore = new lifecycle_1.$jc();
                        }
                        command = this.j.toInternal(item.command, disposableStore);
                    }
                    const insertText = item.insertText;
                    return ({
                        insertText: typeof insertText === 'string' ? insertText : { snippet: insertText.value },
                        filterText: item.filterText,
                        range: item.range ? typeConvert.Range.from(item.range) : undefined,
                        command,
                        idx: idx,
                        completeBracketPairs: this.e ? item.completeBracketPairs : false,
                    });
                }),
                commands: commands.map(c => {
                    if (!disposableStore) {
                        disposableStore = new lifecycle_1.$jc();
                    }
                    return this.j.toInternal(c, disposableStore);
                }),
                suppressSuggestions: false,
                enableForwardStability,
            };
        }
        disposeCompletions(pid) {
            const data = this.d.disposeReferenceId(pid);
            data?.dispose();
        }
        handleDidShowCompletionItem(pid, idx, updatedInsertText) {
            const completionItem = this.d.get(pid)?.items[idx];
            if (completionItem) {
                if (this.h.handleDidShowCompletionItem && this.e) {
                    this.h.handleDidShowCompletionItem(completionItem, updatedInsertText);
                }
            }
        }
        handlePartialAccept(pid, idx, acceptedCharacters) {
            const completionItem = this.d.get(pid)?.items[idx];
            if (completionItem) {
                if (this.h.handleDidPartiallyAcceptCompletionItem && this.e) {
                    this.h.handleDidPartiallyAcceptCompletionItem(completionItem, acceptedCharacters);
                }
            }
        }
    }
    class ReferenceMap {
        constructor() {
            this.d = new Map();
            this.e = 1;
        }
        createReferenceId(value) {
            const id = this.e++;
            this.d.set(id, value);
            return id;
        }
        disposeReferenceId(referenceId) {
            const value = this.d.get(referenceId);
            this.d.delete(referenceId);
            return value;
        }
        get(referenceId) {
            return this.d.get(referenceId);
        }
    }
    class SignatureHelpAdapter {
        constructor(e, f) {
            this.e = e;
            this.f = f;
            this.d = new cache_1.$6ac('SignatureHelp');
        }
        async provideSignatureHelp(resource, position, context, token) {
            const doc = this.e.getDocument(resource);
            const pos = typeConvert.Position.to(position);
            const vscodeContext = this.g(context);
            const value = await this.f.provideSignatureHelp(doc, pos, token, vscodeContext);
            if (value) {
                const id = this.d.add([value]);
                return { ...typeConvert.SignatureHelp.from(value), id };
            }
            return undefined;
        }
        g(context) {
            let activeSignatureHelp = undefined;
            if (context.activeSignatureHelp) {
                const revivedSignatureHelp = typeConvert.SignatureHelp.to(context.activeSignatureHelp);
                const saved = this.d.get(context.activeSignatureHelp.id, 0);
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
            this.d.delete(id);
        }
    }
    class InlayHintsAdapter {
        constructor(f, g, h, j, k) {
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.k = k;
            this.d = new cache_1.$6ac('InlayHints');
            this.e = new Map();
        }
        async provideInlayHints(resource, ran, token) {
            const doc = this.f.getDocument(resource);
            const range = typeConvert.Range.to(ran);
            const hints = await this.h.provideInlayHints(doc, range, token);
            if (!Array.isArray(hints) || hints.length === 0) {
                // bad result
                this.j.trace(`[InlayHints] NO inlay hints from '${this.k.identifier.value}' for ${ran}`);
                return undefined;
            }
            if (token.isCancellationRequested) {
                // cancelled -> return without further ado, esp no caching
                // of results as they will leak
                return undefined;
            }
            const pid = this.d.add(hints);
            this.e.set(pid, new lifecycle_1.$jc());
            const result = { hints: [], cacheId: pid };
            for (let i = 0; i < hints.length; i++) {
                if (this.l(hints[i], range)) {
                    result.hints.push(this.m(hints[i], [pid, i]));
                }
            }
            this.j.trace(`[InlayHints] ${result.hints.length} inlay hints from '${this.k.identifier.value}' for ${ran}`);
            return result;
        }
        async resolveInlayHint(id, token) {
            if (typeof this.h.resolveInlayHint !== 'function') {
                return undefined;
            }
            const item = this.d.get(...id);
            if (!item) {
                return undefined;
            }
            const hint = await this.h.resolveInlayHint(item, token);
            if (!hint) {
                return undefined;
            }
            if (!this.l(hint)) {
                return undefined;
            }
            return this.m(hint, id);
        }
        releaseHints(id) {
            this.e.get(id)?.dispose();
            this.e.delete(id);
            this.d.delete(id);
        }
        l(hint, range) {
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
        m(hint, id) {
            const disposables = this.e.get(id[0]);
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
                    if (extHostTypes_1.$cK.isLocation(part.location)) {
                        result.location = typeConvert.location.from(part.location);
                    }
                    if (part.command) {
                        result.command = this.g.toInternal(part.command, disposables);
                    }
                    return result;
                });
            }
            return result;
        }
    }
    class LinkProviderAdapter {
        constructor(e, f) {
            this.e = e;
            this.f = f;
            this.d = new cache_1.$6ac('DocumentLink');
        }
        async provideLinks(resource, token) {
            const doc = this.e.getDocument(resource);
            const links = await this.f.provideDocumentLinks(doc, token);
            if (!Array.isArray(links) || links.length === 0) {
                // bad result
                return undefined;
            }
            if (token.isCancellationRequested) {
                // cancelled -> return without further ado, esp no caching
                // of results as they will leak
                return undefined;
            }
            if (typeof this.f.resolveDocumentLink !== 'function') {
                // no resolve -> no caching
                return { links: links.filter(LinkProviderAdapter.g).map(typeConvert.DocumentLink.from) };
            }
            else {
                // cache links for future resolving
                const pid = this.d.add(links);
                const result = { links: [], cacheId: pid };
                for (let i = 0; i < links.length; i++) {
                    if (!LinkProviderAdapter.g(links[i])) {
                        continue;
                    }
                    const dto = typeConvert.DocumentLink.from(links[i]);
                    dto.cacheId = [pid, i];
                    result.links.push(dto);
                }
                return result;
            }
        }
        static g(link) {
            if (link.target && link.target.path.length > 50000) {
                console.warn('DROPPING link because it is too long');
                return false;
            }
            return true;
        }
        async resolveLink(id, token) {
            if (typeof this.f.resolveDocumentLink !== 'function') {
                return undefined;
            }
            const item = this.d.get(...id);
            if (!item) {
                return undefined;
            }
            const link = await this.f.resolveDocumentLink(item, token);
            if (!link || !LinkProviderAdapter.g(link)) {
                return undefined;
            }
            return typeConvert.DocumentLink.from(link);
        }
        releaseLinks(id) {
            this.d.delete(id);
        }
    }
    class ColorProviderAdapter {
        constructor(d, e) {
            this.d = d;
            this.e = e;
        }
        async provideColors(resource, token) {
            const doc = this.d.getDocument(resource);
            const colors = await this.e.provideDocumentColors(doc, token);
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
            const document = this.d.getDocument(resource);
            const range = typeConvert.Range.to(raw.range);
            const color = typeConvert.Color.to(raw.color);
            const value = await this.e.provideColorPresentations(color, { document, range }, token);
            if (!Array.isArray(value)) {
                return undefined;
            }
            return value.map(typeConvert.ColorPresentation.from);
        }
    }
    class FoldingProviderAdapter {
        constructor(d, e) {
            this.d = d;
            this.e = e;
        }
        async provideFoldingRanges(resource, context, token) {
            const doc = this.d.getDocument(resource);
            const ranges = await this.e.provideFoldingRanges(doc, context, token);
            if (!Array.isArray(ranges)) {
                return undefined;
            }
            return ranges.map(typeConvert.FoldingRange.from);
        }
    }
    class SelectionRangeAdapter {
        constructor(d, e, f) {
            this.d = d;
            this.e = e;
            this.f = f;
        }
        async provideSelectionRanges(resource, pos, token) {
            const document = this.d.getDocument(resource);
            const positions = pos.map(typeConvert.Position.to);
            const allProviderRanges = await this.e.provideSelectionRanges(document, positions, token);
            if (!(0, arrays_1.$Jb)(allProviderRanges)) {
                return [];
            }
            if (allProviderRanges.length !== positions.length) {
                this.f.warn('BAD selection ranges, provider must return ranges for each position');
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
        constructor(f, g) {
            this.f = f;
            this.g = g;
            this.d = new idGenerator_1.$7L('');
            this.e = new Map();
        }
        async prepareSession(uri, position, token) {
            const doc = this.f.getDocument(uri);
            const pos = typeConvert.Position.to(position);
            const items = await this.g.prepareCallHierarchy(doc, pos, token);
            if (!items) {
                return undefined;
            }
            const sessionId = this.d.nextId();
            this.e.set(sessionId, new Map());
            if (Array.isArray(items)) {
                return items.map(item => this.h(sessionId, item));
            }
            else {
                return [this.h(sessionId, items)];
            }
        }
        async provideCallsTo(sessionId, itemId, token) {
            const item = this.j(sessionId, itemId);
            if (!item) {
                throw new Error('missing call hierarchy item');
            }
            const calls = await this.g.provideCallHierarchyIncomingCalls(item, token);
            if (!calls) {
                return undefined;
            }
            return calls.map(call => {
                return {
                    from: this.h(sessionId, call.from),
                    fromRanges: call.fromRanges.map(r => typeConvert.Range.from(r))
                };
            });
        }
        async provideCallsFrom(sessionId, itemId, token) {
            const item = this.j(sessionId, itemId);
            if (!item) {
                throw new Error('missing call hierarchy item');
            }
            const calls = await this.g.provideCallHierarchyOutgoingCalls(item, token);
            if (!calls) {
                return undefined;
            }
            return calls.map(call => {
                return {
                    to: this.h(sessionId, call.to),
                    fromRanges: call.fromRanges.map(r => typeConvert.Range.from(r))
                };
            });
        }
        releaseSession(sessionId) {
            this.e.delete(sessionId);
        }
        h(sessionId, item) {
            const map = this.e.get(sessionId);
            const dto = typeConvert.CallHierarchyItem.from(item, sessionId, map.size.toString(36));
            map.set(dto._itemId, item);
            return dto;
        }
        j(sessionId, itemId) {
            const map = this.e.get(sessionId);
            return map?.get(itemId);
        }
    }
    class TypeHierarchyAdapter {
        constructor(f, g) {
            this.f = f;
            this.g = g;
            this.d = new idGenerator_1.$7L('');
            this.e = new Map();
        }
        async prepareSession(uri, position, token) {
            const doc = this.f.getDocument(uri);
            const pos = typeConvert.Position.to(position);
            const items = await this.g.prepareTypeHierarchy(doc, pos, token);
            if (!items) {
                return undefined;
            }
            const sessionId = this.d.nextId();
            this.e.set(sessionId, new Map());
            if (Array.isArray(items)) {
                return items.map(item => this.h(sessionId, item));
            }
            else {
                return [this.h(sessionId, items)];
            }
        }
        async provideSupertypes(sessionId, itemId, token) {
            const item = this.j(sessionId, itemId);
            if (!item) {
                throw new Error('missing type hierarchy item');
            }
            const supertypes = await this.g.provideTypeHierarchySupertypes(item, token);
            if (!supertypes) {
                return undefined;
            }
            return supertypes.map(supertype => {
                return this.h(sessionId, supertype);
            });
        }
        async provideSubtypes(sessionId, itemId, token) {
            const item = this.j(sessionId, itemId);
            if (!item) {
                throw new Error('missing type hierarchy item');
            }
            const subtypes = await this.g.provideTypeHierarchySubtypes(item, token);
            if (!subtypes) {
                return undefined;
            }
            return subtypes.map(subtype => {
                return this.h(sessionId, subtype);
            });
        }
        releaseSession(sessionId) {
            this.e.delete(sessionId);
        }
        h(sessionId, item) {
            const map = this.e.get(sessionId);
            const dto = typeConvert.TypeHierarchyItem.from(item, sessionId, map.size.toString(36));
            map.set(dto._itemId, item);
            return dto;
        }
        j(sessionId, itemId) {
            const map = this.e.get(sessionId);
            return map?.get(itemId);
        }
    }
    class DocumentOnDropEditAdapter {
        static toInternalProviderId(extId, editId) {
            return extId + '.' + editId;
        }
        constructor(d, e, f, g, h) {
            this.d = d;
            this.e = e;
            this.f = f;
            this.g = g;
            this.h = h;
        }
        async provideDocumentOnDropEdits(requestId, uri, position, dataTransferDto, token) {
            const doc = this.e.getDocument(uri);
            const pos = typeConvert.Position.to(position);
            const dataTransfer = typeConvert.DataTransfer.toDataTransfer(dataTransferDto, async (id) => {
                return (await this.d.$resolveDocumentOnDropFileData(this.g, requestId, id)).buffer;
            });
            const edit = await this.f.provideDocumentDropEdits(doc, pos, dataTransfer, token);
            if (!edit) {
                return undefined;
            }
            return {
                label: edit.label ?? (0, nls_1.localize)(1, null, this.h.displayName || this.h.name),
                yieldTo: edit.yieldTo?.map(yTo => {
                    return 'mimeType' in yTo ? yTo : { providerId: DocumentOnDropEditAdapter.toInternalProviderId(yTo.extensionId, yTo.providerId) };
                }),
                insertText: typeof edit.insertText === 'string' ? edit.insertText : { snippet: edit.insertText.value },
                additionalEdit: edit.additionalEdit ? typeConvert.WorkspaceEdit.from(edit.additionalEdit, undefined) : undefined,
            };
        }
    }
    class MappedEditsAdapter {
        constructor(d, e) {
            this.d = d;
            this.e = e;
        }
        async provideMappedEdits(resource, codeBlocks, context, token) {
            const uri = uri_1.URI.revive(resource);
            const doc = this.d.getDocument(uri);
            const ctx = {
                selections: context.selections.map(s => typeConvert.Selection.to(s)),
                related: context.related.map(r => ({ uri: uri_1.URI.revive(r.uri), range: typeConvert.Range.to(r.range) })),
            };
            const mappedEdits = await this.e.provideMappedEdits(doc, codeBlocks, ctx, token);
            return mappedEdits ? typeConvert.WorkspaceEdit.from(mappedEdits) : null;
        }
    }
    class AdapterData {
        constructor(adapter, extension) {
            this.adapter = adapter;
            this.extension = extension;
        }
    }
    class $cbc {
        static { this.d = 0; }
        constructor(mainContext, g, h, j, k, l, m, n) {
            this.g = g;
            this.h = h;
            this.j = j;
            this.k = k;
            this.l = l;
            this.m = m;
            this.n = n;
            this.f = new Map();
            this.e = mainContext.getProxy(extHostProtocol.$1J.MainThreadLanguageFeatures);
        }
        o(selector, extension) {
            return typeConvert.DocumentSelector.from(selector, this.g, extension);
        }
        p(handle) {
            return new extHostTypes_1.$3J(() => {
                this.f.delete(handle);
                this.e.$unregister(handle);
            });
        }
        q() {
            return $cbc.d++;
        }
        async t(handle, ctor, callback, fallbackValue, tokenToRaceAgainst, doNotLog = false) {
            const data = this.f.get(handle);
            if (!data || !(data.adapter instanceof ctor)) {
                return fallbackValue;
            }
            const t1 = Date.now();
            if (!doNotLog) {
                this.l.trace(`[${data.extension.identifier.value}] INVOKE provider '${callback.toString().replace(/[\r\n]/g, '')}'`);
            }
            const result = callback(data.adapter, data.extension);
            // logging,tracing
            Promise.resolve(result).catch(err => {
                if (!(0, errors_1.$2)(err)) {
                    this.l.error(`[${data.extension.identifier.value}] provider FAILED`);
                    this.l.error(err);
                    this.n.onExtensionError(data.extension.identifier, err);
                }
            }).finally(() => {
                if (!doNotLog) {
                    this.l.trace(`[${data.extension.identifier.value}] provider DONE after ${Date.now() - t1}ms`);
                }
            });
            if (cancellation_1.CancellationToken.isCancellationToken(tokenToRaceAgainst)) {
                return (0, async_1.$wg)(result, tokenToRaceAgainst);
            }
            return result;
        }
        u(adapter, extension) {
            const handle = this.q();
            this.f.set(handle, new AdapterData(adapter, extension));
            return handle;
        }
        static w(ext) {
            return ext.displayName || ext.name;
        }
        // --- outline
        registerDocumentSymbolProvider(extension, selector, provider, metadata) {
            const handle = this.u(new DocumentSymbolAdapter(this.h, provider), extension);
            const displayName = (metadata && metadata.label) || $cbc.w(extension);
            this.e.$registerDocumentSymbolProvider(handle, this.o(selector, extension), displayName);
            return this.p(handle);
        }
        $provideDocumentSymbols(handle, resource, token) {
            return this.t(handle, DocumentSymbolAdapter, adapter => adapter.provideDocumentSymbols(uri_1.URI.revive(resource), token), undefined, token);
        }
        // --- code lens
        registerCodeLensProvider(extension, selector, provider) {
            const handle = this.q();
            const eventHandle = typeof provider.onDidChangeCodeLenses === 'function' ? this.q() : undefined;
            this.f.set(handle, new AdapterData(new CodeLensAdapter(this.h, this.j.converter, provider), extension));
            this.e.$registerCodeLensSupport(handle, this.o(selector, extension), eventHandle);
            let result = this.p(handle);
            if (eventHandle !== undefined) {
                const subscription = provider.onDidChangeCodeLenses(_ => this.e.$emitCodeLensEvent(eventHandle));
                result = extHostTypes_1.$3J.from(result, subscription);
            }
            return result;
        }
        $provideCodeLenses(handle, resource, token) {
            return this.t(handle, CodeLensAdapter, adapter => adapter.provideCodeLenses(uri_1.URI.revive(resource), token), undefined, token);
        }
        $resolveCodeLens(handle, symbol, token) {
            return this.t(handle, CodeLensAdapter, adapter => adapter.resolveCodeLens(symbol, token), undefined, undefined);
        }
        $releaseCodeLenses(handle, cacheId) {
            this.t(handle, CodeLensAdapter, adapter => Promise.resolve(adapter.releaseCodeLenses(cacheId)), undefined, undefined);
        }
        // --- declaration
        registerDefinitionProvider(extension, selector, provider) {
            const handle = this.u(new DefinitionAdapter(this.h, provider), extension);
            this.e.$registerDefinitionSupport(handle, this.o(selector, extension));
            return this.p(handle);
        }
        $provideDefinition(handle, resource, position, token) {
            return this.t(handle, DefinitionAdapter, adapter => adapter.provideDefinition(uri_1.URI.revive(resource), position, token), [], token);
        }
        registerDeclarationProvider(extension, selector, provider) {
            const handle = this.u(new DeclarationAdapter(this.h, provider), extension);
            this.e.$registerDeclarationSupport(handle, this.o(selector, extension));
            return this.p(handle);
        }
        $provideDeclaration(handle, resource, position, token) {
            return this.t(handle, DeclarationAdapter, adapter => adapter.provideDeclaration(uri_1.URI.revive(resource), position, token), [], token);
        }
        registerImplementationProvider(extension, selector, provider) {
            const handle = this.u(new ImplementationAdapter(this.h, provider), extension);
            this.e.$registerImplementationSupport(handle, this.o(selector, extension));
            return this.p(handle);
        }
        $provideImplementation(handle, resource, position, token) {
            return this.t(handle, ImplementationAdapter, adapter => adapter.provideImplementation(uri_1.URI.revive(resource), position, token), [], token);
        }
        registerTypeDefinitionProvider(extension, selector, provider) {
            const handle = this.u(new TypeDefinitionAdapter(this.h, provider), extension);
            this.e.$registerTypeDefinitionSupport(handle, this.o(selector, extension));
            return this.p(handle);
        }
        $provideTypeDefinition(handle, resource, position, token) {
            return this.t(handle, TypeDefinitionAdapter, adapter => adapter.provideTypeDefinition(uri_1.URI.revive(resource), position, token), [], token);
        }
        // --- extra info
        registerHoverProvider(extension, selector, provider, extensionId) {
            const handle = this.u(new HoverAdapter(this.h, provider), extension);
            this.e.$registerHoverProvider(handle, this.o(selector, extension));
            return this.p(handle);
        }
        $provideHover(handle, resource, position, token) {
            return this.t(handle, HoverAdapter, adapter => adapter.provideHover(uri_1.URI.revive(resource), position, token), undefined, token);
        }
        // --- debug hover
        registerEvaluatableExpressionProvider(extension, selector, provider, extensionId) {
            const handle = this.u(new EvaluatableExpressionAdapter(this.h, provider), extension);
            this.e.$registerEvaluatableExpressionProvider(handle, this.o(selector, extension));
            return this.p(handle);
        }
        $provideEvaluatableExpression(handle, resource, position, token) {
            return this.t(handle, EvaluatableExpressionAdapter, adapter => adapter.provideEvaluatableExpression(uri_1.URI.revive(resource), position, token), undefined, token);
        }
        // --- debug inline values
        registerInlineValuesProvider(extension, selector, provider, extensionId) {
            const eventHandle = typeof provider.onDidChangeInlineValues === 'function' ? this.q() : undefined;
            const handle = this.u(new InlineValuesAdapter(this.h, provider), extension);
            this.e.$registerInlineValuesProvider(handle, this.o(selector, extension), eventHandle);
            let result = this.p(handle);
            if (eventHandle !== undefined) {
                const subscription = provider.onDidChangeInlineValues(_ => this.e.$emitInlineValuesEvent(eventHandle));
                result = extHostTypes_1.$3J.from(result, subscription);
            }
            return result;
        }
        $provideInlineValues(handle, resource, range, context, token) {
            return this.t(handle, InlineValuesAdapter, adapter => adapter.provideInlineValues(uri_1.URI.revive(resource), range, context, token), undefined, token);
        }
        // --- occurrences
        registerDocumentHighlightProvider(extension, selector, provider) {
            const handle = this.u(new DocumentHighlightAdapter(this.h, provider), extension);
            this.e.$registerDocumentHighlightProvider(handle, this.o(selector, extension));
            return this.p(handle);
        }
        $provideDocumentHighlights(handle, resource, position, token) {
            return this.t(handle, DocumentHighlightAdapter, adapter => adapter.provideDocumentHighlights(uri_1.URI.revive(resource), position, token), undefined, token);
        }
        // --- linked editing
        registerLinkedEditingRangeProvider(extension, selector, provider) {
            const handle = this.u(new LinkedEditingRangeAdapter(this.h, provider), extension);
            this.e.$registerLinkedEditingRangeProvider(handle, this.o(selector, extension));
            return this.p(handle);
        }
        $provideLinkedEditingRanges(handle, resource, position, token) {
            return this.t(handle, LinkedEditingRangeAdapter, async (adapter) => {
                const res = await adapter.provideLinkedEditingRanges(uri_1.URI.revive(resource), position, token);
                if (res) {
                    return {
                        ranges: res.ranges,
                        wordPattern: res.wordPattern ? $cbc.y(res.wordPattern) : undefined
                    };
                }
                return undefined;
            }, undefined, token);
        }
        // --- references
        registerReferenceProvider(extension, selector, provider) {
            const handle = this.u(new ReferenceAdapter(this.h, provider), extension);
            this.e.$registerReferenceSupport(handle, this.o(selector, extension));
            return this.p(handle);
        }
        $provideReferences(handle, resource, position, context, token) {
            return this.t(handle, ReferenceAdapter, adapter => adapter.provideReferences(uri_1.URI.revive(resource), position, context, token), undefined, token);
        }
        // --- quick fix
        registerCodeActionProvider(extension, selector, provider, metadata) {
            const store = new lifecycle_1.$jc();
            const handle = this.u(new CodeActionAdapter(this.h, this.j.converter, this.k, provider, this.l, extension, this.m), extension);
            this.e.$registerQuickFixSupport(handle, this.o(selector, extension), {
                providedKinds: metadata?.providedCodeActionKinds?.map(kind => kind.value),
                documentation: metadata?.documentation?.map(x => ({
                    kind: x.kind.value,
                    command: this.j.converter.toInternal(x.command, store),
                }))
            }, $cbc.w(extension), Boolean(provider.resolveCodeAction));
            store.add(this.p(handle));
            return store;
        }
        $provideCodeActions(handle, resource, rangeOrSelection, context, token) {
            return this.t(handle, CodeActionAdapter, adapter => adapter.provideCodeActions(uri_1.URI.revive(resource), rangeOrSelection, context, token), undefined, token);
        }
        $resolveCodeAction(handle, id, token) {
            return this.t(handle, CodeActionAdapter, adapter => adapter.resolveCodeAction(id, token), {}, undefined);
        }
        $releaseCodeActions(handle, cacheId) {
            this.t(handle, CodeActionAdapter, adapter => Promise.resolve(adapter.releaseCodeActions(cacheId)), undefined, undefined);
        }
        // --- formatting
        registerDocumentFormattingEditProvider(extension, selector, provider) {
            const handle = this.u(new DocumentFormattingAdapter(this.h, provider), extension);
            this.e.$registerDocumentFormattingSupport(handle, this.o(selector, extension), extension.identifier, extension.displayName || extension.name);
            return this.p(handle);
        }
        $provideDocumentFormattingEdits(handle, resource, options, token) {
            return this.t(handle, DocumentFormattingAdapter, adapter => adapter.provideDocumentFormattingEdits(uri_1.URI.revive(resource), options, token), undefined, token);
        }
        registerDocumentRangeFormattingEditProvider(extension, selector, provider) {
            const canFormatMultipleRanges = typeof provider.provideDocumentRangesFormattingEdits === 'function';
            const handle = this.u(new RangeFormattingAdapter(this.h, provider), extension);
            this.e.$registerRangeFormattingSupport(handle, this.o(selector, extension), extension.identifier, extension.displayName || extension.name, canFormatMultipleRanges);
            return this.p(handle);
        }
        $provideDocumentRangeFormattingEdits(handle, resource, range, options, token) {
            return this.t(handle, RangeFormattingAdapter, adapter => adapter.provideDocumentRangeFormattingEdits(uri_1.URI.revive(resource), range, options, token), undefined, token);
        }
        $provideDocumentRangesFormattingEdits(handle, resource, ranges, options, token) {
            return this.t(handle, RangeFormattingAdapter, adapter => adapter.provideDocumentRangesFormattingEdits(uri_1.URI.revive(resource), ranges, options, token), undefined, token);
        }
        registerOnTypeFormattingEditProvider(extension, selector, provider, triggerCharacters) {
            const handle = this.u(new OnTypeFormattingAdapter(this.h, provider), extension);
            this.e.$registerOnTypeFormattingSupport(handle, this.o(selector, extension), triggerCharacters, extension.identifier);
            return this.p(handle);
        }
        $provideOnTypeFormattingEdits(handle, resource, position, ch, options, token) {
            return this.t(handle, OnTypeFormattingAdapter, adapter => adapter.provideOnTypeFormattingEdits(uri_1.URI.revive(resource), position, ch, options, token), undefined, token);
        }
        // --- navigate types
        registerWorkspaceSymbolProvider(extension, provider) {
            const handle = this.u(new NavigateTypeAdapter(provider, this.l), extension);
            this.e.$registerNavigateTypeSupport(handle, typeof provider.resolveWorkspaceSymbol === 'function');
            return this.p(handle);
        }
        $provideWorkspaceSymbols(handle, search, token) {
            return this.t(handle, NavigateTypeAdapter, adapter => adapter.provideWorkspaceSymbols(search, token), { symbols: [] }, token);
        }
        $resolveWorkspaceSymbol(handle, symbol, token) {
            return this.t(handle, NavigateTypeAdapter, adapter => adapter.resolveWorkspaceSymbol(symbol, token), undefined, undefined);
        }
        $releaseWorkspaceSymbols(handle, id) {
            this.t(handle, NavigateTypeAdapter, adapter => adapter.releaseWorkspaceSymbols(id), undefined, undefined);
        }
        // --- rename
        registerRenameProvider(extension, selector, provider) {
            const handle = this.u(new RenameAdapter(this.h, provider, this.l), extension);
            this.e.$registerRenameSupport(handle, this.o(selector, extension), RenameAdapter.supportsResolving(provider));
            return this.p(handle);
        }
        $provideRenameEdits(handle, resource, position, newName, token) {
            return this.t(handle, RenameAdapter, adapter => adapter.provideRenameEdits(uri_1.URI.revive(resource), position, newName, token), undefined, token);
        }
        $resolveRenameLocation(handle, resource, position, token) {
            return this.t(handle, RenameAdapter, adapter => adapter.resolveRenameLocation(uri_1.URI.revive(resource), position, token), undefined, token);
        }
        //#region semantic coloring
        registerDocumentSemanticTokensProvider(extension, selector, provider, legend) {
            const handle = this.u(new DocumentSemanticTokensAdapter(this.h, provider), extension);
            const eventHandle = (typeof provider.onDidChangeSemanticTokens === 'function' ? this.q() : undefined);
            this.e.$registerDocumentSemanticTokensProvider(handle, this.o(selector, extension), legend, eventHandle);
            let result = this.p(handle);
            if (eventHandle) {
                const subscription = provider.onDidChangeSemanticTokens(_ => this.e.$emitDocumentSemanticTokensEvent(eventHandle));
                result = extHostTypes_1.$3J.from(result, subscription);
            }
            return result;
        }
        $provideDocumentSemanticTokens(handle, resource, previousResultId, token) {
            return this.t(handle, DocumentSemanticTokensAdapter, adapter => adapter.provideDocumentSemanticTokens(uri_1.URI.revive(resource), previousResultId, token), null, token);
        }
        $releaseDocumentSemanticTokens(handle, semanticColoringResultId) {
            this.t(handle, DocumentSemanticTokensAdapter, adapter => adapter.releaseDocumentSemanticColoring(semanticColoringResultId), undefined, undefined);
        }
        registerDocumentRangeSemanticTokensProvider(extension, selector, provider, legend) {
            const handle = this.u(new DocumentRangeSemanticTokensAdapter(this.h, provider), extension);
            this.e.$registerDocumentRangeSemanticTokensProvider(handle, this.o(selector, extension), legend);
            return this.p(handle);
        }
        $provideDocumentRangeSemanticTokens(handle, resource, range, token) {
            return this.t(handle, DocumentRangeSemanticTokensAdapter, adapter => adapter.provideDocumentRangeSemanticTokens(uri_1.URI.revive(resource), range, token), null, token);
        }
        //#endregion
        // --- suggestion
        registerCompletionItemProvider(extension, selector, provider, triggerCharacters) {
            const handle = this.u(new CompletionsAdapter(this.h, this.j.converter, provider, this.m, extension), extension);
            this.e.$registerCompletionsProvider(handle, this.o(selector, extension), triggerCharacters, CompletionsAdapter.supportsResolving(provider), extension.identifier);
            return this.p(handle);
        }
        $provideCompletionItems(handle, resource, position, context, token) {
            return this.t(handle, CompletionsAdapter, adapter => adapter.provideCompletionItems(uri_1.URI.revive(resource), position, context, token), undefined, token);
        }
        $resolveCompletionItem(handle, id, token) {
            return this.t(handle, CompletionsAdapter, adapter => adapter.resolveCompletionItem(id, token), undefined, token);
        }
        $releaseCompletionItems(handle, id) {
            this.t(handle, CompletionsAdapter, adapter => adapter.releaseCompletionItems(id), undefined, undefined);
        }
        // --- ghost test
        registerInlineCompletionsProvider(extension, selector, provider, metadata) {
            const adapter = new InlineCompletionAdapter(extension, this.h, provider, this.j.converter);
            const handle = this.u(adapter, extension);
            this.e.$registerInlineCompletionsSupport(handle, this.o(selector, extension), adapter.supportsHandleEvents, extensions_1.$Vl.toKey(extension.identifier.value), metadata?.yieldTo?.map(extId => extensions_1.$Vl.toKey(extId)) || []);
            return this.p(handle);
        }
        $provideInlineCompletions(handle, resource, position, context, token) {
            return this.t(handle, InlineCompletionAdapterBase, adapter => adapter.provideInlineCompletions(uri_1.URI.revive(resource), position, context, token), undefined, token);
        }
        $handleInlineCompletionDidShow(handle, pid, idx, updatedInsertText) {
            this.t(handle, InlineCompletionAdapterBase, async (adapter) => {
                adapter.handleDidShowCompletionItem(pid, idx, updatedInsertText);
            }, undefined, undefined);
        }
        $handleInlineCompletionPartialAccept(handle, pid, idx, acceptedCharacters) {
            this.t(handle, InlineCompletionAdapterBase, async (adapter) => {
                adapter.handlePartialAccept(pid, idx, acceptedCharacters);
            }, undefined, undefined);
        }
        $freeInlineCompletionsList(handle, pid) {
            this.t(handle, InlineCompletionAdapterBase, async (adapter) => { adapter.disposeCompletions(pid); }, undefined, undefined);
        }
        // --- parameter hints
        registerSignatureHelpProvider(extension, selector, provider, metadataOrTriggerChars) {
            const metadata = Array.isArray(metadataOrTriggerChars)
                ? { triggerCharacters: metadataOrTriggerChars, retriggerCharacters: [] }
                : metadataOrTriggerChars;
            const handle = this.u(new SignatureHelpAdapter(this.h, provider), extension);
            this.e.$registerSignatureHelpProvider(handle, this.o(selector, extension), metadata);
            return this.p(handle);
        }
        $provideSignatureHelp(handle, resource, position, context, token) {
            return this.t(handle, SignatureHelpAdapter, adapter => adapter.provideSignatureHelp(uri_1.URI.revive(resource), position, context, token), undefined, token);
        }
        $releaseSignatureHelp(handle, id) {
            this.t(handle, SignatureHelpAdapter, adapter => adapter.releaseSignatureHelp(id), undefined, undefined);
        }
        // --- inline hints
        registerInlayHintsProvider(extension, selector, provider) {
            const eventHandle = typeof provider.onDidChangeInlayHints === 'function' ? this.q() : undefined;
            const handle = this.u(new InlayHintsAdapter(this.h, this.j.converter, provider, this.l, extension), extension);
            this.e.$registerInlayHintsProvider(handle, this.o(selector, extension), typeof provider.resolveInlayHint === 'function', eventHandle, $cbc.w(extension));
            let result = this.p(handle);
            if (eventHandle !== undefined) {
                const subscription = provider.onDidChangeInlayHints(uri => this.e.$emitInlayHintsEvent(eventHandle));
                result = extHostTypes_1.$3J.from(result, subscription);
            }
            return result;
        }
        $provideInlayHints(handle, resource, range, token) {
            return this.t(handle, InlayHintsAdapter, adapter => adapter.provideInlayHints(uri_1.URI.revive(resource), range, token), undefined, token);
        }
        $resolveInlayHint(handle, id, token) {
            return this.t(handle, InlayHintsAdapter, adapter => adapter.resolveInlayHint(id, token), undefined, token);
        }
        $releaseInlayHints(handle, id) {
            this.t(handle, InlayHintsAdapter, adapter => adapter.releaseHints(id), undefined, undefined);
        }
        // --- links
        registerDocumentLinkProvider(extension, selector, provider) {
            const handle = this.u(new LinkProviderAdapter(this.h, provider), extension);
            this.e.$registerDocumentLinkProvider(handle, this.o(selector, extension), typeof provider.resolveDocumentLink === 'function');
            return this.p(handle);
        }
        $provideDocumentLinks(handle, resource, token) {
            return this.t(handle, LinkProviderAdapter, adapter => adapter.provideLinks(uri_1.URI.revive(resource), token), undefined, token, resource.scheme === 'output');
        }
        $resolveDocumentLink(handle, id, token) {
            return this.t(handle, LinkProviderAdapter, adapter => adapter.resolveLink(id, token), undefined, undefined, true);
        }
        $releaseDocumentLinks(handle, id) {
            this.t(handle, LinkProviderAdapter, adapter => adapter.releaseLinks(id), undefined, undefined, true);
        }
        registerColorProvider(extension, selector, provider) {
            const handle = this.u(new ColorProviderAdapter(this.h, provider), extension);
            this.e.$registerDocumentColorProvider(handle, this.o(selector, extension));
            return this.p(handle);
        }
        $provideDocumentColors(handle, resource, token) {
            return this.t(handle, ColorProviderAdapter, adapter => adapter.provideColors(uri_1.URI.revive(resource), token), [], token);
        }
        $provideColorPresentations(handle, resource, colorInfo, token) {
            return this.t(handle, ColorProviderAdapter, adapter => adapter.provideColorPresentations(uri_1.URI.revive(resource), colorInfo, token), undefined, token);
        }
        registerFoldingRangeProvider(extension, selector, provider) {
            const handle = this.q();
            const eventHandle = typeof provider.onDidChangeFoldingRanges === 'function' ? this.q() : undefined;
            this.f.set(handle, new AdapterData(new FoldingProviderAdapter(this.h, provider), extension));
            this.e.$registerFoldingRangeProvider(handle, this.o(selector, extension), extension.identifier, eventHandle);
            let result = this.p(handle);
            if (eventHandle !== undefined) {
                const subscription = provider.onDidChangeFoldingRanges(() => this.e.$emitFoldingRangeEvent(eventHandle));
                result = extHostTypes_1.$3J.from(result, subscription);
            }
            return result;
        }
        $provideFoldingRanges(handle, resource, context, token) {
            return this.t(handle, FoldingProviderAdapter, (adapter) => adapter.provideFoldingRanges(uri_1.URI.revive(resource), context, token), undefined, token);
        }
        // --- smart select
        registerSelectionRangeProvider(extension, selector, provider) {
            const handle = this.u(new SelectionRangeAdapter(this.h, provider, this.l), extension);
            this.e.$registerSelectionRangeProvider(handle, this.o(selector, extension));
            return this.p(handle);
        }
        $provideSelectionRanges(handle, resource, positions, token) {
            return this.t(handle, SelectionRangeAdapter, adapter => adapter.provideSelectionRanges(uri_1.URI.revive(resource), positions, token), [], token);
        }
        // --- call hierarchy
        registerCallHierarchyProvider(extension, selector, provider) {
            const handle = this.u(new CallHierarchyAdapter(this.h, provider), extension);
            this.e.$registerCallHierarchyProvider(handle, this.o(selector, extension));
            return this.p(handle);
        }
        $prepareCallHierarchy(handle, resource, position, token) {
            return this.t(handle, CallHierarchyAdapter, adapter => Promise.resolve(adapter.prepareSession(uri_1.URI.revive(resource), position, token)), undefined, token);
        }
        $provideCallHierarchyIncomingCalls(handle, sessionId, itemId, token) {
            return this.t(handle, CallHierarchyAdapter, adapter => adapter.provideCallsTo(sessionId, itemId, token), undefined, token);
        }
        $provideCallHierarchyOutgoingCalls(handle, sessionId, itemId, token) {
            return this.t(handle, CallHierarchyAdapter, adapter => adapter.provideCallsFrom(sessionId, itemId, token), undefined, token);
        }
        $releaseCallHierarchy(handle, sessionId) {
            this.t(handle, CallHierarchyAdapter, adapter => Promise.resolve(adapter.releaseSession(sessionId)), undefined, undefined);
        }
        // --- type hierarchy
        registerTypeHierarchyProvider(extension, selector, provider) {
            const handle = this.u(new TypeHierarchyAdapter(this.h, provider), extension);
            this.e.$registerTypeHierarchyProvider(handle, this.o(selector, extension));
            return this.p(handle);
        }
        $prepareTypeHierarchy(handle, resource, position, token) {
            return this.t(handle, TypeHierarchyAdapter, adapter => Promise.resolve(adapter.prepareSession(uri_1.URI.revive(resource), position, token)), undefined, token);
        }
        $provideTypeHierarchySupertypes(handle, sessionId, itemId, token) {
            return this.t(handle, TypeHierarchyAdapter, adapter => adapter.provideSupertypes(sessionId, itemId, token), undefined, token);
        }
        $provideTypeHierarchySubtypes(handle, sessionId, itemId, token) {
            return this.t(handle, TypeHierarchyAdapter, adapter => adapter.provideSubtypes(sessionId, itemId, token), undefined, token);
        }
        $releaseTypeHierarchy(handle, sessionId) {
            this.t(handle, TypeHierarchyAdapter, adapter => Promise.resolve(adapter.releaseSession(sessionId)), undefined, undefined);
        }
        // --- Document on drop
        registerDocumentOnDropEditProvider(extension, selector, provider, metadata) {
            const handle = this.q();
            this.f.set(handle, new AdapterData(new DocumentOnDropEditAdapter(this.e, this.h, provider, handle, extension), extension));
            const id = (0, extensions_2.$PF)(extension, 'dropMetadata') && metadata ? DocumentOnDropEditAdapter.toInternalProviderId(extension.identifier.value, metadata.id) : undefined;
            this.e.$registerDocumentOnDropEditProvider(handle, this.o(selector, extension), id, (0, extensions_2.$PF)(extension, 'dropMetadata') ? metadata : undefined);
            return this.p(handle);
        }
        $provideDocumentOnDropEdits(handle, requestId, resource, position, dataTransferDto, token) {
            return this.t(handle, DocumentOnDropEditAdapter, adapter => Promise.resolve(adapter.provideDocumentOnDropEdits(requestId, uri_1.URI.revive(resource), position, dataTransferDto, token)), undefined, undefined);
        }
        // --- mapped edits
        registerMappedEditsProvider(extension, selector, provider) {
            const handle = this.u(new MappedEditsAdapter(this.h, provider), extension);
            this.e.$registerMappedEditsProvider(handle, this.o(selector, extension));
            return this.p(handle);
        }
        $provideMappedEdits(handle, document, codeBlocks, context, token) {
            return this.t(handle, MappedEditsAdapter, adapter => Promise.resolve(adapter.provideMappedEdits(document, codeBlocks, context, token)), null, token);
        }
        // --- copy/paste actions
        registerDocumentPasteEditProvider(extension, selector, provider, metadata) {
            const handle = this.q();
            this.f.set(handle, new AdapterData(new DocumentPasteEditProvider(this.e, this.h, provider, handle, extension), extension));
            const internalId = DocumentPasteEditProvider.toInternalProviderId(extension.identifier.value, metadata.id);
            this.e.$registerPasteEditProvider(handle, this.o(selector, extension), internalId, {
                supportsCopy: !!provider.prepareDocumentPaste,
                supportsPaste: !!provider.provideDocumentPasteEdits,
                copyMimeTypes: metadata.copyMimeTypes,
                pasteMimeTypes: metadata.pasteMimeTypes,
            });
            return this.p(handle);
        }
        $prepareDocumentPaste(handle, resource, ranges, dataTransfer, token) {
            return this.t(handle, DocumentPasteEditProvider, adapter => adapter.prepareDocumentPaste(uri_1.URI.revive(resource), ranges, dataTransfer, token), undefined, token);
        }
        $providePasteEdits(handle, requestId, resource, ranges, dataTransferDto, token) {
            return this.t(handle, DocumentPasteEditProvider, adapter => adapter.providePasteEdits(requestId, uri_1.URI.revive(resource), ranges, dataTransferDto, token), undefined, token);
        }
        // --- configuration
        static y(regExp) {
            return {
                pattern: regExp.source,
                flags: regExp.flags,
            };
        }
        static z(indentationRule) {
            return {
                decreaseIndentPattern: $cbc.y(indentationRule.decreaseIndentPattern),
                increaseIndentPattern: $cbc.y(indentationRule.increaseIndentPattern),
                indentNextLinePattern: indentationRule.indentNextLinePattern ? $cbc.y(indentationRule.indentNextLinePattern) : undefined,
                unIndentedLinePattern: indentationRule.unIndentedLinePattern ? $cbc.y(indentationRule.unIndentedLinePattern) : undefined,
            };
        }
        static B(onEnterRule) {
            return {
                beforeText: $cbc.y(onEnterRule.beforeText),
                afterText: onEnterRule.afterText ? $cbc.y(onEnterRule.afterText) : undefined,
                previousLineText: onEnterRule.previousLineText ? $cbc.y(onEnterRule.previousLineText) : undefined,
                action: onEnterRule.action
            };
        }
        static C(onEnterRules) {
            return onEnterRules.map($cbc.B);
        }
        static D(autoClosingPair) {
            return {
                open: autoClosingPair.open,
                close: autoClosingPair.close,
                notIn: autoClosingPair.notIn ? autoClosingPair.notIn.map(v => extHostTypes_1.SyntaxTokenType.toString(v)) : undefined,
            };
        }
        static E(autoClosingPairs) {
            return autoClosingPairs.map($cbc.D);
        }
        setLanguageConfiguration(extension, languageId, configuration) {
            const { wordPattern } = configuration;
            // check for a valid word pattern
            if (wordPattern && (0, strings_1.$ze)(wordPattern)) {
                throw new Error(`Invalid language configuration: wordPattern '${wordPattern}' is not allowed to match the empty string.`);
            }
            // word definition
            if (wordPattern) {
                this.h.setWordDefinitionFor(languageId, wordPattern);
            }
            else {
                this.h.setWordDefinitionFor(languageId, undefined);
            }
            if (configuration.__electricCharacterSupport) {
                this.m.report('LanguageConfiguration.__electricCharacterSupport', extension, `Do not use.`);
            }
            if (configuration.__characterPairSupport) {
                this.m.report('LanguageConfiguration.__characterPairSupport', extension, `Do not use.`);
            }
            const handle = this.q();
            const serializedConfiguration = {
                comments: configuration.comments,
                brackets: configuration.brackets,
                wordPattern: configuration.wordPattern ? $cbc.y(configuration.wordPattern) : undefined,
                indentationRules: configuration.indentationRules ? $cbc.z(configuration.indentationRules) : undefined,
                onEnterRules: configuration.onEnterRules ? $cbc.C(configuration.onEnterRules) : undefined,
                __electricCharacterSupport: configuration.__electricCharacterSupport,
                __characterPairSupport: configuration.__characterPairSupport,
                autoClosingPairs: configuration.autoClosingPairs ? $cbc.E(configuration.autoClosingPairs) : undefined,
            };
            this.e.$setLanguageConfiguration(handle, languageId, serializedConfiguration);
            return this.p(handle);
        }
        $setWordDefinitions(wordDefinitions) {
            for (const wordDefinition of wordDefinitions) {
                this.h.setWordDefinitionFor(wordDefinition.languageId, new RegExp(wordDefinition.regexSource, wordDefinition.regexFlags));
            }
        }
    }
    exports.$cbc = $cbc;
});
//# sourceMappingURL=extHostLanguageFeatures.js.map