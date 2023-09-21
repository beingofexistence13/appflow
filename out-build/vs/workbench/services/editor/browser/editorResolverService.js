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
define(["require", "exports", "vs/base/common/glob", "vs/base/common/arrays", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/base/common/uri", "vs/platform/configuration/common/configuration", "vs/platform/editor/common/editor", "vs/workbench/common/editor", "vs/workbench/services/editor/common/editorGroupsService", "vs/base/common/network", "vs/workbench/services/editor/common/editorResolverService", "vs/platform/quickinput/common/quickInput", "vs/nls!vs/workbench/services/editor/browser/editorResolverService", "vs/platform/notification/common/notification", "vs/platform/telemetry/common/telemetry", "vs/platform/instantiation/common/extensions", "vs/platform/storage/common/storage", "vs/workbench/services/extensions/common/extensions", "vs/platform/log/common/log", "vs/workbench/services/editor/common/editorGroupFinder", "vs/platform/instantiation/common/instantiation", "vs/workbench/common/editor/sideBySideEditorInput", "vs/base/common/event"], function (require, exports, glob, arrays_1, lifecycle_1, resources_1, uri_1, configuration_1, editor_1, editor_2, editorGroupsService_1, network_1, editorResolverService_1, quickInput_1, nls_1, notification_1, telemetry_1, extensions_1, storage_1, extensions_2, log_1, editorGroupFinder_1, instantiation_1, sideBySideEditorInput_1, event_1) {
    "use strict";
    var $Myb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Myb = void 0;
    let $Myb = class $Myb extends lifecycle_1.$kc {
        static { $Myb_1 = this; }
        // Constants
        static { this.g = 'promptOpenWith.configureDefault'; }
        static { this.h = 'editorOverrideService.cache'; }
        static { this.j = 'editorOverrideService.conflictingDefaults'; }
        constructor(t, u, w, y, z, C, D, F, G) {
            super();
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
            this.C = C;
            this.D = D;
            this.F = F;
            this.G = G;
            // Events
            this.f = this.B(new event_1.$id());
            this.onDidChangeEditorRegistrations = this.f.event;
            // Data Stores
            this.m = new Map();
            this.n = new Map();
            this.r = true;
            // Read in the cache on statup
            this.s = new Set(JSON.parse(this.D.get($Myb_1.h, 0 /* StorageScope.PROFILE */, JSON.stringify([]))));
            this.D.remove($Myb_1.h, 0 /* StorageScope.PROFILE */);
            this.B(this.D.onWillSaveState(() => {
                // We want to store the glob patterns we would activate on, this allows us to know if we need to await the ext host on startup for opening a resource
                this.Y();
            }));
            // When extensions have registered we no longer need the cache
            this.F.onDidRegisterExtensions(() => {
                this.s = undefined;
            });
        }
        H(editor, preferredGroup) {
            const untypedEditor = editor;
            // Use the untyped editor to find a group
            const [group, activation] = this.u.invokeFunction(editorGroupFinder_1.$Rxb, untypedEditor, preferredGroup);
            return [untypedEditor, group, activation];
        }
        async resolveEditor(editor, preferredGroup) {
            // Update the flattened editors
            this.n = this.L();
            // Special case: side by side editors requires us to
            // independently resolve both sides and then build
            // a side by side editor with the result
            if ((0, editor_2.$PE)(editor)) {
                return this.I(editor, preferredGroup);
            }
            const resolvedUntypedAndGroup = this.H(editor, preferredGroup);
            if (!resolvedUntypedAndGroup) {
                return 2 /* ResolvedStatus.NONE */;
            }
            // Get the resolved untyped editor, group, and activation
            const [untypedEditor, group, activation] = resolvedUntypedAndGroup;
            if (activation) {
                untypedEditor.options = { ...untypedEditor.options, activation };
            }
            let resource = editor_2.$3E.getCanonicalUri(untypedEditor, { supportSideBySide: editor_2.SideBySideEditor.PRIMARY });
            // If it was resolved before we await for the extensions to activate and then proceed with resolution or else the backing extensions won't be registered
            if (this.s && resource && this.Z(resource)) {
                await this.F.whenInstalledExtensionsRegistered();
            }
            // Undefined resource -> untilted. Other malformed URI's are unresolvable
            if (resource === undefined) {
                resource = uri_1.URI.from({ scheme: network_1.Schemas.untitled });
            }
            else if (resource.scheme === undefined || resource === null) {
                return 2 /* ResolvedStatus.NONE */;
            }
            if (untypedEditor.options?.override === editor_1.EditorResolution.PICK) {
                const picked = await this.W(untypedEditor);
                // If the picker was cancelled we will stop resolving the editor
                if (!picked) {
                    return 1 /* ResolvedStatus.ABORT */;
                }
                // Populate the options with the new ones
                untypedEditor.options = picked;
            }
            // Resolved the editor ID as much as possible, now find a given editor (cast here is ok because we resolve down to a string above)
            let { editor: selectedEditor, conflictingDefault } = this.O(resource, untypedEditor.options?.override);
            // If no editor was found and this was a typed editor or an editor with an explicit override we could not resolve it
            if (!selectedEditor && (untypedEditor.options?.override || (0, editor_2.$YE)(editor))) {
                return 2 /* ResolvedStatus.NONE */;
            }
            else if (!selectedEditor) {
                // Simple untyped editors that we could not resolve will be resolved to the default editor
                const resolvedEditor = this.O(resource, editor_2.$HE.id);
                selectedEditor = resolvedEditor?.editor;
                conflictingDefault = resolvedEditor?.conflictingDefault;
                if (!selectedEditor) {
                    return 2 /* ResolvedStatus.NONE */;
                }
            }
            // In the special case of diff editors we do some more work to determine the correct editor for both sides
            if ((0, editor_2.$OE)(untypedEditor) && untypedEditor.options?.override === undefined) {
                let resource2 = editor_2.$3E.getCanonicalUri(untypedEditor, { supportSideBySide: editor_2.SideBySideEditor.SECONDARY });
                if (!resource2) {
                    resource2 = uri_1.URI.from({ scheme: network_1.Schemas.untitled });
                }
                const { editor: selectedEditor2 } = this.O(resource2, undefined);
                if (!selectedEditor2 || selectedEditor.editorInfo.id !== selectedEditor2.editorInfo.id) {
                    const { editor: selectedDiff, conflictingDefault: conflictingDefaultDiff } = this.O(resource, editor_2.$HE.id);
                    selectedEditor = selectedDiff;
                    conflictingDefault = conflictingDefaultDiff;
                }
                if (!selectedEditor) {
                    return 2 /* ResolvedStatus.NONE */;
                }
            }
            // If no override we take the selected editor id so that matches works with the isActive check
            untypedEditor.options = { override: selectedEditor.editorInfo.id, ...untypedEditor.options };
            // Check if diff can be created based on prescene of factory function
            if (selectedEditor.editorFactoryObject.createDiffEditorInput === undefined && (0, editor_2.$OE)(untypedEditor)) {
                return 2 /* ResolvedStatus.NONE */;
            }
            const input = await this.P(untypedEditor, group, selectedEditor);
            if (conflictingDefault && input) {
                // Show the conflicting default dialog
                await this.S(resource, selectedEditor.editorInfo.label, untypedEditor, input.editor, group);
            }
            if (input) {
                this.X(input.editor);
                if (input.editor.editorId !== selectedEditor.editorInfo.id) {
                    this.G.warn(`Editor ID Mismatch: ${input.editor.editorId} !== ${selectedEditor.editorInfo.id}. This will cause bugs. Please ensure editorInput.editorId matches the registered id`);
                }
                return { ...input, group };
            }
            return 1 /* ResolvedStatus.ABORT */;
        }
        async I(editor, preferredGroup) {
            const primaryResolvedEditor = await this.resolveEditor(editor.primary, preferredGroup);
            if (!(0, editor_2.$ZE)(primaryResolvedEditor)) {
                return 2 /* ResolvedStatus.NONE */;
            }
            const secondaryResolvedEditor = await this.resolveEditor(editor.secondary, primaryResolvedEditor.group ?? preferredGroup);
            if (!(0, editor_2.$ZE)(secondaryResolvedEditor)) {
                return 2 /* ResolvedStatus.NONE */;
            }
            return {
                group: primaryResolvedEditor.group ?? secondaryResolvedEditor.group,
                editor: this.u.createInstance(sideBySideEditorInput_1.$VC, editor.label, editor.description, secondaryResolvedEditor.editor, primaryResolvedEditor.editor),
                options: editor.options
            };
        }
        bufferChangeEvents(callback) {
            this.f.pause();
            try {
                callback();
            }
            finally {
                this.f.resume();
            }
        }
        registerEditor(globPattern, editorInfo, options, editorFactoryObject) {
            let registeredEditor = this.m.get(globPattern);
            if (registeredEditor === undefined) {
                registeredEditor = new Map();
                this.m.set(globPattern, registeredEditor);
            }
            let editorsWithId = registeredEditor.get(editorInfo.id);
            if (editorsWithId === undefined) {
                editorsWithId = [];
            }
            const remove = (0, arrays_1.$Sb)(editorsWithId, {
                globPattern,
                editorInfo,
                options,
                editorFactoryObject
            });
            registeredEditor.set(editorInfo.id, editorsWithId);
            this.r = true;
            this.f.fire();
            return (0, lifecycle_1.$ic)(() => {
                remove();
                if (editorsWithId && editorsWithId.length === 0) {
                    registeredEditor?.delete(editorInfo.id);
                }
                this.r = true;
                this.f.fire();
            });
        }
        getAssociationsForResource(resource) {
            const associations = this.J();
            let matchingAssociations = associations.filter(association => association.filenamePattern && (0, editorResolverService_1.$sbb)(association.filenamePattern, resource));
            // Sort matching associations based on glob length as a longer glob will be more specific
            matchingAssociations = matchingAssociations.sort((a, b) => (b.filenamePattern?.length ?? 0) - (a.filenamePattern?.length ?? 0));
            const allEditors = this.M;
            // Ensure that the settings are valid editors
            return matchingAssociations.filter(association => allEditors.find(c => c.editorInfo.id === association.viewType));
        }
        J() {
            const inspectedEditorAssociations = this.w.inspect(editorResolverService_1.$qbb) || {};
            const workspaceAssociations = inspectedEditorAssociations.workspaceValue ?? {};
            const userAssociations = inspectedEditorAssociations.userValue ?? {};
            const rawAssociations = { ...workspaceAssociations };
            // We want to apply the user associations on top of the workspace associations but ignore duplicate keys.
            for (const [key, value] of Object.entries(userAssociations)) {
                if (rawAssociations[key] === undefined) {
                    rawAssociations[key] = value;
                }
            }
            const associations = [];
            for (const [key, value] of Object.entries(rawAssociations)) {
                const association = {
                    filenamePattern: key,
                    viewType: value
                };
                associations.push(association);
            }
            return associations;
        }
        /**
         * Given the nested nature of the editors map, we merge factories of the same glob and id to make it flat
         * and easier to work with
         */
        L() {
            // If we shouldn't be re-flattening (due to lack of update) then return early
            if (!this.r) {
                return this.n;
            }
            this.r = false;
            const editors = new Map();
            for (const [glob, value] of this.m) {
                const registeredEditors = [];
                for (const editors of value.values()) {
                    let registeredEditor = undefined;
                    // Merge all editors with the same id and glob pattern together
                    for (const editor of editors) {
                        if (!registeredEditor) {
                            registeredEditor = {
                                editorInfo: editor.editorInfo,
                                globPattern: editor.globPattern,
                                options: {},
                                editorFactoryObject: {}
                            };
                        }
                        // Merge options and factories
                        registeredEditor.options = { ...registeredEditor.options, ...editor.options };
                        registeredEditor.editorFactoryObject = { ...registeredEditor.editorFactoryObject, ...editor.editorFactoryObject };
                    }
                    if (registeredEditor) {
                        registeredEditors.push(registeredEditor);
                    }
                }
                editors.set(glob, registeredEditors);
            }
            return editors;
        }
        /**
         * Returns all editors as an array. Possible to contain duplicates
         */
        get M() {
            return (0, arrays_1.$Pb)(Array.from(this.n.values()));
        }
        updateUserAssociations(globPattern, editorID) {
            const newAssociation = { viewType: editorID, filenamePattern: globPattern };
            const currentAssociations = this.J();
            const newSettingObject = Object.create(null);
            // Form the new setting object including the newest associations
            for (const association of [...currentAssociations, newAssociation]) {
                if (association.filenamePattern) {
                    newSettingObject[association.filenamePattern] = association.viewType;
                }
            }
            this.w.updateValue(editorResolverService_1.$qbb, newSettingObject);
        }
        N(resource) {
            // The user setting should be respected even if the editor doesn't specify that resource in package.json
            const userSettings = this.getAssociationsForResource(resource);
            const matchingEditors = [];
            // Then all glob patterns
            for (const [key, editors] of this.n) {
                for (const editor of editors) {
                    const foundInSettings = userSettings.find(setting => setting.viewType === editor.editorInfo.id);
                    if ((foundInSettings && editor.editorInfo.priority !== editorResolverService_1.RegisteredEditorPriority.exclusive) || (0, editorResolverService_1.$sbb)(key, resource)) {
                        matchingEditors.push(editor);
                    }
                }
            }
            // Return the editors sorted by their priority
            return matchingEditors.sort((a, b) => {
                // Very crude if priorities match longer glob wins as longer globs are normally more specific
                if ((0, editorResolverService_1.$rbb)(b.editorInfo.priority) === (0, editorResolverService_1.$rbb)(a.editorInfo.priority) && typeof b.globPattern === 'string' && typeof a.globPattern === 'string') {
                    return b.globPattern.length - a.globPattern.length;
                }
                return (0, editorResolverService_1.$rbb)(b.editorInfo.priority) - (0, editorResolverService_1.$rbb)(a.editorInfo.priority);
            });
        }
        getEditors(resource) {
            this.n = this.L();
            // By resource
            if (uri_1.URI.isUri(resource)) {
                const editors = this.N(resource);
                if (editors.find(e => e.editorInfo.priority === editorResolverService_1.RegisteredEditorPriority.exclusive)) {
                    return [];
                }
                return editors.map(editor => editor.editorInfo);
            }
            // All
            return (0, arrays_1.$Kb)(this.M.map(editor => editor.editorInfo), editor => editor.id);
        }
        /**
         * Given a resource and an editorId selects the best possible editor
         * @returns The editor and whether there was another default which conflicted with it
         */
        O(resource, editorId) {
            const findMatchingEditor = (editors, viewType) => {
                return editors.find((editor) => {
                    if (editor.options && editor.options.canSupportResource !== undefined) {
                        return editor.editorInfo.id === viewType && editor.options.canSupportResource(resource);
                    }
                    return editor.editorInfo.id === viewType;
                });
            };
            if (editorId && editorId !== editor_1.EditorResolution.EXCLUSIVE_ONLY) {
                // Specific id passed in doesn't have to match the resource, it can be anything
                const registeredEditors = this.M;
                return {
                    editor: findMatchingEditor(registeredEditors, editorId),
                    conflictingDefault: false
                };
            }
            const editors = this.N(resource);
            const associationsFromSetting = this.getAssociationsForResource(resource);
            // We only want minPriority+ if no user defined setting is found, else we won't resolve an editor
            const minPriority = editorId === editor_1.EditorResolution.EXCLUSIVE_ONLY ? editorResolverService_1.RegisteredEditorPriority.exclusive : editorResolverService_1.RegisteredEditorPriority.builtin;
            let possibleEditors = editors.filter(editor => (0, editorResolverService_1.$rbb)(editor.editorInfo.priority) >= (0, editorResolverService_1.$rbb)(minPriority) && editor.editorInfo.id !== editor_2.$HE.id);
            if (possibleEditors.length === 0) {
                return {
                    editor: associationsFromSetting[0] && minPriority !== editorResolverService_1.RegisteredEditorPriority.exclusive ? findMatchingEditor(editors, associationsFromSetting[0].viewType) : undefined,
                    conflictingDefault: false
                };
            }
            // If the editor is exclusive we use that, else use the user setting, else use the built-in+ editor
            const selectedViewType = possibleEditors[0].editorInfo.priority === editorResolverService_1.RegisteredEditorPriority.exclusive ?
                possibleEditors[0].editorInfo.id :
                associationsFromSetting[0]?.viewType || possibleEditors[0].editorInfo.id;
            let conflictingDefault = false;
            // Filter out exclusive before we check for conflicts as exclusive editors cannot be manually chosen
            possibleEditors = possibleEditors.filter(editor => editor.editorInfo.priority !== editorResolverService_1.RegisteredEditorPriority.exclusive);
            if (associationsFromSetting.length === 0 && possibleEditors.length > 1) {
                conflictingDefault = true;
            }
            return {
                editor: findMatchingEditor(editors, selectedViewType),
                conflictingDefault
            };
        }
        async P(editor, group, selectedEditor) {
            let options = editor.options;
            const resource = editor_2.$3E.getCanonicalUri(editor, { supportSideBySide: editor_2.SideBySideEditor.PRIMARY });
            // If no activation option is provided, populate it.
            if (options && typeof options.activation === 'undefined') {
                options = { ...options, activation: options.preserveFocus ? editor_1.EditorActivation.RESTORE : undefined };
            }
            // If it's a merge editor we trigger the create merge editor input
            if ((0, editor_2.$RE)(editor)) {
                if (!selectedEditor.editorFactoryObject.createMergeEditorInput) {
                    return;
                }
                const inputWithOptions = await selectedEditor.editorFactoryObject.createMergeEditorInput(editor, group);
                return { editor: inputWithOptions.editor, options: inputWithOptions.options ?? options };
            }
            // If it's a diff editor we trigger the create diff editor input
            if ((0, editor_2.$OE)(editor)) {
                if (!selectedEditor.editorFactoryObject.createDiffEditorInput) {
                    return;
                }
                const inputWithOptions = await selectedEditor.editorFactoryObject.createDiffEditorInput(editor, group);
                return { editor: inputWithOptions.editor, options: inputWithOptions.options ?? options };
            }
            if ((0, editor_2.$PE)(editor)) {
                throw new Error(`Untyped side by side editor input not supported here.`);
            }
            if ((0, editor_2.$QE)(editor)) {
                if (!selectedEditor.editorFactoryObject.createUntitledEditorInput) {
                    return;
                }
                const inputWithOptions = await selectedEditor.editorFactoryObject.createUntitledEditorInput(editor, group);
                return { editor: inputWithOptions.editor, options: inputWithOptions.options ?? options };
            }
            // Should no longer have an undefined resource so lets throw an error if that's somehow the case
            if (resource === undefined) {
                throw new Error(`Undefined resource on non untitled editor input.`);
            }
            // If the editor states it can only be opened once per resource we must close all existing ones except one and move the new one into the group
            const singleEditorPerResource = typeof selectedEditor.options?.singlePerResource === 'function' ? selectedEditor.options.singlePerResource() : selectedEditor.options?.singlePerResource;
            if (singleEditorPerResource) {
                const foundInput = await this.Q(resource, selectedEditor.editorInfo.id, group);
                if (foundInput) {
                    return { editor: foundInput, options };
                }
            }
            // If no factory is above, return flow back to caller letting them know we could not resolve it
            if (!selectedEditor.editorFactoryObject.createEditorInput) {
                return;
            }
            // Respect options passed back
            const inputWithOptions = await selectedEditor.editorFactoryObject.createEditorInput(editor, group);
            options = inputWithOptions.options ?? options;
            const input = inputWithOptions.editor;
            return { editor: input, options };
        }
        /**
         * Moves an editor with the resource and viewtype to target group if one exists
         * Additionally will close any other editors that are open for that resource and viewtype besides the first one found
         * @param resource The resource of the editor
         * @param viewType the viewtype of the editor
         * @param targetGroup The group to move it to
         * @returns An editor input if one exists, else undefined
         */
        async Q(resource, viewType, targetGroup) {
            const editorInfoForResource = this.R(resource, viewType);
            if (!editorInfoForResource.length) {
                return;
            }
            const editorToUse = editorInfoForResource[0];
            // We should only have one editor but if there are multiple we close the others
            for (const { editor, group } of editorInfoForResource) {
                if (editor !== editorToUse.editor) {
                    const closed = await group.closeEditor(editor);
                    if (!closed) {
                        return;
                    }
                }
            }
            // Move the editor already opened to the target group
            if (targetGroup.id !== editorToUse.group.id) {
                editorToUse.group.moveEditor(editorToUse.editor, targetGroup);
                return editorToUse.editor;
            }
            return;
        }
        /**
         * Given a resource and an editorId, returns all editors open for that resource and editorId.
         * @param resource The resource specified
         * @param editorId The editorID
         * @returns A list of editors
         */
        R(resource, editorId) {
            const out = [];
            const orderedGroups = (0, arrays_1.$Kb)([
                ...this.t.groups,
            ]);
            for (const group of orderedGroups) {
                for (const editor of group.editors) {
                    if ((0, resources_1.$bg)(editor.resource, resource) && editor.editorId === editorId) {
                        out.push({ editor, group });
                    }
                }
            }
            return out;
        }
        async S(resource, editorName, untypedInput, currentEditor, group) {
            const editors = this.N(resource);
            const storedChoices = JSON.parse(this.D.get($Myb_1.j, 0 /* StorageScope.PROFILE */, '{}'));
            const globForResource = `*${(0, resources_1.$gg)(resource)}`;
            // Writes to the storage service that a choice has been made for the currently installed editors
            const writeCurrentEditorsToStorage = () => {
                storedChoices[globForResource] = [];
                editors.forEach(editor => storedChoices[globForResource].push(editor.editorInfo.id));
                this.D.store($Myb_1.j, JSON.stringify(storedChoices), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            };
            // If the user has already made a choice for this editor we don't want to ask them again
            if (storedChoices[globForResource] && storedChoices[globForResource].find(editorID => editorID === currentEditor.editorId)) {
                return;
            }
            const handle = this.z.prompt(notification_1.Severity.Warning, (0, nls_1.localize)(0, null), [{
                    label: (0, nls_1.localize)(1, null),
                    run: async () => {
                        // Show the picker and tell it to update the setting to whatever the user selected
                        const picked = await this.W(untypedInput, true);
                        if (!picked) {
                            return;
                        }
                        untypedInput.options = picked;
                        const replacementEditor = await this.resolveEditor(untypedInput, group);
                        if (replacementEditor === 1 /* ResolvedStatus.ABORT */ || replacementEditor === 2 /* ResolvedStatus.NONE */) {
                            return;
                        }
                        // Replace the current editor with the picked one
                        group.replaceEditors([
                            {
                                editor: currentEditor,
                                replacement: replacementEditor.editor,
                                options: replacementEditor.options ?? picked,
                            }
                        ]);
                    }
                },
                {
                    label: (0, nls_1.localize)(2, null, editorName),
                    run: writeCurrentEditorsToStorage
                }
            ]);
            // If the user pressed X we assume they want to keep the current editor as default
            const onCloseListener = handle.onDidClose(() => {
                writeCurrentEditorsToStorage();
                onCloseListener.dispose();
            });
        }
        U(resource, showDefaultPicker) {
            const currentEditor = (0, arrays_1.$Mb)(this.t.activeGroup.findEditors(resource));
            // If untitled, we want all registered editors
            let registeredEditors = resource.scheme === network_1.Schemas.untitled ? this.M.filter(e => e.editorInfo.priority !== editorResolverService_1.RegisteredEditorPriority.exclusive) : this.N(resource);
            // We don't want duplicate Id entries
            registeredEditors = (0, arrays_1.$Kb)(registeredEditors, c => c.editorInfo.id);
            const defaultSetting = this.getAssociationsForResource(resource)[0]?.viewType;
            // Not the most efficient way to do this, but we want to ensure the text editor is at the top of the quickpick
            registeredEditors = registeredEditors.sort((a, b) => {
                if (a.editorInfo.id === editor_2.$HE.id) {
                    return -1;
                }
                else if (b.editorInfo.id === editor_2.$HE.id) {
                    return 1;
                }
                else {
                    return (0, editorResolverService_1.$rbb)(b.editorInfo.priority) - (0, editorResolverService_1.$rbb)(a.editorInfo.priority);
                }
            });
            const quickPickEntries = [];
            const currentlyActiveLabel = (0, nls_1.localize)(3, null);
            const currentDefaultLabel = (0, nls_1.localize)(4, null);
            const currentDefaultAndActiveLabel = (0, nls_1.localize)(5, null);
            // Default order = setting -> highest priority -> text
            let defaultViewType = defaultSetting;
            if (!defaultViewType && registeredEditors.length > 2 && registeredEditors[1]?.editorInfo.priority !== editorResolverService_1.RegisteredEditorPriority.option) {
                defaultViewType = registeredEditors[1]?.editorInfo.id;
            }
            if (!defaultViewType) {
                defaultViewType = editor_2.$HE.id;
            }
            // Map the editors to quickpick entries
            registeredEditors.forEach(editor => {
                const currentViewType = currentEditor?.editorId ?? editor_2.$HE.id;
                const isActive = currentEditor ? editor.editorInfo.id === currentViewType : false;
                const isDefault = editor.editorInfo.id === defaultViewType;
                const quickPickEntry = {
                    id: editor.editorInfo.id,
                    label: editor.editorInfo.label,
                    description: isActive && isDefault ? currentDefaultAndActiveLabel : isActive ? currentlyActiveLabel : isDefault ? currentDefaultLabel : undefined,
                    detail: editor.editorInfo.detail ?? editor.editorInfo.priority,
                };
                quickPickEntries.push(quickPickEntry);
            });
            if (!showDefaultPicker && (0, resources_1.$gg)(resource) !== '') {
                const separator = { type: 'separator' };
                quickPickEntries.push(separator);
                const configureDefaultEntry = {
                    id: $Myb_1.g,
                    label: (0, nls_1.localize)(6, null, `*${(0, resources_1.$gg)(resource)}`),
                };
                quickPickEntries.push(configureDefaultEntry);
            }
            return quickPickEntries;
        }
        async W(editor, showDefaultPicker) {
            let resource = editor_2.$3E.getOriginalUri(editor, { supportSideBySide: editor_2.SideBySideEditor.PRIMARY });
            if (resource === undefined) {
                resource = uri_1.URI.from({ scheme: network_1.Schemas.untitled });
            }
            // Get all the editors for the resource as quickpick entries
            const editorPicks = this.U(resource, showDefaultPicker);
            // Create the editor picker
            const editorPicker = this.y.createQuickPick();
            const placeHolderMessage = showDefaultPicker ?
                (0, nls_1.localize)(7, null, `*${(0, resources_1.$gg)(resource)}`) :
                (0, nls_1.localize)(8, null, (0, resources_1.$fg)(resource));
            editorPicker.placeholder = placeHolderMessage;
            editorPicker.canAcceptInBackground = true;
            editorPicker.items = editorPicks;
            const firstItem = editorPicker.items.find(item => item.type === 'item');
            if (firstItem) {
                editorPicker.selectedItems = [firstItem];
            }
            // Prompt the user to select an editor
            const picked = await new Promise(resolve => {
                editorPicker.onDidAccept(e => {
                    let result = undefined;
                    if (editorPicker.selectedItems.length === 1) {
                        result = {
                            item: editorPicker.selectedItems[0],
                            keyMods: editorPicker.keyMods,
                            openInBackground: e.inBackground
                        };
                    }
                    // If asked to always update the setting then update it even if the gear isn't clicked
                    if (resource && showDefaultPicker && result?.item.id) {
                        this.updateUserAssociations(`*${(0, resources_1.$gg)(resource)}`, result.item.id);
                    }
                    resolve(result);
                });
                editorPicker.onDidHide(() => resolve(undefined));
                editorPicker.onDidTriggerItemButton(e => {
                    // Trigger opening and close picker
                    resolve({ item: e.item, openInBackground: false });
                    // Persist setting
                    if (resource && e.item && e.item.id) {
                        this.updateUserAssociations(`*${(0, resources_1.$gg)(resource)}`, e.item.id);
                    }
                });
                editorPicker.show();
            });
            // Close picker
            editorPicker.dispose();
            // If the user picked an editor, look at how the picker was
            // used (e.g. modifier keys, open in background) and create the
            // options and group to use accordingly
            if (picked) {
                // If the user selected to configure default we trigger this picker again and tell it to show the default picker
                if (picked.item.id === $Myb_1.g) {
                    return this.W(editor, true);
                }
                // Figure out options
                const targetOptions = {
                    ...editor.options,
                    override: picked.item.id,
                    preserveFocus: picked.openInBackground || editor.options?.preserveFocus,
                };
                return targetOptions;
            }
            return undefined;
        }
        X(chosenInput) {
            if (chosenInput.editorId) {
                this.C.publicLog2('override.viewType', { viewType: chosenInput.editorId });
            }
        }
        Y() {
            // Create a set to store glob patterns
            const cacheStorage = new Set();
            // Store just the relative pattern pieces without any path info
            for (const [globPattern, contribPoint] of this.n) {
                const nonOptional = !!contribPoint.find(c => c.editorInfo.priority !== editorResolverService_1.RegisteredEditorPriority.option && c.editorInfo.id !== editor_2.$HE.id);
                // Don't keep a cache of the optional ones as those wouldn't be opened on start anyways
                if (!nonOptional) {
                    continue;
                }
                if (glob.$sj(globPattern)) {
                    cacheStorage.add(`${globPattern.pattern}`);
                }
                else {
                    cacheStorage.add(globPattern);
                }
            }
            // Also store the users settings as those would have to activate on startup as well
            const userAssociations = this.J();
            for (const association of userAssociations) {
                if (association.filenamePattern) {
                    cacheStorage.add(association.filenamePattern);
                }
            }
            this.D.store($Myb_1.h, JSON.stringify(Array.from(cacheStorage)), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
        }
        Z(resource) {
            if (!this.s) {
                return false;
            }
            for (const cacheEntry of this.s) {
                if ((0, editorResolverService_1.$sbb)(cacheEntry, resource)) {
                    return true;
                }
            }
            return false;
        }
    };
    exports.$Myb = $Myb;
    exports.$Myb = $Myb = $Myb_1 = __decorate([
        __param(0, editorGroupsService_1.$5C),
        __param(1, instantiation_1.$Ah),
        __param(2, configuration_1.$8h),
        __param(3, quickInput_1.$Gq),
        __param(4, notification_1.$Yu),
        __param(5, telemetry_1.$9k),
        __param(6, storage_1.$Vo),
        __param(7, extensions_2.$MF),
        __param(8, log_1.$5i)
    ], $Myb);
    (0, extensions_1.$mr)(editorResolverService_1.$pbb, $Myb, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=editorResolverService.js.map