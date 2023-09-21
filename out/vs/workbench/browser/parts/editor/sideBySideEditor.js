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
define(["require", "exports", "vs/nls", "vs/base/browser/dom", "vs/platform/registry/common/platform", "vs/workbench/common/editor", "vs/workbench/common/editor/sideBySideEditorInput", "vs/platform/telemetry/common/telemetry", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/themeService", "vs/workbench/services/editor/common/editorGroupsService", "vs/base/browser/ui/splitview/splitview", "vs/base/common/event", "vs/platform/storage/common/storage", "vs/base/common/types", "vs/platform/configuration/common/configuration", "vs/workbench/browser/parts/editor/editor", "vs/base/common/lifecycle", "vs/workbench/common/theme", "vs/workbench/browser/parts/editor/editorWithViewState", "vs/editor/common/services/textResourceConfiguration", "vs/workbench/services/editor/common/editorService", "vs/base/common/resources", "vs/base/common/uri", "vs/css!./media/sidebysideeditor"], function (require, exports, nls_1, dom_1, platform_1, editor_1, sideBySideEditorInput_1, telemetry_1, instantiation_1, themeService_1, editorGroupsService_1, splitview_1, event_1, storage_1, types_1, configuration_1, editor_2, lifecycle_1, theme_1, editorWithViewState_1, textResourceConfiguration_1, editorService_1, resources_1, uri_1) {
    "use strict";
    var SideBySideEditor_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SideBySideEditor = void 0;
    function isSideBySideEditorViewState(thing) {
        const candidate = thing;
        return typeof candidate?.primary === 'object' && typeof candidate.secondary === 'object';
    }
    let SideBySideEditor = class SideBySideEditor extends editorWithViewState_1.AbstractEditorWithViewState {
        static { SideBySideEditor_1 = this; }
        static { this.ID = editor_1.SIDE_BY_SIDE_EDITOR_ID; }
        static { this.SIDE_BY_SIDE_LAYOUT_SETTING = 'workbench.editor.splitInGroupLayout'; }
        static { this.VIEW_STATE_PREFERENCE_KEY = 'sideBySideEditorViewState'; }
        //#region Layout Constraints
        get minimumPrimaryWidth() { return this.primaryEditorPane ? this.primaryEditorPane.minimumWidth : 0; }
        get maximumPrimaryWidth() { return this.primaryEditorPane ? this.primaryEditorPane.maximumWidth : Number.POSITIVE_INFINITY; }
        get minimumPrimaryHeight() { return this.primaryEditorPane ? this.primaryEditorPane.minimumHeight : 0; }
        get maximumPrimaryHeight() { return this.primaryEditorPane ? this.primaryEditorPane.maximumHeight : Number.POSITIVE_INFINITY; }
        get minimumSecondaryWidth() { return this.secondaryEditorPane ? this.secondaryEditorPane.minimumWidth : 0; }
        get maximumSecondaryWidth() { return this.secondaryEditorPane ? this.secondaryEditorPane.maximumWidth : Number.POSITIVE_INFINITY; }
        get minimumSecondaryHeight() { return this.secondaryEditorPane ? this.secondaryEditorPane.minimumHeight : 0; }
        get maximumSecondaryHeight() { return this.secondaryEditorPane ? this.secondaryEditorPane.maximumHeight : Number.POSITIVE_INFINITY; }
        set minimumWidth(value) { }
        set maximumWidth(value) { }
        set minimumHeight(value) { }
        set maximumHeight(value) { }
        get minimumWidth() { return this.minimumPrimaryWidth + this.minimumSecondaryWidth; }
        get maximumWidth() { return this.maximumPrimaryWidth + this.maximumSecondaryWidth; }
        get minimumHeight() { return this.minimumPrimaryHeight + this.minimumSecondaryHeight; }
        get maximumHeight() { return this.maximumPrimaryHeight + this.maximumSecondaryHeight; }
        constructor(telemetryService, instantiationService, themeService, storageService, configurationService, textResourceConfigurationService, editorService, editorGroupService) {
            super(SideBySideEditor_1.ID, SideBySideEditor_1.VIEW_STATE_PREFERENCE_KEY, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorService, editorGroupService);
            this.configurationService = configurationService;
            //#endregion
            //#region Events
            this.onDidCreateEditors = this._register(new event_1.Emitter());
            this._onDidChangeSizeConstraints = this._register(new event_1.Relay());
            this.onDidChangeSizeConstraints = event_1.Event.any(this.onDidCreateEditors.event, this._onDidChangeSizeConstraints.event);
            this._onDidChangeSelection = this._register(new event_1.Emitter());
            this.onDidChangeSelection = this._onDidChangeSelection.event;
            //#endregion
            this.primaryEditorPane = undefined;
            this.secondaryEditorPane = undefined;
            this.splitviewDisposables = this._register(new lifecycle_1.DisposableStore());
            this.editorDisposables = this._register(new lifecycle_1.DisposableStore());
            this.orientation = this.configurationService.getValue(SideBySideEditor_1.SIDE_BY_SIDE_LAYOUT_SETTING) === 'vertical' ? 0 /* Orientation.VERTICAL */ : 1 /* Orientation.HORIZONTAL */;
            this.dimension = new dom_1.Dimension(0, 0);
            this.lastFocusedSide = undefined;
            this.registerListeners();
        }
        registerListeners() {
            this._register(this.configurationService.onDidChangeConfiguration(e => this.onConfigurationUpdated(e)));
        }
        onConfigurationUpdated(event) {
            if (event.affectsConfiguration(SideBySideEditor_1.SIDE_BY_SIDE_LAYOUT_SETTING)) {
                this.orientation = this.configurationService.getValue(SideBySideEditor_1.SIDE_BY_SIDE_LAYOUT_SETTING) === 'vertical' ? 0 /* Orientation.VERTICAL */ : 1 /* Orientation.HORIZONTAL */;
                // If config updated from event, re-create the split
                // editor using the new layout orientation if it was
                // already created.
                if (this.splitview) {
                    this.recreateSplitview();
                }
            }
        }
        recreateSplitview() {
            const container = (0, types_1.assertIsDefined)(this.getContainer());
            // Clear old (if any) but remember ratio
            const ratio = this.getSplitViewRatio();
            if (this.splitview) {
                container.removeChild(this.splitview.el);
                this.splitviewDisposables.clear();
            }
            // Create new
            this.createSplitView(container, ratio);
            this.layout(this.dimension);
        }
        getSplitViewRatio() {
            let ratio = undefined;
            if (this.splitview) {
                const leftViewSize = this.splitview.getViewSize(0);
                const rightViewSize = this.splitview.getViewSize(1);
                // Only return a ratio when the view size is significantly
                // enough different for left and right view sizes
                if (Math.abs(leftViewSize - rightViewSize) > 1) {
                    const totalSize = this.splitview.orientation === 1 /* Orientation.HORIZONTAL */ ? this.dimension.width : this.dimension.height;
                    ratio = leftViewSize / totalSize;
                }
            }
            return ratio;
        }
        createEditor(parent) {
            parent.classList.add('side-by-side-editor');
            // Editor pane containers
            this.secondaryEditorContainer = (0, dom_1.$)('.side-by-side-editor-container.editor-instance');
            this.primaryEditorContainer = (0, dom_1.$)('.side-by-side-editor-container.editor-instance');
            // Split view
            this.createSplitView(parent);
        }
        createSplitView(parent, ratio) {
            // Splitview widget
            this.splitview = this.splitviewDisposables.add(new splitview_1.SplitView(parent, { orientation: this.orientation }));
            this.splitviewDisposables.add(this.splitview.onDidSashReset(() => this.splitview?.distributeViewSizes()));
            if (this.orientation === 1 /* Orientation.HORIZONTAL */) {
                this.splitview.orthogonalEndSash = this._boundarySashes?.bottom;
            }
            else {
                this.splitview.orthogonalStartSash = this._boundarySashes?.left;
                this.splitview.orthogonalEndSash = this._boundarySashes?.right;
            }
            // Figure out sizing
            let leftSizing = splitview_1.Sizing.Distribute;
            let rightSizing = splitview_1.Sizing.Distribute;
            if (ratio) {
                const totalSize = this.splitview.orientation === 1 /* Orientation.HORIZONTAL */ ? this.dimension.width : this.dimension.height;
                leftSizing = Math.round(totalSize * ratio);
                rightSizing = totalSize - leftSizing;
                // We need to call `layout` for the `ratio` to have any effect
                this.splitview.layout(this.orientation === 1 /* Orientation.HORIZONTAL */ ? this.dimension.width : this.dimension.height);
            }
            // Secondary (left)
            const secondaryEditorContainer = (0, types_1.assertIsDefined)(this.secondaryEditorContainer);
            this.splitview.addView({
                element: secondaryEditorContainer,
                layout: size => this.layoutPane(this.secondaryEditorPane, size),
                minimumSize: this.orientation === 1 /* Orientation.HORIZONTAL */ ? editor_2.DEFAULT_EDITOR_MIN_DIMENSIONS.width : editor_2.DEFAULT_EDITOR_MIN_DIMENSIONS.height,
                maximumSize: Number.POSITIVE_INFINITY,
                onDidChange: event_1.Event.None
            }, leftSizing);
            // Primary (right)
            const primaryEditorContainer = (0, types_1.assertIsDefined)(this.primaryEditorContainer);
            this.splitview.addView({
                element: primaryEditorContainer,
                layout: size => this.layoutPane(this.primaryEditorPane, size),
                minimumSize: this.orientation === 1 /* Orientation.HORIZONTAL */ ? editor_2.DEFAULT_EDITOR_MIN_DIMENSIONS.width : editor_2.DEFAULT_EDITOR_MIN_DIMENSIONS.height,
                maximumSize: Number.POSITIVE_INFINITY,
                onDidChange: event_1.Event.None
            }, rightSizing);
            this.updateStyles();
        }
        getTitle() {
            if (this.input) {
                return this.input.getName();
            }
            return (0, nls_1.localize)('sideBySideEditor', "Side by Side Editor");
        }
        async setInput(input, options, context, token) {
            const oldInput = this.input;
            await super.setInput(input, options, context, token);
            // Create new side by side editors if either we have not
            // been created before or the input no longer matches.
            if (!oldInput || !input.matches(oldInput)) {
                if (oldInput) {
                    this.disposeEditors();
                }
                this.createEditors(input);
            }
            // Restore any previous view state
            const { primary, secondary, viewState } = this.loadViewState(input, options, context);
            this.lastFocusedSide = viewState?.focus;
            if (typeof viewState?.ratio === 'number' && this.splitview) {
                const totalSize = this.splitview.orientation === 1 /* Orientation.HORIZONTAL */ ? this.dimension.width : this.dimension.height;
                this.splitview.resizeView(0, Math.round(totalSize * viewState.ratio));
            }
            else {
                this.splitview?.distributeViewSizes();
            }
            // Set input to both sides
            await Promise.all([
                this.secondaryEditorPane?.setInput(input.secondary, secondary, context, token),
                this.primaryEditorPane?.setInput(input.primary, primary, context, token)
            ]);
            // Update focus if target is provided
            if (typeof options?.target === 'number') {
                this.lastFocusedSide = options.target;
            }
        }
        loadViewState(input, options, context) {
            const viewState = isSideBySideEditorViewState(options?.viewState) ? options?.viewState : this.loadEditorViewState(input, context);
            let primaryOptions = Object.create(null);
            let secondaryOptions = undefined;
            // Depending on the optional `target` property, we apply
            // the provided options to either the primary or secondary
            // side
            if (options?.target === editor_1.SideBySideEditor.SECONDARY) {
                secondaryOptions = { ...options };
            }
            else {
                primaryOptions = { ...options };
            }
            primaryOptions.viewState = viewState?.primary;
            if (viewState?.secondary) {
                if (!secondaryOptions) {
                    secondaryOptions = { viewState: viewState.secondary };
                }
                else {
                    secondaryOptions.viewState = viewState?.secondary;
                }
            }
            return { primary: primaryOptions, secondary: secondaryOptions, viewState };
        }
        createEditors(newInput) {
            // Create editors
            this.secondaryEditorPane = this.doCreateEditor(newInput.secondary, (0, types_1.assertIsDefined)(this.secondaryEditorContainer));
            this.primaryEditorPane = this.doCreateEditor(newInput.primary, (0, types_1.assertIsDefined)(this.primaryEditorContainer));
            // Layout
            this.layout(this.dimension);
            // Eventing
            this._onDidChangeSizeConstraints.input = event_1.Event.any(event_1.Event.map(this.secondaryEditorPane.onDidChangeSizeConstraints, () => undefined), event_1.Event.map(this.primaryEditorPane.onDidChangeSizeConstraints, () => undefined));
            this.onDidCreateEditors.fire(undefined);
            // Track focus and signal active control change via event
            this.editorDisposables.add(this.primaryEditorPane.onDidFocus(() => this.onDidFocusChange(editor_1.SideBySideEditor.PRIMARY)));
            this.editorDisposables.add(this.secondaryEditorPane.onDidFocus(() => this.onDidFocusChange(editor_1.SideBySideEditor.SECONDARY)));
        }
        doCreateEditor(editorInput, container) {
            const editorPaneDescriptor = platform_1.Registry.as(editor_1.EditorExtensions.EditorPane).getEditorPane(editorInput);
            if (!editorPaneDescriptor) {
                throw new Error('No editor pane descriptor for editor found');
            }
            // Create editor pane and make visible
            const editorPane = editorPaneDescriptor.instantiate(this.instantiationService);
            editorPane.create(container);
            editorPane.setVisible(this.isVisible(), this.group);
            // Track selections if supported
            if ((0, editor_1.isEditorPaneWithSelection)(editorPane)) {
                this.editorDisposables.add(editorPane.onDidChangeSelection(e => this._onDidChangeSelection.fire(e)));
            }
            // Track for disposal
            this.editorDisposables.add(editorPane);
            return editorPane;
        }
        onDidFocusChange(side) {
            this.lastFocusedSide = side;
            // Signal to outside that our active control changed
            this._onDidChangeControl.fire();
        }
        getSelection() {
            const lastFocusedEditorPane = this.getLastFocusedEditorPane();
            if ((0, editor_1.isEditorPaneWithSelection)(lastFocusedEditorPane)) {
                const selection = lastFocusedEditorPane.getSelection();
                if (selection) {
                    return new SideBySideAwareEditorPaneSelection(selection, lastFocusedEditorPane === this.primaryEditorPane ? editor_1.SideBySideEditor.PRIMARY : editor_1.SideBySideEditor.SECONDARY);
                }
            }
            return undefined;
        }
        setOptions(options) {
            super.setOptions(options);
            // Update focus if target is provided
            if (typeof options?.target === 'number') {
                this.lastFocusedSide = options.target;
            }
            // Apply to focused side
            this.getLastFocusedEditorPane()?.setOptions(options);
        }
        setEditorVisible(visible, group) {
            // Forward to both sides
            this.primaryEditorPane?.setVisible(visible, group);
            this.secondaryEditorPane?.setVisible(visible, group);
            super.setEditorVisible(visible, group);
        }
        clearInput() {
            super.clearInput();
            // Forward to both sides
            this.primaryEditorPane?.clearInput();
            this.secondaryEditorPane?.clearInput();
            // Since we do not keep side editors alive
            // we dispose any editor created for recreation
            this.disposeEditors();
        }
        focus() {
            this.getLastFocusedEditorPane()?.focus();
        }
        getLastFocusedEditorPane() {
            if (this.lastFocusedSide === editor_1.SideBySideEditor.SECONDARY) {
                return this.secondaryEditorPane;
            }
            return this.primaryEditorPane;
        }
        layout(dimension) {
            this.dimension = dimension;
            const splitview = (0, types_1.assertIsDefined)(this.splitview);
            splitview.layout(this.orientation === 1 /* Orientation.HORIZONTAL */ ? dimension.width : dimension.height);
        }
        setBoundarySashes(sashes) {
            this._boundarySashes = sashes;
            if (this.splitview) {
                this.splitview.orthogonalEndSash = sashes.bottom;
            }
        }
        layoutPane(pane, size) {
            pane?.layout(this.orientation === 1 /* Orientation.HORIZONTAL */ ? new dom_1.Dimension(size, this.dimension.height) : new dom_1.Dimension(this.dimension.width, size));
        }
        getControl() {
            return this.getLastFocusedEditorPane()?.getControl();
        }
        getPrimaryEditorPane() {
            return this.primaryEditorPane;
        }
        getSecondaryEditorPane() {
            return this.secondaryEditorPane;
        }
        tracksEditorViewState(input) {
            return input instanceof sideBySideEditorInput_1.SideBySideEditorInput;
        }
        computeEditorViewState(resource) {
            if (!this.input || !(0, resources_1.isEqual)(resource, this.toEditorViewStateResource(this.input))) {
                return; // unexpected state
            }
            const primarViewState = this.primaryEditorPane?.getViewState();
            const secondaryViewState = this.secondaryEditorPane?.getViewState();
            if (!primarViewState || !secondaryViewState) {
                return; // we actually need view states
            }
            return {
                primary: primarViewState,
                secondary: secondaryViewState,
                focus: this.lastFocusedSide,
                ratio: this.getSplitViewRatio()
            };
        }
        toEditorViewStateResource(input) {
            let primary;
            let secondary;
            if (input instanceof sideBySideEditorInput_1.SideBySideEditorInput) {
                primary = input.primary.resource;
                secondary = input.secondary.resource;
            }
            if (!secondary || !primary) {
                return undefined;
            }
            // create a URI that is the Base64 concatenation of original + modified resource
            return uri_1.URI.from({ scheme: 'sideBySide', path: `${(0, dom_1.multibyteAwareBtoa)(secondary.toString())}${(0, dom_1.multibyteAwareBtoa)(primary.toString())}` });
        }
        updateStyles() {
            super.updateStyles();
            if (this.primaryEditorContainer) {
                if (this.orientation === 1 /* Orientation.HORIZONTAL */) {
                    this.primaryEditorContainer.style.borderLeftWidth = '1px';
                    this.primaryEditorContainer.style.borderLeftStyle = 'solid';
                    this.primaryEditorContainer.style.borderLeftColor = this.getColor(theme_1.SIDE_BY_SIDE_EDITOR_VERTICAL_BORDER) ?? '';
                    this.primaryEditorContainer.style.borderTopWidth = '0';
                }
                else {
                    this.primaryEditorContainer.style.borderTopWidth = '1px';
                    this.primaryEditorContainer.style.borderTopStyle = 'solid';
                    this.primaryEditorContainer.style.borderTopColor = this.getColor(theme_1.SIDE_BY_SIDE_EDITOR_HORIZONTAL_BORDER) ?? '';
                    this.primaryEditorContainer.style.borderLeftWidth = '0';
                }
            }
        }
        dispose() {
            this.disposeEditors();
            super.dispose();
        }
        disposeEditors() {
            this.editorDisposables.clear();
            this.secondaryEditorPane = undefined;
            this.primaryEditorPane = undefined;
            this.lastFocusedSide = undefined;
            if (this.secondaryEditorContainer) {
                (0, dom_1.clearNode)(this.secondaryEditorContainer);
            }
            if (this.primaryEditorContainer) {
                (0, dom_1.clearNode)(this.primaryEditorContainer);
            }
        }
    };
    exports.SideBySideEditor = SideBySideEditor;
    exports.SideBySideEditor = SideBySideEditor = SideBySideEditor_1 = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, themeService_1.IThemeService),
        __param(3, storage_1.IStorageService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, textResourceConfiguration_1.ITextResourceConfigurationService),
        __param(6, editorService_1.IEditorService),
        __param(7, editorGroupsService_1.IEditorGroupsService)
    ], SideBySideEditor);
    class SideBySideAwareEditorPaneSelection {
        constructor(selection, side) {
            this.selection = selection;
            this.side = side;
        }
        compare(other) {
            if (!(other instanceof SideBySideAwareEditorPaneSelection)) {
                return 3 /* EditorPaneSelectionCompareResult.DIFFERENT */;
            }
            if (this.side !== other.side) {
                return 3 /* EditorPaneSelectionCompareResult.DIFFERENT */;
            }
            return this.selection.compare(other.selection);
        }
        restore(options) {
            const sideBySideEditorOptions = {
                ...options,
                target: this.side
            };
            return this.selection.restore(sideBySideEditorOptions);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lkZUJ5U2lkZUVkaXRvci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3BhcnRzL2VkaXRvci9zaWRlQnlTaWRlRWRpdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUF1Q2hHLFNBQVMsMkJBQTJCLENBQUMsS0FBYztRQUNsRCxNQUFNLFNBQVMsR0FBRyxLQUErQyxDQUFDO1FBRWxFLE9BQU8sT0FBTyxTQUFTLEVBQUUsT0FBTyxLQUFLLFFBQVEsSUFBSSxPQUFPLFNBQVMsQ0FBQyxTQUFTLEtBQUssUUFBUSxDQUFDO0lBQzFGLENBQUM7SUFlTSxJQUFNLGdCQUFnQixHQUF0QixNQUFNLGdCQUFpQixTQUFRLGlEQUF1RDs7aUJBRTVFLE9BQUUsR0FBVywrQkFBc0IsQUFBakMsQ0FBa0M7aUJBRTdDLGdDQUEyQixHQUFHLHFDQUFxQyxBQUF4QyxDQUF5QztpQkFFbkQsOEJBQXlCLEdBQUcsMkJBQTJCLEFBQTlCLENBQStCO1FBRWhGLDRCQUE0QjtRQUU1QixJQUFZLG1CQUFtQixLQUFLLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlHLElBQVksbUJBQW1CLEtBQUssT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7UUFDckksSUFBWSxvQkFBb0IsS0FBSyxPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFD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