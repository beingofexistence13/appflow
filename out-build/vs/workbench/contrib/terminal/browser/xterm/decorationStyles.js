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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/async", "vs/base/common/date", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/nls!vs/workbench/contrib/terminal/browser/xterm/decorationStyles", "vs/platform/configuration/common/configuration", "vs/platform/contextview/browser/contextView", "vs/workbench/services/hover/browser/hover"], function (require, exports, dom, async_1, date_1, htmlContent_1, lifecycle_1, nls_1, configuration_1, contextView_1, hover_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Bib = exports.$Aib = exports.DecorationSelector = void 0;
    var DecorationStyles;
    (function (DecorationStyles) {
        DecorationStyles[DecorationStyles["DefaultDimension"] = 16] = "DefaultDimension";
        DecorationStyles[DecorationStyles["MarginLeft"] = -17] = "MarginLeft";
    })(DecorationStyles || (DecorationStyles = {}));
    var DecorationSelector;
    (function (DecorationSelector) {
        DecorationSelector["CommandDecoration"] = "terminal-command-decoration";
        DecorationSelector["Hide"] = "hide";
        DecorationSelector["ErrorColor"] = "error";
        DecorationSelector["DefaultColor"] = "default-color";
        DecorationSelector["Default"] = "default";
        DecorationSelector["Codicon"] = "codicon";
        DecorationSelector["XtermDecoration"] = "xterm-decoration";
        DecorationSelector["OverviewRuler"] = ".xterm-decoration-overview-ruler";
        DecorationSelector["QuickFix"] = "quick-fix";
    })(DecorationSelector || (exports.DecorationSelector = DecorationSelector = {}));
    let $Aib = class $Aib extends lifecycle_1.$kc {
        constructor(c, configurationService, contextMenuService) {
            super();
            this.c = c;
            this.b = false;
            this.B(contextMenuService.onDidShowContextMenu(() => this.b = true));
            this.B(contextMenuService.onDidHideContextMenu(() => this.b = false));
            this.a = this.B(new async_1.$Dg(configurationService.getValue('workbench.hover.delay')));
        }
        hideHover() {
            this.a.cancel();
            this.c.hideHover();
        }
        createHover(element, command, hoverMessage) {
            return (0, lifecycle_1.$hc)(dom.$nO(element, dom.$3O.MOUSE_ENTER, () => {
                if (this.b) {
                    return;
                }
                this.a.trigger(() => {
                    let hoverContent = `${(0, nls_1.localize)(0, null)}`;
                    hoverContent += '\n\n---\n\n';
                    if (!command) {
                        if (hoverMessage) {
                            hoverContent = hoverMessage;
                        }
                        else {
                            return;
                        }
                    }
                    else if (command.markProperties || hoverMessage) {
                        if (command.markProperties?.hoverMessage || hoverMessage) {
                            hoverContent = command.markProperties?.hoverMessage || hoverMessage || '';
                        }
                        else {
                            return;
                        }
                    }
                    else if (command.exitCode) {
                        if (command.exitCode === -1) {
                            hoverContent += (0, nls_1.localize)(1, null, (0, date_1.$6l)(command.timestamp, true));
                        }
                        else {
                            hoverContent += (0, nls_1.localize)(2, null, (0, date_1.$6l)(command.timestamp, true), command.exitCode);
                        }
                    }
                    else {
                        hoverContent += (0, nls_1.localize)(3, null, (0, date_1.$6l)(command.timestamp, true));
                    }
                    this.c.showHover({ content: new htmlContent_1.$Xj(hoverContent), target: element });
                });
            }), dom.$nO(element, dom.$3O.MOUSE_LEAVE, () => this.hideHover()), dom.$nO(element, dom.$3O.MOUSE_OUT, () => this.hideHover()));
        }
    };
    exports.$Aib = $Aib;
    exports.$Aib = $Aib = __decorate([
        __param(0, hover_1.$zib),
        __param(1, configuration_1.$8h),
        __param(2, contextView_1.$WZ)
    ], $Aib);
    function $Bib(configurationService, element) {
        if (!element) {
            return;
        }
        const fontSize = configurationService.inspect("terminal.integrated.fontSize" /* TerminalSettingId.FontSize */).value;
        const defaultFontSize = configurationService.inspect("terminal.integrated.fontSize" /* TerminalSettingId.FontSize */).defaultValue;
        const lineHeight = configurationService.inspect("terminal.integrated.lineHeight" /* TerminalSettingId.LineHeight */).value;
        if (typeof fontSize === 'number' && typeof defaultFontSize === 'number' && typeof lineHeight === 'number') {
            const scalar = (fontSize / defaultFontSize) <= 1 ? (fontSize / defaultFontSize) : 1;
            // must be inlined to override the inlined styles from xterm
            element.style.width = `${scalar * 16 /* DecorationStyles.DefaultDimension */}px`;
            element.style.height = `${scalar * 16 /* DecorationStyles.DefaultDimension */ * lineHeight}px`;
            element.style.fontSize = `${scalar * 16 /* DecorationStyles.DefaultDimension */}px`;
            element.style.marginLeft = `${scalar * -17 /* DecorationStyles.MarginLeft */}px`;
        }
    }
    exports.$Bib = $Bib;
});
//# sourceMappingURL=decorationStyles.js.map