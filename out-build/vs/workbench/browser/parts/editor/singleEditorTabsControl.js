/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/common/editor", "vs/workbench/browser/parts/editor/editorTabsControl", "vs/workbench/browser/labels", "vs/workbench/common/theme", "vs/base/browser/touch", "vs/base/browser/dom", "vs/workbench/browser/parts/editor/editorCommands", "vs/base/common/color", "vs/base/common/types", "vs/base/common/objects", "vs/base/common/lifecycle", "vs/platform/theme/browser/defaultStyles", "vs/workbench/browser/parts/editor/breadcrumbsControl", "vs/css!./media/singleeditortabscontrol"], function (require, exports, editor_1, editorTabsControl_1, labels_1, theme_1, touch_1, dom_1, editorCommands_1, color_1, types_1, objects_1, lifecycle_1, defaultStyles_1, breadcrumbsControl_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Oxb = void 0;
    class $Oxb extends editorTabsControl_1.$Mxb {
        constructor() {
            super(...arguments);
            this.lb = Object.create(null);
        }
        get nb() { return this.mb?.control; }
        U(parent) {
            super.U(parent);
            const titleContainer = this.jb = parent;
            titleContainer.draggable = true;
            // Container listeners
            this.pb(titleContainer);
            // Gesture Support
            this.B(touch_1.$EP.addTarget(titleContainer));
            const labelContainer = document.createElement('div');
            labelContainer.classList.add('label-container');
            titleContainer.appendChild(labelContainer);
            // Editor Label
            this.kb = this.B(this.M.createInstance(labels_1.$Mlb, labelContainer, undefined)).element;
            this.B((0, dom_1.$nO)(this.kb.element, dom_1.$3O.CLICK, e => this.qb(e)));
            // Breadcrumbs
            this.mb = this.B(this.M.createInstance(breadcrumbsControl_1.$Kxb, labelContainer, this.J, {
                showFileIcons: false,
                showSymbolIcons: true,
                showDecorationColors: false,
                widgetStyles: { ...defaultStyles_1.$x2, breadcrumbsBackground: color_1.$Os.transparent.toString() },
                showPlaceholder: false
            }));
            this.B(this.mb.onDidEnablementChange(() => this.vb()));
            titleContainer.classList.toggle('breadcrumbs', Boolean(this.nb));
            this.B((0, lifecycle_1.$ic)(() => titleContainer.classList.remove('breadcrumbs'))); // important to remove because the container is a shared dom node
            // Right Actions Container
            const actionsContainer = document.createElement('div');
            actionsContainer.classList.add('title-actions');
            titleContainer.appendChild(actionsContainer);
            // Editor actions toolbar
            this.W(actionsContainer);
        }
        pb(titleContainer) {
            // Group dragging
            this.cb(titleContainer);
            // Pin on double click
            this.B((0, dom_1.$nO)(titleContainer, dom_1.$3O.DBLCLICK, e => this.rb(e)));
            // Detect mouse click
            this.B((0, dom_1.$nO)(titleContainer, dom_1.$3O.AUXCLICK, e => this.sb(e)));
            // Detect touch
            this.B((0, dom_1.$nO)(titleContainer, touch_1.EventType.Tap, (e) => this.tb(e)));
            // Context Menu
            for (const event of [dom_1.$3O.CONTEXT_MENU, touch_1.EventType.Contextmenu]) {
                this.B((0, dom_1.$nO)(titleContainer, event, e => {
                    if (this.J.activeEditor) {
                        this.eb(this.J.activeEditor, e, titleContainer);
                    }
                }));
            }
        }
        qb(e) {
            dom_1.$5O.stop(e, false);
            // delayed to let the onTitleClick() come first which can cause a focus change which can close quick access
            setTimeout(() => this.R.quickAccess.show());
        }
        rb(e) {
            dom_1.$5O.stop(e);
            this.J.pinEditor();
        }
        sb(e) {
            if (e.button === 1 /* Middle Button */ && this.J.activeEditor) {
                dom_1.$5O.stop(e, true /* for https://github.com/microsoft/vscode/issues/56715 */);
                if (!(0, editor_1.$2E)(this.J, this.J.activeEditor, editor_1.EditorCloseMethod.MOUSE, this.I.partOptions)) {
                    this.J.closeEditor(this.J.activeEditor);
                }
            }
        }
        tb(e) {
            // We only want to open the quick access picker when
            // the tap occurred over the editor label, so we need
            // to check on the target
            // (https://github.com/microsoft/vscode/issues/107543)
            const target = e.initialTarget;
            if (!(target instanceof HTMLElement) || !this.kb || !(0, dom_1.$NO)(target, this.kb.element)) {
                return;
            }
            // TODO@rebornix gesture tap should open the quick access
            // editorGroupView will focus on the editor again when there
            // are mouse/pointer/touch down events we need to wait a bit as
            // `GesureEvent.Tap` is generated from `touchstart` and then
            // `touchend` events, which are not an atom event.
            setTimeout(() => this.R.quickAccess.show(), 50);
        }
        openEditor(editor) {
            return this.ub();
        }
        openEditors(editors) {
            return this.ub();
        }
        ub() {
            const activeEditorChanged = this.wb(() => this.zb());
            if (!activeEditorChanged) {
                this.xb(() => this.zb());
            }
            return activeEditorChanged;
        }
        beforeCloseEditor(editor) {
            // Nothing to do before closing an editor
        }
        closeEditor(editor) {
            this.wb(() => this.zb());
        }
        closeEditors(editors) {
            this.wb(() => this.zb());
        }
        moveEditor(editor, fromIndex, targetIndex) {
            this.wb(() => this.zb());
        }
        pinEditor(editor) {
            this.yb(editor, () => this.zb());
        }
        stickEditor(editor) {
            // Sticky editors are not presented any different with tabs disabled
        }
        unstickEditor(editor) {
            // Sticky editors are not presented any different with tabs disabled
        }
        setActive(isActive) {
            this.zb();
        }
        updateEditorLabel(editor) {
            this.yb(editor, () => this.zb());
        }
        updateEditorDirty(editor) {
            this.yb(editor, () => {
                const titleContainer = (0, types_1.$uf)(this.jb);
                // Signal dirty (unless saving)
                if (editor.isDirty() && !editor.isSaving()) {
                    titleContainer.classList.add('dirty');
                }
                // Otherwise, clear dirty
                else {
                    titleContainer.classList.remove('dirty');
                }
            });
        }
        updateOptions(oldOptions, newOptions) {
            super.updateOptions(oldOptions, newOptions);
            if (oldOptions.labelFormat !== newOptions.labelFormat || !(0, objects_1.$Zm)(oldOptions.decorations, newOptions.decorations)) {
                this.zb();
            }
        }
        updateStyles() {
            this.zb();
        }
        vb() {
            const titleContainer = (0, types_1.$uf)(this.jb);
            titleContainer.classList.toggle('breadcrumbs', Boolean(this.nb));
            this.zb();
        }
        wb(fn) {
            if (!this.lb.editor && this.J.activeEditor || // active editor changed from null => editor
                this.lb.editor && !this.J.activeEditor || // active editor changed from editor => null
                (!this.lb.editor || !this.J.isActive(this.lb.editor)) // active editor changed from editorA => editorB
            ) {
                fn();
                return true;
            }
            return false;
        }
        xb(fn) {
            if (!this.lb.editor || !this.J.activeEditor) {
                return; // need an active editor to check for properties changed
            }
            if (this.lb.pinned !== this.J.isPinned(this.J.activeEditor)) {
                fn(); // only run if pinned state has changed
            }
        }
        yb(editor, fn) {
            if (this.J.isActive(editor)) {
                fn(); // only run if editor is current active
            }
        }
        zb() {
            const editor = this.J.activeEditor ?? undefined;
            const options = this.I.partOptions;
            const isEditorPinned = editor ? this.J.isPinned(editor) : false;
            const isGroupActive = this.I.activeGroup === this.J;
            this.lb = { editor, pinned: isEditorPinned };
            // Update Breadcrumbs
            if (this.nb) {
                if (isGroupActive) {
                    this.nb.update();
                    this.nb.domNode.classList.toggle('preview', !isEditorPinned);
                }
                else {
                    this.nb.hide();
                }
            }
            // Clear if there is no editor
            const [titleContainer, editorLabel] = (0, types_1.$vf)(this.jb, this.kb);
            if (!editor) {
                titleContainer.classList.remove('dirty');
                editorLabel.clear();
                this.bb();
            }
            // Otherwise render it
            else {
                // Dirty state
                this.updateEditorDirty(editor);
                // Editor Label
                const { labelFormat } = this.I.partOptions;
                let description;
                if (this.nb && !this.nb.isHidden()) {
                    description = ''; // hide description when showing breadcrumbs
                }
                else if (labelFormat === 'default' && !isGroupActive) {
                    description = ''; // hide description when group is not active and style is 'default'
                }
                else {
                    description = editor.getDescription(this.Ab(labelFormat)) || '';
                }
                let title = editor.getTitle(2 /* Verbosity.LONG */);
                if (description === title) {
                    title = ''; // dont repeat what is already shown
                }
                editorLabel.setResource({
                    resource: editor_1.$3E.getOriginalUri(editor, { supportSideBySide: editor_1.SideBySideEditor.BOTH }),
                    name: editor.getName(),
                    description
                }, {
                    title,
                    italic: !isEditorPinned,
                    extraClasses: ['no-tabs', 'title-label'].concat(editor.getLabelExtraClasses()),
                    fileDecorations: {
                        colors: Boolean(options.decorations?.colors),
                        badges: Boolean(options.decorations?.badges)
                    },
                });
                if (isGroupActive) {
                    titleContainer.style.color = this.z(theme_1.$d_) || '';
                }
                else {
                    titleContainer.style.color = this.z(theme_1.$f_) || '';
                }
                // Update Editor Actions Toolbar
                this.Y();
            }
        }
        Ab(style) {
            switch (style) {
                case 'short': return 0 /* Verbosity.SHORT */;
                case 'long': return 2 /* Verbosity.LONG */;
                default: return 1 /* Verbosity.MEDIUM */;
            }
        }
        Z(editorActions) {
            const isGroupActive = this.I.activeGroup === this.J;
            // Active: allow all actions
            if (isGroupActive) {
                return editorActions;
            }
            // Inactive: only show "Close, "Unlock" and secondary actions
            else {
                return {
                    primary: editorActions.primary.filter(action => action.id === editorCommands_1.$iub || action.id === editorCommands_1.$tub),
                    secondary: editorActions.secondary
                };
            }
        }
        getHeight() {
            return this.hb;
        }
        layout(dimensions) {
            this.nb?.layout(undefined);
            return new dom_1.$BO(dimensions.container.width, this.getHeight());
        }
    }
    exports.$Oxb = $Oxb;
});
//# sourceMappingURL=singleEditorTabsControl.js.map