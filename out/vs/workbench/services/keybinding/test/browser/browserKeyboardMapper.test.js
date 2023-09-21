define(["require", "exports", "assert", "vs/workbench/services/keybinding/browser/keyboardLayouts/_.contribution", "vs/workbench/services/keybinding/browser/keyboardLayoutService", "vs/workbench/services/keybinding/common/keymapInfo", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/notification/common/notification", "vs/platform/commands/common/commands", "vs/platform/notification/test/common/testNotificationService", "vs/workbench/test/common/workbenchTestServices", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/base/test/common/utils", "vs/workbench/services/keybinding/browser/keyboardLayouts/en.darwin", "vs/workbench/services/keybinding/browser/keyboardLayouts/de.darwin"], function (require, exports, assert, __contribution_1, keyboardLayoutService_1, keymapInfo_1, instantiationServiceMock_1, notification_1, commands_1, testNotificationService_1, workbenchTestServices_1, configuration_1, testConfigurationService_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TestKeyboardMapperFactory extends keyboardLayoutService_1.BrowserKeyboardMapperFactoryBase {
        constructor(configurationService, notificationService, storageService, commandService) {
            // super(notificationService, storageService, commandService);
            super(configurationService);
            const keymapInfos = __contribution_1.KeyboardLayoutContribution.INSTANCE.layoutInfos;
            this._keymapInfos.push(...keymapInfos.map(info => (new keymapInfo_1.KeymapInfo(info.layout, info.secondaryLayouts, info.mapping, info.isUserKeyboardLayout))));
            this._mru = this._keymapInfos;
            this._initialized = true;
            this.setLayoutFromBrowserAPI();
            const usLayout = this.getUSStandardLayout();
            if (usLayout) {
                this.setActiveKeyMapping(usLayout.mapping);
            }
        }
    }
    suite('keyboard layout loader', () => {
        const ds = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        let instantiationService;
        let instance;
        setup(() => {
            instantiationService = new instantiationServiceMock_1.TestInstantiationService();
            const storageService = new workbenchTestServices_1.TestStorageService();
            const notitifcationService = instantiationService.stub(notification_1.INotificationService, new testNotificationService_1.TestNotificationService());
            const configurationService = instantiationService.stub(configuration_1.IConfigurationService, new testConfigurationService_1.TestConfigurationService());
            const commandService = instantiationService.stub(commands_1.ICommandService, {});
            ds.add(instantiationService);
            ds.add(storageService);
            instance = new TestKeyboardMapperFactory(configurationService, notitifcationService, storageService, commandService);
            ds.add(instance);
        });
        teardown(() => {
            instantiationService.dispose();
        });
        test('load default US keyboard layout', () => {
            assert.notStrictEqual(instance.activeKeyboardLayout, null);
        });
        test('isKeyMappingActive', () => {
            instance.setUSKeyboardLayout();
            assert.strictEqual(instance.isKeyMappingActive({
                KeyA: {
                    value: 'a',
                    valueIsDeadKey: false,
                    withShift: 'A',
                    withShiftIsDeadKey: false,
                    withAltGr: 'å',
                    withAltGrIsDeadKey: false,
                    withShiftAltGr: 'Å',
                    withShiftAltGrIsDeadKey: false
                }
            }), true);
            assert.strictEqual(instance.isKeyMappingActive({
                KeyA: {
                    value: 'a',
                    valueIsDeadKey: false,
                    withShift: 'A',
                    withShiftIsDeadKey: false,
                    withAltGr: 'å',
                    withAltGrIsDeadKey: false,
                    withShiftAltGr: 'Å',
                    withShiftAltGrIsDeadKey: false
                },
                KeyZ: {
                    value: 'z',
                    valueIsDeadKey: false,
                    withShift: 'Z',
                    withShiftIsDeadKey: false,
                    withAltGr: 'Ω',
                    withAltGrIsDeadKey: false,
                    withShiftAltGr: '¸',
                    withShiftAltGrIsDeadKey: false
                }
            }), true);
            assert.strictEqual(instance.isKeyMappingActive({
                KeyZ: {
                    value: 'y',
                    valueIsDeadKey: false,
                    withShift: 'Y',
                    withShiftIsDeadKey: false,
                    withAltGr: '¥',
                    withAltGrIsDeadKey: false,
                    withShiftAltGr: 'Ÿ',
                    withShiftAltGrIsDeadKey: false
                },
            }), false);
        });
        test('Switch keymapping', () => {
            instance.setActiveKeyMapping({
                KeyZ: {
                    value: 'y',
                    valueIsDeadKey: false,
                    withShift: 'Y',
                    withShiftIsDeadKey: false,
                    withAltGr: '¥',
                    withAltGrIsDeadKey: false,
                    withShiftAltGr: 'Ÿ',
                    withShiftAltGrIsDeadKey: false
                }
            });
            assert.strictEqual(!!instance.activeKeyboardLayout.isUSStandard, false);
            assert.strictEqual(instance.isKeyMappingActive({
                KeyZ: {
                    value: 'y',
                    valueIsDeadKey: false,
                    withShift: 'Y',
                    withShiftIsDeadKey: false,
                    withAltGr: '¥',
                    withAltGrIsDeadKey: false,
                    withShiftAltGr: 'Ÿ',
                    withShiftAltGrIsDeadKey: false
                },
            }), true);
            instance.setUSKeyboardLayout();
            assert.strictEqual(instance.activeKeyboardLayout.isUSStandard, true);
        });
        test('Switch keyboard layout info', () => {
            instance.setKeyboardLayout('com.apple.keylayout.German');
            assert.strictEqual(!!instance.activeKeyboardLayout.isUSStandard, false);
            assert.strictEqual(instance.isKeyMappingActive({
                KeyZ: {
                    value: 'y',
                    valueIsDeadKey: false,
                    withShift: 'Y',
                    withShiftIsDeadKey: false,
                    withAltGr: '¥',
                    withAltGrIsDeadKey: false,
                    withShiftAltGr: 'Ÿ',
                    withShiftAltGrIsDeadKey: false
                },
            }), true);
            instance.setUSKeyboardLayout();
            assert.strictEqual(instance.activeKeyboardLayout.isUSStandard, true);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3NlcktleWJvYXJkTWFwcGVyLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMva2V5YmluZGluZy90ZXN0L2Jyb3dzZXIvYnJvd3NlcktleWJvYXJkTWFwcGVyLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBb0JBLE1BQU0seUJBQTBCLFNBQVEsd0RBQWdDO1FBQ3ZFLFlBQVksb0JBQTJDLEVBQUUsbUJBQXlDLEVBQUUsY0FBK0IsRUFBRSxjQUErQjtZQUNuSyw4REFBOEQ7WUFDOUQsS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFFNUIsTUFBTSxXQUFXLEdBQWtCLDJDQUEwQixDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUM7WUFDbkYsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLHVCQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsSixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7WUFDOUIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7WUFDekIsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7WUFDL0IsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7WUFDNUMsSUFBSSxRQUFRLEVBQUU7Z0JBQ2IsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUMzQztRQUNGLENBQUM7S0FDRDtJQUVELEtBQUssQ0FBQyx3QkFBd0IsRUFBRSxHQUFHLEVBQUU7UUFD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