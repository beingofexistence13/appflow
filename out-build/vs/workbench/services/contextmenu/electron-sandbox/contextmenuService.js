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
define(["require", "exports", "vs/base/common/actions", "vs/base/browser/dom", "vs/platform/contextview/browser/contextView", "vs/platform/telemetry/common/telemetry", "vs/platform/keybinding/common/keybinding", "vs/base/browser/browser", "vs/base/common/labels", "vs/platform/notification/common/notification", "vs/base/common/functional", "vs/base/parts/contextmenu/electron-sandbox/contextmenu", "vs/platform/window/common/window", "vs/base/common/platform", "vs/platform/configuration/common/configuration", "vs/platform/contextview/browser/contextMenuService", "vs/platform/instantiation/common/extensions", "vs/base/common/iconLabels", "vs/base/common/arrays", "vs/base/common/event", "vs/base/browser/ui/contextview/contextview", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/base/common/lifecycle"], function (require, exports, actions_1, dom, contextView_1, telemetry_1, keybinding_1, browser_1, labels_1, notification_1, functional_1, contextmenu_1, window_1, platform_1, configuration_1, contextMenuService_1, extensions_1, iconLabels_1, arrays_1, event_1, contextview_1, actions_2, contextkey_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$I_b = void 0;
    let $I_b = class $I_b {
        get onDidShowContextMenu() { return this.a.onDidShowContextMenu; }
        get onDidHideContextMenu() { return this.a.onDidHideContextMenu; }
        constructor(notificationService, telemetryService, keybindingService, configurationService, contextViewService, menuService, contextKeyService) {
            // Custom context menu: Linux/Windows if custom title is enabled
            if (!platform_1.$j && (0, window_1.$UD)(configurationService) === 'custom') {
                this.a = new contextMenuService_1.$B4b(telemetryService, notificationService, contextViewService, keybindingService, menuService, contextKeyService);
            }
            // Native context menu: otherwise
            else {
                this.a = new NativeContextMenuService(notificationService, telemetryService, keybindingService, menuService, contextKeyService);
            }
        }
        dispose() {
            this.a.dispose();
        }
        showContextMenu(delegate) {
            this.a.showContextMenu(delegate);
        }
    };
    exports.$I_b = $I_b;
    exports.$I_b = $I_b = __decorate([
        __param(0, notification_1.$Yu),
        __param(1, telemetry_1.$9k),
        __param(2, keybinding_1.$2D),
        __param(3, configuration_1.$8h),
        __param(4, contextView_1.$VZ),
        __param(5, actions_2.$Su),
        __param(6, contextkey_1.$3i)
    ], $I_b);
    let NativeContextMenuService = class NativeContextMenuService extends lifecycle_1.$kc {
        constructor(c, f, g, h, j) {
            super();
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.a = this.q.add(new event_1.$fd());
            this.onDidShowContextMenu = this.a.event;
            this.b = this.q.add(new event_1.$fd());
            this.onDidHideContextMenu = this.b.event;
        }
        showContextMenu(delegate) {
            delegate = contextMenuService_1.ContextMenuMenuDelegate.transform(delegate, this.h, this.j);
            const actions = delegate.getActions();
            if (actions.length) {
                const onHide = (0, functional_1.$bb)(() => {
                    delegate.onHide?.(false);
                    dom.$xP.getInstance().resetKeyStatus();
                    this.b.fire();
                });
                const menu = this.m(delegate, actions, onHide);
                const anchor = delegate.getAnchor();
                let x;
                let y;
                let zoom = (0, browser_1.$ZN)();
                if (dom.$2O(anchor)) {
                    const elementPosition = dom.$FO(anchor);
                    // When drawing context menus, we adjust the pixel position for native menus using zoom level
                    // In areas where zoom is applied to the element or its ancestors, we need to adjust accordingly
                    // e.g. The title bar has counter zoom behavior meaning it applies the inverse of zoom level.
                    // Window Zoom Level: 1.5, Title Bar Zoom: 1/1.5, Coordinate Multiplier: 1.5 * 1.0 / 1.5 = 1.0
                    zoom *= dom.$GO(anchor);
                    // Position according to the axis alignment and the anchor alignment:
                    // `HORIZONTAL` aligns at the top left or right of the anchor and
                    //  `VERTICAL` aligns at the bottom left of the anchor.
                    if (delegate.anchorAxisAlignment === 1 /* AnchorAxisAlignment.HORIZONTAL */) {
                        if (delegate.anchorAlignment === 0 /* AnchorAlignment.LEFT */) {
                            x = elementPosition.left;
                            y = elementPosition.top;
                        }
                        else {
                            x = elementPosition.left + elementPosition.width;
                            y = elementPosition.top;
                        }
                        if (!platform_1.$j) {
                            const availableHeightForMenu = window.screen.height - y;
                            if (availableHeightForMenu < actions.length * (platform_1.$i ? 45 : 32) /* guess of 1 menu item height */) {
                                // this is a guess to detect whether the context menu would
                                // open to the bottom from this point or to the top. If the
                                // menu opens to the top, make sure to align it to the bottom
                                // of the anchor and not to the top.
                                // this seems to be only necessary for Windows and Linux.
                                y += elementPosition.height;
                            }
                        }
                    }
                    else {
                        if (delegate.anchorAlignment === 0 /* AnchorAlignment.LEFT */) {
                            x = elementPosition.left;
                            y = elementPosition.top + elementPosition.height;
                        }
                        else {
                            x = elementPosition.left + elementPosition.width;
                            y = elementPosition.top + elementPosition.height;
                        }
                    }
                    // Shift macOS menus by a few pixels below elements
                    // to account for extra padding on top of native menu
                    // https://github.com/microsoft/vscode/issues/84231
                    if (platform_1.$j) {
                        y += 4 / zoom;
                    }
                }
                else if ((0, contextview_1.$3P)(anchor)) {
                    x = anchor.x;
                    y = anchor.y;
                }
                else {
                    // We leave x/y undefined in this case which will result in
                    // Electron taking care of opening the menu at the cursor position.
                }
                if (typeof x === 'number') {
                    x = Math.floor(x * zoom);
                }
                if (typeof y === 'number') {
                    y = Math.floor(y * zoom);
                }
                (0, contextmenu_1.$WS)(menu, { x, y, positioningItem: delegate.autoSelectFirstItem ? 0 : undefined, }, () => onHide());
                this.a.fire();
            }
        }
        m(delegate, entries, onHide, submenuIds = new Set()) {
            const actionRunner = delegate.actionRunner || new actions_1.$hi();
            return (0, arrays_1.$Fb)(entries.map(entry => this.n(delegate, entry, actionRunner, onHide, submenuIds)));
        }
        n(delegate, entry, actionRunner, onHide, submenuIds) {
            // Separator
            if (entry instanceof actions_1.$ii) {
                return { type: 'separator' };
            }
            // Submenu
            if (entry instanceof actions_1.$ji) {
                if (submenuIds.has(entry.id)) {
                    console.warn(`Found submenu cycle: ${entry.id}`);
                    return undefined;
                }
                return {
                    label: (0, labels_1.$mA)((0, iconLabels_1.$Tj)(entry.label)).trim(),
                    submenu: this.m(delegate, entry.actions, onHide, new Set([...submenuIds, entry.id]))
                };
            }
            // Normal Menu Item
            else {
                let type = undefined;
                if (!!entry.checked) {
                    if (typeof delegate.getCheckedActionsRepresentation === 'function') {
                        type = delegate.getCheckedActionsRepresentation(entry);
                    }
                    else {
                        type = 'checkbox';
                    }
                }
                const item = {
                    label: (0, labels_1.$mA)((0, iconLabels_1.$Tj)(entry.label)).trim(),
                    checked: !!entry.checked,
                    type,
                    enabled: !!entry.enabled,
                    click: event => {
                        // To preserve pre-electron-2.x behaviour, we first trigger
                        // the onHide callback and then the action.
                        // Fixes https://github.com/microsoft/vscode/issues/45601
                        onHide();
                        // Run action which will close the menu
                        this.r(actionRunner, entry, delegate, event);
                    }
                };
                const keybinding = !!delegate.getKeyBinding ? delegate.getKeyBinding(entry) : this.g.lookupKeybinding(entry.id);
                if (keybinding) {
                    const electronAccelerator = keybinding.getElectronAccelerator();
                    if (electronAccelerator) {
                        item.accelerator = electronAccelerator;
                    }
                    else {
                        const label = keybinding.getLabel();
                        if (label) {
                            item.label = `${item.label} [${label}]`;
                        }
                    }
                }
                return item;
            }
        }
        async r(actionRunner, actionToRun, delegate, event) {
            if (!delegate.skipTelemetry) {
                this.f.publicLog2('workbenchActionExecuted', { id: actionToRun.id, from: 'contextMenu' });
            }
            const context = delegate.getActionsContext ? delegate.getActionsContext(event) : undefined;
            const runnable = actionRunner.run(actionToRun, context);
            try {
                await runnable;
            }
            catch (error) {
                this.c.error(error);
            }
        }
    };
    NativeContextMenuService = __decorate([
        __param(0, notification_1.$Yu),
        __param(1, telemetry_1.$9k),
        __param(2, keybinding_1.$2D),
        __param(3, actions_2.$Su),
        __param(4, contextkey_1.$3i)
    ], NativeContextMenuService);
    (0, extensions_1.$mr)(contextView_1.$WZ, $I_b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=contextmenuService.js.map