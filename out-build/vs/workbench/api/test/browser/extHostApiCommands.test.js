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
        return candidate && candidate.uri instanceof uri_1.URI && candidate.range instanceof types.$5J;
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
            model = (0, testTextModel_1.$O0b)([
                'This is the first line',
                'This is the second line',
                'This is the third line',
            ].join('\n'), undefined, undefined, uri_1.URI.parse('far://testing/file.b'));
            originalErrorHandler = errors_1.$V.getUnexpectedErrorHandler();
            (0, errors_1.setUnexpectedErrorHandler)(() => { });
            // Use IInstantiationService to get typechecking when instantiating
            rpcProtocol = new testRPCProtocol_1.$3dc();
            const services = new serviceCollection_1.$zh();
            services.set(uriIdentity_1.$Ck, new class extends (0, mock_1.$rT)() {
                asCanonicalUri(uri) {
                    return uri;
                }
            });
            services.set(languageFeatures_1.$hF, new descriptors_1.$yh(languageFeaturesService_1.$oBb));
            services.set(extensions_1.$MF, new class extends (0, mock_1.$rT)() {
                async activateByEvent() {
                }
                activationEventIsDone(activationEvent) {
                    return true;
                }
            });
            services.set(commands_1.$Fr, new descriptors_1.$yh(class extends (0, mock_1.$rT)() {
                executeCommand(id, ...args) {
                    const command = commands_1.$Gr.getCommands().get(id);
                    if (!command) {
                        return Promise.reject(new Error(id + ' NOT known'));
                    }
                    const { handler } = command;
                    return Promise.resolve(insta.invokeFunction(handler, ...args));
                }
            }));
            services.set(environment_1.$Ih, new class extends (0, mock_1.$rT)() {
                constructor() {
                    super(...arguments);
                    this.isBuilt = true;
                    this.isExtensionDevelopment = false;
                }
            });
            services.set(markers_1.$3s, new markerService_1.$MBb());
            services.set(log_1.$5i, new descriptors_1.$yh(log_1.$fj));
            services.set(languageFeatureDebounce_1.$52, new descriptors_1.$yh(languageFeatureDebounce_1.$62));
            services.set(model_1.$yA, new class extends (0, mock_1.$rT)() {
                constructor() {
                    super(...arguments);
                    this.onModelRemoved = event_1.Event.None;
                }
                getModel() { return model; }
            });
            services.set(resolverService_1.$uA, new class extends (0, mock_1.$rT)() {
                async createModelReference() {
                    return new lifecycle_1.$qc(new class extends (0, mock_1.$rT)() {
                        constructor() {
                            super(...arguments);
                            this.textEditorModel = model;
                        }
                    });
                }
            });
            services.set(editorWorker_1.$4Y, new class extends (0, mock_1.$rT)() {
                async computeMoreMinimalEdits(_uri, edits) {
                    return edits || undefined;
                }
            });
            services.set(languageFeatureDebounce_1.$52, new descriptors_1.$yh(languageFeatureDebounce_1.$62));
            services.set(outlineModel_1.$R8, new descriptors_1.$yh(outlineModel_1.$S8));
            services.set(configuration_1.$8h, new testConfigurationService_1.$G0b());
            const insta = new instantiationService_1.$6p(services);
            const extHostDocumentsAndEditors = new extHostDocumentsAndEditors_1.$_L(rpcProtocol, new log_1.$fj());
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
            const extHostDocuments = new extHostDocuments_1.$7ac(rpcProtocol, extHostDocumentsAndEditors);
            rpcProtocol.set(extHost_protocol_1.$2J.ExtHostDocuments, extHostDocuments);
            commands = new extHostCommands_1.$kM(rpcProtocol, new log_1.$fj(), new class extends (0, mock_1.$rT)() {
                onExtensionError() {
                    return true;
                }
            });
            rpcProtocol.set(extHost_protocol_1.$2J.ExtHostCommands, commands);
            rpcProtocol.set(extHost_protocol_1.$1J.MainThreadCommands, insta.createInstance(mainThreadCommands_1.$ycb, rpcProtocol));
            extHostApiCommands_1.$dbc.register(commands);
            const diagnostics = new extHostDiagnostics_1.$$ac(rpcProtocol, new log_1.$fj(), new class extends (0, mock_1.$rT)() {
            }, extHostDocumentsAndEditors);
            rpcProtocol.set(extHost_protocol_1.$2J.ExtHostDiagnostics, diagnostics);
            extHost = new extHostLanguageFeatures_1.$cbc(rpcProtocol, new extHostUriTransformerService_1.$hbc(null), extHostDocuments, commands, diagnostics, new log_1.$fj(), extHostApiDeprecationService_1.$bbc, new class extends (0, mock_1.$rT)() {
                onExtensionError() {
                    return true;
                }
            });
            rpcProtocol.set(extHost_protocol_1.$2J.ExtHostLanguageFeatures, extHost);
            mainThread = rpcProtocol.set(extHost_protocol_1.$1J.MainThreadLanguageFeatures, insta.createInstance(mainThreadLanguageFeatures_1.$skb, rpcProtocol));
            return rpcProtocol.sync();
        });
        suiteTeardown(() => {
            (0, errors_1.setUnexpectedErrorHandler)(originalErrorHandler);
            model.dispose();
            mainThread.dispose();
        });
        teardown(() => {
            disposables = (0, lifecycle_1.$fc)(disposables);
            return rpcProtocol.sync();
        });
        (0, files_1.$gk)();
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
            disposables.push(extHost.registerWorkspaceSymbolProvider(extensions_1.$KF, {
                provideWorkspaceSymbols(query) {
                    return [
                        new types.$hK(query, types.SymbolKind.Array, new types.$5J(0, 0, 1, 1), uri_1.URI.parse('far://testing/first')),
                        new types.$hK(query, types.SymbolKind.Array, new types.$5J(0, 0, 1, 1), uri_1.URI.parse('far://testing/second'))
                    ];
                }
            }));
            disposables.push(extHost.registerWorkspaceSymbolProvider(extensions_1.$KF, {
                provideWorkspaceSymbols(query) {
                    return [
                        new types.$hK(query, types.SymbolKind.Array, new types.$5J(0, 0, 1, 1), uri_1.URI.parse('far://testing/first'))
                    ];
                }
            }));
            return rpcProtocol.sync().then(() => {
                return commands.executeCommand('vscode.executeWorkspaceSymbolProvider', 'testing').then(value => {
                    assert.strictEqual(value.length, 2); // de-duped
                    for (const info of value) {
                        assert.strictEqual(info instanceof types.$hK, true);
                        assert.strictEqual(info.name, 'testing');
                        assert.strictEqual(info.kind, types.SymbolKind.Array);
                    }
                });
            });
        });
        test('executeWorkspaceSymbolProvider should accept empty string, #39522', async function () {
            disposables.push(extHost.registerWorkspaceSymbolProvider(extensions_1.$KF, {
                provideWorkspaceSymbols() {
                    return [new types.$hK('hello', types.SymbolKind.Array, new types.$5J(0, 0, 0, 0), uri_1.URI.parse('foo:bar'))];
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
            disposables.push(extHost.registerDocumentFormattingEditProvider(extensions_1.$KF, defaultSelector, new class {
                provideDocumentFormattingEdits() {
                    return [types.$0J.insert(new types.$4J(0, 0), '42')];
                }
            }));
            await rpcProtocol.sync();
            const edits = await commands.executeCommand('vscode.executeFormatDocumentProvider', model.uri);
            assert.strictEqual(edits.length, 1);
        });
        // --- rename
        test('vscode.prepareRename', async function () {
            disposables.push(extHost.registerRenameProvider(extensions_1.$KF, defaultSelector, new class {
                prepareRename(document, position) {
                    return {
                        range: new types.$5J(0, 12, 0, 24),
                        placeholder: 'foooPlaceholder'
                    };
                }
                provideRenameEdits(document, position, newName) {
                    const edit = new types.$aK();
                    edit.insert(document.uri, position, newName);
                    return edit;
                }
            }));
            await rpcProtocol.sync();
            const data = await commands.executeCommand('vscode.prepareRename', model.uri, new types.$4J(0, 12));
            assert.ok(data);
            assert.strictEqual(data.placeholder, 'foooPlaceholder');
            assert.strictEqual(data.range.start.line, 0);
            assert.strictEqual(data.range.start.character, 12);
            assert.strictEqual(data.range.end.line, 0);
            assert.strictEqual(data.range.end.character, 24);
        });
        test('vscode.executeDocumentRenameProvider', async function () {
            disposables.push(extHost.registerRenameProvider(extensions_1.$KF, defaultSelector, new class {
                provideRenameEdits(document, position, newName) {
                    const edit = new types.$aK();
                    edit.insert(document.uri, position, newName);
                    return edit;
                }
            }));
            await rpcProtocol.sync();
            const edit = await commands.executeCommand('vscode.executeDocumentRenameProvider', model.uri, new types.$4J(0, 12), 'newNameOfThis');
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
            disposables.push(extHost.registerDefinitionProvider(extensions_1.$KF, defaultSelector, {
                provideDefinition(doc) {
                    return new types.$cK(doc.uri, new types.$5J(1, 0, 0, 0));
                }
            }));
            disposables.push(extHost.registerDefinitionProvider(extensions_1.$KF, defaultSelector, {
                provideDefinition(doc) {
                    // duplicate result will get removed
                    return new types.$cK(doc.uri, new types.$5J(1, 0, 0, 0));
                }
            }));
            disposables.push(extHost.registerDefinitionProvider(extensions_1.$KF, defaultSelector, {
                provideDefinition(doc) {
                    return [
                        new types.$cK(doc.uri, new types.$5J(2, 0, 0, 0)),
                        new types.$cK(doc.uri, new types.$5J(3, 0, 0, 0)),
                        new types.$cK(doc.uri, new types.$5J(4, 0, 0, 0)),
                    ];
                }
            }));
            return rpcProtocol.sync().then(() => {
                return commands.executeCommand('vscode.executeDefinitionProvider', model.uri, new types.$4J(0, 0)).then(values => {
                    assert.strictEqual(values.length, 4);
                    for (const v of values) {
                        assert.ok(v.uri instanceof uri_1.URI);
                        assert.ok(v.range instanceof types.$5J);
                    }
                });
            });
        });
        test('Definition, back and forth (sorting & de-deduping)', function () {
            disposables.push(extHost.registerDefinitionProvider(extensions_1.$KF, defaultSelector, {
                provideDefinition(doc) {
                    return new types.$cK(uri_1.URI.parse('file:///b'), new types.$5J(1, 0, 0, 0));
                }
            }));
            disposables.push(extHost.registerDefinitionProvider(extensions_1.$KF, defaultSelector, {
                provideDefinition(doc) {
                    // duplicate result will get removed
                    return new types.$cK(uri_1.URI.parse('file:///b'), new types.$5J(1, 0, 0, 0));
                }
            }));
            disposables.push(extHost.registerDefinitionProvider(extensions_1.$KF, defaultSelector, {
                provideDefinition(doc) {
                    return [
                        new types.$cK(uri_1.URI.parse('file:///a'), new types.$5J(2, 0, 0, 0)),
                        new types.$cK(uri_1.URI.parse('file:///c'), new types.$5J(3, 0, 0, 0)),
                        new types.$cK(uri_1.URI.parse('file:///d'), new types.$5J(4, 0, 0, 0)),
                    ];
                }
            }));
            return rpcProtocol.sync().then(() => {
                return commands.executeCommand('vscode.executeDefinitionProvider', model.uri, new types.$4J(0, 0)).then(values => {
                    assert.strictEqual(values.length, 4);
                    assert.strictEqual(values[0].uri.path, '/a');
                    assert.strictEqual(values[1].uri.path, '/b');
                    assert.strictEqual(values[2].uri.path, '/c');
                    assert.strictEqual(values[3].uri.path, '/d');
                });
            });
        });
        test('Definition Link', () => {
            disposables.push(extHost.registerDefinitionProvider(extensions_1.$KF, defaultSelector, {
                provideDefinition(doc) {
                    return [
                        new types.$cK(doc.uri, new types.$5J(0, 0, 0, 0)),
                        { targetUri: doc.uri, targetRange: new types.$5J(1, 0, 0, 0), targetSelectionRange: new types.$5J(1, 1, 1, 1), originSelectionRange: new types.$5J(2, 2, 2, 2) }
                    ];
                }
            }));
            return rpcProtocol.sync().then(() => {
                return commands.executeCommand('vscode.executeDefinitionProvider', model.uri, new types.$4J(0, 0)).then(values => {
                    assert.strictEqual(values.length, 2);
                    for (const v of values) {
                        if (isLocation(v)) {
                            assert.ok(v.uri instanceof uri_1.URI);
                            assert.ok(v.range instanceof types.$5J);
                        }
                        else {
                            assert.ok(v.targetUri instanceof uri_1.URI);
                            assert.ok(v.targetRange instanceof types.$5J);
                            assert.ok(v.targetSelectionRange instanceof types.$5J);
                            assert.ok(v.originSelectionRange instanceof types.$5J);
                        }
                    }
                });
            });
        });
        // --- declaration
        test('Declaration, back and forth', function () {
            disposables.push(extHost.registerDeclarationProvider(extensions_1.$KF, defaultSelector, {
                provideDeclaration(doc) {
                    return new types.$cK(doc.uri, new types.$5J(1, 0, 0, 0));
                }
            }));
            disposables.push(extHost.registerDeclarationProvider(extensions_1.$KF, defaultSelector, {
                provideDeclaration(doc) {
                    // duplicate result will get removed
                    return new types.$cK(doc.uri, new types.$5J(1, 0, 0, 0));
                }
            }));
            disposables.push(extHost.registerDeclarationProvider(extensions_1.$KF, defaultSelector, {
                provideDeclaration(doc) {
                    return [
                        new types.$cK(doc.uri, new types.$5J(2, 0, 0, 0)),
                        new types.$cK(doc.uri, new types.$5J(3, 0, 0, 0)),
                        new types.$cK(doc.uri, new types.$5J(4, 0, 0, 0)),
                    ];
                }
            }));
            return rpcProtocol.sync().then(() => {
                return commands.executeCommand('vscode.executeDeclarationProvider', model.uri, new types.$4J(0, 0)).then(values => {
                    assert.strictEqual(values.length, 4);
                    for (const v of values) {
                        assert.ok(v.uri instanceof uri_1.URI);
                        assert.ok(v.range instanceof types.$5J);
                    }
                });
            });
        });
        test('Declaration Link', () => {
            disposables.push(extHost.registerDeclarationProvider(extensions_1.$KF, defaultSelector, {
                provideDeclaration(doc) {
                    return [
                        new types.$cK(doc.uri, new types.$5J(0, 0, 0, 0)),
                        { targetUri: doc.uri, targetRange: new types.$5J(1, 0, 0, 0), targetSelectionRange: new types.$5J(1, 1, 1, 1), originSelectionRange: new types.$5J(2, 2, 2, 2) }
                    ];
                }
            }));
            return rpcProtocol.sync().then(() => {
                return commands.executeCommand('vscode.executeDeclarationProvider', model.uri, new types.$4J(0, 0)).then(values => {
                    assert.strictEqual(values.length, 2);
                    for (const v of values) {
                        if (isLocation(v)) {
                            assert.ok(v.uri instanceof uri_1.URI);
                            assert.ok(v.range instanceof types.$5J);
                        }
                        else {
                            assert.ok(v.targetUri instanceof uri_1.URI);
                            assert.ok(v.targetRange instanceof types.$5J);
                            assert.ok(v.targetSelectionRange instanceof types.$5J);
                            assert.ok(v.originSelectionRange instanceof types.$5J);
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
            disposables.push(extHost.registerTypeDefinitionProvider(extensions_1.$KF, defaultSelector, {
                provideTypeDefinition(doc) {
                    return new types.$cK(doc.uri, new types.$5J(1, 0, 0, 0));
                }
            }));
            disposables.push(extHost.registerTypeDefinitionProvider(extensions_1.$KF, defaultSelector, {
                provideTypeDefinition(doc) {
                    // duplicate result will get removed
                    return new types.$cK(doc.uri, new types.$5J(1, 0, 0, 0));
                }
            }));
            disposables.push(extHost.registerTypeDefinitionProvider(extensions_1.$KF, defaultSelector, {
                provideTypeDefinition(doc) {
                    return [
                        new types.$cK(doc.uri, new types.$5J(2, 0, 0, 0)),
                        new types.$cK(doc.uri, new types.$5J(3, 0, 0, 0)),
                        new types.$cK(doc.uri, new types.$5J(4, 0, 0, 0)),
                    ];
                }
            }));
            return rpcProtocol.sync().then(() => {
                return commands.executeCommand('vscode.executeTypeDefinitionProvider', model.uri, new types.$4J(0, 0)).then(values => {
                    assert.strictEqual(values.length, 4);
                    for (const v of values) {
                        assert.ok(v.uri instanceof uri_1.URI);
                        assert.ok(v.range instanceof types.$5J);
                    }
                });
            });
        });
        test('Type Definition Link', () => {
            disposables.push(extHost.registerTypeDefinitionProvider(extensions_1.$KF, defaultSelector, {
                provideTypeDefinition(doc) {
                    return [
                        new types.$cK(doc.uri, new types.$5J(0, 0, 0, 0)),
                        { targetUri: doc.uri, targetRange: new types.$5J(1, 0, 0, 0), targetSelectionRange: new types.$5J(1, 1, 1, 1), originSelectionRange: new types.$5J(2, 2, 2, 2) }
                    ];
                }
            }));
            return rpcProtocol.sync().then(() => {
                return commands.executeCommand('vscode.executeTypeDefinitionProvider', model.uri, new types.$4J(0, 0)).then(values => {
                    assert.strictEqual(values.length, 2);
                    for (const v of values) {
                        if (isLocation(v)) {
                            assert.ok(v.uri instanceof uri_1.URI);
                            assert.ok(v.range instanceof types.$5J);
                        }
                        else {
                            assert.ok(v.targetUri instanceof uri_1.URI);
                            assert.ok(v.targetRange instanceof types.$5J);
                            assert.ok(v.targetSelectionRange instanceof types.$5J);
                            assert.ok(v.originSelectionRange instanceof types.$5J);
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
            disposables.push(extHost.registerImplementationProvider(extensions_1.$KF, defaultSelector, {
                provideImplementation(doc) {
                    return new types.$cK(doc.uri, new types.$5J(1, 0, 0, 0));
                }
            }));
            disposables.push(extHost.registerImplementationProvider(extensions_1.$KF, defaultSelector, {
                provideImplementation(doc) {
                    // duplicate result will get removed
                    return new types.$cK(doc.uri, new types.$5J(1, 0, 0, 0));
                }
            }));
            disposables.push(extHost.registerImplementationProvider(extensions_1.$KF, defaultSelector, {
                provideImplementation(doc) {
                    return [
                        new types.$cK(doc.uri, new types.$5J(2, 0, 0, 0)),
                        new types.$cK(doc.uri, new types.$5J(3, 0, 0, 0)),
                        new types.$cK(doc.uri, new types.$5J(4, 0, 0, 0)),
                    ];
                }
            }));
            return rpcProtocol.sync().then(() => {
                return commands.executeCommand('vscode.executeImplementationProvider', model.uri, new types.$4J(0, 0)).then(values => {
                    assert.strictEqual(values.length, 4);
                    for (const v of values) {
                        assert.ok(v.uri instanceof uri_1.URI);
                        assert.ok(v.range instanceof types.$5J);
                    }
                });
            });
        });
        test('Implementation Definition Link', () => {
            disposables.push(extHost.registerImplementationProvider(extensions_1.$KF, defaultSelector, {
                provideImplementation(doc) {
                    return [
                        new types.$cK(doc.uri, new types.$5J(0, 0, 0, 0)),
                        { targetUri: doc.uri, targetRange: new types.$5J(1, 0, 0, 0), targetSelectionRange: new types.$5J(1, 1, 1, 1), originSelectionRange: new types.$5J(2, 2, 2, 2) }
                    ];
                }
            }));
            return rpcProtocol.sync().then(() => {
                return commands.executeCommand('vscode.executeImplementationProvider', model.uri, new types.$4J(0, 0)).then(values => {
                    assert.strictEqual(values.length, 2);
                    for (const v of values) {
                        if (isLocation(v)) {
                            assert.ok(v.uri instanceof uri_1.URI);
                            assert.ok(v.range instanceof types.$5J);
                        }
                        else {
                            assert.ok(v.targetUri instanceof uri_1.URI);
                            assert.ok(v.targetRange instanceof types.$5J);
                            assert.ok(v.targetSelectionRange instanceof types.$5J);
                            assert.ok(v.originSelectionRange instanceof types.$5J);
                        }
                    }
                });
            });
        });
        // --- references
        test('reference search, back and forth', function () {
            disposables.push(extHost.registerReferenceProvider(extensions_1.$KF, defaultSelector, {
                provideReferences() {
                    return [
                        new types.$cK(uri_1.URI.parse('some:uri/path'), new types.$5J(0, 1, 0, 5))
                    ];
                }
            }));
            return commands.executeCommand('vscode.executeReferenceProvider', model.uri, new types.$4J(0, 0)).then(values => {
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
            disposables.push(extHost.registerDocumentSymbolProvider(extensions_1.$KF, defaultSelector, {
                provideDocumentSymbols() {
                    return [
                        new types.$hK('testing1', types.SymbolKind.Enum, new types.$5J(1, 0, 1, 0)),
                        new types.$hK('testing2', types.SymbolKind.Enum, new types.$5J(0, 1, 0, 3)),
                    ];
                }
            }));
            return rpcProtocol.sync().then(() => {
                return commands.executeCommand('vscode.executeDocumentSymbolProvider', model.uri).then(values => {
                    assert.strictEqual(values.length, 2);
                    const [first, second] = values;
                    assert.strictEqual(first instanceof types.$hK, true);
                    assert.strictEqual(second instanceof types.$hK, true);
                    assert.strictEqual(first.name, 'testing2');
                    assert.strictEqual(second.name, 'testing1');
                });
            });
        });
        test('vscode.executeDocumentSymbolProvider command only returns SymbolInformation[] rather than DocumentSymbol[] #57984', function () {
            disposables.push(extHost.registerDocumentSymbolProvider(extensions_1.$KF, defaultSelector, {
                provideDocumentSymbols() {
                    return [
                        new types.$hK('SymbolInformation', types.SymbolKind.Enum, new types.$5J(1, 0, 1, 0))
                    ];
                }
            }));
            disposables.push(extHost.registerDocumentSymbolProvider(extensions_1.$KF, defaultSelector, {
                provideDocumentSymbols() {
                    const root = new types.$iK('DocumentSymbol', 'DocumentSymbol#detail', types.SymbolKind.Enum, new types.$5J(1, 0, 1, 0), new types.$5J(1, 0, 1, 0));
                    root.children = [new types.$iK('DocumentSymbol#child', 'DocumentSymbol#detail#child', types.SymbolKind.Enum, new types.$5J(1, 0, 1, 0), new types.$5J(1, 0, 1, 0))];
                    return [root];
                }
            }));
            return rpcProtocol.sync().then(() => {
                return commands.executeCommand('vscode.executeDocumentSymbolProvider', model.uri).then(values => {
                    assert.strictEqual(values.length, 2);
                    const [first, second] = values;
                    assert.strictEqual(first instanceof types.$hK, true);
                    assert.strictEqual(first instanceof types.$iK, false);
                    assert.strictEqual(second instanceof types.$hK, true);
                    assert.strictEqual(first.name, 'DocumentSymbol');
                    assert.strictEqual(first.children.length, 1);
                    assert.strictEqual(second.name, 'SymbolInformation');
                });
            });
        });
        // --- suggest
        test('triggerCharacter is null when completion provider is called programmatically #159914', async function () {
            let actualContext;
            disposables.push(extHost.registerCompletionItemProvider(extensions_1.$KF, defaultSelector, {
                provideCompletionItems(_doc, _pos, _tok, context) {
                    actualContext = context;
                    return [];
                }
            }, []));
            await rpcProtocol.sync();
            await commands.executeCommand('vscode.executeCompletionItemProvider', model.uri, new types.$4J(0, 4));
            assert.ok(actualContext);
            assert.deepStrictEqual(actualContext, { triggerKind: types.CompletionTriggerKind.Invoke, triggerCharacter: undefined });
        });
        test('Suggest, back and forth', function () {
            disposables.push(extHost.registerCompletionItemProvider(extensions_1.$KF, defaultSelector, {
                provideCompletionItems() {
                    const a = new types.$wK('item1');
                    a.documentation = new types.$qK('hello_md_string');
                    const b = new types.$wK('item2');
                    b.textEdit = types.$0J.replace(new types.$5J(0, 4, 0, 8), 'foo'); // overwite after
                    const c = new types.$wK('item3');
                    c.textEdit = types.$0J.replace(new types.$5J(0, 1, 0, 6), 'foobar'); // overwite before & after
                    // snippet string!
                    const d = new types.$wK('item4');
                    d.range = new types.$5J(0, 1, 0, 4); // overwite before
                    d.insertText = new types.$bK('foo$0bar');
                    return [a, b, c, d];
                }
            }, []));
            return rpcProtocol.sync().then(() => {
                return commands.executeCommand('vscode.executeCompletionItemProvider', model.uri, new types.$4J(0, 4)).then(list => {
                    assert.ok(list instanceof types.$xK);
                    const values = list.items;
                    assert.ok(Array.isArray(values));
                    assert.strictEqual(values.length, 4);
                    const [first, second, third, fourth] = values;
                    assert.strictEqual(first.label, 'item1');
                    assert.strictEqual(first.textEdit, undefined); // no text edit, default ranges
                    assert.ok(!types.$5J.isRange(first.range));
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
                    assert.ok(types.$5J.isRange(range));
                    assert.strictEqual(range.start.line, 0);
                    assert.strictEqual(range.start.character, 1);
                    assert.strictEqual(range.end.line, 0);
                    assert.strictEqual(range.end.character, 4);
                    assert.ok(fourth.insertText instanceof types.$bK);
                    assert.strictEqual(fourth.insertText.value, 'foo$0bar');
                });
            });
        });
        test('Suggest, return CompletionList !array', function () {
            disposables.push(extHost.registerCompletionItemProvider(extensions_1.$KF, defaultSelector, {
                provideCompletionItems() {
                    const a = new types.$wK('item1');
                    const b = new types.$wK('item2');
                    return new types.$xK([a, b], true);
                }
            }, []));
            return rpcProtocol.sync().then(() => {
                return commands.executeCommand('vscode.executeCompletionItemProvider', model.uri, new types.$4J(0, 4)).then(list => {
                    assert.ok(list instanceof types.$xK);
                    assert.strictEqual(list.isIncomplete, true);
                });
            });
        });
        test('Suggest, resolve completion items', async function () {
            let resolveCount = 0;
            disposables.push(extHost.registerCompletionItemProvider(extensions_1.$KF, defaultSelector, {
                provideCompletionItems() {
                    const a = new types.$wK('item1');
                    const b = new types.$wK('item2');
                    const c = new types.$wK('item3');
                    const d = new types.$wK('item4');
                    return new types.$xK([a, b, c, d], false);
                },
                resolveCompletionItem(item) {
                    resolveCount += 1;
                    return item;
                }
            }, []));
            await rpcProtocol.sync();
            const list = await commands.executeCommand('vscode.executeCompletionItemProvider', model.uri, new types.$4J(0, 4), undefined, 2 // maxItemsToResolve
            );
            assert.ok(list instanceof types.$xK);
            assert.strictEqual(resolveCount, 2);
        });
        test('"vscode.executeCompletionItemProvider" doesnot return a preselect field #53749', async function () {
            disposables.push(extHost.registerCompletionItemProvider(extensions_1.$KF, defaultSelector, {
                provideCompletionItems() {
                    const a = new types.$wK('item1');
                    a.preselect = true;
                    const b = new types.$wK('item2');
                    const c = new types.$wK('item3');
                    c.preselect = true;
                    const d = new types.$wK('item4');
                    return new types.$xK([a, b, c, d], false);
                }
            }, []));
            await rpcProtocol.sync();
            const list = await commands.executeCommand('vscode.executeCompletionItemProvider', model.uri, new types.$4J(0, 4), undefined);
            assert.ok(list instanceof types.$xK);
            assert.strictEqual(list.items.length, 4);
            const [a, b, c, d] = list.items;
            assert.strictEqual(a.preselect, true);
            assert.strictEqual(b.preselect, undefined);
            assert.strictEqual(c.preselect, true);
            assert.strictEqual(d.preselect, undefined);
        });
        test('executeCompletionItemProvider doesn\'t capture commitCharacters #58228', async function () {
            disposables.push(extHost.registerCompletionItemProvider(extensions_1.$KF, defaultSelector, {
                provideCompletionItems() {
                    const a = new types.$wK('item1');
                    a.commitCharacters = ['a', 'b'];
                    const b = new types.$wK('item2');
                    return new types.$xK([a, b], false);
                }
            }, []));
            await rpcProtocol.sync();
            const list = await commands.executeCommand('vscode.executeCompletionItemProvider', model.uri, new types.$4J(0, 4), undefined);
            assert.ok(list instanceof types.$xK);
            assert.strictEqual(list.items.length, 2);
            const [a, b] = list.items;
            assert.deepStrictEqual(a.commitCharacters, ['a', 'b']);
            assert.strictEqual(b.commitCharacters, undefined);
        });
        test('vscode.executeCompletionItemProvider returns the wrong CompletionItemKinds in insiders #95715', async function () {
            disposables.push(extHost.registerCompletionItemProvider(extensions_1.$KF, defaultSelector, {
                provideCompletionItems() {
                    return [
                        new types.$wK('My Method', types.CompletionItemKind.Method),
                        new types.$wK('My Property', types.CompletionItemKind.Property),
                    ];
                }
            }, []));
            await rpcProtocol.sync();
            const list = await commands.executeCommand('vscode.executeCompletionItemProvider', model.uri, new types.$4J(0, 4), undefined);
            assert.ok(list instanceof types.$xK);
            assert.strictEqual(list.items.length, 2);
            const [a, b] = list.items;
            assert.strictEqual(a.kind, types.CompletionItemKind.Method);
            assert.strictEqual(b.kind, types.CompletionItemKind.Property);
        });
        // --- signatureHelp
        test('Parameter Hints, back and forth', async () => {
            disposables.push(extHost.registerSignatureHelpProvider(extensions_1.$KF, defaultSelector, new class {
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
            const firstValue = await commands.executeCommand('vscode.executeSignatureHelpProvider', model.uri, new types.$4J(0, 1), ',');
            assert.strictEqual(firstValue.activeSignature, 0);
            assert.strictEqual(firstValue.activeParameter, 1);
            assert.strictEqual(firstValue.signatures.length, 1);
            assert.strictEqual(firstValue.signatures[0].label, 'abc');
            assert.strictEqual(firstValue.signatures[0].documentation, 'invoked ,');
        });
        // --- quickfix
        test('QuickFix, back and forth', function () {
            disposables.push(extHost.registerCodeActionProvider(extensions_1.$KF, defaultSelector, {
                provideCodeActions() {
                    return [{ command: 'testing', title: 'Title', arguments: [1, 2, true] }];
                }
            }));
            return rpcProtocol.sync().then(() => {
                return commands.executeCommand('vscode.executeCodeActionProvider', model.uri, new types.$5J(0, 0, 1, 1)).then(value => {
                    assert.strictEqual(value.length, 1);
                    const [first] = value;
                    assert.strictEqual(first.title, 'Title');
                    assert.strictEqual(first.command, 'testing');
                    assert.deepStrictEqual(first.arguments, [1, 2, true]);
                });
            });
        });
        test('vscode.executeCodeActionProvider results seem to be missing their `command` property #45124', function () {
            disposables.push(extHost.registerCodeActionProvider(extensions_1.$KF, defaultSelector, {
                provideCodeActions(document, range) {
                    return [{
                            command: {
                                arguments: [document, range],
                                command: 'command',
                                title: 'command_title',
                            },
                            kind: types.$kK.Empty.append('foo'),
                            title: 'title',
                        }];
                }
            }));
            return rpcProtocol.sync().then(() => {
                return commands.executeCommand('vscode.executeCodeActionProvider', model.uri, new types.$5J(0, 0, 1, 1)).then(value => {
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
            disposables.push(extHost.registerCodeActionProvider(extensions_1.$KF, defaultSelector, {
                provideCodeActions(document, rangeOrSelection) {
                    return [{
                            command: {
                                arguments: [document, rangeOrSelection],
                                command: 'command',
                                title: 'command_title',
                            },
                            kind: types.$kK.Empty.append('foo'),
                            title: 'title',
                        }];
                }
            }));
            const selection = new types.$6J(0, 0, 1, 1);
            return rpcProtocol.sync().then(() => {
                return commands.executeCommand('vscode.executeCodeActionProvider', model.uri, selection).then(value => {
                    assert.strictEqual(value.length, 1);
                    const [first] = value;
                    assert.ok(first.command);
                    assert.ok(first.command.arguments[1] instanceof types.$6J);
                    assert.ok(first.command.arguments[1].isEqual(selection));
                });
            });
        });
        test('vscode.executeCodeActionProvider results seem to be missing their `isPreferred` property #78098', function () {
            disposables.push(extHost.registerCodeActionProvider(extensions_1.$KF, defaultSelector, {
                provideCodeActions(document, rangeOrSelection) {
                    return [{
                            command: {
                                arguments: [document, rangeOrSelection],
                                command: 'command',
                                title: 'command_title',
                            },
                            kind: types.$kK.Empty.append('foo'),
                            title: 'title',
                            isPreferred: true
                        }];
                }
            }));
            const selection = new types.$6J(0, 0, 1, 1);
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
            class MyAction extends types.$jK {
            }
            disposables.push(extHost.registerCodeActionProvider(extensions_1.$KF, defaultSelector, {
                provideCodeActions(document, rangeOrSelection) {
                    return [new MyAction('title', types.$kK.Empty.append('foo'))];
                },
                resolveCodeAction(action) {
                    assert.ok(action instanceof MyAction);
                    didCallResolve += 1;
                    action.title = 'resolved title';
                    action.edit = new types.$aK();
                    return action;
                }
            }));
            const selection = new types.$6J(0, 0, 1, 1);
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
            disposables.push(extHost.registerCodeLensProvider(extensions_1.$KF, defaultSelector, {
                provideCodeLenses() {
                    return [new types.$pK(new types.$5J(0, 0, 1, 1), { title: 'Title', command: 'cmd', arguments: [1, true, complexArg] })];
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
            disposables.push(extHost.registerCodeLensProvider(extensions_1.$KF, defaultSelector, {
                provideCodeLenses() {
                    return [
                        new types.$pK(new types.$5J(0, 0, 1, 1)),
                        new types.$pK(new types.$5J(0, 0, 1, 1)),
                        new types.$pK(new types.$5J(0, 0, 1, 1)),
                        new types.$pK(new types.$5J(0, 0, 1, 1), { title: 'Already resolved', command: 'fff' })
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
            disposables.push(extHost.registerDocumentLinkProvider(extensions_1.$KF, defaultSelector, {
                provideDocumentLinks() {
                    return [new types.$BK(new types.$5J(0, 0, 0, 20), uri_1.URI.parse('foo:bar'))];
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
            disposables.push(extHost.registerDocumentLinkProvider(extensions_1.$KF, defaultSelector, {
                provideDocumentLinks() {
                    return [new types.$BK(new types.$5J(0, 0, 0, 20), undefined)];
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
            disposables.push(extHost.registerColorProvider(extensions_1.$KF, defaultSelector, {
                provideDocumentColors() {
                    return [new types.$DK(new types.$5J(0, 0, 0, 20), new types.$CK(0.1, 0.2, 0.3, 0.4))];
                },
                provideColorPresentations() {
                    const cp = new types.$EK('#ABC');
                    cp.textEdit = types.$0J.replace(new types.$5J(1, 0, 1, 20), '#ABC');
                    cp.additionalTextEdits = [types.$0J.insert(new types.$4J(2, 20), '*')];
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
                const color = new types.$CK(0.5, 0.6, 0.7, 0.8);
                const range = new types.$5J(0, 0, 0, 20);
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
            disposables.push(extHost.registerHoverProvider(extensions_1.$KF, defaultSelector, {
                provideHover() {
                    return new types.$fK('fofofofo');
                }
            }));
            return rpcProtocol.sync().then(() => {
                return commands.executeCommand('vscode.executeHoverProvider', model.uri, new types.$4J(1, 1)).then(value => {
                    assert.strictEqual(value.length, 1);
                    assert.strictEqual(value[0].contents.length, 1);
                });
            });
        });
        // --- inline hints
        test('Inlay Hints, back and forth', async function () {
            disposables.push(extHost.registerInlayHintsProvider(extensions_1.$KF, defaultSelector, {
                provideInlayHints() {
                    return [new types.$vK(new types.$4J(0, 1), 'Foo')];
                }
            }));
            await rpcProtocol.sync();
            const value = await commands.executeCommand('vscode.executeInlayHintProvider', model.uri, new types.$5J(0, 0, 20, 20));
            assert.strictEqual(value.length, 1);
            const [first] = value;
            assert.strictEqual(first.label, 'Foo');
            assert.strictEqual(first.position.line, 0);
            assert.strictEqual(first.position.character, 1);
        });
        test('Inline Hints, merge', async function () {
            disposables.push(extHost.registerInlayHintsProvider(extensions_1.$KF, defaultSelector, {
                provideInlayHints() {
                    const part = new types.$uK('Bar');
                    part.tooltip = 'part_tooltip';
                    part.command = { command: 'cmd', title: 'part' };
                    const hint = new types.$vK(new types.$4J(10, 11), [part]);
                    hint.tooltip = 'hint_tooltip';
                    hint.paddingLeft = true;
                    hint.paddingRight = false;
                    return [hint];
                }
            }));
            disposables.push(extHost.registerInlayHintsProvider(extensions_1.$KF, defaultSelector, {
                provideInlayHints() {
                    const hint = new types.$vK(new types.$4J(0, 1), 'Foo', types.InlayHintKind.Parameter);
                    hint.textEdits = [types.$0J.insert(new types.$4J(0, 0), 'Hello')];
                    return [hint];
                }
            }));
            await rpcProtocol.sync();
            const value = await commands.executeCommand('vscode.executeInlayHintProvider', model.uri, new types.$5J(0, 0, 20, 20));
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
            (0, types_1.$tf)(label instanceof types.$uK);
            assert.strictEqual(label.value, 'Bar');
            assert.strictEqual(label.tooltip, 'part_tooltip');
            assert.strictEqual(label.command?.command, 'cmd');
            assert.strictEqual(label.command?.title, 'part');
        });
        test('Inline Hints, bad provider', async function () {
            disposables.push(extHost.registerInlayHintsProvider(extensions_1.$KF, defaultSelector, {
                provideInlayHints() {
                    return [new types.$vK(new types.$4J(0, 1), 'Foo')];
                }
            }));
            disposables.push(extHost.registerInlayHintsProvider(extensions_1.$KF, defaultSelector, {
                provideInlayHints() {
                    throw new Error();
                }
            }));
            await rpcProtocol.sync();
            const value = await commands.executeCommand('vscode.executeInlayHintProvider', model.uri, new types.$5J(0, 0, 20, 20));
            assert.strictEqual(value.length, 1);
            const [first] = value;
            assert.strictEqual(first.label, 'Foo');
            assert.strictEqual(first.position.line, 0);
            assert.strictEqual(first.position.character, 1);
        });
        // --- selection ranges
        test('Selection Range, back and forth', async function () {
            disposables.push(extHost.registerSelectionRangeProvider(extensions_1.$KF, defaultSelector, {
                provideSelectionRanges() {
                    return [
                        new types.$lK(new types.$5J(0, 10, 0, 18), new types.$lK(new types.$5J(0, 2, 0, 20))),
                    ];
                }
            }));
            await rpcProtocol.sync();
            const value = await commands.executeCommand('vscode.executeSelectionRangeProvider', model.uri, [new types.$4J(0, 10)]);
            assert.strictEqual(value.length, 1);
            assert.ok(value[0].parent);
        });
        // --- call hierarchy
        test('CallHierarchy, back and forth', async function () {
            disposables.push(extHost.registerCallHierarchyProvider(extensions_1.$KF, defaultSelector, new class {
                prepareCallHierarchy(document, position) {
                    return new types.$mK(types.SymbolKind.Constant, 'ROOT', 'ROOT', document.uri, new types.$5J(0, 0, 0, 0), new types.$5J(0, 0, 0, 0));
                }
                provideCallHierarchyIncomingCalls(item, token) {
                    return [new types.$nK(new types.$mK(types.SymbolKind.Constant, 'INCOMING', 'INCOMING', item.uri, new types.$5J(0, 0, 0, 0), new types.$5J(0, 0, 0, 0)), [new types.$5J(0, 0, 0, 0)])];
                }
                provideCallHierarchyOutgoingCalls(item, token) {
                    return [new types.$oK(new types.$mK(types.SymbolKind.Constant, 'OUTGOING', 'OUTGOING', item.uri, new types.$5J(0, 0, 0, 0), new types.$5J(0, 0, 0, 0)), [new types.$5J(0, 0, 0, 0)])];
                }
            }));
            await rpcProtocol.sync();
            const root = await commands.executeCommand('vscode.prepareCallHierarchy', model.uri, new types.$4J(0, 0));
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
            disposables.push(extHost.registerCallHierarchyProvider(extensions_1.$KF, defaultSelector, new class {
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
            const root = await commands.executeCommand('vscode.prepareCallHierarchy', model.uri, new types.$4J(0, 0));
            assert.ok(Array.isArray(root));
            assert.strictEqual(root.length, 0);
        });
        // --- type hierarchy
        test('TypeHierarchy, back and forth', async function () {
            disposables.push(extHost.registerTypeHierarchyProvider(extensions_1.$KF, defaultSelector, new class {
                prepareTypeHierarchy(document, position, token) {
                    return [new types.$GL(types.SymbolKind.Constant, 'ROOT', 'ROOT', document.uri, new types.$5J(0, 0, 0, 0), new types.$5J(0, 0, 0, 0))];
                }
                provideTypeHierarchySupertypes(item, token) {
                    return [new types.$GL(types.SymbolKind.Constant, 'SUPER', 'SUPER', item.uri, new types.$5J(0, 0, 0, 0), new types.$5J(0, 0, 0, 0))];
                }
                provideTypeHierarchySubtypes(item, token) {
                    return [new types.$GL(types.SymbolKind.Constant, 'SUB', 'SUB', item.uri, new types.$5J(0, 0, 0, 0), new types.$5J(0, 0, 0, 0))];
                }
            }));
            await rpcProtocol.sync();
            const root = await commands.executeCommand('vscode.prepareTypeHierarchy', model.uri, new types.$4J(0, 0));
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
            disposables.push(extHost.registerSelectionRangeProvider(extensions_1.$KF, defaultSelector, {
                provideSelectionRanges(_doc, positions) {
                    const [first] = positions;
                    return [
                        new types.$lK(new types.$5J(first.line, first.character, first.line, first.character)),
                    ];
                }
            }));
            await rpcProtocol.sync();
            const value = await commands.executeCommand('vscode.executeSelectionRangeProvider', model.uri, [new types.$4J(0, 10)]);
            assert.strictEqual(value.length, 1);
            assert.strictEqual(value[0].range.start.line, 0);
            assert.strictEqual(value[0].range.start.character, 10);
            assert.strictEqual(value[0].range.end.line, 0);
            assert.strictEqual(value[0].range.end.character, 10);
        });
        test('more element test of selectionRangeProvider on inner array always returns outer array #91852', async function () {
            disposables.push(extHost.registerSelectionRangeProvider(extensions_1.$KF, defaultSelector, {
                provideSelectionRanges(_doc, positions) {
                    const [first, second] = positions;
                    return [
                        new types.$lK(new types.$5J(first.line, first.character, first.line, first.character)),
                        new types.$lK(new types.$5J(second.line, second.character, second.line, second.character)),
                    ];
                }
            }));
            await rpcProtocol.sync();
            const value = await commands.executeCommand('vscode.executeSelectionRangeProvider', model.uri, [new types.$4J(0, 0), new types.$4J(0, 10)]);
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
//# sourceMappingURL=extHostApiCommands.test.js.map