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
    exports.ThemeMainService = exports.IThemeMainService = void 0;
    const DEFAULT_BG_LIGHT = '#FFFFFF';
    const DEFAULT_BG_DARK = '#1E1E1E';
    const DEFAULT_BG_HC_BLACK = '#000000';
    const DEFAULT_BG_HC_LIGHT = '#FFFFFF';
    const THEME_STORAGE_KEY = 'theme';
    const THEME_BG_STORAGE_KEY = 'themeBackground';
    const THEME_WINDOW_SPLASH = 'windowSplash';
    exports.IThemeMainService = (0, instantiation_1.createDecorator)('themeMainService');
    let ThemeMainService = class ThemeMainService extends lifecycle_1.Disposable {
        constructor(stateService, configurationService) {
            super();
            this.stateService = stateService;
            this.configurationService = configurationService;
            this._onDidChangeColorScheme = this._register(new event_1.Emitter());
            this.onDidChangeColorScheme = this._onDidChangeColorScheme.event;
            // Color Scheme changes
            electron_1.nativeTheme.on('updated', () => {
                this._onDidChangeColorScheme.fire(this.getColorScheme());
            });
        }
        getColorScheme() {
            if (platform_1.isWindows) {
                // high contrast is refelected by the shouldUseInvertedColorScheme property
                if (electron_1.nativeTheme.shouldUseHighContrastColors) {
                    // shouldUseInvertedColorScheme is dark, !shouldUseInvertedColorScheme is light
                    return { dark: electron_1.nativeTheme.shouldUseInvertedColorScheme, highContrast: true };
                }
            }
            else if (platform_1.isMacintosh) {
                // high contrast is set if one of shouldUseInvertedColorScheme or shouldUseHighContrastColors is set, reflecting the 'Invert colours' and `Increase contrast` settings in MacOS
                if (electron_1.nativeTheme.shouldUseInvertedColorScheme || electron_1.nativeTheme.shouldUseHighContrastColors) {
                    return { dark: electron_1.nativeTheme.shouldUseDarkColors, highContrast: true };
                }
            }
            else if (platform_1.isLinux) {
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
            if (colorScheme.highContrast && this.configurationService.getValue('window.autoDetectHighContrast')) {
                return colorScheme.dark ? DEFAULT_BG_HC_BLACK : DEFAULT_BG_HC_LIGHT;
            }
            let background = this.stateService.getItem(THEME_BG_STORAGE_KEY, null);
            if (!background) {
                const baseTheme = this.stateService.getItem(THEME_STORAGE_KEY, 'vs-dark').split(' ')[0];
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
            if (platform_1.isMacintosh && background.toUpperCase() === DEFAULT_BG_DARK) {
                background = '#171717'; // https://github.com/electron/electron/issues/5150
            }
            return background;
        }
        saveWindowSplash(windowId, splash) {
            // Update in storage
            this.stateService.setItems([
                { key: THEME_STORAGE_KEY, data: splash.baseTheme },
                { key: THEME_BG_STORAGE_KEY, data: splash.colorInfo.background },
                { key: THEME_WINDOW_SPLASH, data: splash }
            ]);
            // Update in opened windows
            if (typeof windowId === 'number') {
                this.updateBackgroundColor(windowId, splash);
            }
        }
        updateBackgroundColor(windowId, splash) {
            for (const window of electron_1.BrowserWindow.getAllWindows()) {
                if (window.id === windowId) {
                    window.setBackgroundColor(splash.colorInfo.background);
                    break;
                }
            }
        }
        getWindowSplash() {
            return this.stateService.getItem(THEME_WINDOW_SPLASH);
        }
    };
    exports.ThemeMainService = ThemeMainService;
    exports.ThemeMainService = ThemeMainService = __decorate([
        __param(0, state_1.IStateService),
        __param(1, configuration_1.IConfigurationService)
    ], ThemeMainService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhlbWVNYWluU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3RoZW1lL2VsZWN0cm9uLW1haW4vdGhlbWVNYWluU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFZaEcsTUFBTSxnQkFBZ0IsR0FBRyxTQUFTLENBQUM7SUFDbkMsTUFBTSxlQUFlLEdBQUcsU0FBUyxDQUFDO0lBQ2xDLE1BQU0sbUJBQW1CLEdBQUcsU0FBUyxDQUFDO0lBQ3RDLE1BQU0sbUJBQW1CLEdBQUcsU0FBUyxDQUFDO0lBRXRDLE1BQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDO0lBQ2xDLE1BQU0sb0JBQW9CLEdBQUcsaUJBQWlCLENBQUM7SUFDL0MsTUFBTSxtQkFBbUIsR0FBRyxjQUFjLENBQUM7SUFFOUIsUUFBQSxpQkFBaUIsR0FBRyxJQUFBLCtCQUFlLEVBQW9CLGtCQUFrQixDQUFDLENBQUM7SUFnQmpGLElBQU0sZ0JBQWdCLEdBQXRCLE1BQU0sZ0JBQWlCLFNBQVEsc0JBQVU7UUFPL0MsWUFBMkIsWUFBbUMsRUFBeUIsb0JBQW1EO1lBQ3pJLEtBQUssRUFBRSxDQUFDO1lBRDBCLGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBQWlDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFIekgsNEJBQXVCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBZ0IsQ0FBQyxDQUFDO1lBQzlFLDJCQUFzQixHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxLQUFLLENBQUM7WUFLcEUsdUJBQXVCO1lBQ3ZCLHNCQUFXLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUU7Z0JBQzlCLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7WUFDMUQs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