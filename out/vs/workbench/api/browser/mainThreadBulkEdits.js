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
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/marshalling", "vs/editor/browser/services/bulkEditService", "vs/platform/log/common/log", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/api/common/extHost.protocol", "vs/workbench/contrib/bulkEdit/browser/bulkCellEdits", "vs/workbench/services/extensions/common/extHostCustomers"], function (require, exports, buffer_1, marshalling_1, bulkEditService_1, log_1, uriIdentity_1, extHost_protocol_1, bulkCellEdits_1, extHostCustomers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.reviveWorkspaceEditDto = exports.MainThreadBulkEdits = void 0;
    let MainThreadBulkEdits = class MainThreadBulkEdits {
        constructor(_extHostContext, _bulkEditService, _logService, _uriIdentService) {
            this._bulkEditService = _bulkEditService;
            this._logService = _logService;
            this._uriIdentService = _uriIdentService;
        }
        dispose() { }
        $tryApplyWorkspaceEdit(dto, undoRedoGroupId, isRefactoring) {
            const edits = reviveWorkspaceEditDto(dto, this._uriIdentService);
            return this._bulkEditService.apply(edits, { undoRedoGroupId, respectAutoSaveConfig: isRefactoring }).then((res) => res.isApplied, err => {
                this._logService.warn(`IGNORING workspace edit: ${err}`);
                return false;
            });
        }
    };
    exports.MainThreadBulkEdits = MainThreadBulkEdits;
    exports.MainThreadBulkEdits = MainThreadBulkEdits = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadBulkEdits),
        __param(1, bulkEditService_1.IBulkEditService),
        __param(2, log_1.ILogService),
        __param(3, uriIdentity_1.IUriIdentityService)
    ], MainThreadBulkEdits);
    function reviveWorkspaceEditDto(data, uriIdentityService, resolveDataTransferFile) {
        if (!data || !data.edits) {
            return data;
        }
        const result = (0, marshalling_1.revive)(data);
        for (const edit of result.edits) {
            if (bulkEditService_1.ResourceTextEdit.is(edit)) {
                edit.resource = uriIdentityService.asCanonicalUri(edit.resource);
            }
            if (bulkEditService_1.ResourceFileEdit.is(edit)) {
                if (edit.options) {
                    const inContents = edit.options?.contents;
                    if (inContents) {
                        if (inContents.type === 'base64') {
                            edit.options.contents = Promise.resolve((0, buffer_1.decodeBase64)(inContents.value));
                        }
                        else {
                            if (resolveDataTransferFile) {
                                edit.options.contents = resolveDataTransferFile(inContents.id);
                            }
                            else {
                                throw new Error('Could not revive data transfer file');
                            }
                        }
                    }
                }
                edit.newResource = edit.newResource && uriIdentityService.asCanonicalUri(edit.newResource);
                edit.oldResource = edit.oldResource && uriIdentityService.asCanonicalUri(edit.oldResource);
            }
            if (bulkCellEdits_1.ResourceNotebookCellEdit.is(edit)) {
                edit.resource = uriIdentityService.asCanonicalUri(edit.resource);
            }
        }
        return data;
    }
    exports.reviveWorkspaceEditDto = reviveWorkspaceEditDto;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZEJ1bGtFZGl0cy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvYnJvd3Nlci9tYWluVGhyZWFkQnVsa0VkaXRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWN6RixJQUFNLG1CQUFtQixHQUF6QixNQUFNLG1CQUFtQjtRQUUvQixZQUNDLGVBQWdDLEVBQ0csZ0JBQWtDLEVBQ3ZDLFdBQXdCLEVBQ2hCLGdCQUFxQztZQUZ4QyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1lBQ3ZDLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1lBQ2hCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBcUI7UUFDeEUsQ0FBQztRQUVMLE9BQU8sS0FBVyxDQUFDO1FBRW5CLHNCQUFzQixDQUFDLEdBQXNCLEVBQUUsZUFBd0IsRUFBRSxhQUF1QjtZQUMvRixNQUFNLEtBQUssR0FBRyxzQkFBc0IsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDakUsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLGVBQWUsRUFBRSxxQkFBcUIsRUFBRSxhQUFhLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsRUFBRTtnQkFDdkksSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsNEJBQTRCLEdBQUcsRUFBRSxDQUFDLENBQUM7Z0JBQ3pELE9BQU8sS0FBSyxDQUFDO1lBQ2QsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO0tBQ0QsQ0FBQTtJQWxCWSxrREFBbUI7a0NBQW5CLG1CQUFtQjtRQUQvQixJQUFBLHVDQUFvQixFQUFDLDhCQUFXLENBQUMsbUJBQW1CLENBQUM7UUFLbkQsV0FBQSxrQ0FBZ0IsQ0FBQTtRQUNoQixXQUFBLGlCQUFXLENBQUE7UUFDWCxXQUFBLGlDQUFtQixDQUFBO09BTlQsbUJBQW1CLENBa0IvQjtJQUlELFNBQWdCLHNCQUFzQixDQUFDLElBQW1DLEVBQUUsa0JBQXVDLEVBQUUsdUJBQTJEO1FBQy9LLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ3pCLE9BQXNCLElBQUksQ0FBQztTQUMzQjtRQUNELE1BQU0sTUFBTSxHQUFHLElBQUEsb0JBQU0sRUFBZ0IsSUFBSSxDQUFDLENBQUM7UUFDM0MsS0FBSyxNQUFNLElBQUksSUFBSSxNQUFNLENBQUMsS0FBSyxFQUFFO1lBQ2hDLElBQUksa0NBQWdCLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUM5QixJQUFJLENBQUMsUUFBUSxHQUFHLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDakU7WUFDRCxJQUFJLGtDQUFnQixDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDOUIsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO29CQUNqQixNQUFNLFVBQVUsR0FBSSxJQUE4QixDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUM7b0JBQ3JFLElBQUksVUFBVSxFQUFFO3dCQUNmLElBQUksVUFBVSxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7NEJBQ2pDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBQSxxQkFBWSxFQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO3lCQUN4RTs2QkFBTTs0QkFDTixJQUFJLHVCQUF1QixFQUFFO2dDQUM1QixJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsR0FBRyx1QkFBdUIsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7NkJBQy9EO2lDQUFNO2dDQUNOLE1BQU0sSUFBSSxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQzs2QkFDdkQ7eUJBQ0Q7cUJBQ0Q7aUJBQ0Q7Z0JBQ0QsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxJQUFJLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQzNGLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsSUFBSSxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2FBQzNGO1lBQ0QsSUFBSSx3Q0FBd0IsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3RDLElBQUksQ0FBQyxRQUFRLEdBQUcsa0JBQWtCLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUNqRTtTQUNEO1FBQ0QsT0FBc0IsSUFBSSxDQUFDO0lBQzVCLENBQUM7SUFoQ0Qsd0RBZ0NDIn0=