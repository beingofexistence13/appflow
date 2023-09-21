/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/aria/aria", "vs/base/common/arrays", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/iterator", "vs/base/common/linkedList", "vs/base/common/types", "vs/base/common/uri", "vs/editor/contrib/editorState/browser/editorState", "vs/editor/browser/editorBrowser", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/services/editorWorker", "vs/editor/common/services/resolverService", "vs/editor/contrib/format/browser/formattingEdit", "vs/nls!vs/editor/contrib/format/browser/format", "vs/platform/commands/common/commands", "vs/platform/extensions/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/editor/common/services/languageFeatures", "vs/platform/log/common/log"], function (require, exports, aria_1, arrays_1, cancellation_1, errors_1, iterator_1, linkedList_1, types_1, uri_1, editorState_1, editorBrowser_1, position_1, range_1, selection_1, editorWorker_1, resolverService_1, formattingEdit_1, nls, commands_1, extensions_1, instantiation_1, languageFeatures_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$L8 = exports.$K8 = exports.$J8 = exports.$I8 = exports.$H8 = exports.$G8 = exports.$F8 = exports.$E8 = exports.FormattingMode = exports.$D8 = exports.$C8 = void 0;
    function $C8(edits) {
        edits = edits.filter(edit => edit.range);
        if (!edits.length) {
            return;
        }
        let { range } = edits[0];
        for (let i = 1; i < edits.length; i++) {
            range = range_1.$ks.plusRange(range, edits[i].range);
        }
        const { startLineNumber, endLineNumber } = range;
        if (startLineNumber === endLineNumber) {
            if (edits.length === 1) {
                (0, aria_1.$$P)(nls.localize(0, null, startLineNumber));
            }
            else {
                (0, aria_1.$$P)(nls.localize(1, null, edits.length, startLineNumber));
            }
        }
        else {
            if (edits.length === 1) {
                (0, aria_1.$$P)(nls.localize(2, null, startLineNumber, endLineNumber));
            }
            else {
                (0, aria_1.$$P)(nls.localize(3, null, edits.length, startLineNumber, endLineNumber));
            }
        }
    }
    exports.$C8 = $C8;
    function $D8(documentFormattingEditProvider, documentRangeFormattingEditProvider, model) {
        const result = [];
        const seen = new extensions_1.$Wl();
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
    exports.$D8 = $D8;
    var FormattingMode;
    (function (FormattingMode) {
        FormattingMode[FormattingMode["Explicit"] = 1] = "Explicit";
        FormattingMode[FormattingMode["Silent"] = 2] = "Silent";
    })(FormattingMode || (exports.FormattingMode = FormattingMode = {}));
    class $E8 {
        static { this.c = new linkedList_1.$tc(); }
        static setFormatterSelector(selector) {
            const remove = $E8.c.unshift(selector);
            return { dispose: remove };
        }
        static async select(formatter, document, mode) {
            if (formatter.length === 0) {
                return undefined;
            }
            const selector = iterator_1.Iterable.first($E8.c);
            if (selector) {
                return await selector(formatter, document, mode);
            }
            return undefined;
        }
    }
    exports.$E8 = $E8;
    async function $F8(accessor, editorOrModel, rangeOrRanges, mode, progress, token) {
        const instaService = accessor.get(instantiation_1.$Ah);
        const { documentRangeFormattingEditProvider: documentRangeFormattingEditProviderRegistry } = accessor.get(languageFeatures_1.$hF);
        const model = (0, editorBrowser_1.$iV)(editorOrModel) ? editorOrModel.getModel() : editorOrModel;
        const provider = documentRangeFormattingEditProviderRegistry.ordered(model);
        const selected = await $E8.select(provider, model, mode);
        if (selected) {
            progress.report(selected);
            await instaService.invokeFunction($G8, selected, editorOrModel, rangeOrRanges, token);
        }
    }
    exports.$F8 = $F8;
    async function $G8(accessor, provider, editorOrModel, rangeOrRanges, token) {
        const workerService = accessor.get(editorWorker_1.$4Y);
        const logService = accessor.get(log_1.$5i);
        let model;
        let cts;
        if ((0, editorBrowser_1.$iV)(editorOrModel)) {
            model = editorOrModel.getModel();
            cts = new editorState_1.$t1(editorOrModel, 1 /* CodeEditorStateFlag.Value */ | 4 /* CodeEditorStateFlag.Position */, undefined, token);
        }
        else {
            model = editorOrModel;
            cts = new editorState_1.$u1(editorOrModel, token);
        }
        // make sure that ranges don't overlap nor touch each other
        const ranges = [];
        let len = 0;
        for (const range of (0, arrays_1.$1b)(rangeOrRanges).sort(range_1.$ks.compareRangesUsingStarts)) {
            if (len > 0 && range_1.$ks.areIntersectingOrTouching(ranges[len - 1], range)) {
                ranges[len - 1] = range_1.$ks.fromPositions(ranges[len - 1].getStartPosition(), range.getEndPosition());
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
            const mergedA = a.reduce((acc, val) => { return range_1.$ks.plusRange(acc, val.range); }, a[0].range);
            if (!b.some(x => { return range_1.$ks.intersectRanges(mergedA, x.range); })) {
                return false;
            }
            // fallback to a complete check [O(n^2)]
            for (const edit of a) {
                for (const otherEdit of b) {
                    if (range_1.$ks.intersectRanges(edit.range, otherEdit.range)) {
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
                            const mergedRange = range_1.$ks.plusRange(ranges[i], ranges[j]);
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
        if ((0, editorBrowser_1.$iV)(editorOrModel)) {
            // use editor to apply edits
            formattingEdit_1.$B8.execute(editorOrModel, allEdits, true);
            $C8(allEdits);
            editorOrModel.revealPositionInCenterIfOutsideViewport(editorOrModel.getPosition(), 1 /* ScrollType.Immediate */);
        }
        else {
            // use model to apply edits
            const [{ range }] = allEdits;
            const initialSelection = new selection_1.$ms(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn);
            model.pushEditOperations([initialSelection], allEdits.map(edit => {
                return {
                    text: edit.text,
                    range: range_1.$ks.lift(edit.range),
                    forceMoveMarkers: true
                };
            }), undoEdits => {
                for (const { range } of undoEdits) {
                    if (range_1.$ks.areIntersectingOrTouching(range, initialSelection)) {
                        return [new selection_1.$ms(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn)];
                    }
                }
                return null;
            });
        }
        return true;
    }
    exports.$G8 = $G8;
    async function $H8(accessor, editorOrModel, mode, progress, token) {
        const instaService = accessor.get(instantiation_1.$Ah);
        const languageFeaturesService = accessor.get(languageFeatures_1.$hF);
        const model = (0, editorBrowser_1.$iV)(editorOrModel) ? editorOrModel.getModel() : editorOrModel;
        const provider = $D8(languageFeaturesService.documentFormattingEditProvider, languageFeaturesService.documentRangeFormattingEditProvider, model);
        const selected = await $E8.select(provider, model, mode);
        if (selected) {
            progress.report(selected);
            await instaService.invokeFunction($I8, selected, editorOrModel, mode, token);
        }
    }
    exports.$H8 = $H8;
    async function $I8(accessor, provider, editorOrModel, mode, token) {
        const workerService = accessor.get(editorWorker_1.$4Y);
        let model;
        let cts;
        if ((0, editorBrowser_1.$iV)(editorOrModel)) {
            model = editorOrModel.getModel();
            cts = new editorState_1.$t1(editorOrModel, 1 /* CodeEditorStateFlag.Value */ | 4 /* CodeEditorStateFlag.Position */, undefined, token);
        }
        else {
            model = editorOrModel;
            cts = new editorState_1.$u1(editorOrModel, token);
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
        if ((0, editorBrowser_1.$iV)(editorOrModel)) {
            // use editor to apply edits
            formattingEdit_1.$B8.execute(editorOrModel, edits, mode !== 2 /* FormattingMode.Silent */);
            if (mode !== 2 /* FormattingMode.Silent */) {
                $C8(edits);
                editorOrModel.revealPositionInCenterIfOutsideViewport(editorOrModel.getPosition(), 1 /* ScrollType.Immediate */);
            }
        }
        else {
            // use model to apply edits
            const [{ range }] = edits;
            const initialSelection = new selection_1.$ms(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn);
            model.pushEditOperations([initialSelection], edits.map(edit => {
                return {
                    text: edit.text,
                    range: range_1.$ks.lift(edit.range),
                    forceMoveMarkers: true
                };
            }), undoEdits => {
                for (const { range } of undoEdits) {
                    if (range_1.$ks.areIntersectingOrTouching(range, initialSelection)) {
                        return [new selection_1.$ms(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn)];
                    }
                }
                return null;
            });
        }
        return true;
    }
    exports.$I8 = $I8;
    async function $J8(workerService, languageFeaturesService, model, range, options, token) {
        const providers = languageFeaturesService.documentRangeFormattingEditProvider.ordered(model);
        for (const provider of providers) {
            const rawEdits = await Promise.resolve(provider.provideDocumentRangeFormattingEdits(model, range, options, token)).catch(errors_1.$Z);
            if ((0, arrays_1.$Jb)(rawEdits)) {
                return await workerService.computeMoreMinimalEdits(model.uri, rawEdits);
            }
        }
        return undefined;
    }
    exports.$J8 = $J8;
    async function $K8(workerService, languageFeaturesService, model, options, token) {
        const providers = $D8(languageFeaturesService.documentFormattingEditProvider, languageFeaturesService.documentRangeFormattingEditProvider, model);
        for (const provider of providers) {
            const rawEdits = await Promise.resolve(provider.provideDocumentFormattingEdits(model, options, token)).catch(errors_1.$Z);
            if ((0, arrays_1.$Jb)(rawEdits)) {
                return await workerService.computeMoreMinimalEdits(model.uri, rawEdits);
            }
        }
        return undefined;
    }
    exports.$K8 = $K8;
    function $L8(workerService, languageFeaturesService, model, position, ch, options, token) {
        const providers = languageFeaturesService.onTypeFormattingEditProvider.ordered(model);
        if (providers.length === 0) {
            return Promise.resolve(undefined);
        }
        if (providers[0].autoFormatTriggerCharacters.indexOf(ch) < 0) {
            return Promise.resolve(undefined);
        }
        return Promise.resolve(providers[0].provideOnTypeFormattingEdits(model, position, ch, options, token)).catch(errors_1.$Z).then(edits => {
            return workerService.computeMoreMinimalEdits(model.uri, edits);
        });
    }
    exports.$L8 = $L8;
    commands_1.$Gr.registerCommand('_executeFormatRangeProvider', async function (accessor, ...args) {
        const [resource, range, options] = args;
        (0, types_1.$tf)(uri_1.URI.isUri(resource));
        (0, types_1.$tf)(range_1.$ks.isIRange(range));
        const resolverService = accessor.get(resolverService_1.$uA);
        const workerService = accessor.get(editorWorker_1.$4Y);
        const languageFeaturesService = accessor.get(languageFeatures_1.$hF);
        const reference = await resolverService.createModelReference(resource);
        try {
            return $J8(workerService, languageFeaturesService, reference.object.textEditorModel, range_1.$ks.lift(range), options, cancellation_1.CancellationToken.None);
        }
        finally {
            reference.dispose();
        }
    });
    commands_1.$Gr.registerCommand('_executeFormatDocumentProvider', async function (accessor, ...args) {
        const [resource, options] = args;
        (0, types_1.$tf)(uri_1.URI.isUri(resource));
        const resolverService = accessor.get(resolverService_1.$uA);
        const workerService = accessor.get(editorWorker_1.$4Y);
        const languageFeaturesService = accessor.get(languageFeatures_1.$hF);
        const reference = await resolverService.createModelReference(resource);
        try {
            return $K8(workerService, languageFeaturesService, reference.object.textEditorModel, options, cancellation_1.CancellationToken.None);
        }
        finally {
            reference.dispose();
        }
    });
    commands_1.$Gr.registerCommand('_executeFormatOnTypeProvider', async function (accessor, ...args) {
        const [resource, position, ch, options] = args;
        (0, types_1.$tf)(uri_1.URI.isUri(resource));
        (0, types_1.$tf)(position_1.$js.isIPosition(position));
        (0, types_1.$tf)(typeof ch === 'string');
        const resolverService = accessor.get(resolverService_1.$uA);
        const workerService = accessor.get(editorWorker_1.$4Y);
        const languageFeaturesService = accessor.get(languageFeatures_1.$hF);
        const reference = await resolverService.createModelReference(resource);
        try {
            return $L8(workerService, languageFeaturesService, reference.object.textEditorModel, position_1.$js.lift(position), ch, options, cancellation_1.CancellationToken.None);
        }
        finally {
            reference.dispose();
        }
    });
});
//# sourceMappingURL=format.js.map