/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/common/editor", "vs/workbench/browser/parts/editor/editorTabsControl", "vs/workbench/browser/labels", "vs/workbench/common/theme", "vs/base/browser/touch", "vs/base/browser/dom", "vs/workbench/browser/parts/editor/editorCommands", "vs/base/common/color", "vs/base/common/types", "vs/base/common/objects", "vs/base/common/lifecycle", "vs/platform/theme/browser/defaultStyles", "vs/workbench/browser/parts/editor/breadcrumbsControl", "vs/css!./media/singleeditortabscontrol"], function (require, exports, editor_1, editorTabsControl_1, labels_1, theme_1, touch_1, dom_1, editorCommands_1, color_1, types_1, objects_1, lifecycle_1, defaultStyles_1, breadcrumbsControl_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SingleEditorTabsControl = void 0;
    class SingleEditorTabsControl extends editorTabsControl_1.EditorTabsControl {
        constructor() {
            super(...arguments);
            this.activeLabel = Object.create(null);
        }
        get breadcrumbsControl() { return this.breadcrumbsControlFactory?.control; }
        create(parent) {
            super.create(parent);
            const titleContainer = this.titleContainer = parent;
            titleContainer.draggable = true;
            // Container listeners
            this.registerContainerListeners(titleContainer);
            // Gesture Support
            this._register(touch_1.Gesture.addTarget(titleContainer));
            const labelContainer = document.createElement('div');
            labelContainer.classList.add('label-container');
            titleContainer.appendChild(labelContainer);
            // Editor Label
            this.editorLabel = this._register(this.instantiationService.createInstance(labels_1.ResourceLabel, labelContainer, undefined)).element;
            this._register((0, dom_1.addDisposableListener)(this.editorLabel.element, dom_1.EventType.CLICK, e => this.onTitleLabelClick(e)));
            // Breadcrumbs
            this.breadcrumbsControlFactory = this._register(this.instantiationService.createInstance(breadcrumbsControl_1.BreadcrumbsControlFactory, labelContainer, this.group, {
                showFileIcons: false,
                showSymbolIcons: true,
                showDecorationColors: false,
                widgetStyles: { ...defaultStyles_1.defaultBreadcrumbsWidgetStyles, breadcrumbsBackground: color_1.Color.transparent.toString() },
                showPlaceholder: false
            }));
            this._register(this.breadcrumbsControlFactory.onDidEnablementChange(() => this.handleBreadcrumbsEnablementChange()));
            titleContainer.classList.toggle('breadcrumbs', Boolean(this.breadcrumbsControl));
            this._register((0, lifecycle_1.toDisposable)(() => titleContainer.classList.remove('breadcrumbs'))); // important to remove because the container is a shared dom node
            // Right Actions Container
            const actionsContainer = document.createElement('div');
            actionsContainer.classList.add('title-actions');
            titleContainer.appendChild(actionsContainer);
            // Editor actions toolbar
            this.createEditorActionsToolBar(actionsContainer);
        }
        registerContainerListeners(titleContainer) {
            // Group dragging
            this.enableGroupDragging(titleContainer);
            // Pin on double click
            this._register((0, dom_1.addDisposableListener)(titleContainer, dom_1.EventType.DBLCLICK, e => this.onTitleDoubleClick(e)));
            // Detect mouse click
            this._register((0, dom_1.addDisposableListener)(titleContainer, dom_1.EventType.AUXCLICK, e => this.onTitleAuxClick(e)));
            // Detect touch
            this._register((0, dom_1.addDisposableListener)(titleContainer, touch_1.EventType.Tap, (e) => this.onTitleTap(e)));
            // Context Menu
            for (const event of [dom_1.EventType.CONTEXT_MENU, touch_1.EventType.Contextmenu]) {
                this._register((0, dom_1.addDisposableListener)(titleContainer, event, e => {
                    if (this.group.activeEditor) {
                        this.onContextMenu(this.group.activeEditor, e, titleContainer);
                    }
                }));
            }
        }
        onTitleLabelClick(e) {
            dom_1.EventHelper.stop(e, false);
            // delayed to let the onTitleClick() come first which can cause a focus change which can close quick access
            setTimeout(() => this.quickInputService.quickAccess.show());
        }
        onTitleDoubleClick(e) {
            dom_1.EventHelper.stop(e);
            this.group.pinEditor();
        }
        onTitleAuxClick(e) {
            if (e.button === 1 /* Middle Button */ && this.group.activeEditor) {
                dom_1.EventHelper.stop(e, true /* for https://github.com/microsoft/vscode/issues/56715 */);
                if (!(0, editor_1.preventEditorClose)(this.group, this.group.activeEditor, editor_1.EditorCloseMethod.MOUSE, this.accessor.partOptions)) {
                    this.group.closeEditor(this.group.activeEditor);
                }
            }
        }
        onTitleTap(e) {
            // We only want to open the quick access picker when
            // the tap occurred over the editor label, so we need
            // to check on the target
            // (https://github.com/microsoft/vscode/issues/107543)
            const target = e.initialTarget;
            if (!(target instanceof HTMLElement) || !this.editorLabel || !(0, dom_1.isAncestor)(target, this.editorLabel.element)) {
                return;
            }
            // TODO@rebornix gesture tap should open the quick access
            // editorGroupView will focus on the editor again when there
            // are mouse/pointer/touch down events we need to wait a bit as
            // `GesureEvent.Tap` is generated from `touchstart` and then
            // `touchend` events, which are not an atom event.
            setTimeout(() => this.quickInputService.quickAccess.show(), 50);
        }
        openEditor(editor) {
            return this.doHandleOpenEditor();
        }
        openEditors(editors) {
            return this.doHandleOpenEditor();
        }
        doHandleOpenEditor() {
            const activeEditorChanged = this.ifActiveEditorChanged(() => this.redraw());
            if (!activeEditorChanged) {
                this.ifActiveEditorPropertiesChanged(() => this.redraw());
            }
            return activeEditorChanged;
        }
        beforeCloseEditor(editor) {
            // Nothing to do before closing an editor
        }
        closeEditor(editor) {
            this.ifActiveEditorChanged(() => this.redraw());
        }
        closeEditors(editors) {
            this.ifActiveEditorChanged(() => this.redraw());
        }
        moveEditor(editor, fromIndex, targetIndex) {
            this.ifActiveEditorChanged(() => this.redraw());
        }
        pinEditor(editor) {
            this.ifEditorIsActive(editor, () => this.redraw());
        }
        stickEditor(editor) {
            // Sticky editors are not presented any different with tabs disabled
        }
        unstickEditor(editor) {
            // Sticky editors are not presented any different with tabs disabled
        }
        setActive(isActive) {
            this.redraw();
        }
        updateEditorLabel(editor) {
            this.ifEditorIsActive(editor, () => this.redraw());
        }
        updateEditorDirty(editor) {
            this.ifEditorIsActive(editor, () => {
                const titleContainer = (0, types_1.assertIsDefined)(this.titleContainer);
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
            if (oldOptions.labelFormat !== newOptions.labelFormat || !(0, objects_1.equals)(oldOptions.decorations, newOptions.decorations)) {
                this.redraw();
            }
        }
        updateStyles() {
            this.redraw();
        }
        handleBreadcrumbsEnablementChange() {
            const titleContainer = (0, types_1.assertIsDefined)(this.titleContainer);
            titleContainer.classList.toggle('breadcrumbs', Boolean(this.breadcrumbsControl));
            this.redraw();
        }
        ifActiveEditorChanged(fn) {
            if (!this.activeLabel.editor && this.group.activeEditor || // active editor changed from null => editor
                this.activeLabel.editor && !this.group.activeEditor || // active editor changed from editor => null
                (!this.activeLabel.editor || !this.group.isActive(this.activeLabel.editor)) // active editor changed from editorA => editorB
            ) {
                fn();
                return true;
            }
            return false;
        }
        ifActiveEditorPropertiesChanged(fn) {
            if (!this.activeLabel.editor || !this.group.activeEditor) {
                return; // need an active editor to check for properties changed
            }
            if (this.activeLabel.pinned !== this.group.isPinned(this.group.activeEditor)) {
                fn(); // only run if pinned state has changed
            }
        }
        ifEditorIsActive(editor, fn) {
            if (this.group.isActive(editor)) {
                fn(); // only run if editor is current active
            }
        }
        redraw() {
            const editor = this.group.activeEditor ?? undefined;
            const options = this.accessor.partOptions;
            const isEditorPinned = editor ? this.group.isPinned(editor) : false;
            const isGroupActive = this.accessor.activeGroup === this.group;
            this.activeLabel = { editor, pinned: isEditorPinned };
            // Update Breadcrumbs
            if (this.breadcrumbsControl) {
                if (isGroupActive) {
                    this.breadcrumbsControl.update();
                    this.breadcrumbsControl.domNode.classList.toggle('preview', !isEditorPinned);
                }
                else {
                    this.breadcrumbsControl.hide();
                }
            }
            // Clear if there is no editor
            const [titleContainer, editorLabel] = (0, types_1.assertAllDefined)(this.titleContainer, this.editorLabel);
            if (!editor) {
                titleContainer.classList.remove('dirty');
                editorLabel.clear();
                this.clearEditorActionsToolbar();
            }
            // Otherwise render it
            else {
                // Dirty state
                this.updateEditorDirty(editor);
                // Editor Label
                const { labelFormat } = this.accessor.partOptions;
                let description;
                if (this.breadcrumbsControl && !this.breadcrumbsControl.isHidden()) {
                    description = ''; // hide description when showing breadcrumbs
                }
                else if (labelFormat === 'default' && !isGroupActive) {
                    description = ''; // hide description when group is not active and style is 'default'
                }
                else {
                    description = editor.getDescription(this.getVerbosity(labelFormat)) || '';
                }
                let title = editor.getTitle(2 /* Verbosity.LONG */);
                if (description === title) {
                    title = ''; // dont repeat what is already shown
                }
                editorLabel.setResource({
                    resource: editor_1.EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: editor_1.SideBySideEditor.BOTH }),
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
                    titleContainer.style.color = this.getColor(theme_1.TAB_ACTIVE_FOREGROUND) || '';
                }
                else {
                    titleContainer.style.color = this.getColor(theme_1.TAB_UNFOCUSED_ACTIVE_FOREGROUND) || '';
                }
                // Update Editor Actions Toolbar
                this.updateEditorActionsToolbar();
            }
        }
        getVerbosity(style) {
            switch (style) {
                case 'short': return 0 /* Verbosity.SHORT */;
                case 'long': return 2 /* Verbosity.LONG */;
                default: return 1 /* Verbosity.MEDIUM */;
            }
        }
        prepareEditorActions(editorActions) {
            const isGroupActive = this.accessor.activeGroup === this.group;
            // Active: allow all actions
            if (isGroupActive) {
                return editorActions;
            }
            // Inactive: only show "Close, "Unlock" and secondary actions
            else {
                return {
                    primary: editorActions.primary.filter(action => action.id === editorCommands_1.CLOSE_EDITOR_COMMAND_ID || action.id === editorCommands_1.UNLOCK_GROUP_COMMAND_ID),
                    secondary: editorActions.secondary
                };
            }
        }
        getHeight() {
            return this.tabHeight;
        }
        layout(dimensions) {
            this.breadcrumbsControl?.layout(undefined);
            return new dom_1.Dimension(dimensions.container.width, this.getHeight());
        }
    }
    exports.SingleEditorTabsControl = SingleEditorTabsControl;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2luZ2xlRWRpdG9yVGFic0NvbnRyb2wuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci9wYXJ0cy9lZGl0b3Ivc2luZ2xlRWRpdG9yVGFic0NvbnRyb2wudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBd0JoRyxNQUFhLHVCQUF3QixTQUFRLHFDQUFpQjtRQUE5RDs7WUFJUyxnQkFBVyxHQUF5QixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBcVZqRSxDQUFDO1FBbFZBLElBQVksa0JBQWtCLEtBQUssT0FBTyxJQUFJLENBQUMseUJBQXlCLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUVqRSxNQUFNLENBQUMsTUFBbUI7WUFDNUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUVyQixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsY0FBYyxHQUFHLE1BQU0sQ0FBQztZQUNwRCxjQUFjLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztZQUVoQyxzQkFBc0I7WUFDdEIsSUFBSSxDQUFDLDBCQUEwQixDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBRWhELGtCQUFrQjtZQUNsQixJQUFJLENBQUMsU0FBUyxDQUFDLGVBQU8sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztZQUVsRCxNQUFNLGNBQWMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3JELGNBQWMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDaEQsY0FBYyxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUUzQyxlQUFlO1lBQ2YsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFj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