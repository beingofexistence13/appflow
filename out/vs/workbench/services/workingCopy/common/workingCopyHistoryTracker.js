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
define(["require", "exports", "vs/nls", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/base/common/map", "vs/platform/configuration/common/configuration", "vs/platform/undoRedo/common/undoRedo", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/common/editor", "vs/workbench/services/path/common/pathService", "vs/workbench/services/workingCopy/common/storedFileWorkingCopy", "vs/workbench/services/workingCopy/common/workingCopyHistory", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/base/common/network", "vs/workbench/common/resources", "vs/platform/workspace/common/workspace", "vs/platform/files/common/files"], function (require, exports, nls_1, async_1, cancellation_1, lifecycle_1, map_1, configuration_1, undoRedo_1, uriIdentity_1, editor_1, pathService_1, storedFileWorkingCopy_1, workingCopyHistory_1, workingCopyService_1, network_1, resources_1, workspace_1, files_1) {
    "use strict";
    var WorkingCopyHistoryTracker_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkingCopyHistoryTracker = void 0;
    let WorkingCopyHistoryTracker = class WorkingCopyHistoryTracker extends lifecycle_1.Disposable {
        static { WorkingCopyHistoryTracker_1 = this; }
        static { this.SETTINGS = {
            ENABLED: 'workbench.localHistory.enabled',
            SIZE_LIMIT: 'workbench.localHistory.maxFileSize',
            EXCLUDES: 'workbench.localHistory.exclude'
        }; }
        static { this.UNDO_REDO_SAVE_SOURCE = editor_1.SaveSourceRegistry.registerSource('undoRedo.source', (0, nls_1.localize)('undoRedo.source', "Undo / Redo")); }
        constructor(workingCopyService, workingCopyHistoryService, uriIdentityService, pathService, configurationService, undoRedoService, contextService, fileService) {
            super();
            this.workingCopyService = workingCopyService;
            this.workingCopyHistoryService = workingCopyHistoryService;
            this.uriIdentityService = uriIdentityService;
            this.pathService = pathService;
            this.configurationService = configurationService;
            this.undoRedoService = undoRedoService;
            this.contextService = contextService;
            this.fileService = fileService;
            this.limiter = this._register(new async_1.Limiter(workingCopyHistory_1.MAX_PARALLEL_HISTORY_IO_OPS));
            this.resourceExcludeMatcher = this._register(new async_1.IdleValue(() => {
                const matcher = this._register(new resources_1.ResourceGlobMatcher(root => this.configurationService.getValue(WorkingCopyHistoryTracker_1.SETTINGS.EXCLUDES, { resource: root }), event => event.affectsConfiguration(WorkingCopyHistoryTracker_1.SETTINGS.EXCLUDES), this.contextService, this.configurationService));
                return matcher;
            }));
            this.pendingAddHistoryEntryOperations = new map_1.ResourceMap(resource => this.uriIdentityService.extUri.getComparisonKey(resource));
            this.workingCopyContentVersion = new map_1.ResourceMap(resource => this.uriIdentityService.extUri.getComparisonKey(resource));
            this.historyEntryContentVersion = new map_1.ResourceMap(resource => this.uriIdentityService.extUri.getComparisonKey(resource));
            this.registerListeners();
        }
        registerListeners() {
            // File Events
            this._register(this.fileService.onDidRunOperation(e => this.onDidRunFileOperation(e)));
            // Working Copy Events
            this._register(this.workingCopyService.onDidChangeContent(workingCopy => this.onDidChangeContent(workingCopy)));
            this._register(this.workingCopyService.onDidSave(e => this.onDidSave(e)));
        }
        async onDidRunFileOperation(e) {
            if (!this.shouldTrackHistoryFromFileOperationEvent(e)) {
                return; // return early for working copies we are not interested in
            }
            const source = e.resource;
            const target = e.target.resource;
            // Move working copy history entries for this file move event
            const resources = await this.workingCopyHistoryService.moveEntries(source, target);
            // Make sure to track the content version of each entry that
            // was moved in our map. This ensures that a subsequent save
            // without a content change does not add a redundant entry
            // (https://github.com/microsoft/vscode/issues/145881)
            for (const resource of resources) {
                const contentVersion = this.getContentVersion(resource);
                this.historyEntryContentVersion.set(resource, contentVersion);
            }
        }
        onDidChangeContent(workingCopy) {
            // Increment content version ID for resource
            const contentVersionId = this.getContentVersion(workingCopy.resource);
            this.workingCopyContentVersion.set(workingCopy.resource, contentVersionId + 1);
        }
        getContentVersion(resource) {
            return this.workingCopyContentVersion.get(resource) || 0;
        }
        onDidSave(e) {
            if (!this.shouldTrackHistoryFromSaveEvent(e)) {
                return; // return early for working copies we are not interested in
            }
            const contentVersion = this.getContentVersion(e.workingCopy.resource);
            if (this.historyEntryContentVersion.get(e.workingCopy.resource) === contentVersion) {
                return; // return early when content version already has associated history entry
            }
            // Cancel any previous operation for this resource
            this.pendingAddHistoryEntryOperations.get(e.workingCopy.resource)?.dispose(true);
            // Create new cancellation token support and remember
            const cts = new cancellation_1.CancellationTokenSource();
            this.pendingAddHistoryEntryOperations.set(e.workingCopy.resource, cts);
            // Queue new operation to add to history
            this.limiter.queue(async () => {
                if (cts.token.isCancellationRequested) {
                    return;
                }
                const contentVersion = this.getContentVersion(e.workingCopy.resource);
                // Figure out source of save operation if not provided already
                let source = e.source;
                if (!e.source) {
                    source = this.resolveSourceFromUndoRedo(e);
                }
                // Add entry
                await this.workingCopyHistoryService.addEntry({ resource: e.workingCopy.resource, source, timestamp: e.stat.mtime }, cts.token);
                // Remember content version as being added to history
                this.historyEntryContentVersion.set(e.workingCopy.resource, contentVersion);
                if (cts.token.isCancellationRequested) {
                    return;
                }
                // Finally remove from pending operations
                this.pendingAddHistoryEntryOperations.delete(e.workingCopy.resource);
            });
        }
        resolveSourceFromUndoRedo(e) {
            const lastStackElement = this.undoRedoService.getLastElement(e.workingCopy.resource);
            if (lastStackElement) {
                if (lastStackElement.code === 'undoredo.textBufferEdit') {
                    return undefined; // ignore any unspecific stack element that resulted just from typing
                }
                return lastStackElement.label;
            }
            const allStackElements = this.undoRedoService.getElements(e.workingCopy.resource);
            if (allStackElements.future.length > 0 || allStackElements.past.length > 0) {
                return WorkingCopyHistoryTracker_1.UNDO_REDO_SAVE_SOURCE;
            }
            return undefined;
        }
        shouldTrackHistoryFromSaveEvent(e) {
            if (!(0, storedFileWorkingCopy_1.isStoredFileWorkingCopySaveEvent)(e)) {
                return false; // only support working copies that are backed by stored files
            }
            return this.shouldTrackHistory(e.workingCopy.resource, e.stat);
        }
        shouldTrackHistoryFromFileOperationEvent(e) {
            if (!e.isOperation(2 /* FileOperation.MOVE */)) {
                return false; // only interested in move operations
            }
            return this.shouldTrackHistory(e.target.resource, e.target);
        }
        shouldTrackHistory(resource, stat) {
            if (resource.scheme !== this.pathService.defaultUriScheme && // track history for all workspace resources
                resource.scheme !== network_1.Schemas.vscodeUserData && // track history for all settings
                resource.scheme !== network_1.Schemas.inMemory // track history for tests that use in-memory
            ) {
                return false; // do not support unknown resources
            }
            const configuredMaxFileSizeInBytes = 1024 * this.configurationService.getValue(WorkingCopyHistoryTracker_1.SETTINGS.SIZE_LIMIT, { resource });
            if (stat.size > configuredMaxFileSizeInBytes) {
                return false; // only track files that are not too large
            }
            if (this.configurationService.getValue(WorkingCopyHistoryTracker_1.SETTINGS.ENABLED, { resource }) === false) {
                return false; // do not track when history is disabled
            }
            // Finally check for exclude setting
            return !this.resourceExcludeMatcher.value.matches(resource);
        }
    };
    exports.WorkingCopyHistoryTracker = WorkingCopyHistoryTracker;
    exports.WorkingCopyHistoryTracker = WorkingCopyHistoryTracker = WorkingCopyHistoryTracker_1 = __decorate([
        __param(0, workingCopyService_1.IWorkingCopyService),
        __param(1, workingCopyHistory_1.IWorkingCopyHistoryService),
        __param(2, uriIdentity_1.IUriIdentityService),
        __param(3, pathService_1.IPathService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, undoRedo_1.IUndoRedoService),
        __param(6, workspace_1.IWorkspaceContextService),
        __param(7, files_1.IFileService)
    ], WorkingCopyHistoryTracker);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2luZ0NvcHlIaXN0b3J5VHJhY2tlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy93b3JraW5nQ29weS9jb21tb24vd29ya2luZ0NvcHlIaXN0b3J5VHJhY2tlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBd0J6RixJQUFNLHlCQUF5QixHQUEvQixNQUFNLHlCQUEwQixTQUFRLHNCQUFVOztpQkFFaEMsYUFBUSxHQUFHO1lBQ2xDLE9BQU8sRUFBRSxnQ0FBZ0M7WUFDekMsVUFBVSxFQUFFLG9DQUFvQztZQUNoRCxRQUFRLEVBQUUsZ0NBQWdDO1NBQzFDLEFBSitCLENBSTlCO2lCQUVzQiwwQkFBcUIsR0FBRywyQkFBa0IsQ0FBQyxjQUFjLENBQUMsaUJBQWlCLEVBQUUsSUFBQSxjQUFRLEVBQUMsaUJBQWlCLEVBQUUsYUFBYSxDQUFDLENBQUMsQUFBbkcsQ0FBb0c7UUFvQmpKLFlBQ3NCLGtCQUF3RCxFQUNqRCx5QkFBc0UsRUFDN0Usa0JBQXdELEVBQy9ELFdBQTBDLEVBQ2pDLG9CQUE0RCxFQUNqRSxlQUFrRCxFQUMxQyxjQUF5RCxFQUNyRSxXQUEwQztZQUV4RCxLQUFLLEVBQUUsQ0FBQztZQVQ4Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBQ2hDLDhCQUF5QixHQUF6Qix5QkFBeUIsQ0FBNEI7WUFDNUQsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQUM5QyxnQkFBVyxHQUFYLFdBQVcsQ0FBYztZQUNoQix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQ2hELG9CQUFlLEdBQWYsZUFBZSxDQUFrQjtZQUN6QixtQkFBYyxHQUFkLGNBQWMsQ0FBMEI7WUFDcEQsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUExQnhDLFlBQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUks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