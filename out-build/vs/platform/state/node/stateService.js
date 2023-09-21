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
define(["require", "exports", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/lifecycle", "vs/base/common/types", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/log/common/log"], function (require, exports, async_1, buffer_1, lifecycle_1, types_1, environment_1, files_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$hN = exports.$gN = exports.$fN = exports.SaveStrategy = void 0;
    var SaveStrategy;
    (function (SaveStrategy) {
        SaveStrategy[SaveStrategy["IMMEDIATE"] = 0] = "IMMEDIATE";
        SaveStrategy[SaveStrategy["DELAYED"] = 1] = "DELAYED";
    })(SaveStrategy || (exports.SaveStrategy = SaveStrategy = {}));
    class $fN extends lifecycle_1.$kc {
        constructor(h, saveStrategy, j, m) {
            super();
            this.h = h;
            this.j = j;
            this.m = m;
            this.a = Object.create(null);
            this.b = '';
            this.f = undefined;
            this.g = undefined;
            this.c = saveStrategy === 0 /* SaveStrategy.IMMEDIATE */ ? undefined : this.B(new async_1.$Eg(100 /* buffer saves over a short time */));
        }
        init() {
            if (!this.f) {
                this.f = this.n();
            }
            return this.f;
        }
        async n() {
            try {
                this.b = (await this.m.readFile(this.h)).value.toString();
                this.a = JSON.parse(this.b);
            }
            catch (error) {
                if (error.fileOperationResult !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                    this.j.error(error);
                }
            }
        }
        getItem(key, defaultValue) {
            const res = this.a[key];
            if ((0, types_1.$sf)(res)) {
                return defaultValue;
            }
            return res;
        }
        setItem(key, data) {
            this.setItems([{ key, data }]);
        }
        setItems(items) {
            let save = false;
            for (const { key, data } of items) {
                // Shortcut for data that did not change
                if (this.a[key] === data) {
                    continue;
                }
                // Remove items when they are undefined or null
                if ((0, types_1.$sf)(data)) {
                    if (!(0, types_1.$qf)(this.a[key])) {
                        this.a[key] = undefined;
                        save = true;
                    }
                }
                // Otherwise add an item
                else {
                    this.a[key] = data;
                    save = true;
                }
            }
            if (save) {
                this.r();
            }
        }
        removeItem(key) {
            // Only update if the key is actually present (not undefined)
            if (!(0, types_1.$qf)(this.a[key])) {
                this.a[key] = undefined;
                this.r();
            }
        }
        async r() {
            if (this.g) {
                return; // already about to close
            }
            if (this.c) {
                return this.c.trigger(() => this.s());
            }
            return this.s();
        }
        async s() {
            if (!this.f) {
                return; // if we never initialized, we should not save our state
            }
            // Make sure to wait for init to finish first
            await this.f;
            // Return early if the database has not changed
            const serializedDatabase = JSON.stringify(this.a, null, 4);
            if (serializedDatabase === this.b) {
                return;
            }
            // Write to disk
            try {
                await this.m.writeFile(this.h, buffer_1.$Fd.fromString(serializedDatabase), { atomic: { postfix: '.vsctmp' } });
                this.b = serializedDatabase;
            }
            catch (error) {
                this.j.error(error);
            }
        }
        async close() {
            if (!this.g) {
                this.g = this.c
                    ? this.c.trigger(() => this.s(), 0 /* as soon as possible */)
                    : this.s();
            }
            return this.g;
        }
    }
    exports.$fN = $fN;
    let $gN = class $gN extends lifecycle_1.$kc {
        constructor(saveStrategy, environmentService, logService, fileService) {
            super();
            this.a = this.B(new $fN(environmentService.stateResource, saveStrategy, logService, fileService));
        }
        async init() {
            await this.a.init();
        }
        getItem(key, defaultValue) {
            return this.a.getItem(key, defaultValue);
        }
    };
    exports.$gN = $gN;
    exports.$gN = $gN = __decorate([
        __param(1, environment_1.$Ih),
        __param(2, log_1.$5i),
        __param(3, files_1.$6j)
    ], $gN);
    class $hN extends $gN {
        setItem(key, data) {
            this.a.setItem(key, data);
        }
        setItems(items) {
            this.a.setItems(items);
        }
        removeItem(key) {
            this.a.removeItem(key);
        }
        close() {
            return this.a.close();
        }
    }
    exports.$hN = $hN;
});
//# sourceMappingURL=stateService.js.map