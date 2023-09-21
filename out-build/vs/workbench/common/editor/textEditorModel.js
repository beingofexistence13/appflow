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
define(["require", "exports", "vs/workbench/common/editor/editorModel", "vs/editor/common/languages/language", "vs/editor/common/services/model", "vs/base/common/lifecycle", "vs/editor/common/languages/modesRegistry", "vs/workbench/services/languageDetection/common/languageDetectionWorkerService", "vs/base/common/async", "vs/platform/accessibility/common/accessibility", "vs/nls!vs/workbench/common/editor/textEditorModel"], function (require, exports, editorModel_1, language_1, model_1, lifecycle_1, modesRegistry_1, languageDetectionWorkerService_1, async_1, accessibility_1, nls_1) {
    "use strict";
    var $DA_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$DA = void 0;
    /**
     * The base text editor model leverages the code editor model. This class is only intended to be subclassed and not instantiated.
     */
    let $DA = class $DA extends editorModel_1.$xA {
        static { $DA_1 = this; }
        static { this.a = 600; }
        constructor(r, s, t, u, textEditorModelHandle) {
            super();
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.b = undefined;
            this.m = this.B(new lifecycle_1.$lc());
            this.n = this.B(new async_1.$Eg($DA_1.a));
            this.z = false;
            if (textEditorModelHandle) {
                this.w(textEditorModelHandle);
            }
        }
        w(textEditorModelHandle) {
            // We need the resource to point to an existing model
            const model = this.r.getModel(textEditorModelHandle);
            if (!model) {
                throw new Error(`Document with resource ${textEditorModelHandle.toString(true)} does not exist`);
            }
            this.b = textEditorModelHandle;
            // Make sure we clean up when this model gets disposed
            this.y(model);
        }
        y(model) {
            this.m.value = model.onWillDispose(() => {
                this.b = undefined; // make sure we do not dispose code editor model again
                this.dispose();
            });
        }
        get textEditorModel() {
            return this.b ? this.r.getModel(this.b) : null;
        }
        isReadonly() {
            return true;
        }
        get hasLanguageSetExplicitly() { return this.z; }
        setLanguageId(languageId, source) {
            // Remember that an explicit language was set
            this.z = true;
            this.C(languageId, source);
        }
        C(languageId, source) {
            if (!this.isResolved()) {
                return;
            }
            if (!languageId || languageId === this.textEditorModel.getLanguageId()) {
                return;
            }
            this.textEditorModel.setLanguage(this.s.createById(languageId), source);
        }
        D(model) {
            // Setup listener for lower level language changes
            const disposable = this.B(model.onDidChangeLanguage((e) => {
                if (e.source === languageDetectionWorkerService_1.$AA) {
                    return;
                }
                this.z = true;
                disposable.dispose();
            }));
        }
        getLanguageId() {
            return this.textEditorModel?.getLanguageId();
        }
        F() {
            return this.n.trigger(() => this.G());
        }
        async G() {
            if (this.hasLanguageSetExplicitly || // skip detection when the user has made an explicit choice on the language
                !this.b || // require a URI to run the detection for
                !this.t.isEnabledForLanguage(this.getLanguageId() ?? modesRegistry_1.$Yt) // require a valid language that is enlisted for detection
            ) {
                return;
            }
            const lang = await this.t.detectLanguage(this.b);
            const prevLang = this.getLanguageId();
            if (lang && lang !== prevLang && !this.isDisposed()) {
                this.C(lang, languageDetectionWorkerService_1.$AA);
                const languageName = this.s.getLanguageName(lang);
                this.u.alert((0, nls_1.localize)(0, null, languageName ?? lang));
            }
        }
        /**
         * Creates the text editor model with the provided value, optional preferred language
         * (can be comma separated for multiple values) and optional resource URL.
         */
        H(value, resource, preferredLanguageId) {
            const firstLineText = this.J(value);
            const languageSelection = this.L(resource, this.s, preferredLanguageId, firstLineText);
            return this.I(value, languageSelection, resource);
        }
        I(value, languageSelection, resource) {
            let model = resource && this.r.getModel(resource);
            if (!model) {
                model = this.r.createModel(value, languageSelection, resource);
                this.g = true;
                // Make sure we clean up when this model gets disposed
                this.y(model);
            }
            else {
                this.updateTextEditorModel(value, languageSelection.languageId);
            }
            this.b = model.uri;
            return model;
        }
        J(value) {
            // text buffer factory
            const textBufferFactory = value;
            if (typeof textBufferFactory.getFirstLineText === 'function') {
                return textBufferFactory.getFirstLineText(1000 /* ModelConstants.FIRST_LINE_DETECTION_LENGTH_LIMIT */);
            }
            // text model
            const textSnapshot = value;
            return textSnapshot.getLineContent(1).substr(0, 1000 /* ModelConstants.FIRST_LINE_DETECTION_LENGTH_LIMIT */);
        }
        /**
         * Gets the language for the given identifier. Subclasses can override to provide their own implementation of this lookup.
         *
         * @param firstLineText optional first line of the text buffer to set the language on. This can be used to guess a language from content.
         */
        L(resource, languageService, preferredLanguage, firstLineText) {
            // lookup language via resource path if the provided language is unspecific
            if (!preferredLanguage || preferredLanguage === modesRegistry_1.$Yt) {
                return languageService.createByFilepathOrFirstLine(resource ?? null, firstLineText);
            }
            // otherwise take the preferred language for granted
            return languageService.createById(preferredLanguage);
        }
        /**
         * Updates the text editor model with the provided value. If the value is the same as the model has, this is a no-op.
         */
        updateTextEditorModel(newValue, preferredLanguageId) {
            if (!this.isResolved()) {
                return;
            }
            // contents
            if (newValue) {
                this.r.updateModel(this.textEditorModel, newValue);
            }
            // language (only if specific and changed)
            if (preferredLanguageId && preferredLanguageId !== modesRegistry_1.$Yt && this.textEditorModel.getLanguageId() !== preferredLanguageId) {
                this.textEditorModel.setLanguage(this.s.createById(preferredLanguageId));
            }
        }
        createSnapshot() {
            if (!this.textEditorModel) {
                return null;
            }
            return this.textEditorModel.createSnapshot(true /* preserve BOM */);
        }
        isResolved() {
            return !!this.b;
        }
        dispose() {
            this.m.dispose(); // dispose this first because it will trigger another dispose() otherwise
            if (this.b && this.g) {
                this.r.destroyModel(this.b);
            }
            this.b = undefined;
            this.g = false;
            super.dispose();
        }
    };
    exports.$DA = $DA;
    exports.$DA = $DA = $DA_1 = __decorate([
        __param(0, model_1.$yA),
        __param(1, language_1.$ct),
        __param(2, languageDetectionWorkerService_1.$zA),
        __param(3, accessibility_1.$1r)
    ], $DA);
});
//# sourceMappingURL=textEditorModel.js.map