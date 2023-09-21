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
define(["require", "exports", "vs/base/common/event", "vs/base/common/stopwatch", "vs/editor/common/core/lineRange", "vs/editor/common/diff/rangeMapping", "vs/editor/common/services/editorWorker", "vs/platform/telemetry/common/telemetry"], function (require, exports, event_1, stopwatch_1, lineRange_1, rangeMapping_1, editorWorker_1, telemetry_1) {
    "use strict";
    var $5Y_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$5Y = void 0;
    let $5Y = class $5Y {
        static { $5Y_1 = this; }
        static { this.e = new Map(); }
        constructor(options, f, g) {
            this.f = f;
            this.g = g;
            this.a = new event_1.$fd();
            this.onDidChange = this.a.event;
            this.b = 'advanced';
            this.d = undefined;
            this.setOptions(options);
        }
        dispose() {
            this.d?.dispose();
        }
        async computeDiff(original, modified, options, cancellationToken) {
            if (typeof this.b !== 'string') {
                return this.b.computeDiff(original, modified, options, cancellationToken);
            }
            // This significantly speeds up the case when the original file is empty
            if (original.getLineCount() === 1 && original.getLineMaxColumn(1) === 1) {
                if (modified.getLineCount() === 1 && modified.getLineMaxColumn(1) === 1) {
                    return {
                        changes: [],
                        identical: true,
                        quitEarly: false,
                        moves: [],
                    };
                }
                return {
                    changes: [
                        new rangeMapping_1.$ws(new lineRange_1.$ts(1, 2), new lineRange_1.$ts(1, modified.getLineCount() + 1), [
                            new rangeMapping_1.$xs(original.getFullModelRange(), modified.getFullModelRange())
                        ])
                    ],
                    identical: false,
                    quitEarly: false,
                    moves: [],
                };
            }
            const uriKey = JSON.stringify([original.uri.toString(), modified.uri.toString()]);
            const context = JSON.stringify([original.id, modified.id, original.getAlternativeVersionId(), modified.getAlternativeVersionId(), JSON.stringify(options)]);
            const c = $5Y_1.e.get(uriKey);
            if (c && c.context === context) {
                return c.result;
            }
            const sw = stopwatch_1.$bd.create();
            const result = await this.f.computeDiff(original.uri, modified.uri, options, this.b);
            const timeMs = sw.elapsed();
            this.g.publicLog2('diffEditor.computeDiff', {
                timeMs,
                timedOut: result?.quitEarly ?? true,
                detectedMoves: options.computeMoves ? (result?.moves.length ?? 0) : -1,
            });
            if (cancellationToken.isCancellationRequested) {
                // Text models might be disposed!
                return {
                    changes: [],
                    identical: false,
                    quitEarly: true,
                    moves: [],
                };
            }
            if (!result) {
                throw new Error('no diff result available');
            }
            // max 10 items in cache
            if ($5Y_1.e.size > 10) {
                $5Y_1.e.delete($5Y_1.e.keys().next().value);
            }
            $5Y_1.e.set(uriKey, { result, context });
            return result;
        }
        setOptions(newOptions) {
            let didChange = false;
            if (newOptions.diffAlgorithm) {
                if (this.b !== newOptions.diffAlgorithm) {
                    this.d?.dispose();
                    this.d = undefined;
                    this.b = newOptions.diffAlgorithm;
                    if (typeof newOptions.diffAlgorithm !== 'string') {
                        this.d = newOptions.diffAlgorithm.onDidChange(() => this.a.fire());
                    }
                    didChange = true;
                }
            }
            if (didChange) {
                this.a.fire();
            }
        }
    };
    exports.$5Y = $5Y;
    exports.$5Y = $5Y = $5Y_1 = __decorate([
        __param(1, editorWorker_1.$4Y),
        __param(2, telemetry_1.$9k)
    ], $5Y);
});
//# sourceMappingURL=workerBasedDocumentDiffProvider.js.map