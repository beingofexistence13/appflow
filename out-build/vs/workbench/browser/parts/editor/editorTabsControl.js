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
define(["require", "exports", "vs/nls!vs/workbench/browser/parts/editor/editorTabsControl", "vs/base/browser/dnd", "vs/base/browser/dom", "vs/base/browser/mouseEvent", "vs/base/browser/ui/actionbar/actionbar", "vs/base/common/actions", "vs/base/common/lifecycle", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/notification/common/notification", "vs/platform/quickinput/common/quickInput", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/browser/dnd", "vs/workbench/browser/parts/editor/editorPane", "vs/workbench/common/editor", "vs/workbench/common/contextkeys", "vs/base/common/types", "vs/base/browser/browser", "vs/base/common/errors", "vs/workbench/common/editor/sideBySideEditorInput", "vs/platform/actions/browser/toolbar", "vs/platform/dnd/browser/dnd", "vs/workbench/services/editor/common/editorResolverService", "vs/css!./media/editortabscontrol"], function (require, exports, nls_1, dnd_1, dom_1, mouseEvent_1, actionbar_1, actions_1, lifecycle_1, menuEntryActionViewItem_1, actions_2, contextkey_1, contextView_1, instantiation_1, keybinding_1, notification_1, quickInput_1, colorRegistry_1, themeService_1, dnd_2, editorPane_1, editor_1, contextkeys_1, types_1, browser_1, errors_1, sideBySideEditorInput_1, toolbar_1, dnd_3, editorResolverService_1) {
    "use strict";
    var $Mxb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Mxb = exports.$Lxb = void 0;
    class $Lxb extends actions_1.$hi {
        constructor(a) {
            super();
            this.a = a;
        }
        run(action, context) {
            // Even though we have a fixed context for editor commands,
            // allow to preserve the context that is given to us in case
            // it applies.
            let mergedContext = this.a;
            if (context?.preserveFocus) {
                mergedContext = {
                    ...this.a,
                    preserveFocus: true
                };
            }
            return super.run(action, mergedContext);
        }
    }
    exports.$Lxb = $Lxb;
    let $Mxb = class $Mxb extends themeService_1.$nv {
        static { $Mxb_1 = this; }
        static { this.f = {
            normal: 35,
            compact: 22
        }; }
        constructor(H, I, J, L, M, N, O, P, Q, R, themeService, S) {
            super(themeService);
            this.H = H;
            this.I = I;
            this.J = J;
            this.L = L;
            this.M = M;
            this.N = N;
            this.O = O;
            this.P = P;
            this.Q = Q;
            this.R = R;
            this.S = S;
            this.a = dnd_3.$_6.getInstance();
            this.b = dnd_3.$_6.getInstance();
            this.c = dnd_3.$_6.getInstance();
            this.F = this.B(new lifecycle_1.$jc());
            this.j = this.B(M.createInstance(contextkeys_1.$Kdb));
            this.m = contextkeys_1.$3cb.bindTo(N);
            this.r = contextkeys_1.$4cb.bindTo(N);
            this.s = contextkeys_1.$5cb.bindTo(N);
            this.t = contextkeys_1.$6cb.bindTo(N);
            this.u = contextkeys_1.$_cb.bindTo(this.N);
            this.y = contextkeys_1.$0cb.bindTo(N);
            this.C = contextkeys_1.$cdb.bindTo(N);
            this.D = contextkeys_1.$hdb.bindTo(N);
            this.G = false;
            this.U(H);
        }
        U(parent) {
            this.ib();
        }
        W(container) {
            const context = { groupId: this.J.id };
            // Toolbar Widget
            this.g = this.B(this.M.createInstance(toolbar_1.$L6, container, {
                actionViewItemProvider: action => this.X(action),
                orientation: 0 /* ActionsOrientation.HORIZONTAL */,
                ariaLabel: (0, nls_1.localize)(0, null),
                getKeyBinding: action => this.fb(action),
                actionRunner: this.B(new $Lxb(context)),
                anchorAlignmentProvider: () => 1 /* AnchorAlignment.RIGHT */,
                renderDropdownAsChildElement: this.G,
                telemetrySource: 'editorPart',
                resetMenu: actions_2.$Ru.EditorTitle,
                maxNumberOfItems: 9,
                highlightToggledItems: true,
            }));
            // Context
            this.g.context = context;
            // Action Run Handling
            this.B(this.g.actionRunner.onDidRun(e => {
                // Notify for Error
                if (e.error && !(0, errors_1.$2)(e.error)) {
                    this.P.error(e.error);
                }
            }));
        }
        X(action) {
            const activeEditorPane = this.J.activeEditorPane;
            // Check Active Editor
            if (activeEditorPane instanceof editorPane_1.$0T) {
                const result = activeEditorPane.getActionViewItem(action);
                if (result) {
                    return result;
                }
            }
            // Check extensions
            return (0, menuEntryActionViewItem_1.$F3)(this.M, action, { menuAsChild: this.G });
        }
        Y() {
            const { primary, secondary } = this.Z(this.$());
            const editorActionsToolbar = (0, types_1.$uf)(this.g);
            editorActionsToolbar.setActions((0, actionbar_1.$2P)(primary), (0, actionbar_1.$2P)(secondary));
        }
        $() {
            const primary = [];
            const secondary = [];
            // Dispose previous listeners
            this.F.clear();
            // Update contexts
            this.N.bufferChangeEvents(() => {
                const activeEditor = this.J.activeEditor;
                this.j.set(editor_1.$3E.getOriginalUri(activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY } ?? null));
                this.m.set(activeEditor ? this.J.isPinned(activeEditor) : false);
                this.r.set(activeEditor ? this.J.isFirst(activeEditor) : false);
                this.s.set(activeEditor ? this.J.isLast(activeEditor) : false);
                this.t.set(activeEditor ? this.J.isSticky(activeEditor) : false);
                (0, contextkeys_1.$Ldb)(this.u, activeEditor, this.S);
                this.y.set(activeEditor ? activeEditor.hasCapability(32 /* EditorInputCapabilities.CanSplitInGroup */) : false);
                this.C.set(activeEditor?.typeId === sideBySideEditorInput_1.$VC.ID);
                this.D.set(this.J.isLocked);
            });
            // Editor actions require the editor control to be there, so we retrieve it via service
            const activeEditorPane = this.J.activeEditorPane;
            if (activeEditorPane instanceof editorPane_1.$0T) {
                const scopedContextKeyService = this.ab();
                const titleBarMenu = this.Q.createMenu(actions_2.$Ru.EditorTitle, scopedContextKeyService, { emitEventsForSubmenuChanges: true, eventDebounceDelay: 0 });
                this.F.add(titleBarMenu);
                this.F.add(titleBarMenu.onDidChange(() => {
                    this.Y(); // Update editor toolbar whenever contributed actions change
                }));
                const shouldInlineGroup = (action, group) => group === 'navigation' && action.actions.length <= 1;
                (0, menuEntryActionViewItem_1.$B3)(titleBarMenu, { arg: this.j.get(), shouldForwardArgs: true }, { primary, secondary }, 'navigation', shouldInlineGroup);
            }
            return { primary, secondary };
        }
        ab() {
            return this.J.activeEditorPane?.scopedContextKeyService ?? this.N;
        }
        bb() {
            this.g?.setActions([], []);
        }
        cb(element) {
            // Drag start
            this.B((0, dom_1.$nO)(element, dom_1.$3O.DRAG_START, e => {
                if (e.target !== element) {
                    return; // only if originating from tabs container
                }
                // Set editor group as transfer
                this.b.setData([new dnd_2.$seb(this.J.id)], dnd_2.$seb.prototype);
                if (e.dataTransfer) {
                    e.dataTransfer.effectAllowed = 'copyMove';
                }
                // Drag all tabs of the group if tabs are enabled
                let hasDataTransfer = false;
                if (this.I.partOptions.showTabs) {
                    hasDataTransfer = this.db(this.J.getEditors(1 /* EditorsOrder.SEQUENTIAL */), e);
                }
                // Otherwise only drag the active editor
                else {
                    if (this.J.activeEditor) {
                        hasDataTransfer = this.db([this.J.activeEditor], e);
                    }
                }
                // Firefox: requires to set a text data transfer to get going
                if (!hasDataTransfer && browser_1.$5N) {
                    e.dataTransfer?.setData(dnd_1.$CP.TEXT, String(this.J.label));
                }
                // Drag Image
                if (this.J.activeEditor) {
                    let label = this.J.activeEditor.getName();
                    if (this.I.partOptions.showTabs && this.J.count > 1) {
                        label = (0, nls_1.localize)(1, null, label, this.J.count - 1);
                    }
                    (0, dnd_1.$DP)(e, label, 'monaco-editor-group-drag-image', this.z(colorRegistry_1.$yx), this.z(colorRegistry_1.$zx));
                }
            }));
            // Drag end
            this.B((0, dom_1.$nO)(element, dom_1.$3O.DRAG_END, () => {
                this.b.clearData(dnd_2.$seb.prototype);
            }));
        }
        db(editors, e) {
            if (editors.length) {
                this.M.invokeFunction(dnd_2.$veb, editors.map(editor => ({ editor, groupId: this.J.id })), e);
                return true;
            }
            return false;
        }
        eb(editor, e, node) {
            // Update contexts based on editor picked and remember previous to restore
            const currentResourceContext = this.j.get();
            this.j.set(editor_1.$3E.getOriginalUri(editor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY } ?? null));
            const currentPinnedContext = !!this.m.get();
            this.m.set(this.J.isPinned(editor));
            const currentEditorIsFirstContext = !!this.r.get();
            this.r.set(this.J.isFirst(editor));
            const currentEditorIsLastContext = !!this.s.get();
            this.s.set(this.J.isLast(editor));
            const currentStickyContext = !!this.t.get();
            this.t.set(this.J.isSticky(editor));
            const currentGroupLockedContext = !!this.D.get();
            this.D.set(this.J.isLocked);
            const currentEditorCanSplitContext = !!this.y.get();
            this.y.set(editor.hasCapability(32 /* EditorInputCapabilities.CanSplitInGroup */));
            const currentSideBySideEditorContext = !!this.C.get();
            this.C.set(editor.typeId === sideBySideEditorInput_1.$VC.ID);
            const currentEditorAvailableEditorIds = this.u.get() ?? '';
            (0, contextkeys_1.$Ldb)(this.u, editor, this.S);
            // Find target anchor
            let anchor = node;
            if (e instanceof MouseEvent) {
                anchor = new mouseEvent_1.$eO(e);
            }
            // Show it
            this.L.showContextMenu({
                getAnchor: () => anchor,
                menuId: actions_2.$Ru.EditorTitleContext,
                menuActionOptions: { shouldForwardArgs: true, arg: this.j.get() },
                contextKeyService: this.N,
                getActionsContext: () => ({ groupId: this.J.id, editorIndex: this.J.getIndexOfEditor(editor) }),
                getKeyBinding: action => this.fb(action),
                onHide: () => {
                    // restore previous contexts
                    this.j.set(currentResourceContext || null);
                    this.m.set(currentPinnedContext);
                    this.r.set(currentEditorIsFirstContext);
                    this.s.set(currentEditorIsLastContext);
                    this.t.set(currentStickyContext);
                    this.D.set(currentGroupLockedContext);
                    this.y.set(currentEditorCanSplitContext);
                    this.C.set(currentSideBySideEditorContext);
                    this.u.set(currentEditorAvailableEditorIds);
                    // restore focus to active group
                    this.I.activeGroup.focus();
                }
            });
        }
        fb(action) {
            return this.O.lookupKeybinding(action.id, this.ab());
        }
        gb(action) {
            const keybinding = this.fb(action);
            return keybinding ? keybinding.getLabel() ?? undefined : undefined;
        }
        get hb() {
            return this.I.partOptions.tabHeight !== 'compact' ? $Mxb_1.f.normal : $Mxb_1.f.compact;
        }
        ib() {
            this.H.style.setProperty('--editor-group-tab-height', `${this.hb}px`);
        }
        updateOptions(oldOptions, newOptions) {
            // Update tab height
            if (oldOptions.tabHeight !== newOptions.tabHeight) {
                this.ib();
            }
        }
    };
    exports.$Mxb = $Mxb;
    exports.$Mxb = $Mxb = $Mxb_1 = __decorate([
        __param(3, contextView_1.$WZ),
        __param(4, instantiation_1.$Ah),
        __param(5, contextkey_1.$3i),
        __param(6, keybinding_1.$2D),
        __param(7, notification_1.$Yu),
        __param(8, actions_2.$Su),
        __param(9, quickInput_1.$Gq),
        __param(10, themeService_1.$gv),
        __param(11, editorResolverService_1.$pbb)
    ], $Mxb);
});
//# sourceMappingURL=editorTabsControl.js.map