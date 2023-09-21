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
define(["require", "exports", "vs/base/browser/dnd", "vs/base/browser/dom", "vs/base/browser/formattedTextRenderer", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/types", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/platform/workspace/common/workspace", "vs/platform/dnd/browser/dnd", "vs/workbench/browser/dnd", "vs/workbench/browser/parts/editor/editor", "vs/workbench/common/theme", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/editor/common/services/treeViewsDndService", "vs/editor/common/services/treeViewsDnd", "vs/css!./media/editordroptarget"], function (require, exports, dnd_1, dom_1, formattedTextRenderer_1, async_1, lifecycle_1, platform_1, types_1, nls_1, configuration_1, instantiation_1, platform_2, colorRegistry_1, themeService_1, workspace_1, dnd_2, dnd_3, editor_1, theme_1, editorGroupsService_1, editorService_1, treeViewsDndService_1, treeViewsDnd_1) {
    "use strict";
    var DropOverlay_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditorDropTarget = void 0;
    function isDropIntoEditorEnabledGlobally(configurationService) {
        return configurationService.getValue('editor.dropIntoEditor.enabled');
    }
    function isDragIntoEditorEvent(e) {
        return e.shiftKey;
    }
    let DropOverlay = class DropOverlay extends themeService_1.Themable {
        static { DropOverlay_1 = this; }
        static { this.OVERLAY_ID = 'monaco-workbench-editor-drop-overlay'; }
        get disposed() { return !!this._disposed; }
        constructor(accessor, groupView, themeService, configurationService, instantiationService, editorService, editorGroupService, treeViewsDragAndDropService, contextService) {
            super(themeService);
            this.accessor = accessor;
            this.groupView = groupView;
            this.configurationService = configurationService;
            this.instantiationService = instantiationService;
            this.editorService = editorService;
            this.editorGroupService = editorGroupService;
            this.treeViewsDragAndDropService = treeViewsDragAndDropService;
            this.contextService = contextService;
            this.editorTransfer = dnd_2.LocalSelectionTransfer.getInstance();
            this.groupTransfer = dnd_2.LocalSelectionTransfer.getInstance();
            this.treeItemsTransfer = dnd_2.LocalSelectionTransfer.getInstance();
            this.cleanupOverlayScheduler = this._register(new async_1.RunOnceScheduler(() => this.dispose(), 300));
            this.enableDropIntoEditor = isDropIntoEditorEnabledGlobally(this.configurationService) && this.isDropIntoActiveEditorEnabled();
            this.create();
        }
        create() {
            const overlayOffsetHeight = this.getOverlayOffsetHeight();
            // Container
            const container = this.container = document.createElement('div');
            container.id = DropOverlay_1.OVERLAY_ID;
            container.style.top = `${overlayOffsetHeight}px`;
            // Parent
            this.groupView.element.appendChild(container);
            this.groupView.element.classList.add('dragged-over');
            this._register((0, lifecycle_1.toDisposable)(() => {
                this.groupView.element.removeChild(container);
                this.groupView.element.classList.remove('dragged-over');
            }));
            // Overlay
            this.overlay = document.createElement('div');
            this.overlay.classList.add('editor-group-overlay-indicator');
            container.appendChild(this.overlay);
            if (this.enableDropIntoEditor) {
                this.dropIntoPromptElement = (0, formattedTextRenderer_1.renderFormattedText)((0, nls_1.localize)('dropIntoEditorPrompt', "Hold __{0}__ to drop into editor", platform_1.isMacintosh ? '⇧' : 'Shift'), {});
                this.dropIntoPromptElement.classList.add('editor-group-overlay-drop-into-prompt');
                this.overlay.appendChild(this.dropIntoPromptElement);
            }
            // Overlay Event Handling
            this.registerListeners(container);
            // Styles
            this.updateStyles();
        }
        updateStyles() {
            const overlay = (0, types_1.assertIsDefined)(this.overlay);
            // Overlay drop background
            overlay.style.backgroundColor = this.getColor(theme_1.EDITOR_DRAG_AND_DROP_BACKGROUND) || '';
            // Overlay contrast border (if any)
            const activeContrastBorderColor = this.getColor(colorRegistry_1.activeContrastBorder);
            overlay.style.outlineColor = activeContrastBorderColor || '';
            overlay.style.outlineOffset = activeContrastBorderColor ? '-2px' : '';
            overlay.style.outlineStyle = activeContrastBorderColor ? 'dashed' : '';
            overlay.style.outlineWidth = activeContrastBorderColor ? '2px' : '';
            if (this.dropIntoPromptElement) {
                this.dropIntoPromptElement.style.backgroundColor = this.getColor(theme_1.EDITOR_DROP_INTO_PROMPT_BACKGROUND) ?? '';
                this.dropIntoPromptElement.style.color = this.getColor(theme_1.EDITOR_DROP_INTO_PROMPT_FOREGROUND) ?? '';
                const borderColor = this.getColor(theme_1.EDITOR_DROP_INTO_PROMPT_BORDER);
                if (borderColor) {
                    this.dropIntoPromptElement.style.borderWidth = '1px';
                    this.dropIntoPromptElement.style.borderStyle = 'solid';
                    this.dropIntoPromptElement.style.borderColor = borderColor;
                }
                else {
                    this.dropIntoPromptElement.style.borderWidth = '0';
                }
            }
        }
        registerListeners(container) {
            this._register(new dom_1.DragAndDropObserver(container, {
                onDragEnter: e => undefined,
                onDragOver: e => {
                    if (this.enableDropIntoEditor && isDragIntoEditorEvent(e)) {
                        this.dispose();
                        return;
                    }
                    const isDraggingGroup = this.groupTransfer.hasData(dnd_3.DraggedEditorGroupIdentifier.prototype);
                    const isDraggingEditor = this.editorTransfer.hasData(dnd_3.DraggedEditorIdentifier.prototype);
                    // Update the dropEffect to "copy" if there is no local data to be dragged because
                    // in that case we can only copy the data into and not move it from its source
                    if (!isDraggingEditor && !isDraggingGroup && e.dataTransfer) {
                        e.dataTransfer.dropEffect = 'copy';
                    }
                    // Find out if operation is valid
                    let isCopy = true;
                    if (isDraggingGroup) {
                        isCopy = this.isCopyOperation(e);
                    }
                    else if (isDraggingEditor) {
                        const data = this.editorTransfer.getData(dnd_3.DraggedEditorIdentifier.prototype);
                        if (Array.isArray(data)) {
                            isCopy = this.isCopyOperation(e, data[0].identifier);
                        }
                    }
                    if (!isCopy) {
                        const sourceGroupView = this.findSourceGroupView();
                        if (sourceGroupView === this.groupView) {
                            if (isDraggingGroup || (isDraggingEditor && sourceGroupView.count < 2)) {
                                this.hideOverlay();
                                return; // do not allow to drop group/editor on itself if this results in an empty group
                            }
                        }
                    }
                    // Position overlay and conditionally enable or disable
                    // editor group splitting support based on setting and
                    // keymodifiers used.
                    let splitOnDragAndDrop = !!this.editorGroupService.partOptions.splitOnDragAndDrop;
                    if (this.isToggleSplitOperation(e)) {
                        splitOnDragAndDrop = !splitOnDragAndDrop;
                    }
                    this.positionOverlay(e.offsetX, e.offsetY, isDraggingGroup, splitOnDragAndDrop);
                    // Make sure to stop any running cleanup scheduler to remove the overlay
                    if (this.cleanupOverlayScheduler.isScheduled()) {
                        this.cleanupOverlayScheduler.cancel();
                    }
                },
                onDragLeave: e => this.dispose(),
                onDragEnd: e => this.dispose(),
                onDrop: e => {
                    dom_1.EventHelper.stop(e, true);
                    // Dispose overlay
                    this.dispose();
                    // Handle drop if we have a valid operation
                    if (this.currentDropOperation) {
                        this.handleDrop(e, this.currentDropOperation.splitDirection);
                    }
                }
            }));
            this._register((0, dom_1.addDisposableListener)(container, dom_1.EventType.MOUSE_OVER, () => {
                // Under some circumstances we have seen reports where the drop overlay is not being
                // cleaned up and as such the editor area remains under the overlay so that you cannot
                // type into the editor anymore. This seems related to using VMs and DND via host and
                // guest OS, though some users also saw it without VMs.
                // To protect against this issue we always destroy the overlay as soon as we detect a
                // mouse event over it. The delay is used to guarantee we are not interfering with the
                // actual DROP event that can also trigger a mouse over event.
                if (!this.cleanupOverlayScheduler.isScheduled()) {
                    this.cleanupOverlayScheduler.schedule();
                }
            }));
        }
        isDropIntoActiveEditorEnabled() {
            return !!this.groupView.activeEditor?.hasCapability(128 /* EditorInputCapabilities.CanDropIntoEditor */);
        }
        findSourceGroupView() {
            // Check for group transfer
            if (this.groupTransfer.hasData(dnd_3.DraggedEditorGroupIdentifier.prototype)) {
                const data = this.groupTransfer.getData(dnd_3.DraggedEditorGroupIdentifier.prototype);
                if (Array.isArray(data)) {
                    return this.accessor.getGroup(data[0].identifier);
                }
            }
            // Check for editor transfer
            else if (this.editorTransfer.hasData(dnd_3.DraggedEditorIdentifier.prototype)) {
                const data = this.editorTransfer.getData(dnd_3.DraggedEditorIdentifier.prototype);
                if (Array.isArray(data)) {
                    return this.accessor.getGroup(data[0].identifier.groupId);
                }
            }
            return undefined;
        }
        async handleDrop(event, splitDirection) {
            // Determine target group
            const ensureTargetGroup = () => {
                let targetGroup;
                if (typeof splitDirection === 'number') {
                    targetGroup = this.accessor.addGroup(this.groupView, splitDirection);
                }
                else {
                    targetGroup = this.groupView;
                }
                return targetGroup;
            };
            // Check for group transfer
            if (this.groupTransfer.hasData(dnd_3.DraggedEditorGroupIdentifier.prototype)) {
                const data = this.groupTransfer.getData(dnd_3.DraggedEditorGroupIdentifier.prototype);
                if (Array.isArray(data)) {
                    const sourceGroup = this.accessor.getGroup(data[0].identifier);
                    if (sourceGroup) {
                        if (typeof splitDirection !== 'number' && sourceGroup === this.groupView) {
                            return;
                        }
                        // Split to new group
                        let targetGroup;
                        if (typeof splitDirection === 'number') {
                            if (this.isCopyOperation(event)) {
                                targetGroup = this.accessor.copyGroup(sourceGroup, this.groupView, splitDirection);
                            }
                            else {
                                targetGroup = this.accessor.moveGroup(sourceGroup, this.groupView, splitDirection);
                            }
                        }
                        // Merge into existing group
                        else {
                            let mergeGroupOptions = undefined;
                            if (this.isCopyOperation(event)) {
                                mergeGroupOptions = { mode: 0 /* MergeGroupMode.COPY_EDITORS */ };
                            }
                            this.accessor.mergeGroup(sourceGroup, this.groupView, mergeGroupOptions);
                        }
                        if (targetGroup) {
                            this.accessor.activateGroup(targetGroup);
                        }
                    }
                    this.groupTransfer.clearData(dnd_3.DraggedEditorGroupIdentifier.prototype);
                }
            }
            // Check for editor transfer
            else if (this.editorTransfer.hasData(dnd_3.DraggedEditorIdentifier.prototype)) {
                const data = this.editorTransfer.getData(dnd_3.DraggedEditorIdentifier.prototype);
                if (Array.isArray(data)) {
                    const draggedEditor = data[0].identifier;
                    const sourceGroup = this.accessor.getGroup(draggedEditor.groupId);
                    if (sourceGroup) {
                        const copyEditor = this.isCopyOperation(event, draggedEditor);
                        let targetGroup = undefined;
                        // Optimization: if we move the last editor of an editor group
                        // and we are configured to close empty editor groups, we can
                        // rather move the entire editor group according to the direction
                        if (this.editorGroupService.partOptions.closeEmptyGroups && sourceGroup.count === 1 && typeof splitDirection === 'number' && !copyEditor) {
                            targetGroup = this.accessor.moveGroup(sourceGroup, this.groupView, splitDirection);
                        }
                        // In any other case do a normal move/copy operation
                        else {
                            targetGroup = ensureTargetGroup();
                            if (sourceGroup === targetGroup) {
                                return;
                            }
                            // Open in target group
                            const options = (0, editor_1.fillActiveEditorViewState)(sourceGroup, draggedEditor.editor, {
                                pinned: true,
                                sticky: sourceGroup.isSticky(draggedEditor.editor), // preserve sticky state
                            });
                            if (!copyEditor) {
                                sourceGroup.moveEditor(draggedEditor.editor, targetGroup, options);
                            }
                            else {
                                sourceGroup.copyEditor(draggedEditor.editor, targetGroup, options);
                            }
                        }
                        // Ensure target has focus
                        targetGroup.focus();
                    }
                    this.editorTransfer.clearData(dnd_3.DraggedEditorIdentifier.prototype);
                }
            }
            // Check for tree items
            else if (this.treeItemsTransfer.hasData(treeViewsDnd_1.DraggedTreeItemsIdentifier.prototype)) {
                const data = this.treeItemsTransfer.getData(treeViewsDnd_1.DraggedTreeItemsIdentifier.prototype);
                if (Array.isArray(data)) {
                    const editors = [];
                    for (const id of data) {
                        const dataTransferItem = await this.treeViewsDragAndDropService.removeDragOperationTransfer(id.identifier);
                        if (dataTransferItem) {
                            const treeDropData = await (0, dnd_3.extractTreeDropData)(dataTransferItem);
                            editors.push(...treeDropData.map(editor => ({ ...editor, options: { ...editor.options, pinned: true } })));
                        }
                    }
                    if (editors.length) {
                        this.editorService.openEditors(editors, ensureTargetGroup(), { validateTrust: true });
                    }
                }
                this.treeItemsTransfer.clearData(treeViewsDnd_1.DraggedTreeItemsIdentifier.prototype);
            }
            // Check for URI transfer
            else {
                const dropHandler = this.instantiationService.createInstance(dnd_3.ResourcesDropHandler, { allowWorkspaceOpen: !platform_1.isWeb || (0, workspace_1.isTemporaryWorkspace)(this.contextService.getWorkspace()) });
                dropHandler.handleDrop(event, () => ensureTargetGroup(), targetGroup => targetGroup?.focus());
            }
        }
        isCopyOperation(e, draggedEditor) {
            if (draggedEditor?.editor.hasCapability(8 /* EditorInputCapabilities.Singleton */)) {
                return false; // Singleton editors cannot be split
            }
            return (e.ctrlKey && !platform_1.isMacintosh) || (e.altKey && platform_1.isMacintosh);
        }
        isToggleSplitOperation(e) {
            return (e.altKey && !platform_1.isMacintosh) || (e.shiftKey && platform_1.isMacintosh);
        }
        positionOverlay(mousePosX, mousePosY, isDraggingGroup, enableSplitting) {
            const preferSplitVertically = this.accessor.partOptions.openSideBySideDirection === 'right';
            const editorControlWidth = this.groupView.element.clientWidth;
            const editorControlHeight = this.groupView.element.clientHeight - this.getOverlayOffsetHeight();
            let edgeWidthThresholdFactor;
            let edgeHeightThresholdFactor;
            if (enableSplitting) {
                if (isDraggingGroup) {
                    edgeWidthThresholdFactor = preferSplitVertically ? 0.3 : 0.1; // give larger threshold when dragging group depending on preferred split direction
                }
                else {
                    edgeWidthThresholdFactor = 0.1; // 10% threshold to split if dragging editors
                }
                if (isDraggingGroup) {
                    edgeHeightThresholdFactor = preferSplitVertically ? 0.1 : 0.3; // give larger threshold when dragging group depending on preferred split direction
                }
                else {
                    edgeHeightThresholdFactor = 0.1; // 10% threshold to split if dragging editors
                }
            }
            else {
                edgeWidthThresholdFactor = 0;
                edgeHeightThresholdFactor = 0;
            }
            const edgeWidthThreshold = editorControlWidth * edgeWidthThresholdFactor;
            const edgeHeightThreshold = editorControlHeight * edgeHeightThresholdFactor;
            const splitWidthThreshold = editorControlWidth / 3; // offer to split left/right at 33%
            const splitHeightThreshold = editorControlHeight / 3; // offer to split up/down at 33%
            // No split if mouse is above certain threshold in the center of the view
            let splitDirection;
            if (mousePosX > edgeWidthThreshold && mousePosX < editorControlWidth - edgeWidthThreshold &&
                mousePosY > edgeHeightThreshold && mousePosY < editorControlHeight - edgeHeightThreshold) {
                splitDirection = undefined;
            }
            // Offer to split otherwise
            else {
                // User prefers to split vertically: offer a larger hitzone
                // for this direction like so:
                // ----------------------------------------------
                // |		|		SPLIT UP		|			|
                // | SPLIT 	|-----------------------|	SPLIT	|
                // |		|		  MERGE			|			|
                // | LEFT	|-----------------------|	RIGHT	|
                // |		|		SPLIT DOWN		|			|
                // ----------------------------------------------
                if (preferSplitVertically) {
                    if (mousePosX < splitWidthThreshold) {
                        splitDirection = 2 /* GroupDirection.LEFT */;
                    }
                    else if (mousePosX > splitWidthThreshold * 2) {
                        splitDirection = 3 /* GroupDirection.RIGHT */;
                    }
                    else if (mousePosY < editorControlHeight / 2) {
                        splitDirection = 0 /* GroupDirection.UP */;
                    }
                    else {
                        splitDirection = 1 /* GroupDirection.DOWN */;
                    }
                }
                // User prefers to split horizontally: offer a larger hitzone
                // for this direction like so:
                // ----------------------------------------------
                // |				SPLIT UP					|
                // |--------------------------------------------|
                // |  SPLIT LEFT  |	   MERGE	|  SPLIT RIGHT  |
                // |--------------------------------------------|
                // |				SPLIT DOWN					|
                // ----------------------------------------------
                else {
                    if (mousePosY < splitHeightThreshold) {
                        splitDirection = 0 /* GroupDirection.UP */;
                    }
                    else if (mousePosY > splitHeightThreshold * 2) {
                        splitDirection = 1 /* GroupDirection.DOWN */;
                    }
                    else if (mousePosX < editorControlWidth / 2) {
                        splitDirection = 2 /* GroupDirection.LEFT */;
                    }
                    else {
                        splitDirection = 3 /* GroupDirection.RIGHT */;
                    }
                }
            }
            // Draw overlay based on split direction
            switch (splitDirection) {
                case 0 /* GroupDirection.UP */:
                    this.doPositionOverlay({ top: '0', left: '0', width: '100%', height: '50%' });
                    this.toggleDropIntoPrompt(false);
                    break;
                case 1 /* GroupDirection.DOWN */:
                    this.doPositionOverlay({ top: '50%', left: '0', width: '100%', height: '50%' });
                    this.toggleDropIntoPrompt(false);
                    break;
                case 2 /* GroupDirection.LEFT */:
                    this.doPositionOverlay({ top: '0', left: '0', width: '50%', height: '100%' });
                    this.toggleDropIntoPrompt(false);
                    break;
                case 3 /* GroupDirection.RIGHT */:
                    this.doPositionOverlay({ top: '0', left: '50%', width: '50%', height: '100%' });
                    this.toggleDropIntoPrompt(false);
                    break;
                default:
                    this.doPositionOverlay({ top: '0', left: '0', width: '100%', height: '100%' });
                    this.toggleDropIntoPrompt(true);
            }
            // Make sure the overlay is visible now
            const overlay = (0, types_1.assertIsDefined)(this.overlay);
            overlay.style.opacity = '1';
            // Enable transition after a timeout to prevent initial animation
            setTimeout(() => overlay.classList.add('overlay-move-transition'), 0);
            // Remember as current split direction
            this.currentDropOperation = { splitDirection };
        }
        doPositionOverlay(options) {
            const [container, overlay] = (0, types_1.assertAllDefined)(this.container, this.overlay);
            // Container
            const offsetHeight = this.getOverlayOffsetHeight();
            if (offsetHeight) {
                container.style.height = `calc(100% - ${offsetHeight}px)`;
            }
            else {
                container.style.height = '100%';
            }
            // Overlay
            overlay.style.top = options.top;
            overlay.style.left = options.left;
            overlay.style.width = options.width;
            overlay.style.height = options.height;
        }
        getOverlayOffsetHeight() {
            // With tabs and opened editors: use the area below tabs as drop target
            if (!this.groupView.isEmpty && this.accessor.partOptions.showTabs) {
                return this.groupView.titleHeight.offset;
            }
            // Without tabs or empty group: use entire editor area as drop target
            return 0;
        }
        hideOverlay() {
            const overlay = (0, types_1.assertIsDefined)(this.overlay);
            // Reset overlay
            this.doPositionOverlay({ top: '0', left: '0', width: '100%', height: '100%' });
            overlay.style.opacity = '0';
            overlay.classList.remove('overlay-move-transition');
            // Reset current operation
            this.currentDropOperation = undefined;
        }
        toggleDropIntoPrompt(showing) {
            if (!this.dropIntoPromptElement) {
                return;
            }
            this.dropIntoPromptElement.style.opacity = showing ? '1' : '0';
        }
        contains(element) {
            return element === this.container || element === this.overlay;
        }
        dispose() {
            super.dispose();
            this._disposed = true;
        }
    };
    DropOverlay = DropOverlay_1 = __decorate([
        __param(2, themeService_1.IThemeService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, editorService_1.IEditorService),
        __param(6, editorGroupsService_1.IEditorGroupsService),
        __param(7, treeViewsDndService_1.ITreeViewsDnDService),
        __param(8, workspace_1.IWorkspaceContextService)
    ], DropOverlay);
    let EditorDropTarget = class EditorDropTarget extends themeService_1.Themable {
        constructor(accessor, container, delegate, themeService, configurationService, instantiationService) {
            super(themeService);
            this.accessor = accessor;
            this.container = container;
            this.delegate = delegate;
            this.configurationService = configurationService;
            this.instantiationService = instantiationService;
            this.counter = 0;
            this.editorTransfer = dnd_2.LocalSelectionTransfer.getInstance();
            this.groupTransfer = dnd_2.LocalSelectionTransfer.getInstance();
            this.registerListeners();
        }
        get overlay() {
            if (this._overlay && !this._overlay.disposed) {
                return this._overlay;
            }
            return undefined;
        }
        registerListeners() {
            this._register((0, dom_1.addDisposableListener)(this.container, dom_1.EventType.DRAG_ENTER, e => this.onDragEnter(e)));
            this._register((0, dom_1.addDisposableListener)(this.container, dom_1.EventType.DRAG_LEAVE, () => this.onDragLeave()));
            [this.container, window].forEach(node => this._register((0, dom_1.addDisposableListener)(node, dom_1.EventType.DRAG_END, () => this.onDragEnd())));
        }
        onDragEnter(event) {
            if (isDropIntoEditorEnabledGlobally(this.configurationService) && isDragIntoEditorEvent(event)) {
                return;
            }
            this.counter++;
            // Validate transfer
            if (!this.editorTransfer.hasData(dnd_3.DraggedEditorIdentifier.prototype) &&
                !this.groupTransfer.hasData(dnd_3.DraggedEditorGroupIdentifier.prototype) &&
                event.dataTransfer) {
                const dndContributions = platform_2.Registry.as(dnd_2.Extensions.DragAndDropContribution).getAll();
                const dndContributionKeys = Array.from(dndContributions).map(e => e.dataFormatKey);
                if (!(0, dnd_2.containsDragType)(event, dnd_1.DataTransfers.FILES, dnd_2.CodeDataTransfers.FILES, dnd_1.DataTransfers.RESOURCES, dnd_2.CodeDataTransfers.EDITORS, ...dndContributionKeys)) { // see https://github.com/microsoft/vscode/issues/25789
                    event.dataTransfer.dropEffect = 'none';
                    return; // unsupported transfer
                }
            }
            // Signal DND start
            this.updateContainer(true);
            const target = event.target;
            if (target) {
                // Somehow we managed to move the mouse quickly out of the current overlay, so destroy it
                if (this.overlay && !this.overlay.contains(target)) {
                    this.disposeOverlay();
                }
                // Create overlay over target
                if (!this.overlay) {
                    const targetGroupView = this.findTargetGroupView(target);
                    if (targetGroupView) {
                        this._overlay = this.instantiationService.createInstance(DropOverlay, this.accessor, targetGroupView);
                    }
                }
            }
        }
        onDragLeave() {
            this.counter--;
            if (this.counter === 0) {
                this.updateContainer(false);
            }
        }
        onDragEnd() {
            this.counter = 0;
            this.updateContainer(false);
            this.disposeOverlay();
        }
        findTargetGroupView(child) {
            const groups = this.accessor.groups;
            return groups.find(groupView => (0, dom_1.isAncestor)(child, groupView.element) || this.delegate.containsGroup?.(groupView));
        }
        updateContainer(isDraggedOver) {
            this.container.classList.toggle('dragged-over', isDraggedOver);
        }
        dispose() {
            super.dispose();
            this.disposeOverlay();
        }
        disposeOverlay() {
            if (this.overlay) {
                this.overlay.dispose();
                this._overlay = undefined;
            }
        }
    };
    exports.EditorDropTarget = EditorDropTarget;
    exports.EditorDropTarget = EditorDropTarget = __decorate([
        __param(3, themeService_1.IThemeService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, instantiation_1.IInstantiationService)
    ], EditorDropTarget);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yRHJvcFRhcmdldC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3BhcnRzL2VkaXRvci9lZGl0b3JEcm9wVGFyZ2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUErQmhHLFNBQVMsK0JBQStCLENBQUMsb0JBQTJDO1FBQ25GLE9BQU8sb0JBQW9CLENBQUMsUUFBUSxDQUFVLCtCQUErQixDQUFDLENBQUM7SUFDaEYsQ0FBQztJQUVELFNBQVMscUJBQXFCLENBQUMsQ0FBWTtRQUMxQyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUM7SUFDbkIsQ0FBQztJQUVELElBQU0sV0FBVyxHQUFqQixNQUFNLFdBQVksU0FBUSx1QkFBUTs7aUJBRVQsZUFBVSxHQUFHLHNDQUFzQyxBQUF6QyxDQUEwQztRQVM1RSxJQUFJLFFBQVEsS0FBYyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQVVwRCxZQUNTLFFBQStCLEVBQy9CLFNBQTJCLEVBQ3BCLFlBQTJCLEVBQ25CLG9CQUE0RCxFQUM1RCxvQkFBNEQsRUFDbkUsYUFBOEMsRUFDeEMsa0JBQXlELEVBQ3pELDJCQUFrRSxFQUM5RCxjQUF5RDtZQUVuRixLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7WUFWWixhQUFRLEdBQVIsUUFBUSxDQUF1QjtZQUMvQixjQUFTLEdBQVQsU0FBUyxDQUFrQjtZQUVLLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDM0MseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUNsRCxrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFDdkIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFzQjtZQUN4QyxnQ0FBMkIsR0FBM0IsMkJBQTJCLENBQXNCO1lBQzdDLG1CQUFjLEdBQWQsY0FBYyxDQUEwQjtZQWZu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