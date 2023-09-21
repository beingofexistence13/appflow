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
define(["require", "exports", "vs/nls!vs/workbench/services/keybinding/browser/keyboardLayoutService", "vs/base/common/event", "vs/base/common/lifecycle", "vs/workbench/services/keybinding/common/keymapInfo", "vs/platform/instantiation/common/extensions", "vs/platform/keyboardLayout/common/keyboardConfig", "vs/platform/keyboardLayout/common/keyboardMapper", "vs/base/common/platform", "vs/workbench/services/keybinding/common/windowsKeyboardMapper", "vs/workbench/services/keybinding/common/fallbackKeyboardMapper", "vs/workbench/services/keybinding/common/macLinuxKeyboardMapper", "vs/platform/files/common/files", "vs/base/common/async", "vs/base/common/json", "vs/base/common/objects", "vs/platform/environment/common/environment", "vs/platform/registry/common/platform", "vs/platform/configuration/common/configurationRegistry", "vs/platform/configuration/common/configuration", "vs/platform/notification/common/notification", "vs/platform/commands/common/commands", "vs/platform/storage/common/storage", "vs/platform/keyboardLayout/common/keyboardLayout"], function (require, exports, nls, event_1, lifecycle_1, keymapInfo_1, extensions_1, keyboardConfig_1, keyboardMapper_1, platform_1, windowsKeyboardMapper_1, fallbackKeyboardMapper_1, macLinuxKeyboardMapper_1, files_1, async_1, json_1, objects, environment_1, platform_2, configurationRegistry_1, configuration_1, notification_1, commands_1, storage_1, keyboardLayout_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$t3b = exports.$s3b = exports.$r3b = void 0;
    class $r3b extends lifecycle_1.$kc {
        get activeKeymap() {
            return this.h;
        }
        get keymapInfos() {
            return this.f;
        }
        get activeKeyboardLayout() {
            if (!this.a) {
                return null;
            }
            return this.h?.layout ?? null;
        }
        get activeKeyMapping() {
            if (!this.a) {
                return null;
            }
            return this.h?.mapping ?? null;
        }
        get keyboardLayouts() {
            return this.f.map(keymapInfo => keymapInfo.layout);
        }
        constructor(j) {
            super();
            this.j = j;
            this.c = new event_1.$fd();
            this.onDidChangeKeyboardMapper = this.c.event;
            this.b = null;
            this.a = false;
            this.f = [];
            this.g = [];
            this.h = null;
            if (navigator.keyboard && navigator.keyboard.addEventListener) {
                navigator.keyboard.addEventListener('layoutchange', () => {
                    // Update user keyboard map settings
                    this.u().then((mapping) => {
                        if (this.isKeyMappingActive(mapping)) {
                            return;
                        }
                        this.setLayoutFromBrowserAPI();
                    });
                });
            }
            this.B(this.j.onDidChangeConfiguration((e) => {
                if (e.affectsConfiguration('keyboard')) {
                    this.b = null;
                    this.c.fire();
                }
            }));
        }
        registerKeyboardLayout(layout) {
            this.f.push(layout);
            this.g = this.f;
        }
        removeKeyboardLayout(layout) {
            let index = this.g.indexOf(layout);
            this.g.splice(index, 1);
            index = this.f.indexOf(layout);
            this.f.splice(index, 1);
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
                for (let i = 0; i < this.g.length; i++) {
                    const score = this.g[i].getScore(keyMapping);
                    if (score > maxScore) {
                        if (score === 0) {
                            return {
                                result: this.g[i],
                                score: 0
                            };
                        }
                        maxScore = score;
                        result = this.g[i];
                    }
                }
                return {
                    result,
                    score: maxScore
                };
            }
            for (let i = 0; i < this.g.length; i++) {
                if (this.g[i].fuzzyEqual(keyMapping)) {
                    return {
                        result: this.g[i],
                        score: 0
                    };
                }
            }
            return null;
        }
        getUSStandardLayout() {
            const usStandardLayouts = this.g.filter(layout => layout.layout.isUSStandard);
            if (usStandardLayouts.length) {
                return usStandardLayouts[0];
            }
            return null;
        }
        isKeyMappingActive(keymap) {
            return this.h && keymap && this.h.fuzzyEqual(keymap);
        }
        setUSKeyboardLayout() {
            this.h = this.getUSStandardLayout();
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
                if (!this.h) {
                    this.h = matchedKeyboardLayout.result;
                    keymapUpdated = true;
                }
                else if (keymap) {
                    if (matchedKeyboardLayout.result.getScore(keymap) > this.h.getScore(keymap)) {
                        this.h = matchedKeyboardLayout.result;
                        keymapUpdated = true;
                    }
                }
            }
            if (!this.h) {
                this.h = this.getUSStandardLayout();
                keymapUpdated = true;
            }
            if (!this.h || !keymapUpdated) {
                return;
            }
            const index = this.g.indexOf(this.h);
            this.g.splice(index, 1);
            this.g.unshift(this.h);
            this.r(this.h);
        }
        setActiveKeymapInfo(keymapInfo) {
            this.h = keymapInfo;
            const index = this.g.indexOf(this.h);
            if (index === 0) {
                return;
            }
            this.g.splice(index, 1);
            this.g.unshift(this.h);
            this.r(this.h);
        }
        setLayoutFromBrowserAPI() {
            this.n(this.a);
        }
        n(initialized, keyboardEvent) {
            if (!initialized) {
                return;
            }
            this.u(keyboardEvent).then(keyMap => {
                // might be false positive
                if (this.isKeyMappingActive(keyMap)) {
                    return;
                }
                this.setActiveKeyMapping(keyMap);
            });
        }
        getKeyboardMapper() {
            const config = (0, keyboardConfig_1.$m3b)(this.j);
            if (config.dispatch === 1 /* DispatchConfig.KeyCode */ || !this.a || !this.h) {
                // Forcefully set to use keyCode
                return new fallbackKeyboardMapper_1.$o3b(config.mapAltGrToCtrlAlt, platform_1.OS);
            }
            if (!this.b) {
                this.b = new keyboardMapper_1.$Syb($s3b.s(this.h, config.mapAltGrToCtrlAlt));
            }
            return this.b;
        }
        validateCurrentKeyboardMapping(keyboardEvent) {
            if (!this.a) {
                return;
            }
            const isCurrentKeyboard = this.t(keyboardEvent);
            if (isCurrentKeyboard) {
                return;
            }
            this.n(true, keyboardEvent);
        }
        setKeyboardLayout(layoutName) {
            const matchedLayouts = this.keymapInfos.filter(keymapInfo => (0, keyboardLayout_1.$Wyb)(keymapInfo.layout) === layoutName);
            if (matchedLayouts.length > 0) {
                this.setActiveKeymapInfo(matchedLayouts[0]);
            }
        }
        r(keymapInfo) {
            this.a = true;
            this.b = null;
            this.c.fire();
        }
        static s(keymapInfo, mapAltGrToCtrlAlt) {
            const rawMapping = keymapInfo.mapping;
            const isUSStandard = !!keymapInfo.layout.isUSStandard;
            if (platform_1.OS === 1 /* OperatingSystem.Windows */) {
                return new windowsKeyboardMapper_1.$aEb(isUSStandard, rawMapping, mapAltGrToCtrlAlt);
            }
            if (Object.keys(rawMapping).length === 0) {
                // Looks like reading the mappings failed (most likely Mac + Japanese/Chinese keyboard layouts)
                return new fallbackKeyboardMapper_1.$o3b(mapAltGrToCtrlAlt, platform_1.OS);
            }
            return new macLinuxKeyboardMapper_1.$q3b(isUSStandard, rawMapping, mapAltGrToCtrlAlt, platform_1.OS);
        }
        //#region Browser API
        t(keyboardEvent) {
            if (!this.a) {
                return true;
            }
            const standardKeyboardEvent = keyboardEvent;
            const currentKeymap = this.h;
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
                        this.u().then((keymap) => {
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
        async u(keyboardEvent) {
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
    exports.$r3b = $r3b;
    class $s3b extends $r3b {
        constructor(configurationService, notificationService, storageService, commandService) {
            // super(notificationService, storageService, commandService);
            super(configurationService);
            const platform = platform_1.$i ? 'win' : platform_1.$j ? 'darwin' : 'linux';
            new Promise((resolve_1, reject_1) => { require(['vs/workbench/services/keybinding/browser/keyboardLayouts/layout.contribution.' + platform], resolve_1, reject_1); }).then((m) => {
                const keymapInfos = m.KeyboardLayoutContribution.INSTANCE.layoutInfos;
                this.f.push(...keymapInfos.map(info => (new keymapInfo_1.$l3b(info.layout, info.secondaryLayouts, info.mapping, info.isUserKeyboardLayout))));
                this.g = this.f;
                this.a = true;
                this.setLayoutFromBrowserAPI();
            });
        }
    }
    exports.$s3b = $s3b;
    class UserKeyboardLayout extends lifecycle_1.$kc {
        get keyboardLayout() { return this.c; }
        constructor(f, g) {
            super();
            this.f = f;
            this.g = g;
            this.b = this.B(new event_1.$fd());
            this.onDidChange = this.b.event;
            this.c = null;
            this.a = this.B(new async_1.$Sg(() => this.h().then(changed => {
                if (changed) {
                    this.b.fire();
                }
            }), 50));
            this.B(event_1.Event.filter(this.g.onDidFilesChange, e => e.contains(this.f))(() => this.a.schedule()));
        }
        async initialize() {
            await this.h();
        }
        async h() {
            const existing = this.c;
            try {
                const content = await this.g.readFile(this.f);
                const value = (0, json_1.$Lm)(content.value.toString());
                if ((0, json_1.$Um)(value) === 'object') {
                    const layoutInfo = value.layout;
                    const mappings = value.rawMapping;
                    this.c = keymapInfo_1.$l3b.createKeyboardLayoutFromDebugInfo(layoutInfo, mappings, true);
                }
                else {
                    this.c = null;
                }
            }
            catch (e) {
                this.c = null;
            }
            return existing ? !objects.$Zm(existing, this.c) : true;
        }
    }
    let $t3b = class $t3b extends lifecycle_1.$kc {
        constructor(environmentService, fileService, notificationService, storageService, commandService, g) {
            super();
            this.g = g;
            this.a = new event_1.$fd();
            this.onDidChangeKeyboardLayout = this.a.event;
            const keyboardConfig = g.getValue('keyboard');
            const layout = keyboardConfig.layout;
            this.f = layout ?? 'autodetect';
            this.c = new $s3b(g, notificationService, storageService, commandService);
            this.B(this.c.onDidChangeKeyboardMapper(() => {
                this.a.fire();
            }));
            if (layout && layout !== 'autodetect') {
                // set keyboard layout
                this.c.setKeyboardLayout(layout);
            }
            this.B(g.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('keyboard.layout')) {
                    const keyboardConfig = g.getValue('keyboard');
                    const layout = keyboardConfig.layout;
                    this.f = layout;
                    if (layout === 'autodetect') {
                        this.c.setLayoutFromBrowserAPI();
                    }
                    else {
                        this.c.setKeyboardLayout(layout);
                    }
                }
            }));
            this.b = new UserKeyboardLayout(environmentService.keyboardLayoutResource, fileService);
            this.b.initialize().then(() => {
                if (this.b.keyboardLayout) {
                    this.c.registerKeyboardLayout(this.b.keyboardLayout);
                    this.setUserKeyboardLayoutIfMatched();
                }
            });
            this.B(this.b.onDidChange(() => {
                const userKeyboardLayouts = this.c.keymapInfos.filter(layout => layout.isUserKeyboardLayout);
                if (userKeyboardLayouts.length) {
                    if (this.b.keyboardLayout) {
                        userKeyboardLayouts[0].update(this.b.keyboardLayout);
                    }
                    else {
                        this.c.removeKeyboardLayout(userKeyboardLayouts[0]);
                    }
                }
                else {
                    if (this.b.keyboardLayout) {
                        this.c.registerKeyboardLayout(this.b.keyboardLayout);
                    }
                }
                this.setUserKeyboardLayoutIfMatched();
            }));
        }
        setUserKeyboardLayoutIfMatched() {
            const keyboardConfig = this.g.getValue('keyboard');
            const layout = keyboardConfig.layout;
            if (layout && this.b.keyboardLayout) {
                if ((0, keyboardLayout_1.$Wyb)(this.b.keyboardLayout.layout) === layout && this.c.activeKeymap) {
                    if (!this.b.keyboardLayout.equal(this.c.activeKeymap)) {
                        this.c.setActiveKeymapInfo(this.b.keyboardLayout);
                    }
                }
            }
        }
        getKeyboardMapper() {
            return this.c.getKeyboardMapper();
        }
        getCurrentKeyboardLayout() {
            return this.c.activeKeyboardLayout;
        }
        getAllKeyboardLayouts() {
            return this.c.keyboardLayouts;
        }
        getRawKeyboardMapping() {
            return this.c.activeKeyMapping;
        }
        validateCurrentKeyboardMapping(keyboardEvent) {
            if (this.f !== 'autodetect') {
                return;
            }
            this.c.validateCurrentKeyboardMapping(keyboardEvent);
        }
    };
    exports.$t3b = $t3b;
    exports.$t3b = $t3b = __decorate([
        __param(0, environment_1.$Ih),
        __param(1, files_1.$6j),
        __param(2, notification_1.$Yu),
        __param(3, storage_1.$Vo),
        __param(4, commands_1.$Fr),
        __param(5, configuration_1.$8h)
    ], $t3b);
    (0, extensions_1.$mr)(keyboardLayout_1.$Tyb, $t3b, 1 /* InstantiationType.Delayed */);
    // Configuration
    const configurationRegistry = platform_2.$8m.as(configurationRegistry_1.$an.Configuration);
    const keyboardConfiguration = {
        'id': 'keyboard',
        'order': 15,
        'type': 'object',
        'title': nls.localize(0, null),
        'properties': {
            'keyboard.layout': {
                'type': 'string',
                'default': 'autodetect',
                'description': nls.localize(1, null)
            }
        }
    };
    configurationRegistry.registerConfiguration(keyboardConfiguration);
});
//# sourceMappingURL=keyboardLayoutService.js.map