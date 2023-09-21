/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/viewModel/viewModelImpl", "vs/editor/test/browser/config/testConfiguration", "vs/editor/common/viewModel/monospaceLineBreaksComputer", "vs/editor/test/common/testTextModel", "vs/editor/test/common/modes/testLanguageConfigurationService", "vs/platform/theme/test/common/testThemeService"], function (require, exports, viewModelImpl_1, testConfiguration_1, monospaceLineBreaksComputer_1, testTextModel_1, testLanguageConfigurationService_1, testThemeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$g$b = void 0;
    function $g$b(text, options, callback) {
        const EDITOR_ID = 1;
        const configuration = new testConfiguration_1.$z0b(options);
        const model = (0, testTextModel_1.$O0b)(text.join('\n'));
        const monospaceLineBreaksComputerFactory = monospaceLineBreaksComputer_1.$rY.create(configuration.options);
        const testLanguageConfigurationService = new testLanguageConfigurationService_1.$D0b();
        const viewModel = new viewModelImpl_1.$qY(EDITOR_ID, configuration, model, monospaceLineBreaksComputerFactory, monospaceLineBreaksComputerFactory, null, testLanguageConfigurationService, new testThemeService_1.$K0b(), {
            setVisibleLines(visibleLines, stabilized) {
            },
        });
        callback(viewModel, model);
        viewModel.dispose();
        model.dispose();
        configuration.dispose();
        testLanguageConfigurationService.dispose();
    }
    exports.$g$b = $g$b;
});
//# sourceMappingURL=testViewModel.js.map