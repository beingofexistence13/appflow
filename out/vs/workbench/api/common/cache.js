/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Cache = void 0;
    class Cache {
        static { this.enableDebugLogging = false; }
        constructor(id) {
            this.id = id;
            this._data = new Map();
            this._idPool = 1;
        }
        add(item) {
            const id = this._idPool++;
            this._data.set(id, item);
            this.logDebugInfo();
            return id;
        }
        get(pid, id) {
            return this._data.has(pid) ? this._data.get(pid)[id] : undefined;
        }
        delete(id) {
            this._data.delete(id);
            this.logDebugInfo();
        }
        logDebugInfo() {
            if (!Cache.enableDebugLogging) {
                return;
            }
            console.log(`${this.id} cache size - ${this._data.size}`);
        }
    }
    exports.Cache = Cache;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FjaGUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2NvbW1vbi9jYWNoZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFFaEcsTUFBYSxLQUFLO2lCQUVPLHVCQUFrQixHQUFHLEtBQUssQUFBUixDQUFTO1FBS25ELFlBQ2tCLEVBQVU7WUFBVixPQUFFLEdBQUYsRUFBRSxDQUFRO1lBSlgsVUFBSyxHQUFHLElBQUksR0FBRyxFQUF3QixDQUFDO1lBQ2pELFlBQU8sR0FBRyxDQUFDLENBQUM7UUFJaEIsQ0FBQztRQUVMLEdBQUcsQ0FBQyxJQUFrQjtZQUNyQixNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDMUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNwQixPQUFPLEVBQUUsQ0FBQztRQUNYLENBQUM7UUFFRCxHQUFHLENBQUMsR0FBVyxFQUFFLEVBQVU7WUFDMUIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUNuRSxDQUFDO1FBRUQsTUFBTSxDQUFDLEVBQVU7WUFDaEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdEIsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3JCLENBQUM7UUFFTyxZQUFZO1lBQ25CLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQUU7Z0JBQzlCLE9BQU87YUFDUDtZQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxpQkFBaUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQzNELENBQUM7O0lBaENGLHNCQWlDQyJ9