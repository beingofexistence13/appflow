/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.migrateOptions = exports.EditorSettingMigration = void 0;
    class EditorSettingMigration {
        static { this.items = []; }
        constructor(key, migrate) {
            this.key = key;
            this.migrate = migrate;
        }
        apply(options) {
            const value = EditorSettingMigration._read(options, this.key);
            const read = (key) => EditorSettingMigration._read(options, key);
            const write = (key, value) => EditorSettingMigration._write(options, key, value);
            this.migrate(value, read, write);
        }
        static _read(source, key) {
            if (typeof source === 'undefined') {
                return undefined;
            }
            const firstDotIndex = key.indexOf('.');
            if (firstDotIndex >= 0) {
                const firstSegment = key.substring(0, firstDotIndex);
                return this._read(source[firstSegment], key.substring(firstDotIndex + 1));
            }
            return source[key];
        }
        static _write(target, key, value) {
            const firstDotIndex = key.indexOf('.');
            if (firstDotIndex >= 0) {
                const firstSegment = key.substring(0, firstDotIndex);
                target[firstSegment] = target[firstSegment] || {};
                this._write(target[firstSegment], key.substring(firstDotIndex + 1), value);
                return;
            }
            target[key] = value;
        }
    }
    exports.EditorSettingMigration = EditorSettingMigration;
    function registerEditorSettingMigration(key, migrate) {
        EditorSettingMigration.items.push(new EditorSettingMigration(key, migrate));
    }
    function registerSimpleEditorSettingMigration(key, values) {
        registerEditorSettingMigration(key, (value, read, write) => {
            if (typeof value !== 'undefined') {
                for (const [oldValue, newValue] of values) {
                    if (value === oldValue) {
                        write(key, newValue);
                        return;
                    }
                }
            }
        });
    }
    /**
     * Compatibility with old options
     */
    function migrateOptions(options) {
        EditorSettingMigration.items.forEach(migration => migration.apply(options));
    }
    exports.migrateOptions = migrateOptions;
    registerSimpleEditorSettingMigration('wordWrap', [[true, 'on'], [false, 'off']]);
    registerSimpleEditorSettingMigration('lineNumbers', [[true, 'on'], [false, 'off']]);
    registerSimpleEditorSettingMigration('cursorBlinking', [['visible', 'solid']]);
    registerSimpleEditorSettingMigration('renderWhitespace', [[true, 'boundary'], [false, 'none']]);
    registerSimpleEditorSettingMigration('renderLineHighlight', [[true, 'line'], [false, 'none']]);
    registerSimpleEditorSettingMigration('acceptSuggestionOnEnter', [[true, 'on'], [false, 'off']]);
    registerSimpleEditorSettingMigration('tabCompletion', [[false, 'off'], [true, 'onlySnippets']]);
    registerSimpleEditorSettingMigration('hover', [[true, { enabled: true }], [false, { enabled: false }]]);
    registerSimpleEditorSettingMigration('parameterHints', [[true, { enabled: true }], [false, { enabled: false }]]);
    registerSimpleEditorSettingMigration('autoIndent', [[false, 'advanced'], [true, 'full']]);
    registerSimpleEditorSettingMigration('matchBrackets', [[true, 'always'], [false, 'never']]);
    registerSimpleEditorSettingMigration('renderFinalNewline', [[true, 'on'], [false, 'off']]);
    registerSimpleEditorSettingMigration('cursorSmoothCaretAnimation', [[true, 'on'], [false, 'off']]);
    registerEditorSettingMigration('autoClosingBrackets', (value, read, write) => {
        if (value === false) {
            write('autoClosingBrackets', 'never');
            if (typeof read('autoClosingQuotes') === 'undefined') {
                write('autoClosingQuotes', 'never');
            }
            if (typeof read('autoSurround') === 'undefined') {
                write('autoSurround', 'never');
            }
        }
    });
    registerEditorSettingMigration('renderIndentGuides', (value, read, write) => {
        if (typeof value !== 'undefined') {
            write('renderIndentGuides', undefined);
            if (typeof read('guides.indentation') === 'undefined') {
                write('guides.indentation', !!value);
            }
        }
    });
    registerEditorSettingMigration('highlightActiveIndentGuide', (value, read, write) => {
        if (typeof value !== 'undefined') {
            write('highlightActiveIndentGuide', undefined);
            if (typeof read('guides.highlightActiveIndentation') === 'undefined') {
                write('guides.highlightActiveIndentation', !!value);
            }
        }
    });
    const suggestFilteredTypesMapping = {
        method: 'showMethods',
        function: 'showFunctions',
        constructor: 'showConstructors',
        deprecated: 'showDeprecated',
        field: 'showFields',
        variable: 'showVariables',
        class: 'showClasses',
        struct: 'showStructs',
        interface: 'showInterfaces',
        module: 'showModules',
        property: 'showProperties',
        event: 'showEvents',
        operator: 'showOperators',
        unit: 'showUnits',
        value: 'showValues',
        constant: 'showConstants',
        enum: 'showEnums',
        enumMember: 'showEnumMembers',
        keyword: 'showKeywords',
        text: 'showWords',
        color: 'showColors',
        file: 'showFiles',
        reference: 'showReferences',
        folder: 'showFolders',
        typeParameter: 'showTypeParameters',
        snippet: 'showSnippets',
    };
    registerEditorSettingMigration('suggest.filteredTypes', (value, read, write) => {
        if (value && typeof value === 'object') {
            for (const entry of Object.entries(suggestFilteredTypesMapping)) {
                const v = value[entry[0]];
                if (v === false) {
                    if (typeof read(`suggest.${entry[1]}`) === 'undefined') {
                        write(`suggest.${entry[1]}`, false);
                    }
                }
            }
            write('suggest.filteredTypes', undefined);
        }
    });
    registerEditorSettingMigration('quickSuggestions', (input, read, write) => {
        if (typeof input === 'boolean') {
            const value = input ? 'on' : 'off';
            const newValue = { comments: value, strings: value, other: value };
            write('quickSuggestions', newValue);
        }
    });
    // Sticky Scroll
    registerEditorSettingMigration('experimental.stickyScroll.enabled', (value, read, write) => {
        if (typeof value === 'boolean') {
            write('experimental.stickyScroll.enabled', undefined);
            if (typeof read('stickyScroll.enabled') === 'undefined') {
                write('stickyScroll.enabled', value);
            }
        }
    });
    registerEditorSettingMigration('experimental.stickyScroll.maxLineCount', (value, read, write) => {
        if (typeof value === 'number') {
            write('experimental.stickyScroll.maxLineCount', undefined);
            if (typeof read('stickyScroll.maxLineCount') === 'undefined') {
                write('stickyScroll.maxLineCount', value);
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlncmF0ZU9wdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvYnJvd3Nlci9jb25maWcvbWlncmF0ZU9wdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBWWhHLE1BQWEsc0JBQXNCO2lCQUVwQixVQUFLLEdBQTZCLEVBQUUsQ0FBQztRQUVuRCxZQUNpQixHQUFXLEVBQ1gsT0FBNEU7WUFENUUsUUFBRyxHQUFILEdBQUcsQ0FBUTtZQUNYLFlBQU8sR0FBUCxPQUFPLENBQXFFO1FBQ3pGLENBQUM7UUFFTCxLQUFLLENBQUMsT0FBWTtZQUNqQixNQUFNLEtBQUssR0FBRyxzQkFBc0IsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM5RCxNQUFNLElBQUksR0FBRyxDQUFDLEdBQVcsRUFBRSxFQUFFLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztZQUN6RSxNQUFNLEtBQUssR0FBRyxDQUFDLEdBQVcsRUFBRSxLQUFVLEVBQUUsRUFBRSxDQUFDLHNCQUFzQixDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzlGLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNsQyxDQUFDO1FBRU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFXLEVBQUUsR0FBVztZQUM1QyxJQUFJLE9BQU8sTUFBTSxLQUFLLFdBQVcsRUFBRTtnQkFDbEMsT0FBTyxTQUFTLENBQUM7YUFDakI7WUFFRCxNQUFNLGFBQWEsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZDLElBQUksYUFBYSxJQUFJLENBQUMsRUFBRTtnQkFDdkIsTUFBTSxZ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