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
    var $sD_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$sD = void 0;
    let $sD = class $sD extends textEditorModel_1.$DA {
        static { $sD_1 = this; }
        static { this.c = 40; }
        static { this.M = $sD_1.c * 10; }
        // Support the special '${activeEditorLanguage}' language by
        // looking up the language id from the editor that is active
        // before the untitled editor opens. This special id is only
        // used for the initial language and can be changed after the
        // fact (either manually or through auto-detection).
        static { this.N = '${activeEditorLanguage}'; }
        get name() {
            // Take name from first line if present and only if
            // we have no associated file path. In that case we
            // prefer the file name as title.
            if (this.W === 'content' && !this.hasAssociatedFilePath && this.X) {
                return this.X;
            }
            // Otherwise fallback to resource
            return this.eb.getUriBasenameLabel(this.resource);
        }
        //#endregion
        constructor(resource, hasAssociatedFilePath, Y, Z, $, languageService, modelService, ab, bb, cb, db, eb, fb, languageDetectionService, accessibilityService) {
            super(modelService, languageService, languageDetectionService, accessibilityService);
            this.resource = resource;
            this.hasAssociatedFilePath = hasAssociatedFilePath;
            this.Y = Y;
            this.Z = Z;
            this.$ = $;
            this.ab = ab;
            this.bb = bb;
            this.cb = cb;
            this.db = db;
            this.eb = eb;
            this.fb = fb;
            //#region Events
            this.O = this.B(new event_1.$fd());
            this.onDidChangeContent = this.O.event;
            this.P = this.B(new event_1.$fd());
            this.onDidChangeName = this.P.event;
            this.Q = this.B(new event_1.$fd());
            this.onDidChangeDirty = this.Q.event;
            this.R = this.B(new event_1.$fd());
            this.onDidChangeEncoding = this.R.event;
            this.S = this.B(new event_1.$fd());
            this.onDidSave = this.S.event;
            this.U = this.B(new event_1.$fd());
            this.onDidRevert = this.U.event;
            //#endregion
            this.typeId = workingCopy_1.$wA; // IMPORTANT: never change this to not break existing assumptions (e.g. backups)
            this.capabilities = 2 /* WorkingCopyCapabilities.Untitled */;
            //#region Name
            this.W = 'content';
            this.X = undefined;
            //#endregion
            //#region Dirty
            this.jb = this.hasAssociatedFilePath || !!this.Y;
            // Make known to working copy service
            this.B(this.cb.registerWorkingCopy(this));
            // This is typically controlled by the setting `files.defaultLanguage`.
            // If that setting is set, we should not detect the language.
            if (Z) {
                this.setLanguageId(Z);
            }
            // Fetch config
            this.hb(undefined, false);
            this.gb();
        }
        gb() {
            // Config Changes
            this.B(this.bb.onDidChangeConfiguration(e => this.hb(e, true)));
        }
        hb(e, fromEvent) {
            // Encoding
            if (!e || e.affectsConfiguration(this.resource, 'files.encoding')) {
                const configuredEncoding = this.bb.getValue(this.resource, 'files.encoding');
                if (this.ib !== configuredEncoding && typeof configuredEncoding === 'string') {
                    this.ib = configuredEncoding;
                    if (fromEvent && !this.$) {
                        this.R.fire(); // do not fire event if we have a preferred encoding set
                    }
                }
            }
            // Label Format
            if (!e || e.affectsConfiguration(this.resource, 'workbench.editor.untitled.labelFormat')) {
                const configuredLabelFormat = this.bb.getValue(this.resource, 'workbench.editor.untitled.labelFormat');
                if (this.W !== configuredLabelFormat && (configuredLabelFormat === 'content' || configuredLabelFormat === 'name')) {
                    this.W = configuredLabelFormat;
                    if (fromEvent) {
                        this.P.fire();
                    }
                }
            }
        }
        //#region Language
        setLanguageId(languageId, source) {
            const actualLanguage = languageId === $sD_1.N
                ? this.fb.activeTextEditorLanguageId
                : languageId;
            this.Z = actualLanguage;
            if (actualLanguage) {
                super.setLanguageId(actualLanguage, source);
            }
        }
        getLanguageId() {
            if (this.textEditorModel) {
                return this.textEditorModel.getLanguageId();
            }
            return this.Z;
        }
        getEncoding() {
            return this.$ || this.ib;
        }
        async setEncoding(encoding) {
            const oldEncoding = this.getEncoding();
            this.$ = encoding;
            // Emit if it changed
            if (oldEncoding !== this.$) {
                this.R.fire();
            }
        }
        isDirty() {
            return this.jb;
        }
        isModified() {
            return this.isDirty();
        }
        kb(dirty) {
            if (this.jb === dirty) {
                return;
            }
            this.jb = dirty;
            this.Q.fire();
        }
        //#endregion
        //#region Save / Revert / Backup
        async save(options) {
            const target = await this.db.save(this.resource, options);
            // Emit as event
            if (target) {
                this.S.fire({ reason: options?.reason, source: options?.source });
            }
            return !!target;
        }
        async revert() {
            // No longer dirty
            this.kb(false);
            // Emit as event
            this.U.fire();
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
                content = await this.db.getEncodedReadable(this.resource, this.createSnapshot() ?? undefined, { encoding: encoding_1.$bD });
            }
            else if (typeof this.Y === 'string') {
                content = (0, buffer_1.$Qd)(buffer_1.$Fd.fromString(this.Y));
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
                const backup = await this.ab.resolve(this);
                if (backup) {
                    untitledContents = backup.value;
                    hasBackup = true;
                }
                else {
                    untitledContents = (0, buffer_1.$Td)(buffer_1.$Fd.fromString(this.Y || ''));
                }
                // Determine untitled contents based on backup
                // or initial value. We must use text file service
                // to create the text factory to respect encodings
                // accordingly.
                const untitledContentsFactory = await (0, textModel_1.$JC)(await this.db.getDecodedStream(this.resource, untitledContents, { encoding: encoding_1.$bD }));
                this.H(untitledContentsFactory, this.resource, this.Z);
                createdUntitledModel = true;
            }
            // Otherwise: the untitled model already exists and we must assume
            // that the value of the model was changed by the user. As such we
            // do not update the contents, only the language if configured.
            else {
                this.updateTextEditorModel(undefined, this.Z);
            }
            // Listen to text model events
            const textEditorModel = (0, types_1.$uf)(this.textEditorModel);
            this.D(textEditorModel);
            // Only adjust name and dirty state etc. if we
            // actually created the untitled model
            if (createdUntitledModel) {
                // Name
                if (hasBackup || this.Y) {
                    this.nb(textEditorModel);
                }
                // Untitled associated to file path are dirty right away as well as untitled with content
                this.kb(this.hasAssociatedFilePath || !!hasBackup || !!this.Y);
                // If we have initial contents, make sure to emit this
                // as the appropiate events to the outside.
                if (hasBackup || this.Y) {
                    this.O.fire();
                }
            }
            return super.resolve();
        }
        D(model) {
            this.B(model.onDidChangeContent(e => this.mb(model, e)));
            this.B(model.onDidChangeLanguage(() => this.hb(undefined, true))); // language change can have impact on config
            super.D(model);
        }
        mb(textEditorModel, e) {
            // mark the untitled text editor as non-dirty once its content becomes empty and we do
            // not have an associated path set. we never want dirty indicator in that case.
            if (!this.hasAssociatedFilePath && textEditorModel.getLineCount() === 1 && textEditorModel.getLineContent(1) === '') {
                this.kb(false);
            }
            // turn dirty otherwise
            else {
                this.kb(true);
            }
            // Check for name change if first line changed in the range of 0-FIRST_LINE_NAME_CANDIDATE_MAX_LENGTH columns
            if (e.changes.some(change => (change.range.startLineNumber === 1 || change.range.endLineNumber === 1) && change.range.startColumn <= $sD_1.M)) {
                this.nb(textEditorModel);
            }
            // Emit as general content change event
            this.O.fire();
            // Detect language from content
            this.F();
        }
        nb(textEditorModel) {
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
                endColumn: $sD_1.M + 1 // first cap at FIRST_LINE_NAME_CANDIDATE_MAX_LENGTH
            })
                .trim().replace(/\s+/g, ' ') // normalize whitespaces
                .replace(/\u202E/g, ''); // drop Right-to-Left Override character (#190133)
            firstLineText = firstLineText.substr(0, (0, strings_1.$Ye)(// finally cap at FIRST_LINE_NAME_MAX_LENGTH (grapheme aware #111235)
            firstLineText, $sD_1.c)[0]);
            if (firstLineText && (0, wordHelper_1.$Xr)().exec(firstLineText)) {
                modelFirstWordsCandidate = firstLineText;
            }
            if (modelFirstWordsCandidate !== this.X) {
                this.X = modelFirstWordsCandidate;
                this.P.fire();
            }
        }
        //#endregion
        isReadonly() {
            return false;
        }
    };
    exports.$sD = $sD;
    exports.$sD = $sD = $sD_1 = __decorate([
        __param(5, language_1.$ct),
        __param(6, model_1.$yA),
        __param(7, workingCopyBackup_1.$EA),
        __param(8, textResourceConfiguration_1.$FA),
        __param(9, workingCopyService_1.$TC),
        __param(10, textfiles_1.$JD),
        __param(11, label_1.$Vz),
        __param(12, editorService_1.$9C),
        __param(13, languageDetectionWorkerService_1.$zA),
        __param(14, accessibility_1.$1r)
    ], $sD);
});
//# sourceMappingURL=untitledTextEditorModel.js.map