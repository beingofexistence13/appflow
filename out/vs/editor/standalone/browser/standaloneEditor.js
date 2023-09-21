/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/base/common/uri", "vs/editor/browser/config/fontMeasurements", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/services/webWorker", "vs/editor/common/config/editorOptions", "vs/editor/common/config/editorZoom", "vs/editor/common/config/fontInfo", "vs/editor/common/editorCommon", "vs/editor/common/languages", "vs/editor/common/languages/language", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/languages/modesRegistry", "vs/editor/common/languages/nullTokenize", "vs/editor/common/model", "vs/editor/common/services/model", "vs/editor/common/standalone/standaloneEnums", "vs/editor/standalone/browser/colorizer", "vs/editor/standalone/browser/standaloneCodeEditor", "vs/editor/standalone/browser/standaloneServices", "vs/editor/standalone/common/standaloneTheme", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybinding", "vs/platform/markers/common/markers", "vs/platform/opener/common/opener", "vs/css!./standalone-tokens"], function (require, exports, lifecycle_1, strings_1, uri_1, fontMeasurements_1, editorExtensions_1, codeEditorService_1, webWorker_1, editorOptions_1, editorZoom_1, fontInfo_1, editorCommon_1, languages, language_1, languageConfigurationRegistry_1, modesRegistry_1, nullTokenize_1, model_1, model_2, standaloneEnums, colorizer_1, standaloneCodeEditor_1, standaloneServices_1, standaloneTheme_1, actions_1, commands_1, contextkey_1, keybinding_1, markers_1, opener_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createMonacoEditorAPI = exports.registerEditorOpener = exports.registerLinkOpener = exports.registerCommand = exports.remeasureFonts = exports.setTheme = exports.defineTheme = exports.tokenize = exports.colorizeModelLine = exports.colorize = exports.colorizeElement = exports.createWebWorker = exports.onDidChangeModelLanguage = exports.onWillDisposeModel = exports.onDidCreateModel = exports.getModels = exports.getModel = exports.onDidChangeMarkers = exports.getModelMarkers = exports.removeAllMarkers = exports.setModelMarkers = exports.setModelLanguage = exports.createModel = exports.addKeybindingRules = exports.addKeybindingRule = exports.addEditorAction = exports.addCommand = exports.createDiffEditor = exports.getDiffEditors = exports.getEditors = exports.onDidCreateDiffEditor = exports.onDidCreateEditor = exports.create = void 0;
    /**
     * Create a new editor under `domElement`.
     * `domElement` should be empty (not contain other dom nodes).
     * The editor will read the size of `domElement`.
     */
    function create(domElement, options, override) {
        const instantiationService = standaloneServices_1.StandaloneServices.initialize(override || {});
        return instantiationService.createInstance(standaloneCodeEditor_1.StandaloneEditor, domElement, options);
    }
    exports.create = create;
    /**
     * Emitted when an editor is created.
     * Creating a diff editor might cause this listener to be invoked with the two editors.
     * @event
     */
    function onDidCreateEditor(listener) {
        const codeEditorService = standaloneServices_1.StandaloneServices.get(codeEditorService_1.ICodeEditorService);
        return codeEditorService.onCodeEditorAdd((editor) => {
            listener(editor);
        });
    }
    exports.onDidCreateEditor = onDidCreateEditor;
    /**
     * Emitted when an diff editor is created.
     * @event
     */
    function onDidCreateDiffEditor(listener) {
        const codeEditorService = standaloneServices_1.StandaloneServices.get(codeEditorService_1.ICodeEditorService);
        return codeEditorService.onDiffEditorAdd((editor) => {
            listener(editor);
        });
    }
    exports.onDidCreateDiffEditor = onDidCreateDiffEditor;
    /**
     * Get all the created editors.
     */
    function getEditors() {
        const codeEditorService = standaloneServices_1.StandaloneServices.get(codeEditorService_1.ICodeEditorService);
        return codeEditorService.listCodeEditors();
    }
    exports.getEditors = getEditors;
    /**
     * Get all the created diff editors.
     */
    function getDiffEditors() {
        const codeEditorService = standaloneServices_1.StandaloneServices.get(codeEditorService_1.ICodeEditorService);
        return codeEditorService.listDiffEditors();
    }
    exports.getDiffEditors = getDiffEditors;
    /**
     * Create a new diff editor under `domElement`.
     * `domElement` should be empty (not contain other dom nodes).
     * The editor will read the size of `domElement`.
     */
    function createDiffEditor(domElement, options, override) {
        const instantiationService = standaloneServices_1.StandaloneServices.initialize(override || {});
        return instantiationService.createInstance(standaloneCodeEditor_1.StandaloneDiffEditor2, domElement, options);
    }
    exports.createDiffEditor = createDiffEditor;
    /**
     * Add a command.
     */
    function addCommand(descriptor) {
        if ((typeof descriptor.id !== 'string') || (typeof descriptor.run !== 'function')) {
            throw new Error('Invalid command descriptor, `id` and `run` are required properties!');
        }
        return commands_1.CommandsRegistry.registerCommand(descriptor.id, descriptor.run);
    }
    exports.addCommand = addCommand;
    /**
     * Add an action to all editors.
     */
    function addEditorAction(descriptor) {
        if ((typeof descriptor.id !== 'string') || (typeof descriptor.label !== 'string') || (typeof descriptor.run !== 'function')) {
            throw new Error('Invalid action descriptor, `id`, `label` and `run` are required properties!');
        }
        const precondition = contextkey_1.ContextKeyExpr.deserialize(descriptor.precondition);
        const run = (accessor, ...args) => {
            return editorExtensions_1.EditorCommand.runEditorCommand(accessor, args, precondition, (accessor, editor, args) => Promise.resolve(descriptor.run(editor, ...args)));
        };
        const toDispose = new lifecycle_1.DisposableStore();
        // Register the command
        toDispose.add(commands_1.CommandsRegistry.registerCommand(descriptor.id, run));
        // Register the context menu item
        if (descriptor.contextMenuGroupId) {
            const menuItem = {
                command: {
                    id: descriptor.id,
                    title: descriptor.label
                },
                when: precondition,
                group: descriptor.contextMenuGroupId,
                order: descriptor.contextMenuOrder || 0
            };
            toDispose.add(actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorContext, menuItem));
        }
        // Register the keybindings
        if (Array.isArray(descriptor.keybindings)) {
            const keybindingService = standaloneServices_1.StandaloneServices.get(keybinding_1.IKeybindingService);
            if (!(keybindingService instanceof standaloneServices_1.StandaloneKeybindingService)) {
                console.warn('Cannot add keybinding because the editor is configured with an unrecognized KeybindingService');
            }
            else {
                const keybindingsWhen = contextkey_1.ContextKeyExpr.and(precondition, contextkey_1.ContextKeyExpr.deserialize(descriptor.keybindingContext));
                toDispose.add(keybindingService.addDynamicKeybindings(descriptor.keybindings.map((keybinding) => {
                    return {
                        keybinding,
                        command: descriptor.id,
                        when: keybindingsWhen
                    };
                })));
            }
        }
        return toDispose;
    }
    exports.addEditorAction = addEditorAction;
    /**
     * Add a keybinding rule.
     */
    function addKeybindingRule(rule) {
        return addKeybindingRules([rule]);
    }
    exports.addKeybindingRule = addKeybindingRule;
    /**
     * Add keybinding rules.
     */
    function addKeybindingRules(rules) {
        const keybindingService = standaloneServices_1.StandaloneServices.get(keybinding_1.IKeybindingService);
        if (!(keybindingService instanceof standaloneServices_1.StandaloneKeybindingService)) {
            console.warn('Cannot add keybinding because the editor is configured with an unrecognized KeybindingService');
            return lifecycle_1.Disposable.None;
        }
        return keybindingService.addDynamicKeybindings(rules.map((rule) => {
            return {
                keybinding: rule.keybinding,
                command: rule.command,
                commandArgs: rule.commandArgs,
                when: contextkey_1.ContextKeyExpr.deserialize(rule.when),
            };
        }));
    }
    exports.addKeybindingRules = addKeybindingRules;
    /**
     * Create a new editor model.
     * You can specify the language that should be set for this model or let the language be inferred from the `uri`.
     */
    function createModel(value, language, uri) {
        const languageService = standaloneServices_1.StandaloneServices.get(language_1.ILanguageService);
        const languageId = languageService.getLanguageIdByMimeType(language) || language;
        return (0, standaloneCodeEditor_1.createTextModel)(standaloneServices_1.StandaloneServices.get(model_2.IModelService), languageService, value, languageId, uri);
    }
    exports.createModel = createModel;
    /**
     * Change the language for a model.
     */
    function setModelLanguage(model, mimeTypeOrLanguageId) {
        const languageService = standaloneServices_1.StandaloneServices.get(language_1.ILanguageService);
        const languageId = languageService.getLanguageIdByMimeType(mimeTypeOrLanguageId) || mimeTypeOrLanguageId || modesRegistry_1.PLAINTEXT_LANGUAGE_ID;
        model.setLanguage(languageService.createById(languageId));
    }
    exports.setModelLanguage = setModelLanguage;
    /**
     * Set the markers for a model.
     */
    function setModelMarkers(model, owner, markers) {
        if (model) {
            const markerService = standaloneServices_1.StandaloneServices.get(markers_1.IMarkerService);
            markerService.changeOne(owner, model.uri, markers);
        }
    }
    exports.setModelMarkers = setModelMarkers;
    /**
     * Remove all markers of an owner.
     */
    function removeAllMarkers(owner) {
        const markerService = standaloneServices_1.StandaloneServices.get(markers_1.IMarkerService);
        markerService.changeAll(owner, []);
    }
    exports.removeAllMarkers = removeAllMarkers;
    /**
     * Get markers for owner and/or resource
     *
     * @returns list of markers
     */
    function getModelMarkers(filter) {
        const markerService = standaloneServices_1.StandaloneServices.get(markers_1.IMarkerService);
        return markerService.read(filter);
    }
    exports.getModelMarkers = getModelMarkers;
    /**
     * Emitted when markers change for a model.
     * @event
     */
    function onDidChangeMarkers(listener) {
        const markerService = standaloneServices_1.StandaloneServices.get(markers_1.IMarkerService);
        return markerService.onMarkerChanged(listener);
    }
    exports.onDidChangeMarkers = onDidChangeMarkers;
    /**
     * Get the model that has `uri` if it exists.
     */
    function getModel(uri) {
        const modelService = standaloneServices_1.StandaloneServices.get(model_2.IModelService);
        return modelService.getModel(uri);
    }
    exports.getModel = getModel;
    /**
     * Get all the created models.
     */
    function getModels() {
        const modelService = standaloneServices_1.StandaloneServices.get(model_2.IModelService);
        return modelService.getModels();
    }
    exports.getModels = getModels;
    /**
     * Emitted when a model is created.
     * @event
     */
    function onDidCreateModel(listener) {
        const modelService = standaloneServices_1.StandaloneServices.get(model_2.IModelService);
        return modelService.onModelAdded(listener);
    }
    exports.onDidCreateModel = onDidCreateModel;
    /**
     * Emitted right before a model is disposed.
     * @event
     */
    function onWillDisposeModel(listener) {
        const modelService = standaloneServices_1.StandaloneServices.get(model_2.IModelService);
        return modelService.onModelRemoved(listener);
    }
    exports.onWillDisposeModel = onWillDisposeModel;
    /**
     * Emitted when a different language is set to a model.
     * @event
     */
    function onDidChangeModelLanguage(listener) {
        const modelService = standaloneServices_1.StandaloneServices.get(model_2.IModelService);
        return modelService.onModelLanguageChanged((e) => {
            listener({
                model: e.model,
                oldLanguage: e.oldLanguageId
            });
        });
    }
    exports.onDidChangeModelLanguage = onDidChangeModelLanguage;
    /**
     * Create a new web worker that has model syncing capabilities built in.
     * Specify an AMD module to load that will `create` an object that will be proxied.
     */
    function createWebWorker(opts) {
        return (0, webWorker_1.createWebWorker)(standaloneServices_1.StandaloneServices.get(model_2.IModelService), standaloneServices_1.StandaloneServices.get(languageConfigurationRegistry_1.ILanguageConfigurationService), opts);
    }
    exports.createWebWorker = createWebWorker;
    /**
     * Colorize the contents of `domNode` using attribute `data-lang`.
     */
    function colorizeElement(domNode, options) {
        const languageService = standaloneServices_1.StandaloneServices.get(language_1.ILanguageService);
        const themeService = standaloneServices_1.StandaloneServices.get(standaloneTheme_1.IStandaloneThemeService);
        return colorizer_1.Colorizer.colorizeElement(themeService, languageService, domNode, options).then(() => {
            themeService.registerEditorContainer(domNode);
        });
    }
    exports.colorizeElement = colorizeElement;
    /**
     * Colorize `text` using language `languageId`.
     */
    function colorize(text, languageId, options) {
        const languageService = standaloneServices_1.StandaloneServices.get(language_1.ILanguageService);
        const themeService = standaloneServices_1.StandaloneServices.get(standaloneTheme_1.IStandaloneThemeService);
        themeService.registerEditorContainer(document.body);
        return colorizer_1.Colorizer.colorize(languageService, text, languageId, options);
    }
    exports.colorize = colorize;
    /**
     * Colorize a line in a model.
     */
    function colorizeModelLine(model, lineNumber, tabSize = 4) {
        const themeService = standaloneServices_1.StandaloneServices.get(standaloneTheme_1.IStandaloneThemeService);
        themeService.registerEditorContainer(document.body);
        return colorizer_1.Colorizer.colorizeModelLine(model, lineNumber, tabSize);
    }
    exports.colorizeModelLine = colorizeModelLine;
    /**
     * @internal
     */
    function getSafeTokenizationSupport(language) {
        const tokenizationSupport = languages.TokenizationRegistry.get(language);
        if (tokenizationSupport) {
            return tokenizationSupport;
        }
        return {
            getInitialState: () => nullTokenize_1.NullState,
            tokenize: (line, hasEOL, state) => (0, nullTokenize_1.nullTokenize)(language, state)
        };
    }
    /**
     * Tokenize `text` using language `languageId`
     */
    function tokenize(text, languageId) {
        // Needed in order to get the mode registered for subsequent look-ups
        languages.TokenizationRegistry.getOrCreate(languageId);
        const tokenizationSupport = getSafeTokenizationSupport(languageId);
        const lines = (0, strings_1.splitLines)(text);
        const result = [];
        let state = tokenizationSupport.getInitialState();
        for (let i = 0, len = lines.length; i < len; i++) {
            const line = lines[i];
            const tokenizationResult = tokenizationSupport.tokenize(line, true, state);
            result[i] = tokenizationResult.tokens;
            state = tokenizationResult.endState;
        }
        return result;
    }
    exports.tokenize = tokenize;
    /**
     * Define a new theme or update an existing theme.
     */
    function defineTheme(themeName, themeData) {
        const standaloneThemeService = standaloneServices_1.StandaloneServices.get(standaloneTheme_1.IStandaloneThemeService);
        standaloneThemeService.defineTheme(themeName, themeData);
    }
    exports.defineTheme = defineTheme;
    /**
     * Switches to a theme.
     */
    function setTheme(themeName) {
        const standaloneThemeService = standaloneServices_1.StandaloneServices.get(standaloneTheme_1.IStandaloneThemeService);
        standaloneThemeService.setTheme(themeName);
    }
    exports.setTheme = setTheme;
    /**
     * Clears all cached font measurements and triggers re-measurement.
     */
    function remeasureFonts() {
        fontMeasurements_1.FontMeasurements.clearAllFontInfos();
    }
    exports.remeasureFonts = remeasureFonts;
    /**
     * Register a command.
     */
    function registerCommand(id, handler) {
        return commands_1.CommandsRegistry.registerCommand({ id, handler });
    }
    exports.registerCommand = registerCommand;
    /**
     * Registers a handler that is called when a link is opened in any editor. The handler callback should return `true` if the link was handled and `false` otherwise.
     * The handler that was registered last will be called first when a link is opened.
     *
     * Returns a disposable that can unregister the opener again.
     */
    function registerLinkOpener(opener) {
        const openerService = standaloneServices_1.StandaloneServices.get(opener_1.IOpenerService);
        return openerService.registerOpener({
            async open(resource) {
                if (typeof resource === 'string') {
                    resource = uri_1.URI.parse(resource);
                }
                return opener.open(resource);
            }
        });
    }
    exports.registerLinkOpener = registerLinkOpener;
    /**
     * Registers a handler that is called when a resource other than the current model should be opened in the editor (e.g. "go to definition").
     * The handler callback should return `true` if the request was handled and `false` otherwise.
     *
     * Returns a disposable that can unregister the opener again.
     *
     * If no handler is registered the default behavior is to do nothing for models other than the currently attached one.
     */
    function registerEditorOpener(opener) {
        const codeEditorService = standaloneServices_1.StandaloneServices.get(codeEditorService_1.ICodeEditorService);
        return codeEditorService.registerCodeEditorOpenHandler(async (input, source, sideBySide) => {
            if (!source) {
                return null;
            }
            const selection = input.options?.selection;
            let selectionOrPosition;
            if (selection && typeof selection.endLineNumber === 'number' && typeof selection.endColumn === 'number') {
                selectionOrPosition = selection;
            }
            else if (selection) {
                selectionOrPosition = { lineNumber: selection.startLineNumber, column: selection.startColumn };
            }
            if (await opener.openCodeEditor(source, input.resource, selectionOrPosition)) {
                return source; // return source editor to indicate that this handler has successfully handled the opening
            }
            return null; // fallback to other registered handlers
        });
    }
    exports.registerEditorOpener = registerEditorOpener;
    /**
     * @internal
     */
    function createMonacoEditorAPI() {
        return {
            // methods
            create: create,
            getEditors: getEditors,
            getDiffEditors: getDiffEditors,
            onDidCreateEditor: onDidCreateEditor,
            onDidCreateDiffEditor: onDidCreateDiffEditor,
            createDiffEditor: createDiffEditor,
            addCommand: addCommand,
            addEditorAction: addEditorAction,
            addKeybindingRule: addKeybindingRule,
            addKeybindingRules: addKeybindingRules,
            createModel: createModel,
            setModelLanguage: setModelLanguage,
            setModelMarkers: setModelMarkers,
            getModelMarkers: getModelMarkers,
            removeAllMarkers: removeAllMarkers,
            onDidChangeMarkers: onDidChangeMarkers,
            getModels: getModels,
            getModel: getModel,
            onDidCreateModel: onDidCreateModel,
            onWillDisposeModel: onWillDisposeModel,
            onDidChangeModelLanguage: onDidChangeModelLanguage,
            createWebWorker: createWebWorker,
            colorizeElement: colorizeElement,
            colorize: colorize,
            colorizeModelLine: colorizeModelLine,
            tokenize: tokenize,
            defineTheme: defineTheme,
            setTheme: setTheme,
            remeasureFonts: remeasureFonts,
            registerCommand: registerCommand,
            registerLinkOpener: registerLinkOpener,
            registerEditorOpener: registerEditorOpener,
            // enums
            AccessibilitySupport: standaloneEnums.AccessibilitySupport,
            ContentWidgetPositionPreference: standaloneEnums.ContentWidgetPositionPreference,
            CursorChangeReason: standaloneEnums.CursorChangeReason,
            DefaultEndOfLine: standaloneEnums.DefaultEndOfLine,
            EditorAutoIndentStrategy: standaloneEnums.EditorAutoIndentStrategy,
            EditorOption: standaloneEnums.EditorOption,
            EndOfLinePreference: standaloneEnums.EndOfLinePreference,
            EndOfLineSequence: standaloneEnums.EndOfLineSequence,
            MinimapPosition: standaloneEnums.MinimapPosition,
            MouseTargetType: standaloneEnums.MouseTargetType,
            OverlayWidgetPositionPreference: standaloneEnums.OverlayWidgetPositionPreference,
            OverviewRulerLane: standaloneEnums.OverviewRulerLane,
            GlyphMarginLane: standaloneEnums.GlyphMarginLane,
            RenderLineNumbersType: standaloneEnums.RenderLineNumbersType,
            RenderMinimap: standaloneEnums.RenderMinimap,
            ScrollbarVisibility: standaloneEnums.ScrollbarVisibility,
            ScrollType: standaloneEnums.ScrollType,
            TextEditorCursorBlinkingStyle: standaloneEnums.TextEditorCursorBlinkingStyle,
            TextEditorCursorStyle: standaloneEnums.TextEditorCursorStyle,
            TrackedRangeStickiness: standaloneEnums.TrackedRangeStickiness,
            WrappingIndent: standaloneEnums.WrappingIndent,
            InjectedTextCursorStops: standaloneEnums.InjectedTextCursorStops,
            PositionAffinity: standaloneEnums.PositionAffinity,
            // classes
            ConfigurationChangedEvent: editorOptions_1.ConfigurationChangedEvent,
            BareFontInfo: fontInfo_1.BareFontInfo,
            FontInfo: fontInfo_1.FontInfo,
            TextModelResolvedOptions: model_1.TextModelResolvedOptions,
            FindMatch: model_1.FindMatch,
            ApplyUpdateResult: editorOptions_1.ApplyUpdateResult,
            EditorZoom: editorZoom_1.EditorZoom,
            // vars
            EditorType: editorCommon_1.EditorType,
            EditorOptions: editorOptions_1.EditorOptions
        };
    }
    exports.createMonacoEditorAPI = createMonacoEditorAPI;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhbmRhbG9uZUVkaXRvci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9zdGFuZGFsb25lL2Jyb3dzZXIvc3RhbmRhbG9uZUVkaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFzQ2hHOzs7O09BSUc7SUFDSCxTQUFnQixNQUFNLENBQUMsVUFBdUIsRUFBRSxPQUE4QyxFQUFFLFFBQWtDO1FBQ2pJLE1BQU0sb0JBQW9CLEdBQUcsdUNBQWtCLENBQUMsVUFBVSxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUMzRSxPQUFPLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyx1Q0FBZ0IsRUFBRSxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDbkYsQ0FBQztJQUhELHdCQUdDO0lBRUQ7Ozs7T0FJRztJQUNILFNBQWdCLGlCQUFpQixDQUFDLFFBQTJDO1FBQzVFLE1BQU0saUJBQWlCLEdBQUcsdUNBQWtCLENBQUMsR0FBRyxDQUFDLHNDQUFrQixDQUFDLENBQUM7UUFDckUsT0FBTyxpQkFBaUIsQ0FBQyxlQUFlLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRTtZQUNuRCxRQUFRLENBQWMsTUFBTSxDQUFDLENBQUM7UUFDL0IsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDO0lBTEQsOENBS0M7SUFFRDs7O09BR0c7SUFDSCxTQUFnQixxQkFBcUIsQ0FBQyxRQUEyQztRQUNoRixNQUFNLGlCQUFpQixHQUFHLHVDQUFrQixDQUFDLEdBQUcsQ0FBQyxzQ0FBa0IsQ0FBQyxDQUFDO1FBQ3JFLE9BQU8saUJBQWlCLENBQUMsZUFBZSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUU7WUFDbkQsUUFBUSxDQUFjLE1BQU0sQ0FBQyxDQUFDO1FBQy9CLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUxELHNEQUtDO0lBRUQ7O09BRUc7SUFDSCxTQUFnQixV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