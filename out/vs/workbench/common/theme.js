/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/theme/common/colorRegistry", "vs/base/common/color", "vs/platform/theme/common/theme"], function (require, exports, nls_1, colorRegistry_1, color_1, theme_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WINDOW_INACTIVE_BORDER = exports.WINDOW_ACTIVE_BORDER = exports.NOTIFICATIONS_INFO_ICON_FOREGROUND = exports.NOTIFICATIONS_WARNING_ICON_FOREGROUND = exports.NOTIFICATIONS_ERROR_ICON_FOREGROUND = exports.NOTIFICATIONS_BORDER = exports.NOTIFICATIONS_CENTER_HEADER_BACKGROUND = exports.NOTIFICATIONS_CENTER_HEADER_FOREGROUND = exports.NOTIFICATIONS_LINKS = exports.NOTIFICATIONS_BACKGROUND = exports.NOTIFICATIONS_FOREGROUND = exports.NOTIFICATIONS_TOAST_BORDER = exports.NOTIFICATIONS_CENTER_BORDER = exports.COMMAND_CENTER_INACTIVEBORDER = exports.COMMAND_CENTER_ACTIVEBORDER = exports.COMMAND_CENTER_BORDER = exports.COMMAND_CENTER_ACTIVEBACKGROUND = exports.COMMAND_CENTER_BACKGROUND = exports.COMMAND_CENTER_INACTIVEFOREGROUND = exports.COMMAND_CENTER_ACTIVEFOREGROUND = exports.COMMAND_CENTER_FOREGROUND = exports.MENUBAR_SELECTION_BORDER = exports.MENUBAR_SELECTION_BACKGROUND = exports.MENUBAR_SELECTION_FOREGROUND = exports.TITLE_BAR_BORDER = exports.TITLE_BAR_INACTIVE_BACKGROUND = exports.TITLE_BAR_ACTIVE_BACKGROUND = exports.TITLE_BAR_INACTIVE_FOREGROUND = exports.TITLE_BAR_ACTIVE_FOREGROUND = exports.SIDE_BAR_SECTION_HEADER_BORDER = exports.SIDE_BAR_SECTION_HEADER_FOREGROUND = exports.SIDE_BAR_SECTION_HEADER_BACKGROUND = exports.SIDE_BAR_DRAG_AND_DROP_BACKGROUND = exports.SIDE_BAR_TITLE_FOREGROUND = exports.SIDE_BAR_BORDER = exports.SIDE_BAR_FOREGROUND = exports.SIDE_BAR_BACKGROUND = exports.EXTENSION_BADGE_REMOTE_FOREGROUND = exports.EXTENSION_BADGE_REMOTE_BACKGROUND = exports.STATUS_BAR_OFFLINE_ITEM_HOVER_BACKGROUND = exports.STATUS_BAR_OFFLINE_ITEM_HOVER_FOREGROUND = exports.STATUS_BAR_OFFLINE_ITEM_FOREGROUND = exports.STATUS_BAR_OFFLINE_ITEM_BACKGROUND = exports.STATUS_BAR_REMOTE_ITEM_HOVER_BACKGROUND = exports.STATUS_BAR_REMOTE_ITEM_HOVER_FOREGROUND = exports.STATUS_BAR_REMOTE_ITEM_FOREGROUND = exports.STATUS_BAR_REMOTE_ITEM_BACKGROUND = exports.PROFILE_BADGE_FOREGROUND = exports.PROFILE_BADGE_BACKGROUND = exports.ACTIVITY_BAR_BADGE_FOREGROUND = exports.ACTIVITY_BAR_BADGE_BACKGROUND = exports.ACTIVITY_BAR_DRAG_AND_DROP_BORDER = exports.ACTIVITY_BAR_ACTIVE_BACKGROUND = exports.ACTIVITY_BAR_ACTIVE_FOCUS_BORDER = exports.ACTIVITY_BAR_ACTIVE_BORDER = exports.ACTIVITY_BAR_BORDER = exports.ACTIVITY_BAR_INACTIVE_FOREGROUND = exports.ACTIVITY_BAR_FOREGROUND = exports.ACTIVITY_BAR_BACKGROUND = exports.STATUS_BAR_WARNING_ITEM_HOVER_BACKGROUND = exports.STATUS_BAR_WARNING_ITEM_HOVER_FOREGROUND = exports.STATUS_BAR_WARNING_ITEM_FOREGROUND = exports.STATUS_BAR_WARNING_ITEM_BACKGROUND = exports.STATUS_BAR_ERROR_ITEM_HOVER_BACKGROUND = exports.STATUS_BAR_ERROR_ITEM_HOVER_FOREGROUND = exports.STATUS_BAR_ERROR_ITEM_FOREGROUND = exports.STATUS_BAR_ERROR_ITEM_BACKGROUND = exports.STATUS_BAR_PROMINENT_ITEM_HOVER_BACKGROUND = exports.STATUS_BAR_PROMINENT_ITEM_HOVER_FOREGROUND = exports.STATUS_BAR_PROMINENT_ITEM_BACKGROUND = exports.STATUS_BAR_PROMINENT_ITEM_FOREGROUND = exports.STATUS_BAR_ITEM_COMPACT_HOVER_BACKGROUND = exports.STATUS_BAR_ITEM_HOVER_FOREGROUND = exports.STATUS_BAR_ITEM_HOVER_BACKGROUND = exports.STATUS_BAR_ITEM_FOCUS_BORDER = exports.STATUS_BAR_ITEM_ACTIVE_BACKGROUND = exports.STATUS_BAR_NO_FOLDER_BORDER = exports.STATUS_BAR_FOCUS_BORDER = exports.STATUS_BAR_BORDER = exports.STATUS_BAR_NO_FOLDER_BACKGROUND = exports.STATUS_BAR_BACKGROUND = exports.STATUS_BAR_NO_FOLDER_FOREGROUND = exports.STATUS_BAR_FOREGROUND = exports.BANNER_ICON_FOREGROUND = exports.BANNER_FOREGROUND = exports.BANNER_BACKGROUND = exports.PANEL_SECTION_BORDER = exports.PANEL_SECTION_HEADER_BORDER = exports.PANEL_SECTION_HEADER_FOREGROUND = exports.PANEL_SECTION_HEADER_BACKGROUND = exports.PANEL_SECTION_DRAG_AND_DROP_BACKGROUND = exports.PANEL_DRAG_AND_DROP_BORDER = exports.PANEL_INPUT_BORDER = exports.PANEL_ACTIVE_TITLE_BORDER = exports.PANEL_INACTIVE_TITLE_FOREGROUND = exports.PANEL_ACTIVE_TITLE_FOREGROUND = exports.PANEL_BORDER = exports.PANEL_BACKGROUND = exports.SIDE_BY_SIDE_EDITOR_VERTICAL_BORDER = exports.SIDE_BY_SIDE_EDITOR_HORIZONTAL_BORDER = exports.EDITOR_DROP_INTO_PROMPT_BORDER = exports.EDITOR_DROP_INTO_PROMPT_BACKGROUND = exports.EDITOR_DROP_INTO_PROMPT_FOREGROUND = exports.EDITOR_DRAG_AND_DROP_BACKGROUND = exports.EDITOR_GROUP_BORDER = exports.EDITOR_GROUP_HEADER_BORDER = exports.EDITOR_GROUP_HEADER_NO_TABS_BACKGROUND = exports.EDITOR_GROUP_HEADER_TABS_BORDER = exports.EDITOR_GROUP_HEADER_TABS_BACKGROUND = exports.EDITOR_GROUP_FOCUSED_EMPTY_BORDER = exports.EDITOR_GROUP_EMPTY_BACKGROUND = exports.EDITOR_PANE_BACKGROUND = exports.TAB_UNFOCUSED_INACTIVE_MODIFIED_BORDER = exports.TAB_UNFOCUSED_ACTIVE_MODIFIED_BORDER = exports.TAB_INACTIVE_MODIFIED_BORDER = exports.TAB_ACTIVE_MODIFIED_BORDER = exports.TAB_UNFOCUSED_HOVER_BORDER = exports.TAB_HOVER_BORDER = exports.TAB_UNFOCUSED_ACTIVE_BORDER_TOP = exports.TAB_ACTIVE_BORDER_TOP = exports.TAB_UNFOCUSED_ACTIVE_BORDER = exports.TAB_ACTIVE_BORDER = exports.TAB_LAST_PINNED_BORDER = exports.TAB_BORDER = exports.TAB_UNFOCUSED_HOVER_FOREGROUND = exports.TAB_HOVER_FOREGROUND = exports.TAB_UNFOCUSED_HOVER_BACKGROUND = exports.TAB_HOVER_BACKGROUND = exports.TAB_UNFOCUSED_INACTIVE_FOREGROUND = exports.TAB_UNFOCUSED_ACTIVE_FOREGROUND = exports.TAB_INACTIVE_FOREGROUND = exports.TAB_ACTIVE_FOREGROUND = exports.TAB_UNFOCUSED_INACTIVE_BACKGROUND = exports.TAB_INACTIVE_BACKGROUND = exports.TAB_UNFOCUSED_ACTIVE_BACKGROUND = exports.TAB_ACTIVE_BACKGROUND = exports.WORKBENCH_BACKGROUND = void 0;
    // < --- Workbench (not customizable) --- >
    function WORKBENCH_BACKGROUND(theme) {
        switch (theme.type) {
            case theme_1.ColorScheme.LIGHT:
                return color_1.Color.fromHex('#F3F3F3');
            case theme_1.ColorScheme.HIGH_CONTRAST_LIGHT:
                return color_1.Color.fromHex('#FFFFFF');
            case theme_1.ColorScheme.HIGH_CONTRAST_DARK:
                return color_1.Color.fromHex('#000000');
            default:
                return color_1.Color.fromHex('#252526');
        }
    }
    exports.WORKBENCH_BACKGROUND = WORKBENCH_BACKGROUND;
    // < --- Tabs --- >
    //#region Tab Background
    exports.TAB_ACTIVE_BACKGROUND = (0, colorRegistry_1.registerColor)('tab.activeBackground', {
        dark: colorRegistry_1.editorBackground,
        light: colorRegistry_1.editorBackground,
        hcDark: colorRegistry_1.editorBackground,
        hcLight: colorRegistry_1.editorBackground
    }, (0, nls_1.localize)('tabActiveBackground', "Active tab background color in an active group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));
    exports.TAB_UNFOCUSED_ACTIVE_BACKGROUND = (0, colorRegistry_1.registerColor)('tab.unfocusedActiveBackground', {
        dark: exports.TAB_ACTIVE_BACKGROUND,
        light: exports.TAB_ACTIVE_BACKGROUND,
        hcDark: exports.TAB_ACTIVE_BACKGROUND,
        hcLight: exports.TAB_ACTIVE_BACKGROUND,
    }, (0, nls_1.localize)('tabUnfocusedActiveBackground', "Active tab background color in an unfocused group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));
    exports.TAB_INACTIVE_BACKGROUND = (0, colorRegistry_1.registerColor)('tab.inactiveBackground', {
        dark: '#2D2D2D',
        light: '#ECECEC',
        hcDark: null,
        hcLight: null,
    }, (0, nls_1.localize)('tabInactiveBackground', "Inactive tab background color in an active group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));
    exports.TAB_UNFOCUSED_INACTIVE_BACKGROUND = (0, colorRegistry_1.registerColor)('tab.unfocusedInactiveBackground', {
        dark: exports.TAB_INACTIVE_BACKGROUND,
        light: exports.TAB_INACTIVE_BACKGROUND,
        hcDark: exports.TAB_INACTIVE_BACKGROUND,
        hcLight: exports.TAB_INACTIVE_BACKGROUND
    }, (0, nls_1.localize)('tabUnfocusedInactiveBackground', "Inactive tab background color in an unfocused group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));
    //#endregion
    //#region Tab Foreground
    exports.TAB_ACTIVE_FOREGROUND = (0, colorRegistry_1.registerColor)('tab.activeForeground', {
        dark: color_1.Color.white,
        light: '#333333',
        hcDark: color_1.Color.white,
        hcLight: '#292929'
    }, (0, nls_1.localize)('tabActiveForeground', "Active tab foreground color in an active group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));
    exports.TAB_INACTIVE_FOREGROUND = (0, colorRegistry_1.registerColor)('tab.inactiveForeground', {
        dark: (0, colorRegistry_1.transparent)(exports.TAB_ACTIVE_FOREGROUND, 0.5),
        light: (0, colorRegistry_1.transparent)(exports.TAB_ACTIVE_FOREGROUND, 0.7),
        hcDark: color_1.Color.white,
        hcLight: '#292929'
    }, (0, nls_1.localize)('tabInactiveForeground', "Inactive tab foreground color in an active group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));
    exports.TAB_UNFOCUSED_ACTIVE_FOREGROUND = (0, colorRegistry_1.registerColor)('tab.unfocusedActiveForeground', {
        dark: (0, colorRegistry_1.transparent)(exports.TAB_ACTIVE_FOREGROUND, 0.5),
        light: (0, colorRegistry_1.transparent)(exports.TAB_ACTIVE_FOREGROUND, 0.7),
        hcDark: color_1.Color.white,
        hcLight: '#292929'
    }, (0, nls_1.localize)('tabUnfocusedActiveForeground', "Active tab foreground color in an unfocused group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));
    exports.TAB_UNFOCUSED_INACTIVE_FOREGROUND = (0, colorRegistry_1.registerColor)('tab.unfocusedInactiveForeground', {
        dark: (0, colorRegistry_1.transparent)(exports.TAB_INACTIVE_FOREGROUND, 0.5),
        light: (0, colorRegistry_1.transparent)(exports.TAB_INACTIVE_FOREGROUND, 0.5),
        hcDark: color_1.Color.white,
        hcLight: '#292929'
    }, (0, nls_1.localize)('tabUnfocusedInactiveForeground', "Inactive tab foreground color in an unfocused group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));
    //#endregion
    //#region Tab Hover Foreground/Background
    exports.TAB_HOVER_BACKGROUND = (0, colorRegistry_1.registerColor)('tab.hoverBackground', {
        dark: null,
        light: null,
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)('tabHoverBackground', "Tab background color when hovering. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));
    exports.TAB_UNFOCUSED_HOVER_BACKGROUND = (0, colorRegistry_1.registerColor)('tab.unfocusedHoverBackground', {
        dark: (0, colorRegistry_1.transparent)(exports.TAB_HOVER_BACKGROUND, 0.5),
        light: (0, colorRegistry_1.transparent)(exports.TAB_HOVER_BACKGROUND, 0.7),
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)('tabUnfocusedHoverBackground', "Tab background color in an unfocused group when hovering. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));
    exports.TAB_HOVER_FOREGROUND = (0, colorRegistry_1.registerColor)('tab.hoverForeground', {
        dark: null,
        light: null,
        hcDark: null,
        hcLight: null,
    }, (0, nls_1.localize)('tabHoverForeground', "Tab foreground color when hovering. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));
    exports.TAB_UNFOCUSED_HOVER_FOREGROUND = (0, colorRegistry_1.registerColor)('tab.unfocusedHoverForeground', {
        dark: (0, colorRegistry_1.transparent)(exports.TAB_HOVER_FOREGROUND, 0.5),
        light: (0, colorRegistry_1.transparent)(exports.TAB_HOVER_FOREGROUND, 0.5),
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)('tabUnfocusedHoverForeground', "Tab foreground color in an unfocused group when hovering. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));
    //#endregion
    //#region Tab Borders
    exports.TAB_BORDER = (0, colorRegistry_1.registerColor)('tab.border', {
        dark: '#252526',
        light: '#F3F3F3',
        hcDark: colorRegistry_1.contrastBorder,
        hcLight: colorRegistry_1.contrastBorder,
    }, (0, nls_1.localize)('tabBorder', "Border to separate tabs from each other. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));
    exports.TAB_LAST_PINNED_BORDER = (0, colorRegistry_1.registerColor)('tab.lastPinnedBorder', {
        dark: colorRegistry_1.treeIndentGuidesStroke,
        light: colorRegistry_1.treeIndentGuidesStroke,
        hcDark: colorRegistry_1.contrastBorder,
        hcLight: colorRegistry_1.contrastBorder
    }, (0, nls_1.localize)('lastPinnedTabBorder', "Border to separate pinned tabs from other tabs. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));
    exports.TAB_ACTIVE_BORDER = (0, colorRegistry_1.registerColor)('tab.activeBorder', {
        dark: null,
        light: null,
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)('tabActiveBorder', "Border on the bottom of an active tab. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));
    exports.TAB_UNFOCUSED_ACTIVE_BORDER = (0, colorRegistry_1.registerColor)('tab.unfocusedActiveBorder', {
        dark: (0, colorRegistry_1.transparent)(exports.TAB_ACTIVE_BORDER, 0.5),
        light: (0, colorRegistry_1.transparent)(exports.TAB_ACTIVE_BORDER, 0.7),
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)('tabActiveUnfocusedBorder', "Border on the bottom of an active tab in an unfocused group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));
    exports.TAB_ACTIVE_BORDER_TOP = (0, colorRegistry_1.registerColor)('tab.activeBorderTop', {
        dark: null,
        light: null,
        hcDark: null,
        hcLight: '#B5200D'
    }, (0, nls_1.localize)('tabActiveBorderTop', "Border to the top of an active tab. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));
    exports.TAB_UNFOCUSED_ACTIVE_BORDER_TOP = (0, colorRegistry_1.registerColor)('tab.unfocusedActiveBorderTop', {
        dark: (0, colorRegistry_1.transparent)(exports.TAB_ACTIVE_BORDER_TOP, 0.5),
        light: (0, colorRegistry_1.transparent)(exports.TAB_ACTIVE_BORDER_TOP, 0.7),
        hcDark: null,
        hcLight: '#B5200D'
    }, (0, nls_1.localize)('tabActiveUnfocusedBorderTop', "Border to the top of an active tab in an unfocused group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));
    exports.TAB_HOVER_BORDER = (0, colorRegistry_1.registerColor)('tab.hoverBorder', {
        dark: null,
        light: null,
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)('tabHoverBorder', "Border to highlight tabs when hovering. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));
    exports.TAB_UNFOCUSED_HOVER_BORDER = (0, colorRegistry_1.registerColor)('tab.unfocusedHoverBorder', {
        dark: (0, colorRegistry_1.transparent)(exports.TAB_HOVER_BORDER, 0.5),
        light: (0, colorRegistry_1.transparent)(exports.TAB_HOVER_BORDER, 0.7),
        hcDark: null,
        hcLight: colorRegistry_1.contrastBorder
    }, (0, nls_1.localize)('tabUnfocusedHoverBorder', "Border to highlight tabs in an unfocused group when hovering. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));
    //#endregion
    //#region Tab Modified Border
    exports.TAB_ACTIVE_MODIFIED_BORDER = (0, colorRegistry_1.registerColor)('tab.activeModifiedBorder', {
        dark: '#3399CC',
        light: '#33AAEE',
        hcDark: null,
        hcLight: colorRegistry_1.contrastBorder
    }, (0, nls_1.localize)('tabActiveModifiedBorder', "Border on the top of modified active tabs in an active group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));
    exports.TAB_INACTIVE_MODIFIED_BORDER = (0, colorRegistry_1.registerColor)('tab.inactiveModifiedBorder', {
        dark: (0, colorRegistry_1.transparent)(exports.TAB_ACTIVE_MODIFIED_BORDER, 0.5),
        light: (0, colorRegistry_1.transparent)(exports.TAB_ACTIVE_MODIFIED_BORDER, 0.5),
        hcDark: color_1.Color.white,
        hcLight: colorRegistry_1.contrastBorder
    }, (0, nls_1.localize)('tabInactiveModifiedBorder', "Border on the top of modified inactive tabs in an active group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));
    exports.TAB_UNFOCUSED_ACTIVE_MODIFIED_BORDER = (0, colorRegistry_1.registerColor)('tab.unfocusedActiveModifiedBorder', {
        dark: (0, colorRegistry_1.transparent)(exports.TAB_ACTIVE_MODIFIED_BORDER, 0.5),
        light: (0, colorRegistry_1.transparent)(exports.TAB_ACTIVE_MODIFIED_BORDER, 0.7),
        hcDark: color_1.Color.white,
        hcLight: colorRegistry_1.contrastBorder
    }, (0, nls_1.localize)('unfocusedActiveModifiedBorder', "Border on the top of modified active tabs in an unfocused group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));
    exports.TAB_UNFOCUSED_INACTIVE_MODIFIED_BORDER = (0, colorRegistry_1.registerColor)('tab.unfocusedInactiveModifiedBorder', {
        dark: (0, colorRegistry_1.transparent)(exports.TAB_INACTIVE_MODIFIED_BORDER, 0.5),
        light: (0, colorRegistry_1.transparent)(exports.TAB_INACTIVE_MODIFIED_BORDER, 0.5),
        hcDark: color_1.Color.white,
        hcLight: colorRegistry_1.contrastBorder
    }, (0, nls_1.localize)('unfocusedINactiveModifiedBorder', "Border on the top of modified inactive tabs in an unfocused group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));
    //#endregion
    // < --- Editors --- >
    exports.EDITOR_PANE_BACKGROUND = (0, colorRegistry_1.registerColor)('editorPane.background', {
        dark: colorRegistry_1.editorBackground,
        light: colorRegistry_1.editorBackground,
        hcDark: colorRegistry_1.editorBackground,
        hcLight: colorRegistry_1.editorBackground
    }, (0, nls_1.localize)('editorPaneBackground', "Background color of the editor pane visible on the left and right side of the centered editor layout."));
    exports.EDITOR_GROUP_EMPTY_BACKGROUND = (0, colorRegistry_1.registerColor)('editorGroup.emptyBackground', {
        dark: null,
        light: null,
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)('editorGroupEmptyBackground', "Background color of an empty editor group. Editor groups are the containers of editors."));
    exports.EDITOR_GROUP_FOCUSED_EMPTY_BORDER = (0, colorRegistry_1.registerColor)('editorGroup.focusedEmptyBorder', {
        dark: null,
        light: null,
        hcDark: colorRegistry_1.focusBorder,
        hcLight: colorRegistry_1.focusBorder
    }, (0, nls_1.localize)('editorGroupFocusedEmptyBorder', "Border color of an empty editor group that is focused. Editor groups are the containers of editors."));
    exports.EDITOR_GROUP_HEADER_TABS_BACKGROUND = (0, colorRegistry_1.registerColor)('editorGroupHeader.tabsBackground', {
        dark: '#252526',
        light: '#F3F3F3',
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)('tabsContainerBackground', "Background color of the editor group title header when tabs are enabled. Editor groups are the containers of editors."));
    exports.EDITOR_GROUP_HEADER_TABS_BORDER = (0, colorRegistry_1.registerColor)('editorGroupHeader.tabsBorder', {
        dark: null,
        light: null,
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)('tabsContainerBorder', "Border color of the editor group title header when tabs are enabled. Editor groups are the containers of editors."));
    exports.EDITOR_GROUP_HEADER_NO_TABS_BACKGROUND = (0, colorRegistry_1.registerColor)('editorGroupHeader.noTabsBackground', {
        dark: colorRegistry_1.editorBackground,
        light: colorRegistry_1.editorBackground,
        hcDark: colorRegistry_1.editorBackground,
        hcLight: colorRegistry_1.editorBackground
    }, (0, nls_1.localize)('editorGroupHeaderBackground', "Background color of the editor group title header when tabs are disabled (`\"workbench.editor.showTabs\": false`). Editor groups are the containers of editors."));
    exports.EDITOR_GROUP_HEADER_BORDER = (0, colorRegistry_1.registerColor)('editorGroupHeader.border', {
        dark: null,
        light: null,
        hcDark: colorRegistry_1.contrastBorder,
        hcLight: colorRegistry_1.contrastBorder
    }, (0, nls_1.localize)('editorTitleContainerBorder', "Border color of the editor group title header. Editor groups are the containers of editors."));
    exports.EDITOR_GROUP_BORDER = (0, colorRegistry_1.registerColor)('editorGroup.border', {
        dark: '#444444',
        light: '#E7E7E7',
        hcDark: colorRegistry_1.contrastBorder,
        hcLight: colorRegistry_1.contrastBorder
    }, (0, nls_1.localize)('editorGroupBorder', "Color to separate multiple editor groups from each other. Editor groups are the containers of editors."));
    exports.EDITOR_DRAG_AND_DROP_BACKGROUND = (0, colorRegistry_1.registerColor)('editorGroup.dropBackground', {
        dark: color_1.Color.fromHex('#53595D').transparent(0.5),
        light: color_1.Color.fromHex('#2677CB').transparent(0.18),
        hcDark: null,
        hcLight: color_1.Color.fromHex('#0F4A85').transparent(0.50)
    }, (0, nls_1.localize)('editorDragAndDropBackground', "Background color when dragging editors around. The color should have transparency so that the editor contents can still shine through."));
    exports.EDITOR_DROP_INTO_PROMPT_FOREGROUND = (0, colorRegistry_1.registerColor)('editorGroup.dropIntoPromptForeground', {
        dark: colorRegistry_1.editorWidgetForeground,
        light: colorRegistry_1.editorWidgetForeground,
        hcDark: colorRegistry_1.editorWidgetForeground,
        hcLight: colorRegistry_1.editorWidgetForeground
    }, (0, nls_1.localize)('editorDropIntoPromptForeground', "Foreground color of text shown over editors when dragging files. This text informs the user that they can hold shift to drop into the editor."));
    exports.EDITOR_DROP_INTO_PROMPT_BACKGROUND = (0, colorRegistry_1.registerColor)('editorGroup.dropIntoPromptBackground', {
        dark: colorRegistry_1.editorWidgetBackground,
        light: colorRegistry_1.editorWidgetBackground,
        hcDark: colorRegistry_1.editorWidgetBackground,
        hcLight: colorRegistry_1.editorWidgetBackground
    }, (0, nls_1.localize)('editorDropIntoPromptBackground', "Background color of text shown over editors when dragging files. This text informs the user that they can hold shift to drop into the editor."));
    exports.EDITOR_DROP_INTO_PROMPT_BORDER = (0, colorRegistry_1.registerColor)('editorGroup.dropIntoPromptBorder', {
        dark: null,
        light: null,
        hcDark: colorRegistry_1.contrastBorder,
        hcLight: colorRegistry_1.contrastBorder
    }, (0, nls_1.localize)('editorDropIntoPromptBorder', "Border color of text shown over editors when dragging files. This text informs the user that they can hold shift to drop into the editor."));
    exports.SIDE_BY_SIDE_EDITOR_HORIZONTAL_BORDER = (0, colorRegistry_1.registerColor)('sideBySideEditor.horizontalBorder', {
        dark: exports.EDITOR_GROUP_BORDER,
        light: exports.EDITOR_GROUP_BORDER,
        hcDark: exports.EDITOR_GROUP_BORDER,
        hcLight: exports.EDITOR_GROUP_BORDER
    }, (0, nls_1.localize)('sideBySideEditor.horizontalBorder', "Color to separate two editors from each other when shown side by side in an editor group from top to bottom."));
    exports.SIDE_BY_SIDE_EDITOR_VERTICAL_BORDER = (0, colorRegistry_1.registerColor)('sideBySideEditor.verticalBorder', {
        dark: exports.EDITOR_GROUP_BORDER,
        light: exports.EDITOR_GROUP_BORDER,
        hcDark: exports.EDITOR_GROUP_BORDER,
        hcLight: exports.EDITOR_GROUP_BORDER
    }, (0, nls_1.localize)('sideBySideEditor.verticalBorder', "Color to separate two editors from each other when shown side by side in an editor group from left to right."));
    // < --- Panels --- >
    exports.PANEL_BACKGROUND = (0, colorRegistry_1.registerColor)('panel.background', {
        dark: colorRegistry_1.editorBackground,
        light: colorRegistry_1.editorBackground,
        hcDark: colorRegistry_1.editorBackground,
        hcLight: colorRegistry_1.editorBackground
    }, (0, nls_1.localize)('panelBackground', "Panel background color. Panels are shown below the editor area and contain views like output and integrated terminal."));
    exports.PANEL_BORDER = (0, colorRegistry_1.registerColor)('panel.border', {
        dark: color_1.Color.fromHex('#808080').transparent(0.35),
        light: color_1.Color.fromHex('#808080').transparent(0.35),
        hcDark: colorRegistry_1.contrastBorder,
        hcLight: colorRegistry_1.contrastBorder
    }, (0, nls_1.localize)('panelBorder', "Panel border color to separate the panel from the editor. Panels are shown below the editor area and contain views like output and integrated terminal."));
    exports.PANEL_ACTIVE_TITLE_FOREGROUND = (0, colorRegistry_1.registerColor)('panelTitle.activeForeground', {
        dark: '#E7E7E7',
        light: '#424242',
        hcDark: color_1.Color.white,
        hcLight: colorRegistry_1.editorForeground
    }, (0, nls_1.localize)('panelActiveTitleForeground', "Title color for the active panel. Panels are shown below the editor area and contain views like output and integrated terminal."));
    exports.PANEL_INACTIVE_TITLE_FOREGROUND = (0, colorRegistry_1.registerColor)('panelTitle.inactiveForeground', {
        dark: (0, colorRegistry_1.transparent)(exports.PANEL_ACTIVE_TITLE_FOREGROUND, 0.6),
        light: (0, colorRegistry_1.transparent)(exports.PANEL_ACTIVE_TITLE_FOREGROUND, 0.75),
        hcDark: color_1.Color.white,
        hcLight: colorRegistry_1.editorForeground
    }, (0, nls_1.localize)('panelInactiveTitleForeground', "Title color for the inactive panel. Panels are shown below the editor area and contain views like output and integrated terminal."));
    exports.PANEL_ACTIVE_TITLE_BORDER = (0, colorRegistry_1.registerColor)('panelTitle.activeBorder', {
        dark: exports.PANEL_ACTIVE_TITLE_FOREGROUND,
        light: exports.PANEL_ACTIVE_TITLE_FOREGROUND,
        hcDark: colorRegistry_1.contrastBorder,
        hcLight: '#B5200D'
    }, (0, nls_1.localize)('panelActiveTitleBorder', "Border color for the active panel title. Panels are shown below the editor area and contain views like output and integrated terminal."));
    exports.PANEL_INPUT_BORDER = (0, colorRegistry_1.registerColor)('panelInput.border', {
        dark: colorRegistry_1.inputBorder,
        light: color_1.Color.fromHex('#ddd'),
        hcDark: colorRegistry_1.inputBorder,
        hcLight: colorRegistry_1.inputBorder
    }, (0, nls_1.localize)('panelInputBorder', "Input box border for inputs in the panel."));
    exports.PANEL_DRAG_AND_DROP_BORDER = (0, colorRegistry_1.registerColor)('panel.dropBorder', {
        dark: exports.PANEL_ACTIVE_TITLE_FOREGROUND,
        light: exports.PANEL_ACTIVE_TITLE_FOREGROUND,
        hcDark: exports.PANEL_ACTIVE_TITLE_FOREGROUND,
        hcLight: exports.PANEL_ACTIVE_TITLE_FOREGROUND
    }, (0, nls_1.localize)('panelDragAndDropBorder', "Drag and drop feedback color for the panel titles. Panels are shown below the editor area and contain views like output and integrated terminal."));
    exports.PANEL_SECTION_DRAG_AND_DROP_BACKGROUND = (0, colorRegistry_1.registerColor)('panelSection.dropBackground', {
        dark: exports.EDITOR_DRAG_AND_DROP_BACKGROUND,
        light: exports.EDITOR_DRAG_AND_DROP_BACKGROUND,
        hcDark: exports.EDITOR_DRAG_AND_DROP_BACKGROUND,
        hcLight: exports.EDITOR_DRAG_AND_DROP_BACKGROUND
    }, (0, nls_1.localize)('panelSectionDragAndDropBackground', "Drag and drop feedback color for the panel sections. The color should have transparency so that the panel sections can still shine through. Panels are shown below the editor area and contain views like output and integrated terminal. Panel sections are views nested within the panels."));
    exports.PANEL_SECTION_HEADER_BACKGROUND = (0, colorRegistry_1.registerColor)('panelSectionHeader.background', {
        dark: color_1.Color.fromHex('#808080').transparent(0.2),
        light: color_1.Color.fromHex('#808080').transparent(0.2),
        hcDark: null,
        hcLight: null,
    }, (0, nls_1.localize)('panelSectionHeaderBackground', "Panel section header background color. Panels are shown below the editor area and contain views like output and integrated terminal. Panel sections are views nested within the panels."));
    exports.PANEL_SECTION_HEADER_FOREGROUND = (0, colorRegistry_1.registerColor)('panelSectionHeader.foreground', {
        dark: null,
        light: null,
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)('panelSectionHeaderForeground', "Panel section header foreground color. Panels are shown below the editor area and contain views like output and integrated terminal. Panel sections are views nested within the panels."));
    exports.PANEL_SECTION_HEADER_BORDER = (0, colorRegistry_1.registerColor)('panelSectionHeader.border', {
        dark: colorRegistry_1.contrastBorder,
        light: colorRegistry_1.contrastBorder,
        hcDark: colorRegistry_1.contrastBorder,
        hcLight: colorRegistry_1.contrastBorder
    }, (0, nls_1.localize)('panelSectionHeaderBorder', "Panel section header border color used when multiple views are stacked vertically in the panel. Panels are shown below the editor area and contain views like output and integrated terminal. Panel sections are views nested within the panels."));
    exports.PANEL_SECTION_BORDER = (0, colorRegistry_1.registerColor)('panelSection.border', {
        dark: exports.PANEL_BORDER,
        light: exports.PANEL_BORDER,
        hcDark: exports.PANEL_BORDER,
        hcLight: exports.PANEL_BORDER
    }, (0, nls_1.localize)('panelSectionBorder', "Panel section border color used when multiple views are stacked horizontally in the panel. Panels are shown below the editor area and contain views like output and integrated terminal. Panel sections are views nested within the panels."));
    // < --- Banner --- >
    exports.BANNER_BACKGROUND = (0, colorRegistry_1.registerColor)('banner.background', {
        dark: colorRegistry_1.listActiveSelectionBackground,
        light: (0, colorRegistry_1.darken)(colorRegistry_1.listActiveSelectionBackground, 0.3),
        hcDark: colorRegistry_1.listActiveSelectionBackground,
        hcLight: colorRegistry_1.listActiveSelectionBackground
    }, (0, nls_1.localize)('banner.background', "Banner background color. The banner is shown under the title bar of the window."));
    exports.BANNER_FOREGROUND = (0, colorRegistry_1.registerColor)('banner.foreground', {
        dark: colorRegistry_1.listActiveSelectionForeground,
        light: colorRegistry_1.listActiveSelectionForeground,
        hcDark: colorRegistry_1.listActiveSelectionForeground,
        hcLight: colorRegistry_1.listActiveSelectionForeground
    }, (0, nls_1.localize)('banner.foreground', "Banner foreground color. The banner is shown under the title bar of the window."));
    exports.BANNER_ICON_FOREGROUND = (0, colorRegistry_1.registerColor)('banner.iconForeground', {
        dark: colorRegistry_1.editorInfoForeground,
        light: colorRegistry_1.editorInfoForeground,
        hcDark: colorRegistry_1.editorInfoForeground,
        hcLight: colorRegistry_1.editorInfoForeground
    }, (0, nls_1.localize)('banner.iconForeground', "Banner icon color. The banner is shown under the title bar of the window."));
    // < --- Status --- >
    exports.STATUS_BAR_FOREGROUND = (0, colorRegistry_1.registerColor)('statusBar.foreground', {
        dark: '#FFFFFF',
        light: '#FFFFFF',
        hcDark: '#FFFFFF',
        hcLight: colorRegistry_1.editorForeground
    }, (0, nls_1.localize)('statusBarForeground', "Status bar foreground color when a workspace or folder is opened. The status bar is shown in the bottom of the window."));
    exports.STATUS_BAR_NO_FOLDER_FOREGROUND = (0, colorRegistry_1.registerColor)('statusBar.noFolderForeground', {
        dark: exports.STATUS_BAR_FOREGROUND,
        light: exports.STATUS_BAR_FOREGROUND,
        hcDark: exports.STATUS_BAR_FOREGROUND,
        hcLight: exports.STATUS_BAR_FOREGROUND
    }, (0, nls_1.localize)('statusBarNoFolderForeground', "Status bar foreground color when no folder is opened. The status bar is shown in the bottom of the window."));
    exports.STATUS_BAR_BACKGROUND = (0, colorRegistry_1.registerColor)('statusBar.background', {
        dark: '#007ACC',
        light: '#007ACC',
        hcDark: null,
        hcLight: null,
    }, (0, nls_1.localize)('statusBarBackground', "Status bar background color when a workspace or folder is opened. The status bar is shown in the bottom of the window."));
    exports.STATUS_BAR_NO_FOLDER_BACKGROUND = (0, colorRegistry_1.registerColor)('statusBar.noFolderBackground', {
        dark: '#68217A',
        light: '#68217A',
        hcDark: null,
        hcLight: null,
    }, (0, nls_1.localize)('statusBarNoFolderBackground', "Status bar background color when no folder is opened. The status bar is shown in the bottom of the window."));
    exports.STATUS_BAR_BORDER = (0, colorRegistry_1.registerColor)('statusBar.border', {
        dark: null,
        light: null,
        hcDark: colorRegistry_1.contrastBorder,
        hcLight: colorRegistry_1.contrastBorder
    }, (0, nls_1.localize)('statusBarBorder', "Status bar border color separating to the sidebar and editor. The status bar is shown in the bottom of the window."));
    exports.STATUS_BAR_FOCUS_BORDER = (0, colorRegistry_1.registerColor)('statusBar.focusBorder', {
        dark: exports.STATUS_BAR_FOREGROUND,
        light: exports.STATUS_BAR_FOREGROUND,
        hcDark: null,
        hcLight: exports.STATUS_BAR_FOREGROUND
    }, (0, nls_1.localize)('statusBarFocusBorder', "Status bar border color when focused on keyboard navigation. The status bar is shown in the bottom of the window."));
    exports.STATUS_BAR_NO_FOLDER_BORDER = (0, colorRegistry_1.registerColor)('statusBar.noFolderBorder', {
        dark: exports.STATUS_BAR_BORDER,
        light: exports.STATUS_BAR_BORDER,
        hcDark: exports.STATUS_BAR_BORDER,
        hcLight: exports.STATUS_BAR_BORDER
    }, (0, nls_1.localize)('statusBarNoFolderBorder', "Status bar border color separating to the sidebar and editor when no folder is opened. The status bar is shown in the bottom of the window."));
    exports.STATUS_BAR_ITEM_ACTIVE_BACKGROUND = (0, colorRegistry_1.registerColor)('statusBarItem.activeBackground', {
        dark: color_1.Color.white.transparent(0.18),
        light: color_1.Color.white.transparent(0.18),
        hcDark: color_1.Color.white.transparent(0.18),
        hcLight: color_1.Color.black.transparent(0.18)
    }, (0, nls_1.localize)('statusBarItemActiveBackground', "Status bar item background color when clicking. The status bar is shown in the bottom of the window."));
    exports.STATUS_BAR_ITEM_FOCUS_BORDER = (0, colorRegistry_1.registerColor)('statusBarItem.focusBorder', {
        dark: exports.STATUS_BAR_FOREGROUND,
        light: exports.STATUS_BAR_FOREGROUND,
        hcDark: null,
        hcLight: colorRegistry_1.activeContrastBorder
    }, (0, nls_1.localize)('statusBarItemFocusBorder', "Status bar item border color when focused on keyboard navigation. The status bar is shown in the bottom of the window."));
    exports.STATUS_BAR_ITEM_HOVER_BACKGROUND = (0, colorRegistry_1.registerColor)('statusBarItem.hoverBackground', {
        dark: color_1.Color.white.transparent(0.12),
        light: color_1.Color.white.transparent(0.12),
        hcDark: color_1.Color.white.transparent(0.12),
        hcLight: color_1.Color.black.transparent(0.12)
    }, (0, nls_1.localize)('statusBarItemHoverBackground', "Status bar item background color when hovering. The status bar is shown in the bottom of the window."));
    exports.STATUS_BAR_ITEM_HOVER_FOREGROUND = (0, colorRegistry_1.registerColor)('statusBarItem.hoverForeground', {
        dark: exports.STATUS_BAR_FOREGROUND,
        light: exports.STATUS_BAR_FOREGROUND,
        hcDark: exports.STATUS_BAR_FOREGROUND,
        hcLight: exports.STATUS_BAR_FOREGROUND
    }, (0, nls_1.localize)('statusBarItemHoverForeground', "Status bar item foreground color when hovering. The status bar is shown in the bottom of the window."));
    exports.STATUS_BAR_ITEM_COMPACT_HOVER_BACKGROUND = (0, colorRegistry_1.registerColor)('statusBarItem.compactHoverBackground', {
        dark: color_1.Color.white.transparent(0.20),
        light: color_1.Color.white.transparent(0.20),
        hcDark: color_1.Color.white.transparent(0.20),
        hcLight: color_1.Color.black.transparent(0.20)
    }, (0, nls_1.localize)('statusBarItemCompactHoverBackground', "Status bar item background color when hovering an item that contains two hovers. The status bar is shown in the bottom of the window."));
    exports.STATUS_BAR_PROMINENT_ITEM_FOREGROUND = (0, colorRegistry_1.registerColor)('statusBarItem.prominentForeground', {
        dark: exports.STATUS_BAR_FOREGROUND,
        light: exports.STATUS_BAR_FOREGROUND,
        hcDark: exports.STATUS_BAR_FOREGROUND,
        hcLight: exports.STATUS_BAR_FOREGROUND
    }, (0, nls_1.localize)('statusBarProminentItemForeground', "Status bar prominent items foreground color. Prominent items stand out from other status bar entries to indicate importance. The status bar is shown in the bottom of the window."));
    exports.STATUS_BAR_PROMINENT_ITEM_BACKGROUND = (0, colorRegistry_1.registerColor)('statusBarItem.prominentBackground', {
        dark: color_1.Color.black.transparent(0.5),
        light: color_1.Color.black.transparent(0.5),
        hcDark: color_1.Color.black.transparent(0.5),
        hcLight: color_1.Color.black.transparent(0.5),
    }, (0, nls_1.localize)('statusBarProminentItemBackground', "Status bar prominent items background color. Prominent items stand out from other status bar entries to indicate importance. The status bar is shown in the bottom of the window."));
    exports.STATUS_BAR_PROMINENT_ITEM_HOVER_FOREGROUND = (0, colorRegistry_1.registerColor)('statusBarItem.prominentHoverForeground', {
        dark: exports.STATUS_BAR_ITEM_HOVER_FOREGROUND,
        light: exports.STATUS_BAR_ITEM_HOVER_FOREGROUND,
        hcDark: exports.STATUS_BAR_ITEM_HOVER_FOREGROUND,
        hcLight: exports.STATUS_BAR_ITEM_HOVER_FOREGROUND
    }, (0, nls_1.localize)('statusBarProminentItemHoverForeground', "Status bar prominent items foreground color when hovering. Prominent items stand out from other status bar entries to indicate importance. The status bar is shown in the bottom of the window."));
    exports.STATUS_BAR_PROMINENT_ITEM_HOVER_BACKGROUND = (0, colorRegistry_1.registerColor)('statusBarItem.prominentHoverBackground', {
        dark: color_1.Color.black.transparent(0.3),
        light: color_1.Color.black.transparent(0.3),
        hcDark: color_1.Color.black.transparent(0.3),
        hcLight: null
    }, (0, nls_1.localize)('statusBarProminentItemHoverBackground', "Status bar prominent items background color when hovering. Prominent items stand out from other status bar entries to indicate importance. The status bar is shown in the bottom of the window."));
    exports.STATUS_BAR_ERROR_ITEM_BACKGROUND = (0, colorRegistry_1.registerColor)('statusBarItem.errorBackground', {
        dark: (0, colorRegistry_1.darken)(colorRegistry_1.errorForeground, .4),
        light: (0, colorRegistry_1.darken)(colorRegistry_1.errorForeground, .4),
        hcDark: null,
        hcLight: '#B5200D'
    }, (0, nls_1.localize)('statusBarErrorItemBackground', "Status bar error items background color. Error items stand out from other status bar entries to indicate error conditions. The status bar is shown in the bottom of the window."));
    exports.STATUS_BAR_ERROR_ITEM_FOREGROUND = (0, colorRegistry_1.registerColor)('statusBarItem.errorForeground', {
        dark: color_1.Color.white,
        light: color_1.Color.white,
        hcDark: color_1.Color.white,
        hcLight: color_1.Color.white
    }, (0, nls_1.localize)('statusBarErrorItemForeground', "Status bar error items foreground color. Error items stand out from other status bar entries to indicate error conditions. The status bar is shown in the bottom of the window."));
    exports.STATUS_BAR_ERROR_ITEM_HOVER_FOREGROUND = (0, colorRegistry_1.registerColor)('statusBarItem.errorHoverForeground', {
        dark: exports.STATUS_BAR_ITEM_HOVER_FOREGROUND,
        light: exports.STATUS_BAR_ITEM_HOVER_FOREGROUND,
        hcDark: exports.STATUS_BAR_ITEM_HOVER_FOREGROUND,
        hcLight: exports.STATUS_BAR_ITEM_HOVER_FOREGROUND
    }, (0, nls_1.localize)('statusBarErrorItemHoverForeground', "Status bar error items foreground color when hovering. Error items stand out from other status bar entries to indicate error conditions. The status bar is shown in the bottom of the window."));
    exports.STATUS_BAR_ERROR_ITEM_HOVER_BACKGROUND = (0, colorRegistry_1.registerColor)('statusBarItem.errorHoverBackground', {
        dark: exports.STATUS_BAR_ITEM_HOVER_BACKGROUND,
        light: exports.STATUS_BAR_ITEM_HOVER_BACKGROUND,
        hcDark: exports.STATUS_BAR_ITEM_HOVER_BACKGROUND,
        hcLight: exports.STATUS_BAR_ITEM_HOVER_BACKGROUND
    }, (0, nls_1.localize)('statusBarErrorItemHoverBackground', "Status bar error items background color when hovering. Error items stand out from other status bar entries to indicate error conditions. The status bar is shown in the bottom of the window."));
    exports.STATUS_BAR_WARNING_ITEM_BACKGROUND = (0, colorRegistry_1.registerColor)('statusBarItem.warningBackground', {
        dark: (0, colorRegistry_1.darken)(colorRegistry_1.editorWarningForeground, .4),
        light: (0, colorRegistry_1.darken)(colorRegistry_1.editorWarningForeground, .4),
        hcDark: null,
        hcLight: '#895503'
    }, (0, nls_1.localize)('statusBarWarningItemBackground', "Status bar warning items background color. Warning items stand out from other status bar entries to indicate warning conditions. The status bar is shown in the bottom of the window."));
    exports.STATUS_BAR_WARNING_ITEM_FOREGROUND = (0, colorRegistry_1.registerColor)('statusBarItem.warningForeground', {
        dark: color_1.Color.white,
        light: color_1.Color.white,
        hcDark: color_1.Color.white,
        hcLight: color_1.Color.white
    }, (0, nls_1.localize)('statusBarWarningItemForeground', "Status bar warning items foreground color. Warning items stand out from other status bar entries to indicate warning conditions. The status bar is shown in the bottom of the window."));
    exports.STATUS_BAR_WARNING_ITEM_HOVER_FOREGROUND = (0, colorRegistry_1.registerColor)('statusBarItem.warningHoverForeground', {
        dark: exports.STATUS_BAR_ITEM_HOVER_FOREGROUND,
        light: exports.STATUS_BAR_ITEM_HOVER_FOREGROUND,
        hcDark: exports.STATUS_BAR_ITEM_HOVER_FOREGROUND,
        hcLight: exports.STATUS_BAR_ITEM_HOVER_FOREGROUND
    }, (0, nls_1.localize)('statusBarWarningItemHoverForeground', "Status bar warning items foreground color when hovering. Warning items stand out from other status bar entries to indicate warning conditions. The status bar is shown in the bottom of the window."));
    exports.STATUS_BAR_WARNING_ITEM_HOVER_BACKGROUND = (0, colorRegistry_1.registerColor)('statusBarItem.warningHoverBackground', {
        dark: exports.STATUS_BAR_ITEM_HOVER_BACKGROUND,
        light: exports.STATUS_BAR_ITEM_HOVER_BACKGROUND,
        hcDark: exports.STATUS_BAR_ITEM_HOVER_BACKGROUND,
        hcLight: exports.STATUS_BAR_ITEM_HOVER_BACKGROUND
    }, (0, nls_1.localize)('statusBarWarningItemHoverBackground', "Status bar warning items background color when hovering. Warning items stand out from other status bar entries to indicate warning conditions. The status bar is shown in the bottom of the window."));
    // < --- Activity Bar --- >
    exports.ACTIVITY_BAR_BACKGROUND = (0, colorRegistry_1.registerColor)('activityBar.background', {
        dark: '#333333',
        light: '#2C2C2C',
        hcDark: '#000000',
        hcLight: '#FFFFFF'
    }, (0, nls_1.localize)('activityBarBackground', "Activity bar background color. The activity bar is showing on the far left or right and allows to switch between views of the side bar."));
    exports.ACTIVITY_BAR_FOREGROUND = (0, colorRegistry_1.registerColor)('activityBar.foreground', {
        dark: color_1.Color.white,
        light: color_1.Color.white,
        hcDark: color_1.Color.white,
        hcLight: colorRegistry_1.editorForeground
    }, (0, nls_1.localize)('activityBarForeground', "Activity bar item foreground color when it is active. The activity bar is showing on the far left or right and allows to switch between views of the side bar."));
    exports.ACTIVITY_BAR_INACTIVE_FOREGROUND = (0, colorRegistry_1.registerColor)('activityBar.inactiveForeground', {
        dark: (0, colorRegistry_1.transparent)(exports.ACTIVITY_BAR_FOREGROUND, 0.4),
        light: (0, colorRegistry_1.transparent)(exports.ACTIVITY_BAR_FOREGROUND, 0.4),
        hcDark: color_1.Color.white,
        hcLight: colorRegistry_1.editorForeground
    }, (0, nls_1.localize)('activityBarInActiveForeground', "Activity bar item foreground color when it is inactive. The activity bar is showing on the far left or right and allows to switch between views of the side bar."));
    exports.ACTIVITY_BAR_BORDER = (0, colorRegistry_1.registerColor)('activityBar.border', {
        dark: null,
        light: null,
        hcDark: colorRegistry_1.contrastBorder,
        hcLight: colorRegistry_1.contrastBorder
    }, (0, nls_1.localize)('activityBarBorder', "Activity bar border color separating to the side bar. The activity bar is showing on the far left or right and allows to switch between views of the side bar."));
    exports.ACTIVITY_BAR_ACTIVE_BORDER = (0, colorRegistry_1.registerColor)('activityBar.activeBorder', {
        dark: exports.ACTIVITY_BAR_FOREGROUND,
        light: exports.ACTIVITY_BAR_FOREGROUND,
        hcDark: null,
        hcLight: colorRegistry_1.contrastBorder
    }, (0, nls_1.localize)('activityBarActiveBorder', "Activity bar border color for the active item. The activity bar is showing on the far left or right and allows to switch between views of the side bar."));
    exports.ACTIVITY_BAR_ACTIVE_FOCUS_BORDER = (0, colorRegistry_1.registerColor)('activityBar.activeFocusBorder', {
        dark: null,
        light: null,
        hcDark: null,
        hcLight: '#B5200D'
    }, (0, nls_1.localize)('activityBarActiveFocusBorder', "Activity bar focus border color for the active item. The activity bar is showing on the far left or right and allows to switch between views of the side bar."));
    exports.ACTIVITY_BAR_ACTIVE_BACKGROUND = (0, colorRegistry_1.registerColor)('activityBar.activeBackground', {
        dark: null,
        light: null,
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)('activityBarActiveBackground', "Activity bar background color for the active item. The activity bar is showing on the far left or right and allows to switch between views of the side bar."));
    exports.ACTIVITY_BAR_DRAG_AND_DROP_BORDER = (0, colorRegistry_1.registerColor)('activityBar.dropBorder', {
        dark: exports.ACTIVITY_BAR_FOREGROUND,
        light: exports.ACTIVITY_BAR_FOREGROUND,
        hcDark: null,
        hcLight: null,
    }, (0, nls_1.localize)('activityBarDragAndDropBorder', "Drag and drop feedback color for the activity bar items. The activity bar is showing on the far left or right and allows to switch between views of the side bar."));
    exports.ACTIVITY_BAR_BADGE_BACKGROUND = (0, colorRegistry_1.registerColor)('activityBarBadge.background', {
        dark: '#007ACC',
        light: '#007ACC',
        hcDark: '#000000',
        hcLight: '#0F4A85'
    }, (0, nls_1.localize)('activityBarBadgeBackground', "Activity notification badge background color. The activity bar is showing on the far left or right and allows to switch between views of the side bar."));
    exports.ACTIVITY_BAR_BADGE_FOREGROUND = (0, colorRegistry_1.registerColor)('activityBarBadge.foreground', {
        dark: color_1.Color.white,
        light: color_1.Color.white,
        hcDark: color_1.Color.white,
        hcLight: color_1.Color.white
    }, (0, nls_1.localize)('activityBarBadgeForeground', "Activity notification badge foreground color. The activity bar is showing on the far left or right and allows to switch between views of the side bar."));
    // < --- Profiles --- >
    exports.PROFILE_BADGE_BACKGROUND = (0, colorRegistry_1.registerColor)('profileBadge.background', {
        dark: '#4D4D4D',
        light: '#C4C4C4',
        hcDark: color_1.Color.white,
        hcLight: color_1.Color.black
    }, (0, nls_1.localize)('profileBadgeBackground', "Profile badge background color. The profile badge shows on top of the settings gear icon in the activity bar."));
    exports.PROFILE_BADGE_FOREGROUND = (0, colorRegistry_1.registerColor)('profileBadge.foreground', {
        dark: color_1.Color.white,
        light: '#333333',
        hcDark: color_1.Color.black,
        hcLight: color_1.Color.white
    }, (0, nls_1.localize)('profileBadgeForeground', "Profile badge foreground color. The profile badge shows on top of the settings gear icon in the activity bar."));
    // < --- Remote --- >
    exports.STATUS_BAR_REMOTE_ITEM_BACKGROUND = (0, colorRegistry_1.registerColor)('statusBarItem.remoteBackground', {
        dark: exports.ACTIVITY_BAR_BADGE_BACKGROUND,
        light: exports.ACTIVITY_BAR_BADGE_BACKGROUND,
        hcDark: exports.ACTIVITY_BAR_BADGE_BACKGROUND,
        hcLight: exports.ACTIVITY_BAR_BADGE_BACKGROUND
    }, (0, nls_1.localize)('statusBarItemHostBackground', "Background color for the remote indicator on the status bar."));
    exports.STATUS_BAR_REMOTE_ITEM_FOREGROUND = (0, colorRegistry_1.registerColor)('statusBarItem.remoteForeground', {
        dark: exports.ACTIVITY_BAR_BADGE_FOREGROUND,
        light: exports.ACTIVITY_BAR_BADGE_FOREGROUND,
        hcDark: exports.ACTIVITY_BAR_BADGE_FOREGROUND,
        hcLight: exports.ACTIVITY_BAR_BADGE_FOREGROUND
    }, (0, nls_1.localize)('statusBarItemHostForeground', "Foreground color for the remote indicator on the status bar."));
    exports.STATUS_BAR_REMOTE_ITEM_HOVER_FOREGROUND = (0, colorRegistry_1.registerColor)('statusBarItem.remoteHoverForeground', {
        dark: exports.STATUS_BAR_ITEM_HOVER_FOREGROUND,
        light: exports.STATUS_BAR_ITEM_HOVER_FOREGROUND,
        hcDark: exports.STATUS_BAR_ITEM_HOVER_FOREGROUND,
        hcLight: exports.STATUS_BAR_ITEM_HOVER_FOREGROUND
    }, (0, nls_1.localize)('statusBarRemoteItemHoverForeground', "Foreground color for the remote indicator on the status bar when hovering."));
    exports.STATUS_BAR_REMOTE_ITEM_HOVER_BACKGROUND = (0, colorRegistry_1.registerColor)('statusBarItem.remoteHoverBackground', {
        dark: exports.STATUS_BAR_ITEM_HOVER_BACKGROUND,
        light: exports.STATUS_BAR_ITEM_HOVER_BACKGROUND,
        hcDark: exports.STATUS_BAR_ITEM_HOVER_BACKGROUND,
        hcLight: null
    }, (0, nls_1.localize)('statusBarRemoteItemHoverBackground', "Background color for the remote indicator on the status bar when hovering."));
    exports.STATUS_BAR_OFFLINE_ITEM_BACKGROUND = (0, colorRegistry_1.registerColor)('statusBarItem.offlineBackground', {
        dark: '#6c1717',
        light: '#6c1717',
        hcDark: '#6c1717',
        hcLight: '#6c1717'
    }, (0, nls_1.localize)('statusBarItemOfflineBackground', "Status bar item background color when the workbench is offline."));
    exports.STATUS_BAR_OFFLINE_ITEM_FOREGROUND = (0, colorRegistry_1.registerColor)('statusBarItem.offlineForeground', {
        dark: exports.STATUS_BAR_REMOTE_ITEM_FOREGROUND,
        light: exports.STATUS_BAR_REMOTE_ITEM_FOREGROUND,
        hcDark: exports.STATUS_BAR_REMOTE_ITEM_FOREGROUND,
        hcLight: exports.STATUS_BAR_REMOTE_ITEM_FOREGROUND
    }, (0, nls_1.localize)('statusBarItemOfflineForeground', "Status bar item foreground color when the workbench is offline."));
    exports.STATUS_BAR_OFFLINE_ITEM_HOVER_FOREGROUND = (0, colorRegistry_1.registerColor)('statusBarItem.offlineHoverForeground', {
        dark: exports.STATUS_BAR_ITEM_HOVER_FOREGROUND,
        light: exports.STATUS_BAR_ITEM_HOVER_FOREGROUND,
        hcDark: exports.STATUS_BAR_ITEM_HOVER_FOREGROUND,
        hcLight: exports.STATUS_BAR_ITEM_HOVER_FOREGROUND
    }, (0, nls_1.localize)('statusBarOfflineItemHoverForeground', "Status bar item foreground hover color when the workbench is offline."));
    exports.STATUS_BAR_OFFLINE_ITEM_HOVER_BACKGROUND = (0, colorRegistry_1.registerColor)('statusBarItem.offlineHoverBackground', {
        dark: exports.STATUS_BAR_ITEM_HOVER_BACKGROUND,
        light: exports.STATUS_BAR_ITEM_HOVER_BACKGROUND,
        hcDark: exports.STATUS_BAR_ITEM_HOVER_BACKGROUND,
        hcLight: null
    }, (0, nls_1.localize)('statusBarOfflineItemHoverBackground', "Status bar item background hover color when the workbench is offline."));
    exports.EXTENSION_BADGE_REMOTE_BACKGROUND = (0, colorRegistry_1.registerColor)('extensionBadge.remoteBackground', {
        dark: exports.ACTIVITY_BAR_BADGE_BACKGROUND,
        light: exports.ACTIVITY_BAR_BADGE_BACKGROUND,
        hcDark: exports.ACTIVITY_BAR_BADGE_BACKGROUND,
        hcLight: exports.ACTIVITY_BAR_BADGE_BACKGROUND
    }, (0, nls_1.localize)('extensionBadge.remoteBackground', "Background color for the remote badge in the extensions view."));
    exports.EXTENSION_BADGE_REMOTE_FOREGROUND = (0, colorRegistry_1.registerColor)('extensionBadge.remoteForeground', {
        dark: exports.ACTIVITY_BAR_BADGE_FOREGROUND,
        light: exports.ACTIVITY_BAR_BADGE_FOREGROUND,
        hcDark: exports.ACTIVITY_BAR_BADGE_FOREGROUND,
        hcLight: exports.ACTIVITY_BAR_BADGE_FOREGROUND
    }, (0, nls_1.localize)('extensionBadge.remoteForeground', "Foreground color for the remote badge in the extensions view."));
    // < --- Side Bar --- >
    exports.SIDE_BAR_BACKGROUND = (0, colorRegistry_1.registerColor)('sideBar.background', {
        dark: '#252526',
        light: '#F3F3F3',
        hcDark: '#000000',
        hcLight: '#FFFFFF'
    }, (0, nls_1.localize)('sideBarBackground', "Side bar background color. The side bar is the container for views like explorer and search."));
    exports.SIDE_BAR_FOREGROUND = (0, colorRegistry_1.registerColor)('sideBar.foreground', {
        dark: null,
        light: null,
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)('sideBarForeground', "Side bar foreground color. The side bar is the container for views like explorer and search."));
    exports.SIDE_BAR_BORDER = (0, colorRegistry_1.registerColor)('sideBar.border', {
        dark: null,
        light: null,
        hcDark: colorRegistry_1.contrastBorder,
        hcLight: colorRegistry_1.contrastBorder
    }, (0, nls_1.localize)('sideBarBorder', "Side bar border color on the side separating to the editor. The side bar is the container for views like explorer and search."));
    exports.SIDE_BAR_TITLE_FOREGROUND = (0, colorRegistry_1.registerColor)('sideBarTitle.foreground', {
        dark: exports.SIDE_BAR_FOREGROUND,
        light: exports.SIDE_BAR_FOREGROUND,
        hcDark: exports.SIDE_BAR_FOREGROUND,
        hcLight: exports.SIDE_BAR_FOREGROUND
    }, (0, nls_1.localize)('sideBarTitleForeground', "Side bar title foreground color. The side bar is the container for views like explorer and search."));
    exports.SIDE_BAR_DRAG_AND_DROP_BACKGROUND = (0, colorRegistry_1.registerColor)('sideBar.dropBackground', {
        dark: exports.EDITOR_DRAG_AND_DROP_BACKGROUND,
        light: exports.EDITOR_DRAG_AND_DROP_BACKGROUND,
        hcDark: exports.EDITOR_DRAG_AND_DROP_BACKGROUND,
        hcLight: exports.EDITOR_DRAG_AND_DROP_BACKGROUND
    }, (0, nls_1.localize)('sideBarDragAndDropBackground', "Drag and drop feedback color for the side bar sections. The color should have transparency so that the side bar sections can still shine through. The side bar is the container for views like explorer and search. Side bar sections are views nested within the side bar."));
    exports.SIDE_BAR_SECTION_HEADER_BACKGROUND = (0, colorRegistry_1.registerColor)('sideBarSectionHeader.background', {
        dark: color_1.Color.fromHex('#808080').transparent(0.2),
        light: color_1.Color.fromHex('#808080').transparent(0.2),
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)('sideBarSectionHeaderBackground', "Side bar section header background color. The side bar is the container for views like explorer and search. Side bar sections are views nested within the side bar."));
    exports.SIDE_BAR_SECTION_HEADER_FOREGROUND = (0, colorRegistry_1.registerColor)('sideBarSectionHeader.foreground', {
        dark: exports.SIDE_BAR_FOREGROUND,
        light: exports.SIDE_BAR_FOREGROUND,
        hcDark: exports.SIDE_BAR_FOREGROUND,
        hcLight: exports.SIDE_BAR_FOREGROUND
    }, (0, nls_1.localize)('sideBarSectionHeaderForeground', "Side bar section header foreground color. The side bar is the container for views like explorer and search. Side bar sections are views nested within the side bar."));
    exports.SIDE_BAR_SECTION_HEADER_BORDER = (0, colorRegistry_1.registerColor)('sideBarSectionHeader.border', {
        dark: colorRegistry_1.contrastBorder,
        light: colorRegistry_1.contrastBorder,
        hcDark: colorRegistry_1.contrastBorder,
        hcLight: colorRegistry_1.contrastBorder
    }, (0, nls_1.localize)('sideBarSectionHeaderBorder', "Side bar section header border color. The side bar is the container for views like explorer and search. Side bar sections are views nested within the side bar."));
    // < --- Title Bar --- >
    exports.TITLE_BAR_ACTIVE_FOREGROUND = (0, colorRegistry_1.registerColor)('titleBar.activeForeground', {
        dark: '#CCCCCC',
        light: '#333333',
        hcDark: '#FFFFFF',
        hcLight: '#292929'
    }, (0, nls_1.localize)('titleBarActiveForeground', "Title bar foreground when the window is active."));
    exports.TITLE_BAR_INACTIVE_FOREGROUND = (0, colorRegistry_1.registerColor)('titleBar.inactiveForeground', {
        dark: (0, colorRegistry_1.transparent)(exports.TITLE_BAR_ACTIVE_FOREGROUND, 0.6),
        light: (0, colorRegistry_1.transparent)(exports.TITLE_BAR_ACTIVE_FOREGROUND, 0.6),
        hcDark: null,
        hcLight: '#292929'
    }, (0, nls_1.localize)('titleBarInactiveForeground', "Title bar foreground when the window is inactive."));
    exports.TITLE_BAR_ACTIVE_BACKGROUND = (0, colorRegistry_1.registerColor)('titleBar.activeBackground', {
        dark: '#3C3C3C',
        light: '#DDDDDD',
        hcDark: '#000000',
        hcLight: '#FFFFFF'
    }, (0, nls_1.localize)('titleBarActiveBackground', "Title bar background when the window is active."));
    exports.TITLE_BAR_INACTIVE_BACKGROUND = (0, colorRegistry_1.registerColor)('titleBar.inactiveBackground', {
        dark: (0, colorRegistry_1.transparent)(exports.TITLE_BAR_ACTIVE_BACKGROUND, 0.6),
        light: (0, colorRegistry_1.transparent)(exports.TITLE_BAR_ACTIVE_BACKGROUND, 0.6),
        hcDark: null,
        hcLight: null,
    }, (0, nls_1.localize)('titleBarInactiveBackground', "Title bar background when the window is inactive."));
    exports.TITLE_BAR_BORDER = (0, colorRegistry_1.registerColor)('titleBar.border', {
        dark: null,
        light: null,
        hcDark: colorRegistry_1.contrastBorder,
        hcLight: colorRegistry_1.contrastBorder
    }, (0, nls_1.localize)('titleBarBorder', "Title bar border color."));
    // < --- Menubar --- >
    exports.MENUBAR_SELECTION_FOREGROUND = (0, colorRegistry_1.registerColor)('menubar.selectionForeground', {
        dark: exports.TITLE_BAR_ACTIVE_FOREGROUND,
        light: exports.TITLE_BAR_ACTIVE_FOREGROUND,
        hcDark: exports.TITLE_BAR_ACTIVE_FOREGROUND,
        hcLight: exports.TITLE_BAR_ACTIVE_FOREGROUND,
    }, (0, nls_1.localize)('menubarSelectionForeground', "Foreground color of the selected menu item in the menubar."));
    exports.MENUBAR_SELECTION_BACKGROUND = (0, colorRegistry_1.registerColor)('menubar.selectionBackground', {
        dark: colorRegistry_1.toolbarHoverBackground,
        light: colorRegistry_1.toolbarHoverBackground,
        hcDark: null,
        hcLight: null,
    }, (0, nls_1.localize)('menubarSelectionBackground', "Background color of the selected menu item in the menubar."));
    exports.MENUBAR_SELECTION_BORDER = (0, colorRegistry_1.registerColor)('menubar.selectionBorder', {
        dark: null,
        light: null,
        hcDark: colorRegistry_1.activeContrastBorder,
        hcLight: colorRegistry_1.activeContrastBorder,
    }, (0, nls_1.localize)('menubarSelectionBorder', "Border color of the selected menu item in the menubar."));
    // < --- Command Center --- >
    // foreground (inactive and active)
    exports.COMMAND_CENTER_FOREGROUND = (0, colorRegistry_1.registerColor)('commandCenter.foreground', { dark: exports.TITLE_BAR_ACTIVE_FOREGROUND, hcDark: exports.TITLE_BAR_ACTIVE_FOREGROUND, light: exports.TITLE_BAR_ACTIVE_FOREGROUND, hcLight: exports.TITLE_BAR_ACTIVE_FOREGROUND }, (0, nls_1.localize)('commandCenter-foreground', "Foreground color of the command center"), false);
    exports.COMMAND_CENTER_ACTIVEFOREGROUND = (0, colorRegistry_1.registerColor)('commandCenter.activeForeground', { dark: exports.MENUBAR_SELECTION_FOREGROUND, hcDark: exports.MENUBAR_SELECTION_FOREGROUND, light: exports.MENUBAR_SELECTION_FOREGROUND, hcLight: exports.MENUBAR_SELECTION_FOREGROUND }, (0, nls_1.localize)('commandCenter-activeForeground', "Active foreground color of the command center"), false);
    exports.COMMAND_CENTER_INACTIVEFOREGROUND = (0, colorRegistry_1.registerColor)('commandCenter.inactiveForeground', { dark: exports.TITLE_BAR_INACTIVE_FOREGROUND, hcDark: exports.TITLE_BAR_INACTIVE_FOREGROUND, light: exports.TITLE_BAR_INACTIVE_FOREGROUND, hcLight: exports.TITLE_BAR_INACTIVE_FOREGROUND }, (0, nls_1.localize)('commandCenter-inactiveForeground', "Foreground color of the command center when the window is inactive"), false);
    // background (inactive and active)
    exports.COMMAND_CENTER_BACKGROUND = (0, colorRegistry_1.registerColor)('commandCenter.background', { dark: color_1.Color.white.transparent(0.05), hcDark: null, light: color_1.Color.black.transparent(0.05), hcLight: null }, (0, nls_1.localize)('commandCenter-background', "Background color of the command center"), false);
    exports.COMMAND_CENTER_ACTIVEBACKGROUND = (0, colorRegistry_1.registerColor)('commandCenter.activeBackground', { dark: color_1.Color.white.transparent(0.08), hcDark: exports.MENUBAR_SELECTION_BACKGROUND, light: color_1.Color.black.transparent(0.08), hcLight: exports.MENUBAR_SELECTION_BACKGROUND }, (0, nls_1.localize)('commandCenter-activeBackground', "Active background color of the command center"), false);
    // border: active and inactive. defaults to active background
    exports.COMMAND_CENTER_BORDER = (0, colorRegistry_1.registerColor)('commandCenter.border', { dark: (0, colorRegistry_1.transparent)(exports.TITLE_BAR_ACTIVE_FOREGROUND, .20), hcDark: (0, colorRegistry_1.transparent)(exports.TITLE_BAR_ACTIVE_FOREGROUND, .60), light: (0, colorRegistry_1.transparent)(exports.TITLE_BAR_ACTIVE_FOREGROUND, .20), hcLight: (0, colorRegistry_1.transparent)(exports.TITLE_BAR_ACTIVE_FOREGROUND, .60) }, (0, nls_1.localize)('commandCenter-border', "Border color of the command center"), false);
    exports.COMMAND_CENTER_ACTIVEBORDER = (0, colorRegistry_1.registerColor)('commandCenter.activeBorder', { dark: (0, colorRegistry_1.transparent)(exports.TITLE_BAR_ACTIVE_FOREGROUND, .30), hcDark: exports.TITLE_BAR_ACTIVE_FOREGROUND, light: (0, colorRegistry_1.transparent)(exports.TITLE_BAR_ACTIVE_FOREGROUND, .30), hcLight: exports.TITLE_BAR_ACTIVE_FOREGROUND }, (0, nls_1.localize)('commandCenter-activeBorder', "Active border color of the command center"), false);
    // border: defaults to active background
    exports.COMMAND_CENTER_INACTIVEBORDER = (0, colorRegistry_1.registerColor)('commandCenter.inactiveBorder', { dark: (0, colorRegistry_1.transparent)(exports.TITLE_BAR_INACTIVE_FOREGROUND, .25), hcDark: (0, colorRegistry_1.transparent)(exports.TITLE_BAR_INACTIVE_FOREGROUND, .25), light: (0, colorRegistry_1.transparent)(exports.TITLE_BAR_INACTIVE_FOREGROUND, .25), hcLight: (0, colorRegistry_1.transparent)(exports.TITLE_BAR_INACTIVE_FOREGROUND, .25) }, (0, nls_1.localize)('commandCenter-inactiveBorder', "Border color of the command center when the window is inactive"), false);
    // < --- Notifications --- >
    exports.NOTIFICATIONS_CENTER_BORDER = (0, colorRegistry_1.registerColor)('notificationCenter.border', {
        dark: colorRegistry_1.widgetBorder,
        light: colorRegistry_1.widgetBorder,
        hcDark: colorRegistry_1.contrastBorder,
        hcLight: colorRegistry_1.contrastBorder
    }, (0, nls_1.localize)('notificationCenterBorder', "Notifications center border color. Notifications slide in from the bottom right of the window."));
    exports.NOTIFICATIONS_TOAST_BORDER = (0, colorRegistry_1.registerColor)('notificationToast.border', {
        dark: colorRegistry_1.widgetBorder,
        light: colorRegistry_1.widgetBorder,
        hcDark: colorRegistry_1.contrastBorder,
        hcLight: colorRegistry_1.contrastBorder
    }, (0, nls_1.localize)('notificationToastBorder', "Notification toast border color. Notifications slide in from the bottom right of the window."));
    exports.NOTIFICATIONS_FOREGROUND = (0, colorRegistry_1.registerColor)('notifications.foreground', {
        dark: colorRegistry_1.editorWidgetForeground,
        light: colorRegistry_1.editorWidgetForeground,
        hcDark: colorRegistry_1.editorWidgetForeground,
        hcLight: colorRegistry_1.editorWidgetForeground
    }, (0, nls_1.localize)('notificationsForeground', "Notifications foreground color. Notifications slide in from the bottom right of the window."));
    exports.NOTIFICATIONS_BACKGROUND = (0, colorRegistry_1.registerColor)('notifications.background', {
        dark: colorRegistry_1.editorWidgetBackground,
        light: colorRegistry_1.editorWidgetBackground,
        hcDark: colorRegistry_1.editorWidgetBackground,
        hcLight: colorRegistry_1.editorWidgetBackground
    }, (0, nls_1.localize)('notificationsBackground', "Notifications background color. Notifications slide in from the bottom right of the window."));
    exports.NOTIFICATIONS_LINKS = (0, colorRegistry_1.registerColor)('notificationLink.foreground', {
        dark: colorRegistry_1.textLinkForeground,
        light: colorRegistry_1.textLinkForeground,
        hcDark: colorRegistry_1.textLinkForeground,
        hcLight: colorRegistry_1.textLinkForeground
    }, (0, nls_1.localize)('notificationsLink', "Notification links foreground color. Notifications slide in from the bottom right of the window."));
    exports.NOTIFICATIONS_CENTER_HEADER_FOREGROUND = (0, colorRegistry_1.registerColor)('notificationCenterHeader.foreground', {
        dark: null,
        light: null,
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)('notificationCenterHeaderForeground', "Notifications center header foreground color. Notifications slide in from the bottom right of the window."));
    exports.NOTIFICATIONS_CENTER_HEADER_BACKGROUND = (0, colorRegistry_1.registerColor)('notificationCenterHeader.background', {
        dark: (0, colorRegistry_1.lighten)(exports.NOTIFICATIONS_BACKGROUND, 0.3),
        light: (0, colorRegistry_1.darken)(exports.NOTIFICATIONS_BACKGROUND, 0.05),
        hcDark: exports.NOTIFICATIONS_BACKGROUND,
        hcLight: exports.NOTIFICATIONS_BACKGROUND
    }, (0, nls_1.localize)('notificationCenterHeaderBackground', "Notifications center header background color. Notifications slide in from the bottom right of the window."));
    exports.NOTIFICATIONS_BORDER = (0, colorRegistry_1.registerColor)('notifications.border', {
        dark: exports.NOTIFICATIONS_CENTER_HEADER_BACKGROUND,
        light: exports.NOTIFICATIONS_CENTER_HEADER_BACKGROUND,
        hcDark: exports.NOTIFICATIONS_CENTER_HEADER_BACKGROUND,
        hcLight: exports.NOTIFICATIONS_CENTER_HEADER_BACKGROUND
    }, (0, nls_1.localize)('notificationsBorder', "Notifications border color separating from other notifications in the notifications center. Notifications slide in from the bottom right of the window."));
    exports.NOTIFICATIONS_ERROR_ICON_FOREGROUND = (0, colorRegistry_1.registerColor)('notificationsErrorIcon.foreground', {
        dark: colorRegistry_1.editorErrorForeground,
        light: colorRegistry_1.editorErrorForeground,
        hcDark: colorRegistry_1.editorErrorForeground,
        hcLight: colorRegistry_1.editorErrorForeground
    }, (0, nls_1.localize)('notificationsErrorIconForeground', "The color used for the icon of error notifications. Notifications slide in from the bottom right of the window."));
    exports.NOTIFICATIONS_WARNING_ICON_FOREGROUND = (0, colorRegistry_1.registerColor)('notificationsWarningIcon.foreground', {
        dark: colorRegistry_1.editorWarningForeground,
        light: colorRegistry_1.editorWarningForeground,
        hcDark: colorRegistry_1.editorWarningForeground,
        hcLight: colorRegistry_1.editorWarningForeground
    }, (0, nls_1.localize)('notificationsWarningIconForeground', "The color used for the icon of warning notifications. Notifications slide in from the bottom right of the window."));
    exports.NOTIFICATIONS_INFO_ICON_FOREGROUND = (0, colorRegistry_1.registerColor)('notificationsInfoIcon.foreground', {
        dark: colorRegistry_1.editorInfoForeground,
        light: colorRegistry_1.editorInfoForeground,
        hcDark: colorRegistry_1.editorInfoForeground,
        hcLight: colorRegistry_1.editorInfoForeground
    }, (0, nls_1.localize)('notificationsInfoIconForeground', "The color used for the icon of info notifications. Notifications slide in from the bottom right of the window."));
    exports.WINDOW_ACTIVE_BORDER = (0, colorRegistry_1.registerColor)('window.activeBorder', {
        dark: null,
        light: null,
        hcDark: colorRegistry_1.contrastBorder,
        hcLight: colorRegistry_1.contrastBorder
    }, (0, nls_1.localize)('windowActiveBorder', "The color used for the border of the window when it is active. Only supported in the macOS and Linux desktop client when using the custom title bar."));
    exports.WINDOW_INACTIVE_BORDER = (0, colorRegistry_1.registerColor)('window.inactiveBorder', {
        dark: null,
        light: null,
        hcDark: colorRegistry_1.contrastBorder,
        hcLight: colorRegistry_1.contrastBorder
    }, (0, nls_1.localize)('windowInactiveBorder', "The color used for the border of the window when it is inactive. Only supported in the macOS and Linux desktop client when using the custom title bar."));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhlbWUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29tbW9uL3RoZW1lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVFoRywyQ0FBMkM7SUFFM0MsU0FBZ0Isb0JBQW9CLENBQUMsS0FBa0I7UUFDdEQsUUFBUSxLQUFLLENBQUMsSUFBSSxFQUFFO1lBQ25CLEtBQUssbUJBQVcsQ0FBQyxLQUFLO2dCQUNyQixPQUFPLGFBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDakMsS0FBSyxtQkFBVyxDQUFDLG1CQUFtQjtnQkFDbkMsT0FBTyxhQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2pDLEtBQUssbUJBQVcsQ0FBQyxrQkFBa0I7Z0JBQ2xDLE9BQU8sYUFBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNqQztnQkFDQyxPQUFPLGFBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDakM7SUFDRixDQUFDO0lBWEQsb0RBV0M7SUFFRCxtQkFBbUI7SUFFbkIsd0JBQXdCO0lBRVgsUUFBQSxxQkFBcUIsR0FBRyxJQUFBLDZCQUFhLEVBQUMsc0JBQXNCLEVBQUU7UUFDMUUsSUFBSSxFQUFFLGdDQUFnQjtRQUN0QixLQUFLLEVBQUUsZ0NBQWdCO1FBQ3ZCLE1BQU0sRUFBRSxnQ0FBZ0I7UUFDeEIsT0FBTyxFQUFFLGdDQUFnQjtLQUN6QixFQUFFLElBQUEsY0FBUSxFQUFDLHFCQUFxQixFQUFFLCtMQUErTCxDQUFDLENBQUMsQ0FBQztJQUV4TixRQUFBLCtCQUErQixHQUFHLElBQUEsNkJBQWEsRUFBQywrQkFBK0IsRUFBRTtRQUM3RixJQUFJLEVBQUUsNkJBQXFCO1FBQzNCLEtBQUssRUFBRSw2QkFBcUI7UUFDNUIsTUFBTSxFQUFFLDZCQUFxQjtRQUM3QixPQUFPLEVB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