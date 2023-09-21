/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.flakySuite = void 0;
    function flakySuite(title, fn) {
        return suite(title, function () {
            // Flaky suites need retries and timeout to complete
            // e.g. because they access browser features which can
            // be unreliable depending on the environment.
            this.retries(3);
            this.timeout(1000 * 20);
            // Invoke suite ensuring that `this` is
            // properly wired in.
            fn.call(this);
        });
    }
    exports.flakySuite = flakySuite;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdFV0aWxzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS90ZXN0L2NvbW1vbi90ZXN0VXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBRWhHLFNBQWdCLFVBQVUsQ0FBQyxLQUFhLEVBQUUsRUFBYztRQUN2RCxPQUFPLEtBQUssQ0FBQyxLQUFLLEVBQUU7WUFFbkIsb0RBQW9EO1lBQ3BELHNEQUFzRDtZQUN0RCw4Q0FBOEM7WUFDOUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoQixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQztZQUV4Qix1Q0FBdUM7WUFDdkMscUJBQXFCO1lBQ3JCLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDZixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFiRCxnQ0FhQyJ9