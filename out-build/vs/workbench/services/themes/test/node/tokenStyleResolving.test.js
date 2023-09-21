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
        const foregroundColor = (0, types_1.$jf)(foreground) ? color_1.$Os.fromHex(foreground) : undefined;
        return new tokenClassificationRegistry_1.$W$(foregroundColor, styleFlags?.bold, styleFlags?.underline, styleFlags?.strikethrough, styleFlags?.italic);
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
            assert.strictEqual(colorIndex[actualForegroundIndex], color_1.$Os.Format.CSS.formatHexA(expected.foreground, true).toUpperCase(), 'foreground ' + message);
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
        const fileService = new fileService_1.$Dp(new log_1.$fj());
        const requestService = new ((0, workbenchTestServices_1.mock)())();
        const storageService = new ((0, workbenchTestServices_1.mock)())();
        const environmentService = new ((0, workbenchTestServices_1.mock)())();
        const configurationService = new ((0, workbenchTestServices_1.mock)())();
        const extensionResourceLoaderService = new extensionResourceLoaderService_1.$u$b(fileService, storageService, workbenchTestServices_1.$bec, environmentService, configurationService, requestService);
        const diskFileSystemProvider = new diskFileSystemProvider_1.$3p(new log_1.$fj());
        fileService.registerProvider(network_1.Schemas.file, diskFileSystemProvider);
        teardown(() => {
            diskFileSystemProvider.dispose();
        });
        test('color defaults', async () => {
            const themeData = colorThemeData_1.$fzb.createUnloadedTheme('foo');
            themeData.location = network_1.$2f.asFileUri('vs/workbench/services/themes/test/node/color-theme.json');
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
            const themeData = colorThemeData_1.$fzb.createLoadedEmptyTheme('test', 'test');
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
            const themeData = colorThemeData_1.$fzb.createLoadedEmptyTheme('test', 'test');
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
            const themeData = colorThemeData_1.$fzb.createLoadedEmptyTheme('test', 'test');
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
            const registry = (0, tokenClassificationRegistry_1.$Y$)();
            registry.registerTokenType('myTestInterface', 'A type just for testing', 'interface');
            registry.registerTokenType('myTestSubInterface', 'A type just for testing', 'myTestInterface');
            try {
                const themeData = colorThemeData_1.$fzb.createLoadedEmptyTheme('test', 'test');
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
                const themeData = colorThemeData_1.$fzb.createLoadedEmptyTheme('test', 'test');
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
            const registry = (0, tokenClassificationRegistry_1.$Y$)();
            const numberOfDefaultRules = registry.getTokenStylingDefaultRules().length;
            registry.registerTokenStyleDefault(registry.parseTokenSelector('type', 'typescript1'), { scopesToProbe: [['entity.name.type.ts1']] });
            registry.registerTokenStyleDefault(registry.parseTokenSelector('type:javascript1'), { scopesToProbe: [['entity.name.type.js1']] });
            try {
                const themeData = colorThemeData_1.$fzb.createLoadedEmptyTheme('test', 'test');
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
//# sourceMappingURL=tokenStyleResolving.test.js.map