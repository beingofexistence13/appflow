/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/history", "vs/base/common/lifecycle", "vs/base/common/map", "vs/platform/instantiation/common/instantiation"], function (require, exports, history_1, lifecycle_1, map_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InteractiveHistoryService = exports.IInteractiveHistoryService = void 0;
    exports.IInteractiveHistoryService = (0, instantiation_1.createDecorator)('IInteractiveHistoryService');
    class InteractiveHistoryService extends lifecycle_1.Disposable {
        constructor() {
            super();
            this._history = new map_1.ResourceMap();
        }
        addToHistory(uri, value) {
            if (!this._history.has(uri)) {
                this._history.set(uri, new history_1.HistoryNavigator2([value], 50));
                return;
            }
            const history = this._history.get(uri);
            history.resetCursor();
            if (history?.current() !== value) {
                history?.add(value);
            }
        }
        getPreviousValue(uri) {
            const history = this._history.get(uri);
            return history?.previous() ?? null;
        }
        getNextValue(uri) {
            const history = this._history.get(uri);
            return history?.next() ?? null;
        }
        replaceLast(uri, value) {
            if (!this._history.has(uri)) {
                this._history.set(uri, new history_1.HistoryNavigator2([value], 50));
                return;
            }
            else {
                const history = this._history.get(uri);
                if (history?.current() !== value) {
                    history?.replaceLast(value);
                }
            }
        }
        clearHistory(uri) {
            this._history.delete(uri);
        }
        has(uri) {
            return this._history.has(uri) ? true : false;
        }
    }
    exports.InteractiveHistoryService = InteractiveHistoryService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJhY3RpdmVIaXN0b3J5U2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2ludGVyYWN0aXZlL2Jyb3dzZXIvaW50ZXJhY3RpdmVIaXN0b3J5U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFRbkYsUUFBQSwwQkFBMEIsR0FBRyxJQUFBLCtCQUFlLEVBQTZCLDRCQUE0QixDQUFDLENBQUM7SUFhcEgsTUFBYSx5QkFBMEIsU0FBUSxzQkFBVTtRQUl4RDtZQUNDLEtBQUssRUFBRSxDQUFDO1lBRVIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLGlCQUFXLEVBQTZCLENBQUM7UUFDOUQsQ0FBQztRQUVELFlBQVksQ0FBQyxHQUFRLEVBQUUsS0FBYTtZQUNuQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQzVCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLDJCQUFpQixDQUFTLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDbkUsT0FBTzthQUNQO1lBRUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFFLENBQUM7WUFFeEMsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3RCLElBQUksT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEtBQUssRUFBRTtnQkFDakMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNwQjtRQUNGLENBQUM7UUFDRCxnQkFBZ0IsQ0FBQyxHQUFRO1lBQ3hCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZDLE9BQU8sT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFJLElBQUksQ0FBQztRQUNwQyxDQUFDO1FBRUQsWUFBWSxDQUFDLEdBQVE7WUFDcEIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFdkMsT0FBTyxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksSUFBSSxDQUFDO1FBQ2hDLENBQUM7UUFFRCxXQUFXLENBQUMsR0FBUSxFQUFFLEtBQWE7WUFDbEMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUM1QixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSwyQkFBaUIsQ0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ25FLE9BQU87YUFDUDtpQkFBTTtnQkFDTixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDdkMsSUFBSSxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssS0FBSyxFQUFFO29CQUNqQyxPQUFPLEVBQUUsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUM1QjthQUNEO1FBRUYsQ0FBQztRQUVELFlBQVksQ0FBQyxHQUFRO1lBQ3BCLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzNCLENBQUM7UUFFRCxHQUFHLENBQUMsR0FBUTtZQUNYLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQzlDLENBQUM7S0FFRDtJQXZERCw4REF1REMifQ==