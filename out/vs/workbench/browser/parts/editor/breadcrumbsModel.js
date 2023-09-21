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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/platform/workspace/common/workspace", "vs/base/common/network", "vs/platform/configuration/common/configuration", "vs/workbench/browser/parts/editor/breadcrumbs", "vs/platform/files/common/files", "vs/workbench/services/outline/browser/outline", "vs/platform/opener/common/opener"], function (require, exports, cancellation_1, errors_1, event_1, lifecycle_1, resources_1, workspace_1, network_1, configuration_1, breadcrumbs_1, files_1, outline_1, opener_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BreadcrumbsModel = exports.OutlineElement2 = exports.FileElement = void 0;
    class FileElement {
        constructor(uri, kind) {
            this.uri = uri;
            this.kind = kind;
        }
    }
    exports.FileElement = FileElement;
    class OutlineElement2 {
        constructor(element, outline) {
            this.element = element;
            this.outline = outline;
        }
    }
    exports.OutlineElement2 = OutlineElement2;
    let BreadcrumbsModel = class BreadcrumbsModel {
        constructor(resource, editor, configurationService, _workspaceService, _outlineService) {
            this.resource = resource;
            this._workspaceService = _workspaceService;
            this._outlineService = _outlineService;
            this._disposables = new lifecycle_1.DisposableStore();
            this._currentOutline = new lifecycle_1.MutableDisposable();
            this._outlineDisposables = new lifecycle_1.DisposableStore();
            this._onDidUpdate = new event_1.Emitter();
            this.onDidUpdate = this._onDidUpdate.event;
            this._cfgFilePath = breadcrumbs_1.BreadcrumbsConfig.FilePath.bindTo(configurationService);
            this._cfgSymbolPath = breadcrumbs_1.BreadcrumbsConfig.SymbolPath.bindTo(configurationService);
            this._disposables.add(this._cfgFilePath.onDidChange(_ => this._onDidUpdate.fire(this)));
            this._disposables.add(this._cfgSymbolPath.onDidChange(_ => this._onDidUpdate.fire(this)));
            this._workspaceService.onDidChangeWorkspaceFolders(this._onDidChangeWorkspaceFolders, this, this._disposables);
            this._fileInfo = this._initFilePathInfo(resource);
            if (editor) {
                this._bindToEditor(editor);
                this._disposables.add(_outlineService.onDidChange(() => this._bindToEditor(editor)));
                this._disposables.add(editor.onDidChangeControl(() => this._bindToEditor(editor)));
            }
            this._onDidUpdate.fire(this);
        }
        dispose() {
            this._disposables.dispose();
            this._cfgFilePath.dispose();
            this._cfgSymbolPath.dispose();
            this._currentOutline.dispose();
            this._outlineDisposables.dispose();
            this._onDidUpdate.dispose();
        }
        isRelative() {
            return Boolean(this._fileInfo.folder);
        }
        getElements() {
            let result = [];
            // file path elements
            if (this._cfgFilePath.getValue() === 'on') {
                result = result.concat(this._fileInfo.path);
            }
            else if (this._cfgFilePath.getValue() === 'last' && this._fileInfo.path.length > 0) {
                result = result.concat(this._fileInfo.path.slice(-1));
            }
            if (this._cfgSymbolPath.getValue() === 'off') {
                return result;
            }
            if (!this._currentOutline.value) {
                return result;
            }
            const breadcrumbsElements = this._currentOutline.value.config.breadcrumbsDataSource.getBreadcrumbElements();
            for (let i = this._cfgSymbolPath.getValue() === 'last' && breadcrumbsElements.length > 0 ? breadcrumbsElements.length - 1 : 0; i < breadcrumbsElements.length; i++) {
                result.push(new OutlineElement2(breadcrumbsElements[i], this._currentOutline.value));
            }
            if (breadcrumbsElements.length === 0 && !this._currentOutline.value.isEmpty) {
                result.push(new OutlineElement2(this._currentOutline.value, this._currentOutline.value));
            }
            return result;
        }
        _initFilePathInfo(uri) {
            if ((0, opener_1.matchesSomeScheme)(uri, network_1.Schemas.untitled, network_1.Schemas.data)) {
                return {
                    folder: undefined,
                    path: []
                };
            }
            const info = {
                folder: this._workspaceService.getWorkspaceFolder(uri) ?? undefined,
                path: []
            };
            let uriPrefix = uri;
            while (uriPrefix && uriPrefix.path !== '/') {
                if (info.folder && (0, resources_1.isEqual)(info.folder.uri, uriPrefix)) {
                    break;
                }
                info.path.unshift(new FileElement(uriPrefix, info.path.length === 0 ? files_1.FileKind.FILE : files_1.FileKind.FOLDER));
                const prevPathLength = uriPrefix.path.length;
                uriPrefix = (0, resources_1.dirname)(uriPrefix);
                if (uriPrefix.path.length === prevPathLength) {
                    break;
                }
            }
            if (info.folder && this._workspaceService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */) {
                info.path.unshift(new FileElement(info.folder.uri, files_1.FileKind.ROOT_FOLDER));
            }
            return info;
        }
        _onDidChangeWorkspaceFolders() {
            this._fileInfo = this._initFilePathInfo(this.resource);
            this._onDidUpdate.fire(this);
        }
        _bindToEditor(editor) {
            const newCts = new cancellation_1.CancellationTokenSource();
            this._currentOutline.clear();
            this._outlineDisposables.clear();
            this._outlineDisposables.add((0, lifecycle_1.toDisposable)(() => newCts.dispose(true)));
            this._outlineService.createOutline(editor, 2 /* OutlineTarget.Breadcrumbs */, newCts.token).then(outline => {
                if (newCts.token.isCancellationRequested) {
                    // cancelled: dispose new outline and reset
                    outline?.dispose();
                    outline = undefined;
                }
                this._currentOutline.value = outline;
                this._onDidUpdate.fire(this);
                if (outline) {
                    this._outlineDisposables.add(outline.onDidChange(() => this._onDidUpdate.fire(this)));
                }
            }).catch(err => {
                this._onDidUpdate.fire(this);
                (0, errors_1.onUnexpectedError)(err);
            });
        }
    };
    exports.BreadcrumbsModel = BreadcrumbsModel;
    exports.BreadcrumbsModel = BreadcrumbsModel = __decorate([
        __param(2, configuration_1.IConfigurationService),
        __param(3, workspace_1.IWorkspaceContextService),
        __param(4, outline_1.IOutlineService)
    ], BreadcrumbsModel);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJlYWRjcnVtYnNNb2RlbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3BhcnRzL2VkaXRvci9icmVhZGNydW1ic01vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWlCaEcsTUFBYSxXQUFXO1FBQ3ZCLFlBQ1UsR0FBUSxFQUNSLElBQWM7WUFEZCxRQUFHLEdBQUgsR0FBRyxDQUFLO1lBQ1IsU0FBSSxHQUFKLElBQUksQ0FBVTtRQUNwQixDQUFDO0tBQ0w7SUFMRCxrQ0FLQztJQUlELE1BQWEsZUFBZTtRQUMzQixZQUNVLE9BQTRCLEVBQzVCLE9BQXNCO1lBRHRCLFlBQU8sR0FBUCxPQUFPLENBQXFCO1lBQzVCLFlBQU8sR0FBUCxPQUFPLENBQWU7UUFDNUIsQ0FBQztLQUNMO0lBTEQsMENBS0M7SUFFTSxJQUFNLGdCQUFnQixHQUF0QixNQUFNLGdCQUFnQjtRQWM1QixZQUNVLFFBQWEsRUFDdEIsTUFBK0IsRUFDUixvQkFBMkMsRUFDeEMsaUJBQTRELEVBQ3JFLGVBQWlEO1lBSnpELGFBQVEsR0FBUixRQUFRLENBQUs7WUFHcUIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUEwQjtZQUNwRCxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7WUFqQmxELGlCQUFZLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFNckMsb0JBQWUsR0FBRyxJQUFJLDZCQUFpQixFQUFpQixDQUFDO1lBQ3pELHdCQUFtQixHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBRTVDLGlCQUFZLEdBQUcsSUFBSSxlQUFPLEVBQVEsQ0FBQztZQUMzQyxnQkFBVyxHQUFnQixJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQztZQVMzRCxJQUFJLENBQUMsWUFBWSxHQUFHLCtCQUFpQixDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsb0JB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