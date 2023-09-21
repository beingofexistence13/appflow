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
define(["require", "exports", "vs/nls", "vs/workbench/common/editor/sideBySideEditorInput", "vs/workbench/common/editor", "vs/workbench/common/editor/textEditorModel", "vs/workbench/common/editor/diffEditorModel", "vs/workbench/common/editor/textDiffEditorModel", "vs/workbench/services/editor/common/editorService", "vs/base/common/labels"], function (require, exports, nls_1, sideBySideEditorInput_1, editor_1, textEditorModel_1, diffEditorModel_1, textDiffEditorModel_1, editorService_1, labels_1) {
    "use strict";
    var DiffEditorInput_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DiffEditorInputSerializer = exports.DiffEditorInput = void 0;
    /**
     * The base editor input for the diff editor. It is made up of two editor inputs, the original version
     * and the modified version.
     */
    let DiffEditorInput = class DiffEditorInput extends sideBySideEditorInput_1.SideBySideEditorInput {
        static { DiffEditorInput_1 = this; }
        static { this.ID = 'workbench.editors.diffEditorInput'; }
        get typeId() {
            return DiffEditorInput_1.ID;
        }
        get editorId() {
            return this.modified.editorId === this.original.editorId ? this.modified.editorId : undefined;
        }
        get capabilities() {
            let capabilities = super.capabilities;
            // Force description capability depends on labels
            if (this.labels.forceDescription) {
                capabilities |= 64 /* EditorInputCapabilities.ForceDescription */;
            }
            return capabilities;
        }
        constructor(preferredName, preferredDescription, original, modified, forceOpenAsBinary, editorService) {
            super(preferredName, preferredDescription, original, modified, editorService);
            this.original = original;
            this.modified = modified;
            this.forceOpenAsBinary = forceOpenAsBinary;
            this.cachedModel = undefined;
            this.labels = this.computeLabels();
        }
        computeLabels() {
            // Name
            let name;
            let forceDescription = false;
            if (this.preferredName) {
                name = this.preferredName;
            }
            else {
                const originalName = this.original.getName();
                const modifiedName = this.modified.getName();
                name = (0, nls_1.localize)('sideBySideLabels', "{0} ↔ {1}", originalName, modifiedName);
                // Enforce description when the names are identical
                forceDescription = originalName === modifiedName;
            }
            // Description
            let shortDescription;
            let mediumDescription;
            let longDescription;
            if (this.preferredDescription) {
                shortDescription = this.preferredDescription;
                mediumDescription = this.preferredDescription;
                longDescription = this.preferredDescription;
            }
            else {
                shortDescription = this.computeLabel(this.original.getDescription(0 /* Verbosity.SHORT */), this.modified.getDescription(0 /* Verbosity.SHORT */));
                longDescription = this.computeLabel(this.original.getDescription(2 /* Verbosity.LONG */), this.modified.getDescription(2 /* Verbosity.LONG */));
                // Medium Description: try to be verbose by computing
                // a label that resembles the difference between the two
                const originalMediumDescription = this.original.getDescription(1 /* Verbosity.MEDIUM */);
                const modifiedMediumDescription = this.modified.getDescription(1 /* Verbosity.MEDIUM */);
                if ((typeof originalMediumDescription === 'string' && typeof modifiedMediumDescription === 'string') && // we can only `shorten` when both sides are strings...
                    (originalMediumDescription || modifiedMediumDescription) // ...however never when both sides are empty strings
                ) {
                    const [shortenedOriginalMediumDescription, shortenedModifiedMediumDescription] = (0, labels_1.shorten)([originalMediumDescription, modifiedMediumDescription]);
                    mediumDescription = this.computeLabel(shortenedOriginalMediumDescription, shortenedModifiedMediumDescription);
                }
            }
            // Title
            const shortTitle = this.computeLabel(this.original.getTitle(0 /* Verbosity.SHORT */) ?? this.original.getName(), this.modified.getTitle(0 /* Verbosity.SHORT */) ?? this.modified.getName(), ' ↔ ');
            const mediumTitle = this.computeLabel(this.original.getTitle(1 /* Verbosity.MEDIUM */) ?? this.original.getName(), this.modified.getTitle(1 /* Verbosity.MEDIUM */) ?? this.modified.getName(), ' ↔ ');
            const longTitle = this.computeLabel(this.original.getTitle(2 /* Verbosity.LONG */) ?? this.original.getName(), this.modified.getTitle(2 /* Verbosity.LONG */) ?? this.modified.getName(), ' ↔ ');
            return { name, shortDescription, mediumDescription, longDescription, forceDescription, shortTitle, mediumTitle, longTitle };
        }
        computeLabel(originalLabel, modifiedLabel, separator = ' - ') {
            if (!originalLabel || !modifiedLabel) {
                return undefined;
            }
            if (originalLabel === modifiedLabel) {
                return modifiedLabel;
            }
            return `${originalLabel}${separator}${modifiedLabel}`;
        }
        getName() {
            return this.labels.name;
        }
        getDescription(verbosity = 1 /* Verbosity.MEDIUM */) {
            switch (verbosity) {
                case 0 /* Verbosity.SHORT */:
                    return this.labels.shortDescription;
                case 2 /* Verbosity.LONG */:
                    return this.labels.longDescription;
                case 1 /* Verbosity.MEDIUM */:
                default:
                    return this.labels.mediumDescription;
            }
        }
        getTitle(verbosity) {
            switch (verbosity) {
                case 0 /* Verbosity.SHORT */:
                    return this.labels.shortTitle;
                case 2 /* Verbosity.LONG */:
                    return this.labels.longTitle;
                default:
                case 1 /* Verbosity.MEDIUM */:
                    return this.labels.mediumTitle;
            }
        }
        async resolve(options) {
            // Create Model - we never reuse our cached model if refresh is true because we cannot
            // decide for the inputs within if the cached model can be reused or not. There may be
            // inputs that need to be loaded again and thus we always recreate the model and dispose
            // the previous one - if any.
            const resolvedModel = await this.createModel(options);
            this.cachedModel?.dispose();
            this.cachedModel = resolvedModel;
            return this.cachedModel;
        }
        prefersEditorPane(editorPanes) {
            if (this.forceOpenAsBinary) {
                return editorPanes.find(editorPane => editorPane.typeId === editor_1.BINARY_DIFF_EDITOR_ID);
            }
            return editorPanes.find(editorPane => editorPane.typeId === editor_1.TEXT_DIFF_EDITOR_ID);
        }
        async createModel(options) {
            // Join resolve call over two inputs and build diff editor model
            const [originalEditorModel, modifiedEditorModel] = await Promise.all([
                this.original.resolve(options),
                this.modified.resolve(options)
            ]);
            // If both are text models, return textdiffeditor model
            if (modifiedEditorModel instanceof textEditorModel_1.BaseTextEditorModel && originalEditorModel instanceof textEditorModel_1.BaseTextEditorModel) {
                return new textDiffEditorModel_1.TextDiffEditorModel(originalEditorModel, modifiedEditorModel);
            }
            // Otherwise return normal diff model
            return new diffEditorModel_1.DiffEditorModel(originalEditorModel ?? undefined, modifiedEditorModel ?? undefined);
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
            if (otherInput instanceof DiffEditorInput_1) {
                return this.modified.matches(otherInput.modified) && this.original.matches(otherInput.original) && otherInput.forceOpenAsBinary === this.forceOpenAsBinary;
            }
            if ((0, editor_1.isResourceDiffEditorInput)(otherInput)) {
                return this.modified.matches(otherInput.modified) && this.original.matches(otherInput.original);
            }
            return false;
        }
        dispose() {
            // Free the diff editor model but do not propagate the dispose() call to the two inputs
            // We never created the two inputs (original and modified) so we can not dispose
            // them without sideeffects.
            if (this.cachedModel) {
                this.cachedModel.dispose();
                this.cachedModel = undefined;
            }
            super.dispose();
        }
    };
    exports.DiffEditorInput = DiffEditorInput;
    exports.DiffEditorInput = DiffEditorInput = DiffEditorInput_1 = __decorate([
        __param(5, editorService_1.IEditorService)
    ], DiffEditorInput);
    class DiffEditorInputSerializer extends sideBySideEditorInput_1.AbstractSideBySideEditorInputSerializer {
        createEditorInput(instantiationService, name, description, secondaryInput, primaryInput) {
            return instantiationService.createInstance(DiffEditorInput, name, description, secondaryInput, primaryInput, undefined);
        }
    }
    exports.DiffEditorInputSerializer = DiffEditorInputSerializer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlmZkVkaXRvcklucHV0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbW1vbi9lZGl0b3IvZGlmZkVkaXRvcklucHV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUE2QmhHOzs7T0FHRztJQUNJLElBQU0sZUFBZSxHQUFyQixNQUFNLGVBQWdCLFNBQVEsNkNBQXFCOztpQkFFaEMsT0FBRSxHQUFXLG1DQUFtQyxBQUE5QyxDQUErQztRQUUxRSxJQUFhLE1BQU07WUFDbEIsT0FBTyxpQkFBZSxDQUFDLEVBQUUsQ0FBQztRQUMzQixDQUFDO1FBRUQsSUFBYSxRQUFRO1lBQ3BCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEtBQUssSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDL0YsQ0FBQztRQUVELElBQWEsWUFBWTtZQUN4QixJQUFJLFlBQVksR0FBRyxLQUFLLENBQUMsWUFBWSxDQUFDO1lBRXRDLGlEQUFpRDtZQUNqRCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQ2pDLFlBQVkscURBQTRDLENBQUM7YUFDekQ7WUFFRCxPQUFPLFlBQVksQ0FBQztRQUNyQixDQUFDO1FBTUQsWUFDQyxhQUFpQyxFQUNqQyxvQkFBd0MsRUFDL0IsUUFBcUIsRUFDckIsUUFBcUIsRUFDYixpQkFBc0MsRUFDdkMsYUFBNkI7WUFFN0MsS0FBSyxDQUFDLGFBQWEsRUFBRSxvQkFBb0IsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBTHJFLGFBQVEsR0FBUixRQUFRLENBQWE7WUFDckIsYUFBUSxHQUFSLFFBQVEsQ0FBYTtZQUNiLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBcUI7WUFUaEQsZ0JBQVcsR0FBZ0MsU0FBUyxDQUFDO1lBRTVDLFdBQU0sR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFXL0MsQ0FBQztRQUVPLGFBQWE7WUFFcEIsT0FBTztZQUNQLElBQUksSUFBWSxDQUFDO1lBQ2pCLElBQUksZ0JBQWdCLEdBQUcsS0FBSyxDQUFDO1lBQzdCLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtnQkFDdkIsSUFBSSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7YUFDMUI7aUJBQU07Z0JBQ04sTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDN0MsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFFN0MsSUFBSSxHQUFHLElBQUEsY0FBUSxFQUFDLGtCQUFrQixFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsWUFBWSxDQUFDLENBQUM7Z0JBRTdFLG1EQUFtRDtnQkFDbkQsZ0JBQWdCLEdBQUcsWUFBWSxLQUFLLFlBQVksQ0FBQzthQUNqRDtZQUVELGNBQWM7WUFDZCxJQUFJLGdCQUFvQyxDQUFDO1lBQ3pDLElBQUksaUJBQXFDLENBQUM7WUFDMUMsSUFBSSxlQUFtQyxDQUFDO1lBQ3hDLElBQUksSUFBSSxDQUFDLG9CQUFvQixFQUFFO2dCQUM5QixnQkFBZ0IsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUM7Z0JBQzdDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQztnQkFDOUMsZUFBZSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQzthQUM1QztpQkFBTTtnQkFDTixnQkFBZ0IsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyx5QkFBaUIsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMseUJBQWlCLENBQUMsQ0FBQztnQkFDbkksZUFBZSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLHdCQUFnQixFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyx3QkFBZ0IsQ0FBQyxDQUFDO2dCQUVoSSxxREFBcUQ7Z0JBQ3JELHdEQUF3RDtnQkFDeEQsTUFBTSx5QkFBeUIsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsMEJBQWtCLENBQUM7Z0JBQ2pGLE1BQU0seUJBQXlCLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLDBCQUFrQixDQUFDO2dCQUNqRixJQUNDLENBQUMsT0FBTyx5QkFBeUIsS0FBSyxRQUFRLElBQUksT0FBTyx5QkFBeUIsS0FBSyxRQUFRLENBQUMsSUFBSSx1REFBdUQ7b0JBQzNKLENBQUMseUJBQXlCLElBQUkseUJBQXlCLENBQUMsQ0FBWSxxREFBcUQ7a0JBQ3hIO29CQUNELE1BQU0sQ0FBQyxrQ0FBa0MsRUFBRSxrQ0FBa0MsQ0FBQyxHQUFHLElBQUEsZ0JBQU8sRUFBQyxDQUFDLHlCQUF5QixFQUFFLHlCQUF5QixDQUFDLENBQUMsQ0FBQztvQkFDakosaUJBQWlCLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxrQ0FBa0MsRUFBRSxrQ0FBa0MsQ0FBQyxDQUFDO2lCQUM5RzthQUNEO1lBRUQsUUFBUTtZQUNSLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLHlCQUFpQixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLHlCQUFpQixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDcEwsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsMEJBQWtCLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsMEJBQWtCLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN2TCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSx3QkFBZ0IsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSx3QkFBZ0IsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRWpMLE9BQU8sRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsaUJBQWlCLEVBQUUsZUFBZSxFQUFFLGdCQUFnQixFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLENBQUM7UUFDN0gsQ0FBQztRQUlPLFlBQVksQ0FBQyxhQUFpQyxFQUFFLGFBQWlDLEVBQUUsU0FBUyxHQUFHLEtBQUs7WUFDM0csSUFBSSxDQUFDLGFBQWEsSUFBSSxDQUFDLGFBQWEsRUFBRTtnQkFDckMsT0FBTyxTQUFTLENBQUM7YUFDakI7WUFFRCxJQUFJLGFBQWEsS0FBSyxhQUFhLEVBQUU7Z0JBQ3BDLE9BQU8sYUFBYSxDQUFDO2FBQ3JCO1lBRUQsT0FBTyxHQUFHLGFBQWEsR0FBRyxTQUFTLEdBQUcsYUFBYSxFQUFFLENBQUM7UUFDdkQsQ0FBQztRQUVRLE9BQU87WUFDZixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ3pCLENBQUM7UUFFUSxjQUFjLENBQUMsU0FBUywyQkFBbUI7WUFDbkQsUUFBUSxTQUFTLEVBQUU7Z0JBQ2xCO29CQUNDLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztnQkFDckM7b0JBQ0MsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQztnQkFDcEMsOEJBQXNCO2dCQUN0QjtvQkFDQyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUM7YUFDdEM7UUFDRixDQUFDO1FBRVEsUUFBUSxDQUFDLFNBQXFCO1lBQ3RDLFFBQVEsU0FBUyxFQUFFO2dCQUNsQjtvQkFDQyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDO2dCQUMvQjtvQkFDQyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO2dCQUM5QixRQUFRO2dCQUNSO29CQUNDLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7YUFDaEM7UUFDRixDQUFDO1FBRVEsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUF3QjtZQUU5QyxzRkFBc0Y7WUFDdEYsc0ZBQXNGO1lBQ3RGLHdGQUF3RjtZQUN4Riw2QkFBNkI7WUFDN0IsTUFBTSxhQUFhLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3RELElBQUksQ0FBQyxXQUFXLEVBQUUsT0FBTyxFQUFFLENBQUM7WUFFNUIsSUFBSSxDQUFDLFdBQVcsR0FBRyxhQUFhLENBQUM7WUFFakMsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ3pCLENBQUM7UUFFUSxpQkFBaUIsQ0FBMkMsV0FBZ0I7WUFDcEYsSUFBSSxJQUFJLENBQUMsaUJBQWlCLEVBQUU7Z0JBQzNCLE9BQU8sV0FBVyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEtBQUssOEJBQXFCLENBQUMsQ0FBQzthQUNuRjtZQUVELE9BQU8sV0FBVyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEtBQUssNEJBQW1CLENBQUMsQ0FBQztRQUNsRixDQUFDO1FBRU8sS0FBSyxDQUFDLFdBQVcsQ0FBQyxPQUF3QjtZQUVqRCxnRUFBZ0U7WUFDaEUsTUFBTSxDQUFDLG1CQUFtQixFQUFFLG1CQUFtQixDQUFDLEdBQUcsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDO2dCQUNwRSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7Z0JBQzlCLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQzthQUM5QixDQUFDLENBQUM7WUFFSCx1REFBdUQ7WUFDdkQsSUFBSSxtQkFBbUIsWUFBWSxxQ0FBbUIsSUFBSSxtQkFBbUIsWUFBWSxxQ0FBbUIsRUFBRTtnQkFDN0csT0FBTyxJQUFJLHlDQUFtQixDQUFDLG1CQUFtQixFQUFFLG1CQUFtQixDQUFDLENBQUM7YUFDekU7WUFFRCxxQ0FBcUM7WUFDckMsT0FBTyxJQUFJLGlDQUFlLENBQUMsbUJBQW1CLElBQUksU0FBUyxFQUFFLG1CQUFtQixJQUFJLFNBQVMsQ0FBQyxDQUFDO1FBQ2hHLENBQUM7UUFFUSxTQUFTLENBQUMsT0FBZ0Q7WUFDbEUsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN6QyxJQUFJLE9BQU8sRUFBRTtnQkFDWixPQUFPO29CQUNOLEdBQUcsT0FBTztvQkFDVixRQUFRLEVBQUUsT0FBTyxDQUFDLE9BQU87b0JBQ3pCLFFBQVEsRUFBRSxPQUFPLENBQUMsU0FBUztpQkFDM0IsQ0FBQzthQUNGO1lBRUQsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQztRQUVRLE9BQU8sQ0FBQyxVQUE2QztZQUM3RCxJQUFJLElBQUksS0FBSyxVQUFVLEVBQUU7Z0JBQ3hCLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFFRCxJQUFJLFVBQVUsWUFBWSxpQkFBZSxFQUFFO2dCQUMxQyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksVUFBVSxDQUFDLGlCQUFpQixLQUFLLElBQUksQ0FBQyxpQkFBaUIsQ0FBQzthQUMzSjtZQUVELElBQUksSUFBQSxrQ0FBeUIsRUFBQyxVQUFVLENBQUMsRUFBRTtnQkFDMUMsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQ2hHO1lBRUQsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRVEsT0FBTztZQUVmLHVGQUF1RjtZQUN2RixnRkFBZ0Y7WUFDaEYsNEJBQTRCO1lBQzVCLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDckIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDM0IsSUFBSSxDQUFDLFdBQVcsR0FBRyxTQUFTLENBQUM7YUFDN0I7WUFFRCxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDakIsQ0FBQzs7SUFqTlcsMENBQWU7OEJBQWYsZUFBZTtRQWlDekIsV0FBQSw4QkFBYyxDQUFBO09BakNKLGVBQWUsQ0FrTjNCO0lBRUQsTUFBYSx5QkFBMEIsU0FBUSwrREFBdUM7UUFFM0UsaUJBQWlCLENBQUMsb0JBQTJDLEVBQUUsSUFBd0IsRUFBRSxXQUErQixFQUFFLGNBQTJCLEVBQUUsWUFBeUI7WUFDekwsT0FBTyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsZUFBZSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsY0FBYyxFQUFFLFlBQVksRUFBRSxTQUFTLENBQUMsQ0FBQztRQUN6SCxDQUFDO0tBQ0Q7SUFMRCw4REFLQyJ9