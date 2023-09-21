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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/color", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/base/common/uri", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/editorContextKeys", "vs/editor/common/model/textModel", "vs/editor/common/languages/languageConfigurationRegistry", "vs/nls!vs/editor/contrib/linkedEditing/browser/linkedEditing", "vs/platform/contextkey/common/contextkey", "vs/editor/common/services/languageFeatures", "vs/platform/theme/common/colorRegistry", "vs/editor/common/services/languageFeatureDebounce", "vs/base/common/stopwatch", "vs/css!./linkedEditing"], function (require, exports, arrays, async_1, cancellation_1, color_1, errors_1, event_1, lifecycle_1, strings, uri_1, editorExtensions_1, codeEditorService_1, position_1, range_1, editorContextKeys_1, textModel_1, languageConfigurationRegistry_1, nls, contextkey_1, languageFeatures_1, colorRegistry_1, languageFeatureDebounce_1, stopwatch_1) {
    "use strict";
    var $X9_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Z9 = exports.$Y9 = exports.$X9 = exports.$W9 = void 0;
    exports.$W9 = new contextkey_1.$2i('LinkedEditingInputVisible', false);
    const DECORATION_CLASS_NAME = 'linked-editing-decoration';
    let $X9 = class $X9 extends lifecycle_1.$kc {
        static { $X9_1 = this; }
        static { this.ID = 'editor.contrib.linkedEditing'; }
        static { this.a = textModel_1.$RC.register({
            description: 'linked-editing',
            stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */,
            className: DECORATION_CLASS_NAME
        }); }
        static get(editor) {
            return editor.getContribution($X9_1.ID);
        }
        constructor(editor, contextKeyService, languageFeaturesService, G, languageFeatureDebounceService) {
            super();
            this.G = G;
            this.y = 0;
            this.F = this.B(new lifecycle_1.$jc());
            this.f = editor;
            this.g = languageFeaturesService.linkedEditingRangeProvider;
            this.h = false;
            this.j = exports.$W9.bindTo(contextKeyService);
            this.m = languageFeatureDebounceService.for(this.g, 'Linked Editing', { max: 200 });
            this.w = this.f.createDecorationsCollection();
            this.z = null;
            this.C = null;
            this.D = false;
            this.F = this.B(new lifecycle_1.$jc());
            this.n = null;
            this.r = null;
            this.s = null;
            this.t = null;
            this.u = null;
            this.B(this.f.onDidChangeModel(() => this.H(true)));
            this.B(this.f.onDidChangeConfiguration(e => {
                if (e.hasChanged(69 /* EditorOption.linkedEditing */) || e.hasChanged(92 /* EditorOption.renameOnType */)) {
                    this.H(false);
                }
            }));
            this.B(this.g.onDidChange(() => this.H(false)));
            this.B(this.f.onDidChangeModelLanguage(() => this.H(true)));
            this.H(true);
        }
        H(forceRefresh) {
            const model = this.f.getModel();
            const isEnabled = model !== null && (this.f.getOption(69 /* EditorOption.linkedEditing */) || this.f.getOption(92 /* EditorOption.renameOnType */)) && this.g.has(model);
            if (isEnabled === this.h && !forceRefresh) {
                return;
            }
            this.h = isEnabled;
            this.clearRanges();
            this.F.clear();
            if (!isEnabled || model === null) {
                return;
            }
            this.F.add(event_1.Event.runAndSubscribe(model.onDidChangeLanguageConfiguration, () => {
                this.z = this.G.getLanguageConfiguration(model.getLanguageId()).getWordDefinition();
            }));
            const rangeUpdateScheduler = new async_1.$Dg(this.m.get(model));
            const triggerRangeUpdate = () => {
                this.n = rangeUpdateScheduler.trigger(() => this.updateRanges(), this.b ?? this.m.get(model));
            };
            const rangeSyncScheduler = new async_1.$Dg(0);
            const triggerRangeSync = (token) => {
                this.r = rangeSyncScheduler.trigger(() => this.I(token));
            };
            this.F.add(this.f.onDidChangeCursorPosition(() => {
                triggerRangeUpdate();
            }));
            this.F.add(this.f.onDidChangeModelContent((e) => {
                if (!this.D) {
                    if (this.w.length > 0) {
                        const referenceRange = this.w.getRange(0);
                        if (referenceRange && e.changes.every(c => referenceRange.intersectRanges(c.range))) {
                            triggerRangeSync(this.y);
                            return;
                        }
                    }
                }
                triggerRangeUpdate();
            }));
            this.F.add({
                dispose: () => {
                    rangeUpdateScheduler.dispose();
                    rangeSyncScheduler.dispose();
                }
            });
            this.updateRanges();
        }
        I(token) {
            // delayed invocation, make sure we're still on
            if (!this.f.hasModel() || token !== this.y || this.w.length === 0) {
                // nothing to do
                return;
            }
            const model = this.f.getModel();
            const referenceRange = this.w.getRange(0);
            if (!referenceRange || referenceRange.startLineNumber !== referenceRange.endLineNumber) {
                return this.clearRanges();
            }
            const referenceValue = model.getValueInRange(referenceRange);
            if (this.C) {
                const match = referenceValue.match(this.C);
                const matchLength = match ? match[0].length : 0;
                if (matchLength !== referenceValue.length) {
                    return this.clearRanges();
                }
            }
            const edits = [];
            for (let i = 1, len = this.w.length; i < len; i++) {
                const mirrorRange = this.w.getRange(i);
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
                    const commonPrefixLength = strings.$Oe(oldValue, newValue);
                    rangeStartColumn += commonPrefixLength;
                    oldValue = oldValue.substr(commonPrefixLength);
                    newValue = newValue.substr(commonPrefixLength);
                    const commonSuffixLength = strings.$Pe(oldValue, newValue);
                    rangeEndColumn -= commonSuffixLength;
                    oldValue = oldValue.substr(0, oldValue.length - commonSuffixLength);
                    newValue = newValue.substr(0, newValue.length - commonSuffixLength);
                    if (rangeStartColumn !== rangeEndColumn || newValue.length !== 0) {
                        edits.push({
                            range: new range_1.$ks(mirrorRange.startLineNumber, rangeStartColumn, mirrorRange.endLineNumber, rangeEndColumn),
                            text: newValue
                        });
                    }
                }
            }
            if (edits.length === 0) {
                return;
            }
            try {
                this.f.popUndoStop();
                this.D = true;
                const prevEditOperationType = this.f._getViewModel().getPrevEditOperationType();
                this.f.executeEdits('linkedEditing', edits);
                this.f._getViewModel().setPrevEditOperationType(prevEditOperationType);
            }
            finally {
                this.D = false;
            }
        }
        dispose() {
            this.clearRanges();
            super.dispose();
        }
        clearRanges() {
            this.j.set(false);
            this.w.clear();
            if (this.s) {
                this.s.cancel();
                this.s = null;
                this.t = null;
            }
        }
        get currentUpdateTriggerPromise() {
            return this.n || Promise.resolve();
        }
        get currentSyncTriggerPromise() {
            return this.r || Promise.resolve();
        }
        async updateRanges(force = false) {
            if (!this.f.hasModel()) {
                this.clearRanges();
                return;
            }
            const position = this.f.getPosition();
            if (!this.h && !force || this.f.getSelections().length > 1) {
                // disabled or multicursor
                this.clearRanges();
                return;
            }
            const model = this.f.getModel();
            const modelVersionId = model.getVersionId();
            if (this.t && this.u === modelVersionId) {
                if (position.equals(this.t)) {
                    return; // same position
                }
                if (this.w.length > 0) {
                    const range = this.w.getRange(0);
                    if (range && range.containsPosition(position)) {
                        return; // just moving inside the existing primary range
                    }
                }
            }
            // Clear existing decorations while we compute new ones
            this.clearRanges();
            this.t = position;
            this.u = modelVersionId;
            const request = (0, async_1.$ug)(async (token) => {
                try {
                    const sw = new stopwatch_1.$bd(false);
                    const response = await getLinkedEditingRanges(this.g, model, position, token);
                    this.m.update(model, sw.elapsed());
                    if (request !== this.s) {
                        return;
                    }
                    this.s = null;
                    if (modelVersionId !== model.getVersionId()) {
                        return;
                    }
                    let ranges = [];
                    if (response?.ranges) {
                        ranges = response.ranges;
                    }
                    this.C = response?.wordPattern || this.z;
                    let foundReferenceRange = false;
                    for (let i = 0, len = ranges.length; i < len; i++) {
                        if (range_1.$ks.containsPosition(ranges[i], position)) {
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
                    const decorations = ranges.map(range => ({ range: range, options: $X9_1.a }));
                    this.j.set(true);
                    this.w.set(decorations);
                    this.y++; // cancel any pending syncRanges call
                }
                catch (err) {
                    if (!(0, errors_1.$2)(err)) {
                        (0, errors_1.$Y)(err);
                    }
                    if (this.s === request || !this.s) {
                        // stop if we are still the latest request
                        this.clearRanges();
                    }
                }
            });
            this.s = request;
            return request;
        }
        // for testing
        setDebounceDuration(timeInMS) {
            this.b = timeInMS;
        }
    };
    exports.$X9 = $X9;
    exports.$X9 = $X9 = $X9_1 = __decorate([
        __param(1, contextkey_1.$3i),
        __param(2, languageFeatures_1.$hF),
        __param(3, languageConfigurationRegistry_1.$2t),
        __param(4, languageFeatureDebounce_1.$52)
    ], $X9);
    class $Y9 extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.linkedEditing',
                label: nls.localize(0, null),
                alias: 'Start Linked Editing',
                precondition: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.writable, editorContextKeys_1.EditorContextKeys.hasRenameProvider),
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 60 /* KeyCode.F2 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        runCommand(accessor, args) {
            const editorService = accessor.get(codeEditorService_1.$nV);
            const [uri, pos] = Array.isArray(args) && args || [undefined, undefined];
            if (uri_1.URI.isUri(uri) && position_1.$js.isIPosition(pos)) {
                return editorService.openCodeEditor({ resource: uri }, editorService.getActiveCodeEditor()).then(editor => {
                    if (!editor) {
                        return;
                    }
                    editor.setPosition(pos);
                    editor.invokeWithinContext(accessor => {
                        this.q(accessor, editor);
                        return this.run(accessor, editor);
                    });
                }, errors_1.$Y);
            }
            return super.runCommand(accessor, args);
        }
        run(_accessor, editor) {
            const controller = $X9.get(editor);
            if (controller) {
                return Promise.resolve(controller.updateRanges(true));
            }
            return Promise.resolve();
        }
    }
    exports.$Y9 = $Y9;
    const LinkedEditingCommand = editorExtensions_1.$rV.bindToContribution($X9.get);
    (0, editorExtensions_1.$wV)(new LinkedEditingCommand({
        id: 'cancelLinkedEditingInput',
        precondition: exports.$W9,
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
        return (0, async_1.$Kg)(orderedByScore.map(provider => async () => {
            try {
                return await provider.provideLinkedEditingRanges(model, position, token);
            }
            catch (e) {
                (0, errors_1.$Z)(e);
                return undefined;
            }
        }), result => !!result && arrays.$Jb(result?.ranges));
    }
    exports.$Z9 = (0, colorRegistry_1.$sv)('editor.linkedEditingBackground', { dark: color_1.$Os.fromHex('#f00').transparent(0.3), light: color_1.$Os.fromHex('#f00').transparent(0.3), hcDark: color_1.$Os.fromHex('#f00').transparent(0.3), hcLight: color_1.$Os.white }, nls.localize(1, null));
    (0, editorExtensions_1.$vV)('_executeLinkedEditingProvider', (_accessor, model, position) => {
        const { linkedEditingRangeProvider } = _accessor.get(languageFeatures_1.$hF);
        return getLinkedEditingRanges(linkedEditingRangeProvider, model, position, cancellation_1.CancellationToken.None);
    });
    (0, editorExtensions_1.$AV)($X9.ID, $X9, 1 /* EditorContributionInstantiation.AfterFirstRender */);
    (0, editorExtensions_1.$xV)($Y9);
});
//# sourceMappingURL=linkedEditing.js.map