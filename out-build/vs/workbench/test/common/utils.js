/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/editor/common/services/languagesRegistry"], function (require, exports, assert, languagesRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.assertCleanState = void 0;
    /**
     * This function is called before test running and also again at the end of test running
     * and can be used to add assertions. e.g. that registries are empty, etc.
     *
     * !! This is called directly by the testing framework.
     *
     * @skipMangle
     */
    function assertCleanState() {
        // If this test fails, it is a clear indication that
        // your test or suite is leaking services (e.g. via leaking text models)
        // assert.strictEqual(LanguageService.instanceCount, 0, 'No leaking ILanguageService');
        assert.strictEqual(languagesRegistry_1.$imb.instanceCount, 0, 'Error: Test run should not leak in LanguagesRegistry.');
    }
    exports.assertCleanState = assertCleanState;
});
//# sourceMappingURL=utils.js.map