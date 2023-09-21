/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/common/services/languagesRegistry", "vs/base/common/arrays", "vs/editor/common/languages", "vs/editor/common/languages/modesRegistry"], function (require, exports, event_1, lifecycle_1, languagesRegistry_1, arrays_1, languages_1, modesRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$jmb = void 0;
    class $jmb extends lifecycle_1.$kc {
        static { this.instanceCount = 0; }
        constructor(warnOnOverwrite = false) {
            super();
            this.a = this.B(new event_1.$fd());
            this.onDidRequestBasicLanguageFeatures = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.onDidRequestRichLanguageFeatures = this.b.event;
            this.c = this.B(new event_1.$fd({ leakWarningThreshold: 200 /* https://github.com/microsoft/vscode/issues/119968 */ }));
            this.onDidChange = this.c.event;
            this.f = new Set();
            this.g = new Set();
            $jmb.instanceCount++;
            this.h = this.B(new languagesRegistry_1.$imb(true, warnOnOverwrite));
            this.languageIdCodec = this.h.languageIdCodec;
            this.B(this.h.onDidChange(() => this.c.fire()));
        }
        dispose() {
            $jmb.instanceCount--;
            super.dispose();
        }
        registerLanguage(def) {
            return this.h.registerLanguage(def);
        }
        isRegisteredLanguageId(languageId) {
            return this.h.isRegisteredLanguageId(languageId);
        }
        getRegisteredLanguageIds() {
            return this.h.getRegisteredLanguageIds();
        }
        getSortedRegisteredLanguageNames() {
            return this.h.getSortedRegisteredLanguageNames();
        }
        getLanguageName(languageId) {
            return this.h.getLanguageName(languageId);
        }
        getMimeType(languageId) {
            return this.h.getMimeType(languageId);
        }
        getIcon(languageId) {
            return this.h.getIcon(languageId);
        }
        getExtensions(languageId) {
            return this.h.getExtensions(languageId);
        }
        getFilenames(languageId) {
            return this.h.getFilenames(languageId);
        }
        getConfigurationFiles(languageId) {
            return this.h.getConfigurationFiles(languageId);
        }
        getLanguageIdByLanguageName(languageName) {
            return this.h.getLanguageIdByLanguageName(languageName);
        }
        getLanguageIdByMimeType(mimeType) {
            return this.h.getLanguageIdByMimeType(mimeType);
        }
        guessLanguageIdByFilepathOrFirstLine(resource, firstLine) {
            const languageIds = this.h.guessLanguageIdByFilepathOrFirstLine(resource, firstLine);
            return (0, arrays_1.$Mb)(languageIds, null);
        }
        createById(languageId) {
            return new LanguageSelection(this.onDidChange, () => {
                return this.m(languageId);
            });
        }
        createByMimeType(mimeType) {
            return new LanguageSelection(this.onDidChange, () => {
                const languageId = this.getLanguageIdByMimeType(mimeType);
                return this.m(languageId);
            });
        }
        createByFilepathOrFirstLine(resource, firstLine) {
            return new LanguageSelection(this.onDidChange, () => {
                const languageId = this.guessLanguageIdByFilepathOrFirstLine(resource, firstLine);
                return this.m(languageId);
            });
        }
        m(languageId) {
            if (!languageId || !this.isRegisteredLanguageId(languageId)) {
                // Fall back to plain text if language is unknown
                languageId = modesRegistry_1.$Yt;
            }
            return languageId;
        }
        requestBasicLanguageFeatures(languageId) {
            if (!this.f.has(languageId)) {
                this.f.add(languageId);
                this.a.fire(languageId);
            }
        }
        requestRichLanguageFeatures(languageId) {
            if (!this.g.has(languageId)) {
                this.g.add(languageId);
                // Ensure basic features are requested
                this.requestBasicLanguageFeatures(languageId);
                // Ensure tokenizers are created
                languages_1.$bt.getOrCreate(languageId);
                this.b.fire(languageId);
            }
        }
    }
    exports.$jmb = $jmb;
    class LanguageSelection {
        constructor(c, d) {
            this.c = c;
            this.d = d;
            this.a = null;
            this.b = null;
            this.languageId = this.d();
        }
        e() {
            if (this.a) {
                this.a.dispose();
                this.a = null;
            }
            if (this.b) {
                this.b.dispose();
                this.b = null;
            }
        }
        get onDidChange() {
            if (!this.a) {
                this.a = this.c(() => this.f());
            }
            if (!this.b) {
                this.b = new event_1.$fd({
                    onDidRemoveLastListener: () => {
                        this.e();
                    }
                });
            }
            return this.b.event;
        }
        f() {
            const languageId = this.d();
            if (languageId === this.languageId) {
                // no change
                return;
            }
            this.languageId = languageId;
            this.b?.fire(this.languageId);
        }
    }
});
//# sourceMappingURL=languageService.js.map