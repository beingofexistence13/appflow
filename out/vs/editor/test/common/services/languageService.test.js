/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/languages/modesRegistry", "vs/editor/common/services/languageService"], function (require, exports, assert, utils_1, modesRegistry_1, languageService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('LanguageService', () => {
        test('LanguageSelection does not leak a disposable', () => {
            const languageService = new languageService_1.LanguageService();
            (0, utils_1.throwIfDisposablesAreLeaked)(() => {
                const languageSelection = languageService.createById(modesRegistry_1.PLAINTEXT_LANGUAGE_ID);
                assert.strictEqual(languageSelection.languageId, modesRegistry_1.PLAINTEXT_LANGUAGE_ID);
            });
            (0, utils_1.throwIfDisposablesAreLeaked)(() => {
                const languageSelection = languageService.createById(modesRegistry_1.PLAINTEXT_LANGUAGE_ID);
                const listener = languageSelection.onDidChange(() => { });
                assert.strictEqual(languageSelection.languageId, modesRegistry_1.PLAINTEXT_LANGUAGE_ID);
                listener.dispose();
            });
            languageService.dispose();
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3VhZ2VTZXJ2aWNlLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvdGVzdC9jb21tb24vc2VydmljZXMvbGFuZ3VhZ2VTZXJ2aWNlLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFPaEcsS0FBSyxDQUFDLGlCQUFpQixFQUFFLEdBQUcsRUFBRTtRQUU3QixJQUFJLENBQUMsOENBQThDLEVBQUUsR0FBRyxFQUFFO1lBQ3pELE1BQU0sZUFBZSxHQUFHLElBQUksaUNBQWUsRUFBRSxDQUFDO1lBQzlDLElBQUEsbUNBQTJCLEVBQUMsR0FBRyxFQUFFO2dCQUNoQyxNQUFNLGlCQUFpQixHQUFHLGVBQWUsQ0FBQyxVQUFVLENBQUMscUNBQXFCLENBQUMsQ0FBQztnQkFDNUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLEVBQUUscUNBQXFCLENBQUMsQ0FBQztZQUN6RSxDQUFDLENBQUMsQ0FBQztZQUNILElBQUEsbUNBQTJCLEVBQUMsR0FBRyxFQUFFO2dCQUNoQyxNQUFNLGlCQUFpQixHQUFHLGVBQWUsQ0FBQyxVQUFVLENBQUMscUNBQXFCLENBQUMsQ0FBQztnQkFDNUUsTUFBTSxRQUFRLEdBQUcsaUJBQWlCLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUMxRCxNQUFNLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLFVBQVUsRUFBRSxxQ0FBcUIsQ0FBQyxDQUFDO2dCQUN4RSxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDcEIsQ0FBQyxDQUFDLENBQUM7WUFDSCxlQUFlLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFM0IsQ0FBQyxDQUFDLENBQUM7SUFFSixDQUFDLENBQUMsQ0FBQyJ9