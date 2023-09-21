/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/common/services/languagesRegistry", "vs/base/common/arrays", "vs/editor/common/languages", "vs/editor/common/languages/modesRegistry"], function (require, exports, event_1, lifecycle_1, languagesRegistry_1, arrays_1, languages_1, modesRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LanguageService = void 0;
    class LanguageService extends lifecycle_1.Disposable {
        static { this.instanceCount = 0; }
        constructor(warnOnOverwrite = false) {
            super();
            this._onDidRequestBasicLanguageFeatures = this._register(new event_1.Emitter());
            this.onDidRequestBasicLanguageFeatures = this._onDidRequestBasicLanguageFeatures.event;
            this._onDidRequestRichLanguageFeatures = this._register(new event_1.Emitter());
            this.onDidRequestRichLanguageFeatures = this._onDidRequestRichLanguageFeatures.event;
            this._onDidChange = this._register(new event_1.Emitter({ leakWarningThreshold: 200 /* https://github.com/microsoft/vscode/issues/119968 */ }));
            this.onDidChange = this._onDidChange.event;
            this._requestedBasicLanguages = new Set();
            this._requestedRichLanguages = new Set();
            LanguageService.instanceCount++;
            this._registry = this._register(new languagesRegistry_1.LanguagesRegistry(true, warnOnOverwrite));
            this.languageIdCodec = this._registry.languageIdCodec;
            this._register(this._registry.onDidChange(() => this._onDidChange.fire()));
        }
        dispose() {
            LanguageService.instanceCount--;
            super.dispose();
        }
        registerLanguage(def) {
            return this._registry.registerLanguage(def);
        }
        isRegisteredLanguageId(languageId) {
            return this._registry.isRegisteredLanguageId(languageId);
        }
        getRegisteredLanguageIds() {
            return this._registry.getRegisteredLanguageIds();
        }
        getSortedRegisteredLanguageNames() {
            return this._registry.getSortedRegisteredLanguageNames();
        }
        getLanguageName(languageId) {
            return this._registry.getLanguageName(languageId);
        }
        getMimeType(languageId) {
            return this._registry.getMimeType(languageId);
        }
        getIcon(languageId) {
            return this._registry.getIcon(languageId);
        }
        getExtensions(languageId) {
            return this._registry.getExtensions(languageId);
        }
        getFilenames(languageId) {
            return this._registry.getFilenames(languageId);
        }
        getConfigurationFiles(languageId) {
            return this._registry.getConfigurationFiles(languageId);
        }
        getLanguageIdByLanguageName(languageName) {
            return this._registry.getLanguageIdByLanguageName(languageName);
        }
        getLanguageIdByMimeType(mimeType) {
            return this._registry.getLanguageIdByMimeType(mimeType);
        }
        guessLanguageIdByFilepathOrFirstLine(resource, firstLine) {
            const languageIds = this._registry.guessLanguageIdByFilepathOrFirstLine(resource, firstLine);
            return (0, arrays_1.firstOrDefault)(languageIds, null);
        }
        createById(languageId) {
            return new LanguageSelection(this.onDidChange, () => {
                return this._createAndGetLanguageIdentifier(languageId);
            });
        }
        createByMimeType(mimeType) {
            return new LanguageSelection(this.onDidChange, () => {
                const languageId = this.getLanguageIdByMimeType(mimeType);
                return this._createAndGetLanguageIdentifier(languageId);
            });
        }
        createByFilepathOrFirstLine(resource, firstLine) {
            return new LanguageSelection(this.onDidChange, () => {
                const languageId = this.guessLanguageIdByFilepathOrFirstLine(resource, firstLine);
                return this._createAndGetLanguageIdentifier(languageId);
            });
        }
        _createAndGetLanguageIdentifier(languageId) {
            if (!languageId || !this.isRegisteredLanguageId(languageId)) {
                // Fall back to plain text if language is unknown
                languageId = modesRegistry_1.PLAINTEXT_LANGUAGE_ID;
            }
            return languageId;
        }
        requestBasicLanguageFeatures(languageId) {
            if (!this._requestedBasicLanguages.has(languageId)) {
                this._requestedBasicLanguages.add(languageId);
                this._onDidRequestBasicLanguageFeatures.fire(languageId);
            }
        }
        requestRichLanguageFeatures(languageId) {
            if (!this._requestedRichLanguages.has(languageId)) {
                this._requestedRichLanguages.add(languageId);
                // Ensure basic features are requested
                this.requestBasicLanguageFeatures(languageId);
                // Ensure tokenizers are created
                languages_1.TokenizationRegistry.getOrCreate(languageId);
                this._onDidRequestRichLanguageFeatures.fire(languageId);
            }
        }
    }
    exports.LanguageService = LanguageService;
    class LanguageSelection {
        constructor(_onDidChangeLanguages, _selector) {
            this._onDidChangeLanguages = _onDidChangeLanguages;
            this._selector = _selector;
            this._listener = null;
            this._emitter = null;
            this.languageId = this._selector();
        }
        _dispose() {
            if (this._listener) {
                this._listener.dispose();
                this._listener = null;
            }
            if (this._emitter) {
                this._emitter.dispose();
                this._emitter = null;
            }
        }
        get onDidChange() {
            if (!this._listener) {
                this._listener = this._onDidChangeLanguages(() => this._evaluate());
            }
            if (!this._emitter) {
                this._emitter = new event_1.Emitter({
                    onDidRemoveLastListener: () => {
                        this._dispose();
                    }
                });
            }
            return this._emitter.event;
        }
        _evaluate() {
            const languageId = this._selector();
            if (languageId === this.languageId) {
                // no change
                return;
            }
            this.languageId = languageId;
            this._emitter?.fire(this.languageId);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3VhZ2VTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9zZXJ2aWNlcy9sYW5ndWFnZVNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBV2hHLE1BQWEsZUFBZ0IsU0FBUSxzQkFBVTtpQkFHdkMsa0JBQWEsR0FBRyxDQUFDLEFBQUosQ0FBSztRQWlCekIsWUFBWSxlQUFlLEdBQUcsS0FBSztZQUNsQyxLQUFLLEVBQUUsQ0FBQztZQWhCUSx1Q0FBa0MsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFVLENBQUMsQ0FBQztZQUM1RSxzQ0FBaUMsR0FBRyxJQUFJLENBQUMsa0NBQWtDLENBQUMsS0FBSyxDQUFDO1lBRWpGLHNDQUFpQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVUsQ0FBQyxDQUFDO1lBQzNFLHFDQUFnQyxHQUFHLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxLQUFLLENBQUM7WUFFN0UsaUJBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxDQUFPLEVBQUUsb0JBQW9CLEVBQUUsR0FBRyxDQUFDLHVEQUF1RCxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzNJLGdCQUFXLEdBQWdCLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDO1lBRWxELDZCQUF3QixHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7WUFDN0MsNEJBQXVCLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztZQU81RCxlQUFlLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDaEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUkscUNBQWlCLENBQUMsSUFBSSxFQUFFLGVBQWUsQ0FBQyxDQUFDLENBQUM7WUFDOUUsSUFBSSxDQUFDLGVBQWUsR0FB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