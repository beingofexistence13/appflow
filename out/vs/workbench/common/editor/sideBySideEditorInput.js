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
define(["require", "exports", "vs/base/common/event", "vs/nls", "vs/platform/registry/common/platform", "vs/workbench/common/editor", "vs/workbench/common/editor/editorInput", "vs/workbench/services/editor/common/editorService"], function (require, exports, event_1, nls_1, platform_1, editor_1, editorInput_1, editorService_1) {
    "use strict";
    var SideBySideEditorInput_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SideBySideEditorInputSerializer = exports.AbstractSideBySideEditorInputSerializer = exports.SideBySideEditorInput = void 0;
    /**
     * Side by side editor inputs that have a primary and secondary side.
     */
    let SideBySideEditorInput = class SideBySideEditorInput extends editorInput_1.EditorInput {
        static { SideBySideEditorInput_1 = this; }
        static { this.ID = 'workbench.editorinputs.sidebysideEditorInput'; }
        get typeId() {
            return SideBySideEditorInput_1.ID;
        }
        get capabilities() {
            // Use primary capabilities as main capabilities...
            let capabilities = this.primary.capabilities;
            // ...with the exception of `CanSplitInGroup` which
            // is only relevant to single editors.
            capabilities &= ~32 /* EditorInputCapabilities.CanSplitInGroup */;
            // Trust: should be considered for both sides
            if (this.secondary.hasCapability(16 /* EditorInputCapabilities.RequiresTrust */)) {
                capabilities |= 16 /* EditorInputCapabilities.RequiresTrust */;
            }
            // Singleton: should be considered for both sides
            if (this.secondary.hasCapability(8 /* EditorInputCapabilities.Singleton */)) {
                capabilities |= 8 /* EditorInputCapabilities.Singleton */;
            }
            // Indicate we show more than one editor
            capabilities |= 256 /* EditorInputCapabilities.MultipleEditors */;
            return capabilities;
        }
        get resource() {
            if (this.hasIdenticalSides) {
                // pretend to be just primary side when being asked for a resource
                // in case both sides are the same. this can help when components
                // want to identify this input among others (e.g. in history).
                return this.primary.resource;
            }
            return undefined;
        }
        constructor(preferredName, preferredDescription, secondary, primary, editorService) {
            super();
            this.preferredName = preferredName;
            this.preferredDescription = preferredDescription;
            this.secondary = secondary;
            this.primary = primary;
            this.editorService = editorService;
            this.hasIdenticalSides = this.primary.matches(this.secondary);
            this.registerListeners();
        }
        registerListeners() {
            // When the primary or secondary input gets disposed, dispose this diff editor input
            this._register(event_1.Event.once(event_1.Event.any(this.primary.onWillDispose, this.secondary.onWillDispose))(() => {
                if (!this.isDisposed()) {
                    this.dispose();
                }
            }));
            // Re-emit some events from the primary side to the outside
            this._register(this.primary.onDidChangeDirty(() => this._onDidChangeDirty.fire()));
            // Re-emit some events from both sides to the outside
            this._register(this.primary.onDidChangeCapabilities(() => this._onDidChangeCapabilities.fire()));
            this._register(this.secondary.onDidChangeCapabilities(() => this._onDidChangeCapabilities.fire()));
            this._register(this.primary.onDidChangeLabel(() => this._onDidChangeLabel.fire()));
            this._register(this.secondary.onDidChangeLabel(() => this._onDidChangeLabel.fire()));
        }
        getName() {
            const preferredName = this.getPreferredName();
            if (preferredName) {
                return preferredName;
            }
            if (this.hasIdenticalSides) {
                return this.primary.getName(); // keep name concise when same editor is opened side by side
            }
            return (0, nls_1.localize)('sideBySideLabels', "{0} - {1}", this.secondary.getName(), this.primary.getName());
        }
        getPreferredName() {
            return this.preferredName;
        }
        getDescription(verbosity) {
            const preferredDescription = this.getPreferredDescription();
            if (preferredDescription) {
                return preferredDescription;
            }
            if (this.hasIdenticalSides) {
                return this.primary.getDescription(verbosity);
            }
            return super.getDescription(verbosity);
        }
        getPreferredDescription() {
            return this.preferredDescription;
        }
        getTitle(verbosity) {
            if (this.hasIdenticalSides) {
                return this.primary.getTitle(verbosity) ?? this.getName();
            }
            return super.getTitle(verbosity);
        }
        getLabelExtraClasses() {
            if (this.hasIdenticalSides) {
                return this.primary.getLabelExtraClasses();
            }
            return super.getLabelExtraClasses();
        }
        getAriaLabel() {
            if (this.hasIdenticalSides) {
                return this.primary.getAriaLabel();
            }
            return super.getAriaLabel();
        }
        getTelemetryDescriptor() {
            const descriptor = this.primary.getTelemetryDescriptor();
            return { ...descriptor, ...super.getTelemetryDescriptor() };
        }
        isDirty() {
            return this.primary.isDirty();
        }
        isSaving() {
            return this.primary.isSaving();
        }
        async save(group, options) {
            const primarySaveResult = await this.primary.save(group, options);
            return this.saveResultToEditor(primarySaveResult);
        }
        async saveAs(group, options) {
            const primarySaveResult = await this.primary.saveAs(group, options);
            return this.saveResultToEditor(primarySaveResult);
        }
        saveResultToEditor(primarySaveResult) {
            if (!primarySaveResult || !this.hasIdenticalSides) {
                return primarySaveResult;
            }
            if (this.primary.matches(primarySaveResult)) {
                return this;
            }
            if (primarySaveResult instanceof editorInput_1.EditorInput) {
                return new SideBySideEditorInput_1(this.preferredName, this.preferredDescription, primarySaveResult, primarySaveResult, this.editorService);
            }
            if (!(0, editor_1.isResourceDiffEditorInput)(primarySaveResult) && !(0, editor_1.isResourceSideBySideEditorInput)(primarySaveResult) && !(0, editor_1.isResourceMergeEditorInput)(primarySaveResult)) {
                return {
                    primary: primarySaveResult,
                    secondary: primarySaveResult,
                    label: this.preferredName,
                    description: this.preferredDescription
                };
            }
            return undefined;
        }
        revert(group, options) {
            return this.primary.revert(group, options);
        }
        async rename(group, target) {
            if (!this.hasIdenticalSides) {
                return; // currently only enabled when both sides are identical
            }
            // Forward rename to primary side
            const renameResult = await this.primary.rename(group, target);
            if (!renameResult) {
                return undefined;
            }
            // Build a side-by-side result from the rename result
            if ((0, editor_1.isEditorInput)(renameResult.editor)) {
                return {
                    editor: new SideBySideEditorInput_1(this.preferredName, this.preferredDescription, renameResult.editor, renameResult.editor, this.editorService),
                    options: {
                        ...renameResult.options,
                        viewState: (0, editor_1.findViewStateForEditor)(this, group, this.editorService)
                    }
                };
            }
            if ((0, editor_1.isResourceEditorInput)(renameResult.editor)) {
                return {
                    editor: {
                        label: this.preferredName,
                        description: this.preferredDescription,
                        primary: renameResult.editor,
                        secondary: renameResult.editor,
                        options: {
                            ...renameResult.options,
                            viewState: (0, editor_1.findViewStateForEditor)(this, group, this.editorService)
                        }
                    }
                };
            }
            return undefined;
        }
        isReadonly() {
            return this.primary.isReadonly();
        }
        toUntyped(options) {
            const primaryResourceEditorInput = this.primary.toUntyped(options);
            const secondaryResourceEditorInput = this.secondary.toUntyped(options);
            // Prevent nested side by side editors which are unsupported
            if (primaryResourceEditorInput && secondaryResourceEditorInput &&
                !(0, editor_1.isResourceDiffEditorInput)(primaryResourceEditorInput) && !(0, editor_1.isResourceDiffEditorInput)(secondaryResourceEditorInput) &&
                !(0, editor_1.isResourceSideBySideEditorInput)(primaryResourceEditorInput) && !(0, editor_1.isResourceSideBySideEditorInput)(secondaryResourceEditorInput) &&
                !(0, editor_1.isResourceMergeEditorInput)(primaryResourceEditorInput) && !(0, editor_1.isResourceMergeEditorInput)(secondaryResourceEditorInput)) {
                const untypedInput = {
                    label: this.preferredName,
                    description: this.preferredDescription,
                    primary: primaryResourceEditorInput,
                    secondary: secondaryResourceEditorInput
                };
                if (typeof options?.preserveViewState === 'number') {
                    untypedInput.options = {
                        viewState: (0, editor_1.findViewStateForEditor)(this, options.preserveViewState, this.editorService)
                    };
                }
                return untypedInput;
            }
            return undefined;
        }
        matches(otherInput) {
            if (this === otherInput) {
                return true;
            }
            if ((0, editor_1.isDiffEditorInput)(otherInput) || (0, editor_1.isResourceDiffEditorInput)(otherInput)) {
                return false; // prevent subclass from matching
            }
            if (otherInput instanceof SideBySideEditorInput_1) {
                return this.primary.matches(otherInput.primary) && this.secondary.matches(otherInput.secondary);
            }
            if ((0, editor_1.isResourceSideBySideEditorInput)(otherInput)) {
                return this.primary.matches(otherInput.primary) && this.secondary.matches(otherInput.secondary);
            }
            return false;
        }
    };
    exports.SideBySideEditorInput = SideBySideEditorInput;
    exports.SideBySideEditorInput = SideBySideEditorInput = SideBySideEditorInput_1 = __decorate([
        __param(4, editorService_1.IEditorService)
    ], SideBySideEditorInput);
    class AbstractSideBySideEditorInputSerializer {
        canSerialize(editorInput) {
            const input = editorInput;
            if (input.primary && input.secondary) {
                const [secondaryInputSerializer, primaryInputSerializer] = this.getSerializers(input.secondary.typeId, input.primary.typeId);
                return !!(secondaryInputSerializer?.canSerialize(input.secondary) && primaryInputSerializer?.canSerialize(input.primary));
            }
            return false;
        }
        serialize(editorInput) {
            const input = editorInput;
            if (input.primary && input.secondary) {
                const [secondaryInputSerializer, primaryInputSerializer] = this.getSerializers(input.secondary.typeId, input.primary.typeId);
                if (primaryInputSerializer && secondaryInputSerializer) {
                    const primarySerialized = primaryInputSerializer.serialize(input.primary);
                    const secondarySerialized = secondaryInputSerializer.serialize(input.secondary);
                    if (primarySerialized && secondarySerialized) {
                        const serializedEditorInput = {
                            name: input.getPreferredName(),
                            description: input.getPreferredDescription(),
                            primarySerialized: primarySerialized,
                            secondarySerialized: secondarySerialized,
                            primaryTypeId: input.primary.typeId,
                            secondaryTypeId: input.secondary.typeId
                        };
                        return JSON.stringify(serializedEditorInput);
                    }
                }
            }
            return undefined;
        }
        deserialize(instantiationService, serializedEditorInput) {
            const deserialized = JSON.parse(serializedEditorInput);
            const [secondaryInputSerializer, primaryInputSerializer] = this.getSerializers(deserialized.secondaryTypeId, deserialized.primaryTypeId);
            if (primaryInputSerializer && secondaryInputSerializer) {
                const primaryInput = primaryInputSerializer.deserialize(instantiationService, deserialized.primarySerialized);
                const secondaryInput = secondaryInputSerializer.deserialize(instantiationService, deserialized.secondarySerialized);
                if (primaryInput instanceof editorInput_1.EditorInput && secondaryInput instanceof editorInput_1.EditorInput) {
                    return this.createEditorInput(instantiationService, deserialized.name, deserialized.description, secondaryInput, primaryInput);
                }
            }
            return undefined;
        }
        getSerializers(secondaryEditorInputTypeId, primaryEditorInputTypeId) {
            const registry = platform_1.Registry.as(editor_1.EditorExtensions.EditorFactory);
            return [registry.getEditorSerializer(secondaryEditorInputTypeId), registry.getEditorSerializer(primaryEditorInputTypeId)];
        }
    }
    exports.AbstractSideBySideEditorInputSerializer = AbstractSideBySideEditorInputSerializer;
    class SideBySideEditorInputSerializer extends AbstractSideBySideEditorInputSerializer {
        createEditorInput(instantiationService, name, description, secondaryInput, primaryInput) {
            return instantiationService.createInstance(SideBySideEditorInput, name, description, secondaryInput, primaryInput);
        }
    }
    exports.SideBySideEditorInputSerializer = SideBySideEditorInputSerializer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lkZUJ5U2lkZUVkaXRvcklucHV0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbW1vbi9lZGl0b3Ivc2lkZUJ5U2lkZUVkaXRvcklucHV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFZaEc7O09BRUc7SUFDSSxJQUFNLHFCQUFxQixHQUEzQixNQUFNLHFCQUFzQixTQUFRLHlCQUFXOztpQkFFckMsT0FBRSxHQUFXLDhDQUE4QyxBQUF6RCxDQUEwRDtRQUU1RSxJQUFhLE1BQU07WUFDbEIsT0FBTyx1QkFBcUIsQ0FBQyxFQUFFLENBQUM7UUFDakMsQ0FBQztRQUVELElBQWEsWUFBWTtZQUV4QixtREFBbUQ7WUFDbkQsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUM7WUFFN0MsbURBQW1EO1lBQ25ELHNDQUFzQztZQUN0QyxZQUFZLElBQUksaURBQXdDLENBQUM7WUFFekQsNkNBQTZDO1lBQzdDLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLGdEQUF1QyxFQUFFO2dCQUN4RSxZQUFZLGtEQUF5QyxDQUFDO2FBQ3REO1lBRUQsaURBQWlEO1lBQ2pELElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLDJDQUFtQyxFQUFFO2dCQUNwRSxZQUFZLDZDQUFxQyxDQUFDO2FBQ2xEO1lBRUQsd0NBQXdDO1lBQ3hDLFlBQVkscURBQTJDLENBQUM7WUFFeEQsT0FBTyxZQUFZLENBQUM7UUFDckIsQ0FBQztRQUVELElBQUksUUFBUTtZQUNYLElBQUksSUFBSSxDQUFDLGlCQUFpQixFQUFFO2dCQUMzQixrRUFBa0U7Z0JBQ2xFLGlFQUFpRTtnQkFDakUsOERBQThEO2dCQUM5RCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDO2FBQzdCO1lBRUQsT0FBTyxTQUFTLENB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