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
    var MainThreadLanguageFeatures_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadMappedEditsProvider = exports.MainThreadDocumentRangeSemanticTokensProvider = exports.MainThreadDocumentSemanticTokensProvider = exports.MainThreadLanguageFeatures = void 0;
    let MainThreadLanguageFeatures = MainThreadLanguageFeatures_1 = class MainThreadLanguageFeatures extends lifecycle_1.Disposable {
        constructor(extHostContext, _languageService, _languageConfigurationService, _languageFeaturesService, _uriIdentService) {
            super();
            this._languageService = _languageService;
            this._languageConfigurationService = _languageConfigurationService;
            this._languageFeaturesService = _languageFeaturesService;
            this._uriIdentService = _uriIdentService;
            this._registrations = this._register(new lifecycle_1.DisposableMap());
            // --- copy paste action provider
            this._pasteEditProviders = new Map();
            // --- document drop Edits
            this._documentOnDropEditProviders = new Map();
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostLanguageFeatures);
            if (this._languageService) {
                const updateAllWordDefinitions = () => {
                    const wordDefinitionDtos = [];
                    for (const languageId of _languageService.getRegisteredLanguageIds()) {
                        const wordDefinition = this._languageConfigurationService.getLanguageConfiguration(languageId).getWordDefinition();
                        wordDefinitionDtos.push({
                            languageId: languageId,
                            regexSource: wordDefinition.source,
                            regexFlags: wordDefinition.flags
                        });
                    }
                    this._proxy.$setWordDefinitions(wordDefinitionDtos);
                };
                this._languageConfigurationService.onDidChange((e) => {
                    if (!e.languageId) {
                        updateAllWordDefinitions();
                    }
                    else {
                        const wordDefinition = this._languageConfigurationService.getLanguageConfiguration(e.languageId).getWordDefinition();
                        this._proxy.$setWordDefinitions([{
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
            this._registrations.deleteAndDispose(handle);
        }
        static _reviveLocationDto(data) {
            if (!data) {
                return data;
            }
            else if (Array.isArray(data)) {
                data.forEach(l => MainThreadLanguageFeatures_1._reviveLocationDto(l));
                return data;
            }
            else {
                data.uri = uri_1.URI.revive(data.uri);
                return data;
            }
        }
        static _reviveLocationLinkDto(data) {
            if (!data) {
                return data;
            }
            else if (Array.isArray(data)) {
                data.forEach(l => MainThreadLanguageFeatures_1._reviveLocationLinkDto(l));
                return data;
            }
            else {
                data.uri = uri_1.URI.revive(data.uri);
                return data;
            }
        }
        static _reviveWorkspaceSymbolDto(data) {
            if (!data) {
                return data;
            }
            else if (Array.isArray(data)) {
                data.forEach(MainThreadLanguageFeatures_1._reviveWorkspaceSymbolDto);
                return data;
            }
            else {
                data.location = MainThreadLanguageFeatures_1._reviveLocationDto(data.location);
                return data;
            }
        }
        static _reviveCodeActionDto(data, uriIdentService) {
            data?.forEach(code => (0, mainThreadBulkEdits_1.reviveWorkspaceEditDto)(code.edit, uriIdentService));
            return data;
        }
        static _reviveLinkDTO(data) {
            if (data.url && typeof data.url !== 'string') {
                data.url = uri_1.URI.revive(data.url);
            }
            return data;
        }
        static _reviveCallHierarchyItemDto(data) {
            if (data) {
                data.uri = uri_1.URI.revive(data.uri);
            }
            return data;
        }
        static _reviveTypeHierarchyItemDto(data) {
            if (data) {
                data.uri = uri_1.URI.revive(data.uri);
            }
            return data;
        }
        //#endregion
        // --- outline
        $registerDocumentSymbolProvider(handle, selector, displayName) {
            this._registrations.set(handle, this._languageFeaturesService.documentSymbolProvider.register(selector, {
                displayName,
                provideDocumentSymbols: (model, token) => {
                    return this._proxy.$provideDocumentSymbols(handle, model.uri, token);
                }
            }));
        }
        // --- code lens
        $registerCodeLensSupport(handle, selector, eventHandle) {
            const provider = {
                provideCodeLenses: async (model, token) => {
                    const listDto = await this._proxy.$provideCodeLenses(handle, model.uri, token);
                    if (!listDto) {
                        return undefined;
                    }
                    return {
                        lenses: listDto.lenses,
                        dispose: () => listDto.cacheId && this._proxy.$releaseCodeLenses(handle, listDto.cacheId)
                    };
                },
                resolveCodeLens: async (model, codeLens, token) => {
                    const result = await this._proxy.$resolveCodeLens(handle, codeLens, token);
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
                const emitter = new event_1.Emitter();
                this._registrations.set(eventHandle, emitter);
                provider.onDidChange = emitter.event;
            }
            this._registrations.set(handle, this._languageFeaturesService.codeLensProvider.register(selector, provider));
        }
        $emitCodeLensEvent(eventHandle, event) {
            const obj = this._registrations.get(eventHandle);
            if (obj instanceof event_1.Emitter) {
                obj.fire(event);
            }
        }
        // --- declaration
        $registerDefinitionSupport(handle, selector) {
            this._registrations.set(handle, this._languageFeaturesService.definitionProvider.register(selector, {
                provideDefinition: (model, position, token) => {
                    return this._proxy.$provideDefinition(handle, model.uri, position, token).then(MainThreadLanguageFeatures_1._reviveLocationLinkDto);
                }
            }));
        }
        $registerDeclarationSupport(handle, selector) {
            this._registrations.set(handle, this._languageFeaturesService.declarationProvider.register(selector, {
                provideDeclaration: (model, position, token) => {
                    return this._proxy.$provideDeclaration(handle, model.uri, position, token).then(MainThreadLanguageFeatures_1._reviveLocationLinkDto);
                }
            }));
        }
        $registerImplementationSupport(handle, selector) {
            this._registrations.set(handle, this._languageFeaturesService.implementationProvider.register(selector, {
                provideImplementation: (model, position, token) => {
                    return this._proxy.$provideImplementation(handle, model.uri, position, token).then(MainThreadLanguageFeatures_1._reviveLocationLinkDto);
                }
            }));
        }
        $registerTypeDefinitionSupport(handle, selector) {
            this._registrations.set(handle, this._languageFeaturesService.typeDefinitionProvider.register(selector, {
                provideTypeDefinition: (model, position, token) => {
                    return this._proxy.$provideTypeDefinition(handle, model.uri, position, token).then(MainThreadLanguageFeatures_1._reviveLocationLinkDto);
                }
            }));
        }
        // --- extra info
        $registerHoverProvider(handle, selector) {
            this._registrations.set(handle, this._languageFeaturesService.hoverProvider.register(selector, {
                provideHover: (model, position, token) => {
                    return this._proxy.$provideHover(handle, model.uri, position, token);
                }
            }));
        }
        // --- debug hover
        $registerEvaluatableExpressionProvider(handle, selector) {
            this._registrations.set(handle, this._languageFeaturesService.evaluatableExpressionProvider.register(selector, {
                provideEvaluatableExpression: (model, position, token) => {
                    return this._proxy.$provideEvaluatableExpression(handle, model.uri, position, token);
                }
            }));
        }
        // --- inline values
        $registerInlineValuesProvider(handle, selector, eventHandle) {
            const provider = {
                provideInlineValues: (model, viewPort, context, token) => {
                    return this._proxy.$provideInlineValues(handle, model.uri, viewPort, context, token);
                }
            };
            if (typeof eventHandle === 'number') {
                const emitter = new event_1.Emitter();
                this._registrations.set(eventHandle, emitter);
                provider.onDidChangeInlineValues = emitter.event;
            }
            this._registrations.set(handle, this._languageFeaturesService.inlineValuesProvider.register(selector, provider));
        }
        $emitInlineValuesEvent(eventHandle, event) {
            const obj = this._registrations.get(eventHandle);
            if (obj instanceof event_1.Emitter) {
                obj.fire(event);
            }
        }
        // --- occurrences
        $registerDocumentHighlightProvider(handle, selector) {
            this._registrations.set(handle, this._languageFeaturesService.documentHighlightProvider.register(selector, {
                provideDocumentHighlights: (model, position, token) => {
                    return this._proxy.$provideDocumentHighlights(handle, model.uri, position, token);
                }
            }));
        }
        // --- linked editing
        $registerLinkedEditingRangeProvider(handle, selector) {
            this._registrations.set(handle, this._languageFeaturesService.linkedEditingRangeProvider.register(selector, {
                provideLinkedEditingRanges: async (model, position, token) => {
                    const res = await this._proxy.$provideLinkedEditingRanges(handle, model.uri, position, token);
                    if (res) {
                        return {
                            ranges: res.ranges,
                            wordPattern: res.wordPattern ? MainThreadLanguageFeatures_1._reviveRegExp(res.wordPattern) : undefined
                        };
                    }
                    return undefined;
                }
            }));
        }
        // --- references
        $registerReferenceSupport(handle, selector) {
            this._registrations.set(handle, this._languageFeaturesService.referenceProvider.register(selector, {
                provideReferences: (model, position, context, token) => {
                    return this._proxy.$provideReferences(handle, model.uri, position, context, token).then(MainThreadLanguageFeatures_1._reviveLocationDto);
                }
            }));
        }
        // --- quick fix
        $registerQuickFixSupport(handle, selector, metadata, displayName, supportsResolve) {
            const provider = {
                provideCodeActions: async (model, rangeOrSelection, context, token) => {
                    const listDto = await this._proxy.$provideCodeActions(handle, model.uri, rangeOrSelection, context, token);
                    if (!listDto) {
                        return undefined;
                    }
                    return {
                        actions: MainThreadLanguageFeatures_1._reviveCodeActionDto(listDto.actions, this._uriIdentService),
                        dispose: () => {
                            if (typeof listDto.cacheId === 'number') {
                                this._proxy.$releaseCodeActions(handle, listDto.cacheId);
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
                    const resolved = await this._proxy.$resolveCodeAction(handle, codeAction.cacheId, token);
                    if (resolved.edit) {
                        codeAction.edit = (0, mainThreadBulkEdits_1.reviveWorkspaceEditDto)(resolved.edit, this._uriIdentService);
                    }
                    if (resolved.command) {
                        codeAction.command = resolved.command;
                    }
                    return codeAction;
                };
            }
            this._registrations.set(handle, this._languageFeaturesService.codeActionProvider.register(selector, provider));
        }
        $registerPasteEditProvider(handle, selector, id, metadata) {
            const provider = new MainThreadPasteEditProvider(handle, this._proxy, id, metadata, this._uriIdentService);
            this._pasteEditProviders.set(handle, provider);
            this._registrations.set(handle, (0, lifecycle_1.combinedDisposable)(this._languageFeaturesService.documentPasteEditProvider.register(selector, provider), (0, lifecycle_1.toDisposable)(() => this._pasteEditProviders.delete(handle))));
        }
        $resolvePasteFileData(handle, requestId, dataId) {
            const provider = this._pasteEditProviders.get(handle);
            if (!provider) {
                throw new Error('Could not find provider');
            }
            return provider.resolveFileData(requestId, dataId);
        }
        // --- formatting
        $registerDocumentFormattingSupport(handle, selector, extensionId, displayName) {
            this._registrations.set(handle, this._languageFeaturesService.documentFormattingEditProvider.register(selector, {
                extensionId,
                displayName,
                provideDocumentFormattingEdits: (model, options, token) => {
                    return this._proxy.$provideDocumentFormattingEdits(handle, model.uri, options, token);
                }
            }));
        }
        $registerRangeFormattingSupport(handle, selector, extensionId, displayName, supportsRanges) {
            this._registrations.set(handle, this._languageFeaturesService.documentRangeFormattingEditProvider.register(selector, {
                extensionId,
                displayName,
                provideDocumentRangeFormattingEdits: (model, range, options, token) => {
                    return this._proxy.$provideDocumentRangeFormattingEdits(handle, model.uri, range, options, token);
                },
                provideDocumentRangesFormattingEdits: !supportsRanges
                    ? undefined
                    : (model, ranges, options, token) => {
                        return this._proxy.$provideDocumentRangesFormattingEdits(handle, model.uri, ranges, options, token);
                    },
            }));
        }
        $registerOnTypeFormattingSupport(handle, selector, autoFormatTriggerCharacters, extensionId) {
            this._registrations.set(handle, this._languageFeaturesService.onTypeFormattingEditProvider.register(selector, {
                extensionId,
                autoFormatTriggerCharacters,
                provideOnTypeFormattingEdits: (model, position, ch, options, token) => {
                    return this._proxy.$provideOnTypeFormattingEdits(handle, model.uri, position, ch, options, token);
                }
            }));
        }
        // --- navigate type
        $registerNavigateTypeSupport(handle, supportsResolve) {
            let lastResultId;
            const provider = {
                provideWorkspaceSymbols: async (search, token) => {
                    const result = await this._proxy.$provideWorkspaceSymbols(handle, search, token);
                    if (lastResultId !== undefined) {
                        this._proxy.$releaseWorkspaceSymbols(handle, lastResultId);
                    }
                    lastResultId = result.cacheId;
                    return MainThreadLanguageFeatures_1._reviveWorkspaceSymbolDto(result.symbols);
                }
            };
            if (supportsResolve) {
                provider.resolveWorkspaceSymbol = async (item, token) => {
                    const resolvedItem = await this._proxy.$resolveWorkspaceSymbol(handle, item, token);
                    return resolvedItem && MainThreadLanguageFeatures_1._reviveWorkspaceSymbolDto(resolvedItem);
                };
            }
            this._registrations.set(handle, search.WorkspaceSymbolProviderRegistry.register(provider));
        }
        // --- rename
        $registerRenameSupport(handle, selector, supportResolveLocation) {
            this._registrations.set(handle, this._languageFeaturesService.renameProvider.register(selector, {
                provideRenameEdits: (model, position, newName, token) => {
                    return this._proxy.$provideRenameEdits(handle, model.uri, position, newName, token).then(data => (0, mainThreadBulkEdits_1.reviveWorkspaceEditDto)(data, this._uriIdentService));
                },
                resolveRenameLocation: supportResolveLocation
                    ? (model, position, token) => this._proxy.$resolveRenameLocation(handle, model.uri, position, token)
                    : undefined
            }));
        }
        // --- semantic tokens
        $registerDocumentSemanticTokensProvider(handle, selector, legend, eventHandle) {
            let event = undefined;
            if (typeof eventHandle === 'number') {
                const emitter = new event_1.Emitter();
                this._registrations.set(eventHandle, emitter);
                event = emitter.event;
            }
            this._registrations.set(handle, this._languageFeaturesService.documentSemanticTokensProvider.register(selector, new MainThreadDocumentSemanticTokensProvider(this._proxy, handle, legend, event)));
        }
        $emitDocumentSemanticTokensEvent(eventHandle) {
            const obj = this._registrations.get(eventHandle);
            if (obj instanceof event_1.Emitter) {
                obj.fire(undefined);
            }
        }
        $registerDocumentRangeSemanticTokensProvider(handle, selector, legend) {
            this._registrations.set(handle, this._languageFeaturesService.documentRangeSemanticTokensProvider.register(selector, new MainThreadDocumentRangeSemanticTokensProvider(this._proxy, handle, legend)));
        }
        // --- suggest
        static _inflateSuggestDto(defaultRange, data, extensionId) {
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
                    const result = await this._proxy.$provideCompletionItems(handle, model.uri, position, context, token);
                    if (!result) {
                        return result;
                    }
                    return {
                        suggestions: result["b" /* ISuggestResultDtoField.completions */].map(d => MainThreadLanguageFeatures_1._inflateSuggestDto(result["a" /* ISuggestResultDtoField.defaultRanges */], d, extensionId)),
                        incomplete: result["c" /* ISuggestResultDtoField.isIncomplete */] || false,
                        duration: result["d" /* ISuggestResultDtoField.duration */],
                        dispose: () => {
                            if (typeof result.x === 'number') {
                                this._proxy.$releaseCompletionItems(handle, result.x);
                            }
                        }
                    };
                }
            };
            if (supportsResolveDetails) {
                provider.resolveCompletionItem = (suggestion, token) => {
                    return this._proxy.$resolveCompletionItem(handle, suggestion._id, token).then(result => {
                        if (!result) {
                            return suggestion;
                        }
                        const newSuggestion = MainThreadLanguageFeatures_1._inflateSuggestDto(suggestion.range, result, extensionId);
                        return (0, objects_1.mixin)(suggestion, newSuggestion, true);
                    });
                };
            }
            this._registrations.set(handle, this._languageFeaturesService.completionProvider.register(selector, provider));
        }
        $registerInlineCompletionsSupport(handle, selector, supportsHandleEvents, extensionId, yieldsToExtensionIds) {
            const provider = {
                provideInlineCompletions: async (model, position, context, token) => {
                    return this._proxy.$provideInlineCompletions(handle, model.uri, position, context, token);
                },
                handleItemDidShow: async (completions, item, updatedInsertText) => {
                    if (supportsHandleEvents) {
                        await this._proxy.$handleInlineCompletionDidShow(handle, completions.pid, item.idx, updatedInsertText);
                    }
                },
                handlePartialAccept: async (completions, item, acceptedCharacters) => {
                    if (supportsHandleEvents) {
                        await this._proxy.$handleInlineCompletionPartialAccept(handle, completions.pid, item.idx, acceptedCharacters);
                    }
                },
                freeInlineCompletions: (completions) => {
                    this._proxy.$freeInlineCompletionsList(handle, completions.pid);
                },
                groupId: extensionId,
                yieldsToGroupIds: yieldsToExtensionIds,
                toString() {
                    return `InlineCompletionsProvider(${extensionId})`;
                }
            };
            this._registrations.set(handle, this._languageFeaturesService.inlineCompletionsProvider.register(selector, provider));
        }
        // --- parameter hints
        $registerSignatureHelpProvider(handle, selector, metadata) {
            this._registrations.set(handle, this._languageFeaturesService.signatureHelpProvider.register(selector, {
                signatureHelpTriggerCharacters: metadata.triggerCharacters,
                signatureHelpRetriggerCharacters: metadata.retriggerCharacters,
                provideSignatureHelp: async (model, position, token, context) => {
                    const result = await this._proxy.$provideSignatureHelp(handle, model.uri, position, context, token);
                    if (!result) {
                        return undefined;
                    }
                    return {
                        value: result,
                        dispose: () => {
                            this._proxy.$releaseSignatureHelp(handle, result.id);
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
                    const result = await this._proxy.$provideInlayHints(handle, model.uri, range, token);
                    if (!result) {
                        return;
                    }
                    return {
                        hints: (0, marshalling_1.revive)(result.hints),
                        dispose: () => {
                            if (result.cacheId) {
                                this._proxy.$releaseInlayHints(handle, result.cacheId);
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
                    const result = await this._proxy.$resolveInlayHint(handle, dto.cacheId, token);
                    if (token.isCancellationRequested) {
                        throw new errors_1.CancellationError();
                    }
                    if (!result) {
                        return hint;
                    }
                    return {
                        ...hint,
                        tooltip: result.tooltip,
                        label: (0, marshalling_1.revive)(result.label)
                    };
                };
            }
            if (typeof eventHandle === 'number') {
                const emitter = new event_1.Emitter();
                this._registrations.set(eventHandle, emitter);
                provider.onDidChangeInlayHints = emitter.event;
            }
            this._registrations.set(handle, this._languageFeaturesService.inlayHintsProvider.register(selector, provider));
        }
        $emitInlayHintsEvent(eventHandle) {
            const obj = this._registrations.get(eventHandle);
            if (obj instanceof event_1.Emitter) {
                obj.fire(undefined);
            }
        }
        // --- links
        $registerDocumentLinkProvider(handle, selector, supportsResolve) {
            const provider = {
                provideLinks: (model, token) => {
                    return this._proxy.$provideDocumentLinks(handle, model.uri, token).then(dto => {
                        if (!dto) {
                            return undefined;
                        }
                        return {
                            links: dto.links.map(MainThreadLanguageFeatures_1._reviveLinkDTO),
                            dispose: () => {
                                if (typeof dto.cacheId === 'number') {
                                    this._proxy.$releaseDocumentLinks(handle, dto.cacheId);
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
                    return this._proxy.$resolveDocumentLink(handle, dto.cacheId, token).then(obj => {
                        return obj && MainThreadLanguageFeatures_1._reviveLinkDTO(obj);
                    });
                };
            }
            this._registrations.set(handle, this._languageFeaturesService.linkProvider.register(selector, provider));
        }
        // --- colors
        $registerDocumentColorProvider(handle, selector) {
            const proxy = this._proxy;
            this._registrations.set(handle, this._languageFeaturesService.colorProvider.register(selector, {
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
                    return this._proxy.$provideFoldingRanges(handle, model.uri, context, token);
                }
            };
            if (typeof eventHandle === 'number') {
                const emitter = new event_1.Emitter();
                this._registrations.set(eventHandle, emitter);
                provider.onDidChange = emitter.event;
            }
            this._registrations.set(handle, this._languageFeaturesService.foldingRangeProvider.register(selector, provider));
        }
        $emitFoldingRangeEvent(eventHandle, event) {
            const obj = this._registrations.get(eventHandle);
            if (obj instanceof event_1.Emitter) {
                obj.fire(event);
            }
        }
        // -- smart select
        $registerSelectionRangeProvider(handle, selector) {
            this._registrations.set(handle, this._languageFeaturesService.selectionRangeProvider.register(selector, {
                provideSelectionRanges: (model, positions, token) => {
                    return this._proxy.$provideSelectionRanges(handle, model.uri, positions, token);
                }
            }));
        }
        // --- call hierarchy
        $registerCallHierarchyProvider(handle, selector) {
            this._registrations.set(handle, callh.CallHierarchyProviderRegistry.register(selector, {
                prepareCallHierarchy: async (document, position, token) => {
                    const items = await this._proxy.$prepareCallHierarchy(handle, document.uri, position, token);
                    if (!items || items.length === 0) {
                        return undefined;
                    }
                    return {
                        dispose: () => {
                            for (const item of items) {
                                this._proxy.$releaseCallHierarchy(handle, item._sessionId);
                            }
                        },
                        roots: items.map(MainThreadLanguageFeatures_1._reviveCallHierarchyItemDto)
                    };
                },
                provideOutgoingCalls: async (item, token) => {
                    const outgoing = await this._proxy.$provideCallHierarchyOutgoingCalls(handle, item._sessionId, item._itemId, token);
                    if (!outgoing) {
                        return outgoing;
                    }
                    outgoing.forEach(value => {
                        value.to = MainThreadLanguageFeatures_1._reviveCallHierarchyItemDto(value.to);
                    });
                    return outgoing;
                },
                provideIncomingCalls: async (item, token) => {
                    const incoming = await this._proxy.$provideCallHierarchyIncomingCalls(handle, item._sessionId, item._itemId, token);
                    if (!incoming) {
                        return incoming;
                    }
                    incoming.forEach(value => {
                        value.from = MainThreadLanguageFeatures_1._reviveCallHierarchyItemDto(value.from);
                    });
                    return incoming;
                }
            }));
        }
        // --- configuration
        static _reviveRegExp(regExp) {
            return new RegExp(regExp.pattern, regExp.flags);
        }
        static _reviveIndentationRule(indentationRule) {
            return {
                decreaseIndentPattern: MainThreadLanguageFeatures_1._reviveRegExp(indentationRule.decreaseIndentPattern),
                increaseIndentPattern: MainThreadLanguageFeatures_1._reviveRegExp(indentationRule.increaseIndentPattern),
                indentNextLinePattern: indentationRule.indentNextLinePattern ? MainThreadLanguageFeatures_1._reviveRegExp(indentationRule.indentNextLinePattern) : undefined,
                unIndentedLinePattern: indentationRule.unIndentedLinePattern ? MainThreadLanguageFeatures_1._reviveRegExp(indentationRule.unIndentedLinePattern) : undefined,
            };
        }
        static _reviveOnEnterRule(onEnterRule) {
            return {
                beforeText: MainThreadLanguageFeatures_1._reviveRegExp(onEnterRule.beforeText),
                afterText: onEnterRule.afterText ? MainThreadLanguageFeatures_1._reviveRegExp(onEnterRule.afterText) : undefined,
                previousLineText: onEnterRule.previousLineText ? MainThreadLanguageFeatures_1._reviveRegExp(onEnterRule.previousLineText) : undefined,
                action: onEnterRule.action
            };
        }
        static _reviveOnEnterRules(onEnterRules) {
            return onEnterRules.map(MainThreadLanguageFeatures_1._reviveOnEnterRule);
        }
        $setLanguageConfiguration(handle, languageId, _configuration) {
            const configuration = {
                comments: _configuration.comments,
                brackets: _configuration.brackets,
                wordPattern: _configuration.wordPattern ? MainThreadLanguageFeatures_1._reviveRegExp(_configuration.wordPattern) : undefined,
                indentationRules: _configuration.indentationRules ? MainThreadLanguageFeatures_1._reviveIndentationRule(_configuration.indentationRules) : undefined,
                onEnterRules: _configuration.onEnterRules ? MainThreadLanguageFeatures_1._reviveOnEnterRules(_configuration.onEnterRules) : undefined,
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
            if (this._languageService.isRegisteredLanguageId(languageId)) {
                this._registrations.set(handle, this._languageConfigurationService.register(languageId, configuration, 100));
            }
        }
        // --- type hierarchy
        $registerTypeHierarchyProvider(handle, selector) {
            this._registrations.set(handle, typeh.TypeHierarchyProviderRegistry.register(selector, {
                prepareTypeHierarchy: async (document, position, token) => {
                    const items = await this._proxy.$prepareTypeHierarchy(handle, document.uri, position, token);
                    if (!items) {
                        return undefined;
                    }
                    return {
                        dispose: () => {
                            for (const item of items) {
                                this._proxy.$releaseTypeHierarchy(handle, item._sessionId);
                            }
                        },
                        roots: items.map(MainThreadLanguageFeatures_1._reviveTypeHierarchyItemDto)
                    };
                },
                provideSupertypes: async (item, token) => {
                    const supertypes = await this._proxy.$provideTypeHierarchySupertypes(handle, item._sessionId, item._itemId, token);
                    if (!supertypes) {
                        return supertypes;
                    }
                    return supertypes.map(MainThreadLanguageFeatures_1._reviveTypeHierarchyItemDto);
                },
                provideSubtypes: async (item, token) => {
                    const subtypes = await this._proxy.$provideTypeHierarchySubtypes(handle, item._sessionId, item._itemId, token);
                    if (!subtypes) {
                        return subtypes;
                    }
                    return subtypes.map(MainThreadLanguageFeatures_1._reviveTypeHierarchyItemDto);
                }
            }));
        }
        $registerDocumentOnDropEditProvider(handle, selector, id, metadata) {
            const provider = new MainThreadDocumentOnDropEditProvider(handle, this._proxy, id, metadata, this._uriIdentService);
            this._documentOnDropEditProviders.set(handle, provider);
            this._registrations.set(handle, (0, lifecycle_1.combinedDisposable)(this._languageFeaturesService.documentOnDropEditProvider.register(selector, provider), (0, lifecycle_1.toDisposable)(() => this._documentOnDropEditProviders.delete(handle))));
        }
        async $resolveDocumentOnDropFileData(handle, requestId, dataId) {
            const provider = this._documentOnDropEditProviders.get(handle);
            if (!provider) {
                throw new Error('Could not find provider');
            }
            return provider.resolveDocumentOnDropFileData(requestId, dataId);
        }
        // --- mapped edits
        $registerMappedEditsProvider(handle, selector) {
            const provider = new MainThreadMappedEditsProvider(handle, this._proxy, this._uriIdentService);
            this._registrations.set(handle, this._languageFeaturesService.mappedEditsProvider.register(selector, provider));
        }
    };
    exports.MainThreadLanguageFeatures = MainThreadLanguageFeatures;
    exports.MainThreadLanguageFeatures = MainThreadLanguageFeatures = MainThreadLanguageFeatures_1 = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadLanguageFeatures),
        __param(1, language_1.ILanguageService),
        __param(2, languageConfigurationRegistry_1.ILanguageConfigurationService),
        __param(3, languageFeatures_1.ILanguageFeaturesService),
        __param(4, uriIdentity_1.IUriIdentityService)
    ], MainThreadLanguageFeatures);
    let MainThreadPasteEditProvider = class MainThreadPasteEditProvider {
        constructor(_handle, _proxy, id, metadata, _uriIdentService) {
            this._handle = _handle;
            this._proxy = _proxy;
            this._uriIdentService = _uriIdentService;
            this.dataTransfers = new dataTransferCache_1.DataTransferFileCache();
            this.id = id;
            this.copyMimeTypes = metadata.copyMimeTypes;
            this.pasteMimeTypes = metadata.pasteMimeTypes;
            if (metadata.supportsCopy) {
                this.prepareDocumentPaste = async (model, selections, dataTransfer, token) => {
                    const dataTransferDto = await typeConvert.DataTransfer.from(dataTransfer);
                    if (token.isCancellationRequested) {
                        return undefined;
                    }
                    const newDataTransfer = await this._proxy.$prepareDocumentPaste(_handle, model.uri, selections, dataTransferDto, token);
                    if (!newDataTransfer) {
                        return undefined;
                    }
                    const dataTransferOut = new dataTransfer_1.VSDataTransfer();
                    for (const [type, item] of newDataTransfer.items) {
                        dataTransferOut.replace(type, (0, dataTransfer_1.createStringDataTransferItem)(item.asString));
                    }
                    return dataTransferOut;
                };
            }
            if (metadata.supportsPaste) {
                this.provideDocumentPasteEdits = async (model, selections, dataTransfer, token) => {
                    const request = this.dataTransfers.add(dataTransfer);
                    try {
                        const dataTransferDto = await typeConvert.DataTransfer.from(dataTransfer);
                        if (token.isCancellationRequested) {
                            return;
                        }
                        const result = await this._proxy.$providePasteEdits(this._handle, request.id, model.uri, selections, dataTransferDto, token);
                        if (!result) {
                            return;
                        }
                        return {
                            ...result,
                            additionalEdit: result.additionalEdit ? (0, mainThreadBulkEdits_1.reviveWorkspaceEditDto)(result.additionalEdit, this._uriIdentService, dataId => this.resolveFileData(request.id, dataId)) : undefined,
                        };
                    }
                    finally {
                        request.dispose();
                    }
                };
            }
        }
        resolveFileData(requestId, dataId) {
            return this.dataTransfers.resolveFileData(requestId, dataId);
        }
    };
    MainThreadPasteEditProvider = __decorate([
        __param(4, uriIdentity_1.IUriIdentityService)
    ], MainThreadPasteEditProvider);
    let MainThreadDocumentOnDropEditProvider = class MainThreadDocumentOnDropEditProvider {
        constructor(_handle, _proxy, id, metadata, _uriIdentService) {
            this._handle = _handle;
            this._proxy = _proxy;
            this._uriIdentService = _uriIdentService;
            this.dataTransfers = new dataTransferCache_1.DataTransferFileCache();
            this.id = id;
            this.dropMimeTypes = metadata?.dropMimeTypes ?? ['*/*'];
        }
        async provideDocumentOnDropEdits(model, position, dataTransfer, token) {
            const request = this.dataTransfers.add(dataTransfer);
            try {
                const dataTransferDto = await typeConvert.DataTransfer.from(dataTransfer);
                if (token.isCancellationRequested) {
                    return;
                }
                const edit = await this._proxy.$provideDocumentOnDropEdits(this._handle, request.id, model.uri, position, dataTransferDto, token);
                if (!edit) {
                    return;
                }
                return {
                    ...edit,
                    additionalEdit: (0, mainThreadBulkEdits_1.reviveWorkspaceEditDto)(edit.additionalEdit, this._uriIdentService, dataId => this.resolveDocumentOnDropFileData(request.id, dataId)),
                };
            }
            finally {
                request.dispose();
            }
        }
        resolveDocumentOnDropFileData(requestId, dataId) {
            return this.dataTransfers.resolveFileData(requestId, dataId);
        }
    };
    MainThreadDocumentOnDropEditProvider = __decorate([
        __param(4, uriIdentity_1.IUriIdentityService)
    ], MainThreadDocumentOnDropEditProvider);
    class MainThreadDocumentSemanticTokensProvider {
        constructor(_proxy, _handle, _legend, onDidChange) {
            this._proxy = _proxy;
            this._handle = _handle;
            this._legend = _legend;
            this.onDidChange = onDidChange;
        }
        releaseDocumentSemanticTokens(resultId) {
            if (resultId) {
                this._proxy.$releaseDocumentSemanticTokens(this._handle, parseInt(resultId, 10));
            }
        }
        getLegend() {
            return this._legend;
        }
        async provideDocumentSemanticTokens(model, lastResultId, token) {
            const nLastResultId = lastResultId ? parseInt(lastResultId, 10) : 0;
            const encodedDto = await this._proxy.$provideDocumentSemanticTokens(this._handle, model.uri, nLastResultId, token);
            if (!encodedDto) {
                return null;
            }
            if (token.isCancellationRequested) {
                return null;
            }
            const dto = (0, semanticTokensDto_1.decodeSemanticTokensDto)(encodedDto);
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
    exports.MainThreadDocumentSemanticTokensProvider = MainThreadDocumentSemanticTokensProvider;
    class MainThreadDocumentRangeSemanticTokensProvider {
        constructor(_proxy, _handle, _legend) {
            this._proxy = _proxy;
            this._handle = _handle;
            this._legend = _legend;
        }
        getLegend() {
            return this._legend;
        }
        async provideDocumentRangeSemanticTokens(model, range, token) {
            const encodedDto = await this._proxy.$provideDocumentRangeSemanticTokens(this._handle, model.uri, range, token);
            if (!encodedDto) {
                return null;
            }
            if (token.isCancellationRequested) {
                return null;
            }
            const dto = (0, semanticTokensDto_1.decodeSemanticTokensDto)(encodedDto);
            if (dto.type === 'full') {
                return {
                    resultId: String(dto.id),
                    data: dto.data
                };
            }
            throw new Error(`Unexpected`);
        }
    }
    exports.MainThreadDocumentRangeSemanticTokensProvider = MainThreadDocumentRangeSemanticTokensProvider;
    class MainThreadMappedEditsProvider {
        constructor(_handle, _proxy, _uriService) {
            this._handle = _handle;
            this._proxy = _proxy;
            this._uriService = _uriService;
        }
        async provideMappedEdits(document, codeBlocks, context, token) {
            const res = await this._proxy.$provideMappedEdits(this._handle, document.uri, codeBlocks, context, token);
            return res ? (0, mainThreadBulkEdits_1.reviveWorkspaceEditDto)(res, this._uriService) : null;
        }
    }
    exports.MainThreadMappedEditsProvider = MainThreadMappedEditsProvider;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZExhbmd1YWdlRmVhdHVyZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2Jyb3dzZXIvbWFpblRocmVhZExhbmd1YWdlRmVhdHVyZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQWtDekYsSUFBTSwwQkFBMEIsa0NBQWhDLE1BQU0sMEJBQTJCLFNBQVEsc0JBQVU7UUFLekQsWUFDQyxjQUErQixFQUNiLGdCQUFtRCxFQUN0Qyw2QkFBNkUsRUFDbEYsd0JBQW1FLEVBQ3hFLGdCQUFzRDtZQUUzRSxLQUFLLEVBQUUsQ0FBQztZQUwyQixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1lBQ3JCLGtDQUE2QixHQUE3Qiw2QkFBNkIsQ0FBK0I7WUFDakUsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUEwQjtZQUN2RCxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQXFCO1lBUDNELG1CQUFjLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLHlCQUFhLEVBQVUsQ0FBQyxDQUFDO1lBMFU5RSxpQ0FBaUM7WUFFaEIsd0JBQW1CLEdBQUcsSUFBSSxHQUFHLEVBQXVDLENBQUM7WUE2aEJ0RiwwQkFBMEI7WUFFVCxpQ0FBNEIsR0FBRyxJQUFJLEdBQUcsRUFBZ0QsQ0FBQztZQWgyQnZHLElBQUksQ0FBQyxNQUFNLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxpQ0FBYyxDQUFDLHVCQUF1QixDQUFDLENBQUM7WUFFOUUsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQzFCLE1BQU0sd0JBQXdCLEdBQUcsR0FBRyxFQUFFO29CQUNyQyxNQUFNLGtCQUFrQixHQUFpQyxFQUFFLENBQUM7b0JBQzVELEtBQUssTUFBTSxVQUFVLElBQUksZ0JBQWdCLENBQUMsd0JBQXdCLEVBQUUsRUFBRTt3QkFDckUsTUFBTSxj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