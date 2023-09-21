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
define(["require", "exports", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/log/common/log", "vs/workbench/services/workingCopy/common/workingCopyBackupTracker", "vs/workbench/services/workingCopy/common/workingCopyEditorService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/editor/common/editorGroupsService"], function (require, exports, workingCopyBackup_1, filesConfigurationService_1, workingCopyService_1, lifecycle_1, log_1, workingCopyBackupTracker_1, workingCopyEditorService_1, editorService_1, editorGroupsService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$l4b = void 0;
    let $l4b = class $l4b extends workingCopyBackupTracker_1.$k4b {
        constructor(workingCopyBackupService, filesConfigurationService, workingCopyService, lifecycleService, logService, workingCopyEditorService, editorService, editorGroupService) {
            super(workingCopyBackupService, workingCopyService, logService, lifecycleService, filesConfigurationService, workingCopyEditorService, editorService, editorGroupService);
        }
        r(reason) {
            // Web: we cannot perform long running in the shutdown phase
            // As such we need to check sync if there are any modified working
            // copies that have not been backed up yet and then prevent the
            // shutdown if that is the case.
            const modifiedWorkingCopies = this.b.modifiedWorkingCopies;
            if (!modifiedWorkingCopies.length) {
                return false; // nothing modified: no veto
            }
            if (!this.g.isHotExitEnabled) {
                return true; // modified without backup: veto
            }
            for (const modifiedWorkingCopy of modifiedWorkingCopies) {
                if (!this.a.hasBackupSync(modifiedWorkingCopy, this.I(modifiedWorkingCopy))) {
                    this.c.warn('Unload veto: pending backups');
                    return true; // modified without backup: veto
                }
            }
            return false; // modified and backed up: no veto
        }
    };
    exports.$l4b = $l4b;
    exports.$l4b = $l4b = __decorate([
        __param(0, workingCopyBackup_1.$EA),
        __param(1, filesConfigurationService_1.$yD),
        __param(2, workingCopyService_1.$TC),
        __param(3, lifecycle_1.$7y),
        __param(4, log_1.$5i),
        __param(5, workingCopyEditorService_1.$AD),
        __param(6, editorService_1.$9C),
        __param(7, editorGroupsService_1.$5C)
    ], $l4b);
});
//# sourceMappingURL=workingCopyBackupTracker.js.map