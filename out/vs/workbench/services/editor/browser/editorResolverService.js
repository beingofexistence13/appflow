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
define(["require", "exports", "vs/base/common/glob", "vs/base/common/arrays", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/base/common/uri", "vs/platform/configuration/common/configuration", "vs/platform/editor/common/editor", "vs/workbench/common/editor", "vs/workbench/services/editor/common/editorGroupsService", "vs/base/common/network", "vs/workbench/services/editor/common/editorResolverService", "vs/platform/quickinput/common/quickInput", "vs/nls", "vs/platform/notification/common/notification", "vs/platform/telemetry/common/telemetry", "vs/platform/instantiation/common/extensions", "vs/platform/storage/common/storage", "vs/workbench/services/extensions/common/extensions", "vs/platform/log/common/log", "vs/workbench/services/editor/common/editorGroupFinder", "vs/platform/instantiation/common/instantiation", "vs/workbench/common/editor/sideBySideEditorInput", "vs/base/common/event"], function (require, exports, glob, arrays_1, lifecycle_1, resources_1, uri_1, configuration_1, editor_1, editor_2, editorGroupsService_1, network_1, editorResolverService_1, quickInput_1, nls_1, notification_1, telemetry_1, extensions_1, storage_1, extensions_2, log_1, editorGroupFinder_1, instantiation_1, sideBySideEditorInput_1, event_1) {
    "use strict";
    var EditorResolverService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditorResolverService = void 0;
    let EditorResolverService = class EditorResolverService extends lifecycle_1.Disposable {
        static { EditorResolverService_1 = this; }
        // Constants
        static { this.configureDefaultID = 'promptOpenWith.configureDefault'; }
        static { this.cacheStorageID = 'editorOverrideService.cache'; }
        static { this.conflictingDefaultsStorageID = 'editorOverrideService.conflictingDefaults'; }
        constructor(editorGroupService, instantiationService, configurationService, quickInputService, notificationService, telemetryService, storageService, extensionService, logService) {
            super();
            this.editorGroupService = editorGroupService;
            this.instantiationService = instantiationService;
            this.configurationService = configurationService;
            this.quickInputService = quickInputService;
            this.notificationService = notificationService;
            this.telemetryService = telemetryService;
            this.storageService = storageService;
            this.extensionService = extensionService;
            this.logService = logService;
            // Events
            this._onDidChangeEditorRegistrations = this._register(new event_1.PauseableEmitter());
            this.onDidChangeEditorRegistrations = this._onDidChangeEditorRegistrations.event;
            // Data Stores
            this._editors = new Map();
            this._flattenedEditors = new Map();
            this._shouldReFlattenEditors = true;
            // Read in the cache on statup
            this.cache = new Set(JSON.parse(this.storageService.get(EditorResolverService_1.cacheStorageID, 0 /* StorageScope.PROFILE */, JSON.stringify([]))));
            this.storageService.remove(EditorResolverService_1.cacheStorageID, 0 /* StorageScope.PROFILE */);
            this._register(this.storageService.onWillSaveState(() => {
                // We want to store the glob patterns we would activate on, this allows us to know if we need to await the ext host on startup for opening a resource
                this.cacheEditors();
            }));
            // When extensions have registered we no longer need the cache
            this.extensionService.onDidRegisterExtensions(() => {
                this.cache = undefined;
            });
        }
        resolveUntypedInputAndGroup(editor, preferredGroup) {
            const untypedEditor = editor;
            // Use the untyped editor to find a group
            const [group, activation] = this.instantiationService.invokeFunction(editorGroupFinder_1.findGroup, untypedEditor, preferredGroup);
            return [untypedEditor, group, activation];
        }
        async resolveEditor(editor, preferredGroup) {
            // Update the flattened editors
            this._flattenedEditors = this._flattenEditorsMap();
            // Special case: side by side editors requires us to
            // independently resolve both sides and then build
            // a side by side editor with the result
            if ((0, editor_2.isResourceSideBySideEditorInput)(editor)) {
                return this.doResolveSideBySideEditor(editor, preferredGroup);
            }
            const resolvedUntypedAndGroup = this.resolveUntypedInputAndGroup(editor, preferredGroup);
            if (!resolvedUntypedAndGroup) {
                return 2 /* ResolvedStatus.NONE */;
            }
            // Get the resolved untyped editor, group, and activation
            const [untypedEditor, group, activation] = resolvedUntypedAndGroup;
            if (activation) {
                untypedEditor.options = { ...untypedEditor.options, activation };
            }
            let resource = editor_2.EditorResourceAccessor.getCanonicalUri(untypedEditor, { supportSideBySide: editor_2.SideBySideEditor.PRIMARY });
            // If it was resolved before we await for the extensions to activate and then proceed with resolution or else the backing extensions won't be registered
            if (this.cache && resource && this.resourceMatchesCache(resource)) {
                await this.extensionService.whenInstalledExtensionsRegistered();
            }
            // Undefined resource -> untilted. Other malformed URI's are unresolvable
            if (resource === undefined) {
                resource = uri_1.URI.from({ scheme: network_1.Schemas.untitled });
            }
            else if (resource.scheme === undefined || resource === null) {
                return 2 /* ResolvedStatus.NONE */;
            }
            if (untypedEditor.options?.override === editor_1.EditorResolution.PICK) {
                const picked = await this.doPickEditor(untypedEditor);
                // If the picker was cancelled we will stop resolving the editor
                if (!picked) {
                    return 1 /* ResolvedStatus.ABORT */;
                }
                // Populate the options with the new ones
                untypedEditor.options = picked;
            }
            // Resolved the editor ID as much as possible, now find a given editor (cast here is ok because we resolve down to a string above)
            let { editor: selectedEditor, conflictingDefault } = this.getEditor(resource, untypedEditor.options?.override);
            // If no editor was found and this was a typed editor or an editor with an explicit override we could not resolve it
            if (!selectedEditor && (untypedEditor.options?.override || (0, editor_2.isEditorInputWithOptions)(editor))) {
                return 2 /* ResolvedStatus.NONE */;
            }
            else if (!selectedEditor) {
                // Simple untyped editors that we could not resolve will be resolved to the default editor
                const resolvedEditor = this.getEditor(resource, editor_2.DEFAULT_EDITOR_ASSOCIATION.id);
                selectedEditor = resolvedEditor?.editor;
                conflictingDefault = resolvedEditor?.conflictingDefault;
                if (!selectedEditor) {
                    return 2 /* ResolvedStatus.NONE */;
                }
            }
            // In the special case of diff editors we do some more work to determine the correct editor for both sides
            if ((0, editor_2.isResourceDiffEditorInput)(untypedEditor) && untypedEditor.options?.override === undefined) {
                let resource2 = editor_2.EditorResourceAccessor.getCanonicalUri(untypedEditor, { supportSideBySide: editor_2.SideBySideEditor.SECONDARY });
                if (!resource2) {
                    resource2 = uri_1.URI.from({ scheme: network_1.Schemas.untitled });
                }
                const { editor: selectedEditor2 } = this.getEditor(resource2, undefined);
                if (!selectedEditor2 || selectedEditor.editorInfo.id !== selectedEditor2.editorInfo.id) {
                    const { editor: selectedDiff, conflictingDefault: conflictingDefaultDiff } = this.getEditor(resource, editor_2.DEFAULT_EDITOR_ASSOCIATION.id);
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
            if (selectedEditor.editorFactoryObject.createDiffEditorInput === undefined && (0, editor_2.isResourceDiffEditorInput)(untypedEditor)) {
                return 2 /* ResolvedStatus.NONE */;
            }
            const input = await this.doResolveEditor(untypedEditor, group, selectedEditor);
            if (conflictingDefault && input) {
                // Show the conflicting default dialog
                await this.doHandleConflictingDefaults(resource, selectedEditor.editorInfo.label, untypedEditor, input.editor, group);
            }
            if (input) {
                this.sendEditorResolutionTelemetry(input.editor);
                if (input.editor.editorId !== selectedEditor.editorInfo.id) {
                    this.logService.warn(`Editor ID Mismatch: ${input.editor.editorId} !== ${selectedEditor.editorInfo.id}. This will cause bugs. Please ensure editorInput.editorId matches the registered id`);
                }
                return { ...input, group };
            }
            return 1 /* ResolvedStatus.ABORT */;
        }
        async doResolveSideBySideEditor(editor, preferredGroup) {
            const primaryResolvedEditor = await this.resolveEditor(editor.primary, preferredGroup);
            if (!(0, editor_2.isEditorInputWithOptionsAndGroup)(primaryResolvedEditor)) {
                return 2 /* ResolvedStatus.NONE */;
            }
            const secondaryResolvedEditor = await this.resolveEditor(editor.secondary, primaryResolvedEditor.group ?? preferredGroup);
            if (!(0, editor_2.isEditorInputWithOptionsAndGroup)(secondaryResolvedEditor)) {
                return 2 /* ResolvedStatus.NONE */;
            }
            return {
                group: primaryResolvedEditor.group ?? secondaryResolvedEditor.group,
                editor: this.instantiationService.createInstance(sideBySideEditorInput_1.SideBySideEditorInput, editor.label, editor.description, secondaryResolvedEditor.editor, primaryResolvedEditor.editor),
                options: editor.options
            };
        }
        bufferChangeEvents(callback) {
            this._onDidChangeEditorRegistrations.pause();
            try {
                callback();
            }
            finally {
                this._onDidChangeEditorRegistrations.resume();
            }
        }
        registerEditor(globPattern, editorInfo, options, editorFactoryObject) {
            let registeredEditor = this._editors.get(globPattern);
            if (registeredEditor === undefined) {
                registeredEditor = new Map();
                this._editors.set(globPattern, registeredEditor);
            }
            let editorsWithId = registeredEditor.get(editorInfo.id);
            if (editorsWithId === undefined) {
                editorsWithId = [];
            }
            const remove = (0, arrays_1.insert)(editorsWithId, {
                globPattern,
                editorInfo,
                options,
                editorFactoryObject
            });
            registeredEditor.set(editorInfo.id, editorsWithId);
            this._shouldReFlattenEditors = true;
            this._onDidChangeEditorRegistrations.fire();
            return (0, lifecycle_1.toDisposable)(() => {
                remove();
                if (editorsWithId && editorsWithId.length === 0) {
                    registeredEditor?.delete(editorInfo.id);
                }
                this._shouldReFlattenEditors = true;
                this._onDidChangeEditorRegistrations.fire();
            });
        }
        getAssociationsForResource(resource) {
            const associations = this.getAllUserAssociations();
            let matchingAssociations = associations.filter(association => association.filenamePattern && (0, editorResolverService_1.globMatchesResource)(association.filenamePattern, resource));
            // Sort matching associations based on glob length as a longer glob will be more specific
            matchingAssociations = matchingAssociations.sort((a, b) => (b.filenamePattern?.length ?? 0) - (a.filenamePattern?.length ?? 0));
            const allEditors = this._registeredEditors;
            // Ensure that the settings are valid editors
            return matchingAssociations.filter(association => allEditors.find(c => c.editorInfo.id === association.viewType));
        }
        getAllUserAssociations() {
            const inspectedEditorAssociations = this.configurationService.inspect(editorResolverService_1.editorsAssociationsSettingId) || {};
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
        _flattenEditorsMap() {
            // If we shouldn't be re-flattening (due to lack of update) then return early
            if (!this._shouldReFlattenEditors) {
                return this._flattenedEditors;
            }
            this._shouldReFlattenEditors = false;
            const editors = new Map();
            for (const [glob, value] of this._editors) {
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
        get _registeredEditors() {
            return (0, arrays_1.flatten)(Array.from(this._flattenedEditors.values()));
        }
        updateUserAssociations(globPattern, editorID) {
            const newAssociation = { viewType: editorID, filenamePattern: globPattern };
            const currentAssociations = this.getAllUserAssociations();
            const newSettingObject = Object.create(null);
            // Form the new setting object including the newest associations
            for (const association of [...currentAssociations, newAssociation]) {
                if (association.filenamePattern) {
                    newSettingObject[association.filenamePattern] = association.viewType;
                }
            }
            this.configurationService.updateValue(editorResolverService_1.editorsAssociationsSettingId, newSettingObject);
        }
        findMatchingEditors(resource) {
            // The user setting should be respected even if the editor doesn't specify that resource in package.json
            const userSettings = this.getAssociationsForResource(resource);
            const matchingEditors = [];
            // Then all glob patterns
            for (const [key, editors] of this._flattenedEditors) {
                for (const editor of editors) {
                    const foundInSettings = userSettings.find(setting => setting.viewType === editor.editorInfo.id);
                    if ((foundInSettings && editor.editorInfo.priority !== editorResolverService_1.RegisteredEditorPriority.exclusive) || (0, editorResolverService_1.globMatchesResource)(key, resource)) {
                        matchingEditors.push(editor);
                    }
                }
            }
            // Return the editors sorted by their priority
            return matchingEditors.sort((a, b) => {
                // Very crude if priorities match longer glob wins as longer globs are normally more specific
                if ((0, editorResolverService_1.priorityToRank)(b.editorInfo.priority) === (0, editorResolverService_1.priorityToRank)(a.editorInfo.priority) && typeof b.globPattern === 'string' && typeof a.globPattern === 'string') {
                    return b.globPattern.length - a.globPattern.length;
                }
                return (0, editorResolverService_1.priorityToRank)(b.editorInfo.priority) - (0, editorResolverService_1.priorityToRank)(a.editorInfo.priority);
            });
        }
        getEditors(resource) {
            this._flattenedEditors = this._flattenEditorsMap();
            // By resource
            if (uri_1.URI.isUri(resource)) {
                const editors = this.findMatchingEditors(resource);
                if (editors.find(e => e.editorInfo.priority === editorResolverService_1.RegisteredEditorPriority.exclusive)) {
                    return [];
                }
                return editors.map(editor => editor.editorInfo);
            }
            // All
            return (0, arrays_1.distinct)(this._registeredEditors.map(editor => editor.editorInfo), editor => editor.id);
        }
        /**
         * Given a resource and an editorId selects the best possible editor
         * @returns The editor and whether there was another default which conflicted with it
         */
        getEditor(resource, editorId) {
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
                const registeredEditors = this._registeredEditors;
                return {
                    editor: findMatchingEditor(registeredEditors, editorId),
                    conflictingDefault: false
                };
            }
            const editors = this.findMatchingEditors(resource);
            const associationsFromSetting = this.getAssociationsForResource(resource);
            // We only want minPriority+ if no user defined setting is found, else we won't resolve an editor
            const minPriority = editorId === editor_1.EditorResolution.EXCLUSIVE_ONLY ? editorResolverService_1.RegisteredEditorPriority.exclusive : editorResolverService_1.RegisteredEditorPriority.builtin;
            let possibleEditors = editors.filter(editor => (0, editorResolverService_1.priorityToRank)(editor.editorInfo.priority) >= (0, editorResolverService_1.priorityToRank)(minPriority) && editor.editorInfo.id !== editor_2.DEFAULT_EDITOR_ASSOCIATION.id);
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
        async doResolveEditor(editor, group, selectedEditor) {
            let options = editor.options;
            const resource = editor_2.EditorResourceAccessor.getCanonicalUri(editor, { supportSideBySide: editor_2.SideBySideEditor.PRIMARY });
            // If no activation option is provided, populate it.
            if (options && typeof options.activation === 'undefined') {
                options = { ...options, activation: options.preserveFocus ? editor_1.EditorActivation.RESTORE : undefined };
            }
            // If it's a merge editor we trigger the create merge editor input
            if ((0, editor_2.isResourceMergeEditorInput)(editor)) {
                if (!selectedEditor.editorFactoryObject.createMergeEditorInput) {
                    return;
                }
                const inputWithOptions = await selectedEditor.editorFactoryObject.createMergeEditorInput(editor, group);
                return { editor: inputWithOptions.editor, options: inputWithOptions.options ?? options };
            }
            // If it's a diff editor we trigger the create diff editor input
            if ((0, editor_2.isResourceDiffEditorInput)(editor)) {
                if (!selectedEditor.editorFactoryObject.createDiffEditorInput) {
                    return;
                }
                const inputWithOptions = await selectedEditor.editorFactoryObject.createDiffEditorInput(editor, group);
                return { editor: inputWithOptions.editor, options: inputWithOptions.options ?? options };
            }
            if ((0, editor_2.isResourceSideBySideEditorInput)(editor)) {
                throw new Error(`Untyped side by side editor input not supported here.`);
            }
            if ((0, editor_2.isUntitledResourceEditorInput)(editor)) {
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
                const foundInput = await this.moveExistingEditorForResource(resource, selectedEditor.editorInfo.id, group);
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
        async moveExistingEditorForResource(resource, viewType, targetGroup) {
            const editorInfoForResource = this.findExistingEditorsForResource(resource, viewType);
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
        findExistingEditorsForResource(resource, editorId) {
            const out = [];
            const orderedGroups = (0, arrays_1.distinct)([
                ...this.editorGroupService.groups,
            ]);
            for (const group of orderedGroups) {
                for (const editor of group.editors) {
                    if ((0, resources_1.isEqual)(editor.resource, resource) && editor.editorId === editorId) {
                        out.push({ editor, group });
                    }
                }
            }
            return out;
        }
        async doHandleConflictingDefaults(resource, editorName, untypedInput, currentEditor, group) {
            const editors = this.findMatchingEditors(resource);
            const storedChoices = JSON.parse(this.storageService.get(EditorResolverService_1.conflictingDefaultsStorageID, 0 /* StorageScope.PROFILE */, '{}'));
            const globForResource = `*${(0, resources_1.extname)(resource)}`;
            // Writes to the storage service that a choice has been made for the currently installed editors
            const writeCurrentEditorsToStorage = () => {
                storedChoices[globForResource] = [];
                editors.forEach(editor => storedChoices[globForResource].push(editor.editorInfo.id));
                this.storageService.store(EditorResolverService_1.conflictingDefaultsStorageID, JSON.stringify(storedChoices), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            };
            // If the user has already made a choice for this editor we don't want to ask them again
            if (storedChoices[globForResource] && storedChoices[globForResource].find(editorID => editorID === currentEditor.editorId)) {
                return;
            }
            const handle = this.notificationService.prompt(notification_1.Severity.Warning, (0, nls_1.localize)('editorResolver.conflictingDefaults', 'There are multiple default editors available for the resource.'), [{
                    label: (0, nls_1.localize)('editorResolver.configureDefault', 'Configure Default'),
                    run: async () => {
                        // Show the picker and tell it to update the setting to whatever the user selected
                        const picked = await this.doPickEditor(untypedInput, true);
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
                    label: (0, nls_1.localize)('editorResolver.keepDefault', 'Keep {0}', editorName),
                    run: writeCurrentEditorsToStorage
                }
            ]);
            // If the user pressed X we assume they want to keep the current editor as default
            const onCloseListener = handle.onDidClose(() => {
                writeCurrentEditorsToStorage();
                onCloseListener.dispose();
            });
        }
        mapEditorsToQuickPickEntry(resource, showDefaultPicker) {
            const currentEditor = (0, arrays_1.firstOrDefault)(this.editorGroupService.activeGroup.findEditors(resource));
            // If untitled, we want all registered editors
            let registeredEditors = resource.scheme === network_1.Schemas.untitled ? this._registeredEditors.filter(e => e.editorInfo.priority !== editorResolverService_1.RegisteredEditorPriority.exclusive) : this.findMatchingEditors(resource);
            // We don't want duplicate Id entries
            registeredEditors = (0, arrays_1.distinct)(registeredEditors, c => c.editorInfo.id);
            const defaultSetting = this.getAssociationsForResource(resource)[0]?.viewType;
            // Not the most efficient way to do this, but we want to ensure the text editor is at the top of the quickpick
            registeredEditors = registeredEditors.sort((a, b) => {
                if (a.editorInfo.id === editor_2.DEFAULT_EDITOR_ASSOCIATION.id) {
                    return -1;
                }
                else if (b.editorInfo.id === editor_2.DEFAULT_EDITOR_ASSOCIATION.id) {
                    return 1;
                }
                else {
                    return (0, editorResolverService_1.priorityToRank)(b.editorInfo.priority) - (0, editorResolverService_1.priorityToRank)(a.editorInfo.priority);
                }
            });
            const quickPickEntries = [];
            const currentlyActiveLabel = (0, nls_1.localize)('promptOpenWith.currentlyActive', "Active");
            const currentDefaultLabel = (0, nls_1.localize)('promptOpenWith.currentDefault', "Default");
            const currentDefaultAndActiveLabel = (0, nls_1.localize)('promptOpenWith.currentDefaultAndActive', "Active and Default");
            // Default order = setting -> highest priority -> text
            let defaultViewType = defaultSetting;
            if (!defaultViewType && registeredEditors.length > 2 && registeredEditors[1]?.editorInfo.priority !== editorResolverService_1.RegisteredEditorPriority.option) {
                defaultViewType = registeredEditors[1]?.editorInfo.id;
            }
            if (!defaultViewType) {
                defaultViewType = editor_2.DEFAULT_EDITOR_ASSOCIATION.id;
            }
            // Map the editors to quickpick entries
            registeredEditors.forEach(editor => {
                const currentViewType = currentEditor?.editorId ?? editor_2.DEFAULT_EDITOR_ASSOCIATION.id;
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
            if (!showDefaultPicker && (0, resources_1.extname)(resource) !== '') {
                const separator = { type: 'separator' };
                quickPickEntries.push(separator);
                const configureDefaultEntry = {
                    id: EditorResolverService_1.configureDefaultID,
                    label: (0, nls_1.localize)('promptOpenWith.configureDefault', "Configure default editor for '{0}'...", `*${(0, resources_1.extname)(resource)}`),
                };
                quickPickEntries.push(configureDefaultEntry);
            }
            return quickPickEntries;
        }
        async doPickEditor(editor, showDefaultPicker) {
            let resource = editor_2.EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: editor_2.SideBySideEditor.PRIMARY });
            if (resource === undefined) {
                resource = uri_1.URI.from({ scheme: network_1.Schemas.untitled });
            }
            // Get all the editors for the resource as quickpick entries
            const editorPicks = this.mapEditorsToQuickPickEntry(resource, showDefaultPicker);
            // Create the editor picker
            const editorPicker = this.quickInputService.createQuickPick();
            const placeHolderMessage = showDefaultPicker ?
                (0, nls_1.localize)('promptOpenWith.updateDefaultPlaceHolder', "Select new default editor for '{0}'", `*${(0, resources_1.extname)(resource)}`) :
                (0, nls_1.localize)('promptOpenWith.placeHolder', "Select editor for '{0}'", (0, resources_1.basename)(resource));
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
                        this.updateUserAssociations(`*${(0, resources_1.extname)(resource)}`, result.item.id);
                    }
                    resolve(result);
                });
                editorPicker.onDidHide(() => resolve(undefined));
                editorPicker.onDidTriggerItemButton(e => {
                    // Trigger opening and close picker
                    resolve({ item: e.item, openInBackground: false });
                    // Persist setting
                    if (resource && e.item && e.item.id) {
                        this.updateUserAssociations(`*${(0, resources_1.extname)(resource)}`, e.item.id);
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
                if (picked.item.id === EditorResolverService_1.configureDefaultID) {
                    return this.doPickEditor(editor, true);
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
        sendEditorResolutionTelemetry(chosenInput) {
            if (chosenInput.editorId) {
                this.telemetryService.publicLog2('override.viewType', { viewType: chosenInput.editorId });
            }
        }
        cacheEditors() {
            // Create a set to store glob patterns
            const cacheStorage = new Set();
            // Store just the relative pattern pieces without any path info
            for (const [globPattern, contribPoint] of this._flattenedEditors) {
                const nonOptional = !!contribPoint.find(c => c.editorInfo.priority !== editorResolverService_1.RegisteredEditorPriority.option && c.editorInfo.id !== editor_2.DEFAULT_EDITOR_ASSOCIATION.id);
                // Don't keep a cache of the optional ones as those wouldn't be opened on start anyways
                if (!nonOptional) {
                    continue;
                }
                if (glob.isRelativePattern(globPattern)) {
                    cacheStorage.add(`${globPattern.pattern}`);
                }
                else {
                    cacheStorage.add(globPattern);
                }
            }
            // Also store the users settings as those would have to activate on startup as well
            const userAssociations = this.getAllUserAssociations();
            for (const association of userAssociations) {
                if (association.filenamePattern) {
                    cacheStorage.add(association.filenamePattern);
                }
            }
            this.storageService.store(EditorResolverService_1.cacheStorageID, JSON.stringify(Array.from(cacheStorage)), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
        }
        resourceMatchesCache(resource) {
            if (!this.cache) {
                return false;
            }
            for (const cacheEntry of this.cache) {
                if ((0, editorResolverService_1.globMatchesResource)(cacheEntry, resource)) {
                    return true;
                }
            }
            return false;
        }
    };
    exports.EditorResolverService = EditorResolverService;
    exports.EditorResolverService = EditorResolverService = EditorResolverService_1 = __decorate([
        __param(0, editorGroupsService_1.IEditorGroupsService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, quickInput_1.IQuickInputService),
        __param(4, notification_1.INotificationService),
        __param(5, telemetry_1.ITelemetryService),
        __param(6, storage_1.IStorageService),
        __param(7, extensions_2.IExtensionService),
        __param(8, log_1.ILogService)
    ], EditorResolverService);
    (0, extensions_1.registerSingleton)(editorResolverService_1.IEditorResolverService, EditorResolverService, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yUmVzb2x2ZXJTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2VkaXRvci9icm93c2VyL2VkaXRvclJlc29sdmVyU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBcUN6RixJQUFNLHFCQUFxQixHQUEzQixNQUFNLHFCQUFzQixTQUFRLHNCQUFVOztRQU9wRCxZQUFZO2lCQUNZLHVCQUFrQixHQUFHLGlDQUFpQyxBQUFwQyxDQUFxQztpQkFDdkQsbUJBQWMsR0FBRyw2QkFBNkIsQUFBaEMsQ0FBaUM7aUJBQy9DLGlDQUE0QixHQUFHLDJDQUEyQyxBQUE5QyxDQUErQztRQVFuRyxZQUN1QixrQkFBeUQsRUFDeEQsb0JBQTRELEVBQzVELG9CQUE0RCxFQUMvRCxpQkFBc0QsRUFDcEQsbUJBQTBELEVBQzdELGdCQUFvRCxFQUN0RCxjQUFnRCxFQUM5QyxnQkFBb0QsRUFDMUQsVUFBd0M7WUFFckQsS0FBSyxFQUFFLENBQUM7WUFWK0IsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFzQjtZQUN2Qyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQzNDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDOUMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUNuQyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXNCO1lBQzVDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFDckMsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQzdCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFDekMsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQXhCdEQsU0FBUztZQUNRLG9DQUErQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSx3QkFBZ0IsRUFBUSxDQUFDLENBQUM7WUFDdkYsbUNBQThC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