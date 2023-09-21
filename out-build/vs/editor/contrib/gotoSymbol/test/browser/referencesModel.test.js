/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/contrib/gotoSymbol/browser/referencesModel"], function (require, exports, assert, uri_1, position_1, range_1, referencesModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('references', function () {
        test('nearestReference', () => {
            const model = new referencesModel_1.$B4([{
                    uri: uri_1.URI.file('/out/obj/can'),
                    range: new range_1.$ks(1, 1, 1, 1)
                }, {
                    uri: uri_1.URI.file('/out/obj/can2'),
                    range: new range_1.$ks(1, 1, 1, 1)
                }, {
                    uri: uri_1.URI.file('/src/can'),
                    range: new range_1.$ks(1, 1, 1, 1)
                }], 'FOO');
            let ref = model.nearestReference(uri_1.URI.file('/src/can'), new position_1.$js(1, 1));
            assert.strictEqual(ref.uri.path, '/src/can');
            ref = model.nearestReference(uri_1.URI.file('/src/someOtherFileInSrc'), new position_1.$js(1, 1));
            assert.strictEqual(ref.uri.path, '/src/can');
            ref = model.nearestReference(uri_1.URI.file('/out/someOtherFile'), new position_1.$js(1, 1));
            assert.strictEqual(ref.uri.path, '/out/obj/can');
            ref = model.nearestReference(uri_1.URI.file('/out/obj/can2222'), new position_1.$js(1, 1));
            assert.strictEqual(ref.uri.path, '/out/obj/can2');
        });
    });
});
//# sourceMappingURL=referencesModel.test.js.map