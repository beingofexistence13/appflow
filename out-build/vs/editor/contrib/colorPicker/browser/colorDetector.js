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
    var $e3_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$f3 = exports.$e3 = exports.$d3 = void 0;
    exports.$d3 = Object.create({});
    let $e3 = class $e3 extends lifecycle_1.$kc {
        static { $e3_1 = this; }
        static { this.ID = 'editor.contrib.colorDetector'; }
        static { this.RECOMPUTE_TIME = 1000; } // ms
        constructor(C, D, F, languageFeatureDebounceService) {
            super();
            this.C = C;
            this.D = D;
            this.F = F;
            this.f = this.B(new lifecycle_1.$jc());
            this.n = [];
            this.s = new Map();
            this.t = this.C.createDecorationsCollection();
            this.y = new editorDom_1.$vW(this.C);
            this.z = new $f3();
            this.L = this.B(new lifecycle_1.$jc());
            this.m = languageFeatureDebounceService.for(F.colorProvider, 'Document Colors', { min: $e3_1.RECOMPUTE_TIME });
            this.B(C.onDidChangeModel(() => {
                this.u = this.isEnabled();
                this.G();
            }));
            this.B(C.onDidChangeModelLanguage(() => this.G()));
            this.B(F.colorProvider.onDidChange(() => this.G()));
            this.B(C.onDidChangeConfiguration((e) => {
                const prevIsEnabled = this.u;
                this.u = this.isEnabled();
                this.w = this.C.getOption(145 /* EditorOption.defaultColorDecorators */);
                const updatedColorDecoratorsSetting = prevIsEnabled !== this.u || e.hasChanged(21 /* EditorOption.colorDecoratorsLimit */);
                const updatedDefaultColorDecoratorsSetting = e.hasChanged(145 /* EditorOption.defaultColorDecorators */);
                if (updatedColorDecoratorsSetting || updatedDefaultColorDecoratorsSetting) {
                    if (this.u) {
                        this.G();
                    }
                    else {
                        this.N();
                    }
                }
            }));
            this.j = null;
            this.h = null;
            this.u = this.isEnabled();
            this.w = this.C.getOption(145 /* EditorOption.defaultColorDecorators */);
            this.G();
        }
        isEnabled() {
            const model = this.C.getModel();
            if (!model) {
                return false;
            }
            const languageId = model.getLanguageId();
            // handle deprecated settings. [languageId].colorDecorators.enable
            const deprecatedConfig = this.D.getValue(languageId);
            if (deprecatedConfig && typeof deprecatedConfig === 'object') {
                const colorDecorators = deprecatedConfig['colorDecorators']; // deprecatedConfig.valueOf('.colorDecorators.enable');
                if (colorDecorators && colorDecorators['enable'] !== undefined && !colorDecorators['enable']) {
                    return colorDecorators['enable'];
                }
            }
            return this.C.getOption(20 /* EditorOption.colorDecorators */);
        }
        get limitReporter() {
            return this.z;
        }
        static get(editor) {
            return editor.getContribution(this.ID);
        }
        dispose() {
            this.I();
            this.N();
            super.dispose();
        }
        G() {
            this.I();
            if (!this.u) {
                return;
            }
            const model = this.C.getModel();
            if (!model || !this.F.colorProvider.has(model)) {
                return;
            }
            this.f.add(this.C.onDidChangeModelContent(() => {
                if (!this.j) {
                    this.j = new async_1.$Qg();
                    this.j.cancelAndSet(() => {
                        this.j = null;
                        this.H();
                    }, this.m.get(model));
                }
            }));
            this.H();
        }
        async H() {
            this.h = (0, async_1.$ug)(async (token) => {
                const model = this.C.getModel();
                if (!model) {
                    return [];
                }
                const sw = new stopwatch_1.$bd(false);
                const colors = await (0, color_2.$b3)(this.F.colorProvider, model, token, this.w);
                this.m.update(model, sw.elapsed());
                return colors;
            });
            try {
                const colors = await this.h;
                this.J(colors);
                this.M(colors);
                this.h = null;
            }
            catch (e) {
                (0, errors_1.$Y)(e);
            }
        }
        I() {
            if (this.j) {
                this.j.cancel();
                this.j = null;
            }
            if (this.h) {
                this.h.cancel();
                this.h = null;
            }
            this.f.clear();
        }
        J(colorDatas) {
            const decorations = colorDatas.map(c => ({
                range: {
                    startLineNumber: c.colorInfo.range.startLineNumber,
                    startColumn: c.colorInfo.range.startColumn,
                    endLineNumber: c.colorInfo.range.endLineNumber,
                    endColumn: c.colorInfo.range.endColumn
                },
                options: textModel_1.$RC.EMPTY
            }));
            this.C.changeDecorations((changeAccessor) => {
                this.n = changeAccessor.deltaDecorations(this.n, decorations);
                this.s = new Map();
                this.n.forEach((id, i) => this.s.set(id, colorDatas[i]));
            });
        }
        M(colorData) {
            this.L.clear();
            const decorations = [];
            const limit = this.C.getOption(21 /* EditorOption.colorDecoratorsLimit */);
            for (let i = 0; i < colorData.length && decorations.length < limit; i++) {
                const { red, green, blue, alpha } = colorData[i].colorInfo.color;
                const rgba = new color_1.$Ls(Math.round(red * 255), Math.round(green * 255), Math.round(blue * 255), alpha);
                const color = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
                const ref = this.L.add(this.y.createClassNameRef({
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
                            content: strings_1.$gf,
                            inlineClassName: `${ref.className} colorpicker-color-decoration`,
                            inlineClassNameAffectsLetterSpacing: true,
                            attachedData: exports.$d3
                        }
                    }
                });
            }
            const limited = limit < colorData.length ? limit : false;
            this.z.update(colorData.length, limited);
            this.t.set(decorations);
        }
        N() {
            this.C.removeDecorations(this.n);
            this.n = [];
            this.t.clear();
            this.L.clear();
        }
        getColorData(position) {
            const model = this.C.getModel();
            if (!model) {
                return null;
            }
            const decorations = model
                .getDecorationsInRange(range_1.$ks.fromPositions(position, position))
                .filter(d => this.s.has(d.id));
            if (decorations.length === 0) {
                return null;
            }
            return this.s.get(decorations[0].id);
        }
        isColorDecoration(decoration) {
            return this.t.has(decoration);
        }
    };
    exports.$e3 = $e3;
    exports.$e3 = $e3 = $e3_1 = __decorate([
        __param(1, configuration_1.$8h),
        __param(2, languageFeatures_1.$hF),
        __param(3, languageFeatureDebounce_1.$52)
    ], $e3);
    class $f3 {
        constructor() {
            this.f = new event_1.$fd();
            this.onDidChange = this.f.event;
            this.h = 0;
            this.j = false;
        }
        get computed() {
            return this.h;
        }
        get limited() {
            return this.j;
        }
        update(computed, limited) {
            if (computed !== this.h || limited !== this.j) {
                this.h = computed;
                this.j = limited;
                this.f.fire();
            }
        }
    }
    exports.$f3 = $f3;
    (0, editorExtensions_1.$AV)($e3.ID, $e3, 1 /* EditorContributionInstantiation.AfterFirstRender */);
});
//# sourceMappingURL=colorDetector.js.map