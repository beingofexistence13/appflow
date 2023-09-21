/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/api/browser/mainThreadDocuments", "vs/base/common/async", "vs/base/common/uri", "vs/base/common/resources"], function (require, exports, assert, mainThreadDocuments_1, async_1, uri_1, resources_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('BoundModelReferenceCollection', function () {
        let col;
        setup(function () {
            col = new mainThreadDocuments_1.$Lcb(resources_1.$$f, 15, 75);
        });
        teardown(function () {
            col.dispose();
        });
        test('max age', async function () {
            let didDispose = false;
            col.add(uri_1.URI.parse('test://farboo'), {
                object: {},
                dispose() {
                    didDispose = true;
                }
            });
            await (0, async_1.$Hg)(30);
            assert.strictEqual(didDispose, true);
        });
        test('max size', function () {
            const disposed = [];
            col.add(uri_1.URI.parse('test://farboo'), {
                object: {},
                dispose() {
                    disposed.push(0);
                }
            }, 6);
            col.add(uri_1.URI.parse('test://boofar'), {
                object: {},
                dispose() {
                    disposed.push(1);
                }
            }, 6);
            col.add(uri_1.URI.parse('test://xxxxxxx'), {
                object: {},
                dispose() {
                    disposed.push(2);
                }
            }, 70);
            assert.deepStrictEqual(disposed, [0, 1]);
        });
        test('max count', function () {
            col.dispose();
            col = new mainThreadDocuments_1.$Lcb(resources_1.$$f, 10000, 10000, 2);
            const disposed = [];
            col.add(uri_1.URI.parse('test://xxxxxxx'), {
                object: {},
                dispose() {
                    disposed.push(0);
                }
            });
            col.add(uri_1.URI.parse('test://xxxxxxx'), {
                object: {},
                dispose() {
                    disposed.push(1);
                }
            });
            col.add(uri_1.URI.parse('test://xxxxxxx'), {
                object: {},
                dispose() {
                    disposed.push(2);
                }
            });
            assert.deepStrictEqual(disposed, [0]);
        });
        test('dispose uri', function () {
            let disposed = [];
            col.add(uri_1.URI.parse('test:///farboo'), {
                object: {},
                dispose() {
                    disposed.push(0);
                }
            });
            col.add(uri_1.URI.parse('test:///boofar'), {
                object: {},
                dispose() {
                    disposed.push(1);
                }
            });
            col.add(uri_1.URI.parse('test:///boo/far1'), {
                object: {},
                dispose() {
                    disposed.push(2);
                }
            });
            col.add(uri_1.URI.parse('test:///boo/far2'), {
                object: {},
                dispose() {
                    disposed.push(3);
                }
            });
            col.add(uri_1.URI.parse('test:///boo1/far'), {
                object: {},
                dispose() {
                    disposed.push(4);
                }
            });
            col.remove(uri_1.URI.parse('test:///unknown'));
            assert.strictEqual(disposed.length, 0);
            col.remove(uri_1.URI.parse('test:///farboo'));
            assert.deepStrictEqual(disposed, [0]);
            disposed = [];
            col.remove(uri_1.URI.parse('test:///boo'));
            assert.deepStrictEqual(disposed, [2, 3]);
        });
    });
});
//# sourceMappingURL=mainThreadDocuments.test.js.map