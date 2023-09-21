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
    var WorkerBasedDocumentDiffProvider_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkerBasedDocumentDiffProvider = void 0;
    let WorkerBasedDocumentDiffProvider = class WorkerBasedDocumentDiffProvider {
        static { WorkerBasedDocumentDiffProvider_1 = this; }
        static { this.diffCache = new Map(); }
        constructor(options, editorWorkerService, telemetryService) {
            this.editorWorkerService = editorWorkerService;
            this.telemetryService = telemetryService;
            this.onDidChangeEventEmitter = new event_1.Emitter();
            this.onDidChange = this.onDidChangeEventEmitter.event;
            this.diffAlgorithm = 'advanced';
            this.diffAlgorithmOnDidChangeSubscription = undefined;
            this.setOptions(options);
        }
        dispose() {
            this.diffAlgorithmOnDidChangeSubscription?.dispose();
        }
        async computeDiff(original, modified, options, cancellationToken) {
            if (typeof this.diffAlgorithm !== 'string') {
                return this.diffAlgorithm.computeDiff(original, modified, options, cancellationToken);
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
                        new rangeMapping_1.DetailedLineRangeMapping(new lineRange_1.LineRange(1, 2), new lineRange_1.LineRange(1, modified.getLineCount() + 1), [
                            new rangeMapping_1.RangeMapping(original.getFullModelRange(), modified.getFullModelRange())
                        ])
                    ],
                    identical: false,
                    quitEarly: false,
                    moves: [],
                };
            }
            const uriKey = JSON.stringify([original.uri.toString(), modified.uri.toString()]);
            const context = JSON.stringify([original.id, modified.id, original.getAlternativeVersionId(), modified.getAlternativeVersionId(), JSON.stringify(options)]);
            const c = WorkerBasedDocumentDiffProvider_1.diffCache.get(uriKey);
            if (c && c.context === context) {
                return c.result;
            }
            const sw = stopwatch_1.StopWatch.create();
            const result = await this.editorWorkerService.computeDiff(original.uri, modified.uri, options, this.diffAlgorithm);
            const timeMs = sw.elapsed();
            this.telemetryService.publicLog2('diffEditor.computeDiff', {
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
            if (WorkerBasedDocumentDiffProvider_1.diffCache.size > 10) {
                WorkerBasedDocumentDiffProvider_1.diffCache.delete(WorkerBasedDocumentDiffProvider_1.diffCache.keys().next().value);
            }
            WorkerBasedDocumentDiffProvider_1.diffCache.set(uriKey, { result, context });
            return result;
        }
        setOptions(newOptions) {
            let didChange = false;
            if (newOptions.diffAlgorithm) {
                if (this.diffAlgorithm !== newOptions.diffAlgorithm) {
                    this.diffAlgorithmOnDidChangeSubscription?.dispose();
                    this.diffAlgorithmOnDidChangeSubscription = undefined;
                    this.diffAlgorithm = newOptions.diffAlgorithm;
                    if (typeof newOptions.diffAlgorithm !== 'string') {
                        this.diffAlgorithmOnDidChangeSubscription = newOptions.diffAlgorithm.onDidChange(() => this.onDidChangeEventEmitter.fire());
                    }
                    didChange = true;
                }
            }
            if (didChange) {
                this.onDidChangeEventEmitter.fire();
            }
        }
    };
    exports.WorkerBasedDocumentDiffProvider = WorkerBasedDocumentDiffProvider;
    exports.WorkerBasedDocumentDiffProvider = WorkerBasedDocumentDiffProvider = WorkerBasedDocumentDiffProvider_1 = __decorate([
        __param(1, editorWorker_1.IEditorWorkerService),
        __param(2, telemetry_1.ITelemetryService)
    ], WorkerBasedDocumentDiffProvider);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2VyQmFzZWREb2N1bWVudERpZmZQcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9icm93c2VyL3dpZGdldC9kaWZmRWRpdG9yL3dvcmtlckJhc2VkRG9jdW1lbnREaWZmUHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQWF6RixJQUFNLCtCQUErQixHQUFyQyxNQUFNLCtCQUErQjs7aUJBT25CLGNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBc0QsQUFBaEUsQ0FBaUU7UUFFbEcsWUFDQyxPQUFnRCxFQUMxQixtQkFBMEQsRUFDN0QsZ0JBQW9EO1lBRGhDLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBc0I7WUFDNUMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQVhoRSw0QkFBdUIsR0FBRyxJQUFJLGVBQU8sRUFBUSxDQUFDO1lBQ3RDLGdCQUFXLEdBQWdCLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxLQUFLLENBQUM7WUFFdEUsa0JBQWEsR0FBOEMsVUFBVSxDQUFDO1lBQ3RFLHlDQUFvQyxHQUE0QixTQUFTLENBQUM7WUFTakYsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMxQixDQUFDO1FBRU0sT0FBTztZQUNiLElBQUksQ0FBQyxvQ0FBb0MsRUFBRSxPQUFPLEVBQUUsQ0FBQztRQUN0RCxDQUFDO1FBRUQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxRQUFvQixFQUFFLFFBQW9CLEVBQUUsT0FBcUMsRUFBRSxpQkFBb0M7WUFDeEksSUFBSSxPQUFPLElBQUksQ0FBQyxhQUFhLEtBQUssUUFBUSxFQUFFO2dCQUMzQyxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLGlCQUFpQixDQUFDLENBQUM7YUFDdEY7WUFFRCx3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