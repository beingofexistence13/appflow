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
define(["require", "exports", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/color", "vs/base/common/lifecycle", "vs/editor/common/core/range", "vs/editor/contrib/colorPicker/browser/color", "vs/editor/contrib/colorPicker/browser/colorDetector", "vs/editor/contrib/colorPicker/browser/colorPickerModel", "vs/editor/contrib/colorPicker/browser/colorPickerWidget", "vs/platform/theme/common/themeService", "vs/base/browser/dom"], function (require, exports, async_1, cancellation_1, color_1, lifecycle_1, range_1, color_2, colorDetector_1, colorPickerModel_1, colorPickerWidget_1, themeService_1, dom_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StandaloneColorPickerParticipant = exports.StandaloneColorPickerHover = exports.ColorHoverParticipant = exports.ColorHover = void 0;
    class ColorHover {
        constructor(owner, range, model, provider) {
            this.owner = owner;
            this.range = range;
            this.model = model;
            this.provider = provider;
            /**
             * Force the hover to always be rendered at this specific range,
             * even in the case of multiple hover parts.
             */
            this.forceShowAtRange = true;
        }
        isValidForHoverAnchor(anchor) {
            return (anchor.type === 1 /* HoverAnchorType.Range */
                && this.range.startColumn <= anchor.range.startColumn
                && this.range.endColumn >= anchor.range.endColumn);
        }
    }
    exports.ColorHover = ColorHover;
    let ColorHoverParticipant = class ColorHoverParticipant {
        constructor(_editor, _themeService) {
            this._editor = _editor;
            this._themeService = _themeService;
            this.hoverOrdinal = 2;
        }
        computeSync(_anchor, _lineDecorations) {
            return [];
        }
        computeAsync(anchor, lineDecorations, token) {
            return async_1.AsyncIterableObject.fromPromise(this._computeAsync(anchor, lineDecorations, token));
        }
        async _computeAsync(_anchor, lineDecorations, _token) {
            if (!this._editor.hasModel()) {
                return [];
            }
            const colorDetector = colorDetector_1.ColorDetector.get(this._editor);
            if (!colorDetector) {
                return [];
            }
            for (const d of lineDecorations) {
                if (!colorDetector.isColorDecoration(d)) {
                    continue;
                }
                const colorData = colorDetector.getColorData(d.range.getStartPosition());
                if (colorData) {
                    const colorHover = await _createColorHover(this, this._editor.getModel(), colorData.colorInfo, colorData.provider);
                    return [colorHover];
                }
            }
            return [];
        }
        renderHoverParts(context, hoverParts) {
            return renderHoverParts(this, this._editor, this._themeService, hoverParts, context);
        }
    };
    exports.ColorHoverParticipant = ColorHoverParticipant;
    exports.ColorHoverParticipant = ColorHoverParticipant = __decorate([
        __param(1, themeService_1.IThemeService)
    ], ColorHoverParticipant);
    class StandaloneColorPickerHover {
        constructor(owner, range, model, provider) {
            this.owner = owner;
            this.range = range;
            this.model = model;
            this.provider = provider;
        }
    }
    exports.StandaloneColorPickerHover = StandaloneColorPickerHover;
    let StandaloneColorPickerParticipant = class StandaloneColorPickerParticipant {
        constructor(_editor, _themeService) {
            this._editor = _editor;
            this._themeService = _themeService;
            this.hoverOrdinal = 2;
            this._color = null;
        }
        async createColorHover(defaultColorInfo, defaultColorProvider, colorProviderRegistry) {
            if (!this._editor.hasModel()) {
                return null;
            }
            const colorDetector = colorDetector_1.ColorDetector.get(this._editor);
            if (!colorDetector) {
                return null;
            }
            const colors = await (0, color_2.getColors)(colorProviderRegistry, this._editor.getModel(), cancellation_1.CancellationToken.None);
            let foundColorInfo = null;
            let foundColorProvider = null;
            for (const colorData of colors) {
                const colorInfo = colorData.colorInfo;
                if (range_1.Range.containsRange(colorInfo.range, defaultColorInfo.range)) {
                    foundColorInfo = colorInfo;
                    foundColorProvider = colorData.provider;
                }
            }
            const colorInfo = foundColorInfo ?? defaultColorInfo;
            const colorProvider = foundColorProvider ?? defaultColorProvider;
            const foundInEditor = !!foundColorInfo;
            return { colorHover: await _createColorHover(this, this._editor.getModel(), colorInfo, colorProvider), foundInEditor: foundInEditor };
        }
        async updateEditorModel(colorHoverData) {
            if (!this._editor.hasModel()) {
                return;
            }
            const colorPickerModel = colorHoverData.model;
            let range = new range_1.Range(colorHoverData.range.startLineNumber, colorHoverData.range.startColumn, colorHoverData.range.endLineNumber, colorHoverData.range.endColumn);
            if (this._color) {
                await _updateColorPresentations(this._editor.getModel(), colorPickerModel, this._color, range, colorHoverData);
                range = _updateEditorModel(this._editor, range, colorPickerModel);
            }
        }
        renderHoverParts(context, hoverParts) {
            return renderHoverParts(this, this._editor, this._themeService, hoverParts, context);
        }
        set color(color) {
            this._color = color;
        }
        get color() {
            return this._color;
        }
    };
    exports.StandaloneColorPickerParticipant = StandaloneColorPickerParticipant;
    exports.StandaloneColorPickerParticipant = StandaloneColorPickerParticipant = __decorate([
        __param(1, themeService_1.IThemeService)
    ], StandaloneColorPickerParticipant);
    async function _createColorHover(participant, editorModel, colorInfo, provider) {
        const originalText = editorModel.getValueInRange(colorInfo.range);
        const { red, green, blue, alpha } = colorInfo.color;
        const rgba = new color_1.RGBA(Math.round(red * 255), Math.round(green * 255), Math.round(blue * 255), alpha);
        const color = new color_1.Color(rgba);
        const colorPresentations = await (0, color_2.getColorPresentations)(editorModel, colorInfo, provider, cancellation_1.CancellationToken.None);
        const model = new colorPickerModel_1.ColorPickerModel(color, [], 0);
        model.colorPresentations = colorPresentations || [];
        model.guessColorPresentation(color, originalText);
        if (participant instanceof ColorHoverParticipant) {
            return new ColorHover(participant, range_1.Range.lift(colorInfo.range), model, provider);
        }
        else {
            return new StandaloneColorPickerHover(participant, range_1.Range.lift(colorInfo.range), model, provider);
        }
    }
    function renderHoverParts(participant, editor, themeService, hoverParts, context) {
        if (hoverParts.length === 0 || !editor.hasModel()) {
            return lifecycle_1.Disposable.None;
        }
        if (context.setMinimumDimensions) {
            const minimumHeight = editor.getOption(66 /* EditorOption.lineHeight */) + 8;
            context.setMinimumDimensions(new dom_1.Dimension(302, minimumHeight));
        }
        const disposables = new lifecycle_1.DisposableStore();
        const colorHover = hoverParts[0];
        const editorModel = editor.getModel();
        const model = colorHover.model;
        const widget = disposables.add(new colorPickerWidget_1.ColorPickerWidget(context.fragment, model, editor.getOption(141 /* EditorOption.pixelRatio */), themeService, participant instanceof StandaloneColorPickerParticipant));
        context.setColorPicker(widget);
        let editorUpdatedByColorPicker = false;
        let range = new range_1.Range(colorHover.range.startLineNumber, colorHover.range.startColumn, colorHover.range.endLineNumber, colorHover.range.endColumn);
        if (participant instanceof StandaloneColorPickerParticipant) {
            const color = hoverParts[0].model.color;
            participant.color = color;
            _updateColorPresentations(editorModel, model, color, range, colorHover);
            disposables.add(model.onColorFlushed((color) => {
                participant.color = color;
            }));
        }
        else {
            disposables.add(model.onColorFlushed(async (color) => {
                await _updateColorPresentations(editorModel, model, color, range, colorHover);
                editorUpdatedByColorPicker = true;
                range = _updateEditorModel(editor, range, model, context);
            }));
        }
        disposables.add(model.onDidChangeColor((color) => {
            _updateColorPresentations(editorModel, model, color, range, colorHover);
        }));
        disposables.add(editor.onDidChangeModelContent((e) => {
            if (editorUpdatedByColorPicker) {
                editorUpdatedByColorPicker = false;
            }
            else {
                context.hide();
                editor.focus();
            }
        }));
        return disposables;
    }
    function _updateEditorModel(editor, range, model, context) {
        let textEdits;
        let newRange;
        if (model.presentation.textEdit) {
            textEdits = [model.presentation.textEdit];
            newRange = new range_1.Range(model.presentation.textEdit.range.startLineNumber, model.presentation.textEdit.range.startColumn, model.presentation.textEdit.range.endLineNumber, model.presentation.textEdit.range.endColumn);
            const trackedRange = editor.getModel()._setTrackedRange(null, newRange, 3 /* TrackedRangeStickiness.GrowsOnlyWhenTypingAfter */);
            editor.pushUndoStop();
            editor.executeEdits('colorpicker', textEdits);
            newRange = editor.getModel()._getTrackedRange(trackedRange) || newRange;
        }
        else {
            textEdits = [{ range, text: model.presentation.label, forceMoveMarkers: false }];
            newRange = range.setEndPosition(range.endLineNumber, range.startColumn + model.presentation.label.length);
            editor.pushUndoStop();
            editor.executeEdits('colorpicker', textEdits);
        }
        if (model.presentation.additionalTextEdits) {
            textEdits = [...model.presentation.additionalTextEdits];
            editor.executeEdits('colorpicker', textEdits);
            if (context) {
                context.hide();
            }
        }
        editor.pushUndoStop();
        return newRange;
    }
    async function _updateColorPresentations(editorModel, colorPickerModel, color, range, colorHover) {
        const colorPresentations = await (0, color_2.getColorPresentations)(editorModel, {
            range: range,
            color: {
                red: color.rgba.r / 255,
                green: color.rgba.g / 255,
                blue: color.rgba.b / 255,
                alpha: color.rgba.a
            }
        }, colorHover.provider, cancellation_1.CancellationToken.None);
        colorPickerModel.colorPresentations = colorPresentations || [];
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3JIb3ZlclBhcnRpY2lwYW50LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvY29sb3JQaWNrZXIvYnJvd3Nlci9jb2xvckhvdmVyUGFydGljaXBhbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBcUJoRyxNQUFhLFVBQVU7UUFRdEIsWUFDaUIsS0FBMEMsRUFDMUMsS0FBWSxFQUNaLEtBQXVCLEVBQ3ZCLFFBQStCO1lBSC9CLFVBQUssR0FBTCxLQUFLLENBQXFDO1lBQzFDLFVBQUssR0FBTCxLQUFLLENBQU87WUFDWixVQUFLLEdBQUwsS0FBSyxDQUFrQjtZQUN2QixhQUFRLEdBQVIsUUFBUSxDQUF1QjtZQVZoRDs7O2VBR0c7WUFDYSxxQkFBZ0IsR0FBWSxJQUFJLENBQUM7UUFPN0MsQ0FBQztRQUVFLHFCQUFxQixDQUFDLE1BQW1CO1lBQy9DLE9BQU8sQ0FDTixNQUFNLENBQUMsSUFBSSxrQ0FBMEI7bUJBQ2xDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBVzttQkFDbEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQ2pELENBQUM7UUFDSCxDQUFDO0tBQ0Q7SUF0QkQsZ0NBc0JDO0lBRU0sSUFBTSxxQkFBcUIsR0FBM0IsTUFBTSxxQkFBcUI7UUFJakMsWUFDa0IsT0FBb0IsRUFDdEIsYUFBNkM7WUFEM0MsWUFBTyxHQUFQLE9BQU8sQ0FBYTtZQUNMLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1lBSjdDLGlCQUFZLEdBQVcsQ0FBQyxDQUFDO1FBS3JDLENBQUM7UUFFRSxXQUFXLENBQUMsT0FBb0IsRUFBRSxnQkFBb0M7WUFDNUUsT0FBTyxFQUFFLENBQUM7UUFDWCxDQUFDO1FBRU0sWUFBWSxD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