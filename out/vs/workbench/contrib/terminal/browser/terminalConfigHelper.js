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
define(["require", "exports", "vs/nls", "vs/editor/common/config/editorOptions", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/terminal/common/terminal", "vs/base/common/severity", "vs/platform/notification/common/notification", "vs/base/common/event", "vs/base/common/path", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/extensions/browser/extensionsActions", "vs/platform/product/common/productService", "vs/base/common/platform", "vs/base/common/lifecycle"], function (require, exports, nls, editorOptions_1, configuration_1, terminal_1, severity_1, notification_1, event_1, path_1, extensionManagement_1, instantiation_1, extensionsActions_1, productService_1, platform_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalConfigHelper = void 0;
    var FontConstants;
    (function (FontConstants) {
        FontConstants[FontConstants["MinimumFontSize"] = 6] = "MinimumFontSize";
        FontConstants[FontConstants["MaximumFontSize"] = 100] = "MaximumFontSize";
    })(FontConstants || (FontConstants = {}));
    /**
     * Encapsulates terminal configuration logic, the primary purpose of this file is so that platform
     * specific test cases can be written.
     */
    let TerminalConfigHelper = class TerminalConfigHelper extends lifecycle_1.Disposable {
        get onConfigChanged() { return this._onConfigChanged.event; }
        constructor(_configurationService, _extensionManagementService, _notificationService, _instantiationService, _productService) {
            super();
            this._configurationService = _configurationService;
            this._extensionManagementService = _extensionManagementService;
            this._notificationService = _notificationService;
            this._instantiationService = _instantiationService;
            this._productService = _productService;
            this._linuxDistro = 1 /* LinuxDistro.Unknown */;
            this._onConfigChanged = this._register(new event_1.Emitter());
            this._recommendationsShown = false;
            this._updateConfig();
            this._register(this._configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(terminal_1.TERMINAL_CONFIG_SECTION)) {
                    this._updateConfig();
                }
            }));
            if (platform_1.isLinux) {
                if (navigator.userAgent.includes('Ubuntu')) {
                    this._linuxDistro = 3 /* LinuxDistro.Ubuntu */;
                }
                else if (navigator.userAgent.includes('Fedora')) {
                    this._linuxDistro = 2 /* LinuxDistro.Fedora */;
                }
            }
        }
        _updateConfig() {
            const configValues = this._configurationService.getValue(terminal_1.TERMINAL_CONFIG_SECTION);
            configValues.fontWeight = this._normalizeFontWeight(configValues.fontWeight, terminal_1.DEFAULT_FONT_WEIGHT);
            configValues.fontWeightBold = this._normalizeFontWeight(configValues.fontWeightBold, terminal_1.DEFAULT_BOLD_FONT_WEIGHT);
            this.config = configValues;
            this._onConfigChanged.fire();
        }
        configFontIsMonospace() {
            const fontSize = 15;
            const fontFamily = this.config.fontFamily || this._configurationService.getValue('editor').fontFamily || editorOptions_1.EDITOR_FONT_DEFAULTS.fontFamily;
            const iRect = this._getBoundingRectFor('i', fontFamily, fontSize);
            const wRect = this._getBoundingRectFor('w', fontFamily, fontSize);
            // Check for invalid bounds, there is no reason to believe the font is not monospace
            if (!iRect || !wRect || !iRect.width || !wRect.width) {
                return true;
            }
            return iRect.width === wRect.width;
        }
        _createCharMeasureElementIfNecessary() {
            if (!this.panelContainer) {
                throw new Error('Cannot measure element when terminal is not attached');
            }
            // Create charMeasureElement if it hasn't been created or if it was orphaned by its parent
            if (!this._charMeasureElement || !this._charMeasureElement.parentElement) {
                this._charMeasureElement = document.createElement('div');
                this.panelContainer.appendChild(this._charMeasureElement);
            }
            return this._charMeasureElement;
        }
        _getBoundingRectFor(char, fontFamily, fontSize) {
            let charMeasureElement;
            try {
                charMeasureElement = this._createCharMeasureElementIfNecessary();
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
        _measureFont(fontFamily, fontSize, letterSpacing, lineHeight) {
            const rect = this._getBoundingRectFor('X', fontFamily, fontSize);
            // Bounding client rect was invalid, use last font measurement if available.
            if (this._lastFontMeasurement && (!rect || !rect.width || !rect.height)) {
                return this._lastFontMeasurement;
            }
            this._lastFontMeasurement = {
                fontFamily,
                fontSize,
                letterSpacing,
                lineHeight,
                charWidth: 0,
                charHeight: 0
            };
            if (rect && rect.width && rect.height) {
                this._lastFontMeasurement.charHeight = Math.ceil(rect.height);
                // Char width is calculated differently for DOM and the other renderer types. Refer to
                // how each renderer updates their dimensions in xterm.js
                if (this.config.gpuAcceleration === 'off') {
                    this._lastFontMeasurement.charWidth = rect.width;
                }
                else {
                    const deviceCharWidth = Math.floor(rect.width * window.devicePixelRatio);
                    const deviceCellWidth = deviceCharWidth + Math.round(letterSpacing);
                    const cssCellWidth = deviceCellWidth / window.devicePixelRatio;
                    this._lastFontMeasurement.charWidth = cssCellWidth - Math.round(letterSpacing) / window.devicePixelRatio;
                }
            }
            return this._lastFontMeasurement;
        }
        /**
         * Gets the font information based on the terminal.integrated.fontFamily
         * terminal.integrated.fontSize, terminal.integrated.lineHeight configuration properties
         */
        getFont(xtermCore, excludeDimensions) {
            const editorConfig = this._configurationService.getValue('editor');
            let fontFamily = this.config.fontFamily || editorConfig.fontFamily || editorOptions_1.EDITOR_FONT_DEFAULTS.fontFamily;
            let fontSize = this._clampInt(this.config.fontSize, 6 /* FontConstants.MinimumFontSize */, 100 /* FontConstants.MaximumFontSize */, editorOptions_1.EDITOR_FONT_DEFAULTS.fontSize);
            // Work around bad font on Fedora/Ubuntu
            if (!this.config.fontFamily) {
                if (this._linuxDistro === 2 /* LinuxDistro.Fedora */) {
                    fontFamily = '\'DejaVu Sans Mono\'';
                }
                if (this._linuxDistro === 3 /* LinuxDistro.Ubuntu */) {
                    fontFamily = '\'Ubuntu Mono\'';
                    // Ubuntu mono is somehow smaller, so set fontSize a bit larger to get the same perceived size.
                    fontSize = this._clampInt(fontSize + 2, 6 /* FontConstants.MinimumFontSize */, 100 /* FontConstants.MaximumFontSize */, editorOptions_1.EDITOR_FONT_DEFAULTS.fontSize);
                }
            }
            // Always fallback to monospace, otherwise a proportional font may become the default
            fontFamily += ', monospace';
            const letterSpacing = this.config.letterSpacing ? Math.max(Math.floor(this.config.letterSpacing), terminal_1.MINIMUM_LETTER_SPACING) : terminal_1.DEFAULT_LETTER_SPACING;
            const lineHeight = this.config.lineHeight ? Math.max(this.config.lineHeight, 1) : terminal_1.DEFAULT_LINE_HEIGHT;
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
            return this._measureFont(fontFamily, fontSize, letterSpacing, lineHeight);
        }
        _clampInt(source, minimum, maximum, fallback) {
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
            if (this._recommendationsShown) {
                return;
            }
            this._recommendationsShown = true;
            if (platform_1.isWindows && shellLaunchConfig.executable && (0, path_1.basename)(shellLaunchConfig.executable).toLowerCase() === 'wsl.exe') {
                const exeBasedExtensionTips = this._productService.exeBasedExtensionTips;
                if (!exeBasedExtensionTips || !exeBasedExtensionTips.wsl) {
                    return;
                }
                const extId = Object.keys(exeBasedExtensionTips.wsl.recommendations).find(extId => exeBasedExtensionTips.wsl.recommendations[extId].important);
                if (extId && !await this._isExtensionInstalled(extId)) {
                    this._notificationService.prompt(severity_1.default.Info, nls.localize('useWslExtension.title', "The '{0}' extension is recommended for opening a terminal in WSL.", exeBasedExtensionTips.wsl.friendlyName), [
                        {
                            label: nls.localize('install', 'Install'),
                            run: () => {
                                this._instantiationService.createInstance(extensionsActions_1.InstallRecommendedExtensionAction, extId).run();
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
        async _isExtensionInstalled(id) {
            const extensions = await this._extensionManagementService.getInstalled();
            return extensions.some(e => e.identifier.id === id);
        }
        _normalizeFontWeight(input, defaultWeight) {
            if (input === 'normal' || input === 'bold') {
                return input;
            }
            return this._clampInt(input, terminal_1.MINIMUM_FONT_WEIGHT, terminal_1.MAXIMUM_FONT_WEIGHT, defaultWeight);
        }
    };
    exports.TerminalConfigHelper = TerminalConfigHelper;
    exports.TerminalConfigHelper = TerminalConfigHelper = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, extensionManagement_1.IExtensionManagementService),
        __param(2, notification_1.INotificationService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, productService_1.IProductService)
    ], TerminalConfigHelper);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxDb25maWdIZWxwZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbC9icm93c2VyL3Rlcm1pbmFsQ29uZmlnSGVscGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQW9CaEcsSUFBVyxhQUdWO0lBSEQsV0FBVyxhQUFhO1FBQ3ZCLHVFQUFtQixDQUFBO1FBQ25CLHlFQUFxQixDQUFBO0lBQ3RCLENBQUMsRUFIVSxhQUFhLEtBQWIsYUFBYSxRQUd2QjtJQUVEOzs7T0FHRztJQUNJLElBQU0sb0JBQW9CLEdBQTFCLE1BQU0sb0JBQXFCLFNBQVEsc0JBQVU7UUFTbkQsSUFBSSxlQUFlLEtBQWtCLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFFMUUsWUFDd0IscUJBQTZELEVBQ3ZELDJCQUF5RSxFQUNoRixvQkFBMkQsRUFDMUQscUJBQTZELEVBQ25FLGVBQWlEO1lBRWxFLEtBQUssRUFBRSxDQUFDO1lBTmdDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFDdEMsZ0NBQTJCLEdBQTNCLDJCQUEyQixDQUE2QjtZQUMvRCx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO1lBQ3pDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFDbEQsb0JBQWUsR0FBZixlQUFlLENBQWlCO1lBWHpELGlCQUFZLCtCQUFvQztZQUd6QyxxQkFBZ0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQXdMaEUsMEJBQXFCLEdBQUcsS0FBSyxDQUFDO1lBN0tyQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDckIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsd0JBQXdCLENBQUMs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