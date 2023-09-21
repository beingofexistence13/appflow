/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HoverParticipantRegistry = exports.HoverForeignElementAnchor = exports.HoverRangeAnchor = exports.HoverAnchorType = void 0;
    var HoverAnchorType;
    (function (HoverAnchorType) {
        HoverAnchorType[HoverAnchorType["Range"] = 1] = "Range";
        HoverAnchorType[HoverAnchorType["ForeignElement"] = 2] = "ForeignElement";
    })(HoverAnchorType || (exports.HoverAnchorType = HoverAnchorType = {}));
    class HoverRangeAnchor {
        constructor(priority, range, initialMousePosX, initialMousePosY) {
            this.priority = priority;
            this.range = range;
            this.initialMousePosX = initialMousePosX;
            this.initialMousePosY = initialMousePosY;
            this.type = 1 /* HoverAnchorType.Range */;
        }
        equals(other) {
            return (other.type === 1 /* HoverAnchorType.Range */ && this.range.equalsRange(other.range));
        }
        canAdoptVisibleHover(lastAnchor, showAtPosition) {
            return (lastAnchor.type === 1 /* HoverAnchorType.Range */ && showAtPosition.lineNumber === this.range.startLineNumber);
        }
    }
    exports.HoverRangeAnchor = HoverRangeAnchor;
    class HoverForeignElementAnchor {
        constructor(priority, owner, range, initialMousePosX, initialMousePosY, supportsMarkerHover) {
            this.priority = priority;
            this.owner = owner;
            this.range = range;
            this.initialMousePosX = initialMousePosX;
            this.initialMousePosY = initialMousePosY;
            this.supportsMarkerHover = supportsMarkerHover;
            this.type = 2 /* HoverAnchorType.ForeignElement */;
        }
        equals(other) {
            return (other.type === 2 /* HoverAnchorType.ForeignElement */ && this.owner === other.owner);
        }
        canAdoptVisibleHover(lastAnchor, showAtPosition) {
            return (lastAnchor.type === 2 /* HoverAnchorType.ForeignElement */ && this.owner === lastAnchor.owner);
        }
    }
    exports.HoverForeignElementAnchor = HoverForeignElementAnchor;
    exports.HoverParticipantRegistry = (new class HoverParticipantRegistry {
        constructor() {
            this._participants = [];
        }
        register(ctor) {
            this._participants.push(ctor);
        }
        getAll() {
            return this._participants;
        }
    }());
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG92ZXJUeXBlcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2hvdmVyL2Jyb3dzZXIvaG92ZXJUeXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFxQ2hHLElBQWtCLGVBR2pCO0lBSEQsV0FBa0IsZUFBZTtRQUNoQyx1REFBUyxDQUFBO1FBQ1QseUVBQWtCLENBQUE7SUFDbkIsQ0FBQyxFQUhpQixlQUFlLCtCQUFmLGVBQWUsUUFHaEM7SUFFRCxNQUFhLGdCQUFnQjtRQUU1QixZQUNpQixRQUFnQixFQUNoQixLQUFZLEVBQ1osZ0JBQW9DLEVBQ3BDLGdCQUFvQztZQUhwQyxhQUFRLEdBQVIsUUFBUSxDQUFRO1lBQ2hCLFVBQUssR0FBTCxLQUFLLENBQU87WUFDWixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW9CO1lBQ3BDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBb0I7WUFMckMsU0FBSSxpQ0FBeUI7UUFPN0MsQ0FBQztRQUNNLE1BQU0sQ0FBQyxLQUFrQjtZQUMvQixPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksa0NBQTBCLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDdEYsQ0FBQztRQUNNLG9CQUFvQixDQUFDLFVBQXVCLEVBQUUsY0FBd0I7WUFDNUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLGtDQUEwQixJQUFJLGNBQWMsQ0FBQyxVQUFVLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNoSCxDQUFDO0tBQ0Q7SUFmRCw0Q0FlQztJQUVELE1BQWEseUJBQXlCO1FBRXJDLFlBQ2lCLFFBQWdCLEVBQ2hCLEtBQThCLEVBQzlCLEtBQVksRUFDWixnQkFBb0MsRUFDcEMsZ0JBQW9DLEVBQ3BDLG1CQUF3QztZQUx4QyxhQUFRLEdBQVIsUUFBUSxDQUFRO1lBQ2hCLFVBQUssR0FBTCxLQUFLLENBQXlCO1lBQzlCLFVBQUssR0FBTCxLQUFLLENBQU87WUFDWixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW9CO1lBQ3BDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBb0I7WUFDcEMsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtZQVB6QyxTQUFJLDBDQUFrQztRQVN0RCxDQUFDO1FBQ00sTUFBTSxDQUFDLEtBQWtCO1lBQy9CLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSwyQ0FBbUMsSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN0RixDQUFDO1FBQ00sb0JBQW9CLENBQUMsVUFBdUIsRUFBRSxjQUF3QjtZQUM1RSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksMkNBQW1DLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDaEcsQ0FBQztLQUNEO0lBakJELDhEQWlCQztJQXVEWSxRQUFBLHdCQUF3QixHQUFHLENBQUMsSUFBSSxNQUFNLHdCQUF3QjtRQUE5QjtZQUU1QyxrQkFBYSxHQUFrQyxFQUFFLENBQUM7UUFVbkQsQ0FBQztRQVJPLFFBQVEsQ0FBb0MsSUFBa0Y7WUFDcEksSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBbUMsQ0FBQyxDQUFDO1FBQzlELENBQUM7UUFFTSxNQUFNO1lBQ1osT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDO1FBQzNCLENBQUM7S0FFRCxFQUFFLENBQUMsQ0FBQyJ9