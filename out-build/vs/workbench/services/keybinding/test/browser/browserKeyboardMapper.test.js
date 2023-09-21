define(["require", "exports", "assert", "vs/workbench/services/keybinding/browser/keyboardLayouts/_.contribution", "vs/workbench/services/keybinding/browser/keyboardLayoutService", "vs/workbench/services/keybinding/common/keymapInfo", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/notification/common/notification", "vs/platform/commands/common/commands", "vs/platform/notification/test/common/testNotificationService", "vs/workbench/test/common/workbenchTestServices", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/base/test/common/utils", "vs/workbench/services/keybinding/browser/keyboardLayouts/en.darwin", "vs/workbench/services/keybinding/browser/keyboardLayouts/de.darwin"], function (require, exports, assert, __contribution_1, keyboardLayoutService_1, keymapInfo_1, instantiationServiceMock_1, notification_1, commands_1, testNotificationService_1, workbenchTestServices_1, configuration_1, testConfigurationService_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TestKeyboardMapperFactory extends keyboardLayoutService_1.$r3b {
        constructor(configurationService, notificationService, storageService, commandService) {
            // super(notificationService, storageService, commandService);
            super(configurationService);
            const keymapInfos = __contribution_1.$cgc.INSTANCE.layoutInfos;
            this.f.push(...keymapInfos.map(info => (new keymapInfo_1.$l3b(info.layout, info.secondaryLayouts, info.mapping, info.isUserKeyboardLayout))));
            this.g = this.f;
            this.a = true;
            this.setLayoutFromBrowserAPI();
            const usLayout = this.getUSStandardLayout();
            if (usLayout) {
                this.setActiveKeyMapping(usLayout.mapping);
            }
        }
    }
    suite('keyboard layout loader', () => {
        const ds = (0, utils_1.$bT)();
        let instantiationService;
        let instance;
        setup(() => {
            instantiationService = new instantiationServiceMock_1.$L0b();
            const storageService = new workbenchTestServices_1.$7dc();
            const notitifcationService = instantiationService.stub(notification_1.$Yu, new testNotificationService_1.$I0b());
            const configurationService = instantiationService.stub(configuration_1.$8h, new testConfigurationService_1.$G0b());
            const commandService = instantiationService.stub(commands_1.$Fr, {});
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
//# sourceMappingURL=browserKeyboardMapper.test.js.map