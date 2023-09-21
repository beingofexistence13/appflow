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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/keyboardLayout/common/keyboardLayout", "vs/base/common/event", "vs/base/common/platform", "vs/platform/keyboardLayout/common/keyboardMapper", "vs/workbench/services/keybinding/common/windowsKeyboardMapper", "vs/workbench/services/keybinding/common/fallbackKeyboardMapper", "vs/workbench/services/keybinding/common/macLinuxKeyboardMapper", "vs/platform/keyboardLayout/common/keyboardConfig", "vs/platform/configuration/common/configuration", "vs/workbench/services/keybinding/electron-sandbox/nativeKeyboardLayoutService", "vs/platform/instantiation/common/extensions"], function (require, exports, lifecycle_1, keyboardLayout_1, event_1, platform_1, keyboardMapper_1, windowsKeyboardMapper_1, fallbackKeyboardMapper_1, macLinuxKeyboardMapper_1, keyboardConfig_1, configuration_1, nativeKeyboardLayoutService_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$O_b = void 0;
    let $O_b = class $O_b extends lifecycle_1.$kc {
        constructor(c, f) {
            super();
            this.c = c;
            this.f = f;
            this.a = this.B(new event_1.$fd());
            this.onDidChangeKeyboardLayout = this.a.event;
            this.b = null;
            this.B(this.c.onDidChangeKeyboardLayout(async () => {
                this.b = null;
                this.a.fire();
            }));
            this.B(f.onDidChangeConfiguration(async (e) => {
                if (e.affectsConfiguration('keyboard')) {
                    this.b = null;
                    this.a.fire();
                }
            }));
        }
        getRawKeyboardMapping() {
            return this.c.getRawKeyboardMapping();
        }
        getCurrentKeyboardLayout() {
            return this.c.getCurrentKeyboardLayout();
        }
        getAllKeyboardLayouts() {
            return [];
        }
        getKeyboardMapper() {
            const config = (0, keyboardConfig_1.$m3b)(this.f);
            if (config.dispatch === 1 /* DispatchConfig.KeyCode */) {
                // Forcefully set to use keyCode
                return new fallbackKeyboardMapper_1.$o3b(config.mapAltGrToCtrlAlt, platform_1.OS);
            }
            if (!this.b) {
                this.b = new keyboardMapper_1.$Syb(createKeyboardMapper(this.getCurrentKeyboardLayout(), this.getRawKeyboardMapping(), config.mapAltGrToCtrlAlt));
            }
            return this.b;
        }
        validateCurrentKeyboardMapping(keyboardEvent) {
            return;
        }
    };
    exports.$O_b = $O_b;
    exports.$O_b = $O_b = __decorate([
        __param(0, nativeKeyboardLayoutService_1.$9$b),
        __param(1, configuration_1.$8h)
    ], $O_b);
    function createKeyboardMapper(layoutInfo, rawMapping, mapAltGrToCtrlAlt) {
        const _isUSStandard = isUSStandard(layoutInfo);
        if (platform_1.OS === 1 /* OperatingSystem.Windows */) {
            return new windowsKeyboardMapper_1.$aEb(_isUSStandard, rawMapping, mapAltGrToCtrlAlt);
        }
        if (!rawMapping || Object.keys(rawMapping).length === 0) {
            // Looks like reading the mappings failed (most likely Mac + Japanese/Chinese keyboard layouts)
            return new fallbackKeyboardMapper_1.$o3b(mapAltGrToCtrlAlt, platform_1.OS);
        }
        if (platform_1.OS === 2 /* OperatingSystem.Macintosh */) {
            const kbInfo = layoutInfo;
            if (kbInfo.id === 'com.apple.keylayout.DVORAK-QWERTYCMD') {
                // Use keyCode based dispatching for DVORAK - QWERTY ⌘
                return new fallbackKeyboardMapper_1.$o3b(mapAltGrToCtrlAlt, platform_1.OS);
            }
        }
        return new macLinuxKeyboardMapper_1.$q3b(_isUSStandard, rawMapping, mapAltGrToCtrlAlt, platform_1.OS);
    }
    function isUSStandard(_kbInfo) {
        if (!_kbInfo) {
            return false;
        }
        if (platform_1.OS === 3 /* OperatingSystem.Linux */) {
            const kbInfo = _kbInfo;
            const layouts = kbInfo.layout.split(/,/g);
            return (layouts[kbInfo.group] === 'us');
        }
        if (platform_1.OS === 2 /* OperatingSystem.Macintosh */) {
            const kbInfo = _kbInfo;
            return (kbInfo.id === 'com.apple.keylayout.US');
        }
        if (platform_1.OS === 1 /* OperatingSystem.Windows */) {
            const kbInfo = _kbInfo;
            return (kbInfo.name === '00000409');
        }
        return false;
    }
    (0, extensions_1.$mr)(keyboardLayout_1.$Tyb, $O_b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=nativeKeyboardLayout.js.map