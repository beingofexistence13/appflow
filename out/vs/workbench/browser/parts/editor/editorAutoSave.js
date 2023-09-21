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
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/services/host/browser/host", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/platform/log/common/log"], function (require, exports, lifecycle_1, filesConfigurationService_1, host_1, editorService_1, editorGroupsService_1, workingCopyService_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditorAutoSave = void 0;
    let EditorAutoSave = class EditorAutoSave extends lifecycle_1.Disposable {
        constructor(filesConfigurationService, hostService, editorService, editorGroupService, workingCopyService, logService) {
            super();
            this.filesConfigurationService = filesConfigurationService;
            this.hostService = hostService;
            this.editorService = editorService;
            this.editorGroupService = editorGroupService;
            this.workingCopyService = workingCopyService;
            this.logService = logService;
            this.pendingAutoSavesAfterDelay = new Map();
            // Auto save: focus change & window change
            this.lastActiveEditor = undefined;
            this.lastActiveGroupId = undefined;
            this.lastActiveEditorControlDisposable = this._register(new lifecycle_1.DisposableStore());
            // Figure out initial auto save config
            this.onAutoSaveConfigurationChange(filesConfigurationService.getAutoSaveConfiguration(), false);
            // Fill in initial dirty working copies
            for (const dirtyWorkingCopy of this.workingCopyService.dirtyWorkingCopies) {
                this.onDidRegister(dirtyWorkingCopy);
            }
            this.registerListeners();
        }
        registerListeners() {
            this._register(this.hostService.onDidChangeFocus(focused => this.onWindowFocusChange(focused)));
            this._register(this.editorService.onDidActiveEditorChange(() => this.onDidActiveEditorChange()));
            this._register(this.filesConfigurationService.onAutoSaveConfigurationChange(config => this.onAutoSaveConfigurationChange(config, true)));
            // Working Copy events
            this._register(this.workingCopyService.onDidRegister(workingCopy => this.onDidRegister(workingCopy)));
            this._register(this.workingCopyService.onDidUnregister(workingCopy => this.onDidUnregister(workingCopy)));
            this._register(this.workingCopyService.onDidChangeDirty(workingCopy => this.onDidChangeDirty(workingCopy)));
            this._register(this.workingCopyService.onDidChangeContent(workingCopy => this.onDidChangeContent(workingCopy)));
        }
        onWindowFocusChange(focused) {
            if (!focused) {
                this.maybeTriggerAutoSave(4 /* SaveReason.WINDOW_CHANGE */);
            }
        }
        onDidActiveEditorChange() {
            // Treat editor change like a focus change for our last active editor if any
            if (this.lastActiveEditor && typeof this.lastActiveGroupId === 'number') {
                this.maybeTriggerAutoSave(3 /* SaveReason.FOCUS_CHANGE */, { groupId: this.lastActiveGroupId, editor: this.lastActiveEditor });
            }
            // Remember as last active
            const activeGroup = this.editorGroupService.activeGroup;
            const activeEditor = this.lastActiveEditor = activeGroup.activeEditor ?? undefined;
            this.lastActiveGroupId = activeGroup.id;
            // Dispose previous active control listeners
            this.lastActiveEditorControlDisposable.clear();
            // Listen to focus changes on control for auto save
            const activeEditorPane = this.editorService.activeEditorPane;
            if (activeEditor && activeEditorPane) {
                this.lastActiveEditorControlDisposable.add(activeEditorPane.onDidBlur(() => {
                    this.maybeTriggerAutoSave(3 /* SaveReason.FOCUS_CHANGE */, { groupId: activeGroup.id, editor: activeEditor });
                }));
            }
        }
        maybeTriggerAutoSave(reason, editorIdentifier) {
            if (editorIdentifier?.editor.isReadonly() || editorIdentifier?.editor.hasCapability(4 /* EditorInputCapabilities.Untitled */)) {
                return; // no auto save for readonly or untitled editors
            }
            // Determine if we need to save all. In case of a window focus change we also save if
            // auto save mode is configured to be ON_FOCUS_CHANGE (editor focus change)
            const mode = this.filesConfigurationService.getAutoSaveMode();
            if ((reason === 4 /* SaveReason.WINDOW_CHANGE */ && (mode === 3 /* AutoSaveMode.ON_FOCUS_CHANGE */ || mode === 4 /* AutoSaveMode.ON_WINDOW_CHANGE */)) ||
                (reason === 3 /* SaveReason.FOCUS_CHANGE */ && mode === 3 /* AutoSaveMode.ON_FOCUS_CHANGE */)) {
                this.logService.trace(`[editor auto save] triggering auto save with reason ${reason}`);
                if (editorIdentifier) {
                    this.editorService.save(editorIdentifier, { reason });
                }
                else {
                    this.saveAllDirty({ reason });
                }
            }
        }
        onAutoSaveConfigurationChange(config, fromEvent) {
            // Update auto save after delay config
            this.autoSaveAfterDelay = (typeof config.autoSaveDelay === 'number') && config.autoSaveDelay >= 0 ? config.autoSaveDelay : undefined;
            // Trigger a save-all when auto save is enabled
            if (fromEvent) {
                let reason = undefined;
                switch (this.filesConfigurationService.getAutoSaveMode()) {
                    case 3 /* AutoSaveMode.ON_FOCUS_CHANGE */:
                        reason = 3 /* SaveReason.FOCUS_CHANGE */;
                        break;
                    case 4 /* AutoSaveMode.ON_WINDOW_CHANGE */:
                        reason = 4 /* SaveReason.WINDOW_CHANGE */;
                        break;
                    case 1 /* AutoSaveMode.AFTER_SHORT_DELAY */:
                    case 2 /* AutoSaveMode.AFTER_LONG_DELAY */:
                        reason = 2 /* SaveReason.AUTO */;
                        break;
                }
                if (reason) {
                    this.saveAllDirty({ reason });
                }
            }
        }
        saveAllDirty(options) {
            for (const workingCopy of this.workingCopyService.dirtyWorkingCopies) {
                if (!(workingCopy.capabilities & 2 /* WorkingCopyCapabilities.Untitled */)) {
                    workingCopy.save(options);
                }
            }
        }
        onDidRegister(workingCopy) {
            if (workingCopy.isDirty()) {
                this.scheduleAutoSave(workingCopy);
            }
        }
        onDidUnregister(workingCopy) {
            this.discardAutoSave(workingCopy);
        }
        onDidChangeDirty(workingCopy) {
            if (workingCopy.isDirty()) {
                this.scheduleAutoSave(workingCopy);
            }
            else {
                this.discardAutoSave(workingCopy);
            }
        }
        onDidChangeContent(workingCopy) {
            if (workingCopy.isDirty()) {
                // this listener will make sure that the auto save is
                // pushed out for as long as the user is still changing
                // the content of the working copy.
                this.scheduleAutoSave(workingCopy);
            }
        }
        scheduleAutoSave(workingCopy) {
            if (typeof this.autoSaveAfterDelay !== 'number') {
                return; // auto save after delay must be enabled
            }
            if (workingCopy.capabilities & 2 /* WorkingCopyCapabilities.Untitled */) {
                return; // we never auto save untitled working copies
            }
            // Clear any running auto save operation
            this.discardAutoSave(workingCopy);
            this.logService.trace(`[editor auto save] scheduling auto save after ${this.autoSaveAfterDelay}ms`, workingCopy.resource.toString(), workingCopy.typeId);
            // Schedule new auto save
            const handle = setTimeout(() => {
                // Clear disposable
                this.discardAutoSave(workingCopy);
                // Save if dirty
                if (workingCopy.isDirty()) {
                    this.logService.trace(`[editor auto save] running auto save`, workingCopy.resource.toString(), workingCopy.typeId);
                    workingCopy.save({ reason: 2 /* SaveReason.AUTO */ });
                }
            }, this.autoSaveAfterDelay);
            // Keep in map for disposal as needed
            this.pendingAutoSavesAfterDelay.set(workingCopy, (0, lifecycle_1.toDisposable)(() => {
                this.logService.trace(`[editor auto save] clearing pending auto save`, workingCopy.resource.toString(), workingCopy.typeId);
                clearTimeout(handle);
            }));
        }
        discardAutoSave(workingCopy) {
            (0, lifecycle_1.dispose)(this.pendingAutoSavesAfterDelay.get(workingCopy));
            this.pendingAutoSavesAfterDelay.delete(workingCopy);
        }
    };
    exports.EditorAutoSave = EditorAutoSave;
    exports.EditorAutoSave = EditorAutoSave = __decorate([
        __param(0, filesConfigurationService_1.IFilesConfigurationService),
        __param(1, host_1.IHostService),
        __param(2, editorService_1.IEditorService),
        __param(3, editorGroupsService_1.IEditorGroupsService),
        __param(4, workingCopyService_1.IWorkingCopyService),
        __param(5, log_1.ILogService)
    ], EditorAutoSave);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yQXV0b1NhdmUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci9wYXJ0cy9lZGl0b3IvZWRpdG9yQXV0b1NhdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBY3pGLElBQU0sY0FBYyxHQUFwQixNQUFNLGNBQWUsU0FBUSxzQkFBVTtRQVc3QyxZQUM2Qix5QkFBc0UsRUFDcEYsV0FBMEMsRUFDeEMsYUFBOEMsRUFDeEMsa0JBQXlELEVBQzFELGtCQUF3RCxFQUNoRSxVQUF3QztZQUVyRCxLQUFLLEVBQUUsQ0FBQztZQVBxQyw4QkFBeUIsR0FBekIseUJBQXlCLENBQTRCO1lBQ25FLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBQ3ZCLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUN2Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXNCO1lBQ3pDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFDL0MsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQWJyQywrQkFBMEIsR0FBRyxJQUFJLEdBQUcsRUFBNkIsQ0FBQztZQUVuRiwwQ0FBMEM7WUFDbEMscUJBQWdCLEdBQTRCLFNBQVMsQ0FBQztZQUN0RCxzQkFBaUIsR0FBZ0MsU0FBUyxDQUFDO1lBQzNELHNDQUFpQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSwyQkFBZSxFQUFFLENBQUMsQ0FBQztZQVlqRixzQ0FBc0M7WUFDdEMsSUFBSSxDQUFDLDZCQUE2QixDQUFDLHlCQUF5QixDQUFDLHdCQUF3QixFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFaEcsdUNBQXVDO1lBQ3ZDLEtBQUssTUFBTSxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsa0JBQWtCLEVBQUU7Z0JBQzFFLElBQUksQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsQ0FB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