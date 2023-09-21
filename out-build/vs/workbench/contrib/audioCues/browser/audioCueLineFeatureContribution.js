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
define(["require", "exports", "vs/base/common/cache", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/editor/browser/editorBrowser", "vs/editor/contrib/folding/browser/folding", "vs/platform/audioCues/browser/audioCueService", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/markers/common/markers", "vs/workbench/contrib/debug/common/debug", "vs/workbench/services/editor/common/editorService"], function (require, exports, cache_1, event_1, lifecycle_1, observable_1, editorBrowser_1, folding_1, audioCueService_1, configuration_1, instantiation_1, markers_1, debug_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$R1b = void 0;
    let $R1b = class $R1b extends lifecycle_1.$kc {
        constructor(g, h, j, n) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.n = n;
            this.a = this.B(new lifecycle_1.$jc());
            this.b = [
                this.h.createInstance(MarkerLineFeature, audioCueService_1.$wZ.error, markers_1.MarkerSeverity.Error),
                this.h.createInstance(MarkerLineFeature, audioCueService_1.$wZ.warning, markers_1.MarkerSeverity.Warning),
                this.h.createInstance(FoldedAreaLineFeature),
                this.h.createInstance(BreakpointLineFeature),
            ];
            this.c = new cache_1.$je((cue) => (0, observable_1.observableFromEvent)(this.j.onEnabledChanged(cue), () => this.j.isEnabled(cue)));
            const someAudioCueFeatureIsEnabled = (0, observable_1.derived)((reader) => /** @description someAudioCueFeatureIsEnabled */ this.b.some((feature) => this.c.get(feature.audioCue).read(reader)));
            const activeEditorObservable = (0, observable_1.observableFromEvent)(this.g.onDidActiveEditorChange, (_) => {
                const activeTextEditorControl = this.g.activeTextEditorControl;
                const editor = (0, editorBrowser_1.$jV)(activeTextEditorControl)
                    ? activeTextEditorControl.getOriginalEditor()
                    : (0, editorBrowser_1.$iV)(activeTextEditorControl)
                        ? activeTextEditorControl
                        : undefined;
                return editor && editor.hasModel() ? { editor, model: editor.getModel() } : undefined;
            });
            this.B((0, observable_1.autorun)(reader => {
                /** @description updateAudioCuesEnabled */
                this.a.clear();
                if (!someAudioCueFeatureIsEnabled.read(reader)) {
                    return;
                }
                const activeEditor = activeEditorObservable.read(reader);
                if (activeEditor) {
                    this.r(activeEditor.editor, activeEditor.model, this.a);
                }
            }));
        }
        r(editor, editorModel, store) {
            const curPosition = (0, observable_1.observableFromEvent)(editor.onDidChangeCursorPosition, (args) => {
                /** @description editor.onDidChangeCursorPosition (caused by user) */
                if (args &&
                    args.reason !== 3 /* CursorChangeReason.Explicit */ &&
                    args.reason !== 0 /* CursorChangeReason.NotSet */) {
                    // Ignore cursor changes caused by navigation (e.g. which happens when execution is paused).
                    return undefined;
                }
                return editor.getPosition();
            });
            const debouncedPosition = (0, observable_1.debouncedObservable)(curPosition, this.n.getValue('audioCues.debouncePositionChanges') ? 300 : 0, store);
            const isTyping = (0, observable_1.wasEventTriggeredRecently)(editorModel.onDidChangeContent.bind(editorModel), 1000, store);
            const featureStates = this.b.map((feature) => {
                const lineFeatureState = feature.getObservableState(editor, editorModel);
                const isFeaturePresent = (0, observable_1.derivedOpts)({ debugName: `isPresentInLine:${feature.audioCue.name}` }, (reader) => {
                    if (!this.c.get(feature.audioCue).read(reader)) {
                        return false;
                    }
                    const position = debouncedPosition.read(reader);
                    if (!position) {
                        return false;
                    }
                    return lineFeatureState.read(reader).isPresent(position);
                });
                return (0, observable_1.derivedOpts)({ debugName: `typingDebouncedFeatureState:\n${feature.audioCue.name}` }, (reader) => feature.debounceWhileTyping && isTyping.read(reader)
                    ? (debouncedPosition.read(reader), isFeaturePresent.get())
                    : isFeaturePresent.read(reader));
            });
            const state = (0, observable_1.derived)((reader) => /** @description states */ ({
                lineNumber: debouncedPosition.read(reader),
                featureStates: new Map(this.b.map((feature, idx) => [
                    feature,
                    featureStates[idx].read(reader),
                ])),
            }));
            store.add((0, observable_1.autorunDelta)(state, ({ lastValue, newValue }) => {
                /** @description Play Audio Cue */
                const newFeatures = this.b.filter(feature => newValue?.featureStates.get(feature) &&
                    (!lastValue?.featureStates?.get(feature) || newValue.lineNumber !== lastValue.lineNumber));
                this.j.playAudioCues(newFeatures.map(f => f.audioCue));
            }));
        }
    };
    exports.$R1b = $R1b;
    exports.$R1b = $R1b = __decorate([
        __param(0, editorService_1.$9C),
        __param(1, instantiation_1.$Ah),
        __param(2, audioCueService_1.$sZ),
        __param(3, configuration_1.$8h)
    ], $R1b);
    let MarkerLineFeature = class MarkerLineFeature {
        constructor(audioCue, b, c) {
            this.audioCue = audioCue;
            this.b = b;
            this.c = c;
            this.debounceWhileTyping = true;
            this.a = 0;
        }
        getObservableState(editor, model) {
            return (0, observable_1.observableFromEvent)(event_1.Event.filter(this.c.onMarkerChanged, (changedUris) => changedUris.some((u) => u.toString() === model.uri.toString())), () => /** @description this.markerService.onMarkerChanged */ ({
                isPresent: (position) => {
                    const lineChanged = position.lineNumber !== this.a;
                    this.a = position.lineNumber;
                    const hasMarker = this.c
                        .read({ resource: model.uri })
                        .some((m) => {
                        const onLine = m.severity === this.b && m.startLineNumber <= position.lineNumber && position.lineNumber <= m.endLineNumber;
                        return lineChanged ? onLine : onLine && (position.lineNumber <= m.endLineNumber && m.startColumn <= position.column && m.endColumn >= position.column);
                    });
                    return hasMarker;
                },
            }));
        }
    };
    MarkerLineFeature = __decorate([
        __param(2, markers_1.$3s)
    ], MarkerLineFeature);
    class FoldedAreaLineFeature {
        constructor() {
            this.audioCue = audioCueService_1.$wZ.foldedArea;
        }
        getObservableState(editor, model) {
            const foldingController = folding_1.$z8.get(editor);
            if (!foldingController) {
                return (0, observable_1.constObservable)({
                    isPresent: () => false,
                });
            }
            const foldingModel = (0, observable_1.observableFromPromise)(foldingController.getFoldingModel() ?? Promise.resolve(undefined));
            return foldingModel.map((v) => ({
                isPresent: (position) => {
                    const regionAtLine = v.value?.getRegionAtLine(position.lineNumber);
                    const hasFolding = !regionAtLine
                        ? false
                        : regionAtLine.isCollapsed &&
                            regionAtLine.startLineNumber === position.lineNumber;
                    return hasFolding;
                },
            }));
        }
    }
    let BreakpointLineFeature = class BreakpointLineFeature {
        constructor(a) {
            this.a = a;
            this.audioCue = audioCueService_1.$wZ.break;
        }
        getObservableState(editor, model) {
            return (0, observable_1.observableFromEvent)(this.a.getModel().onDidChangeBreakpoints, () => /** @description debugService.getModel().onDidChangeBreakpoints */ ({
                isPresent: (position) => {
                    const breakpoints = this.a
                        .getModel()
                        .getBreakpoints({ uri: model.uri, lineNumber: position.lineNumber });
                    const hasBreakpoints = breakpoints.length > 0;
                    return hasBreakpoints;
                },
            }));
        }
    };
    BreakpointLineFeature = __decorate([
        __param(0, debug_1.$nH)
    ], BreakpointLineFeature);
});
//# sourceMappingURL=audioCueLineFeatureContribution.js.map