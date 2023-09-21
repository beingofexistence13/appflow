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
define(["require", "exports", "vs/base/common/async", "vs/base/common/event", "vs/base/common/iterator", "vs/base/common/types", "vs/platform/files/common/files", "vs/platform/log/common/log", "vs/platform/policy/common/policy"], function (require, exports, async_1, event_1, iterator_1, types_1, files_1, log_1, policy_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$m7b = void 0;
    function keysDiff(a, b) {
        const result = [];
        for (const key of new Set(iterator_1.Iterable.concat(a.keys(), b.keys()))) {
            if (a.get(key) !== b.get(key)) {
                result.push(key);
            }
        }
        return result;
    }
    let $m7b = class $m7b extends policy_1.$$m {
        constructor(m, n, s) {
            super();
            this.m = m;
            this.n = n;
            this.s = s;
            this.c = this.B(new async_1.$Eg(500));
            const onDidChangePolicyFile = event_1.Event.filter(n.onDidFilesChange, e => e.affects(m));
            this.B(n.watch(m));
            this.B(onDidChangePolicyFile(() => this.c.trigger(() => this.w())));
        }
        async j() {
            await this.w();
        }
        async u() {
            const policies = new Map();
            try {
                const content = await this.n.readFile(this.m);
                const raw = JSON.parse(content.value.toString());
                if (!(0, types_1.$lf)(raw)) {
                    throw new Error('Policy file isn\'t a JSON object');
                }
                for (const key of Object.keys(raw)) {
                    if (this.f[key]) {
                        policies.set(key, raw[key]);
                    }
                }
            }
            catch (error) {
                if (error.fileOperationResult !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                    this.s.error(`[FilePolicyService] Failed to read policies`, error);
                }
            }
            return policies;
        }
        async w() {
            const policies = await this.u();
            const diff = keysDiff(this.g, policies);
            this.g = policies;
            if (diff.length > 0) {
                this.h.fire(diff);
            }
        }
    };
    exports.$m7b = $m7b;
    exports.$m7b = $m7b = __decorate([
        __param(1, files_1.$6j),
        __param(2, log_1.$5i)
    ], $m7b);
});
//# sourceMappingURL=filePolicyService.js.map