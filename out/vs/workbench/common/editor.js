/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/types", "vs/base/common/uri", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/platform/files/common/files", "vs/base/common/network", "vs/base/common/errorMessage", "vs/base/common/actions", "vs/base/common/severity"], function (require, exports, nls_1, types_1, uri_1, lifecycle_1, instantiation_1, platform_1, files_1, network_1, errorMessage_1, actions_1, severity_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createEditorOpenError = exports.isEditorOpenError = exports.isTextEditorViewState = exports.EditorsOrder = exports.pathsToEditors = exports.CloseDirection = exports.EditorResourceAccessor = exports.preventEditorClose = exports.EditorCloseMethod = exports.SideBySideEditor = exports.GroupModelChangeKind = exports.EditorCloseContext = exports.isEditorIdentifier = exports.isEditorInputWithOptionsAndGroup = exports.isEditorInputWithOptions = exports.createTooLargeFileError = exports.isDiffEditorInput = exports.isSideBySideEditorInput = exports.isEditorInput = exports.AbstractEditorInput = exports.EditorInputCapabilities = exports.SaveSourceRegistry = exports.SaveReason = exports.Verbosity = exports.isResourceMergeEditorInput = exports.isUntitledResourceEditorInput = exports.isResourceSideBySideEditorInput = exports.isResourceDiffEditorInput = exports.isResourceEditorInput = exports.findViewStateForEditor = exports.isEditorPaneWithSelection = exports.EditorPaneSelectionCompareResult = exports.EditorPaneSelectionChangeReason = exports.BINARY_DIFF_EDITOR_ID = exports.TEXT_DIFF_EDITOR_ID = exports.SIDE_BY_SIDE_EDITOR_ID = exports.DEFAULT_EDITOR_ASSOCIATION = exports.EditorExtensions = void 0;
    // Static values for editor contributions
    exports.EditorExtensions = {
        EditorPane: 'workbench.contributions.editors',
        EditorFactory: 'workbench.contributions.editor.inputFactories'
    };
    // Static information regarding the text editor
    exports.DEFAULT_EDITOR_ASSOCIATION = {
        id: 'default',
        displayName: (0, nls_1.localize)('promptOpenWith.defaultEditor.displayName', "Text Editor"),
        providerDisplayName: (0, nls_1.localize)('builtinProviderDisplayName', "Built-in")
    };
    /**
     * Side by side editor id.
     */
    exports.SIDE_BY_SIDE_EDITOR_ID = 'workbench.editor.sidebysideEditor';
    /**
     * Text diff editor id.
     */
    exports.TEXT_DIFF_EDITOR_ID = 'workbench.editors.textDiffEditor';
    /**
     * Binary diff editor id.
     */
    exports.BINARY_DIFF_EDITOR_ID = 'workbench.editors.binaryResourceDiffEditor';
    var EditorPaneSelectionChangeReason;
    (function (EditorPaneSelectionChangeReason) {
        /**
         * The selection was changed as a result of a programmatic
         * method invocation.
         *
         * For a text editor pane, this for example can be a selection
         * being restored from previous view state automatically.
         */
        EditorPaneSelectionChangeReason[EditorPaneSelectionChangeReason["PROGRAMMATIC"] = 1] = "PROGRAMMATIC";
        /**
         * The selection was changed by the user.
         *
         * This typically means the user changed the selection
         * with mouse or keyboard.
         */
        EditorPaneSelectionChangeReason[EditorPaneSelectionChangeReason["USER"] = 2] = "USER";
        /**
         * The selection was changed as a result of editing in
         * the editor pane.
         *
         * For a text editor pane, this for example can be typing
         * in the text of the editor pane.
         */
        EditorPaneSelectionChangeReason[EditorPaneSelectionChangeReason["EDIT"] = 3] = "EDIT";
        /**
         * The selection was changed as a result of a navigation
         * action.
         *
         * For a text editor pane, this for example can be a result
         * of selecting an entry from a text outline view.
         */
        EditorPaneSelectionChangeReason[EditorPaneSelectionChangeReason["NAVIGATION"] = 4] = "NAVIGATION";
        /**
         * The selection was changed as a result of a jump action
         * from within the editor pane.
         *
         * For a text editor pane, this for example can be a result
         * of invoking "Go to definition" from a symbol.
         */
        EditorPaneSelectionChangeReason[EditorPaneSelectionChangeReason["JUMP"] = 5] = "JUMP";
    })(EditorPaneSelectionChangeReason || (exports.EditorPaneSelectionChangeReason = EditorPaneSelectionChangeReason = {}));
    var EditorPaneSelectionCompareResult;
    (function (EditorPaneSelectionCompareResult) {
        /**
         * The selections are identical.
         */
        EditorPaneSelectionCompareResult[EditorPaneSelectionCompareResult["IDENTICAL"] = 1] = "IDENTICAL";
        /**
         * The selections are similar.
         *
         * For a text editor this can mean that the one
         * selection is in close proximity to the other
         * selection.
         *
         * Upstream clients may decide in this case to
         * not treat the selection different from the
         * previous one because it is not distinct enough.
         */
        EditorPaneSelectionCompareResult[EditorPaneSelectionCompareResult["SIMILAR"] = 2] = "SIMILAR";
        /**
         * The selections are entirely different.
         */
        EditorPaneSelectionCompareResult[EditorPaneSelectionCompareResult["DIFFERENT"] = 3] = "DIFFERENT";
    })(EditorPaneSelectionCompareResult || (exports.EditorPaneSelectionCompareResult = EditorPaneSelectionCompareResult = {}));
    function isEditorPaneWithSelection(editorPane) {
        const candidate = editorPane;
        return !!candidate && typeof candidate.getSelection === 'function' && !!candidate.onDidChangeSelection;
    }
    exports.isEditorPaneWithSelection = isEditorPaneWithSelection;
    /**
     * Try to retrieve the view state for the editor pane that
     * has the provided editor input opened, if at all.
     *
     * This method will return `undefined` if the editor input
     * is not visible in any of the opened editor panes.
     */
    function findViewStateForEditor(input, group, editorService) {
        for (const editorPane of editorService.visibleEditorPanes) {
            if (editorPane.group.id === group && input.matches(editorPane.input)) {
                return editorPane.getViewState();
            }
        }
        return undefined;
    }
    exports.findViewStateForEditor = findViewStateForEditor;
    function isResourceEditorInput(editor) {
        if (isEditorInput(editor)) {
            return false; // make sure to not accidentally match on typed editor inputs
        }
        const candidate = editor;
        return uri_1.URI.isUri(candidate?.resource);
    }
    exports.isResourceEditorInput = isResourceEditorInput;
    function isResourceDiffEditorInput(editor) {
        if (isEditorInput(editor)) {
            return false; // make sure to not accidentally match on typed editor inputs
        }
        const candidate = editor;
        return candidate?.original !== undefined && candidate.modified !== undefined;
    }
    exports.isResourceDiffEditorInput = isResourceDiffEditorInput;
    function isResourceSideBySideEditorInput(editor) {
        if (isEditorInput(editor)) {
            return false; // make sure to not accidentally match on typed editor inputs
        }
        if (isResourceDiffEditorInput(editor)) {
            return false; // make sure to not accidentally match on diff editors
        }
        const candidate = editor;
        return candidate?.primary !== undefined && candidate.secondary !== undefined;
    }
    exports.isResourceSideBySideEditorInput = isResourceSideBySideEditorInput;
    function isUntitledResourceEditorInput(editor) {
        if (isEditorInput(editor)) {
            return false; // make sure to not accidentally match on typed editor inputs
        }
        const candidate = editor;
        if (!candidate) {
            return false;
        }
        return candidate.resource === undefined || candidate.resource.scheme === network_1.Schemas.untitled || candidate.forceUntitled === true;
    }
    exports.isUntitledResourceEditorInput = isUntitledResourceEditorInput;
    function isResourceMergeEditorInput(editor) {
        if (isEditorInput(editor)) {
            return false; // make sure to not accidentally match on typed editor inputs
        }
        const candidate = editor;
        return uri_1.URI.isUri(candidate?.base?.resource) && uri_1.URI.isUri(candidate?.input1?.resource) && uri_1.URI.isUri(candidate?.input2?.resource) && uri_1.URI.isUri(candidate?.result?.resource);
    }
    exports.isResourceMergeEditorInput = isResourceMergeEditorInput;
    var Verbosity;
    (function (Verbosity) {
        Verbosity[Verbosity["SHORT"] = 0] = "SHORT";
        Verbosity[Verbosity["MEDIUM"] = 1] = "MEDIUM";
        Verbosity[Verbosity["LONG"] = 2] = "LONG";
    })(Verbosity || (exports.Verbosity = Verbosity = {}));
    var SaveReason;
    (function (SaveReason) {
        /**
         * Explicit user gesture.
         */
        SaveReason[SaveReason["EXPLICIT"] = 1] = "EXPLICIT";
        /**
         * Auto save after a timeout.
         */
        SaveReason[SaveReason["AUTO"] = 2] = "AUTO";
        /**
         * Auto save after editor focus change.
         */
        SaveReason[SaveReason["FOCUS_CHANGE"] = 3] = "FOCUS_CHANGE";
        /**
         * Auto save after window change.
         */
        SaveReason[SaveReason["WINDOW_CHANGE"] = 4] = "WINDOW_CHANGE";
    })(SaveReason || (exports.SaveReason = SaveReason = {}));
    class SaveSourceFactory {
        constructor() {
            this.mapIdToSaveSource = new Map();
        }
        /**
         * Registers a `SaveSource` with an identifier and label
         * to the registry so that it can be used in save operations.
         */
        registerSource(id, label) {
            let sourceDescriptor = this.mapIdToSaveSource.get(id);
            if (!sourceDescriptor) {
                sourceDescriptor = { source: id, label };
                this.mapIdToSaveSource.set(id, sourceDescriptor);
            }
            return sourceDescriptor.source;
        }
        getSourceLabel(source) {
            return this.mapIdToSaveSource.get(source)?.label ?? source;
        }
    }
    exports.SaveSourceRegistry = new SaveSourceFactory();
    var EditorInputCapabilities;
    (function (EditorInputCapabilities) {
        /**
         * Signals no specific capability for the input.
         */
        EditorInputCapabilities[EditorInputCapabilities["None"] = 0] = "None";
        /**
         * Signals that the input is readonly.
         */
        EditorInputCapabilities[EditorInputCapabilities["Readonly"] = 2] = "Readonly";
        /**
         * Signals that the input is untitled.
         */
        EditorInputCapabilities[EditorInputCapabilities["Untitled"] = 4] = "Untitled";
        /**
         * Signals that the input can only be shown in one group
         * and not be split into multiple groups.
         */
        EditorInputCapabilities[EditorInputCapabilities["Singleton"] = 8] = "Singleton";
        /**
         * Signals that the input requires workspace trust.
         */
        EditorInputCapabilities[EditorInputCapabilities["RequiresTrust"] = 16] = "RequiresTrust";
        /**
         * Signals that the editor can split into 2 in the same
         * editor group.
         */
        EditorInputCapabilities[EditorInputCapabilities["CanSplitInGroup"] = 32] = "CanSplitInGroup";
        /**
         * Signals that the editor wants its description to be
         * visible when presented to the user. By default, a UI
         * component may decide to hide the description portion
         * for brevity.
         */
        EditorInputCapabilities[EditorInputCapabilities["ForceDescription"] = 64] = "ForceDescription";
        /**
         * Signals that the editor supports dropping into the
         * editor by holding shift.
         */
        EditorInputCapabilities[EditorInputCapabilities["CanDropIntoEditor"] = 128] = "CanDropIntoEditor";
        /**
         * Signals that the editor is composed of multiple editors
         * within.
         */
        EditorInputCapabilities[EditorInputCapabilities["MultipleEditors"] = 256] = "MultipleEditors";
        /**
         * Signals that the editor cannot be in a dirty state
         * and may still have unsaved changes
         */
        EditorInputCapabilities[EditorInputCapabilities["Scratchpad"] = 512] = "Scratchpad";
    })(EditorInputCapabilities || (exports.EditorInputCapabilities = EditorInputCapabilities = {}));
    class AbstractEditorInput extends lifecycle_1.Disposable {
    }
    exports.AbstractEditorInput = AbstractEditorInput;
    function isEditorInput(editor) {
        return editor instanceof AbstractEditorInput;
    }
    exports.isEditorInput = isEditorInput;
    function isEditorInputWithPreferredResource(editor) {
        const candidate = editor;
        return uri_1.URI.isUri(candidate?.preferredResource);
    }
    function isSideBySideEditorInput(editor) {
        const candidate = editor;
        return isEditorInput(candidate?.primary) && isEditorInput(candidate?.secondary);
    }
    exports.isSideBySideEditorInput = isSideBySideEditorInput;
    function isDiffEditorInput(editor) {
        const candidate = editor;
        return isEditorInput(candidate?.modified) && isEditorInput(candidate?.original);
    }
    exports.isDiffEditorInput = isDiffEditorInput;
    function createTooLargeFileError(group, input, options, message, preferencesService) {
        return createEditorOpenError(message, [
            (0, actions_1.toAction)({
                id: 'workbench.action.openLargeFile', label: (0, nls_1.localize)('openLargeFile', "Open Anyway"), run: () => {
                    const fileEditorOptions = {
                        ...options,
                        limits: {
                            size: Number.MAX_VALUE
                        }
                    };
                    group.openEditor(input, fileEditorOptions);
                }
            }),
            (0, actions_1.toAction)({
                id: 'workbench.action.configureEditorLargeFileConfirmation', label: (0, nls_1.localize)('configureEditorLargeFileConfirmation', "Configure Limit"), run: () => {
                    return preferencesService.openUserSettings({ query: 'workbench.editorLargeFileConfirmation' });
                }
            }),
        ], {
            forceMessage: true,
            forceSeverity: severity_1.default.Warning
        });
    }
    exports.createTooLargeFileError = createTooLargeFileError;
    function isEditorInputWithOptions(editor) {
        const candidate = editor;
        return isEditorInput(candidate?.editor);
    }
    exports.isEditorInputWithOptions = isEditorInputWithOptions;
    function isEditorInputWithOptionsAndGroup(editor) {
        const candidate = editor;
        return isEditorInputWithOptions(editor) && candidate?.group !== undefined;
    }
    exports.isEditorInputWithOptionsAndGroup = isEditorInputWithOptionsAndGroup;
    function isEditorIdentifier(identifier) {
        const candidate = identifier;
        return typeof candidate?.groupId === 'number' && isEditorInput(candidate.editor);
    }
    exports.isEditorIdentifier = isEditorIdentifier;
    /**
     * More information around why an editor was closed in the model.
     */
    var EditorCloseContext;
    (function (EditorCloseContext) {
        /**
         * No specific context for closing (e.g. explicit user gesture).
         */
        EditorCloseContext[EditorCloseContext["UNKNOWN"] = 0] = "UNKNOWN";
        /**
         * The editor closed because it was replaced with another editor.
         * This can either happen via explicit replace call or when an
         * editor is in preview mode and another editor opens.
         */
        EditorCloseContext[EditorCloseContext["REPLACE"] = 1] = "REPLACE";
        /**
         * The editor closed as a result of moving it to another group.
         */
        EditorCloseContext[EditorCloseContext["MOVE"] = 2] = "MOVE";
        /**
         * The editor closed because another editor turned into preview
         * and this used to be the preview editor before.
         */
        EditorCloseContext[EditorCloseContext["UNPIN"] = 3] = "UNPIN";
    })(EditorCloseContext || (exports.EditorCloseContext = EditorCloseContext = {}));
    var GroupModelChangeKind;
    (function (GroupModelChangeKind) {
        /* Group Changes */
        GroupModelChangeKind[GroupModelChangeKind["GROUP_ACTIVE"] = 0] = "GROUP_ACTIVE";
        GroupModelChangeKind[GroupModelChangeKind["GROUP_INDEX"] = 1] = "GROUP_INDEX";
        GroupModelChangeKind[GroupModelChangeKind["GROUP_LOCKED"] = 2] = "GROUP_LOCKED";
        /* Editor Changes */
        GroupModelChangeKind[GroupModelChangeKind["EDITOR_OPEN"] = 3] = "EDITOR_OPEN";
        GroupModelChangeKind[GroupModelChangeKind["EDITOR_CLOSE"] = 4] = "EDITOR_CLOSE";
        GroupModelChangeKind[GroupModelChangeKind["EDITOR_MOVE"] = 5] = "EDITOR_MOVE";
        GroupModelChangeKind[GroupModelChangeKind["EDITOR_ACTIVE"] = 6] = "EDITOR_ACTIVE";
        GroupModelChangeKind[GroupModelChangeKind["EDITOR_LABEL"] = 7] = "EDITOR_LABEL";
        GroupModelChangeKind[GroupModelChangeKind["EDITOR_CAPABILITIES"] = 8] = "EDITOR_CAPABILITIES";
        GroupModelChangeKind[GroupModelChangeKind["EDITOR_PIN"] = 9] = "EDITOR_PIN";
        GroupModelChangeKind[GroupModelChangeKind["EDITOR_STICKY"] = 10] = "EDITOR_STICKY";
        GroupModelChangeKind[GroupModelChangeKind["EDITOR_DIRTY"] = 11] = "EDITOR_DIRTY";
        GroupModelChangeKind[GroupModelChangeKind["EDITOR_WILL_DISPOSE"] = 12] = "EDITOR_WILL_DISPOSE";
    })(GroupModelChangeKind || (exports.GroupModelChangeKind = GroupModelChangeKind = {}));
    var SideBySideEditor;
    (function (SideBySideEditor) {
        SideBySideEditor[SideBySideEditor["PRIMARY"] = 1] = "PRIMARY";
        SideBySideEditor[SideBySideEditor["SECONDARY"] = 2] = "SECONDARY";
        SideBySideEditor[SideBySideEditor["BOTH"] = 3] = "BOTH";
        SideBySideEditor[SideBySideEditor["ANY"] = 4] = "ANY";
    })(SideBySideEditor || (exports.SideBySideEditor = SideBySideEditor = {}));
    class EditorResourceAccessorImpl {
        getOriginalUri(editor, options) {
            if (!editor) {
                return undefined;
            }
            // Merge editors are handled with `merged` result editor
            if (isResourceMergeEditorInput(editor)) {
                return exports.EditorResourceAccessor.getOriginalUri(editor.result, options);
            }
            // Optionally support side-by-side editors
            if (options?.supportSideBySide) {
                const { primary, secondary } = this.getSideEditors(editor);
                if (primary && secondary) {
                    if (options?.supportSideBySide === SideBySideEditor.BOTH) {
                        return {
                            primary: this.getOriginalUri(primary, { filterByScheme: options.filterByScheme }),
                            secondary: this.getOriginalUri(secondary, { filterByScheme: options.filterByScheme })
                        };
                    }
                    else if (options?.supportSideBySide === SideBySideEditor.ANY) {
                        return this.getOriginalUri(primary, { filterByScheme: options.filterByScheme }) ?? this.getOriginalUri(secondary, { filterByScheme: options.filterByScheme });
                    }
                    editor = options.supportSideBySide === SideBySideEditor.PRIMARY ? primary : secondary;
                }
            }
            if (isResourceDiffEditorInput(editor) || isResourceSideBySideEditorInput(editor) || isResourceMergeEditorInput(editor)) {
                return undefined;
            }
            // Original URI is the `preferredResource` of an editor if any
            const originalResource = isEditorInputWithPreferredResource(editor) ? editor.preferredResource : editor.resource;
            if (!originalResource || !options || !options.filterByScheme) {
                return originalResource;
            }
            return this.filterUri(originalResource, options.filterByScheme);
        }
        getSideEditors(editor) {
            if (isSideBySideEditorInput(editor) || isResourceSideBySideEditorInput(editor)) {
                return { primary: editor.primary, secondary: editor.secondary };
            }
            if (isDiffEditorInput(editor) || isResourceDiffEditorInput(editor)) {
                return { primary: editor.modified, secondary: editor.original };
            }
            return { primary: undefined, secondary: undefined };
        }
        getCanonicalUri(editor, options) {
            if (!editor) {
                return undefined;
            }
            // Merge editors are handled with `merged` result editor
            if (isResourceMergeEditorInput(editor)) {
                return exports.EditorResourceAccessor.getCanonicalUri(editor.result, options);
            }
            // Optionally support side-by-side editors
            if (options?.supportSideBySide) {
                const { primary, secondary } = this.getSideEditors(editor);
                if (primary && secondary) {
                    if (options?.supportSideBySide === SideBySideEditor.BOTH) {
                        return {
                            primary: this.getCanonicalUri(primary, { filterByScheme: options.filterByScheme }),
                            secondary: this.getCanonicalUri(secondary, { filterByScheme: options.filterByScheme })
                        };
                    }
                    else if (options?.supportSideBySide === SideBySideEditor.ANY) {
                        return this.getCanonicalUri(primary, { filterByScheme: options.filterByScheme }) ?? this.getCanonicalUri(secondary, { filterByScheme: options.filterByScheme });
                    }
                    editor = options.supportSideBySide === SideBySideEditor.PRIMARY ? primary : secondary;
                }
            }
            if (isResourceDiffEditorInput(editor) || isResourceSideBySideEditorInput(editor) || isResourceMergeEditorInput(editor)) {
                return undefined;
            }
            // Canonical URI is the `resource` of an editor
            const canonicalResource = editor.resource;
            if (!canonicalResource || !options || !options.filterByScheme) {
                return canonicalResource;
            }
            return this.filterUri(canonicalResource, options.filterByScheme);
        }
        filterUri(resource, filter) {
            // Multiple scheme filter
            if (Array.isArray(filter)) {
                if (filter.some(scheme => resource.scheme === scheme)) {
                    return resource;
                }
            }
            // Single scheme filter
            else {
                if (filter === resource.scheme) {
                    return resource;
                }
            }
            return undefined;
        }
    }
    var EditorCloseMethod;
    (function (EditorCloseMethod) {
        EditorCloseMethod[EditorCloseMethod["UNKNOWN"] = 0] = "UNKNOWN";
        EditorCloseMethod[EditorCloseMethod["KEYBOARD"] = 1] = "KEYBOARD";
        EditorCloseMethod[EditorCloseMethod["MOUSE"] = 2] = "MOUSE";
    })(EditorCloseMethod || (exports.EditorCloseMethod = EditorCloseMethod = {}));
    function preventEditorClose(group, editor, method, configuration) {
        if (!group.isSticky(editor)) {
            return false; // only interested in sticky editors
        }
        switch (configuration.preventPinnedEditorClose) {
            case 'keyboardAndMouse': return method === EditorCloseMethod.MOUSE || method === EditorCloseMethod.KEYBOARD;
            case 'mouse': return method === EditorCloseMethod.MOUSE;
            case 'keyboard': return method === EditorCloseMethod.KEYBOARD;
        }
        return false;
    }
    exports.preventEditorClose = preventEditorClose;
    exports.EditorResourceAccessor = new EditorResourceAccessorImpl();
    var CloseDirection;
    (function (CloseDirection) {
        CloseDirection[CloseDirection["LEFT"] = 0] = "LEFT";
        CloseDirection[CloseDirection["RIGHT"] = 1] = "RIGHT";
    })(CloseDirection || (exports.CloseDirection = CloseDirection = {}));
    class EditorFactoryRegistry {
        constructor() {
            this.editorSerializerConstructors = new Map();
            this.editorSerializerInstances = new Map();
        }
        start(accessor) {
            const instantiationService = this.instantiationService = accessor.get(instantiation_1.IInstantiationService);
            for (const [key, ctor] of this.editorSerializerConstructors) {
                this.createEditorSerializer(key, ctor, instantiationService);
            }
            this.editorSerializerConstructors.clear();
        }
        createEditorSerializer(editorTypeId, ctor, instantiationService) {
            const instance = instantiationService.createInstance(ctor);
            this.editorSerializerInstances.set(editorTypeId, instance);
        }
        registerFileEditorFactory(factory) {
            if (this.fileEditorFactory) {
                throw new Error('Can only register one file editor factory.');
            }
            this.fileEditorFactory = factory;
        }
        getFileEditorFactory() {
            return (0, types_1.assertIsDefined)(this.fileEditorFactory);
        }
        registerEditorSerializer(editorTypeId, ctor) {
            if (this.editorSerializerConstructors.has(editorTypeId) || this.editorSerializerInstances.has(editorTypeId)) {
                throw new Error(`A editor serializer with type ID '${editorTypeId}' was already registered.`);
            }
            if (!this.instantiationService) {
                this.editorSerializerConstructors.set(editorTypeId, ctor);
            }
            else {
                this.createEditorSerializer(editorTypeId, ctor, this.instantiationService);
            }
            return (0, lifecycle_1.toDisposable)(() => {
                this.editorSerializerConstructors.delete(editorTypeId);
                this.editorSerializerInstances.delete(editorTypeId);
            });
        }
        getEditorSerializer(arg1) {
            return this.editorSerializerInstances.get(typeof arg1 === 'string' ? arg1 : arg1.typeId);
        }
    }
    platform_1.Registry.add(exports.EditorExtensions.EditorFactory, new EditorFactoryRegistry());
    async function pathsToEditors(paths, fileService, logService) {
        if (!paths || !paths.length) {
            return [];
        }
        return await Promise.all(paths.map(async (path) => {
            const resource = uri_1.URI.revive(path.fileUri);
            if (!resource) {
                logService.info('Cannot resolve the path because it is not valid.', path);
                return undefined;
            }
            const canHandleResource = await fileService.canHandleResource(resource);
            if (!canHandleResource) {
                logService.info('Cannot resolve the path because it cannot be handled', path);
                return undefined;
            }
            let exists = path.exists;
            let type = path.type;
            if (typeof exists !== 'boolean' || typeof type !== 'number') {
                try {
                    type = (await fileService.stat(resource)).isDirectory ? files_1.FileType.Directory : files_1.FileType.Unknown;
                    exists = true;
                }
                catch (error) {
                    logService.error(error);
                    exists = false;
                }
            }
            if (!exists && path.openOnlyIfExists) {
                logService.info('Cannot resolve the path because it does not exist', path);
                return undefined;
            }
            if (type === files_1.FileType.Directory) {
                logService.info('Cannot resolve the path because it is a directory', path);
                return undefined;
            }
            const options = {
                ...path.options,
                pinned: true
            };
            if (!exists) {
                return { resource, options, forceUntitled: true };
            }
            return { resource, options };
        }));
    }
    exports.pathsToEditors = pathsToEditors;
    var EditorsOrder;
    (function (EditorsOrder) {
        /**
         * Editors sorted by most recent activity (most recent active first)
         */
        EditorsOrder[EditorsOrder["MOST_RECENTLY_ACTIVE"] = 0] = "MOST_RECENTLY_ACTIVE";
        /**
         * Editors sorted by sequential order
         */
        EditorsOrder[EditorsOrder["SEQUENTIAL"] = 1] = "SEQUENTIAL";
    })(EditorsOrder || (exports.EditorsOrder = EditorsOrder = {}));
    function isTextEditorViewState(candidate) {
        const viewState = candidate;
        if (!viewState) {
            return false;
        }
        const diffEditorViewState = viewState;
        if (diffEditorViewState.modified) {
            return isTextEditorViewState(diffEditorViewState.modified);
        }
        const codeEditorViewState = viewState;
        return !!(codeEditorViewState.contributionsState && codeEditorViewState.viewState && Array.isArray(codeEditorViewState.cursorState));
    }
    exports.isTextEditorViewState = isTextEditorViewState;
    function isEditorOpenError(obj) {
        return (0, errorMessage_1.isErrorWithActions)(obj);
    }
    exports.isEditorOpenError = isEditorOpenError;
    function createEditorOpenError(messageOrError, actions, options) {
        const error = (0, errorMessage_1.createErrorWithActions)(messageOrError, actions);
        error.forceMessage = options?.forceMessage;
        error.forceSeverity = options?.forceSeverity;
        error.allowDialog = options?.allowDialog;
        return error;
    }
    exports.createEditorOpenError = createEditorOpenError;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbW1vbi9lZGl0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBMkJoRyx5Q0FBeUM7SUFDNUIsUUFBQSxnQkFBZ0IsR0FBRztRQUMvQixVQUFVLEVBQUUsaUNBQWlDO1FBQzdDLGFBQWEsRUFBRSwrQ0FBK0M7S0FDOUQsQ0FBQztJQUVGLCtDQUErQztJQUNsQyxRQUFBLDBCQUEwQixHQUFHO1FBQ3pDLEVBQUUsRUFBRSxTQUFTO1FBQ2IsV0FBVyxFQUFFLElBQUEsY0FBUSxFQUFDLDBDQUEwQyxFQUFFLGFBQWEsQ0FBQztRQUNoRixtQkFBbUIsRUFBRSxJQUFBLGNBQVEsRUFBQyw0QkFBNEIsRUFBRSxVQUFVLENBQUM7S0FDdkUsQ0FBQztJQUVGOztPQUVHO0lBQ1UsUUFBQSxzQkFBc0IsR0FBRyxtQ0FBbUMsQ0FBQztJQUUxRTs7T0FFRztJQUNVLFFBQUEsbUJBQW1CLEdBQUcsa0NBQWtDLENBQUM7SUFFdEU7O09BRUc7SUFDVSxRQUFBLHFCQUFxQixHQUFHLDRDQUE0QyxDQUFDO0lBNklsRixJQUFrQiwrQkE2Q2pCO0lBN0NELFdBQWtCLCtCQUErQjtRQUVoRDs7Ozs7O1dBTUc7UUFDSCxxR0FBZ0IsQ0FBQTtRQUVoQjs7Ozs7V0FLRztRQUNILHFGQUFJLENBQUE7UUFFSjs7Ozs7O1dBTUc7UUFDSCxxRkFBSSxDQUFBO1FBRUo7Ozs7OztXQU1HO1FBQ0gsaUdBQVUsQ0FBQTtRQUVWOzs7Ozs7V0FNRztRQUNILHFGQUFJLENBQUE7SUFDTCxDQUFDLEVBN0NpQiwrQkFBK0IsK0NBQS9CLCtCQUErQixRQTZDaEQ7SUF5QkQsSUFBa0IsZ0NBd0JqQjtJQXhCRCxXQUFrQixnQ0FBZ0M7UUFFakQ7O1dBRUc7UUFDSCxpR0FBYSxDQUFBO1FBRWI7Ozs7Ozs7Ozs7V0FVRztRQUNI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