/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/services/themes/common/colorThemeData", "assert", "vs/platform/theme/common/tokenClassificationRegistry", "vs/base/common/color", "vs/base/common/types", "vs/platform/files/common/fileService", "vs/platform/log/common/log", "vs/platform/files/node/diskFileSystemProvider", "vs/base/common/network", "vs/platform/extensionResourceLoader/common/extensionResourceLoaderService", "vs/workbench/test/common/workbenchTestServices"], function (require, exports, colorThemeData_1, assert, tokenClassificationRegistry_1, color_1, types_1, fileService_1, log_1, diskFileSystemProvider_1, network_1, extensionResourceLoaderService_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const undefinedStyle = { bold: undefined, underline: undefined, italic: undefined };
    const unsetStyle = { bold: false, underline: false, italic: false };
    function ts(foreground, styleFlags) {
        const foregroundColor = (0, types_1.isString)(foreground) ? color_1.Color.fromHex(foreground) : undefined;
        return new tokenClassificationRegistry_1.TokenStyle(foregroundColor, styleFlags?.bold, styleFlags?.underline, styleFlags?.strikethrough, styleFlags?.italic);
    }
    function tokenStyleAsString(ts) {
        if (!ts) {
            return 'tokenstyle-undefined';
        }
        let str = ts.foreground ? ts.foreground.toString() : 'no-foreground';
        if (ts.bold !== undefined) {
            str += ts.bold ? '+B' : '-B';
        }
        if (ts.underline !== undefined) {
            str += ts.underline ? '+U' : '-U';
        }
        if (ts.italic !== undefined) {
            str += ts.italic ? '+I' : '-I';
        }
        return str;
    }
    function assertTokenStyle(actual, expected, message) {
        assert.strictEqual(tokenStyleAsString(actual), tokenStyleAsString(expected), message);
    }
    function assertTokenStyleMetaData(colorIndex, actual, expected, message = '') {
        if (expected === undefined || expected === null || actual === undefined) {
            assert.strictEqual(actual, expected, message);
            return;
        }
        assert.strictEqual(actual.bold, expected.bold, 'bold ' + message);
        assert.strictEqual(actual.italic, expected.italic, 'italic ' + message);
        assert.strictEqual(actual.underline, expected.underline, 'underline ' + message);
        const actualForegroundIndex = actual.foreground;
        if (actualForegroundIndex && expected.foreground) {
            assert.strictEqual(colorIndex[actualForegroundIndex], color_1.Color.Format.CSS.formatHexA(expected.foreground, true).toUpperCase(), 'foreground ' + message);
        }
        else {
            assert.strictEqual(actualForegroundIndex, expected.foreground || 0, 'foreground ' + message);
        }
    }
    function assertTokenStyles(themeData, expected, language = 'typescript') {
        const colorIndex = themeData.tokenColorMap;
        for (const qualifiedClassifier in expected) {
            const [type, ...modifiers] = qualifiedClassifier.split('.');
            const expectedTokenStyle = expected[qualifiedClassifier];
            const tokenStyleMetaData = themeData.getTokenStyleMetadata(type, modifiers, language);
            assertTokenStyleMetaData(colorIndex, tokenStyleMetaData, expectedTokenStyle, qualifiedClassifier);
        }
    }
    suite('Themes - TokenStyleResolving', () => {
        const fileService = new fileService_1.FileService(new log_1.NullLogService());
        const requestService = new ((0, workbenchTestServices_1.mock)())();
        const storageService = new ((0, workbenchTestServices_1.mock)())();
        const environmentService = new ((0, workbenchTestServices_1.mock)())();
        const configurationService = new ((0, workbenchTestServices_1.mock)())();
        const extensionResourceLoaderService = new extensionResourceLoaderService_1.ExtensionResourceLoaderService(fileService, storageService, workbenchTestServices_1.TestProductService, environmentService, configurationService, requestService);
        const diskFileSystemProvider = new diskFileSystemProvider_1.DiskFileSystemProvider(new log_1.NullLogService());
        fileService.registerProvider(network_1.Schemas.file, diskFileSystemProvider);
        teardown(() => {
            diskFileSystemProvider.dispose();
        });
        test('color defaults', async () => {
            const themeData = colorThemeData_1.ColorThemeData.createUnloadedTheme('foo');
            themeData.location = network_1.FileAccess.asFileUri('vs/workbench/services/themes/test/node/color-theme.json');
            await themeData.ensureLoaded(extensionResourceLoaderService);
            assert.strictEqual(themeData.isLoaded, true);
            assertTokenStyles(themeData, {
                'comment': ts('#000000', undefinedStyle),
                'variable': ts('#111111', unsetStyle),
                'type': ts('#333333', { bold: false, underline: true, italic: false }),
                'function': ts('#333333', unsetStyle),
                'string': ts('#444444', undefinedStyle),
                'number': ts('#555555', undefinedStyle),
                'keyword': ts('#666666', undefinedStyle)
            });
        });
        test('resolveScopes', async () => {
            const themeData = colorThemeData_1.ColorThemeData.createLoadedEmptyTheme('test', 'test');
            const customTokenColors = {
                textMateRules: [
                    {
                        scope: 'variable',
                        settings: {
                            fontStyle: '',
                            foreground: '#F8F8F2'
                        }
                    },
                    {
                        scope: 'keyword.operator',
                        settings: {
                            fontStyle: 'italic bold underline',
                            foreground: '#F92672'
                        }
                    },
                    {
                        scope: 'storage',
                        settings: {
                            fontStyle: 'italic',
                            foreground: '#F92672'
                        }
                    },
                    {
                        scope: ['storage.type', 'meta.structure.dictionary.json string.quoted.double.json'],
                        settings: {
                            foreground: '#66D9EF'
                        }
                    },
                    {
                        scope: 'entity.name.type, entity.name.class, entity.name.namespace, entity.name.scope-resolution',
                        settings: {
                            fontStyle: 'underline',
                            foreground: '#A6E22E'
                        }
                    },
                ]
            };
            themeData.setCustomTokenColors(customTokenColors);
            let tokenStyle;
            const defaultTokenStyle = undefined;
            tokenStyle = themeData.resolveScopes([['variable']]);
            assertTokenStyle(tokenStyle, ts('#F8F8F2', unsetStyle), 'variable');
            tokenStyle = themeData.resolveScopes([['keyword.operator']]);
            assertTokenStyle(tokenStyle, ts('#F92672', { italic: true, bold: true, underline: true }), 'keyword');
            tokenStyle = themeData.resolveScopes([['keyword']]);
            assertTokenStyle(tokenStyle, defaultTokenStyle, 'keyword');
            tokenStyle = themeData.resolveScopes([['keyword.operator']]);
            assertTokenStyle(tokenStyle, ts('#F92672', { italic: true, bold: true, underline: true }), 'keyword.operator');
            tokenStyle = themeData.resolveScopes([['keyword.operators']]);
            assertTokenStyle(tokenStyle, defaultTokenStyle, 'keyword.operators');
            tokenStyle = themeData.resolveScopes([['storage']]);
            assertTokenStyle(tokenStyle, ts('#F92672', { italic: true, bold: false, underline: false }), 'storage');
            tokenStyle = themeData.resolveScopes([['storage.type']]);
            assertTokenStyle(tokenStyle, ts('#66D9EF', { italic: true, bold: false, underline: false }), 'storage.type');
            tokenStyle = themeData.resolveScopes([['entity.name.class']]);
            assertTokenStyle(tokenStyle, ts('#A6E22E', { italic: false, bold: false, underline: true }), 'entity.name.class');
            tokenStyle = themeData.resolveScopes([['meta.structure.dictionary.json', 'string.quoted.double.json']]);
            assertTokenStyle(tokenStyle, ts('#66D9EF', undefined), 'json property');
            tokenStyle = themeData.resolveScopes([['keyword'], ['storage.type'], ['entity.name.class']]);
            assertTokenStyle(tokenStyle, ts('#66D9EF', { italic: true, bold: false, underline: false }), 'storage.type');
        });
        test('resolveScopes - match most specific', async () => {
            const themeData = colorThemeData_1.ColorThemeData.createLoadedEmptyTheme('test', 'test');
            const customTokenColors = {
                textMateRules: [
                    {
                        scope: 'entity.name.type',
                        settings: {
                            fontStyle: 'underline',
                            foreground: '#A6E22E'
                        }
                    },
                    {
                        scope: 'entity.name.type.class',
                        settings: {
                            foreground: '#FF00FF'
                        }
                    },
                    {
                        scope: 'entity.name',
                        settings: {
                            foreground: '#FFFFFF'
                        }
                    },
                ]
            };
            themeData.setCustomTokenColors(customTokenColors);
            const tokenStyle = themeData.resolveScopes([['entity.name.type.class']]);
            assertTokenStyle(tokenStyle, ts('#FF00FF', { italic: false, bold: false, underline: true }), 'entity.name.type.class');
        });
        test('rule matching', async () => {
            const themeData = colorThemeData_1.ColorThemeData.createLoadedEmptyTheme('test', 'test');
            themeData.setCustomColors({ 'editor.foreground': '#000000' });
            themeData.setCustomSemanticTokenColors({
                enabled: true,
                rules: {
                    'type': '#ff0000',
                    'class': { foreground: '#0000ff', italic: true },
                    '*.static': { bold: true },
                    '*.declaration': { italic: true },
                    '*.async.static': { italic: true, underline: true },
                    '*.async': { foreground: '#000fff', underline: true }
                }
            });
            assertTokenStyles(themeData, {
                'type': ts('#ff0000', undefinedStyle),
                'type.static': ts('#ff0000', { bold: true }),
                'type.static.declaration': ts('#ff0000', { bold: true, italic: true }),
                'class': ts('#0000ff', { italic: true }),
                'class.static.declaration': ts('#0000ff', { bold: true, italic: true, }),
                'class.declaration': ts('#0000ff', { italic: true }),
                'class.declaration.async': ts('#000fff', { underline: true, italic: true }),
                'class.declaration.async.static': ts('#000fff', { italic: true, underline: true, bold: true }),
            });
        });
        test('super type', async () => {
            const registry = (0, tokenClassificationRegistry_1.getTokenClassificationRegistry)();
            registry.registerTokenType('myTestInterface', 'A type just for testing', 'interface');
            registry.registerTokenType('myTestSubInterface', 'A type just for testing', 'myTestInterface');
            try {
                const themeData = colorThemeData_1.ColorThemeData.createLoadedEmptyTheme('test', 'test');
                themeData.setCustomColors({ 'editor.foreground': '#000000' });
                themeData.setCustomSemanticTokenColors({
                    enabled: true,
                    rules: {
                        'interface': '#ff0000',
                        'myTestInterface': { italic: true },
                        'interface.static': { bold: true }
                    }
                });
                assertTokenStyles(themeData, { 'myTestSubInterface': ts('#ff0000', { italic: true }) });
                assertTokenStyles(themeData, { 'myTestSubInterface.static': ts('#ff0000', { italic: true, bold: true }) });
                themeData.setCustomSemanticTokenColors({
                    enabled: true,
                    rules: {
                        'interface': '#ff0000',
                        'myTestInterface': { foreground: '#ff00ff', italic: true }
                    }
                });
                assertTokenStyles(themeData, { 'myTestSubInterface': ts('#ff00ff', { italic: true }) });
            }
            finally {
                registry.deregisterTokenType('myTestInterface');
                registry.deregisterTokenType('myTestSubInterface');
            }
        });
        test('language', async () => {
            try {
                const themeData = colorThemeData_1.ColorThemeData.createLoadedEmptyTheme('test', 'test');
                themeData.setCustomColors({ 'editor.foreground': '#000000' });
                themeData.setCustomSemanticTokenColors({
                    enabled: true,
                    rules: {
                        'interface': '#fff000',
                        'interface:java': '#ff0000',
                        'interface.static': { bold: true },
                        'interface.static:typescript': { italic: true }
                    }
                });
                assertTokenStyles(themeData, { 'interface': ts('#ff0000', undefined) }, 'java');
                assertTokenStyles(themeData, { 'interface': ts('#fff000', undefined) }, 'typescript');
                assertTokenStyles(themeData, { 'interface.static': ts('#ff0000', { bold: true }) }, 'java');
                assertTokenStyles(themeData, { 'interface.static': ts('#fff000', { bold: true, italic: true }) }, 'typescript');
            }
            finally {
            }
        });
        test('language - scope resolving', async () => {
            const registry = (0, tokenClassificationRegistry_1.getTokenClassificationRegistry)();
            const numberOfDefaultRules = registry.getTokenStylingDefaultRules().length;
            registry.registerTokenStyleDefault(registry.parseTokenSelector('type', 'typescript1'), { scopesToProbe: [['entity.name.type.ts1']] });
            registry.registerTokenStyleDefault(registry.parseTokenSelector('type:javascript1'), { scopesToProbe: [['entity.name.type.js1']] });
            try {
                const themeData = colorThemeData_1.ColorThemeData.createLoadedEmptyTheme('test', 'test');
                themeData.setCustomColors({ 'editor.foreground': '#000000' });
                themeData.setCustomTokenColors({
                    textMateRules: [
                        {
                            scope: 'entity.name.type',
                            settings: { foreground: '#aa0000' }
                        },
                        {
                            scope: 'entity.name.type.ts1',
                            settings: { foreground: '#bb0000' }
                        }
                    ]
                });
                assertTokenStyles(themeData, { 'type': ts('#aa0000', undefined) }, 'javascript1');
                assertTokenStyles(themeData, { 'type': ts('#bb0000', undefined) }, 'typescript1');
            }
            finally {
                registry.deregisterTokenStyleDefault(registry.parseTokenSelector('type', 'typescript1'));
                registry.deregisterTokenStyleDefault(registry.parseTokenSelector('type:javascript1'));
                assert.strictEqual(registry.getTokenStylingDefaultRules().length, numberOfDefaultRules);
            }
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9rZW5TdHlsZVJlc29sdmluZy50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3RoZW1lcy90ZXN0L25vZGUvdG9rZW5TdHlsZVJlc29sdmluZy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBb0JoRyxNQUFNLGNBQWMsR0FBRyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLENBQUM7SUFDcEYsTUFBTSxVQUFVLEdBQUcsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDO0lBRXBFLFNBQVMsRUFBRSxDQUFDLFVBQThCLEVBQUUsVUFBMEc7UUFDckosTUFBTSxlQUFlLEdBQUcsSUFBQSxnQkFBUSxFQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFLLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDckYsT0FBTyxJQUFJLHdDQUFVLENBQUMsZUFBZSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNoSSxDQUFDO0lBRUQsU0FBUyxrQkFBa0IsQ0FBQyxFQUFpQztRQUM1RCxJQUFJLENBQUMsRUFBRSxFQUFFO1lBQ1IsT0FBTyxzQkFBc0IsQ0FBQztTQUM5QjtRQUNELElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQztRQUNyRSxJQUFJLEVBQUUsQ0FBQyxJQUFJ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