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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/contextkey/common/contextkey", "vs/platform/contextkey/common/contextkeys", "vs/workbench/common/contextkeys", "vs/workbench/common/editor", "vs/base/browser/dom", "vs/workbench/services/editor/common/editorGroupsService", "vs/platform/configuration/common/configuration", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/editor/common/editorService", "vs/platform/workspace/common/workspace", "vs/workbench/services/layout/browser/layoutService", "vs/platform/remote/common/remoteHosts", "vs/platform/workspace/common/virtualWorkspace", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/base/common/platform", "vs/workbench/services/editor/common/editorResolverService", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/platform/files/browser/webFileSystemAccess", "vs/platform/product/common/productService", "vs/platform/files/common/files"], function (require, exports, event_1, lifecycle_1, contextkey_1, contextkeys_1, contextkeys_2, editor_1, dom_1, editorGroupsService_1, configuration_1, environmentService_1, editorService_1, workspace_1, layoutService_1, remoteHosts_1, virtualWorkspace_1, workingCopyService_1, platform_1, editorResolverService_1, panecomposite_1, webFileSystemAccess_1, productService_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$e2b = void 0;
    let $e2b = class $e2b extends lifecycle_1.$kc {
        constructor($, ab, bb, cb, db, eb, fb, gb, hb, ib, jb, kb) {
            super();
            this.$ = $;
            this.ab = ab;
            this.bb = bb;
            this.cb = cb;
            this.db = db;
            this.eb = eb;
            this.fb = fb;
            this.gb = gb;
            this.hb = hb;
            this.ib = ib;
            this.jb = jb;
            this.kb = kb;
            // Platform
            contextkeys_1.$Y3.bindTo(this.$);
            contextkeys_1.$Z3.bindTo(this.$);
            contextkeys_1.$13.bindTo(this.$);
            contextkeys_1.$23.bindTo(this.$);
            contextkeys_1.$33.bindTo(this.$);
            contextkeys_1.$43.bindTo(this.$);
            contextkeys_1.$53.bindTo(this.$);
            contextkeys_2.$Vcb.bindTo(this.$).set((0, remoteHosts_1.$Pk)(this.cb.remoteAuthority) || '');
            this.L = contextkeys_2.$Wcb.bindTo(this.$);
            this.M = contextkeys_2.$Xcb.bindTo(this.$);
            this.vb();
            // Capabilities
            contextkeys_2.$Zcb.bindTo(this.$).set(webFileSystemAccess_1.WebFileSystemAccess.supported(window));
            // Development
            const isDevelopment = !this.cb.isBuilt || this.cb.isExtensionDevelopment;
            contextkeys_1.$63.bindTo(this.$).set(isDevelopment);
            (0, contextkey_1.$Gi)(contextkeys_1.$63.key, isDevelopment);
            // Product Service
            contextkeys_1.$73.bindTo(this.$).set(this.db.quality || '');
            contextkeys_2.$1cb.bindTo(this.$).set(db.embedderIdentifier);
            // Editors
            this.c = contextkeys_2.$$cb.bindTo(this.$);
            this.j = contextkeys_2.$7cb.bindTo(this.$);
            this.m = contextkeys_2.$8cb.bindTo(this.$);
            this.f = contextkeys_2.$9cb.bindTo(this.$);
            this.g = contextkeys_2.$0cb.bindTo(this.$);
            this.h = contextkeys_2.$_cb.bindTo(this.$);
            this.w = contextkeys_2.$kdb.bindTo(this.$);
            this.y = contextkeys_2.$adb.bindTo(this.$);
            this.z = contextkeys_2.$bdb.bindTo(this.$);
            this.C = contextkeys_2.$cdb.bindTo(this.$);
            this.n = contextkeys_2.$edb.bindTo(this.$);
            this.r = contextkeys_2.$fdb.bindTo(this.$);
            this.s = contextkeys_2.$gdb.bindTo(this.$);
            this.t = contextkeys_2.$hdb.bindTo(this.$);
            this.u = contextkeys_2.$idb.bindTo(this.$);
            // Working Copies
            this.b = contextkeys_2.$Ucb.bindTo(this.$);
            this.b.set(this.jb.hasDirty);
            // Inputs
            this.a = contextkeys_1.$93.bindTo(this.$);
            // Workbench State
            this.F = contextkeys_2.$Pcb.bindTo(this.$);
            this.qb();
            // Workspace Folder Count
            this.G = contextkeys_2.$Qcb.bindTo(this.$);
            this.rb();
            // Opening folder support: support for opening a folder workspace
            // (e.g. "Open Folder...") is limited in web when not connected
            // to a remote.
            this.H = contextkeys_2.$Rcb.bindTo(this.$);
            this.H.set(platform_1.$m || typeof this.cb.remoteAuthority === 'string');
            // Empty workspace support: empty workspaces require built-in file system
            // providers to be available that allow to enter a workspace or open loose
            // files. This condition is met:
            // - desktop: always
            // -     web: only when connected to a remote
            this.J = contextkeys_2.$Tcb.bindTo(this.$);
            this.J.set(platform_1.$m || typeof this.cb.remoteAuthority === 'string');
            // Entering a multi root workspace support: support for entering a multi-root
            // workspace (e.g. "Open Workspace from File...", "Duplicate Workspace", "Save Workspace")
            // is driven by the ability to resolve a workspace configuration file (*.code-workspace)
            // with a built-in file system provider.
            // This condition is met:
            // - desktop: always
            // -     web: only when connected to a remote
            this.I = contextkeys_2.$Scb.bindTo(this.$);
            this.I.set(platform_1.$m || typeof this.cb.remoteAuthority === 'string');
            // Editor Layout
            this.D = contextkeys_2.$ndb.bindTo(this.$);
            this.sb();
            // Fullscreen
            this.O = contextkeys_2.$Ycb.bindTo(this.$);
            // Zen Mode
            this.N = contextkeys_2.$ldb.bindTo(this.$);
            // Centered Layout
            this.P = contextkeys_2.$mdb.bindTo(this.$);
            // Editor Area
            this.R = contextkeys_2.$odb.bindTo(this.$);
            this.Z = contextkeys_2.$pdb.bindTo(this.$);
            // Sidebar
            this.Q = contextkeys_2.$qdb.bindTo(this.$);
            // Panel
            this.S = contextkeys_2.$Ddb.bindTo(this.$);
            this.S.set((0, layoutService_1.$Neb)(this.hb.getPanelPosition()));
            this.U = contextkeys_2.$Fdb.bindTo(this.$);
            this.U.set(this.hb.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */));
            this.X = contextkeys_2.$Gdb.bindTo(this.$);
            this.X.set(this.hb.isPanelMaximized());
            this.W = contextkeys_2.$Edb.bindTo(this.$);
            this.W.set(this.hb.getPanelAlignment());
            // Auxiliary Bar
            this.Y = contextkeys_2.$Adb.bindTo(this.$);
            this.Y.set(this.hb.isVisible("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */));
            this.lb();
        }
        lb() {
            this.gb.whenReady.then(() => {
                this.mb();
                this.nb();
            });
            this.B(this.eb.onDidActiveEditorChange(() => this.nb()));
            this.B(this.eb.onDidVisibleEditorsChange(() => this.nb()));
            this.B(this.gb.onDidAddGroup(() => this.nb()));
            this.B(this.gb.onDidRemoveGroup(() => this.nb()));
            this.B(this.gb.onDidChangeGroupIndex(() => this.nb()));
            this.B(this.gb.onDidChangeActiveGroup(() => this.ob()));
            this.B(this.gb.onDidChangeGroupLocked(() => this.ob()));
            this.B(this.gb.onDidChangeEditorPartOptions(() => this.mb()));
            this.B((0, dom_1.$nO)(window, dom_1.$3O.FOCUS_IN, () => this.pb(), true));
            this.B(this.ab.onDidChangeWorkbenchState(() => this.qb()));
            this.B(this.ab.onDidChangeWorkspaceFolders(() => {
                this.rb();
                this.vb();
            }));
            this.B(this.bb.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('workbench.editor.openSideBySideDirection')) {
                    this.sb();
                }
            }));
            this.B(this.hb.onDidChangeZenMode(enabled => this.N.set(enabled)));
            this.B(this.hb.onDidChangeFullscreen(fullscreen => this.O.set(fullscreen)));
            this.B(this.hb.onDidChangeCenteredLayout(centered => this.P.set(centered)));
            this.B(this.hb.onDidChangePanelPosition(position => this.S.set(position)));
            this.B(this.hb.onDidChangePanelAlignment(alignment => this.W.set(alignment)));
            this.B(this.ib.onDidPaneCompositeClose(() => this.ub()));
            this.B(this.ib.onDidPaneCompositeOpen(() => this.ub()));
            this.B(this.hb.onDidChangePartVisibility(() => {
                this.R.set(this.hb.isVisible("workbench.parts.editor" /* Parts.EDITOR_PART */));
                this.U.set(this.hb.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */));
                this.X.set(this.hb.isPanelMaximized());
                this.Y.set(this.hb.isVisible("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */));
            }));
            this.B(this.jb.onDidChangeDirty(workingCopy => this.b.set(workingCopy.isDirty() || this.jb.hasDirty)));
        }
        mb() {
            this.Z.set(!!this.gb.partOptions.showTabs);
        }
        nb() {
            const activeEditorPane = this.eb.activeEditorPane;
            const visibleEditorPanes = this.eb.visibleEditorPanes;
            this.z.set(activeEditorPane?.getId() === editor_1.$JE);
            this.y.set(visibleEditorPanes.some(editorPane => editorPane.getId() === editor_1.$JE));
            this.C.set(activeEditorPane?.getId() === editor_1.$IE);
            if (visibleEditorPanes.length > 0) {
                this.w.set(true);
            }
            else {
                this.w.reset();
            }
            if (!this.eb.activeEditor) {
                this.n.set(true);
            }
            else {
                this.n.reset();
            }
            this.ob();
            if (activeEditorPane) {
                this.c.set(activeEditorPane.getId());
                this.f.set(!activeEditorPane.input.hasCapability(4 /* EditorInputCapabilities.Untitled */));
                this.g.set(activeEditorPane.input.hasCapability(32 /* EditorInputCapabilities.CanSplitInGroup */));
                (0, contextkeys_2.$Ldb)(this.h, activeEditorPane.input, this.fb);
                this.j.set(!!activeEditorPane.input.isReadonly());
                const primaryEditorResource = editor_1.$3E.getOriginalUri(activeEditorPane.input, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
                this.m.set(!!primaryEditorResource && this.kb.hasProvider(primaryEditorResource) && !this.kb.hasCapability(primaryEditorResource, 2048 /* FileSystemProviderCapabilities.Readonly */));
            }
            else {
                this.c.reset();
                this.j.reset();
                this.m.reset();
                this.f.reset();
                this.g.reset();
                this.h.reset();
            }
        }
        ob() {
            const groupCount = this.gb.count;
            if (groupCount > 1) {
                this.u.set(true);
            }
            else {
                this.u.reset();
            }
            const activeGroup = this.gb.activeGroup;
            this.r.set(activeGroup.index + 1); // not zero-indexed
            this.s.set(activeGroup.index === groupCount - 1);
            this.t.set(activeGroup.isLocked);
        }
        pb() {
            function activeElementIsInput() {
                return !!document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA');
            }
            const isInputFocused = activeElementIsInput();
            this.a.set(isInputFocused);
            if (isInputFocused) {
                const tracker = (0, dom_1.$8O)(document.activeElement);
                event_1.Event.once(tracker.onDidBlur)(() => {
                    this.a.set(activeElementIsInput());
                    tracker.dispose();
                });
            }
        }
        qb() {
            this.F.set(this.tb());
        }
        rb() {
            this.G.set(this.ab.getWorkspace().folders.length);
        }
        sb() {
            const direction = (0, editorGroupsService_1.$8C)(this.bb);
            this.D.set(direction === 1 /* GroupDirection.DOWN */);
        }
        tb() {
            switch (this.ab.getWorkbenchState()) {
                case 1 /* WorkbenchState.EMPTY */: return 'empty';
                case 2 /* WorkbenchState.FOLDER */: return 'folder';
                case 3 /* WorkbenchState.WORKSPACE */: return 'workspace';
            }
        }
        ub() {
            this.Q.set(this.hb.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */));
        }
        vb() {
            this.L.set((0, virtualWorkspace_1.$vJ)(this.ab.getWorkspace()) || '');
            this.M.set((0, workspace_1.$3h)(this.ab.getWorkspace()));
        }
    };
    exports.$e2b = $e2b;
    exports.$e2b = $e2b = __decorate([
        __param(0, contextkey_1.$3i),
        __param(1, workspace_1.$Kh),
        __param(2, configuration_1.$8h),
        __param(3, environmentService_1.$hJ),
        __param(4, productService_1.$kj),
        __param(5, editorService_1.$9C),
        __param(6, editorResolverService_1.$pbb),
        __param(7, editorGroupsService_1.$5C),
        __param(8, layoutService_1.$Meb),
        __param(9, panecomposite_1.$Yeb),
        __param(10, workingCopyService_1.$TC),
        __param(11, files_1.$6j)
    ], $e2b);
});
//# sourceMappingURL=contextkeys.js.map