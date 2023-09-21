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
define(["require", "exports", "vs/workbench/common/editor/editorModel", "vs/editor/common/languages/language", "vs/editor/common/services/model", "vs/base/common/lifecycle", "vs/editor/common/languages/modesRegistry", "vs/workbench/services/languageDetection/common/languageDetectionWorkerService", "vs/base/common/async", "vs/platform/accessibility/common/accessibility", "vs/nls"], function (require, exports, editorModel_1, language_1, model_1, lifecycle_1, modesRegistry_1, languageDetectionWorkerService_1, async_1, accessibility_1, nls_1) {
    "use strict";
    var BaseTextEditorModel_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BaseTextEditorModel = void 0;
    /**
     * The base text editor model leverages the code editor model. This class is only intended to be subclassed and not instantiated.
     */
    let BaseTextEditorModel = class BaseTextEditorModel extends editorModel_1.EditorModel {
        static { BaseTextEditorModel_1 = this; }
        static { this.AUTO_DETECT_LANGUAGE_THROTTLE_DELAY = 600; }
        constructor(modelService, languageService, languageDetectionService, accessibilityService, textEditorModelHandle) {
            super();
            this.modelService = modelService;
            this.languageService = languageService;
            this.languageDetectionService = languageDetectionService;
            this.accessibilityService = accessibilityService;
            this.textEditorModelHandle = undefined;
            this.modelDisposeListener = this._register(new lifecycle_1.MutableDisposable());
            this.autoDetectLanguageThrottler = this._register(new async_1.ThrottledDelayer(BaseTextEditorModel_1.AUTO_DETECT_LANGUAGE_THROTTLE_DELAY));
            this._hasLanguageSetExplicitly = false;
            if (textEditorModelHandle) {
                this.handleExistingModel(textEditorModelHandle);
            }
        }
        handleExistingModel(textEditorModelHandle) {
            // We need the resource to point to an existing model
            const model = this.modelService.getModel(textEditorModelHandle);
            if (!model) {
                throw new Error(`Document with resource ${textEditorModelHandle.toString(true)} does not exist`);
            }
            this.textEditorModelHandle = textEditorModelHandle;
            // Make sure we clean up when this model gets disposed
            this.registerModelDisposeListener(model);
        }
        registerModelDisposeListener(model) {
            this.modelDisposeListener.value = model.onWillDispose(() => {
                this.textEditorModelHandle = undefined; // make sure we do not dispose code editor model again
                this.dispose();
            });
        }
        get textEditorModel() {
            return this.textEditorModelHandle ? this.modelService.getModel(this.textEditorModelHandle) : null;
        }
        isReadonly() {
            return true;
        }
        get hasLanguageSetExplicitly() { return this._hasLanguageSetExplicitly; }
        setLanguageId(languageId, source) {
            // Remember that an explicit language was set
            this._hasLanguageSetExplicitly = true;
            this.setLanguageIdInternal(languageId, source);
        }
        setLanguageIdInternal(languageId, source) {
            if (!this.isResolved()) {
                return;
            }
            if (!languageId || languageId === this.textEditorModel.getLanguageId()) {
                return;
            }
            this.textEditorModel.setLanguage(this.languageService.createById(languageId), source);
        }
        installModelListeners(model) {
            // Setup listener for lower level language changes
            const disposable = this._register(model.onDidChangeLanguage((e) => {
                if (e.source === languageDetectionWorkerService_1.LanguageDetectionLanguageEventSource) {
                    return;
                }
                this._hasLanguageSetExplicitly = true;
                disposable.dispose();
            }));
        }
        getLanguageId() {
            return this.textEditorModel?.getLanguageId();
        }
        autoDetectLanguage() {
            return this.autoDetectLanguageThrottler.trigger(() => this.doAutoDetectLanguage());
        }
        async doAutoDetectLanguage() {
            if (this.hasLanguageSetExplicitly || // skip detection when the user has made an explicit choice on the language
                !this.textEditorModelHandle || // require a URI to run the detection for
                !this.languageDetectionService.isEnabledForLanguage(this.getLanguageId() ?? modesRegistry_1.PLAINTEXT_LANGUAGE_ID) // require a valid language that is enlisted for detection
            ) {
                return;
            }
            const lang = await this.languageDetectionService.detectLanguage(this.textEditorModelHandle);
            const prevLang = this.getLanguageId();
            if (lang && lang !== prevLang && !this.isDisposed()) {
                this.setLanguageIdInternal(lang, languageDetectionWorkerService_1.LanguageDetectionLanguageEventSource);
                const languageName = this.languageService.getLanguageName(lang);
                this.accessibilityService.alert((0, nls_1.localize)('languageAutoDetected', "Language {0} was automatically detected and set as the language mode.", languageName ?? lang));
            }
        }
        /**
         * Creates the text editor model with the provided value, optional preferred language
         * (can be comma separated for multiple values) and optional resource URL.
         */
        createTextEditorModel(value, resource, preferredLanguageId) {
            const firstLineText = this.getFirstLineText(value);
            const languageSelection = this.getOrCreateLanguage(resource, this.languageService, preferredLanguageId, firstLineText);
            return this.doCreateTextEditorModel(value, languageSelection, resource);
        }
        doCreateTextEditorModel(value, languageSelection, resource) {
            let model = resource && this.modelService.getModel(resource);
            if (!model) {
                model = this.modelService.createModel(value, languageSelection, resource);
                this.createdEditorModel = true;
                // Make sure we clean up when this model gets disposed
                this.registerModelDisposeListener(model);
            }
            else {
                this.updateTextEditorModel(value, languageSelection.languageId);
            }
            this.textEditorModelHandle = model.uri;
            return model;
        }
        getFirstLineText(value) {
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
        getOrCreateLanguage(resource, languageService, preferredLanguage, firstLineText) {
            // lookup language via resource path if the provided language is unspecific
            if (!preferredLanguage || preferredLanguage === modesRegistry_1.PLAINTEXT_LANGUAGE_ID) {
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
                this.modelService.updateModel(this.textEditorModel, newValue);
            }
            // language (only if specific and changed)
            if (preferredLanguageId && preferredLanguageId !== modesRegistry_1.PLAINTEXT_LANGUAGE_ID && this.textEditorModel.getLanguageId() !== preferredLanguageId) {
                this.textEditorModel.setLanguage(this.languageService.createById(preferredLanguageId));
            }
        }
        createSnapshot() {
            if (!this.textEditorModel) {
                return null;
            }
            return this.textEditorModel.createSnapshot(true /* preserve BOM */);
        }
        isResolved() {
            return !!this.textEditorModelHandle;
        }
        dispose() {
            this.modelDisposeListener.dispose(); // dispose this first because it will trigger another dispose() otherwise
            if (this.textEditorModelHandle && this.createdEditorModel) {
                this.modelService.destroyModel(this.textEditorModelHandle);
            }
            this.textEditorModelHandle = undefined;
            this.createdEditorModel = false;
            super.dispose();
        }
    };
    exports.BaseTextEditorModel = BaseTextEditorModel;
    exports.BaseTextEditorModel = BaseTextEditorModel = BaseTextEditorModel_1 = __decorate([
        __param(0, model_1.IModelService),
        __param(1, language_1.ILanguageService),
        __param(2, languageDetectionWorkerService_1.ILanguageDetectionService),
        __param(3, accessibility_1.IAccessibilityService)
    ], BaseTextEditorModel);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dEVkaXRvck1vZGVsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbW1vbi9lZGl0b3IvdGV4dEVkaXRvck1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFpQmhHOztPQUVHO0lBQ0ksSUFBTSxtQkFBbUIsR0FBekIsTUFBTSxtQkFBb0IsU0FBUSx5QkFBVzs7aUJBRTNCLHdDQUFtQyxHQUFHLEdBQUcsQUFBTixDQUFPO1FBU2xFLFlBQ2dCLFlBQXFDLEVBQ2xDLGVBQTJDLEVBQ2xDLHdCQUFvRSxFQUN4RSxvQkFBNEQsRUFDbkYscUJBQTJCO1lBRTNCLEtBQUssRUFBRSxDQUFDO1lBTmlCLGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBQ3hCLG9CQUFlLEdBQWYsZUFBZSxDQUFrQjtZQUNqQiw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTJCO1lBQ3ZELHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFYMUUsMEJBQXFCLEdBQW9CLFNBQVMsQ0FBQztZQUk1Qyx5QkFBb0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksNkJBQWlCLEVBQUUsQ0FBQyxDQUFDO1lBQy9ELGdDQUEyQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSx3QkFBZ0IsQ0FBTyxxQkFBbUIsQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDLENBQUM7WUE2QzNJLDhCQUF5QixHQUFZLEtBQUssQ0FBQztZQWxDbEQsSUFBSSxxQkFBcUIsRUFBRTtnQkFDMUIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLHFCQUFxQixDQUFDLENBQUM7YUFDaEQ7UUFDRixDQUFDO1FBRU8sbUJBQW1CLENBQUMscUJBQTBCO1lBRXJELHFEQUFxRDtZQUNyRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxD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