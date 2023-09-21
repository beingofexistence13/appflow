define(["require", "exports", "vs/platform/theme/common/colorRegistry", "vs/base/common/color"], function (require, exports, colorRegistry_1, color_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getMenuStyles = exports.defaultMenuStyles = exports.getSelectBoxStyles = exports.defaultSelectBoxStyles = exports.getListStyles = exports.defaultListStyles = exports.getBreadcrumbsWidgetStyles = exports.defaultBreadcrumbsWidgetStyles = exports.getCountBadgeStyle = exports.defaultCountBadgeStyles = exports.defaultFindWidgetStyles = exports.getInputBoxStyle = exports.defaultInputBoxStyles = exports.getDialogStyle = exports.defaultDialogStyles = exports.getCheckboxStyles = exports.defaultCheckboxStyles = exports.getToggleStyles = exports.defaultToggleStyles = exports.getProgressBarStyles = exports.defaultProgressBarStyles = exports.getButtonStyles = exports.defaultButtonStyles = exports.getKeybindingLabelStyles = exports.defaultKeybindingLabelStyles = void 0;
    function overrideStyles(override, styles) {
        const result = { ...styles };
        for (const key in override) {
            const val = override[key];
            result[key] = val !== undefined ? (0, colorRegistry_1.asCssVariable)(val) : undefined;
        }
        return result;
    }
    exports.defaultKeybindingLabelStyles = {
        keybindingLabelBackground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.keybindingLabelBackground),
        keybindingLabelForeground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.keybindingLabelForeground),
        keybindingLabelBorder: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.keybindingLabelBorder),
        keybindingLabelBottomBorder: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.keybindingLabelBottomBorder),
        keybindingLabelShadow: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.widgetShadow)
    };
    function getKeybindingLabelStyles(override) {
        return overrideStyles(override, exports.defaultKeybindingLabelStyles);
    }
    exports.getKeybindingLabelStyles = getKeybindingLabelStyles;
    exports.defaultButtonStyles = {
        buttonForeground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.buttonForeground),
        buttonSeparator: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.buttonSeparator),
        buttonBackground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.buttonBackground),
        buttonHoverBackground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.buttonHoverBackground),
        buttonSecondaryForeground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.buttonSecondaryForeground),
        buttonSecondaryBackground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.buttonSecondaryBackground),
        buttonSecondaryHoverBackground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.buttonSecondaryHoverBackground),
        buttonBorder: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.buttonBorder),
    };
    function getButtonStyles(override) {
        return overrideStyles(override, exports.defaultButtonStyles);
    }
    exports.getButtonStyles = getButtonStyles;
    exports.defaultProgressBarStyles = {
        progressBarBackground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.progressBarBackground)
    };
    function getProgressBarStyles(override) {
        return overrideStyles(override, exports.defaultProgressBarStyles);
    }
    exports.getProgressBarStyles = getProgressBarStyles;
    exports.defaultToggleStyles = {
        inputActiveOptionBorder: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.inputActiveOptionBorder),
        inputActiveOptionForeground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.inputActiveOptionForeground),
        inputActiveOptionBackground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.inputActiveOptionBackground)
    };
    function getToggleStyles(override) {
        return overrideStyles(override, exports.defaultToggleStyles);
    }
    exports.getToggleStyles = getToggleStyles;
    exports.defaultCheckboxStyles = {
        checkboxBackground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.checkboxBackground),
        checkboxBorder: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.checkboxBorder),
        checkboxForeground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.checkboxForeground)
    };
    function getCheckboxStyles(override) {
        return overrideStyles(override, exports.defaultCheckboxStyles);
    }
    exports.getCheckboxStyles = getCheckboxStyles;
    exports.defaultDialogStyles = {
        dialogBackground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.editorWidgetBackground),
        dialogForeground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.editorWidgetForeground),
        dialogShadow: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.widgetShadow),
        dialogBorder: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.contrastBorder),
        errorIconForeground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.problemsErrorIconForeground),
        warningIconForeground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.problemsWarningIconForeground),
        infoIconForeground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.problemsInfoIconForeground),
        textLinkForeground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.textLinkForeground)
    };
    function getDialogStyle(override) {
        return overrideStyles(override, exports.defaultDialogStyles);
    }
    exports.getDialogStyle = getDialogStyle;
    exports.defaultInputBoxStyles = {
        inputBackground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.inputBackground),
        inputForeground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.inputForeground),
        inputBorder: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.inputBorder),
        inputValidationInfoBorder: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.inputValidationInfoBorder),
        inputValidationInfoBackground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.inputValidationInfoBackground),
        inputValidationInfoForeground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.inputValidationInfoForeground),
        inputValidationWarningBorder: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.inputValidationWarningBorder),
        inputValidationWarningBackground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.inputValidationWarningBackground),
        inputValidationWarningForeground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.inputValidationWarningForeground),
        inputValidationErrorBorder: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.inputValidationErrorBorder),
        inputValidationErrorBackground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.inputValidationErrorBackground),
        inputValidationErrorForeground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.inputValidationErrorForeground)
    };
    function getInputBoxStyle(override) {
        return overrideStyles(override, exports.defaultInputBoxStyles);
    }
    exports.getInputBoxStyle = getInputBoxStyle;
    exports.defaultFindWidgetStyles = {
        listFilterWidgetBackground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.listFilterWidgetBackground),
        listFilterWidgetOutline: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.listFilterWidgetOutline),
        listFilterWidgetNoMatchesOutline: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.listFilterWidgetNoMatchesOutline),
        listFilterWidgetShadow: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.listFilterWidgetShadow),
        inputBoxStyles: exports.defaultInputBoxStyles,
        toggleStyles: exports.defaultToggleStyles
    };
    exports.defaultCountBadgeStyles = {
        badgeBackground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.badgeBackground),
        badgeForeground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.badgeForeground),
        badgeBorder: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.contrastBorder)
    };
    function getCountBadgeStyle(override) {
        return overrideStyles(override, exports.defaultCountBadgeStyles);
    }
    exports.getCountBadgeStyle = getCountBadgeStyle;
    exports.defaultBreadcrumbsWidgetStyles = {
        breadcrumbsBackground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.breadcrumbsBackground),
        breadcrumbsForeground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.breadcrumbsForeground),
        breadcrumbsHoverForeground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.breadcrumbsFocusForeground),
        breadcrumbsFocusForeground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.breadcrumbsFocusForeground),
        breadcrumbsFocusAndSelectionForeground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.breadcrumbsActiveSelectionForeground)
    };
    function getBreadcrumbsWidgetStyles(override) {
        return overrideStyles(override, exports.defaultBreadcrumbsWidgetStyles);
    }
    exports.getBreadcrumbsWidgetStyles = getBreadcrumbsWidgetStyles;
    exports.defaultListStyles = {
        listBackground: undefined,
        listInactiveFocusForeground: undefined,
        listFocusBackground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.listFocusBackground),
        listFocusForeground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.listFocusForeground),
        listFocusOutline: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.listFocusOutline),
        listActiveSelectionBackground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.listActiveSelectionBackground),
        listActiveSelectionForeground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.listActiveSelectionForeground),
        listActiveSelectionIconForeground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.listActiveSelectionIconForeground),
        listFocusAndSelectionOutline: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.listFocusAndSelectionOutline),
        listFocusAndSelectionBackground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.listActiveSelectionBackground),
        listFocusAndSelectionForeground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.listActiveSelectionForeground),
        listInactiveSelectionBackground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.listInactiveSelectionBackground),
        listInactiveSelectionIconForeground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.listInactiveSelectionIconForeground),
        listInactiveSelectionForeground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.listInactiveSelectionForeground),
        listInactiveFocusBackground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.listInactiveFocusBackground),
        listInactiveFocusOutline: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.listInactiveFocusOutline),
        listHoverBackground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.listHoverBackground),
        listHoverForeground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.listHoverForeground),
        listDropBackground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.listDropBackground),
        listSelectionOutline: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.activeContrastBorder),
        listHoverOutline: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.activeContrastBorder),
        treeIndentGuidesStroke: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.treeIndentGuidesStroke),
        treeInactiveIndentGuidesStroke: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.treeInactiveIndentGuidesStroke),
        tableColumnsBorder: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.tableColumnsBorder),
        tableOddRowsBackgroundColor: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.tableOddRowsBackgroundColor),
    };
    function getListStyles(override) {
        return overrideStyles(override, exports.defaultListStyles);
    }
    exports.getListStyles = getListStyles;
    exports.defaultSelectBoxStyles = {
        selectBackground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.selectBackground),
        selectListBackground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.selectListBackground),
        selectForeground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.selectForeground),
        decoratorRightForeground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.pickerGroupForeground),
        selectBorder: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.selectBorder),
        focusBorder: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.focusBorder),
        listFocusBackground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.quickInputListFocusBackground),
        listInactiveSelectionIconForeground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.quickInputListFocusIconForeground),
        listFocusForeground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.quickInputListFocusForeground),
        listFocusOutline: (0, colorRegistry_1.asCssVariableWithDefault)(colorRegistry_1.activeContrastBorder, color_1.Color.transparent.toString()),
        listHoverBackground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.listHoverBackground),
        listHoverForeground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.listHoverForeground),
        listHoverOutline: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.activeContrastBorder),
        selectListBorder: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.editorWidgetBorder),
        listBackground: undefined,
        listActiveSelectionBackground: undefined,
        listActiveSelectionForeground: undefined,
        listActiveSelectionIconForeground: undefined,
        listFocusAndSelectionBackground: undefined,
        listDropBackground: undefined,
        listInactiveSelectionBackground: undefined,
        listInactiveSelectionForeground: undefined,
        listInactiveFocusBackground: undefined,
        listInactiveFocusOutline: undefined,
        listSelectionOutline: undefined,
        listFocusAndSelectionForeground: undefined,
        listFocusAndSelectionOutline: undefined,
        listInactiveFocusForeground: undefined,
        tableColumnsBorder: undefined,
        tableOddRowsBackgroundColor: undefined,
        treeIndentGuidesStroke: undefined,
        treeInactiveIndentGuidesStroke: undefined,
    };
    function getSelectBoxStyles(override) {
        return overrideStyles(override, exports.defaultSelectBoxStyles);
    }
    exports.getSelectBoxStyles = getSelectBoxStyles;
    exports.defaultMenuStyles = {
        shadowColor: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.widgetShadow),
        borderColor: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.menuBorder),
        foregroundColor: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.menuForeground),
        backgroundColor: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.menuBackground),
        selectionForegroundColor: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.menuSelectionForeground),
        selectionBackgroundColor: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.menuSelectionBackground),
        selectionBorderColor: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.menuSelectionBorder),
        separatorColor: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.menuSeparatorBackground),
        scrollbarShadow: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.scrollbarShadow),
        scrollbarSliderBackground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.scrollbarSliderBackground),
        scrollbarSliderHoverBackground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.scrollbarSliderHoverBackground),
        scrollbarSliderActiveBackground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.scrollbarSliderActiveBackground)
    };
    function getMenuStyles(override) {
        return overrideStyles(override, exports.defaultMenuStyles);
    }
    exports.getMenuStyles = getMenuStyles;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdFN0eWxlcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3RoZW1lL2Jyb3dzZXIvZGVmYXVsdFN0eWxlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBdUJBLFNBQVMsY0FBYyxDQUFJLFFBQTJCLEVBQUUsTUFBUztRQUNoRSxNQUFNLE1BQU0sR0FBRyxFQUFFLEdBQUcsTUFBTSxFQUE0QyxDQUFDO1FBQ3ZFLEtBQUssTUFBTSxHQUFHLElBQUksUUFBUSxFQUFFO1lBQzNCLE1BQU0sR0FBRyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMxQixNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBQSw2QkFBYSxFQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7U0FDakU7UUFDRCxPQUFPLE1BQU0sQ0FBQztJQUNmLENBQUM7SUFFWSxRQUFBLDRCQUE0QixHQUEyQjtRQUNuRSx5QkFBeUIsRUFBRSxJQUFBLDZCQUFhLEVBQUMseUNBQXlCLENBQUM7UUFDbkUseUJBQXlCLEVBQUUsSUFBQSw2QkFBYSxFQUFDLHlDQUF5QixDQUFDO1FBQ25FLHFCQUFxQixFQUFFLElBQUEsNkJBQWEsRUFBQyxxQ0FBcUIsQ0FBQztRQUMzRCwyQkFBMkIsRUFBRSxJQUFBLDZCQUFhLEVBQUMsMkNBQTJCLENBQUM7UUFDdkUscUJBQXFCLEVBQUUsSUFBQSw2QkFBYSxFQUFDLDRCQUFZLENBQUM7S0FDbEQsQ0FBQztJQUVGLFNBQWdCLHdCQUF3QixDQUFDLFFBQWdEO1FBQ3hGLE9BQU8sY0FBYyxDQUFDLFFBQVEsRUFBRSxvQ0FBNEIsQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFGRCw0REFFQztJQUNZLFFBQUEsbUJBQW1CLEdBQWtCO1FBQ2pELGdCQUFnQixFQUFFLElBQUEsNkJBQWEsRUFB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