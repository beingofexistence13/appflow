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
define(["require", "exports", "vs/nls", "vs/base/common/async", "vs/base/common/cancellation", "vs/platform/log/common/log", "vs/platform/progress/common/progress", "vs/base/common/lifecycle", "vs/base/common/arrays"], function (require, exports, nls_1, async_1, cancellation_1, log_1, progress_1, lifecycle_1, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StoredFileWorkingCopySaveParticipant = void 0;
    let StoredFileWorkingCopySaveParticipant = class StoredFileWorkingCopySaveParticipant extends lifecycle_1.Disposable {
        get length() { return this.saveParticipants.length; }
        constructor(progressService, logService) {
            super();
            this.progressService = progressService;
            this.logService = logService;
            this.saveParticipants = [];
        }
        addSaveParticipant(participant) {
            const remove = (0, arrays_1.insert)(this.saveParticipants, participant);
            return (0, lifecycle_1.toDisposable)(() => remove());
        }
        participate(workingCopy, context, token) {
            const cts = new cancellation_1.CancellationTokenSource(token);
            return this.progressService.withProgress({
                title: (0, nls_1.localize)('saveParticipants', "Saving '{0}'", workingCopy.name),
                location: 15 /* ProgressLocation.Notification */,
                cancellable: true,
                delay: workingCopy.isDirty() ? 3000 : 5000
            }, async (progress) => {
                // undoStop before participation
                workingCopy.model?.pushStackElement();
                for (const saveParticipant of this.saveParticipants) {
                    if (cts.token.isCancellationRequested || workingCopy.isDisposed()) {
                        break;
                    }
                    try {
                        const promise = saveParticipant.participate(workingCopy, context, progress, cts.token);
                        await (0, async_1.raceCancellation)(promise, cts.token);
                    }
                    catch (err) {
                        this.logService.warn(err);
                    }
                }
                // undoStop after participation
                workingCopy.model?.pushStackElement();
                // Cleanup
                cts.dispose();
            }, () => {
                // user cancel
                cts.dispose(true);
            });
        }
        dispose() {
            this.saveParticipants.splice(0, this.saveParticipants.length);
            super.dispose();
        }
    };
    exports.StoredFileWorkingCopySaveParticipant = StoredFileWorkingCopySaveParticipant;
    exports.StoredFileWorkingCopySaveParticipant = StoredFileWorkingCopySaveParticipant = __decorate([
        __param(0, progress_1.IProgressService),
        __param(1, log_1.ILogService)
    ], StoredFileWorkingCopySaveParticipant);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmVkRmlsZVdvcmtpbmdDb3B5U2F2ZVBhcnRpY2lwYW50LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3dvcmtpbmdDb3B5L2NvbW1vbi9zdG9yZWRGaWxlV29ya2luZ0NvcHlTYXZlUGFydGljaXBhbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBYXpGLElBQU0sb0NBQW9DLEdBQTFDLE1BQU0sb0NBQXFDLFNBQVEsc0JBQVU7UUFJbkUsSUFBSSxNQUFNLEtBQWEsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUU3RCxZQUNtQixlQUFrRCxFQUN2RCxVQUF3QztZQUVyRCxLQUFLLEVBQUUsQ0FBQztZQUgyQixvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7WUFDdEMsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQU5yQyxxQkFBZ0IsR0FBNEMsRUFBRSxDQUFDO1FBU2hGLENBQUM7UUFFRCxrQkFBa0IsQ0FBQyxXQUFrRDtZQUNwRSxNQUFNLE1BQU0sR0FBRyxJQUFBLGVBQU0sRUFBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFFMUQsT0FBTyxJQUFBLHdCQUFZLEVBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUNyQyxDQUFDO1FBRUQsV0FBVyxDQUFDLFdBQWdFLEVBQUUsT0FBK0IsRUFBRSxLQUF3QjtZQUN0SSxNQUFNLEdBQUcsR0FBRyxJQUFJLHNDQUF1QixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRS9DLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUM7Z0JBQ3hDLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxrQkFBa0IsRUFBRSxjQUFjLEVBQUUsV0FBVyxDQUFDLElBQUksQ0FBQztnQkFDckUsUUFBUSx3Q0FBK0I7Z0JBQ3ZDLFdBQVcsRUFBRSxJQUFJO2dCQUNqQixLQUFLLEVBQUUsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUk7YUFDMUMsRUFBRSxLQUFLLEVBQUMsUUFBUSxFQUFDLEVBQUU7Z0JBRW5CLGdDQUFnQztnQkFDaEMsV0FBVyxDQUFDLEtBQUssRUFBRSxnQkFBZ0IsRUFBRSxDQUFDO2dCQUV0QyxLQUFLLE1BQU0sZUFBZSxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtvQkFDcEQsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLHVCQUF1QixJQUFJLFdBQVcsQ0FBQyxVQUFVLEVBQUUsRUFBRTt3QkFDbEUsTUFBTTtxQkFDTjtvQkFFRCxJQUFJO3dCQUNILE1BQU0sT0FBTyxHQUFHLGVBQWUsQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUN2RixNQUFNLElBQUEsd0JBQWdCLEVBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztxQkFDM0M7b0JBQUMsT0FBTyxHQUFHLEVBQUU7d0JBQ2IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7cUJBQzFCO2lCQUNEO2dCQUVELCtCQUErQjtnQkFDL0IsV0FBVyxDQUFDLEtBQUssRUFBRSxnQkFBZ0IsRUFBRSxDQUFDO2dCQUV0QyxVQUFVO2dCQUNWLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNmLENBQUMsRUFBRSxHQUFHLEVBQUU7Z0JBQ1AsY0FBYztnQkFDZCxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ25CLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVRLE9BQU87WUFDZixJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFOUQsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2pCLENBQUM7S0FDRCxDQUFBO0lBN0RZLG9GQUFvQzttREFBcEMsb0NBQW9DO1FBTzlDLFdBQUEsMkJBQWdCLENBQUE7UUFDaEIsV0FBQSxpQkFBVyxDQUFBO09BUkQsb0NBQW9DLENBNkRoRCJ9