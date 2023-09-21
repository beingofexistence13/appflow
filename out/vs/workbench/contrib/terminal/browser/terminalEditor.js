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
define(["require", "exports", "vs/base/browser/dom", "vs/platform/actions/browser/dropdownWithPrimaryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/editor/editorPane", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/browser/terminalMenus", "vs/workbench/contrib/terminal/common/terminal", "vs/base/common/platform", "vs/base/browser/canIUse", "vs/platform/notification/common/notification", "vs/workbench/contrib/terminal/browser/terminalContextMenu", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/layout/browser/layoutService"], function (require, exports, dom, dropdownWithPrimaryActionViewItem_1, actions_1, contextkey_1, contextView_1, instantiation_1, storage_1, telemetry_1, themeService_1, editorPane_1, terminal_1, terminalMenus_1, terminal_2, platform_1, canIUse_1, notification_1, terminalContextMenu_1, editorService_1, layoutService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalEditor = void 0;
    let TerminalEditor = class TerminalEditor extends editorPane_1.EditorPane {
        constructor(telemetryService, themeService, storageService, _terminalEditorService, _terminalProfileResolverService, _terminalService, contextKeyService, menuService, _instantiationService, _contextMenuService, _notificationService, _terminalProfileService, _workbenchLayoutService) {
            super(terminal_1.terminalEditorId, telemetryService, themeService, storageService);
            this._terminalEditorService = _terminalEditorService;
            this._terminalProfileResolverService = _terminalProfileResolverService;
            this._terminalService = _terminalService;
            this._instantiationService = _instantiationService;
            this._contextMenuService = _contextMenuService;
            this._notificationService = _notificationService;
            this._terminalProfileService = _terminalProfileService;
            this._workbenchLayoutService = _workbenchLayoutService;
            this._editorInput = undefined;
            this._cancelContextMenu = false;
            this._dropdownMenu = this._register(menuService.createMenu(actions_1.MenuId.TerminalNewDropdownContext, contextKeyService));
            this._instanceMenu = this._register(menuService.createMenu(actions_1.MenuId.TerminalInstanceContext, contextKeyService));
        }
        async setInput(newInput, options, context, token) {
            this._editorInput?.terminalInstance?.detachFromElement();
            this._editorInput = newInput;
            await super.setInput(newInput, options, context, token);
            this._editorInput.terminalInstance?.attachToElement(this._overflowGuardElement);
            if (this._lastDimension) {
                this.layout(this._lastDimension);
            }
            this._editorInput.terminalInstance?.setVisible(this.isVisible() && this._workbenchLayoutService.isVisible("workbench.parts.editor" /* Parts.EDITOR_PART */));
            if (this._editorInput.terminalInstance) {
                // since the editor does not monitor focus changes, for ex. between the terminal
                // panel and the editors, this is needed so that the active instance gets set
                // when focus changes between them.
                this._register(this._editorInput.terminalInstance.onDidFocus(() => this._setActiveInstance()));
                this._editorInput.setCopyLaunchConfig(this._editorInput.terminalInstance.shellLaunchConfig);
            }
        }
        clearInput() {
            super.clearInput();
            this._editorInput?.terminalInstance?.detachFromElement();
            this._editorInput = undefined;
        }
        _setActiveInstance() {
            if (!this._editorInput?.terminalInstance) {
                return;
            }
            this._terminalEditorService.setActiveInstance(this._editorInput.terminalInstance);
        }
        focus() {
            this._editorInput?.terminalInstance?.focus();
        }
        // eslint-disable-next-line @typescript-eslint/naming-convention
        createEditor(parent) {
            this._editorInstanceElement = parent;
            this._overflowGuardElement = dom.$('.terminal-overflow-guard.terminal-editor');
            this._editorInstanceElement.appendChild(this._overflowGuardElement);
            this._registerListeners();
        }
        _registerListeners() {
            if (!this._editorInstanceElement) {
                return;
            }
            this._register(dom.addDisposableListener(this._editorInstanceElement, 'mousedown', async (event) => {
                if (this._terminalEditorService.instances.length === 0) {
                    return;
                }
                if (event.which === 2 && platform_1.isLinux) {
                    // Drop selection and focus terminal on Linux to enable middle button paste when click
                    // occurs on the selection itself.
                    const terminal = this._terminalEditorService.activeInstance;
                    terminal?.focus();
                }
                else if (event.which === 3) {
                    const rightClickBehavior = this._terminalService.configHelper.config.rightClickBehavior;
                    if (rightClickBehavior === 'nothing') {
                        if (!event.shiftKey) {
                            this._cancelContextMenu = true;
                        }
                        return;
                    }
                    else if (rightClickBehavior === 'copyPaste' || rightClickBehavior === 'paste') {
                        const terminal = this._terminalEditorService.activeInstance;
                        if (!terminal) {
                            return;
                        }
                        // copyPaste: Shift+right click should open context menu
                        if (rightClickBehavior === 'copyPaste' && event.shiftKey) {
                            (0, terminalContextMenu_1.openContextMenu)(event, this._editorInput?.terminalInstance, this._instanceMenu, this._contextMenuService);
                            return;
                        }
                        if (rightClickBehavior === 'copyPaste' && terminal.hasSelection()) {
                            await terminal.copySelection();
                            terminal.clearSelection();
                        }
                        else {
                            if (canIUse_1.BrowserFeatures.clipboard.readText) {
                                terminal.paste();
                            }
                            else {
                                this._notificationService.info(`This browser doesn't support the clipboard.readText API needed to trigger a paste, try ${platform_1.isMacintosh ? '⌘' : 'Ctrl'}+V instead.`);
                            }
                        }
                        // Clear selection after all click event bubbling is finished on Mac to prevent
                        // right-click selecting a word which is seemed cannot be disabled. There is a
                        // flicker when pasting but this appears to give the best experience if the
                        // setting is enabled.
                        if (platform_1.isMacintosh) {
                            setTimeout(() => {
                                terminal.clearSelection();
                            }, 0);
                        }
                        this._cancelContextMenu = true;
                    }
                }
            }));
            this._register(dom.addDisposableListener(this._editorInstanceElement, 'contextmenu', (event) => {
                const rightClickBehavior = this._terminalService.configHelper.config.rightClickBehavior;
                if (rightClickBehavior === 'nothing' && !event.shiftKey) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    this._cancelContextMenu = false;
                    return;
                }
                else if (!this._cancelContextMenu && rightClickBehavior !== 'copyPaste' && rightClickBehavior !== 'paste') {
                    if (!this._cancelContextMenu) {
                        (0, terminalContextMenu_1.openContextMenu)(event, this._editorInput?.terminalInstance, this._instanceMenu, this._contextMenuService);
                    }
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    this._cancelContextMenu = false;
                }
            }));
        }
        layout(dimension) {
            this._editorInput?.terminalInstance?.layout(dimension);
            this._lastDimension = dimension;
        }
        setVisible(visible, group) {
            super.setVisible(visible, group);
            this._editorInput?.terminalInstance?.setVisible(visible && this._workbenchLayoutService.isVisible("workbench.parts.editor" /* Parts.EDITOR_PART */));
        }
        getActionViewItem(action) {
            switch (action.id) {
                case "workbench.action.createTerminalEditor" /* TerminalCommandId.CreateTerminalEditor */: {
                    if (action instanceof actions_1.MenuItemAction) {
                        const location = { viewColumn: editorService_1.ACTIVE_GROUP };
                        const actions = (0, terminalMenus_1.getTerminalActionBarArgs)(location, this._terminalProfileService.availableProfiles, this._getDefaultProfileName(), this._terminalProfileService.contributedProfiles, this._terminalService, this._dropdownMenu);
                        const button = this._instantiationService.createInstance(dropdownWithPrimaryActionViewItem_1.DropdownWithPrimaryActionViewItem, action, actions.dropdownAction, actions.dropdownMenuActions, actions.className, this._contextMenuService, {});
                        return button;
                    }
                }
            }
            return super.getActionViewItem(action);
        }
        _getDefaultProfileName() {
            let defaultProfileName;
            try {
                defaultProfileName = this._terminalProfileService.getDefaultProfileName();
            }
            catch (e) {
                defaultProfileName = this._terminalProfileResolverService.defaultProfileName;
            }
            return defaultProfileName;
        }
    };
    exports.TerminalEditor = TerminalEditor;
    exports.TerminalEditor = TerminalEditor = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, themeService_1.IThemeService),
        __param(2, storage_1.IStorageService),
        __param(3, terminal_1.ITerminalEditorService),
        __param(4, terminal_2.ITerminalProfileResolverService),
        __param(5, terminal_1.ITerminalService),
        __param(6, contextkey_1.IContextKeyService),
        __param(7, actions_1.IMenuService),
        __param(8, instantiation_1.IInstantiationService),
        __param(9, contextView_1.IContextMenuService),
        __param(10, notification_1.INotificationService),
        __param(11, terminal_2.ITerminalProfileService),
        __param(12, layoutService_1.IWorkbenchLayoutService)
    ], TerminalEditor);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxFZGl0b3IuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbC9icm93c2VyL3Rlcm1pbmFsRWRpdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQTZCekYsSUFBTSxjQUFjLEdBQXBCLE1BQU0sY0FBZSxTQUFRLHVCQUFVO1FBZTdDLFlBQ29CLGdCQUFtQyxFQUN2QyxZQUEyQixFQUN6QixjQUErQixFQUN4QixzQkFBK0QsRUFDdEQsK0JBQWlGLEVBQ2hHLGdCQUFtRCxFQUNqRCxpQkFBcUMsRUFDM0MsV0FBeUIsRUFDaEIscUJBQTZELEVBQy9ELG1CQUF5RCxFQUN4RCxvQkFBMkQsRUFDeEQsdUJBQWlFLEVBQ2pFLHVCQUFpRTtZQUUxRixLQUFLLENBQUMsMkJBQWdCLEVBQUUsZ0JBQWdCLEVBQUUsWUFBWSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBWC9CLDJCQUFzQixHQUF0QixzQkFBc0IsQ0FBd0I7WUFDckMsb0NBQStCLEdBQS9CLCtCQUErQixDQUFpQztZQUMvRSxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1lBRzdCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFDOUMsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtZQUN2Qyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO1lBQ3ZDLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBeUI7WUFDaEQsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUF5QjtZQXZCbkYsaUJBQVksR0FBeUIsU0FBUyxDQUFDO1lBUS9DLHVCQUFrQixHQUFZLEtBQUssQ0FBQztZQWtCM0MsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsZ0JBQU0sQ0FBQywwQkFBMEIsRUFBRSxpQkFBaUIsQ0FB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