/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/observableInternal/base", "vs/base/common/observableInternal/derived", "vs/base/common/observableInternal/autorun", "vs/base/common/observableInternal/utils", "vs/base/common/observableInternal/logging"], function (require, exports, base_1, derived_1, autorun_1, utils_1, logging_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.wasEventTriggeredRecently = exports.waitForState = exports.observableSignalFromEvent = exports.observableSignal = exports.observableFromPromise = exports.observableFromEvent = exports.recomputeInitiallyAndOnChange = exports.keepObserved = exports.derivedObservableWithWritableCache = exports.derivedObservableWithCache = exports.debouncedObservable = exports.constObservable = exports.autorunWithStoreHandleChanges = exports.autorunOpts = exports.autorunWithStore = exports.autorunHandleChanges = exports.autorunDelta = exports.autorun = exports.derivedWithStore = exports.derivedHandleChanges = exports.derivedOpts = exports.derived = exports.subtransaction = exports.transaction = exports.disposableObservableValue = exports.observableValue = void 0;
    Object.defineProperty(exports, "observableValue", { enumerable: true, get: function () { return base_1.$0c; } });
    Object.defineProperty(exports, "disposableObservableValue", { enumerable: true, get: function () { return base_1.$_c; } });
    Object.defineProperty(exports, "transaction", { enumerable: true, get: function () { return base_1.$5c; } });
    Object.defineProperty(exports, "subtransaction", { enumerable: true, get: function () { return base_1.$6c; } });
    Object.defineProperty(exports, "derived", { enumerable: true, get: function () { return derived_1.$Wc; } });
    Object.defineProperty(exports, "derivedOpts", { enumerable: true, get: function () { return derived_1.$Xc; } });
    Object.defineProperty(exports, "derivedHandleChanges", { enumerable: true, get: function () { return derived_1.$Yc; } });
    Object.defineProperty(exports, "derivedWithStore", { enumerable: true, get: function () { return derived_1.$Zc; } });
    Object.defineProperty(exports, "autorun", { enumerable: true, get: function () { return autorun_1.$Ac; } });
    Object.defineProperty(exports, "autorunDelta", { enumerable: true, get: function () { return autorun_1.$Fc; } });
    Object.defineProperty(exports, "autorunHandleChanges", { enumerable: true, get: function () { return autorun_1.$Bc; } });
    Object.defineProperty(exports, "autorunWithStore", { enumerable: true, get: function () { return autorun_1.$Dc; } });
    Object.defineProperty(exports, "autorunOpts", { enumerable: true, get: function () { return autorun_1.$zc; } });
    Object.defineProperty(exports, "autorunWithStoreHandleChanges", { enumerable: true, get: function () { return autorun_1.$Cc; } });
    Object.defineProperty(exports, "constObservable", { enumerable: true, get: function () { return utils_1.$Gc; } });
    Object.defineProperty(exports, "debouncedObservable", { enumerable: true, get: function () { return utils_1.$Nc; } });
    Object.defineProperty(exports, "derivedObservableWithCache", { enumerable: true, get: function () { return utils_1.$Rc; } });
    Object.defineProperty(exports, "derivedObservableWithWritableCache", { enumerable: true, get: function () { return utils_1.$Sc; } });
    Object.defineProperty(exports, "keepObserved", { enumerable: true, get: function () { return utils_1.$Pc; } });
    Object.defineProperty(exports, "recomputeInitiallyAndOnChange", { enumerable: true, get: function () { return utils_1.$Qc; } });
    Object.defineProperty(exports, "observableFromEvent", { enumerable: true, get: function () { return utils_1.$Jc; } });
    Object.defineProperty(exports, "observableFromPromise", { enumerable: true, get: function () { return utils_1.$Hc; } });
    Object.defineProperty(exports, "observableSignal", { enumerable: true, get: function () { return utils_1.$Mc; } });
    Object.defineProperty(exports, "observableSignalFromEvent", { enumerable: true, get: function () { return utils_1.$Lc; } });
    Object.defineProperty(exports, "waitForState", { enumerable: true, get: function () { return utils_1.$Ic; } });
    Object.defineProperty(exports, "wasEventTriggeredRecently", { enumerable: true, get: function () { return utils_1.$Oc; } });
    const enableLogging = false;
    if (enableLogging) {
        (0, logging_1.$Tc)(new logging_1.$Vc());
    }
});
//# sourceMappingURL=observable.js.map