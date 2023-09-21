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
define(["require", "exports", "vs/nls!vs/workbench/browser/parts/editor/sideBySideEditor", "vs/base/browser/dom", "vs/platform/registry/common/platform", "vs/workbench/common/editor", "vs/workbench/common/editor/sideBySideEditorInput", "vs/platform/telemetry/common/telemetry", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/themeService", "vs/workbench/services/editor/common/editorGroupsService", "vs/base/browser/ui/splitview/splitview", "vs/base/common/event", "vs/platform/storage/common/storage", "vs/base/common/types", "vs/platform/configuration/common/configuration", "vs/workbench/browser/parts/editor/editor", "vs/base/common/lifecycle", "vs/workbench/common/theme", "vs/workbench/browser/parts/editor/editorWithViewState", "vs/editor/common/services/textResourceConfiguration", "vs/workbench/services/editor/common/editorService", "vs/base/common/resources", "vs/base/common/uri", "vs/css!./media/sidebysideeditor"], function (require, exports, nls_1, dom_1, platform_1, editor_1, sideBySideEditorInput_1, telemetry_1, instantiation_1, themeService_1, editorGroupsService_1, splitview_1, event_1, storage_1, types_1, configuration_1, editor_2, lifecycle_1, theme_1, editorWithViewState_1, textResourceConfiguration_1, editorService_1, resources_1, uri_1) {
    "use strict";
    var $dub_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$dub = void 0;
    function isSideBySideEditorViewState(thing) {
        const candidate = thing;
        return typeof candidate?.primary === 'object' && typeof candidate.secondary === 'object';
    }
    let $dub = class $dub extends editorWithViewState_1.$neb {
        static { $dub_1 = this; }
        static { this.ID = editor_1.$IE; }
        static { this.SIDE_BY_SIDE_LAYOUT_SETTING = 'workbench.editor.splitInGroupLayout'; }
        static { this.a = 'sideBySideEditorViewState'; }
        //#region Layout Constraints
        get c() { return this.Ab ? this.Ab.minimumWidth : 0; }
        get f() { return this.Ab ? this.Ab.maximumWidth : Number.POSITIVE_INFINITY; }
        get r() { return this.Ab ? this.Ab.minimumHeight : 0; }
        get rb() { return this.Ab ? this.Ab.maximumHeight : Number.POSITIVE_INFINITY; }
        get sb() { return this.Bb ? this.Bb.minimumWidth : 0; }
        get tb() { return this.Bb ? this.Bb.maximumWidth : Number.POSITIVE_INFINITY; }
        get ub() { return this.Bb ? this.Bb.minimumHeight : 0; }
        get vb() { return this.Bb ? this.Bb.maximumHeight : Number.POSITIVE_INFINITY; }
        set minimumWidth(value) { }
        set maximumWidth(value) { }
        set minimumHeight(value) { }
        set maximumHeight(value) { }
        get minimumWidth() { return this.c + this.sb; }
        get maximumWidth() { return this.f + this.tb; }
        get minimumHeight() { return this.r + this.ub; }
        get maximumHeight() { return this.rb + this.vb; }
        constructor(telemetryService, instantiationService, themeService, storageService, Kb, textResourceConfigurationService, editorService, editorGroupService) {
            super($dub_1.ID, $dub_1.a, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorService, editorGroupService);
            this.Kb = Kb;
            //#endregion
            //#region Events
            this.xb = this.B(new event_1.$fd());
            this.yb = this.B(new event_1.$od());
            this.onDidChangeSizeConstraints = event_1.Event.any(this.xb.event, this.yb.event);
            this.zb = this.B(new event_1.$fd());
            this.onDidChangeSelection = this.zb.event;
            //#endregion
            this.Ab = undefined;
            this.Bb = undefined;
            this.Fb = this.B(new lifecycle_1.$jc());
            this.Gb = this.B(new lifecycle_1.$jc());
            this.Hb = this.Kb.getValue($dub_1.SIDE_BY_SIDE_LAYOUT_SETTING) === 'vertical' ? 0 /* Orientation.VERTICAL */ : 1 /* Orientation.HORIZONTAL */;
            this.Ib = new dom_1.$BO(0, 0);
            this.Jb = undefined;
            this.Lb();
        }
        Lb() {
            this.B(this.Kb.onDidChangeConfiguration(e => this.Mb(e)));
        }
        Mb(event) {
            if (event.affectsConfiguration($dub_1.SIDE_BY_SIDE_LAYOUT_SETTING)) {
                this.Hb = this.Kb.getValue($dub_1.SIDE_BY_SIDE_LAYOUT_SETTING) === 'vertical' ? 0 /* Orientation.VERTICAL */ : 1 /* Orientation.HORIZONTAL */;
                // If config updated from event, re-create the split
                // editor using the new layout orientation if it was
                // already created.
                if (this.Eb) {
                    this.Nb();
                }
            }
        }
        Nb() {
            const container = (0, types_1.$uf)(this.getContainer());
            // Clear old (if any) but remember ratio
            const ratio = this.Ob();
            if (this.Eb) {
                container.removeChild(this.Eb.el);
                this.Fb.clear();
            }
            // Create new
            this.Qb(container, ratio);
            this.layout(this.Ib);
        }
        Ob() {
            let ratio = undefined;
            if (this.Eb) {
                const leftViewSize = this.Eb.getViewSize(0);
                const rightViewSize = this.Eb.getViewSize(1);
                // Only return a ratio when the view size is significantly
                // enough different for left and right view sizes
                if (Math.abs(leftViewSize - rightViewSize) > 1) {
                    const totalSize = this.Eb.orientation === 1 /* Orientation.HORIZONTAL */ ? this.Ib.width : this.Ib.height;
                    ratio = leftViewSize / totalSize;
                }
            }
            return ratio;
        }
        ab(parent) {
            parent.classList.add('side-by-side-editor');
            // Editor pane containers
            this.Db = (0, dom_1.$)('.side-by-side-editor-container.editor-instance');
            this.Cb = (0, dom_1.$)('.side-by-side-editor-container.editor-instance');
            // Split view
            this.Qb(parent);
        }
        Qb(parent, ratio) {
            // Splitview widget
            this.Eb = this.Fb.add(new splitview_1.$bR(parent, { orientation: this.Hb }));
            this.Fb.add(this.Eb.onDidSashReset(() => this.Eb?.distributeViewSizes()));
            if (this.Hb === 1 /* Orientation.HORIZONTAL */) {
                this.Eb.orthogonalEndSash = this.wb?.bottom;
            }
            else {
                this.Eb.orthogonalStartSash = this.wb?.left;
                this.Eb.orthogonalEndSash = this.wb?.right;
            }
            // Figure out sizing
            let leftSizing = splitview_1.Sizing.Distribute;
            let rightSizing = splitview_1.Sizing.Distribute;
            if (ratio) {
                const totalSize = this.Eb.orientation === 1 /* Orientation.HORIZONTAL */ ? this.Ib.width : this.Ib.height;
                leftSizing = Math.round(totalSize * ratio);
                rightSizing = totalSize - leftSizing;
                // We need to call `layout` for the `ratio` to have any effect
                this.Eb.layout(this.Hb === 1 /* Orientation.HORIZONTAL */ ? this.Ib.width : this.Ib.height);
            }
            // Secondary (left)
            const secondaryEditorContainer = (0, types_1.$uf)(this.Db);
            this.Eb.addView({
                element: secondaryEditorContainer,
                layout: size => this.Xb(this.Bb, size),
                minimumSize: this.Hb === 1 /* Orientation.HORIZONTAL */ ? editor_2.$4T.width : editor_2.$4T.height,
                maximumSize: Number.POSITIVE_INFINITY,
                onDidChange: event_1.Event.None
            }, leftSizing);
            // Primary (right)
            const primaryEditorContainer = (0, types_1.$uf)(this.Cb);
            this.Eb.addView({
                element: primaryEditorContainer,
                layout: size => this.Xb(this.Ab, size),
                minimumSize: this.Hb === 1 /* Orientation.HORIZONTAL */ ? editor_2.$4T.width : editor_2.$4T.height,
                maximumSize: Number.POSITIVE_INFINITY,
                onDidChange: event_1.Event.None
            }, rightSizing);
            this.updateStyles();
        }
        getTitle() {
            if (this.input) {
                return this.input.getName();
            }
            return (0, nls_1.localize)(0, null);
        }
        async setInput(input, options, context, token) {
            const oldInput = this.input;
            await super.setInput(input, options, context, token);
            // Create new side by side editors if either we have not
            // been created before or the input no longer matches.
            if (!oldInput || !input.matches(oldInput)) {
                if (oldInput) {
                    this.ac();
                }
                this.Sb(input);
            }
            // Restore any previous view state
            const { primary, secondary, viewState } = this.Rb(input, options, context);
            this.Jb = viewState?.focus;
            if (typeof viewState?.ratio === 'number' && this.Eb) {
                const totalSize = this.Eb.orientation === 1 /* Orientation.HORIZONTAL */ ? this.Ib.width : this.Ib.height;
                this.Eb.resizeView(0, Math.round(totalSize * viewState.ratio));
            }
            else {
                this.Eb?.distributeViewSizes();
            }
            // Set input to both sides
            await Promise.all([
                this.Bb?.setInput(input.secondary, secondary, context, token),
                this.Ab?.setInput(input.primary, primary, context, token)
            ]);
            // Update focus if target is provided
            if (typeof options?.target === 'number') {
                this.Jb = options.target;
            }
        }
        Rb(input, options, context) {
            const viewState = isSideBySideEditorViewState(options?.viewState) ? options?.viewState : this.kb(input, context);
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
        Sb(newInput) {
            // Create editors
            this.Bb = this.Tb(newInput.secondary, (0, types_1.$uf)(this.Db));
            this.Ab = this.Tb(newInput.primary, (0, types_1.$uf)(this.Cb));
            // Layout
            this.layout(this.Ib);
            // Eventing
            this.yb.input = event_1.Event.any(event_1.Event.map(this.Bb.onDidChangeSizeConstraints, () => undefined), event_1.Event.map(this.Ab.onDidChangeSizeConstraints, () => undefined));
            this.xb.fire(undefined);
            // Track focus and signal active control change via event
            this.Gb.add(this.Ab.onDidFocus(() => this.Ub(editor_1.SideBySideEditor.PRIMARY)));
            this.Gb.add(this.Bb.onDidFocus(() => this.Ub(editor_1.SideBySideEditor.SECONDARY)));
        }
        Tb(editorInput, container) {
            const editorPaneDescriptor = platform_1.$8m.as(editor_1.$GE.EditorPane).getEditorPane(editorInput);
            if (!editorPaneDescriptor) {
                throw new Error('No editor pane descriptor for editor found');
            }
            // Create editor pane and make visible
            const editorPane = editorPaneDescriptor.instantiate(this.m);
            editorPane.create(container);
            editorPane.setVisible(this.isVisible(), this.group);
            // Track selections if supported
            if ((0, editor_1.$LE)(editorPane)) {
                this.Gb.add(editorPane.onDidChangeSelection(e => this.zb.fire(e)));
            }
            // Track for disposal
            this.Gb.add(editorPane);
            return editorPane;
        }
        Ub(side) {
            this.Jb = side;
            // Signal to outside that our active control changed
            this.U.fire();
        }
        getSelection() {
            const lastFocusedEditorPane = this.Wb();
            if ((0, editor_1.$LE)(lastFocusedEditorPane)) {
                const selection = lastFocusedEditorPane.getSelection();
                if (selection) {
                    return new SideBySideAwareEditorPaneSelection(selection, lastFocusedEditorPane === this.Ab ? editor_1.SideBySideEditor.PRIMARY : editor_1.SideBySideEditor.SECONDARY);
                }
            }
            return undefined;
        }
        setOptions(options) {
            super.setOptions(options);
            // Update focus if target is provided
            if (typeof options?.target === 'number') {
                this.Jb = options.target;
            }
            // Apply to focused side
            this.Wb()?.setOptions(options);
        }
        bb(visible, group) {
            // Forward to both sides
            this.Ab?.setVisible(visible, group);
            this.Bb?.setVisible(visible, group);
            super.bb(visible, group);
        }
        clearInput() {
            super.clearInput();
            // Forward to both sides
            this.Ab?.clearInput();
            this.Bb?.clearInput();
            // Since we do not keep side editors alive
            // we dispose any editor created for recreation
            this.ac();
        }
        focus() {
            this.Wb()?.focus();
        }
        Wb() {
            if (this.Jb === editor_1.SideBySideEditor.SECONDARY) {
                return this.Bb;
            }
            return this.Ab;
        }
        layout(dimension) {
            this.Ib = dimension;
            const splitview = (0, types_1.$uf)(this.Eb);
            splitview.layout(this.Hb === 1 /* Orientation.HORIZONTAL */ ? dimension.width : dimension.height);
        }
        setBoundarySashes(sashes) {
            this.wb = sashes;
            if (this.Eb) {
                this.Eb.orthogonalEndSash = sashes.bottom;
            }
        }
        Xb(pane, size) {
            pane?.layout(this.Hb === 1 /* Orientation.HORIZONTAL */ ? new dom_1.$BO(size, this.Ib.height) : new dom_1.$BO(this.Ib.width, size));
        }
        getControl() {
            return this.Wb()?.getControl();
        }
        getPrimaryEditorPane() {
            return this.Ab;
        }
        getSecondaryEditorPane() {
            return this.Bb;
        }
        ob(input) {
            return input instanceof sideBySideEditorInput_1.$VC;
        }
        nb(resource) {
            if (!this.input || !(0, resources_1.$bg)(resource, this.qb(this.input))) {
                return; // unexpected state
            }
            const primarViewState = this.Ab?.getViewState();
            const secondaryViewState = this.Bb?.getViewState();
            if (!primarViewState || !secondaryViewState) {
                return; // we actually need view states
            }
            return {
                primary: primarViewState,
                secondary: secondaryViewState,
                focus: this.Jb,
                ratio: this.Ob()
            };
        }
        qb(input) {
            let primary;
            let secondary;
            if (input instanceof sideBySideEditorInput_1.$VC) {
                primary = input.primary.resource;
                secondary = input.secondary.resource;
            }
            if (!secondary || !primary) {
                return undefined;
            }
            // create a URI that is the Base64 concatenation of original + modified resource
            return uri_1.URI.from({ scheme: 'sideBySide', path: `${(0, dom_1.$wP)(secondary.toString())}${(0, dom_1.$wP)(primary.toString())}` });
        }
        updateStyles() {
            super.updateStyles();
            if (this.Cb) {
                if (this.Hb === 1 /* Orientation.HORIZONTAL */) {
                    this.Cb.style.borderLeftWidth = '1px';
                    this.Cb.style.borderLeftStyle = 'solid';
                    this.Cb.style.borderLeftColor = this.z(theme_1.$K_) ?? '';
                    this.Cb.style.borderTopWidth = '0';
                }
                else {
                    this.Cb.style.borderTopWidth = '1px';
                    this.Cb.style.borderTopStyle = 'solid';
                    this.Cb.style.borderTopColor = this.z(theme_1.$J_) ?? '';
                    this.Cb.style.borderLeftWidth = '0';
                }
            }
        }
        dispose() {
            this.ac();
            super.dispose();
        }
        ac() {
            this.Gb.clear();
            this.Bb = undefined;
            this.Ab = undefined;
            this.Jb = undefined;
            if (this.Db) {
                (0, dom_1.$lO)(this.Db);
            }
            if (this.Cb) {
                (0, dom_1.$lO)(this.Cb);
            }
        }
    };
    exports.$dub = $dub;
    exports.$dub = $dub = $dub_1 = __decorate([
        __param(0, telemetry_1.$9k),
        __param(1, instantiation_1.$Ah),
        __param(2, themeService_1.$gv),
        __param(3, storage_1.$Vo),
        __param(4, configuration_1.$8h),
        __param(5, textResourceConfiguration_1.$FA),
        __param(6, editorService_1.$9C),
        __param(7, editorGroupsService_1.$5C)
    ], $dub);
    class SideBySideAwareEditorPaneSelection {
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        compare(other) {
            if (!(other instanceof SideBySideAwareEditorPaneSelection)) {
                return 3 /* EditorPaneSelectionCompareResult.DIFFERENT */;
            }
            if (this.b !== other.b) {
                return 3 /* EditorPaneSelectionCompareResult.DIFFERENT */;
            }
            return this.a.compare(other.a);
        }
        restore(options) {
            const sideBySideEditorOptions = {
                ...options,
                target: this.b
            };
            return this.a.restore(sideBySideEditorOptions);
        }
    }
});
//# sourceMappingURL=sideBySideEditor.js.map