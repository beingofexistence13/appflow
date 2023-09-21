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
define(["require", "exports", "vs/platform/log/common/log", "vs/base/common/lifecycle", "vs/platform/configuration/common/configuration", "vs/base/common/linkedList"], function (require, exports, log_1, lifecycle_1, configuration_1, linkedList_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkingCopyFileOperationParticipant = void 0;
    let WorkingCopyFileOperationParticipant = class WorkingCopyFileOperationParticipant extends lifecycle_1.Disposable {
        constructor(logService, configurationService) {
            super();
            this.logService = logService;
            this.configurationService = configurationService;
            this.participants = new linkedList_1.LinkedList();
        }
        addFileOperationParticipant(participant) {
            const remove = this.participants.push(participant);
            return (0, lifecycle_1.toDisposable)(() => remove());
        }
        async participate(files, operation, undoInfo, token) {
            const timeout = this.configurationService.getValue('files.participants.timeout');
            if (typeof timeout !== 'number' || timeout <= 0) {
                return; // disabled
            }
            // For each participant
            for (const participant of this.participants) {
                try {
                    await participant.participate(files, operation, undoInfo, timeout, token);
                }
                catch (err) {
                    this.logService.warn(err);
                }
            }
        }
        dispose() {
            this.participants.clear();
            super.dispose();
        }
    };
    exports.WorkingCopyFileOperationParticipant = WorkingCopyFileOperationParticipant;
    exports.WorkingCopyFileOperationParticipant = WorkingCopyFileOperationParticipant = __decorate([
        __param(0, log_1.ILogService),
        __param(1, configuration_1.IConfigurationService)
    ], WorkingCopyFileOperationParticipant);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2luZ0NvcHlGaWxlT3BlcmF0aW9uUGFydGljaXBhbnQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvd29ya2luZ0NvcHkvY29tbW9uL3dvcmtpbmdDb3B5RmlsZU9wZXJhdGlvblBhcnRpY2lwYW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVV6RixJQUFNLG1DQUFtQyxHQUF6QyxNQUFNLG1DQUFvQyxTQUFRLHNCQUFVO1FBSWxFLFlBQ2MsVUFBd0MsRUFDOUIsb0JBQTREO1lBRW5GLEtBQUssRUFBRSxDQUFDO1lBSHNCLGVBQVUsR0FBVixVQUFVLENBQWE7WUFDYix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBSm5FLGlCQUFZLEdBQUcsSUFBSSx1QkFBVSxFQUF3QyxDQUFDO1FBT3ZGLENBQUM7UUFFRCwyQkFBMkIsQ0FBQyxXQUFpRDtZQUM1RSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUVuRCxPQUFPLElBQUEsd0JBQVksRUFBQyxHQUFHLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQ3JDLENBQUM7UUFFRCxLQUFLLENBQUMsV0FBVyxDQUFDLEtBQXlCLEVBQUUsU0FBd0IsRUFBRSxRQUFnRCxFQUFFLEtBQXdCO1lBQ2hKLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQVMsNEJBQTRCLENBQUMsQ0FBQztZQUN6RixJQUFJLE9BQU8sT0FBTyxLQUFLLFFBQVEsSUFBSSxPQUFPLElBQUksQ0FBQyxFQUFFO2dCQUNoRCxPQUFPLENBQUMsV0FBVzthQUNuQjtZQUVELHVCQUF1QjtZQUN2QixLQUFLLE1BQU0sV0FBVyxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7Z0JBQzVDLElBQUk7b0JBQ0gsTUFBTSxXQUFXLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztpQkFDMUU7Z0JBQUMsT0FBTyxHQUFHLEVBQUU7b0JBQ2IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQzFCO2FBQ0Q7UUFDRixDQUFDO1FBRVEsT0FBTztZQUNmLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUM7WUFFMUIsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2pCLENBQUM7S0FDRCxDQUFBO0lBdENZLGtGQUFtQztrREFBbkMsbUNBQW1DO1FBSzdDLFdBQUEsaUJBQVcsQ0FBQTtRQUNYLFdBQUEscUNBQXFCLENBQUE7T0FOWCxtQ0FBbUMsQ0FzQy9DIn0=