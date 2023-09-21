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
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/base/common/async", "vs/platform/instantiation/common/extensions", "vs/base/common/stopwatch", "vs/platform/log/common/log"], function (require, exports, instantiation_1, async_1, extensions_1, stopwatch_1, log_1) {
    "use strict";
    var $otb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$otb = exports.$ntb = void 0;
    exports.$ntb = (0, instantiation_1.$Bh)('IAiEmbeddingVectorService');
    let $otb = class $otb {
        static { $otb_1 = this; }
        static { this.DEFAULT_TIMEOUT = 1000 * 10; } // 10 seconds
        constructor(b) {
            this.b = b;
            this.a = [];
        }
        isEnabled() {
            return this.a.length > 0;
        }
        registerAiEmbeddingVectorProvider(model, provider) {
            this.a.push(provider);
            return {
                dispose: () => {
                    const index = this.a.indexOf(provider);
                    if (index >= 0) {
                        this.a.splice(index, 1);
                    }
                }
            };
        }
        async getEmbeddingVector(strings, token) {
            if (this.a.length === 0) {
                throw new Error('No embedding vector providers registered');
            }
            const stopwatch = stopwatch_1.$bd.create();
            const cancellablePromises = [];
            const timer = (0, async_1.$Hg)($otb_1.DEFAULT_TIMEOUT);
            const disposable = token.onCancellationRequested(() => {
                disposable.dispose();
                timer.cancel();
            });
            for (const provider of this.a) {
                cancellablePromises.push((0, async_1.$ug)(async (t) => {
                    try {
                        return await provider.provideAiEmbeddingVector(Array.isArray(strings) ? strings : [strings], t);
                    }
                    catch (e) {
                        // logged in extension host
                    }
                    // Wait for the timer to finish to allow for another provider to resolve.
                    // Alternatively, if something resolved, or we've timed out, this will throw
                    // as expected.
                    await timer;
                    throw new Error('Embedding vector provider timed out');
                }));
            }
            cancellablePromises.push((0, async_1.$ug)(async (t) => {
                const disposable = t.onCancellationRequested(() => {
                    timer.cancel();
                    disposable.dispose();
                });
                await timer;
                throw new Error('Embedding vector provider timed out');
            }));
            try {
                const result = await (0, async_1.$xg)(cancellablePromises);
                // If we have a single result, return it directly, otherwise return an array.
                // This aligns with the API overloads.
                if (result.length === 1) {
                    return result[0];
                }
                return result;
            }
            finally {
                stopwatch.stop();
                this.b.trace(`[AiEmbeddingVectorService]: getEmbeddingVector took ${stopwatch.elapsed()}ms`);
            }
        }
    };
    exports.$otb = $otb;
    exports.$otb = $otb = $otb_1 = __decorate([
        __param(0, log_1.$5i)
    ], $otb);
    (0, extensions_1.$mr)(exports.$ntb, $otb, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=aiEmbeddingVectorService.js.map