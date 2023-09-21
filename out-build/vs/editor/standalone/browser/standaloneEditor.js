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
        return instantiationService.createInstance(standaloneCodeEditor_1.$18b, domElement, options);
    }
    exports.create = create;
    /**
     * Emitted when an editor is created.
     * Creating a diff editor might cause this listener to be invoked with the two editors.
     * @event
     */
    function onDidCreateEditor(listener) {
        const codeEditorService = standaloneServices_1.StandaloneServices.get(codeEditorService_1.$nV);
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
        const codeEditorService = standaloneServices_1.StandaloneServices.get(codeEditorService_1.$nV);
        return codeEditorService.onDiffEditorAdd((editor) => {
            listener(editor);
        });
    }
    exports.onDidCreateDiffEditor = onDidCreateDiffEditor;
    /**
     * Get all the created editors.
     */
    function getEditors() {
        const codeEditorService = standaloneServices_1.StandaloneServices.get(codeEditorService_1.$nV);
        return codeEditorService.listCodeEditors();
    }
    exports.getEditors = getEditors;
    /**
     * Get all the created diff editors.
     */
    function getDiffEditors() {
        const codeEditorService = standaloneServices_1.StandaloneServices.get(codeEditorService_1.$nV);
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
        return instantiationService.createInstance(standaloneCodeEditor_1.$28b, domElement, options);
    }
    exports.createDiffEditor = createDiffEditor;
    /**
     * Add a command.
     */
    function addCommand(descriptor) {
        if ((typeof descriptor.id !== 'string') || (typeof descriptor.run !== 'function')) {
            throw new Error('Invalid command descriptor, `id` and `run` are required properties!');
        }
        return commands_1.$Gr.registerCommand(descriptor.id, descriptor.run);
    }
    exports.addCommand = addCommand;
    /**
     * Add an action to all editors.
     */
    function addEditorAction(descriptor) {
        if ((typeof descriptor.id !== 'string') || (typeof descriptor.label !== 'string') || (typeof descriptor.run !== 'function')) {
            throw new Error('Invalid action descriptor, `id`, `label` and `run` are required properties!');
        }
        const precondition = contextkey_1.$Ii.deserialize(descriptor.precondition);
        const run = (accessor, ...args) => {
            return editorExtensions_1.$rV.runEditorCommand(accessor, args, precondition, (accessor, editor, args) => Promise.resolve(descriptor.run(editor, ...args)));
        };
        const toDispose = new lifecycle_1.$jc();
        // Register the command
        toDispose.add(commands_1.$Gr.registerCommand(descriptor.id, run));
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
            toDispose.add(actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorContext, menuItem));
        }
        // Register the keybindings
        if (Array.isArray(descriptor.keybindings)) {
            const keybindingService = standaloneServices_1.StandaloneServices.get(keybinding_1.$2D);
            if (!(keybindingService instanceof standaloneServices_1.$W8b)) {
                console.warn('Cannot add keybinding because the editor is configured with an unrecognized KeybindingService');
            }
            else {
                const keybindingsWhen = contextkey_1.$Ii.and(precondition, contextkey_1.$Ii.deserialize(descriptor.keybindingContext));
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
        const keybindingService = standaloneServices_1.StandaloneServices.get(keybinding_1.$2D);
        if (!(keybindingService instanceof standaloneServices_1.$W8b)) {
            console.warn('Cannot add keybinding because the editor is configured with an unrecognized KeybindingService');
            return lifecycle_1.$kc.None;
        }
        return keybindingService.addDynamicKeybindings(rules.map((rule) => {
            return {
                keybinding: rule.keybinding,
                command: rule.command,
                commandArgs: rule.commandArgs,
                when: contextkey_1.$Ii.deserialize(rule.when),
            };
        }));
    }
    exports.addKeybindingRules = addKeybindingRules;
    /**
     * Create a new editor model.
     * You can specify the language that should be set for this model or let the language be inferred from the `uri`.
     */
    function createModel(value, language, uri) {
        const languageService = standaloneServices_1.StandaloneServices.get(language_1.$ct);
        const languageId = languageService.getLanguageIdByMimeType(language) || language;
        return (0, standaloneCodeEditor_1.$38b)(standaloneServices_1.StandaloneServices.get(model_2.$yA), languageService, value, languageId, uri);
    }
    exports.createModel = createModel;
    /**
     * Change the language for a model.
     */
    function setModelLanguage(model, mimeTypeOrLanguageId) {
        const languageService = standaloneServices_1.StandaloneServices.get(language_1.$ct);
        const languageId = languageService.getLanguageIdByMimeType(mimeTypeOrLanguageId) || mimeTypeOrLanguageId || modesRegistry_1.$Yt;
        model.setLanguage(languageService.createById(languageId));
    }
    exports.setModelLanguage = setModelLanguage;
    /**
     * Set the markers for a model.
     */
    function setModelMarkers(model, owner, markers) {
        if (model) {
            const markerService = standaloneServices_1.StandaloneServices.get(markers_1.$3s);
            markerService.changeOne(owner, model.uri, markers);
        }
    }
    exports.setModelMarkers = setModelMarkers;
    /**
     * Remove all markers of an owner.
     */
    function removeAllMarkers(owner) {
        const markerService = standaloneServices_1.StandaloneServices.get(markers_1.$3s);
        markerService.changeAll(owner, []);
    }
    exports.removeAllMarkers = removeAllMarkers;
    /**
     * Get markers for owner and/or resource
     *
     * @returns list of markers
     */
    function getModelMarkers(filter) {
        const markerService = standaloneServices_1.StandaloneServices.get(markers_1.$3s);
        return markerService.read(filter);
    }
    exports.getModelMarkers = getModelMarkers;
    /**
     * Emitted when markers change for a model.
     * @event
     */
    function onDidChangeMarkers(listener) {
        const markerService = standaloneServices_1.StandaloneServices.get(markers_1.$3s);
        return markerService.onMarkerChanged(listener);
    }
    exports.onDidChangeMarkers = onDidChangeMarkers;
    /**
     * Get the model that has `uri` if it exists.
     */
    function getModel(uri) {
        const modelService = standaloneServices_1.StandaloneServices.get(model_2.$yA);
        return modelService.getModel(uri);
    }
    exports.getModel = getModel;
    /**
     * Get all the created models.
     */
    function getModels() {
        const modelService = standaloneServices_1.StandaloneServices.get(model_2.$yA);
        return modelService.getModels();
    }
    exports.getModels = getModels;
    /**
     * Emitted when a model is created.
     * @event
     */
    function onDidCreateModel(listener) {
        const modelService = standaloneServices_1.StandaloneServices.get(model_2.$yA);
        return modelService.onModelAdded(listener);
    }
    exports.onDidCreateModel = onDidCreateModel;
    /**
     * Emitted right before a model is disposed.
     * @event
     */
    function onWillDisposeModel(listener) {
        const modelService = standaloneServices_1.StandaloneServices.get(model_2.$yA);
        return modelService.onModelRemoved(listener);
    }
    exports.onWillDisposeModel = onWillDisposeModel;
    /**
     * Emitted when a different language is set to a model.
     * @event
     */
    function onDidChangeModelLanguage(listener) {
        const modelService = standaloneServices_1.StandaloneServices.get(model_2.$yA);
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
        return (0, webWorker_1.$tBb)(standaloneServices_1.StandaloneServices.get(model_2.$yA), standaloneServices_1.StandaloneServices.get(languageConfigurationRegistry_1.$2t), opts);
    }
    exports.createWebWorker = createWebWorker;
    /**
     * Colorize the contents of `domNode` using attribute `data-lang`.
     */
    function colorizeElement(domNode, options) {
        const languageService = standaloneServices_1.StandaloneServices.get(language_1.$ct);
        const themeService = standaloneServices_1.StandaloneServices.get(standaloneTheme_1.$D8b);
        return colorizer_1.$F8b.colorizeElement(themeService, languageService, domNode, options).then(() => {
            themeService.registerEditorContainer(domNode);
        });
    }
    exports.colorizeElement = colorizeElement;
    /**
     * Colorize `text` using language `languageId`.
     */
    function colorize(text, languageId, options) {
        const languageService = standaloneServices_1.StandaloneServices.get(language_1.$ct);
        const themeService = standaloneServices_1.StandaloneServices.get(standaloneTheme_1.$D8b);
        themeService.registerEditorContainer(document.body);
        return colorizer_1.$F8b.colorize(languageService, text, languageId, options);
    }
    exports.colorize = colorize;
    /**
     * Colorize a line in a model.
     */
    function colorizeModelLine(model, lineNumber, tabSize = 4) {
        const themeService = standaloneServices_1.StandaloneServices.get(standaloneTheme_1.$D8b);
        themeService.registerEditorContainer(document.body);
        return colorizer_1.$F8b.colorizeModelLine(model, lineNumber, tabSize);
    }
    exports.colorizeModelLine = colorizeModelLine;
    /**
     * @internal
     */
    function getSafeTokenizationSupport(language) {
        const tokenizationSupport = languages.$bt.get(language);
        if (tokenizationSupport) {
            return tokenizationSupport;
        }
        return {
            getInitialState: () => nullTokenize_1.$uC,
            tokenize: (line, hasEOL, state) => (0, nullTokenize_1.$vC)(language, state)
        };
    }
    /**
     * Tokenize `text` using language `languageId`
     */
    function tokenize(text, languageId) {
        // Needed in order to get the mode registered for subsequent look-ups
        languages.$bt.getOrCreate(languageId);
        const tokenizationSupport = getSafeTokenizationSupport(languageId);
        const lines = (0, strings_1.$Ae)(text);
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
        const standaloneThemeService = standaloneServices_1.StandaloneServices.get(standaloneTheme_1.$D8b);
        standaloneThemeService.defineTheme(themeName, themeData);
    }
    exports.defineTheme = defineTheme;
    /**
     * Switches to a theme.
     */
    function setTheme(themeName) {
        const standaloneThemeService = standaloneServices_1.StandaloneServices.get(standaloneTheme_1.$D8b);
        standaloneThemeService.setTheme(themeName);
    }
    exports.setTheme = setTheme;
    /**
     * Clears all cached font measurements and triggers re-measurement.
     */
    function remeasureFonts() {
        fontMeasurements_1.$zU.clearAllFontInfos();
    }
    exports.remeasureFonts = remeasureFonts;
    /**
     * Register a command.
     */
    function registerCommand(id, handler) {
        return commands_1.$Gr.registerCommand({ id, handler });
    }
    exports.registerCommand = registerCommand;
    /**
     * Registers a handler that is called when a link is opened in any editor. The handler callback should return `true` if the link was handled and `false` otherwise.
     * The handler that was registered last will be called first when a link is opened.
     *
     * Returns a disposable that can unregister the opener again.
     */
    function registerLinkOpener(opener) {
        const openerService = standaloneServices_1.StandaloneServices.get(opener_1.$NT);
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
        const codeEditorService = standaloneServices_1.StandaloneServices.get(codeEditorService_1.$nV);
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
            BareFontInfo: fontInfo_1.$Rr,
            FontInfo: fontInfo_1.$Tr,
            TextModelResolvedOptions: model_1.$Au,
            FindMatch: model_1.$Bu,
            ApplyUpdateResult: editorOptions_1.ApplyUpdateResult,
            EditorZoom: editorZoom_1.EditorZoom,
            // vars
            EditorType: editorCommon_1.EditorType,
            EditorOptions: editorOptions_1.EditorOptions
        };
    }
    exports.createMonacoEditorAPI = createMonacoEditorAPI;
});
//# sourceMappingURL=standaloneEditor.js.map