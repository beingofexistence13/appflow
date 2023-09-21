/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/amdX", "vs/base/test/common/utils", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/product/common/productService", "vs/workbench/contrib/terminalContrib/links/browser/terminalWordLinkDetector", "vs/workbench/contrib/terminalContrib/links/test/browser/linkTestUtils", "vs/workbench/test/common/workbenchTestServices"], function (require, exports, amdX_1, utils_1, configuration_1, testConfigurationService_1, instantiationServiceMock_1, productService_1, terminalWordLinkDetector_1, linkTestUtils_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Workbench - TerminalWordLinkDetector', () => {
        const store = (0, utils_1.$bT)();
        let configurationService;
        let detector;
        let xterm;
        let instantiationService;
        setup(async () => {
            instantiationService = store.add(new instantiationServiceMock_1.$L0b());
            configurationService = new testConfigurationService_1.$G0b();
            await configurationService.setUserConfiguration('terminal', { integrated: { wordSeparators: '' } });
            instantiationService.stub(configuration_1.$8h, configurationService);
            instantiationService.set(productService_1.$kj, workbenchTestServices_1.$bec);
            const TerminalCtor = (await (0, amdX_1.$aD)('xterm', 'lib/xterm.js')).Terminal;
            xterm = store.add(new TerminalCtor({ allowProposedApi: true, cols: 80, rows: 30 }));
            detector = store.add(instantiationService.createInstance(terminalWordLinkDetector_1.$SWb, xterm));
        });
        async function assertLink(text, expected) {
            await (0, linkTestUtils_1.$7fc)(text, expected, detector, "Search" /* TerminalBuiltinLinkType.Search */);
        }
        suite('should link words as defined by wordSeparators', () => {
            test('" ()[]"', async () => {
                await configurationService.setUserConfiguration('terminal', { integrated: { wordSeparators: ' ()[]' } });
                configurationService.onDidChangeConfigurationEmitter.fire({ affectsConfiguration: () => true });
                await assertLink('foo', [{ range: [[1, 1], [3, 1]], text: 'foo' }]);
                await assertLink(' foo ', [{ range: [[2, 1], [4, 1]], text: 'foo' }]);
                await assertLink('(foo)', [{ range: [[2, 1], [4, 1]], text: 'foo' }]);
                await assertLink('[foo]', [{ range: [[2, 1], [4, 1]], text: 'foo' }]);
                await assertLink('{foo}', [{ range: [[1, 1], [5, 1]], text: '{foo}' }]);
            });
            test('" "', async () => {
                await configurationService.setUserConfiguration('terminal', { integrated: { wordSeparators: ' ' } });
                configurationService.onDidChangeConfigurationEmitter.fire({ affectsConfiguration: () => true });
                await assertLink('foo', [{ range: [[1, 1], [3, 1]], text: 'foo' }]);
                await assertLink(' foo ', [{ range: [[2, 1], [4, 1]], text: 'foo' }]);
                await assertLink('(foo)', [{ range: [[1, 1], [5, 1]], text: '(foo)' }]);
                await assertLink('[foo]', [{ range: [[1, 1], [5, 1]], text: '[foo]' }]);
                await assertLink('{foo}', [{ range: [[1, 1], [5, 1]], text: '{foo}' }]);
            });
            test('" []"', async () => {
                await configurationService.setUserConfiguration('terminal', { integrated: { wordSeparators: ' []' } });
                configurationService.onDidChangeConfigurationEmitter.fire({ affectsConfiguration: () => true });
                await assertLink('aabbccdd.txt ', [{ range: [[1, 1], [12, 1]], text: 'aabbccdd.txt' }]);
                await assertLink(' aabbccdd.txt ', [{ range: [[2, 1], [13, 1]], text: 'aabbccdd.txt' }]);
                await assertLink(' [aabbccdd.txt] ', [{ range: [[3, 1], [14, 1]], text: 'aabbccdd.txt' }]);
            });
        });
        suite('should ignore powerline symbols', () => {
            for (let i = 0xe0b0; i <= 0xe0bf; i++) {
                test(`\\u${i.toString(16)}`, async () => {
                    await assertLink(`${String.fromCharCode(i)}foo${String.fromCharCode(i)}`, [{ range: [[2, 1], [4, 1]], text: 'foo' }]);
                });
            }
        });
        // These are failing - the link's start x is 1 px too far to the right bc it starts
        // with a wide character, which the terminalLinkHelper currently doesn't account for
        test.skip('should support wide characters', async () => {
            await configurationService.setUserConfiguration('terminal', { integrated: { wordSeparators: ' []' } });
            configurationService.onDidChangeConfigurationEmitter.fire({ affectsConfiguration: () => true });
            await assertLink('我是学生.txt ', [{ range: [[1, 1], [12, 1]], text: '我是学生.txt' }]);
            await assertLink(' 我是学生.txt ', [{ range: [[2, 1], [13, 1]], text: '我是学生.txt' }]);
            await assertLink(' [我是学生.txt] ', [{ range: [[3, 1], [14, 1]], text: '我是学生.txt' }]);
        });
        test('should support multiple link results', async () => {
            await configurationService.setUserConfiguration('terminal', { integrated: { wordSeparators: ' ' } });
            configurationService.onDidChangeConfigurationEmitter.fire({ affectsConfiguration: () => true });
            await assertLink('foo bar', [
                { range: [[1, 1], [3, 1]], text: 'foo' },
                { range: [[5, 1], [7, 1]], text: 'bar' }
            ]);
        });
        test('should remove trailing colon in the link results', async () => {
            await configurationService.setUserConfiguration('terminal', { integrated: { wordSeparators: ' ' } });
            configurationService.onDidChangeConfigurationEmitter.fire({ affectsConfiguration: () => true });
            await assertLink('foo:5:6: bar:0:32:', [
                { range: [[1, 1], [7, 1]], text: 'foo:5:6' },
                { range: [[10, 1], [17, 1]], text: 'bar:0:32' }
            ]);
        });
        test('should support wrapping', async () => {
            await configurationService.setUserConfiguration('terminal', { integrated: { wordSeparators: ' ' } });
            configurationService.onDidChangeConfigurationEmitter.fire({ affectsConfiguration: () => true });
            await assertLink('fsdjfsdkfjslkdfjskdfjsldkfjsdlkfjslkdjfskldjflskdfjskldjflskdfjsdklfjsdklfjsldkfjsdlkfjsdlkfjsdlkfjsldkfjslkdfjsdlkfjsldkfjsdlkfjskdfjsldkfjsdlkfjslkdfjsdlkfjsldkfjsldkfjsldkfjslkdfjsdlkfjslkdfjsdklfsd', [
                { range: [[1, 1], [41, 3]], text: 'fsdjfsdkfjslkdfjskdfjsldkfjsdlkfjslkdjfskldjflskdfjskldjflskdfjsdklfjsdklfjsldkfjsdlkfjsdlkfjsdlkfjsldkfjslkdfjsdlkfjsldkfjsdlkfjskdfjsldkfjsdlkfjslkdfjsdlkfjsldkfjsldkfjsldkfjslkdfjsdlkfjslkdfjsdklfsd' },
            ]);
        });
        test('should support wrapping with multiple links', async () => {
            await configurationService.setUserConfiguration('terminal', { integrated: { wordSeparators: ' ' } });
            configurationService.onDidChangeConfigurationEmitter.fire({ affectsConfiguration: () => true });
            await assertLink('fsdjfsdkfjslkdfjskdfjsldkfj sdlkfjslkdjfskldjflskdfjskldjflskdfj sdklfjsdklfjsldkfjsdlkfjsdlkfjsdlkfjsldkfjslkdfjsdlkfjsldkfjsdlkfjskdfjsldkfjsdlkfjslkdfjsdlkfjsldkfjsldkfjsldkfjslkdfjsdlkfjslkdfjsdklfsd', [
                { range: [[1, 1], [27, 1]], text: 'fsdjfsdkfjslkdfjskdfjsldkfj' },
                { range: [[29, 1], [64, 1]], text: 'sdlkfjslkdjfskldjflskdfjskldjflskdfj' },
                { range: [[66, 1], [43, 3]], text: 'sdklfjsdklfjsldkfjsdlkfjsdlkfjsdlkfjsldkfjslkdfjsdlkfjsldkfjsdlkfjskdfjsldkfjsdlkfjslkdfjsdlkfjsldkfjsldkfjsldkfjslkdfjsdlkfjslkdfjsdklfsd' }
            ]);
        });
        test('does not return any links for empty text', async () => {
            await configurationService.setUserConfiguration('terminal', { integrated: { wordSeparators: ' ' } });
            configurationService.onDidChangeConfigurationEmitter.fire({ affectsConfiguration: () => true });
            await assertLink('', []);
        });
        test('should support file scheme links', async () => {
            await configurationService.setUserConfiguration('terminal', { integrated: { wordSeparators: ' ' } });
            configurationService.onDidChangeConfigurationEmitter.fire({ affectsConfiguration: () => true });
            await assertLink('file:///C:/users/test/file.txt ', [{ range: [[1, 1], [30, 1]], text: 'file:///C:/users/test/file.txt' }]);
            await assertLink('file:///C:/users/test/file.txt:1:10 ', [{ range: [[1, 1], [35, 1]], text: 'file:///C:/users/test/file.txt:1:10' }]);
        });
    });
});
//# sourceMappingURL=terminalWordLinkDetector.test.js.map