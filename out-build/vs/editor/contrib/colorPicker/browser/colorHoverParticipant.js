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
    exports.$r3 = exports.$q3 = exports.$p3 = exports.$o3 = void 0;
    class $o3 {
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
    exports.$o3 = $o3;
    let $p3 = class $p3 {
        constructor(c, f) {
            this.c = c;
            this.f = f;
            this.hoverOrdinal = 2;
        }
        computeSync(_anchor, _lineDecorations) {
            return [];
        }
        computeAsync(anchor, lineDecorations, token) {
            return async_1.$3g.fromPromise(this.h(anchor, lineDecorations, token));
        }
        async h(_anchor, lineDecorations, _token) {
            if (!this.c.hasModel()) {
                return [];
            }
            const colorDetector = colorDetector_1.$e3.get(this.c);
            if (!colorDetector) {
                return [];
            }
            for (const d of lineDecorations) {
                if (!colorDetector.isColorDecoration(d)) {
                    continue;
                }
                const colorData = colorDetector.getColorData(d.range.getStartPosition());
                if (colorData) {
                    const colorHover = await _createColorHover(this, this.c.getModel(), colorData.colorInfo, colorData.provider);
                    return [colorHover];
                }
            }
            return [];
        }
        renderHoverParts(context, hoverParts) {
            return renderHoverParts(this, this.c, this.f, hoverParts, context);
        }
    };
    exports.$p3 = $p3;
    exports.$p3 = $p3 = __decorate([
        __param(1, themeService_1.$gv)
    ], $p3);
    class $q3 {
        constructor(owner, range, model, provider) {
            this.owner = owner;
            this.range = range;
            this.model = model;
            this.provider = provider;
        }
    }
    exports.$q3 = $q3;
    let $r3 = class $r3 {
        constructor(f, h) {
            this.f = f;
            this.h = h;
            this.hoverOrdinal = 2;
            this.c = null;
        }
        async createColorHover(defaultColorInfo, defaultColorProvider, colorProviderRegistry) {
            if (!this.f.hasModel()) {
                return null;
            }
            const colorDetector = colorDetector_1.$e3.get(this.f);
            if (!colorDetector) {
                return null;
            }
            const colors = await (0, color_2.$b3)(colorProviderRegistry, this.f.getModel(), cancellation_1.CancellationToken.None);
            let foundColorInfo = null;
            let foundColorProvider = null;
            for (const colorData of colors) {
                const colorInfo = colorData.colorInfo;
                if (range_1.$ks.containsRange(colorInfo.range, defaultColorInfo.range)) {
                    foundColorInfo = colorInfo;
                    foundColorProvider = colorData.provider;
                }
            }
            const colorInfo = foundColorInfo ?? defaultColorInfo;
            const colorProvider = foundColorProvider ?? defaultColorProvider;
            const foundInEditor = !!foundColorInfo;
            return { colorHover: await _createColorHover(this, this.f.getModel(), colorInfo, colorProvider), foundInEditor: foundInEditor };
        }
        async updateEditorModel(colorHoverData) {
            if (!this.f.hasModel()) {
                return;
            }
            const colorPickerModel = colorHoverData.model;
            let range = new range_1.$ks(colorHoverData.range.startLineNumber, colorHoverData.range.startColumn, colorHoverData.range.endLineNumber, colorHoverData.range.endColumn);
            if (this.c) {
                await _updateColorPresentations(this.f.getModel(), colorPickerModel, this.c, range, colorHoverData);
                range = _updateEditorModel(this.f, range, colorPickerModel);
            }
        }
        renderHoverParts(context, hoverParts) {
            return renderHoverParts(this, this.f, this.h, hoverParts, context);
        }
        set color(color) {
            this.c = color;
        }
        get color() {
            return this.c;
        }
    };
    exports.$r3 = $r3;
    exports.$r3 = $r3 = __decorate([
        __param(1, themeService_1.$gv)
    ], $r3);
    async function _createColorHover(participant, editorModel, colorInfo, provider) {
        const originalText = editorModel.getValueInRange(colorInfo.range);
        const { red, green, blue, alpha } = colorInfo.color;
        const rgba = new color_1.$Ls(Math.round(red * 255), Math.round(green * 255), Math.round(blue * 255), alpha);
        const color = new color_1.$Os(rgba);
        const colorPresentations = await (0, color_2.$c3)(editorModel, colorInfo, provider, cancellation_1.CancellationToken.None);
        const model = new colorPickerModel_1.$g3(color, [], 0);
        model.colorPresentations = colorPresentations || [];
        model.guessColorPresentation(color, originalText);
        if (participant instanceof $p3) {
            return new $o3(participant, range_1.$ks.lift(colorInfo.range), model, provider);
        }
        else {
            return new $q3(participant, range_1.$ks.lift(colorInfo.range), model, provider);
        }
    }
    function renderHoverParts(participant, editor, themeService, hoverParts, context) {
        if (hoverParts.length === 0 || !editor.hasModel()) {
            return lifecycle_1.$kc.None;
        }
        if (context.setMinimumDimensions) {
            const minimumHeight = editor.getOption(66 /* EditorOption.lineHeight */) + 8;
            context.setMinimumDimensions(new dom_1.$BO(302, minimumHeight));
        }
        const disposables = new lifecycle_1.$jc();
        const colorHover = hoverParts[0];
        const editorModel = editor.getModel();
        const model = colorHover.model;
        const widget = disposables.add(new colorPickerWidget_1.$n3(context.fragment, model, editor.getOption(141 /* EditorOption.pixelRatio */), themeService, participant instanceof $r3));
        context.setColorPicker(widget);
        let editorUpdatedByColorPicker = false;
        let range = new range_1.$ks(colorHover.range.startLineNumber, colorHover.range.startColumn, colorHover.range.endLineNumber, colorHover.range.endColumn);
        if (participant instanceof $r3) {
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
            newRange = new range_1.$ks(model.presentation.textEdit.range.startLineNumber, model.presentation.textEdit.range.startColumn, model.presentation.textEdit.range.endLineNumber, model.presentation.textEdit.range.endColumn);
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
        const colorPresentations = await (0, color_2.$c3)(editorModel, {
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
//# sourceMappingURL=colorHoverParticipant.js.map