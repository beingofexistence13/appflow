/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "fs", "vs/base/common/network", "vs/base/common/uri"], function (require, exports, assert, fs_1, network_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('URI - perf', function () {
        let manyFileUris;
        setup(function () {
            manyFileUris = [];
            const data = (0, fs_1.readFileSync)(network_1.$2f.asFileUri('vs/base/test/node/uri.test.data.txt').fsPath).toString();
            const lines = data.split('\n');
            for (const line of lines) {
                manyFileUris.push(uri_1.URI.file(line));
            }
        });
        function perfTest(name, callback) {
            test(name, _done => {
                const t1 = Date.now();
                callback();
                const d = Date.now() - t1;
                console.log(`${name} took ${d}ms (${(d / manyFileUris.length).toPrecision(3)} ms/uri)`);
                _done();
            });
        }
        perfTest('toString', function () {
            for (const uri of manyFileUris) {
                const data = uri.toString();
                assert.ok(data);
            }
        });
        perfTest('toString(skipEncoding)', function () {
            for (const uri of manyFileUris) {
                const data = uri.toString(true);
                assert.ok(data);
            }
        });
        perfTest('fsPath', function () {
            for (const uri of manyFileUris) {
                const data = uri.fsPath;
                assert.ok(data);
            }
        });
        perfTest('toJSON', function () {
            for (const uri of manyFileUris) {
                const data = uri.toJSON();
                assert.ok(data);
            }
        });
    });
});
//# sourceMappingURL=uri.test.perf.js.map