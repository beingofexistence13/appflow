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
define(["require", "exports", "vs/workbench/common/editor/textEditorModel", "vs/editor/common/languages/language", "vs/editor/common/services/model", "vs/base/common/event", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/editor/common/services/textResourceConfiguration", "vs/editor/common/model/textModel", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/workbench/services/workingCopy/common/workingCopy", "vs/workbench/services/textfile/common/textfiles", "vs/base/common/types", "vs/platform/label/common/label", "vs/editor/common/core/wordHelper", "vs/workbench/services/editor/common/editorService", "vs/base/common/strings", "vs/workbench/services/textfile/common/encoding", "vs/base/common/buffer", "vs/workbench/services/languageDetection/common/languageDetectionWorkerService", "vs/platform/accessibility/common/accessibility"], function (require, exports, textEditorModel_1, language_1, model_1, event_1, workingCopyBackup_1, textResourceConfiguration_1, textModel_1, workingCopyService_1, workingCopy_1, textfiles_1, types_1, label_1, wordHelper_1, editorService_1, strings_1, encoding_1, buffer_1, languageDetectionWorkerService_1, accessibility_1) {
    "use strict";
    var UntitledTextEditorModel_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UntitledTextEditorModel = void 0;
    let UntitledTextEditorModel = class UntitledTextEditorModel extends textEditorModel_1.BaseTextEditorModel {
        static { UntitledTextEditorModel_1 = this; }
        static { this.FIRST_LINE_NAME_MAX_LENGTH = 40; }
        static { this.FIRST_LINE_NAME_CANDIDATE_MAX_LENGTH = UntitledTextEditorModel_1.FIRST_LINE_NAME_MAX_LENGTH * 10; }
        // Support the special '${activeEditorLanguage}' language by
        // looking up the language id from the editor that is active
        // before the untitled editor opens. This special id is only
        // used for the initial language and can be changed after the
        // fact (either manually or through auto-detection).
        static { this.ACTIVE_EDITOR_LANGUAGE_ID = '${activeEditorLanguage}'; }
        get name() {
            // Take name from first line if present and only if
            // we have no associated file path. In that case we
            // prefer the file name as title.
            if (this.configuredLabelFormat === 'content' && !this.hasAssociatedFilePath && this.cachedModelFirstLineWords) {
                return this.cachedModelFirstLineWords;
            }
            // Otherwise fallback to resource
            return this.labelService.getUriBasenameLabel(this.resource);
        }
        //#endregion
        constructor(resource, hasAssociatedFilePath, initialValue, preferredLanguageId, preferredEncoding, languageService, modelService, workingCopyBackupService, textResourceConfigurationService, workingCopyService, textFileService, labelService, editorService, languageDetectionService, accessibilityService) {
            super(modelService, languageService, languageDetectionService, accessibilityService);
            this.resource = resource;
            this.hasAssociatedFilePath = hasAssociatedFilePath;
            this.initialValue = initialValue;
            this.preferredLanguageId = preferredLanguageId;
            this.preferredEncoding = preferredEncoding;
            this.workingCopyBackupService = workingCopyBackupService;
            this.textResourceConfigurationService = textResourceConfigurationService;
            this.workingCopyService = workingCopyService;
            this.textFileService = textFileService;
            this.labelService = labelService;
            this.editorService = editorService;
            //#region Events
            this._onDidChangeContent = this._register(new event_1.Emitter());
            this.onDidChangeContent = this._onDidChangeContent.event;
            this._onDidChangeName = this._register(new event_1.Emitter());
            this.onDidChangeName = this._onDidChangeName.event;
            this._onDidChangeDirty = this._register(new event_1.Emitter());
            this.onDidChangeDirty = this._onDidChangeDirty.event;
            this._onDidChangeEncoding = this._register(new event_1.Emitter());
            this.onDidChangeEncoding = this._onDidChangeEncoding.event;
            this._onDidSave = this._register(new event_1.Emitter());
            this.onDidSave = this._onDidSave.event;
            this._onDidRevert = this._register(new event_1.Emitter());
            this.onDidRevert = this._onDidRevert.event;
            //#endregion
            this.typeId = workingCopy_1.NO_TYPE_ID; // IMPORTANT: never change this to not break existing assumptions (e.g. backups)
            this.capabilities = 2 /* WorkingCopyCapabilities.Untitled */;
            //#region Name
            this.configuredLabelFormat = 'content';
            this.cachedModelFirstLineWords = undefined;
            //#endregion
            //#region Dirty
            this.dirty = this.hasAssociatedFilePath || !!this.initialValue;
            // Make known to working copy service
            this._register(this.workingCopyService.registerWorkingCopy(this));
            // This is typically controlled by the setting `files.defaultLanguage`.
            // If that setting is set, we should not detect the language.
            if (preferredLanguageId) {
                this.setLanguageId(preferredLanguageId);
            }
            // Fetch config
            this.onConfigurationChange(undefined, false);
            this.registerListeners();
        }
        registerListeners() {
            // Config Changes
            this._register(this.textResourceConfigurationService.onDidChangeConfiguration(e => this.onConfigurationChange(e, true)));
        }
        onConfigurationChange(e, fromEvent) {
            // Encoding
            if (!e || e.affectsConfiguration(this.resource, 'files.encoding')) {
                const configuredEncoding = this.textResourceConfigurationService.getValue(this.resource, 'files.encoding');
                if (this.configuredEncoding !== configuredEncoding && typeof configuredEncoding === 'string') {
                    this.configuredEncoding = configuredEncoding;
                    if (fromEvent && !this.preferredEncoding) {
                        this._onDidChangeEncoding.fire(); // do not fire event if we have a preferred encoding set
                    }
                }
            }
            // Label Format
            if (!e || e.affectsConfiguration(this.resource, 'workbench.editor.untitled.labelFormat')) {
                const configuredLabelFormat = this.textResourceConfigurationService.getValue(this.resource, 'workbench.editor.untitled.labelFormat');
                if (this.configuredLabelFormat !== configuredLabelFormat && (configuredLabelFormat === 'content' || configuredLabelFormat === 'name')) {
                    this.configuredLabelFormat = configuredLabelFormat;
                    if (fromEvent) {
                        this._onDidChangeName.fire();
                    }
                }
            }
        }
        //#region Language
        setLanguageId(languageId, source) {
            const actualLanguage = languageId === UntitledTextEditorModel_1.ACTIVE_EDITOR_LANGUAGE_ID
                ? this.editorService.activeTextEditorLanguageId
                : languageId;
            this.preferredLanguageId = actualLanguage;
            if (actualLanguage) {
                super.setLanguageId(actualLanguage, source);
            }
        }
        getLanguageId() {
            if (this.textEditorModel) {
                return this.textEditorModel.getLanguageId();
            }
            return this.preferredLanguageId;
        }
        getEncoding() {
            return this.preferredEncoding || this.configuredEncoding;
        }
        async setEncoding(encoding) {
            const oldEncoding = this.getEncoding();
            this.preferredEncoding = encoding;
            // Emit if it changed
            if (oldEncoding !== this.preferredEncoding) {
                this._onDidChangeEncoding.fire();
            }
        }
        isDirty() {
            return this.dirty;
        }
        isModified() {
            return this.isDirty();
        }
        setDirty(dirty) {
            if (this.dirty === dirty) {
                return;
            }
            this.dirty = dirty;
            this._onDidChangeDirty.fire();
        }
        //#endregion
        //#region Save / Revert / Backup
        async save(options) {
            const target = await this.textFileService.save(this.resource, options);
            // Emit as event
            if (target) {
                this._onDidSave.fire({ reason: options?.reason, source: options?.source });
            }
            return !!target;
        }
        async revert() {
            // No longer dirty
            this.setDirty(false);
            // Emit as event
            this._onDidRevert.fire();
            // A reverted untitled model is invalid because it has
            // no actual source on disk to revert to. As such we
            // dispose the model.
            this.dispose();
        }
        async backup(token) {
            let content = undefined;
            // Make sure to check whether this model has been resolved
            // or not and fallback to the initial value - if any - to
            // prevent backing up an unresolved model and loosing the
            // initial value.
            if (this.isResolved()) {
                // Fill in content the same way we would do when saving the file
                // via the text file service encoding support (hardcode UTF-8)
                content = await this.textFileService.getEncodedReadable(this.resource, this.createSnapshot() ?? undefined, { encoding: encoding_1.UTF8 });
            }
            else if (typeof this.initialValue === 'string') {
                content = (0, buffer_1.bufferToReadable)(buffer_1.VSBuffer.fromString(this.initialValue));
            }
            return { content };
        }
        //#endregion
        //#region Resolve
        async resolve() {
            // Create text editor model if not yet done
            let createdUntitledModel = false;
            let hasBackup = false;
            if (!this.textEditorModel) {
                let untitledContents;
                // Check for backups or use initial value or empty
                const backup = await this.workingCopyBackupService.resolve(this);
                if (backup) {
                    untitledContents = backup.value;
                    hasBackup = true;
                }
                else {
                    untitledContents = (0, buffer_1.bufferToStream)(buffer_1.VSBuffer.fromString(this.initialValue || ''));
                }
                // Determine untitled contents based on backup
                // or initial value. We must use text file service
                // to create the text factory to respect encodings
                // accordingly.
                const untitledContentsFactory = await (0, textModel_1.createTextBufferFactoryFromStream)(await this.textFileService.getDecodedStream(this.resource, untitledContents, { encoding: encoding_1.UTF8 }));
                this.createTextEditorModel(untitledContentsFactory, this.resource, this.preferredLanguageId);
                createdUntitledModel = true;
            }
            // Otherwise: the untitled model already exists and we must assume
            // that the value of the model was changed by the user. As such we
            // do not update the contents, only the language if configured.
            else {
                this.updateTextEditorModel(undefined, this.preferredLanguageId);
            }
            // Listen to text model events
            const textEditorModel = (0, types_1.assertIsDefined)(this.textEditorModel);
            this.installModelListeners(textEditorModel);
            // Only adjust name and dirty state etc. if we
            // actually created the untitled model
            if (createdUntitledModel) {
                // Name
                if (hasBackup || this.initialValue) {
                    this.updateNameFromFirstLine(textEditorModel);
                }
                // Untitled associated to file path are dirty right away as well as untitled with content
                this.setDirty(this.hasAssociatedFilePath || !!hasBackup || !!this.initialValue);
                // If we have initial contents, make sure to emit this
                // as the appropiate events to the outside.
                if (hasBackup || this.initialValue) {
                    this._onDidChangeContent.fire();
                }
            }
            return super.resolve();
        }
        installModelListeners(model) {
            this._register(model.onDidChangeContent(e => this.onModelContentChanged(model, e)));
            this._register(model.onDidChangeLanguage(() => this.onConfigurationChange(undefined, true))); // language change can have impact on config
            super.installModelListeners(model);
        }
        onModelContentChanged(textEditorModel, e) {
            // mark the untitled text editor as non-dirty once its content becomes empty and we do
            // not have an associated path set. we never want dirty indicator in that case.
            if (!this.hasAssociatedFilePath && textEditorModel.getLineCount() === 1 && textEditorModel.getLineContent(1) === '') {
                this.setDirty(false);
            }
            // turn dirty otherwise
            else {
                this.setDirty(true);
            }
            // Check for name change if first line changed in the range of 0-FIRST_LINE_NAME_CANDIDATE_MAX_LENGTH columns
            if (e.changes.some(change => (change.range.startLineNumber === 1 || change.range.endLineNumber === 1) && change.range.startColumn <= UntitledTextEditorModel_1.FIRST_LINE_NAME_CANDIDATE_MAX_LENGTH)) {
                this.updateNameFromFirstLine(textEditorModel);
            }
            // Emit as general content change event
            this._onDidChangeContent.fire();
            // Detect language from content
            this.autoDetectLanguage();
        }
        updateNameFromFirstLine(textEditorModel) {
            if (this.hasAssociatedFilePath) {
                return; // not in case of an associated file path
            }
            // Determine the first words of the model following these rules:
            // - cannot be only whitespace (so we trim())
            // - cannot be only non-alphanumeric characters (so we run word definition regex over it)
            // - cannot be longer than FIRST_LINE_MAX_TITLE_LENGTH
            // - normalize multiple whitespaces to a single whitespace
            let modelFirstWordsCandidate = undefined;
            let firstLineText = textEditorModel
                .getValueInRange({
                startLineNumber: 1,
                endLineNumber: 1,
                startColumn: 1,
                endColumn: UntitledTextEditorModel_1.FIRST_LINE_NAME_CANDIDATE_MAX_LENGTH + 1 // first cap at FIRST_LINE_NAME_CANDIDATE_MAX_LENGTH
            })
                .trim().replace(/\s+/g, ' ') // normalize whitespaces
                .replace(/\u202E/g, ''); // drop Right-to-Left Override character (#190133)
            firstLineText = firstLineText.substr(0, (0, strings_1.getCharContainingOffset)(// finally cap at FIRST_LINE_NAME_MAX_LENGTH (grapheme aware #111235)
            firstLineText, UntitledTextEditorModel_1.FIRST_LINE_NAME_MAX_LENGTH)[0]);
            if (firstLineText && (0, wordHelper_1.ensureValidWordDefinition)().exec(firstLineText)) {
                modelFirstWordsCandidate = firstLineText;
            }
            if (modelFirstWordsCandidate !== this.cachedModelFirstLineWords) {
                this.cachedModelFirstLineWords = modelFirstWordsCandidate;
                this._onDidChangeName.fire();
            }
        }
        //#endregion
        isReadonly() {
            return false;
        }
    };
    exports.UntitledTextEditorModel = UntitledTextEditorModel;
    exports.UntitledTextEditorModel = UntitledTextEditorModel = UntitledTextEditorModel_1 = __decorate([
        __param(5, language_1.ILanguageService),
        __param(6, model_1.IModelService),
        __param(7, workingCopyBackup_1.IWorkingCopyBackupService),
        __param(8, textResourceConfiguration_1.ITextResourceConfigurationService),
        __param(9, workingCopyService_1.IWorkingCopyService),
        __param(10, textfiles_1.ITextFileService),
        __param(11, label_1.ILabelService),
        __param(12, editorService_1.IEditorService),
        __param(13, languageDetectionWorkerService_1.ILanguageDetectionService),
        __param(14, accessibility_1.IAccessibilityService)
    ], UntitledTextEditorModel);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW50aXRsZWRUZXh0RWRpdG9yTW9kZWwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvdW50aXRsZWQvY29tbW9uL3VudGl0bGVkVGV4dEVkaXRvck1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFrRXpGLElBQU0sdUJBQXVCLEdBQTdCLE1BQU0sdUJBQXdCLFNBQVEscUNBQW1COztpQkFFdkMsK0JBQTBCLEdBQUcsRUFBRSxBQUFMLENBQU07aUJBQ2hDLHlDQUFvQyxHQUFHLHlCQUF1QixDQUFDLDBCQUEwQixHQUFHLEVBQUUsQUFBMUQsQ0FBMkQ7UUFFdkgsNERBQTREO1FBQzVELDREQUE0RDtRQUM1RCw0REFBNEQ7UUFDNUQsNkRBQTZEO1FBQzdELG9EQUFvRDtpQkFDNUIsOEJBQXlCLEdBQUcseUJBQXlCLEFBQTVCLENBQTZCO1FBaUM5RSxJQUFJLElBQUk7WUFFUCxtREFBbUQ7WUFDbkQsbURBQW1EO1lBQ25ELGlDQUFpQztZQUNqQyxJQUFJLElBQUksQ0FBQyxxQkFBcUIsS0FBSyxTQUFTLElBQUksQ0FBQyxJQUFJLENBQUMscUJBQXFCLElBQUksSUFBSSxDQUFDLHlCQUF5QixFQUFFO2dCQUM5RyxPQUFPLElBQUksQ0FBQyx5QkFBeUIsQ0FBQzthQUN0QztZQUVELGlDQUFpQztZQUNqQyxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzdELENBQUM7UUFFRCxZQUFZO1FBRVosWUFDVSxRQUFhLEVBQ2IscUJBQThCLEVBQ3RCLFlBQWdDLEVBQ3pDLG1CQUF1QyxFQUN2QyxpQkFBcUMsRUFDM0IsZUFBaUMsRUFDcEMsWUFBMkIsRUFDZix3QkFBb0UsRUFDNUQsZ0NBQW9GLEVBQ2xHLGtCQUF3RCxFQUMzRCxlQUFrRCxF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