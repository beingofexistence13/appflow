/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/cancellation", "vs/base/common/uri", "vs/workbench/services/search/node/textSearchManager"], function (require, exports, assert, cancellation_1, uri_1, textSearchManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('NativeTextSearchManager', () => {
        test('fixes encoding', async () => {
            let correctEncoding = false;
            const provider = {
                provideTextSearchResults(query, options, progress, token) {
                    correctEncoding = options.encoding === 'windows-1252';
                    return null;
                }
            };
            const query = {
                type: 2 /* QueryType.Text */,
                contentPattern: {
                    pattern: 'a'
                },
                folderQueries: [{
                        folder: uri_1.URI.file('/some/folder'),
                        fileEncoding: 'windows1252'
                    }]
            };
            const m = new textSearchManager_1.$Gdc(query, provider);
            await m.search(() => { }, new cancellation_1.$pd().token);
            assert.ok(correctEncoding);
        });
    });
});
//# sourceMappingURL=textSearchManager.test.js.map