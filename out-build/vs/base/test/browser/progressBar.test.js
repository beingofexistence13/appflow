/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/browser/ui/progressbar/progressbar", "vs/base/test/common/utils"], function (require, exports, assert, progressbar_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ProgressBar', () => {
        let fixture;
        setup(() => {
            fixture = document.createElement('div');
            document.body.appendChild(fixture);
        });
        teardown(() => {
            document.body.removeChild(fixture);
        });
        test('Progress Bar', function () {
            const bar = new progressbar_1.$YR(fixture);
            assert(bar.infinite());
            assert(bar.total(100));
            assert(bar.worked(50));
            assert(bar.setWorked(70));
            assert(bar.worked(30));
            assert(bar.done());
            bar.dispose();
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=progressBar.test.js.map