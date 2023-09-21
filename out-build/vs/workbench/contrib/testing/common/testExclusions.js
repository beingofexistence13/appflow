/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/platform/storage/common/storage", "vs/workbench/contrib/testing/common/observableValue", "vs/workbench/contrib/testing/common/storedValue"], function (require, exports, iterator_1, lifecycle_1, storage_1, observableValue_1, storedValue_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Nsb = void 0;
    let $Nsb = class $Nsb extends lifecycle_1.$kc {
        constructor(b) {
            super();
            this.b = b;
            this.a = this.B(observableValue_1.$Isb.stored(this.B(new storedValue_1.$Gsb({
                key: 'excludedTestItems',
                scope: 1 /* StorageScope.WORKSPACE */,
                target: 1 /* StorageTarget.MACHINE */,
                serialization: {
                    deserialize: v => new Set(JSON.parse(v)),
                    serialize: v => JSON.stringify([...v])
                },
            }, this.b)), new Set()));
            /**
             * Event that fires when the excluded tests change.
             */
            this.onTestExclusionsChanged = this.a.onDidChange;
        }
        /**
         * Gets whether there's any excluded tests.
         */
        get hasAny() {
            return this.a.value.size > 0;
        }
        /**
         * Gets all excluded tests.
         */
        get all() {
            return this.a.value;
        }
        /**
         * Sets whether a test is excluded.
         */
        toggle(test, exclude) {
            if (exclude !== true && this.a.value.has(test.item.extId)) {
                this.a.value = new Set(iterator_1.Iterable.filter(this.a.value, e => e !== test.item.extId));
            }
            else if (exclude !== false && !this.a.value.has(test.item.extId)) {
                this.a.value = new Set([...this.a.value, test.item.extId]);
            }
        }
        /**
         * Gets whether a test is excluded.
         */
        contains(test) {
            return this.a.value.has(test.item.extId);
        }
        /**
         * Removes all test exclusions.
         */
        clear() {
            this.a.value = new Set();
        }
    };
    exports.$Nsb = $Nsb;
    exports.$Nsb = $Nsb = __decorate([
        __param(0, storage_1.$Vo)
    ], $Nsb);
});
//# sourceMappingURL=testExclusions.js.map