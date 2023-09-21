/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/platform/theme/common/theme"], function (require, exports, codicons_1, event_1, lifecycle_1, instantiation_1, platform, theme_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$nv = exports.$mv = exports.$lv = exports.$kv = exports.$jv = exports.$iv = exports.$hv = exports.$gv = void 0;
    exports.$gv = (0, instantiation_1.$Bh)('themeService');
    function $hv(id) {
        return { id };
    }
    exports.$hv = $hv;
    exports.$iv = codicons_1.$Pj.file;
    exports.$jv = codicons_1.$Pj.folder;
    function $kv(type) {
        switch (type) {
            case theme_1.ColorScheme.DARK: return 'vs-dark';
            case theme_1.ColorScheme.HIGH_CONTRAST_DARK: return 'hc-black';
            case theme_1.ColorScheme.HIGH_CONTRAST_LIGHT: return 'hc-light';
            default: return 'vs';
        }
    }
    exports.$kv = $kv;
    // static theming participant
    exports.$lv = {
        ThemingContribution: 'base.contributions.theming'
    };
    class ThemingRegistry {
        constructor() {
            this.a = [];
            this.a = [];
            this.b = new event_1.$fd();
        }
        onColorThemeChange(participant) {
            this.a.push(participant);
            this.b.fire(participant);
            return (0, lifecycle_1.$ic)(() => {
                const idx = this.a.indexOf(participant);
                this.a.splice(idx, 1);
            });
        }
        get onThemingParticipantAdded() {
            return this.b.event;
        }
        getThemingParticipants() {
            return this.a;
        }
    }
    const themingRegistry = new ThemingRegistry();
    platform.$8m.add(exports.$lv.ThemingContribution, themingRegistry);
    function $mv(participant) {
        return themingRegistry.onColorThemeChange(participant);
    }
    exports.$mv = $mv;
    /**
     * Utility base class for all themable components.
     */
    class $nv extends lifecycle_1.$kc {
        constructor(n) {
            super();
            this.n = n;
            this.h = n.getColorTheme();
            // Hook up to theme changes
            this.B(this.n.onDidColorThemeChange(theme => this.w(theme)));
        }
        w(theme) {
            this.h = theme;
            this.updateStyles();
        }
        updateStyles() {
            // Subclasses to override
        }
        z(id, modify) {
            let color = this.h.getColor(id);
            if (color && modify) {
                color = modify(color, this.h);
            }
            return color ? color.toString() : null;
        }
    }
    exports.$nv = $nv;
});
//# sourceMappingURL=themeService.js.map