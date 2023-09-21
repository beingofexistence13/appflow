/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/nls", "vs/platform/window/electron-sandbox/window", "vs/platform/keybinding/common/keybinding", "vs/base/browser/browser", "vs/platform/files/common/files", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/platform/quickinput/common/quickInput", "vs/editor/common/services/getIconClasses", "vs/platform/configuration/common/configuration", "vs/platform/native/common/native", "vs/base/common/codicons", "vs/base/common/themables", "vs/platform/workspace/common/workspace", "vs/platform/actions/common/actions", "vs/platform/action/common/actionCommonCategories", "vs/base/common/platform", "vs/css!./media/actions"], function (require, exports, uri_1, nls_1, window_1, keybinding_1, browser_1, files_1, model_1, language_1, quickInput_1, getIconClasses_1, configuration_1, native_1, codicons_1, themables_1, workspace_1, actions_1, actionCommonCategories_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ToggleWindowTabsBarHandler = exports.MergeWindowTabsHandlerHandler = exports.MoveWindowTabToNewWindowHandler = exports.ShowNextWindowTabHandler = exports.ShowPreviousWindowTabHandler = exports.NewWindowTabHandler = exports.QuickSwitchWindowAction = exports.SwitchWindowAction = exports.ZoomResetAction = exports.ZoomOutAction = exports.ZoomInAction = exports.CloseWindowAction = void 0;
    class CloseWindowAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.closeWindow'; }
        constructor() {
            super({
                id: CloseWindowAction.ID,
                title: {
                    value: (0, nls_1.localize)('closeWindow', "Close Window"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miCloseWindow', comment: ['&& denotes a mnemonic'] }, "Clos&&e Window"),
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
                    id: actions_1.MenuId.MenubarFileMenu,
                    group: '6_close',
                    order: 4
                }
            });
        }
        async run(accessor) {
            const nativeHostService = accessor.get(native_1.INativeHostService);
            return nativeHostService.closeWindow();
        }
    }
    exports.CloseWindowAction = CloseWindowAction;
    class BaseZoomAction extends actions_1.Action2 {
        static { this.SETTING_KEY = 'window.zoomLevel'; }
        static { this.MAX_ZOOM_LEVEL = 8; }
        static { this.MIN_ZOOM_LEVEL = -8; }
        constructor(desc) {
            super(desc);
        }
        async setConfiguredZoomLevel(accessor, level) {
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            level = Math.round(level); // when reaching smallest zoom, prevent fractional zoom levels
            if (level > BaseZoomAction.MAX_ZOOM_LEVEL || level < BaseZoomAction.MIN_ZOOM_LEVEL) {
                return; // https://github.com/microsoft/vscode/issues/48357
            }
            await configurationService.updateValue(BaseZoomAction.SETTING_KEY, level);
            (0, window_1.applyZoom)(level);
        }
    }
    class ZoomInAction extends BaseZoomAction {
        constructor() {
            super({
                id: 'workbench.action.zoomIn',
                title: {
                    value: (0, nls_1.localize)('zoomIn', "Zoom In"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miZoomIn', comment: ['&& denotes a mnemonic'] }, "&&Zoom In"),
                    original: 'Zoom In'
                },
                category: actionCommonCategories_1.Categories.View,
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 86 /* KeyCode.Equal */,
                    secondary: [2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 86 /* KeyCode.Equal */, 2048 /* KeyMod.CtrlCmd */ | 109 /* KeyCode.NumpadAdd */]
                },
                menu: {
                    id: actions_1.MenuId.MenubarAppearanceMenu,
                    group: '5_zoom',
                    order: 1
                }
            });
        }
        run(accessor) {
            return super.setConfiguredZoomLevel(accessor, (0, browser_1.getZoomLevel)() + 1);
        }
    }
    exports.ZoomInAction = ZoomInAction;
    class ZoomOutAction extends BaseZoomAction {
        constructor() {
            super({
                id: 'workbench.action.zoomOut',
                title: {
                    value: (0, nls_1.localize)('zoomOut', "Zoom Out"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miZoomOut', comment: ['&& denotes a mnemonic'] }, "&&Zoom Out"),
                    original: 'Zoom Out'
                },
                category: actionCommonCategories_1.Categories.View,
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
                    id: actions_1.MenuId.MenubarAppearanceMenu,
                    group: '5_zoom',
                    order: 2
                }
            });
        }
        run(accessor) {
            return super.setConfiguredZoomLevel(accessor, (0, browser_1.getZoomLevel)() - 1);
        }
    }
    exports.ZoomOutAction = ZoomOutAction;
    class ZoomResetAction extends BaseZoomAction {
        constructor() {
            super({
                id: 'workbench.action.zoomReset',
                title: {
                    value: (0, nls_1.localize)('zoomReset', "Reset Zoom"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miZoomReset', comment: ['&& denotes a mnemonic'] }, "&&Reset Zoom"),
                    original: 'Reset Zoom'
                },
                category: actionCommonCategories_1.Categories.View,
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 98 /* KeyCode.Numpad0 */
                },
                menu: {
                    id: actions_1.MenuId.MenubarAppearanceMenu,
                    group: '5_zoom',
                    order: 3
                }
            });
        }
        run(accessor) {
            return super.setConfiguredZoomLevel(accessor, 0);
        }
    }
    exports.ZoomResetAction = ZoomResetAction;
    class BaseSwitchWindow extends actions_1.Action2 {
        constructor(desc) {
            super(desc);
            this.closeWindowAction = {
                iconClass: themables_1.ThemeIcon.asClassName(codicons_1.Codicon.removeClose),
                tooltip: (0, nls_1.localize)('close', "Close Window")
            };
            this.closeDirtyWindowAction = {
                iconClass: 'dirty-window ' + codicons_1.Codicon.closeDirty,
                tooltip: (0, nls_1.localize)('close', "Close Window"),
                alwaysVisible: true
            };
        }
        async run(accessor) {
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const keybindingService = accessor.get(keybinding_1.IKeybindingService);
            const modelService = accessor.get(model_1.IModelService);
            const languageService = accessor.get(language_1.ILanguageService);
            const nativeHostService = accessor.get(native_1.INativeHostService);
            const currentWindowId = nativeHostService.windowId;
            const windows = await nativeHostService.getWindows();
            const placeHolder = (0, nls_1.localize)('switchWindowPlaceHolder', "Select a window to switch to");
            const picks = windows.map(window => {
                const resource = window.filename ? uri_1.URI.file(window.filename) : (0, workspace_1.isSingleFolderWorkspaceIdentifier)(window.workspace) ? window.workspace.uri : (0, workspace_1.isWorkspaceIdentifier)(window.workspace) ? window.workspace.configPath : undefined;
                const fileKind = window.filename ? files_1.FileKind.FILE : (0, workspace_1.isSingleFolderWorkspaceIdentifier)(window.workspace) ? files_1.FileKind.FOLDER : (0, workspace_1.isWorkspaceIdentifier)(window.workspace) ? files_1.FileKind.ROOT_FOLDER : files_1.FileKind.FILE;
                return {
                    payload: window.id,
                    label: window.title,
                    ariaLabel: window.dirty ? (0, nls_1.localize)('windowDirtyAriaLabel', "{0}, window with unsaved changes", window.title) : window.title,
                    iconClasses: (0, getIconClasses_1.getIconClasses)(modelService, languageService, resource, fileKind),
                    description: (currentWindowId === window.id) ? (0, nls_1.localize)('current', "Current Window") : undefined,
                    buttons: currentWindowId !== window.id ? window.dirty ? [this.closeDirtyWindowAction] : [this.closeWindowAction] : undefined
                };
            });
            const autoFocusIndex = (picks.indexOf(picks.filter(pick => pick.payload === currentWindowId)[0]) + 1) % picks.length;
            const pick = await quickInputService.pick(picks, {
                contextKey: 'inWindowsPicker',
                activeItem: picks[autoFocusIndex],
                placeHolder,
                quickNavigate: this.isQuickNavigate() ? { keybindings: keybindingService.lookupKeybindings(this.desc.id) } : undefined,
                hideInput: this.isQuickNavigate(),
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
    class SwitchWindowAction extends BaseSwitchWindow {
        constructor() {
            super({
                id: 'workbench.action.switchWindow',
                title: { value: (0, nls_1.localize)('switchWindow', "Switch Window..."), original: 'Switch Window...' },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 0,
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 53 /* KeyCode.KeyW */ }
                }
            });
        }
        isQuickNavigate() {
            return false;
        }
    }
    exports.SwitchWindowAction = SwitchWindowAction;
    class QuickSwitchWindowAction extends BaseSwitchWindow {
        constructor() {
            super({
                id: 'workbench.action.quickSwitchWindow',
                title: { value: (0, nls_1.localize)('quickSwitchWindow', "Quick Switch Window..."), original: 'Quick Switch Window...' },
                f1: false // hide quick pickers from command palette to not confuse with the other entry that shows a input field
            });
        }
        isQuickNavigate() {
            return true;
        }
    }
    exports.QuickSwitchWindowAction = QuickSwitchWindowAction;
    function canRunNativeTabsHandler(accessor) {
        if (!platform_1.isMacintosh) {
            return false;
        }
        const configurationService = accessor.get(configuration_1.IConfigurationService);
        return configurationService.getValue('window.nativeTabs') === true;
    }
    const NewWindowTabHandler = function (accessor) {
        if (!canRunNativeTabsHandler(accessor)) {
            return;
        }
        return accessor.get(native_1.INativeHostService).newWindowTab();
    };
    exports.NewWindowTabHandler = NewWindowTabHandler;
    const ShowPreviousWindowTabHandler = function (accessor) {
        if (!canRunNativeTabsHandler(accessor)) {
            return;
        }
        return accessor.get(native_1.INativeHostService).showPreviousWindowTab();
    };
    exports.ShowPreviousWindowTabHandler = ShowPreviousWindowTabHandler;
    const ShowNextWindowTabHandler = function (accessor) {
        if (!canRunNativeTabsHandler(accessor)) {
            return;
        }
        return accessor.get(native_1.INativeHostService).showNextWindowTab();
    };
    exports.ShowNextWindowTabHandler = ShowNextWindowTabHandler;
    const MoveWindowTabToNewWindowHandler = function (accessor) {
        if (!canRunNativeTabsHandler(accessor)) {
            return;
        }
        return accessor.get(native_1.INativeHostService).moveWindowTabToNewWindow();
    };
    exports.MoveWindowTabToNewWindowHandler = MoveWindowTabToNewWindowHandler;
    const MergeWindowTabsHandlerHandler = function (accessor) {
        if (!canRunNativeTabsHandler(accessor)) {
            return;
        }
        return accessor.get(native_1.INativeHostService).mergeAllWindowTabs();
    };
    exports.MergeWindowTabsHandlerHandler = MergeWindowTabsHandlerHandler;
    const ToggleWindowTabsBarHandler = function (accessor) {
        if (!canRunNativeTabsHandler(accessor)) {
            return;
        }
        return accessor.get(native_1.INativeHostService).toggleWindowTabsBar();
    };
    exports.ToggleWindowTabsBarHandler = ToggleWindowTabsBarHandler;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93QWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9lbGVjdHJvbi1zYW5kYm94L2FjdGlvbnMvd2luZG93QWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUEwQmhHLE1BQWEsaUJBQWtCLFNBQVEsaUJBQU87aUJBRTdCLE9BQUUsR0FBRyw4QkFBOEIsQ0FBQztRQUVwRDtZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsaUJBQWlCLENBQUMsRUFBRTtnQkFDeEIsS0FBSyxFQUFFO29CQUNOLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxhQUFhLEVBQUUsY0FBYyxDQUFDO29CQUM5QyxhQUFhLEVBQUUsSUFBQSxjQUFRLEVBQUMsRUFBRSxHQUFHLEVBQUUsZUFBZSxFQUFFLE9BQU8sRUFBRSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsRUFBRSxnQkFBZ0IsQ0FBQztvQkFDdkcsUUFBUSxFQUFFLGNBQWM7aUJBQ3hCO2dCQUNELEVBQUUsRUFBRSxJQUFJO2dCQUNSLFVBQVUsRUFBRTtvQkFDWCxNQUFNLDZDQUFtQztvQkFDekMsR0FBRyxFQUFFLEVBQUUsT0FBTyxFQUFFLG1EQUE2Qix3QkFBZSxFQUFFO29CQUM5RCxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsMENBQXVCLEVBQUUsU0FBUyxFQUFFLENBQUMsbURBQTZCLHdCQUFlLENBQUMsRUFBRTtvQkFDdEcsR0FBRyxFQUFFLEVBQUUsT0FBTyxFQUFFLDBDQUF1QixFQUFFLFNBQVMsRUFBRSxDQUFDLG1EQUE2Qix3QkFBZSxDQUFDLEVBQUU7aUJBQ3BHO2dCQUNELElBQUksRUFBRTtvQkFDTCxFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxlQUFlO29CQUMxQixLQUFLLEVBQUUsU0FBUztvQkFDaEIsS0FBSyxFQUFFLENBQUM7aUJBQ1I7YUFDRCxDQUFDLENBQUM7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