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
define(["require", "exports", "vs/nls", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/notification/common/notification", "vs/platform/storage/common/storage", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/browser/panecomposite", "vs/workbench/browser/parts/panel/panelPart", "vs/workbench/common/contextkeys", "vs/workbench/common/theme", "vs/workbench/common/views", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/layout/browser/layoutService", "vs/base/common/actions", "vs/workbench/browser/parts/auxiliarybar/auxiliaryBarActions", "vs/base/common/types", "vs/workbench/browser/actions/layoutActions", "vs/platform/commands/common/commands", "vs/css!./media/auxiliaryBarPart"], function (require, exports, nls_1, contextkey_1, contextView_1, instantiation_1, keybinding_1, notification_1, storage_1, colorRegistry_1, themeService_1, panecomposite_1, panelPart_1, contextkeys_1, theme_1, views_1, extensions_1, layoutService_1, actions_1, auxiliaryBarActions_1, types_1, layoutActions_1, commands_1) {
    "use strict";
    var AuxiliaryBarPart_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AuxiliaryBarPart = void 0;
    let AuxiliaryBarPart = class AuxiliaryBarPart extends panelPart_1.BasePanelPart {
        static { AuxiliaryBarPart_1 = this; }
        static { this.activePanelSettingsKey = 'workbench.auxiliarybar.activepanelid'; }
        static { this.pinnedPanelsKey = 'workbench.auxiliarybar.pinnedPanels'; }
        static { this.placeholdeViewContainersKey = 'workbench.auxiliarybar.placeholderPanels'; }
        constructor(notificationService, storageService, contextMenuService, layoutService, keybindingService, instantiationService, themeService, viewDescriptorService, contextKeyService, extensionService, commandService) {
            super(notificationService, storageService, contextMenuService, layoutService, keybindingService, instantiationService, themeService, viewDescriptorService, contextKeyService, extensionService, "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */, AuxiliaryBarPart_1.activePanelSettingsKey, AuxiliaryBarPart_1.pinnedPanelsKey, AuxiliaryBarPart_1.placeholdeViewContainersKey, panecomposite_1.Extensions.Auxiliary, theme_1.SIDE_BAR_BACKGROUND, 2 /* ViewContainerLocation.AuxiliaryBar */, contextkeys_1.ActiveAuxiliaryContext.bindTo(contextKeyService), contextkeys_1.AuxiliaryBarFocusContext.bindTo(contextKeyService), {
                useIcons: true,
                hasTitle: true,
                borderWidth: () => (this.getColor(theme_1.SIDE_BAR_BORDER) || this.getColor(colorRegistry_1.contrastBorder)) ? 1 : 0,
            });
            this.commandService = commandService;
            // Use the side bar dimensions
            this.minimumWidth = 170;
            this.maximumWidth = Number.POSITIVE_INFINITY;
            this.minimumHeight = 0;
            this.maximumHeight = Number.POSITIVE_INFINITY;
            this.priority = 1 /* LayoutPriority.Low */;
        }
        updateStyles() {
            super.updateStyles();
            const container = (0, types_1.assertIsDefined)(this.getContainer());
            const borderColor = this.getColor(theme_1.SIDE_BAR_BORDER) || this.getColor(colorRegistry_1.contrastBorder);
            const isPositionLeft = this.layoutService.getSideBarPosition() === 1 /* Position.RIGHT */;
            container.style.color = this.getColor(theme_1.SIDE_BAR_FOREGROUND) || '';
            container.style.borderLeftColor = borderColor ?? '';
            container.style.borderRightColor = borderColor ?? '';
            container.style.borderLeftStyle = borderColor && !isPositionLeft ? 'solid' : 'none';
            container.style.borderRightStyle = borderColor && isPositionLeft ? 'solid' : 'none';
            container.style.borderLeftWidth = borderColor && !isPositionLeft ? '1px' : '0px';
            container.style.borderRightWidth = borderColor && isPositionLeft ? '1px' : '0px';
        }
        getActivityHoverOptions() {
            return {
                position: () => 2 /* HoverPosition.BELOW */
            };
        }
        fillExtraContextMenuActions(actions) {
            const currentPositionRight = this.layoutService.getSideBarPosition() === 0 /* Position.LEFT */;
            actions.push(...[
                new actions_1.Separator(),
                (0, actions_1.toAction)({ id: layoutActions_1.ToggleSidebarPositionAction.ID, label: currentPositionRight ? (0, nls_1.localize)('move second side bar left', "Move Secondary Side Bar Left") : (0, nls_1.localize)('move second side bar right', "Move Secondary Side Bar Right"), run: () => this.commandService.executeCommand(layoutActions_1.ToggleSidebarPositionAction.ID) }),
                (0, actions_1.toAction)({ id: auxiliaryBarActions_1.ToggleAuxiliaryBarAction.ID, label: (0, nls_1.localize)('hide second side bar', "Hide Secondary Side Bar"), run: () => this.commandService.executeCommand(auxiliaryBarActions_1.ToggleAuxiliaryBarAction.ID) })
            ]);
        }
        toJSON() {
            return {
                type: "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */
            };
        }
    };
    exports.AuxiliaryBarPart = AuxiliaryBarPart;
    exports.AuxiliaryBarPart = AuxiliaryBarPart = AuxiliaryBarPart_1 = __decorate([
        __param(0, notification_1.INotificationService),
        __param(1, storage_1.IStorageService),
        __param(2, contextView_1.IContextMenuService),
        __param(3, layoutService_1.IWorkbenchLayoutService),
        __param(4, keybinding_1.IKeybindingService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, themeService_1.IThemeService),
        __param(7, views_1.IViewDescriptorService),
        __param(8, contextkey_1.IContextKeyService),
        __param(9, extensions_1.IExtensionService),
        __param(10, commands_1.ICommandService)
    ], AuxiliaryBarPart);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV4aWxpYXJ5QmFyUGFydC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3BhcnRzL2F1eGlsaWFyeWJhci9hdXhpbGlhcnlCYXJQYXJ0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUE0QnpGLElBQU0sZ0JBQWdCLEdBQXRCLE1BQU0sZ0JBQWlCLFNBQVEseUJBQWE7O2lCQUNsQywyQkFBc0IsR0FBRyxzQ0FBc0MsQUFBekMsQ0FBMEM7aUJBQ2hFLG9CQUFlLEdBQUcscUNBQXFDLEFBQXhDLENBQXlDO2lCQUN4RCxnQ0FBMkIsR0FBRywwQ0FBMEMsQUFBN0MsQ0FBOEM7UUFVekYsWUFDdUIsbUJBQXlDLEVBQzlDLGNBQStCLEVBQzNCLGtCQUF1QyxFQUNuQyxhQUFzQyxFQUMzQyxpQkFBcUMsRUFDbEMsb0JBQTJDLEVBQ25ELFlBQTJCLEVBQ2xCLHFCQUE2QyxFQUNqRCxpQkFBcUMsRUFDdEMsZ0JBQW1DLEVBQ3JDLGNBQXVDO1lBRXhELEtBQUssQ0FDSixtQkFBbUIsRUFDbkIsY0FBYyxFQUNkLGtCQUFrQixFQUNsQixhQUFhLEVBQ2IsaUJBQWlCLEVBQ2pCLG9CQUFvQixFQUNwQixZQUFZLEVBQ1oscUJBQXFCLEVBQ3JCLGlCQUFpQixFQUNqQixnQkFBZ0IsZ0VBRWhCLGtCQUFnQixDQUFDLHNCQUFzQixFQUN2QyxrQkFBZ0IsQ0FBQyxlQUFlLEVBQ2hDLGtCQUFnQixDQUFDLDJCQUEyQixFQUM1QywwQkFBdUIsQ0FBQyxTQUFTLEVBQ2pDLDJCQUFtQiw4Q0FFbkIsb0NBQXNCLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEVBQ2hELHNDQUF3QixDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxFQUNsRDtnQkFDQyxRQUFRLEVBQUUsSUFBSTtnQkFDZCxRQUFRLEVBQUUsSUFBSTtnQkFDZCxXQUFX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