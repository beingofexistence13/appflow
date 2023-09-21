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
define(["require", "exports", "vs/base/browser/dnd", "vs/base/browser/dom", "vs/base/browser/formattedTextRenderer", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/types", "vs/nls!vs/workbench/browser/parts/editor/editorDropTarget", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/platform/workspace/common/workspace", "vs/platform/dnd/browser/dnd", "vs/workbench/browser/dnd", "vs/workbench/browser/parts/editor/editor", "vs/workbench/common/theme", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/editor/common/services/treeViewsDndService", "vs/editor/common/services/treeViewsDnd", "vs/css!./media/editordroptarget"], function (require, exports, dnd_1, dom_1, formattedTextRenderer_1, async_1, lifecycle_1, platform_1, types_1, nls_1, configuration_1, instantiation_1, platform_2, colorRegistry_1, themeService_1, workspace_1, dnd_2, dnd_3, editor_1, theme_1, editorGroupsService_1, editorService_1, treeViewsDndService_1, treeViewsDnd_1) {
    "use strict";
    var DropOverlay_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$dfb = void 0;
    function isDropIntoEditorEnabledGlobally(configurationService) {
        return configurationService.getValue('editor.dropIntoEditor.enabled');
    }
    function isDragIntoEditorEvent(e) {
        return e.shiftKey;
    }
    let DropOverlay = class DropOverlay extends themeService_1.$nv {
        static { DropOverlay_1 = this; }
        static { this.a = 'monaco-workbench-editor-drop-overlay'; }
        get disposed() { return !!this.j; }
        constructor(y, C, themeService, D, F, G, H, I, J) {
            super(themeService);
            this.y = y;
            this.C = C;
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.J = J;
            this.r = dnd_2.$_6.getInstance();
            this.s = dnd_2.$_6.getInstance();
            this.t = dnd_2.$_6.getInstance();
            this.m = this.B(new async_1.$Sg(() => this.dispose(), 300));
            this.u = isDropIntoEditorEnabledGlobally(this.D) && this.N();
            this.L();
        }
        L() {
            const overlayOffsetHeight = this.W();
            // Container
            const container = this.b = document.createElement('div');
            container.id = DropOverlay_1.a;
            container.style.top = `${overlayOffsetHeight}px`;
            // Parent
            this.C.element.appendChild(container);
            this.C.element.classList.add('dragged-over');
            this.B((0, lifecycle_1.$ic)(() => {
                this.C.element.removeChild(container);
                this.C.element.classList.remove('dragged-over');
            }));
            // Overlay
            this.c = document.createElement('div');
            this.c.classList.add('editor-group-overlay-indicator');
            container.appendChild(this.c);
            if (this.u) {
                this.f = (0, formattedTextRenderer_1.$7P)((0, nls_1.localize)(0, null, platform_1.$j ? '⇧' : 'Shift'), {});
                this.f.classList.add('editor-group-overlay-drop-into-prompt');
                this.c.appendChild(this.f);
            }
            // Overlay Event Handling
            this.M(container);
            // Styles
            this.updateStyles();
        }
        updateStyles() {
            const overlay = (0, types_1.$uf)(this.c);
            // Overlay drop background
            overlay.style.backgroundColor = this.z(theme_1.$F_) || '';
            // Overlay contrast border (if any)
            const activeContrastBorderColor = this.z(colorRegistry_1.$Bv);
            overlay.style.outlineColor = activeContrastBorderColor || '';
            overlay.style.outlineOffset = activeContrastBorderColor ? '-2px' : '';
            overlay.style.outlineStyle = activeContrastBorderColor ? 'dashed' : '';
            overlay.style.outlineWidth = activeContrastBorderColor ? '2px' : '';
            if (this.f) {
                this.f.style.backgroundColor = this.z(theme_1.$H_) ?? '';
                this.f.style.color = this.z(theme_1.$G_) ?? '';
                const borderColor = this.z(theme_1.$I_);
                if (borderColor) {
                    this.f.style.borderWidth = '1px';
                    this.f.style.borderStyle = 'solid';
                    this.f.style.borderColor = borderColor;
                }
                else {
                    this.f.style.borderWidth = '0';
                }
            }
        }
        M(container) {
            this.B(new dom_1.$zP(container, {
                onDragEnter: e => undefined,
                onDragOver: e => {
                    if (this.u && isDragIntoEditorEvent(e)) {
                        this.dispose();
                        return;
                    }
                    const isDraggingGroup = this.s.hasData(dnd_3.$seb.prototype);
                    const isDraggingEditor = this.r.hasData(dnd_3.$reb.prototype);
                    // Update the dropEffect to "copy" if there is no local data to be dragged because
                    // in that case we can only copy the data into and not move it from its source
                    if (!isDraggingEditor && !isDraggingGroup && e.dataTransfer) {
                        e.dataTransfer.dropEffect = 'copy';
                    }
                    // Find out if operation is valid
                    let isCopy = true;
                    if (isDraggingGroup) {
                        isCopy = this.Q(e);
                    }
                    else if (isDraggingEditor) {
                        const data = this.r.getData(dnd_3.$reb.prototype);
                        if (Array.isArray(data)) {
                            isCopy = this.Q(e, data[0].identifier);
                        }
                    }
                    if (!isCopy) {
                        const sourceGroupView = this.O();
                        if (sourceGroupView === this.C) {
                            if (isDraggingGroup || (isDraggingEditor && sourceGroupView.count < 2)) {
                                this.X();
                                return; // do not allow to drop group/editor on itself if this results in an empty group
                            }
                        }
                    }
                    // Position overlay and conditionally enable or disable
                    // editor group splitting support based on setting and
                    // keymodifiers used.
                    let splitOnDragAndDrop = !!this.H.partOptions.splitOnDragAndDrop;
                    if (this.R(e)) {
                        splitOnDragAndDrop = !splitOnDragAndDrop;
                    }
                    this.S(e.offsetX, e.offsetY, isDraggingGroup, splitOnDragAndDrop);
                    // Make sure to stop any running cleanup scheduler to remove the overlay
                    if (this.m.isScheduled()) {
                        this.m.cancel();
                    }
                },
                onDragLeave: e => this.dispose(),
                onDragEnd: e => this.dispose(),
                onDrop: e => {
                    dom_1.$5O.stop(e, true);
                    // Dispose overlay
                    this.dispose();
                    // Handle drop if we have a valid operation
                    if (this.g) {
                        this.P(e, this.g.splitDirection);
                    }
                }
            }));
            this.B((0, dom_1.$nO)(container, dom_1.$3O.MOUSE_OVER, () => {
                // Under some circumstances we have seen reports where the drop overlay is not being
                // cleaned up and as such the editor area remains under the overlay so that you cannot
                // type into the editor anymore. This seems related to using VMs and DND via host and
                // guest OS, though some users also saw it without VMs.
                // To protect against this issue we always destroy the overlay as soon as we detect a
                // mouse event over it. The delay is used to guarantee we are not interfering with the
                // actual DROP event that can also trigger a mouse over event.
                if (!this.m.isScheduled()) {
                    this.m.schedule();
                }
            }));
        }
        N() {
            return !!this.C.activeEditor?.hasCapability(128 /* EditorInputCapabilities.CanDropIntoEditor */);
        }
        O() {
            // Check for group transfer
            if (this.s.hasData(dnd_3.$seb.prototype)) {
                const data = this.s.getData(dnd_3.$seb.prototype);
                if (Array.isArray(data)) {
                    return this.y.getGroup(data[0].identifier);
                }
            }
            // Check for editor transfer
            else if (this.r.hasData(dnd_3.$reb.prototype)) {
                const data = this.r.getData(dnd_3.$reb.prototype);
                if (Array.isArray(data)) {
                    return this.y.getGroup(data[0].identifier.groupId);
                }
            }
            return undefined;
        }
        async P(event, splitDirection) {
            // Determine target group
            const ensureTargetGroup = () => {
                let targetGroup;
                if (typeof splitDirection === 'number') {
                    targetGroup = this.y.addGroup(this.C, splitDirection);
                }
                else {
                    targetGroup = this.C;
                }
                return targetGroup;
            };
            // Check for group transfer
            if (this.s.hasData(dnd_3.$seb.prototype)) {
                const data = this.s.getData(dnd_3.$seb.prototype);
                if (Array.isArray(data)) {
                    const sourceGroup = this.y.getGroup(data[0].identifier);
                    if (sourceGroup) {
                        if (typeof splitDirection !== 'number' && sourceGroup === this.C) {
                            return;
                        }
                        // Split to new group
                        let targetGroup;
                        if (typeof splitDirection === 'number') {
                            if (this.Q(event)) {
                                targetGroup = this.y.copyGroup(sourceGroup, this.C, splitDirection);
                            }
                            else {
                                targetGroup = this.y.moveGroup(sourceGroup, this.C, splitDirection);
                            }
                        }
                        // Merge into existing group
                        else {
                            let mergeGroupOptions = undefined;
                            if (this.Q(event)) {
                                mergeGroupOptions = { mode: 0 /* MergeGroupMode.COPY_EDITORS */ };
                            }
                            this.y.mergeGroup(sourceGroup, this.C, mergeGroupOptions);
                        }
                        if (targetGroup) {
                            this.y.activateGroup(targetGroup);
                        }
                    }
                    this.s.clearData(dnd_3.$seb.prototype);
                }
            }
            // Check for editor transfer
            else if (this.r.hasData(dnd_3.$reb.prototype)) {
                const data = this.r.getData(dnd_3.$reb.prototype);
                if (Array.isArray(data)) {
                    const draggedEditor = data[0].identifier;
                    const sourceGroup = this.y.getGroup(draggedEditor.groupId);
                    if (sourceGroup) {
                        const copyEditor = this.Q(event, draggedEditor);
                        let targetGroup = undefined;
                        // Optimization: if we move the last editor of an editor group
                        // and we are configured to close empty editor groups, we can
                        // rather move the entire editor group according to the direction
                        if (this.H.partOptions.closeEmptyGroups && sourceGroup.count === 1 && typeof splitDirection === 'number' && !copyEditor) {
                            targetGroup = this.y.moveGroup(sourceGroup, this.C, splitDirection);
                        }
                        // In any other case do a normal move/copy operation
                        else {
                            targetGroup = ensureTargetGroup();
                            if (sourceGroup === targetGroup) {
                                return;
                            }
                            // Open in target group
                            const options = (0, editor_1.$9T)(sourceGroup, draggedEditor.editor, {
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
                    this.r.clearData(dnd_3.$reb.prototype);
                }
            }
            // Check for tree items
            else if (this.t.hasData(treeViewsDnd_1.$m7.prototype)) {
                const data = this.t.getData(treeViewsDnd_1.$m7.prototype);
                if (Array.isArray(data)) {
                    const editors = [];
                    for (const id of data) {
                        const dataTransferItem = await this.I.removeDragOperationTransfer(id.identifier);
                        if (dataTransferItem) {
                            const treeDropData = await (0, dnd_3.$teb)(dataTransferItem);
                            editors.push(...treeDropData.map(editor => ({ ...editor, options: { ...editor.options, pinned: true } })));
                        }
                    }
                    if (editors.length) {
                        this.G.openEditors(editors, ensureTargetGroup(), { validateTrust: true });
                    }
                }
                this.t.clearData(treeViewsDnd_1.$m7.prototype);
            }
            // Check for URI transfer
            else {
                const dropHandler = this.F.createInstance(dnd_3.$ueb, { allowWorkspaceOpen: !platform_1.$o || (0, workspace_1.$3h)(this.J.getWorkspace()) });
                dropHandler.handleDrop(event, () => ensureTargetGroup(), targetGroup => targetGroup?.focus());
            }
        }
        Q(e, draggedEditor) {
            if (draggedEditor?.editor.hasCapability(8 /* EditorInputCapabilities.Singleton */)) {
                return false; // Singleton editors cannot be split
            }
            return (e.ctrlKey && !platform_1.$j) || (e.altKey && platform_1.$j);
        }
        R(e) {
            return (e.altKey && !platform_1.$j) || (e.shiftKey && platform_1.$j);
        }
        S(mousePosX, mousePosY, isDraggingGroup, enableSplitting) {
            const preferSplitVertically = this.y.partOptions.openSideBySideDirection === 'right';
            const editorControlWidth = this.C.element.clientWidth;
            const editorControlHeight = this.C.element.clientHeight - this.W();
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
                    this.U({ top: '0', left: '0', width: '100%', height: '50%' });
                    this.Y(false);
                    break;
                case 1 /* GroupDirection.DOWN */:
                    this.U({ top: '50%', left: '0', width: '100%', height: '50%' });
                    this.Y(false);
                    break;
                case 2 /* GroupDirection.LEFT */:
                    this.U({ top: '0', left: '0', width: '50%', height: '100%' });
                    this.Y(false);
                    break;
                case 3 /* GroupDirection.RIGHT */:
                    this.U({ top: '0', left: '50%', width: '50%', height: '100%' });
                    this.Y(false);
                    break;
                default:
                    this.U({ top: '0', left: '0', width: '100%', height: '100%' });
                    this.Y(true);
            }
            // Make sure the overlay is visible now
            const overlay = (0, types_1.$uf)(this.c);
            overlay.style.opacity = '1';
            // Enable transition after a timeout to prevent initial animation
            setTimeout(() => overlay.classList.add('overlay-move-transition'), 0);
            // Remember as current split direction
            this.g = { splitDirection };
        }
        U(options) {
            const [container, overlay] = (0, types_1.$vf)(this.b, this.c);
            // Container
            const offsetHeight = this.W();
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
        W() {
            // With tabs and opened editors: use the area below tabs as drop target
            if (!this.C.isEmpty && this.y.partOptions.showTabs) {
                return this.C.titleHeight.offset;
            }
            // Without tabs or empty group: use entire editor area as drop target
            return 0;
        }
        X() {
            const overlay = (0, types_1.$uf)(this.c);
            // Reset overlay
            this.U({ top: '0', left: '0', width: '100%', height: '100%' });
            overlay.style.opacity = '0';
            overlay.classList.remove('overlay-move-transition');
            // Reset current operation
            this.g = undefined;
        }
        Y(showing) {
            if (!this.f) {
                return;
            }
            this.f.style.opacity = showing ? '1' : '0';
        }
        contains(element) {
            return element === this.b || element === this.c;
        }
        dispose() {
            super.dispose();
            this.j = true;
        }
    };
    DropOverlay = DropOverlay_1 = __decorate([
        __param(2, themeService_1.$gv),
        __param(3, configuration_1.$8h),
        __param(4, instantiation_1.$Ah),
        __param(5, editorService_1.$9C),
        __param(6, editorGroupsService_1.$5C),
        __param(7, treeViewsDndService_1.$n7),
        __param(8, workspace_1.$Kh)
    ], DropOverlay);
    let $dfb = class $dfb extends themeService_1.$nv {
        constructor(g, j, m, themeService, r, s) {
            super(themeService);
            this.g = g;
            this.j = j;
            this.m = m;
            this.r = r;
            this.s = s;
            this.b = 0;
            this.c = dnd_2.$_6.getInstance();
            this.f = dnd_2.$_6.getInstance();
            this.u();
        }
        get t() {
            if (this.a && !this.a.disposed) {
                return this.a;
            }
            return undefined;
        }
        u() {
            this.B((0, dom_1.$nO)(this.j, dom_1.$3O.DRAG_ENTER, e => this.y(e)));
            this.B((0, dom_1.$nO)(this.j, dom_1.$3O.DRAG_LEAVE, () => this.C()));
            [this.j, window].forEach(node => this.B((0, dom_1.$nO)(node, dom_1.$3O.DRAG_END, () => this.D())));
        }
        y(event) {
            if (isDropIntoEditorEnabledGlobally(this.r) && isDragIntoEditorEvent(event)) {
                return;
            }
            this.b++;
            // Validate transfer
            if (!this.c.hasData(dnd_3.$reb.prototype) &&
                !this.f.hasData(dnd_3.$seb.prototype) &&
                event.dataTransfer) {
                const dndContributions = platform_2.$8m.as(dnd_2.$$6.DragAndDropContribution).getAll();
                const dndContributionKeys = Array.from(dndContributions).map(e => e.dataFormatKey);
                if (!(0, dnd_2.$06)(event, dnd_1.$CP.FILES, dnd_2.$56.FILES, dnd_1.$CP.RESOURCES, dnd_2.$56.EDITORS, ...dndContributionKeys)) { // see https://github.com/microsoft/vscode/issues/25789
                    event.dataTransfer.dropEffect = 'none';
                    return; // unsupported transfer
                }
            }
            // Signal DND start
            this.G(true);
            const target = event.target;
            if (target) {
                // Somehow we managed to move the mouse quickly out of the current overlay, so destroy it
                if (this.t && !this.t.contains(target)) {
                    this.H();
                }
                // Create overlay over target
                if (!this.t) {
                    const targetGroupView = this.F(target);
                    if (targetGroupView) {
                        this.a = this.s.createInstance(DropOverlay, this.g, targetGroupView);
                    }
                }
            }
        }
        C() {
            this.b--;
            if (this.b === 0) {
                this.G(false);
            }
        }
        D() {
            this.b = 0;
            this.G(false);
            this.H();
        }
        F(child) {
            const groups = this.g.groups;
            return groups.find(groupView => (0, dom_1.$NO)(child, groupView.element) || this.m.containsGroup?.(groupView));
        }
        G(isDraggedOver) {
            this.j.classList.toggle('dragged-over', isDraggedOver);
        }
        dispose() {
            super.dispose();
            this.H();
        }
        H() {
            if (this.t) {
                this.t.dispose();
                this.a = undefined;
            }
        }
    };
    exports.$dfb = $dfb;
    exports.$dfb = $dfb = __decorate([
        __param(3, themeService_1.$gv),
        __param(4, configuration_1.$8h),
        __param(5, instantiation_1.$Ah)
    ], $dfb);
});
//# sourceMappingURL=editorDropTarget.js.map