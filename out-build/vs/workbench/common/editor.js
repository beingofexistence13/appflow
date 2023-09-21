/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/common/editor", "vs/base/common/types", "vs/base/common/uri", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/platform/files/common/files", "vs/base/common/network", "vs/base/common/errorMessage", "vs/base/common/actions", "vs/base/common/severity"], function (require, exports, nls_1, types_1, uri_1, lifecycle_1, instantiation_1, platform_1, files_1, network_1, errorMessage_1, actions_1, severity_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$7E = exports.$6E = exports.$5E = exports.EditorsOrder = exports.$4E = exports.CloseDirection = exports.$3E = exports.$2E = exports.EditorCloseMethod = exports.SideBySideEditor = exports.GroupModelChangeKind = exports.EditorCloseContext = exports.$1E = exports.$ZE = exports.$YE = exports.$XE = exports.$WE = exports.$VE = exports.$UE = exports.$TE = exports.EditorInputCapabilities = exports.$SE = exports.SaveReason = exports.Verbosity = exports.$RE = exports.$QE = exports.$PE = exports.$OE = exports.$NE = exports.$ME = exports.$LE = exports.EditorPaneSelectionCompareResult = exports.EditorPaneSelectionChangeReason = exports.$KE = exports.$JE = exports.$IE = exports.$HE = exports.$GE = void 0;
    // Static values for editor contributions
    exports.$GE = {
        EditorPane: 'workbench.contributions.editors',
        EditorFactory: 'workbench.contributions.editor.inputFactories'
    };
    // Static information regarding the text editor
    exports.$HE = {
        id: 'default',
        displayName: (0, nls_1.localize)(0, null),
        providerDisplayName: (0, nls_1.localize)(1, null)
    };
    /**
     * Side by side editor id.
     */
    exports.$IE = 'workbench.editor.sidebysideEditor';
    /**
     * Text diff editor id.
     */
    exports.$JE = 'workbench.editors.textDiffEditor';
    /**
     * Binary diff editor id.
     */
    exports.$KE = 'workbench.editors.binaryResourceDiffEditor';
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
    function $LE(editorPane) {
        const candidate = editorPane;
        return !!candidate && typeof candidate.getSelection === 'function' && !!candidate.onDidChangeSelection;
    }
    exports.$LE = $LE;
    /**
     * Try to retrieve the view state for the editor pane that
     * has the provided editor input opened, if at all.
     *
     * This method will return `undefined` if the editor input
     * is not visible in any of the opened editor panes.
     */
    function $ME(input, group, editorService) {
        for (const editorPane of editorService.visibleEditorPanes) {
            if (editorPane.group.id === group && input.matches(editorPane.input)) {
                return editorPane.getViewState();
            }
        }
        return undefined;
    }
    exports.$ME = $ME;
    function $NE(editor) {
        if ($UE(editor)) {
            return false; // make sure to not accidentally match on typed editor inputs
        }
        const candidate = editor;
        return uri_1.URI.isUri(candidate?.resource);
    }
    exports.$NE = $NE;
    function $OE(editor) {
        if ($UE(editor)) {
            return false; // make sure to not accidentally match on typed editor inputs
        }
        const candidate = editor;
        return candidate?.original !== undefined && candidate.modified !== undefined;
    }
    exports.$OE = $OE;
    function $PE(editor) {
        if ($UE(editor)) {
            return false; // make sure to not accidentally match on typed editor inputs
        }
        if ($OE(editor)) {
            return false; // make sure to not accidentally match on diff editors
        }
        const candidate = editor;
        return candidate?.primary !== undefined && candidate.secondary !== undefined;
    }
    exports.$PE = $PE;
    function $QE(editor) {
        if ($UE(editor)) {
            return false; // make sure to not accidentally match on typed editor inputs
        }
        const candidate = editor;
        if (!candidate) {
            return false;
        }
        return candidate.resource === undefined || candidate.resource.scheme === network_1.Schemas.untitled || candidate.forceUntitled === true;
    }
    exports.$QE = $QE;
    function $RE(editor) {
        if ($UE(editor)) {
            return false; // make sure to not accidentally match on typed editor inputs
        }
        const candidate = editor;
        return uri_1.URI.isUri(candidate?.base?.resource) && uri_1.URI.isUri(candidate?.input1?.resource) && uri_1.URI.isUri(candidate?.input2?.resource) && uri_1.URI.isUri(candidate?.result?.resource);
    }
    exports.$RE = $RE;
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
            this.a = new Map();
        }
        /**
         * Registers a `SaveSource` with an identifier and label
         * to the registry so that it can be used in save operations.
         */
        registerSource(id, label) {
            let sourceDescriptor = this.a.get(id);
            if (!sourceDescriptor) {
                sourceDescriptor = { source: id, label };
                this.a.set(id, sourceDescriptor);
            }
            return sourceDescriptor.source;
        }
        getSourceLabel(source) {
            return this.a.get(source)?.label ?? source;
        }
    }
    exports.$SE = new SaveSourceFactory();
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
    class $TE extends lifecycle_1.$kc {
    }
    exports.$TE = $TE;
    function $UE(editor) {
        return editor instanceof $TE;
    }
    exports.$UE = $UE;
    function isEditorInputWithPreferredResource(editor) {
        const candidate = editor;
        return uri_1.URI.isUri(candidate?.preferredResource);
    }
    function $VE(editor) {
        const candidate = editor;
        return $UE(candidate?.primary) && $UE(candidate?.secondary);
    }
    exports.$VE = $VE;
    function $WE(editor) {
        const candidate = editor;
        return $UE(candidate?.modified) && $UE(candidate?.original);
    }
    exports.$WE = $WE;
    function $XE(group, input, options, message, preferencesService) {
        return $7E(message, [
            (0, actions_1.$li)({
                id: 'workbench.action.openLargeFile', label: (0, nls_1.localize)(2, null), run: () => {
                    const fileEditorOptions = {
                        ...options,
                        limits: {
                            size: Number.MAX_VALUE
                        }
                    };
                    group.openEditor(input, fileEditorOptions);
                }
            }),
            (0, actions_1.$li)({
                id: 'workbench.action.configureEditorLargeFileConfirmation', label: (0, nls_1.localize)(3, null), run: () => {
                    return preferencesService.openUserSettings({ query: 'workbench.editorLargeFileConfirmation' });
                }
            }),
        ], {
            forceMessage: true,
            forceSeverity: severity_1.default.Warning
        });
    }
    exports.$XE = $XE;
    function $YE(editor) {
        const candidate = editor;
        return $UE(candidate?.editor);
    }
    exports.$YE = $YE;
    function $ZE(editor) {
        const candidate = editor;
        return $YE(editor) && candidate?.group !== undefined;
    }
    exports.$ZE = $ZE;
    function $1E(identifier) {
        const candidate = identifier;
        return typeof candidate?.groupId === 'number' && $UE(candidate.editor);
    }
    exports.$1E = $1E;
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
            if ($RE(editor)) {
                return exports.$3E.getOriginalUri(editor.result, options);
            }
            // Optionally support side-by-side editors
            if (options?.supportSideBySide) {
                const { primary, secondary } = this.a(editor);
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
            if ($OE(editor) || $PE(editor) || $RE(editor)) {
                return undefined;
            }
            // Original URI is the `preferredResource` of an editor if any
            const originalResource = isEditorInputWithPreferredResource(editor) ? editor.preferredResource : editor.resource;
            if (!originalResource || !options || !options.filterByScheme) {
                return originalResource;
            }
            return this.b(originalResource, options.filterByScheme);
        }
        a(editor) {
            if ($VE(editor) || $PE(editor)) {
                return { primary: editor.primary, secondary: editor.secondary };
            }
            if ($WE(editor) || $OE(editor)) {
                return { primary: editor.modified, secondary: editor.original };
            }
            return { primary: undefined, secondary: undefined };
        }
        getCanonicalUri(editor, options) {
            if (!editor) {
                return undefined;
            }
            // Merge editors are handled with `merged` result editor
            if ($RE(editor)) {
                return exports.$3E.getCanonicalUri(editor.result, options);
            }
            // Optionally support side-by-side editors
            if (options?.supportSideBySide) {
                const { primary, secondary } = this.a(editor);
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
            if ($OE(editor) || $PE(editor) || $RE(editor)) {
                return undefined;
            }
            // Canonical URI is the `resource` of an editor
            const canonicalResource = editor.resource;
            if (!canonicalResource || !options || !options.filterByScheme) {
                return canonicalResource;
            }
            return this.b(canonicalResource, options.filterByScheme);
        }
        b(resource, filter) {
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
    function $2E(group, editor, method, configuration) {
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
    exports.$2E = $2E;
    exports.$3E = new EditorResourceAccessorImpl();
    var CloseDirection;
    (function (CloseDirection) {
        CloseDirection[CloseDirection["LEFT"] = 0] = "LEFT";
        CloseDirection[CloseDirection["RIGHT"] = 1] = "RIGHT";
    })(CloseDirection || (exports.CloseDirection = CloseDirection = {}));
    class EditorFactoryRegistry {
        constructor() {
            this.c = new Map();
            this.d = new Map();
        }
        start(accessor) {
            const instantiationService = this.a = accessor.get(instantiation_1.$Ah);
            for (const [key, ctor] of this.c) {
                this.e(key, ctor, instantiationService);
            }
            this.c.clear();
        }
        e(editorTypeId, ctor, instantiationService) {
            const instance = instantiationService.createInstance(ctor);
            this.d.set(editorTypeId, instance);
        }
        registerFileEditorFactory(factory) {
            if (this.b) {
                throw new Error('Can only register one file editor factory.');
            }
            this.b = factory;
        }
        getFileEditorFactory() {
            return (0, types_1.$uf)(this.b);
        }
        registerEditorSerializer(editorTypeId, ctor) {
            if (this.c.has(editorTypeId) || this.d.has(editorTypeId)) {
                throw new Error(`A editor serializer with type ID '${editorTypeId}' was already registered.`);
            }
            if (!this.a) {
                this.c.set(editorTypeId, ctor);
            }
            else {
                this.e(editorTypeId, ctor, this.a);
            }
            return (0, lifecycle_1.$ic)(() => {
                this.c.delete(editorTypeId);
                this.d.delete(editorTypeId);
            });
        }
        getEditorSerializer(arg1) {
            return this.d.get(typeof arg1 === 'string' ? arg1 : arg1.typeId);
        }
    }
    platform_1.$8m.add(exports.$GE.EditorFactory, new EditorFactoryRegistry());
    async function $4E(paths, fileService, logService) {
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
    exports.$4E = $4E;
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
    function $5E(candidate) {
        const viewState = candidate;
        if (!viewState) {
            return false;
        }
        const diffEditorViewState = viewState;
        if (diffEditorViewState.modified) {
            return $5E(diffEditorViewState.modified);
        }
        const codeEditorViewState = viewState;
        return !!(codeEditorViewState.contributionsState && codeEditorViewState.viewState && Array.isArray(codeEditorViewState.cursorState));
    }
    exports.$5E = $5E;
    function $6E(obj) {
        return (0, errorMessage_1.$ni)(obj);
    }
    exports.$6E = $6E;
    function $7E(messageOrError, actions, options) {
        const error = (0, errorMessage_1.$oi)(messageOrError, actions);
        error.forceMessage = options?.forceMessage;
        error.forceSeverity = options?.forceSeverity;
        error.allowDialog = options?.allowDialog;
        return error;
    }
    exports.$7E = $7E;
});
//# sourceMappingURL=editor.js.map