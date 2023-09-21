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
define(["require", "exports", "vs/nls!vs/workbench/browser/parts/auxiliarybar/auxiliaryBarPart", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/notification/common/notification", "vs/platform/storage/common/storage", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/browser/panecomposite", "vs/workbench/browser/parts/panel/panelPart", "vs/workbench/common/contextkeys", "vs/workbench/common/theme", "vs/workbench/common/views", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/layout/browser/layoutService", "vs/base/common/actions", "vs/workbench/browser/parts/auxiliarybar/auxiliaryBarActions", "vs/base/common/types", "vs/workbench/browser/actions/layoutActions", "vs/platform/commands/common/commands", "vs/css!./media/auxiliaryBarPart"], function (require, exports, nls_1, contextkey_1, contextView_1, instantiation_1, keybinding_1, notification_1, storage_1, colorRegistry_1, themeService_1, panecomposite_1, panelPart_1, contextkeys_1, theme_1, views_1, extensions_1, layoutService_1, actions_1, auxiliaryBarActions_1, types_1, layoutActions_1, commands_1) {
    "use strict";
    var $8xb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$8xb = void 0;
    let $8xb = class $8xb extends panelPart_1.$6xb {
        static { $8xb_1 = this; }
        static { this.activePanelSettingsKey = 'workbench.auxiliarybar.activepanelid'; }
        static { this.pinnedPanelsKey = 'workbench.auxiliarybar.pinnedPanels'; }
        static { this.placeholdeViewContainersKey = 'workbench.auxiliarybar.placeholderPanels'; }
        constructor(notificationService, storageService, contextMenuService, layoutService, keybindingService, instantiationService, themeService, viewDescriptorService, contextKeyService, extensionService, Oc) {
            super(notificationService, storageService, contextMenuService, layoutService, keybindingService, instantiationService, themeService, viewDescriptorService, contextKeyService, extensionService, "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */, $8xb_1.activePanelSettingsKey, $8xb_1.pinnedPanelsKey, $8xb_1.placeholdeViewContainersKey, panecomposite_1.$Web.Auxiliary, theme_1.$Iab, 2 /* ViewContainerLocation.AuxiliaryBar */, contextkeys_1.$ydb.bindTo(contextKeyService), contextkeys_1.$zdb.bindTo(contextKeyService), {
                useIcons: true,
                hasTitle: true,
                borderWidth: () => (this.z(theme_1.$Kab) || this.z(colorRegistry_1.$Av)) ? 1 : 0,
            });
            this.Oc = Oc;
            // Use the side bar dimensions
            this.minimumWidth = 170;
            this.maximumWidth = Number.POSITIVE_INFINITY;
            this.minimumHeight = 0;
            this.maximumHeight = Number.POSITIVE_INFINITY;
            this.priority = 1 /* LayoutPriority.Low */;
        }
        updateStyles() {
            super.updateStyles();
            const container = (0, types_1.$uf)(this.getContainer());
            const borderColor = this.z(theme_1.$Kab) || this.z(colorRegistry_1.$Av);
            const isPositionLeft = this.u.getSideBarPosition() === 1 /* Position.RIGHT */;
            container.style.color = this.z(theme_1.$Jab) || '';
            container.style.borderLeftColor = borderColor ?? '';
            container.style.borderRightColor = borderColor ?? '';
            container.style.borderLeftStyle = borderColor && !isPositionLeft ? 'solid' : 'none';
            container.style.borderRightStyle = borderColor && isPositionLeft ? 'solid' : 'none';
            container.style.borderLeftWidth = borderColor && !isPositionLeft ? '1px' : '0px';
            container.style.borderRightWidth = borderColor && isPositionLeft ? '1px' : '0px';
        }
        bc() {
            return {
                position: () => 2 /* HoverPosition.BELOW */
            };
        }
        cc(actions) {
            const currentPositionRight = this.u.getSideBarPosition() === 0 /* Position.LEFT */;
            actions.push(...[
                new actions_1.$ii(),
                (0, actions_1.$li)({ id: layoutActions_1.$Qtb.ID, label: currentPositionRight ? (0, nls_1.localize)(0, null) : (0, nls_1.localize)(1, null), run: () => this.Oc.executeCommand(layoutActions_1.$Qtb.ID) }),
                (0, actions_1.$li)({ id: auxiliaryBarActions_1.$ztb.ID, label: (0, nls_1.localize)(2, null), run: () => this.Oc.executeCommand(auxiliaryBarActions_1.$ztb.ID) })
            ]);
        }
        toJSON() {
            return {
                type: "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */
            };
        }
    };
    exports.$8xb = $8xb;
    exports.$8xb = $8xb = $8xb_1 = __decorate([
        __param(0, notification_1.$Yu),
        __param(1, storage_1.$Vo),
        __param(2, contextView_1.$WZ),
        __param(3, layoutService_1.$Meb),
        __param(4, keybinding_1.$2D),
        __param(5, instantiation_1.$Ah),
        __param(6, themeService_1.$gv),
        __param(7, views_1.$_E),
        __param(8, contextkey_1.$3i),
        __param(9, extensions_1.$MF),
        __param(10, commands_1.$Fr)
    ], $8xb);
});
//# sourceMappingURL=auxiliaryBarPart.js.map