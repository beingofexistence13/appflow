/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/nls!vs/workbench/electron-sandbox/actions/windowActions", "vs/platform/window/electron-sandbox/window", "vs/platform/keybinding/common/keybinding", "vs/base/browser/browser", "vs/platform/files/common/files", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/platform/quickinput/common/quickInput", "vs/editor/common/services/getIconClasses", "vs/platform/configuration/common/configuration", "vs/platform/native/common/native", "vs/base/common/codicons", "vs/base/common/themables", "vs/platform/workspace/common/workspace", "vs/platform/actions/common/actions", "vs/platform/action/common/actionCommonCategories", "vs/base/common/platform", "vs/css!./media/actions"], function (require, exports, uri_1, nls_1, window_1, keybinding_1, browser_1, files_1, model_1, language_1, quickInput_1, getIconClasses_1, configuration_1, native_1, codicons_1, themables_1, workspace_1, actions_1, actionCommonCategories_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$s_b = exports.$r_b = exports.$q_b = exports.$p_b = exports.$o_b = exports.$n_b = exports.$m_b = exports.$l_b = exports.$k_b = exports.$j_b = exports.$i_b = exports.$h_b = void 0;
    class $h_b extends actions_1.$Wu {
        static { this.ID = 'workbench.action.closeWindow'; }
        constructor() {
            super({
                id: $h_b.ID,
                title: {
                    value: (0, nls_1.localize)(0, null),
                    mnemonicTitle: (0, nls_1.localize)(1, null),
                    original: 'Close Window'
                },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 53 /* KeyCode.KeyW */ },
                    linux: { primary: 512 /* KeyMod.Alt */ | 62 /* KeyCode.F4 */, secondary: [2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 53 /* KeyCode.KeyW */] },
                    win: { primary: 512 /* KeyMod.Alt */ | 62 /* KeyCode.F4 */, secondary: [2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 53 /* KeyCode.KeyW */] }
                },
                menu: {
                    id: actions_1.$Ru.MenubarFileMenu,
                    group: '6_close',
                    order: 4
                }
            });
        }
        async run(accessor) {
            const nativeHostService = accessor.get(native_1.$05b);
            return nativeHostService.closeWindow();
        }
    }
    exports.$h_b = $h_b;
    class BaseZoomAction extends actions_1.$Wu {
        static { this.a = 'window.zoomLevel'; }
        static { this.b = 8; }
        static { this.c = -8; }
        constructor(desc) {
            super(desc);
        }
        async d(accessor, level) {
            const configurationService = accessor.get(configuration_1.$8h);
            level = Math.round(level); // when reaching smallest zoom, prevent fractional zoom levels
            if (level > BaseZoomAction.b || level < BaseZoomAction.c) {
                return; // https://github.com/microsoft/vscode/issues/48357
            }
            await configurationService.updateValue(BaseZoomAction.a, level);
            (0, window_1.$t7b)(level);
        }
    }
    class $i_b extends BaseZoomAction {
        constructor() {
            super({
                id: 'workbench.action.zoomIn',
                title: {
                    value: (0, nls_1.localize)(2, null),
                    mnemonicTitle: (0, nls_1.localize)(3, null),
                    original: 'Zoom In'
                },
                category: actionCommonCategories_1.$Nl.View,
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 86 /* KeyCode.Equal */,
                    secondary: [2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 86 /* KeyCode.Equal */, 2048 /* KeyMod.CtrlCmd */ | 109 /* KeyCode.NumpadAdd */]
                },
                menu: {
                    id: actions_1.$Ru.MenubarAppearanceMenu,
                    group: '5_zoom',
                    order: 1
                }
            });
        }
        run(accessor) {
            return super.d(accessor, (0, browser_1.$YN)() + 1);
        }
    }
    exports.$i_b = $i_b;
    class $j_b extends BaseZoomAction {
        constructor() {
            super({
                id: 'workbench.action.zoomOut',
                title: {
                    value: (0, nls_1.localize)(4, null),
                    mnemonicTitle: (0, nls_1.localize)(5, null),
                    original: 'Zoom Out'
                },
                category: actionCommonCategories_1.$Nl.View,
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 88 /* KeyCode.Minus */,
                    secondary: [2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 88 /* KeyCode.Minus */, 2048 /* KeyMod.CtrlCmd */ | 111 /* KeyCode.NumpadSubtract */],
                    linux: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 88 /* KeyCode.Minus */,
                        secondary: [2048 /* KeyMod.CtrlCmd */ | 111 /* KeyCode.NumpadSubtract */]
                    }
                },
                menu: {
                    id: actions_1.$Ru.MenubarAppearanceMenu,
                    group: '5_zoom',
                    order: 2
                }
            });
        }
        run(accessor) {
            return super.d(accessor, (0, browser_1.$YN)() - 1);
        }
    }
    exports.$j_b = $j_b;
    class $k_b extends BaseZoomAction {
        constructor() {
            super({
                id: 'workbench.action.zoomReset',
                title: {
                    value: (0, nls_1.localize)(6, null),
                    mnemonicTitle: (0, nls_1.localize)(7, null),
                    original: 'Reset Zoom'
                },
                category: actionCommonCategories_1.$Nl.View,
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 98 /* KeyCode.Numpad0 */
                },
                menu: {
                    id: actions_1.$Ru.MenubarAppearanceMenu,
                    group: '5_zoom',
                    order: 3
                }
            });
        }
        run(accessor) {
            return super.d(accessor, 0);
        }
    }
    exports.$k_b = $k_b;
    class BaseSwitchWindow extends actions_1.$Wu {
        constructor(desc) {
            super(desc);
            this.a = {
                iconClass: themables_1.ThemeIcon.asClassName(codicons_1.$Pj.removeClose),
                tooltip: (0, nls_1.localize)(8, null)
            };
            this.b = {
                iconClass: 'dirty-window ' + codicons_1.$Pj.closeDirty,
                tooltip: (0, nls_1.localize)(9, null),
                alwaysVisible: true
            };
        }
        async run(accessor) {
            const quickInputService = accessor.get(quickInput_1.$Gq);
            const keybindingService = accessor.get(keybinding_1.$2D);
            const modelService = accessor.get(model_1.$yA);
            const languageService = accessor.get(language_1.$ct);
            const nativeHostService = accessor.get(native_1.$05b);
            const currentWindowId = nativeHostService.windowId;
            const windows = await nativeHostService.getWindows();
            const placeHolder = (0, nls_1.localize)(10, null);
            const picks = windows.map(window => {
                const resource = window.filename ? uri_1.URI.file(window.filename) : (0, workspace_1.$Lh)(window.workspace) ? window.workspace.uri : (0, workspace_1.$Qh)(window.workspace) ? window.workspace.configPath : undefined;
                const fileKind = window.filename ? files_1.FileKind.FILE : (0, workspace_1.$Lh)(window.workspace) ? files_1.FileKind.FOLDER : (0, workspace_1.$Qh)(window.workspace) ? files_1.FileKind.ROOT_FOLDER : files_1.FileKind.FILE;
                return {
                    payload: window.id,
                    label: window.title,
                    ariaLabel: window.dirty ? (0, nls_1.localize)(11, null, window.title) : window.title,
                    iconClasses: (0, getIconClasses_1.$x6)(modelService, languageService, resource, fileKind),
                    description: (currentWindowId === window.id) ? (0, nls_1.localize)(12, null) : undefined,
                    buttons: currentWindowId !== window.id ? window.dirty ? [this.b] : [this.a] : undefined
                };
            });
            const autoFocusIndex = (picks.indexOf(picks.filter(pick => pick.payload === currentWindowId)[0]) + 1) % picks.length;
            const pick = await quickInputService.pick(picks, {
                contextKey: 'inWindowsPicker',
                activeItem: picks[autoFocusIndex],
                placeHolder,
                quickNavigate: this.c() ? { keybindings: keybindingService.lookupKeybindings(this.desc.id) } : undefined,
                hideInput: this.c(),
                onDidTriggerItemButton: async (context) => {
                    await nativeHostService.closeWindowById(context.item.payload);
                    context.removeItem();
                }
            });
            if (pick) {
                nativeHostService.focusWindow({ windowId: pick.payload });
            }
        }
    }
    class $l_b extends BaseSwitchWindow {
        constructor() {
            super({
                id: 'workbench.action.switchWindow',
                title: { value: (0, nls_1.localize)(13, null), original: 'Switch Window...' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 0,
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 53 /* KeyCode.KeyW */ }
                }
            });
        }
        c() {
            return false;
        }
    }
    exports.$l_b = $l_b;
    class $m_b extends BaseSwitchWindow {
        constructor() {
            super({
                id: 'workbench.action.quickSwitchWindow',
                title: { value: (0, nls_1.localize)(14, null), original: 'Quick Switch Window...' },
                f1: false // hide quick pickers from command palette to not confuse with the other entry that shows a input field
            });
        }
        c() {
            return true;
        }
    }
    exports.$m_b = $m_b;
    function canRunNativeTabsHandler(accessor) {
        if (!platform_1.$j) {
            return false;
        }
        const configurationService = accessor.get(configuration_1.$8h);
        return configurationService.getValue('window.nativeTabs') === true;
    }
    const $n_b = function (accessor) {
        if (!canRunNativeTabsHandler(accessor)) {
            return;
        }
        return accessor.get(native_1.$05b).newWindowTab();
    };
    exports.$n_b = $n_b;
    const $o_b = function (accessor) {
        if (!canRunNativeTabsHandler(accessor)) {
            return;
        }
        return accessor.get(native_1.$05b).showPreviousWindowTab();
    };
    exports.$o_b = $o_b;
    const $p_b = function (accessor) {
        if (!canRunNativeTabsHandler(accessor)) {
            return;
        }
        return accessor.get(native_1.$05b).showNextWindowTab();
    };
    exports.$p_b = $p_b;
    const $q_b = function (accessor) {
        if (!canRunNativeTabsHandler(accessor)) {
            return;
        }
        return accessor.get(native_1.$05b).moveWindowTabToNewWindow();
    };
    exports.$q_b = $q_b;
    const $r_b = function (accessor) {
        if (!canRunNativeTabsHandler(accessor)) {
            return;
        }
        return accessor.get(native_1.$05b).mergeAllWindowTabs();
    };
    exports.$r_b = $r_b;
    const $s_b = function (accessor) {
        if (!canRunNativeTabsHandler(accessor)) {
            return;
        }
        return accessor.get(native_1.$05b).toggleWindowTabsBar();
    };
    exports.$s_b = $s_b;
});
//# sourceMappingURL=windowActions.js.map