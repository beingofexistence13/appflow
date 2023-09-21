/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/observableInternal/base", "vs/base/common/observableInternal/derived", "vs/base/common/observableInternal/autorun", "vs/base/common/observableInternal/utils", "vs/base/common/observableInternal/logging"], function (require, exports, base_1, derived_1, autorun_1, utils_1, logging_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.wasEventTriggeredRecently = exports.waitForState = exports.observableSignalFromEvent = exports.observableSignal = exports.observableFromPromise = exports.observableFromEvent = exports.recomputeInitiallyAndOnChange = exports.keepObserved = exports.derivedObservableWithWritableCache = exports.derivedObservableWithCache = exports.debouncedObservable = exports.constObservable = exports.autorunWithStoreHandleChanges = exports.autorunOpts = exports.autorunWithStore = exports.autorunHandleChanges = exports.autorunDelta = exports.autorun = exports.derivedWithStore = exports.derivedHandleChanges = exports.derivedOpts = exports.derived = exports.subtransaction = exports.transaction = exports.disposableObservableValue = exports.observableValue = void 0;
    Object.defineProperty(exports, "observableValue", { enumerable: true, get: function () { return base_1.observableValue; } });
    Object.defineProperty(exports, "disposableObservableValue", { enumerable: true, get: function () { return base_1.disposableObservableValue; } });
    Object.defineProperty(exports, "transaction", { enumerable: true, get: function () { return base_1.transaction; } });
    Object.defineProperty(exports, "subtransaction", { enumerable: true, get: function () { return base_1.subtransaction; } });
    Object.defineProperty(exports, "derived", { enumerable: true, get: function () { return derived_1.derived; } });
    Object.defineProperty(exports, "derivedOpts", { enumerable: true, get: function () { return derived_1.derivedOpts; } });
    Object.defineProperty(exports, "derivedHandleChanges", { enumerable: true, get: function () { return derived_1.derivedHandleChanges; } });
    Object.defineProperty(exports, "derivedWithStore", { enumerable: true, get: function () { return derived_1.derivedWithStore; } });
    Object.defineProperty(exports, "autorun", { enumerable: true, get: function () { return autorun_1.autorun; } });
    Object.defineProperty(exports, "autorunDelta", { enumerable: true, get: function () { return autorun_1.autorunDelta; } });
    Object.defineProperty(exports, "autorunHandleChanges", { enumerable: true, get: function () { return autorun_1.autorunHandleChanges; } });
    Object.defineProperty(exports, "autorunWithStore", { enumerable: true, get: function () { return autorun_1.autorunWithStore; } });
    Object.defineProperty(exports, "autorunOpts", { enumerable: true, get: function () { return autorun_1.autorunOpts; } });
    Object.defineProperty(exports, "autorunWithStoreHandleChanges", { enumerable: true, get: function () { return autorun_1.autorunWithStoreHandleChanges; } });
    Object.defineProperty(exports, "constObservable", { enumerable: true, get: function () { return utils_1.constObservable; } });
    Object.defineProperty(exports, "debouncedObservable", { enumerable: true, get: function () { return utils_1.debouncedObservable; } });
    Object.defineProperty(exports, "derivedObservableWithCache", { enumerable: true, get: function () { return utils_1.derivedObservableWithCache; } });
    Object.defineProperty(exports, "derivedObservableWithWritableCache", { enumerable: true, get: function () { return utils_1.derivedObservableWithWritableCache; } });
    Object.defineProperty(exports, "keepObserved", { enumerable: true, get: function () { return utils_1.keepObserved; } });
    Object.defineProperty(exports, "recomputeInitiallyAndOnChange", { enumerable: true, get: function () { return utils_1.recomputeInitiallyAndOnChange; } });
    Object.defineProperty(exports, "observableFromEvent", { enumerable: true, get: function () { return utils_1.observableFromEvent; } });
    Object.defineProperty(exports, "observableFromPromise", { enumerable: true, get: function () { return utils_1.observableFromPromise; } });
    Object.defineProperty(exports, "observableSignal", { enumerable: true, get: function () { return utils_1.observableSignal; } });
    Object.defineProperty(exports, "observableSignalFromEvent", { enumerable: true, get: function () { return utils_1.observableSignalFromEvent; } });
    Object.defineProperty(exports, "waitForState", { enumerable: true, get: function () { return utils_1.waitForState; } });
    Object.defineProperty(exports, "wasEventTriggeredRecently", { enumerable: true, get: function () { return utils_1.wasEventTriggeredRecently; } });
    const enableLogging = false;
    if (enableLogging) {
        (0, logging_1.setLogger)(new logging_1.ConsoleObservableLogger());
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JzZXJ2YWJsZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvY29tbW9uL29ic2VydmFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBVy9GLHVHQUFBLGVBQWUsT0FBQTtJQUNmLGlIQUFBLHlCQUF5QixPQUFBO0lBQ3pCLG1HQUFBLFdBQVcsT0FBQTtJQUNYLHNHQUFBLGNBQWMsT0FBQTtJQUdkLGtHQUFBLE9BQU8sT0FBQTtJQUNQLHNHQUFBLFdBQVcsT0FBQTtJQUNYLCtHQUFBLG9CQUFvQixPQUFBO0lBQ3BCLDJHQUFBLGdCQUFnQixPQUFBO0lBR2hCLGtHQUFBLE9BQU8sT0FBQTtJQUNQLHVHQUFBLFlBQVksT0FBQTtJQUNaLCtHQUFBLG9CQUFvQixPQUFBO0lBQ3BCLDJHQUFBLGdCQUFnQixPQUFBO0lBQ2hCLHNHQUFBLFdBQVcsT0FBQTtJQUNYLHdIQUFBLDZCQUE2QixPQUFBO0lBSTdCLHdHQUFBLGVBQWUsT0FBQTtJQUNmLDRHQUFBLG1CQUFtQixPQUFBO0lBQ25CLG1IQUFBLDBCQUEwQixPQUFBO0lBQzFCLDJIQUFBLGtDQUFrQyxPQUFBO0lBQ2xDLHFHQUFBLFlBQVksT0FBQTtJQUNaLHNIQUFBLDZCQUE2QixPQUFBO0lBQzdCLDRHQUFBLG1CQUFtQixPQUFBO0lBQ25CLDhHQUFBLHFCQUFxQixPQUFBO0lBQ3JCLHlHQUFBLGdCQUFnQixPQUFBO0lBQ2hCLGtIQUFBLHlCQUF5QixPQUFBO0lBQ3pCLHFHQUFBLFlBQVksT0FBQTtJQUNaLGtIQUFBLHlCQUF5QixPQUFBO0lBSzFCLE1BQU0sYUFBYSxHQUFHLEtBQUssQ0FBQztJQUM1QixJQUFJLGFBQWEsRUFBRTtRQUNsQixJQUFBLG1CQUFTLEVBQUMsSUFBSSxpQ0FBdUIsRUFBRSxDQUFDLENBQUM7S0FDekMifQ==