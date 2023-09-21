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
define(["require", "exports", "vs/base/common/event", "vs/nls!vs/workbench/common/editor/sideBySideEditorInput", "vs/platform/registry/common/platform", "vs/workbench/common/editor", "vs/workbench/common/editor/editorInput", "vs/workbench/services/editor/common/editorService"], function (require, exports, event_1, nls_1, platform_1, editor_1, editorInput_1, editorService_1) {
    "use strict";
    var $VC_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$XC = exports.$WC = exports.$VC = void 0;
    /**
     * Side by side editor inputs that have a primary and secondary side.
     */
    let $VC = class $VC extends editorInput_1.$tA {
        static { $VC_1 = this; }
        static { this.ID = 'workbench.editorinputs.sidebysideEditorInput'; }
        get typeId() {
            return $VC_1.ID;
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
            if (this.c) {
                // pretend to be just primary side when being asked for a resource
                // in case both sides are the same. this can help when components
                // want to identify this input among others (e.g. in history).
                return this.primary.resource;
            }
            return undefined;
        }
        constructor(j, m, secondary, primary, n) {
            super();
            this.j = j;
            this.m = m;
            this.secondary = secondary;
            this.primary = primary;
            this.n = n;
            this.c = this.primary.matches(this.secondary);
            this.r();
        }
        r() {
            // When the primary or secondary input gets disposed, dispose this diff editor input
            this.B(event_1.Event.once(event_1.Event.any(this.primary.onWillDispose, this.secondary.onWillDispose))(() => {
                if (!this.isDisposed()) {
                    this.dispose();
                }
            }));
            // Re-emit some events from the primary side to the outside
            this.B(this.primary.onDidChangeDirty(() => this.a.fire()));
            // Re-emit some events from both sides to the outside
            this.B(this.primary.onDidChangeCapabilities(() => this.f.fire()));
            this.B(this.secondary.onDidChangeCapabilities(() => this.f.fire()));
            this.B(this.primary.onDidChangeLabel(() => this.b.fire()));
            this.B(this.secondary.onDidChangeLabel(() => this.b.fire()));
        }
        getName() {
            const preferredName = this.getPreferredName();
            if (preferredName) {
                return preferredName;
            }
            if (this.c) {
                return this.primary.getName(); // keep name concise when same editor is opened side by side
            }
            return (0, nls_1.localize)(0, null, this.secondary.getName(), this.primary.getName());
        }
        getPreferredName() {
            return this.j;
        }
        getDescription(verbosity) {
            const preferredDescription = this.getPreferredDescription();
            if (preferredDescription) {
                return preferredDescription;
            }
            if (this.c) {
                return this.primary.getDescription(verbosity);
            }
            return super.getDescription(verbosity);
        }
        getPreferredDescription() {
            return this.m;
        }
        getTitle(verbosity) {
            if (this.c) {
                return this.primary.getTitle(verbosity) ?? this.getName();
            }
            return super.getTitle(verbosity);
        }
        getLabelExtraClasses() {
            if (this.c) {
                return this.primary.getLabelExtraClasses();
            }
            return super.getLabelExtraClasses();
        }
        getAriaLabel() {
            if (this.c) {
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
            return this.s(primarySaveResult);
        }
        async saveAs(group, options) {
            const primarySaveResult = await this.primary.saveAs(group, options);
            return this.s(primarySaveResult);
        }
        s(primarySaveResult) {
            if (!primarySaveResult || !this.c) {
                return primarySaveResult;
            }
            if (this.primary.matches(primarySaveResult)) {
                return this;
            }
            if (primarySaveResult instanceof editorInput_1.$tA) {
                return new $VC_1(this.j, this.m, primarySaveResult, primarySaveResult, this.n);
            }
            if (!(0, editor_1.$OE)(primarySaveResult) && !(0, editor_1.$PE)(primarySaveResult) && !(0, editor_1.$RE)(primarySaveResult)) {
                return {
                    primary: primarySaveResult,
                    secondary: primarySaveResult,
                    label: this.j,
                    description: this.m
                };
            }
            return undefined;
        }
        revert(group, options) {
            return this.primary.revert(group, options);
        }
        async rename(group, target) {
            if (!this.c) {
                return; // currently only enabled when both sides are identical
            }
            // Forward rename to primary side
            const renameResult = await this.primary.rename(group, target);
            if (!renameResult) {
                return undefined;
            }
            // Build a side-by-side result from the rename result
            if ((0, editor_1.$UE)(renameResult.editor)) {
                return {
                    editor: new $VC_1(this.j, this.m, renameResult.editor, renameResult.editor, this.n),
                    options: {
                        ...renameResult.options,
                        viewState: (0, editor_1.$ME)(this, group, this.n)
                    }
                };
            }
            if ((0, editor_1.$NE)(renameResult.editor)) {
                return {
                    editor: {
                        label: this.j,
                        description: this.m,
                        primary: renameResult.editor,
                        secondary: renameResult.editor,
                        options: {
                            ...renameResult.options,
                            viewState: (0, editor_1.$ME)(this, group, this.n)
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
                !(0, editor_1.$OE)(primaryResourceEditorInput) && !(0, editor_1.$OE)(secondaryResourceEditorInput) &&
                !(0, editor_1.$PE)(primaryResourceEditorInput) && !(0, editor_1.$PE)(secondaryResourceEditorInput) &&
                !(0, editor_1.$RE)(primaryResourceEditorInput) && !(0, editor_1.$RE)(secondaryResourceEditorInput)) {
                const untypedInput = {
                    label: this.j,
                    description: this.m,
                    primary: primaryResourceEditorInput,
                    secondary: secondaryResourceEditorInput
                };
                if (typeof options?.preserveViewState === 'number') {
                    untypedInput.options = {
                        viewState: (0, editor_1.$ME)(this, options.preserveViewState, this.n)
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
            if ((0, editor_1.$WE)(otherInput) || (0, editor_1.$OE)(otherInput)) {
                return false; // prevent subclass from matching
            }
            if (otherInput instanceof $VC_1) {
                return this.primary.matches(otherInput.primary) && this.secondary.matches(otherInput.secondary);
            }
            if ((0, editor_1.$PE)(otherInput)) {
                return this.primary.matches(otherInput.primary) && this.secondary.matches(otherInput.secondary);
            }
            return false;
        }
    };
    exports.$VC = $VC;
    exports.$VC = $VC = $VC_1 = __decorate([
        __param(4, editorService_1.$9C)
    ], $VC);
    class $WC {
        canSerialize(editorInput) {
            const input = editorInput;
            if (input.primary && input.secondary) {
                const [secondaryInputSerializer, primaryInputSerializer] = this.a(input.secondary.typeId, input.primary.typeId);
                return !!(secondaryInputSerializer?.canSerialize(input.secondary) && primaryInputSerializer?.canSerialize(input.primary));
            }
            return false;
        }
        serialize(editorInput) {
            const input = editorInput;
            if (input.primary && input.secondary) {
                const [secondaryInputSerializer, primaryInputSerializer] = this.a(input.secondary.typeId, input.primary.typeId);
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
            const [secondaryInputSerializer, primaryInputSerializer] = this.a(deserialized.secondaryTypeId, deserialized.primaryTypeId);
            if (primaryInputSerializer && secondaryInputSerializer) {
                const primaryInput = primaryInputSerializer.deserialize(instantiationService, deserialized.primarySerialized);
                const secondaryInput = secondaryInputSerializer.deserialize(instantiationService, deserialized.secondarySerialized);
                if (primaryInput instanceof editorInput_1.$tA && secondaryInput instanceof editorInput_1.$tA) {
                    return this.b(instantiationService, deserialized.name, deserialized.description, secondaryInput, primaryInput);
                }
            }
            return undefined;
        }
        a(secondaryEditorInputTypeId, primaryEditorInputTypeId) {
            const registry = platform_1.$8m.as(editor_1.$GE.EditorFactory);
            return [registry.getEditorSerializer(secondaryEditorInputTypeId), registry.getEditorSerializer(primaryEditorInputTypeId)];
        }
    }
    exports.$WC = $WC;
    class $XC extends $WC {
        b(instantiationService, name, description, secondaryInput, primaryInput) {
            return instantiationService.createInstance($VC, name, description, secondaryInput, primaryInput);
        }
    }
    exports.$XC = $XC;
});
//# sourceMappingURL=sideBySideEditorInput.js.map