/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/objects", "vs/base/common/platform", "vs/editor/common/core/textModelDefaults", "vs/editor/common/core/wordHelper", "vs/nls!vs/editor/common/config/editorOptions"], function (require, exports, arrays, objects, platform, textModelDefaults_1, wordHelper_1, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditorOptions = exports.EditorOption = exports.editorOptionsRegistry = exports.EDITOR_FONT_DEFAULTS = exports.WrappingIndent = exports.unicodeHighlightConfigKeys = exports.inUntrustedWorkspace = exports.filterValidationDecorations = exports.RenderLineNumbersType = exports.EditorLayoutInfoComputer = exports.RenderMinimap = exports.EditorFontVariations = exports.EditorFontLigatures = exports.cursorStyleToString = exports.TextEditorCursorStyle = exports.TextEditorCursorBlinkingStyle = exports.stringSet = exports.clampedFloat = exports.clampedInt = exports.boolean = exports.ApplyUpdateResult = exports.ComputeOptionsMemory = exports.ConfigurationChangedEvent = exports.MINIMAP_GUTTER_WIDTH = exports.EditorAutoIndentStrategy = void 0;
    /**
     * Configuration options for auto indentation in the editor
     */
    var EditorAutoIndentStrategy;
    (function (EditorAutoIndentStrategy) {
        EditorAutoIndentStrategy[EditorAutoIndentStrategy["None"] = 0] = "None";
        EditorAutoIndentStrategy[EditorAutoIndentStrategy["Keep"] = 1] = "Keep";
        EditorAutoIndentStrategy[EditorAutoIndentStrategy["Brackets"] = 2] = "Brackets";
        EditorAutoIndentStrategy[EditorAutoIndentStrategy["Advanced"] = 3] = "Advanced";
        EditorAutoIndentStrategy[EditorAutoIndentStrategy["Full"] = 4] = "Full";
    })(EditorAutoIndentStrategy || (exports.EditorAutoIndentStrategy = EditorAutoIndentStrategy = {}));
    /**
     * @internal
     * The width of the minimap gutter, in pixels.
     */
    exports.MINIMAP_GUTTER_WIDTH = 8;
    //#endregion
    /**
     * An event describing that the configuration of the editor has changed.
     */
    class ConfigurationChangedEvent {
        /**
         * @internal
         */
        constructor(values) {
            this.c = values;
        }
        hasChanged(id) {
            return this.c[id];
        }
    }
    exports.ConfigurationChangedEvent = ConfigurationChangedEvent;
    /**
     * @internal
     */
    class ComputeOptionsMemory {
        constructor() {
            this.stableMinimapLayoutInput = null;
            this.stableFitMaxMinimapScale = 0;
            this.stableFitRemainingWidth = 0;
        }
    }
    exports.ComputeOptionsMemory = ComputeOptionsMemory;
    /**
     * @internal
     */
    class BaseEditorOption {
        constructor(id, name, defaultValue, schema) {
            this.id = id;
            this.name = name;
            this.defaultValue = defaultValue;
            this.schema = schema;
        }
        applyUpdate(value, update) {
            return applyUpdate(value, update);
        }
        compute(env, options, value) {
            return value;
        }
    }
    class ApplyUpdateResult {
        constructor(newValue, didChange) {
            this.newValue = newValue;
            this.didChange = didChange;
        }
    }
    exports.ApplyUpdateResult = ApplyUpdateResult;
    function applyUpdate(value, update) {
        if (typeof value !== 'object' || typeof update !== 'object' || !value || !update) {
            return new ApplyUpdateResult(update, value !== update);
        }
        if (Array.isArray(value) || Array.isArray(update)) {
            const arrayEquals = Array.isArray(value) && Array.isArray(update) && arrays.$sb(value, update);
            return new ApplyUpdateResult(update, !arrayEquals);
        }
        let didChange = false;
        for (const key in update) {
            if (update.hasOwnProperty(key)) {
                const result = applyUpdate(value[key], update[key]);
                if (result.didChange) {
                    value[key] = result.newValue;
                    didChange = true;
                }
            }
        }
        return new ApplyUpdateResult(value, didChange);
    }
    /**
     * @internal
     */
    class ComputedEditorOption {
        constructor(id) {
            this.schema = undefined;
            this.id = id;
            this.name = '_never_';
            this.defaultValue = undefined;
        }
        applyUpdate(value, update) {
            return applyUpdate(value, update);
        }
        validate(input) {
            return this.defaultValue;
        }
    }
    class SimpleEditorOption {
        constructor(id, name, defaultValue, schema) {
            this.id = id;
            this.name = name;
            this.defaultValue = defaultValue;
            this.schema = schema;
        }
        applyUpdate(value, update) {
            return applyUpdate(value, update);
        }
        validate(input) {
            if (typeof input === 'undefined') {
                return this.defaultValue;
            }
            return input;
        }
        compute(env, options, value) {
            return value;
        }
    }
    /**
     * @internal
     */
    function boolean(value, defaultValue) {
        if (typeof value === 'undefined') {
            return defaultValue;
        }
        if (value === 'false') {
            // treat the string 'false' as false
            return false;
        }
        return Boolean(value);
    }
    exports.boolean = boolean;
    class EditorBooleanOption extends SimpleEditorOption {
        constructor(id, name, defaultValue, schema = undefined) {
            if (typeof schema !== 'undefined') {
                schema.type = 'boolean';
                schema.default = defaultValue;
            }
            super(id, name, defaultValue, schema);
        }
        validate(input) {
            return boolean(input, this.defaultValue);
        }
    }
    /**
     * @internal
     */
    function clampedInt(value, defaultValue, minimum, maximum) {
        if (typeof value === 'undefined') {
            return defaultValue;
        }
        let r = parseInt(value, 10);
        if (isNaN(r)) {
            return defaultValue;
        }
        r = Math.max(minimum, r);
        r = Math.min(maximum, r);
        return r | 0;
    }
    exports.clampedInt = clampedInt;
    class EditorIntOption extends SimpleEditorOption {
        static clampedInt(value, defaultValue, minimum, maximum) {
            return clampedInt(value, defaultValue, minimum, maximum);
        }
        constructor(id, name, defaultValue, minimum, maximum, schema = undefined) {
            if (typeof schema !== 'undefined') {
                schema.type = 'integer';
                schema.default = defaultValue;
                schema.minimum = minimum;
                schema.maximum = maximum;
            }
            super(id, name, defaultValue, schema);
            this.minimum = minimum;
            this.maximum = maximum;
        }
        validate(input) {
            return EditorIntOption.clampedInt(input, this.defaultValue, this.minimum, this.maximum);
        }
    }
    /**
     * @internal
     */
    function clampedFloat(value, defaultValue, minimum, maximum) {
        if (typeof value === 'undefined') {
            return defaultValue;
        }
        const r = EditorFloatOption.float(value, defaultValue);
        return EditorFloatOption.clamp(r, minimum, maximum);
    }
    exports.clampedFloat = clampedFloat;
    class EditorFloatOption extends SimpleEditorOption {
        static clamp(n, min, max) {
            if (n < min) {
                return min;
            }
            if (n > max) {
                return max;
            }
            return n;
        }
        static float(value, defaultValue) {
            if (typeof value === 'number') {
                return value;
            }
            if (typeof value === 'undefined') {
                return defaultValue;
            }
            const r = parseFloat(value);
            return (isNaN(r) ? defaultValue : r);
        }
        constructor(id, name, defaultValue, validationFn, schema) {
            if (typeof schema !== 'undefined') {
                schema.type = 'number';
                schema.default = defaultValue;
            }
            super(id, name, defaultValue, schema);
            this.validationFn = validationFn;
        }
        validate(input) {
            return this.validationFn(EditorFloatOption.float(input, this.defaultValue));
        }
    }
    class EditorStringOption extends SimpleEditorOption {
        static string(value, defaultValue) {
            if (typeof value !== 'string') {
                return defaultValue;
            }
            return value;
        }
        constructor(id, name, defaultValue, schema = undefined) {
            if (typeof schema !== 'undefined') {
                schema.type = 'string';
                schema.default = defaultValue;
            }
            super(id, name, defaultValue, schema);
        }
        validate(input) {
            return EditorStringOption.string(input, this.defaultValue);
        }
    }
    /**
     * @internal
     */
    function stringSet(value, defaultValue, allowedValues, renamedValues) {
        if (typeof value !== 'string') {
            return defaultValue;
        }
        if (renamedValues && value in renamedValues) {
            return renamedValues[value];
        }
        if (allowedValues.indexOf(value) === -1) {
            return defaultValue;
        }
        return value;
    }
    exports.stringSet = stringSet;
    class EditorStringEnumOption extends SimpleEditorOption {
        constructor(id, name, defaultValue, allowedValues, schema = undefined) {
            if (typeof schema !== 'undefined') {
                schema.type = 'string';
                schema.enum = allowedValues;
                schema.default = defaultValue;
            }
            super(id, name, defaultValue, schema);
            this.c = allowedValues;
        }
        validate(input) {
            return stringSet(input, this.defaultValue, this.c);
        }
    }
    class EditorEnumOption extends BaseEditorOption {
        constructor(id, name, defaultValue, defaultStringValue, allowedValues, convert, schema = undefined) {
            if (typeof schema !== 'undefined') {
                schema.type = 'string';
                schema.enum = allowedValues;
                schema.default = defaultStringValue;
            }
            super(id, name, defaultValue, schema);
            this.c = allowedValues;
            this.d = convert;
        }
        validate(input) {
            if (typeof input !== 'string') {
                return this.defaultValue;
            }
            if (this.c.indexOf(input) === -1) {
                return this.defaultValue;
            }
            return this.d(input);
        }
    }
    //#endregion
    //#region autoIndent
    function _autoIndentFromString(autoIndent) {
        switch (autoIndent) {
            case 'none': return 0 /* EditorAutoIndentStrategy.None */;
            case 'keep': return 1 /* EditorAutoIndentStrategy.Keep */;
            case 'brackets': return 2 /* EditorAutoIndentStrategy.Brackets */;
            case 'advanced': return 3 /* EditorAutoIndentStrategy.Advanced */;
            case 'full': return 4 /* EditorAutoIndentStrategy.Full */;
        }
    }
    //#endregion
    //#region accessibilitySupport
    class EditorAccessibilitySupport extends BaseEditorOption {
        constructor() {
            super(2 /* EditorOption.accessibilitySupport */, 'accessibilitySupport', 0 /* AccessibilitySupport.Unknown */, {
                type: 'string',
                enum: ['auto', 'on', 'off'],
                enumDescriptions: [
                    nls.localize(0, null),
                    nls.localize(1, null),
                    nls.localize(2, null),
                ],
                default: 'auto',
                tags: ['accessibility'],
                description: nls.localize(3, null)
            });
        }
        validate(input) {
            switch (input) {
                case 'auto': return 0 /* AccessibilitySupport.Unknown */;
                case 'off': return 1 /* AccessibilitySupport.Disabled */;
                case 'on': return 2 /* AccessibilitySupport.Enabled */;
            }
            return this.defaultValue;
        }
        compute(env, options, value) {
            if (value === 0 /* AccessibilitySupport.Unknown */) {
                // The editor reads the `accessibilitySupport` from the environment
                return env.accessibilitySupport;
            }
            return value;
        }
    }
    class EditorComments extends BaseEditorOption {
        constructor() {
            const defaults = {
                insertSpace: true,
                ignoreEmptyLines: true,
            };
            super(23 /* EditorOption.comments */, 'comments', defaults, {
                'editor.comments.insertSpace': {
                    type: 'boolean',
                    default: defaults.insertSpace,
                    description: nls.localize(4, null)
                },
                'editor.comments.ignoreEmptyLines': {
                    type: 'boolean',
                    default: defaults.ignoreEmptyLines,
                    description: nls.localize(5, null)
                },
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            return {
                insertSpace: boolean(input.insertSpace, this.defaultValue.insertSpace),
                ignoreEmptyLines: boolean(input.ignoreEmptyLines, this.defaultValue.ignoreEmptyLines),
            };
        }
    }
    //#endregion
    //#region cursorBlinking
    /**
     * The kind of animation in which the editor's cursor should be rendered.
     */
    var TextEditorCursorBlinkingStyle;
    (function (TextEditorCursorBlinkingStyle) {
        /**
         * Hidden
         */
        TextEditorCursorBlinkingStyle[TextEditorCursorBlinkingStyle["Hidden"] = 0] = "Hidden";
        /**
         * Blinking
         */
        TextEditorCursorBlinkingStyle[TextEditorCursorBlinkingStyle["Blink"] = 1] = "Blink";
        /**
         * Blinking with smooth fading
         */
        TextEditorCursorBlinkingStyle[TextEditorCursorBlinkingStyle["Smooth"] = 2] = "Smooth";
        /**
         * Blinking with prolonged filled state and smooth fading
         */
        TextEditorCursorBlinkingStyle[TextEditorCursorBlinkingStyle["Phase"] = 3] = "Phase";
        /**
         * Expand collapse animation on the y axis
         */
        TextEditorCursorBlinkingStyle[TextEditorCursorBlinkingStyle["Expand"] = 4] = "Expand";
        /**
         * No-Blinking
         */
        TextEditorCursorBlinkingStyle[TextEditorCursorBlinkingStyle["Solid"] = 5] = "Solid";
    })(TextEditorCursorBlinkingStyle || (exports.TextEditorCursorBlinkingStyle = TextEditorCursorBlinkingStyle = {}));
    function _cursorBlinkingStyleFromString(cursorBlinkingStyle) {
        switch (cursorBlinkingStyle) {
            case 'blink': return 1 /* TextEditorCursorBlinkingStyle.Blink */;
            case 'smooth': return 2 /* TextEditorCursorBlinkingStyle.Smooth */;
            case 'phase': return 3 /* TextEditorCursorBlinkingStyle.Phase */;
            case 'expand': return 4 /* TextEditorCursorBlinkingStyle.Expand */;
            case 'solid': return 5 /* TextEditorCursorBlinkingStyle.Solid */;
        }
    }
    //#endregion
    //#region cursorStyle
    /**
     * The style in which the editor's cursor should be rendered.
     */
    var TextEditorCursorStyle;
    (function (TextEditorCursorStyle) {
        /**
         * As a vertical line (sitting between two characters).
         */
        TextEditorCursorStyle[TextEditorCursorStyle["Line"] = 1] = "Line";
        /**
         * As a block (sitting on top of a character).
         */
        TextEditorCursorStyle[TextEditorCursorStyle["Block"] = 2] = "Block";
        /**
         * As a horizontal line (sitting under a character).
         */
        TextEditorCursorStyle[TextEditorCursorStyle["Underline"] = 3] = "Underline";
        /**
         * As a thin vertical line (sitting between two characters).
         */
        TextEditorCursorStyle[TextEditorCursorStyle["LineThin"] = 4] = "LineThin";
        /**
         * As an outlined block (sitting on top of a character).
         */
        TextEditorCursorStyle[TextEditorCursorStyle["BlockOutline"] = 5] = "BlockOutline";
        /**
         * As a thin horizontal line (sitting under a character).
         */
        TextEditorCursorStyle[TextEditorCursorStyle["UnderlineThin"] = 6] = "UnderlineThin";
    })(TextEditorCursorStyle || (exports.TextEditorCursorStyle = TextEditorCursorStyle = {}));
    /**
     * @internal
     */
    function cursorStyleToString(cursorStyle) {
        switch (cursorStyle) {
            case TextEditorCursorStyle.Line: return 'line';
            case TextEditorCursorStyle.Block: return 'block';
            case TextEditorCursorStyle.Underline: return 'underline';
            case TextEditorCursorStyle.LineThin: return 'line-thin';
            case TextEditorCursorStyle.BlockOutline: return 'block-outline';
            case TextEditorCursorStyle.UnderlineThin: return 'underline-thin';
        }
    }
    exports.cursorStyleToString = cursorStyleToString;
    function _cursorStyleFromString(cursorStyle) {
        switch (cursorStyle) {
            case 'line': return TextEditorCursorStyle.Line;
            case 'block': return TextEditorCursorStyle.Block;
            case 'underline': return TextEditorCursorStyle.Underline;
            case 'line-thin': return TextEditorCursorStyle.LineThin;
            case 'block-outline': return TextEditorCursorStyle.BlockOutline;
            case 'underline-thin': return TextEditorCursorStyle.UnderlineThin;
        }
    }
    //#endregion
    //#region editorClassName
    class EditorClassName extends ComputedEditorOption {
        constructor() {
            super(140 /* EditorOption.editorClassName */);
        }
        compute(env, options, _) {
            const classNames = ['monaco-editor'];
            if (options.get(39 /* EditorOption.extraEditorClassName */)) {
                classNames.push(options.get(39 /* EditorOption.extraEditorClassName */));
            }
            if (env.extraEditorClassName) {
                classNames.push(env.extraEditorClassName);
            }
            if (options.get(73 /* EditorOption.mouseStyle */) === 'default') {
                classNames.push('mouse-default');
            }
            else if (options.get(73 /* EditorOption.mouseStyle */) === 'copy') {
                classNames.push('mouse-copy');
            }
            if (options.get(110 /* EditorOption.showUnused */)) {
                classNames.push('showUnused');
            }
            if (options.get(138 /* EditorOption.showDeprecated */)) {
                classNames.push('showDeprecated');
            }
            return classNames.join(' ');
        }
    }
    //#endregion
    //#region emptySelectionClipboard
    class EditorEmptySelectionClipboard extends EditorBooleanOption {
        constructor() {
            super(37 /* EditorOption.emptySelectionClipboard */, 'emptySelectionClipboard', true, { description: nls.localize(6, null) });
        }
        compute(env, options, value) {
            return value && env.emptySelectionClipboard;
        }
    }
    class EditorFind extends BaseEditorOption {
        constructor() {
            const defaults = {
                cursorMoveOnType: true,
                seedSearchStringFromSelection: 'always',
                autoFindInSelection: 'never',
                globalFindClipboard: false,
                addExtraSpaceOnTop: true,
                loop: true
            };
            super(41 /* EditorOption.find */, 'find', defaults, {
                'editor.find.cursorMoveOnType': {
                    type: 'boolean',
                    default: defaults.cursorMoveOnType,
                    description: nls.localize(7, null)
                },
                'editor.find.seedSearchStringFromSelection': {
                    type: 'string',
                    enum: ['never', 'always', 'selection'],
                    default: defaults.seedSearchStringFromSelection,
                    enumDescriptions: [
                        nls.localize(8, null),
                        nls.localize(9, null),
                        nls.localize(10, null)
                    ],
                    description: nls.localize(11, null)
                },
                'editor.find.autoFindInSelection': {
                    type: 'string',
                    enum: ['never', 'always', 'multiline'],
                    default: defaults.autoFindInSelection,
                    enumDescriptions: [
                        nls.localize(12, null),
                        nls.localize(13, null),
                        nls.localize(14, null)
                    ],
                    description: nls.localize(15, null)
                },
                'editor.find.globalFindClipboard': {
                    type: 'boolean',
                    default: defaults.globalFindClipboard,
                    description: nls.localize(16, null),
                    included: platform.$j
                },
                'editor.find.addExtraSpaceOnTop': {
                    type: 'boolean',
                    default: defaults.addExtraSpaceOnTop,
                    description: nls.localize(17, null)
                },
                'editor.find.loop': {
                    type: 'boolean',
                    default: defaults.loop,
                    description: nls.localize(18, null)
                },
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            return {
                cursorMoveOnType: boolean(input.cursorMoveOnType, this.defaultValue.cursorMoveOnType),
                seedSearchStringFromSelection: typeof _input.seedSearchStringFromSelection === 'boolean'
                    ? (_input.seedSearchStringFromSelection ? 'always' : 'never')
                    : stringSet(input.seedSearchStringFromSelection, this.defaultValue.seedSearchStringFromSelection, ['never', 'always', 'selection']),
                autoFindInSelection: typeof _input.autoFindInSelection === 'boolean'
                    ? (_input.autoFindInSelection ? 'always' : 'never')
                    : stringSet(input.autoFindInSelection, this.defaultValue.autoFindInSelection, ['never', 'always', 'multiline']),
                globalFindClipboard: boolean(input.globalFindClipboard, this.defaultValue.globalFindClipboard),
                addExtraSpaceOnTop: boolean(input.addExtraSpaceOnTop, this.defaultValue.addExtraSpaceOnTop),
                loop: boolean(input.loop, this.defaultValue.loop),
            };
        }
    }
    //#endregion
    //#region fontLigatures
    /**
     * @internal
     */
    class EditorFontLigatures extends BaseEditorOption {
        static { this.OFF = '"liga" off, "calt" off'; }
        static { this.ON = '"liga" on, "calt" on'; }
        constructor() {
            super(51 /* EditorOption.fontLigatures */, 'fontLigatures', EditorFontLigatures.OFF, {
                anyOf: [
                    {
                        type: 'boolean',
                        description: nls.localize(19, null),
                    },
                    {
                        type: 'string',
                        description: nls.localize(20, null)
                    }
                ],
                description: nls.localize(21, null),
                default: false
            });
        }
        validate(input) {
            if (typeof input === 'undefined') {
                return this.defaultValue;
            }
            if (typeof input === 'string') {
                if (input === 'false') {
                    return EditorFontLigatures.OFF;
                }
                if (input === 'true') {
                    return EditorFontLigatures.ON;
                }
                return input;
            }
            if (Boolean(input)) {
                return EditorFontLigatures.ON;
            }
            return EditorFontLigatures.OFF;
        }
    }
    exports.EditorFontLigatures = EditorFontLigatures;
    //#endregion
    //#region fontVariations
    /**
     * @internal
     */
    class EditorFontVariations extends BaseEditorOption {
        // Text is laid out using default settings.
        static { this.OFF = 'normal'; }
        // Translate `fontWeight` config to the `font-variation-settings` CSS property.
        static { this.TRANSLATE = 'translate'; }
        constructor() {
            super(54 /* EditorOption.fontVariations */, 'fontVariations', EditorFontVariations.OFF, {
                anyOf: [
                    {
                        type: 'boolean',
                        description: nls.localize(22, null),
                    },
                    {
                        type: 'string',
                        description: nls.localize(23, null)
                    }
                ],
                description: nls.localize(24, null),
                default: false
            });
        }
        validate(input) {
            if (typeof input === 'undefined') {
                return this.defaultValue;
            }
            if (typeof input === 'string') {
                if (input === 'false') {
                    return EditorFontVariations.OFF;
                }
                if (input === 'true') {
                    return EditorFontVariations.TRANSLATE;
                }
                return input;
            }
            if (Boolean(input)) {
                return EditorFontVariations.TRANSLATE;
            }
            return EditorFontVariations.OFF;
        }
        compute(env, options, value) {
            // The value is computed from the fontWeight if it is true.
            // So take the result from env.fontInfo
            return env.fontInfo.fontVariationSettings;
        }
    }
    exports.EditorFontVariations = EditorFontVariations;
    //#endregion
    //#region fontInfo
    class EditorFontInfo extends ComputedEditorOption {
        constructor() {
            super(50 /* EditorOption.fontInfo */);
        }
        compute(env, options, _) {
            return env.fontInfo;
        }
    }
    //#endregion
    //#region fontSize
    class EditorFontSize extends SimpleEditorOption {
        constructor() {
            super(52 /* EditorOption.fontSize */, 'fontSize', exports.EDITOR_FONT_DEFAULTS.fontSize, {
                type: 'number',
                minimum: 6,
                maximum: 100,
                default: exports.EDITOR_FONT_DEFAULTS.fontSize,
                description: nls.localize(25, null)
            });
        }
        validate(input) {
            const r = EditorFloatOption.float(input, this.defaultValue);
            if (r === 0) {
                return exports.EDITOR_FONT_DEFAULTS.fontSize;
            }
            return EditorFloatOption.clamp(r, 6, 100);
        }
        compute(env, options, value) {
            // The final fontSize respects the editor zoom level.
            // So take the result from env.fontInfo
            return env.fontInfo.fontSize;
        }
    }
    //#endregion
    //#region fontWeight
    class EditorFontWeight extends BaseEditorOption {
        static { this.c = ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900']; }
        static { this.d = 1; }
        static { this.e = 1000; }
        constructor() {
            super(53 /* EditorOption.fontWeight */, 'fontWeight', exports.EDITOR_FONT_DEFAULTS.fontWeight, {
                anyOf: [
                    {
                        type: 'number',
                        minimum: EditorFontWeight.d,
                        maximum: EditorFontWeight.e,
                        errorMessage: nls.localize(26, null)
                    },
                    {
                        type: 'string',
                        pattern: '^(normal|bold|1000|[1-9][0-9]{0,2})$'
                    },
                    {
                        enum: EditorFontWeight.c
                    }
                ],
                default: exports.EDITOR_FONT_DEFAULTS.fontWeight,
                description: nls.localize(27, null)
            });
        }
        validate(input) {
            if (input === 'normal' || input === 'bold') {
                return input;
            }
            return String(EditorIntOption.clampedInt(input, exports.EDITOR_FONT_DEFAULTS.fontWeight, EditorFontWeight.d, EditorFontWeight.e));
        }
    }
    class EditorGoToLocation extends BaseEditorOption {
        constructor() {
            const defaults = {
                multiple: 'peek',
                multipleDefinitions: 'peek',
                multipleTypeDefinitions: 'peek',
                multipleDeclarations: 'peek',
                multipleImplementations: 'peek',
                multipleReferences: 'peek',
                alternativeDefinitionCommand: 'editor.action.goToReferences',
                alternativeTypeDefinitionCommand: 'editor.action.goToReferences',
                alternativeDeclarationCommand: 'editor.action.goToReferences',
                alternativeImplementationCommand: '',
                alternativeReferenceCommand: '',
            };
            const jsonSubset = {
                type: 'string',
                enum: ['peek', 'gotoAndPeek', 'goto'],
                default: defaults.multiple,
                enumDescriptions: [
                    nls.localize(28, null),
                    nls.localize(29, null),
                    nls.localize(30, null)
                ]
            };
            const alternativeCommandOptions = ['', 'editor.action.referenceSearch.trigger', 'editor.action.goToReferences', 'editor.action.peekImplementation', 'editor.action.goToImplementation', 'editor.action.peekTypeDefinition', 'editor.action.goToTypeDefinition', 'editor.action.peekDeclaration', 'editor.action.revealDeclaration', 'editor.action.peekDefinition', 'editor.action.revealDefinitionAside', 'editor.action.revealDefinition'];
            super(58 /* EditorOption.gotoLocation */, 'gotoLocation', defaults, {
                'editor.gotoLocation.multiple': {
                    deprecationMessage: nls.localize(31, null),
                },
                'editor.gotoLocation.multipleDefinitions': {
                    description: nls.localize(32, null),
                    ...jsonSubset,
                },
                'editor.gotoLocation.multipleTypeDefinitions': {
                    description: nls.localize(33, null),
                    ...jsonSubset,
                },
                'editor.gotoLocation.multipleDeclarations': {
                    description: nls.localize(34, null),
                    ...jsonSubset,
                },
                'editor.gotoLocation.multipleImplementations': {
                    description: nls.localize(35, null),
                    ...jsonSubset,
                },
                'editor.gotoLocation.multipleReferences': {
                    description: nls.localize(36, null),
                    ...jsonSubset,
                },
                'editor.gotoLocation.alternativeDefinitionCommand': {
                    type: 'string',
                    default: defaults.alternativeDefinitionCommand,
                    enum: alternativeCommandOptions,
                    description: nls.localize(37, null)
                },
                'editor.gotoLocation.alternativeTypeDefinitionCommand': {
                    type: 'string',
                    default: defaults.alternativeTypeDefinitionCommand,
                    enum: alternativeCommandOptions,
                    description: nls.localize(38, null)
                },
                'editor.gotoLocation.alternativeDeclarationCommand': {
                    type: 'string',
                    default: defaults.alternativeDeclarationCommand,
                    enum: alternativeCommandOptions,
                    description: nls.localize(39, null)
                },
                'editor.gotoLocation.alternativeImplementationCommand': {
                    type: 'string',
                    default: defaults.alternativeImplementationCommand,
                    enum: alternativeCommandOptions,
                    description: nls.localize(40, null)
                },
                'editor.gotoLocation.alternativeReferenceCommand': {
                    type: 'string',
                    default: defaults.alternativeReferenceCommand,
                    enum: alternativeCommandOptions,
                    description: nls.localize(41, null)
                },
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            return {
                multiple: stringSet(input.multiple, this.defaultValue.multiple, ['peek', 'gotoAndPeek', 'goto']),
                multipleDefinitions: input.multipleDefinitions ?? stringSet(input.multipleDefinitions, 'peek', ['peek', 'gotoAndPeek', 'goto']),
                multipleTypeDefinitions: input.multipleTypeDefinitions ?? stringSet(input.multipleTypeDefinitions, 'peek', ['peek', 'gotoAndPeek', 'goto']),
                multipleDeclarations: input.multipleDeclarations ?? stringSet(input.multipleDeclarations, 'peek', ['peek', 'gotoAndPeek', 'goto']),
                multipleImplementations: input.multipleImplementations ?? stringSet(input.multipleImplementations, 'peek', ['peek', 'gotoAndPeek', 'goto']),
                multipleReferences: input.multipleReferences ?? stringSet(input.multipleReferences, 'peek', ['peek', 'gotoAndPeek', 'goto']),
                alternativeDefinitionCommand: EditorStringOption.string(input.alternativeDefinitionCommand, this.defaultValue.alternativeDefinitionCommand),
                alternativeTypeDefinitionCommand: EditorStringOption.string(input.alternativeTypeDefinitionCommand, this.defaultValue.alternativeTypeDefinitionCommand),
                alternativeDeclarationCommand: EditorStringOption.string(input.alternativeDeclarationCommand, this.defaultValue.alternativeDeclarationCommand),
                alternativeImplementationCommand: EditorStringOption.string(input.alternativeImplementationCommand, this.defaultValue.alternativeImplementationCommand),
                alternativeReferenceCommand: EditorStringOption.string(input.alternativeReferenceCommand, this.defaultValue.alternativeReferenceCommand),
            };
        }
    }
    class EditorHover extends BaseEditorOption {
        constructor() {
            const defaults = {
                enabled: true,
                delay: 300,
                hidingDelay: 300,
                sticky: true,
                above: true,
            };
            super(60 /* EditorOption.hover */, 'hover', defaults, {
                'editor.hover.enabled': {
                    type: 'boolean',
                    default: defaults.enabled,
                    description: nls.localize(42, null)
                },
                'editor.hover.delay': {
                    type: 'number',
                    default: defaults.delay,
                    minimum: 0,
                    maximum: 10000,
                    description: nls.localize(43, null)
                },
                'editor.hover.sticky': {
                    type: 'boolean',
                    default: defaults.sticky,
                    description: nls.localize(44, null)
                },
                'editor.hover.hidingDelay': {
                    type: 'integer',
                    minimum: 0,
                    default: defaults.hidingDelay,
                    description: nls.localize(45, null)
                },
                'editor.hover.above': {
                    type: 'boolean',
                    default: defaults.above,
                    description: nls.localize(46, null)
                },
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            return {
                enabled: boolean(input.enabled, this.defaultValue.enabled),
                delay: EditorIntOption.clampedInt(input.delay, this.defaultValue.delay, 0, 10000),
                sticky: boolean(input.sticky, this.defaultValue.sticky),
                hidingDelay: EditorIntOption.clampedInt(input.hidingDelay, this.defaultValue.hidingDelay, 0, 600000),
                above: boolean(input.above, this.defaultValue.above),
            };
        }
    }
    var RenderMinimap;
    (function (RenderMinimap) {
        RenderMinimap[RenderMinimap["None"] = 0] = "None";
        RenderMinimap[RenderMinimap["Text"] = 1] = "Text";
        RenderMinimap[RenderMinimap["Blocks"] = 2] = "Blocks";
    })(RenderMinimap || (exports.RenderMinimap = RenderMinimap = {}));
    /**
     * @internal
     */
    class EditorLayoutInfoComputer extends ComputedEditorOption {
        constructor() {
            super(143 /* EditorOption.layoutInfo */);
        }
        compute(env, options, _) {
            return EditorLayoutInfoComputer.computeLayout(options, {
                memory: env.memory,
                outerWidth: env.outerWidth,
                outerHeight: env.outerHeight,
                isDominatedByLongLines: env.isDominatedByLongLines,
                lineHeight: env.fontInfo.lineHeight,
                viewLineCount: env.viewLineCount,
                lineNumbersDigitCount: env.lineNumbersDigitCount,
                typicalHalfwidthCharacterWidth: env.fontInfo.typicalHalfwidthCharacterWidth,
                maxDigitWidth: env.fontInfo.maxDigitWidth,
                pixelRatio: env.pixelRatio,
                glyphMarginDecorationLaneCount: env.glyphMarginDecorationLaneCount
            });
        }
        static computeContainedMinimapLineCount(input) {
            const typicalViewportLineCount = input.height / input.lineHeight;
            const extraLinesBeforeFirstLine = Math.floor(input.paddingTop / input.lineHeight);
            let extraLinesBeyondLastLine = Math.floor(input.paddingBottom / input.lineHeight);
            if (input.scrollBeyondLastLine) {
                extraLinesBeyondLastLine = Math.max(extraLinesBeyondLastLine, typicalViewportLineCount - 1);
            }
            const desiredRatio = (extraLinesBeforeFirstLine + input.viewLineCount + extraLinesBeyondLastLine) / (input.pixelRatio * input.height);
            const minimapLineCount = Math.floor(input.viewLineCount / desiredRatio);
            return { typicalViewportLineCount, extraLinesBeforeFirstLine, extraLinesBeyondLastLine, desiredRatio, minimapLineCount };
        }
        static c(input, memory) {
            const outerWidth = input.outerWidth;
            const outerHeight = input.outerHeight;
            const pixelRatio = input.pixelRatio;
            if (!input.minimap.enabled) {
                return {
                    renderMinimap: 0 /* RenderMinimap.None */,
                    minimapLeft: 0,
                    minimapWidth: 0,
                    minimapHeightIsEditorHeight: false,
                    minimapIsSampling: false,
                    minimapScale: 1,
                    minimapLineHeight: 1,
                    minimapCanvasInnerWidth: 0,
                    minimapCanvasInnerHeight: Math.floor(pixelRatio * outerHeight),
                    minimapCanvasOuterWidth: 0,
                    minimapCanvasOuterHeight: outerHeight,
                };
            }
            // Can use memory if only the `viewLineCount` and `remainingWidth` have changed
            const stableMinimapLayoutInput = memory.stableMinimapLayoutInput;
            const couldUseMemory = (stableMinimapLayoutInput
                // && input.outerWidth === lastMinimapLayoutInput.outerWidth !!! INTENTIONAL OMITTED
                && input.outerHeight === stableMinimapLayoutInput.outerHeight
                && input.lineHeight === stableMinimapLayoutInput.lineHeight
                && input.typicalHalfwidthCharacterWidth === stableMinimapLayoutInput.typicalHalfwidthCharacterWidth
                && input.pixelRatio === stableMinimapLayoutInput.pixelRatio
                && input.scrollBeyondLastLine === stableMinimapLayoutInput.scrollBeyondLastLine
                && input.paddingTop === stableMinimapLayoutInput.paddingTop
                && input.paddingBottom === stableMinimapLayoutInput.paddingBottom
                && input.minimap.enabled === stableMinimapLayoutInput.minimap.enabled
                && input.minimap.side === stableMinimapLayoutInput.minimap.side
                && input.minimap.size === stableMinimapLayoutInput.minimap.size
                && input.minimap.showSlider === stableMinimapLayoutInput.minimap.showSlider
                && input.minimap.renderCharacters === stableMinimapLayoutInput.minimap.renderCharacters
                && input.minimap.maxColumn === stableMinimapLayoutInput.minimap.maxColumn
                && input.minimap.scale === stableMinimapLayoutInput.minimap.scale
                && input.verticalScrollbarWidth === stableMinimapLayoutInput.verticalScrollbarWidth
                // && input.viewLineCount === lastMinimapLayoutInput.viewLineCount !!! INTENTIONAL OMITTED
                // && input.remainingWidth === lastMinimapLayoutInput.remainingWidth !!! INTENTIONAL OMITTED
                && input.isViewportWrapping === stableMinimapLayoutInput.isViewportWrapping);
            const lineHeight = input.lineHeight;
            const typicalHalfwidthCharacterWidth = input.typicalHalfwidthCharacterWidth;
            const scrollBeyondLastLine = input.scrollBeyondLastLine;
            const minimapRenderCharacters = input.minimap.renderCharacters;
            let minimapScale = (pixelRatio >= 2 ? Math.round(input.minimap.scale * 2) : input.minimap.scale);
            const minimapMaxColumn = input.minimap.maxColumn;
            const minimapSize = input.minimap.size;
            const minimapSide = input.minimap.side;
            const verticalScrollbarWidth = input.verticalScrollbarWidth;
            const viewLineCount = input.viewLineCount;
            const remainingWidth = input.remainingWidth;
            const isViewportWrapping = input.isViewportWrapping;
            const baseCharHeight = minimapRenderCharacters ? 2 : 3;
            let minimapCanvasInnerHeight = Math.floor(pixelRatio * outerHeight);
            const minimapCanvasOuterHeight = minimapCanvasInnerHeight / pixelRatio;
            let minimapHeightIsEditorHeight = false;
            let minimapIsSampling = false;
            let minimapLineHeight = baseCharHeight * minimapScale;
            let minimapCharWidth = minimapScale / pixelRatio;
            let minimapWidthMultiplier = 1;
            if (minimapSize === 'fill' || minimapSize === 'fit') {
                const { typicalViewportLineCount, extraLinesBeforeFirstLine, extraLinesBeyondLastLine, desiredRatio, minimapLineCount } = EditorLayoutInfoComputer.computeContainedMinimapLineCount({
                    viewLineCount: viewLineCount,
                    scrollBeyondLastLine: scrollBeyondLastLine,
                    paddingTop: input.paddingTop,
                    paddingBottom: input.paddingBottom,
                    height: outerHeight,
                    lineHeight: lineHeight,
                    pixelRatio: pixelRatio
                });
                // ratio is intentionally not part of the layout to avoid the layout changing all the time
                // when doing sampling
                const ratio = viewLineCount / minimapLineCount;
                if (ratio > 1) {
                    minimapHeightIsEditorHeight = true;
                    minimapIsSampling = true;
                    minimapScale = 1;
                    minimapLineHeight = 1;
                    minimapCharWidth = minimapScale / pixelRatio;
                }
                else {
                    let fitBecomesFill = false;
                    let maxMinimapScale = minimapScale + 1;
                    if (minimapSize === 'fit') {
                        const effectiveMinimapHeight = Math.ceil((extraLinesBeforeFirstLine + viewLineCount + extraLinesBeyondLastLine) * minimapLineHeight);
                        if (isViewportWrapping && couldUseMemory && remainingWidth <= memory.stableFitRemainingWidth) {
                            // There is a loop when using `fit` and viewport wrapping:
                            // - view line count impacts minimap layout
                            // - minimap layout impacts viewport width
                            // - viewport width impacts view line count
                            // To break the loop, once we go to a smaller minimap scale, we try to stick with it.
                            fitBecomesFill = true;
                            maxMinimapScale = memory.stableFitMaxMinimapScale;
                        }
                        else {
                            fitBecomesFill = (effectiveMinimapHeight > minimapCanvasInnerHeight);
                        }
                    }
                    if (minimapSize === 'fill' || fitBecomesFill) {
                        minimapHeightIsEditorHeight = true;
                        const configuredMinimapScale = minimapScale;
                        minimapLineHeight = Math.min(lineHeight * pixelRatio, Math.max(1, Math.floor(1 / desiredRatio)));
                        if (isViewportWrapping && couldUseMemory && remainingWidth <= memory.stableFitRemainingWidth) {
                            // There is a loop when using `fill` and viewport wrapping:
                            // - view line count impacts minimap layout
                            // - minimap layout impacts viewport width
                            // - viewport width impacts view line count
                            // To break the loop, once we go to a smaller minimap scale, we try to stick with it.
                            maxMinimapScale = memory.stableFitMaxMinimapScale;
                        }
                        minimapScale = Math.min(maxMinimapScale, Math.max(1, Math.floor(minimapLineHeight / baseCharHeight)));
                        if (minimapScale > configuredMinimapScale) {
                            minimapWidthMultiplier = Math.min(2, minimapScale / configuredMinimapScale);
                        }
                        minimapCharWidth = minimapScale / pixelRatio / minimapWidthMultiplier;
                        minimapCanvasInnerHeight = Math.ceil((Math.max(typicalViewportLineCount, extraLinesBeforeFirstLine + viewLineCount + extraLinesBeyondLastLine)) * minimapLineHeight);
                        if (isViewportWrapping) {
                            // remember for next time
                            memory.stableMinimapLayoutInput = input;
                            memory.stableFitRemainingWidth = remainingWidth;
                            memory.stableFitMaxMinimapScale = minimapScale;
                        }
                        else {
                            memory.stableMinimapLayoutInput = null;
                            memory.stableFitRemainingWidth = 0;
                        }
                    }
                }
            }
            // Given:
            // (leaving 2px for the cursor to have space after the last character)
            // viewportColumn = (contentWidth - verticalScrollbarWidth - 2) / typicalHalfwidthCharacterWidth
            // minimapWidth = viewportColumn * minimapCharWidth
            // contentWidth = remainingWidth - minimapWidth
            // What are good values for contentWidth and minimapWidth ?
            // minimapWidth = ((contentWidth - verticalScrollbarWidth - 2) / typicalHalfwidthCharacterWidth) * minimapCharWidth
            // typicalHalfwidthCharacterWidth * minimapWidth = (contentWidth - verticalScrollbarWidth - 2) * minimapCharWidth
            // typicalHalfwidthCharacterWidth * minimapWidth = (remainingWidth - minimapWidth - verticalScrollbarWidth - 2) * minimapCharWidth
            // (typicalHalfwidthCharacterWidth + minimapCharWidth) * minimapWidth = (remainingWidth - verticalScrollbarWidth - 2) * minimapCharWidth
            // minimapWidth = ((remainingWidth - verticalScrollbarWidth - 2) * minimapCharWidth) / (typicalHalfwidthCharacterWidth + minimapCharWidth)
            const minimapMaxWidth = Math.floor(minimapMaxColumn * minimapCharWidth);
            const minimapWidth = Math.min(minimapMaxWidth, Math.max(0, Math.floor(((remainingWidth - verticalScrollbarWidth - 2) * minimapCharWidth) / (typicalHalfwidthCharacterWidth + minimapCharWidth))) + exports.MINIMAP_GUTTER_WIDTH);
            let minimapCanvasInnerWidth = Math.floor(pixelRatio * minimapWidth);
            const minimapCanvasOuterWidth = minimapCanvasInnerWidth / pixelRatio;
            minimapCanvasInnerWidth = Math.floor(minimapCanvasInnerWidth * minimapWidthMultiplier);
            const renderMinimap = (minimapRenderCharacters ? 1 /* RenderMinimap.Text */ : 2 /* RenderMinimap.Blocks */);
            const minimapLeft = (minimapSide === 'left' ? 0 : (outerWidth - minimapWidth - verticalScrollbarWidth));
            return {
                renderMinimap,
                minimapLeft,
                minimapWidth,
                minimapHeightIsEditorHeight,
                minimapIsSampling,
                minimapScale,
                minimapLineHeight,
                minimapCanvasInnerWidth,
                minimapCanvasInnerHeight,
                minimapCanvasOuterWidth,
                minimapCanvasOuterHeight,
            };
        }
        static computeLayout(options, env) {
            const outerWidth = env.outerWidth | 0;
            const outerHeight = env.outerHeight | 0;
            const lineHeight = env.lineHeight | 0;
            const lineNumbersDigitCount = env.lineNumbersDigitCount | 0;
            const typicalHalfwidthCharacterWidth = env.typicalHalfwidthCharacterWidth;
            const maxDigitWidth = env.maxDigitWidth;
            const pixelRatio = env.pixelRatio;
            const viewLineCount = env.viewLineCount;
            const wordWrapOverride2 = options.get(135 /* EditorOption.wordWrapOverride2 */);
            const wordWrapOverride1 = (wordWrapOverride2 === 'inherit' ? options.get(134 /* EditorOption.wordWrapOverride1 */) : wordWrapOverride2);
            const wordWrap = (wordWrapOverride1 === 'inherit' ? options.get(130 /* EditorOption.wordWrap */) : wordWrapOverride1);
            const wordWrapColumn = options.get(133 /* EditorOption.wordWrapColumn */);
            const isDominatedByLongLines = env.isDominatedByLongLines;
            const showGlyphMargin = options.get(57 /* EditorOption.glyphMargin */);
            const showLineNumbers = (options.get(67 /* EditorOption.lineNumbers */).renderType !== 0 /* RenderLineNumbersType.Off */);
            const lineNumbersMinChars = options.get(68 /* EditorOption.lineNumbersMinChars */);
            const scrollBeyondLastLine = options.get(104 /* EditorOption.scrollBeyondLastLine */);
            const padding = options.get(83 /* EditorOption.padding */);
            const minimap = options.get(72 /* EditorOption.minimap */);
            const scrollbar = options.get(102 /* EditorOption.scrollbar */);
            const verticalScrollbarWidth = scrollbar.verticalScrollbarSize;
            const verticalScrollbarHasArrows = scrollbar.verticalHasArrows;
            const scrollbarArrowSize = scrollbar.arrowSize;
            const horizontalScrollbarHeight = scrollbar.horizontalScrollbarSize;
            const folding = options.get(43 /* EditorOption.folding */);
            const showFoldingDecoration = options.get(109 /* EditorOption.showFoldingControls */) !== 'never';
            let lineDecorationsWidth = options.get(65 /* EditorOption.lineDecorationsWidth */);
            if (folding && showFoldingDecoration) {
                lineDecorationsWidth += 16;
            }
            let lineNumbersWidth = 0;
            if (showLineNumbers) {
                const digitCount = Math.max(lineNumbersDigitCount, lineNumbersMinChars);
                lineNumbersWidth = Math.round(digitCount * maxDigitWidth);
            }
            let glyphMarginWidth = 0;
            if (showGlyphMargin) {
                glyphMarginWidth = lineHeight * env.glyphMarginDecorationLaneCount;
            }
            let glyphMarginLeft = 0;
            let lineNumbersLeft = glyphMarginLeft + glyphMarginWidth;
            let decorationsLeft = lineNumbersLeft + lineNumbersWidth;
            let contentLeft = decorationsLeft + lineDecorationsWidth;
            const remainingWidth = outerWidth - glyphMarginWidth - lineNumbersWidth - lineDecorationsWidth;
            let isWordWrapMinified = false;
            let isViewportWrapping = false;
            let wrappingColumn = -1;
            if (wordWrapOverride1 === 'inherit' && isDominatedByLongLines) {
                // Force viewport width wrapping if model is dominated by long lines
                isWordWrapMinified = true;
                isViewportWrapping = true;
            }
            else if (wordWrap === 'on' || wordWrap === 'bounded') {
                isViewportWrapping = true;
            }
            else if (wordWrap === 'wordWrapColumn') {
                wrappingColumn = wordWrapColumn;
            }
            const minimapLayout = EditorLayoutInfoComputer.c({
                outerWidth: outerWidth,
                outerHeight: outerHeight,
                lineHeight: lineHeight,
                typicalHalfwidthCharacterWidth: typicalHalfwidthCharacterWidth,
                pixelRatio: pixelRatio,
                scrollBeyondLastLine: scrollBeyondLastLine,
                paddingTop: padding.top,
                paddingBottom: padding.bottom,
                minimap: minimap,
                verticalScrollbarWidth: verticalScrollbarWidth,
                viewLineCount: viewLineCount,
                remainingWidth: remainingWidth,
                isViewportWrapping: isViewportWrapping,
            }, env.memory || new ComputeOptionsMemory());
            if (minimapLayout.renderMinimap !== 0 /* RenderMinimap.None */ && minimapLayout.minimapLeft === 0) {
                // the minimap is rendered to the left, so move everything to the right
                glyphMarginLeft += minimapLayout.minimapWidth;
                lineNumbersLeft += minimapLayout.minimapWidth;
                decorationsLeft += minimapLayout.minimapWidth;
                contentLeft += minimapLayout.minimapWidth;
            }
            const contentWidth = remainingWidth - minimapLayout.minimapWidth;
            // (leaving 2px for the cursor to have space after the last character)
            const viewportColumn = Math.max(1, Math.floor((contentWidth - verticalScrollbarWidth - 2) / typicalHalfwidthCharacterWidth));
            const verticalArrowSize = (verticalScrollbarHasArrows ? scrollbarArrowSize : 0);
            if (isViewportWrapping) {
                // compute the actual wrappingColumn
                wrappingColumn = Math.max(1, viewportColumn);
                if (wordWrap === 'bounded') {
                    wrappingColumn = Math.min(wrappingColumn, wordWrapColumn);
                }
            }
            return {
                width: outerWidth,
                height: outerHeight,
                glyphMarginLeft: glyphMarginLeft,
                glyphMarginWidth: glyphMarginWidth,
                glyphMarginDecorationLaneCount: env.glyphMarginDecorationLaneCount,
                lineNumbersLeft: lineNumbersLeft,
                lineNumbersWidth: lineNumbersWidth,
                decorationsLeft: decorationsLeft,
                decorationsWidth: lineDecorationsWidth,
                contentLeft: contentLeft,
                contentWidth: contentWidth,
                minimap: minimapLayout,
                viewportColumn: viewportColumn,
                isWordWrapMinified: isWordWrapMinified,
                isViewportWrapping: isViewportWrapping,
                wrappingColumn: wrappingColumn,
                verticalScrollbarWidth: verticalScrollbarWidth,
                horizontalScrollbarHeight: horizontalScrollbarHeight,
                overviewRuler: {
                    top: verticalArrowSize,
                    width: verticalScrollbarWidth,
                    height: (outerHeight - 2 * verticalArrowSize),
                    right: 0
                }
            };
        }
    }
    exports.EditorLayoutInfoComputer = EditorLayoutInfoComputer;
    //#endregion
    //#region WrappingStrategy
    class WrappingStrategy extends BaseEditorOption {
        constructor() {
            super(137 /* EditorOption.wrappingStrategy */, 'wrappingStrategy', 'simple', {
                'editor.wrappingStrategy': {
                    enumDescriptions: [
                        nls.localize(47, null),
                        nls.localize(48, null)
                    ],
                    type: 'string',
                    enum: ['simple', 'advanced'],
                    default: 'simple',
                    description: nls.localize(49, null)
                }
            });
        }
        validate(input) {
            return stringSet(input, 'simple', ['simple', 'advanced']);
        }
        compute(env, options, value) {
            const accessibilitySupport = options.get(2 /* EditorOption.accessibilitySupport */);
            if (accessibilitySupport === 2 /* AccessibilitySupport.Enabled */) {
                // if we know for a fact that a screen reader is attached, we switch our strategy to advanced to
                // help that the editor's wrapping points match the textarea's wrapping points
                return 'advanced';
            }
            return value;
        }
    }
    class EditorLightbulb extends BaseEditorOption {
        constructor() {
            const defaults = { enabled: true };
            super(64 /* EditorOption.lightbulb */, 'lightbulb', defaults, {
                'editor.lightbulb.enabled': {
                    type: 'boolean',
                    default: defaults.enabled,
                    description: nls.localize(50, null)
                },
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            return {
                enabled: boolean(input.enabled, this.defaultValue.enabled)
            };
        }
    }
    class EditorStickyScroll extends BaseEditorOption {
        constructor() {
            const defaults = { enabled: false, maxLineCount: 5, defaultModel: 'outlineModel', scrollWithEditor: true };
            super(114 /* EditorOption.stickyScroll */, 'stickyScroll', defaults, {
                'editor.stickyScroll.enabled': {
                    type: 'boolean',
                    default: defaults.enabled,
                    description: nls.localize(51, null)
                },
                'editor.stickyScroll.maxLineCount': {
                    type: 'number',
                    default: defaults.maxLineCount,
                    minimum: 1,
                    maximum: 10,
                    description: nls.localize(52, null)
                },
                'editor.stickyScroll.defaultModel': {
                    type: 'string',
                    enum: ['outlineModel', 'foldingProviderModel', 'indentationModel'],
                    default: defaults.defaultModel,
                    description: nls.localize(53, null)
                },
                'editor.stickyScroll.scrollWithEditor': {
                    type: 'boolean',
                    default: defaults.scrollWithEditor,
                    description: nls.localize(54, null)
                },
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            return {
                enabled: boolean(input.enabled, this.defaultValue.enabled),
                maxLineCount: EditorIntOption.clampedInt(input.maxLineCount, this.defaultValue.maxLineCount, 1, 10),
                defaultModel: stringSet(input.defaultModel, this.defaultValue.defaultModel, ['outlineModel', 'foldingProviderModel', 'indentationModel']),
                scrollWithEditor: boolean(input.scrollWithEditor, this.defaultValue.scrollWithEditor)
            };
        }
    }
    class EditorInlayHints extends BaseEditorOption {
        constructor() {
            const defaults = { enabled: 'on', fontSize: 0, fontFamily: '', padding: false };
            super(139 /* EditorOption.inlayHints */, 'inlayHints', defaults, {
                'editor.inlayHints.enabled': {
                    type: 'string',
                    default: defaults.enabled,
                    description: nls.localize(55, null),
                    enum: ['on', 'onUnlessPressed', 'offUnlessPressed', 'off'],
                    markdownEnumDescriptions: [
                        nls.localize(56, null),
                        nls.localize(57, null, platform.$j ? `Ctrl+Option` : `Ctrl+Alt`),
                        nls.localize(58, null, platform.$j ? `Ctrl+Option` : `Ctrl+Alt`),
                        nls.localize(59, null),
                    ],
                },
                'editor.inlayHints.fontSize': {
                    type: 'number',
                    default: defaults.fontSize,
                    markdownDescription: nls.localize(60, null, '`#editor.fontSize#`', '`5`')
                },
                'editor.inlayHints.fontFamily': {
                    type: 'string',
                    default: defaults.fontFamily,
                    markdownDescription: nls.localize(61, null, '`#editor.fontFamily#`')
                },
                'editor.inlayHints.padding': {
                    type: 'boolean',
                    default: defaults.padding,
                    description: nls.localize(62, null)
                }
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            if (typeof input.enabled === 'boolean') {
                input.enabled = input.enabled ? 'on' : 'off';
            }
            return {
                enabled: stringSet(input.enabled, this.defaultValue.enabled, ['on', 'off', 'offUnlessPressed', 'onUnlessPressed']),
                fontSize: EditorIntOption.clampedInt(input.fontSize, this.defaultValue.fontSize, 0, 100),
                fontFamily: EditorStringOption.string(input.fontFamily, this.defaultValue.fontFamily),
                padding: boolean(input.padding, this.defaultValue.padding)
            };
        }
    }
    //#endregion
    //#region lineDecorationsWidth
    class EditorLineDecorationsWidth extends BaseEditorOption {
        constructor() {
            super(65 /* EditorOption.lineDecorationsWidth */, 'lineDecorationsWidth', 10);
        }
        validate(input) {
            if (typeof input === 'string' && /^\d+(\.\d+)?ch$/.test(input)) {
                const multiple = parseFloat(input.substring(0, input.length - 2));
                return -multiple; // negative numbers signal a multiple
            }
            else {
                return EditorIntOption.clampedInt(input, this.defaultValue, 0, 1000);
            }
        }
        compute(env, options, value) {
            if (value < 0) {
                // negative numbers signal a multiple
                return EditorIntOption.clampedInt(-value * env.fontInfo.typicalHalfwidthCharacterWidth, this.defaultValue, 0, 1000);
            }
            else {
                return value;
            }
        }
    }
    //#endregion
    //#region lineHeight
    class EditorLineHeight extends EditorFloatOption {
        constructor() {
            super(66 /* EditorOption.lineHeight */, 'lineHeight', exports.EDITOR_FONT_DEFAULTS.lineHeight, x => EditorFloatOption.clamp(x, 0, 150), { markdownDescription: nls.localize(63, null) });
        }
        compute(env, options, value) {
            // The lineHeight is computed from the fontSize if it is 0.
            // Moreover, the final lineHeight respects the editor zoom level.
            // So take the result from env.fontInfo
            return env.fontInfo.lineHeight;
        }
    }
    class EditorMinimap extends BaseEditorOption {
        constructor() {
            const defaults = {
                enabled: true,
                size: 'proportional',
                side: 'right',
                showSlider: 'mouseover',
                autohide: false,
                renderCharacters: true,
                maxColumn: 120,
                scale: 1,
            };
            super(72 /* EditorOption.minimap */, 'minimap', defaults, {
                'editor.minimap.enabled': {
                    type: 'boolean',
                    default: defaults.enabled,
                    description: nls.localize(64, null)
                },
                'editor.minimap.autohide': {
                    type: 'boolean',
                    default: defaults.autohide,
                    description: nls.localize(65, null)
                },
                'editor.minimap.size': {
                    type: 'string',
                    enum: ['proportional', 'fill', 'fit'],
                    enumDescriptions: [
                        nls.localize(66, null),
                        nls.localize(67, null),
                        nls.localize(68, null),
                    ],
                    default: defaults.size,
                    description: nls.localize(69, null)
                },
                'editor.minimap.side': {
                    type: 'string',
                    enum: ['left', 'right'],
                    default: defaults.side,
                    description: nls.localize(70, null)
                },
                'editor.minimap.showSlider': {
                    type: 'string',
                    enum: ['always', 'mouseover'],
                    default: defaults.showSlider,
                    description: nls.localize(71, null)
                },
                'editor.minimap.scale': {
                    type: 'number',
                    default: defaults.scale,
                    minimum: 1,
                    maximum: 3,
                    enum: [1, 2, 3],
                    description: nls.localize(72, null)
                },
                'editor.minimap.renderCharacters': {
                    type: 'boolean',
                    default: defaults.renderCharacters,
                    description: nls.localize(73, null)
                },
                'editor.minimap.maxColumn': {
                    type: 'number',
                    default: defaults.maxColumn,
                    description: nls.localize(74, null)
                }
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            return {
                enabled: boolean(input.enabled, this.defaultValue.enabled),
                autohide: boolean(input.autohide, this.defaultValue.autohide),
                size: stringSet(input.size, this.defaultValue.size, ['proportional', 'fill', 'fit']),
                side: stringSet(input.side, this.defaultValue.side, ['right', 'left']),
                showSlider: stringSet(input.showSlider, this.defaultValue.showSlider, ['always', 'mouseover']),
                renderCharacters: boolean(input.renderCharacters, this.defaultValue.renderCharacters),
                scale: EditorIntOption.clampedInt(input.scale, 1, 1, 3),
                maxColumn: EditorIntOption.clampedInt(input.maxColumn, this.defaultValue.maxColumn, 1, 10000),
            };
        }
    }
    //#endregion
    //#region multiCursorModifier
    function _multiCursorModifierFromString(multiCursorModifier) {
        if (multiCursorModifier === 'ctrlCmd') {
            return (platform.$j ? 'metaKey' : 'ctrlKey');
        }
        return 'altKey';
    }
    class EditorPadding extends BaseEditorOption {
        constructor() {
            super(83 /* EditorOption.padding */, 'padding', { top: 0, bottom: 0 }, {
                'editor.padding.top': {
                    type: 'number',
                    default: 0,
                    minimum: 0,
                    maximum: 1000,
                    description: nls.localize(75, null)
                },
                'editor.padding.bottom': {
                    type: 'number',
                    default: 0,
                    minimum: 0,
                    maximum: 1000,
                    description: nls.localize(76, null)
                }
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            return {
                top: EditorIntOption.clampedInt(input.top, 0, 0, 1000),
                bottom: EditorIntOption.clampedInt(input.bottom, 0, 0, 1000)
            };
        }
    }
    class EditorParameterHints extends BaseEditorOption {
        constructor() {
            const defaults = {
                enabled: true,
                cycle: true
            };
            super(85 /* EditorOption.parameterHints */, 'parameterHints', defaults, {
                'editor.parameterHints.enabled': {
                    type: 'boolean',
                    default: defaults.enabled,
                    description: nls.localize(77, null)
                },
                'editor.parameterHints.cycle': {
                    type: 'boolean',
                    default: defaults.cycle,
                    description: nls.localize(78, null)
                },
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            return {
                enabled: boolean(input.enabled, this.defaultValue.enabled),
                cycle: boolean(input.cycle, this.defaultValue.cycle)
            };
        }
    }
    //#endregion
    //#region pixelRatio
    class EditorPixelRatio extends ComputedEditorOption {
        constructor() {
            super(141 /* EditorOption.pixelRatio */);
        }
        compute(env, options, _) {
            return env.pixelRatio;
        }
    }
    class EditorQuickSuggestions extends BaseEditorOption {
        constructor() {
            const defaults = {
                other: 'on',
                comments: 'off',
                strings: 'off'
            };
            const types = [
                { type: 'boolean' },
                {
                    type: 'string',
                    enum: ['on', 'inline', 'off'],
                    enumDescriptions: [nls.localize(79, null), nls.localize(80, null), nls.localize(81, null)]
                }
            ];
            super(88 /* EditorOption.quickSuggestions */, 'quickSuggestions', defaults, {
                type: 'object',
                additionalProperties: false,
                properties: {
                    strings: {
                        anyOf: types,
                        default: defaults.strings,
                        description: nls.localize(82, null)
                    },
                    comments: {
                        anyOf: types,
                        default: defaults.comments,
                        description: nls.localize(83, null)
                    },
                    other: {
                        anyOf: types,
                        default: defaults.other,
                        description: nls.localize(84, null)
                    },
                },
                default: defaults,
                markdownDescription: nls.localize(85, null, `#editor.suggestOnTriggerCharacters#`)
            });
            this.defaultValue = defaults;
        }
        validate(input) {
            if (typeof input === 'boolean') {
                // boolean -> all on/off
                const value = input ? 'on' : 'off';
                return { comments: value, strings: value, other: value };
            }
            if (!input || typeof input !== 'object') {
                // invalid object
                return this.defaultValue;
            }
            const { other, comments, strings } = input;
            const allowedValues = ['on', 'inline', 'off'];
            let validatedOther;
            let validatedComments;
            let validatedStrings;
            if (typeof other === 'boolean') {
                validatedOther = other ? 'on' : 'off';
            }
            else {
                validatedOther = stringSet(other, this.defaultValue.other, allowedValues);
            }
            if (typeof comments === 'boolean') {
                validatedComments = comments ? 'on' : 'off';
            }
            else {
                validatedComments = stringSet(comments, this.defaultValue.comments, allowedValues);
            }
            if (typeof strings === 'boolean') {
                validatedStrings = strings ? 'on' : 'off';
            }
            else {
                validatedStrings = stringSet(strings, this.defaultValue.strings, allowedValues);
            }
            return {
                other: validatedOther,
                comments: validatedComments,
                strings: validatedStrings
            };
        }
    }
    var RenderLineNumbersType;
    (function (RenderLineNumbersType) {
        RenderLineNumbersType[RenderLineNumbersType["Off"] = 0] = "Off";
        RenderLineNumbersType[RenderLineNumbersType["On"] = 1] = "On";
        RenderLineNumbersType[RenderLineNumbersType["Relative"] = 2] = "Relative";
        RenderLineNumbersType[RenderLineNumbersType["Interval"] = 3] = "Interval";
        RenderLineNumbersType[RenderLineNumbersType["Custom"] = 4] = "Custom";
    })(RenderLineNumbersType || (exports.RenderLineNumbersType = RenderLineNumbersType = {}));
    class EditorRenderLineNumbersOption extends BaseEditorOption {
        constructor() {
            super(67 /* EditorOption.lineNumbers */, 'lineNumbers', { renderType: 1 /* RenderLineNumbersType.On */, renderFn: null }, {
                type: 'string',
                enum: ['off', 'on', 'relative', 'interval'],
                enumDescriptions: [
                    nls.localize(86, null),
                    nls.localize(87, null),
                    nls.localize(88, null),
                    nls.localize(89, null)
                ],
                default: 'on',
                description: nls.localize(90, null)
            });
        }
        validate(lineNumbers) {
            let renderType = this.defaultValue.renderType;
            let renderFn = this.defaultValue.renderFn;
            if (typeof lineNumbers !== 'undefined') {
                if (typeof lineNumbers === 'function') {
                    renderType = 4 /* RenderLineNumbersType.Custom */;
                    renderFn = lineNumbers;
                }
                else if (lineNumbers === 'interval') {
                    renderType = 3 /* RenderLineNumbersType.Interval */;
                }
                else if (lineNumbers === 'relative') {
                    renderType = 2 /* RenderLineNumbersType.Relative */;
                }
                else if (lineNumbers === 'on') {
                    renderType = 1 /* RenderLineNumbersType.On */;
                }
                else {
                    renderType = 0 /* RenderLineNumbersType.Off */;
                }
            }
            return {
                renderType,
                renderFn
            };
        }
    }
    //#endregion
    //#region renderValidationDecorations
    /**
     * @internal
     */
    function filterValidationDecorations(options) {
        const renderValidationDecorations = options.get(97 /* EditorOption.renderValidationDecorations */);
        if (renderValidationDecorations === 'editable') {
            return options.get(90 /* EditorOption.readOnly */);
        }
        return renderValidationDecorations === 'on' ? false : true;
    }
    exports.filterValidationDecorations = filterValidationDecorations;
    class EditorRulers extends BaseEditorOption {
        constructor() {
            const defaults = [];
            const columnSchema = { type: 'number', description: nls.localize(91, null) };
            super(101 /* EditorOption.rulers */, 'rulers', defaults, {
                type: 'array',
                items: {
                    anyOf: [
                        columnSchema,
                        {
                            type: [
                                'object'
                            ],
                            properties: {
                                column: columnSchema,
                                color: {
                                    type: 'string',
                                    description: nls.localize(92, null),
                                    format: 'color-hex'
                                }
                            }
                        }
                    ]
                },
                default: defaults,
                description: nls.localize(93, null)
            });
        }
        validate(input) {
            if (Array.isArray(input)) {
                const rulers = [];
                for (const _element of input) {
                    if (typeof _element === 'number') {
                        rulers.push({
                            column: EditorIntOption.clampedInt(_element, 0, 0, 10000),
                            color: null
                        });
                    }
                    else if (_element && typeof _element === 'object') {
                        const element = _element;
                        rulers.push({
                            column: EditorIntOption.clampedInt(element.column, 0, 0, 10000),
                            color: element.color
                        });
                    }
                }
                rulers.sort((a, b) => a.column - b.column);
                return rulers;
            }
            return this.defaultValue;
        }
    }
    //#endregion
    //#region readonly
    /**
     * Configuration options for readonly message
     */
    class ReadonlyMessage extends BaseEditorOption {
        constructor() {
            const defaults = undefined;
            super(91 /* EditorOption.readOnlyMessage */, 'readOnlyMessage', defaults);
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            return _input;
        }
    }
    function _scrollbarVisibilityFromString(visibility, defaultValue) {
        if (typeof visibility !== 'string') {
            return defaultValue;
        }
        switch (visibility) {
            case 'hidden': return 2 /* ScrollbarVisibility.Hidden */;
            case 'visible': return 3 /* ScrollbarVisibility.Visible */;
            default: return 1 /* ScrollbarVisibility.Auto */;
        }
    }
    class EditorScrollbar extends BaseEditorOption {
        constructor() {
            const defaults = {
                vertical: 1 /* ScrollbarVisibility.Auto */,
                horizontal: 1 /* ScrollbarVisibility.Auto */,
                arrowSize: 11,
                useShadows: true,
                verticalHasArrows: false,
                horizontalHasArrows: false,
                horizontalScrollbarSize: 12,
                horizontalSliderSize: 12,
                verticalScrollbarSize: 14,
                verticalSliderSize: 14,
                handleMouseWheel: true,
                alwaysConsumeMouseWheel: true,
                scrollByPage: false
            };
            super(102 /* EditorOption.scrollbar */, 'scrollbar', defaults, {
                'editor.scrollbar.vertical': {
                    type: 'string',
                    enum: ['auto', 'visible', 'hidden'],
                    enumDescriptions: [
                        nls.localize(94, null),
                        nls.localize(95, null),
                        nls.localize(96, null),
                    ],
                    default: 'auto',
                    description: nls.localize(97, null)
                },
                'editor.scrollbar.horizontal': {
                    type: 'string',
                    enum: ['auto', 'visible', 'hidden'],
                    enumDescriptions: [
                        nls.localize(98, null),
                        nls.localize(99, null),
                        nls.localize(100, null),
                    ],
                    default: 'auto',
                    description: nls.localize(101, null)
                },
                'editor.scrollbar.verticalScrollbarSize': {
                    type: 'number',
                    default: defaults.verticalScrollbarSize,
                    description: nls.localize(102, null)
                },
                'editor.scrollbar.horizontalScrollbarSize': {
                    type: 'number',
                    default: defaults.horizontalScrollbarSize,
                    description: nls.localize(103, null)
                },
                'editor.scrollbar.scrollByPage': {
                    type: 'boolean',
                    default: defaults.scrollByPage,
                    description: nls.localize(104, null)
                }
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            const horizontalScrollbarSize = EditorIntOption.clampedInt(input.horizontalScrollbarSize, this.defaultValue.horizontalScrollbarSize, 0, 1000);
            const verticalScrollbarSize = EditorIntOption.clampedInt(input.verticalScrollbarSize, this.defaultValue.verticalScrollbarSize, 0, 1000);
            return {
                arrowSize: EditorIntOption.clampedInt(input.arrowSize, this.defaultValue.arrowSize, 0, 1000),
                vertical: _scrollbarVisibilityFromString(input.vertical, this.defaultValue.vertical),
                horizontal: _scrollbarVisibilityFromString(input.horizontal, this.defaultValue.horizontal),
                useShadows: boolean(input.useShadows, this.defaultValue.useShadows),
                verticalHasArrows: boolean(input.verticalHasArrows, this.defaultValue.verticalHasArrows),
                horizontalHasArrows: boolean(input.horizontalHasArrows, this.defaultValue.horizontalHasArrows),
                handleMouseWheel: boolean(input.handleMouseWheel, this.defaultValue.handleMouseWheel),
                alwaysConsumeMouseWheel: boolean(input.alwaysConsumeMouseWheel, this.defaultValue.alwaysConsumeMouseWheel),
                horizontalScrollbarSize: horizontalScrollbarSize,
                horizontalSliderSize: EditorIntOption.clampedInt(input.horizontalSliderSize, horizontalScrollbarSize, 0, 1000),
                verticalScrollbarSize: verticalScrollbarSize,
                verticalSliderSize: EditorIntOption.clampedInt(input.verticalSliderSize, verticalScrollbarSize, 0, 1000),
                scrollByPage: boolean(input.scrollByPage, this.defaultValue.scrollByPage),
            };
        }
    }
    /**
     * @internal
    */
    exports.inUntrustedWorkspace = 'inUntrustedWorkspace';
    /**
     * @internal
     */
    exports.unicodeHighlightConfigKeys = {
        allowedCharacters: 'editor.unicodeHighlight.allowedCharacters',
        invisibleCharacters: 'editor.unicodeHighlight.invisibleCharacters',
        nonBasicASCII: 'editor.unicodeHighlight.nonBasicASCII',
        ambiguousCharacters: 'editor.unicodeHighlight.ambiguousCharacters',
        includeComments: 'editor.unicodeHighlight.includeComments',
        includeStrings: 'editor.unicodeHighlight.includeStrings',
        allowedLocales: 'editor.unicodeHighlight.allowedLocales',
    };
    class UnicodeHighlight extends BaseEditorOption {
        constructor() {
            const defaults = {
                nonBasicASCII: exports.inUntrustedWorkspace,
                invisibleCharacters: true,
                ambiguousCharacters: true,
                includeComments: exports.inUntrustedWorkspace,
                includeStrings: true,
                allowedCharacters: {},
                allowedLocales: { _os: true, _vscode: true },
            };
            super(124 /* EditorOption.unicodeHighlighting */, 'unicodeHighlight', defaults, {
                [exports.unicodeHighlightConfigKeys.nonBasicASCII]: {
                    restricted: true,
                    type: ['boolean', 'string'],
                    enum: [true, false, exports.inUntrustedWorkspace],
                    default: defaults.nonBasicASCII,
                    description: nls.localize(105, null)
                },
                [exports.unicodeHighlightConfigKeys.invisibleCharacters]: {
                    restricted: true,
                    type: 'boolean',
                    default: defaults.invisibleCharacters,
                    description: nls.localize(106, null)
                },
                [exports.unicodeHighlightConfigKeys.ambiguousCharacters]: {
                    restricted: true,
                    type: 'boolean',
                    default: defaults.ambiguousCharacters,
                    description: nls.localize(107, null)
                },
                [exports.unicodeHighlightConfigKeys.includeComments]: {
                    restricted: true,
                    type: ['boolean', 'string'],
                    enum: [true, false, exports.inUntrustedWorkspace],
                    default: defaults.includeComments,
                    description: nls.localize(108, null)
                },
                [exports.unicodeHighlightConfigKeys.includeStrings]: {
                    restricted: true,
                    type: ['boolean', 'string'],
                    enum: [true, false, exports.inUntrustedWorkspace],
                    default: defaults.includeStrings,
                    description: nls.localize(109, null)
                },
                [exports.unicodeHighlightConfigKeys.allowedCharacters]: {
                    restricted: true,
                    type: 'object',
                    default: defaults.allowedCharacters,
                    description: nls.localize(110, null),
                    additionalProperties: {
                        type: 'boolean'
                    }
                },
                [exports.unicodeHighlightConfigKeys.allowedLocales]: {
                    restricted: true,
                    type: 'object',
                    additionalProperties: {
                        type: 'boolean'
                    },
                    default: defaults.allowedLocales,
                    description: nls.localize(111, null)
                },
            });
        }
        applyUpdate(value, update) {
            let didChange = false;
            if (update.allowedCharacters && value) {
                // Treat allowedCharacters atomically
                if (!objects.$Zm(value.allowedCharacters, update.allowedCharacters)) {
                    value = { ...value, allowedCharacters: update.allowedCharacters };
                    didChange = true;
                }
            }
            if (update.allowedLocales && value) {
                // Treat allowedLocales atomically
                if (!objects.$Zm(value.allowedLocales, update.allowedLocales)) {
                    value = { ...value, allowedLocales: update.allowedLocales };
                    didChange = true;
                }
            }
            const result = super.applyUpdate(value, update);
            if (didChange) {
                return new ApplyUpdateResult(result.newValue, true);
            }
            return result;
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            return {
                nonBasicASCII: primitiveSet(input.nonBasicASCII, exports.inUntrustedWorkspace, [true, false, exports.inUntrustedWorkspace]),
                invisibleCharacters: boolean(input.invisibleCharacters, this.defaultValue.invisibleCharacters),
                ambiguousCharacters: boolean(input.ambiguousCharacters, this.defaultValue.ambiguousCharacters),
                includeComments: primitiveSet(input.includeComments, exports.inUntrustedWorkspace, [true, false, exports.inUntrustedWorkspace]),
                includeStrings: primitiveSet(input.includeStrings, exports.inUntrustedWorkspace, [true, false, exports.inUntrustedWorkspace]),
                allowedCharacters: this.c(_input.allowedCharacters, this.defaultValue.allowedCharacters),
                allowedLocales: this.c(_input.allowedLocales, this.defaultValue.allowedLocales),
            };
        }
        c(map, defaultValue) {
            if ((typeof map !== 'object') || !map) {
                return defaultValue;
            }
            const result = {};
            for (const [key, value] of Object.entries(map)) {
                if (value === true) {
                    result[key] = true;
                }
            }
            return result;
        }
    }
    /**
     * Configuration options for inline suggestions
     */
    class InlineEditorSuggest extends BaseEditorOption {
        constructor() {
            const defaults = {
                enabled: true,
                mode: 'subwordSmart',
                showToolbar: 'onHover',
                suppressSuggestions: false,
                keepOnBlur: false,
            };
            super(62 /* EditorOption.inlineSuggest */, 'inlineSuggest', defaults, {
                'editor.inlineSuggest.enabled': {
                    type: 'boolean',
                    default: defaults.enabled,
                    description: nls.localize(112, null)
                },
                'editor.inlineSuggest.showToolbar': {
                    type: 'string',
                    default: defaults.showToolbar,
                    enum: ['always', 'onHover'],
                    enumDescriptions: [
                        nls.localize(113, null),
                        nls.localize(114, null),
                    ],
                    description: nls.localize(115, null),
                },
                'editor.inlineSuggest.suppressSuggestions': {
                    type: 'boolean',
                    default: defaults.suppressSuggestions,
                    description: nls.localize(116, null)
                },
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            return {
                enabled: boolean(input.enabled, this.defaultValue.enabled),
                mode: stringSet(input.mode, this.defaultValue.mode, ['prefix', 'subword', 'subwordSmart']),
                showToolbar: stringSet(input.showToolbar, this.defaultValue.showToolbar, ['always', 'onHover']),
                suppressSuggestions: boolean(input.suppressSuggestions, this.defaultValue.suppressSuggestions),
                keepOnBlur: boolean(input.keepOnBlur, this.defaultValue.keepOnBlur),
            };
        }
    }
    /**
     * Configuration options for inline suggestions
     */
    class BracketPairColorization extends BaseEditorOption {
        constructor() {
            const defaults = {
                enabled: textModelDefaults_1.$Ur.bracketPairColorizationOptions.enabled,
                independentColorPoolPerBracketType: textModelDefaults_1.$Ur.bracketPairColorizationOptions.independentColorPoolPerBracketType,
            };
            super(15 /* EditorOption.bracketPairColorization */, 'bracketPairColorization', defaults, {
                'editor.bracketPairColorization.enabled': {
                    type: 'boolean',
                    default: defaults.enabled,
                    markdownDescription: nls.localize(117, null, '`#workbench.colorCustomizations#`')
                },
                'editor.bracketPairColorization.independentColorPoolPerBracketType': {
                    type: 'boolean',
                    default: defaults.independentColorPoolPerBracketType,
                    description: nls.localize(118, null)
                },
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            return {
                enabled: boolean(input.enabled, this.defaultValue.enabled),
                independentColorPoolPerBracketType: boolean(input.independentColorPoolPerBracketType, this.defaultValue.independentColorPoolPerBracketType),
            };
        }
    }
    /**
     * Configuration options for inline suggestions
     */
    class GuideOptions extends BaseEditorOption {
        constructor() {
            const defaults = {
                bracketPairs: false,
                bracketPairsHorizontal: 'active',
                highlightActiveBracketPair: true,
                indentation: true,
                highlightActiveIndentation: true
            };
            super(16 /* EditorOption.guides */, 'guides', defaults, {
                'editor.guides.bracketPairs': {
                    type: ['boolean', 'string'],
                    enum: [true, 'active', false],
                    enumDescriptions: [
                        nls.localize(119, null),
                        nls.localize(120, null),
                        nls.localize(121, null),
                    ],
                    default: defaults.bracketPairs,
                    description: nls.localize(122, null)
                },
                'editor.guides.bracketPairsHorizontal': {
                    type: ['boolean', 'string'],
                    enum: [true, 'active', false],
                    enumDescriptions: [
                        nls.localize(123, null),
                        nls.localize(124, null),
                        nls.localize(125, null),
                    ],
                    default: defaults.bracketPairsHorizontal,
                    description: nls.localize(126, null)
                },
                'editor.guides.highlightActiveBracketPair': {
                    type: 'boolean',
                    default: defaults.highlightActiveBracketPair,
                    description: nls.localize(127, null)
                },
                'editor.guides.indentation': {
                    type: 'boolean',
                    default: defaults.indentation,
                    description: nls.localize(128, null)
                },
                'editor.guides.highlightActiveIndentation': {
                    type: ['boolean', 'string'],
                    enum: [true, 'always', false],
                    enumDescriptions: [
                        nls.localize(129, null),
                        nls.localize(130, null),
                        nls.localize(131, null),
                    ],
                    default: defaults.highlightActiveIndentation,
                    description: nls.localize(132, null)
                }
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            return {
                bracketPairs: primitiveSet(input.bracketPairs, this.defaultValue.bracketPairs, [true, false, 'active']),
                bracketPairsHorizontal: primitiveSet(input.bracketPairsHorizontal, this.defaultValue.bracketPairsHorizontal, [true, false, 'active']),
                highlightActiveBracketPair: boolean(input.highlightActiveBracketPair, this.defaultValue.highlightActiveBracketPair),
                indentation: boolean(input.indentation, this.defaultValue.indentation),
                highlightActiveIndentation: primitiveSet(input.highlightActiveIndentation, this.defaultValue.highlightActiveIndentation, [true, false, 'always']),
            };
        }
    }
    function primitiveSet(value, defaultValue, allowedValues) {
        const idx = allowedValues.indexOf(value);
        if (idx === -1) {
            return defaultValue;
        }
        return allowedValues[idx];
    }
    class EditorSuggest extends BaseEditorOption {
        constructor() {
            const defaults = {
                insertMode: 'insert',
                filterGraceful: true,
                snippetsPreventQuickSuggestions: false,
                localityBonus: false,
                shareSuggestSelections: false,
                selectionMode: 'always',
                showIcons: true,
                showStatusBar: false,
                preview: false,
                previewMode: 'subwordSmart',
                showInlineDetails: true,
                showMethods: true,
                showFunctions: true,
                showConstructors: true,
                showDeprecated: true,
                matchOnWordStartOnly: true,
                showFields: true,
                showVariables: true,
                showClasses: true,
                showStructs: true,
                showInterfaces: true,
                showModules: true,
                showProperties: true,
                showEvents: true,
                showOperators: true,
                showUnits: true,
                showValues: true,
                showConstants: true,
                showEnums: true,
                showEnumMembers: true,
                showKeywords: true,
                showWords: true,
                showColors: true,
                showFiles: true,
                showReferences: true,
                showFolders: true,
                showTypeParameters: true,
                showSnippets: true,
                showUsers: true,
                showIssues: true,
            };
            super(117 /* EditorOption.suggest */, 'suggest', defaults, {
                'editor.suggest.insertMode': {
                    type: 'string',
                    enum: ['insert', 'replace'],
                    enumDescriptions: [
                        nls.localize(133, null),
                        nls.localize(134, null),
                    ],
                    default: defaults.insertMode,
                    description: nls.localize(135, null)
                },
                'editor.suggest.filterGraceful': {
                    type: 'boolean',
                    default: defaults.filterGraceful,
                    description: nls.localize(136, null)
                },
                'editor.suggest.localityBonus': {
                    type: 'boolean',
                    default: defaults.localityBonus,
                    description: nls.localize(137, null)
                },
                'editor.suggest.shareSuggestSelections': {
                    type: 'boolean',
                    default: defaults.shareSuggestSelections,
                    markdownDescription: nls.localize(138, null)
                },
                'editor.suggest.selectionMode': {
                    type: 'string',
                    enum: ['always', 'never', 'whenTriggerCharacter', 'whenQuickSuggestion'],
                    enumDescriptions: [
                        nls.localize(139, null),
                        nls.localize(140, null),
                        nls.localize(141, null),
                        nls.localize(142, null),
                    ],
                    default: defaults.selectionMode,
                    markdownDescription: nls.localize(143, null)
                },
                'editor.suggest.snippetsPreventQuickSuggestions': {
                    type: 'boolean',
                    default: defaults.snippetsPreventQuickSuggestions,
                    description: nls.localize(144, null)
                },
                'editor.suggest.showIcons': {
                    type: 'boolean',
                    default: defaults.showIcons,
                    description: nls.localize(145, null)
                },
                'editor.suggest.showStatusBar': {
                    type: 'boolean',
                    default: defaults.showStatusBar,
                    description: nls.localize(146, null)
                },
                'editor.suggest.preview': {
                    type: 'boolean',
                    default: defaults.preview,
                    description: nls.localize(147, null)
                },
                'editor.suggest.showInlineDetails': {
                    type: 'boolean',
                    default: defaults.showInlineDetails,
                    description: nls.localize(148, null)
                },
                'editor.suggest.maxVisibleSuggestions': {
                    type: 'number',
                    deprecationMessage: nls.localize(149, null),
                },
                'editor.suggest.filteredTypes': {
                    type: 'object',
                    deprecationMessage: nls.localize(150, null)
                },
                'editor.suggest.showMethods': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(151, null)
                },
                'editor.suggest.showFunctions': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(152, null)
                },
                'editor.suggest.showConstructors': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(153, null)
                },
                'editor.suggest.showDeprecated': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(154, null)
                },
                'editor.suggest.matchOnWordStartOnly': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(155, null)
                },
                'editor.suggest.showFields': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(156, null)
                },
                'editor.suggest.showVariables': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(157, null)
                },
                'editor.suggest.showClasses': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(158, null)
                },
                'editor.suggest.showStructs': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(159, null)
                },
                'editor.suggest.showInterfaces': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(160, null)
                },
                'editor.suggest.showModules': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(161, null)
                },
                'editor.suggest.showProperties': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(162, null)
                },
                'editor.suggest.showEvents': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(163, null)
                },
                'editor.suggest.showOperators': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(164, null)
                },
                'editor.suggest.showUnits': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(165, null)
                },
                'editor.suggest.showValues': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(166, null)
                },
                'editor.suggest.showConstants': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(167, null)
                },
                'editor.suggest.showEnums': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(168, null)
                },
                'editor.suggest.showEnumMembers': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(169, null)
                },
                'editor.suggest.showKeywords': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(170, null)
                },
                'editor.suggest.showWords': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(171, null)
                },
                'editor.suggest.showColors': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(172, null)
                },
                'editor.suggest.showFiles': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(173, null)
                },
                'editor.suggest.showReferences': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(174, null)
                },
                'editor.suggest.showCustomcolors': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(175, null)
                },
                'editor.suggest.showFolders': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(176, null)
                },
                'editor.suggest.showTypeParameters': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(177, null)
                },
                'editor.suggest.showSnippets': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(178, null)
                },
                'editor.suggest.showUsers': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(179, null)
                },
                'editor.suggest.showIssues': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(180, null)
                }
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            return {
                insertMode: stringSet(input.insertMode, this.defaultValue.insertMode, ['insert', 'replace']),
                filterGraceful: boolean(input.filterGraceful, this.defaultValue.filterGraceful),
                snippetsPreventQuickSuggestions: boolean(input.snippetsPreventQuickSuggestions, this.defaultValue.filterGraceful),
                localityBonus: boolean(input.localityBonus, this.defaultValue.localityBonus),
                shareSuggestSelections: boolean(input.shareSuggestSelections, this.defaultValue.shareSuggestSelections),
                selectionMode: stringSet(input.selectionMode, this.defaultValue.selectionMode, ['always', 'never', 'whenQuickSuggestion', 'whenTriggerCharacter']),
                showIcons: boolean(input.showIcons, this.defaultValue.showIcons),
                showStatusBar: boolean(input.showStatusBar, this.defaultValue.showStatusBar),
                preview: boolean(input.preview, this.defaultValue.preview),
                previewMode: stringSet(input.previewMode, this.defaultValue.previewMode, ['prefix', 'subword', 'subwordSmart']),
                showInlineDetails: boolean(input.showInlineDetails, this.defaultValue.showInlineDetails),
                showMethods: boolean(input.showMethods, this.defaultValue.showMethods),
                showFunctions: boolean(input.showFunctions, this.defaultValue.showFunctions),
                showConstructors: boolean(input.showConstructors, this.defaultValue.showConstructors),
                showDeprecated: boolean(input.showDeprecated, this.defaultValue.showDeprecated),
                matchOnWordStartOnly: boolean(input.matchOnWordStartOnly, this.defaultValue.matchOnWordStartOnly),
                showFields: boolean(input.showFields, this.defaultValue.showFields),
                showVariables: boolean(input.showVariables, this.defaultValue.showVariables),
                showClasses: boolean(input.showClasses, this.defaultValue.showClasses),
                showStructs: boolean(input.showStructs, this.defaultValue.showStructs),
                showInterfaces: boolean(input.showInterfaces, this.defaultValue.showInterfaces),
                showModules: boolean(input.showModules, this.defaultValue.showModules),
                showProperties: boolean(input.showProperties, this.defaultValue.showProperties),
                showEvents: boolean(input.showEvents, this.defaultValue.showEvents),
                showOperators: boolean(input.showOperators, this.defaultValue.showOperators),
                showUnits: boolean(input.showUnits, this.defaultValue.showUnits),
                showValues: boolean(input.showValues, this.defaultValue.showValues),
                showConstants: boolean(input.showConstants, this.defaultValue.showConstants),
                showEnums: boolean(input.showEnums, this.defaultValue.showEnums),
                showEnumMembers: boolean(input.showEnumMembers, this.defaultValue.showEnumMembers),
                showKeywords: boolean(input.showKeywords, this.defaultValue.showKeywords),
                showWords: boolean(input.showWords, this.defaultValue.showWords),
                showColors: boolean(input.showColors, this.defaultValue.showColors),
                showFiles: boolean(input.showFiles, this.defaultValue.showFiles),
                showReferences: boolean(input.showReferences, this.defaultValue.showReferences),
                showFolders: boolean(input.showFolders, this.defaultValue.showFolders),
                showTypeParameters: boolean(input.showTypeParameters, this.defaultValue.showTypeParameters),
                showSnippets: boolean(input.showSnippets, this.defaultValue.showSnippets),
                showUsers: boolean(input.showUsers, this.defaultValue.showUsers),
                showIssues: boolean(input.showIssues, this.defaultValue.showIssues),
            };
        }
    }
    class SmartSelect extends BaseEditorOption {
        constructor() {
            super(112 /* EditorOption.smartSelect */, 'smartSelect', {
                selectLeadingAndTrailingWhitespace: true,
                selectSubwords: true,
            }, {
                'editor.smartSelect.selectLeadingAndTrailingWhitespace': {
                    description: nls.localize(181, null),
                    default: true,
                    type: 'boolean'
                },
                'editor.smartSelect.selectSubwords': {
                    description: nls.localize(182, null),
                    default: true,
                    type: 'boolean'
                }
            });
        }
        validate(input) {
            if (!input || typeof input !== 'object') {
                return this.defaultValue;
            }
            return {
                selectLeadingAndTrailingWhitespace: boolean(input.selectLeadingAndTrailingWhitespace, this.defaultValue.selectLeadingAndTrailingWhitespace),
                selectSubwords: boolean(input.selectSubwords, this.defaultValue.selectSubwords),
            };
        }
    }
    //#endregion
    //#region wrappingIndent
    /**
     * Describes how to indent wrapped lines.
     */
    var WrappingIndent;
    (function (WrappingIndent) {
        /**
         * No indentation => wrapped lines begin at column 1.
         */
        WrappingIndent[WrappingIndent["None"] = 0] = "None";
        /**
         * Same => wrapped lines get the same indentation as the parent.
         */
        WrappingIndent[WrappingIndent["Same"] = 1] = "Same";
        /**
         * Indent => wrapped lines get +1 indentation toward the parent.
         */
        WrappingIndent[WrappingIndent["Indent"] = 2] = "Indent";
        /**
         * DeepIndent => wrapped lines get +2 indentation toward the parent.
         */
        WrappingIndent[WrappingIndent["DeepIndent"] = 3] = "DeepIndent";
    })(WrappingIndent || (exports.WrappingIndent = WrappingIndent = {}));
    class WrappingIndentOption extends BaseEditorOption {
        constructor() {
            super(136 /* EditorOption.wrappingIndent */, 'wrappingIndent', 1 /* WrappingIndent.Same */, {
                'editor.wrappingIndent': {
                    type: 'string',
                    enum: ['none', 'same', 'indent', 'deepIndent'],
                    enumDescriptions: [
                        nls.localize(183, null),
                        nls.localize(184, null),
                        nls.localize(185, null),
                        nls.localize(186, null),
                    ],
                    description: nls.localize(187, null),
                    default: 'same'
                }
            });
        }
        validate(input) {
            switch (input) {
                case 'none': return 0 /* WrappingIndent.None */;
                case 'same': return 1 /* WrappingIndent.Same */;
                case 'indent': return 2 /* WrappingIndent.Indent */;
                case 'deepIndent': return 3 /* WrappingIndent.DeepIndent */;
            }
            return 1 /* WrappingIndent.Same */;
        }
        compute(env, options, value) {
            const accessibilitySupport = options.get(2 /* EditorOption.accessibilitySupport */);
            if (accessibilitySupport === 2 /* AccessibilitySupport.Enabled */) {
                // if we know for a fact that a screen reader is attached, we use no indent wrapping to
                // help that the editor's wrapping points match the textarea's wrapping points
                return 0 /* WrappingIndent.None */;
            }
            return value;
        }
    }
    class EditorWrappingInfoComputer extends ComputedEditorOption {
        constructor() {
            super(144 /* EditorOption.wrappingInfo */);
        }
        compute(env, options, _) {
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            return {
                isDominatedByLongLines: env.isDominatedByLongLines,
                isWordWrapMinified: layoutInfo.isWordWrapMinified,
                isViewportWrapping: layoutInfo.isViewportWrapping,
                wrappingColumn: layoutInfo.wrappingColumn,
            };
        }
    }
    class EditorDropIntoEditor extends BaseEditorOption {
        constructor() {
            const defaults = { enabled: true, showDropSelector: 'afterDrop' };
            super(36 /* EditorOption.dropIntoEditor */, 'dropIntoEditor', defaults, {
                'editor.dropIntoEditor.enabled': {
                    type: 'boolean',
                    default: defaults.enabled,
                    markdownDescription: nls.localize(188, null),
                },
                'editor.dropIntoEditor.showDropSelector': {
                    type: 'string',
                    markdownDescription: nls.localize(189, null),
                    enum: [
                        'afterDrop',
                        'never'
                    ],
                    enumDescriptions: [
                        nls.localize(190, null),
                        nls.localize(191, null),
                    ],
                    default: 'afterDrop',
                },
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            return {
                enabled: boolean(input.enabled, this.defaultValue.enabled),
                showDropSelector: stringSet(input.showDropSelector, this.defaultValue.showDropSelector, ['afterDrop', 'never']),
            };
        }
    }
    class EditorPasteAs extends BaseEditorOption {
        constructor() {
            const defaults = { enabled: true, showPasteSelector: 'afterPaste' };
            super(84 /* EditorOption.pasteAs */, 'pasteAs', defaults, {
                'editor.pasteAs.enabled': {
                    type: 'boolean',
                    default: defaults.enabled,
                    markdownDescription: nls.localize(192, null),
                },
                'editor.pasteAs.showPasteSelector': {
                    type: 'string',
                    markdownDescription: nls.localize(193, null),
                    enum: [
                        'afterPaste',
                        'never'
                    ],
                    enumDescriptions: [
                        nls.localize(194, null),
                        nls.localize(195, null),
                    ],
                    default: 'afterPaste',
                },
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            return {
                enabled: boolean(input.enabled, this.defaultValue.enabled),
                showPasteSelector: stringSet(input.showPasteSelector, this.defaultValue.showPasteSelector, ['afterPaste', 'never']),
            };
        }
    }
    //#endregion
    const DEFAULT_WINDOWS_FONT_FAMILY = 'Consolas, \'Courier New\', monospace';
    const DEFAULT_MAC_FONT_FAMILY = 'Menlo, Monaco, \'Courier New\', monospace';
    const DEFAULT_LINUX_FONT_FAMILY = '\'Droid Sans Mono\', \'monospace\', monospace';
    /**
     * @internal
     */
    exports.EDITOR_FONT_DEFAULTS = {
        fontFamily: (platform.$j ? DEFAULT_MAC_FONT_FAMILY : (platform.$k ? DEFAULT_LINUX_FONT_FAMILY : DEFAULT_WINDOWS_FONT_FAMILY)),
        fontWeight: 'normal',
        fontSize: (platform.$j ? 12 : 14),
        lineHeight: 0,
        letterSpacing: 0,
    };
    /**
     * @internal
     */
    exports.editorOptionsRegistry = [];
    function register(option) {
        exports.editorOptionsRegistry[option.id] = option;
        return option;
    }
    var EditorOption;
    (function (EditorOption) {
        EditorOption[EditorOption["acceptSuggestionOnCommitCharacter"] = 0] = "acceptSuggestionOnCommitCharacter";
        EditorOption[EditorOption["acceptSuggestionOnEnter"] = 1] = "acceptSuggestionOnEnter";
        EditorOption[EditorOption["accessibilitySupport"] = 2] = "accessibilitySupport";
        EditorOption[EditorOption["accessibilityPageSize"] = 3] = "accessibilityPageSize";
        EditorOption[EditorOption["ariaLabel"] = 4] = "ariaLabel";
        EditorOption[EditorOption["ariaRequired"] = 5] = "ariaRequired";
        EditorOption[EditorOption["autoClosingBrackets"] = 6] = "autoClosingBrackets";
        EditorOption[EditorOption["autoClosingComments"] = 7] = "autoClosingComments";
        EditorOption[EditorOption["screenReaderAnnounceInlineSuggestion"] = 8] = "screenReaderAnnounceInlineSuggestion";
        EditorOption[EditorOption["autoClosingDelete"] = 9] = "autoClosingDelete";
        EditorOption[EditorOption["autoClosingOvertype"] = 10] = "autoClosingOvertype";
        EditorOption[EditorOption["autoClosingQuotes"] = 11] = "autoClosingQuotes";
        EditorOption[EditorOption["autoIndent"] = 12] = "autoIndent";
        EditorOption[EditorOption["automaticLayout"] = 13] = "automaticLayout";
        EditorOption[EditorOption["autoSurround"] = 14] = "autoSurround";
        EditorOption[EditorOption["bracketPairColorization"] = 15] = "bracketPairColorization";
        EditorOption[EditorOption["guides"] = 16] = "guides";
        EditorOption[EditorOption["codeLens"] = 17] = "codeLens";
        EditorOption[EditorOption["codeLensFontFamily"] = 18] = "codeLensFontFamily";
        EditorOption[EditorOption["codeLensFontSize"] = 19] = "codeLensFontSize";
        EditorOption[EditorOption["colorDecorators"] = 20] = "colorDecorators";
        EditorOption[EditorOption["colorDecoratorsLimit"] = 21] = "colorDecoratorsLimit";
        EditorOption[EditorOption["columnSelection"] = 22] = "columnSelection";
        EditorOption[EditorOption["comments"] = 23] = "comments";
        EditorOption[EditorOption["contextmenu"] = 24] = "contextmenu";
        EditorOption[EditorOption["copyWithSyntaxHighlighting"] = 25] = "copyWithSyntaxHighlighting";
        EditorOption[EditorOption["cursorBlinking"] = 26] = "cursorBlinking";
        EditorOption[EditorOption["cursorSmoothCaretAnimation"] = 27] = "cursorSmoothCaretAnimation";
        EditorOption[EditorOption["cursorStyle"] = 28] = "cursorStyle";
        EditorOption[EditorOption["cursorSurroundingLines"] = 29] = "cursorSurroundingLines";
        EditorOption[EditorOption["cursorSurroundingLinesStyle"] = 30] = "cursorSurroundingLinesStyle";
        EditorOption[EditorOption["cursorWidth"] = 31] = "cursorWidth";
        EditorOption[EditorOption["disableLayerHinting"] = 32] = "disableLayerHinting";
        EditorOption[EditorOption["disableMonospaceOptimizations"] = 33] = "disableMonospaceOptimizations";
        EditorOption[EditorOption["domReadOnly"] = 34] = "domReadOnly";
        EditorOption[EditorOption["dragAndDrop"] = 35] = "dragAndDrop";
        EditorOption[EditorOption["dropIntoEditor"] = 36] = "dropIntoEditor";
        EditorOption[EditorOption["emptySelectionClipboard"] = 37] = "emptySelectionClipboard";
        EditorOption[EditorOption["experimentalWhitespaceRendering"] = 38] = "experimentalWhitespaceRendering";
        EditorOption[EditorOption["extraEditorClassName"] = 39] = "extraEditorClassName";
        EditorOption[EditorOption["fastScrollSensitivity"] = 40] = "fastScrollSensitivity";
        EditorOption[EditorOption["find"] = 41] = "find";
        EditorOption[EditorOption["fixedOverflowWidgets"] = 42] = "fixedOverflowWidgets";
        EditorOption[EditorOption["folding"] = 43] = "folding";
        EditorOption[EditorOption["foldingStrategy"] = 44] = "foldingStrategy";
        EditorOption[EditorOption["foldingHighlight"] = 45] = "foldingHighlight";
        EditorOption[EditorOption["foldingImportsByDefault"] = 46] = "foldingImportsByDefault";
        EditorOption[EditorOption["foldingMaximumRegions"] = 47] = "foldingMaximumRegions";
        EditorOption[EditorOption["unfoldOnClickAfterEndOfLine"] = 48] = "unfoldOnClickAfterEndOfLine";
        EditorOption[EditorOption["fontFamily"] = 49] = "fontFamily";
        EditorOption[EditorOption["fontInfo"] = 50] = "fontInfo";
        EditorOption[EditorOption["fontLigatures"] = 51] = "fontLigatures";
        EditorOption[EditorOption["fontSize"] = 52] = "fontSize";
        EditorOption[EditorOption["fontWeight"] = 53] = "fontWeight";
        EditorOption[EditorOption["fontVariations"] = 54] = "fontVariations";
        EditorOption[EditorOption["formatOnPaste"] = 55] = "formatOnPaste";
        EditorOption[EditorOption["formatOnType"] = 56] = "formatOnType";
        EditorOption[EditorOption["glyphMargin"] = 57] = "glyphMargin";
        EditorOption[EditorOption["gotoLocation"] = 58] = "gotoLocation";
        EditorOption[EditorOption["hideCursorInOverviewRuler"] = 59] = "hideCursorInOverviewRuler";
        EditorOption[EditorOption["hover"] = 60] = "hover";
        EditorOption[EditorOption["inDiffEditor"] = 61] = "inDiffEditor";
        EditorOption[EditorOption["inlineSuggest"] = 62] = "inlineSuggest";
        EditorOption[EditorOption["letterSpacing"] = 63] = "letterSpacing";
        EditorOption[EditorOption["lightbulb"] = 64] = "lightbulb";
        EditorOption[EditorOption["lineDecorationsWidth"] = 65] = "lineDecorationsWidth";
        EditorOption[EditorOption["lineHeight"] = 66] = "lineHeight";
        EditorOption[EditorOption["lineNumbers"] = 67] = "lineNumbers";
        EditorOption[EditorOption["lineNumbersMinChars"] = 68] = "lineNumbersMinChars";
        EditorOption[EditorOption["linkedEditing"] = 69] = "linkedEditing";
        EditorOption[EditorOption["links"] = 70] = "links";
        EditorOption[EditorOption["matchBrackets"] = 71] = "matchBrackets";
        EditorOption[EditorOption["minimap"] = 72] = "minimap";
        EditorOption[EditorOption["mouseStyle"] = 73] = "mouseStyle";
        EditorOption[EditorOption["mouseWheelScrollSensitivity"] = 74] = "mouseWheelScrollSensitivity";
        EditorOption[EditorOption["mouseWheelZoom"] = 75] = "mouseWheelZoom";
        EditorOption[EditorOption["multiCursorMergeOverlapping"] = 76] = "multiCursorMergeOverlapping";
        EditorOption[EditorOption["multiCursorModifier"] = 77] = "multiCursorModifier";
        EditorOption[EditorOption["multiCursorPaste"] = 78] = "multiCursorPaste";
        EditorOption[EditorOption["multiCursorLimit"] = 79] = "multiCursorLimit";
        EditorOption[EditorOption["occurrencesHighlight"] = 80] = "occurrencesHighlight";
        EditorOption[EditorOption["overviewRulerBorder"] = 81] = "overviewRulerBorder";
        EditorOption[EditorOption["overviewRulerLanes"] = 82] = "overviewRulerLanes";
        EditorOption[EditorOption["padding"] = 83] = "padding";
        EditorOption[EditorOption["pasteAs"] = 84] = "pasteAs";
        EditorOption[EditorOption["parameterHints"] = 85] = "parameterHints";
        EditorOption[EditorOption["peekWidgetDefaultFocus"] = 86] = "peekWidgetDefaultFocus";
        EditorOption[EditorOption["definitionLinkOpensInPeek"] = 87] = "definitionLinkOpensInPeek";
        EditorOption[EditorOption["quickSuggestions"] = 88] = "quickSuggestions";
        EditorOption[EditorOption["quickSuggestionsDelay"] = 89] = "quickSuggestionsDelay";
        EditorOption[EditorOption["readOnly"] = 90] = "readOnly";
        EditorOption[EditorOption["readOnlyMessage"] = 91] = "readOnlyMessage";
        EditorOption[EditorOption["renameOnType"] = 92] = "renameOnType";
        EditorOption[EditorOption["renderControlCharacters"] = 93] = "renderControlCharacters";
        EditorOption[EditorOption["renderFinalNewline"] = 94] = "renderFinalNewline";
        EditorOption[EditorOption["renderLineHighlight"] = 95] = "renderLineHighlight";
        EditorOption[EditorOption["renderLineHighlightOnlyWhenFocus"] = 96] = "renderLineHighlightOnlyWhenFocus";
        EditorOption[EditorOption["renderValidationDecorations"] = 97] = "renderValidationDecorations";
        EditorOption[EditorOption["renderWhitespace"] = 98] = "renderWhitespace";
        EditorOption[EditorOption["revealHorizontalRightPadding"] = 99] = "revealHorizontalRightPadding";
        EditorOption[EditorOption["roundedSelection"] = 100] = "roundedSelection";
        EditorOption[EditorOption["rulers"] = 101] = "rulers";
        EditorOption[EditorOption["scrollbar"] = 102] = "scrollbar";
        EditorOption[EditorOption["scrollBeyondLastColumn"] = 103] = "scrollBeyondLastColumn";
        EditorOption[EditorOption["scrollBeyondLastLine"] = 104] = "scrollBeyondLastLine";
        EditorOption[EditorOption["scrollPredominantAxis"] = 105] = "scrollPredominantAxis";
        EditorOption[EditorOption["selectionClipboard"] = 106] = "selectionClipboard";
        EditorOption[EditorOption["selectionHighlight"] = 107] = "selectionHighlight";
        EditorOption[EditorOption["selectOnLineNumbers"] = 108] = "selectOnLineNumbers";
        EditorOption[EditorOption["showFoldingControls"] = 109] = "showFoldingControls";
        EditorOption[EditorOption["showUnused"] = 110] = "showUnused";
        EditorOption[EditorOption["snippetSuggestions"] = 111] = "snippetSuggestions";
        EditorOption[EditorOption["smartSelect"] = 112] = "smartSelect";
        EditorOption[EditorOption["smoothScrolling"] = 113] = "smoothScrolling";
        EditorOption[EditorOption["stickyScroll"] = 114] = "stickyScroll";
        EditorOption[EditorOption["stickyTabStops"] = 115] = "stickyTabStops";
        EditorOption[EditorOption["stopRenderingLineAfter"] = 116] = "stopRenderingLineAfter";
        EditorOption[EditorOption["suggest"] = 117] = "suggest";
        EditorOption[EditorOption["suggestFontSize"] = 118] = "suggestFontSize";
        EditorOption[EditorOption["suggestLineHeight"] = 119] = "suggestLineHeight";
        EditorOption[EditorOption["suggestOnTriggerCharacters"] = 120] = "suggestOnTriggerCharacters";
        EditorOption[EditorOption["suggestSelection"] = 121] = "suggestSelection";
        EditorOption[EditorOption["tabCompletion"] = 122] = "tabCompletion";
        EditorOption[EditorOption["tabIndex"] = 123] = "tabIndex";
        EditorOption[EditorOption["unicodeHighlighting"] = 124] = "unicodeHighlighting";
        EditorOption[EditorOption["unusualLineTerminators"] = 125] = "unusualLineTerminators";
        EditorOption[EditorOption["useShadowDOM"] = 126] = "useShadowDOM";
        EditorOption[EditorOption["useTabStops"] = 127] = "useTabStops";
        EditorOption[EditorOption["wordBreak"] = 128] = "wordBreak";
        EditorOption[EditorOption["wordSeparators"] = 129] = "wordSeparators";
        EditorOption[EditorOption["wordWrap"] = 130] = "wordWrap";
        EditorOption[EditorOption["wordWrapBreakAfterCharacters"] = 131] = "wordWrapBreakAfterCharacters";
        EditorOption[EditorOption["wordWrapBreakBeforeCharacters"] = 132] = "wordWrapBreakBeforeCharacters";
        EditorOption[EditorOption["wordWrapColumn"] = 133] = "wordWrapColumn";
        EditorOption[EditorOption["wordWrapOverride1"] = 134] = "wordWrapOverride1";
        EditorOption[EditorOption["wordWrapOverride2"] = 135] = "wordWrapOverride2";
        EditorOption[EditorOption["wrappingIndent"] = 136] = "wrappingIndent";
        EditorOption[EditorOption["wrappingStrategy"] = 137] = "wrappingStrategy";
        EditorOption[EditorOption["showDeprecated"] = 138] = "showDeprecated";
        EditorOption[EditorOption["inlayHints"] = 139] = "inlayHints";
        // Leave these at the end (because they have dependencies!)
        EditorOption[EditorOption["editorClassName"] = 140] = "editorClassName";
        EditorOption[EditorOption["pixelRatio"] = 141] = "pixelRatio";
        EditorOption[EditorOption["tabFocusMode"] = 142] = "tabFocusMode";
        EditorOption[EditorOption["layoutInfo"] = 143] = "layoutInfo";
        EditorOption[EditorOption["wrappingInfo"] = 144] = "wrappingInfo";
        EditorOption[EditorOption["defaultColorDecorators"] = 145] = "defaultColorDecorators";
        EditorOption[EditorOption["colorDecoratorsActivatedOn"] = 146] = "colorDecoratorsActivatedOn";
        EditorOption[EditorOption["inlineCompletionsAccessibilityVerbose"] = 147] = "inlineCompletionsAccessibilityVerbose";
    })(EditorOption || (exports.EditorOption = EditorOption = {}));
    exports.EditorOptions = {
        acceptSuggestionOnCommitCharacter: register(new EditorBooleanOption(0 /* EditorOption.acceptSuggestionOnCommitCharacter */, 'acceptSuggestionOnCommitCharacter', true, { markdownDescription: nls.localize(196, null) })),
        acceptSuggestionOnEnter: register(new EditorStringEnumOption(1 /* EditorOption.acceptSuggestionOnEnter */, 'acceptSuggestionOnEnter', 'on', ['on', 'smart', 'off'], {
            markdownEnumDescriptions: [
                '',
                nls.localize(197, null),
                ''
            ],
            markdownDescription: nls.localize(198, null)
        })),
        accessibilitySupport: register(new EditorAccessibilitySupport()),
        accessibilityPageSize: register(new EditorIntOption(3 /* EditorOption.accessibilityPageSize */, 'accessibilityPageSize', 10, 1, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */, {
            description: nls.localize(199, null),
            tags: ['accessibility']
        })),
        ariaLabel: register(new EditorStringOption(4 /* EditorOption.ariaLabel */, 'ariaLabel', nls.localize(200, null))),
        ariaRequired: register(new EditorBooleanOption(5 /* EditorOption.ariaRequired */, 'ariaRequired', false, undefined)),
        screenReaderAnnounceInlineSuggestion: register(new EditorBooleanOption(8 /* EditorOption.screenReaderAnnounceInlineSuggestion */, 'screenReaderAnnounceInlineSuggestion', true, {
            description: nls.localize(201, null),
            tags: ['accessibility']
        })),
        autoClosingBrackets: register(new EditorStringEnumOption(6 /* EditorOption.autoClosingBrackets */, 'autoClosingBrackets', 'languageDefined', ['always', 'languageDefined', 'beforeWhitespace', 'never'], {
            enumDescriptions: [
                '',
                nls.localize(202, null),
                nls.localize(203, null),
                '',
            ],
            description: nls.localize(204, null)
        })),
        autoClosingComments: register(new EditorStringEnumOption(7 /* EditorOption.autoClosingComments */, 'autoClosingComments', 'languageDefined', ['always', 'languageDefined', 'beforeWhitespace', 'never'], {
            enumDescriptions: [
                '',
                nls.localize(205, null),
                nls.localize(206, null),
                '',
            ],
            description: nls.localize(207, null)
        })),
        autoClosingDelete: register(new EditorStringEnumOption(9 /* EditorOption.autoClosingDelete */, 'autoClosingDelete', 'auto', ['always', 'auto', 'never'], {
            enumDescriptions: [
                '',
                nls.localize(208, null),
                '',
            ],
            description: nls.localize(209, null)
        })),
        autoClosingOvertype: register(new EditorStringEnumOption(10 /* EditorOption.autoClosingOvertype */, 'autoClosingOvertype', 'auto', ['always', 'auto', 'never'], {
            enumDescriptions: [
                '',
                nls.localize(210, null),
                '',
            ],
            description: nls.localize(211, null)
        })),
        autoClosingQuotes: register(new EditorStringEnumOption(11 /* EditorOption.autoClosingQuotes */, 'autoClosingQuotes', 'languageDefined', ['always', 'languageDefined', 'beforeWhitespace', 'never'], {
            enumDescriptions: [
                '',
                nls.localize(212, null),
                nls.localize(213, null),
                '',
            ],
            description: nls.localize(214, null)
        })),
        autoIndent: register(new EditorEnumOption(12 /* EditorOption.autoIndent */, 'autoIndent', 4 /* EditorAutoIndentStrategy.Full */, 'full', ['none', 'keep', 'brackets', 'advanced', 'full'], _autoIndentFromString, {
            enumDescriptions: [
                nls.localize(215, null),
                nls.localize(216, null),
                nls.localize(217, null),
                nls.localize(218, null),
                nls.localize(219, null),
            ],
            description: nls.localize(220, null)
        })),
        automaticLayout: register(new EditorBooleanOption(13 /* EditorOption.automaticLayout */, 'automaticLayout', false)),
        autoSurround: register(new EditorStringEnumOption(14 /* EditorOption.autoSurround */, 'autoSurround', 'languageDefined', ['languageDefined', 'quotes', 'brackets', 'never'], {
            enumDescriptions: [
                nls.localize(221, null),
                nls.localize(222, null),
                nls.localize(223, null),
                ''
            ],
            description: nls.localize(224, null)
        })),
        bracketPairColorization: register(new BracketPairColorization()),
        bracketPairGuides: register(new GuideOptions()),
        stickyTabStops: register(new EditorBooleanOption(115 /* EditorOption.stickyTabStops */, 'stickyTabStops', false, { description: nls.localize(225, null) })),
        codeLens: register(new EditorBooleanOption(17 /* EditorOption.codeLens */, 'codeLens', true, { description: nls.localize(226, null) })),
        codeLensFontFamily: register(new EditorStringOption(18 /* EditorOption.codeLensFontFamily */, 'codeLensFontFamily', '', { description: nls.localize(227, null) })),
        codeLensFontSize: register(new EditorIntOption(19 /* EditorOption.codeLensFontSize */, 'codeLensFontSize', 0, 0, 100, {
            type: 'number',
            default: 0,
            minimum: 0,
            maximum: 100,
            markdownDescription: nls.localize(228, null)
        })),
        colorDecorators: register(new EditorBooleanOption(20 /* EditorOption.colorDecorators */, 'colorDecorators', true, { description: nls.localize(229, null) })),
        colorDecoratorActivatedOn: register(new EditorStringEnumOption(146 /* EditorOption.colorDecoratorsActivatedOn */, 'colorDecoratorsActivatedOn', 'clickAndHover', ['clickAndHover', 'hover', 'click'], {
            enumDescriptions: [
                nls.localize(230, null),
                nls.localize(231, null),
                nls.localize(232, null)
            ],
            description: nls.localize(233, null)
        })),
        colorDecoratorsLimit: register(new EditorIntOption(21 /* EditorOption.colorDecoratorsLimit */, 'colorDecoratorsLimit', 500, 1, 1000000, {
            markdownDescription: nls.localize(234, null)
        })),
        columnSelection: register(new EditorBooleanOption(22 /* EditorOption.columnSelection */, 'columnSelection', false, { description: nls.localize(235, null) })),
        comments: register(new EditorComments()),
        contextmenu: register(new EditorBooleanOption(24 /* EditorOption.contextmenu */, 'contextmenu', true)),
        copyWithSyntaxHighlighting: register(new EditorBooleanOption(25 /* EditorOption.copyWithSyntaxHighlighting */, 'copyWithSyntaxHighlighting', true, { description: nls.localize(236, null) })),
        cursorBlinking: register(new EditorEnumOption(26 /* EditorOption.cursorBlinking */, 'cursorBlinking', 1 /* TextEditorCursorBlinkingStyle.Blink */, 'blink', ['blink', 'smooth', 'phase', 'expand', 'solid'], _cursorBlinkingStyleFromString, { description: nls.localize(237, null) })),
        cursorSmoothCaretAnimation: register(new EditorStringEnumOption(27 /* EditorOption.cursorSmoothCaretAnimation */, 'cursorSmoothCaretAnimation', 'off', ['off', 'explicit', 'on'], {
            enumDescriptions: [
                nls.localize(238, null),
                nls.localize(239, null),
                nls.localize(240, null)
            ],
            description: nls.localize(241, null)
        })),
        cursorStyle: register(new EditorEnumOption(28 /* EditorOption.cursorStyle */, 'cursorStyle', TextEditorCursorStyle.Line, 'line', ['line', 'block', 'underline', 'line-thin', 'block-outline', 'underline-thin'], _cursorStyleFromString, { description: nls.localize(242, null) })),
        cursorSurroundingLines: register(new EditorIntOption(29 /* EditorOption.cursorSurroundingLines */, 'cursorSurroundingLines', 0, 0, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */, { description: nls.localize(243, null) })),
        cursorSurroundingLinesStyle: register(new EditorStringEnumOption(30 /* EditorOption.cursorSurroundingLinesStyle */, 'cursorSurroundingLinesStyle', 'default', ['default', 'all'], {
            enumDescriptions: [
                nls.localize(244, null),
                nls.localize(245, null)
            ],
            markdownDescription: nls.localize(246, null)
        })),
        cursorWidth: register(new EditorIntOption(31 /* EditorOption.cursorWidth */, 'cursorWidth', 0, 0, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */, { markdownDescription: nls.localize(247, null) })),
        disableLayerHinting: register(new EditorBooleanOption(32 /* EditorOption.disableLayerHinting */, 'disableLayerHinting', false)),
        disableMonospaceOptimizations: register(new EditorBooleanOption(33 /* EditorOption.disableMonospaceOptimizations */, 'disableMonospaceOptimizations', false)),
        domReadOnly: register(new EditorBooleanOption(34 /* EditorOption.domReadOnly */, 'domReadOnly', false)),
        dragAndDrop: register(new EditorBooleanOption(35 /* EditorOption.dragAndDrop */, 'dragAndDrop', true, { description: nls.localize(248, null) })),
        emptySelectionClipboard: register(new EditorEmptySelectionClipboard()),
        dropIntoEditor: register(new EditorDropIntoEditor()),
        stickyScroll: register(new EditorStickyScroll()),
        experimentalWhitespaceRendering: register(new EditorStringEnumOption(38 /* EditorOption.experimentalWhitespaceRendering */, 'experimentalWhitespaceRendering', 'svg', ['svg', 'font', 'off'], {
            enumDescriptions: [
                nls.localize(249, null),
                nls.localize(250, null),
                nls.localize(251, null),
            ],
            description: nls.localize(252, null)
        })),
        extraEditorClassName: register(new EditorStringOption(39 /* EditorOption.extraEditorClassName */, 'extraEditorClassName', '')),
        fastScrollSensitivity: register(new EditorFloatOption(40 /* EditorOption.fastScrollSensitivity */, 'fastScrollSensitivity', 5, x => (x <= 0 ? 5 : x), { markdownDescription: nls.localize(253, null) })),
        find: register(new EditorFind()),
        fixedOverflowWidgets: register(new EditorBooleanOption(42 /* EditorOption.fixedOverflowWidgets */, 'fixedOverflowWidgets', false)),
        folding: register(new EditorBooleanOption(43 /* EditorOption.folding */, 'folding', true, { description: nls.localize(254, null) })),
        foldingStrategy: register(new EditorStringEnumOption(44 /* EditorOption.foldingStrategy */, 'foldingStrategy', 'auto', ['auto', 'indentation'], {
            enumDescriptions: [
                nls.localize(255, null),
                nls.localize(256, null),
            ],
            description: nls.localize(257, null)
        })),
        foldingHighlight: register(new EditorBooleanOption(45 /* EditorOption.foldingHighlight */, 'foldingHighlight', true, { description: nls.localize(258, null) })),
        foldingImportsByDefault: register(new EditorBooleanOption(46 /* EditorOption.foldingImportsByDefault */, 'foldingImportsByDefault', false, { description: nls.localize(259, null) })),
        foldingMaximumRegions: register(new EditorIntOption(47 /* EditorOption.foldingMaximumRegions */, 'foldingMaximumRegions', 5000, 10, 65000, // limit must be less than foldingRanges MAX_FOLDING_REGIONS
        { description: nls.localize(260, null) })),
        unfoldOnClickAfterEndOfLine: register(new EditorBooleanOption(48 /* EditorOption.unfoldOnClickAfterEndOfLine */, 'unfoldOnClickAfterEndOfLine', false, { description: nls.localize(261, null) })),
        fontFamily: register(new EditorStringOption(49 /* EditorOption.fontFamily */, 'fontFamily', exports.EDITOR_FONT_DEFAULTS.fontFamily, { description: nls.localize(262, null) })),
        fontInfo: register(new EditorFontInfo()),
        fontLigatures2: register(new EditorFontLigatures()),
        fontSize: register(new EditorFontSize()),
        fontWeight: register(new EditorFontWeight()),
        fontVariations: register(new EditorFontVariations()),
        formatOnPaste: register(new EditorBooleanOption(55 /* EditorOption.formatOnPaste */, 'formatOnPaste', false, { description: nls.localize(263, null) })),
        formatOnType: register(new EditorBooleanOption(56 /* EditorOption.formatOnType */, 'formatOnType', false, { description: nls.localize(264, null) })),
        glyphMargin: register(new EditorBooleanOption(57 /* EditorOption.glyphMargin */, 'glyphMargin', true, { description: nls.localize(265, null) })),
        gotoLocation: register(new EditorGoToLocation()),
        hideCursorInOverviewRuler: register(new EditorBooleanOption(59 /* EditorOption.hideCursorInOverviewRuler */, 'hideCursorInOverviewRuler', false, { description: nls.localize(266, null) })),
        hover: register(new EditorHover()),
        inDiffEditor: register(new EditorBooleanOption(61 /* EditorOption.inDiffEditor */, 'inDiffEditor', false)),
        letterSpacing: register(new EditorFloatOption(63 /* EditorOption.letterSpacing */, 'letterSpacing', exports.EDITOR_FONT_DEFAULTS.letterSpacing, x => EditorFloatOption.clamp(x, -5, 20), { description: nls.localize(267, null) })),
        lightbulb: register(new EditorLightbulb()),
        lineDecorationsWidth: register(new EditorLineDecorationsWidth()),
        lineHeight: register(new EditorLineHeight()),
        lineNumbers: register(new EditorRenderLineNumbersOption()),
        lineNumbersMinChars: register(new EditorIntOption(68 /* EditorOption.lineNumbersMinChars */, 'lineNumbersMinChars', 5, 1, 300)),
        linkedEditing: register(new EditorBooleanOption(69 /* EditorOption.linkedEditing */, 'linkedEditing', false, { description: nls.localize(268, null) })),
        links: register(new EditorBooleanOption(70 /* EditorOption.links */, 'links', true, { description: nls.localize(269, null) })),
        matchBrackets: register(new EditorStringEnumOption(71 /* EditorOption.matchBrackets */, 'matchBrackets', 'always', ['always', 'near', 'never'], { description: nls.localize(270, null) })),
        minimap: register(new EditorMinimap()),
        mouseStyle: register(new EditorStringEnumOption(73 /* EditorOption.mouseStyle */, 'mouseStyle', 'text', ['text', 'default', 'copy'])),
        mouseWheelScrollSensitivity: register(new EditorFloatOption(74 /* EditorOption.mouseWheelScrollSensitivity */, 'mouseWheelScrollSensitivity', 1, x => (x === 0 ? 1 : x), { markdownDescription: nls.localize(271, null) })),
        mouseWheelZoom: register(new EditorBooleanOption(75 /* EditorOption.mouseWheelZoom */, 'mouseWheelZoom', false, { markdownDescription: nls.localize(272, null) })),
        multiCursorMergeOverlapping: register(new EditorBooleanOption(76 /* EditorOption.multiCursorMergeOverlapping */, 'multiCursorMergeOverlapping', true, { description: nls.localize(273, null) })),
        multiCursorModifier: register(new EditorEnumOption(77 /* EditorOption.multiCursorModifier */, 'multiCursorModifier', 'altKey', 'alt', ['ctrlCmd', 'alt'], _multiCursorModifierFromString, {
            markdownEnumDescriptions: [
                nls.localize(274, null),
                nls.localize(275, null)
            ],
            markdownDescription: nls.localize(276, null)






        })),
        multiCursorPaste: register(new EditorStringEnumOption(78 /* EditorOption.multiCursorPaste */, 'multiCursorPaste', 'spread', ['spread', 'full'], {
            markdownEnumDescriptions: [
                nls.localize(277, null),
                nls.localize(278, null)
            ],
            markdownDescription: nls.localize(279, null)
        })),
        multiCursorLimit: register(new EditorIntOption(79 /* EditorOption.multiCursorLimit */, 'multiCursorLimit', 10000, 1, 100000, {
            markdownDescription: nls.localize(280, null)
        })),
        occurrencesHighlight: register(new EditorBooleanOption(80 /* EditorOption.occurrencesHighlight */, 'occurrencesHighlight', true, { description: nls.localize(281, null) })),
        overviewRulerBorder: register(new EditorBooleanOption(81 /* EditorOption.overviewRulerBorder */, 'overviewRulerBorder', true, { description: nls.localize(282, null) })),
        overviewRulerLanes: register(new EditorIntOption(82 /* EditorOption.overviewRulerLanes */, 'overviewRulerLanes', 3, 0, 3)),
        padding: register(new EditorPadding()),
        pasteAs: register(new EditorPasteAs()),
        parameterHints: register(new EditorParameterHints()),
        peekWidgetDefaultFocus: register(new EditorStringEnumOption(86 /* EditorOption.peekWidgetDefaultFocus */, 'peekWidgetDefaultFocus', 'tree', ['tree', 'editor'], {
            enumDescriptions: [
                nls.localize(283, null),
                nls.localize(284, null)
            ],
            description: nls.localize(285, null)
        })),
        definitionLinkOpensInPeek: register(new EditorBooleanOption(87 /* EditorOption.definitionLinkOpensInPeek */, 'definitionLinkOpensInPeek', false, { description: nls.localize(286, null) })),
        quickSuggestions: register(new EditorQuickSuggestions()),
        quickSuggestionsDelay: register(new EditorIntOption(89 /* EditorOption.quickSuggestionsDelay */, 'quickSuggestionsDelay', 10, 0, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */, { description: nls.localize(287, null) })),
        readOnly: register(new EditorBooleanOption(90 /* EditorOption.readOnly */, 'readOnly', false)),
        readOnlyMessage: register(new ReadonlyMessage()),
        renameOnType: register(new EditorBooleanOption(92 /* EditorOption.renameOnType */, 'renameOnType', false, { description: nls.localize(288, null), markdownDeprecationMessage: nls.localize(289, null) })),
        renderControlCharacters: register(new EditorBooleanOption(93 /* EditorOption.renderControlCharacters */, 'renderControlCharacters', true, { description: nls.localize(290, null), restricted: true })),
        renderFinalNewline: register(new EditorStringEnumOption(94 /* EditorOption.renderFinalNewline */, 'renderFinalNewline', (platform.$k ? 'dimmed' : 'on'), ['off', 'on', 'dimmed'], { description: nls.localize(291, null) })),
        renderLineHighlight: register(new EditorStringEnumOption(95 /* EditorOption.renderLineHighlight */, 'renderLineHighlight', 'line', ['none', 'gutter', 'line', 'all'], {
            enumDescriptions: [
                '',
                '',
                '',
                nls.localize(292, null),
            ],
            description: nls.localize(293, null)
        })),
        renderLineHighlightOnlyWhenFocus: register(new EditorBooleanOption(96 /* EditorOption.renderLineHighlightOnlyWhenFocus */, 'renderLineHighlightOnlyWhenFocus', false, { description: nls.localize(294, null) })),
        renderValidationDecorations: register(new EditorStringEnumOption(97 /* EditorOption.renderValidationDecorations */, 'renderValidationDecorations', 'editable', ['editable', 'on', 'off'])),
        renderWhitespace: register(new EditorStringEnumOption(98 /* EditorOption.renderWhitespace */, 'renderWhitespace', 'selection', ['none', 'boundary', 'selection', 'trailing', 'all'], {
            enumDescriptions: [
                '',
                nls.localize(295, null),
                nls.localize(296, null),
                nls.localize(297, null),
                ''
            ],
            description: nls.localize(298, null)
        })),
        revealHorizontalRightPadding: register(new EditorIntOption(99 /* EditorOption.revealHorizontalRightPadding */, 'revealHorizontalRightPadding', 15, 0, 1000)),
        roundedSelection: register(new EditorBooleanOption(100 /* EditorOption.roundedSelection */, 'roundedSelection', true, { description: nls.localize(299, null) })),
        rulers: register(new EditorRulers()),
        scrollbar: register(new EditorScrollbar()),
        scrollBeyondLastColumn: register(new EditorIntOption(103 /* EditorOption.scrollBeyondLastColumn */, 'scrollBeyondLastColumn', 4, 0, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */, { description: nls.localize(300, null) })),
        scrollBeyondLastLine: register(new EditorBooleanOption(104 /* EditorOption.scrollBeyondLastLine */, 'scrollBeyondLastLine', true, { description: nls.localize(301, null) })),
        scrollPredominantAxis: register(new EditorBooleanOption(105 /* EditorOption.scrollPredominantAxis */, 'scrollPredominantAxis', true, { description: nls.localize(302, null) })),
        selectionClipboard: register(new EditorBooleanOption(106 /* EditorOption.selectionClipboard */, 'selectionClipboard', true, {
            description: nls.localize(303, null),
            included: platform.$k
        })),
        selectionHighlight: register(new EditorBooleanOption(107 /* EditorOption.selectionHighlight */, 'selectionHighlight', true, { description: nls.localize(304, null) })),
        selectOnLineNumbers: register(new EditorBooleanOption(108 /* EditorOption.selectOnLineNumbers */, 'selectOnLineNumbers', true)),
        showFoldingControls: register(new EditorStringEnumOption(109 /* EditorOption.showFoldingControls */, 'showFoldingControls', 'mouseover', ['always', 'never', 'mouseover'], {
            enumDescriptions: [
                nls.localize(305, null),
                nls.localize(306, null),
                nls.localize(307, null),
            ],
            description: nls.localize(308, null)
        })),
        showUnused: register(new EditorBooleanOption(110 /* EditorOption.showUnused */, 'showUnused', true, { description: nls.localize(309, null) })),
        showDeprecated: register(new EditorBooleanOption(138 /* EditorOption.showDeprecated */, 'showDeprecated', true, { description: nls.localize(310, null) })),
        inlayHints: register(new EditorInlayHints()),
        snippetSuggestions: register(new EditorStringEnumOption(111 /* EditorOption.snippetSuggestions */, 'snippetSuggestions', 'inline', ['top', 'bottom', 'inline', 'none'], {
            enumDescriptions: [
                nls.localize(311, null),
                nls.localize(312, null),
                nls.localize(313, null),
                nls.localize(314, null),
            ],
            description: nls.localize(315, null)
        })),
        smartSelect: register(new SmartSelect()),
        smoothScrolling: register(new EditorBooleanOption(113 /* EditorOption.smoothScrolling */, 'smoothScrolling', false, { description: nls.localize(316, null) })),
        stopRenderingLineAfter: register(new EditorIntOption(116 /* EditorOption.stopRenderingLineAfter */, 'stopRenderingLineAfter', 10000, -1, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */)),
        suggest: register(new EditorSuggest()),
        inlineSuggest: register(new InlineEditorSuggest()),
        inlineCompletionsAccessibilityVerbose: register(new EditorBooleanOption(147 /* EditorOption.inlineCompletionsAccessibilityVerbose */, 'inlineCompletionsAccessibilityVerbose', false, { description: nls.localize(317, null) })),
        suggestFontSize: register(new EditorIntOption(118 /* EditorOption.suggestFontSize */, 'suggestFontSize', 0, 0, 1000, { markdownDescription: nls.localize(318, null, '`0`', '`#editor.fontSize#`') })),
        suggestLineHeight: register(new EditorIntOption(119 /* EditorOption.suggestLineHeight */, 'suggestLineHeight', 0, 0, 1000, { markdownDescription: nls.localize(319, null, '`0`', '`#editor.lineHeight#`') })),
        suggestOnTriggerCharacters: register(new EditorBooleanOption(120 /* EditorOption.suggestOnTriggerCharacters */, 'suggestOnTriggerCharacters', true, { description: nls.localize(320, null) })),
        suggestSelection: register(new EditorStringEnumOption(121 /* EditorOption.suggestSelection */, 'suggestSelection', 'first', ['first', 'recentlyUsed', 'recentlyUsedByPrefix'], {
            markdownEnumDescriptions: [
                nls.localize(321, null),
                nls.localize(322, null),
                nls.localize(323, null),
            ],
            description: nls.localize(324, null)
        })),
        tabCompletion: register(new EditorStringEnumOption(122 /* EditorOption.tabCompletion */, 'tabCompletion', 'off', ['on', 'off', 'onlySnippets'], {
            enumDescriptions: [
                nls.localize(325, null),
                nls.localize(326, null),
                nls.localize(327, null),
            ],
            description: nls.localize(328, null)
        })),
        tabIndex: register(new EditorIntOption(123 /* EditorOption.tabIndex */, 'tabIndex', 0, -1, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */)),
        unicodeHighlight: register(new UnicodeHighlight()),
        unusualLineTerminators: register(new EditorStringEnumOption(125 /* EditorOption.unusualLineTerminators */, 'unusualLineTerminators', 'prompt', ['auto', 'off', 'prompt'], {
            enumDescriptions: [
                nls.localize(329, null),
                nls.localize(330, null),
                nls.localize(331, null),
            ],
            description: nls.localize(332, null)
        })),
        useShadowDOM: register(new EditorBooleanOption(126 /* EditorOption.useShadowDOM */, 'useShadowDOM', true)),
        useTabStops: register(new EditorBooleanOption(127 /* EditorOption.useTabStops */, 'useTabStops', true, { description: nls.localize(333, null) })),
        wordBreak: register(new EditorStringEnumOption(128 /* EditorOption.wordBreak */, 'wordBreak', 'normal', ['normal', 'keepAll'], {
            markdownEnumDescriptions: [
                nls.localize(334, null),
                nls.localize(335, null),
            ],
            description: nls.localize(336, null)
        })),
        wordSeparators: register(new EditorStringOption(129 /* EditorOption.wordSeparators */, 'wordSeparators', wordHelper_1.$Vr, { description: nls.localize(337, null) })),
        wordWrap: register(new EditorStringEnumOption(130 /* EditorOption.wordWrap */, 'wordWrap', 'off', ['off', 'on', 'wordWrapColumn', 'bounded'], {
            markdownEnumDescriptions: [
                nls.localize(338, null),
                nls.localize(339, null),
                nls.localize(340, null),





                nls.localize(341, null),






            ],
            description: nls.localize(342, null)






        })),
        wordWrapBreakAfterCharacters: register(new EditorStringOption(131 /* EditorOption.wordWrapBreakAfterCharacters */, 'wordWrapBreakAfterCharacters', 
        // allow-any-unicode-next-line
        ' \t})]?|/&.,;¢°′″‰℃、。｡､￠，．：；？！％・･ゝゞヽヾーァィゥェォッャュョヮヵヶぁぃぅぇぉっゃゅょゎゕゖㇰㇱㇲㇳㇴㇵㇶㇷㇸㇹㇺㇻㇼㇽㇾㇿ々〻ｧｨｩｪｫｬｭｮｯｰ”〉》」』】〕）］｝｣')),
        wordWrapBreakBeforeCharacters: register(new EditorStringOption(132 /* EditorOption.wordWrapBreakBeforeCharacters */, 'wordWrapBreakBeforeCharacters', 
        // allow-any-unicode-next-line
        '([{‘“〈《「『【〔（［｛｢£¥＄￡￥+＋')),
        wordWrapColumn: register(new EditorIntOption(133 /* EditorOption.wordWrapColumn */, 'wordWrapColumn', 80, 1, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */, {
            markdownDescription: nls.localize(343, null)






        })),
        wordWrapOverride1: register(new EditorStringEnumOption(134 /* EditorOption.wordWrapOverride1 */, 'wordWrapOverride1', 'inherit', ['off', 'on', 'inherit'])),
        wordWrapOverride2: register(new EditorStringEnumOption(135 /* EditorOption.wordWrapOverride2 */, 'wordWrapOverride2', 'inherit', ['off', 'on', 'inherit'])),
        // Leave these at the end (because they have dependencies!)
        editorClassName: register(new EditorClassName()),
        defaultColorDecorators: register(new EditorBooleanOption(145 /* EditorOption.defaultColorDecorators */, 'defaultColorDecorators', false, { markdownDescription: nls.localize(344, null) })),
        pixelRatio: register(new EditorPixelRatio()),
        tabFocusMode: register(new EditorBooleanOption(142 /* EditorOption.tabFocusMode */, 'tabFocusMode', false, { markdownDescription: nls.localize(345, null) })),
        layoutInfo: register(new EditorLayoutInfoComputer()),
        wrappingInfo: register(new EditorWrappingInfoComputer()),
        wrappingIndent: register(new WrappingIndentOption()),
        wrappingStrategy: register(new WrappingStrategy())
    };
});
//# sourceMappingURL=editorOptions.js.map