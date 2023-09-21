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
define(["require", "exports", "vs/nls!vs/workbench/contrib/files/browser/views/emptyView", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/themeService", "vs/platform/keybinding/common/keybinding", "vs/platform/contextview/browser/contextView", "vs/platform/workspace/common/workspace", "vs/platform/configuration/common/configuration", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/browser/dnd", "vs/platform/theme/common/colorRegistry", "vs/platform/label/common/label", "vs/platform/contextkey/common/contextkey", "vs/workbench/common/views", "vs/platform/opener/common/opener", "vs/platform/telemetry/common/telemetry", "vs/base/common/platform", "vs/base/browser/dom"], function (require, exports, nls, instantiation_1, themeService_1, keybinding_1, contextView_1, workspace_1, configuration_1, viewPane_1, dnd_1, colorRegistry_1, label_1, contextkey_1, views_1, opener_1, telemetry_1, platform_1, dom_1) {
    "use strict";
    var $PLb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$PLb = void 0;
    let $PLb = class $PLb extends viewPane_1.$Ieb {
        static { $PLb_1 = this; }
        static { this.ID = 'workbench.explorer.emptyView'; }
        static { this.NAME = nls.localize(0, null); }
        constructor(options, themeService, viewDescriptorService, instantiationService, keybindingService, contextMenuService, b, configurationService, c, contextKeyService, openerService, telemetryService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.b = b;
            this.c = c;
            this.a = false;
            this.B(this.b.onDidChangeWorkbenchState(() => this.g()));
            this.B(this.c.onDidChangeFormatters(() => this.g()));
        }
        shouldShowWelcome() {
            return true;
        }
        U(container) {
            super.U(container);
            this.B(new dom_1.$zP(container, {
                onDrop: e => {
                    container.style.backgroundColor = '';
                    const dropHandler = this.Bb.createInstance(dnd_1.$ueb, { allowWorkspaceOpen: !platform_1.$o || (0, workspace_1.$3h)(this.b.getWorkspace()) });
                    dropHandler.handleDrop(e, () => undefined, () => undefined);
                },
                onDragEnter: () => {
                    const color = this.Db.getColorTheme().getColor(colorRegistry_1.$Ix);
                    container.style.backgroundColor = color ? color.toString() : '';
                },
                onDragEnd: () => {
                    container.style.backgroundColor = '';
                },
                onDragLeave: () => {
                    container.style.backgroundColor = '';
                },
                onDragOver: e => {
                    if (e.dataTransfer) {
                        e.dataTransfer.dropEffect = 'copy';
                    }
                }
            }));
            this.g();
        }
        g() {
            if (this.a) {
                return;
            }
            if (this.b.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */) {
                this.Jb($PLb_1.NAME);
            }
            else {
                this.Jb(this.title);
            }
        }
        dispose() {
            this.a = true;
            super.dispose();
        }
    };
    exports.$PLb = $PLb;
    exports.$PLb = $PLb = $PLb_1 = __decorate([
        __param(1, themeService_1.$gv),
        __param(2, views_1.$_E),
        __param(3, instantiation_1.$Ah),
        __param(4, keybinding_1.$2D),
        __param(5, contextView_1.$WZ),
        __param(6, workspace_1.$Kh),
        __param(7, configuration_1.$8h),
        __param(8, label_1.$Vz),
        __param(9, contextkey_1.$3i),
        __param(10, opener_1.$NT),
        __param(11, telemetry_1.$9k)
    ], $PLb);
});
//# sourceMappingURL=emptyView.js.map