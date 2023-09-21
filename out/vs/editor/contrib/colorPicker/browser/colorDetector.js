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
define(["require", "exports", "vs/base/common/async", "vs/base/common/color", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/stopwatch", "vs/base/common/strings", "vs/editor/browser/editorDom", "vs/editor/browser/editorExtensions", "vs/editor/common/core/range", "vs/editor/common/model/textModel", "vs/editor/common/services/languageFeatureDebounce", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/colorPicker/browser/color", "vs/platform/configuration/common/configuration"], function (require, exports, async_1, color_1, errors_1, event_1, lifecycle_1, stopwatch_1, strings_1, editorDom_1, editorExtensions_1, range_1, textModel_1, languageFeatureDebounce_1, languageFeatures_1, color_2, configuration_1) {
    "use strict";
    var ColorDetector_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DecoratorLimitReporter = exports.ColorDetector = exports.ColorDecorationInjectedTextMarker = void 0;
    exports.ColorDecorationInjectedTextMarker = Object.create({});
    let ColorDetector = class ColorDetector extends lifecycle_1.Disposable {
        static { ColorDetector_1 = this; }
        static { this.ID = 'editor.contrib.colorDetector'; }
        static { this.RECOMPUTE_TIME = 1000; } // ms
        constructor(_editor, _configurationService, _languageFeaturesService, languageFeatureDebounceService) {
            super();
            this._editor = _editor;
            this._configurationService = _configurationService;
            this._languageFeaturesService = _languageFeaturesService;
            this._localToDispose = this._register(new lifecycle_1.DisposableStore());
            this._decorationsIds = [];
            this._colorDatas = new Map();
            this._colorDecoratorIds = this._editor.createDecorationsCollection();
            this._ruleFactory = new editorDom_1.DynamicCssRules(this._editor);
            this._decoratorLimitReporter = new DecoratorLimitReporter();
            this._colorDecorationClassRefs = this._register(new lifecycle_1.DisposableStore());
            this._debounceInformation = languageFeatureDebounceService.for(_languageFeaturesService.colorProvider, 'Document Colors', { min: ColorDetector_1.RECOMPUTE_TIME });
            this._register(_editor.onDidChangeModel(() => {
                this._isColorDecoratorsEnabled = this.isEnabled();
                this.updateColors();
            }));
            this._register(_editor.onDidChangeModelLanguage(() => this.updateColors()));
            this._register(_languageFeaturesService.colorProvider.onDidChange(() => this.updateColors()));
            this._register(_editor.onDidChangeConfiguration((e) => {
                const prevIsEnabled = this._isColorDecoratorsEnabled;
                this._isColorDecoratorsEnabled = this.isEnabled();
                this._isDefaultColorDecoratorsEnabled = this._editor.getOption(145 /* EditorOption.defaultColorDecorators */);
                const updatedColorDecoratorsSetting = prevIsEnabled !== this._isColorDecoratorsEnabled || e.hasChanged(21 /* EditorOption.colorDecoratorsLimit */);
                const updatedDefaultColorDecoratorsSetting = e.hasChanged(145 /* EditorOption.defaultColorDecorators */);
                if (updatedColorDecoratorsSetting || updatedDefaultColorDecoratorsSetting) {
                    if (this._isColorDecoratorsEnabled) {
                        this.updateColors();
                    }
                    else {
                        this.removeAllDecorations();
                    }
                }
            }));
            this._timeoutTimer = null;
            this._computePromise = null;
            this._isColorDecoratorsEnabled = this.isEnabled();
            this._isDefaultColorDecoratorsEnabled = this._editor.getOption(145 /* EditorOption.defaultColorDecorators */);
            this.updateColors();
        }
        isEnabled() {
            const model = this._editor.getModel();
            if (!model) {
                return false;
            }
            const languageId = model.getLanguageId();
            // handle deprecated settings. [languageId].colorDecorators.enable
            const deprecatedConfig = this._configurationService.getValue(languageId);
            if (deprecatedConfig && typeof deprecatedConfig === 'object') {
                const colorDecorators = deprecatedConfig['colorDecorators']; // deprecatedConfig.valueOf('.colorDecorators.enable');
                if (colorDecorators && colorDecorators['enable'] !== undefined && !colorDecorators['enable']) {
                    return colorDecorators['enable'];
                }
            }
            return this._editor.getOption(20 /* EditorOption.colorDecorators */);
        }
        get limitReporter() {
            return this._decoratorLimitReporter;
        }
        static get(editor) {
            return editor.getContribution(this.ID);
        }
        dispose() {
            this.stop();
            this.removeAllDecorations();
            super.dispose();
        }
        updateColors() {
            this.stop();
            if (!this._isColorDecoratorsEnabled) {
                return;
            }
            const model = this._editor.getModel();
            if (!model || !this._languageFeaturesService.colorProvider.has(model)) {
                return;
            }
            this._localToDispose.add(this._editor.onDidChangeModelContent(() => {
                if (!this._timeoutTimer) {
                    this._timeoutTimer = new async_1.TimeoutTimer();
                    this._timeoutTimer.cancelAndSet(() => {
                        this._timeoutTimer = null;
                        this.beginCompute();
                    }, this._debounceInformation.get(model));
                }
            }));
            this.beginCompute();
        }
        async beginCompute() {
            this._computePromise = (0, async_1.createCancelablePromise)(async (token) => {
                const model = this._editor.getModel();
                if (!model) {
                    return [];
                }
                const sw = new stopwatch_1.StopWatch(false);
                const colors = await (0, color_2.getColors)(this._languageFeaturesService.colorProvider, model, token, this._isDefaultColorDecoratorsEnabled);
                this._debounceInformation.update(model, sw.elapsed());
                return colors;
            });
            try {
                const colors = await this._computePromise;
                this.updateDecorations(colors);
                this.updateColorDecorators(colors);
                this._computePromise = null;
            }
            catch (e) {
                (0, errors_1.onUnexpectedError)(e);
            }
        }
        stop() {
            if (this._timeoutTimer) {
                this._timeoutTimer.cancel();
                this._timeoutTimer = null;
            }
            if (this._computePromise) {
                this._computePromise.cancel();
                this._computePromise = null;
            }
            this._localToDispose.clear();
        }
        updateDecorations(colorDatas) {
            const decorations = colorDatas.map(c => ({
                range: {
                    startLineNumber: c.colorInfo.range.startLineNumber,
                    startColumn: c.colorInfo.range.startColumn,
                    endLineNumber: c.colorInfo.range.endLineNumber,
                    endColumn: c.colorInfo.range.endColumn
                },
                options: textModel_1.ModelDecorationOptions.EMPTY
            }));
            this._editor.changeDecorations((changeAccessor) => {
                this._decorationsIds = changeAccessor.deltaDecorations(this._decorationsIds, decorations);
                this._colorDatas = new Map();
                this._decorationsIds.forEach((id, i) => this._colorDatas.set(id, colorDatas[i]));
            });
        }
        updateColorDecorators(colorData) {
            this._colorDecorationClassRefs.clear();
            const decorations = [];
            const limit = this._editor.getOption(21 /* EditorOption.colorDecoratorsLimit */);
            for (let i = 0; i < colorData.length && decorations.length < limit; i++) {
                const { red, green, blue, alpha } = colorData[i].colorInfo.color;
                const rgba = new color_1.RGBA(Math.round(red * 255), Math.round(green * 255), Math.round(blue * 255), alpha);
                const color = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
                const ref = this._colorDecorationClassRefs.add(this._ruleFactory.createClassNameRef({
                    backgroundColor: color
                }));
                decorations.push({
                    range: {
                        startLineNumber: colorData[i].colorInfo.range.startLineNumber,
                        startColumn: colorData[i].colorInfo.range.startColumn,
                        endLineNumber: colorData[i].colorInfo.range.endLineNumber,
                        endColumn: colorData[i].colorInfo.range.endColumn
                    },
                    options: {
                        description: 'colorDetector',
                        before: {
                            content: strings_1.noBreakWhitespace,
                            inlineClassName: `${ref.className} colorpicker-color-decoration`,
                            inlineClassNameAffectsLetterSpacing: true,
                            attachedData: exports.ColorDecorationInjectedTextMarker
                        }
                    }
                });
            }
            const limited = limit < colorData.length ? limit : false;
            this._decoratorLimitReporter.update(colorData.length, limited);
            this._colorDecoratorIds.set(decorations);
        }
        removeAllDecorations() {
            this._editor.removeDecorations(this._decorationsIds);
            this._decorationsIds = [];
            this._colorDecoratorIds.clear();
            this._colorDecorationClassRefs.clear();
        }
        getColorData(position) {
            const model = this._editor.getModel();
            if (!model) {
                return null;
            }
            const decorations = model
                .getDecorationsInRange(range_1.Range.fromPositions(position, position))
                .filter(d => this._colorDatas.has(d.id));
            if (decorations.length === 0) {
                return null;
            }
            return this._colorDatas.get(decorations[0].id);
        }
        isColorDecoration(decoration) {
            return this._colorDecoratorIds.has(decoration);
        }
    };
    exports.ColorDetector = ColorDetector;
    exports.ColorDetector = ColorDetector = ColorDetector_1 = __decorate([
        __param(1, configuration_1.IConfigurationService),
        __param(2, languageFeatures_1.ILanguageFeaturesService),
        __param(3, languageFeatureDebounce_1.ILanguageFeatureDebounceService)
    ], ColorDetector);
    class DecoratorLimitReporter {
        constructor() {
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this._computed = 0;
            this._limited = false;
        }
        get computed() {
            return this._computed;
        }
        get limited() {
            return this._limited;
        }
        update(computed, limited) {
            if (computed !== this._computed || limited !== this._limited) {
                this._computed = computed;
                this._limited = limited;
                this._onDidChange.fire();
            }
        }
    }
    exports.DecoratorLimitReporter = DecoratorLimitReporter;
    (0, editorExtensions_1.registerEditorContribution)(ColorDetector.ID, ColorDetector, 1 /* EditorContributionInstantiation.AfterFirstRender */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3JEZXRlY3Rvci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2NvbG9yUGlja2VyL2Jyb3dzZXIvY29sb3JEZXRlY3Rvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBdUJuRixRQUFBLGlDQUFpQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7SUFHNUQsSUFBTSxhQUFhLEdBQW5CLE1BQU0sYUFBYyxTQUFRLHNCQUFVOztpQkFFckIsT0FBRSxHQUFXLDhCQUE4QixBQUF6QyxDQUEwQztpQkFFbkQsbUJBQWMsR0FBRyxJQUFJLEFBQVAsQ0FBUSxHQUFDLEtBQUs7UUFtQjVDLFlBQ2tCLE9BQW9CLEVBQ2QscUJBQTZELEVBQzFELHdCQUFtRSxFQUM1RCw4QkFBK0Q7WUFFaEcsS0FBSyxFQUFFLENBQUM7WUFMUyxZQUFPLEdBQVAsT0FBTyxDQUFhO1lBQ0csMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQUN6Qyw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1lBcEI3RSxvQkFBZSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSwyQkFBZSxFQUFFLENBQUMsQ0FBQztZQUtqRSxvQkFBZSxHQUFhLEVBQUUsQ0FBQztZQUMvQixnQkFBVyxHQUFHLElBQUksR0FBRyxFQUFzQixDQUFDO1lBRW5DLHVCQUFrQixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsMkJBQTJCLEVBQUUsQ0FBQztZQUtoRSxpQkFBWSxHQUFHLElBQUksMkJBQWUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFakQsNEJBQXVCLEdBQUcsSUFBSSxzQkFBc0IsRUFBRSxDQUFDO1lBbUpoRSw4QkFBeUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksMkJBQWUsRUFBRSxDQUFDLENBQUM7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