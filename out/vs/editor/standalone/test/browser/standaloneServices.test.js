/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/editor/standalone/browser/standaloneCodeEditorService", "vs/editor/standalone/browser/standaloneServices", "vs/editor/standalone/browser/standaloneThemeService", "vs/platform/contextkey/browser/contextKeyService", "vs/platform/instantiation/common/instantiationService", "vs/platform/instantiation/common/serviceCollection", "vs/platform/log/common/log", "vs/platform/telemetry/common/telemetryUtils"], function (require, exports, assert, lifecycle_1, utils_1, standaloneCodeEditorService_1, standaloneServices_1, standaloneThemeService_1, contextKeyService_1, instantiationService_1, serviceCollection_1, log_1, telemetryUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('StandaloneKeybindingService', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        class TestStandaloneKeybindingService extends standaloneServices_1.StandaloneKeybindingService {
            testDispatch(e) {
                super._dispatch(e, null);
            }
        }
        test('issue microsoft/monaco-editor#167', () => {
            const disposables = new lifecycle_1.DisposableStore();
            const serviceCollection = new serviceCollection_1.ServiceCollection();
            const instantiationService = new instantiationService_1.InstantiationService(serviceCollection, true);
            const configurationService = new standaloneServices_1.StandaloneConfigurationService();
            const contextKeyService = disposables.add(new contextKeyService_1.ContextKeyService(configurationService));
            const commandService = new standaloneServices_1.StandaloneCommandService(instantiationService);
            const notificationService = new standaloneServices_1.StandaloneNotificationService();
            const standaloneThemeService = disposables.add(new standaloneThemeService_1.StandaloneThemeService());
            const codeEditorService = disposables.add(new standaloneCodeEditorService_1.StandaloneCodeEditorService(contextKeyService, standaloneThemeService));
            const keybindingService = disposables.add(new TestStandaloneKeybindingService(contextKeyService, commandService, telemetryUtils_1.NullTelemetryService, notificationService, new log_1.NullLogService(), codeEditorService));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhbmRhbG9uZVNlcnZpY2VzLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3Ivc3RhbmRhbG9uZS90ZXN0L2Jyb3dzZXIvc3RhbmRhbG9uZVNlcnZpY2VzLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFnQmhHLEtBQUssQ0FBQyw2QkFBNkIsRUFBRSxHQUFHLEVBQUU7UUFFekMsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRTFDLE1BQU0sK0JBQWdDLFNBQVEsZ0RBQTJCO1lBQ2pFLFlBQVksQ0FBQyxDQUFpQjtnQkFDcEMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsSUFBSyxDQUFDLENBQUM7WUFDM0IsQ0FBQztTQUNEO1FBRUQsSUFBSSxDQUFDLG1DQUFtQyxFQUFFLEdBQUcsRUFBRTtZQUU5QyxNQUFNLFdBQVcsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUMxQyxNQUFNLGlCQUFpQixHQUFHLElBQUkscUNBQWlCLEVBQUUsQ0FBQztZQUNsRCxNQUFNLG9CQUFvQixHQUFHLElBQUksMkNBQW9CLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDL0UsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLG1EQUE4QixFQUFFLENBQUM7WUFDbEUsTUFBTSxpQkFBaUIsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUkscUNBQWlCLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO1lBQ3ZGLE1BQU0sY0FBYyxHQUFHLElBQUksNkNBQXdCLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUMxRSxNQUFNLG1CQUFtQixHQUFHLElBQUksa0RBQTZCLEVBQUUsQ0FBQztZQUNoRSxNQUFNLHNCQUFzQixHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSwrQ0FBc0IsRUFBRSxDQUFDLENBQUM7WUFDN0UsTUFBTSxpQkFBaUIsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUkseURBQTJCLENBQUMsaUJBQWlCLEVBQUUsc0JBQXNCLENBQUMsQ0FBQyxDQUFDO1lBQ3RILE1BQU0saUJBQWlCLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLCtCQUErQixDQUFDLGlCQUFpQixFQUFFLGNBQWMsRUFBRSxxQ0FBb0IsRUFBRSxtQkFBbUIsRUFBRSxJQUFJLG9CQUFjLEVBQUUsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7WUFFdE0sSUFBSSxjQUFjLEdBQUcsS0FBSyxDQUFDO1lBQzNCLFdBQVcsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsb0JBQW9CLENBQUMsYUFBYSx1QkFBYyxHQUFHLEVBQUU7Z0JBQ3RGLGNBQWMsR0FBRyxJQUFJLENBQUM7WUFDdkIsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFFZixpQkFBaUIsQ0FBQyxZQUFZLENBQUM7Z0JBQzlCLDJCQUEyQixFQUFFLElBQUk7Z0JBQ2pDLE9BQU8sRUFBRSxLQUFLO2dCQUNkLFFBQVEsRUFBRSxLQUFLO2dCQUNmLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE9BQU8sRUFBRSxLQUFLO2dCQUNkLFdBQVcsRUFBRSxLQUFLO2dCQUNsQixPQUFPLHFCQUFZO2dCQUNuQixJQUFJLEVBQUUsSUFBSzthQUNYLENBQUMsQ0FBQztZQUVILE1BQU0sQ0FBQyxFQUFFLENBQUMsY0FBYyxFQUFFLGlCQUFpQixDQUFDLENBQUM7WUFFN0MsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUMifQ==