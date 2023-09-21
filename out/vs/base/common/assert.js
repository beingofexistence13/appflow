/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors"], function (require, exports, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.checkAdjacentItems = exports.assertFn = exports.assert = exports.assertNever = exports.ok = void 0;
    /**
     * Throws an error with the provided message if the provided value does not evaluate to a true Javascript value.
     *
     * @deprecated Use `assert(...)` instead.
     * This method is usually used like this:
     * ```ts
     * import * as assert from 'vs/base/common/assert';
     * assert.ok(...);
     * ```
     *
     * However, `assert` in that example is a user chosen name.
     * There is no tooling for generating such an import statement.
     * Thus, the `assert(...)` function should be used instead.
     */
    function ok(value, message) {
        if (!value) {
            throw new Error(message ? `Assertion failed (${message})` : 'Assertion Failed');
        }
    }
    exports.ok = ok;
    function assertNever(value, message = 'Unreachable') {
        throw new Error(message);
    }
    exports.assertNever = assertNever;
    function assert(condition) {
        if (!condition) {
            throw new errors_1.BugIndicatingError('Assertion Failed');
        }
    }
    exports.assert = assert;
    /**
     * condition must be side-effect free!
     */
    function assertFn(condition) {
        if (!condition()) {
            // eslint-disable-next-line no-debugger
            debugger;
            // Reevaluate `condition` again to make debugging easier
            condition();
            (0, errors_1.onUnexpectedError)(new errors_1.BugIndicatingError('Assertion Failed'));
        }
    }
    exports.assertFn = assertFn;
    function checkAdjacentItems(items, predicate) {
        let i = 0;
        while (i < items.length - 1) {
            const a = items[i];
            const b = items[i + 1];
            if (!predicate(a, b)) {
                return false;
            }
            i++;
        }
        return true;
    }
    exports.checkAdjacentItems = checkAdjacentItems;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXJ0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9jb21tb24vYXNzZXJ0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUloRzs7Ozs7Ozs7Ozs7OztPQWFHO0lBQ0gsU0FBZ0IsRUFBRSxDQUFDLEtBQWUsRUFBRSxPQUFnQjtRQUNuRCxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ1gsTUFBTSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQztTQUNoRjtJQUNGLENBQUM7SUFKRCxnQkFJQztJQUVELFNBQWdCLFdBQVcsQ0FBQyxLQUFZLEVBQUUsT0FBTyxHQUFHLGFBQWE7UUFDaEUsTUFBTSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBRkQsa0NBRUM7SUFFRCxTQUFnQixNQUFNLENBQUMsU0FBa0I7UUFDeEMsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNmLE1BQU0sSUFBSSwyQkFBa0IsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1NBQ2pEO0lBQ0YsQ0FBQztJQUpELHdCQUlDO0lBRUQ7O09BRUc7SUFDSCxTQUFnQixRQUFRLENBQUMsU0FBd0I7UUFDaEQsSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFO1lBQ2pCLHVDQUF1QztZQUN2QyxRQUFRLENBQUM7WUFDVCx3REFBd0Q7WUFDeEQsU0FBUyxFQUFFLENBQUM7WUFDWixJQUFBLDBCQUFpQixFQUFDLElBQUksMkJBQWtCLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1NBQzlEO0lBQ0YsQ0FBQztJQVJELDRCQVFDO0lBRUQsU0FBZ0Isa0JBQWtCLENBQUksS0FBbUIsRUFBRSxTQUEwQztRQUNwRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDVixPQUFPLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUM1QixNQUFNLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkIsTUFBTSxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN2QixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTtnQkFDckIsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUNELENBQUMsRUFBRSxDQUFDO1NBQ0o7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFYRCxnREFXQyJ9