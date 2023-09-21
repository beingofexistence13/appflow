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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/common/actions", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/editor/browser/editorExtensions", "vs/editor/common/editorContextKeys", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/keybinding/common/keybinding", "vs/platform/configuration/common/configuration", "vs/platform/workspace/common/workspace"], function (require, exports, dom, actionViewItems_1, actions_1, lifecycle_1, platform_1, editorExtensions_1, editorContextKeys_1, nls, actions_2, contextkey_1, contextView_1, keybinding_1, configuration_1, workspace_1) {
    "use strict";
    var ContextMenuController_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ContextMenuController = void 0;
    let ContextMenuController = class ContextMenuController {
        static { ContextMenuController_1 = this; }
        static { this.ID = 'editor.contrib.contextmenu'; }
        static get(editor) {
            return editor.getContribution(ContextMenuController_1.ID);
        }
        constructor(editor, _contextMenuService, _contextViewService, _contextKeyService, _keybindingService, _menuService, _configurationService, _workspaceContextService) {
            this._contextMenuService = _contextMenuService;
            this._contextViewService = _contextViewService;
            this._contextKeyService = _contextKeyService;
            this._keybindingService = _keybindingService;
            this._menuService = _menuService;
            this._configurationService = _configurationService;
            this._workspaceContextService = _workspaceContextService;
            this._toDispose = new lifecycle_1.DisposableStore();
            this._contextMenuIsBeingShownCount = 0;
            this._editor = editor;
            this._toDispose.add(this._editor.onContextMenu((e) => this._onContextMenu(e)));
            this._toDispose.add(this._editor.onMouseWheel((e) => {
                if (this._contextMenuIsBeingShownCount > 0) {
                    const view = this._contextViewService.getContextViewElement();
                    const target = e.srcElement;
                    // Event triggers on shadow root host first
                    // Check if the context view is under this host before hiding it #103169
                    if (!(target.shadowRoot && dom.getShadowRoot(view) === target.shadowRoot)) {
                        this._contextViewService.hideContextView();
                    }
                }
            }));
            this._toDispose.add(this._editor.onKeyDown((e) => {
                if (!this._editor.getOption(24 /* EditorOption.contextmenu */)) {
                    return; // Context menu is turned off through configuration
                }
                if (e.keyCode === 58 /* KeyCode.ContextMenu */) {
                    // Chrome is funny like that
                    e.preventDefault();
                    e.stopPropagation();
                    this.showContextMenu();
                }
            }));
        }
        _onContextMenu(e) {
            if (!this._editor.hasModel()) {
                return;
            }
            if (!this._editor.getOption(24 /* EditorOption.contextmenu */)) {
                this._editor.focus();
                // Ensure the cursor is at the position of the mouse click
                if (e.target.position && !this._editor.getSelection().containsPosition(e.target.position)) {
                    this._editor.setPosition(e.target.position);
                }
                return; // Context menu is turned off through configuration
            }
            if (e.target.type === 12 /* MouseTargetType.OVERLAY_WIDGET */) {
                return; // allow native menu on widgets to support right click on input field for example in find
            }
            if (e.target.type === 6 /* MouseTargetType.CONTENT_TEXT */ && e.target.detail.injectedText) {
                return; // allow native menu on injected text
            }
            e.event.preventDefault();
            e.event.stopPropagation();
            if (e.target.type === 11 /* MouseTargetType.SCROLLBAR */) {
                return this._showScrollbarContextMenu(e.event);
            }
            if (e.target.type !== 6 /* MouseTargetType.CONTENT_TEXT */ && e.target.type !== 7 /* MouseTargetType.CONTENT_EMPTY */ && e.target.type !== 1 /* MouseTargetType.TEXTAREA */) {
                return; // only support mouse click into text or native context menu key for now
            }
            // Ensure the editor gets focus if it hasn't, so the right events are being sent to other contributions
            this._editor.focus();
            // Ensure the cursor is at the position of the mouse click
            if (e.target.position) {
                let hasSelectionAtPosition = false;
                for (const selection of this._editor.getSelections()) {
                    if (selection.containsPosition(e.target.position)) {
                        hasSelectionAtPosition = true;
                        break;
                    }
                }
                if (!hasSelectionAtPosition) {
                    this._editor.setPosition(e.target.position);
                }
            }
            // Unless the user triggerd the context menu through Shift+F10, use the mouse position as menu position
            let anchor = null;
            if (e.target.type !== 1 /* MouseTargetType.TEXTAREA */) {
                anchor = e.event;
            }
            // Show the context menu
            this.showContextMenu(anchor);
        }
        showContextMenu(anchor) {
            if (!this._editor.getOption(24 /* EditorOption.contextmenu */)) {
                return; // Context menu is turned off through configuration
            }
            if (!this._editor.hasModel()) {
                return;
            }
            // Find actions available for menu
            const menuActions = this._getMenuActions(this._editor.getModel(), this._editor.isSimpleWidget ? actions_2.MenuId.SimpleEditorContext : actions_2.MenuId.EditorContext);
            // Show menu if we have actions to show
            if (menuActions.length > 0) {
                this._doShowContextMenu(menuActions, anchor);
            }
        }
        _getMenuActions(model, menuId) {
            const result = [];
            // get menu groups
            const menu = this._menuService.createMenu(menuId, this._contextKeyService);
            const groups = menu.getActions({ arg: model.uri });
            menu.dispose();
            // translate them into other actions
            for (const group of groups) {
                const [, actions] = group;
                let addedItems = 0;
                for (const action of actions) {
                    if (action instanceof actions_2.SubmenuItemAction) {
                        const subActions = this._getMenuActions(model, action.item.submenu);
                        if (subActions.length > 0) {
                            result.push(new actions_1.SubmenuAction(action.id, action.label, subActions));
                            addedItems++;
                        }
                    }
                    else {
                        result.push(action);
                        addedItems++;
                    }
                }
                if (addedItems) {
                    result.push(new actions_1.Separator());
                }
            }
            if (result.length) {
                result.pop(); // remove last separator
            }
            return result;
        }
        _doShowContextMenu(actions, event = null) {
            if (!this._editor.hasModel()) {
                return;
            }
            // Disable hover
            const oldHoverSetting = this._editor.getOption(60 /* EditorOption.hover */);
            this._editor.updateOptions({
                hover: {
                    enabled: false
                }
            });
            let anchor = event;
            if (!anchor) {
                // Ensure selection is visible
                this._editor.revealPosition(this._editor.getPosition(), 1 /* ScrollType.Immediate */);
                this._editor.render();
                const cursorCoords = this._editor.getScrolledVisiblePosition(this._editor.getPosition());
                // Translate to absolute editor position
                const editorCoords = dom.getDomNodePagePosition(this._editor.getDomNode());
                const posx = editorCoords.left + cursorCoords.left;
                const posy = editorCoords.top + cursorCoords.top + cursorCoords.height;
                anchor = { x: posx, y: posy };
            }
            const useShadowDOM = this._editor.getOption(126 /* EditorOption.useShadowDOM */) && !platform_1.isIOS; // Do not use shadow dom on IOS #122035
            // Show menu
            this._contextMenuIsBeingShownCount++;
            this._contextMenuService.showContextMenu({
                domForShadowRoot: useShadowDOM ? this._editor.getDomNode() : undefined,
                getAnchor: () => anchor,
                getActions: () => actions,
                getActionViewItem: (action) => {
                    const keybinding = this._keybindingFor(action);
                    if (keybinding) {
                        return new actionViewItems_1.ActionViewItem(action, action, { label: true, keybinding: keybinding.getLabel(), isMenu: true });
                    }
                    const customActionViewItem = action;
                    if (typeof customActionViewItem.getActionViewItem === 'function') {
                        return customActionViewItem.getActionViewItem();
                    }
                    return new actionViewItems_1.ActionViewItem(action, action, { icon: true, label: true, isMenu: true });
                },
                getKeyBinding: (action) => {
                    return this._keybindingFor(action);
                },
                onHide: (wasCancelled) => {
                    this._contextMenuIsBeingShownCount--;
                    this._editor.updateOptions({
                        hover: oldHoverSetting
                    });
                }
            });
        }
        _showScrollbarContextMenu(anchor) {
            if (!this._editor.hasModel()) {
                return;
            }
            if ((0, workspace_1.isStandaloneEditorWorkspace)(this._workspaceContextService.getWorkspace())) {
                // can't update the configuration properly in the standalone editor
                return;
            }
            const minimapOptions = this._editor.getOption(72 /* EditorOption.minimap */);
            let lastId = 0;
            const createAction = (opts) => {
                return {
                    id: `menu-action-${++lastId}`,
                    label: opts.label,
                    tooltip: '',
                    class: undefined,
                    enabled: (typeof opts.enabled === 'undefined' ? true : opts.enabled),
                    checked: opts.checked,
                    run: opts.run
                };
            };
            const createSubmenuAction = (label, actions) => {
                return new actions_1.SubmenuAction(`menu-action-${++lastId}`, label, actions, undefined);
            };
            const createEnumAction = (label, enabled, configName, configuredValue, options) => {
                if (!enabled) {
                    return createAction({ label, enabled, run: () => { } });
                }
                const createRunner = (value) => {
                    return () => {
                        this._configurationService.updateValue(configName, value);
                    };
                };
                const actions = [];
                for (const option of options) {
                    actions.push(createAction({
                        label: option.label,
                        checked: configuredValue === option.value,
                        run: createRunner(option.value)
                    }));
                }
                return createSubmenuAction(label, actions);
            };
            const actions = [];
            actions.push(createAction({
                label: nls.localize('context.minimap.minimap', "Minimap"),
                checked: minimapOptions.enabled,
                run: () => {
                    this._configurationService.updateValue(`editor.minimap.enabled`, !minimapOptions.enabled);
                }
            }));
            actions.push(new actions_1.Separator());
            actions.push(createAction({
                label: nls.localize('context.minimap.renderCharacters', "Render Characters"),
                enabled: minimapOptions.enabled,
                checked: minimapOptions.renderCharacters,
                run: () => {
                    this._configurationService.updateValue(`editor.minimap.renderCharacters`, !minimapOptions.renderCharacters);
                }
            }));
            actions.push(createEnumAction(nls.localize('context.minimap.size', "Vertical size"), minimapOptions.enabled, 'editor.minimap.size', minimapOptions.size, [{
                    label: nls.localize('context.minimap.size.proportional', "Proportional"),
                    value: 'proportional'
                }, {
                    label: nls.localize('context.minimap.size.fill', "Fill"),
                    value: 'fill'
                }, {
                    label: nls.localize('context.minimap.size.fit', "Fit"),
                    value: 'fit'
                }]));
            actions.push(createEnumAction(nls.localize('context.minimap.slider', "Slider"), minimapOptions.enabled, 'editor.minimap.showSlider', minimapOptions.showSlider, [{
                    label: nls.localize('context.minimap.slider.mouseover', "Mouse Over"),
                    value: 'mouseover'
                }, {
                    label: nls.localize('context.minimap.slider.always', "Always"),
                    value: 'always'
                }]));
            const useShadowDOM = this._editor.getOption(126 /* EditorOption.useShadowDOM */) && !platform_1.isIOS; // Do not use shadow dom on IOS #122035
            this._contextMenuIsBeingShownCount++;
            this._contextMenuService.showContextMenu({
                domForShadowRoot: useShadowDOM ? this._editor.getDomNode() : undefined,
                getAnchor: () => anchor,
                getActions: () => actions,
                onHide: (wasCancelled) => {
                    this._contextMenuIsBeingShownCount--;
                    this._editor.focus();
                }
            });
        }
        _keybindingFor(action) {
            return this._keybindingService.lookupKeybinding(action.id);
        }
        dispose() {
            if (this._contextMenuIsBeingShownCount > 0) {
                this._contextViewService.hideContextView();
            }
            this._toDispose.dispose();
        }
    };
    exports.ContextMenuController = ContextMenuController;
    exports.ContextMenuController = ContextMenuController = ContextMenuController_1 = __decorate([
        __param(1, contextView_1.IContextMenuService),
        __param(2, contextView_1.IContextViewService),
        __param(3, contextkey_1.IContextKeyService),
        __param(4, keybinding_1.IKeybindingService),
        __param(5, actions_2.IMenuService),
        __param(6, configuration_1.IConfigurationService),
        __param(7, workspace_1.IWorkspaceContextService)
    ], ContextMenuController);
    class ShowContextMenu extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.showContextMenu',
                label: nls.localize('action.showContextMenu.label', "Show Editor Context Menu"),
                alias: 'Show Editor Context Menu',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 1024 /* KeyMod.Shift */ | 68 /* KeyCode.F10 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor, editor) {
            ContextMenuController.get(editor)?.showContextMenu();
        }
    }
    (0, editorExtensions_1.registerEditorContribution)(ContextMenuController.ID, ContextMenuController, 2 /* EditorContributionInstantiation.BeforeFirstInteraction */);
    (0, editorExtensions_1.registerEditorAction)(ShowContextMenu);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dG1lbnUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9jb250ZXh0bWVudS9icm93c2VyL2NvbnRleHRtZW51LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUEyQnpGLElBQU0scUJBQXFCLEdBQTNCLE1BQU0scUJBQXFCOztpQkFFVixPQUFFLEdBQUcsNEJBQTRCLEFBQS9CLENBQWdDO1FBRWxELE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBbUI7WUFDcEMsT0FBTyxNQUFNLENBQUMsZUFBZSxDQUF3Qix1QkFBcUIsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNoRixDQUFDO1FBTUQsWUFDQyxNQUFtQixFQUNFLG1CQUF5RCxFQUN6RCxtQkFBeUQsRUFDMUQsa0JBQXVELEVBQ3ZELGtCQUF1RCxFQUM3RCxZQUEyQyxFQUNsQyxxQkFBNkQsRUFDMUQsd0JBQW1FO1lBTnZELHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7WUFDeEMsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtZQUN6Qyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1lBQ3RDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7WUFDNUMsaUJBQVksR0FBWixZQUFZLENBQWM7WUFDakIsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQUN6Qyw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1lBWjdFLGVBQVUsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUM1QyxrQ0FBNkIsR0FBVyxDQUFDLENBQUM7WUFhakQsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7WUFFdEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFvQixFQUFFLEVBQUUsQ0FBQyxJQUFJLENB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