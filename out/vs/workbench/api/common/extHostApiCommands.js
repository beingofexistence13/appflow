/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/network", "vs/base/common/uri", "vs/editor/common/languages", "vs/editor/common/services/semanticTokensDto", "vs/platform/contextkey/common/contextkey", "vs/platform/opener/common/opener", "vs/workbench/api/common/extHostCommands", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes"], function (require, exports, arrays_1, network_1, uri_1, languages, semanticTokensDto_1, contextkey_1, opener_1, extHostCommands_1, typeConverters, types) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostApiCommands = void 0;
    //#region --- NEW world
    const newCommands = [
        // -- document highlights
        new extHostCommands_1.ApiCommand('vscode.executeDocumentHighlights', '_executeDocumentHighlights', 'Execute document highlight provider.', [extHostCommands_1.ApiCommandArgument.Uri, extHostCommands_1.ApiCommandArgument.Position], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of DocumentHighlight-instances.', tryMapWith(typeConverters.DocumentHighlight.to))),
        // -- document symbols
        new extHostCommands_1.ApiCommand('vscode.executeDocumentSymbolProvider', '_executeDocumentSymbolProvider', 'Execute document symbol provider.', [extHostCommands_1.ApiCommandArgument.Uri], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of SymbolInformation and DocumentSymbol instances.', (value, apiArgs) => {
            if ((0, arrays_1.isFalsyOrEmpty)(value)) {
                return undefined;
            }
            class MergedInfo extends types.SymbolInformation {
                static to(symbol) {
                    const res = new MergedInfo(symbol.name, typeConverters.SymbolKind.to(symbol.kind), symbol.containerName || '', new types.Location(apiArgs[0], typeConverters.Range.to(symbol.range)));
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
        new extHostCommands_1.ApiCommand('vscode.executeFormatDocumentProvider', '_executeFormatDocumentProvider', 'Execute document format provider.', [extHostCommands_1.ApiCommandArgument.Uri, new extHostCommands_1.ApiCommandArgument('options', 'Formatting options', _ => true, v => v)], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of TextEdits.', tryMapWith(typeConverters.TextEdit.to))),
        new extHostCommands_1.ApiCommand('vscode.executeFormatRangeProvider', '_executeFormatRangeProvider', 'Execute range format provider.', [extHostCommands_1.ApiCommandArgument.Uri, extHostCommands_1.ApiCommandArgument.Range, new extHostCommands_1.ApiCommandArgument('options', 'Formatting options', _ => true, v => v)], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of TextEdits.', tryMapWith(typeConverters.TextEdit.to))),
        new extHostCommands_1.ApiCommand('vscode.executeFormatOnTypeProvider', '_executeFormatOnTypeProvider', 'Execute format on type provider.', [extHostCommands_1.ApiCommandArgument.Uri, extHostCommands_1.ApiCommandArgument.Position, new extHostCommands_1.ApiCommandArgument('ch', 'Trigger character', v => typeof v === 'string', v => v), new extHostCommands_1.ApiCommandArgument('options', 'Formatting options', _ => true, v => v)], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of TextEdits.', tryMapWith(typeConverters.TextEdit.to))),
        // -- go to symbol (definition, type definition, declaration, impl, references)
        new extHostCommands_1.ApiCommand('vscode.executeDefinitionProvider', '_executeDefinitionProvider', 'Execute all definition providers.', [extHostCommands_1.ApiCommandArgument.Uri, extHostCommands_1.ApiCommandArgument.Position], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of Location or LocationLink instances.', mapLocationOrLocationLink)),
        new extHostCommands_1.ApiCommand('vscode.executeTypeDefinitionProvider', '_executeTypeDefinitionProvider', 'Execute all type definition providers.', [extHostCommands_1.ApiCommandArgument.Uri, extHostCommands_1.ApiCommandArgument.Position], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of Location or LocationLink instances.', mapLocationOrLocationLink)),
        new extHostCommands_1.ApiCommand('vscode.executeDeclarationProvider', '_executeDeclarationProvider', 'Execute all declaration providers.', [extHostCommands_1.ApiCommandArgument.Uri, extHostCommands_1.ApiCommandArgument.Position], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of Location or LocationLink instances.', mapLocationOrLocationLink)),
        new extHostCommands_1.ApiCommand('vscode.executeImplementationProvider', '_executeImplementationProvider', 'Execute all implementation providers.', [extHostCommands_1.ApiCommandArgument.Uri, extHostCommands_1.ApiCommandArgument.Position], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of Location or LocationLink instances.', mapLocationOrLocationLink)),
        new extHostCommands_1.ApiCommand('vscode.executeReferenceProvider', '_executeReferenceProvider', 'Execute all reference providers.', [extHostCommands_1.ApiCommandArgument.Uri, extHostCommands_1.ApiCommandArgument.Position], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of Location-instances.', tryMapWith(typeConverters.location.to))),
        // -- hover
        new extHostCommands_1.ApiCommand('vscode.executeHoverProvider', '_executeHoverProvider', 'Execute all hover providers.', [extHostCommands_1.ApiCommandArgument.Uri, extHostCommands_1.ApiCommandArgument.Position], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of Hover-instances.', tryMapWith(typeConverters.Hover.to))),
        // -- selection range
        new extHostCommands_1.ApiCommand('vscode.executeSelectionRangeProvider', '_executeSelectionRangeProvider', 'Execute selection range provider.', [extHostCommands_1.ApiCommandArgument.Uri, new extHostCommands_1.ApiCommandArgument('position', 'A position in a text document', v => Array.isArray(v) && v.every(v => types.Position.isPosition(v)), v => v.map(typeConverters.Position.from))], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of ranges.', result => {
            return result.map(ranges => {
                let node;
                for (const range of ranges.reverse()) {
                    node = new types.SelectionRange(typeConverters.Range.to(range), node);
                }
                return node;
            });
        })),
        // -- symbol search
        new extHostCommands_1.ApiCommand('vscode.executeWorkspaceSymbolProvider', '_executeWorkspaceSymbolProvider', 'Execute all workspace symbol providers.', [extHostCommands_1.ApiCommandArgument.String.with('query', 'Search string')], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of SymbolInformation-instances.', value => {
            return value.map(typeConverters.WorkspaceSymbol.to);
        })),
        // --- call hierarchy
        new extHostCommands_1.ApiCommand('vscode.prepareCallHierarchy', '_executePrepareCallHierarchy', 'Prepare call hierarchy at a position inside a document', [extHostCommands_1.ApiCommandArgument.Uri, extHostCommands_1.ApiCommandArgument.Position], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of CallHierarchyItem-instances', v => v.map(typeConverters.CallHierarchyItem.to))),
        new extHostCommands_1.ApiCommand('vscode.provideIncomingCalls', '_executeProvideIncomingCalls', 'Compute incoming calls for an item', [extHostCommands_1.ApiCommandArgument.CallHierarchyItem], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of CallHierarchyIncomingCall-instances', v => v.map(typeConverters.CallHierarchyIncomingCall.to))),
        new extHostCommands_1.ApiCommand('vscode.provideOutgoingCalls', '_executeProvideOutgoingCalls', 'Compute outgoing calls for an item', [extHostCommands_1.ApiCommandArgument.CallHierarchyItem], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of CallHierarchyOutgoingCall-instances', v => v.map(typeConverters.CallHierarchyOutgoingCall.to))),
        // --- rename
        new extHostCommands_1.ApiCommand('vscode.prepareRename', '_executePrepareRename', 'Execute the prepareRename of rename provider.', [extHostCommands_1.ApiCommandArgument.Uri, extHostCommands_1.ApiCommandArgument.Position], new extHostCommands_1.ApiCommandResult('A promise that resolves to a range and placeholder text.', value => {
            if (!value) {
                return undefined;
            }
            return {
                range: typeConverters.Range.to(value.range),
                placeholder: value.text
            };
        })),
        new extHostCommands_1.ApiCommand('vscode.executeDocumentRenameProvider', '_executeDocumentRenameProvider', 'Execute rename provider.', [extHostCommands_1.ApiCommandArgument.Uri, extHostCommands_1.ApiCommandArgument.Position, extHostCommands_1.ApiCommandArgument.String.with('newName', 'The new symbol name')], new extHostCommands_1.ApiCommandResult('A promise that resolves to a WorkspaceEdit.', value => {
            if (!value) {
                return undefined;
            }
            if (value.rejectReason) {
                throw new Error(value.rejectReason);
            }
            return typeConverters.WorkspaceEdit.to(value);
        })),
        // --- links
        new extHostCommands_1.ApiCommand('vscode.executeLinkProvider', '_executeLinkProvider', 'Execute document link provider.', [extHostCommands_1.ApiCommandArgument.Uri, extHostCommands_1.ApiCommandArgument.Number.with('linkResolveCount', 'Number of links that should be resolved, only when links are unresolved.').optional()], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of DocumentLink-instances.', value => value.map(typeConverters.DocumentLink.to))),
        // --- semantic tokens
        new extHostCommands_1.ApiCommand('vscode.provideDocumentSemanticTokensLegend', '_provideDocumentSemanticTokensLegend', 'Provide semantic tokens legend for a document', [extHostCommands_1.ApiCommandArgument.Uri], new extHostCommands_1.ApiCommandResult('A promise that resolves to SemanticTokensLegend.', value => {
            if (!value) {
                return undefined;
            }
            return new types.SemanticTokensLegend(value.tokenTypes, value.tokenModifiers);
        })),
        new extHostCommands_1.ApiCommand('vscode.provideDocumentSemanticTokens', '_provideDocumentSemanticTokens', 'Provide semantic tokens for a document', [extHostCommands_1.ApiCommandArgument.Uri], new extHostCommands_1.ApiCommandResult('A promise that resolves to SemanticTokens.', value => {
            if (!value) {
                return undefined;
            }
            const semanticTokensDto = (0, semanticTokensDto_1.decodeSemanticTokensDto)(value);
            if (semanticTokensDto.type !== 'full') {
                // only accepting full semantic tokens from provideDocumentSemanticTokens
                return undefined;
            }
            return new types.SemanticTokens(semanticTokensDto.data, undefined);
        })),
        new extHostCommands_1.ApiCommand('vscode.provideDocumentRangeSemanticTokensLegend', '_provideDocumentRangeSemanticTokensLegend', 'Provide semantic tokens legend for a document range', [extHostCommands_1.ApiCommandArgument.Uri, extHostCommands_1.ApiCommandArgument.Range.optional()], new extHostCommands_1.ApiCommandResult('A promise that resolves to SemanticTokensLegend.', value => {
            if (!value) {
                return undefined;
            }
            return new types.SemanticTokensLegend(value.tokenTypes, value.tokenModifiers);
        })),
        new extHostCommands_1.ApiCommand('vscode.provideDocumentRangeSemanticTokens', '_provideDocumentRangeSemanticTokens', 'Provide semantic tokens for a document range', [extHostCommands_1.ApiCommandArgument.Uri, extHostCommands_1.ApiCommandArgument.Range], new extHostCommands_1.ApiCommandResult('A promise that resolves to SemanticTokens.', value => {
            if (!value) {
                return undefined;
            }
            const semanticTokensDto = (0, semanticTokensDto_1.decodeSemanticTokensDto)(value);
            if (semanticTokensDto.type !== 'full') {
                // only accepting full semantic tokens from provideDocumentRangeSemanticTokens
                return undefined;
            }
            return new types.SemanticTokens(semanticTokensDto.data, undefined);
        })),
        // --- completions
        new extHostCommands_1.ApiCommand('vscode.executeCompletionItemProvider', '_executeCompletionItemProvider', 'Execute completion item provider.', [
            extHostCommands_1.ApiCommandArgument.Uri,
            extHostCommands_1.ApiCommandArgument.Position,
            extHostCommands_1.ApiCommandArgument.String.with('triggerCharacter', 'Trigger completion when the user types the character, like `,` or `(`').optional(),
            extHostCommands_1.ApiCommandArgument.Number.with('itemResolveCount', 'Number of completions to resolve (too large numbers slow down completions)').optional()
        ], new extHostCommands_1.ApiCommandResult('A promise that resolves to a CompletionList-instance.', (value, _args, converter) => {
            if (!value) {
                return new types.CompletionList([]);
            }
            const items = value.suggestions.map(suggestion => typeConverters.CompletionItem.to(suggestion, converter));
            return new types.CompletionList(items, value.incomplete);
        })),
        // --- signature help
        new extHostCommands_1.ApiCommand('vscode.executeSignatureHelpProvider', '_executeSignatureHelpProvider', 'Execute signature help provider.', [extHostCommands_1.ApiCommandArgument.Uri, extHostCommands_1.ApiCommandArgument.Position, extHostCommands_1.ApiCommandArgument.String.with('triggerCharacter', 'Trigger signature help when the user types the character, like `,` or `(`').optional()], new extHostCommands_1.ApiCommandResult('A promise that resolves to SignatureHelp.', value => {
            if (value) {
                return typeConverters.SignatureHelp.to(value);
            }
            return undefined;
        })),
        // --- code lens
        new extHostCommands_1.ApiCommand('vscode.executeCodeLensProvider', '_executeCodeLensProvider', 'Execute code lens provider.', [extHostCommands_1.ApiCommandArgument.Uri, extHostCommands_1.ApiCommandArgument.Number.with('itemResolveCount', 'Number of lenses that should be resolved and returned. Will only return resolved lenses, will impact performance)').optional()], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of CodeLens-instances.', (value, _args, converter) => {
            return tryMapWith(item => {
                return new types.CodeLens(typeConverters.Range.to(item.range), item.command && converter.fromInternal(item.command));
            })(value);
        })),
        // --- code actions
        new extHostCommands_1.ApiCommand('vscode.executeCodeActionProvider', '_executeCodeActionProvider', 'Execute code action provider.', [
            extHostCommands_1.ApiCommandArgument.Uri,
            new extHostCommands_1.ApiCommandArgument('rangeOrSelection', 'Range in a text document. Some refactoring provider requires Selection object.', v => types.Range.isRange(v), v => types.Selection.isSelection(v) ? typeConverters.Selection.from(v) : typeConverters.Range.from(v)),
            extHostCommands_1.ApiCommandArgument.String.with('kind', 'Code action kind to return code actions for').optional(),
            extHostCommands_1.ApiCommandArgument.Number.with('itemResolveCount', 'Number of code actions to resolve (too large numbers slow down code actions)').optional()
        ], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of Command-instances.', (value, _args, converter) => {
            return tryMapWith((codeAction) => {
                if (codeAction._isSynthetic) {
                    if (!codeAction.command) {
                        throw new Error('Synthetic code actions must have a command');
                    }
                    return converter.fromInternal(codeAction.command);
                }
                else {
                    const ret = new types.CodeAction(codeAction.title, codeAction.kind ? new types.CodeActionKind(codeAction.kind) : undefined);
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
        new extHostCommands_1.ApiCommand('vscode.executeDocumentColorProvider', '_executeDocumentColorProvider', 'Execute document color provider.', [extHostCommands_1.ApiCommandArgument.Uri], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of ColorInformation objects.', result => {
            if (result) {
                return result.map(ci => new types.ColorInformation(typeConverters.Range.to(ci.range), typeConverters.Color.to(ci.color)));
            }
            return [];
        })),
        new extHostCommands_1.ApiCommand('vscode.executeColorPresentationProvider', '_executeColorPresentationProvider', 'Execute color presentation provider.', [
            new extHostCommands_1.ApiCommandArgument('color', 'The color to show and insert', v => v instanceof types.Color, typeConverters.Color.from),
            new extHostCommands_1.ApiCommandArgument('context', 'Context object with uri and range', _v => true, v => ({ uri: v.uri, range: typeConverters.Range.from(v.range) })),
        ], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of ColorPresentation objects.', result => {
            if (result) {
                return result.map(typeConverters.ColorPresentation.to);
            }
            return [];
        })),
        // --- inline hints
        new extHostCommands_1.ApiCommand('vscode.executeInlayHintProvider', '_executeInlayHintProvider', 'Execute inlay hints provider', [extHostCommands_1.ApiCommandArgument.Uri, extHostCommands_1.ApiCommandArgument.Range], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of Inlay objects', (result, args, converter) => {
            return result.map(typeConverters.InlayHint.to.bind(undefined, converter));
        })),
        // --- folding
        new extHostCommands_1.ApiCommand('vscode.executeFoldingRangeProvider', '_executeFoldingRangeProvider', 'Execute folding range provider', [extHostCommands_1.ApiCommandArgument.Uri], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of FoldingRange objects', (result, args) => {
            if (result) {
                return result.map(typeConverters.FoldingRange.to);
            }
            return undefined;
        })),
        // --- notebooks
        new extHostCommands_1.ApiCommand('vscode.resolveNotebookContentProviders', '_resolveNotebookContentProvider', 'Resolve Notebook Content Providers', [
        // new ApiCommandArgument<string, string>('viewType', '', v => typeof v === 'string', v => v),
        // new ApiCommandArgument<string, string>('displayName', '', v => typeof v === 'string', v => v),
        // new ApiCommandArgument<object, object>('options', '', v => typeof v === 'object', v => v),
        ], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of NotebookContentProvider static info objects.', tryMapWith(item => {
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
        new extHostCommands_1.ApiCommand('vscode.executeInlineValueProvider', '_executeInlineValueProvider', 'Execute inline value provider', [
            extHostCommands_1.ApiCommandArgument.Uri,
            extHostCommands_1.ApiCommandArgument.Range,
            new extHostCommands_1.ApiCommandArgument('context', 'An InlineValueContext', v => v && typeof v.frameId === 'number' && v.stoppedLocation instanceof types.Range, v => typeConverters.InlineValueContext.from(v))
        ], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of InlineValue objects', result => {
            return result.map(typeConverters.InlineValue.to);
        })),
        // --- open'ish commands
        new extHostCommands_1.ApiCommand('vscode.open', '_workbench.open', 'Opens the provided resource in the editor. Can be a text or binary file, or an http(s) URL. If you need more control over the options for opening a text file, use vscode.window.showTextDocument instead.', [
            new extHostCommands_1.ApiCommandArgument('uriOrString', 'Uri-instance or string (only http/https)', v => uri_1.URI.isUri(v) || (typeof v === 'string' && (0, opener_1.matchesSomeScheme)(v, network_1.Schemas.http, network_1.Schemas.https)), v => v),
            new extHostCommands_1.ApiCommandArgument('columnOrOptions', 'Either the column in which to open or editor options, see vscode.TextDocumentShowOptions', v => v === undefined || typeof v === 'number' || typeof v === 'object', v => !v ? v : typeof v === 'number' ? [typeConverters.ViewColumn.from(v), undefined] : [typeConverters.ViewColumn.from(v.viewColumn), typeConverters.TextEditorOpenOptions.from(v)]).optional(),
            extHostCommands_1.ApiCommandArgument.String.with('label', '').optional()
        ], extHostCommands_1.ApiCommandResult.Void),
        new extHostCommands_1.ApiCommand('vscode.openWith', '_workbench.openWith', 'Opens the provided resource with a specific editor.', [
            extHostCommands_1.ApiCommandArgument.Uri.with('resource', 'Resource to open'),
            extHostCommands_1.ApiCommandArgument.String.with('viewId', 'Custom editor view id or \'default\' to use VS Code\'s default editor'),
            new extHostCommands_1.ApiCommandArgument('columnOrOptions', 'Either the column in which to open or editor options, see vscode.TextDocumentShowOptions', v => v === undefined || typeof v === 'number' || typeof v === 'object', v => !v ? v : typeof v === 'number' ? [typeConverters.ViewColumn.from(v), undefined] : [typeConverters.ViewColumn.from(v.viewColumn), typeConverters.TextEditorOpenOptions.from(v)]).optional()
        ], extHostCommands_1.ApiCommandResult.Void),
        new extHostCommands_1.ApiCommand('vscode.diff', '_workbench.diff', 'Opens the provided resources in the diff editor to compare their contents.', [
            extHostCommands_1.ApiCommandArgument.Uri.with('left', 'Left-hand side resource of the diff editor'),
            extHostCommands_1.ApiCommandArgument.Uri.with('right', 'Right-hand side resource of the diff editor'),
            extHostCommands_1.ApiCommandArgument.String.with('title', 'Human readable title for the diff editor').optional(),
            new extHostCommands_1.ApiCommandArgument('columnOrOptions', 'Either the column in which to open or editor options, see vscode.TextDocumentShowOptions', v => v === undefined || typeof v === 'object', v => v && [typeConverters.ViewColumn.from(v.viewColumn), typeConverters.TextEditorOpenOptions.from(v)]).optional(),
        ], extHostCommands_1.ApiCommandResult.Void),
        // --- type hierarchy
        new extHostCommands_1.ApiCommand('vscode.prepareTypeHierarchy', '_executePrepareTypeHierarchy', 'Prepare type hierarchy at a position inside a document', [extHostCommands_1.ApiCommandArgument.Uri, extHostCommands_1.ApiCommandArgument.Position], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of TypeHierarchyItem-instances', v => v.map(typeConverters.TypeHierarchyItem.to))),
        new extHostCommands_1.ApiCommand('vscode.provideSupertypes', '_executeProvideSupertypes', 'Compute supertypes for an item', [extHostCommands_1.ApiCommandArgument.TypeHierarchyItem], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of TypeHierarchyItem-instances', v => v.map(typeConverters.TypeHierarchyItem.to))),
        new extHostCommands_1.ApiCommand('vscode.provideSubtypes', '_executeProvideSubtypes', 'Compute subtypes for an item', [extHostCommands_1.ApiCommandArgument.TypeHierarchyItem], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of TypeHierarchyItem-instances', v => v.map(typeConverters.TypeHierarchyItem.to))),
        // --- testing
        new extHostCommands_1.ApiCommand('vscode.revealTestInExplorer', '_revealTestInExplorer', 'Reveals a test instance in the explorer', [extHostCommands_1.ApiCommandArgument.TestItem], extHostCommands_1.ApiCommandResult.Void),
        // --- continue edit session
        new extHostCommands_1.ApiCommand('vscode.experimental.editSession.continue', '_workbench.editSessions.actions.continueEditSession', 'Continue the current edit session in a different workspace', [extHostCommands_1.ApiCommandArgument.Uri.with('workspaceUri', 'The target workspace to continue the current edit session in')], extHostCommands_1.ApiCommandResult.Void),
        // --- context keys
        new extHostCommands_1.ApiCommand('setContext', '_setContext', 'Set a custom context key value that can be used in when clauses.', [
            extHostCommands_1.ApiCommandArgument.String.with('name', 'The context key name'),
            new extHostCommands_1.ApiCommandArgument('value', 'The context key value', () => true, v => v),
        ], extHostCommands_1.ApiCommandResult.Void),
        // --- mapped edits
        new extHostCommands_1.ApiCommand('vscode.executeMappedEditsProvider', '_executeMappedEditsProvider', 'Execute Mapped Edits Provider', [
            extHostCommands_1.ApiCommandArgument.Uri,
            extHostCommands_1.ApiCommandArgument.StringArray,
            new extHostCommands_1.ApiCommandArgument('MappedEditsContext', 'Mapped Edits Context', (v) => typeConverters.MappedEditsContext.is(v), (v) => typeConverters.MappedEditsContext.from(v))
        ], new extHostCommands_1.ApiCommandResult('A promise that resolves to a workspace edit or null', (value) => {
            return value ? typeConverters.WorkspaceEdit.to(value) : null;
        })),
    ];
    //#endregion
    //#region OLD world
    class ExtHostApiCommands {
        static register(commands) {
            newCommands.forEach(commands.registerApiCommand, commands);
            this._registerValidateWhenClausesCommand(commands);
        }
        static _registerValidateWhenClausesCommand(commands) {
            commands.registerCommand(false, '_validateWhenClauses', contextkey_1.validateWhenClauses);
        }
    }
    exports.ExtHostApiCommands = ExtHostApiCommands;
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
            if (languages.isLocationLink(item)) {
                result.push(typeConverters.DefinitionLink.to(item));
            }
            else {
                result.push(typeConverters.location.to(item));
            }
        }
        return result;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdEFwaUNvbW1hbmRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9jb21tb24vZXh0SG9zdEFwaUNvbW1hbmRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXNCaEcsdUJBQXVCO0lBRXZCLE1BQU0sV0FBVyxHQUFpQjtRQUNqQyx5QkFBeUI7UUFDekIsSUFBSSw0QkFBVSxDQUNiLGtDQUFrQyxFQUFFLDRCQUE0QixFQUFFLHNDQUFzQyxFQUN4RyxDQUFDLG9DQUFrQixDQUFDLEdBQUcsRUFBRSxvQ0FBa0IsQ0FBQyxRQUFRLENBQUMsRUFDckQsSUFBSSxrQ0FBZ0IsQ0FBdUUscUVBQXFFLEVBQUUsVUFBVSxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUNsTjtRQUNELHNCQUFzQjtRQUN0QixJQUFJLDRCQUFVLENBQ2Isc0NBQXNDLEVBQUUsZ0NBQWdDLEVBQUUsbUNBQW1DLEVBQzdHLENBQUMsb0NBQWtCLENBQUMsR0FBRyxDQUFDLEVBQ3hCLElBQUksa0NBQWdCLENBQXFFLHdGQUF3RixFQUFFLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFO1lBRXJNLElBQUksSUFBQSx1QkFBYyxFQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUMxQixPQUFPLFNBQVMsQ0FBQzthQUNqQjtZQUNELE1BQU0sVUFBVyxTQUFRLEtBQUssQ0FBQyxpQkFBaUI7Z0JBQy9DLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBZ0M7b0JBQ3pDLE1BQU0sR0FBRyxHQUFHLElBQUksVUFBVSxDQUN6QixNQUFNLENBQUMsSUFBSSxFQUNYLGNBQWMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFDekMsTUFBTSxDQUFDLGFBQWEsSUFBSSxFQUFFLEVBQzFCLElBQUksS0FBSyxDQUFD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