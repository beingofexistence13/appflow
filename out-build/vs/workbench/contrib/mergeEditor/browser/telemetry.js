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
    exports.$Gjb = void 0;
    let $Gjb = class $Gjb {
        constructor(a) {
            this.a = a;
        }
        reportMergeEditorOpened(args) {
            this.a.publicLog2('mergeEditor.opened', {
                conflictCount: args.conflictCount,
                combinableConflictCount: args.combinableConflictCount,
                baseVisible: args.baseVisible,
                isColumnView: args.isColumnView,
                baseTop: args.baseTop,
            });
        }
        reportLayoutChange(args) {
            this.a.publicLog2('mergeEditor.layoutChanged', {
                baseVisible: args.baseVisible,
                isColumnView: args.isColumnView,
                baseTop: args.baseTop,
            });
        }
        reportMergeEditorClosed(args) {
            this.a.publicLog2('mergeEditor.closed', {
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
            this.a.publicLog2('mergeEditor.action.accept', {
                otherAccepted: otherAccepted,
                isInput1: inputNumber === 1,
            });
        }
        reportSmartCombinationInvoked(otherAccepted) {
            this.a.publicLog2('mergeEditor.action.smartCombination', {
                otherAccepted: otherAccepted,
            });
        }
        reportRemoveInvoked(inputNumber, otherAccepted) {
            this.a.publicLog2('mergeEditor.action.remove', {
                otherAccepted: otherAccepted,
                isInput1: inputNumber === 1,
            });
        }
        reportResetToBaseInvoked() {
            this.a.publicLog2('mergeEditor.action.resetToBase', {});
        }
        reportNavigationToNextConflict() {
            this.a.publicLog2('mergeEditor.action.goToNextConflict', {});
        }
        reportNavigationToPreviousConflict() {
            this.a.publicLog2('mergeEditor.action.goToPreviousConflict', {});
        }
        reportConflictCounterClicked() {
            this.a.publicLog2('mergeEditor.action.conflictCounterClicked', {});
        }
    };
    exports.$Gjb = $Gjb;
    exports.$Gjb = $Gjb = __decorate([
        __param(0, telemetry_1.$9k)
    ], $Gjb);
});
//# sourceMappingURL=telemetry.js.map