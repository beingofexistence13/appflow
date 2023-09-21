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
define(["require", "exports", "vs/base/common/event", "vs/workbench/common/editor", "vs/workbench/browser/parts/editor/editorPane", "vs/platform/storage/common/storage", "vs/platform/instantiation/common/instantiation", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/editor/common/services/textResourceConfiguration", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/base/common/lifecycle"], function (require, exports, event_1, editor_1, editorPane_1, storage_1, instantiation_1, telemetry_1, themeService_1, textResourceConfiguration_1, editorGroupsService_1, editorService_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$neb = void 0;
    /**
     * Base class of editors that want to store and restore view state.
     */
    let $neb = class $neb extends editorPane_1.$0T {
        constructor(id, viewStateStorageKey, telemetryService, m, storageService, s, themeService, u, y) {
            super(id, telemetryService, themeService, storageService);
            this.m = m;
            this.s = s;
            this.u = u;
            this.y = y;
            this.g = this.B(new lifecycle_1.$lc());
            this.b = this.cb(y, s, viewStateStorageKey, 100);
        }
        bb(visible, group) {
            // Listen to close events to trigger `onWillCloseEditorInGroup`
            this.g.value = group?.onWillCloseEditor(e => this.fb(e));
            super.bb(visible, group);
        }
        fb(e) {
            const editor = e.editor;
            if (editor === this.input) {
                // React to editors closing to preserve or clear view state. This needs to happen
                // in the `onWillCloseEditor` because at that time the editor has not yet
                // been disposed and we can safely persist the view state.
                this.hb(editor);
            }
        }
        clearInput() {
            // Preserve current input view state before clearing
            this.hb(this.input);
            super.clearInput();
        }
        G() {
            // Preserve current input view state before shutting down
            this.hb(this.input);
            super.G();
        }
        hb(input) {
            if (!input || !this.ob(input)) {
                return; // ensure we have an input to handle view state for
            }
            const resource = this.qb(input);
            if (!resource) {
                return; // we need a resource
            }
            // If we are not tracking disposed editor view state
            // make sure to clear the view state once the editor
            // is disposed.
            if (!this.pb()) {
                if (!this.j) {
                    this.j = new Map();
                }
                if (!this.j.has(input)) {
                    this.j.set(input, event_1.Event.once(input.onWillDispose)(() => {
                        this.mb(resource, this.group);
                        this.j?.delete(input);
                    }));
                }
            }
            // Clear the editor view state if:
            // - the editor view state should not be tracked for disposed editors
            // - the user configured to not restore view state unless the editor is still opened in the group
            if ((input.isDisposed() && !this.pb()) ||
                (!this.ib(input) && (!this.group || !this.group.contains(input)))) {
                this.mb(resource, this.group);
            }
            // Otherwise we save the view state
            else if (!input.isDisposed()) {
                this.jb(resource);
            }
        }
        ib(input, context) {
            // new editor: check with workbench.editor.restoreViewState setting
            if (context?.newInGroup) {
                return this.s.getValue(editor_1.$3E.getOriginalUri(input, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY }), 'workbench.editor.restoreViewState') === false ? false : true /* restore by default */;
            }
            // existing editor: always restore viewstate
            return true;
        }
        getViewState() {
            const input = this.input;
            if (!input || !this.ob(input)) {
                return; // need valid input for view state
            }
            const resource = this.qb(input);
            if (!resource) {
                return; // need a resource for finding view state
            }
            return this.nb(resource);
        }
        jb(resource) {
            if (!this.group) {
                return;
            }
            const editorViewState = this.nb(resource);
            if (!editorViewState) {
                return;
            }
            this.b.saveEditorState(this.group, resource, editorViewState);
        }
        kb(input, context) {
            if (!input || !this.group) {
                return undefined; // we need valid input
            }
            if (!this.ob(input)) {
                return undefined; // not tracking for input
            }
            if (!this.ib(input, context)) {
                return undefined; // not enabled for input
            }
            const resource = this.qb(input);
            if (!resource) {
                return; // need a resource for finding view state
            }
            return this.b.loadEditorState(this.group, resource);
        }
        lb(source, target, comparer) {
            return this.b.moveEditorState(source, target, comparer);
        }
        mb(resource, group) {
            this.b.clearEditorState(resource, group);
        }
        dispose() {
            super.dispose();
            if (this.j) {
                for (const [, disposables] of this.j) {
                    disposables.dispose();
                }
                this.j = undefined;
            }
        }
        /**
         * Whether view state should be tracked even when the editor is
         * disposed.
         *
         * Subclasses should override this if the input can be restored
         * from the resource at a later point, e.g. if backed by files.
         */
        pb() {
            return false;
        }
    };
    exports.$neb = $neb;
    exports.$neb = $neb = __decorate([
        __param(2, telemetry_1.$9k),
        __param(3, instantiation_1.$Ah),
        __param(4, storage_1.$Vo),
        __param(5, textResourceConfiguration_1.$FA),
        __param(6, themeService_1.$gv),
        __param(7, editorService_1.$9C),
        __param(8, editorGroupsService_1.$5C)
    ], $neb);
});
//# sourceMappingURL=editorWithViewState.js.map