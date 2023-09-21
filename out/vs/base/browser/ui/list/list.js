/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CachedListVirtualDelegate = exports.ListError = exports.ListDragOverReactions = exports.ListDragOverEffect = void 0;
    var ListDragOverEffect;
    (function (ListDragOverEffect) {
        ListDragOverEffect[ListDragOverEffect["Copy"] = 0] = "Copy";
        ListDragOverEffect[ListDragOverEffect["Move"] = 1] = "Move";
    })(ListDragOverEffect || (exports.ListDragOverEffect = ListDragOverEffect = {}));
    exports.ListDragOverReactions = {
        reject() { return { accept: false }; },
        accept() { return { accept: true }; },
    };
    class ListError extends Error {
        constructor(user, message) {
            super(`ListError [${user}] ${message}`);
        }
    }
    exports.ListError = ListError;
    class CachedListVirtualDelegate {
        constructor() {
            this.cache = new WeakMap();
        }
        getHeight(element) {
            return this.cache.get(element) ?? this.estimateHeight(element);
        }
        setDynamicHeight(element, height) {
            if (height > 0) {
                this.cache.set(element, height);
            }
        }
    }
    exports.CachedListVirtualDelegate = CachedListVirtualDelegate;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvYnJvd3Nlci91aS9saXN0L2xpc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBa0ZoRyxJQUFrQixrQkFHakI7SUFIRCxXQUFrQixrQkFBa0I7UUFDbkMsMkRBQUksQ0FBQTtRQUNKLDJEQUFJLENBQUE7SUFDTCxDQUFDLEVBSGlCLGtCQUFrQixrQ0FBbEIsa0JBQWtCLFFBR25DO0lBUVksUUFBQSxxQkFBcUIsR0FBRztRQUNwQyxNQUFNLEtBQTRCLE9BQU8sRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzdELE1BQU0sS0FBNEIsT0FBTyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDNUQsQ0FBQztJQVlGLE1BQWEsU0FBVSxTQUFRLEtBQUs7UUFFbkMsWUFBWSxJQUFZLEVBQUUsT0FBZTtZQUN4QyxLQUFLLENBQUMsY0FBYyxJQUFJLEtBQUssT0FBTyxFQUFFLENBQUMsQ0FBQztRQUN6QyxDQUFDO0tBQ0Q7SUFMRCw4QkFLQztJQUVELE1BQXNCLHlCQUF5QjtRQUEvQztZQUVTLFVBQUssR0FBRyxJQUFJLE9BQU8sRUFBYSxDQUFDO1FBYzFDLENBQUM7UUFaQSxTQUFTLENBQUMsT0FBVTtZQUNuQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDaEUsQ0FBQztRQUtELGdCQUFnQixDQUFDLE9BQVUsRUFBRSxNQUFjO1lBQzFDLElBQUksTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDZixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7YUFDaEM7UUFDRixDQUFDO0tBQ0Q7SUFoQkQsOERBZ0JDIn0=