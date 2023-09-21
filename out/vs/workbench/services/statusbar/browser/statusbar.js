/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StatusbarEntryKinds = exports.ShowTooltipCommand = exports.isStatusbarEntryPriority = exports.isStatusbarEntryLocation = exports.StatusbarAlignment = exports.IStatusbarService = void 0;
    exports.IStatusbarService = (0, instantiation_1.createDecorator)('statusbarService');
    var StatusbarAlignment;
    (function (StatusbarAlignment) {
        StatusbarAlignment[StatusbarAlignment["LEFT"] = 0] = "LEFT";
        StatusbarAlignment[StatusbarAlignment["RIGHT"] = 1] = "RIGHT";
    })(StatusbarAlignment || (exports.StatusbarAlignment = StatusbarAlignment = {}));
    function isStatusbarEntryLocation(thing) {
        const candidate = thing;
        return typeof candidate?.id === 'string' && typeof candidate.alignment === 'number';
    }
    exports.isStatusbarEntryLocation = isStatusbarEntryLocation;
    function isStatusbarEntryPriority(thing) {
        const candidate = thing;
        return (typeof candidate?.primary === 'number' || isStatusbarEntryLocation(candidate?.primary)) && typeof candidate?.secondary === 'number';
    }
    exports.isStatusbarEntryPriority = isStatusbarEntryPriority;
    exports.ShowTooltipCommand = {
        id: 'statusBar.entry.showTooltip',
        title: ''
    };
    exports.StatusbarEntryKinds = ['standard', 'warning', 'error', 'prominent', 'remote', 'offline'];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdHVzYmFyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3N0YXR1c2Jhci9icm93c2VyL3N0YXR1c2Jhci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFVbkYsUUFBQSxpQkFBaUIsR0FBRyxJQUFBLCtCQUFlLEVBQW9CLGtCQUFrQixDQUFDLENBQUM7SUFvRXhGLElBQWtCLGtCQUdqQjtJQUhELFdBQWtCLGtCQUFrQjtRQUNuQywyREFBSSxDQUFBO1FBQ0osNkRBQUssQ0FBQTtJQUNOLENBQUMsRUFIaUIsa0JBQWtCLGtDQUFsQixrQkFBa0IsUUFHbkM7SUF3QkQsU0FBZ0Isd0JBQXdCLENBQUMsS0FBYztRQUN0RCxNQUFNLFNBQVMsR0FBRyxLQUE0QyxDQUFDO1FBRS9ELE9BQU8sT0FBTyxTQUFTLEVBQUUsRUFBRSxLQUFLLFFBQVEsSUFBSSxPQUFPLFNBQVMsQ0FBQyxTQUFTLEtBQUssUUFBUSxDQUFDO0lBQ3JGLENBQUM7SUFKRCw0REFJQztJQXlCRCxTQUFnQix3QkFBd0IsQ0FBQyxLQUFjO1FBQ3RELE1BQU0sU0FBUyxHQUFHLEtBQTRDLENBQUM7UUFFL0QsT0FBTyxDQUFDLE9BQU8sU0FBUyxFQUFFLE9BQU8sS0FBSyxRQUFRLElBQUksd0JBQXdCLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLElBQUksT0FBTyxTQUFTLEVBQUUsU0FBUyxLQUFLLFFBQVEsQ0FBQztJQUM3SSxDQUFDO0lBSkQsNERBSUM7SUFFWSxRQUFBLGtCQUFrQixHQUFZO1FBQzFDLEVBQUUsRUFBRSw2QkFBNkI7UUFDakMsS0FBSyxFQUFFLEVBQUU7S0FDVCxDQUFDO0lBVVcsUUFBQSxtQkFBbUIsR0FBeUIsQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFDIn0=