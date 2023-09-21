/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/cancellation", "vs/editor/browser/editorExtensions", "vs/editor/common/core/range", "vs/editor/common/editorContextKeys", "vs/editor/common/model", "vs/editor/common/services/editorWorker", "vs/editor/common/services/resolverService", "vs/editor/contrib/format/browser/format", "vs/nls", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/progress/common/progress", "vs/workbench/contrib/scm/browser/dirtydiffDecorator", "vs/workbench/contrib/scm/common/quickDiff"], function (require, exports, arrays_1, cancellation_1, editorExtensions_1, range_1, editorContextKeys_1, model_1, editorWorker_1, resolverService_1, format_1, nls, contextkey_1, instantiation_1, progress_1, dirtydiffDecorator_1, quickDiff_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getModifiedRanges = void 0;
    (0, editorExtensions_1.registerEditorAction)(class FormatModifiedAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.formatChanges',
                label: nls.localize('formatChanges', "Format Modified Lines"),
                alias: 'Format Modified Lines',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.writable, editorContextKeys_1.EditorContextKeys.hasDocumentSelectionFormattingProvider),
            });
        }
        async run(accessor, editor) {
            const instaService = accessor.get(instantiation_1.IInstantiationService);
            if (!editor.hasModel()) {
                return;
            }
            const ranges = await instaService.invokeFunction(getModifiedRanges, editor.getModel());
            if ((0, arrays_1.isNonEmptyArray)(ranges)) {
                return instaService.invokeFunction(format_1.formatDocumentRangesWithSelectedProvider, editor, ranges, 1 /* FormattingMode.Explicit */, progress_1.Progress.None, cancellation_1.CancellationToken.None);
            }
        }
    });
    async function getModifiedRanges(accessor, modified) {
        const quickDiffService = accessor.get(quickDiff_1.IQuickDiffService);
        const workerService = accessor.get(editorWorker_1.IEditorWorkerService);
        const modelService = accessor.get(resolverService_1.ITextModelService);
        const original = await (0, dirtydiffDecorator_1.getOriginalResource)(quickDiffService, modified.uri, modified.getLanguageId(), (0, model_1.shouldSynchronizeModel)(modified));
        if (!original) {
            return null; // let undefined signify no changes, null represents no source control (there's probably a better way, but I can't think of one rn)
        }
        const ranges = [];
        const ref = await modelService.createModelReference(original);
        try {
            if (!workerService.canComputeDirtyDiff(original, modified.uri)) {
                return undefined;
            }
            const changes = await workerService.computeDirtyDiff(original, modified.uri, false);
            if (!(0, arrays_1.isNonEmptyArray)(changes)) {
                return undefined;
            }
            for (const change of changes) {
                ranges.push(modified.validateRange(new range_1.Range(change.modifiedStartLineNumber, 1, change.modifiedEndLineNumber || change.modifiedStartLineNumber /*endLineNumber is 0 when things got deleted*/, Number.MAX_SAFE_INTEGER)));
            }
        }
        finally {
            ref.dispose();
        }
        return ranges;
    }
    exports.getModifiedRanges = getModifiedRanges;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0TW9kaWZpZWQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9mb3JtYXQvYnJvd3Nlci9mb3JtYXRNb2RpZmllZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFtQmhHLElBQUEsdUNBQW9CLEVBQUMsTUFBTSxvQkFBcUIsU0FBUSwrQkFBWTtRQUVuRTtZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsNkJBQTZCO2dCQUNqQyxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxlQUFlLEVBQUUsdUJBQXVCLENBQUM7Z0JBQzdELEtBQUssRUFBRSx1QkFBdUI7Z0JBQzlCLFlBQVksRUFBRSwyQkFBYyxDQUFDLEdBQUcsQ0FBQyxxQ0FBaUIsQ0FBQyxRQUFRLEVBQUUscUNBQWlCLENBQUMsc0NBQXNDLENBQUM7YUFDdEgsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBMEIsRUFBRSxNQUFtQjtZQUN4RCxNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHFDQUFxQixDQUFDLENBQUM7WUFFekQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFBRTtnQkFDdkIsT0FBTzthQUNQO1lBRUQsTUFBTSxNQUFNLEdBQUcsTUFBTSxZQUFZLENBQUMsY0FBYyxDQUFDLGlCQUFpQixFQUFFLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZGLElBQUksSUFBQSx3QkFBZSxFQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUM1QixPQUFPLFlBQVksQ0FBQyxjQUFjLENBQ2pDLGlEQUF3QyxFQUFFLE1BQU0sRUFBRSxNQUFNLG1DQUMvQixtQkFBUSxDQUFDLElBQUksRUFBRSxnQ0FBaUIsQ0FBQyxJQUFJLENBQzlELENBQUM7YUFDRjtRQUNGLENBQUM7S0FDRCxDQUFDLENBQUM7SUFHSSxLQUFLLFVBQVUsaUJBQWlCLENBQUMsUUFBMEIsRUFBRSxRQUFvQjtRQUN2RixNQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsNkJBQWlCLENBQUMsQ0FBQztRQUN6RCxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLG1DQUFvQixDQUFDLENBQUM7UUFDekQsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxtQ0FBaUIsQ0FBQyxDQUFDO1FBRXJELE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBQSx3Q0FBbUIsRUFBQyxnQkFBZ0IsRUFBRSxRQUFRLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxhQUFhLEVBQUUsRUFBRSxJQUFBLDhCQUFzQixFQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDdkksSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNkLE9BQU8sSUFBSSxDQUFDLENBQUMsbUlBQW1JO1NBQ2hKO1FBRUQsTUFBTSxNQUFNLEdBQVksRUFBRSxDQUFDO1FBQzNCLE1BQU0sR0FBRyxHQUFHLE1BQU0sWUFBWSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzlELElBQUk7WUFDSCxJQUFJLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQy9ELE9BQU8sU0FBUyxDQUFDO2FBQ2pCO1lBQ0QsTUFBTSxPQUFPLEdBQUcsTUFBTSxhQUFhLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDcEYsSUFBSSxDQUFDLElBQUEsd0JBQWUsRUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDOUIsT0FBTyxTQUFTLENBQUM7YUFDakI7WUFDRCxLQUFLLE1BQU0sTUFBTSxJQUFJLE9BQU8sRUFBRTtnQkFDN0IsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksYUFBSyxDQUMzQyxNQUFNLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxFQUNqQyxNQUFNLENBQUMscUJBQXFCLElBQUksTUFBTSxDQUFDLHVCQUF1QixDQUFDLDhDQUE4QyxFQUFFLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUN2SSxDQUFDLENBQUM7YUFDSDtTQUNEO2dCQUFTO1lBQ1QsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDO1NBQ2Q7UUFFRCxPQUFPLE1BQU0sQ0FBQztJQUNmLENBQUM7SUEvQkQsOENBK0JDIn0=