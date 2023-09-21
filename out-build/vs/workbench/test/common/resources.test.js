/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/base/test/common/utils", "vs/platform/configuration/test/common/testConfigurationService", "vs/workbench/common/resources", "vs/workbench/test/common/workbenchTestServices"], function (require, exports, assert, lifecycle_1, uri_1, utils_1, testConfigurationService_1, resources_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ResourceGlobMatcher', () => {
        const SETTING = 'test.matcher';
        let contextService;
        let configurationService;
        const disposables = new lifecycle_1.$jc();
        setup(() => {
            contextService = new workbenchTestServices_1.$6dc();
            configurationService = new testConfigurationService_1.$G0b({
                [SETTING]: {
                    '**/*.md': true,
                    '**/*.txt': false
                }
            });
        });
        teardown(() => {
            disposables.clear();
        });
        test('Basics', async () => {
            const matcher = disposables.add(new resources_1.$wD(() => configurationService.getValue(SETTING), e => e.affectsConfiguration(SETTING), contextService, configurationService));
            // Matching
            assert.equal(matcher.matches(uri_1.URI.file('/foo/bar')), false);
            assert.equal(matcher.matches(uri_1.URI.file('/foo/bar.md')), true);
            assert.equal(matcher.matches(uri_1.URI.file('/foo/bar.txt')), false);
            // Events
            let eventCounter = 0;
            disposables.add(matcher.onExpressionChange(() => eventCounter++));
            await configurationService.setUserConfiguration(SETTING, { '**/*.foo': true });
            configurationService.onDidChangeConfigurationEmitter.fire({ affectsConfiguration: (key) => key === SETTING });
            assert.equal(eventCounter, 1);
            assert.equal(matcher.matches(uri_1.URI.file('/foo/bar.md')), false);
            assert.equal(matcher.matches(uri_1.URI.file('/foo/bar.foo')), true);
            await configurationService.setUserConfiguration(SETTING, undefined);
            configurationService.onDidChangeConfigurationEmitter.fire({ affectsConfiguration: (key) => key === SETTING });
            assert.equal(eventCounter, 2);
            assert.equal(matcher.matches(uri_1.URI.file('/foo/bar.md')), false);
            assert.equal(matcher.matches(uri_1.URI.file('/foo/bar.foo')), false);
            await configurationService.setUserConfiguration(SETTING, {
                '**/*.md': true,
                '**/*.txt': false,
                'C:/bar/**': true,
                '/bar/**': true
            });
            configurationService.onDidChangeConfigurationEmitter.fire({ affectsConfiguration: (key) => key === SETTING });
            assert.equal(matcher.matches(uri_1.URI.file('/bar/foo.1')), true);
            assert.equal(matcher.matches(uri_1.URI.file('C:/bar/foo.1')), true);
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=resources.test.js.map