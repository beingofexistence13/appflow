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
define(["require", "exports", "vs/base/common/hash", "vs/base/common/map", "vs/base/common/numbers", "vs/platform/environment/common/environment", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/opener/common/opener"], function (require, exports, hash_1, map_1, numbers_1, environment_1, extensions_1, instantiation_1, log_1, opener_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$62 = exports.$52 = void 0;
    exports.$52 = (0, instantiation_1.$Bh)('ILanguageFeatureDebounceService');
    var IdentityHash;
    (function (IdentityHash) {
        const _hashes = new WeakMap();
        let pool = 0;
        function of(obj) {
            let value = _hashes.get(obj);
            if (value === undefined) {
                value = ++pool;
                _hashes.set(obj, value);
            }
            return value;
        }
        IdentityHash.of = of;
    })(IdentityHash || (IdentityHash = {}));
    class NullDebounceInformation {
        constructor(a) {
            this.a = a;
        }
        get(_model) {
            return this.a;
        }
        update(_model, _value) {
            return this.a;
        }
        default() {
            return this.a;
        }
    }
    class FeatureDebounceInformation {
        constructor(b, c, d, e, f, g) {
            this.b = b;
            this.c = c;
            this.d = d;
            this.e = e;
            this.f = f;
            this.g = g;
            this.a = new map_1.$Ci(50, 0.7);
        }
        h(model) {
            return model.id + this.d.all(model).reduce((hashVal, obj) => (0, hash_1.$qi)(IdentityHash.of(obj), hashVal), 0);
        }
        get(model) {
            const key = this.h(model);
            const avg = this.a.get(key);
            return avg
                ? (0, numbers_1.$Hl)(avg.value, this.f, this.g)
                : this.default();
        }
        update(model, value) {
            const key = this.h(model);
            let avg = this.a.get(key);
            if (!avg) {
                avg = new numbers_1.$Ll(6);
                this.a.set(key, avg);
            }
            const newValue = (0, numbers_1.$Hl)(avg.update(value), this.f, this.g);
            if (!(0, opener_1.$OT)(model.uri, 'output')) {
                this.b.trace(`[DEBOUNCE: ${this.c}] for ${model.uri.toString()} is ${newValue}ms`);
            }
            return newValue;
        }
        i() {
            const result = new numbers_1.$Kl();
            for (const [, avg] of this.a) {
                result.update(avg.value);
            }
            return result.value;
        }
        default() {
            const value = (this.i() | 0) || this.e;
            return (0, numbers_1.$Hl)(value, this.f, this.g);
        }
    }
    let $62 = class $62 {
        constructor(c, envService) {
            this.c = c;
            this.a = new Map();
            this.b = envService.isExtensionDevelopment || !envService.isBuilt;
        }
        for(feature, name, config) {
            const min = config?.min ?? 50;
            const max = config?.max ?? min ** 2;
            const extra = config?.key ?? undefined;
            const key = `${IdentityHash.of(feature)},${min}${extra ? ',' + extra : ''}`;
            let info = this.a.get(key);
            if (!info) {
                if (!this.b) {
                    this.c.debug(`[DEBOUNCE: ${name}] is disabled in developed mode`);
                    info = new NullDebounceInformation(min * 1.5);
                }
                else {
                    info = new FeatureDebounceInformation(this.c, name, feature, (this.d() | 0) || (min * 1.5), // default is overall default or derived from min-value
                    min, max);
                }
                this.a.set(key, info);
            }
            return info;
        }
        d() {
            // Average of all language features. Not a great value but an approximation
            const result = new numbers_1.$Kl();
            for (const info of this.a.values()) {
                result.update(info.default());
            }
            return result.value;
        }
    };
    exports.$62 = $62;
    exports.$62 = $62 = __decorate([
        __param(0, log_1.$5i),
        __param(1, environment_1.$Ih)
    ], $62);
    (0, extensions_1.$mr)(exports.$52, $62, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=languageFeatureDebounce.js.map