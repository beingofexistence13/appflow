/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/viewModel/viewModelImpl", "vs/editor/test/browser/config/testConfiguration", "vs/editor/common/viewModel/monospaceLineBreaksComputer", "vs/editor/test/common/testTextModel", "vs/editor/test/common/modes/testLanguageConfigurationService", "vs/platform/theme/test/common/testThemeService"], function (require, exports, viewModelImpl_1, testConfiguration_1, monospaceLineBreaksComputer_1, testTextModel_1, testLanguageConfigurationService_1, testThemeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.testViewModel = void 0;
    function testViewModel(text, options, callback) {
        const EDITOR_ID = 1;
        const configuration = new testConfiguration_1.TestConfiguration(options);
        const model = (0, testTextModel_1.createTextModel)(text.join('\n'));
        const monospaceLineBreaksComputerFactory = monospaceLineBreaksComputer_1.MonospaceLineBreaksComputerFactory.create(configuration.options);
        const testLanguageConfigurationService = new testLanguageConfigurationService_1.TestLanguageConfigurationService();
        const viewModel = new viewModelImpl_1.ViewModel(EDITOR_ID, configuration, model, monospaceLineBreaksComputerFactory, monospaceLineBreaksComputerFactory, null, testLanguageConfigurationService, new testThemeService_1.TestThemeService(), {
            setVisibleLines(visibleLines, stabilized) {
            },
        });
        callback(viewModel, model);
        viewModel.dispose();
        model.dispose();
        configuration.dispose();
        testLanguageConfigurationService.dispose();
    }
    exports.testViewModel = testViewModel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdFZpZXdNb2RlbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci90ZXN0L2Jyb3dzZXIvdmlld01vZGVsL3Rlc3RWaWV3TW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBV2hHLFNBQWdCLGFBQWEsQ0FBQyxJQUFjLEVBQUUsT0FBdUIsRUFBRSxRQUEwRDtRQUNoSSxNQUFNLFNBQVMsR0FBRyxDQUFDLENBQUM7UUFFcEIsTUFBTSxhQUFhLEdBQUcsSUFBSSxxQ0FBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNyRCxNQUFNLEtBQUssR0FBRyxJQUFBLCtCQUFlLEVBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQy9DLE1BQU0sa0NBQWtDLEdBQUcsZ0VBQWtDLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM1RyxNQUFNLGdDQUFnQyxHQUFHLElBQUksbUVBQWdDLEVBQUUsQ0FBQztRQUNoRixNQUFNLFNBQVMsR0FBRyxJQUFJLHlCQUFTLENBQUMsU0FBUyxFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsa0NBQWtDLEVBQUUsa0NBQWtDLEVBQUUsSUFBSyxFQUFFLGdDQUFnQyxFQUFFLElBQUksbUNBQWdCLEVBQUUsRUFBRTtZQUN6TSxlQUFlLENBQUMsWUFBWSxFQUFFLFVBQVU7WUFDeEMsQ0FBQztTQUNELENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFM0IsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3BCLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNoQixhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDeEIsZ0NBQWdDLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDNUMsQ0FBQztJQWxCRCxzQ0FrQkMifQ==