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
define(["require", "exports", "vs/platform/telemetry/common/telemetry"], function (require, exports, telemetry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MergeEditorTelemetry = void 0;
    let MergeEditorTelemetry = class MergeEditorTelemetry {
        constructor(telemetryService) {
            this.telemetryService = telemetryService;
        }
        reportMergeEditorOpened(args) {
            this.telemetryService.publicLog2('mergeEditor.opened', {
                conflictCount: args.conflictCount,
                combinableConflictCount: args.combinableConflictCount,
                baseVisible: args.baseVisible,
                isColumnView: args.isColumnView,
                baseTop: args.baseTop,
            });
        }
        reportLayoutChange(args) {
            this.telemetryService.publicLog2('mergeEditor.layoutChanged', {
                baseVisible: args.baseVisible,
                isColumnView: args.isColumnView,
                baseTop: args.baseTop,
            });
        }
        reportMergeEditorClosed(args) {
            this.telemetryService.publicLog2('mergeEditor.closed', {
                conflictCount: args.conflictCount,
                combinableConflictCount: args.combinableConflictCount,
                durationOpenedSecs: args.durationOpenedSecs,
                remainingConflictCount: args.remainingConflictCount,
                accepted: args.accepted,
                conflictsResolvedWithBase: args.conflictsResolvedWithBase,
                conflictsResolvedWithInput1: args.conflictsResolvedWithInput1,
                conflictsResolvedWithInput2: args.conflictsResolvedWithInput2,
                conflictsResolvedWithSmartCombination: args.conflictsResolvedWithSmartCombination,
                manuallySolvedConflictCountThatEqualNone: args.manuallySolvedConflictCountThatEqualNone,
                manuallySolvedConflictCountThatEqualSmartCombine: args.manuallySolvedConflictCountThatEqualSmartCombine,
                manuallySolvedConflictCountThatEqualInput1: args.manuallySolvedConflictCountThatEqualInput1,
                manuallySolvedConflictCountThatEqualInput2: args.manuallySolvedConflictCountThatEqualInput2,
                manuallySolvedConflictCountThatEqualNoneAndStartedWithBase: args.manuallySolvedConflictCountThatEqualNoneAndStartedWithBase,
                manuallySolvedConflictCountThatEqualNoneAndStartedWithInput1: args.manuallySolvedConflictCountThatEqualNoneAndStartedWithInput1,
                manuallySolvedConflictCountThatEqualNoneAndStartedWithInput2: args.manuallySolvedConflictCountThatEqualNoneAndStartedWithInput2,
                manuallySolvedConflictCountThatEqualNoneAndStartedWithBothNonSmart: args.manuallySolvedConflictCountThatEqualNoneAndStartedWithBothNonSmart,
                manuallySolvedConflictCountThatEqualNoneAndStartedWithBothSmart: args.manuallySolvedConflictCountThatEqualNoneAndStartedWithBothSmart,
            });
        }
        reportAcceptInvoked(inputNumber, otherAccepted) {
            this.telemetryService.publicLog2('mergeEditor.action.accept', {
                otherAccepted: otherAccepted,
                isInput1: inputNumber === 1,
            });
        }
        reportSmartCombinationInvoked(otherAccepted) {
            this.telemetryService.publicLog2('mergeEditor.action.smartCombination', {
                otherAccepted: otherAccepted,
            });
        }
        reportRemoveInvoked(inputNumber, otherAccepted) {
            this.telemetryService.publicLog2('mergeEditor.action.remove', {
                otherAccepted: otherAccepted,
                isInput1: inputNumber === 1,
            });
        }
        reportResetToBaseInvoked() {
            this.telemetryService.publicLog2('mergeEditor.action.resetToBase', {});
        }
        reportNavigationToNextConflict() {
            this.telemetryService.publicLog2('mergeEditor.action.goToNextConflict', {});
        }
        reportNavigationToPreviousConflict() {
            this.telemetryService.publicLog2('mergeEditor.action.goToPreviousConflict', {});
        }
        reportConflictCounterClicked() {
            this.telemetryService.publicLog2('mergeEditor.action.conflictCounterClicked', {});
        }
    };
    exports.MergeEditorTelemetry = MergeEditorTelemetry;
    exports.MergeEditorTelemetry = MergeEditorTelemetry = __decorate([
        __param(0, telemetry_1.ITelemetryService)
    ], MergeEditorTelemetry);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVsZW1ldHJ5LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbWVyZ2VFZGl0b3IvYnJvd3Nlci90ZWxlbWV0cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBSXpGLElBQU0sb0JBQW9CLEdBQTFCLE1BQU0sb0JBQW9CO1FBQ2hDLFlBQ3FDLGdCQUFtQztZQUFuQyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1FBQ3BFLENBQUM7UUFFTCx1QkFBdUIsQ0FBQyxJQU92QjtZQUNBLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBa0I3QixvQkFBb0IsRUFBRTtnQkFDeEIsYUFBYSxFQUFFLElBQUksQ0FBQyxhQUFhO2dCQUNqQyx1QkFBdUIsRUFBRSxJQUFJLENBQUMsdUJBQXVCO2dCQUVyRCxXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVc7Z0JBQzdCLFlBQVksRUFBRSxJQUFJLENBQUMsWUFBWTtnQkFDL0IsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPO2FBQ3JCLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxrQkFBa0IsQ0FBQyxJQUlsQjtZQUNBLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBWTdCLDJCQUEyQixFQUFFO2dCQUMvQixXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVc7Z0JBQzdCLFlBQVksRUFBRSxJQUFJLENBQUMsWUFBWTtnQkFDL0IsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPO2FBQ3JCLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCx1QkFBdUIsQ0FBQyxJQXVCdkI7WUFDQSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQWtEN0Isb0JBQW9CLEVBQUU7Z0JBQ3hCLGFBQWEsRUFBRSxJQUFJLENBQUMsYUFBYTtnQkFDakMsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLHVCQUF1QjtnQkFFckQsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLGtCQUFrQjtnQkFDM0Msc0JBQXNCLEVBQUUsSUFBSSxDQUFDLHNCQUFzQjtnQkFDbkQsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO2dCQUV2Qix5QkFBeUIsRUFBRSxJQUFJLENBQUMseUJBQXlCO2dCQUN6RCwyQkFBMkIsRUFBRSxJQUFJLENBQUMsMkJBQTJCO2dCQUM3RCwyQkFBMkIsRUFBRSxJQUFJLENBQUMsMkJBQTJCO2dCQUM3RCxxQ0FBcUMsRUFBRSxJQUFJLENBQUMscUNBQXFDO2dCQUVqRix3Q0FBd0MsRUFBRSxJQUFJLENBQUMsd0NBQXdDO2dCQUN2RixnREFBZ0QsRUFBRSxJQUFJLENBQUMsZ0RBQWdEO2dCQUN2RywwQ0FBMEMsRUFBRSxJQUFJLENBQUMsMENBQTBDO2dCQUMzRiwwQ0FBMEMsRUFBRSxJQUFJLENBQUMsMENBQTBDO2dCQUUzRiwwREFBMEQsRUFBRSxJQUFJLENBQUMsMERBQTBEO2dCQUMzSCw0REFBNEQsRUFBRSxJQUFJLENBQUMsNERBQTREO2dCQUMvSCw0REFBNEQsRUFBRSxJQUFJLENBQUMsNERBQTREO2dCQUMvSCxrRUFBa0UsRUFBRSxJQUFJLENBQUMsa0VBQWtFO2dCQUMzSSwrREFBK0QsRUFBRSxJQUFJLENBQUMsK0RBQStEO2FBQ3JJLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxtQkFBbUIsQ0FBQyxXQUF3QixFQUFFLGFBQXNCO1lBQ25FLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBUTdCLDJCQUEyQixFQUFFO2dCQUMvQixhQUFhLEVBQUUsYUFBYTtnQkFDNUIsUUFBUSxFQUFFLFdBQVcsS0FBSyxDQUFDO2FBQzNCLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCw2QkFBNkIsQ0FBQyxhQUFzQjtZQUNuRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQU03QixxQ0FBcUMsRUFBRTtnQkFDekMsYUFBYSxFQUFFLGFBQWE7YUFDNUIsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELG1CQUFtQixDQUFDLFdBQXdCLEVBQUUsYUFBc0I7WUFDbkUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FRN0IsMkJBQTJCLEVBQUU7Z0JBQy9CLGFBQWEsRUFBRSxhQUFhO2dCQUM1QixRQUFRLEVBQUUsV0FBVyxLQUFLLENBQUM7YUFDM0IsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELHdCQUF3QjtZQUN2QixJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUk3QixnQ0FBZ0MsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMxQyxDQUFDO1FBRUQsOEJBQThCO1lBQzdCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBSTdCLHFDQUFxQyxFQUFFLEVBRXpDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxrQ0FBa0M7WUFDakMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FLN0IseUNBQXlDLEVBQUUsRUFFN0MsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELDRCQUE0QjtZQUMzQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUk3QiwyQ0FBMkMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNyRCxDQUFDO0tBQ0QsQ0FBQTtJQW5QWSxvREFBb0I7bUNBQXBCLG9CQUFvQjtRQUU5QixXQUFBLDZCQUFpQixDQUFBO09BRlAsb0JBQW9CLENBbVBoQyJ9