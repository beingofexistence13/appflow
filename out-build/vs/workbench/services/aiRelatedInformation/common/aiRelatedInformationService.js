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
define(["require", "exports", "vs/base/common/async", "vs/platform/instantiation/common/extensions", "vs/base/common/stopwatch", "vs/platform/log/common/log", "vs/workbench/services/aiRelatedInformation/common/aiRelatedInformation"], function (require, exports, async_1, extensions_1, stopwatch_1, log_1, aiRelatedInformation_1) {
    "use strict";
    var $Nyb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Nyb = void 0;
    let $Nyb = class $Nyb {
        static { $Nyb_1 = this; }
        static { this.DEFAULT_TIMEOUT = 1000 * 10; } // 10 seconds
        constructor(b) {
            this.b = b;
            this.a = new Map();
        }
        isEnabled() {
            return this.a.size > 0;
        }
        registerAiRelatedInformationProvider(type, provider) {
            const providers = this.a.get(type) ?? [];
            providers.push(provider);
            this.a.set(type, providers);
            return {
                dispose: () => {
                    const providers = this.a.get(type) ?? [];
                    const index = providers.indexOf(provider);
                    if (index !== -1) {
                        providers.splice(index, 1);
                    }
                    if (providers.length === 0) {
                        this.a.delete(type);
                    }
                }
            };
        }
        async getRelatedInformation(query, types, token) {
            if (this.a.size === 0) {
                throw new Error('No related information providers registered');
            }
            // get providers for each type
            const providers = [];
            for (const type of types) {
                const typeProviders = this.a.get(type);
                if (typeProviders) {
                    providers.push(...typeProviders);
                }
            }
            if (providers.length === 0) {
                throw new Error('No related information providers registered for the given types');
            }
            const stopwatch = stopwatch_1.$bd.create();
            const cancellablePromises = providers.map((provider) => {
                return (0, async_1.$ug)(async (t) => {
                    try {
                        const result = await provider.provideAiRelatedInformation(query, t);
                        // double filter just in case
                        return result.filter(r => types.includes(r.type));
                    }
                    catch (e) {
                        // logged in extension host
                    }
                    return [];
                });
            });
            try {
                const results = await (0, async_1.$yg)(Promise.allSettled(cancellablePromises), $Nyb_1.DEFAULT_TIMEOUT, () => {
                    cancellablePromises.forEach(p => p.cancel());
                    throw new Error('Related information provider timed out');
                });
                if (!results) {
                    return [];
                }
                const result = results
                    .filter(r => r.status === 'fulfilled')
                    .map(r => r.value)
                    .flat();
                return result;
            }
            finally {
                stopwatch.stop();
                this.b.trace(`[AiRelatedInformationService]: getRelatedInformation took ${stopwatch.elapsed()}ms`);
            }
        }
    };
    exports.$Nyb = $Nyb;
    exports.$Nyb = $Nyb = $Nyb_1 = __decorate([
        __param(0, log_1.$5i)
    ], $Nyb);
    (0, extensions_1.$mr)(aiRelatedInformation_1.$YJ, $Nyb, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=aiRelatedInformationService.js.map