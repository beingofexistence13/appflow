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
    exports.$6bb = exports.$5bb = void 0;
    let $5bb = class $5bb {
        constructor(_extHostContext, a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
        }
        dispose() { }
        $tryApplyWorkspaceEdit(dto, undoRedoGroupId, isRefactoring) {
            const edits = $6bb(dto, this.c);
            return this.a.apply(edits, { undoRedoGroupId, respectAutoSaveConfig: isRefactoring }).then((res) => res.isApplied, err => {
                this.b.warn(`IGNORING workspace edit: ${err}`);
                return false;
            });
        }
    };
    exports.$5bb = $5bb;
    exports.$5bb = $5bb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadBulkEdits),
        __param(1, bulkEditService_1.$n1),
        __param(2, log_1.$5i),
        __param(3, uriIdentity_1.$Ck)
    ], $5bb);
    function $6bb(data, uriIdentityService, resolveDataTransferFile) {
        if (!data || !data.edits) {
            return data;
        }
        const result = (0, marshalling_1.$$g)(data);
        for (const edit of result.edits) {
            if (bulkEditService_1.$p1.is(edit)) {
                edit.resource = uriIdentityService.asCanonicalUri(edit.resource);
            }
            if (bulkEditService_1.$q1.is(edit)) {
                if (edit.options) {
                    const inContents = edit.options?.contents;
                    if (inContents) {
                        if (inContents.type === 'base64') {
                            edit.options.contents = Promise.resolve((0, buffer_1.$Yd)(inContents.value));
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
            if (bulkCellEdits_1.$3bb.is(edit)) {
                edit.resource = uriIdentityService.asCanonicalUri(edit.resource);
            }
        }
        return data;
    }
    exports.$6bb = $6bb;
});
//# sourceMappingURL=mainThreadBulkEdits.js.map