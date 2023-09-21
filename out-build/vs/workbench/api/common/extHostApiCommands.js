/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/network", "vs/base/common/uri", "vs/editor/common/languages", "vs/editor/common/services/semanticTokensDto", "vs/platform/contextkey/common/contextkey", "vs/platform/opener/common/opener", "vs/workbench/api/common/extHostCommands", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes"], function (require, exports, arrays_1, network_1, uri_1, languages, semanticTokensDto_1, contextkey_1, opener_1, extHostCommands_1, typeConverters, types) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$dbc = void 0;
    //#region --- NEW world
    const newCommands = [
        // -- document highlights
        new extHostCommands_1.$pM('vscode.executeDocumentHighlights', '_executeDocumentHighlights', 'Execute document highlight provider.', [extHostCommands_1.$nM.Uri, extHostCommands_1.$nM.Position], new extHostCommands_1.$oM('A promise that resolves to an array of DocumentHighlight-instances.', tryMapWith(typeConverters.DocumentHighlight.to))),
        // -- document symbols
        new extHostCommands_1.$pM('vscode.executeDocumentSymbolProvider', '_executeDocumentSymbolProvider', 'Execute document symbol provider.', [extHostCommands_1.$nM.Uri], new extHostCommands_1.$oM('A promise that resolves to an array of SymbolInformation and DocumentSymbol instances.', (value, apiArgs) => {
            if ((0, arrays_1.$Ib)(value)) {
                return undefined;
            }
            class MergedInfo extends types.$hK {
                static to(symbol) {
                    const res = new MergedInfo(symbol.name, typeConverters.SymbolKind.to(symbol.kind), symbol.containerName || '', new types.$cK(apiArgs[0], typeConverters.Range.to(symbol.range)));
                    res.detail = symbol.detail;
                    res.range = res.location.range;
                    res.selectionRange = typeConverters.Range.to(symbol.selectionRange);
                    res.children = symbol.children ? symbol.children.map(MergedInfo.to) : [];
                    return res;
                }
            }
            return value.map(MergedInfo.to);
        })),
        // -- formatting
        new extHostCommands_1.$pM('vscode.executeFormatDocumentProvider', '_executeFormatDocumentProvider', 'Execute document format provider.', [extHostCommands_1.$nM.Uri, new extHostCommands_1.$nM('options', 'Formatting options', _ => true, v => v)], new extHostCommands_1.$oM('A promise that resolves to an array of TextEdits.', tryMapWith(typeConverters.TextEdit.to))),
        new extHostCommands_1.$pM('vscode.executeFormatRangeProvider', '_executeFormatRangeProvider', 'Execute range format provider.', [extHostCommands_1.$nM.Uri, extHostCommands_1.$nM.Range, new extHostCommands_1.$nM('options', 'Formatting options', _ => true, v => v)], new extHostCommands_1.$oM('A promise that resolves to an array of TextEdits.', tryMapWith(typeConverters.TextEdit.to))),
        new extHostCommands_1.$pM('vscode.executeFormatOnTypeProvider', '_executeFormatOnTypeProvider', 'Execute format on type provider.', [extHostCommands_1.$nM.Uri, extHostCommands_1.$nM.Position, new extHostCommands_1.$nM('ch', 'Trigger character', v => typeof v === 'string', v => v), new extHostCommands_1.$nM('options', 'Formatting options', _ => true, v => v)], new extHostCommands_1.$oM('A promise that resolves to an array of TextEdits.', tryMapWith(typeConverters.TextEdit.to))),
        // -- go to symbol (definition, type definition, declaration, impl, references)
        new extHostCommands_1.$pM('vscode.executeDefinitionProvider', '_executeDefinitionProvider', 'Execute all definition providers.', [extHostCommands_1.$nM.Uri, extHostCommands_1.$nM.Position], new extHostCommands_1.$oM('A promise that resolves to an array of Location or LocationLink instances.', mapLocationOrLocationLink)),
        new extHostCommands_1.$pM('vscode.executeTypeDefinitionProvider', '_executeTypeDefinitionProvider', 'Execute all type definition providers.', [extHostCommands_1.$nM.Uri, extHostCommands_1.$nM.Position], new extHostCommands_1.$oM('A promise that resolves to an array of Location or LocationLink instances.', mapLocationOrLocationLink)),
        new extHostCommands_1.$pM('vscode.executeDeclarationProvider', '_executeDeclarationProvider', 'Execute all declaration providers.', [extHostCommands_1.$nM.Uri, extHostCommands_1.$nM.Position], new extHostCommands_1.$oM('A promise that resolves to an array of Location or LocationLink instances.', mapLocationOrLocationLink)),
        new extHostCommands_1.$pM('vscode.executeImplementationProvider', '_executeImplementationProvider', 'Execute all implementation providers.', [extHostCommands_1.$nM.Uri, extHostCommands_1.$nM.Position], new extHostCommands_1.$oM('A promise that resolves to an array of Location or LocationLink instances.', mapLocationOrLocationLink)),
        new extHostCommands_1.$pM('vscode.executeReferenceProvider', '_executeReferenceProvider', 'Execute all reference providers.', [extHostCommands_1.$nM.Uri, extHostCommands_1.$nM.Position], new extHostCommands_1.$oM('A promise that resolves to an array of Location-instances.', tryMapWith(typeConverters.location.to))),
        // -- hover
        new extHostCommands_1.$pM('vscode.executeHoverProvider', '_executeHoverProvider', 'Execute all hover providers.', [extHostCommands_1.$nM.Uri, extHostCommands_1.$nM.Position], new extHostCommands_1.$oM('A promise that resolves to an array of Hover-instances.', tryMapWith(typeConverters.Hover.to))),
        // -- selection range
        new extHostCommands_1.$pM('vscode.executeSelectionRangeProvider', '_executeSelectionRangeProvider', 'Execute selection range provider.', [extHostCommands_1.$nM.Uri, new extHostCommands_1.$nM('position', 'A position in a text document', v => Array.isArray(v) && v.every(v => types.$4J.isPosition(v)), v => v.map(typeConverters.Position.from))], new extHostCommands_1.$oM('A promise that resolves to an array of ranges.', result => {
            return result.map(ranges => {
                let node;
                for (const range of ranges.reverse()) {
                    node = new types.$lK(typeConverters.Range.to(range), node);
                }
                return node;
            });
        })),
        // -- symbol search
        new extHostCommands_1.$pM('vscode.executeWorkspaceSymbolProvider', '_executeWorkspaceSymbolProvider', 'Execute all workspace symbol providers.', [extHostCommands_1.$nM.String.with('query', 'Search string')], new extHostCommands_1.$oM('A promise that resolves to an array of SymbolInformation-instances.', value => {
            return value.map(typeConverters.WorkspaceSymbol.to);
        })),
        // --- call hierarchy
        new extHostCommands_1.$pM('vscode.prepareCallHierarchy', '_executePrepareCallHierarchy', 'Prepare call hierarchy at a position inside a document', [extHostCommands_1.$nM.Uri, extHostCommands_1.$nM.Position], new extHostCommands_1.$oM('A promise that resolves to an array of CallHierarchyItem-instances', v => v.map(typeConverters.CallHierarchyItem.to))),
        new extHostCommands_1.$pM('vscode.provideIncomingCalls', '_executeProvideIncomingCalls', 'Compute incoming calls for an item', [extHostCommands_1.$nM.CallHierarchyItem], new extHostCommands_1.$oM('A promise that resolves to an array of CallHierarchyIncomingCall-instances', v => v.map(typeConverters.CallHierarchyIncomingCall.to))),
        new extHostCommands_1.$pM('vscode.provideOutgoingCalls', '_executeProvideOutgoingCalls', 'Compute outgoing calls for an item', [extHostCommands_1.$nM.CallHierarchyItem], new extHostCommands_1.$oM('A promise that resolves to an array of CallHierarchyOutgoingCall-instances', v => v.map(typeConverters.CallHierarchyOutgoingCall.to))),
        // --- rename
        new extHostCommands_1.$pM('vscode.prepareRename', '_executePrepareRename', 'Execute the prepareRename of rename provider.', [extHostCommands_1.$nM.Uri, extHostCommands_1.$nM.Position], new extHostCommands_1.$oM('A promise that resolves to a range and placeholder text.', value => {
            if (!value) {
                return undefined;
            }
            return {
                range: typeConverters.Range.to(value.range),
                placeholder: value.text
            };
        })),
        new extHostCommands_1.$pM('vscode.executeDocumentRenameProvider', '_executeDocumentRenameProvider', 'Execute rename provider.', [extHostCommands_1.$nM.Uri, extHostCommands_1.$nM.Position, extHostCommands_1.$nM.String.with('newName', 'The new symbol name')], new extHostCommands_1.$oM('A promise that resolves to a WorkspaceEdit.', value => {
            if (!value) {
                return undefined;
            }
            if (value.rejectReason) {
                throw new Error(value.rejectReason);
            }
            return typeConverters.WorkspaceEdit.to(value);
        })),
        // --- links
        new extHostCommands_1.$pM('vscode.executeLinkProvider', '_executeLinkProvider', 'Execute document link provider.', [extHostCommands_1.$nM.Uri, extHostCommands_1.$nM.Number.with('linkResolveCount', 'Number of links that should be resolved, only when links are unresolved.').optional()], new extHostCommands_1.$oM('A promise that resolves to an array of DocumentLink-instances.', value => value.map(typeConverters.DocumentLink.to))),
        // --- semantic tokens
        new extHostCommands_1.$pM('vscode.provideDocumentSemanticTokensLegend', '_provideDocumentSemanticTokensLegend', 'Provide semantic tokens legend for a document', [extHostCommands_1.$nM.Uri], new extHostCommands_1.$oM('A promise that resolves to SemanticTokensLegend.', value => {
            if (!value) {
                return undefined;
            }
            return new types.$fL(value.tokenTypes, value.tokenModifiers);
        })),
        new extHostCommands_1.$pM('vscode.provideDocumentSemanticTokens', '_provideDocumentSemanticTokens', 'Provide semantic tokens for a document', [extHostCommands_1.$nM.Uri], new extHostCommands_1.$oM('A promise that resolves to SemanticTokens.', value => {
            if (!value) {
                return undefined;
            }
            const semanticTokensDto = (0, semanticTokensDto_1.$w0)(value);
            if (semanticTokensDto.type !== 'full') {
                // only accepting full semantic tokens from provideDocumentSemanticTokens
                return undefined;
            }
            return new types.$hL(semanticTokensDto.data, undefined);
        })),
        new extHostCommands_1.$pM('vscode.provideDocumentRangeSemanticTokensLegend', '_provideDocumentRangeSemanticTokensLegend', 'Provide semantic tokens legend for a document range', [extHostCommands_1.$nM.Uri, extHostCommands_1.$nM.Range.optional()], new extHostCommands_1.$oM('A promise that resolves to SemanticTokensLegend.', value => {
            if (!value) {
                return undefined;
            }
            return new types.$fL(value.tokenTypes, value.tokenModifiers);
        })),
        new extHostCommands_1.$pM('vscode.provideDocumentRangeSemanticTokens', '_provideDocumentRangeSemanticTokens', 'Provide semantic tokens for a document range', [extHostCommands_1.$nM.Uri, extHostCommands_1.$nM.Range], new extHostCommands_1.$oM('A promise that resolves to SemanticTokens.', value => {
            if (!value) {
                return undefined;
            }
            const semanticTokensDto = (0, semanticTokensDto_1.$w0)(value);
            if (semanticTokensDto.type !== 'full') {
                // only accepting full semantic tokens from provideDocumentRangeSemanticTokens
                return undefined;
            }
            return new types.$hL(semanticTokensDto.data, undefined);
        })),
        // --- completions
        new extHostCommands_1.$pM('vscode.executeCompletionItemProvider', '_executeCompletionItemProvider', 'Execute completion item provider.', [
            extHostCommands_1.$nM.Uri,
            extHostCommands_1.$nM.Position,
            extHostCommands_1.$nM.String.with('triggerCharacter', 'Trigger completion when the user types the character, like `,` or `(`').optional(),
            extHostCommands_1.$nM.Number.with('itemResolveCount', 'Number of completions to resolve (too large numbers slow down completions)').optional()
        ], new extHostCommands_1.$oM('A promise that resolves to a CompletionList-instance.', (value, _args, converter) => {
            if (!value) {
                return new types.$xK([]);
            }
            const items = value.suggestions.map(suggestion => typeConverters.CompletionItem.to(suggestion, converter));
            return new types.$xK(items, value.incomplete);
        })),
        // --- signature help
        new extHostCommands_1.$pM('vscode.executeSignatureHelpProvider', '_executeSignatureHelpProvider', 'Execute signature help provider.', [extHostCommands_1.$nM.Uri, extHostCommands_1.$nM.Position, extHostCommands_1.$nM.String.with('triggerCharacter', 'Trigger signature help when the user types the character, like `,` or `(`').optional()], new extHostCommands_1.$oM('A promise that resolves to SignatureHelp.', value => {
            if (value) {
                return typeConverters.SignatureHelp.to(value);
            }
            return undefined;
        })),
        // --- code lens
        new extHostCommands_1.$pM('vscode.executeCodeLensProvider', '_executeCodeLensProvider', 'Execute code lens provider.', [extHostCommands_1.$nM.Uri, extHostCommands_1.$nM.Number.with('itemResolveCount', 'Number of lenses that should be resolved and returned. Will only return resolved lenses, will impact performance)').optional()], new extHostCommands_1.$oM('A promise that resolves to an array of CodeLens-instances.', (value, _args, converter) => {
            return tryMapWith(item => {
                return new types.$pK(typeConverters.Range.to(item.range), item.command && converter.fromInternal(item.command));
            })(value);
        })),
        // --- code actions
        new extHostCommands_1.$pM('vscode.executeCodeActionProvider', '_executeCodeActionProvider', 'Execute code action provider.', [
            extHostCommands_1.$nM.Uri,
            new extHostCommands_1.$nM('rangeOrSelection', 'Range in a text document. Some refactoring provider requires Selection object.', v => types.$5J.isRange(v), v => types.$6J.isSelection(v) ? typeConverters.Selection.from(v) : typeConverters.Range.from(v)),
            extHostCommands_1.$nM.String.with('kind', 'Code action kind to return code actions for').optional(),
            extHostCommands_1.$nM.Number.with('itemResolveCount', 'Number of code actions to resolve (too large numbers slow down code actions)').optional()
        ], new extHostCommands_1.$oM('A promise that resolves to an array of Command-instances.', (value, _args, converter) => {
            return tryMapWith((codeAction) => {
                if (codeAction._isSynthetic) {
                    if (!codeAction.command) {
                        throw new Error('Synthetic code actions must have a command');
                    }
                    return converter.fromInternal(codeAction.command);
                }
                else {
                    const ret = new types.$jK(codeAction.title, codeAction.kind ? new types.$kK(codeAction.kind) : undefined);
                    if (codeAction.edit) {
                        ret.edit = typeConverters.WorkspaceEdit.to(codeAction.edit);
                    }
                    if (codeAction.command) {
                        ret.command = converter.fromInternal(codeAction.command);
                    }
                    ret.isPreferred = codeAction.isPreferred;
                    return ret;
                }
            })(value);
        })),
        // --- colors
        new extHostCommands_1.$pM('vscode.executeDocumentColorProvider', '_executeDocumentColorProvider', 'Execute document color provider.', [extHostCommands_1.$nM.Uri], new extHostCommands_1.$oM('A promise that resolves to an array of ColorInformation objects.', result => {
            if (result) {
                return result.map(ci => new types.$DK(typeConverters.Range.to(ci.range), typeConverters.Color.to(ci.color)));
            }
            return [];
        })),
        new extHostCommands_1.$pM('vscode.executeColorPresentationProvider', '_executeColorPresentationProvider', 'Execute color presentation provider.', [
            new extHostCommands_1.$nM('color', 'The color to show and insert', v => v instanceof types.$CK, typeConverters.Color.from),
            new extHostCommands_1.$nM('context', 'Context object with uri and range', _v => true, v => ({ uri: v.uri, range: typeConverters.Range.from(v.range) })),
        ], new extHostCommands_1.$oM('A promise that resolves to an array of ColorPresentation objects.', result => {
            if (result) {
                return result.map(typeConverters.ColorPresentation.to);
            }
            return [];
        })),
        // --- inline hints
        new extHostCommands_1.$pM('vscode.executeInlayHintProvider', '_executeInlayHintProvider', 'Execute inlay hints provider', [extHostCommands_1.$nM.Uri, extHostCommands_1.$nM.Range], new extHostCommands_1.$oM('A promise that resolves to an array of Inlay objects', (result, args, converter) => {
            return result.map(typeConverters.InlayHint.to.bind(undefined, converter));
        })),
        // --- folding
        new extHostCommands_1.$pM('vscode.executeFoldingRangeProvider', '_executeFoldingRangeProvider', 'Execute folding range provider', [extHostCommands_1.$nM.Uri], new extHostCommands_1.$oM('A promise that resolves to an array of FoldingRange objects', (result, args) => {
            if (result) {
                return result.map(typeConverters.FoldingRange.to);
            }
            return undefined;
        })),
        // --- notebooks
        new extHostCommands_1.$pM('vscode.resolveNotebookContentProviders', '_resolveNotebookContentProvider', 'Resolve Notebook Content Providers', [
        // new ApiCommandArgument<string, string>('viewType', '', v => typeof v === 'string', v => v),
        // new ApiCommandArgument<string, string>('displayName', '', v => typeof v === 'string', v => v),
        // new ApiCommandArgument<object, object>('options', '', v => typeof v === 'object', v => v),
        ], new extHostCommands_1.$oM('A promise that resolves to an array of NotebookContentProvider static info objects.', tryMapWith(item => {
            return {
                viewType: item.viewType,
                displayName: item.displayName,
                options: {
                    transientOutputs: item.options.transientOutputs,
                    transientCellMetadata: item.options.transientCellMetadata,
                    transientDocumentMetadata: item.options.transientDocumentMetadata
                },
                filenamePattern: item.filenamePattern.map(pattern => typeConverters.NotebookExclusiveDocumentPattern.to(pattern))
            };
        }))),
        // --- debug support
        new extHostCommands_1.$pM('vscode.executeInlineValueProvider', '_executeInlineValueProvider', 'Execute inline value provider', [
            extHostCommands_1.$nM.Uri,
            extHostCommands_1.$nM.Range,
            new extHostCommands_1.$nM('context', 'An InlineValueContext', v => v && typeof v.frameId === 'number' && v.stoppedLocation instanceof types.$5J, v => typeConverters.InlineValueContext.from(v))
        ], new extHostCommands_1.$oM('A promise that resolves to an array of InlineValue objects', result => {
            return result.map(typeConverters.InlineValue.to);
        })),
        // --- open'ish commands
        new extHostCommands_1.$pM('vscode.open', '_workbench.open', 'Opens the provided resource in the editor. Can be a text or binary file, or an http(s) URL. If you need more control over the options for opening a text file, use vscode.window.showTextDocument instead.', [
            new extHostCommands_1.$nM('uriOrString', 'Uri-instance or string (only http/https)', v => uri_1.URI.isUri(v) || (typeof v === 'string' && (0, opener_1.$PT)(v, network_1.Schemas.http, network_1.Schemas.https)), v => v),
            new extHostCommands_1.$nM('columnOrOptions', 'Either the column in which to open or editor options, see vscode.TextDocumentShowOptions', v => v === undefined || typeof v === 'number' || typeof v === 'object', v => !v ? v : typeof v === 'number' ? [typeConverters.ViewColumn.from(v), undefined] : [typeConverters.ViewColumn.from(v.viewColumn), typeConverters.TextEditorOpenOptions.from(v)]).optional(),
            extHostCommands_1.$nM.String.with('label', '').optional()
        ], extHostCommands_1.$oM.Void),
        new extHostCommands_1.$pM('vscode.openWith', '_workbench.openWith', 'Opens the provided resource with a specific editor.', [
            extHostCommands_1.$nM.Uri.with('resource', 'Resource to open'),
            extHostCommands_1.$nM.String.with('viewId', 'Custom editor view id or \'default\' to use VS Code\'s default editor'),
            new extHostCommands_1.$nM('columnOrOptions', 'Either the column in which to open or editor options, see vscode.TextDocumentShowOptions', v => v === undefined || typeof v === 'number' || typeof v === 'object', v => !v ? v : typeof v === 'number' ? [typeConverters.ViewColumn.from(v), undefined] : [typeConverters.ViewColumn.from(v.viewColumn), typeConverters.TextEditorOpenOptions.from(v)]).optional()
        ], extHostCommands_1.$oM.Void),
        new extHostCommands_1.$pM('vscode.diff', '_workbench.diff', 'Opens the provided resources in the diff editor to compare their contents.', [
            extHostCommands_1.$nM.Uri.with('left', 'Left-hand side resource of the diff editor'),
            extHostCommands_1.$nM.Uri.with('right', 'Right-hand side resource of the diff editor'),
            extHostCommands_1.$nM.String.with('title', 'Human readable title for the diff editor').optional(),
            new extHostCommands_1.$nM('columnOrOptions', 'Either the column in which to open or editor options, see vscode.TextDocumentShowOptions', v => v === undefined || typeof v === 'object', v => v && [typeConverters.ViewColumn.from(v.viewColumn), typeConverters.TextEditorOpenOptions.from(v)]).optional(),
        ], extHostCommands_1.$oM.Void),
        // --- type hierarchy
        new extHostCommands_1.$pM('vscode.prepareTypeHierarchy', '_executePrepareTypeHierarchy', 'Prepare type hierarchy at a position inside a document', [extHostCommands_1.$nM.Uri, extHostCommands_1.$nM.Position], new extHostCommands_1.$oM('A promise that resolves to an array of TypeHierarchyItem-instances', v => v.map(typeConverters.TypeHierarchyItem.to))),
        new extHostCommands_1.$pM('vscode.provideSupertypes', '_executeProvideSupertypes', 'Compute supertypes for an item', [extHostCommands_1.$nM.TypeHierarchyItem], new extHostCommands_1.$oM('A promise that resolves to an array of TypeHierarchyItem-instances', v => v.map(typeConverters.TypeHierarchyItem.to))),
        new extHostCommands_1.$pM('vscode.provideSubtypes', '_executeProvideSubtypes', 'Compute subtypes for an item', [extHostCommands_1.$nM.TypeHierarchyItem], new extHostCommands_1.$oM('A promise that resolves to an array of TypeHierarchyItem-instances', v => v.map(typeConverters.TypeHierarchyItem.to))),
        // --- testing
        new extHostCommands_1.$pM('vscode.revealTestInExplorer', '_revealTestInExplorer', 'Reveals a test instance in the explorer', [extHostCommands_1.$nM.TestItem], extHostCommands_1.$oM.Void),
        // --- continue edit session
        new extHostCommands_1.$pM('vscode.experimental.editSession.continue', '_workbench.editSessions.actions.continueEditSession', 'Continue the current edit session in a different workspace', [extHostCommands_1.$nM.Uri.with('workspaceUri', 'The target workspace to continue the current edit session in')], extHostCommands_1.$oM.Void),
        // --- context keys
        new extHostCommands_1.$pM('setContext', '_setContext', 'Set a custom context key value that can be used in when clauses.', [
            extHostCommands_1.$nM.String.with('name', 'The context key name'),
            new extHostCommands_1.$nM('value', 'The context key value', () => true, v => v),
        ], extHostCommands_1.$oM.Void),
        // --- mapped edits
        new extHostCommands_1.$pM('vscode.executeMappedEditsProvider', '_executeMappedEditsProvider', 'Execute Mapped Edits Provider', [
            extHostCommands_1.$nM.Uri,
            extHostCommands_1.$nM.StringArray,
            new extHostCommands_1.$nM('MappedEditsContext', 'Mapped Edits Context', (v) => typeConverters.MappedEditsContext.is(v), (v) => typeConverters.MappedEditsContext.from(v))
        ], new extHostCommands_1.$oM('A promise that resolves to a workspace edit or null', (value) => {
            return value ? typeConverters.WorkspaceEdit.to(value) : null;
        })),
    ];
    //#endregion
    //#region OLD world
    class $dbc {
        static register(commands) {
            newCommands.forEach(commands.registerApiCommand, commands);
            this.a(commands);
        }
        static a(commands) {
            commands.registerCommand(false, '_validateWhenClauses', contextkey_1.$Ji);
        }
    }
    exports.$dbc = $dbc;
    function tryMapWith(f) {
        return (value) => {
            if (Array.isArray(value)) {
                return value.map(f);
            }
            return undefined;
        };
    }
    function mapLocationOrLocationLink(values) {
        if (!Array.isArray(values)) {
            return undefined;
        }
        const result = [];
        for (const item of values) {
            if (languages.$8s(item)) {
                result.push(typeConverters.DefinitionLink.to(item));
            }
            else {
                result.push(typeConverters.location.to(item));
            }
        }
        return result;
    }
});
//# sourceMappingURL=extHostApiCommands.js.map