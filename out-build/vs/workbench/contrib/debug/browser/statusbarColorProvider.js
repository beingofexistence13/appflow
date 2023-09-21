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
define(["require", "exports", "vs/nls!vs/workbench/contrib/debug/browser/statusbarColorProvider", "vs/platform/theme/common/colorRegistry", "vs/workbench/contrib/debug/common/debug", "vs/platform/workspace/common/workspace", "vs/workbench/common/theme", "vs/base/common/lifecycle", "vs/workbench/services/statusbar/browser/statusbar", "vs/platform/configuration/common/configuration", "vs/platform/layout/browser/layoutService"], function (require, exports, nls_1, colorRegistry_1, debug_1, workspace_1, theme_1, lifecycle_1, statusbar_1, configuration_1, layoutService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$mSb = exports.$lSb = exports.$kSb = exports.$jSb = exports.$iSb = exports.$hSb = void 0;
    // colors for theming
    exports.$hSb = (0, colorRegistry_1.$sv)('statusBar.debuggingBackground', {
        dark: '#CC6633',
        light: '#CC6633',
        hcDark: '#BA592C',
        hcLight: '#B5200D'
    }, (0, nls_1.localize)(0, null));
    exports.$iSb = (0, colorRegistry_1.$sv)('statusBar.debuggingForeground', {
        dark: theme_1.$1_,
        light: theme_1.$1_,
        hcDark: theme_1.$1_,
        hcLight: '#FFFFFF'
    }, (0, nls_1.localize)(1, null));
    exports.$jSb = (0, colorRegistry_1.$sv)('statusBar.debuggingBorder', {
        dark: theme_1.$5_,
        light: theme_1.$5_,
        hcDark: theme_1.$5_,
        hcLight: theme_1.$5_
    }, (0, nls_1.localize)(2, null));
    exports.$kSb = (0, colorRegistry_1.$sv)('commandCenter.debuggingBackground', {
        dark: { value: exports.$hSb, op: 2 /* ColorTransformType.Transparent */, factor: 0.258 },
        hcDark: { value: exports.$hSb, op: 2 /* ColorTransformType.Transparent */, factor: 0.258 },
        light: { value: exports.$hSb, op: 2 /* ColorTransformType.Transparent */, factor: 0.258 },
        hcLight: { value: exports.$hSb, op: 2 /* ColorTransformType.Transparent */, factor: 0.258 }
    }, (0, nls_1.localize)(3, null), true);
    let $lSb = class $lSb {
        set c(enabled) {
            if (enabled === !!this.b) {
                return;
            }
            if (enabled) {
                this.b = this.g.overrideStyle({
                    priority: 10,
                    foreground: exports.$iSb,
                    background: exports.$hSb,
                    border: exports.$jSb,
                });
            }
            else {
                this.b.dispose();
                this.b = undefined;
            }
        }
        constructor(d, f, g, h, i) {
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.a = new lifecycle_1.$jc();
            this.d.onDidChangeState(this.j, this, this.a);
            this.f.onDidChangeWorkbenchState(this.j, this, this.a);
            this.i.onDidChangeConfiguration((e) => {
                if (e.affectsConfiguration('debug.enableStatusBarColor') || e.affectsConfiguration('debug.toolBarLocation')) {
                    this.j();
                }
            });
            this.j();
        }
        j() {
            const debugConfig = this.i.getValue('debug');
            const isInDebugMode = $mSb(this.d.state, this.d.getModel().getSessions());
            if (!debugConfig.enableStatusBarColor) {
                this.c = false;
            }
            else {
                this.c = isInDebugMode;
            }
            const isInCommandCenter = debugConfig.toolBarLocation === 'commandCenter';
            this.h.container.style.setProperty((0, colorRegistry_1.$ov)(theme_1.$2ab), isInCommandCenter && isInDebugMode
                ? (0, colorRegistry_1.$pv)(exports.$kSb)
                : '');
        }
        dispose() {
            this.b?.dispose();
            this.a.dispose();
        }
    };
    exports.$lSb = $lSb;
    exports.$lSb = $lSb = __decorate([
        __param(0, debug_1.$nH),
        __param(1, workspace_1.$Kh),
        __param(2, statusbar_1.$6$),
        __param(3, layoutService_1.$XT),
        __param(4, configuration_1.$8h)
    ], $lSb);
    function $mSb(state, sessions) {
        if (state === 0 /* State.Inactive */ || state === 1 /* State.Initializing */ || sessions.every(s => s.suppressDebugStatusbar || s.configuration?.noDebug)) {
            return false;
        }
        return true;
    }
    exports.$mSb = $mSb;
});
//# sourceMappingURL=statusbarColorProvider.js.map