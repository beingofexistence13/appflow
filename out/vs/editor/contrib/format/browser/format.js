/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/aria/aria", "vs/base/common/arrays", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/iterator", "vs/base/common/linkedList", "vs/base/common/types", "vs/base/common/uri", "vs/editor/contrib/editorState/browser/editorState", "vs/editor/browser/editorBrowser", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/services/editorWorker", "vs/editor/common/services/resolverService", "vs/editor/contrib/format/browser/formattingEdit", "vs/nls", "vs/platform/commands/common/commands", "vs/platform/extensions/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/editor/common/services/languageFeatures", "vs/platform/log/common/log"], function (require, exports, aria_1, arrays_1, cancellation_1, errors_1, iterator_1, linkedList_1, types_1, uri_1, editorState_1, editorBrowser_1, position_1, range_1, selection_1, editorWorker_1, resolverService_1, formattingEdit_1, nls, commands_1, extensions_1, instantiation_1, languageFeatures_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getOnTypeFormattingEdits = exports.getDocumentFormattingEditsUntilResult = exports.getDocumentRangeFormattingEditsUntilResult = exports.formatDocumentWithProvider = exports.formatDocumentWithSelectedProvider = exports.formatDocumentRangesWithProvider = exports.formatDocumentRangesWithSelectedProvider = exports.FormattingConflicts = exports.FormattingMode = exports.getRealAndSyntheticDocumentFormattersOrdered = exports.alertFormattingEdits = void 0;
    function alertFormattingEdits(edits) {
        edits = edits.filter(edit => edit.range);
        if (!edits.length) {
            return;
        }
        let { range } = edits[0];
        for (let i = 1; i < edits.length; i++) {
            range = range_1.Range.plusRange(range, edits[i].range);
        }
        const { startLineNumber, endLineNumber } = range;
        if (startLineNumber === endLineNumber) {
            if (edits.length === 1) {
                (0, aria_1.alert)(nls.localize('hint11', "Made 1 formatting edit on line {0}", startLineNumber));
            }
            else {
                (0, aria_1.alert)(nls.localize('hintn1', "Made {0} formatting edits on line {1}", edits.length, startLineNumber));
            }
        }
        else {
            if (edits.length === 1) {
                (0, aria_1.alert)(nls.localize('hint1n', "Made 1 formatting edit between lines {0} and {1}", startLineNumber, endLineNumber));
            }
            else {
                (0, aria_1.alert)(nls.localize('hintnn', "Made {0} formatting edits between lines {1} and {2}", edits.length, startLineNumber, endLineNumber));
            }
        }
    }
    exports.alertFormattingEdits = alertFormattingEdits;
    function getRealAndSyntheticDocumentFormattersOrdered(documentFormattingEditProvider, documentRangeFormattingEditProvider, model) {
        const result = [];
        const seen = new extensions_1.ExtensionIdentifierSet();
        // (1) add all document formatter
        const docFormatter = documentFormattingEditProvider.ordered(model);
        for (const formatter of docFormatter) {
            result.push(formatter);
            if (formatter.extensionId) {
                seen.add(formatter.extensionId);
            }
        }
        // (2) add all range formatter as document formatter (unless the same extension already did that)
        const rangeFormatter = documentRangeFormattingEditProvider.ordered(model);
        for (const formatter of rangeFormatter) {
            if (formatter.extensionId) {
                if (seen.has(formatter.extensionId)) {
                    continue;
                }
                seen.add(formatter.extensionId);
            }
            result.push({
                displayName: formatter.displayName,
                extensionId: formatter.extensionId,
                provideDocumentFormattingEdits(model, options, token) {
                    return formatter.provideDocumentRangeFormattingEdits(model, model.getFullModelRange(), options, token);
                }
            });
        }
        return result;
    }
    exports.getRealAndSyntheticDocumentFormattersOrdered = getRealAndSyntheticDocumentFormattersOrdered;
    var FormattingMode;
    (function (FormattingMode) {
        FormattingMode[FormattingMode["Explicit"] = 1] = "Explicit";
        FormattingMode[FormattingMode["Silent"] = 2] = "Silent";
    })(FormattingMode || (exports.FormattingMode = FormattingMode = {}));
    class FormattingConflicts {
        static { this._selectors = new linkedList_1.LinkedList(); }
        static setFormatterSelector(selector) {
            const remove = FormattingConflicts._selectors.unshift(selector);
            return { dispose: remove };
        }
        static async select(formatter, document, mode) {
            if (formatter.length === 0) {
                return undefined;
            }
            const selector = iterator_1.Iterable.first(FormattingConflicts._selectors);
            if (selector) {
                return await selector(formatter, document, mode);
            }
            return undefined;
        }
    }
    exports.FormattingConflicts = FormattingConflicts;
    async function formatDocumentRangesWithSelectedProvider(accessor, editorOrModel, rangeOrRanges, mode, progress, token) {
        const instaService = accessor.get(instantiation_1.IInstantiationService);
        const { documentRangeFormattingEditProvider: documentRangeFormattingEditProviderRegistry } = accessor.get(languageFeatures_1.ILanguageFeaturesService);
        const model = (0, editorBrowser_1.isCodeEditor)(editorOrModel) ? editorOrModel.getModel() : editorOrModel;
        const provider = documentRangeFormattingEditProviderRegistry.ordered(model);
        const selected = await FormattingConflicts.select(provider, model, mode);
        if (selected) {
            progress.report(selected);
            await instaService.invokeFunction(formatDocumentRangesWithProvider, selected, editorOrModel, rangeOrRanges, token);
        }
    }
    exports.formatDocumentRangesWithSelectedProvider = formatDocumentRangesWithSelectedProvider;
    async function formatDocumentRangesWithProvider(accessor, provider, editorOrModel, rangeOrRanges, token) {
        const workerService = accessor.get(editorWorker_1.IEditorWorkerService);
        const logService = accessor.get(log_1.ILogService);
        let model;
        let cts;
        if ((0, editorBrowser_1.isCodeEditor)(editorOrModel)) {
            model = editorOrModel.getModel();
            cts = new editorState_1.EditorStateCancellationTokenSource(editorOrModel, 1 /* CodeEditorStateFlag.Value */ | 4 /* CodeEditorStateFlag.Position */, undefined, token);
        }
        else {
            model = editorOrModel;
            cts = new editorState_1.TextModelCancellationTokenSource(editorOrModel, token);
        }
        // make sure that ranges don't overlap nor touch each other
        const ranges = [];
        let len = 0;
        for (const range of (0, arrays_1.asArray)(rangeOrRanges).sort(range_1.Range.compareRangesUsingStarts)) {
            if (len > 0 && range_1.Range.areIntersectingOrTouching(ranges[len - 1], range)) {
                ranges[len - 1] = range_1.Range.fromPositions(ranges[len - 1].getStartPosition(), range.getEndPosition());
            }
            else {
                len = ranges.push(range);
            }
        }
        const computeEdits = async (range) => {
            logService.trace(`[format][provideDocumentRangeFormattingEdits] (request)`, provider.extensionId?.value, range);
            const result = (await provider.provideDocumentRangeFormattingEdits(model, range, model.getFormattingOptions(), cts.token)) || [];
            logService.trace(`[format][provideDocumentRangeFormattingEdits] (response)`, provider.extensionId?.value, result);
            return result;
        };
        const hasIntersectingEdit = (a, b) => {
            if (!a.length || !b.length) {
                return false;
            }
            // quick exit if the list of ranges are completely unrelated [O(n)]
            const mergedA = a.reduce((acc, val) => { return range_1.Range.plusRange(acc, val.range); }, a[0].range);
            if (!b.some(x => { return range_1.Range.intersectRanges(mergedA, x.range); })) {
                return false;
            }
            // fallback to a complete check [O(n^2)]
            for (const edit of a) {
                for (const otherEdit of b) {
                    if (range_1.Range.intersectRanges(edit.range, otherEdit.range)) {
                        return true;
                    }
                }
            }
            return false;
        };
        const allEdits = [];
        const rawEditsList = [];
        try {
            if (typeof provider.provideDocumentRangesFormattingEdits === 'function') {
                logService.trace(`[format][provideDocumentRangeFormattingEdits] (request)`, provider.extensionId?.value, ranges);
                const result = (await provider.provideDocumentRangesFormattingEdits(model, ranges, model.getFormattingOptions(), cts.token)) || [];
                logService.trace(`[format][provideDocumentRangeFormattingEdits] (response)`, provider.extensionId?.value, result);
                rawEditsList.push(result);
            }
            else {
                for (const range of ranges) {
                    if (cts.token.isCancellationRequested) {
                        return true;
                    }
                    rawEditsList.push(await computeEdits(range));
                }
                for (let i = 0; i < ranges.length; ++i) {
                    for (let j = i + 1; j < ranges.length; ++j) {
                        if (cts.token.isCancellationRequested) {
                            return true;
                        }
                        if (hasIntersectingEdit(rawEditsList[i], rawEditsList[j])) {
                            // Merge ranges i and j into a single range, recompute the associated edits
                            const mergedRange = range_1.Range.plusRange(ranges[i], ranges[j]);
                            const edits = await computeEdits(mergedRange);
                            ranges.splice(j, 1);
                            ranges.splice(i, 1);
                            ranges.push(mergedRange);
                            rawEditsList.splice(j, 1);
                            rawEditsList.splice(i, 1);
                            rawEditsList.push(edits);
                            // Restart scanning
                            i = 0;
                            j = 0;
                        }
                    }
                }
            }
            for (const rawEdits of rawEditsList) {
                if (cts.token.isCancellationRequested) {
                    return true;
                }
                const minimalEdits = await workerService.computeMoreMinimalEdits(model.uri, rawEdits);
                if (minimalEdits) {
                    allEdits.push(...minimalEdits);
                }
            }
        }
        finally {
            cts.dispose();
        }
        if (allEdits.length === 0) {
            return false;
        }
        if ((0, editorBrowser_1.isCodeEditor)(editorOrModel)) {
            // use editor to apply edits
            formattingEdit_1.FormattingEdit.execute(editorOrModel, allEdits, true);
            alertFormattingEdits(allEdits);
            editorOrModel.revealPositionInCenterIfOutsideViewport(editorOrModel.getPosition(), 1 /* ScrollType.Immediate */);
        }
        else {
            // use model to apply edits
            const [{ range }] = allEdits;
            const initialSelection = new selection_1.Selection(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn);
            model.pushEditOperations([initialSelection], allEdits.map(edit => {
                return {
                    text: edit.text,
                    range: range_1.Range.lift(edit.range),
                    forceMoveMarkers: true
                };
            }), undoEdits => {
                for (const { range } of undoEdits) {
                    if (range_1.Range.areIntersectingOrTouching(range, initialSelection)) {
                        return [new selection_1.Selection(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn)];
                    }
                }
                return null;
            });
        }
        return true;
    }
    exports.formatDocumentRangesWithProvider = formatDocumentRangesWithProvider;
    async function formatDocumentWithSelectedProvider(accessor, editorOrModel, mode, progress, token) {
        const instaService = accessor.get(instantiation_1.IInstantiationService);
        const languageFeaturesService = accessor.get(languageFeatures_1.ILanguageFeaturesService);
        const model = (0, editorBrowser_1.isCodeEditor)(editorOrModel) ? editorOrModel.getModel() : editorOrModel;
        const provider = getRealAndSyntheticDocumentFormattersOrdered(languageFeaturesService.documentFormattingEditProvider, languageFeaturesService.documentRangeFormattingEditProvider, model);
        const selected = await FormattingConflicts.select(provider, model, mode);
        if (selected) {
            progress.report(selected);
            await instaService.invokeFunction(formatDocumentWithProvider, selected, editorOrModel, mode, token);
        }
    }
    exports.formatDocumentWithSelectedProvider = formatDocumentWithSelectedProvider;
    async function formatDocumentWithProvider(accessor, provider, editorOrModel, mode, token) {
        const workerService = accessor.get(editorWorker_1.IEditorWorkerService);
        let model;
        let cts;
        if ((0, editorBrowser_1.isCodeEditor)(editorOrModel)) {
            model = editorOrModel.getModel();
            cts = new editorState_1.EditorStateCancellationTokenSource(editorOrModel, 1 /* CodeEditorStateFlag.Value */ | 4 /* CodeEditorStateFlag.Position */, undefined, token);
        }
        else {
            model = editorOrModel;
            cts = new editorState_1.TextModelCancellationTokenSource(editorOrModel, token);
        }
        let edits;
        try {
            const rawEdits = await provider.provideDocumentFormattingEdits(model, model.getFormattingOptions(), cts.token);
            edits = await workerService.computeMoreMinimalEdits(model.uri, rawEdits);
            if (cts.token.isCancellationRequested) {
                return true;
            }
        }
        finally {
            cts.dispose();
        }
        if (!edits || edits.length === 0) {
            return false;
        }
        if ((0, editorBrowser_1.isCodeEditor)(editorOrModel)) {
            // use editor to apply edits
            formattingEdit_1.FormattingEdit.execute(editorOrModel, edits, mode !== 2 /* FormattingMode.Silent */);
            if (mode !== 2 /* FormattingMode.Silent */) {
                alertFormattingEdits(edits);
                editorOrModel.revealPositionInCenterIfOutsideViewport(editorOrModel.getPosition(), 1 /* ScrollType.Immediate */);
            }
        }
        else {
            // use model to apply edits
            const [{ range }] = edits;
            const initialSelection = new selection_1.Selection(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn);
            model.pushEditOperations([initialSelection], edits.map(edit => {
                return {
                    text: edit.text,
                    range: range_1.Range.lift(edit.range),
                    forceMoveMarkers: true
                };
            }), undoEdits => {
                for (const { range } of undoEdits) {
                    if (range_1.Range.areIntersectingOrTouching(range, initialSelection)) {
                        return [new selection_1.Selection(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn)];
                    }
                }
                return null;
            });
        }
        return true;
    }
    exports.formatDocumentWithProvider = formatDocumentWithProvider;
    async function getDocumentRangeFormattingEditsUntilResult(workerService, languageFeaturesService, model, range, options, token) {
        const providers = languageFeaturesService.documentRangeFormattingEditProvider.ordered(model);
        for (const provider of providers) {
            const rawEdits = await Promise.resolve(provider.provideDocumentRangeFormattingEdits(model, range, options, token)).catch(errors_1.onUnexpectedExternalError);
            if ((0, arrays_1.isNonEmptyArray)(rawEdits)) {
                return await workerService.computeMoreMinimalEdits(model.uri, rawEdits);
            }
        }
        return undefined;
    }
    exports.getDocumentRangeFormattingEditsUntilResult = getDocumentRangeFormattingEditsUntilResult;
    async function getDocumentFormattingEditsUntilResult(workerService, languageFeaturesService, model, options, token) {
        const providers = getRealAndSyntheticDocumentFormattersOrdered(languageFeaturesService.documentFormattingEditProvider, languageFeaturesService.documentRangeFormattingEditProvider, model);
        for (const provider of providers) {
            const rawEdits = await Promise.resolve(provider.provideDocumentFormattingEdits(model, options, token)).catch(errors_1.onUnexpectedExternalError);
            if ((0, arrays_1.isNonEmptyArray)(rawEdits)) {
                return await workerService.computeMoreMinimalEdits(model.uri, rawEdits);
            }
        }
        return undefined;
    }
    exports.getDocumentFormattingEditsUntilResult = getDocumentFormattingEditsUntilResult;
    function getOnTypeFormattingEdits(workerService, languageFeaturesService, model, position, ch, options, token) {
        const providers = languageFeaturesService.onTypeFormattingEditProvider.ordered(model);
        if (providers.length === 0) {
            return Promise.resolve(undefined);
        }
        if (providers[0].autoFormatTriggerCharacters.indexOf(ch) < 0) {
            return Promise.resolve(undefined);
        }
        return Promise.resolve(providers[0].provideOnTypeFormattingEdits(model, position, ch, options, token)).catch(errors_1.onUnexpectedExternalError).then(edits => {
            return workerService.computeMoreMinimalEdits(model.uri, edits);
        });
    }
    exports.getOnTypeFormattingEdits = getOnTypeFormattingEdits;
    commands_1.CommandsRegistry.registerCommand('_executeFormatRangeProvider', async function (accessor, ...args) {
        const [resource, range, options] = args;
        (0, types_1.assertType)(uri_1.URI.isUri(resource));
        (0, types_1.assertType)(range_1.Range.isIRange(range));
        const resolverService = accessor.get(resolverService_1.ITextModelService);
        const workerService = accessor.get(editorWorker_1.IEditorWorkerService);
        const languageFeaturesService = accessor.get(languageFeatures_1.ILanguageFeaturesService);
        const reference = await resolverService.createModelReference(resource);
        try {
            return getDocumentRangeFormattingEditsUntilResult(workerService, languageFeaturesService, reference.object.textEditorModel, range_1.Range.lift(range), options, cancellation_1.CancellationToken.None);
        }
        finally {
            reference.dispose();
        }
    });
    commands_1.CommandsRegistry.registerCommand('_executeFormatDocumentProvider', async function (accessor, ...args) {
        const [resource, options] = args;
        (0, types_1.assertType)(uri_1.URI.isUri(resource));
        const resolverService = accessor.get(resolverService_1.ITextModelService);
        const workerService = accessor.get(editorWorker_1.IEditorWorkerService);
        const languageFeaturesService = accessor.get(languageFeatures_1.ILanguageFeaturesService);
        const reference = await resolverService.createModelReference(resource);
        try {
            return getDocumentFormattingEditsUntilResult(workerService, languageFeaturesService, reference.object.textEditorModel, options, cancellation_1.CancellationToken.None);
        }
        finally {
            reference.dispose();
        }
    });
    commands_1.CommandsRegistry.registerCommand('_executeFormatOnTypeProvider', async function (accessor, ...args) {
        const [resource, position, ch, options] = args;
        (0, types_1.assertType)(uri_1.URI.isUri(resource));
        (0, types_1.assertType)(position_1.Position.isIPosition(position));
        (0, types_1.assertType)(typeof ch === 'string');
        const resolverService = accessor.get(resolverService_1.ITextModelService);
        const workerService = accessor.get(editorWorker_1.IEditorWorkerService);
        const languageFeaturesService = accessor.get(languageFeatures_1.ILanguageFeaturesService);
        const reference = await resolverService.createModelReference(resource);
        try {
            return getOnTypeFormattingEdits(workerService, languageFeaturesService, reference.object.textEditorModel, position_1.Position.lift(position), ch, options, cancellation_1.CancellationToken.None);
        }
        finally {
            reference.dispose();
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvZm9ybWF0L2Jyb3dzZXIvZm9ybWF0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWlDaEcsU0FBZ0Isb0JBQW9CLENBQUMsS0FBNkI7UUFFakUsS0FBSyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDekMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDbEIsT0FBTztTQUNQO1FBRUQsSUFBSSxFQUFFLEtBQUssRUFBRSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN0QyxLQUFLLEdBQUcsYUFBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQy9DO1FBQ0QsTUFBTSxFQUFFLGVBQWUsRUFBRSxhQUFhLEVBQUUsR0FBRyxLQUFLLENBQUM7UUFDakQsSUFBSSxlQUFlLEtBQUssYUFBYSxFQUFFO1lBQ3RDLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ3ZCLElBQUEsWUFBSyxFQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLG9DQUFvQyxFQUFFLGVBQWUsQ0FBQyxDQUFDLENBQUM7YUFDckY7aUJBQU07Z0JBQ04sSUFBQSxZQUFLLEVBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsdUNBQXVDLEVBQUUsS0FBSyxDQUFDLE1BQU0sRUFBRSxlQUFlLENBQUMsQ0FBQyxDQUFDO2FBQ3RHO1NBQ0Q7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