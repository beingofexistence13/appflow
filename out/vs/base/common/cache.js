/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation"], function (require, exports, cancellation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CachedFunction = exports.LRUCachedFunction = exports.Cache = void 0;
    class Cache {
        constructor(task) {
            this.task = task;
            this.result = null;
        }
        get() {
            if (this.result) {
                return this.result;
            }
            const cts = new cancellation_1.CancellationTokenSource();
            const promise = this.task(cts.token);
            this.result = {
                promise,
                dispose: () => {
                    this.result = null;
                    cts.cancel();
                    cts.dispose();
                }
            };
            return this.result;
        }
    }
    exports.Cache = Cache;
    /**
     * Uses a LRU cache to make a given parametrized function cached.
     * Caches just the last value.
     * The key must be JSON serializable.
    */
    class LRUCachedFunction {
        constructor(fn) {
            this.fn = fn;
            this.lastCache = undefined;
            this.lastArgKey = undefined;
        }
        get(arg) {
            const key = JSON.stringify(arg);
            if (this.lastArgKey !== key) {
                this.lastArgKey = key;
                this.lastCache = this.fn(arg);
            }
            return this.lastCache;
        }
    }
    exports.LRUCachedFunction = LRUCachedFunction;
    /**
     * Uses an unbounded cache (referential equality) to memoize the results of the given function.
    */
    class CachedFunction {
        get cachedValues() {
            return this._map;
        }
        constructor(fn) {
            this.fn = fn;
            this._map = new Map();
        }
        get(arg) {
            if (this._map.has(arg)) {
                return this._map.get(arg);
            }
            const value = this.fn(arg);
            this._map.set(arg, value);
            return value;
        }
    }
    exports.CachedFunction = CachedFunction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FjaGUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2NvbW1vbi9jYWNoZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFTaEcsTUFBYSxLQUFLO1FBR2pCLFlBQW9CLElBQTJDO1lBQTNDLFNBQUksR0FBSixJQUFJLENBQXVDO1lBRHZELFdBQU0sR0FBMEIsSUFBSSxDQUFDO1FBQ3NCLENBQUM7UUFFcEUsR0FBRztZQUNGLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDaEIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO2FBQ25CO1lBRUQsTUFBTSxHQUFHLEdBQUcsSUFBSSxzQ0FBdUIsRUFBRSxDQUFDO1lBQzFDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRXJDLElBQUksQ0FBQyxNQUFNLEdBQUc7Z0JBQ2IsT0FBTztnQkFDUCxPQUFPLEVBQUUsR0FBRyxFQUFFO29CQUNiLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO29CQUNuQixHQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBQ2IsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNmLENBQUM7YUFDRCxDQUFDO1lBRUYsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3BCLENBQUM7S0FDRDtJQXhCRCxzQkF3QkM7SUFFRDs7OztNQUlFO0lBQ0YsTUFBYSxpQkFBaUI7UUFJN0IsWUFBNkIsRUFBNEI7WUFBNUIsT0FBRSxHQUFGLEVBQUUsQ0FBMEI7WUFIakQsY0FBUyxHQUEwQixTQUFTLENBQUM7WUFDN0MsZUFBVSxHQUF1QixTQUFTLENBQUM7UUFHbkQsQ0FBQztRQUVNLEdBQUcsQ0FBQyxHQUFTO1lBQ25CLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDaEMsSUFBSSxJQUFJLENBQUMsVUFBVSxLQUFLLEdBQUcsRUFBRTtnQkFDNUIsSUFBSSxDQUFDLFVBQVUsR0FBRyxHQUFHLENBQUM7Z0JBQ3RCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUM5QjtZQUNELE9BQU8sSUFBSSxDQUFDLFNBQVUsQ0FBQztRQUN4QixDQUFDO0tBQ0Q7SUFmRCw4Q0FlQztJQUVEOztNQUVFO0lBQ0YsTUFBYSxjQUFjO1FBRTFCLElBQVcsWUFBWTtZQUN0QixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDbEIsQ0FBQztRQUVELFlBQTZCLEVBQXlCO1lBQXpCLE9BQUUsR0FBRixFQUFFLENBQXVCO1lBTHJDLFNBQUksR0FBRyxJQUFJLEdBQUcsRUFBZ0IsQ0FBQztRQUtVLENBQUM7UUFFcEQsR0FBRyxDQUFDLEdBQVM7WUFDbkIsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDdkIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUUsQ0FBQzthQUMzQjtZQUNELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzFCLE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztLQUNEO0lBaEJELHdDQWdCQyJ9