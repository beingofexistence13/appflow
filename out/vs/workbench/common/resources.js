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
define(["require", "exports", "vs/base/common/uri", "vs/base/common/objects", "vs/base/common/path", "vs/base/common/event", "vs/base/common/resources", "vs/base/common/lifecycle", "vs/base/common/glob", "vs/platform/workspace/common/workspace", "vs/platform/configuration/common/configuration", "vs/base/common/network", "vs/base/common/map", "vs/base/common/extpath"], function (require, exports, uri_1, objects_1, path_1, event_1, resources_1, lifecycle_1, glob_1, workspace_1, configuration_1, network_1, map_1, extpath_1) {
    "use strict";
    var ResourceGlobMatcher_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ResourceGlobMatcher = void 0;
    let ResourceGlobMatcher = class ResourceGlobMatcher extends lifecycle_1.Disposable {
        static { ResourceGlobMatcher_1 = this; }
        static { this.NO_FOLDER = null; }
        constructor(getExpression, shouldUpdate, contextService, configurationService) {
            super();
            this.getExpression = getExpression;
            this.shouldUpdate = shouldUpdate;
            this.contextService = contextService;
            this.configurationService = configurationService;
            this._onExpressionChange = this._register(new event_1.Emitter());
            this.onExpressionChange = this._onExpressionChange.event;
            this.mapFolderToParsedExpression = new Map();
            this.mapFolderToConfiguredExpression = new Map();
            this.updateExpressions(false);
            this.registerListeners();
        }
        registerListeners() {
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                if (this.shouldUpdate(e)) {
                    this.updateExpressions(true);
                }
            }));
            this._register(this.contextService.onDidChangeWorkspaceFolders(() => this.updateExpressions(true)));
        }
        updateExpressions(fromEvent) {
            let changed = false;
            // Add expressions per workspaces that got added
            for (const folder of this.contextService.getWorkspace().folders) {
                const folderUriStr = folder.uri.toString();
                const newExpression = this.doGetExpression(folder.uri);
                const currentExpression = this.mapFolderToConfiguredExpression.get(folderUriStr);
                if (newExpression) {
                    if (!currentExpression || !(0, objects_1.equals)(currentExpression.expression, newExpression.expression)) {
                        changed = true;
                        this.mapFolderToParsedExpression.set(folderUriStr, (0, glob_1.parse)(newExpression.expression));
                        this.mapFolderToConfiguredExpression.set(folderUriStr, newExpression);
                    }
                }
                else {
                    if (currentExpression) {
                        changed = true;
                        this.mapFolderToParsedExpression.delete(folderUriStr);
                        this.mapFolderToConfiguredExpression.delete(folderUriStr);
                    }
                }
            }
            // Remove expressions per workspace no longer present
            const foldersMap = new map_1.ResourceSet(this.contextService.getWorkspace().folders.map(folder => folder.uri));
            for (const [folder] of this.mapFolderToConfiguredExpression) {
                if (folder === ResourceGlobMatcher_1.NO_FOLDER) {
                    continue; // always keep this one
                }
                if (!foldersMap.has(uri_1.URI.parse(folder))) {
                    this.mapFolderToParsedExpression.delete(folder);
                    this.mapFolderToConfiguredExpression.delete(folder);
                    changed = true;
                }
            }
            // Always set for resources outside workspace as well
            const globalNewExpression = this.doGetExpression(undefined);
            const globalCurrentExpression = this.mapFolderToConfiguredExpression.get(ResourceGlobMatcher_1.NO_FOLDER);
            if (globalNewExpression) {
                if (!globalCurrentExpression || !(0, objects_1.equals)(globalCurrentExpression.expression, globalNewExpression.expression)) {
                    changed = true;
                    this.mapFolderToParsedExpression.set(ResourceGlobMatcher_1.NO_FOLDER, (0, glob_1.parse)(globalNewExpression.expression));
                    this.mapFolderToConfiguredExpression.set(ResourceGlobMatcher_1.NO_FOLDER, globalNewExpression);
                }
            }
            else {
                if (globalCurrentExpression) {
                    changed = true;
                    this.mapFolderToParsedExpression.delete(ResourceGlobMatcher_1.NO_FOLDER);
                    this.mapFolderToConfiguredExpression.delete(ResourceGlobMatcher_1.NO_FOLDER);
                }
            }
            if (fromEvent && changed) {
                this._onExpressionChange.fire();
            }
        }
        doGetExpression(resource) {
            const expression = this.getExpression(resource);
            if (!expression) {
                return undefined;
            }
            const keys = Object.keys(expression);
            if (keys.length === 0) {
                return undefined;
            }
            let hasAbsolutePath = false;
            // Check the expression for absolute paths/globs
            // and specifically for Windows, make sure the
            // drive letter is lowercased, because we later
            // check with `URI.fsPath` which is always putting
            // the drive letter lowercased.
            const massagedExpression = Object.create(null);
            for (const key of keys) {
                if (!hasAbsolutePath) {
                    hasAbsolutePath = (0, path_1.isAbsolute)(key);
                }
                let massagedKey = key;
                const driveLetter = (0, extpath_1.getDriveLetter)(massagedKey, true /* probe for windows */);
                if (driveLetter) {
                    const driveLetterLower = driveLetter.toLowerCase();
                    if (driveLetter !== driveLetter.toLowerCase()) {
                        massagedKey = `${driveLetterLower}${massagedKey.substring(1)}`;
                    }
                }
                massagedExpression[massagedKey] = expression[key];
            }
            return {
                expression: massagedExpression,
                hasAbsolutePath
            };
        }
        matches(resource, hasSibling) {
            if (this.mapFolderToParsedExpression.size === 0) {
                return false; // return early: no expression for this matcher
            }
            const folder = this.contextService.getWorkspaceFolder(resource);
            let expressionForFolder;
            let expressionConfigForFolder;
            if (folder && this.mapFolderToParsedExpression.has(folder.uri.toString())) {
                expressionForFolder = this.mapFolderToParsedExpression.get(folder.uri.toString());
                expressionConfigForFolder = this.mapFolderToConfiguredExpression.get(folder.uri.toString());
            }
            else {
                expressionForFolder = this.mapFolderToParsedExpression.get(ResourceGlobMatcher_1.NO_FOLDER);
                expressionConfigForFolder = this.mapFolderToConfiguredExpression.get(ResourceGlobMatcher_1.NO_FOLDER);
            }
            if (!expressionForFolder) {
                return false; // return early: no expression for this resource
            }
            // If the resource if from a workspace, convert its absolute path to a relative
            // path so that glob patterns have a higher probability to match. For example
            // a glob pattern of "src/**" will not match on an absolute path "/folder/src/file.txt"
            // but can match on "src/file.txt"
            let resourcePathToMatch;
            if (folder) {
                resourcePathToMatch = (0, resources_1.relativePath)(folder.uri, resource);
            }
            else {
                resourcePathToMatch = this.uriToPath(resource);
            }
            if (typeof resourcePathToMatch === 'string' && !!expressionForFolder(resourcePathToMatch, undefined, hasSibling)) {
                return true;
            }
            // If the configured expression has an absolute path, we also check for absolute paths
            // to match, otherwise we potentially miss out on matches. We only do that if we previously
            // matched on the relative path.
            if (resourcePathToMatch !== this.uriToPath(resource) && expressionConfigForFolder?.hasAbsolutePath) {
                return !!expressionForFolder(this.uriToPath(resource), undefined, hasSibling);
            }
            return false;
        }
        uriToPath(uri) {
            if (uri.scheme === network_1.Schemas.file) {
                return uri.fsPath;
            }
            return uri.path;
        }
    };
    exports.ResourceGlobMatcher = ResourceGlobMatcher;
    exports.ResourceGlobMatcher = ResourceGlobMatcher = ResourceGlobMatcher_1 = __decorate([
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, configuration_1.IConfigurationService)
    ], ResourceGlobMatcher);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2VzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbW1vbi9yZXNvdXJjZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQW9CekYsSUFBTSxtQkFBbUIsR0FBekIsTUFBTSxtQkFBb0IsU0FBUSxzQkFBVTs7aUJBRTFCLGNBQVMsR0FBRyxJQUFJLEFBQVAsQ0FBUTtRQVF6QyxZQUNTLGFBQXdELEVBQ3hELFlBQTJELEVBQ3pDLGNBQXlELEVBQzVELG9CQUE0RDtZQUVuRixLQUFLLEVBQUUsQ0FBQztZQUxBLGtCQUFhLEdBQWIsYUFBYSxDQUEyQztZQUN4RCxpQkFBWSxHQUFaLFlBQVksQ0FBK0M7WUFDeEIsbUJBQWMsR0FBZCxjQUFjLENBQTBCO1lBQzNDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFWbkUsd0JBQW1CLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBUSxDQUFDLENBQUM7WUFDbEUsdUJBQWtCLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQztZQUU1QyxnQ0FBMkIsR0FBRyxJQUFJLEdBQUcsRUFBbUMsQ0FBQztZQUN6RSxvQ0FBK0IsR0FBRyxJQUFJLEdBQUcsRUFBd0MsQ0FBQztZQVVsRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFOUIsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDMUIsQ0FBQztRQUVPLGlCQUFpQjtZQUN4QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDckUsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFO29CQUN6QixJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFD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