/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/editor/standalone/browser/standaloneCodeEditorService", "vs/editor/standalone/browser/standaloneServices", "vs/editor/standalone/browser/standaloneThemeService", "vs/platform/contextkey/browser/contextKeyService", "vs/platform/instantiation/common/instantiationService", "vs/platform/instantiation/common/serviceCollection", "vs/platform/log/common/log", "vs/platform/telemetry/common/telemetryUtils"], function (require, exports, assert, lifecycle_1, utils_1, standaloneCodeEditorService_1, standaloneServices_1, standaloneThemeService_1, contextKeyService_1, instantiationService_1, serviceCollection_1, log_1, telemetryUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('StandaloneKeybindingService', () => {
        (0, utils_1.$bT)();
        class TestStandaloneKeybindingService extends standaloneServices_1.$W8b {
            testDispatch(e) {
                super.I(e, null);
            }
        }
        test('issue microsoft/monaco-editor#167', () => {
            const disposables = new lifecycle_1.$jc();
            const serviceCollection = new serviceCollection_1.$zh();
            const instantiationService = new instantiationService_1.$6p(serviceCollection, true);
            const configurationService = new standaloneServices_1.$X8b();
            const contextKeyService = disposables.add(new contextKeyService_1.$xtb(configurationService));
            const commandService = new standaloneServices_1.$V8b(instantiationService);
            const notificationService = new standaloneServices_1.$U8b();
            const standaloneThemeService = disposables.add(new standaloneThemeService_1.$T8b());
            const codeEditorService = disposables.add(new standaloneCodeEditorService_1.$G8b(contextKeyService, standaloneThemeService));
            const keybindingService = disposables.add(new TestStandaloneKeybindingService(contextKeyService, commandService, telemetryUtils_1.$bo, notificationService, new log_1.$fj(), codeEditorService));
            let commandInvoked = false;
            disposables.add(keybindingService.addDynamicKeybinding('testCommand', 67 /* KeyCode.F9 */, () => {
                commandInvoked = true;
            }, undefined));
            keybindingService.testDispatch({
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: 67 /* KeyCode.F9 */,
                code: null
            });
            assert.ok(commandInvoked, 'command invoked');
            disposables.dispose();
        });
    });
});
//# sourceMappingURL=standaloneServices.test.js.map