/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BufferMarkCapability = void 0;
    /**
     * Manages "marks" in the buffer which are lines that are tracked when lines are added to or removed
     * from the buffer.
     */
    class BufferMarkCapability extends lifecycle_1.Disposable {
        constructor(_terminal) {
            super();
            this._terminal = _terminal;
            this.type = 4 /* TerminalCapability.BufferMarkDetection */;
            this._idToMarkerMap = new Map();
            this._anonymousMarkers = new Map();
            this._onMarkAdded = this._register(new event_1.Emitter());
            this.onMarkAdded = this._onMarkAdded.event;
        }
        *markers() {
            for (const m of this._idToMarkerMap.values()) {
                yield m;
            }
            for (const m of this._anonymousMarkers.values()) {
                yield m;
            }
        }
        addMark(properties) {
            const marker = properties?.marker || this._terminal.registerMarker();
            const id = properties?.id;
            if (!marker) {
                return;
            }
            if (id) {
                this._idToMarkerMap.set(id, marker);
                marker.onDispose(() => this._idToMarkerMap.delete(id));
            }
            else {
                this._anonymousMarkers.set(marker.id, marker);
                marker.onDispose(() => this._anonymousMarkers.delete(marker.id));
            }
            this._onMarkAdded.fire({ marker, id, hidden: properties?.hidden, hoverMessage: properties?.hoverMessage });
        }
        getMark(id) {
            return this._idToMarkerMap.get(id);
        }
    }
    exports.BufferMarkCapability = BufferMarkCapability;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVmZmVyTWFya0NhcGFiaWxpdHkuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS90ZXJtaW5hbC9jb21tb24vY2FwYWJpbGl0aWVzL2J1ZmZlck1hcmtDYXBhYmlsaXR5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVNoRzs7O09BR0c7SUFDSCxNQUFhLG9CQUFxQixTQUFRLHNCQUFVO1FBVW5ELFlBQ2tCLFNBQW1CO1lBRXBDLEtBQUssRUFBRSxDQUFDO1lBRlMsY0FBUyxHQUFULFNBQVMsQ0FBVTtZQVQ1QixTQUFJLGtEQUEwQztZQUUvQyxtQkFBYyxHQUF5QixJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQ2pELHNCQUFpQixHQUF5QixJQUFJLEdBQUcsRUFBRSxDQUFDO1lBRTNDLGlCQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBbUIsQ0FBQyxDQUFDO1lBQ3RFLGdCQUFXLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUM7UUFNL0MsQ0FBQztRQUVELENBQUMsT0FBTztZQUNQLEtBQUssTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsRUFBRTtnQkFDN0MsTUFBTSxDQUFDLENBQUM7YUFDUjtZQUNELEtBQUssTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxFQUFFO2dCQUNoRCxNQUFNLENBQUMsQ0FBQzthQUNSO1FBQ0YsQ0FBQztRQUVELE9BQU8sQ0FBQyxVQUE0QjtZQUNuQyxNQUFNLE1BQU0sR0FBRyxVQUFVLEVBQUUsTUFBTSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDckUsTUFBTSxFQUFFLEdBQUcsVUFBVSxFQUFFLEVBQUUsQ0FBQztZQUMxQixJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNaLE9BQU87YUFDUDtZQUNELElBQUksRUFBRSxFQUFFO2dCQUNQLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDcEMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQ3ZEO2lCQUFNO2dCQUNOLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDOUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQ2pFO1lBQ0QsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLENBQUMsQ0FBQztRQUM1RyxDQUFDO1FBRUQsT0FBTyxDQUFDLEVBQVU7WUFDakIsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNwQyxDQUFDO0tBQ0Q7SUE1Q0Qsb0RBNENDIn0=