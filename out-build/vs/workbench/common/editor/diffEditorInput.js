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
define(["require", "exports", "vs/nls!vs/workbench/common/editor/diffEditorInput", "vs/workbench/common/editor/sideBySideEditorInput", "vs/workbench/common/editor", "vs/workbench/common/editor/textEditorModel", "vs/workbench/common/editor/diffEditorModel", "vs/workbench/common/editor/textDiffEditorModel", "vs/workbench/services/editor/common/editorService", "vs/base/common/labels"], function (require, exports, nls_1, sideBySideEditorInput_1, editor_1, textEditorModel_1, diffEditorModel_1, textDiffEditorModel_1, editorService_1, labels_1) {
    "use strict";
    var $3eb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$4eb = exports.$3eb = void 0;
    /**
     * The base editor input for the diff editor. It is made up of two editor inputs, the original version
     * and the modified version.
     */
    let $3eb = class $3eb extends sideBySideEditorInput_1.$VC {
        static { $3eb_1 = this; }
        static { this.ID = 'workbench.editors.diffEditorInput'; }
        get typeId() {
            return $3eb_1.ID;
        }
        get editorId() {
            return this.modified.editorId === this.original.editorId ? this.modified.editorId : undefined;
        }
        get capabilities() {
            let capabilities = super.capabilities;
            // Force description capability depends on labels
            if (this.u.forceDescription) {
                capabilities |= 64 /* EditorInputCapabilities.ForceDescription */;
            }
            return capabilities;
        }
        constructor(preferredName, preferredDescription, original, modified, w, editorService) {
            super(preferredName, preferredDescription, original, modified, editorService);
            this.original = original;
            this.modified = modified;
            this.w = w;
            this.t = undefined;
            this.u = this.y();
        }
        y() {
            // Name
            let name;
            let forceDescription = false;
            if (this.j) {
                name = this.j;
            }
            else {
                const originalName = this.original.getName();
                const modifiedName = this.modified.getName();
                name = (0, nls_1.localize)(0, null, originalName, modifiedName);
                // Enforce description when the names are identical
                forceDescription = originalName === modifiedName;
            }
            // Description
            let shortDescription;
            let mediumDescription;
            let longDescription;
            if (this.m) {
                shortDescription = this.m;
                mediumDescription = this.m;
                longDescription = this.m;
            }
            else {
                shortDescription = this.z(this.original.getDescription(0 /* Verbosity.SHORT */), this.modified.getDescription(0 /* Verbosity.SHORT */));
                longDescription = this.z(this.original.getDescription(2 /* Verbosity.LONG */), this.modified.getDescription(2 /* Verbosity.LONG */));
                // Medium Description: try to be verbose by computing
                // a label that resembles the difference between the two
                const originalMediumDescription = this.original.getDescription(1 /* Verbosity.MEDIUM */);
                const modifiedMediumDescription = this.modified.getDescription(1 /* Verbosity.MEDIUM */);
                if ((typeof originalMediumDescription === 'string' && typeof modifiedMediumDescription === 'string') && // we can only `shorten` when both sides are strings...
                    (originalMediumDescription || modifiedMediumDescription) // ...however never when both sides are empty strings
                ) {
                    const [shortenedOriginalMediumDescription, shortenedModifiedMediumDescription] = (0, labels_1.$iA)([originalMediumDescription, modifiedMediumDescription]);
                    mediumDescription = this.z(shortenedOriginalMediumDescription, shortenedModifiedMediumDescription);
                }
            }
            // Title
            const shortTitle = this.z(this.original.getTitle(0 /* Verbosity.SHORT */) ?? this.original.getName(), this.modified.getTitle(0 /* Verbosity.SHORT */) ?? this.modified.getName(), ' ↔ ');
            const mediumTitle = this.z(this.original.getTitle(1 /* Verbosity.MEDIUM */) ?? this.original.getName(), this.modified.getTitle(1 /* Verbosity.MEDIUM */) ?? this.modified.getName(), ' ↔ ');
            const longTitle = this.z(this.original.getTitle(2 /* Verbosity.LONG */) ?? this.original.getName(), this.modified.getTitle(2 /* Verbosity.LONG */) ?? this.modified.getName(), ' ↔ ');
            return { name, shortDescription, mediumDescription, longDescription, forceDescription, shortTitle, mediumTitle, longTitle };
        }
        z(originalLabel, modifiedLabel, separator = ' - ') {
            if (!originalLabel || !modifiedLabel) {
                return undefined;
            }
            if (originalLabel === modifiedLabel) {
                return modifiedLabel;
            }
            return `${originalLabel}${separator}${modifiedLabel}`;
        }
        getName() {
            return this.u.name;
        }
        getDescription(verbosity = 1 /* Verbosity.MEDIUM */) {
            switch (verbosity) {
                case 0 /* Verbosity.SHORT */:
                    return this.u.shortDescription;
                case 2 /* Verbosity.LONG */:
                    return this.u.longDescription;
                case 1 /* Verbosity.MEDIUM */:
                default:
                    return this.u.mediumDescription;
            }
        }
        getTitle(verbosity) {
            switch (verbosity) {
                case 0 /* Verbosity.SHORT */:
                    return this.u.shortTitle;
                case 2 /* Verbosity.LONG */:
                    return this.u.longTitle;
                default:
                case 1 /* Verbosity.MEDIUM */:
                    return this.u.mediumTitle;
            }
        }
        async resolve(options) {
            // Create Model - we never reuse our cached model if refresh is true because we cannot
            // decide for the inputs within if the cached model can be reused or not. There may be
            // inputs that need to be loaded again and thus we always recreate the model and dispose
            // the previous one - if any.
            const resolvedModel = await this.C(options);
            this.t?.dispose();
            this.t = resolvedModel;
            return this.t;
        }
        prefersEditorPane(editorPanes) {
            if (this.w) {
                return editorPanes.find(editorPane => editorPane.typeId === editor_1.$KE);
            }
            return editorPanes.find(editorPane => editorPane.typeId === editor_1.$JE);
        }
        async C(options) {
            // Join resolve call over two inputs and build diff editor model
            const [originalEditorModel, modifiedEditorModel] = await Promise.all([
                this.original.resolve(options),
                this.modified.resolve(options)
            ]);
            // If both are text models, return textdiffeditor model
            if (modifiedEditorModel instanceof textEditorModel_1.$DA && originalEditorModel instanceof textEditorModel_1.$DA) {
                return new textDiffEditorModel_1.$2eb(originalEditorModel, modifiedEditorModel);
            }
            // Otherwise return normal diff model
            return new diffEditorModel_1.$1eb(originalEditorModel ?? undefined, modifiedEditorModel ?? undefined);
        }
        toUntyped(options) {
            const untyped = super.toUntyped(options);
            if (untyped) {
                return {
                    ...untyped,
                    modified: untyped.primary,
                    original: untyped.secondary
                };
            }
            return undefined;
        }
        matches(otherInput) {
            if (this === otherInput) {
                return true;
            }
            if (otherInput instanceof $3eb_1) {
                return this.modified.matches(otherInput.modified) && this.original.matches(otherInput.original) && otherInput.w === this.w;
            }
            if ((0, editor_1.$OE)(otherInput)) {
                return this.modified.matches(otherInput.modified) && this.original.matches(otherInput.original);
            }
            return false;
        }
        dispose() {
            // Free the diff editor model but do not propagate the dispose() call to the two inputs
            // We never created the two inputs (original and modified) so we can not dispose
            // them without sideeffects.
            if (this.t) {
                this.t.dispose();
                this.t = undefined;
            }
            super.dispose();
        }
    };
    exports.$3eb = $3eb;
    exports.$3eb = $3eb = $3eb_1 = __decorate([
        __param(5, editorService_1.$9C)
    ], $3eb);
    class $4eb extends sideBySideEditorInput_1.$WC {
        b(instantiationService, name, description, secondaryInput, primaryInput) {
            return instantiationService.createInstance($3eb, name, description, secondaryInput, primaryInput, undefined);
        }
    }
    exports.$4eb = $4eb;
});
//# sourceMappingURL=diffEditorInput.js.map