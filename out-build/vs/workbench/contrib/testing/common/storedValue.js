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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/storage/common/storage"], function (require, exports, lifecycle_1, storage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Gsb = void 0;
    const defaultSerialization = {
        deserialize: d => JSON.parse(d),
        serialize: d => JSON.stringify(d),
    };
    /**
     * todo@connor4312: is this worthy to be in common?
     */
    let $Gsb = class $Gsb extends lifecycle_1.$kc {
        constructor(options, h) {
            super();
            this.h = h;
            this.b = options.key;
            this.c = options.scope;
            this.f = options.target;
            this.a = options.serialization ?? defaultSerialization;
            this.onDidChange = this.h.onDidChangeValue(this.c, this.b, this.B(new lifecycle_1.$jc()));
        }
        get(defaultValue) {
            if (this.g === undefined) {
                const value = this.h.get(this.b, this.c);
                this.g = value === undefined ? defaultValue : this.a.deserialize(value);
            }
            return this.g;
        }
        /**
         * Persists changes to the value.
         * @param value
         */
        store(value) {
            this.g = value;
            this.h.store(this.b, this.a.serialize(value), this.c, this.f);
        }
        /**
         * Delete an element stored under the provided key from storage.
         */
        delete() {
            this.h.remove(this.b, this.c);
        }
    };
    exports.$Gsb = $Gsb;
    exports.$Gsb = $Gsb = __decorate([
        __param(1, storage_1.$Vo)
    ], $Gsb);
});
//# sourceMappingURL=storedValue.js.map