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
define(["require", "exports", "vs/nls!vs/workbench/contrib/terminal/browser/terminalConfigHelper", "vs/editor/common/config/editorOptions", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/terminal/common/terminal", "vs/base/common/severity", "vs/platform/notification/common/notification", "vs/base/common/event", "vs/base/common/path", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/extensions/browser/extensionsActions", "vs/platform/product/common/productService", "vs/base/common/platform", "vs/base/common/lifecycle"], function (require, exports, nls, editorOptions_1, configuration_1, terminal_1, severity_1, notification_1, event_1, path_1, extensionManagement_1, instantiation_1, extensionsActions_1, productService_1, platform_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$dib = void 0;
    var FontConstants;
    (function (FontConstants) {
        FontConstants[FontConstants["MinimumFontSize"] = 6] = "MinimumFontSize";
        FontConstants[FontConstants["MaximumFontSize"] = 100] = "MaximumFontSize";
    })(FontConstants || (FontConstants = {}));
    /**
     * Encapsulates terminal configuration logic, the primary purpose of this file is so that platform
     * specific test cases can be written.
     */
    let $dib = class $dib extends lifecycle_1.$kc {
        get onConfigChanged() { return this.f.event; }
        constructor(g, h, j, m, n) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.c = 1 /* LinuxDistro.Unknown */;
            this.f = this.B(new event_1.$fd());
            this.z = false;
            this.s();
            this.B(this.g.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(terminal_1.$vM)) {
                    this.s();
                }
            }));
            if (platform_1.$k) {
                if (navigator.userAgent.includes('Ubuntu')) {
                    this.c = 3 /* LinuxDistro.Ubuntu */;
                }
                else if (navigator.userAgent.includes('Fedora')) {
                    this.c = 2 /* LinuxDistro.Fedora */;
                }
            }
        }
        s() {
            const configValues = this.g.getValue(terminal_1.$vM);
            configValues.fontWeight = this.D(configValues.fontWeight, terminal_1.$BM);
            configValues.fontWeightBold = this.D(configValues.fontWeightBold, terminal_1.$CM);
            this.config = configValues;
            this.f.fire();
        }
        configFontIsMonospace() {
            const fontSize = 15;
            const fontFamily = this.config.fontFamily || this.g.getValue('editor').fontFamily || editorOptions_1.EDITOR_FONT_DEFAULTS.fontFamily;
            const iRect = this.u('i', fontFamily, fontSize);
            const wRect = this.u('w', fontFamily, fontSize);
            // Check for invalid bounds, there is no reason to believe the font is not monospace
            if (!iRect || !wRect || !iRect.width || !wRect.width) {
                return true;
            }
            return iRect.width === wRect.width;
        }
        t() {
            if (!this.panelContainer) {
                throw new Error('Cannot measure element when terminal is not attached');
            }
            // Create charMeasureElement if it hasn't been created or if it was orphaned by its parent
            if (!this.a || !this.a.parentElement) {
                this.a = document.createElement('div');
                this.panelContainer.appendChild(this.a);
            }
            return this.a;
        }
        u(char, fontFamily, fontSize) {
            let charMeasureElement;
            try {
                charMeasureElement = this.t();
            }
            catch {
                return undefined;
            }
            const style = charMeasureElement.style;
            style.display = 'inline-block';
            style.fontFamily = fontFamily;
            style.fontSize = fontSize + 'px';
            style.lineHeight = 'normal';
            charMeasureElement.innerText = char;
            const rect = charMeasureElement.getBoundingClientRect();
            style.display = 'none';
            return rect;
        }
        w(fontFamily, fontSize, letterSpacing, lineHeight) {
            const rect = this.u('X', fontFamily, fontSize);
            // Bounding client rect was invalid, use last font measurement if available.
            if (this.b && (!rect || !rect.width || !rect.height)) {
                return this.b;
            }
            this.b = {
                fontFamily,
                fontSize,
                letterSpacing,
                lineHeight,
                charWidth: 0,
                charHeight: 0
            };
            if (rect && rect.width && rect.height) {
                this.b.charHeight = Math.ceil(rect.height);
                // Char width is calculated differently for DOM and the other renderer types. Refer to
                // how each renderer updates their dimensions in xterm.js
                if (this.config.gpuAcceleration === 'off') {
                    this.b.charWidth = rect.width;
                }
                else {
                    const deviceCharWidth = Math.floor(rect.width * window.devicePixelRatio);
                    const deviceCellWidth = deviceCharWidth + Math.round(letterSpacing);
                    const cssCellWidth = deviceCellWidth / window.devicePixelRatio;
                    this.b.charWidth = cssCellWidth - Math.round(letterSpacing) / window.devicePixelRatio;
                }
            }
            return this.b;
        }
        /**
         * Gets the font information based on the terminal.integrated.fontFamily
         * terminal.integrated.fontSize, terminal.integrated.lineHeight configuration properties
         */
        getFont(xtermCore, excludeDimensions) {
            const editorConfig = this.g.getValue('editor');
            let fontFamily = this.config.fontFamily || editorConfig.fontFamily || editorOptions_1.EDITOR_FONT_DEFAULTS.fontFamily;
            let fontSize = this.y(this.config.fontSize, 6 /* FontConstants.MinimumFontSize */, 100 /* FontConstants.MaximumFontSize */, editorOptions_1.EDITOR_FONT_DEFAULTS.fontSize);
            // Work around bad font on Fedora/Ubuntu
            if (!this.config.fontFamily) {
                if (this.c === 2 /* LinuxDistro.Fedora */) {
                    fontFamily = '\'DejaVu Sans Mono\'';
                }
                if (this.c === 3 /* LinuxDistro.Ubuntu */) {
                    fontFamily = '\'Ubuntu Mono\'';
                    // Ubuntu mono is somehow smaller, so set fontSize a bit larger to get the same perceived size.
                    fontSize = this.y(fontSize + 2, 6 /* FontConstants.MinimumFontSize */, 100 /* FontConstants.MaximumFontSize */, editorOptions_1.EDITOR_FONT_DEFAULTS.fontSize);
                }
            }
            // Always fallback to monospace, otherwise a proportional font may become the default
            fontFamily += ', monospace';
            const letterSpacing = this.config.letterSpacing ? Math.max(Math.floor(this.config.letterSpacing), terminal_1.$xM) : terminal_1.$wM;
            const lineHeight = this.config.lineHeight ? Math.max(this.config.lineHeight, 1) : terminal_1.$yM;
            if (excludeDimensions) {
                return {
                    fontFamily,
                    fontSize,
                    letterSpacing,
                    lineHeight
                };
            }
            // Get the character dimensions from xterm if it's available
            if (xtermCore) {
                if (xtermCore._renderService && xtermCore._renderService.dimensions?.css.cell.width && xtermCore._renderService.dimensions?.css.cell.height) {
                    return {
                        fontFamily,
                        fontSize,
                        letterSpacing,
                        lineHeight,
                        charHeight: xtermCore._renderService.dimensions.css.cell.height / lineHeight,
                        charWidth: xtermCore._renderService.dimensions.css.cell.width - Math.round(letterSpacing) / window.devicePixelRatio
                    };
                }
            }
            // Fall back to measuring the font ourselves
            return this.w(fontFamily, fontSize, letterSpacing, lineHeight);
        }
        y(source, minimum, maximum, fallback) {
            let r = parseInt(source, 10);
            if (isNaN(r)) {
                return fallback;
            }
            if (typeof minimum === 'number') {
                r = Math.max(minimum, r);
            }
            if (typeof maximum === 'number') {
                r = Math.min(maximum, r);
            }
            return r;
        }
        async showRecommendations(shellLaunchConfig) {
            if (this.z) {
                return;
            }
            this.z = true;
            if (platform_1.$i && shellLaunchConfig.executable && (0, path_1.$ae)(shellLaunchConfig.executable).toLowerCase() === 'wsl.exe') {
                const exeBasedExtensionTips = this.n.exeBasedExtensionTips;
                if (!exeBasedExtensionTips || !exeBasedExtensionTips.wsl) {
                    return;
                }
                const extId = Object.keys(exeBasedExtensionTips.wsl.recommendations).find(extId => exeBasedExtensionTips.wsl.recommendations[extId].important);
                if (extId && !await this.C(extId)) {
                    this.j.prompt(severity_1.default.Info, nls.localize(0, null, exeBasedExtensionTips.wsl.friendlyName), [
                        {
                            label: nls.localize(1, null),
                            run: () => {
                                this.m.createInstance(extensionsActions_1.$Zhb, extId).run();
                            }
                        }
                    ], {
                        sticky: true,
                        neverShowAgain: { id: 'terminalConfigHelper/launchRecommendationsIgnore', scope: notification_1.NeverShowAgainScope.APPLICATION },
                        onCancel: () => { }
                    });
                }
            }
        }
        async C(id) {
            const extensions = await this.h.getInstalled();
            return extensions.some(e => e.identifier.id === id);
        }
        D(input, defaultWeight) {
            if (input === 'normal' || input === 'bold') {
                return input;
            }
            return this.y(input, terminal_1.$zM, terminal_1.$AM, defaultWeight);
        }
    };
    exports.$dib = $dib;
    exports.$dib = $dib = __decorate([
        __param(0, configuration_1.$8h),
        __param(1, extensionManagement_1.$2n),
        __param(2, notification_1.$Yu),
        __param(3, instantiation_1.$Ah),
        __param(4, productService_1.$kj)
    ], $dib);
});
//# sourceMappingURL=terminalConfigHelper.js.map