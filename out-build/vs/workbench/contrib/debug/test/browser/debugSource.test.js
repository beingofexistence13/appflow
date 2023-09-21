/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/platform", "vs/base/common/uri", "vs/base/test/common/utils", "vs/platform/log/common/log", "vs/workbench/contrib/debug/common/debugSource", "vs/workbench/contrib/debug/test/browser/mockDebugModel"], function (require, exports, assert, platform_1, uri_1, utils_1, log_1, debugSource_1, mockDebugModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Debug - Source', () => {
        (0, utils_1.$bT)();
        test('from raw source', () => {
            const source = new debugSource_1.$wF({
                name: 'zz',
                path: '/xx/yy/zz',
                sourceReference: 0,
                presentationHint: 'emphasize'
            }, 'aDebugSessionId', mockDebugModel_1.$tfc, new log_1.$fj());
            assert.strictEqual(source.presentationHint, 'emphasize');
            assert.strictEqual(source.name, 'zz');
            assert.strictEqual(source.inMemory, false);
            assert.strictEqual(source.reference, 0);
            assert.strictEqual(source.uri.toString(), uri_1.URI.file('/xx/yy/zz').toString());
        });
        test('from raw internal source', () => {
            const source = new debugSource_1.$wF({
                name: 'internalModule.js',
                sourceReference: 11,
                presentationHint: 'deemphasize'
            }, 'aDebugSessionId', mockDebugModel_1.$tfc, new log_1.$fj());
            assert.strictEqual(source.presentationHint, 'deemphasize');
            assert.strictEqual(source.name, 'internalModule.js');
            assert.strictEqual(source.inMemory, true);
            assert.strictEqual(source.reference, 11);
            assert.strictEqual(source.uri.toString(), 'debug:internalModule.js?session%3DaDebugSessionId%26ref%3D11');
        });
        test('get encoded debug data', () => {
            const checkData = (uri, expectedName, expectedPath, expectedSourceReference, expectedSessionId) => {
                const { name, path, sourceReference, sessionId } = debugSource_1.$wF.getEncodedDebugData(uri);
                assert.strictEqual(name, expectedName);
                assert.strictEqual(path, expectedPath);
                assert.strictEqual(sourceReference, expectedSourceReference);
                assert.strictEqual(sessionId, expectedSessionId);
            };
            checkData(uri_1.URI.file('a/b/c/d'), 'd', platform_1.$i ? '\\a\\b\\c\\d' : '/a/b/c/d', undefined, undefined);
            checkData(uri_1.URI.from({ scheme: 'file', path: '/my/path/test.js', query: 'ref=1&session=2' }), 'test.js', platform_1.$i ? '\\my\\path\\test.js' : '/my/path/test.js', undefined, undefined);
            checkData(uri_1.URI.from({ scheme: 'http', authority: 'www.example.com', path: '/my/path' }), 'path', 'http://www.example.com/my/path', undefined, undefined);
            checkData(uri_1.URI.from({ scheme: 'debug', authority: 'www.example.com', path: '/my/path', query: 'ref=100' }), 'path', '/my/path', 100, undefined);
            checkData(uri_1.URI.from({ scheme: 'debug', path: 'a/b/c/d.js', query: 'session=100' }), 'd.js', 'a/b/c/d.js', undefined, '100');
            checkData(uri_1.URI.from({ scheme: 'debug', path: 'a/b/c/d/foo.txt', query: 'session=100&ref=10' }), 'foo.txt', 'a/b/c/d/foo.txt', 10, '100');
        });
    });
});
//# sourceMappingURL=debugSource.test.js.map