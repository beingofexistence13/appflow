/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/theme/common/colorRegistry", "vs/css!./symbolIcons"], function (require, exports, nls_1, colorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SYMBOL_ICON_VARIABLE_FOREGROUND = exports.SYMBOL_ICON_UNIT_FOREGROUND = exports.SYMBOL_ICON_TYPEPARAMETER_FOREGROUND = exports.SYMBOL_ICON_TEXT_FOREGROUND = exports.SYMBOL_ICON_STRUCT_FOREGROUND = exports.SYMBOL_ICON_STRING_FOREGROUND = exports.SYMBOL_ICON_SNIPPET_FOREGROUND = exports.SYMBOL_ICON_REFERENCE_FOREGROUND = exports.SYMBOL_ICON_PROPERTY_FOREGROUND = exports.SYMBOL_ICON_PACKAGE_FOREGROUND = exports.SYMBOL_ICON_OPERATOR_FOREGROUND = exports.SYMBOL_ICON_OBJECT_FOREGROUND = exports.SYMBOL_ICON_NUMBER_FOREGROUND = exports.SYMBOL_ICON_NULL_FOREGROUND = exports.SYMBOL_ICON_NAMESPACE_FOREGROUND = exports.SYMBOL_ICON_MODULE_FOREGROUND = exports.SYMBOL_ICON_METHOD_FOREGROUND = exports.SYMBOL_ICON_KEYWORD_FOREGROUND = exports.SYMBOL_ICON_KEY_FOREGROUND = exports.SYMBOL_ICON_INTERFACE_FOREGROUND = exports.SYMBOL_ICON_FUNCTION_FOREGROUND = exports.SYMBOL_ICON_FOLDER_FOREGROUND = exports.SYMBOL_ICON_FILE_FOREGROUND = exports.SYMBOL_ICON_FIELD_FOREGROUND = exports.SYMBOL_ICON_EVENT_FOREGROUND = exports.SYMBOL_ICON_ENUMERATOR_MEMBER_FOREGROUND = exports.SYMBOL_ICON_ENUMERATOR_FOREGROUND = exports.SYMBOL_ICON_CONSTRUCTOR_FOREGROUND = exports.SYMBOL_ICON_CONSTANT_FOREGROUND = exports.SYMBOL_ICON_COLOR_FOREGROUND = exports.SYMBOL_ICON_CLASS_FOREGROUND = exports.SYMBOL_ICON_BOOLEAN_FOREGROUND = exports.SYMBOL_ICON_ARRAY_FOREGROUND = void 0;
    exports.SYMBOL_ICON_ARRAY_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.arrayForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hcDark: colorRegistry_1.foreground,
        hcLight: colorRegistry_1.foreground,
    }, (0, nls_1.localize)('symbolIcon.arrayForeground', 'The foreground color for array symbols. These symbols appear in the outline, breadcrumb, and suggest widget.'));
    exports.SYMBOL_ICON_BOOLEAN_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.booleanForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hcDark: colorRegistry_1.foreground,
        hcLight: colorRegistry_1.foreground,
    }, (0, nls_1.localize)('symbolIcon.booleanForeground', 'The foreground color for boolean symbols. These symbols appear in the outline, breadcrumb, and suggest widget.'));
    exports.SYMBOL_ICON_CLASS_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.classForeground', {
        dark: '#EE9D28',
        light: '#D67E00',
        hcDark: '#EE9D28',
        hcLight: '#D67E00'
    }, (0, nls_1.localize)('symbolIcon.classForeground', 'The foreground color for class symbols. These symbols appear in the outline, breadcrumb, and suggest widget.'));
    exports.SYMBOL_ICON_COLOR_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.colorForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hcDark: colorRegistry_1.foreground,
        hcLight: colorRegistry_1.foreground
    }, (0, nls_1.localize)('symbolIcon.colorForeground', 'The foreground color for color symbols. These symbols appear in the outline, breadcrumb, and suggest widget.'));
    exports.SYMBOL_ICON_CONSTANT_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.constantForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hcDark: colorRegistry_1.foreground,
        hcLight: colorRegistry_1.foreground
    }, (0, nls_1.localize)('symbolIcon.constantForeground', 'The foreground color for constant symbols. These symbols appear in the outline, breadcrumb, and suggest widget.'));
    exports.SYMBOL_ICON_CONSTRUCTOR_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.constructorForeground', {
        dark: '#B180D7',
        light: '#652D90',
        hcDark: '#B180D7',
        hcLight: '#652D90'
    }, (0, nls_1.localize)('symbolIcon.constructorForeground', 'The foreground color for constructor symbols. These symbols appear in the outline, breadcrumb, and suggest widget.'));
    exports.SYMBOL_ICON_ENUMERATOR_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.enumeratorForeground', {
        dark: '#EE9D28',
        light: '#D67E00',
        hcDark: '#EE9D28',
        hcLight: '#D67E00'
    }, (0, nls_1.localize)('symbolIcon.enumeratorForeground', 'The foreground color for enumerator symbols. These symbols appear in the outline, breadcrumb, and suggest widget.'));
    exports.SYMBOL_ICON_ENUMERATOR_MEMBER_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.enumeratorMemberForeground', {
        dark: '#75BEFF',
        light: '#007ACC',
        hcDark: '#75BEFF',
        hcLight: '#007ACC'
    }, (0, nls_1.localize)('symbolIcon.enumeratorMemberForeground', 'The foreground color for enumerator member symbols. These symbols appear in the outline, breadcrumb, and suggest widget.'));
    exports.SYMBOL_ICON_EVENT_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.eventForeground', {
        dark: '#EE9D28',
        light: '#D67E00',
        hcDark: '#EE9D28',
        hcLight: '#D67E00'
    }, (0, nls_1.localize)('symbolIcon.eventForeground', 'The foreground color for event symbols. These symbols appear in the outline, breadcrumb, and suggest widget.'));
    exports.SYMBOL_ICON_FIELD_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.fieldForeground', {
        dark: '#75BEFF',
        light: '#007ACC',
        hcDark: '#75BEFF',
        hcLight: '#007ACC'
    }, (0, nls_1.localize)('symbolIcon.fieldForeground', 'The foreground color for field symbols. These symbols appear in the outline, breadcrumb, and suggest widget.'));
    exports.SYMBOL_ICON_FILE_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.fileForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hcDark: colorRegistry_1.foreground,
        hcLight: colorRegistry_1.foreground
    }, (0, nls_1.localize)('symbolIcon.fileForeground', 'The foreground color for file symbols. These symbols appear in the outline, breadcrumb, and suggest widget.'));
    exports.SYMBOL_ICON_FOLDER_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.folderForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hcDark: colorRegistry_1.foreground,
        hcLight: colorRegistry_1.foreground
    }, (0, nls_1.localize)('symbolIcon.folderForeground', 'The foreground color for folder symbols. These symbols appear in the outline, breadcrumb, and suggest widget.'));
    exports.SYMBOL_ICON_FUNCTION_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.functionForeground', {
        dark: '#B180D7',
        light: '#652D90',
        hcDark: '#B180D7',
        hcLight: '#652D90'
    }, (0, nls_1.localize)('symbolIcon.functionForeground', 'The foreground color for function symbols. These symbols appear in the outline, breadcrumb, and suggest widget.'));
    exports.SYMBOL_ICON_INTERFACE_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.interfaceForeground', {
        dark: '#75BEFF',
        light: '#007ACC',
        hcDark: '#75BEFF',
        hcLight: '#007ACC'
    }, (0, nls_1.localize)('symbolIcon.interfaceForeground', 'The foreground color for interface symbols. These symbols appear in the outline, breadcrumb, and suggest widget.'));
    exports.SYMBOL_ICON_KEY_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.keyForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hcDark: colorRegistry_1.foreground,
        hcLight: colorRegistry_1.foreground
    }, (0, nls_1.localize)('symbolIcon.keyForeground', 'The foreground color for key symbols. These symbols appear in the outline, breadcrumb, and suggest widget.'));
    exports.SYMBOL_ICON_KEYWORD_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.keywordForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hcDark: colorRegistry_1.foreground,
        hcLight: colorRegistry_1.foreground
    }, (0, nls_1.localize)('symbolIcon.keywordForeground', 'The foreground color for keyword symbols. These symbols appear in the outline, breadcrumb, and suggest widget.'));
    exports.SYMBOL_ICON_METHOD_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.methodForeground', {
        dark: '#B180D7',
        light: '#652D90',
        hcDark: '#B180D7',
        hcLight: '#652D90'
    }, (0, nls_1.localize)('symbolIcon.methodForeground', 'The foreground color for method symbols. These symbols appear in the outline, breadcrumb, and suggest widget.'));
    exports.SYMBOL_ICON_MODULE_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.moduleForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hcDark: colorRegistry_1.foreground,
        hcLight: colorRegistry_1.foreground
    }, (0, nls_1.localize)('symbolIcon.moduleForeground', 'The foreground color for module symbols. These symbols appear in the outline, breadcrumb, and suggest widget.'));
    exports.SYMBOL_ICON_NAMESPACE_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.namespaceForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hcDark: colorRegistry_1.foreground,
        hcLight: colorRegistry_1.foreground
    }, (0, nls_1.localize)('symbolIcon.namespaceForeground', 'The foreground color for namespace symbols. These symbols appear in the outline, breadcrumb, and suggest widget.'));
    exports.SYMBOL_ICON_NULL_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.nullForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hcDark: colorRegistry_1.foreground,
        hcLight: colorRegistry_1.foreground
    }, (0, nls_1.localize)('symbolIcon.nullForeground', 'The foreground color for null symbols. These symbols appear in the outline, breadcrumb, and suggest widget.'));
    exports.SYMBOL_ICON_NUMBER_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.numberForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hcDark: colorRegistry_1.foreground,
        hcLight: colorRegistry_1.foreground
    }, (0, nls_1.localize)('symbolIcon.numberForeground', 'The foreground color for number symbols. These symbols appear in the outline, breadcrumb, and suggest widget.'));
    exports.SYMBOL_ICON_OBJECT_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.objectForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hcDark: colorRegistry_1.foreground,
        hcLight: colorRegistry_1.foreground
    }, (0, nls_1.localize)('symbolIcon.objectForeground', 'The foreground color for object symbols. These symbols appear in the outline, breadcrumb, and suggest widget.'));
    exports.SYMBOL_ICON_OPERATOR_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.operatorForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hcDark: colorRegistry_1.foreground,
        hcLight: colorRegistry_1.foreground
    }, (0, nls_1.localize)('symbolIcon.operatorForeground', 'The foreground color for operator symbols. These symbols appear in the outline, breadcrumb, and suggest widget.'));
    exports.SYMBOL_ICON_PACKAGE_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.packageForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hcDark: colorRegistry_1.foreground,
        hcLight: colorRegistry_1.foreground
    }, (0, nls_1.localize)('symbolIcon.packageForeground', 'The foreground color for package symbols. These symbols appear in the outline, breadcrumb, and suggest widget.'));
    exports.SYMBOL_ICON_PROPERTY_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.propertyForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hcDark: colorRegistry_1.foreground,
        hcLight: colorRegistry_1.foreground
    }, (0, nls_1.localize)('symbolIcon.propertyForeground', 'The foreground color for property symbols. These symbols appear in the outline, breadcrumb, and suggest widget.'));
    exports.SYMBOL_ICON_REFERENCE_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.referenceForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hcDark: colorRegistry_1.foreground,
        hcLight: colorRegistry_1.foreground
    }, (0, nls_1.localize)('symbolIcon.referenceForeground', 'The foreground color for reference symbols. These symbols appear in the outline, breadcrumb, and suggest widget.'));
    exports.SYMBOL_ICON_SNIPPET_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.snippetForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hcDark: colorRegistry_1.foreground,
        hcLight: colorRegistry_1.foreground
    }, (0, nls_1.localize)('symbolIcon.snippetForeground', 'The foreground color for snippet symbols. These symbols appear in the outline, breadcrumb, and suggest widget.'));
    exports.SYMBOL_ICON_STRING_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.stringForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hcDark: colorRegistry_1.foreground,
        hcLight: colorRegistry_1.foreground
    }, (0, nls_1.localize)('symbolIcon.stringForeground', 'The foreground color for string symbols. These symbols appear in the outline, breadcrumb, and suggest widget.'));
    exports.SYMBOL_ICON_STRUCT_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.structForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hcDark: colorRegistry_1.foreground,
        hcLight: colorRegistry_1.foreground,
    }, (0, nls_1.localize)('symbolIcon.structForeground', 'The foreground color for struct symbols. These symbols appear in the outline, breadcrumb, and suggest widget.'));
    exports.SYMBOL_ICON_TEXT_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.textForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hcDark: colorRegistry_1.foreground,
        hcLight: colorRegistry_1.foreground
    }, (0, nls_1.localize)('symbolIcon.textForeground', 'The foreground color for text symbols. These symbols appear in the outline, breadcrumb, and suggest widget.'));
    exports.SYMBOL_ICON_TYPEPARAMETER_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.typeParameterForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hcDark: colorRegistry_1.foreground,
        hcLight: colorRegistry_1.foreground
    }, (0, nls_1.localize)('symbolIcon.typeParameterForeground', 'The foreground color for type parameter symbols. These symbols appear in the outline, breadcrumb, and suggest widget.'));
    exports.SYMBOL_ICON_UNIT_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.unitForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hcDark: colorRegistry_1.foreground,
        hcLight: colorRegistry_1.foreground
    }, (0, nls_1.localize)('symbolIcon.unitForeground', 'The foreground color for unit symbols. These symbols appear in the outline, breadcrumb, and suggest widget.'));
    exports.SYMBOL_ICON_VARIABLE_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.variableForeground', {
        dark: '#75BEFF',
        light: '#007ACC',
        hcDark: '#75BEFF',
        hcLight: '#007ACC',
    }, (0, nls_1.localize)('symbolIcon.variableForeground', 'The foreground color for variable symbols. These symbols appear in the outline, breadcrumb, and suggest widget.'));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3ltYm9sSWNvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9zeW1ib2xJY29ucy9icm93c2VyL3N5bWJvbEljb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU1uRixRQUFBLDRCQUE0QixHQUFHLElBQUEsNkJBQWEsRUFBQyw0QkFBNEIsRUFBRTtRQUN2RixJQUFJLEVBQUUsMEJBQVU7UUFDaEIsS0FBSyxFQUFFLDBCQUFVO1FBQ2pCLE1BQU0sRUFBRSwwQkFBVTtRQUNsQixPQUFPLEVBQUUsMEJBQVU7S0FDbkIsRUFBRSxJQUFBLGNBQVEsRUFBQyw0QkFBNEIsRUFBRSw4R0FBOEcsQ0FBQyxDQUFDLENBQUM7SUFFOUksUUFBQSw4QkFBOEIsR0FBRyxJQUFBLDZCQUFhLEVBQUMsOEJBQThCLEVBQUU7UUFDM0YsSUFBSSxFQUFFLDBCQUFVO1FBQ2hCLEtBQUssRUFBRSwwQkFBVTtRQUNqQixNQUFNLEVBQUUsMEJBQVU7UUFDbEIsT0FBTyxFQUFFLDBCQUFVO0tBQ25CLEVBQUUsSUFBQSxjQUFRLEVBQUMsOEJBQThCLEVBQUUsZ0hBQWdILENBQUMsQ0FBQyxDQUFDO0lBRWxKLFFBQUEsNEJBQTRCLEdBQUcsSUFBQSw2QkFBYSxFQUFDLDRCQUE0QixFQUFFO1FBQ3ZGLElBQUksRUFBRSxTQUFTO1FBQ2YsS0FBSyxFQUFFLFNBQVM7UUFDaEIsTUFBTSxFQUFFLFNBQVM7UUFDakIsT0FBTyxFQUFFLFNBQVM7S0FDbEIsRUFBRSxJQUFBLGNBQVEsRUFBQyw0QkFBNEIsRUFBRSw4R0FBOEcsQ0FBQyxDQUFDLENBQUM7SUFFOUksUUFBQSw0QkFBNEIsR0FBRyxJQUFBLDZCQUFhLEVBQUMsNEJBQTRCLEVBQUU7UUFDdkYsSUFBSSxFQUFFLDBCQUFVO1FBQ2hCLEtBQUssRUFBRSwwQkFBVTtRQUNqQixNQUFNLEVBQUUsMEJBQVU7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