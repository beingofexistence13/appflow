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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/color", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/base/common/uri", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/editorContextKeys", "vs/editor/common/model/textModel", "vs/editor/common/languages/languageConfigurationRegistry", "vs/nls", "vs/platform/contextkey/common/contextkey", "vs/editor/common/services/languageFeatures", "vs/platform/theme/common/colorRegistry", "vs/editor/common/services/languageFeatureDebounce", "vs/base/common/stopwatch", "vs/css!./linkedEditing"], function (require, exports, arrays, async_1, cancellation_1, color_1, errors_1, event_1, lifecycle_1, strings, uri_1, editorExtensions_1, codeEditorService_1, position_1, range_1, editorContextKeys_1, textModel_1, languageConfigurationRegistry_1, nls, contextkey_1, languageFeatures_1, colorRegistry_1, languageFeatureDebounce_1, stopwatch_1) {
    "use strict";
    var LinkedEditingContribution_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.editorLinkedEditingBackground = exports.LinkedEditingAction = exports.LinkedEditingContribution = exports.CONTEXT_ONTYPE_RENAME_INPUT_VISIBLE = void 0;
    exports.CONTEXT_ONTYPE_RENAME_INPUT_VISIBLE = new contextkey_1.RawContextKey('LinkedEditingInputVisible', false);
    const DECORATION_CLASS_NAME = 'linked-editing-decoration';
    let LinkedEditingContribution = class LinkedEditingContribution extends lifecycle_1.Disposable {
        static { LinkedEditingContribution_1 = this; }
        static { this.ID = 'editor.contrib.linkedEditing'; }
        static { this.DECORATION = textModel_1.ModelDecorationOptions.register({
            description: 'linked-editing',
            stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */,
            className: DECORATION_CLASS_NAME
        }); }
        static get(editor) {
            return editor.getContribution(LinkedEditingContribution_1.ID);
        }
        constructor(editor, contextKeyService, languageFeaturesService, languageConfigurationService, languageFeatureDebounceService) {
            super();
            this.languageConfigurationService = languageConfigurationService;
            this._syncRangesToken = 0;
            this._localToDispose = this._register(new lifecycle_1.DisposableStore());
            this._editor = editor;
            this._providers = languageFeaturesService.linkedEditingRangeProvider;
            this._enabled = false;
            this._visibleContextKey = exports.CONTEXT_ONTYPE_RENAME_INPUT_VISIBLE.bindTo(contextKeyService);
            this._debounceInformation = languageFeatureDebounceService.for(this._providers, 'Linked Editing', { max: 200 });
            this._currentDecorations = this._editor.createDecorationsCollection();
            this._languageWordPattern = null;
            this._currentWordPattern = null;
            this._ignoreChangeEvent = false;
            this._localToDispose = this._register(new lifecycle_1.DisposableStore());
            this._rangeUpdateTriggerPromise = null;
            this._rangeSyncTriggerPromise = null;
            this._currentRequest = null;
            this._currentRequestPosition = null;
            this._currentRequestModelVersion = null;
            this._register(this._editor.onDidChangeModel(() => this.reinitialize(true)));
            this._register(this._editor.onDidChangeConfiguration(e => {
                if (e.hasChanged(69 /* EditorOption.linkedEditing */) || e.hasChanged(92 /* EditorOption.renameOnType */)) {
                    this.reinitialize(false);
                }
            }));
            this._register(this._providers.onDidChange(() => this.reinitialize(false)));
            this._register(this._editor.onDidChangeModelLanguage(() => this.reinitialize(true)));
            this.reinitialize(true);
        }
        reinitialize(forceRefresh) {
            const model = this._editor.getModel();
            const isEnabled = model !== null && (this._editor.getOption(69 /* EditorOption.linkedEditing */) || this._editor.getOption(92 /* EditorOption.renameOnType */)) && this._providers.has(model);
            if (isEnabled === this._enabled && !forceRefresh) {
                return;
            }
            this._enabled = isEnabled;
            this.clearRanges();
            this._localToDispose.clear();
            if (!isEnabled || model === null) {
                return;
            }
            this._localToDispose.add(event_1.Event.runAndSubscribe(model.onDidChangeLanguageConfiguration, () => {
                this._languageWordPattern = this.languageConfigurationService.getLanguageConfiguration(model.getLanguageId()).getWordDefinition();
            }));
            const rangeUpdateScheduler = new async_1.Delayer(this._debounceInformation.get(model));
            const triggerRangeUpdate = () => {
                this._rangeUpdateTriggerPromise = rangeUpdateScheduler.trigger(() => this.updateRanges(), this._debounceDuration ?? this._debounceInformation.get(model));
            };
            const rangeSyncScheduler = new async_1.Delayer(0);
            const triggerRangeSync = (token) => {
                this._rangeSyncTriggerPromise = rangeSyncScheduler.trigger(() => this._syncRanges(token));
            };
            this._localToDispose.add(this._editor.onDidChangeCursorPosition(() => {
                triggerRangeUpdate();
            }));
            this._localToDispose.add(this._editor.onDidChangeModelContent((e) => {
                if (!this._ignoreChangeEvent) {
                    if (this._currentDecorations.length > 0) {
                        const referenceRange = this._currentDecorations.getRange(0);
                        if (referenceRange && e.changes.every(c => referenceRange.intersectRanges(c.range))) {
                            triggerRangeSync(this._syncRangesToken);
                            return;
                        }
                    }
                }
                triggerRangeUpdate();
            }));
            this._localToDispose.add({
                dispose: () => {
                    rangeUpdateScheduler.dispose();
                    rangeSyncScheduler.dispose();
                }
            });
            this.updateRanges();
        }
        _syncRanges(token) {
            // delayed invocation, make sure we're still on
            if (!this._editor.hasModel() || token !== this._syncRangesToken || this._currentDecorations.length === 0) {
                // nothing to do
                return;
            }
            const model = this._editor.getModel();
            const referenceRange = this._currentDecorations.getRange(0);
            if (!referenceRange || referenceRange.startLineNumber !== referenceRange.endLineNumber) {
                return this.clearRanges();
            }
            const referenceValue = model.getValueInRange(referenceRange);
            if (this._currentWordPattern) {
                const match = referenceValue.match(this._currentWordPattern);
                const matchLength = match ? match[0].length : 0;
                if (matchLength !== referenceValue.length) {
                    return this.clearRanges();
                }
            }
            const edits = [];
            for (let i = 1, len = this._currentDecorations.length; i < len; i++) {
                const mirrorRange = this._currentDecorations.getRange(i);
                if (!mirrorRange) {
                    continue;
                }
                if (mirrorRange.startLineNumber !== mirrorRange.endLineNumber) {
                    edits.push({
                        range: mirrorRange,
                        text: referenceValue
                    });
                }
                else {
                    let oldValue = model.getValueInRange(mirrorRange);
                    let newValue = referenceValue;
                    let rangeStartColumn = mirrorRange.startColumn;
                    let rangeEndColumn = mirrorRange.endColumn;
                    const commonPrefixLength = strings.commonPrefixLength(oldValue, newValue);
                    rangeStartColumn += commonPrefixLength;
                    oldValue = oldValue.substr(commonPrefixLength);
                    newValue = newValue.substr(commonPrefixLength);
                    const commonSuffixLength = strings.commonSuffixLength(oldValue, newValue);
                    rangeEndColumn -= commonSuffixLength;
                    oldValue = oldValue.substr(0, oldValue.length - commonSuffixLength);
                    newValue = newValue.substr(0, newValue.length - commonSuffixLength);
                    if (rangeStartColumn !== rangeEndColumn || newValue.length !== 0) {
                        edits.push({
                            range: new range_1.Range(mirrorRange.startLineNumber, rangeStartColumn, mirrorRange.endLineNumber, rangeEndColumn),
                            text: newValue
                        });
                    }
                }
            }
            if (edits.length === 0) {
                return;
            }
            try {
                this._editor.popUndoStop();
                this._ignoreChangeEvent = true;
                const prevEditOperationType = this._editor._getViewModel().getPrevEditOperationType();
                this._editor.executeEdits('linkedEditing', edits);
                this._editor._getViewModel().setPrevEditOperationType(prevEditOperationType);
            }
            finally {
                this._ignoreChangeEvent = false;
            }
        }
        dispose() {
            this.clearRanges();
            super.dispose();
        }
        clearRanges() {
            this._visibleContextKey.set(false);
            this._currentDecorations.clear();
            if (this._currentRequest) {
                this._currentRequest.cancel();
                this._currentRequest = null;
                this._currentRequestPosition = null;
            }
        }
        get currentUpdateTriggerPromise() {
            return this._rangeUpdateTriggerPromise || Promise.resolve();
        }
        get currentSyncTriggerPromise() {
            return this._rangeSyncTriggerPromise || Promise.resolve();
        }
        async updateRanges(force = false) {
            if (!this._editor.hasModel()) {
                this.clearRanges();
                return;
            }
            const position = this._editor.getPosition();
            if (!this._enabled && !force || this._editor.getSelections().length > 1) {
                // disabled or multicursor
                this.clearRanges();
                return;
            }
            const model = this._editor.getModel();
            const modelVersionId = model.getVersionId();
            if (this._currentRequestPosition && this._currentRequestModelVersion === modelVersionId) {
                if (position.equals(this._currentRequestPosition)) {
                    return; // same position
                }
                if (this._currentDecorations.length > 0) {
                    const range = this._currentDecorations.getRange(0);
                    if (range && range.containsPosition(position)) {
                        return; // just moving inside the existing primary range
                    }
                }
            }
            // Clear existing decorations while we compute new ones
            this.clearRanges();
            this._currentRequestPosition = position;
            this._currentRequestModelVersion = modelVersionId;
            const request = (0, async_1.createCancelablePromise)(async (token) => {
                try {
                    const sw = new stopwatch_1.StopWatch(false);
                    const response = await getLinkedEditingRanges(this._providers, model, position, token);
                    this._debounceInformation.update(model, sw.elapsed());
                    if (request !== this._currentRequest) {
                        return;
                    }
                    this._currentRequest = null;
                    if (modelVersionId !== model.getVersionId()) {
                        return;
                    }
                    let ranges = [];
                    if (response?.ranges) {
                        ranges = response.ranges;
                    }
                    this._currentWordPattern = response?.wordPattern || this._languageWordPattern;
                    let foundReferenceRange = false;
                    for (let i = 0, len = ranges.length; i < len; i++) {
                        if (range_1.Range.containsPosition(ranges[i], position)) {
                            foundReferenceRange = true;
                            if (i !== 0) {
                                const referenceRange = ranges[i];
                                ranges.splice(i, 1);
                                ranges.unshift(referenceRange);
                            }
                            break;
                        }
                    }
                    if (!foundReferenceRange) {
                        // Cannot do linked editing if the ranges are not where the cursor is...
                        this.clearRanges();
                        return;
                    }
                    const decorations = ranges.map(range => ({ range: range, options: LinkedEditingContribution_1.DECORATION }));
                    this._visibleContextKey.set(true);
                    this._currentDecorations.set(decorations);
                    this._syncRangesToken++; // cancel any pending syncRanges call
                }
                catch (err) {
                    if (!(0, errors_1.isCancellationError)(err)) {
                        (0, errors_1.onUnexpectedError)(err);
                    }
                    if (this._currentRequest === request || !this._currentRequest) {
                        // stop if we are still the latest request
                        this.clearRanges();
                    }
                }
            });
            this._currentRequest = request;
            return request;
        }
        // for testing
        setDebounceDuration(timeInMS) {
            this._debounceDuration = timeInMS;
        }
    };
    exports.LinkedEditingContribution = LinkedEditingContribution;
    exports.LinkedEditingContribution = LinkedEditingContribution = LinkedEditingContribution_1 = __decorate([
        __param(1, contextkey_1.IContextKeyService),
        __param(2, languageFeatures_1.ILanguageFeaturesService),
        __param(3, languageConfigurationRegistry_1.ILanguageConfigurationService),
        __param(4, languageFeatureDebounce_1.ILanguageFeatureDebounceService)
    ], LinkedEditingContribution);
    class LinkedEditingAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.linkedEditing',
                label: nls.localize('linkedEditing.label', "Start Linked Editing"),
                alias: 'Start Linked Editing',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.writable, editorContextKeys_1.EditorContextKeys.hasRenameProvider),
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 60 /* KeyCode.F2 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        runCommand(accessor, args) {
            const editorService = accessor.get(codeEditorService_1.ICodeEditorService);
            const [uri, pos] = Array.isArray(args) && args || [undefined, undefined];
            if (uri_1.URI.isUri(uri) && position_1.Position.isIPosition(pos)) {
                return editorService.openCodeEditor({ resource: uri }, editorService.getActiveCodeEditor()).then(editor => {
                    if (!editor) {
                        return;
                    }
                    editor.setPosition(pos);
                    editor.invokeWithinContext(accessor => {
                        this.reportTelemetry(accessor, editor);
                        return this.run(accessor, editor);
                    });
                }, errors_1.onUnexpectedError);
            }
            return super.runCommand(accessor, args);
        }
        run(_accessor, editor) {
            const controller = LinkedEditingContribution.get(editor);
            if (controller) {
                return Promise.resolve(controller.updateRanges(true));
            }
            return Promise.resolve();
        }
    }
    exports.LinkedEditingAction = LinkedEditingAction;
    const LinkedEditingCommand = editorExtensions_1.EditorCommand.bindToContribution(LinkedEditingContribution.get);
    (0, editorExtensions_1.registerEditorCommand)(new LinkedEditingCommand({
        id: 'cancelLinkedEditingInput',
        precondition: exports.CONTEXT_ONTYPE_RENAME_INPUT_VISIBLE,
        handler: x => x.clearRanges(),
        kbOpts: {
            kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
            weight: 100 /* KeybindingWeight.EditorContrib */ + 99,
            primary: 9 /* KeyCode.Escape */,
            secondary: [1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */]
        }
    }));
    function getLinkedEditingRanges(providers, model, position, token) {
        const orderedByScore = providers.ordered(model);
        // in order of score ask the linked editing range provider
        // until someone response with a good result
        // (good = not null)
        return (0, async_1.first)(orderedByScore.map(provider => async () => {
            try {
                return await provider.provideLinkedEditingRanges(model, position, token);
            }
            catch (e) {
                (0, errors_1.onUnexpectedExternalError)(e);
                return undefined;
            }
        }), result => !!result && arrays.isNonEmptyArray(result?.ranges));
    }
    exports.editorLinkedEditingBackground = (0, colorRegistry_1.registerColor)('editor.linkedEditingBackground', { dark: color_1.Color.fromHex('#f00').transparent(0.3), light: color_1.Color.fromHex('#f00').transparent(0.3), hcDark: color_1.Color.fromHex('#f00').transparent(0.3), hcLight: color_1.Color.white }, nls.localize('editorLinkedEditingBackground', 'Background color when the editor auto renames on type.'));
    (0, editorExtensions_1.registerModelAndPositionCommand)('_executeLinkedEditingProvider', (_accessor, model, position) => {
        const { linkedEditingRangeProvider } = _accessor.get(languageFeatures_1.ILanguageFeaturesService);
        return getLinkedEditingRanges(linkedEditingRangeProvider, model, position, cancellation_1.CancellationToken.None);
    });
    (0, editorExtensions_1.registerEditorContribution)(LinkedEditingContribution.ID, LinkedEditingContribution, 1 /* EditorContributionInstantiation.AfterFirstRender */);
    (0, editorExtensions_1.registerEditorAction)(LinkedEditingAction);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlua2VkRWRpdGluZy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2xpbmtlZEVkaXRpbmcvYnJvd3Nlci9saW5rZWRFZGl0aW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFtQ25GLFFBQUEsbUNBQW1DLEdBQUcsSUFBSSwwQkFBYSxDQUFVLDJCQUEyQixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBRWxILE1BQU0scUJBQXFCLEdBQUcsMkJBQTJCLENBQUM7SUFFbkQsSUFBTSx5QkFBeUIsR0FBL0IsTUFBTSx5QkFBMEIsU0FBUSxzQkFBVTs7aUJBRWpDLE9BQUUsR0FBRyw4QkFBOEIsQUFBakMsQ0FBa0M7aUJBRW5DLGVBQVUsR0FBRyxrQ0FBc0IsQ0FBQyxRQUFRLENBQUM7WUFDcEUsV0FBVyxFQUFFLGdCQUFnQjtZQUM3QixVQUFVLDZEQUFxRDtZQUMvRCxTQUFTLEVBQUUscUJBQXFCO1NBQ2hDLENBQUMsQUFKZ0MsQ0FJL0I7UUFFSCxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQW1CO1lBQzdCLE9BQU8sTUFBTSxDQUFDLGVBQWUsQ0FBNEIsMkJBQXlCLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDeEYsQ0FBQztRQTJCRCxZQUNDLE1BQW1CLEVBQ0MsaUJBQXFDLEVBQy9CLHVCQUFpRCxFQUM1Qyw0QkFBNEUsRUFDMUUsOEJBQStEO1lBRWhHLEtBQUssRUFBRSxDQUFDO1lBSHdDLGlDQUE0QixHQUE1Qiw0QkFBNEIsQ0FBK0I7WUFacEcscUJBQWdCLEdBQVcsQ0FBQyxDQUFDO1lBTXBCLG9CQUFlLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDJCQUFlLEVBQUUsQ0FBQyxDQUFDO1lBVXhFLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxVQUFVLEdBQUcsdUJBQXVC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