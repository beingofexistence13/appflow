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
    var $g5b_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$g5b = void 0;
    let $g5b = class $g5b {
        static { $g5b_1 = this; }
        static { this.a = 'monaco-parts-splash'; }
        constructor(d, f, g, editorGroupsService, h, i) {
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.b = new lifecycle_1.$jc();
            event_1.Event.once(f.onDidLayout)(() => {
                this.l();
                perf.mark('code/didRemovePartsSplash');
            }, undefined, this.b);
            let lastIdleSchedule;
            event_1.Event.any(browser_1.$4N, editorGroupsService.onDidLayout, d.onDidColorThemeChange)(() => {
                lastIdleSchedule?.dispose();
                lastIdleSchedule = (0, async_1.$Wg)(() => this.j(), 800);
            }, undefined, this.b);
            h.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('window.titleBarStyle')) {
                    this.c = true;
                    this.j();
                }
            }, this, this.b);
        }
        dispose() {
            this.b.dispose();
        }
        j() {
            const theme = this.d.getColorTheme();
            this.i.saveWindowSplash({
                zoomLevel: this.h.getValue('window.zoomLevel'),
                baseTheme: (0, themeService_1.$kv)(theme.type),
                colorInfo: {
                    foreground: theme.getColor(colorRegistry_1.$uv)?.toString(),
                    background: color_1.$Os.Format.CSS.formatHex(theme.getColor(colorRegistry_1.$ww) || themes.$$$(theme)),
                    editorBackground: theme.getColor(colorRegistry_1.$ww)?.toString(),
                    titleBarBackground: theme.getColor(themes.$Sab)?.toString(),
                    activityBarBackground: theme.getColor(themes.$mab)?.toString(),
                    sideBarBackground: theme.getColor(themes.$Iab)?.toString(),
                    statusBarBackground: theme.getColor(themes.$3_)?.toString(),
                    statusBarNoFolderBackground: theme.getColor(themes.$4_)?.toString(),
                    windowBorder: theme.getColor(themes.$fbb)?.toString() ?? theme.getColor(themes.$gbb)?.toString()
                },
                layoutInfo: !this.k() ? undefined : {
                    sideBarSide: this.f.getSideBarPosition() === 1 /* Position.RIGHT */ ? 'right' : 'left',
                    editorPartMinWidth: editor_1.$4T.width,
                    titleBarHeight: this.f.isVisible("workbench.parts.titlebar" /* Parts.TITLEBAR_PART */) ? dom.$LO((0, types_1.$uf)(this.f.getContainer("workbench.parts.titlebar" /* Parts.TITLEBAR_PART */))) : 0,
                    activityBarWidth: this.f.isVisible("workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */) ? dom.$HO((0, types_1.$uf)(this.f.getContainer("workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */))) : 0,
                    sideBarWidth: this.f.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */) ? dom.$HO((0, types_1.$uf)(this.f.getContainer("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */))) : 0,
                    statusBarHeight: this.f.isVisible("workbench.parts.statusbar" /* Parts.STATUSBAR_PART */) ? dom.$LO((0, types_1.$uf)(this.f.getContainer("workbench.parts.statusbar" /* Parts.STATUSBAR_PART */))) : 0,
                    windowBorder: this.f.hasWindowBorder(),
                    windowBorderRadius: this.f.getWindowBorderRadius()
                }
            });
        }
        k() {
            return !(0, browser_1.$3N)() && !this.g.isExtensionDevelopment && !this.c;
        }
        l() {
            const element = document.getElementById($g5b_1.a);
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
    exports.$g5b = $g5b;
    exports.$g5b = $g5b = $g5b_1 = __decorate([
        __param(0, themeService_1.$gv),
        __param(1, layoutService_1.$Meb),
        __param(2, environmentService_1.$hJ),
        __param(3, editorGroupsService_1.$5C),
        __param(4, configuration_1.$8h),
        __param(5, splash_1.$f5b)
    ], $g5b);
});
//# sourceMappingURL=partsSplash.js.map