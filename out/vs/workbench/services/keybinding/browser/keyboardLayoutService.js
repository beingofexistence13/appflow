/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls", "vs/base/common/event", "vs/base/common/lifecycle", "vs/workbench/services/keybinding/common/keymapInfo", "vs/platform/instantiation/common/extensions", "vs/platform/keyboardLayout/common/keyboardConfig", "vs/platform/keyboardLayout/common/keyboardMapper", "vs/base/common/platform", "vs/workbench/services/keybinding/common/windowsKeyboardMapper", "vs/workbench/services/keybinding/common/fallbackKeyboardMapper", "vs/workbench/services/keybinding/common/macLinuxKeyboardMapper", "vs/platform/files/common/files", "vs/base/common/async", "vs/base/common/json", "vs/base/common/objects", "vs/platform/environment/common/environment", "vs/platform/registry/common/platform", "vs/platform/configuration/common/configurationRegistry", "vs/platform/configuration/common/configuration", "vs/platform/notification/common/notification", "vs/platform/commands/common/commands", "vs/platform/storage/common/storage", "vs/platform/keyboardLayout/common/keyboardLayout"], function (require, exports, nls, event_1, lifecycle_1, keymapInfo_1, extensions_1, keyboardConfig_1, keyboardMapper_1, platform_1, windowsKeyboardMapper_1, fallbackKeyboardMapper_1, macLinuxKeyboardMapper_1, files_1, async_1, json_1, objects, environment_1, platform_2, configurationRegistry_1, configuration_1, notification_1, commands_1, storage_1, keyboardLayout_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BrowserKeyboardLayoutService = exports.BrowserKeyboardMapperFactory = exports.BrowserKeyboardMapperFactoryBase = void 0;
    class BrowserKeyboardMapperFactoryBase extends lifecycle_1.Disposable {
        get activeKeymap() {
            return this._activeKeymapInfo;
        }
        get keymapInfos() {
            return this._keymapInfos;
        }
        get activeKeyboardLayout() {
            if (!this._initialized) {
                return null;
            }
            return this._activeKeymapInfo?.layout ?? null;
        }
        get activeKeyMapping() {
            if (!this._initialized) {
                return null;
            }
            return this._activeKeymapInfo?.mapping ?? null;
        }
        get keyboardLayouts() {
            return this._keymapInfos.map(keymapInfo => keymapInfo.layout);
        }
        constructor(_configurationService) {
            super();
            this._configurationService = _configurationService;
            this._onDidChangeKeyboardMapper = new event_1.Emitter();
            this.onDidChangeKeyboardMapper = this._onDidChangeKeyboardMapper.event;
            this._keyboardMapper = null;
            this._initialized = false;
            this._keymapInfos = [];
            this._mru = [];
            this._activeKeymapInfo = null;
            if (navigator.keyboard && navigator.keyboard.addEventListener) {
                navigator.keyboard.addEventListener('layoutchange', () => {
                    // Update user keyboard map settings
                    this._getBrowserKeyMapping().then((mapping) => {
                        if (this.isKeyMappingActive(mapping)) {
                            return;
                        }
                        this.setLayoutFromBrowserAPI();
                    });
                });
            }
            this._register(this._configurationService.onDidChangeConfiguration((e) => {
                if (e.affectsConfiguration('keyboard')) {
                    this._keyboardMapper = null;
                    this._onDidChangeKeyboardMapper.fire();
                }
            }));
        }
        registerKeyboardLayout(layout) {
            this._keymapInfos.push(layout);
            this._mru = this._keymapInfos;
        }
        removeKeyboardLayout(layout) {
            let index = this._mru.indexOf(layout);
            this._mru.splice(index, 1);
            index = this._keymapInfos.indexOf(layout);
            this._keymapInfos.splice(index, 1);
        }
        getMatchedKeymapInfo(keyMapping) {
            if (!keyMapping) {
                return null;
            }
            const usStandard = this.getUSStandardLayout();
            if (usStandard) {
                let maxScore = usStandard.getScore(keyMapping);
                if (maxScore === 0) {
                    return {
                        result: usStandard,
                        score: 0
                    };
                }
                let result = usStandard;
                for (let i = 0; i < this._mru.length; i++) {
                    const score = this._mru[i].getScore(keyMapping);
                    if (score > maxScore) {
                        if (score === 0) {
                            return {
                                result: this._mru[i],
                                score: 0
                            };
                        }
                        maxScore = score;
                        result = this._mru[i];
                    }
                }
                return {
                    result,
                    score: maxScore
                };
            }
            for (let i = 0; i < this._mru.length; i++) {
                if (this._mru[i].fuzzyEqual(keyMapping)) {
                    return {
                        result: this._mru[i],
                        score: 0
                    };
                }
            }
            return null;
        }
        getUSStandardLayout() {
            const usStandardLayouts = this._mru.filter(layout => layout.layout.isUSStandard);
            if (usStandardLayouts.length) {
                return usStandardLayouts[0];
            }
            return null;
        }
        isKeyMappingActive(keymap) {
            return this._activeKeymapInfo && keymap && this._activeKeymapInfo.fuzzyEqual(keymap);
        }
        setUSKeyboardLayout() {
            this._activeKeymapInfo = this.getUSStandardLayout();
        }
        setActiveKeyMapping(keymap) {
            let keymapUpdated = false;
            const matchedKeyboardLayout = this.getMatchedKeymapInfo(keymap);
            if (matchedKeyboardLayout) {
                // let score = matchedKeyboardLayout.score;
                // Due to https://bugs.chromium.org/p/chromium/issues/detail?id=977609, any key after a dead key will generate a wrong mapping,
                // we shoud avoid yielding the false error.
                // if (keymap && score < 0) {
                // const donotAskUpdateKey = 'missing.keyboardlayout.donotask';
                // if (this._storageService.getBoolean(donotAskUpdateKey, StorageScope.APPLICATION)) {
                // 	return;
                // }
                // the keyboard layout doesn't actually match the key event or the keymap from chromium
                // this._notificationService.prompt(
                // 	Severity.Info,
                // 	nls.localize('missing.keyboardlayout', 'Fail to find matching keyboard layout'),
                // 	[{
                // 		label: nls.localize('keyboardLayoutMissing.configure', "Configure"),
                // 		run: () => this._commandService.executeCommand('workbench.action.openKeyboardLayoutPicker')
                // 	}, {
                // 		label: nls.localize('neverAgain', "Don't Show Again"),
                // 		isSecondary: true,
                // 		run: () => this._storageService.store(donotAskUpdateKey, true, StorageScope.APPLICATION)
                // 	}]
                // );
                // console.warn('Active keymap/keyevent does not match current keyboard layout', JSON.stringify(keymap), this._activeKeymapInfo ? JSON.stringify(this._activeKeymapInfo.layout) : '');
                // return;
                // }
                if (!this._activeKeymapInfo) {
                    this._activeKeymapInfo = matchedKeyboardLayout.result;
                    keymapUpdated = true;
                }
                else if (keymap) {
                    if (matchedKeyboardLayout.result.getScore(keymap) > this._activeKeymapInfo.getScore(keymap)) {
                        this._activeKeymapInfo = matchedKeyboardLayout.result;
                        keymapUpdated = true;
                    }
                }
            }
            if (!this._activeKeymapInfo) {
                this._activeKeymapInfo = this.getUSStandardLayout();
                keymapUpdated = true;
            }
            if (!this._activeKeymapInfo || !keymapUpdated) {
                return;
            }
            const index = this._mru.indexOf(this._activeKeymapInfo);
            this._mru.splice(index, 1);
            this._mru.unshift(this._activeKeymapInfo);
            this._setKeyboardData(this._activeKeymapInfo);
        }
        setActiveKeymapInfo(keymapInfo) {
            this._activeKeymapInfo = keymapInfo;
            const index = this._mru.indexOf(this._activeKeymapInfo);
            if (index === 0) {
                return;
            }
            this._mru.splice(index, 1);
            this._mru.unshift(this._activeKeymapInfo);
            this._setKeyboardData(this._activeKeymapInfo);
        }
        setLayoutFromBrowserAPI() {
            this._updateKeyboardLayoutAsync(this._initialized);
        }
        _updateKeyboardLayoutAsync(initialized, keyboardEvent) {
            if (!initialized) {
                return;
            }
            this._getBrowserKeyMapping(keyboardEvent).then(keyMap => {
                // might be false positive
                if (this.isKeyMappingActive(keyMap)) {
                    return;
                }
                this.setActiveKeyMapping(keyMap);
            });
        }
        getKeyboardMapper() {
            const config = (0, keyboardConfig_1.readKeyboardConfig)(this._configurationService);
            if (config.dispatch === 1 /* DispatchConfig.KeyCode */ || !this._initialized || !this._activeKeymapInfo) {
                // Forcefully set to use keyCode
                return new fallbackKeyboardMapper_1.FallbackKeyboardMapper(config.mapAltGrToCtrlAlt, platform_1.OS);
            }
            if (!this._keyboardMapper) {
                this._keyboardMapper = new keyboardMapper_1.CachedKeyboardMapper(BrowserKeyboardMapperFactory._createKeyboardMapper(this._activeKeymapInfo, config.mapAltGrToCtrlAlt));
            }
            return this._keyboardMapper;
        }
        validateCurrentKeyboardMapping(keyboardEvent) {
            if (!this._initialized) {
                return;
            }
            const isCurrentKeyboard = this._validateCurrentKeyboardMapping(keyboardEvent);
            if (isCurrentKeyboard) {
                return;
            }
            this._updateKeyboardLayoutAsync(true, keyboardEvent);
        }
        setKeyboardLayout(layoutName) {
            const matchedLayouts = this.keymapInfos.filter(keymapInfo => (0, keyboardLayout_1.getKeyboardLayoutId)(keymapInfo.layout) === layoutName);
            if (matchedLayouts.length > 0) {
                this.setActiveKeymapInfo(matchedLayouts[0]);
            }
        }
        _setKeyboardData(keymapInfo) {
            this._initialized = true;
            this._keyboardMapper = null;
            this._onDidChangeKeyboardMapper.fire();
        }
        static _createKeyboardMapper(keymapInfo, mapAltGrToCtrlAlt) {
            const rawMapping = keymapInfo.mapping;
            const isUSStandard = !!keymapInfo.layout.isUSStandard;
            if (platform_1.OS === 1 /* OperatingSystem.Windows */) {
                return new windowsKeyboardMapper_1.WindowsKeyboardMapper(isUSStandard, rawMapping, mapAltGrToCtrlAlt);
            }
            if (Object.keys(rawMapping).length === 0) {
                // Looks like reading the mappings failed (most likely Mac + Japanese/Chinese keyboard layouts)
                return new fallbackKeyboardMapper_1.FallbackKeyboardMapper(mapAltGrToCtrlAlt, platform_1.OS);
            }
            return new macLinuxKeyboardMapper_1.MacLinuxKeyboardMapper(isUSStandard, rawMapping, mapAltGrToCtrlAlt, platform_1.OS);
        }
        //#region Browser API
        _validateCurrentKeyboardMapping(keyboardEvent) {
            if (!this._initialized) {
                return true;
            }
            const standardKeyboardEvent = keyboardEvent;
            const currentKeymap = this._activeKeymapInfo;
            if (!currentKeymap) {
                return true;
            }
            if (standardKeyboardEvent.browserEvent.key === 'Dead' || standardKeyboardEvent.browserEvent.isComposing) {
                return true;
            }
            const mapping = currentKeymap.mapping[standardKeyboardEvent.code];
            if (!mapping) {
                return false;
            }
            if (mapping.value === '') {
                // The value is empty when the key is not a printable character, we skip validation.
                if (keyboardEvent.ctrlKey || keyboardEvent.metaKey) {
                    setTimeout(() => {
                        this._getBrowserKeyMapping().then((keymap) => {
                            if (this.isKeyMappingActive(keymap)) {
                                return;
                            }
                            this.setLayoutFromBrowserAPI();
                        });
                    }, 350);
                }
                return true;
            }
            const expectedValue = standardKeyboardEvent.altKey && standardKeyboardEvent.shiftKey ? mapping.withShiftAltGr :
                standardKeyboardEvent.altKey ? mapping.withAltGr :
                    standardKeyboardEvent.shiftKey ? mapping.withShift : mapping.value;
            const isDead = (standardKeyboardEvent.altKey && standardKeyboardEvent.shiftKey && mapping.withShiftAltGrIsDeadKey) ||
                (standardKeyboardEvent.altKey && mapping.withAltGrIsDeadKey) ||
                (standardKeyboardEvent.shiftKey && mapping.withShiftIsDeadKey) ||
                mapping.valueIsDeadKey;
            if (isDead && standardKeyboardEvent.browserEvent.key !== 'Dead') {
                return false;
            }
            // TODO, this assumption is wrong as `browserEvent.key` doesn't necessarily equal expectedValue from real keymap
            if (!isDead && standardKeyboardEvent.browserEvent.key !== expectedValue) {
                return false;
            }
            return true;
        }
        async _getBrowserKeyMapping(keyboardEvent) {
            if (navigator.keyboard) {
                try {
                    return navigator.keyboard.getLayoutMap().then((e) => {
                        const ret = {};
                        for (const key of e) {
                            ret[key[0]] = {
                                'value': key[1],
                                'withShift': '',
                                'withAltGr': '',
                                'withShiftAltGr': ''
                            };
                        }
                        return ret;
                        // const matchedKeyboardLayout = this.getMatchedKeymapInfo(ret);
                        // if (matchedKeyboardLayout) {
                        // 	return matchedKeyboardLayout.result.mapping;
                        // }
                        // return null;
                    });
                }
                catch {
                    // getLayoutMap can throw if invoked from a nested browsing context
                }
            }
            else if (keyboardEvent && !keyboardEvent.shiftKey && !keyboardEvent.altKey && !keyboardEvent.metaKey && !keyboardEvent.metaKey) {
                const ret = {};
                const standardKeyboardEvent = keyboardEvent;
                ret[standardKeyboardEvent.browserEvent.code] = {
                    'value': standardKeyboardEvent.browserEvent.key,
                    'withShift': '',
                    'withAltGr': '',
                    'withShiftAltGr': ''
                };
                const matchedKeyboardLayout = this.getMatchedKeymapInfo(ret);
                if (matchedKeyboardLayout) {
                    return ret;
                }
                return null;
            }
            return null;
        }
    }
    exports.BrowserKeyboardMapperFactoryBase = BrowserKeyboardMapperFactoryBase;
    class BrowserKeyboardMapperFactory extends BrowserKeyboardMapperFactoryBase {
        constructor(configurationService, notificationService, storageService, commandService) {
            // super(notificationService, storageService, commandService);
            super(configurationService);
            const platform = platform_1.isWindows ? 'win' : platform_1.isMacintosh ? 'darwin' : 'linux';
            new Promise((resolve_1, reject_1) => { require(['vs/workbench/services/keybinding/browser/keyboardLayouts/layout.contribution.' + platform], resolve_1, reject_1); }).then((m) => {
                const keymapInfos = m.KeyboardLayoutContribution.INSTANCE.layoutInfos;
                this._keymapInfos.push(...keymapInfos.map(info => (new keymapInfo_1.KeymapInfo(info.layout, info.secondaryLayouts, info.mapping, info.isUserKeyboardLayout))));
                this._mru = this._keymapInfos;
                this._initialized = true;
                this.setLayoutFromBrowserAPI();
            });
        }
    }
    exports.BrowserKeyboardMapperFactory = BrowserKeyboardMapperFactory;
    class UserKeyboardLayout extends lifecycle_1.Disposable {
        get keyboardLayout() { return this._keyboardLayout; }
        constructor(keyboardLayoutResource, fileService) {
            super();
            this.keyboardLayoutResource = keyboardLayoutResource;
            this.fileService = fileService;
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._keyboardLayout = null;
            this.reloadConfigurationScheduler = this._register(new async_1.RunOnceScheduler(() => this.reload().then(changed => {
                if (changed) {
                    this._onDidChange.fire();
                }
            }), 50));
            this._register(event_1.Event.filter(this.fileService.onDidFilesChange, e => e.contains(this.keyboardLayoutResource))(() => this.reloadConfigurationScheduler.schedule()));
        }
        async initialize() {
            await this.reload();
        }
        async reload() {
            const existing = this._keyboardLayout;
            try {
                const content = await this.fileService.readFile(this.keyboardLayoutResource);
                const value = (0, json_1.parse)(content.value.toString());
                if ((0, json_1.getNodeType)(value) === 'object') {
                    const layoutInfo = value.layout;
                    const mappings = value.rawMapping;
                    this._keyboardLayout = keymapInfo_1.KeymapInfo.createKeyboardLayoutFromDebugInfo(layoutInfo, mappings, true);
                }
                else {
                    this._keyboardLayout = null;
                }
            }
            catch (e) {
                this._keyboardLayout = null;
            }
            return existing ? !objects.equals(existing, this._keyboardLayout) : true;
        }
    }
    let BrowserKeyboardLayoutService = class BrowserKeyboardLayoutService extends lifecycle_1.Disposable {
        constructor(environmentService, fileService, notificationService, storageService, commandService, configurationService) {
            super();
            this.configurationService = configurationService;
            this._onDidChangeKeyboardLayout = new event_1.Emitter();
            this.onDidChangeKeyboardLayout = this._onDidChangeKeyboardLayout.event;
            const keyboardConfig = configurationService.getValue('keyboard');
            const layout = keyboardConfig.layout;
            this._keyboardLayoutMode = layout ?? 'autodetect';
            this._factory = new BrowserKeyboardMapperFactory(configurationService, notificationService, storageService, commandService);
            this._register(this._factory.onDidChangeKeyboardMapper(() => {
                this._onDidChangeKeyboardLayout.fire();
            }));
            if (layout && layout !== 'autodetect') {
                // set keyboard layout
                this._factory.setKeyboardLayout(layout);
            }
            this._register(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('keyboard.layout')) {
                    const keyboardConfig = configurationService.getValue('keyboard');
                    const layout = keyboardConfig.layout;
                    this._keyboardLayoutMode = layout;
                    if (layout === 'autodetect') {
                        this._factory.setLayoutFromBrowserAPI();
                    }
                    else {
                        this._factory.setKeyboardLayout(layout);
                    }
                }
            }));
            this._userKeyboardLayout = new UserKeyboardLayout(environmentService.keyboardLayoutResource, fileService);
            this._userKeyboardLayout.initialize().then(() => {
                if (this._userKeyboardLayout.keyboardLayout) {
                    this._factory.registerKeyboardLayout(this._userKeyboardLayout.keyboardLayout);
                    this.setUserKeyboardLayoutIfMatched();
                }
            });
            this._register(this._userKeyboardLayout.onDidChange(() => {
                const userKeyboardLayouts = this._factory.keymapInfos.filter(layout => layout.isUserKeyboardLayout);
                if (userKeyboardLayouts.length) {
                    if (this._userKeyboardLayout.keyboardLayout) {
                        userKeyboardLayouts[0].update(this._userKeyboardLayout.keyboardLayout);
                    }
                    else {
                        this._factory.removeKeyboardLayout(userKeyboardLayouts[0]);
                    }
                }
                else {
                    if (this._userKeyboardLayout.keyboardLayout) {
                        this._factory.registerKeyboardLayout(this._userKeyboardLayout.keyboardLayout);
                    }
                }
                this.setUserKeyboardLayoutIfMatched();
            }));
        }
        setUserKeyboardLayoutIfMatched() {
            const keyboardConfig = this.configurationService.getValue('keyboard');
            const layout = keyboardConfig.layout;
            if (layout && this._userKeyboardLayout.keyboardLayout) {
                if ((0, keyboardLayout_1.getKeyboardLayoutId)(this._userKeyboardLayout.keyboardLayout.layout) === layout && this._factory.activeKeymap) {
                    if (!this._userKeyboardLayout.keyboardLayout.equal(this._factory.activeKeymap)) {
                        this._factory.setActiveKeymapInfo(this._userKeyboardLayout.keyboardLayout);
                    }
                }
            }
        }
        getKeyboardMapper() {
            return this._factory.getKeyboardMapper();
        }
        getCurrentKeyboardLayout() {
            return this._factory.activeKeyboardLayout;
        }
        getAllKeyboardLayouts() {
            return this._factory.keyboardLayouts;
        }
        getRawKeyboardMapping() {
            return this._factory.activeKeyMapping;
        }
        validateCurrentKeyboardMapping(keyboardEvent) {
            if (this._keyboardLayoutMode !== 'autodetect') {
                return;
            }
            this._factory.validateCurrentKeyboardMapping(keyboardEvent);
        }
    };
    exports.BrowserKeyboardLayoutService = BrowserKeyboardLayoutService;
    exports.BrowserKeyboardLayoutService = BrowserKeyboardLayoutService = __decorate([
        __param(0, environment_1.IEnvironmentService),
        __param(1, files_1.IFileService),
        __param(2, notification_1.INotificationService),
        __param(3, storage_1.IStorageService),
        __param(4, commands_1.ICommandService),
        __param(5, configuration_1.IConfigurationService)
    ], BrowserKeyboardLayoutService);
    (0, extensions_1.registerSingleton)(keyboardLayout_1.IKeyboardLayoutService, BrowserKeyboardLayoutService, 1 /* InstantiationType.Delayed */);
    // Configuration
    const configurationRegistry = platform_2.Registry.as(configurationRegistry_1.Extensions.Configuration);
    const keyboardConfiguration = {
        'id': 'keyboard',
        'order': 15,
        'type': 'object',
        'title': nls.localize('keyboardConfigurationTitle', "Keyboard"),
        'properties': {
            'keyboard.layout': {
                'type': 'string',
                'default': 'autodetect',
                'description': nls.localize('keyboard.layout.config', "Control the keyboard layout used in web.")
            }
        }
    };
    configurationRegistry.registerConfiguration(keyboardConfiguration);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5Ym9hcmRMYXlvdXRTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2tleWJpbmRpbmcvYnJvd3Nlci9rZXlib2FyZExheW91dFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBOEJoRyxNQUFhLGdDQUFpQyxTQUFRLHNCQUFVO1FBWS9ELElBQUksWUFBWTtZQUNmLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDO1FBQy9CLENBQUM7UUFFRCxJQUFJLFdBQVc7WUFDZCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7UUFDMUIsQ0FBQztRQUVELElBQUksb0JBQW9CO1lBQ3ZCLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFO2dCQUN2QixPQUFPLElBQUksQ0FBQzthQUNaO1lBRUQsT0FBTyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsTUFBTSxJQUFJLElBQUksQ0FBQztRQUMvQyxDQUFDO1FBRUQsSUFBSSxnQkFBZ0I7WUFDbkIsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUU7Z0JBQ3ZCLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFFRCxPQUFPLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxPQUFPLElBQUksSUFBSSxDQUFDO1FBQ2hELENBQUM7UUFFRCxJQUFJLGVBQWU7WUFDbEIsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMvRCxDQUFDO1FBRUQsWUFDa0IscUJBQTRDO1lBSzdELEtBQUssRUFBRSxDQUFDO1lBTFMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQXJDN0MsK0JBQTBCLEdBQUcsSUFBSSxlQUFPLEVBQVEsQ0FBQztZQUNsRCw4QkFBeUIsR0FBZ0IsSUFBSSxDQUFDLDBCQUEwQixDQUFDLEtBQUssQ0FBQztZQTBDOUYsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7WUFDNUIsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7WUFDMUIsSUFBSSxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUM7WUFDdkIsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7WUFDZixJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO1lBRTlCLElBQTZCLFNBQVUsQ0FBQyxRQUFRLElBQTZCLFNBQVUsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQ3pGLFNBQVUsQ0FBQyxRQUFRLENBQUMsZ0JBQWlCLENBQUMsY0FBYyxFQUFFLEdBQUcsRUFBRTtvQkFDbkYsb0NBQW9DO29CQUNwQyxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFnQyxFQUFFLEVBQUU7d0JBQ3RFLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxFQUFFOzRCQUNyQyxPQUFPO3lCQUNQO3dCQUVELElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO29CQUNoQyxDQUFDLENBQUMsQ0FBQztnQkFDSixDQUFDLENBQUMsQ0FBQzthQUNIO1lBRUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtnQkFDeEUsSUFBSSxDQUFDLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLEVBQUU7b0JBQ3ZDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO29CQUM1QixJQUFJLENBQUMsMEJBQTBCLENBQUMsSUFBSSxFQUFFLENBQUM7aUJBQ3ZDO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFRCxzQkFBc0IsQ0FBQyxNQUFrQjtZQUN4QyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMvQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7UUFDL0IsQ0FBQztRQUVELG9CQUFvQixDQUFDLE1BQWtCO1lBQ3RDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMzQixLQUFLLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDMUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3BDLENBQUM7UUFFRCxvQkFBb0IsQ0FBQyxVQUFtQztZQUN2RCxJQUFJLENBQUMsVUFBVSxFQUFFO2dCQUNoQixPQUFPLElBQUksQ0FBQzthQUNaO1lBRUQsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7WUFFOUMsSUFBSSxVQUFVLEVBQUU7Z0JBQ2YsSUFBSSxRQUFRLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDL0MsSUFBSSxRQUFRLEtBQUssQ0FBQyxFQUFFO29CQUNuQixPQUFPO3dCQUNOLE1BQU0sRUFBRSxVQUFVO3dCQUNsQixLQUFLLEVBQUUsQ0FBQztxQkFDUixDQUFDO2lCQUNGO2dCQUVELElBQUksTUFBTSxHQUFHLFVBQVUsQ0FBQztnQkFDeEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUMxQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDaEQsSUFBSSxLQUFLLEdBQUcsUUFBUSxFQUFFO3dCQUNyQixJQUFJLEtBQUssS0FBSyxDQUFDLEVBQUU7NEJBQ2hCLE9BQU87Z0NBQ04sTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dDQUNwQixLQUFLLEVBQUUsQ0FBQzs2QkFDUixDQUFDO3lCQUNGO3dCQUVELFFBQVEsR0FBRyxLQUFLLENBQUM7d0JBQ2pCLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUN0QjtpQkFDRDtnQkFFRCxPQUFPO29CQUNOLE1BQU07b0JBQ04sS0FBSyxFQUFFLFFBQVE7aUJBQ2YsQ0FBQzthQUNGO1lBRUQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUMxQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxFQUFFO29CQUN4QyxPQUFPO3dCQUNOLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzt3QkFDcEIsS0FBSyxFQUFFLENBQUM7cUJBQ1IsQ0FBQztpQkFDRjthQUNEO1lBRUQsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRUQsbUJBQW1CO1lBQ2xCLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRWpGLElBQUksaUJBQWlCLENBQUMsTUFBTSxFQUFFO2dCQUM3QixPQUFPLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzVCO1lBRUQsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRUQsa0JBQWtCLENBQUMsTUFBK0I7WUFDakQsT0FBTyxJQUFJLENBQUMsaUJBQWlCLElBQUksTUFBTSxJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdEYsQ0FBQztRQUVELG1CQUFtQjtZQUNsQixJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7UUFDckQsQ0FBQztRQUVELG1CQUFtQixDQUFDLE1BQStCO1lBQ2xELElBQUksYUFBYSxHQUFHLEtBQUssQ0FBQztZQUMxQixNQUFNLHFCQUFxQixHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNoRSxJQUFJLHFCQUFxQixFQUFFO2dCQUMxQiwyQ0FBMkM7Z0JBRTNDLCtIQUErSDtnQkFDL0gsMkNBQTJDO2dCQUMzQyw2QkFBNkI7Z0JBQzdCLCtEQUErRDtnQkFDL0Qsc0ZBQXNGO2dCQUN0RixXQUFXO2dCQUNYLElBQUk7Z0JBRUosdUZBQXVGO2dCQUN2RixvQ0FBb0M7Z0JBQ3BDLGtCQUFrQjtnQkFDbEIsb0ZBQW9GO2dCQUNwRixNQUFNO2dCQUNOLHlFQUF5RTtnQkFDekUsZ0dBQWdHO2dCQUNoRyxRQUFRO2dCQUNSLDJEQUEyRDtnQkFDM0QsdUJBQXVCO2dCQUN2Qiw2RkFBNkY7Z0JBQzdGLE1BQU07Z0JBQ04sS0FBSztnQkFFTCxzTEFBc0w7Z0JBRXRMLFVBQVU7Z0JBQ1YsSUFBSTtnQkFFSixJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFO29CQUM1QixJQUFJLENBQUMsaUJBQWlCLEdBQUcscUJBQXFCLENBQUMsTUFBTSxDQUFDO29CQUN0RCxhQUFhLEdBQUcsSUFBSSxDQUFDO2lCQUNyQjtxQkFBTSxJQUFJLE1BQU0sRUFBRTtvQkFDbEIsSUFBSSxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQzVGLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxxQkFBcUIsQ0FBQyxNQUFNLENBQUM7d0JBQ3RELGFBQWEsR0FBRyxJQUFJLENBQUM7cUJBQ3JCO2lCQUNEO2FBQ0Q7WUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFO2dCQUM1QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7Z0JBQ3BELGFBQWEsR0FBRyxJQUFJLENBQUM7YUFDckI7WUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixJQUFJLENBQUMsYUFBYSxFQUFFO2dCQUM5QyxPQUFPO2FBQ1A7WUFFRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUV4RCxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFFMUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFFRCxtQkFBbUIsQ0FBQyxVQUFzQjtZQUN6QyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsVUFBVSxDQUFDO1lBRXBDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBRXhELElBQUksS0FBSyxLQUFLLENBQUMsRUFBRTtnQkFDaEIsT0FBTzthQUNQO1lBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBRTFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUMvQyxDQUFDO1FBRU0sdUJBQXVCO1lBQzdCLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDcEQsQ0FBQztRQUVPLDBCQUEwQixDQUFDLFdBQW9CLEVBQUUsYUFBOEI7WUFDdEYsSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDakIsT0FBTzthQUNQO1lBRUQsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGFBQWEsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDdkQsMEJBQTBCO2dCQUMxQixJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsRUFBRTtvQkFDcEMsT0FBTztpQkFDUDtnQkFDRCxJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbEMsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRU0saUJBQWlCO1lBQ3ZCLE1BQU0sTUFBTSxHQUFHLElBQUEsbUNBQWtCLEVBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7WUFDOUQsSUFBSSxNQUFNLENBQUMsUUFBUSxtQ0FBMkIsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUU7Z0JBQ2hHLGdDQUFnQztnQkFDaEMsT0FBTyxJQUFJLCtDQUFzQixDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxhQUFFLENBQUMsQ0FBQzthQUNoRTtZQUNELElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFO2dCQUMxQixJQUFJLENBQUMsZUFBZSxHQUFHLElBQUkscUNBQW9CLENBQUMsNEJBQTRCLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7YUFDdEo7WUFDRCxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUM7UUFDN0IsQ0FBQztRQUVNLDhCQUE4QixDQUFDLGFBQTZCO1lBQ2xFLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFO2dCQUN2QixPQUFPO2FBQ1A7WUFFRCxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUU5RSxJQUFJLGlCQUFpQixFQUFFO2dCQUN0QixPQUFPO2FBQ1A7WUFFRCxJQUFJLENBQUMsMEJBQTBCLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQ3RELENBQUM7UUFFTSxpQkFBaUIsQ0FBQyxVQUFrQjtZQUMxQyxNQUFNLGNBQWMsR0FBaUIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxJQUFBLG9DQUFtQixFQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsS0FBSyxVQUFVLENBQUMsQ0FBQztZQUVsSSxJQUFJLGNBQWMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUM5QixJQUFJLENBQUMsbUJBQW1CLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDNUM7UUFDRixDQUFDO1FBRU8sZ0JBQWdCLENBQUMsVUFBc0I7WUFDOUMsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7WUFFekIsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7WUFDNUIsSUFBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3hDLENBQUM7UUFFTyxNQUFNLENBQUMscUJBQXFCLENBQUMsVUFBc0IsRUFBRSxpQkFBMEI7WUFDdEYsTUFBTSxVQUFVLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQztZQUN0QyxNQUFNLFlBQVksR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUM7WUFDdEQsSUFBSSxhQUFFLG9DQUE0QixFQUFFO2dCQUNuQyxPQUFPLElBQUksNkNBQXFCLENBQUMsWUFBWSxFQUEyQixVQUFVLEVBQUUsaUJBQWlCLENBQUMsQ0FBQzthQUN2RztZQUNELElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUN6QywrRkFBK0Y7Z0JBQy9GLE9BQU8sSUFBSSwrQ0FBc0IsQ0FBQyxpQkFBaUIsRUFBRSxhQUFFLENBQUMsQ0FBQzthQUN6RDtZQUVELE9BQU8sSUFBSSwrQ0FBc0IsQ0FBQyxZQUFZLEVBQTRCLFVBQVUsRUFBRSxpQkFBaUIsRUFBRSxhQUFFLENBQUMsQ0FBQztRQUM5RyxDQUFDO1FBRUQscUJBQXFCO1FBQ2IsK0JBQStCLENBQUMsYUFBNkI7WUFDcEUsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUU7Z0JBQ3ZCLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFFRCxNQUFNLHFCQUFxQixHQUFHLGFBQXNDLENBQUM7WUFDckUsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDO1lBQzdDLElBQUksQ0FBQyxhQUFhLEVBQUU7Z0JBQ25CLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFFRCxJQUFJLHFCQUFxQixDQUFDLFlBQVksQ0FBQyxHQUFHLEtBQUssTUFBTSxJQUFJLHFCQUFxQixDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUU7Z0JBQ3hHLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFFRCxNQUFNLE9BQU8sR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBRWxFLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2IsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUVELElBQUksT0FBTyxDQUFDLEtBQUssS0FBSyxFQUFFLEVBQUU7Z0JBQ3pCLG9GQUFvRjtnQkFDcEYsSUFBSSxhQUFhLENBQUMsT0FBTyxJQUFJLGFBQWEsQ0FBQyxPQUFPLEVBQUU7b0JBQ25ELFVBQVUsQ0FBQyxHQUFHLEVBQUU7d0JBQ2YsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBdUMsRUFBRSxFQUFFOzRCQUM3RSxJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsRUFBRTtnQ0FDcEMsT0FBTzs2QkFDUDs0QkFFRCxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQzt3QkFDaEMsQ0FBQyxDQUFDLENBQUM7b0JBQ0osQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2lCQUNSO2dCQUNELE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFFRCxNQUFNLGFBQWEsR0FBRyxxQkFBcUIsQ0FBQyxNQUFNLElBQUkscUJBQXFCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7Z0JBQzlHLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUNqRCxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7WUFFckUsTUFBTSxNQUFNLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLElBQUkscUJBQXFCLENBQUMsUUFBUSxJQUFJLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQztnQkFDakgsQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLGtCQUFrQixDQUFDO2dCQUM1RCxDQUFDLHFCQUFxQixDQUFDLFFBQVEsSUFBSSxPQUFPLENBQUMsa0JBQWtCLENBQUM7Z0JBQzlELE9BQU8sQ0FBQyxjQUFjLENBQUM7WUFFeEIsSUFBSSxNQUFNLElBQUkscUJBQXFCLENBQUMsWUFBWSxDQUFDLEdBQUcsS0FBSyxNQUFNLEVBQUU7Z0JBQ2hFLE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFFRCxnSEFBZ0g7WUFDaEgsSUFBSSxDQUFDLE1BQU0sSUFBSSxxQkFBcUIsQ0FBQyxZQUFZLENBQUMsR0FBRyxLQUFLLGFBQWEsRUFBRTtnQkFDeEUsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUVELE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVPLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxhQUE4QjtZQUNqRSxJQUFLLFNBQWlCLENBQUMsUUFBUSxFQUFFO2dCQUNoQyxJQUFJO29CQUNILE9BQVEsU0FBaUIsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBTSxFQUFFLEVBQUU7d0JBQ2pFLE1BQU0sR0FBRyxHQUFxQixFQUFFLENBQUM7d0JBQ2pDLEtBQUssTUFBTSxHQUFHLElBQUksQ0FBQyxFQUFFOzRCQUNwQixHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUc7Z0NBQ2IsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0NBQ2YsV0FBVyxFQUFFLEVBQUU7Z0NBQ2YsV0FBVyxFQUFFLEVBQUU7Z0NBQ2YsZ0JBQWdCLEVBQUUsRUFBRTs2QkFDcEIsQ0FBQzt5QkFDRjt3QkFFRCxPQUFPLEdBQUcsQ0FBQzt3QkFFWCxnRUFBZ0U7d0JBRWhFLCtCQUErQjt3QkFDL0IsZ0RBQWdEO3dCQUNoRCxJQUFJO3dCQUVKLGVBQWU7b0JBQ2hCLENBQUMsQ0FBQyxDQUFDO2lCQUNIO2dCQUFDLE1BQU07b0JBQ1AsbUVBQW1FO2lCQUNuRTthQUNEO2lCQUFNLElBQUksYUFBYSxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRTtnQkFDakksTUFBTSxHQUFHLEdBQXFCLEVBQUUsQ0FBQztnQkFDakMsTUFBTSxxQkFBcUIsR0FBRyxhQUFzQyxDQUFDO2dCQUNyRSxHQUFHLENBQUMscUJBQXFCLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHO29CQUM5QyxPQUFPLEVBQUUscUJBQXFCLENBQUMsWUFBWSxDQUFDLEdBQUc7b0JBQy9DLFdBQVcsRUFBRSxFQUFFO29CQUNmLFdBQVcsRUFBRSxFQUFFO29CQUNmLGdCQUFnQixFQUFFLEVBQUU7aUJBQ3BCLENBQUM7Z0JBRUYsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBRTdELElBQUkscUJBQXFCLEVBQUU7b0JBQzFCLE9BQU8sR0FBRyxDQUFDO2lCQUNYO2dCQUVELE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFFRCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7S0FHRDtJQTVaRCw0RUE0WkM7SUFFRCxNQUFhLDRCQUE2QixTQUFRLGdDQUFnQztRQUNqRixZQUFZLG9CQUEyQyxFQUFFLG1CQUF5QyxFQUFFLGNBQStCLEVBQUUsY0FBK0I7WUFDbkssOERBQThEO1lBQzlELEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBRTVCLE1BQU0sUUFBUSxHQUFHLG9CQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsc0JBQVcsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7WUFFdEUsZ0RBQU8sK0VBQStFLEdBQUcsUUFBUSw0QkFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtnQkFDN0csTUFBTSxXQUFXLEdBQWtCLENBQUMsQ0FBQywwQkFBMEIsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDO2dCQUNyRixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksdUJBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNsSixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7Z0JBQzlCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO2dCQUN6QixJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztZQUNoQyxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7S0FDRDtJQWZELG9FQWVDO0lBRUQsTUFBTSxrQkFBbUIsU0FBUSxzQkFBVTtRQU8xQyxJQUFJLGNBQWMsS0FBd0IsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztRQUV4RSxZQUNrQixzQkFBMkIsRUFDM0IsV0FBeUI7WUFFMUMsS0FBSyxFQUFFLENBQUM7WUFIUywyQkFBc0IsR0FBdEIsc0JBQXNCLENBQUs7WUFDM0IsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFSeEIsaUJBQVksR0FBa0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBUSxDQUFDLENBQUM7WUFDNUUsZ0JBQVcsR0FBZ0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUM7WUFXM0QsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7WUFFNUIsSUFBSSxDQUFDLDRCQUE0QixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSx3QkFBZ0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUMxRyxJQUFJLE9BQU8sRUFBRTtvQkFDWixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDO2lCQUN6QjtZQUNGLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFVCxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsNEJBQTRCLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ25LLENBQUM7UUFFRCxLQUFLLENBQUMsVUFBVTtZQUNmLE1BQU0sSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3JCLENBQUM7UUFFTyxLQUFLLENBQUMsTUFBTTtZQUNuQixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDO1lBQ3RDLElBQUk7Z0JBQ0gsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQztnQkFDN0UsTUFBTSxLQUFLLEdBQUcsSUFBQSxZQUFLLEVBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO2dCQUM5QyxJQUFJLElBQUEsa0JBQVcsRUFBQyxLQUFLLENBQUMsS0FBSyxRQUFRLEVBQUU7b0JBQ3BDLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7b0JBQ2hDLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUM7b0JBQ2xDLElBQUksQ0FBQyxlQUFlLEdBQUcsdUJBQVUsQ0FBQyxpQ0FBaUMsQ0FBQyxVQUFVLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO2lCQUNoRztxQkFBTTtvQkFDTixJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQztpQkFDNUI7YUFDRDtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNYLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO2FBQzVCO1lBRUQsT0FBTyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDMUUsQ0FBQztLQUVEO0lBRU0sSUFBTSw0QkFBNEIsR0FBbEMsTUFBTSw0QkFBNkIsU0FBUSxzQkFBVTtRQVczRCxZQUNzQixrQkFBdUMsRUFDOUMsV0FBeUIsRUFDakIsbUJBQXlDLEVBQzlDLGNBQStCLEVBQy9CLGNBQStCLEVBQ3pCLG9CQUFtRDtZQUUxRSxLQUFLLEVBQUUsQ0FBQztZQUZ1Qix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBZDFELCtCQUEwQixHQUFHLElBQUksZUFBTyxFQUFRLENBQUM7WUFDbEQsOEJBQXlCLEdBQWdCLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxLQUFLLENBQUM7WUFnQjlGLE1BQU0sY0FBYyxHQUFHLG9CQUFvQixDQUFDLFFBQVEsQ0FBcUIsVUFBVSxDQUFDLENBQUM7WUFDckYsTUFBTSxNQUFNLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQztZQUNyQyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsTUFBTSxJQUFJLFlBQVksQ0FBQztZQUNsRCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksNEJBQTRCLENBQUMsb0JBQW9CLEVBQUUsbUJBQW1CLEVBQUUsY0FBYyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBRTVILElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyx5QkFBeUIsQ0FBQyxHQUFHLEVBQUU7Z0JBQzNELElBQUksQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN4QyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosSUFBSSxNQUFNLElBQUksTUFBTSxLQUFLLFlBQVksRUFBRTtnQkFDdEMsc0JBQXNCO2dCQUN0QixJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ3hDO1lBRUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDaEUsSUFBSSxDQUFDLENBQUMsb0JBQW9CLENBQUMsaUJBQWlCLENBQUMsRUFBRTtvQkFDOUMsTUFBTSxjQUFjLEdBQUcsb0JBQW9CLENBQUMsUUFBUSxDQUFxQixVQUFVLENBQUMsQ0FBQztvQkFDckYsTUFBTSxNQUFNLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQztvQkFDckMsSUFBSSxDQUFDLG1CQUFtQixHQUFHLE1BQU0sQ0FBQztvQkFFbEMsSUFBSSxNQUFNLEtBQUssWUFBWSxFQUFFO3dCQUM1QixJQUFJLENBQUMsUUFBUSxDQUFDLHVCQUF1QixFQUFFLENBQUM7cUJBQ3hDO3lCQUFNO3dCQUNOLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUM7cUJBQ3hDO2lCQUNEO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLGtCQUFrQixDQUFDLGtCQUFrQixDQUFDLHNCQUFzQixFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQzFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO2dCQUMvQyxJQUFJLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxjQUFjLEVBQUU7b0JBQzVDLElBQUksQ0FBQyxRQUFRLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGNBQWMsQ0FBQyxDQUFDO29CQUU5RSxJQUFJLENBQUMsOEJBQThCLEVBQUUsQ0FBQztpQkFDdEM7WUFDRixDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUU7Z0JBQ3hELE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLENBQUM7Z0JBRXBHLElBQUksbUJBQW1CLENBQUMsTUFBTSxFQUFFO29CQUMvQixJQUFJLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxjQUFjLEVBQUU7d0JBQzVDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsY0FBYyxDQUFDLENBQUM7cUJBQ3ZFO3lCQUFNO3dCQUNOLElBQUksQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztxQkFDM0Q7aUJBQ0Q7cUJBQU07b0JBQ04sSUFBSSxJQUFJLENBQUMsbUJBQW1CLENBQUMsY0FBYyxFQUFFO3dCQUM1QyxJQUFJLENBQUMsUUFBUSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxjQUFjLENBQUMsQ0FBQztxQkFDOUU7aUJBQ0Q7Z0JBRUQsSUFBSSxDQUFDLDhCQUE4QixFQUFFLENBQUM7WUFDdkMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFRCw4QkFBOEI7WUFDN0IsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBcUIsVUFBVSxDQUFDLENBQUM7WUFDMUYsTUFBTSxNQUFNLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQztZQUVyQyxJQUFJLE1BQU0sSUFBSSxJQUFJLENBQUMsbUJBQW1CLENBQUMsY0FBYyxFQUFFO2dCQUN0RCxJQUFJLElBQUEsb0NBQW1CLEVBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsS0FBSyxNQUFNLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUU7b0JBRWpILElBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxFQUFFO3dCQUMvRSxJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxjQUFjLENBQUMsQ0FBQztxQkFDM0U7aUJBQ0Q7YUFDRDtRQUNGLENBQUM7UUFFRCxpQkFBaUI7WUFDaEIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDMUMsQ0FBQztRQUVNLHdCQUF3QjtZQUM5QixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUM7UUFDM0MsQ0FBQztRQUVNLHFCQUFxQjtZQUMzQixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDO1FBQ3RDLENBQUM7UUFFTSxxQkFBcUI7WUFDM0IsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDO1FBQ3ZDLENBQUM7UUFFTSw4QkFBOEIsQ0FBQyxhQUE2QjtZQUNsRSxJQUFJLElBQUksQ0FBQyxtQkFBbUIsS0FBSyxZQUFZLEVBQUU7Z0JBQzlDLE9BQU87YUFDUDtZQUVELElBQUksQ0FBQyxRQUFRLENBQUMsOEJBQThCLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDN0QsQ0FBQztLQUNELENBQUE7SUFqSFksb0VBQTRCOzJDQUE1Qiw0QkFBNEI7UUFZdEMsV0FBQSxpQ0FBbUIsQ0FBQTtRQUNuQixXQUFBLG9CQUFZLENBQUE7UUFDWixXQUFBLG1DQUFvQixDQUFBO1FBQ3BCLFdBQUEseUJBQWUsQ0FBQTtRQUNmLFdBQUEsMEJBQWUsQ0FBQTtRQUNmLFdBQUEscUNBQXFCLENBQUE7T0FqQlgsNEJBQTRCLENBaUh4QztJQUVELElBQUEsOEJBQWlCLEVBQUMsdUNBQXNCLEVBQUUsNEJBQTRCLG9DQUE0QixDQUFDO0lBRW5HLGdCQUFnQjtJQUNoQixNQUFNLHFCQUFxQixHQUFHLG1CQUFRLENBQUMsRUFBRSxDQUF5QixrQ0FBZ0IsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNsRyxNQUFNLHFCQUFxQixHQUF1QjtRQUNqRCxJQUFJLEVBQUUsVUFBVTtRQUNoQixPQUFPLEVBQUUsRUFBRTtRQUNYLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLE9BQU8sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLDRCQUE0QixFQUFFLFVBQVUsQ0FBQztRQUMvRCxZQUFZLEVBQUU7WUFDYixpQkFBaUIsRUFBRTtnQkFDbEIsTUFBTSxFQUFFLFFBQVE7Z0JBQ2hCLFNBQVMsRUFBRSxZQUFZO2dCQUN2QixhQUFhLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRSwwQ0FBMEMsQ0FBQzthQUNqRztTQUNEO0tBQ0QsQ0FBQztJQUVGLHFCQUFxQixDQUFDLHFCQUFxQixDQUFDLHFCQUFxQixDQUFDLENBQUMifQ==