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
define(["require", "exports", "vs/base/common/dataTransfer", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/marshalling", "vs/base/common/objects", "vs/base/common/uri", "vs/editor/common/languages/language", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/services/languageFeatures", "vs/editor/common/services/semanticTokensDto", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/api/browser/mainThreadBulkEdits", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/shared/dataTransferCache", "vs/workbench/contrib/callHierarchy/common/callHierarchy", "vs/workbench/contrib/search/common/search", "vs/workbench/contrib/typeHierarchy/common/typeHierarchy", "vs/workbench/services/extensions/common/extHostCustomers", "../common/extHost.protocol"], function (require, exports, dataTransfer_1, errors_1, event_1, lifecycle_1, marshalling_1, objects_1, uri_1, language_1, languageConfigurationRegistry_1, languageFeatures_1, semanticTokensDto_1, uriIdentity_1, mainThreadBulkEdits_1, typeConvert, dataTransferCache_1, callh, search, typeh, extHostCustomers_1, extHost_protocol_1) {
    "use strict";
    var $skb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$vkb = exports.$ukb = exports.$tkb = exports.$skb = void 0;
    let $skb = $skb_1 = class $skb extends lifecycle_1.$kc {
        constructor(extHostContext, c, f, g, h) {
            super();
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.b = this.B(new lifecycle_1.$sc());
            // --- copy paste action provider
            this.w = new Map();
            // --- document drop Edits
            this.G = new Map();
            this.a = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostLanguageFeatures);
            if (this.c) {
                const updateAllWordDefinitions = () => {
                    const wordDefinitionDtos = [];
                    for (const languageId of c.getRegisteredLanguageIds()) {
                        const wordDefinition = this.f.getLanguageConfiguration(languageId).getWordDefinition();
                        wordDefinitionDtos.push({
                            languageId: languageId,
                            regexSource: wordDefinition.source,
                            regexFlags: wordDefinition.flags
                        });
                    }
                    this.a.$setWordDefinitions(wordDefinitionDtos);
                };
                this.f.onDidChange((e) => {
                    if (!e.languageId) {
                        updateAllWordDefinitions();
                    }
                    else {
                        const wordDefinition = this.f.getLanguageConfiguration(e.languageId).getWordDefinition();
                        this.a.$setWordDefinitions([{
                                languageId: e.languageId,
                                regexSource: wordDefinition.source,
                                regexFlags: wordDefinition.flags
                            }]);
                    }
                });
                updateAllWordDefinitions();
            }
        }
        $unregister(handle) {
            this.b.deleteAndDispose(handle);
        }
        static j(data) {
            if (!data) {
                return data;
            }
            else if (Array.isArray(data)) {
                data.forEach(l => $skb_1.j(l));
                return data;
            }
            else {
                data.uri = uri_1.URI.revive(data.uri);
                return data;
            }
        }
        static m(data) {
            if (!data) {
                return data;
            }
            else if (Array.isArray(data)) {
                data.forEach(l => $skb_1.m(l));
                return data;
            }
            else {
                data.uri = uri_1.URI.revive(data.uri);
                return data;
            }
        }
        static n(data) {
            if (!data) {
                return data;
            }
            else if (Array.isArray(data)) {
                data.forEach($skb_1.n);
                return data;
            }
            else {
                data.location = $skb_1.j(data.location);
                return data;
            }
        }
        static r(data, uriIdentService) {
            data?.forEach(code => (0, mainThreadBulkEdits_1.$6bb)(code.edit, uriIdentService));
            return data;
        }
        static s(data) {
            if (data.url && typeof data.url !== 'string') {
                data.url = uri_1.URI.revive(data.url);
            }
            return data;
        }
        static t(data) {
            if (data) {
                data.uri = uri_1.URI.revive(data.uri);
            }
            return data;
        }
        static u(data) {
            if (data) {
                data.uri = uri_1.URI.revive(data.uri);
            }
            return data;
        }
        //#endregion
        // --- outline
        $registerDocumentSymbolProvider(handle, selector, displayName) {
            this.b.set(handle, this.g.documentSymbolProvider.register(selector, {
                displayName,
                provideDocumentSymbols: (model, token) => {
                    return this.a.$provideDocumentSymbols(handle, model.uri, token);
                }
            }));
        }
        // --- code lens
        $registerCodeLensSupport(handle, selector, eventHandle) {
            const provider = {
                provideCodeLenses: async (model, token) => {
                    const listDto = await this.a.$provideCodeLenses(handle, model.uri, token);
                    if (!listDto) {
                        return undefined;
                    }
                    return {
                        lenses: listDto.lenses,
                        dispose: () => listDto.cacheId && this.a.$releaseCodeLenses(handle, listDto.cacheId)
                    };
                },
                resolveCodeLens: async (model, codeLens, token) => {
                    const result = await this.a.$resolveCodeLens(handle, codeLens, token);
                    if (!result) {
                        return undefined;
                    }
                    return {
                        ...result,
                        range: model.validateRange(result.range),
                    };
                }
            };
            if (typeof eventHandle === 'number') {
                const emitter = new event_1.$fd();
                this.b.set(eventHandle, emitter);
                provider.onDidChange = emitter.event;
            }
            this.b.set(handle, this.g.codeLensProvider.register(selector, provider));
        }
        $emitCodeLensEvent(eventHandle, event) {
            const obj = this.b.get(eventHandle);
            if (obj instanceof event_1.$fd) {
                obj.fire(event);
            }
        }
        // --- declaration
        $registerDefinitionSupport(handle, selector) {
            this.b.set(handle, this.g.definitionProvider.register(selector, {
                provideDefinition: (model, position, token) => {
                    return this.a.$provideDefinition(handle, model.uri, position, token).then($skb_1.m);
                }
            }));
        }
        $registerDeclarationSupport(handle, selector) {
            this.b.set(handle, this.g.declarationProvider.register(selector, {
                provideDeclaration: (model, position, token) => {
                    return this.a.$provideDeclaration(handle, model.uri, position, token).then($skb_1.m);
                }
            }));
        }
        $registerImplementationSupport(handle, selector) {
            this.b.set(handle, this.g.implementationProvider.register(selector, {
                provideImplementation: (model, position, token) => {
                    return this.a.$provideImplementation(handle, model.uri, position, token).then($skb_1.m);
                }
            }));
        }
        $registerTypeDefinitionSupport(handle, selector) {
            this.b.set(handle, this.g.typeDefinitionProvider.register(selector, {
                provideTypeDefinition: (model, position, token) => {
                    return this.a.$provideTypeDefinition(handle, model.uri, position, token).then($skb_1.m);
                }
            }));
        }
        // --- extra info
        $registerHoverProvider(handle, selector) {
            this.b.set(handle, this.g.hoverProvider.register(selector, {
                provideHover: (model, position, token) => {
                    return this.a.$provideHover(handle, model.uri, position, token);
                }
            }));
        }
        // --- debug hover
        $registerEvaluatableExpressionProvider(handle, selector) {
            this.b.set(handle, this.g.evaluatableExpressionProvider.register(selector, {
                provideEvaluatableExpression: (model, position, token) => {
                    return this.a.$provideEvaluatableExpression(handle, model.uri, position, token);
                }
            }));
        }
        // --- inline values
        $registerInlineValuesProvider(handle, selector, eventHandle) {
            const provider = {
                provideInlineValues: (model, viewPort, context, token) => {
                    return this.a.$provideInlineValues(handle, model.uri, viewPort, context, token);
                }
            };
            if (typeof eventHandle === 'number') {
                const emitter = new event_1.$fd();
                this.b.set(eventHandle, emitter);
                provider.onDidChangeInlineValues = emitter.event;
            }
            this.b.set(handle, this.g.inlineValuesProvider.register(selector, provider));
        }
        $emitInlineValuesEvent(eventHandle, event) {
            const obj = this.b.get(eventHandle);
            if (obj instanceof event_1.$fd) {
                obj.fire(event);
            }
        }
        // --- occurrences
        $registerDocumentHighlightProvider(handle, selector) {
            this.b.set(handle, this.g.documentHighlightProvider.register(selector, {
                provideDocumentHighlights: (model, position, token) => {
                    return this.a.$provideDocumentHighlights(handle, model.uri, position, token);
                }
            }));
        }
        // --- linked editing
        $registerLinkedEditingRangeProvider(handle, selector) {
            this.b.set(handle, this.g.linkedEditingRangeProvider.register(selector, {
                provideLinkedEditingRanges: async (model, position, token) => {
                    const res = await this.a.$provideLinkedEditingRanges(handle, model.uri, position, token);
                    if (res) {
                        return {
                            ranges: res.ranges,
                            wordPattern: res.wordPattern ? $skb_1.z(res.wordPattern) : undefined
                        };
                    }
                    return undefined;
                }
            }));
        }
        // --- references
        $registerReferenceSupport(handle, selector) {
            this.b.set(handle, this.g.referenceProvider.register(selector, {
                provideReferences: (model, position, context, token) => {
                    return this.a.$provideReferences(handle, model.uri, position, context, token).then($skb_1.j);
                }
            }));
        }
        // --- quick fix
        $registerQuickFixSupport(handle, selector, metadata, displayName, supportsResolve) {
            const provider = {
                provideCodeActions: async (model, rangeOrSelection, context, token) => {
                    const listDto = await this.a.$provideCodeActions(handle, model.uri, rangeOrSelection, context, token);
                    if (!listDto) {
                        return undefined;
                    }
                    return {
                        actions: $skb_1.r(listDto.actions, this.h),
                        dispose: () => {
                            if (typeof listDto.cacheId === 'number') {
                                this.a.$releaseCodeActions(handle, listDto.cacheId);
                            }
                        }
                    };
                },
                providedCodeActionKinds: metadata.providedKinds,
                documentation: metadata.documentation,
                displayName
            };
            if (supportsResolve) {
                provider.resolveCodeAction = async (codeAction, token) => {
                    const resolved = await this.a.$resolveCodeAction(handle, codeAction.cacheId, token);
                    if (resolved.edit) {
                        codeAction.edit = (0, mainThreadBulkEdits_1.$6bb)(resolved.edit, this.h);
                    }
                    if (resolved.command) {
                        codeAction.command = resolved.command;
                    }
                    return codeAction;
                };
            }
            this.b.set(handle, this.g.codeActionProvider.register(selector, provider));
        }
        $registerPasteEditProvider(handle, selector, id, metadata) {
            const provider = new MainThreadPasteEditProvider(handle, this.a, id, metadata, this.h);
            this.w.set(handle, provider);
            this.b.set(handle, (0, lifecycle_1.$hc)(this.g.documentPasteEditProvider.register(selector, provider), (0, lifecycle_1.$ic)(() => this.w.delete(handle))));
        }
        $resolvePasteFileData(handle, requestId, dataId) {
            const provider = this.w.get(handle);
            if (!provider) {
                throw new Error('Could not find provider');
            }
            return provider.resolveFileData(requestId, dataId);
        }
        // --- formatting
        $registerDocumentFormattingSupport(handle, selector, extensionId, displayName) {
            this.b.set(handle, this.g.documentFormattingEditProvider.register(selector, {
                extensionId,
                displayName,
                provideDocumentFormattingEdits: (model, options, token) => {
                    return this.a.$provideDocumentFormattingEdits(handle, model.uri, options, token);
                }
            }));
        }
        $registerRangeFormattingSupport(handle, selector, extensionId, displayName, supportsRanges) {
            this.b.set(handle, this.g.documentRangeFormattingEditProvider.register(selector, {
                extensionId,
                displayName,
                provideDocumentRangeFormattingEdits: (model, range, options, token) => {
                    return this.a.$provideDocumentRangeFormattingEdits(handle, model.uri, range, options, token);
                },
                provideDocumentRangesFormattingEdits: !supportsRanges
                    ? undefined
                    : (model, ranges, options, token) => {
                        return this.a.$provideDocumentRangesFormattingEdits(handle, model.uri, ranges, options, token);
                    },
            }));
        }
        $registerOnTypeFormattingSupport(handle, selector, autoFormatTriggerCharacters, extensionId) {
            this.b.set(handle, this.g.onTypeFormattingEditProvider.register(selector, {
                extensionId,
                autoFormatTriggerCharacters,
                provideOnTypeFormattingEdits: (model, position, ch, options, token) => {
                    return this.a.$provideOnTypeFormattingEdits(handle, model.uri, position, ch, options, token);
                }
            }));
        }
        // --- navigate type
        $registerNavigateTypeSupport(handle, supportsResolve) {
            let lastResultId;
            const provider = {
                provideWorkspaceSymbols: async (search, token) => {
                    const result = await this.a.$provideWorkspaceSymbols(handle, search, token);
                    if (lastResultId !== undefined) {
                        this.a.$releaseWorkspaceSymbols(handle, lastResultId);
                    }
                    lastResultId = result.cacheId;
                    return $skb_1.n(result.symbols);
                }
            };
            if (supportsResolve) {
                provider.resolveWorkspaceSymbol = async (item, token) => {
                    const resolvedItem = await this.a.$resolveWorkspaceSymbol(handle, item, token);
                    return resolvedItem && $skb_1.n(resolvedItem);
                };
            }
            this.b.set(handle, search.WorkspaceSymbolProviderRegistry.register(provider));
        }
        // --- rename
        $registerRenameSupport(handle, selector, supportResolveLocation) {
            this.b.set(handle, this.g.renameProvider.register(selector, {
                provideRenameEdits: (model, position, newName, token) => {
                    return this.a.$provideRenameEdits(handle, model.uri, position, newName, token).then(data => (0, mainThreadBulkEdits_1.$6bb)(data, this.h));
                },
                resolveRenameLocation: supportResolveLocation
                    ? (model, position, token) => this.a.$resolveRenameLocation(handle, model.uri, position, token)
                    : undefined
            }));
        }
        // --- semantic tokens
        $registerDocumentSemanticTokensProvider(handle, selector, legend, eventHandle) {
            let event = undefined;
            if (typeof eventHandle === 'number') {
                const emitter = new event_1.$fd();
                this.b.set(eventHandle, emitter);
                event = emitter.event;
            }
            this.b.set(handle, this.g.documentSemanticTokensProvider.register(selector, new $tkb(this.a, handle, legend, event)));
        }
        $emitDocumentSemanticTokensEvent(eventHandle) {
            const obj = this.b.get(eventHandle);
            if (obj instanceof event_1.$fd) {
                obj.fire(undefined);
            }
        }
        $registerDocumentRangeSemanticTokensProvider(handle, selector, legend) {
            this.b.set(handle, this.g.documentRangeSemanticTokensProvider.register(selector, new $ukb(this.a, handle, legend)));
        }
        // --- suggest
        static y(defaultRange, data, extensionId) {
            const label = data["a" /* ISuggestDataDtoField.label */];
            const commandId = data["o" /* ISuggestDataDtoField.commandId */];
            const commandIdent = data["n" /* ISuggestDataDtoField.commandIdent */];
            const commitChars = data["k" /* ISuggestDataDtoField.commitCharacters */];
            return {
                label,
                extensionId,
                kind: data["b" /* ISuggestDataDtoField.kind */] ?? 9 /* languages.CompletionItemKind.Property */,
                tags: data["m" /* ISuggestDataDtoField.kindModifier */],
                detail: data["c" /* ISuggestDataDtoField.detail */],
                documentation: data["d" /* ISuggestDataDtoField.documentation */],
                sortText: data["e" /* ISuggestDataDtoField.sortText */],
                filterText: data["f" /* ISuggestDataDtoField.filterText */],
                preselect: data["g" /* ISuggestDataDtoField.preselect */],
                insertText: data["h" /* ISuggestDataDtoField.insertText */] ?? (typeof label === 'string' ? label : label.label),
                range: data["j" /* ISuggestDataDtoField.range */] ?? defaultRange,
                insertTextRules: data["i" /* ISuggestDataDtoField.insertTextRules */],
                commitCharacters: commitChars ? Array.from(commitChars) : undefined,
                additionalTextEdits: data["l" /* ISuggestDataDtoField.additionalTextEdits */],
                command: commandId ? {
                    $ident: commandIdent,
                    id: commandId,
                    title: '',
                    arguments: commandIdent ? [commandIdent] : data["p" /* ISuggestDataDtoField.commandArguments */], // Automatically fill in ident as first argument
                } : undefined,
                // not-standard
                _id: data.x,
            };
        }
        $registerCompletionsProvider(handle, selector, triggerCharacters, supportsResolveDetails, extensionId) {
            const provider = {
                triggerCharacters,
                _debugDisplayName: `${extensionId.value}(${triggerCharacters.join('')})`,
                provideCompletionItems: async (model, position, context, token) => {
                    const result = await this.a.$provideCompletionItems(handle, model.uri, position, context, token);
                    if (!result) {
                        return result;
                    }
                    return {
                        suggestions: result["b" /* ISuggestResultDtoField.completions */].map(d => $skb_1.y(result["a" /* ISuggestResultDtoField.defaultRanges */], d, extensionId)),
                        incomplete: result["c" /* ISuggestResultDtoField.isIncomplete */] || false,
                        duration: result["d" /* ISuggestResultDtoField.duration */],
                        dispose: () => {
                            if (typeof result.x === 'number') {
                                this.a.$releaseCompletionItems(handle, result.x);
                            }
                        }
                    };
                }
            };
            if (supportsResolveDetails) {
                provider.resolveCompletionItem = (suggestion, token) => {
                    return this.a.$resolveCompletionItem(handle, suggestion._id, token).then(result => {
                        if (!result) {
                            return suggestion;
                        }
                        const newSuggestion = $skb_1.y(suggestion.range, result, extensionId);
                        return (0, objects_1.$Ym)(suggestion, newSuggestion, true);
                    });
                };
            }
            this.b.set(handle, this.g.completionProvider.register(selector, provider));
        }
        $registerInlineCompletionsSupport(handle, selector, supportsHandleEvents, extensionId, yieldsToExtensionIds) {
            const provider = {
                provideInlineCompletions: async (model, position, context, token) => {
                    return this.a.$provideInlineCompletions(handle, model.uri, position, context, token);
                },
                handleItemDidShow: async (completions, item, updatedInsertText) => {
                    if (supportsHandleEvents) {
                        await this.a.$handleInlineCompletionDidShow(handle, completions.pid, item.idx, updatedInsertText);
                    }
                },
                handlePartialAccept: async (completions, item, acceptedCharacters) => {
                    if (supportsHandleEvents) {
                        await this.a.$handleInlineCompletionPartialAccept(handle, completions.pid, item.idx, acceptedCharacters);
                    }
                },
                freeInlineCompletions: (completions) => {
                    this.a.$freeInlineCompletionsList(handle, completions.pid);
                },
                groupId: extensionId,
                yieldsToGroupIds: yieldsToExtensionIds,
                toString() {
                    return `InlineCompletionsProvider(${extensionId})`;
                }
            };
            this.b.set(handle, this.g.inlineCompletionsProvider.register(selector, provider));
        }
        // --- parameter hints
        $registerSignatureHelpProvider(handle, selector, metadata) {
            this.b.set(handle, this.g.signatureHelpProvider.register(selector, {
                signatureHelpTriggerCharacters: metadata.triggerCharacters,
                signatureHelpRetriggerCharacters: metadata.retriggerCharacters,
                provideSignatureHelp: async (model, position, token, context) => {
                    const result = await this.a.$provideSignatureHelp(handle, model.uri, position, context, token);
                    if (!result) {
                        return undefined;
                    }
                    return {
                        value: result,
                        dispose: () => {
                            this.a.$releaseSignatureHelp(handle, result.id);
                        }
                    };
                }
            }));
        }
        // --- inline hints
        $registerInlayHintsProvider(handle, selector, supportsResolve, eventHandle, displayName) {
            const provider = {
                displayName,
                provideInlayHints: async (model, range, token) => {
                    const result = await this.a.$provideInlayHints(handle, model.uri, range, token);
                    if (!result) {
                        return;
                    }
                    return {
                        hints: (0, marshalling_1.$$g)(result.hints),
                        dispose: () => {
                            if (result.cacheId) {
                                this.a.$releaseInlayHints(handle, result.cacheId);
                            }
                        }
                    };
                }
            };
            if (supportsResolve) {
                provider.resolveInlayHint = async (hint, token) => {
                    const dto = hint;
                    if (!dto.cacheId) {
                        return hint;
                    }
                    const result = await this.a.$resolveInlayHint(handle, dto.cacheId, token);
                    if (token.isCancellationRequested) {
                        throw new errors_1.$3();
                    }
                    if (!result) {
                        return hint;
                    }
                    return {
                        ...hint,
                        tooltip: result.tooltip,
                        label: (0, marshalling_1.$$g)(result.label)
                    };
                };
            }
            if (typeof eventHandle === 'number') {
                const emitter = new event_1.$fd();
                this.b.set(eventHandle, emitter);
                provider.onDidChangeInlayHints = emitter.event;
            }
            this.b.set(handle, this.g.inlayHintsProvider.register(selector, provider));
        }
        $emitInlayHintsEvent(eventHandle) {
            const obj = this.b.get(eventHandle);
            if (obj instanceof event_1.$fd) {
                obj.fire(undefined);
            }
        }
        // --- links
        $registerDocumentLinkProvider(handle, selector, supportsResolve) {
            const provider = {
                provideLinks: (model, token) => {
                    return this.a.$provideDocumentLinks(handle, model.uri, token).then(dto => {
                        if (!dto) {
                            return undefined;
                        }
                        return {
                            links: dto.links.map($skb_1.s),
                            dispose: () => {
                                if (typeof dto.cacheId === 'number') {
                                    this.a.$releaseDocumentLinks(handle, dto.cacheId);
                                }
                            }
                        };
                    });
                }
            };
            if (supportsResolve) {
                provider.resolveLink = (link, token) => {
                    const dto = link;
                    if (!dto.cacheId) {
                        return link;
                    }
                    return this.a.$resolveDocumentLink(handle, dto.cacheId, token).then(obj => {
                        return obj && $skb_1.s(obj);
                    });
                };
            }
            this.b.set(handle, this.g.linkProvider.register(selector, provider));
        }
        // --- colors
        $registerDocumentColorProvider(handle, selector) {
            const proxy = this.a;
            this.b.set(handle, this.g.colorProvider.register(selector, {
                provideDocumentColors: (model, token) => {
                    return proxy.$provideDocumentColors(handle, model.uri, token)
                        .then(documentColors => {
                        return documentColors.map(documentColor => {
                            const [red, green, blue, alpha] = documentColor.color;
                            const color = {
                                red: red,
                                green: green,
                                blue: blue,
                                alpha
                            };
                            return {
                                color,
                                range: documentColor.range
                            };
                        });
                    });
                },
                provideColorPresentations: (model, colorInfo, token) => {
                    return proxy.$provideColorPresentations(handle, model.uri, {
                        color: [colorInfo.color.red, colorInfo.color.green, colorInfo.color.blue, colorInfo.color.alpha],
                        range: colorInfo.range
                    }, token);
                }
            }));
        }
        // --- folding
        $registerFoldingRangeProvider(handle, selector, extensionId, eventHandle) {
            const provider = {
                id: extensionId.value,
                provideFoldingRanges: (model, context, token) => {
                    return this.a.$provideFoldingRanges(handle, model.uri, context, token);
                }
            };
            if (typeof eventHandle === 'number') {
                const emitter = new event_1.$fd();
                this.b.set(eventHandle, emitter);
                provider.onDidChange = emitter.event;
            }
            this.b.set(handle, this.g.foldingRangeProvider.register(selector, provider));
        }
        $emitFoldingRangeEvent(eventHandle, event) {
            const obj = this.b.get(eventHandle);
            if (obj instanceof event_1.$fd) {
                obj.fire(event);
            }
        }
        // -- smart select
        $registerSelectionRangeProvider(handle, selector) {
            this.b.set(handle, this.g.selectionRangeProvider.register(selector, {
                provideSelectionRanges: (model, positions, token) => {
                    return this.a.$provideSelectionRanges(handle, model.uri, positions, token);
                }
            }));
        }
        // --- call hierarchy
        $registerCallHierarchyProvider(handle, selector) {
            this.b.set(handle, callh.$eF.register(selector, {
                prepareCallHierarchy: async (document, position, token) => {
                    const items = await this.a.$prepareCallHierarchy(handle, document.uri, position, token);
                    if (!items || items.length === 0) {
                        return undefined;
                    }
                    return {
                        dispose: () => {
                            for (const item of items) {
                                this.a.$releaseCallHierarchy(handle, item._sessionId);
                            }
                        },
                        roots: items.map($skb_1.t)
                    };
                },
                provideOutgoingCalls: async (item, token) => {
                    const outgoing = await this.a.$provideCallHierarchyOutgoingCalls(handle, item._sessionId, item._itemId, token);
                    if (!outgoing) {
                        return outgoing;
                    }
                    outgoing.forEach(value => {
                        value.to = $skb_1.t(value.to);
                    });
                    return outgoing;
                },
                provideIncomingCalls: async (item, token) => {
                    const incoming = await this.a.$provideCallHierarchyIncomingCalls(handle, item._sessionId, item._itemId, token);
                    if (!incoming) {
                        return incoming;
                    }
                    incoming.forEach(value => {
                        value.from = $skb_1.t(value.from);
                    });
                    return incoming;
                }
            }));
        }
        // --- configuration
        static z(regExp) {
            return new RegExp(regExp.pattern, regExp.flags);
        }
        static C(indentationRule) {
            return {
                decreaseIndentPattern: $skb_1.z(indentationRule.decreaseIndentPattern),
                increaseIndentPattern: $skb_1.z(indentationRule.increaseIndentPattern),
                indentNextLinePattern: indentationRule.indentNextLinePattern ? $skb_1.z(indentationRule.indentNextLinePattern) : undefined,
                unIndentedLinePattern: indentationRule.unIndentedLinePattern ? $skb_1.z(indentationRule.unIndentedLinePattern) : undefined,
            };
        }
        static D(onEnterRule) {
            return {
                beforeText: $skb_1.z(onEnterRule.beforeText),
                afterText: onEnterRule.afterText ? $skb_1.z(onEnterRule.afterText) : undefined,
                previousLineText: onEnterRule.previousLineText ? $skb_1.z(onEnterRule.previousLineText) : undefined,
                action: onEnterRule.action
            };
        }
        static F(onEnterRules) {
            return onEnterRules.map($skb_1.D);
        }
        $setLanguageConfiguration(handle, languageId, _configuration) {
            const configuration = {
                comments: _configuration.comments,
                brackets: _configuration.brackets,
                wordPattern: _configuration.wordPattern ? $skb_1.z(_configuration.wordPattern) : undefined,
                indentationRules: _configuration.indentationRules ? $skb_1.C(_configuration.indentationRules) : undefined,
                onEnterRules: _configuration.onEnterRules ? $skb_1.F(_configuration.onEnterRules) : undefined,
                autoClosingPairs: undefined,
                surroundingPairs: undefined,
                __electricCharacterSupport: undefined
            };
            if (_configuration.autoClosingPairs) {
                configuration.autoClosingPairs = _configuration.autoClosingPairs;
            }
            else if (_configuration.__characterPairSupport) {
                // backwards compatibility
                configuration.autoClosingPairs = _configuration.__characterPairSupport.autoClosingPairs;
            }
            if (_configuration.__electricCharacterSupport && _configuration.__electricCharacterSupport.docComment) {
                configuration.__electricCharacterSupport = {
                    docComment: {
                        open: _configuration.__electricCharacterSupport.docComment.open,
                        close: _configuration.__electricCharacterSupport.docComment.close
                    }
                };
            }
            if (this.c.isRegisteredLanguageId(languageId)) {
                this.b.set(handle, this.f.register(languageId, configuration, 100));
            }
        }
        // --- type hierarchy
        $registerTypeHierarchyProvider(handle, selector) {
            this.b.set(handle, typeh.$1I.register(selector, {
                prepareTypeHierarchy: async (document, position, token) => {
                    const items = await this.a.$prepareTypeHierarchy(handle, document.uri, position, token);
                    if (!items) {
                        return undefined;
                    }
                    return {
                        dispose: () => {
                            for (const item of items) {
                                this.a.$releaseTypeHierarchy(handle, item._sessionId);
                            }
                        },
                        roots: items.map($skb_1.u)
                    };
                },
                provideSupertypes: async (item, token) => {
                    const supertypes = await this.a.$provideTypeHierarchySupertypes(handle, item._sessionId, item._itemId, token);
                    if (!supertypes) {
                        return supertypes;
                    }
                    return supertypes.map($skb_1.u);
                },
                provideSubtypes: async (item, token) => {
                    const subtypes = await this.a.$provideTypeHierarchySubtypes(handle, item._sessionId, item._itemId, token);
                    if (!subtypes) {
                        return subtypes;
                    }
                    return subtypes.map($skb_1.u);
                }
            }));
        }
        $registerDocumentOnDropEditProvider(handle, selector, id, metadata) {
            const provider = new MainThreadDocumentOnDropEditProvider(handle, this.a, id, metadata, this.h);
            this.G.set(handle, provider);
            this.b.set(handle, (0, lifecycle_1.$hc)(this.g.documentOnDropEditProvider.register(selector, provider), (0, lifecycle_1.$ic)(() => this.G.delete(handle))));
        }
        async $resolveDocumentOnDropFileData(handle, requestId, dataId) {
            const provider = this.G.get(handle);
            if (!provider) {
                throw new Error('Could not find provider');
            }
            return provider.resolveDocumentOnDropFileData(requestId, dataId);
        }
        // --- mapped edits
        $registerMappedEditsProvider(handle, selector) {
            const provider = new $vkb(handle, this.a, this.h);
            this.b.set(handle, this.g.mappedEditsProvider.register(selector, provider));
        }
    };
    exports.$skb = $skb;
    exports.$skb = $skb = $skb_1 = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadLanguageFeatures),
        __param(1, language_1.$ct),
        __param(2, languageConfigurationRegistry_1.$2t),
        __param(3, languageFeatures_1.$hF),
        __param(4, uriIdentity_1.$Ck)
    ], $skb);
    let MainThreadPasteEditProvider = class MainThreadPasteEditProvider {
        constructor(b, c, id, metadata, f) {
            this.b = b;
            this.c = c;
            this.f = f;
            this.a = new dataTransferCache_1.$rkb();
            this.id = id;
            this.copyMimeTypes = metadata.copyMimeTypes;
            this.pasteMimeTypes = metadata.pasteMimeTypes;
            if (metadata.supportsCopy) {
                this.prepareDocumentPaste = async (model, selections, dataTransfer, token) => {
                    const dataTransferDto = await typeConvert.DataTransfer.from(dataTransfer);
                    if (token.isCancellationRequested) {
                        return undefined;
                    }
                    const newDataTransfer = await this.c.$prepareDocumentPaste(b, model.uri, selections, dataTransferDto, token);
                    if (!newDataTransfer) {
                        return undefined;
                    }
                    const dataTransferOut = new dataTransfer_1.$Rs();
                    for (const [type, item] of newDataTransfer.items) {
                        dataTransferOut.replace(type, (0, dataTransfer_1.$Ps)(item.asString));
                    }
                    return dataTransferOut;
                };
            }
            if (metadata.supportsPaste) {
                this.provideDocumentPasteEdits = async (model, selections, dataTransfer, token) => {
                    const request = this.a.add(dataTransfer);
                    try {
                        const dataTransferDto = await typeConvert.DataTransfer.from(dataTransfer);
                        if (token.isCancellationRequested) {
                            return;
                        }
                        const result = await this.c.$providePasteEdits(this.b, request.id, model.uri, selections, dataTransferDto, token);
                        if (!result) {
                            return;
                        }
                        return {
                            ...result,
                            additionalEdit: result.additionalEdit ? (0, mainThreadBulkEdits_1.$6bb)(result.additionalEdit, this.f, dataId => this.resolveFileData(request.id, dataId)) : undefined,
                        };
                    }
                    finally {
                        request.dispose();
                    }
                };
            }
        }
        resolveFileData(requestId, dataId) {
            return this.a.resolveFileData(requestId, dataId);
        }
    };
    MainThreadPasteEditProvider = __decorate([
        __param(4, uriIdentity_1.$Ck)
    ], MainThreadPasteEditProvider);
    let MainThreadDocumentOnDropEditProvider = class MainThreadDocumentOnDropEditProvider {
        constructor(b, c, id, metadata, f) {
            this.b = b;
            this.c = c;
            this.f = f;
            this.a = new dataTransferCache_1.$rkb();
            this.id = id;
            this.dropMimeTypes = metadata?.dropMimeTypes ?? ['*/*'];
        }
        async provideDocumentOnDropEdits(model, position, dataTransfer, token) {
            const request = this.a.add(dataTransfer);
            try {
                const dataTransferDto = await typeConvert.DataTransfer.from(dataTransfer);
                if (token.isCancellationRequested) {
                    return;
                }
                const edit = await this.c.$provideDocumentOnDropEdits(this.b, request.id, model.uri, position, dataTransferDto, token);
                if (!edit) {
                    return;
                }
                return {
                    ...edit,
                    additionalEdit: (0, mainThreadBulkEdits_1.$6bb)(edit.additionalEdit, this.f, dataId => this.resolveDocumentOnDropFileData(request.id, dataId)),
                };
            }
            finally {
                request.dispose();
            }
        }
        resolveDocumentOnDropFileData(requestId, dataId) {
            return this.a.resolveFileData(requestId, dataId);
        }
    };
    MainThreadDocumentOnDropEditProvider = __decorate([
        __param(4, uriIdentity_1.$Ck)
    ], MainThreadDocumentOnDropEditProvider);
    class $tkb {
        constructor(a, b, c, onDidChange) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.onDidChange = onDidChange;
        }
        releaseDocumentSemanticTokens(resultId) {
            if (resultId) {
                this.a.$releaseDocumentSemanticTokens(this.b, parseInt(resultId, 10));
            }
        }
        getLegend() {
            return this.c;
        }
        async provideDocumentSemanticTokens(model, lastResultId, token) {
            const nLastResultId = lastResultId ? parseInt(lastResultId, 10) : 0;
            const encodedDto = await this.a.$provideDocumentSemanticTokens(this.b, model.uri, nLastResultId, token);
            if (!encodedDto) {
                return null;
            }
            if (token.isCancellationRequested) {
                return null;
            }
            const dto = (0, semanticTokensDto_1.$w0)(encodedDto);
            if (dto.type === 'full') {
                return {
                    resultId: String(dto.id),
                    data: dto.data
                };
            }
            return {
                resultId: String(dto.id),
                edits: dto.deltas
            };
        }
    }
    exports.$tkb = $tkb;
    class $ukb {
        constructor(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
        }
        getLegend() {
            return this.c;
        }
        async provideDocumentRangeSemanticTokens(model, range, token) {
            const encodedDto = await this.a.$provideDocumentRangeSemanticTokens(this.b, model.uri, range, token);
            if (!encodedDto) {
                return null;
            }
            if (token.isCancellationRequested) {
                return null;
            }
            const dto = (0, semanticTokensDto_1.$w0)(encodedDto);
            if (dto.type === 'full') {
                return {
                    resultId: String(dto.id),
                    data: dto.data
                };
            }
            throw new Error(`Unexpected`);
        }
    }
    exports.$ukb = $ukb;
    class $vkb {
        constructor(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
        }
        async provideMappedEdits(document, codeBlocks, context, token) {
            const res = await this.b.$provideMappedEdits(this.a, document.uri, codeBlocks, context, token);
            return res ? (0, mainThreadBulkEdits_1.$6bb)(res, this.c) : null;
        }
    }
    exports.$vkb = $vkb;
});
//# sourceMappingURL=mainThreadLanguageFeatures.js.map