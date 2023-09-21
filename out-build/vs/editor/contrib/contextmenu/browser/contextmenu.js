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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/common/actions", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/editor/browser/editorExtensions", "vs/editor/common/editorContextKeys", "vs/nls!vs/editor/contrib/contextmenu/browser/contextmenu", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/keybinding/common/keybinding", "vs/platform/configuration/common/configuration", "vs/platform/workspace/common/workspace"], function (require, exports, dom, actionViewItems_1, actions_1, lifecycle_1, platform_1, editorExtensions_1, editorContextKeys_1, nls, actions_2, contextkey_1, contextView_1, keybinding_1, configuration_1, workspace_1) {
    "use strict";
    var $X6_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$X6 = void 0;
    let $X6 = class $X6 {
        static { $X6_1 = this; }
        static { this.ID = 'editor.contrib.contextmenu'; }
        static get(editor) {
            return editor.getContribution($X6_1.ID);
        }
        constructor(editor, d, f, g, h, i, j, k) {
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            this.k = k;
            this.a = new lifecycle_1.$jc();
            this.b = 0;
            this.c = editor;
            this.a.add(this.c.onContextMenu((e) => this.l(e)));
            this.a.add(this.c.onMouseWheel((e) => {
                if (this.b > 0) {
                    const view = this.f.getContextViewElement();
                    const target = e.srcElement;
                    // Event triggers on shadow root host first
                    // Check if the context view is under this host before hiding it #103169
                    if (!(target.shadowRoot && dom.$UO(view) === target.shadowRoot)) {
                        this.f.hideContextView();
                    }
                }
            }));
            this.a.add(this.c.onKeyDown((e) => {
                if (!this.c.getOption(24 /* EditorOption.contextmenu */)) {
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
        l(e) {
            if (!this.c.hasModel()) {
                return;
            }
            if (!this.c.getOption(24 /* EditorOption.contextmenu */)) {
                this.c.focus();
                // Ensure the cursor is at the position of the mouse click
                if (e.target.position && !this.c.getSelection().containsPosition(e.target.position)) {
                    this.c.setPosition(e.target.position);
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
                return this.o(e.event);
            }
            if (e.target.type !== 6 /* MouseTargetType.CONTENT_TEXT */ && e.target.type !== 7 /* MouseTargetType.CONTENT_EMPTY */ && e.target.type !== 1 /* MouseTargetType.TEXTAREA */) {
                return; // only support mouse click into text or native context menu key for now
            }
            // Ensure the editor gets focus if it hasn't, so the right events are being sent to other contributions
            this.c.focus();
            // Ensure the cursor is at the position of the mouse click
            if (e.target.position) {
                let hasSelectionAtPosition = false;
                for (const selection of this.c.getSelections()) {
                    if (selection.containsPosition(e.target.position)) {
                        hasSelectionAtPosition = true;
                        break;
                    }
                }
                if (!hasSelectionAtPosition) {
                    this.c.setPosition(e.target.position);
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
            if (!this.c.getOption(24 /* EditorOption.contextmenu */)) {
                return; // Context menu is turned off through configuration
            }
            if (!this.c.hasModel()) {
                return;
            }
            // Find actions available for menu
            const menuActions = this.m(this.c.getModel(), this.c.isSimpleWidget ? actions_2.$Ru.SimpleEditorContext : actions_2.$Ru.EditorContext);
            // Show menu if we have actions to show
            if (menuActions.length > 0) {
                this.n(menuActions, anchor);
            }
        }
        m(model, menuId) {
            const result = [];
            // get menu groups
            const menu = this.i.createMenu(menuId, this.g);
            const groups = menu.getActions({ arg: model.uri });
            menu.dispose();
            // translate them into other actions
            for (const group of groups) {
                const [, actions] = group;
                let addedItems = 0;
                for (const action of actions) {
                    if (action instanceof actions_2.$Uu) {
                        const subActions = this.m(model, action.item.submenu);
                        if (subActions.length > 0) {
                            result.push(new actions_1.$ji(action.id, action.label, subActions));
                            addedItems++;
                        }
                    }
                    else {
                        result.push(action);
                        addedItems++;
                    }
                }
                if (addedItems) {
                    result.push(new actions_1.$ii());
                }
            }
            if (result.length) {
                result.pop(); // remove last separator
            }
            return result;
        }
        n(actions, event = null) {
            if (!this.c.hasModel()) {
                return;
            }
            // Disable hover
            const oldHoverSetting = this.c.getOption(60 /* EditorOption.hover */);
            this.c.updateOptions({
                hover: {
                    enabled: false
                }
            });
            let anchor = event;
            if (!anchor) {
                // Ensure selection is visible
                this.c.revealPosition(this.c.getPosition(), 1 /* ScrollType.Immediate */);
                this.c.render();
                const cursorCoords = this.c.getScrolledVisiblePosition(this.c.getPosition());
                // Translate to absolute editor position
                const editorCoords = dom.$FO(this.c.getDomNode());
                const posx = editorCoords.left + cursorCoords.left;
                const posy = editorCoords.top + cursorCoords.top + cursorCoords.height;
                anchor = { x: posx, y: posy };
            }
            const useShadowDOM = this.c.getOption(126 /* EditorOption.useShadowDOM */) && !platform_1.$q; // Do not use shadow dom on IOS #122035
            // Show menu
            this.b++;
            this.d.showContextMenu({
                domForShadowRoot: useShadowDOM ? this.c.getDomNode() : undefined,
                getAnchor: () => anchor,
                getActions: () => actions,
                getActionViewItem: (action) => {
                    const keybinding = this.p(action);
                    if (keybinding) {
                        return new actionViewItems_1.$NQ(action, action, { label: true, keybinding: keybinding.getLabel(), isMenu: true });
                    }
                    const customActionViewItem = action;
                    if (typeof customActionViewItem.getActionViewItem === 'function') {
                        return customActionViewItem.getActionViewItem();
                    }
                    return new actionViewItems_1.$NQ(action, action, { icon: true, label: true, isMenu: true });
                },
                getKeyBinding: (action) => {
                    return this.p(action);
                },
                onHide: (wasCancelled) => {
                    this.b--;
                    this.c.updateOptions({
                        hover: oldHoverSetting
                    });
                }
            });
        }
        o(anchor) {
            if (!this.c.hasModel()) {
                return;
            }
            if ((0, workspace_1.$5h)(this.k.getWorkspace())) {
                // can't update the configuration properly in the standalone editor
                return;
            }
            const minimapOptions = this.c.getOption(72 /* EditorOption.minimap */);
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
                return new actions_1.$ji(`menu-action-${++lastId}`, label, actions, undefined);
            };
            const createEnumAction = (label, enabled, configName, configuredValue, options) => {
                if (!enabled) {
                    return createAction({ label, enabled, run: () => { } });
                }
                const createRunner = (value) => {
                    return () => {
                        this.j.updateValue(configName, value);
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
                label: nls.localize(0, null),
                checked: minimapOptions.enabled,
                run: () => {
                    this.j.updateValue(`editor.minimap.enabled`, !minimapOptions.enabled);
                }
            }));
            actions.push(new actions_1.$ii());
            actions.push(createAction({
                label: nls.localize(1, null),
                enabled: minimapOptions.enabled,
                checked: minimapOptions.renderCharacters,
                run: () => {
                    this.j.updateValue(`editor.minimap.renderCharacters`, !minimapOptions.renderCharacters);
                }
            }));
            actions.push(createEnumAction(nls.localize(2, null), minimapOptions.enabled, 'editor.minimap.size', minimapOptions.size, [{
                    label: nls.localize(3, null),
                    value: 'proportional'
                }, {
                    label: nls.localize(4, null),
                    value: 'fill'
                }, {
                    label: nls.localize(5, null),
                    value: 'fit'
                }]));
            actions.push(createEnumAction(nls.localize(6, null), minimapOptions.enabled, 'editor.minimap.showSlider', minimapOptions.showSlider, [{
                    label: nls.localize(7, null),
                    value: 'mouseover'
                }, {
                    label: nls.localize(8, null),
                    value: 'always'
                }]));
            const useShadowDOM = this.c.getOption(126 /* EditorOption.useShadowDOM */) && !platform_1.$q; // Do not use shadow dom on IOS #122035
            this.b++;
            this.d.showContextMenu({
                domForShadowRoot: useShadowDOM ? this.c.getDomNode() : undefined,
                getAnchor: () => anchor,
                getActions: () => actions,
                onHide: (wasCancelled) => {
                    this.b--;
                    this.c.focus();
                }
            });
        }
        p(action) {
            return this.h.lookupKeybinding(action.id);
        }
        dispose() {
            if (this.b > 0) {
                this.f.hideContextView();
            }
            this.a.dispose();
        }
    };
    exports.$X6 = $X6;
    exports.$X6 = $X6 = $X6_1 = __decorate([
        __param(1, contextView_1.$WZ),
        __param(2, contextView_1.$VZ),
        __param(3, contextkey_1.$3i),
        __param(4, keybinding_1.$2D),
        __param(5, actions_2.$Su),
        __param(6, configuration_1.$8h),
        __param(7, workspace_1.$Kh)
    ], $X6);
    class ShowContextMenu extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.showContextMenu',
                label: nls.localize(9, null),
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
            $X6.get(editor)?.showContextMenu();
        }
    }
    (0, editorExtensions_1.$AV)($X6.ID, $X6, 2 /* EditorContributionInstantiation.BeforeFirstInteraction */);
    (0, editorExtensions_1.$xV)(ShowContextMenu);
});
//# sourceMappingURL=contextmenu.js.map