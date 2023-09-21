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
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/dom", "vs/base/common/color", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/editor/editor", "vs/workbench/common/theme", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/editor/common/editorGroupsService", "vs/platform/configuration/common/configuration", "vs/base/common/performance", "vs/base/common/types", "vs/base/common/async", "vs/workbench/contrib/splash/browser/splash"], function (require, exports, browser_1, dom, color_1, event_1, lifecycle_1, colorRegistry_1, themeService_1, editor_1, themes, layoutService_1, environmentService_1, editorGroupsService_1, configuration_1, perf, types_1, async_1, splash_1) {
    "use strict";
    var PartsSplash_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PartsSplash = void 0;
    let PartsSplash = class PartsSplash {
        static { PartsSplash_1 = this; }
        static { this._splashElementId = 'monaco-parts-splash'; }
        constructor(_themeService, _layoutService, _environmentService, editorGroupsService, _configService, _partSplashService) {
            this._themeService = _themeService;
            this._layoutService = _layoutService;
            this._environmentService = _environmentService;
            this._configService = _configService;
            this._partSplashService = _partSplashService;
            this._disposables = new lifecycle_1.DisposableStore();
            event_1.Event.once(_layoutService.onDidLayout)(() => {
                this._removePartsSplash();
                perf.mark('code/didRemovePartsSplash');
            }, undefined, this._disposables);
            let lastIdleSchedule;
            event_1.Event.any(browser_1.onDidChangeFullscreen, editorGroupsService.onDidLayout, _themeService.onDidColorThemeChange)(() => {
                lastIdleSchedule?.dispose();
                lastIdleSchedule = (0, async_1.runWhenIdle)(() => this._savePartsSplash(), 800);
            }, undefined, this._disposables);
            _configService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('window.titleBarStyle')) {
                    this._didChangeTitleBarStyle = true;
                    this._savePartsSplash();
                }
            }, this, this._disposables);
        }
        dispose() {
            this._disposables.dispose();
        }
        _savePartsSplash() {
            const theme = this._themeService.getColorTheme();
            this._partSplashService.saveWindowSplash({
                zoomLevel: this._configService.getValue('window.zoomLevel'),
                baseTheme: (0, themeService_1.getThemeTypeSelector)(theme.type),
                colorInfo: {
                    foreground: theme.getColor(colorRegistry_1.foreground)?.toString(),
                    background: color_1.Color.Format.CSS.formatHex(theme.getColor(colorRegistry_1.editorBackground) || themes.WORKBENCH_BACKGROUND(theme)),
                    editorBackground: theme.getColor(colorRegistry_1.editorBackground)?.toString(),
                    titleBarBackground: theme.getColor(themes.TITLE_BAR_ACTIVE_BACKGROUND)?.toString(),
                    activityBarBackground: theme.getColor(themes.ACTIVITY_BAR_BACKGROUND)?.toString(),
                    sideBarBackground: theme.getColor(themes.SIDE_BAR_BACKGROUND)?.toString(),
                    statusBarBackground: theme.getColor(themes.STATUS_BAR_BACKGROUND)?.toString(),
                    statusBarNoFolderBackground: theme.getColor(themes.STATUS_BAR_NO_FOLDER_BACKGROUND)?.toString(),
                    windowBorder: theme.getColor(themes.WINDOW_ACTIVE_BORDER)?.toString() ?? theme.getColor(themes.WINDOW_INACTIVE_BORDER)?.toString()
                },
                layoutInfo: !this._shouldSaveLayoutInfo() ? undefined : {
                    sideBarSide: this._layoutService.getSideBarPosition() === 1 /* Position.RIGHT */ ? 'right' : 'left',
                    editorPartMinWidth: editor_1.DEFAULT_EDITOR_MIN_DIMENSIONS.width,
                    titleBarHeight: this._layoutService.isVisible("workbench.parts.titlebar" /* Parts.TITLEBAR_PART */) ? dom.getTotalHeight((0, types_1.assertIsDefined)(this._layoutService.getContainer("workbench.parts.titlebar" /* Parts.TITLEBAR_PART */))) : 0,
                    activityBarWidth: this._layoutService.isVisible("workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */) ? dom.getTotalWidth((0, types_1.assertIsDefined)(this._layoutService.getContainer("workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */))) : 0,
                    sideBarWidth: this._layoutService.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */) ? dom.getTotalWidth((0, types_1.assertIsDefined)(this._layoutService.getContainer("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */))) : 0,
                    statusBarHeight: this._layoutService.isVisible("workbench.parts.statusbar" /* Parts.STATUSBAR_PART */) ? dom.getTotalHeight((0, types_1.assertIsDefined)(this._layoutService.getContainer("workbench.parts.statusbar" /* Parts.STATUSBAR_PART */))) : 0,
                    windowBorder: this._layoutService.hasWindowBorder(),
                    windowBorderRadius: this._layoutService.getWindowBorderRadius()
                }
            });
        }
        _shouldSaveLayoutInfo() {
            return !(0, browser_1.isFullscreen)() && !this._environmentService.isExtensionDevelopment && !this._didChangeTitleBarStyle;
        }
        _removePartsSplash() {
            const element = document.getElementById(PartsSplash_1._splashElementId);
            if (element) {
                element.style.display = 'none';
            }
            // remove initial colors
            const defaultStyles = document.head.getElementsByClassName('initialShellColors');
            if (defaultStyles.length) {
                document.head.removeChild(defaultStyles[0]);
            }
        }
    };
    exports.PartsSplash = PartsSplash;
    exports.PartsSplash = PartsSplash = PartsSplash_1 = __decorate([
        __param(0, themeService_1.IThemeService),
        __param(1, layoutService_1.IWorkbenchLayoutService),
        __param(2, environmentService_1.IWorkbenchEnvironmentService),
        __param(3, editorGroupsService_1.IEditorGroupsService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, splash_1.ISplashStorageService)
    ], PartsSplash);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFydHNTcGxhc2guanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9zcGxhc2gvYnJvd3Nlci9wYXJ0c1NwbGFzaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBb0J6RixJQUFNLFdBQVcsR0FBakIsTUFBTSxXQUFXOztpQkFFQyxxQkFBZ0IsR0FBRyxxQkFBcUIsQUFBeEIsQ0FBeUI7UUFNakUsWUFDZ0IsYUFBNkMsRUFDbkMsY0FBd0QsRUFDbkQsbUJBQWtFLEVBQzFFLG1CQUF5QyxFQUN4QyxjQUFzRCxFQUN0RCxrQkFBMEQ7WUFMakQsa0JBQWEsR0FBYixhQUFhLENBQWU7WUFDbEIsbUJBQWMsR0FBZCxjQUFjLENBQXlCO1lBQ2xDLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBOEI7WUFFeEQsbUJBQWMsR0FBZCxjQUFjLENBQXVCO1lBQ3JDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBdUI7WUFWakUsaUJBQVksR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQVlyRCxhQUFLLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxHQUFHLEVBQUU7Z0JBQzNDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO2dCQUMxQixJQUFJLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLENBQUM7WUFDeEMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFakMsSUFBSSxnQkFBeUMsQ0FBQztZQUM5QyxhQUFLLENBQUMsR0FBRyxDQUFDLCtCQUFxQixFQUFFLG1CQUFtQixDQUFDLFdBQVcsRUFBRSxhQUFhLENBQUMscUJBQXFCLENBQUMsQ0FBQyxHQUFHLEVBQUU7Z0JBQzNHLGdCQUFnQixFQUFFLE9BQU8sRUFBRSxDQUFDO2dCQUM1QixnQkFBZ0IsR0FBRyxJ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