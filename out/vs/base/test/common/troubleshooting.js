/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle"], function (require, exports, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.endLoggingFS = exports.beginLoggingFS = exports.endTrackingDisposables = exports.beginTrackingDisposables = void 0;
    class DisposableTracker {
        constructor() {
            this.allDisposables = [];
        }
        trackDisposable(x) {
            this.allDisposables.push([x, new Error().stack]);
        }
        setParent(child, parent) {
            for (let idx = 0; idx < this.allDisposables.length; idx++) {
                if (this.allDisposables[idx][0] === child) {
                    this.allDisposables.splice(idx, 1);
                    return;
                }
            }
        }
        markAsDisposed(x) {
            for (let idx = 0; idx < this.allDisposables.length; idx++) {
                if (this.allDisposables[idx][0] === x) {
                    this.allDisposables.splice(idx, 1);
                    return;
                }
            }
        }
        markAsSingleton(disposable) {
            // noop
        }
    }
    let currentTracker = null;
    function beginTrackingDisposables() {
        currentTracker = new DisposableTracker();
        (0, lifecycle_1.setDisposableTracker)(currentTracker);
    }
    exports.beginTrackingDisposables = beginTrackingDisposables;
    function endTrackingDisposables() {
        if (currentTracker) {
            (0, lifecycle_1.setDisposableTracker)(null);
            console.log(currentTracker.allDisposables.map(e => `${e[0]}\n${e[1]}`).join('\n\n'));
            currentTracker = null;
        }
    }
    exports.endTrackingDisposables = endTrackingDisposables;
    function beginLoggingFS(withStacks = false) {
        self.beginLoggingFS?.(withStacks);
    }
    exports.beginLoggingFS = beginLoggingFS;
    function endLoggingFS() {
        self.endLoggingFS?.();
    }
    exports.endLoggingFS = endLoggingFS;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJvdWJsZXNob290aW5nLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS90ZXN0L2NvbW1vbi90cm91Ymxlc2hvb3RpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBSWhHLE1BQU0saUJBQWlCO1FBQXZCO1lBQ0MsbUJBQWMsR0FBNEIsRUFBRSxDQUFDO1FBdUI5QyxDQUFDO1FBdEJBLGVBQWUsQ0FBQyxDQUFjO1lBQzdCLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksS0FBSyxFQUFFLENBQUMsS0FBTSxDQUFDLENBQUMsQ0FBQztRQUNuRCxDQUFDO1FBQ0QsU0FBUyxDQUFDLEtBQWtCLEVBQUUsTUFBbUI7WUFDaEQsS0FBSyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxFQUFFO2dCQUMxRCxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxFQUFFO29CQUMxQyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQ25DLE9BQU87aUJBQ1A7YUFDRDtRQUNGLENBQUM7UUFDRCxjQUFjLENBQUMsQ0FBYztZQUM1QixLQUFLLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEVBQUU7Z0JBQzFELElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBQ3RDLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDbkMsT0FBTztpQkFDUDthQUNEO1FBQ0YsQ0FBQztRQUNELGVBQWUsQ0FBQyxVQUF1QjtZQUN0QyxPQUFPO1FBQ1IsQ0FBQztLQUNEO0lBRUQsSUFBSSxjQUFjLEdBQTZCLElBQUksQ0FBQztJQUVwRCxTQUFnQix3QkFBd0I7UUFDdkMsY0FBYyxHQUFHLElBQUksaUJBQWlCLEVBQUUsQ0FBQztRQUN6QyxJQUFBLGdDQUFvQixFQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFIRCw0REFHQztJQUVELFNBQWdCLHNCQUFzQjtRQUNyQyxJQUFJLGNBQWMsRUFBRTtZQUNuQixJQUFBLGdDQUFvQixFQUFDLElBQUksQ0FBQyxDQUFDO1lBQzNCLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBZSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3RGLGNBQWMsR0FBRyxJQUFJLENBQUM7U0FDdEI7SUFDRixDQUFDO0lBTkQsd0RBTUM7SUFFRCxTQUFnQixjQUFjLENBQUMsYUFBc0IsS0FBSztRQUNuRCxJQUFLLENBQUMsY0FBYyxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUZELHdDQUVDO0lBRUQsU0FBZ0IsWUFBWTtRQUNyQixJQUFLLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQztJQUM5QixDQUFDO0lBRkQsb0NBRUMifQ==