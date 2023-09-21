/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/objects", "vs/base/common/platform", "vs/editor/common/core/textModelDefaults", "vs/editor/common/core/wordHelper", "vs/nls"], function (require, exports, arrays, objects, platform, textModelDefaults_1, wordHelper_1, nls) {
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
            this._values = values;
        }
        hasChanged(id) {
            return this._values[id];
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
            const arrayEquals = Array.isArray(value) && Array.isArray(update) && arrays.equals(value, update);
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
            this._allowedValues = allowedValues;
        }
        validate(input) {
            return stringSet(input, this.defaultValue, this._allowedValues);
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
            this._allowedValues = allowedValues;
            this._convert = convert;
        }
        validate(input) {
            if (typeof input !== 'string') {
                return this.defaultValue;
            }
            if (this._allowedValues.indexOf(input) === -1) {
                return this.defaultValue;
            }
            return this._convert(input);
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
                    nls.localize('accessibilitySupport.auto', "Use platform APIs to detect when a Screen Reader is attached"),
                    nls.localize('accessibilitySupport.on', "Optimize for usage with a Screen Reader"),
                    nls.localize('accessibilitySupport.off', "Assume a screen reader is not attached"),
                ],
                default: 'auto',
                tags: ['accessibility'],
                description: nls.localize('accessibilitySupport', "Controls if the UI should run in a mode where it is optimized for screen readers.")
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
                    description: nls.localize('comments.insertSpace', "Controls whether a space character is inserted when commenting.")
                },
                'editor.comments.ignoreEmptyLines': {
                    type: 'boolean',
                    default: defaults.ignoreEmptyLines,
                    description: nls.localize('comments.ignoreEmptyLines', 'Controls if empty lines should be ignored with toggle, add or remove actions for line comments.')
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
            super(37 /* EditorOption.emptySelectionClipboard */, 'emptySelectionClipboard', true, { description: nls.localize('emptySelectionClipboard', "Controls whether copying without a selection copies the current line.") });
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
                    description: nls.localize('find.cursorMoveOnType', "Controls whether the cursor should jump to find matches while typing.")
                },
                'editor.find.seedSearchStringFromSelection': {
                    type: 'string',
                    enum: ['never', 'always', 'selection'],
                    default: defaults.seedSearchStringFromSelection,
                    enumDescriptions: [
                        nls.localize('editor.find.seedSearchStringFromSelection.never', 'Never seed search string from the editor selection.'),
                        nls.localize('editor.find.seedSearchStringFromSelection.always', 'Always seed search string from the editor selection, including word at cursor position.'),
                        nls.localize('editor.find.seedSearchStringFromSelection.selection', 'Only seed search string from the editor selection.')
                    ],
                    description: nls.localize('find.seedSearchStringFromSelection', "Controls whether the search string in the Find Widget is seeded from the editor selection.")
                },
                'editor.find.autoFindInSelection': {
                    type: 'string',
                    enum: ['never', 'always', 'multiline'],
                    default: defaults.autoFindInSelection,
                    enumDescriptions: [
                        nls.localize('editor.find.autoFindInSelection.never', 'Never turn on Find in Selection automatically (default).'),
                        nls.localize('editor.find.autoFindInSelection.always', 'Always turn on Find in Selection automatically.'),
                        nls.localize('editor.find.autoFindInSelection.multiline', 'Turn on Find in Selection automatically when multiple lines of content are selected.')
                    ],
                    description: nls.localize('find.autoFindInSelection', "Controls the condition for turning on Find in Selection automatically.")
                },
                'editor.find.globalFindClipboard': {
                    type: 'boolean',
                    default: defaults.globalFindClipboard,
                    description: nls.localize('find.globalFindClipboard', "Controls whether the Find Widget should read or modify the shared find clipboard on macOS."),
                    included: platform.isMacintosh
                },
                'editor.find.addExtraSpaceOnTop': {
                    type: 'boolean',
                    default: defaults.addExtraSpaceOnTop,
                    description: nls.localize('find.addExtraSpaceOnTop', "Controls whether the Find Widget should add extra lines on top of the editor. When true, you can scroll beyond the first line when the Find Widget is visible.")
                },
                'editor.find.loop': {
                    type: 'boolean',
                    default: defaults.loop,
                    description: nls.localize('find.loop', "Controls whether the search automatically restarts from the beginning (or the end) when no further matches can be found.")
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
                        description: nls.localize('fontLigatures', "Enables/Disables font ligatures ('calt' and 'liga' font features). Change this to a string for fine-grained control of the 'font-feature-settings' CSS property."),
                    },
                    {
                        type: 'string',
                        description: nls.localize('fontFeatureSettings', "Explicit 'font-feature-settings' CSS property. A boolean can be passed instead if one only needs to turn on/off ligatures.")
                    }
                ],
                description: nls.localize('fontLigaturesGeneral', "Configures font ligatures or font features. Can be either a boolean to enable/disable ligatures or a string for the value of the CSS 'font-feature-settings' property."),
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
                        description: nls.localize('fontVariations', "Enables/Disables the translation from font-weight to font-variation-settings. Change this to a string for fine-grained control of the 'font-variation-settings' CSS property."),
                    },
                    {
                        type: 'string',
                        description: nls.localize('fontVariationSettings', "Explicit 'font-variation-settings' CSS property. A boolean can be passed instead if one only needs to translate font-weight to font-variation-settings.")
                    }
                ],
                description: nls.localize('fontVariationsGeneral', "Configures font variations. Can be either a boolean to enable/disable the translation from font-weight to font-variation-settings or a string for the value of the CSS 'font-variation-settings' property."),
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
                description: nls.localize('fontSize', "Controls the font size in pixels.")
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
        static { this.SUGGESTION_VALUES = ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900']; }
        static { this.MINIMUM_VALUE = 1; }
        static { this.MAXIMUM_VALUE = 1000; }
        constructor() {
            super(53 /* EditorOption.fontWeight */, 'fontWeight', exports.EDITOR_FONT_DEFAULTS.fontWeight, {
                anyOf: [
                    {
                        type: 'number',
                        minimum: EditorFontWeight.MINIMUM_VALUE,
                        maximum: EditorFontWeight.MAXIMUM_VALUE,
                        errorMessage: nls.localize('fontWeightErrorMessage', "Only \"normal\" and \"bold\" keywords or numbers between 1 and 1000 are allowed.")
                    },
                    {
                        type: 'string',
                        pattern: '^(normal|bold|1000|[1-9][0-9]{0,2})$'
                    },
                    {
                        enum: EditorFontWeight.SUGGESTION_VALUES
                    }
                ],
                default: exports.EDITOR_FONT_DEFAULTS.fontWeight,
                description: nls.localize('fontWeight', "Controls the font weight. Accepts \"normal\" and \"bold\" keywords or numbers between 1 and 1000.")
            });
        }
        validate(input) {
            if (input === 'normal' || input === 'bold') {
                return input;
            }
            return String(EditorIntOption.clampedInt(input, exports.EDITOR_FONT_DEFAULTS.fontWeight, EditorFontWeight.MINIMUM_VALUE, EditorFontWeight.MAXIMUM_VALUE));
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
                    nls.localize('editor.gotoLocation.multiple.peek', 'Show Peek view of the results (default)'),
                    nls.localize('editor.gotoLocation.multiple.gotoAndPeek', 'Go to the primary result and show a Peek view'),
                    nls.localize('editor.gotoLocation.multiple.goto', 'Go to the primary result and enable Peek-less navigation to others')
                ]
            };
            const alternativeCommandOptions = ['', 'editor.action.referenceSearch.trigger', 'editor.action.goToReferences', 'editor.action.peekImplementation', 'editor.action.goToImplementation', 'editor.action.peekTypeDefinition', 'editor.action.goToTypeDefinition', 'editor.action.peekDeclaration', 'editor.action.revealDeclaration', 'editor.action.peekDefinition', 'editor.action.revealDefinitionAside', 'editor.action.revealDefinition'];
            super(58 /* EditorOption.gotoLocation */, 'gotoLocation', defaults, {
                'editor.gotoLocation.multiple': {
                    deprecationMessage: nls.localize('editor.gotoLocation.multiple.deprecated', "This setting is deprecated, please use separate settings like 'editor.editor.gotoLocation.multipleDefinitions' or 'editor.editor.gotoLocation.multipleImplementations' instead."),
                },
                'editor.gotoLocation.multipleDefinitions': {
                    description: nls.localize('editor.editor.gotoLocation.multipleDefinitions', "Controls the behavior the 'Go to Definition'-command when multiple target locations exist."),
                    ...jsonSubset,
                },
                'editor.gotoLocation.multipleTypeDefinitions': {
                    description: nls.localize('editor.editor.gotoLocation.multipleTypeDefinitions', "Controls the behavior the 'Go to Type Definition'-command when multiple target locations exist."),
                    ...jsonSubset,
                },
                'editor.gotoLocation.multipleDeclarations': {
                    description: nls.localize('editor.editor.gotoLocation.multipleDeclarations', "Controls the behavior the 'Go to Declaration'-command when multiple target locations exist."),
                    ...jsonSubset,
                },
                'editor.gotoLocation.multipleImplementations': {
                    description: nls.localize('editor.editor.gotoLocation.multipleImplemenattions', "Controls the behavior the 'Go to Implementations'-command when multiple target locations exist."),
                    ...jsonSubset,
                },
                'editor.gotoLocation.multipleReferences': {
                    description: nls.localize('editor.editor.gotoLocation.multipleReferences', "Controls the behavior the 'Go to References'-command when multiple target locations exist."),
                    ...jsonSubset,
                },
                'editor.gotoLocation.alternativeDefinitionCommand': {
                    type: 'string',
                    default: defaults.alternativeDefinitionCommand,
                    enum: alternativeCommandOptions,
                    description: nls.localize('alternativeDefinitionCommand', "Alternative command id that is being executed when the result of 'Go to Definition' is the current location.")
                },
                'editor.gotoLocation.alternativeTypeDefinitionCommand': {
                    type: 'string',
                    default: defaults.alternativeTypeDefinitionCommand,
                    enum: alternativeCommandOptions,
                    description: nls.localize('alternativeTypeDefinitionCommand', "Alternative command id that is being executed when the result of 'Go to Type Definition' is the current location.")
                },
                'editor.gotoLocation.alternativeDeclarationCommand': {
                    type: 'string',
                    default: defaults.alternativeDeclarationCommand,
                    enum: alternativeCommandOptions,
                    description: nls.localize('alternativeDeclarationCommand', "Alternative command id that is being executed when the result of 'Go to Declaration' is the current location.")
                },
                'editor.gotoLocation.alternativeImplementationCommand': {
                    type: 'string',
                    default: defaults.alternativeImplementationCommand,
                    enum: alternativeCommandOptions,
                    description: nls.localize('alternativeImplementationCommand', "Alternative command id that is being executed when the result of 'Go to Implementation' is the current location.")
                },
                'editor.gotoLocation.alternativeReferenceCommand': {
                    type: 'string',
                    default: defaults.alternativeReferenceCommand,
                    enum: alternativeCommandOptions,
                    description: nls.localize('alternativeReferenceCommand', "Alternative command id that is being executed when the result of 'Go to Reference' is the current location.")
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
                    description: nls.localize('hover.enabled', "Controls whether the hover is shown.")
                },
                'editor.hover.delay': {
                    type: 'number',
                    default: defaults.delay,
                    minimum: 0,
                    maximum: 10000,
                    description: nls.localize('hover.delay', "Controls the delay in milliseconds after which the hover is shown.")
                },
                'editor.hover.sticky': {
                    type: 'boolean',
                    default: defaults.sticky,
                    description: nls.localize('hover.sticky', "Controls whether the hover should remain visible when mouse is moved over it.")
                },
                'editor.hover.hidingDelay': {
                    type: 'integer',
                    minimum: 0,
                    default: defaults.hidingDelay,
                    description: nls.localize('hover.hidingDelay', "Controls the delay in milliseconds after thich the hover is hidden. Requires `editor.hover.sticky` to be enabled.")
                },
                'editor.hover.above': {
                    type: 'boolean',
                    default: defaults.above,
                    description: nls.localize('hover.above', "Prefer showing hovers above the line, if there's space.")
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
        static _computeMinimapLayout(input, memory) {
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
            const minimapLayout = EditorLayoutInfoComputer._computeMinimapLayout({
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
                        nls.localize('wrappingStrategy.simple', "Assumes that all characters are of the same width. This is a fast algorithm that works correctly for monospace fonts and certain scripts (like Latin characters) where glyphs are of equal width."),
                        nls.localize('wrappingStrategy.advanced', "Delegates wrapping points computation to the browser. This is a slow algorithm, that might cause freezes for large files, but it works correctly in all cases.")
                    ],
                    type: 'string',
                    enum: ['simple', 'advanced'],
                    default: 'simple',
                    description: nls.localize('wrappingStrategy', "Controls the algorithm that computes wrapping points. Note that when in accessibility mode, advanced will be used for the best experience.")
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
                    description: nls.localize('codeActions', "Enables the Code Action lightbulb in the editor.")
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
                    description: nls.localize('editor.stickyScroll.enabled', "Shows the nested current scopes during the scroll at the top of the editor.")
                },
                'editor.stickyScroll.maxLineCount': {
                    type: 'number',
                    default: defaults.maxLineCount,
                    minimum: 1,
                    maximum: 10,
                    description: nls.localize('editor.stickyScroll.maxLineCount', "Defines the maximum number of sticky lines to show.")
                },
                'editor.stickyScroll.defaultModel': {
                    type: 'string',
                    enum: ['outlineModel', 'foldingProviderModel', 'indentationModel'],
                    default: defaults.defaultModel,
                    description: nls.localize('editor.stickyScroll.defaultModel', "Defines the model to use for determining which lines to stick. If the outline model does not exist, it will fall back on the folding provider model which falls back on the indentation model. This order is respected in all three cases.")
                },
                'editor.stickyScroll.scrollWithEditor': {
                    type: 'boolean',
                    default: defaults.scrollWithEditor,
                    description: nls.localize('editor.stickyScroll.scrollWithEditor', "Enable scrolling of the sticky scroll widget with the editor's horizontal scrollbar.")
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
                    description: nls.localize('inlayHints.enable', "Enables the inlay hints in the editor."),
                    enum: ['on', 'onUnlessPressed', 'offUnlessPressed', 'off'],
                    markdownEnumDescriptions: [
                        nls.localize('editor.inlayHints.on', "Inlay hints are enabled"),
                        nls.localize('editor.inlayHints.onUnlessPressed', "Inlay hints are showing by default and hide when holding {0}", platform.isMacintosh ? `Ctrl+Option` : `Ctrl+Alt`),
                        nls.localize('editor.inlayHints.offUnlessPressed', "Inlay hints are hidden by default and show when holding {0}", platform.isMacintosh ? `Ctrl+Option` : `Ctrl+Alt`),
                        nls.localize('editor.inlayHints.off', "Inlay hints are disabled"),
                    ],
                },
                'editor.inlayHints.fontSize': {
                    type: 'number',
                    default: defaults.fontSize,
                    markdownDescription: nls.localize('inlayHints.fontSize', "Controls font size of inlay hints in the editor. As default the {0} is used when the configured value is less than {1} or greater than the editor font size.", '`#editor.fontSize#`', '`5`')
                },
                'editor.inlayHints.fontFamily': {
                    type: 'string',
                    default: defaults.fontFamily,
                    markdownDescription: nls.localize('inlayHints.fontFamily', "Controls font family of inlay hints in the editor. When set to empty, the {0} is used.", '`#editor.fontFamily#`')
                },
                'editor.inlayHints.padding': {
                    type: 'boolean',
                    default: defaults.padding,
                    description: nls.localize('inlayHints.padding', "Enables the padding around the inlay hints in the editor.")
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
            super(66 /* EditorOption.lineHeight */, 'lineHeight', exports.EDITOR_FONT_DEFAULTS.lineHeight, x => EditorFloatOption.clamp(x, 0, 150), { markdownDescription: nls.localize('lineHeight', "Controls the line height. \n - Use 0 to automatically compute the line height from the font size.\n - Values between 0 and 8 will be used as a multiplier with the font size.\n - Values greater than or equal to 8 will be used as effective values.") });
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
                    description: nls.localize('minimap.enabled', "Controls whether the minimap is shown.")
                },
                'editor.minimap.autohide': {
                    type: 'boolean',
                    default: defaults.autohide,
                    description: nls.localize('minimap.autohide', "Controls whether the minimap is hidden automatically.")
                },
                'editor.minimap.size': {
                    type: 'string',
                    enum: ['proportional', 'fill', 'fit'],
                    enumDescriptions: [
                        nls.localize('minimap.size.proportional', "The minimap has the same size as the editor contents (and might scroll)."),
                        nls.localize('minimap.size.fill', "The minimap will stretch or shrink as necessary to fill the height of the editor (no scrolling)."),
                        nls.localize('minimap.size.fit', "The minimap will shrink as necessary to never be larger than the editor (no scrolling)."),
                    ],
                    default: defaults.size,
                    description: nls.localize('minimap.size', "Controls the size of the minimap.")
                },
                'editor.minimap.side': {
                    type: 'string',
                    enum: ['left', 'right'],
                    default: defaults.side,
                    description: nls.localize('minimap.side', "Controls the side where to render the minimap.")
                },
                'editor.minimap.showSlider': {
                    type: 'string',
                    enum: ['always', 'mouseover'],
                    default: defaults.showSlider,
                    description: nls.localize('minimap.showSlider', "Controls when the minimap slider is shown.")
                },
                'editor.minimap.scale': {
                    type: 'number',
                    default: defaults.scale,
                    minimum: 1,
                    maximum: 3,
                    enum: [1, 2, 3],
                    description: nls.localize('minimap.scale', "Scale of content drawn in the minimap: 1, 2 or 3.")
                },
                'editor.minimap.renderCharacters': {
                    type: 'boolean',
                    default: defaults.renderCharacters,
                    description: nls.localize('minimap.renderCharacters', "Render the actual characters on a line as opposed to color blocks.")
                },
                'editor.minimap.maxColumn': {
                    type: 'number',
                    default: defaults.maxColumn,
                    description: nls.localize('minimap.maxColumn', "Limit the width of the minimap to render at most a certain number of columns.")
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
            return (platform.isMacintosh ? 'metaKey' : 'ctrlKey');
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
                    description: nls.localize('padding.top', "Controls the amount of space between the top edge of the editor and the first line.")
                },
                'editor.padding.bottom': {
                    type: 'number',
                    default: 0,
                    minimum: 0,
                    maximum: 1000,
                    description: nls.localize('padding.bottom', "Controls the amount of space between the bottom edge of the editor and the last line.")
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
                    description: nls.localize('parameterHints.enabled', "Enables a pop-up that shows parameter documentation and type information as you type.")
                },
                'editor.parameterHints.cycle': {
                    type: 'boolean',
                    default: defaults.cycle,
                    description: nls.localize('parameterHints.cycle', "Controls whether the parameter hints menu cycles or closes when reaching the end of the list.")
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
                    enumDescriptions: [nls.localize('on', "Quick suggestions show inside the suggest widget"), nls.localize('inline', "Quick suggestions show as ghost text"), nls.localize('off', "Quick suggestions are disabled")]
                }
            ];
            super(88 /* EditorOption.quickSuggestions */, 'quickSuggestions', defaults, {
                type: 'object',
                additionalProperties: false,
                properties: {
                    strings: {
                        anyOf: types,
                        default: defaults.strings,
                        description: nls.localize('quickSuggestions.strings', "Enable quick suggestions inside strings.")
                    },
                    comments: {
                        anyOf: types,
                        default: defaults.comments,
                        description: nls.localize('quickSuggestions.comments', "Enable quick suggestions inside comments.")
                    },
                    other: {
                        anyOf: types,
                        default: defaults.other,
                        description: nls.localize('quickSuggestions.other', "Enable quick suggestions outside of strings and comments.")
                    },
                },
                default: defaults,
                markdownDescription: nls.localize('quickSuggestions', "Controls whether suggestions should automatically show up while typing. This can be controlled for typing in comments, strings, and other code. Quick suggestion can be configured to show as ghost text or with the suggest widget. Also be aware of the '{0}'-setting which controls if suggestions are triggered by special characters.", `#editor.suggestOnTriggerCharacters#`)
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
                    nls.localize('lineNumbers.off', "Line numbers are not rendered."),
                    nls.localize('lineNumbers.on', "Line numbers are rendered as absolute number."),
                    nls.localize('lineNumbers.relative', "Line numbers are rendered as distance in lines to cursor position."),
                    nls.localize('lineNumbers.interval', "Line numbers are rendered every 10 lines.")
                ],
                default: 'on',
                description: nls.localize('lineNumbers', "Controls the display of line numbers.")
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
            const columnSchema = { type: 'number', description: nls.localize('rulers.size', "Number of monospace characters at which this editor ruler will render.") };
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
                                    description: nls.localize('rulers.color', "Color of this editor ruler."),
                                    format: 'color-hex'
                                }
                            }
                        }
                    ]
                },
                default: defaults,
                description: nls.localize('rulers', "Render vertical rulers after a certain number of monospace characters. Use multiple values for multiple rulers. No rulers are drawn if array is empty.")
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
                        nls.localize('scrollbar.vertical.auto', "The vertical scrollbar will be visible only when necessary."),
                        nls.localize('scrollbar.vertical.visible', "The vertical scrollbar will always be visible."),
                        nls.localize('scrollbar.vertical.fit', "The vertical scrollbar will always be hidden."),
                    ],
                    default: 'auto',
                    description: nls.localize('scrollbar.vertical', "Controls the visibility of the vertical scrollbar.")
                },
                'editor.scrollbar.horizontal': {
                    type: 'string',
                    enum: ['auto', 'visible', 'hidden'],
                    enumDescriptions: [
                        nls.localize('scrollbar.horizontal.auto', "The horizontal scrollbar will be visible only when necessary."),
                        nls.localize('scrollbar.horizontal.visible', "The horizontal scrollbar will always be visible."),
                        nls.localize('scrollbar.horizontal.fit', "The horizontal scrollbar will always be hidden."),
                    ],
                    default: 'auto',
                    description: nls.localize('scrollbar.horizontal', "Controls the visibility of the horizontal scrollbar.")
                },
                'editor.scrollbar.verticalScrollbarSize': {
                    type: 'number',
                    default: defaults.verticalScrollbarSize,
                    description: nls.localize('scrollbar.verticalScrollbarSize', "The width of the vertical scrollbar.")
                },
                'editor.scrollbar.horizontalScrollbarSize': {
                    type: 'number',
                    default: defaults.horizontalScrollbarSize,
                    description: nls.localize('scrollbar.horizontalScrollbarSize', "The height of the horizontal scrollbar.")
                },
                'editor.scrollbar.scrollByPage': {
                    type: 'boolean',
                    default: defaults.scrollByPage,
                    description: nls.localize('scrollbar.scrollByPage', "Controls whether clicks scroll by page or jump to click position.")
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
                    description: nls.localize('unicodeHighlight.nonBasicASCII', "Controls whether all non-basic ASCII characters are highlighted. Only characters between U+0020 and U+007E, tab, line-feed and carriage-return are considered basic ASCII.")
                },
                [exports.unicodeHighlightConfigKeys.invisibleCharacters]: {
                    restricted: true,
                    type: 'boolean',
                    default: defaults.invisibleCharacters,
                    description: nls.localize('unicodeHighlight.invisibleCharacters', "Controls whether characters that just reserve space or have no width at all are highlighted.")
                },
                [exports.unicodeHighlightConfigKeys.ambiguousCharacters]: {
                    restricted: true,
                    type: 'boolean',
                    default: defaults.ambiguousCharacters,
                    description: nls.localize('unicodeHighlight.ambiguousCharacters', "Controls whether characters are highlighted that can be confused with basic ASCII characters, except those that are common in the current user locale.")
                },
                [exports.unicodeHighlightConfigKeys.includeComments]: {
                    restricted: true,
                    type: ['boolean', 'string'],
                    enum: [true, false, exports.inUntrustedWorkspace],
                    default: defaults.includeComments,
                    description: nls.localize('unicodeHighlight.includeComments', "Controls whether characters in comments should also be subject to Unicode highlighting.")
                },
                [exports.unicodeHighlightConfigKeys.includeStrings]: {
                    restricted: true,
                    type: ['boolean', 'string'],
                    enum: [true, false, exports.inUntrustedWorkspace],
                    default: defaults.includeStrings,
                    description: nls.localize('unicodeHighlight.includeStrings', "Controls whether characters in strings should also be subject to Unicode highlighting.")
                },
                [exports.unicodeHighlightConfigKeys.allowedCharacters]: {
                    restricted: true,
                    type: 'object',
                    default: defaults.allowedCharacters,
                    description: nls.localize('unicodeHighlight.allowedCharacters', "Defines allowed characters that are not being highlighted."),
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
                    description: nls.localize('unicodeHighlight.allowedLocales', "Unicode characters that are common in allowed locales are not being highlighted.")
                },
            });
        }
        applyUpdate(value, update) {
            let didChange = false;
            if (update.allowedCharacters && value) {
                // Treat allowedCharacters atomically
                if (!objects.equals(value.allowedCharacters, update.allowedCharacters)) {
                    value = { ...value, allowedCharacters: update.allowedCharacters };
                    didChange = true;
                }
            }
            if (update.allowedLocales && value) {
                // Treat allowedLocales atomically
                if (!objects.equals(value.allowedLocales, update.allowedLocales)) {
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
                allowedCharacters: this.validateBooleanMap(_input.allowedCharacters, this.defaultValue.allowedCharacters),
                allowedLocales: this.validateBooleanMap(_input.allowedLocales, this.defaultValue.allowedLocales),
            };
        }
        validateBooleanMap(map, defaultValue) {
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
                    description: nls.localize('inlineSuggest.enabled', "Controls whether to automatically show inline suggestions in the editor.")
                },
                'editor.inlineSuggest.showToolbar': {
                    type: 'string',
                    default: defaults.showToolbar,
                    enum: ['always', 'onHover'],
                    enumDescriptions: [
                        nls.localize('inlineSuggest.showToolbar.always', "Show the inline suggestion toolbar whenever an inline suggestion is shown."),
                        nls.localize('inlineSuggest.showToolbar.onHover', "Show the inline suggestion toolbar when hovering over an inline suggestion."),
                    ],
                    description: nls.localize('inlineSuggest.showToolbar', "Controls when to show the inline suggestion toolbar."),
                },
                'editor.inlineSuggest.suppressSuggestions': {
                    type: 'boolean',
                    default: defaults.suppressSuggestions,
                    description: nls.localize('inlineSuggest.suppressSuggestions', "Controls how inline suggestions interact with the suggest widget. If enabled, the suggest widget is not shown automatically when inline suggestions are available.")
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
                enabled: textModelDefaults_1.EDITOR_MODEL_DEFAULTS.bracketPairColorizationOptions.enabled,
                independentColorPoolPerBracketType: textModelDefaults_1.EDITOR_MODEL_DEFAULTS.bracketPairColorizationOptions.independentColorPoolPerBracketType,
            };
            super(15 /* EditorOption.bracketPairColorization */, 'bracketPairColorization', defaults, {
                'editor.bracketPairColorization.enabled': {
                    type: 'boolean',
                    default: defaults.enabled,
                    markdownDescription: nls.localize('bracketPairColorization.enabled', "Controls whether bracket pair colorization is enabled or not. Use {0} to override the bracket highlight colors.", '`#workbench.colorCustomizations#`')
                },
                'editor.bracketPairColorization.independentColorPoolPerBracketType': {
                    type: 'boolean',
                    default: defaults.independentColorPoolPerBracketType,
                    description: nls.localize('bracketPairColorization.independentColorPoolPerBracketType', "Controls whether each bracket type has its own independent color pool.")
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
                        nls.localize('editor.guides.bracketPairs.true', "Enables bracket pair guides."),
                        nls.localize('editor.guides.bracketPairs.active', "Enables bracket pair guides only for the active bracket pair."),
                        nls.localize('editor.guides.bracketPairs.false', "Disables bracket pair guides."),
                    ],
                    default: defaults.bracketPairs,
                    description: nls.localize('editor.guides.bracketPairs', "Controls whether bracket pair guides are enabled or not.")
                },
                'editor.guides.bracketPairsHorizontal': {
                    type: ['boolean', 'string'],
                    enum: [true, 'active', false],
                    enumDescriptions: [
                        nls.localize('editor.guides.bracketPairsHorizontal.true', "Enables horizontal guides as addition to vertical bracket pair guides."),
                        nls.localize('editor.guides.bracketPairsHorizontal.active', "Enables horizontal guides only for the active bracket pair."),
                        nls.localize('editor.guides.bracketPairsHorizontal.false', "Disables horizontal bracket pair guides."),
                    ],
                    default: defaults.bracketPairsHorizontal,
                    description: nls.localize('editor.guides.bracketPairsHorizontal', "Controls whether horizontal bracket pair guides are enabled or not.")
                },
                'editor.guides.highlightActiveBracketPair': {
                    type: 'boolean',
                    default: defaults.highlightActiveBracketPair,
                    description: nls.localize('editor.guides.highlightActiveBracketPair', "Controls whether the editor should highlight the active bracket pair.")
                },
                'editor.guides.indentation': {
                    type: 'boolean',
                    default: defaults.indentation,
                    description: nls.localize('editor.guides.indentation', "Controls whether the editor should render indent guides.")
                },
                'editor.guides.highlightActiveIndentation': {
                    type: ['boolean', 'string'],
                    enum: [true, 'always', false],
                    enumDescriptions: [
                        nls.localize('editor.guides.highlightActiveIndentation.true', "Highlights the active indent guide."),
                        nls.localize('editor.guides.highlightActiveIndentation.always', "Highlights the active indent guide even if bracket guides are highlighted."),
                        nls.localize('editor.guides.highlightActiveIndentation.false', "Do not highlight the active indent guide."),
                    ],
                    default: defaults.highlightActiveIndentation,
                    description: nls.localize('editor.guides.highlightActiveIndentation', "Controls whether the editor should highlight the active indent guide.")
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
                        nls.localize('suggest.insertMode.insert', "Insert suggestion without overwriting text right of the cursor."),
                        nls.localize('suggest.insertMode.replace', "Insert suggestion and overwrite text right of the cursor."),
                    ],
                    default: defaults.insertMode,
                    description: nls.localize('suggest.insertMode', "Controls whether words are overwritten when accepting completions. Note that this depends on extensions opting into this feature.")
                },
                'editor.suggest.filterGraceful': {
                    type: 'boolean',
                    default: defaults.filterGraceful,
                    description: nls.localize('suggest.filterGraceful', "Controls whether filtering and sorting suggestions accounts for small typos.")
                },
                'editor.suggest.localityBonus': {
                    type: 'boolean',
                    default: defaults.localityBonus,
                    description: nls.localize('suggest.localityBonus', "Controls whether sorting favors words that appear close to the cursor.")
                },
                'editor.suggest.shareSuggestSelections': {
                    type: 'boolean',
                    default: defaults.shareSuggestSelections,
                    markdownDescription: nls.localize('suggest.shareSuggestSelections', "Controls whether remembered suggestion selections are shared between multiple workspaces and windows (needs `#editor.suggestSelection#`).")
                },
                'editor.suggest.selectionMode': {
                    type: 'string',
                    enum: ['always', 'never', 'whenTriggerCharacter', 'whenQuickSuggestion'],
                    enumDescriptions: [
                        nls.localize('suggest.insertMode.always', "Always select a suggestion when automatically triggering IntelliSense."),
                        nls.localize('suggest.insertMode.never', "Never select a suggestion when automatically triggering IntelliSense."),
                        nls.localize('suggest.insertMode.whenTriggerCharacter', "Select a suggestion only when triggering IntelliSense from a trigger character."),
                        nls.localize('suggest.insertMode.whenQuickSuggestion', "Select a suggestion only when triggering IntelliSense as you type."),
                    ],
                    default: defaults.selectionMode,
                    markdownDescription: nls.localize('suggest.selectionMode', "Controls whether a suggestion is selected when the widget shows. Note that this only applies to automatically triggered suggestions (`#editor.quickSuggestions#` and `#editor.suggestOnTriggerCharacters#`) and that a suggestion is always selected when explicitly invoked, e.g via `Ctrl+Space`.")
                },
                'editor.suggest.snippetsPreventQuickSuggestions': {
                    type: 'boolean',
                    default: defaults.snippetsPreventQuickSuggestions,
                    description: nls.localize('suggest.snippetsPreventQuickSuggestions', "Controls whether an active snippet prevents quick suggestions.")
                },
                'editor.suggest.showIcons': {
                    type: 'boolean',
                    default: defaults.showIcons,
                    description: nls.localize('suggest.showIcons', "Controls whether to show or hide icons in suggestions.")
                },
                'editor.suggest.showStatusBar': {
                    type: 'boolean',
                    default: defaults.showStatusBar,
                    description: nls.localize('suggest.showStatusBar', "Controls the visibility of the status bar at the bottom of the suggest widget.")
                },
                'editor.suggest.preview': {
                    type: 'boolean',
                    default: defaults.preview,
                    description: nls.localize('suggest.preview', "Controls whether to preview the suggestion outcome in the editor.")
                },
                'editor.suggest.showInlineDetails': {
                    type: 'boolean',
                    default: defaults.showInlineDetails,
                    description: nls.localize('suggest.showInlineDetails', "Controls whether suggest details show inline with the label or only in the details widget.")
                },
                'editor.suggest.maxVisibleSuggestions': {
                    type: 'number',
                    deprecationMessage: nls.localize('suggest.maxVisibleSuggestions.dep', "This setting is deprecated. The suggest widget can now be resized."),
                },
                'editor.suggest.filteredTypes': {
                    type: 'object',
                    deprecationMessage: nls.localize('deprecated', "This setting is deprecated, please use separate settings like 'editor.suggest.showKeywords' or 'editor.suggest.showSnippets' instead.")
                },
                'editor.suggest.showMethods': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showMethods', "When enabled IntelliSense shows `method`-suggestions.")
                },
                'editor.suggest.showFunctions': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showFunctions', "When enabled IntelliSense shows `function`-suggestions.")
                },
                'editor.suggest.showConstructors': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showConstructors', "When enabled IntelliSense shows `constructor`-suggestions.")
                },
                'editor.suggest.showDeprecated': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showDeprecated', "When enabled IntelliSense shows `deprecated`-suggestions.")
                },
                'editor.suggest.matchOnWordStartOnly': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.matchOnWordStartOnly', "When enabled IntelliSense filtering requires that the first character matches on a word start. For example, `c` on `Console` or `WebContext` but _not_ on `description`. When disabled IntelliSense will show more results but still sorts them by match quality.")
                },
                'editor.suggest.showFields': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showFields', "When enabled IntelliSense shows `field`-suggestions.")
                },
                'editor.suggest.showVariables': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showVariables', "When enabled IntelliSense shows `variable`-suggestions.")
                },
                'editor.suggest.showClasses': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showClasss', "When enabled IntelliSense shows `class`-suggestions.")
                },
                'editor.suggest.showStructs': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showStructs', "When enabled IntelliSense shows `struct`-suggestions.")
                },
                'editor.suggest.showInterfaces': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showInterfaces', "When enabled IntelliSense shows `interface`-suggestions.")
                },
                'editor.suggest.showModules': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showModules', "When enabled IntelliSense shows `module`-suggestions.")
                },
                'editor.suggest.showProperties': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showPropertys', "When enabled IntelliSense shows `property`-suggestions.")
                },
                'editor.suggest.showEvents': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showEvents', "When enabled IntelliSense shows `event`-suggestions.")
                },
                'editor.suggest.showOperators': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showOperators', "When enabled IntelliSense shows `operator`-suggestions.")
                },
                'editor.suggest.showUnits': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showUnits', "When enabled IntelliSense shows `unit`-suggestions.")
                },
                'editor.suggest.showValues': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showValues', "When enabled IntelliSense shows `value`-suggestions.")
                },
                'editor.suggest.showConstants': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showConstants', "When enabled IntelliSense shows `constant`-suggestions.")
                },
                'editor.suggest.showEnums': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showEnums', "When enabled IntelliSense shows `enum`-suggestions.")
                },
                'editor.suggest.showEnumMembers': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showEnumMembers', "When enabled IntelliSense shows `enumMember`-suggestions.")
                },
                'editor.suggest.showKeywords': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showKeywords', "When enabled IntelliSense shows `keyword`-suggestions.")
                },
                'editor.suggest.showWords': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showTexts', "When enabled IntelliSense shows `text`-suggestions.")
                },
                'editor.suggest.showColors': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showColors', "When enabled IntelliSense shows `color`-suggestions.")
                },
                'editor.suggest.showFiles': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showFiles', "When enabled IntelliSense shows `file`-suggestions.")
                },
                'editor.suggest.showReferences': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showReferences', "When enabled IntelliSense shows `reference`-suggestions.")
                },
                'editor.suggest.showCustomcolors': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showCustomcolors', "When enabled IntelliSense shows `customcolor`-suggestions.")
                },
                'editor.suggest.showFolders': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showFolders', "When enabled IntelliSense shows `folder`-suggestions.")
                },
                'editor.suggest.showTypeParameters': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showTypeParameters', "When enabled IntelliSense shows `typeParameter`-suggestions.")
                },
                'editor.suggest.showSnippets': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showSnippets', "When enabled IntelliSense shows `snippet`-suggestions.")
                },
                'editor.suggest.showUsers': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showUsers', "When enabled IntelliSense shows `user`-suggestions.")
                },
                'editor.suggest.showIssues': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize('editor.suggest.showIssues', "When enabled IntelliSense shows `issues`-suggestions.")
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
                    description: nls.localize('selectLeadingAndTrailingWhitespace', "Whether leading and trailing whitespace should always be selected."),
                    default: true,
                    type: 'boolean'
                },
                'editor.smartSelect.selectSubwords': {
                    description: nls.localize('selectSubwords', "Whether subwords (like 'foo' in 'fooBar' or 'foo_bar') should be selected."),
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
                        nls.localize('wrappingIndent.none', "No indentation. Wrapped lines begin at column 1."),
                        nls.localize('wrappingIndent.same', "Wrapped lines get the same indentation as the parent."),
                        nls.localize('wrappingIndent.indent', "Wrapped lines get +1 indentation toward the parent."),
                        nls.localize('wrappingIndent.deepIndent', "Wrapped lines get +2 indentation toward the parent."),
                    ],
                    description: nls.localize('wrappingIndent', "Controls the indentation of wrapped lines."),
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
                    markdownDescription: nls.localize('dropIntoEditor.enabled', "Controls whether you can drag and drop a file into a text editor by holding down `shift` (instead of opening the file in an editor)."),
                },
                'editor.dropIntoEditor.showDropSelector': {
                    type: 'string',
                    markdownDescription: nls.localize('dropIntoEditor.showDropSelector', "Controls if a widget is shown when dropping files into the editor. This widget lets you control how the file is dropped."),
                    enum: [
                        'afterDrop',
                        'never'
                    ],
                    enumDescriptions: [
                        nls.localize('dropIntoEditor.showDropSelector.afterDrop', "Show the drop selector widget after a file is dropped into the editor."),
                        nls.localize('dropIntoEditor.showDropSelector.never', "Never show the drop selector widget. Instead the default drop provider is always used."),
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
                    markdownDescription: nls.localize('pasteAs.enabled', "Controls whether you can paste content in different ways."),
                },
                'editor.pasteAs.showPasteSelector': {
                    type: 'string',
                    markdownDescription: nls.localize('pasteAs.showPasteSelector', "Controls if a widget is shown when pasting content in to the editor. This widget lets you control how the file is pasted."),
                    enum: [
                        'afterPaste',
                        'never'
                    ],
                    enumDescriptions: [
                        nls.localize('pasteAs.showPasteSelector.afterPaste', "Show the paste selector widget after content is pasted into the editor."),
                        nls.localize('pasteAs.showPasteSelector.never', "Never show the paste selector widget. Instead the default pasting behavior is always used."),
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
        fontFamily: (platform.isMacintosh ? DEFAULT_MAC_FONT_FAMILY : (platform.isLinux ? DEFAULT_LINUX_FONT_FAMILY : DEFAULT_WINDOWS_FONT_FAMILY)),
        fontWeight: 'normal',
        fontSize: (platform.isMacintosh ? 12 : 14),
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
        acceptSuggestionOnCommitCharacter: register(new EditorBooleanOption(0 /* EditorOption.acceptSuggestionOnCommitCharacter */, 'acceptSuggestionOnCommitCharacter', true, { markdownDescription: nls.localize('acceptSuggestionOnCommitCharacter', "Controls whether suggestions should be accepted on commit characters. For example, in JavaScript, the semi-colon (`;`) can be a commit character that accepts a suggestion and types that character.") })),
        acceptSuggestionOnEnter: register(new EditorStringEnumOption(1 /* EditorOption.acceptSuggestionOnEnter */, 'acceptSuggestionOnEnter', 'on', ['on', 'smart', 'off'], {
            markdownEnumDescriptions: [
                '',
                nls.localize('acceptSuggestionOnEnterSmart', "Only accept a suggestion with `Enter` when it makes a textual change."),
                ''
            ],
            markdownDescription: nls.localize('acceptSuggestionOnEnter', "Controls whether suggestions should be accepted on `Enter`, in addition to `Tab`. Helps to avoid ambiguity between inserting new lines or accepting suggestions.")
        })),
        accessibilitySupport: register(new EditorAccessibilitySupport()),
        accessibilityPageSize: register(new EditorIntOption(3 /* EditorOption.accessibilityPageSize */, 'accessibilityPageSize', 10, 1, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */, {
            description: nls.localize('accessibilityPageSize', "Controls the number of lines in the editor that can be read out by a screen reader at once. When we detect a screen reader we automatically set the default to be 500. Warning: this has a performance implication for numbers larger than the default."),
            tags: ['accessibility']
        })),
        ariaLabel: register(new EditorStringOption(4 /* EditorOption.ariaLabel */, 'ariaLabel', nls.localize('editorViewAccessibleLabel', "Editor content"))),
        ariaRequired: register(new EditorBooleanOption(5 /* EditorOption.ariaRequired */, 'ariaRequired', false, undefined)),
        screenReaderAnnounceInlineSuggestion: register(new EditorBooleanOption(8 /* EditorOption.screenReaderAnnounceInlineSuggestion */, 'screenReaderAnnounceInlineSuggestion', true, {
            description: nls.localize('screenReaderAnnounceInlineSuggestion', "Control whether inline suggestions are announced by a screen reader."),
            tags: ['accessibility']
        })),
        autoClosingBrackets: register(new EditorStringEnumOption(6 /* EditorOption.autoClosingBrackets */, 'autoClosingBrackets', 'languageDefined', ['always', 'languageDefined', 'beforeWhitespace', 'never'], {
            enumDescriptions: [
                '',
                nls.localize('editor.autoClosingBrackets.languageDefined', "Use language configurations to determine when to autoclose brackets."),
                nls.localize('editor.autoClosingBrackets.beforeWhitespace', "Autoclose brackets only when the cursor is to the left of whitespace."),
                '',
            ],
            description: nls.localize('autoClosingBrackets', "Controls whether the editor should automatically close brackets after the user adds an opening bracket.")
        })),
        autoClosingComments: register(new EditorStringEnumOption(7 /* EditorOption.autoClosingComments */, 'autoClosingComments', 'languageDefined', ['always', 'languageDefined', 'beforeWhitespace', 'never'], {
            enumDescriptions: [
                '',
                nls.localize('editor.autoClosingComments.languageDefined', "Use language configurations to determine when to autoclose comments."),
                nls.localize('editor.autoClosingComments.beforeWhitespace', "Autoclose comments only when the cursor is to the left of whitespace."),
                '',
            ],
            description: nls.localize('autoClosingComments', "Controls whether the editor should automatically close comments after the user adds an opening comment.")
        })),
        autoClosingDelete: register(new EditorStringEnumOption(9 /* EditorOption.autoClosingDelete */, 'autoClosingDelete', 'auto', ['always', 'auto', 'never'], {
            enumDescriptions: [
                '',
                nls.localize('editor.autoClosingDelete.auto', "Remove adjacent closing quotes or brackets only if they were automatically inserted."),
                '',
            ],
            description: nls.localize('autoClosingDelete', "Controls whether the editor should remove adjacent closing quotes or brackets when deleting.")
        })),
        autoClosingOvertype: register(new EditorStringEnumOption(10 /* EditorOption.autoClosingOvertype */, 'autoClosingOvertype', 'auto', ['always', 'auto', 'never'], {
            enumDescriptions: [
                '',
                nls.localize('editor.autoClosingOvertype.auto', "Type over closing quotes or brackets only if they were automatically inserted."),
                '',
            ],
            description: nls.localize('autoClosingOvertype', "Controls whether the editor should type over closing quotes or brackets.")
        })),
        autoClosingQuotes: register(new EditorStringEnumOption(11 /* EditorOption.autoClosingQuotes */, 'autoClosingQuotes', 'languageDefined', ['always', 'languageDefined', 'beforeWhitespace', 'never'], {
            enumDescriptions: [
                '',
                nls.localize('editor.autoClosingQuotes.languageDefined', "Use language configurations to determine when to autoclose quotes."),
                nls.localize('editor.autoClosingQuotes.beforeWhitespace', "Autoclose quotes only when the cursor is to the left of whitespace."),
                '',
            ],
            description: nls.localize('autoClosingQuotes', "Controls whether the editor should automatically close quotes after the user adds an opening quote.")
        })),
        autoIndent: register(new EditorEnumOption(12 /* EditorOption.autoIndent */, 'autoIndent', 4 /* EditorAutoIndentStrategy.Full */, 'full', ['none', 'keep', 'brackets', 'advanced', 'full'], _autoIndentFromString, {
            enumDescriptions: [
                nls.localize('editor.autoIndent.none', "The editor will not insert indentation automatically."),
                nls.localize('editor.autoIndent.keep', "The editor will keep the current line's indentation."),
                nls.localize('editor.autoIndent.brackets', "The editor will keep the current line's indentation and honor language defined brackets."),
                nls.localize('editor.autoIndent.advanced', "The editor will keep the current line's indentation, honor language defined brackets and invoke special onEnterRules defined by languages."),
                nls.localize('editor.autoIndent.full', "The editor will keep the current line's indentation, honor language defined brackets, invoke special onEnterRules defined by languages, and honor indentationRules defined by languages."),
            ],
            description: nls.localize('autoIndent', "Controls whether the editor should automatically adjust the indentation when users type, paste, move or indent lines.")
        })),
        automaticLayout: register(new EditorBooleanOption(13 /* EditorOption.automaticLayout */, 'automaticLayout', false)),
        autoSurround: register(new EditorStringEnumOption(14 /* EditorOption.autoSurround */, 'autoSurround', 'languageDefined', ['languageDefined', 'quotes', 'brackets', 'never'], {
            enumDescriptions: [
                nls.localize('editor.autoSurround.languageDefined', "Use language configurations to determine when to automatically surround selections."),
                nls.localize('editor.autoSurround.quotes', "Surround with quotes but not brackets."),
                nls.localize('editor.autoSurround.brackets', "Surround with brackets but not quotes."),
                ''
            ],
            description: nls.localize('autoSurround', "Controls whether the editor should automatically surround selections when typing quotes or brackets.")
        })),
        bracketPairColorization: register(new BracketPairColorization()),
        bracketPairGuides: register(new GuideOptions()),
        stickyTabStops: register(new EditorBooleanOption(115 /* EditorOption.stickyTabStops */, 'stickyTabStops', false, { description: nls.localize('stickyTabStops', "Emulate selection behavior of tab characters when using spaces for indentation. Selection will stick to tab stops.") })),
        codeLens: register(new EditorBooleanOption(17 /* EditorOption.codeLens */, 'codeLens', true, { description: nls.localize('codeLens', "Controls whether the editor shows CodeLens.") })),
        codeLensFontFamily: register(new EditorStringOption(18 /* EditorOption.codeLensFontFamily */, 'codeLensFontFamily', '', { description: nls.localize('codeLensFontFamily', "Controls the font family for CodeLens.") })),
        codeLensFontSize: register(new EditorIntOption(19 /* EditorOption.codeLensFontSize */, 'codeLensFontSize', 0, 0, 100, {
            type: 'number',
            default: 0,
            minimum: 0,
            maximum: 100,
            markdownDescription: nls.localize('codeLensFontSize', "Controls the font size in pixels for CodeLens. When set to 0, 90% of `#editor.fontSize#` is used.")
        })),
        colorDecorators: register(new EditorBooleanOption(20 /* EditorOption.colorDecorators */, 'colorDecorators', true, { description: nls.localize('colorDecorators', "Controls whether the editor should render the inline color decorators and color picker.") })),
        colorDecoratorActivatedOn: register(new EditorStringEnumOption(146 /* EditorOption.colorDecoratorsActivatedOn */, 'colorDecoratorsActivatedOn', 'clickAndHover', ['clickAndHover', 'hover', 'click'], {
            enumDescriptions: [
                nls.localize('editor.colorDecoratorActivatedOn.clickAndHover', "Make the color picker appear both on click and hover of the color decorator"),
                nls.localize('editor.colorDecoratorActivatedOn.hover', "Make the color picker appear on hover of the color decorator"),
                nls.localize('editor.colorDecoratorActivatedOn.click', "Make the color picker appear on click of the color decorator")
            ],
            description: nls.localize('colorDecoratorActivatedOn', "Controls the condition to make a color picker appear from a color decorator")
        })),
        colorDecoratorsLimit: register(new EditorIntOption(21 /* EditorOption.colorDecoratorsLimit */, 'colorDecoratorsLimit', 500, 1, 1000000, {
            markdownDescription: nls.localize('colorDecoratorsLimit', "Controls the max number of color decorators that can be rendered in an editor at once.")
        })),
        columnSelection: register(new EditorBooleanOption(22 /* EditorOption.columnSelection */, 'columnSelection', false, { description: nls.localize('columnSelection', "Enable that the selection with the mouse and keys is doing column selection.") })),
        comments: register(new EditorComments()),
        contextmenu: register(new EditorBooleanOption(24 /* EditorOption.contextmenu */, 'contextmenu', true)),
        copyWithSyntaxHighlighting: register(new EditorBooleanOption(25 /* EditorOption.copyWithSyntaxHighlighting */, 'copyWithSyntaxHighlighting', true, { description: nls.localize('copyWithSyntaxHighlighting', "Controls whether syntax highlighting should be copied into the clipboard.") })),
        cursorBlinking: register(new EditorEnumOption(26 /* EditorOption.cursorBlinking */, 'cursorBlinking', 1 /* TextEditorCursorBlinkingStyle.Blink */, 'blink', ['blink', 'smooth', 'phase', 'expand', 'solid'], _cursorBlinkingStyleFromString, { description: nls.localize('cursorBlinking', "Control the cursor animation style.") })),
        cursorSmoothCaretAnimation: register(new EditorStringEnumOption(27 /* EditorOption.cursorSmoothCaretAnimation */, 'cursorSmoothCaretAnimation', 'off', ['off', 'explicit', 'on'], {
            enumDescriptions: [
                nls.localize('cursorSmoothCaretAnimation.off', "Smooth caret animation is disabled."),
                nls.localize('cursorSmoothCaretAnimation.explicit', "Smooth caret animation is enabled only when the user moves the cursor with an explicit gesture."),
                nls.localize('cursorSmoothCaretAnimation.on', "Smooth caret animation is always enabled.")
            ],
            description: nls.localize('cursorSmoothCaretAnimation', "Controls whether the smooth caret animation should be enabled.")
        })),
        cursorStyle: register(new EditorEnumOption(28 /* EditorOption.cursorStyle */, 'cursorStyle', TextEditorCursorStyle.Line, 'line', ['line', 'block', 'underline', 'line-thin', 'block-outline', 'underline-thin'], _cursorStyleFromString, { description: nls.localize('cursorStyle', "Controls the cursor style.") })),
        cursorSurroundingLines: register(new EditorIntOption(29 /* EditorOption.cursorSurroundingLines */, 'cursorSurroundingLines', 0, 0, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */, { description: nls.localize('cursorSurroundingLines', "Controls the minimal number of visible leading lines (minimum 0) and trailing lines (minimum 1) surrounding the cursor. Known as 'scrollOff' or 'scrollOffset' in some other editors.") })),
        cursorSurroundingLinesStyle: register(new EditorStringEnumOption(30 /* EditorOption.cursorSurroundingLinesStyle */, 'cursorSurroundingLinesStyle', 'default', ['default', 'all'], {
            enumDescriptions: [
                nls.localize('cursorSurroundingLinesStyle.default', "`cursorSurroundingLines` is enforced only when triggered via the keyboard or API."),
                nls.localize('cursorSurroundingLinesStyle.all', "`cursorSurroundingLines` is enforced always.")
            ],
            markdownDescription: nls.localize('cursorSurroundingLinesStyle', "Controls when `#cursorSurroundingLines#` should be enforced.")
        })),
        cursorWidth: register(new EditorIntOption(31 /* EditorOption.cursorWidth */, 'cursorWidth', 0, 0, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */, { markdownDescription: nls.localize('cursorWidth', "Controls the width of the cursor when `#editor.cursorStyle#` is set to `line`.") })),
        disableLayerHinting: register(new EditorBooleanOption(32 /* EditorOption.disableLayerHinting */, 'disableLayerHinting', false)),
        disableMonospaceOptimizations: register(new EditorBooleanOption(33 /* EditorOption.disableMonospaceOptimizations */, 'disableMonospaceOptimizations', false)),
        domReadOnly: register(new EditorBooleanOption(34 /* EditorOption.domReadOnly */, 'domReadOnly', false)),
        dragAndDrop: register(new EditorBooleanOption(35 /* EditorOption.dragAndDrop */, 'dragAndDrop', true, { description: nls.localize('dragAndDrop', "Controls whether the editor should allow moving selections via drag and drop.") })),
        emptySelectionClipboard: register(new EditorEmptySelectionClipboard()),
        dropIntoEditor: register(new EditorDropIntoEditor()),
        stickyScroll: register(new EditorStickyScroll()),
        experimentalWhitespaceRendering: register(new EditorStringEnumOption(38 /* EditorOption.experimentalWhitespaceRendering */, 'experimentalWhitespaceRendering', 'svg', ['svg', 'font', 'off'], {
            enumDescriptions: [
                nls.localize('experimentalWhitespaceRendering.svg', "Use a new rendering method with svgs."),
                nls.localize('experimentalWhitespaceRendering.font', "Use a new rendering method with font characters."),
                nls.localize('experimentalWhitespaceRendering.off', "Use the stable rendering method."),
            ],
            description: nls.localize('experimentalWhitespaceRendering', "Controls whether whitespace is rendered with a new, experimental method.")
        })),
        extraEditorClassName: register(new EditorStringOption(39 /* EditorOption.extraEditorClassName */, 'extraEditorClassName', '')),
        fastScrollSensitivity: register(new EditorFloatOption(40 /* EditorOption.fastScrollSensitivity */, 'fastScrollSensitivity', 5, x => (x <= 0 ? 5 : x), { markdownDescription: nls.localize('fastScrollSensitivity', "Scrolling speed multiplier when pressing `Alt`.") })),
        find: register(new EditorFind()),
        fixedOverflowWidgets: register(new EditorBooleanOption(42 /* EditorOption.fixedOverflowWidgets */, 'fixedOverflowWidgets', false)),
        folding: register(new EditorBooleanOption(43 /* EditorOption.folding */, 'folding', true, { description: nls.localize('folding', "Controls whether the editor has code folding enabled.") })),
        foldingStrategy: register(new EditorStringEnumOption(44 /* EditorOption.foldingStrategy */, 'foldingStrategy', 'auto', ['auto', 'indentation'], {
            enumDescriptions: [
                nls.localize('foldingStrategy.auto', "Use a language-specific folding strategy if available, else the indentation-based one."),
                nls.localize('foldingStrategy.indentation', "Use the indentation-based folding strategy."),
            ],
            description: nls.localize('foldingStrategy', "Controls the strategy for computing folding ranges.")
        })),
        foldingHighlight: register(new EditorBooleanOption(45 /* EditorOption.foldingHighlight */, 'foldingHighlight', true, { description: nls.localize('foldingHighlight', "Controls whether the editor should highlight folded ranges.") })),
        foldingImportsByDefault: register(new EditorBooleanOption(46 /* EditorOption.foldingImportsByDefault */, 'foldingImportsByDefault', false, { description: nls.localize('foldingImportsByDefault', "Controls whether the editor automatically collapses import ranges.") })),
        foldingMaximumRegions: register(new EditorIntOption(47 /* EditorOption.foldingMaximumRegions */, 'foldingMaximumRegions', 5000, 10, 65000, // limit must be less than foldingRanges MAX_FOLDING_REGIONS
        { description: nls.localize('foldingMaximumRegions', "The maximum number of foldable regions. Increasing this value may result in the editor becoming less responsive when the current source has a large number of foldable regions.") })),
        unfoldOnClickAfterEndOfLine: register(new EditorBooleanOption(48 /* EditorOption.unfoldOnClickAfterEndOfLine */, 'unfoldOnClickAfterEndOfLine', false, { description: nls.localize('unfoldOnClickAfterEndOfLine', "Controls whether clicking on the empty content after a folded line will unfold the line.") })),
        fontFamily: register(new EditorStringOption(49 /* EditorOption.fontFamily */, 'fontFamily', exports.EDITOR_FONT_DEFAULTS.fontFamily, { description: nls.localize('fontFamily', "Controls the font family.") })),
        fontInfo: register(new EditorFontInfo()),
        fontLigatures2: register(new EditorFontLigatures()),
        fontSize: register(new EditorFontSize()),
        fontWeight: register(new EditorFontWeight()),
        fontVariations: register(new EditorFontVariations()),
        formatOnPaste: register(new EditorBooleanOption(55 /* EditorOption.formatOnPaste */, 'formatOnPaste', false, { description: nls.localize('formatOnPaste', "Controls whether the editor should automatically format the pasted content. A formatter must be available and the formatter should be able to format a range in a document.") })),
        formatOnType: register(new EditorBooleanOption(56 /* EditorOption.formatOnType */, 'formatOnType', false, { description: nls.localize('formatOnType', "Controls whether the editor should automatically format the line after typing.") })),
        glyphMargin: register(new EditorBooleanOption(57 /* EditorOption.glyphMargin */, 'glyphMargin', true, { description: nls.localize('glyphMargin', "Controls whether the editor should render the vertical glyph margin. Glyph margin is mostly used for debugging.") })),
        gotoLocation: register(new EditorGoToLocation()),
        hideCursorInOverviewRuler: register(new EditorBooleanOption(59 /* EditorOption.hideCursorInOverviewRuler */, 'hideCursorInOverviewRuler', false, { description: nls.localize('hideCursorInOverviewRuler', "Controls whether the cursor should be hidden in the overview ruler.") })),
        hover: register(new EditorHover()),
        inDiffEditor: register(new EditorBooleanOption(61 /* EditorOption.inDiffEditor */, 'inDiffEditor', false)),
        letterSpacing: register(new EditorFloatOption(63 /* EditorOption.letterSpacing */, 'letterSpacing', exports.EDITOR_FONT_DEFAULTS.letterSpacing, x => EditorFloatOption.clamp(x, -5, 20), { description: nls.localize('letterSpacing', "Controls the letter spacing in pixels.") })),
        lightbulb: register(new EditorLightbulb()),
        lineDecorationsWidth: register(new EditorLineDecorationsWidth()),
        lineHeight: register(new EditorLineHeight()),
        lineNumbers: register(new EditorRenderLineNumbersOption()),
        lineNumbersMinChars: register(new EditorIntOption(68 /* EditorOption.lineNumbersMinChars */, 'lineNumbersMinChars', 5, 1, 300)),
        linkedEditing: register(new EditorBooleanOption(69 /* EditorOption.linkedEditing */, 'linkedEditing', false, { description: nls.localize('linkedEditing', "Controls whether the editor has linked editing enabled. Depending on the language, related symbols such as HTML tags, are updated while editing.") })),
        links: register(new EditorBooleanOption(70 /* EditorOption.links */, 'links', true, { description: nls.localize('links', "Controls whether the editor should detect links and make them clickable.") })),
        matchBrackets: register(new EditorStringEnumOption(71 /* EditorOption.matchBrackets */, 'matchBrackets', 'always', ['always', 'near', 'never'], { description: nls.localize('matchBrackets', "Highlight matching brackets.") })),
        minimap: register(new EditorMinimap()),
        mouseStyle: register(new EditorStringEnumOption(73 /* EditorOption.mouseStyle */, 'mouseStyle', 'text', ['text', 'default', 'copy'])),
        mouseWheelScrollSensitivity: register(new EditorFloatOption(74 /* EditorOption.mouseWheelScrollSensitivity */, 'mouseWheelScrollSensitivity', 1, x => (x === 0 ? 1 : x), { markdownDescription: nls.localize('mouseWheelScrollSensitivity', "A multiplier to be used on the `deltaX` and `deltaY` of mouse wheel scroll events.") })),
        mouseWheelZoom: register(new EditorBooleanOption(75 /* EditorOption.mouseWheelZoom */, 'mouseWheelZoom', false, { markdownDescription: nls.localize('mouseWheelZoom', "Zoom the font of the editor when using mouse wheel and holding `Ctrl`.") })),
        multiCursorMergeOverlapping: register(new EditorBooleanOption(76 /* EditorOption.multiCursorMergeOverlapping */, 'multiCursorMergeOverlapping', true, { description: nls.localize('multiCursorMergeOverlapping', "Merge multiple cursors when they are overlapping.") })),
        multiCursorModifier: register(new EditorEnumOption(77 /* EditorOption.multiCursorModifier */, 'multiCursorModifier', 'altKey', 'alt', ['ctrlCmd', 'alt'], _multiCursorModifierFromString, {
            markdownEnumDescriptions: [
                nls.localize('multiCursorModifier.ctrlCmd', "Maps to `Control` on Windows and Linux and to `Command` on macOS."),
                nls.localize('multiCursorModifier.alt', "Maps to `Alt` on Windows and Linux and to `Option` on macOS.")
            ],
            markdownDescription: nls.localize({
                key: 'multiCursorModifier',
                comment: [
                    '- `ctrlCmd` refers to a value the setting can take and should not be localized.',
                    '- `Control` and `Command` refer to the modifier keys Ctrl or Cmd on the keyboard and can be localized.'
                ]
            }, "The modifier to be used to add multiple cursors with the mouse. The Go to Definition and Open Link mouse gestures will adapt such that they do not conflict with the [multicursor modifier](https://code.visualstudio.com/docs/editor/codebasics#_multicursor-modifier).")
        })),
        multiCursorPaste: register(new EditorStringEnumOption(78 /* EditorOption.multiCursorPaste */, 'multiCursorPaste', 'spread', ['spread', 'full'], {
            markdownEnumDescriptions: [
                nls.localize('multiCursorPaste.spread', "Each cursor pastes a single line of the text."),
                nls.localize('multiCursorPaste.full', "Each cursor pastes the full text.")
            ],
            markdownDescription: nls.localize('multiCursorPaste', "Controls pasting when the line count of the pasted text matches the cursor count.")
        })),
        multiCursorLimit: register(new EditorIntOption(79 /* EditorOption.multiCursorLimit */, 'multiCursorLimit', 10000, 1, 100000, {
            markdownDescription: nls.localize('multiCursorLimit', "Controls the max number of cursors that can be in an active editor at once.")
        })),
        occurrencesHighlight: register(new EditorBooleanOption(80 /* EditorOption.occurrencesHighlight */, 'occurrencesHighlight', true, { description: nls.localize('occurrencesHighlight', "Controls whether the editor should highlight semantic symbol occurrences.") })),
        overviewRulerBorder: register(new EditorBooleanOption(81 /* EditorOption.overviewRulerBorder */, 'overviewRulerBorder', true, { description: nls.localize('overviewRulerBorder', "Controls whether a border should be drawn around the overview ruler.") })),
        overviewRulerLanes: register(new EditorIntOption(82 /* EditorOption.overviewRulerLanes */, 'overviewRulerLanes', 3, 0, 3)),
        padding: register(new EditorPadding()),
        pasteAs: register(new EditorPasteAs()),
        parameterHints: register(new EditorParameterHints()),
        peekWidgetDefaultFocus: register(new EditorStringEnumOption(86 /* EditorOption.peekWidgetDefaultFocus */, 'peekWidgetDefaultFocus', 'tree', ['tree', 'editor'], {
            enumDescriptions: [
                nls.localize('peekWidgetDefaultFocus.tree', "Focus the tree when opening peek"),
                nls.localize('peekWidgetDefaultFocus.editor', "Focus the editor when opening peek")
            ],
            description: nls.localize('peekWidgetDefaultFocus', "Controls whether to focus the inline editor or the tree in the peek widget.")
        })),
        definitionLinkOpensInPeek: register(new EditorBooleanOption(87 /* EditorOption.definitionLinkOpensInPeek */, 'definitionLinkOpensInPeek', false, { description: nls.localize('definitionLinkOpensInPeek', "Controls whether the Go to Definition mouse gesture always opens the peek widget.") })),
        quickSuggestions: register(new EditorQuickSuggestions()),
        quickSuggestionsDelay: register(new EditorIntOption(89 /* EditorOption.quickSuggestionsDelay */, 'quickSuggestionsDelay', 10, 0, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */, { description: nls.localize('quickSuggestionsDelay', "Controls the delay in milliseconds after which quick suggestions will show up.") })),
        readOnly: register(new EditorBooleanOption(90 /* EditorOption.readOnly */, 'readOnly', false)),
        readOnlyMessage: register(new ReadonlyMessage()),
        renameOnType: register(new EditorBooleanOption(92 /* EditorOption.renameOnType */, 'renameOnType', false, { description: nls.localize('renameOnType', "Controls whether the editor auto renames on type."), markdownDeprecationMessage: nls.localize('renameOnTypeDeprecate', "Deprecated, use `editor.linkedEditing` instead.") })),
        renderControlCharacters: register(new EditorBooleanOption(93 /* EditorOption.renderControlCharacters */, 'renderControlCharacters', true, { description: nls.localize('renderControlCharacters', "Controls whether the editor should render control characters."), restricted: true })),
        renderFinalNewline: register(new EditorStringEnumOption(94 /* EditorOption.renderFinalNewline */, 'renderFinalNewline', (platform.isLinux ? 'dimmed' : 'on'), ['off', 'on', 'dimmed'], { description: nls.localize('renderFinalNewline', "Render last line number when the file ends with a newline.") })),
        renderLineHighlight: register(new EditorStringEnumOption(95 /* EditorOption.renderLineHighlight */, 'renderLineHighlight', 'line', ['none', 'gutter', 'line', 'all'], {
            enumDescriptions: [
                '',
                '',
                '',
                nls.localize('renderLineHighlight.all', "Highlights both the gutter and the current line."),
            ],
            description: nls.localize('renderLineHighlight', "Controls how the editor should render the current line highlight.")
        })),
        renderLineHighlightOnlyWhenFocus: register(new EditorBooleanOption(96 /* EditorOption.renderLineHighlightOnlyWhenFocus */, 'renderLineHighlightOnlyWhenFocus', false, { description: nls.localize('renderLineHighlightOnlyWhenFocus', "Controls if the editor should render the current line highlight only when the editor is focused.") })),
        renderValidationDecorations: register(new EditorStringEnumOption(97 /* EditorOption.renderValidationDecorations */, 'renderValidationDecorations', 'editable', ['editable', 'on', 'off'])),
        renderWhitespace: register(new EditorStringEnumOption(98 /* EditorOption.renderWhitespace */, 'renderWhitespace', 'selection', ['none', 'boundary', 'selection', 'trailing', 'all'], {
            enumDescriptions: [
                '',
                nls.localize('renderWhitespace.boundary', "Render whitespace characters except for single spaces between words."),
                nls.localize('renderWhitespace.selection', "Render whitespace characters only on selected text."),
                nls.localize('renderWhitespace.trailing', "Render only trailing whitespace characters."),
                ''
            ],
            description: nls.localize('renderWhitespace', "Controls how the editor should render whitespace characters.")
        })),
        revealHorizontalRightPadding: register(new EditorIntOption(99 /* EditorOption.revealHorizontalRightPadding */, 'revealHorizontalRightPadding', 15, 0, 1000)),
        roundedSelection: register(new EditorBooleanOption(100 /* EditorOption.roundedSelection */, 'roundedSelection', true, { description: nls.localize('roundedSelection', "Controls whether selections should have rounded corners.") })),
        rulers: register(new EditorRulers()),
        scrollbar: register(new EditorScrollbar()),
        scrollBeyondLastColumn: register(new EditorIntOption(103 /* EditorOption.scrollBeyondLastColumn */, 'scrollBeyondLastColumn', 4, 0, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */, { description: nls.localize('scrollBeyondLastColumn', "Controls the number of extra characters beyond which the editor will scroll horizontally.") })),
        scrollBeyondLastLine: register(new EditorBooleanOption(104 /* EditorOption.scrollBeyondLastLine */, 'scrollBeyondLastLine', true, { description: nls.localize('scrollBeyondLastLine', "Controls whether the editor will scroll beyond the last line.") })),
        scrollPredominantAxis: register(new EditorBooleanOption(105 /* EditorOption.scrollPredominantAxis */, 'scrollPredominantAxis', true, { description: nls.localize('scrollPredominantAxis', "Scroll only along the predominant axis when scrolling both vertically and horizontally at the same time. Prevents horizontal drift when scrolling vertically on a trackpad.") })),
        selectionClipboard: register(new EditorBooleanOption(106 /* EditorOption.selectionClipboard */, 'selectionClipboard', true, {
            description: nls.localize('selectionClipboard', "Controls whether the Linux primary clipboard should be supported."),
            included: platform.isLinux
        })),
        selectionHighlight: register(new EditorBooleanOption(107 /* EditorOption.selectionHighlight */, 'selectionHighlight', true, { description: nls.localize('selectionHighlight', "Controls whether the editor should highlight matches similar to the selection.") })),
        selectOnLineNumbers: register(new EditorBooleanOption(108 /* EditorOption.selectOnLineNumbers */, 'selectOnLineNumbers', true)),
        showFoldingControls: register(new EditorStringEnumOption(109 /* EditorOption.showFoldingControls */, 'showFoldingControls', 'mouseover', ['always', 'never', 'mouseover'], {
            enumDescriptions: [
                nls.localize('showFoldingControls.always', "Always show the folding controls."),
                nls.localize('showFoldingControls.never', "Never show the folding controls and reduce the gutter size."),
                nls.localize('showFoldingControls.mouseover', "Only show the folding controls when the mouse is over the gutter."),
            ],
            description: nls.localize('showFoldingControls', "Controls when the folding controls on the gutter are shown.")
        })),
        showUnused: register(new EditorBooleanOption(110 /* EditorOption.showUnused */, 'showUnused', true, { description: nls.localize('showUnused', "Controls fading out of unused code.") })),
        showDeprecated: register(new EditorBooleanOption(138 /* EditorOption.showDeprecated */, 'showDeprecated', true, { description: nls.localize('showDeprecated', "Controls strikethrough deprecated variables.") })),
        inlayHints: register(new EditorInlayHints()),
        snippetSuggestions: register(new EditorStringEnumOption(111 /* EditorOption.snippetSuggestions */, 'snippetSuggestions', 'inline', ['top', 'bottom', 'inline', 'none'], {
            enumDescriptions: [
                nls.localize('snippetSuggestions.top', "Show snippet suggestions on top of other suggestions."),
                nls.localize('snippetSuggestions.bottom', "Show snippet suggestions below other suggestions."),
                nls.localize('snippetSuggestions.inline', "Show snippets suggestions with other suggestions."),
                nls.localize('snippetSuggestions.none', "Do not show snippet suggestions."),
            ],
            description: nls.localize('snippetSuggestions', "Controls whether snippets are shown with other suggestions and how they are sorted.")
        })),
        smartSelect: register(new SmartSelect()),
        smoothScrolling: register(new EditorBooleanOption(113 /* EditorOption.smoothScrolling */, 'smoothScrolling', false, { description: nls.localize('smoothScrolling', "Controls whether the editor will scroll using an animation.") })),
        stopRenderingLineAfter: register(new EditorIntOption(116 /* EditorOption.stopRenderingLineAfter */, 'stopRenderingLineAfter', 10000, -1, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */)),
        suggest: register(new EditorSuggest()),
        inlineSuggest: register(new InlineEditorSuggest()),
        inlineCompletionsAccessibilityVerbose: register(new EditorBooleanOption(147 /* EditorOption.inlineCompletionsAccessibilityVerbose */, 'inlineCompletionsAccessibilityVerbose', false, { description: nls.localize('inlineCompletionsAccessibilityVerbose', "Controls whether the accessibility hint should be provided to screen reader users when an inline completion is shown.") })),
        suggestFontSize: register(new EditorIntOption(118 /* EditorOption.suggestFontSize */, 'suggestFontSize', 0, 0, 1000, { markdownDescription: nls.localize('suggestFontSize', "Font size for the suggest widget. When set to {0}, the value of {1} is used.", '`0`', '`#editor.fontSize#`') })),
        suggestLineHeight: register(new EditorIntOption(119 /* EditorOption.suggestLineHeight */, 'suggestLineHeight', 0, 0, 1000, { markdownDescription: nls.localize('suggestLineHeight', "Line height for the suggest widget. When set to {0}, the value of {1} is used. The minimum value is 8.", '`0`', '`#editor.lineHeight#`') })),
        suggestOnTriggerCharacters: register(new EditorBooleanOption(120 /* EditorOption.suggestOnTriggerCharacters */, 'suggestOnTriggerCharacters', true, { description: nls.localize('suggestOnTriggerCharacters', "Controls whether suggestions should automatically show up when typing trigger characters.") })),
        suggestSelection: register(new EditorStringEnumOption(121 /* EditorOption.suggestSelection */, 'suggestSelection', 'first', ['first', 'recentlyUsed', 'recentlyUsedByPrefix'], {
            markdownEnumDescriptions: [
                nls.localize('suggestSelection.first', "Always select the first suggestion."),
                nls.localize('suggestSelection.recentlyUsed', "Select recent suggestions unless further typing selects one, e.g. `console.| -> console.log` because `log` has been completed recently."),
                nls.localize('suggestSelection.recentlyUsedByPrefix', "Select suggestions based on previous prefixes that have completed those suggestions, e.g. `co -> console` and `con -> const`."),
            ],
            description: nls.localize('suggestSelection', "Controls how suggestions are pre-selected when showing the suggest list.")
        })),
        tabCompletion: register(new EditorStringEnumOption(122 /* EditorOption.tabCompletion */, 'tabCompletion', 'off', ['on', 'off', 'onlySnippets'], {
            enumDescriptions: [
                nls.localize('tabCompletion.on', "Tab complete will insert the best matching suggestion when pressing tab."),
                nls.localize('tabCompletion.off', "Disable tab completions."),
                nls.localize('tabCompletion.onlySnippets', "Tab complete snippets when their prefix match. Works best when 'quickSuggestions' aren't enabled."),
            ],
            description: nls.localize('tabCompletion', "Enables tab completions.")
        })),
        tabIndex: register(new EditorIntOption(123 /* EditorOption.tabIndex */, 'tabIndex', 0, -1, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */)),
        unicodeHighlight: register(new UnicodeHighlight()),
        unusualLineTerminators: register(new EditorStringEnumOption(125 /* EditorOption.unusualLineTerminators */, 'unusualLineTerminators', 'prompt', ['auto', 'off', 'prompt'], {
            enumDescriptions: [
                nls.localize('unusualLineTerminators.auto', "Unusual line terminators are automatically removed."),
                nls.localize('unusualLineTerminators.off', "Unusual line terminators are ignored."),
                nls.localize('unusualLineTerminators.prompt', "Unusual line terminators prompt to be removed."),
            ],
            description: nls.localize('unusualLineTerminators', "Remove unusual line terminators that might cause problems.")
        })),
        useShadowDOM: register(new EditorBooleanOption(126 /* EditorOption.useShadowDOM */, 'useShadowDOM', true)),
        useTabStops: register(new EditorBooleanOption(127 /* EditorOption.useTabStops */, 'useTabStops', true, { description: nls.localize('useTabStops', "Inserting and deleting whitespace follows tab stops.") })),
        wordBreak: register(new EditorStringEnumOption(128 /* EditorOption.wordBreak */, 'wordBreak', 'normal', ['normal', 'keepAll'], {
            markdownEnumDescriptions: [
                nls.localize('wordBreak.normal', "Use the default line break rule."),
                nls.localize('wordBreak.keepAll', "Word breaks should not be used for Chinese/Japanese/Korean (CJK) text. Non-CJK text behavior is the same as for normal."),
            ],
            description: nls.localize('wordBreak', "Controls the word break rules used for Chinese/Japanese/Korean (CJK) text.")
        })),
        wordSeparators: register(new EditorStringOption(129 /* EditorOption.wordSeparators */, 'wordSeparators', wordHelper_1.USUAL_WORD_SEPARATORS, { description: nls.localize('wordSeparators', "Characters that will be used as word separators when doing word related navigations or operations.") })),
        wordWrap: register(new EditorStringEnumOption(130 /* EditorOption.wordWrap */, 'wordWrap', 'off', ['off', 'on', 'wordWrapColumn', 'bounded'], {
            markdownEnumDescriptions: [
                nls.localize('wordWrap.off', "Lines will never wrap."),
                nls.localize('wordWrap.on', "Lines will wrap at the viewport width."),
                nls.localize({
                    key: 'wordWrap.wordWrapColumn',
                    comment: [
                        '- `editor.wordWrapColumn` refers to a different setting and should not be localized.'
                    ]
                }, "Lines will wrap at `#editor.wordWrapColumn#`."),
                nls.localize({
                    key: 'wordWrap.bounded',
                    comment: [
                        '- viewport means the edge of the visible window size.',
                        '- `editor.wordWrapColumn` refers to a different setting and should not be localized.'
                    ]
                }, "Lines will wrap at the minimum of viewport and `#editor.wordWrapColumn#`."),
            ],
            description: nls.localize({
                key: 'wordWrap',
                comment: [
                    '- \'off\', \'on\', \'wordWrapColumn\' and \'bounded\' refer to values the setting can take and should not be localized.',
                    '- `editor.wordWrapColumn` refers to a different setting and should not be localized.'
                ]
            }, "Controls how lines should wrap.")
        })),
        wordWrapBreakAfterCharacters: register(new EditorStringOption(131 /* EditorOption.wordWrapBreakAfterCharacters */, 'wordWrapBreakAfterCharacters', 
        // allow-any-unicode-next-line
        ' \t})]?|/&.,;¢°′″‰℃、。｡､￠，．：；？！％・･ゝゞヽヾーァィゥェォッャュョヮヵヶぁぃぅぇぉっゃゅょゎゕゖㇰㇱㇲㇳㇴㇵㇶㇷㇸㇹㇺㇻㇼㇽㇾㇿ々〻ｧｨｩｪｫｬｭｮｯｰ”〉》」』】〕）］｝｣')),
        wordWrapBreakBeforeCharacters: register(new EditorStringOption(132 /* EditorOption.wordWrapBreakBeforeCharacters */, 'wordWrapBreakBeforeCharacters', 
        // allow-any-unicode-next-line
        '([{‘“〈《「『【〔（［｛｢£¥＄￡￥+＋')),
        wordWrapColumn: register(new EditorIntOption(133 /* EditorOption.wordWrapColumn */, 'wordWrapColumn', 80, 1, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */, {
            markdownDescription: nls.localize({
                key: 'wordWrapColumn',
                comment: [
                    '- `editor.wordWrap` refers to a different setting and should not be localized.',
                    '- \'wordWrapColumn\' and \'bounded\' refer to values the different setting can take and should not be localized.'
                ]
            }, "Controls the wrapping column of the editor when `#editor.wordWrap#` is `wordWrapColumn` or `bounded`.")
        })),
        wordWrapOverride1: register(new EditorStringEnumOption(134 /* EditorOption.wordWrapOverride1 */, 'wordWrapOverride1', 'inherit', ['off', 'on', 'inherit'])),
        wordWrapOverride2: register(new EditorStringEnumOption(135 /* EditorOption.wordWrapOverride2 */, 'wordWrapOverride2', 'inherit', ['off', 'on', 'inherit'])),
        // Leave these at the end (because they have dependencies!)
        editorClassName: register(new EditorClassName()),
        defaultColorDecorators: register(new EditorBooleanOption(145 /* EditorOption.defaultColorDecorators */, 'defaultColorDecorators', false, { markdownDescription: nls.localize('defaultColorDecorators', "Controls whether inline color decorations should be shown using the default document color provider") })),
        pixelRatio: register(new EditorPixelRatio()),
        tabFocusMode: register(new EditorBooleanOption(142 /* EditorOption.tabFocusMode */, 'tabFocusMode', false, { markdownDescription: nls.localize('tabFocusMode', "Controls whether the editor receives tabs or defers them to the workbench for navigation.") })),
        layoutInfo: register(new EditorLayoutInfoComputer()),
        wrappingInfo: register(new EditorWrappingInfoComputer()),
        wrappingIndent: register(new WrappingIndentOption()),
        wrappingStrategy: register(new WrappingStrategy())
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yT3B0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vY29uZmlnL2VkaXRvck9wdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBaUNoRzs7T0FFRztJQUNILElBQWtCLHdCQU1qQjtJQU5ELFdBQWtCLHdCQUF3QjtRQUN6Qyx1RUFBUSxDQUFBO1FBQ1IsdUVBQVEsQ0FBQTtRQUNSLCtFQUFZLENBQUE7UUFDWiwrRUFBWSxDQUFBO1FBQ1osdUVBQVEsQ0FBQTtJQUNULENBQUMsRUFOaUIsd0JBQXdCLHdDQUF4Qix3QkFBd0IsUUFNekM7SUEwckJEOzs7T0FHRztJQUNVLFFBQUEsb0JBQW9CLEdBQUcsQ0FBQyxDQUFDO0lBMEh0QyxZQUFZO0lBRVo7O09BRUc7SUFDSCxNQUFhLHlCQUF5QjtRQUVyQzs7V0FFRztRQUNILFlBQVksTUFBaUI7WUFDNUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFDdkIsQ0FBQztRQUNNLFVBQVUsQ0FBQyxFQUFnQjtZQUNqQyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDekIsQ0FBQztLQUNEO0lBWEQsOERBV0M7SUE4QkQ7O09BRUc7SUFDSCxNQUFhLG9CQUFvQjtRQU1oQztZQUNDLElBQUksQ0FBQyx3QkFBd0IsR0FBRyxJQUFJLENBQUM7WUFDckMsSUFBSSxDQUFDLHdCQUF3QixHQUFHLENBQUMsQ0FBQztZQUNsQyxJQUFJLENBQUMsdUJBQXVCLEdBQUcsQ0FBQyxDQUFDO1FBQ2xDLENBQUM7S0FDRDtJQVhELG9EQVdDO0lBa0NEOztPQUVHO0lBQ0gsTUFBZSxnQkFBZ0I7UUFPOUIsWUFBWSxFQUFLLEVBQUUsSUFBd0IsRUFBRSxZQUFlLEVBQUUsTUFBd0Y7WUFDckosSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7WUFD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