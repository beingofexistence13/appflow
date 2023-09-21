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
    exports.AbstractEditorWithViewState = void 0;
    /**
     * Base class of editors that want to store and restore view state.
     */
    let AbstractEditorWithViewState = class AbstractEditorWithViewState extends editorPane_1.EditorPane {
        constructor(id, viewStateStorageKey, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorService, editorGroupService) {
            super(id, telemetryService, themeService, storageService);
            this.instantiationService = instantiationService;
            this.textResourceConfigurationService = textResourceConfigurationService;
            this.editorService = editorService;
            this.editorGroupService = editorGroupService;
            this.groupListener = this._register(new lifecycle_1.MutableDisposable());
            this.viewState = this.getEditorMemento(editorGroupService, textResourceConfigurationService, viewStateStorageKey, 100);
        }
        setEditorVisible(visible, group) {
            // Listen to close events to trigger `onWillCloseEditorInGroup`
            this.groupListener.value = group?.onWillCloseEditor(e => this.onWillCloseEditor(e));
            super.setEditorVisible(visible, group);
        }
        onWillCloseEditor(e) {
            const editor = e.editor;
            if (editor === this.input) {
                // React to editors closing to preserve or clear view state. This needs to happen
                // in the `onWillCloseEditor` because at that time the editor has not yet
                // been disposed and we can safely persist the view state.
                this.updateEditorViewState(editor);
            }
        }
        clearInput() {
            // Preserve current input view state before clearing
            this.updateEditorViewState(this.input);
            super.clearInput();
        }
        saveState() {
            // Preserve current input view state before shutting down
            this.updateEditorViewState(this.input);
            super.saveState();
        }
        updateEditorViewState(input) {
            if (!input || !this.tracksEditorViewState(input)) {
                return; // ensure we have an input to handle view state for
            }
            const resource = this.toEditorViewStateResource(input);
            if (!resource) {
                return; // we need a resource
            }
            // If we are not tracking disposed editor view state
            // make sure to clear the view state once the editor
            // is disposed.
            if (!this.tracksDisposedEditorViewState()) {
                if (!this.editorViewStateDisposables) {
                    this.editorViewStateDisposables = new Map();
                }
                if (!this.editorViewStateDisposables.has(input)) {
                    this.editorViewStateDisposables.set(input, event_1.Event.once(input.onWillDispose)(() => {
                        this.clearEditorViewState(resource, this.group);
                        this.editorViewStateDisposables?.delete(input);
                    }));
                }
            }
            // Clear the editor view state if:
            // - the editor view state should not be tracked for disposed editors
            // - the user configured to not restore view state unless the editor is still opened in the group
            if ((input.isDisposed() && !this.tracksDisposedEditorViewState()) ||
                (!this.shouldRestoreEditorViewState(input) && (!this.group || !this.group.contains(input)))) {
                this.clearEditorViewState(resource, this.group);
            }
            // Otherwise we save the view state
            else if (!input.isDisposed()) {
                this.saveEditorViewState(resource);
            }
        }
        shouldRestoreEditorViewState(input, context) {
            // new editor: check with workbench.editor.restoreViewState setting
            if (context?.newInGroup) {
                return this.textResourceConfigurationService.getValue(editor_1.EditorResourceAccessor.getOriginalUri(input, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY }), 'workbench.editor.restoreViewState') === false ? false : true /* restore by default */;
            }
            // existing editor: always restore viewstate
            return true;
        }
        getViewState() {
            const input = this.input;
            if (!input || !this.tracksEditorViewState(input)) {
                return; // need valid input for view state
            }
            const resource = this.toEditorViewStateResource(input);
            if (!resource) {
                return; // need a resource for finding view state
            }
            return this.computeEditorViewState(resource);
        }
        saveEditorViewState(resource) {
            if (!this.group) {
                return;
            }
            const editorViewState = this.computeEditorViewState(resource);
            if (!editorViewState) {
                return;
            }
            this.viewState.saveEditorState(this.group, resource, editorViewState);
        }
        loadEditorViewState(input, context) {
            if (!input || !this.group) {
                return undefined; // we need valid input
            }
            if (!this.tracksEditorViewState(input)) {
                return undefined; // not tracking for input
            }
            if (!this.shouldRestoreEditorViewState(input, context)) {
                return undefined; // not enabled for input
            }
            const resource = this.toEditorViewStateResource(input);
            if (!resource) {
                return; // need a resource for finding view state
            }
            return this.viewState.loadEditorState(this.group, resource);
        }
        moveEditorViewState(source, target, comparer) {
            return this.viewState.moveEditorState(source, target, comparer);
        }
        clearEditorViewState(resource, group) {
            this.viewState.clearEditorState(resource, group);
        }
        dispose() {
            super.dispose();
            if (this.editorViewStateDisposables) {
                for (const [, disposables] of this.editorViewStateDisposables) {
                    disposables.dispose();
                }
                this.editorViewStateDisposables = undefined;
            }
        }
        /**
         * Whether view state should be tracked even when the editor is
         * disposed.
         *
         * Subclasses should override this if the input can be restored
         * from the resource at a later point, e.g. if backed by files.
         */
        tracksDisposedEditorViewState() {
            return false;
        }
    };
    exports.AbstractEditorWithViewState = AbstractEditorWithViewState;
    exports.AbstractEditorWithViewState = AbstractEditorWithViewState = __decorate([
        __param(2, telemetry_1.ITelemetryService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, storage_1.IStorageService),
        __param(5, textResourceConfiguration_1.ITextResourceConfigurationService),
        __param(6, themeService_1.IThemeService),
        __param(7, editorService_1.IEditorService),
        __param(8, editorGroupsService_1.IEditorGroupsService)
    ], AbstractEditorWithViewState);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yV2l0aFZpZXdTdGF0ZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3BhcnRzL2VkaXRvci9lZGl0b3JXaXRoVmlld1N0YXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWlCaEc7O09BRUc7SUFDSSxJQUFlLDJCQUEyQixHQUExQyxNQUFlLDJCQUE4QyxTQUFRLHVCQUFVO1FBUXJGLFlBQ0MsRUFBVSxFQUNWLG1CQUEyQixFQUNSLGdCQUFtQyxFQUMvQixvQkFBOEQsRUFDcEUsY0FBK0IsRUFDYixnQ0FBc0YsRUFDMUcsWUFBMkIsRUFDMUIsYUFBZ0QsRUFDMUMsa0JBQTJEO1lBRWpGLEtBQUssQ0FBQyxFQUFFLEVBQUUsZ0JBQWdCLEVBQUUsWUFBWSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBUGhCLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFFL0IscUNBQWdDLEdBQWhDLGdDQUFnQyxDQUFtQztZQUV0RixrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFDdkIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFzQjtZQWJqRSxrQkFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSw2QkFBaUIsRUFBRSxDQUFDLENBQUM7WUFpQnhFLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFJLGtCQUFrQixFQUFFLGdDQUFnQyxFQUFFLG1CQUFtQixFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzNILENBQUM7UUFFa0IsZ0JBQWdCLENBQUMsT0FBZ0IsRUFBRSxLQUErQjtZQUVwRiwrREFBK0Q7WUFDL0QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEdBQUcsS0FBSyxFQUFFLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMs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