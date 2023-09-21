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
    exports.AudioCueLineFeatureContribution = void 0;
    let AudioCueLineFeatureContribution = class AudioCueLineFeatureContribution extends lifecycle_1.Disposable {
        constructor(editorService, instantiationService, audioCueService, _configurationService) {
            super();
            this.editorService = editorService;
            this.instantiationService = instantiationService;
            this.audioCueService = audioCueService;
            this._configurationService = _configurationService;
            this.store = this._register(new lifecycle_1.DisposableStore());
            this.features = [
                this.instantiationService.createInstance(MarkerLineFeature, audioCueService_1.AudioCue.error, markers_1.MarkerSeverity.Error),
                this.instantiationService.createInstance(MarkerLineFeature, audioCueService_1.AudioCue.warning, markers_1.MarkerSeverity.Warning),
                this.instantiationService.createInstance(FoldedAreaLineFeature),
                this.instantiationService.createInstance(BreakpointLineFeature),
            ];
            this.isEnabledCache = new cache_1.CachedFunction((cue) => (0, observable_1.observableFromEvent)(this.audioCueService.onEnabledChanged(cue), () => this.audioCueService.isEnabled(cue)));
            const someAudioCueFeatureIsEnabled = (0, observable_1.derived)((reader) => /** @description someAudioCueFeatureIsEnabled */ this.features.some((feature) => this.isEnabledCache.get(feature.audioCue).read(reader)));
            const activeEditorObservable = (0, observable_1.observableFromEvent)(this.editorService.onDidActiveEditorChange, (_) => {
                const activeTextEditorControl = this.editorService.activeTextEditorControl;
                const editor = (0, editorBrowser_1.isDiffEditor)(activeTextEditorControl)
                    ? activeTextEditorControl.getOriginalEditor()
                    : (0, editorBrowser_1.isCodeEditor)(activeTextEditorControl)
                        ? activeTextEditorControl
                        : undefined;
                return editor && editor.hasModel() ? { editor, model: editor.getModel() } : undefined;
            });
            this._register((0, observable_1.autorun)(reader => {
                /** @description updateAudioCuesEnabled */
                this.store.clear();
                if (!someAudioCueFeatureIsEnabled.read(reader)) {
                    return;
                }
                const activeEditor = activeEditorObservable.read(reader);
                if (activeEditor) {
                    this.registerAudioCuesForEditor(activeEditor.editor, activeEditor.model, this.store);
                }
            }));
        }
        registerAudioCuesForEditor(editor, editorModel, store) {
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
            const debouncedPosition = (0, observable_1.debouncedObservable)(curPosition, this._configurationService.getValue('audioCues.debouncePositionChanges') ? 300 : 0, store);
            const isTyping = (0, observable_1.wasEventTriggeredRecently)(editorModel.onDidChangeContent.bind(editorModel), 1000, store);
            const featureStates = this.features.map((feature) => {
                const lineFeatureState = feature.getObservableState(editor, editorModel);
                const isFeaturePresent = (0, observable_1.derivedOpts)({ debugName: `isPresentInLine:${feature.audioCue.name}` }, (reader) => {
                    if (!this.isEnabledCache.get(feature.audioCue).read(reader)) {
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
                featureStates: new Map(this.features.map((feature, idx) => [
                    feature,
                    featureStates[idx].read(reader),
                ])),
            }));
            store.add((0, observable_1.autorunDelta)(state, ({ lastValue, newValue }) => {
                /** @description Play Audio Cue */
                const newFeatures = this.features.filter(feature => newValue?.featureStates.get(feature) &&
                    (!lastValue?.featureStates?.get(feature) || newValue.lineNumber !== lastValue.lineNumber));
                this.audioCueService.playAudioCues(newFeatures.map(f => f.audioCue));
            }));
        }
    };
    exports.AudioCueLineFeatureContribution = AudioCueLineFeatureContribution;
    exports.AudioCueLineFeatureContribution = AudioCueLineFeatureContribution = __decorate([
        __param(0, editorService_1.IEditorService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, audioCueService_1.IAudioCueService),
        __param(3, configuration_1.IConfigurationService)
    ], AudioCueLineFeatureContribution);
    let MarkerLineFeature = class MarkerLineFeature {
        constructor(audioCue, severity, markerService) {
            this.audioCue = audioCue;
            this.severity = severity;
            this.markerService = markerService;
            this.debounceWhileTyping = true;
            this._previousLine = 0;
        }
        getObservableState(editor, model) {
            return (0, observable_1.observableFromEvent)(event_1.Event.filter(this.markerService.onMarkerChanged, (changedUris) => changedUris.some((u) => u.toString() === model.uri.toString())), () => /** @description this.markerService.onMarkerChanged */ ({
                isPresent: (position) => {
                    const lineChanged = position.lineNumber !== this._previousLine;
                    this._previousLine = position.lineNumber;
                    const hasMarker = this.markerService
                        .read({ resource: model.uri })
                        .some((m) => {
                        const onLine = m.severity === this.severity && m.startLineNumber <= position.lineNumber && position.lineNumber <= m.endLineNumber;
                        return lineChanged ? onLine : onLine && (position.lineNumber <= m.endLineNumber && m.startColumn <= position.column && m.endColumn >= position.column);
                    });
                    return hasMarker;
                },
            }));
        }
    };
    MarkerLineFeature = __decorate([
        __param(2, markers_1.IMarkerService)
    ], MarkerLineFeature);
    class FoldedAreaLineFeature {
        constructor() {
            this.audioCue = audioCueService_1.AudioCue.foldedArea;
        }
        getObservableState(editor, model) {
            const foldingController = folding_1.FoldingController.get(editor);
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
        constructor(debugService) {
            this.debugService = debugService;
            this.audioCue = audioCueService_1.AudioCue.break;
        }
        getObservableState(editor, model) {
            return (0, observable_1.observableFromEvent)(this.debugService.getModel().onDidChangeBreakpoints, () => /** @description debugService.getModel().onDidChangeBreakpoints */ ({
                isPresent: (position) => {
                    const breakpoints = this.debugService
                        .getModel()
                        .getBreakpoints({ uri: model.uri, lineNumber: position.lineNumber });
                    const hasBreakpoints = breakpoints.length > 0;
                    return hasBreakpoints;
                },
            }));
        }
    };
    BreakpointLineFeature = __decorate([
        __param(0, debug_1.IDebugService)
    ], BreakpointLineFeature);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXVkaW9DdWVMaW5lRmVhdHVyZUNvbnRyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2F1ZGlvQ3Vlcy9icm93c2VyL2F1ZGlvQ3VlTGluZUZlYXR1cmVDb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBbUJ6RixJQUFNLCtCQUErQixHQUFyQyxNQUFNLCtCQUNaLFNBQVEsc0JBQVU7UUFnQmxCLFlBQ2lCLGFBQThDLEVBQ3ZDLG9CQUE0RCxFQUNqRSxlQUFrRCxFQUM3QyxxQkFBNkQ7WUFFcEYsS0FBSyxFQUFFLENBQUM7WUFMeUIsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBQ3RCLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDaEQsb0JBQWUsR0FBZixlQUFlLENBQWtCO1lBQzVCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFsQnBFLFVBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksMkJBQWUsRUFBRSxDQUFDLENBQUM7WUFFOUMsYUFBUSxHQUFrQjtnQkFDMUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsRUFBRSwwQkFBUSxDQUFDLEtBQUssRUFBRSx3QkFBYyxDQUFDLEtBQUssQ0FBQztnQkFDakcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsRUFBRSwwQkFBUSxDQUFDLE9BQU8sRUFBRSx3QkFBYyxDQUFDLE9BQU8sQ0FBQztnQkFDckcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxxQkFBcUIsQ0FBQztnQkFDL0QsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxxQkFBcUIsQ0FBQzthQUMvRCxDQUFDO1lBRWUsbUJBQWMsR0FBRyxJQUFJLHNCQUFjLENBQWlDLENB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