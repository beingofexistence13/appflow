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
define(["require", "exports", "vs/nls", "vs/base/common/event", "vs/base/common/lifecycle", "vs/workbench/contrib/timeline/common/timeline", "vs/workbench/services/workingCopy/common/workingCopyHistory", "vs/base/common/uri", "vs/workbench/services/path/common/pathService", "vs/workbench/browser/parts/editor/editorCommands", "vs/platform/files/common/files", "vs/workbench/contrib/localHistory/browser/localHistoryFileSystemProvider", "vs/workbench/services/environment/common/environmentService", "vs/workbench/common/editor", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/localHistory/browser/localHistoryCommands", "vs/base/common/htmlContent", "vs/workbench/contrib/localHistory/browser/localHistory", "vs/base/common/network", "vs/platform/workspace/common/workspace", "vs/platform/workspace/common/virtualWorkspace"], function (require, exports, nls_1, event_1, lifecycle_1, timeline_1, workingCopyHistory_1, uri_1, pathService_1, editorCommands_1, files_1, localHistoryFileSystemProvider_1, environmentService_1, editor_1, configuration_1, localHistoryCommands_1, htmlContent_1, localHistory_1, network_1, workspace_1, virtualWorkspace_1) {
    "use strict";
    var LocalHistoryTimeline_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LocalHistoryTimeline = void 0;
    let LocalHistoryTimeline = class LocalHistoryTimeline extends lifecycle_1.Disposable {
        static { LocalHistoryTimeline_1 = this; }
        static { this.ID = 'timeline.localHistory'; }
        static { this.LOCAL_HISTORY_ENABLED_SETTINGS_KEY = 'workbench.localHistory.enabled'; }
        constructor(timelineService, workingCopyHistoryService, pathService, fileService, environmentService, configurationService, contextService) {
            super();
            this.timelineService = timelineService;
            this.workingCopyHistoryService = workingCopyHistoryService;
            this.pathService = pathService;
            this.fileService = fileService;
            this.environmentService = environmentService;
            this.configurationService = configurationService;
            this.contextService = contextService;
            this.id = LocalHistoryTimeline_1.ID;
            this.label = (0, nls_1.localize)('localHistory', "Local History");
            this.scheme = '*'; // we try to show local history for all schemes if possible
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this.timelineProviderDisposable = this._register(new lifecycle_1.MutableDisposable());
            this.registerComponents();
            this.registerListeners();
        }
        registerComponents() {
            // Timeline (if enabled)
            this.updateTimelineRegistration();
            // File Service Provider
            this._register(this.fileService.registerProvider(localHistoryFileSystemProvider_1.LocalHistoryFileSystemProvider.SCHEMA, new localHistoryFileSystemProvider_1.LocalHistoryFileSystemProvider(this.fileService)));
        }
        updateTimelineRegistration() {
            if (this.configurationService.getValue(LocalHistoryTimeline_1.LOCAL_HISTORY_ENABLED_SETTINGS_KEY)) {
                this.timelineProviderDisposable.value = this.timelineService.registerTimelineProvider(this);
            }
            else {
                this.timelineProviderDisposable.clear();
            }
        }
        registerListeners() {
            // History changes
            this._register(this.workingCopyHistoryService.onDidAddEntry(e => this.onDidChangeWorkingCopyHistoryEntry(e.entry)));
            this._register(this.workingCopyHistoryService.onDidChangeEntry(e => this.onDidChangeWorkingCopyHistoryEntry(e.entry)));
            this._register(this.workingCopyHistoryService.onDidReplaceEntry(e => this.onDidChangeWorkingCopyHistoryEntry(e.entry)));
            this._register(this.workingCopyHistoryService.onDidRemoveEntry(e => this.onDidChangeWorkingCopyHistoryEntry(e.entry)));
            this._register(this.workingCopyHistoryService.onDidRemoveEntries(() => this.onDidChangeWorkingCopyHistoryEntry(undefined /* all entries */)));
            this._register(this.workingCopyHistoryService.onDidMoveEntries(() => this.onDidChangeWorkingCopyHistoryEntry(undefined /* all entries */)));
            // Configuration changes
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(LocalHistoryTimeline_1.LOCAL_HISTORY_ENABLED_SETTINGS_KEY)) {
                    this.updateTimelineRegistration();
                }
            }));
        }
        onDidChangeWorkingCopyHistoryEntry(entry) {
            // Re-emit as timeline change event
            this._onDidChange.fire({
                id: LocalHistoryTimeline_1.ID,
                uri: entry?.workingCopy.resource,
                reset: true // there is no other way to indicate that items might have been replaced/removed
            });
        }
        async provideTimeline(uri, options, token) {
            const items = [];
            // Try to convert the provided `uri` into a form that is likely
            // for the provider to find entries for so that we can ensure
            // the timeline is always providing local history entries
            let resource = undefined;
            if (uri.scheme === localHistoryFileSystemProvider_1.LocalHistoryFileSystemProvider.SCHEMA) {
                // `vscode-local-history`: convert back to the associated resource
                resource = localHistoryFileSystemProvider_1.LocalHistoryFileSystemProvider.fromLocalHistoryFileSystem(uri).associatedResource;
            }
            else if (uri.scheme === this.pathService.defaultUriScheme || uri.scheme === network_1.Schemas.vscodeUserData) {
                // default-scheme / settings: keep as is
                resource = uri;
            }
            else if (this.fileService.hasProvider(uri)) {
                // anything that is backed by a file system provider:
                // try best to convert the URI back into a form that is
                // likely to match the workspace URIs. That means:
                // - change to the default URI scheme
                // - change to the remote authority or virtual workspace authority
                // - preserve the path
                resource = uri_1.URI.from({
                    scheme: this.pathService.defaultUriScheme,
                    authority: this.environmentService.remoteAuthority ?? (0, virtualWorkspace_1.getVirtualWorkspaceAuthority)(this.contextService.getWorkspace()),
                    path: uri.path
                });
            }
            if (resource) {
                // Retrieve from working copy history
                const entries = await this.workingCopyHistoryService.getEntries(resource, token);
                // Convert to timeline items
                for (const entry of entries) {
                    items.push(this.toTimelineItem(entry));
                }
            }
            return {
                source: LocalHistoryTimeline_1.ID,
                items
            };
        }
        toTimelineItem(entry) {
            return {
                handle: entry.id,
                label: editor_1.SaveSourceRegistry.getSourceLabel(entry.source),
                tooltip: new htmlContent_1.MarkdownString(`$(history) ${(0, localHistory_1.getLocalHistoryDateFormatter)().format(entry.timestamp)}\n\n${editor_1.SaveSourceRegistry.getSourceLabel(entry.source)}`, { supportThemeIcons: true }),
                source: LocalHistoryTimeline_1.ID,
                timestamp: entry.timestamp,
                themeIcon: localHistory_1.LOCAL_HISTORY_ICON_ENTRY,
                contextValue: localHistory_1.LOCAL_HISTORY_MENU_CONTEXT_VALUE,
                command: {
                    id: editorCommands_1.API_OPEN_DIFF_EDITOR_COMMAND_ID,
                    title: localHistoryCommands_1.COMPARE_WITH_FILE_LABEL.value,
                    arguments: (0, localHistoryCommands_1.toDiffEditorArguments)(entry, entry.workingCopy.resource)
                }
            };
        }
    };
    exports.LocalHistoryTimeline = LocalHistoryTimeline;
    exports.LocalHistoryTimeline = LocalHistoryTimeline = LocalHistoryTimeline_1 = __decorate([
        __param(0, timeline_1.ITimelineService),
        __param(1, workingCopyHistory_1.IWorkingCopyHistoryService),
        __param(2, pathService_1.IPathService),
        __param(3, files_1.IFileService),
        __param(4, environmentService_1.IWorkbenchEnvironmentService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, workspace_1.IWorkspaceContextService)
    ], LocalHistoryTimeline);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxIaXN0b3J5VGltZWxpbmUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9sb2NhbEhpc3RvcnkvYnJvd3Nlci9sb2NhbEhpc3RvcnlUaW1lbGluZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBd0J6RixJQUFNLG9CQUFvQixHQUExQixNQUFNLG9CQUFxQixTQUFRLHNCQUFVOztpQkFFM0IsT0FBRSxHQUFHLHVCQUF1QixBQUExQixDQUEyQjtpQkFFN0IsdUNBQWtDLEdBQUcsZ0NBQWdDLEFBQW5DLENBQW9DO1FBYTlGLFlBQ21CLGVBQWtELEVBQ3hDLHlCQUFzRSxFQUNwRixXQUEwQyxFQUMxQyxXQUEwQyxFQUMxQixrQkFBaUUsRUFDeEUsb0JBQTRELEVBQ3pELGNBQXlEO1lBRW5GLEtBQUssRUFBRSxDQUFDO1lBUjJCLG9CQUFlLEdBQWYsZUFBZSxDQUFrQjtZQUN2Qiw4QkFBeUIsR0FBekIseUJBQXlCLENBQTRCO1lBQ25FLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBQ3pCLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBQ1QsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUE4QjtZQUN2RCx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQ3hDLG1CQUFjLEdBQWQsY0FBYyxDQUEwQjtZQWxCM0UsT0FBRSxHQUFHLHNCQUFvQixDQUFDLEVBQUUsQ0FBQztZQUU3QixVQUFLLEdBQUcsSUFBQSxjQUFRLEVBQUMsY0FBYyxFQUFFLGVBQWUsQ0FBQyxDQUFDO1lBRWxELFdBQU0sR0FBRyxHQUFHLENBQUMsQ0FBQywyREFBMkQ7WUFFakUsaUJBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUF1QixDQUFDLENBQUM7WUFDMUUsZ0JBQVcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQztZQUU5QiwrQkFBMEIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksNkJBQWlCLEVBQUUsQ0FBQyxDQUFDO1lBYXJGLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1lBQzFCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzFCLENBQUM7UUFFTyxrQkFBa0I7WUFFekIsd0JBQXdCO1lBQ3hCLElBQUksQ0FBQywwQkFBMEIsRUFBRSxDQUFDO1lBRWxDLHdCQUF3QjtZQUN4QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsK0RBQThCLENBQUMsTUFBTSxFQUFFLElBQUksK0RBQThCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoSixDQUFDO1FBRU8sMEJBQTBCO1lBQ2pDLElBQUksSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBVSxzQkFBb0IsQ0FBQyxrQ0FBa0MsQ0FBQyxFQUFFO2dCQUN6RyxJQUFJLENBQUMsMEJBQTBCLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDNUY7aUJBQU07Z0JBQ04sSUFBSSxDQUFDLDBCQUEwQixDQUFDLEtBQUssRUFBRSxDQUFDO2FBQ3hDO1FBQ0YsQ0FBQztRQUVPLGlCQUFpQjtZQUV4QixrQkFBa0I7WUFDbEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEgsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsa0NBQWtDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2SCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hILElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkgsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsa0JBQWtCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5SSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsa0NBQWtDLENBQUMsU0FBUyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRTVJLHdCQUF3QjtZQUN4QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDckUsSUFBSSxDQUFDLENBQUMsb0JBQW9CLENBQUMsc0JBQW9CLENBQUMsa0NBQWtDLENBQUMsRUFBRTtvQkFDcEYsSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUM7aUJBQ2xDO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFTyxrQ0FBa0MsQ0FBQyxLQUEyQztZQUVyRixtQ0FBbUM7WUFDbkMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUM7Z0JBQ3RCLEVBQUUsRUFBRSxzQkFBb0IsQ0FBQyxFQUFFO2dCQUMzQixHQUFHLEVBQUUsS0FBSyxFQUFFLFdBQVcsQ0FBQyxRQUFRO2dCQUNoQyxLQUFLLEVBQUUsSUFBSSxDQUFDLGdGQUFnRjthQUM1RixDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsS0FBSyxDQUFDLGVBQWUsQ0FBQyxHQUFRLEVBQUUsT0FBd0IsRUFBRSxLQUF3QjtZQUNqRixNQUFNLEtBQUssR0FBbUIsRUFBRSxDQUFDO1lBRWpDLCtEQUErRDtZQUMvRCw2REFBNkQ7WUFDN0QseURBQXlEO1lBRXpELElBQUksUUFBUSxHQUFvQixTQUFTLENBQUM7WUFDMUMsSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLCtEQUE4QixDQUFDLE1BQU0sRUFBRTtnQkFDekQsa0VBQWtFO2dCQUNsRSxRQUFRLEdBQUcsK0RBQThCLENBQUMsMEJBQTBCLENBQUMsR0FBRyxDQUFDLENBQUMsa0JBQWtCLENBQUM7YUFDN0Y7aUJBQU0sSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLElBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxpQkFBTyxDQUFDLGNBQWMsRUFBRTtnQkFDckcsd0NBQXdDO2dCQUN4QyxRQUFRLEdBQUcsR0FBRyxDQUFDO2FBQ2Y7aUJBQU0sSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDN0MscURBQXFEO2dCQUNyRCx1REFBdUQ7Z0JBQ3ZELGtEQUFrRDtnQkFDbEQscUNBQXFDO2dCQUNyQyxrRUFBa0U7Z0JBQ2xFLHNCQUFzQjtnQkFDdEIsUUFBUSxHQUFHLFNBQUcsQ0FBQyxJQUFJLENBQUM7b0JBQ25CLE1BQU0sRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLGdCQUFnQjtvQkFDekMsU0FBUyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLElBQUksSUFBQSwrQ0FBNEIsRUFBQyxJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxDQUFDO29CQUN0SCxJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUk7aUJBQ2QsQ0FBQyxDQUFDO2FBQ0g7WUFFRCxJQUFJLFFBQVEsRUFBRTtnQkFFYixxQ0FBcUM7Z0JBQ3JDLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLHlCQUF5QixDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBRWpGLDRCQUE0QjtnQkFDNUIsS0FBSyxNQUFNLEtBQUssSUFBSSxPQUFPLEVBQUU7b0JBQzVCLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2lCQUN2QzthQUNEO1lBRUQsT0FBTztnQkFDTixNQUFNLEVBQUUsc0JBQW9CLENBQUMsRUFBRTtnQkFDL0IsS0FBSzthQUNMLENBQUM7UUFDSCxDQUFDO1FBRU8sY0FBYyxDQUFDLEtBQStCO1lBQ3JELE9BQU87Z0JBQ04sTUFBTSxFQUFFLEtBQUssQ0FBQyxFQUFFO2dCQUNoQixLQUFLLEVBQUUsMkJBQWtCLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7Z0JBQ3RELE9BQU8sRUFBRSxJQUFJLDRCQUFjLENBQUMsY0FBYyxJQUFBLDJDQUE0QixHQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTywyQkFBa0IsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsRUFBRSxpQkFBaUIsRUFBRSxJQUFJLEVBQUUsQ0FBQztnQkFDdEwsTUFBTSxFQUFFLHNCQUFvQixDQUFDLEVBQUU7Z0JBQy9CLFNBQVMsRUFBRSxLQUFLLENBQUMsU0FBUztnQkFDMUIsU0FBUyxFQUFFLHVDQUF3QjtnQkFDbkMsWUFBWSxFQUFFLCtDQUFnQztnQkFDOUMsT0FBTyxFQUFFO29CQUNSLEVBQUUsRUFBRSxnREFBK0I7b0JBQ25DLEtBQUssRUFBRSw4Q0FBdUIsQ0FBQyxLQUFLO29CQUNwQyxTQUFTLEVBQUUsSUFBQSw0Q0FBcUIsRUFBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUM7aUJBQ25FO2FBQ0QsQ0FBQztRQUNILENBQUM7O0lBeklXLG9EQUFvQjttQ0FBcEIsb0JBQW9CO1FBa0I5QixXQUFBLDJCQUFnQixDQUFBO1FBQ2hCLFdBQUEsK0NBQTBCLENBQUE7UUFDMUIsV0FBQSwwQkFBWSxDQUFBO1FBQ1osV0FBQSxvQkFBWSxDQUFBO1FBQ1osV0FBQSxpREFBNEIsQ0FBQTtRQUM1QixXQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFdBQUEsb0NBQXdCLENBQUE7T0F4QmQsb0JBQW9CLENBMEloQyJ9