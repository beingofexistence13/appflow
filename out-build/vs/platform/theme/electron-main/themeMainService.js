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
define(["require", "exports", "electron", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/state/node/state"], function (require, exports, electron_1, event_1, lifecycle_1, platform_1, configuration_1, instantiation_1, state_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$_5b = exports.$$5b = void 0;
    const DEFAULT_BG_LIGHT = '#FFFFFF';
    const DEFAULT_BG_DARK = '#1E1E1E';
    const DEFAULT_BG_HC_BLACK = '#000000';
    const DEFAULT_BG_HC_LIGHT = '#FFFFFF';
    const THEME_STORAGE_KEY = 'theme';
    const THEME_BG_STORAGE_KEY = 'themeBackground';
    const THEME_WINDOW_SPLASH = 'windowSplash';
    exports.$$5b = (0, instantiation_1.$Bh)('themeMainService');
    let $_5b = class $_5b extends lifecycle_1.$kc {
        constructor(b, c) {
            super();
            this.b = b;
            this.c = c;
            this.a = this.B(new event_1.$fd());
            this.onDidChangeColorScheme = this.a.event;
            // Color Scheme changes
            electron_1.nativeTheme.on('updated', () => {
                this.a.fire(this.getColorScheme());
            });
        }
        getColorScheme() {
            if (platform_1.$i) {
                // high contrast is refelected by the shouldUseInvertedColorScheme property
                if (electron_1.nativeTheme.shouldUseHighContrastColors) {
                    // shouldUseInvertedColorScheme is dark, !shouldUseInvertedColorScheme is light
                    return { dark: electron_1.nativeTheme.shouldUseInvertedColorScheme, highContrast: true };
                }
            }
            else if (platform_1.$j) {
                // high contrast is set if one of shouldUseInvertedColorScheme or shouldUseHighContrastColors is set, reflecting the 'Invert colours' and `Increase contrast` settings in MacOS
                if (electron_1.nativeTheme.shouldUseInvertedColorScheme || electron_1.nativeTheme.shouldUseHighContrastColors) {
                    return { dark: electron_1.nativeTheme.shouldUseDarkColors, highContrast: true };
                }
            }
            else if (platform_1.$k) {
                // ubuntu gnome seems to have 3 states, light dark and high contrast
                if (electron_1.nativeTheme.shouldUseHighContrastColors) {
                    return { dark: true, highContrast: true };
                }
            }
            return {
                dark: electron_1.nativeTheme.shouldUseDarkColors,
                highContrast: false
            };
        }
        getBackgroundColor() {
            const colorScheme = this.getColorScheme();
            if (colorScheme.highContrast && this.c.getValue('window.autoDetectHighContrast')) {
                return colorScheme.dark ? DEFAULT_BG_HC_BLACK : DEFAULT_BG_HC_LIGHT;
            }
            let background = this.b.getItem(THEME_BG_STORAGE_KEY, null);
            if (!background) {
                const baseTheme = this.b.getItem(THEME_STORAGE_KEY, 'vs-dark').split(' ')[0];
                switch (baseTheme) {
                    case 'vs':
                        background = DEFAULT_BG_LIGHT;
                        break;
                    case 'hc-black':
                        background = DEFAULT_BG_HC_BLACK;
                        break;
                    case 'hc-light':
                        background = DEFAULT_BG_HC_LIGHT;
                        break;
                    default: background = DEFAULT_BG_DARK;
                }
            }
            if (platform_1.$j && background.toUpperCase() === DEFAULT_BG_DARK) {
                background = '#171717'; // https://github.com/electron/electron/issues/5150
            }
            return background;
        }
        saveWindowSplash(windowId, splash) {
            // Update in storage
            this.b.setItems([
                { key: THEME_STORAGE_KEY, data: splash.baseTheme },
                { key: THEME_BG_STORAGE_KEY, data: splash.colorInfo.background },
                { key: THEME_WINDOW_SPLASH, data: splash }
            ]);
            // Update in opened windows
            if (typeof windowId === 'number') {
                this.f(windowId, splash);
            }
        }
        f(windowId, splash) {
            for (const window of electron_1.BrowserWindow.getAllWindows()) {
                if (window.id === windowId) {
                    window.setBackgroundColor(splash.colorInfo.background);
                    break;
                }
            }
        }
        getWindowSplash() {
            return this.b.getItem(THEME_WINDOW_SPLASH);
        }
    };
    exports.$_5b = $_5b;
    exports.$_5b = $_5b = __decorate([
        __param(0, state_1.$eN),
        __param(1, configuration_1.$8h)
    ], $_5b);
});
//# sourceMappingURL=themeMainService.js.map