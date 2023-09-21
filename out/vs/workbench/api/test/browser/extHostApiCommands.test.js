/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/errors", "vs/base/common/uri", "vs/base/common/event", "vs/workbench/api/common/extHostTypes", "vs/editor/test/common/testTextModel", "vs/workbench/api/test/common/testRPCProtocol", "vs/platform/markers/common/markerService", "vs/platform/markers/common/markers", "vs/platform/commands/common/commands", "vs/editor/common/services/model", "vs/workbench/api/common/extHostLanguageFeatures", "vs/workbench/api/browser/mainThreadLanguageFeatures", "vs/workbench/api/common/extHostApiCommands", "vs/workbench/api/common/extHostCommands", "vs/workbench/api/browser/mainThreadCommands", "vs/workbench/api/common/extHostDocuments", "vs/workbench/api/common/extHostDocumentsAndEditors", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostDiagnostics", "vs/platform/log/common/log", "vs/workbench/services/extensions/common/extensions", "vs/base/common/lifecycle", "vs/editor/common/services/editorWorker", "vs/base/test/common/mock", "vs/workbench/api/common/extHostApiDeprecationService", "vs/platform/instantiation/common/serviceCollection", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/instantiationService", "vs/editor/common/services/resolverService", "vs/workbench/api/common/extHostUriTransformerService", "vs/editor/contrib/documentSymbols/browser/outlineModel", "vs/editor/common/services/languageFeatureDebounce", "vs/editor/common/services/languageFeatures", "vs/editor/common/services/languageFeaturesService", "vs/base/common/types", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/workbench/contrib/search/browser/search.contribution", "vs/editor/contrib/codeAction/browser/codeAction", "vs/editor/contrib/codelens/browser/codelens", "vs/editor/contrib/colorPicker/browser/color", "vs/editor/contrib/format/browser/format", "vs/editor/contrib/gotoSymbol/browser/goToCommands", "vs/editor/contrib/documentSymbols/browser/documentSymbols", "vs/editor/contrib/hover/browser/getHover", "vs/editor/contrib/links/browser/getLinks", "vs/editor/contrib/parameterHints/browser/provideSignatureHelp", "vs/editor/contrib/smartSelect/browser/smartSelect", "vs/editor/contrib/suggest/browser/suggest", "vs/editor/contrib/rename/browser/rename", "vs/editor/contrib/inlayHints/browser/inlayHintsController"], function (require, exports, assert, errors_1, uri_1, event_1, types, testTextModel_1, testRPCProtocol_1, markerService_1, markers_1, commands_1, model_1, extHostLanguageFeatures_1, mainThreadLanguageFeatures_1, extHostApiCommands_1, extHostCommands_1, mainThreadCommands_1, extHostDocuments_1, extHostDocumentsAndEditors_1, extHost_protocol_1, extHostDiagnostics_1, log_1, extensions_1, lifecycle_1, editorWorker_1, mock_1, extHostApiDeprecationService_1, serviceCollection_1, descriptors_1, instantiationService_1, resolverService_1, extHostUriTransformerService_1, outlineModel_1, languageFeatureDebounce_1, languageFeatures_1, languageFeaturesService_1, types_1, uriIdentity_1, configuration_1, testConfigurationService_1, environment_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function assertRejects(fn, message = 'Expected rejection') {
        return fn().then(() => assert.ok(false, message), _err => assert.ok(true));
    }
    function isLocation(value) {
        const candidate = value;
        return candidate && candidate.uri instanceof uri_1.URI && candidate.range instanceof types.Range;
    }
    suite('ExtHostLanguageFeatureCommands', function () {
        const defaultSelector = { scheme: 'far' };
        let model;
        let rpcProtocol;
        let extHost;
        let mainThread;
        let commands;
        let disposables = [];
        let originalErrorHandler;
        suiteSetup(() => {
            model = (0, testTextModel_1.createTextModel)([
                'This is the first line',
                'This is the second line',
                'This is the third line',
            ].join('\n'), undefined, undefined, uri_1.URI.parse('far://testing/file.b'));
            originalErrorHandler = errors_1.errorHandler.getUnexpectedErrorHandler();
            (0, errors_1.setUnexpectedErrorHandler)(() => { });
            // Use IInstantiationService to get typechecking when instantiating
            rpcProtocol = new testRPCProtocol_1.TestRPCProtocol();
            const services = new serviceCollection_1.ServiceCollection();
            services.set(uriIdentity_1.IUriIdentityService, new class extends (0, mock_1.mock)() {
                asCanonicalUri(uri) {
                    return uri;
                }
            });
            services.set(languageFeatures_1.ILanguageFeaturesService, new descriptors_1.SyncDescriptor(languageFeaturesService_1.LanguageFeaturesService));
            services.set(extensions_1.IExtensionService, new class extends (0, mock_1.mock)() {
                async activateByEvent() {
                }
                activationEventIsDone(activationEvent) {
                    return true;
                }
            });
            services.set(commands_1.ICommandService, new descriptors_1.SyncDescriptor(class extends (0, mock_1.mock)() {
                executeCommand(id, ...args) {
                    const command = commands_1.CommandsRegistry.getCommands().get(id);
                    if (!command) {
                        return Promise.reject(new Error(id + ' NOT known'));
                    }
                    const { handler } = command;
                    return Promise.resolve(insta.invokeFunction(handler, ...args));
                }
            }));
            services.set(environment_1.IEnvironmentService, new class extends (0, mock_1.mock)() {
                constructor() {
                    super(...arguments);
                    this.isBuilt = true;
                    this.isExtensionDevelopment = false;
                }
            });
            services.set(markers_1.IMarkerService, new markerService_1.MarkerService());
            services.set(log_1.ILogService, new descriptors_1.SyncDescriptor(log_1.NullLogService));
            services.set(languageFeatureDebounce_1.ILanguageFeatureDebounceService, new descriptors_1.SyncDescriptor(languageFeatureDebounce_1.LanguageFeatureDebounceService));
            services.set(model_1.IModelService, new class extends (0, mock_1.mock)() {
                constructor() {
                    super(...arguments);
                    this.onModelRemoved = event_1.Event.None;
                }
                getModel() { return model; }
            });
            services.set(resolverService_1.ITextModelService, new class extends (0, mock_1.mock)() {
                async createModelReference() {
                    return new lifecycle_1.ImmortalReference(new class extends (0, mock_1.mock)() {
                        constructor() {
                            super(...arguments);
                            this.textEditorModel = model;
                        }
                    });
                }
            });
            services.set(editorWorker_1.IEditorWorkerService, new class extends (0, mock_1.mock)() {
                async computeMoreMinimalEdits(_uri, edits) {
                    return edits || undefined;
                }
            });
            services.set(languageFeatureDebounce_1.ILanguageFeatureDebounceService, new descriptors_1.SyncDescriptor(languageFeatureDebounce_1.LanguageFeatureDebounceService));
            services.set(outlineModel_1.IOutlineModelService, new descriptors_1.SyncDescriptor(outlineModel_1.OutlineModelService));
            services.set(configuration_1.IConfigurationService, new testConfigurationService_1.TestConfigurationService());
            const insta = new instantiationService_1.InstantiationService(services);
            const extHostDocumentsAndEditors = new extHostDocumentsAndEditors_1.ExtHostDocumentsAndEditors(rpcProtocol, new log_1.NullLogService());
            extHostDocumentsAndEditors.$acceptDocumentsAndEditorsDelta({
                addedDocuments: [{
                        isDirty: false,
                        versionId: model.getVersionId(),
                        languageId: model.getLanguageId(),
                        uri: model.uri,
                        lines: model.getValue().split(model.getEOL()),
                        EOL: model.getEOL(),
                    }]
            });
            const extHostDocuments = new extHostDocuments_1.ExtHostDocuments(rpcProtocol, extHostDocumentsAndEditors);
            rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostDocuments, extHostDocuments);
            commands = new extHostCommands_1.ExtHostCommands(rpcProtocol, new log_1.NullLogService(), new class extends (0, mock_1.mock)() {
                onExtensionError() {
                    return true;
                }
            });
            rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostCommands, commands);
            rpcProtocol.set(extHost_protocol_1.MainContext.MainThreadCommands, insta.createInstance(mainThreadCommands_1.MainThreadCommands, rpcProtocol));
            extHostApiCommands_1.ExtHostApiCommands.register(commands);
            const diagnostics = new extHostDiagnostics_1.ExtHostDiagnostics(rpcProtocol, new log_1.NullLogService(), new class extends (0, mock_1.mock)() {
            }, extHostDocumentsAndEditors);
            rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostDiagnostics, diagnostics);
            extHost = new extHostLanguageFeatures_1.ExtHostLanguageFeatures(rpcProtocol, new extHostUriTransformerService_1.URITransformerService(null), extHostDocuments, commands, diagnostics, new log_1.NullLogService(), extHostApiDeprecationService_1.NullApiDeprecationService, new class extends (0, mock_1.mock)() {
                onExtensionError() {
                    return true;
                }
            });
            rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostLanguageFeatures, extHost);
            mainThread = rpcProtocol.set(extHost_protocol_1.MainContext.MainThreadLanguageFeatures, insta.createInstance(mainThreadLanguageFeatures_1.MainThreadLanguageFeatures, rpcProtocol));
            return rpcProtocol.sync();
        });
        suiteTeardown(() => {
            (0, errors_1.setUnexpectedErrorHandler)(originalErrorHandler);
            model.dispose();
            mainThread.dispose();
        });
        teardown(() => {
            disposables = (0, lifecycle_1.dispose)(disposables);
            return rpcProtocol.sync();
        });
        (0, files_1.ensureFileSystemProviderError)();
        // --- workspace symbols
        test('WorkspaceSymbols, invalid arguments', function () {
            const promises = [
                assertRejects(() => commands.executeCommand('vscode.executeWorkspaceSymbolProvider')),
                assertRejects(() => commands.executeCommand('vscode.executeWorkspaceSymbolProvider', null)),
                assertRejects(() => commands.executeCommand('vscode.executeWorkspaceSymbolProvider', undefined)),
                assertRejects(() => commands.executeCommand('vscode.executeWorkspaceSymbolProvider', true))
            ];
            return Promise.all(promises);
        });
        test('WorkspaceSymbols, back and forth', function () {
            disposables.push(extHost.registerWorkspaceSymbolProvider(extensions_1.nullExtensionDescription, {
                provideWorkspaceSymbols(query) {
                    return [
                        new types.SymbolInformation(query, types.SymbolKind.Array, new types.Range(0, 0, 1, 1), uri_1.URI.parse('far://testing/first')),
                        new types.SymbolInformation(query, types.SymbolKind.Array, new types.Range(0, 0, 1, 1), uri_1.URI.parse('far://testing/second'))
                    ];
                }
            }));
            disposables.push(extHost.registerWorkspaceSymbolProvider(extensions_1.nullExtensionDescription, {
                provideWorkspaceSymbols(query) {
                    return [
                        new types.SymbolInformation(query, types.SymbolKind.Array, new types.Range(0, 0, 1, 1), uri_1.URI.parse('far://testing/first'))
                    ];
                }
            }));
            return rpcProtocol.sync().then(() => {
                return commands.executeCommand('vscode.executeWorkspaceSymbolProvider', 'testing').then(value => {
                    assert.strictEqual(value.length, 2); // de-duped
                    for (const info of value) {
                        assert.strictEqual(info instanceof types.SymbolInformation, true);
                        assert.strictEqual(info.name, 'testing');
                        assert.strictEqual(info.kind, types.SymbolKind.Array);
                    }
                });
            });
        });
        test('executeWorkspaceSymbolProvider should accept empty string, #39522', async function () {
            disposables.push(extHost.registerWorkspaceSymbolProvider(extensions_1.nullExtensionDescription, {
                provideWorkspaceSymbols() {
                    return [new types.SymbolInformation('hello', types.SymbolKind.Array, new types.Range(0, 0, 0, 0), uri_1.URI.parse('foo:bar'))];
                }
            }));
            await rpcProtocol.sync();
            let symbols = await commands.executeCommand('vscode.executeWorkspaceSymbolProvider', '');
            assert.strictEqual(symbols.length, 1);
            await rpcProtocol.sync();
            symbols = await commands.executeCommand('vscode.executeWorkspaceSymbolProvider', '*');
            assert.strictEqual(symbols.length, 1);
        });
        // --- formatting
        test('executeFormatDocumentProvider, back and forth', async function () {
            disposables.push(extHost.registerDocumentFormattingEditProvider(extensions_1.nullExtensionDescription, defaultSelector, new class {
                provideDocumentFormattingEdits() {
                    return [types.TextEdit.insert(new types.Position(0, 0), '42')];
                }
            }));
            await rpcProtocol.sync();
            const edits = await commands.executeCommand('vscode.executeFormatDocumentProvider', model.uri);
            assert.strictEqual(edits.length, 1);
        });
        // --- rename
        test('vscode.prepareRename', async function () {
            disposables.push(extHost.registerRenameProvider(extensions_1.nullExtensionDescription, defaultSelector, new class {
                prepareRename(document, position) {
                    return {
                        range: new types.Range(0, 12, 0, 24),
                        placeholder: 'foooPlaceholder'
                    };
                }
                provideRenameEdits(document, position, newName) {
                    const edit = new types.WorkspaceEdit();
                    edit.insert(document.uri, position, newName);
                    return edit;
                }
            }));
            await rpcProtocol.sync();
            const data = await commands.executeCommand('vscode.prepareRename', model.uri, new types.Position(0, 12));
            assert.ok(data);
            assert.strictEqual(data.placeholder, 'foooPlaceholder');
            assert.strictEqual(data.range.start.line, 0);
            assert.strictEqual(data.range.start.character, 12);
            assert.strictEqual(data.range.end.line, 0);
            assert.strictEqual(data.range.end.character, 24);
        });
        test('vscode.executeDocumentRenameProvider', async function () {
            disposables.push(extHost.registerRenameProvider(extensions_1.nullExtensionDescription, defaultSelector, new class {
                provideRenameEdits(document, position, newName) {
                    const edit = new types.WorkspaceEdit();
                    edit.insert(document.uri, position, newName);
                    return edit;
                }
            }));
            await rpcProtocol.sync();
            const edit = await commands.executeCommand('vscode.executeDocumentRenameProvider', model.uri, new types.Position(0, 12), 'newNameOfThis');
            assert.ok(edit);
            assert.strictEqual(edit.has(model.uri), true);
            const textEdits = edit.get(model.uri);
            assert.strictEqual(textEdits.length, 1);
            assert.strictEqual(textEdits[0].newText, 'newNameOfThis');
        });
        // --- definition
        test('Definition, invalid arguments', function () {
            const promises = [
                assertRejects(() => commands.executeCommand('vscode.executeDefinitionProvider')),
                assertRejects(() => commands.executeCommand('vscode.executeDefinitionProvider', null)),
                assertRejects(() => commands.executeCommand('vscode.executeDefinitionProvider', undefined)),
                assertRejects(() => commands.executeCommand('vscode.executeDefinitionProvider', true, false))
            ];
            return Promise.all(promises);
        });
        test('Definition, back and forth', function () {
            disposables.push(extHost.registerDefinitionProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideDefinition(doc) {
                    return new types.Location(doc.uri, new types.Range(1, 0, 0, 0));
                }
            }));
            disposables.push(extHost.registerDefinitionProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideDefinition(doc) {
                    // duplicate result will get removed
                    return new types.Location(doc.uri, new types.Range(1, 0, 0, 0));
                }
            }));
            disposables.push(extHost.registerDefinitionProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideDefinition(doc) {
                    return [
                        new types.Location(doc.uri, new types.Range(2, 0, 0, 0)),
                        new types.Location(doc.uri, new types.Range(3, 0, 0, 0)),
                        new types.Location(doc.uri, new types.Range(4, 0, 0, 0)),
                    ];
                }
            }));
            return rpcProtocol.sync().then(() => {
                return commands.executeCommand('vscode.executeDefinitionProvider', model.uri, new types.Position(0, 0)).then(values => {
                    assert.strictEqual(values.length, 4);
                    for (const v of values) {
                        assert.ok(v.uri instanceof uri_1.URI);
                        assert.ok(v.range instanceof types.Range);
                    }
                });
            });
        });
        test('Definition, back and forth (sorting & de-deduping)', function () {
            disposables.push(extHost.registerDefinitionProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideDefinition(doc) {
                    return new types.Location(uri_1.URI.parse('file:///b'), new types.Range(1, 0, 0, 0));
                }
            }));
            disposables.push(extHost.registerDefinitionProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideDefinition(doc) {
                    // duplicate result will get removed
                    return new types.Location(uri_1.URI.parse('file:///b'), new types.Range(1, 0, 0, 0));
                }
            }));
            disposables.push(extHost.registerDefinitionProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideDefinition(doc) {
                    return [
                        new types.Location(uri_1.URI.parse('file:///a'), new types.Range(2, 0, 0, 0)),
                        new types.Location(uri_1.URI.parse('file:///c'), new types.Range(3, 0, 0, 0)),
                        new types.Location(uri_1.URI.parse('file:///d'), new types.Range(4, 0, 0, 0)),
                    ];
                }
            }));
            return rpcProtocol.sync().then(() => {
                return commands.executeCommand('vscode.executeDefinitionProvider', model.uri, new types.Position(0, 0)).then(values => {
                    assert.strictEqual(values.length, 4);
                    assert.strictEqual(values[0].uri.path, '/a');
                    assert.strictEqual(values[1].uri.path, '/b');
                    assert.strictEqual(values[2].uri.path, '/c');
                    assert.strictEqual(values[3].uri.path, '/d');
                });
            });
        });
        test('Definition Link', () => {
            disposables.push(extHost.registerDefinitionProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideDefinition(doc) {
                    return [
                        new types.Location(doc.uri, new types.Range(0, 0, 0, 0)),
                        { targetUri: doc.uri, targetRange: new types.Range(1, 0, 0, 0), targetSelectionRange: new types.Range(1, 1, 1, 1), originSelectionRange: new types.Range(2, 2, 2, 2) }
                    ];
                }
            }));
            return rpcProtocol.sync().then(() => {
                return commands.executeCommand('vscode.executeDefinitionProvider', model.uri, new types.Position(0, 0)).then(values => {
                    assert.strictEqual(values.length, 2);
                    for (const v of values) {
                        if (isLocation(v)) {
                            assert.ok(v.uri instanceof uri_1.URI);
                            assert.ok(v.range instanceof types.Range);
                        }
                        else {
                            assert.ok(v.targetUri instanceof uri_1.URI);
                            assert.ok(v.targetRange instanceof types.Range);
                            assert.ok(v.targetSelectionRange instanceof types.Range);
                            assert.ok(v.originSelectionRange instanceof types.Range);
                        }
                    }
                });
            });
        });
        // --- declaration
        test('Declaration, back and forth', function () {
            disposables.push(extHost.registerDeclarationProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideDeclaration(doc) {
                    return new types.Location(doc.uri, new types.Range(1, 0, 0, 0));
                }
            }));
            disposables.push(extHost.registerDeclarationProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideDeclaration(doc) {
                    // duplicate result will get removed
                    return new types.Location(doc.uri, new types.Range(1, 0, 0, 0));
                }
            }));
            disposables.push(extHost.registerDeclarationProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideDeclaration(doc) {
                    return [
                        new types.Location(doc.uri, new types.Range(2, 0, 0, 0)),
                        new types.Location(doc.uri, new types.Range(3, 0, 0, 0)),
                        new types.Location(doc.uri, new types.Range(4, 0, 0, 0)),
                    ];
                }
            }));
            return rpcProtocol.sync().then(() => {
                return commands.executeCommand('vscode.executeDeclarationProvider', model.uri, new types.Position(0, 0)).then(values => {
                    assert.strictEqual(values.length, 4);
                    for (const v of values) {
                        assert.ok(v.uri instanceof uri_1.URI);
                        assert.ok(v.range instanceof types.Range);
                    }
                });
            });
        });
        test('Declaration Link', () => {
            disposables.push(extHost.registerDeclarationProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideDeclaration(doc) {
                    return [
                        new types.Location(doc.uri, new types.Range(0, 0, 0, 0)),
                        { targetUri: doc.uri, targetRange: new types.Range(1, 0, 0, 0), targetSelectionRange: new types.Range(1, 1, 1, 1), originSelectionRange: new types.Range(2, 2, 2, 2) }
                    ];
                }
            }));
            return rpcProtocol.sync().then(() => {
                return commands.executeCommand('vscode.executeDeclarationProvider', model.uri, new types.Position(0, 0)).then(values => {
                    assert.strictEqual(values.length, 2);
                    for (const v of values) {
                        if (isLocation(v)) {
                            assert.ok(v.uri instanceof uri_1.URI);
                            assert.ok(v.range instanceof types.Range);
                        }
                        else {
                            assert.ok(v.targetUri instanceof uri_1.URI);
                            assert.ok(v.targetRange instanceof types.Range);
                            assert.ok(v.targetSelectionRange instanceof types.Range);
                            assert.ok(v.originSelectionRange instanceof types.Range);
                        }
                    }
                });
            });
        });
        // --- type definition
        test('Type Definition, invalid arguments', function () {
            const promises = [
                assertRejects(() => commands.executeCommand('vscode.executeTypeDefinitionProvider')),
                assertRejects(() => commands.executeCommand('vscode.executeTypeDefinitionProvider', null)),
                assertRejects(() => commands.executeCommand('vscode.executeTypeDefinitionProvider', undefined)),
                assertRejects(() => commands.executeCommand('vscode.executeTypeDefinitionProvider', true, false))
            ];
            return Promise.all(promises);
        });
        test('Type Definition, back and forth', function () {
            disposables.push(extHost.registerTypeDefinitionProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideTypeDefinition(doc) {
                    return new types.Location(doc.uri, new types.Range(1, 0, 0, 0));
                }
            }));
            disposables.push(extHost.registerTypeDefinitionProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideTypeDefinition(doc) {
                    // duplicate result will get removed
                    return new types.Location(doc.uri, new types.Range(1, 0, 0, 0));
                }
            }));
            disposables.push(extHost.registerTypeDefinitionProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideTypeDefinition(doc) {
                    return [
                        new types.Location(doc.uri, new types.Range(2, 0, 0, 0)),
                        new types.Location(doc.uri, new types.Range(3, 0, 0, 0)),
                        new types.Location(doc.uri, new types.Range(4, 0, 0, 0)),
                    ];
                }
            }));
            return rpcProtocol.sync().then(() => {
                return commands.executeCommand('vscode.executeTypeDefinitionProvider', model.uri, new types.Position(0, 0)).then(values => {
                    assert.strictEqual(values.length, 4);
                    for (const v of values) {
                        assert.ok(v.uri instanceof uri_1.URI);
                        assert.ok(v.range instanceof types.Range);
                    }
                });
            });
        });
        test('Type Definition Link', () => {
            disposables.push(extHost.registerTypeDefinitionProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideTypeDefinition(doc) {
                    return [
                        new types.Location(doc.uri, new types.Range(0, 0, 0, 0)),
                        { targetUri: doc.uri, targetRange: new types.Range(1, 0, 0, 0), targetSelectionRange: new types.Range(1, 1, 1, 1), originSelectionRange: new types.Range(2, 2, 2, 2) }
                    ];
                }
            }));
            return rpcProtocol.sync().then(() => {
                return commands.executeCommand('vscode.executeTypeDefinitionProvider', model.uri, new types.Position(0, 0)).then(values => {
                    assert.strictEqual(values.length, 2);
                    for (const v of values) {
                        if (isLocation(v)) {
                            assert.ok(v.uri instanceof uri_1.URI);
                            assert.ok(v.range instanceof types.Range);
                        }
                        else {
                            assert.ok(v.targetUri instanceof uri_1.URI);
                            assert.ok(v.targetRange instanceof types.Range);
                            assert.ok(v.targetSelectionRange instanceof types.Range);
                            assert.ok(v.originSelectionRange instanceof types.Range);
                        }
                    }
                });
            });
        });
        // --- implementation
        test('Implementation, invalid arguments', function () {
            const promises = [
                assertRejects(() => commands.executeCommand('vscode.executeImplementationProvider')),
                assertRejects(() => commands.executeCommand('vscode.executeImplementationProvider', null)),
                assertRejects(() => commands.executeCommand('vscode.executeImplementationProvider', undefined)),
                assertRejects(() => commands.executeCommand('vscode.executeImplementationProvider', true, false))
            ];
            return Promise.all(promises);
        });
        test('Implementation, back and forth', function () {
            disposables.push(extHost.registerImplementationProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideImplementation(doc) {
                    return new types.Location(doc.uri, new types.Range(1, 0, 0, 0));
                }
            }));
            disposables.push(extHost.registerImplementationProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideImplementation(doc) {
                    // duplicate result will get removed
                    return new types.Location(doc.uri, new types.Range(1, 0, 0, 0));
                }
            }));
            disposables.push(extHost.registerImplementationProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideImplementation(doc) {
                    return [
                        new types.Location(doc.uri, new types.Range(2, 0, 0, 0)),
                        new types.Location(doc.uri, new types.Range(3, 0, 0, 0)),
                        new types.Location(doc.uri, new types.Range(4, 0, 0, 0)),
                    ];
                }
            }));
            return rpcProtocol.sync().then(() => {
                return commands.executeCommand('vscode.executeImplementationProvider', model.uri, new types.Position(0, 0)).then(values => {
                    assert.strictEqual(values.length, 4);
                    for (const v of values) {
                        assert.ok(v.uri instanceof uri_1.URI);
                        assert.ok(v.range instanceof types.Range);
                    }
                });
            });
        });
        test('Implementation Definition Link', () => {
            disposables.push(extHost.registerImplementationProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideImplementation(doc) {
                    return [
                        new types.Location(doc.uri, new types.Range(0, 0, 0, 0)),
                        { targetUri: doc.uri, targetRange: new types.Range(1, 0, 0, 0), targetSelectionRange: new types.Range(1, 1, 1, 1), originSelectionRange: new types.Range(2, 2, 2, 2) }
                    ];
                }
            }));
            return rpcProtocol.sync().then(() => {
                return commands.executeCommand('vscode.executeImplementationProvider', model.uri, new types.Position(0, 0)).then(values => {
                    assert.strictEqual(values.length, 2);
                    for (const v of values) {
                        if (isLocation(v)) {
                            assert.ok(v.uri instanceof uri_1.URI);
                            assert.ok(v.range instanceof types.Range);
                        }
                        else {
                            assert.ok(v.targetUri instanceof uri_1.URI);
                            assert.ok(v.targetRange instanceof types.Range);
                            assert.ok(v.targetSelectionRange instanceof types.Range);
                            assert.ok(v.originSelectionRange instanceof types.Range);
                        }
                    }
                });
            });
        });
        // --- references
        test('reference search, back and forth', function () {
            disposables.push(extHost.registerReferenceProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideReferences() {
                    return [
                        new types.Location(uri_1.URI.parse('some:uri/path'), new types.Range(0, 1, 0, 5))
                    ];
                }
            }));
            return commands.executeCommand('vscode.executeReferenceProvider', model.uri, new types.Position(0, 0)).then(values => {
                assert.strictEqual(values.length, 1);
                const [first] = values;
                assert.strictEqual(first.uri.toString(), 'some:uri/path');
                assert.strictEqual(first.range.start.line, 0);
                assert.strictEqual(first.range.start.character, 1);
                assert.strictEqual(first.range.end.line, 0);
                assert.strictEqual(first.range.end.character, 5);
            });
        });
        // --- outline
        test('Outline, back and forth', function () {
            disposables.push(extHost.registerDocumentSymbolProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideDocumentSymbols() {
                    return [
                        new types.SymbolInformation('testing1', types.SymbolKind.Enum, new types.Range(1, 0, 1, 0)),
                        new types.SymbolInformation('testing2', types.SymbolKind.Enum, new types.Range(0, 1, 0, 3)),
                    ];
                }
            }));
            return rpcProtocol.sync().then(() => {
                return commands.executeCommand('vscode.executeDocumentSymbolProvider', model.uri).then(values => {
                    assert.strictEqual(values.length, 2);
                    const [first, second] = values;
                    assert.strictEqual(first instanceof types.SymbolInformation, true);
                    assert.strictEqual(second instanceof types.SymbolInformation, true);
                    assert.strictEqual(first.name, 'testing2');
                    assert.strictEqual(second.name, 'testing1');
                });
            });
        });
        test('vscode.executeDocumentSymbolProvider command only returns SymbolInformation[] rather than DocumentSymbol[] #57984', function () {
            disposables.push(extHost.registerDocumentSymbolProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideDocumentSymbols() {
                    return [
                        new types.SymbolInformation('SymbolInformation', types.SymbolKind.Enum, new types.Range(1, 0, 1, 0))
                    ];
                }
            }));
            disposables.push(extHost.registerDocumentSymbolProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideDocumentSymbols() {
                    const root = new types.DocumentSymbol('DocumentSymbol', 'DocumentSymbol#detail', types.SymbolKind.Enum, new types.Range(1, 0, 1, 0), new types.Range(1, 0, 1, 0));
                    root.children = [new types.DocumentSymbol('DocumentSymbol#child', 'DocumentSymbol#detail#child', types.SymbolKind.Enum, new types.Range(1, 0, 1, 0), new types.Range(1, 0, 1, 0))];
                    return [root];
                }
            }));
            return rpcProtocol.sync().then(() => {
                return commands.executeCommand('vscode.executeDocumentSymbolProvider', model.uri).then(values => {
                    assert.strictEqual(values.length, 2);
                    const [first, second] = values;
                    assert.strictEqual(first instanceof types.SymbolInformation, true);
                    assert.strictEqual(first instanceof types.DocumentSymbol, false);
                    assert.strictEqual(second instanceof types.SymbolInformation, true);
                    assert.strictEqual(first.name, 'DocumentSymbol');
                    assert.strictEqual(first.children.length, 1);
                    assert.strictEqual(second.name, 'SymbolInformation');
                });
            });
        });
        // --- suggest
        test('triggerCharacter is null when completion provider is called programmatically #159914', async function () {
            let actualContext;
            disposables.push(extHost.registerCompletionItemProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideCompletionItems(_doc, _pos, _tok, context) {
                    actualContext = context;
                    return [];
                }
            }, []));
            await rpcProtocol.sync();
            await commands.executeCommand('vscode.executeCompletionItemProvider', model.uri, new types.Position(0, 4));
            assert.ok(actualContext);
            assert.deepStrictEqual(actualContext, { triggerKind: types.CompletionTriggerKind.Invoke, triggerCharacter: undefined });
        });
        test('Suggest, back and forth', function () {
            disposables.push(extHost.registerCompletionItemProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideCompletionItems() {
                    const a = new types.CompletionItem('item1');
                    a.documentation = new types.MarkdownString('hello_md_string');
                    const b = new types.CompletionItem('item2');
                    b.textEdit = types.TextEdit.replace(new types.Range(0, 4, 0, 8), 'foo'); // overwite after
                    const c = new types.CompletionItem('item3');
                    c.textEdit = types.TextEdit.replace(new types.Range(0, 1, 0, 6), 'foobar'); // overwite before & after
                    // snippet string!
                    const d = new types.CompletionItem('item4');
                    d.range = new types.Range(0, 1, 0, 4); // overwite before
                    d.insertText = new types.SnippetString('foo$0bar');
                    return [a, b, c, d];
                }
            }, []));
            return rpcProtocol.sync().then(() => {
                return commands.executeCommand('vscode.executeCompletionItemProvider', model.uri, new types.Position(0, 4)).then(list => {
                    assert.ok(list instanceof types.CompletionList);
                    const values = list.items;
                    assert.ok(Array.isArray(values));
                    assert.strictEqual(values.length, 4);
                    const [first, second, third, fourth] = values;
                    assert.strictEqual(first.label, 'item1');
                    assert.strictEqual(first.textEdit, undefined); // no text edit, default ranges
                    assert.ok(!types.Range.isRange(first.range));
                    assert.strictEqual(first.documentation.value, 'hello_md_string');
                    assert.strictEqual(second.label, 'item2');
                    assert.strictEqual(second.textEdit.newText, 'foo');
                    assert.strictEqual(second.textEdit.range.start.line, 0);
                    assert.strictEqual(second.textEdit.range.start.character, 4);
                    assert.strictEqual(second.textEdit.range.end.line, 0);
                    assert.strictEqual(second.textEdit.range.end.character, 8);
                    assert.strictEqual(third.label, 'item3');
                    assert.strictEqual(third.textEdit.newText, 'foobar');
                    assert.strictEqual(third.textEdit.range.start.line, 0);
                    assert.strictEqual(third.textEdit.range.start.character, 1);
                    assert.strictEqual(third.textEdit.range.end.line, 0);
                    assert.strictEqual(third.textEdit.range.end.character, 6);
                    assert.strictEqual(fourth.label, 'item4');
                    assert.strictEqual(fourth.textEdit, undefined);
                    const range = fourth.range;
                    assert.ok(types.Range.isRange(range));
                    assert.strictEqual(range.start.line, 0);
                    assert.strictEqual(range.start.character, 1);
                    assert.strictEqual(range.end.line, 0);
                    assert.strictEqual(range.end.character, 4);
                    assert.ok(fourth.insertText instanceof types.SnippetString);
                    assert.strictEqual(fourth.insertText.value, 'foo$0bar');
                });
            });
        });
        test('Suggest, return CompletionList !array', function () {
            disposables.push(extHost.registerCompletionItemProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideCompletionItems() {
                    const a = new types.CompletionItem('item1');
                    const b = new types.CompletionItem('item2');
                    return new types.CompletionList([a, b], true);
                }
            }, []));
            return rpcProtocol.sync().then(() => {
                return commands.executeCommand('vscode.executeCompletionItemProvider', model.uri, new types.Position(0, 4)).then(list => {
                    assert.ok(list instanceof types.CompletionList);
                    assert.strictEqual(list.isIncomplete, true);
                });
            });
        });
        test('Suggest, resolve completion items', async function () {
            let resolveCount = 0;
            disposables.push(extHost.registerCompletionItemProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideCompletionItems() {
                    const a = new types.CompletionItem('item1');
                    const b = new types.CompletionItem('item2');
                    const c = new types.CompletionItem('item3');
                    const d = new types.CompletionItem('item4');
                    return new types.CompletionList([a, b, c, d], false);
                },
                resolveCompletionItem(item) {
                    resolveCount += 1;
                    return item;
                }
            }, []));
            await rpcProtocol.sync();
            const list = await commands.executeCommand('vscode.executeCompletionItemProvider', model.uri, new types.Position(0, 4), undefined, 2 // maxItemsToResolve
            );
            assert.ok(list instanceof types.CompletionList);
            assert.strictEqual(resolveCount, 2);
        });
        test('"vscode.executeCompletionItemProvider" doesnot return a preselect field #53749', async function () {
            disposables.push(extHost.registerCompletionItemProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideCompletionItems() {
                    const a = new types.CompletionItem('item1');
                    a.preselect = true;
                    const b = new types.CompletionItem('item2');
                    const c = new types.CompletionItem('item3');
                    c.preselect = true;
                    const d = new types.CompletionItem('item4');
                    return new types.CompletionList([a, b, c, d], false);
                }
            }, []));
            await rpcProtocol.sync();
            const list = await commands.executeCommand('vscode.executeCompletionItemProvider', model.uri, new types.Position(0, 4), undefined);
            assert.ok(list instanceof types.CompletionList);
            assert.strictEqual(list.items.length, 4);
            const [a, b, c, d] = list.items;
            assert.strictEqual(a.preselect, true);
            assert.strictEqual(b.preselect, undefined);
            assert.strictEqual(c.preselect, true);
            assert.strictEqual(d.preselect, undefined);
        });
        test('executeCompletionItemProvider doesn\'t capture commitCharacters #58228', async function () {
            disposables.push(extHost.registerCompletionItemProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideCompletionItems() {
                    const a = new types.CompletionItem('item1');
                    a.commitCharacters = ['a', 'b'];
                    const b = new types.CompletionItem('item2');
                    return new types.CompletionList([a, b], false);
                }
            }, []));
            await rpcProtocol.sync();
            const list = await commands.executeCommand('vscode.executeCompletionItemProvider', model.uri, new types.Position(0, 4), undefined);
            assert.ok(list instanceof types.CompletionList);
            assert.strictEqual(list.items.length, 2);
            const [a, b] = list.items;
            assert.deepStrictEqual(a.commitCharacters, ['a', 'b']);
            assert.strictEqual(b.commitCharacters, undefined);
        });
        test('vscode.executeCompletionItemProvider returns the wrong CompletionItemKinds in insiders #95715', async function () {
            disposables.push(extHost.registerCompletionItemProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideCompletionItems() {
                    return [
                        new types.CompletionItem('My Method', types.CompletionItemKind.Method),
                        new types.CompletionItem('My Property', types.CompletionItemKind.Property),
                    ];
                }
            }, []));
            await rpcProtocol.sync();
            const list = await commands.executeCommand('vscode.executeCompletionItemProvider', model.uri, new types.Position(0, 4), undefined);
            assert.ok(list instanceof types.CompletionList);
            assert.strictEqual(list.items.length, 2);
            const [a, b] = list.items;
            assert.strictEqual(a.kind, types.CompletionItemKind.Method);
            assert.strictEqual(b.kind, types.CompletionItemKind.Property);
        });
        // --- signatureHelp
        test('Parameter Hints, back and forth', async () => {
            disposables.push(extHost.registerSignatureHelpProvider(extensions_1.nullExtensionDescription, defaultSelector, new class {
                provideSignatureHelp(_document, _position, _token, context) {
                    return {
                        activeSignature: 0,
                        activeParameter: 1,
                        signatures: [
                            {
                                label: 'abc',
                                documentation: `${context.triggerKind === 1 /* vscode.SignatureHelpTriggerKind.Invoke */ ? 'invoked' : 'unknown'} ${context.triggerCharacter}`,
                                parameters: []
                            }
                        ]
                    };
                }
            }, []));
            await rpcProtocol.sync();
            const firstValue = await commands.executeCommand('vscode.executeSignatureHelpProvider', model.uri, new types.Position(0, 1), ',');
            assert.strictEqual(firstValue.activeSignature, 0);
            assert.strictEqual(firstValue.activeParameter, 1);
            assert.strictEqual(firstValue.signatures.length, 1);
            assert.strictEqual(firstValue.signatures[0].label, 'abc');
            assert.strictEqual(firstValue.signatures[0].documentation, 'invoked ,');
        });
        // --- quickfix
        test('QuickFix, back and forth', function () {
            disposables.push(extHost.registerCodeActionProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideCodeActions() {
                    return [{ command: 'testing', title: 'Title', arguments: [1, 2, true] }];
                }
            }));
            return rpcProtocol.sync().then(() => {
                return commands.executeCommand('vscode.executeCodeActionProvider', model.uri, new types.Range(0, 0, 1, 1)).then(value => {
                    assert.strictEqual(value.length, 1);
                    const [first] = value;
                    assert.strictEqual(first.title, 'Title');
                    assert.strictEqual(first.command, 'testing');
                    assert.deepStrictEqual(first.arguments, [1, 2, true]);
                });
            });
        });
        test('vscode.executeCodeActionProvider results seem to be missing their `command` property #45124', function () {
            disposables.push(extHost.registerCodeActionProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideCodeActions(document, range) {
                    return [{
                            command: {
                                arguments: [document, range],
                                command: 'command',
                                title: 'command_title',
                            },
                            kind: types.CodeActionKind.Empty.append('foo'),
                            title: 'title',
                        }];
                }
            }));
            return rpcProtocol.sync().then(() => {
                return commands.executeCommand('vscode.executeCodeActionProvider', model.uri, new types.Range(0, 0, 1, 1)).then(value => {
                    assert.strictEqual(value.length, 1);
                    const [first] = value;
                    assert.ok(first.command);
                    assert.strictEqual(first.command.command, 'command');
                    assert.strictEqual(first.command.title, 'command_title');
                    assert.strictEqual(first.kind.value, 'foo');
                    assert.strictEqual(first.title, 'title');
                });
            });
        });
        test('vscode.executeCodeActionProvider passes Range to provider although Selection is passed in #77997', function () {
            disposables.push(extHost.registerCodeActionProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideCodeActions(document, rangeOrSelection) {
                    return [{
                            command: {
                                arguments: [document, rangeOrSelection],
                                command: 'command',
                                title: 'command_title',
                            },
                            kind: types.CodeActionKind.Empty.append('foo'),
                            title: 'title',
                        }];
                }
            }));
            const selection = new types.Selection(0, 0, 1, 1);
            return rpcProtocol.sync().then(() => {
                return commands.executeCommand('vscode.executeCodeActionProvider', model.uri, selection).then(value => {
                    assert.strictEqual(value.length, 1);
                    const [first] = value;
                    assert.ok(first.command);
                    assert.ok(first.command.arguments[1] instanceof types.Selection);
                    assert.ok(first.command.arguments[1].isEqual(selection));
                });
            });
        });
        test('vscode.executeCodeActionProvider results seem to be missing their `isPreferred` property #78098', function () {
            disposables.push(extHost.registerCodeActionProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideCodeActions(document, rangeOrSelection) {
                    return [{
                            command: {
                                arguments: [document, rangeOrSelection],
                                command: 'command',
                                title: 'command_title',
                            },
                            kind: types.CodeActionKind.Empty.append('foo'),
                            title: 'title',
                            isPreferred: true
                        }];
                }
            }));
            const selection = new types.Selection(0, 0, 1, 1);
            return rpcProtocol.sync().then(() => {
                return commands.executeCommand('vscode.executeCodeActionProvider', model.uri, selection).then(value => {
                    assert.strictEqual(value.length, 1);
                    const [first] = value;
                    assert.strictEqual(first.isPreferred, true);
                });
            });
        });
        test('resolving code action', async function () {
            let didCallResolve = 0;
            class MyAction extends types.CodeAction {
            }
            disposables.push(extHost.registerCodeActionProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideCodeActions(document, rangeOrSelection) {
                    return [new MyAction('title', types.CodeActionKind.Empty.append('foo'))];
                },
                resolveCodeAction(action) {
                    assert.ok(action instanceof MyAction);
                    didCallResolve += 1;
                    action.title = 'resolved title';
                    action.edit = new types.WorkspaceEdit();
                    return action;
                }
            }));
            const selection = new types.Selection(0, 0, 1, 1);
            await rpcProtocol.sync();
            const value = await commands.executeCommand('vscode.executeCodeActionProvider', model.uri, selection, undefined, 1000);
            assert.strictEqual(didCallResolve, 1);
            assert.strictEqual(value.length, 1);
            const [first] = value;
            assert.strictEqual(first.title, 'title'); // does NOT change
            assert.ok(first.edit); // is set
        });
        // --- code lens
        test('CodeLens, back and forth', function () {
            const complexArg = {
                foo() { },
                bar() { },
                big: extHost
            };
            disposables.push(extHost.registerCodeLensProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideCodeLenses() {
                    return [new types.CodeLens(new types.Range(0, 0, 1, 1), { title: 'Title', command: 'cmd', arguments: [1, true, complexArg] })];
                }
            }));
            return rpcProtocol.sync().then(() => {
                return commands.executeCommand('vscode.executeCodeLensProvider', model.uri).then(value => {
                    assert.strictEqual(value.length, 1);
                    const [first] = value;
                    assert.strictEqual(first.command.title, 'Title');
                    assert.strictEqual(first.command.command, 'cmd');
                    assert.strictEqual(first.command.arguments[0], 1);
                    assert.strictEqual(first.command.arguments[1], true);
                    assert.strictEqual(first.command.arguments[2], complexArg);
                });
            });
        });
        test('CodeLens, resolve', async function () {
            let resolveCount = 0;
            disposables.push(extHost.registerCodeLensProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideCodeLenses() {
                    return [
                        new types.CodeLens(new types.Range(0, 0, 1, 1)),
                        new types.CodeLens(new types.Range(0, 0, 1, 1)),
                        new types.CodeLens(new types.Range(0, 0, 1, 1)),
                        new types.CodeLens(new types.Range(0, 0, 1, 1), { title: 'Already resolved', command: 'fff' })
                    ];
                },
                resolveCodeLens(codeLens) {
                    codeLens.command = { title: resolveCount.toString(), command: 'resolved' };
                    resolveCount += 1;
                    return codeLens;
                }
            }));
            await rpcProtocol.sync();
            let value = await commands.executeCommand('vscode.executeCodeLensProvider', model.uri, 2);
            assert.strictEqual(value.length, 3); // the resolve argument defines the number of results being returned
            assert.strictEqual(resolveCount, 2);
            resolveCount = 0;
            value = await commands.executeCommand('vscode.executeCodeLensProvider', model.uri);
            assert.strictEqual(value.length, 4);
            assert.strictEqual(resolveCount, 0);
        });
        test('Links, back and forth', function () {
            disposables.push(extHost.registerDocumentLinkProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideDocumentLinks() {
                    return [new types.DocumentLink(new types.Range(0, 0, 0, 20), uri_1.URI.parse('foo:bar'))];
                }
            }));
            return rpcProtocol.sync().then(() => {
                return commands.executeCommand('vscode.executeLinkProvider', model.uri).then(value => {
                    assert.strictEqual(value.length, 1);
                    const [first] = value;
                    assert.strictEqual(first.target + '', 'foo:bar');
                    assert.strictEqual(first.range.start.line, 0);
                    assert.strictEqual(first.range.start.character, 0);
                    assert.strictEqual(first.range.end.line, 0);
                    assert.strictEqual(first.range.end.character, 20);
                });
            });
        });
        test('What\'s the condition for DocumentLink target to be undefined? #106308', async function () {
            disposables.push(extHost.registerDocumentLinkProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideDocumentLinks() {
                    return [new types.DocumentLink(new types.Range(0, 0, 0, 20), undefined)];
                },
                resolveDocumentLink(link) {
                    link.target = uri_1.URI.parse('foo:bar');
                    return link;
                }
            }));
            await rpcProtocol.sync();
            const links1 = await commands.executeCommand('vscode.executeLinkProvider', model.uri);
            assert.strictEqual(links1.length, 1);
            assert.strictEqual(links1[0].target, undefined);
            const links2 = await commands.executeCommand('vscode.executeLinkProvider', model.uri, 1000);
            assert.strictEqual(links2.length, 1);
            assert.strictEqual(links2[0].target.toString(), uri_1.URI.parse('foo:bar').toString());
        });
        test('Color provider', function () {
            disposables.push(extHost.registerColorProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideDocumentColors() {
                    return [new types.ColorInformation(new types.Range(0, 0, 0, 20), new types.Color(0.1, 0.2, 0.3, 0.4))];
                },
                provideColorPresentations() {
                    const cp = new types.ColorPresentation('#ABC');
                    cp.textEdit = types.TextEdit.replace(new types.Range(1, 0, 1, 20), '#ABC');
                    cp.additionalTextEdits = [types.TextEdit.insert(new types.Position(2, 20), '*')];
                    return [cp];
                }
            }));
            return rpcProtocol.sync().then(() => {
                return commands.executeCommand('vscode.executeDocumentColorProvider', model.uri).then(value => {
                    assert.strictEqual(value.length, 1);
                    const [first] = value;
                    assert.strictEqual(first.color.red, 0.1);
                    assert.strictEqual(first.color.green, 0.2);
                    assert.strictEqual(first.color.blue, 0.3);
                    assert.strictEqual(first.color.alpha, 0.4);
                    assert.strictEqual(first.range.start.line, 0);
                    assert.strictEqual(first.range.start.character, 0);
                    assert.strictEqual(first.range.end.line, 0);
                    assert.strictEqual(first.range.end.character, 20);
                });
            }).then(() => {
                const color = new types.Color(0.5, 0.6, 0.7, 0.8);
                const range = new types.Range(0, 0, 0, 20);
                return commands.executeCommand('vscode.executeColorPresentationProvider', color, { uri: model.uri, range }).then(value => {
                    assert.strictEqual(value.length, 1);
                    const [first] = value;
                    assert.strictEqual(first.label, '#ABC');
                    assert.strictEqual(first.textEdit.newText, '#ABC');
                    assert.strictEqual(first.textEdit.range.start.line, 1);
                    assert.strictEqual(first.textEdit.range.start.character, 0);
                    assert.strictEqual(first.textEdit.range.end.line, 1);
                    assert.strictEqual(first.textEdit.range.end.character, 20);
                    assert.strictEqual(first.additionalTextEdits.length, 1);
                    assert.strictEqual(first.additionalTextEdits[0].range.start.line, 2);
                    assert.strictEqual(first.additionalTextEdits[0].range.start.character, 20);
                    assert.strictEqual(first.additionalTextEdits[0].range.end.line, 2);
                    assert.strictEqual(first.additionalTextEdits[0].range.end.character, 20);
                });
            });
        });
        test('"TypeError: e.onCancellationRequested is not a function" calling hover provider in Insiders #54174', function () {
            disposables.push(extHost.registerHoverProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideHover() {
                    return new types.Hover('fofofofo');
                }
            }));
            return rpcProtocol.sync().then(() => {
                return commands.executeCommand('vscode.executeHoverProvider', model.uri, new types.Position(1, 1)).then(value => {
                    assert.strictEqual(value.length, 1);
                    assert.strictEqual(value[0].contents.length, 1);
                });
            });
        });
        // --- inline hints
        test('Inlay Hints, back and forth', async function () {
            disposables.push(extHost.registerInlayHintsProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideInlayHints() {
                    return [new types.InlayHint(new types.Position(0, 1), 'Foo')];
                }
            }));
            await rpcProtocol.sync();
            const value = await commands.executeCommand('vscode.executeInlayHintProvider', model.uri, new types.Range(0, 0, 20, 20));
            assert.strictEqual(value.length, 1);
            const [first] = value;
            assert.strictEqual(first.label, 'Foo');
            assert.strictEqual(first.position.line, 0);
            assert.strictEqual(first.position.character, 1);
        });
        test('Inline Hints, merge', async function () {
            disposables.push(extHost.registerInlayHintsProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideInlayHints() {
                    const part = new types.InlayHintLabelPart('Bar');
                    part.tooltip = 'part_tooltip';
                    part.command = { command: 'cmd', title: 'part' };
                    const hint = new types.InlayHint(new types.Position(10, 11), [part]);
                    hint.tooltip = 'hint_tooltip';
                    hint.paddingLeft = true;
                    hint.paddingRight = false;
                    return [hint];
                }
            }));
            disposables.push(extHost.registerInlayHintsProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideInlayHints() {
                    const hint = new types.InlayHint(new types.Position(0, 1), 'Foo', types.InlayHintKind.Parameter);
                    hint.textEdits = [types.TextEdit.insert(new types.Position(0, 0), 'Hello')];
                    return [hint];
                }
            }));
            await rpcProtocol.sync();
            const value = await commands.executeCommand('vscode.executeInlayHintProvider', model.uri, new types.Range(0, 0, 20, 20));
            assert.strictEqual(value.length, 2);
            const [first, second] = value;
            assert.strictEqual(first.label, 'Foo');
            assert.strictEqual(first.position.line, 0);
            assert.strictEqual(first.position.character, 1);
            assert.strictEqual(first.textEdits?.length, 1);
            assert.strictEqual(first.textEdits[0].newText, 'Hello');
            assert.strictEqual(second.position.line, 10);
            assert.strictEqual(second.position.character, 11);
            assert.strictEqual(second.paddingLeft, true);
            assert.strictEqual(second.paddingRight, false);
            assert.strictEqual(second.tooltip, 'hint_tooltip');
            const label = second.label[0];
            (0, types_1.assertType)(label instanceof types.InlayHintLabelPart);
            assert.strictEqual(label.value, 'Bar');
            assert.strictEqual(label.tooltip, 'part_tooltip');
            assert.strictEqual(label.command?.command, 'cmd');
            assert.strictEqual(label.command?.title, 'part');
        });
        test('Inline Hints, bad provider', async function () {
            disposables.push(extHost.registerInlayHintsProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideInlayHints() {
                    return [new types.InlayHint(new types.Position(0, 1), 'Foo')];
                }
            }));
            disposables.push(extHost.registerInlayHintsProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideInlayHints() {
                    throw new Error();
                }
            }));
            await rpcProtocol.sync();
            const value = await commands.executeCommand('vscode.executeInlayHintProvider', model.uri, new types.Range(0, 0, 20, 20));
            assert.strictEqual(value.length, 1);
            const [first] = value;
            assert.strictEqual(first.label, 'Foo');
            assert.strictEqual(first.position.line, 0);
            assert.strictEqual(first.position.character, 1);
        });
        // --- selection ranges
        test('Selection Range, back and forth', async function () {
            disposables.push(extHost.registerSelectionRangeProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideSelectionRanges() {
                    return [
                        new types.SelectionRange(new types.Range(0, 10, 0, 18), new types.SelectionRange(new types.Range(0, 2, 0, 20))),
                    ];
                }
            }));
            await rpcProtocol.sync();
            const value = await commands.executeCommand('vscode.executeSelectionRangeProvider', model.uri, [new types.Position(0, 10)]);
            assert.strictEqual(value.length, 1);
            assert.ok(value[0].parent);
        });
        // --- call hierarchy
        test('CallHierarchy, back and forth', async function () {
            disposables.push(extHost.registerCallHierarchyProvider(extensions_1.nullExtensionDescription, defaultSelector, new class {
                prepareCallHierarchy(document, position) {
                    return new types.CallHierarchyItem(types.SymbolKind.Constant, 'ROOT', 'ROOT', document.uri, new types.Range(0, 0, 0, 0), new types.Range(0, 0, 0, 0));
                }
                provideCallHierarchyIncomingCalls(item, token) {
                    return [new types.CallHierarchyIncomingCall(new types.CallHierarchyItem(types.SymbolKind.Constant, 'INCOMING', 'INCOMING', item.uri, new types.Range(0, 0, 0, 0), new types.Range(0, 0, 0, 0)), [new types.Range(0, 0, 0, 0)])];
                }
                provideCallHierarchyOutgoingCalls(item, token) {
                    return [new types.CallHierarchyOutgoingCall(new types.CallHierarchyItem(types.SymbolKind.Constant, 'OUTGOING', 'OUTGOING', item.uri, new types.Range(0, 0, 0, 0), new types.Range(0, 0, 0, 0)), [new types.Range(0, 0, 0, 0)])];
                }
            }));
            await rpcProtocol.sync();
            const root = await commands.executeCommand('vscode.prepareCallHierarchy', model.uri, new types.Position(0, 0));
            assert.ok(Array.isArray(root));
            assert.strictEqual(root.length, 1);
            assert.strictEqual(root[0].name, 'ROOT');
            const incoming = await commands.executeCommand('vscode.provideIncomingCalls', root[0]);
            assert.strictEqual(incoming.length, 1);
            assert.strictEqual(incoming[0].from.name, 'INCOMING');
            const outgoing = await commands.executeCommand('vscode.provideOutgoingCalls', root[0]);
            assert.strictEqual(outgoing.length, 1);
            assert.strictEqual(outgoing[0].to.name, 'OUTGOING');
        });
        test('prepareCallHierarchy throws TypeError if clangd returns empty result #137415', async function () {
            disposables.push(extHost.registerCallHierarchyProvider(extensions_1.nullExtensionDescription, defaultSelector, new class {
                prepareCallHierarchy(document, position) {
                    return [];
                }
                provideCallHierarchyIncomingCalls(item, token) {
                    return [];
                }
                provideCallHierarchyOutgoingCalls(item, token) {
                    return [];
                }
            }));
            await rpcProtocol.sync();
            const root = await commands.executeCommand('vscode.prepareCallHierarchy', model.uri, new types.Position(0, 0));
            assert.ok(Array.isArray(root));
            assert.strictEqual(root.length, 0);
        });
        // --- type hierarchy
        test('TypeHierarchy, back and forth', async function () {
            disposables.push(extHost.registerTypeHierarchyProvider(extensions_1.nullExtensionDescription, defaultSelector, new class {
                prepareTypeHierarchy(document, position, token) {
                    return [new types.TypeHierarchyItem(types.SymbolKind.Constant, 'ROOT', 'ROOT', document.uri, new types.Range(0, 0, 0, 0), new types.Range(0, 0, 0, 0))];
                }
                provideTypeHierarchySupertypes(item, token) {
                    return [new types.TypeHierarchyItem(types.SymbolKind.Constant, 'SUPER', 'SUPER', item.uri, new types.Range(0, 0, 0, 0), new types.Range(0, 0, 0, 0))];
                }
                provideTypeHierarchySubtypes(item, token) {
                    return [new types.TypeHierarchyItem(types.SymbolKind.Constant, 'SUB', 'SUB', item.uri, new types.Range(0, 0, 0, 0), new types.Range(0, 0, 0, 0))];
                }
            }));
            await rpcProtocol.sync();
            const root = await commands.executeCommand('vscode.prepareTypeHierarchy', model.uri, new types.Position(0, 0));
            assert.ok(Array.isArray(root));
            assert.strictEqual(root.length, 1);
            assert.strictEqual(root[0].name, 'ROOT');
            const incoming = await commands.executeCommand('vscode.provideSupertypes', root[0]);
            assert.strictEqual(incoming.length, 1);
            assert.strictEqual(incoming[0].name, 'SUPER');
            const outgoing = await commands.executeCommand('vscode.provideSubtypes', root[0]);
            assert.strictEqual(outgoing.length, 1);
            assert.strictEqual(outgoing[0].name, 'SUB');
        });
        test('selectionRangeProvider on inner array always returns outer array #91852', async function () {
            disposables.push(extHost.registerSelectionRangeProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideSelectionRanges(_doc, positions) {
                    const [first] = positions;
                    return [
                        new types.SelectionRange(new types.Range(first.line, first.character, first.line, first.character)),
                    ];
                }
            }));
            await rpcProtocol.sync();
            const value = await commands.executeCommand('vscode.executeSelectionRangeProvider', model.uri, [new types.Position(0, 10)]);
            assert.strictEqual(value.length, 1);
            assert.strictEqual(value[0].range.start.line, 0);
            assert.strictEqual(value[0].range.start.character, 10);
            assert.strictEqual(value[0].range.end.line, 0);
            assert.strictEqual(value[0].range.end.character, 10);
        });
        test('more element test of selectionRangeProvider on inner array always returns outer array #91852', async function () {
            disposables.push(extHost.registerSelectionRangeProvider(extensions_1.nullExtensionDescription, defaultSelector, {
                provideSelectionRanges(_doc, positions) {
                    const [first, second] = positions;
                    return [
                        new types.SelectionRange(new types.Range(first.line, first.character, first.line, first.character)),
                        new types.SelectionRange(new types.Range(second.line, second.character, second.line, second.character)),
                    ];
                }
            }));
            await rpcProtocol.sync();
            const value = await commands.executeCommand('vscode.executeSelectionRangeProvider', model.uri, [new types.Position(0, 0), new types.Position(0, 10)]);
            assert.strictEqual(value.length, 2);
            assert.strictEqual(value[0].range.start.line, 0);
            assert.strictEqual(value[0].range.start.character, 0);
            assert.strictEqual(value[0].range.end.line, 0);
            assert.strictEqual(value[0].range.end.character, 0);
            assert.strictEqual(value[1].range.start.line, 0);
            assert.strictEqual(value[1].range.start.character, 10);
            assert.strictEqual(value[1].range.end.line, 0);
            assert.strictEqual(value[1].range.end.character, 10);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdEFwaUNvbW1hbmRzLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL3Rlc3QvYnJvd3Nlci9leHRIb3N0QXBpQ29tbWFuZHMudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQStEaEcsU0FBUyxhQUFhLENBQUMsRUFBc0IsRUFBRSxVQUFrQixvQkFBb0I7UUFDcEYsT0FBTyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDNUUsQ0FBQztJQUVELFNBQVMsVUFBVSxDQUFDLEtBQTRDO1FBQy9ELE1BQU0sU0FBUyxHQUFHLEtBQXdCLENBQUM7UUFDM0MsT0FBTyxTQUFTLElBQUksU0FBUyxDQUFDLEdBQUcsWUFBWSxTQUFHLElBQUksU0FBUyxDQUFDLEtBQUssWUFBWSxLQUFLLENBQUMsS0FBSyxDQUFDO0lBQzVGLENBQUM7SUFFRCxLQUFLLENBQUMsZ0NBQWdDLEVBQUU7UUFDdkMsTUFBTSxlQUFlLEdBQUcsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUM7UUFDMUMsSUFBSSxLQUFpQixDQUFDO1FBRXRCLElBQUksV0FBNEIsQ0FBQztRQUNqQyxJQUFJLE9BQWdDLENBQUM7UUFDckMsSUFBSSxVQUFzQyxDQUFDO1FBQzNDLElBQUksUUFBeUIsQ0FBQztRQUM5QixJQUFJLFdBQVcsR0FBd0IsRUFBRSxDQUFDO1FBRTFDLElBQUksb0JBQXFDLENBQUM7UUFFMUMsVUFBVSxDQUFDLEdBQUcsRUFBRTtZQUNmLEtBQUssR0FBRyxJQUFBLCtCQUFlLEVBQ3RCO2dCQUNDLHdCQUF3QjtnQkFDeEIs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QUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2pELE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3RELE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQy9DLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3BELE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2pELE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZELE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQy9DLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3RELENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUMifQ==