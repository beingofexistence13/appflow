/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/browser/config/fontMeasurements", "vs/editor/common/config/fontInfo", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, browser_1, event_1, lifecycle_1, fontMeasurements_1, fontInfo_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookOptions = exports.OutputInnerContainerTopPadding = exports.getEditorTopPadding = exports.updateEditorTopPadding = void 0;
    const SCROLLABLE_ELEMENT_PADDING_TOP = 18;
    let EDITOR_TOP_PADDING = 12;
    const editorTopPaddingChangeEmitter = new event_1.Emitter();
    const EditorTopPaddingChangeEvent = editorTopPaddingChangeEmitter.event;
    function updateEditorTopPadding(top) {
        EDITOR_TOP_PADDING = top;
        editorTopPaddingChangeEmitter.fire();
    }
    exports.updateEditorTopPadding = updateEditorTopPadding;
    function getEditorTopPadding() {
        return EDITOR_TOP_PADDING;
    }
    exports.getEditorTopPadding = getEditorTopPadding;
    exports.OutputInnerContainerTopPadding = 4;
    const defaultConfigConstants = Object.freeze({
        codeCellLeftMargin: 28,
        cellRunGutter: 32,
        markdownCellTopMargin: 8,
        markdownCellBottomMargin: 8,
        markdownCellLeftMargin: 0,
        markdownCellGutter: 32,
        focusIndicatorLeftMargin: 4
    });
    const compactConfigConstants = Object.freeze({
        codeCellLeftMargin: 8,
        cellRunGutter: 36,
        markdownCellTopMargin: 6,
        markdownCellBottomMargin: 6,
        markdownCellLeftMargin: 8,
        markdownCellGutter: 36,
        focusIndicatorLeftMargin: 4
    });
    class NotebookOptions extends lifecycle_1.Disposable {
        constructor(configurationService, notebookExecutionStateService, isReadonly, overrides) {
            super();
            this.configurationService = configurationService;
            this.notebookExecutionStateService = notebookExecutionStateService;
            this.isReadonly = isReadonly;
            this.overrides = overrides;
            this._onDidChangeOptions = this._register(new event_1.Emitter());
            this.onDidChangeOptions = this._onDidChangeOptions.event;
            const showCellStatusBar = this.configurationService.getValue(notebookCommon_1.NotebookSetting.showCellStatusBar);
            const globalToolbar = overrides?.globalToolbar ?? this.configurationService.getValue(notebookCommon_1.NotebookSetting.globalToolbar) ?? true;
            const stickyScroll = overrides?.stickyScroll ?? this.configurationService.getValue(notebookCommon_1.NotebookSetting.stickyScroll) ?? false;
            const consolidatedOutputButton = this.configurationService.getValue(notebookCommon_1.NotebookSetting.consolidatedOutputButton) ?? true;
            const consolidatedRunButton = this.configurationService.getValue(notebookCommon_1.NotebookSetting.consolidatedRunButton) ?? false;
            const dragAndDropEnabled = overrides?.dragAndDropEnabled ?? this.configurationService.getValue(notebookCommon_1.NotebookSetting.dragAndDropEnabled) ?? true;
            const cellToolbarLocation = this.configurationService.getValue(notebookCommon_1.NotebookSetting.cellToolbarLocation) ?? { 'default': 'right' };
            const cellToolbarInteraction = overrides?.cellToolbarInteraction ?? this.configurationService.getValue(notebookCommon_1.NotebookSetting.cellToolbarVisibility);
            const compactView = this.configurationService.getValue(notebookCommon_1.NotebookSetting.compactView) ?? true;
            const focusIndicator = this._computeFocusIndicatorOption();
            const insertToolbarPosition = this._computeInsertToolbarPositionOption(this.isReadonly);
            const insertToolbarAlignment = this._computeInsertToolbarAlignmentOption();
            const showFoldingControls = this._computeShowFoldingControlsOption();
            // const { bottomToolbarGap, bottomToolbarHeight } = this._computeBottomToolbarDimensions(compactView, insertToolbarPosition, insertToolbarAlignment);
            const fontSize = this.configurationService.getValue('editor.fontSize');
            const markupFontSize = this.configurationService.getValue(notebookCommon_1.NotebookSetting.markupFontSize);
            const editorOptionsCustomizations = this.configurationService.getValue(notebookCommon_1.NotebookSetting.cellEditorOptionsCustomizations);
            const interactiveWindowCollapseCodeCells = this.configurationService.getValue(notebookCommon_1.NotebookSetting.interactiveWindowCollapseCodeCells);
            // TOOD @rebornix remove after a few iterations of deprecated setting
            let outputLineHeightSettingValue;
            const deprecatedOutputLineHeightSetting = this.configurationService.getValue(notebookCommon_1.NotebookSetting.outputLineHeightDeprecated);
            if (deprecatedOutputLineHeightSetting !== undefined) {
                this._migrateDeprecatedSetting(notebookCommon_1.NotebookSetting.outputLineHeightDeprecated, notebookCommon_1.NotebookSetting.outputLineHeight);
                outputLineHeightSettingValue = deprecatedOutputLineHeightSetting;
            }
            else {
                outputLineHeightSettingValue = this.configurationService.getValue(notebookCommon_1.NotebookSetting.outputLineHeight);
            }
            let outputFontSize;
            const deprecatedOutputFontSizeSetting = this.configurationService.getValue(notebookCommon_1.NotebookSetting.outputFontSizeDeprecated);
            if (deprecatedOutputFontSizeSetting !== undefined) {
                this._migrateDeprecatedSetting(notebookCommon_1.NotebookSetting.outputFontSizeDeprecated, notebookCommon_1.NotebookSetting.outputFontSize);
                outputFontSize = deprecatedOutputFontSizeSetting;
            }
            else {
                outputFontSize = this.configurationService.getValue(notebookCommon_1.NotebookSetting.outputFontSize) || fontSize;
            }
            let outputFontFamily;
            const deprecatedOutputFontFamilySetting = this.configurationService.getValue(notebookCommon_1.NotebookSetting.outputFontFamilyDeprecated);
            if (deprecatedOutputFontFamilySetting !== undefined) {
                this._migrateDeprecatedSetting(notebookCommon_1.NotebookSetting.outputFontFamilyDeprecated, notebookCommon_1.NotebookSetting.outputFontFamily);
                outputFontFamily = deprecatedOutputFontFamilySetting;
            }
            else {
                outputFontFamily = this.configurationService.getValue(notebookCommon_1.NotebookSetting.outputFontFamily);
            }
            let outputScrolling;
            const deprecatedOutputScrollingSetting = this.configurationService.getValue(notebookCommon_1.NotebookSetting.outputScrollingDeprecated);
            if (deprecatedOutputScrollingSetting !== undefined) {
                this._migrateDeprecatedSetting(notebookCommon_1.NotebookSetting.outputScrollingDeprecated, notebookCommon_1.NotebookSetting.outputScrolling);
                outputScrolling = deprecatedOutputScrollingSetting;
            }
            else {
                outputScrolling = this.configurationService.getValue(notebookCommon_1.NotebookSetting.outputScrolling);
            }
            const outputLineHeight = this._computeOutputLineHeight(outputLineHeightSettingValue, outputFontSize);
            const outputWordWrap = this.configurationService.getValue(notebookCommon_1.NotebookSetting.outputWordWrap);
            const outputLineLimit = this.configurationService.getValue(notebookCommon_1.NotebookSetting.textOutputLineLimit) ?? 30;
            this._layoutConfiguration = {
                ...(compactView ? compactConfigConstants : defaultConfigConstants),
                cellTopMargin: 6,
                cellBottomMargin: 6,
                cellRightMargin: 16,
                cellStatusBarHeight: 22,
                cellOutputPadding: 8,
                markdownPreviewPadding: 8,
                // bottomToolbarHeight: bottomToolbarHeight,
                // bottomToolbarGap: bottomToolbarGap,
                editorToolbarHeight: 0,
                editorTopPadding: EDITOR_TOP_PADDING,
                editorBottomPadding: 4,
                editorBottomPaddingWithoutStatusBar: 12,
                collapsedIndicatorHeight: 28,
                showCellStatusBar,
                globalToolbar,
                stickyScroll,
                consolidatedOutputButton,
                consolidatedRunButton,
                dragAndDropEnabled,
                cellToolbarLocation,
                cellToolbarInteraction,
                compactView,
                focusIndicator,
                insertToolbarPosition,
                insertToolbarAlignment,
                showFoldingControls,
                fontSize,
                outputFontSize,
                outputFontFamily,
                outputLineHeight,
                markupFontSize,
                editorOptionsCustomizations,
                focusIndicatorGap: 3,
                interactiveWindowCollapseCodeCells,
                markdownFoldHintHeight: 22,
                outputScrolling: outputScrolling,
                outputWordWrap: outputWordWrap,
                outputLineLimit: outputLineLimit
            };
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                this._updateConfiguration(e);
            }));
            this._register(EditorTopPaddingChangeEvent(() => {
                const configuration = Object.assign({}, this._layoutConfiguration);
                configuration.editorTopPadding = getEditorTopPadding();
                this._layoutConfiguration = configuration;
                this._onDidChangeOptions.fire({ editorTopPadding: true });
            }));
        }
        updateOptions(isReadonly) {
            if (this.isReadonly !== isReadonly) {
                this.isReadonly = isReadonly;
                this._updateConfiguration({
                    affectsConfiguration(configuration) {
                        return configuration === notebookCommon_1.NotebookSetting.insertToolbarLocation;
                    },
                    source: 7 /* ConfigurationTarget.DEFAULT */,
                    affectedKeys: new Set([notebookCommon_1.NotebookSetting.insertToolbarLocation]),
                    change: { keys: [notebookCommon_1.NotebookSetting.insertToolbarLocation], overrides: [] },
                    sourceConfig: undefined
                });
            }
        }
        _migrateDeprecatedSetting(deprecatedKey, key) {
            const deprecatedSetting = this.configurationService.inspect(deprecatedKey);
            if (deprecatedSetting.application !== undefined) {
                this.configurationService.updateValue(deprecatedKey, undefined, 1 /* ConfigurationTarget.APPLICATION */);
                this.configurationService.updateValue(key, deprecatedSetting.application.value, 1 /* ConfigurationTarget.APPLICATION */);
            }
            if (deprecatedSetting.user !== undefined) {
                this.configurationService.updateValue(deprecatedKey, undefined, 2 /* ConfigurationTarget.USER */);
                this.configurationService.updateValue(key, deprecatedSetting.user.value, 2 /* ConfigurationTarget.USER */);
            }
            if (deprecatedSetting.userLocal !== undefined) {
                this.configurationService.updateValue(deprecatedKey, undefined, 3 /* ConfigurationTarget.USER_LOCAL */);
                this.configurationService.updateValue(key, deprecatedSetting.userLocal.value, 3 /* ConfigurationTarget.USER_LOCAL */);
            }
            if (deprecatedSetting.userRemote !== undefined) {
                this.configurationService.updateValue(deprecatedKey, undefined, 4 /* ConfigurationTarget.USER_REMOTE */);
                this.configurationService.updateValue(key, deprecatedSetting.userRemote.value, 4 /* ConfigurationTarget.USER_REMOTE */);
            }
            if (deprecatedSetting.workspace !== undefined) {
                this.configurationService.updateValue(deprecatedKey, undefined, 5 /* ConfigurationTarget.WORKSPACE */);
                this.configurationService.updateValue(key, deprecatedSetting.workspace.value, 5 /* ConfigurationTarget.WORKSPACE */);
            }
            if (deprecatedSetting.workspaceFolder !== undefined) {
                this.configurationService.updateValue(deprecatedKey, undefined, 6 /* ConfigurationTarget.WORKSPACE_FOLDER */);
                this.configurationService.updateValue(key, deprecatedSetting.workspaceFolder.value, 6 /* ConfigurationTarget.WORKSPACE_FOLDER */);
            }
        }
        _computeOutputLineHeight(lineHeight, outputFontSize) {
            const minimumLineHeight = 8;
            if (lineHeight === 0) {
                // use editor line height
                const editorOptions = this.configurationService.getValue('editor');
                const fontInfo = fontMeasurements_1.FontMeasurements.readFontInfo(fontInfo_1.BareFontInfo.createFromRawSettings(editorOptions, browser_1.PixelRatio.value));
                lineHeight = fontInfo.lineHeight;
            }
            else if (lineHeight < minimumLineHeight) {
                // Values too small to be line heights in pixels are in ems.
                let fontSize = outputFontSize;
                if (fontSize === 0) {
                    fontSize = this.configurationService.getValue('editor.fontSize');
                }
                lineHeight = lineHeight * fontSize;
            }
            // Enforce integer, minimum constraints
            lineHeight = Math.round(lineHeight);
            if (lineHeight < minimumLineHeight) {
                lineHeight = minimumLineHeight;
            }
            return lineHeight;
        }
        _updateConfiguration(e) {
            const cellStatusBarVisibility = e.affectsConfiguration(notebookCommon_1.NotebookSetting.showCellStatusBar);
            const cellToolbarLocation = e.affectsConfiguration(notebookCommon_1.NotebookSetting.cellToolbarLocation);
            const cellToolbarInteraction = e.affectsConfiguration(notebookCommon_1.NotebookSetting.cellToolbarVisibility);
            const compactView = e.affectsConfiguration(notebookCommon_1.NotebookSetting.compactView);
            const focusIndicator = e.affectsConfiguration(notebookCommon_1.NotebookSetting.focusIndicator);
            const insertToolbarPosition = e.affectsConfiguration(notebookCommon_1.NotebookSetting.insertToolbarLocation);
            const insertToolbarAlignment = e.affectsConfiguration(notebookCommon_1.NotebookSetting.experimentalInsertToolbarAlignment);
            const globalToolbar = e.affectsConfiguration(notebookCommon_1.NotebookSetting.globalToolbar);
            const stickyScroll = e.affectsConfiguration(notebookCommon_1.NotebookSetting.stickyScroll);
            const consolidatedOutputButton = e.affectsConfiguration(notebookCommon_1.NotebookSetting.consolidatedOutputButton);
            const consolidatedRunButton = e.affectsConfiguration(notebookCommon_1.NotebookSetting.consolidatedRunButton);
            const showFoldingControls = e.affectsConfiguration(notebookCommon_1.NotebookSetting.showFoldingControls);
            const dragAndDropEnabled = e.affectsConfiguration(notebookCommon_1.NotebookSetting.dragAndDropEnabled);
            const fontSize = e.affectsConfiguration('editor.fontSize');
            const outputFontSize = e.affectsConfiguration(notebookCommon_1.NotebookSetting.outputFontSize);
            const markupFontSize = e.affectsConfiguration(notebookCommon_1.NotebookSetting.markupFontSize);
            const fontFamily = e.affectsConfiguration('editor.fontFamily');
            const outputFontFamily = e.affectsConfiguration(notebookCommon_1.NotebookSetting.outputFontFamily);
            const editorOptionsCustomizations = e.affectsConfiguration(notebookCommon_1.NotebookSetting.cellEditorOptionsCustomizations);
            const interactiveWindowCollapseCodeCells = e.affectsConfiguration(notebookCommon_1.NotebookSetting.interactiveWindowCollapseCodeCells);
            const outputLineHeight = e.affectsConfiguration(notebookCommon_1.NotebookSetting.outputLineHeight);
            const outputScrolling = e.affectsConfiguration(notebookCommon_1.NotebookSetting.outputScrolling);
            const outputWordWrap = e.affectsConfiguration(notebookCommon_1.NotebookSetting.outputWordWrap);
            if (!cellStatusBarVisibility
                && !cellToolbarLocation
                && !cellToolbarInteraction
                && !compactView
                && !focusIndicator
                && !insertToolbarPosition
                && !insertToolbarAlignment
                && !globalToolbar
                && !stickyScroll
                && !consolidatedOutputButton
                && !consolidatedRunButton
                && !showFoldingControls
                && !dragAndDropEnabled
                && !fontSize
                && !outputFontSize
                && !markupFontSize
                && !fontFamily
                && !outputFontFamily
                && !editorOptionsCustomizations
                && !interactiveWindowCollapseCodeCells
                && !outputLineHeight
                && !outputScrolling
                && !outputWordWrap) {
                return;
            }
            let configuration = Object.assign({}, this._layoutConfiguration);
            if (cellStatusBarVisibility) {
                configuration.showCellStatusBar = this.configurationService.getValue(notebookCommon_1.NotebookSetting.showCellStatusBar);
            }
            if (cellToolbarLocation) {
                configuration.cellToolbarLocation = this.configurationService.getValue(notebookCommon_1.NotebookSetting.cellToolbarLocation) ?? { 'default': 'right' };
            }
            if (cellToolbarInteraction && !this.overrides?.cellToolbarInteraction) {
                configuration.cellToolbarInteraction = this.configurationService.getValue(notebookCommon_1.NotebookSetting.cellToolbarVisibility);
            }
            if (focusIndicator) {
                configuration.focusIndicator = this._computeFocusIndicatorOption();
            }
            if (compactView) {
                const compactViewValue = this.configurationService.getValue(notebookCommon_1.NotebookSetting.compactView) ?? true;
                configuration = Object.assign(configuration, {
                    ...(compactViewValue ? compactConfigConstants : defaultConfigConstants),
                });
                configuration.compactView = compactViewValue;
            }
            if (insertToolbarAlignment) {
                configuration.insertToolbarAlignment = this._computeInsertToolbarAlignmentOption();
            }
            if (insertToolbarPosition) {
                configuration.insertToolbarPosition = this._computeInsertToolbarPositionOption(this.isReadonly);
            }
            if (globalToolbar && this.overrides?.globalToolbar === undefined) {
                configuration.globalToolbar = this.configurationService.getValue(notebookCommon_1.NotebookSetting.globalToolbar) ?? true;
            }
            if (stickyScroll && this.overrides?.stickyScroll === undefined) {
                configuration.stickyScroll = this.configurationService.getValue(notebookCommon_1.NotebookSetting.stickyScroll) ?? false;
            }
            if (consolidatedOutputButton) {
                configuration.consolidatedOutputButton = this.configurationService.getValue(notebookCommon_1.NotebookSetting.consolidatedOutputButton) ?? true;
            }
            if (consolidatedRunButton) {
                configuration.consolidatedRunButton = this.configurationService.getValue(notebookCommon_1.NotebookSetting.consolidatedRunButton) ?? true;
            }
            if (showFoldingControls) {
                configuration.showFoldingControls = this._computeShowFoldingControlsOption();
            }
            if (dragAndDropEnabled) {
                configuration.dragAndDropEnabled = this.configurationService.getValue(notebookCommon_1.NotebookSetting.dragAndDropEnabled) ?? true;
            }
            if (fontSize) {
                configuration.fontSize = this.configurationService.getValue('editor.fontSize');
            }
            if (outputFontSize) {
                configuration.outputFontSize = this.configurationService.getValue(notebookCommon_1.NotebookSetting.outputFontSize) || configuration.fontSize;
            }
            if (markupFontSize) {
                configuration.markupFontSize = this.configurationService.getValue(notebookCommon_1.NotebookSetting.markupFontSize);
            }
            if (outputFontFamily) {
                configuration.outputFontFamily = this.configurationService.getValue(notebookCommon_1.NotebookSetting.outputFontFamily);
            }
            if (editorOptionsCustomizations) {
                configuration.editorOptionsCustomizations = this.configurationService.getValue(notebookCommon_1.NotebookSetting.cellEditorOptionsCustomizations);
            }
            if (interactiveWindowCollapseCodeCells) {
                configuration.interactiveWindowCollapseCodeCells = this.configurationService.getValue(notebookCommon_1.NotebookSetting.interactiveWindowCollapseCodeCells);
            }
            if (outputLineHeight || fontSize || outputFontSize) {
                const lineHeight = this.configurationService.getValue(notebookCommon_1.NotebookSetting.outputLineHeight);
                configuration.outputLineHeight = this._computeOutputLineHeight(lineHeight, configuration.outputFontSize);
            }
            if (outputWordWrap) {
                configuration.outputWordWrap = this.configurationService.getValue(notebookCommon_1.NotebookSetting.outputWordWrap);
            }
            if (outputScrolling) {
                configuration.outputScrolling = this.configurationService.getValue(notebookCommon_1.NotebookSetting.outputScrolling);
            }
            this._layoutConfiguration = Object.freeze(configuration);
            // trigger event
            this._onDidChangeOptions.fire({
                cellStatusBarVisibility,
                cellToolbarLocation,
                cellToolbarInteraction,
                compactView,
                focusIndicator,
                insertToolbarPosition,
                insertToolbarAlignment,
                globalToolbar,
                stickyScroll,
                showFoldingControls,
                consolidatedOutputButton,
                consolidatedRunButton,
                dragAndDropEnabled,
                fontSize,
                outputFontSize,
                markupFontSize,
                fontFamily,
                outputFontFamily,
                editorOptionsCustomizations,
                interactiveWindowCollapseCodeCells,
                outputLineHeight,
                outputScrolling,
                outputWordWrap
            });
        }
        _computeInsertToolbarPositionOption(isReadOnly) {
            return isReadOnly ? 'hidden' : this.configurationService.getValue(notebookCommon_1.NotebookSetting.insertToolbarLocation) ?? 'both';
        }
        _computeInsertToolbarAlignmentOption() {
            return this.configurationService.getValue(notebookCommon_1.NotebookSetting.experimentalInsertToolbarAlignment) ?? 'center';
        }
        _computeShowFoldingControlsOption() {
            return this.configurationService.getValue(notebookCommon_1.NotebookSetting.showFoldingControls) ?? 'mouseover';
        }
        _computeFocusIndicatorOption() {
            return this.configurationService.getValue(notebookCommon_1.NotebookSetting.focusIndicator) ?? 'gutter';
        }
        getCellCollapseDefault() {
            return this._layoutConfiguration.interactiveWindowCollapseCodeCells === 'never' ?
                {
                    codeCell: {
                        inputCollapsed: false
                    }
                } : {
                codeCell: {
                    inputCollapsed: true
                }
            };
        }
        getLayoutConfiguration() {
            return this._layoutConfiguration;
        }
        computeCollapsedMarkdownCellHeight(viewType) {
            const { bottomToolbarGap } = this.computeBottomToolbarDimensions(viewType);
            return this._layoutConfiguration.markdownCellTopMargin
                + this._layoutConfiguration.collapsedIndicatorHeight
                + bottomToolbarGap
                + this._layoutConfiguration.markdownCellBottomMargin;
        }
        computeBottomToolbarOffset(totalHeight, viewType) {
            const { bottomToolbarGap, bottomToolbarHeight } = this.computeBottomToolbarDimensions(viewType);
            return totalHeight
                - bottomToolbarGap
                - bottomToolbarHeight / 2;
        }
        computeCodeCellEditorWidth(outerWidth) {
            return outerWidth - (this._layoutConfiguration.codeCellLeftMargin
                + this._layoutConfiguration.cellRunGutter
                + this._layoutConfiguration.cellRightMargin);
        }
        computeMarkdownCellEditorWidth(outerWidth) {
            return outerWidth
                - this._layoutConfiguration.markdownCellGutter
                - this._layoutConfiguration.markdownCellLeftMargin
                - this._layoutConfiguration.cellRightMargin;
        }
        computeStatusBarHeight() {
            return this._layoutConfiguration.cellStatusBarHeight;
        }
        _computeBottomToolbarDimensions(compactView, insertToolbarPosition, insertToolbarAlignment, cellToolbar) {
            if (insertToolbarAlignment === 'left' || cellToolbar !== 'hidden') {
                return {
                    bottomToolbarGap: 18,
                    bottomToolbarHeight: 18
                };
            }
            if (insertToolbarPosition === 'betweenCells' || insertToolbarPosition === 'both') {
                return compactView ? {
                    bottomToolbarGap: 12,
                    bottomToolbarHeight: 20
                } : {
                    bottomToolbarGap: 20,
                    bottomToolbarHeight: 20
                };
            }
            else {
                return {
                    bottomToolbarGap: 0,
                    bottomToolbarHeight: 0
                };
            }
        }
        computeBottomToolbarDimensions(viewType) {
            const configuration = this._layoutConfiguration;
            const cellToolbarPosition = this.computeCellToolbarLocation(viewType);
            const { bottomToolbarGap, bottomToolbarHeight } = this._computeBottomToolbarDimensions(configuration.compactView, configuration.insertToolbarPosition, configuration.insertToolbarAlignment, cellToolbarPosition);
            return {
                bottomToolbarGap,
                bottomToolbarHeight
            };
        }
        computeCellToolbarLocation(viewType) {
            const cellToolbarLocation = this._layoutConfiguration.cellToolbarLocation;
            if (typeof cellToolbarLocation === 'string') {
                if (cellToolbarLocation === 'left' || cellToolbarLocation === 'right' || cellToolbarLocation === 'hidden') {
                    return cellToolbarLocation;
                }
            }
            else {
                if (viewType) {
                    const notebookSpecificSetting = cellToolbarLocation[viewType] ?? cellToolbarLocation['default'];
                    let cellToolbarLocationForCurrentView = 'right';
                    switch (notebookSpecificSetting) {
                        case 'left':
                            cellToolbarLocationForCurrentView = 'left';
                            break;
                        case 'right':
                            cellToolbarLocationForCurrentView = 'right';
                            break;
                        case 'hidden':
                            cellToolbarLocationForCurrentView = 'hidden';
                            break;
                        default:
                            cellToolbarLocationForCurrentView = 'right';
                            break;
                    }
                    return cellToolbarLocationForCurrentView;
                }
            }
            return 'right';
        }
        computeTopInsertToolbarHeight(viewType) {
            if (this._layoutConfiguration.insertToolbarPosition === 'betweenCells' || this._layoutConfiguration.insertToolbarPosition === 'both') {
                return SCROLLABLE_ELEMENT_PADDING_TOP;
            }
            const cellToolbarLocation = this.computeCellToolbarLocation(viewType);
            if (cellToolbarLocation === 'left' || cellToolbarLocation === 'right') {
                return SCROLLABLE_ELEMENT_PADDING_TOP;
            }
            return 0;
        }
        computeEditorPadding(internalMetadata, cellUri) {
            return {
                top: getEditorTopPadding(),
                bottom: this.statusBarIsVisible(internalMetadata, cellUri)
                    ? this._layoutConfiguration.editorBottomPadding
                    : this._layoutConfiguration.editorBottomPaddingWithoutStatusBar
            };
        }
        computeEditorStatusbarHeight(internalMetadata, cellUri) {
            return this.statusBarIsVisible(internalMetadata, cellUri) ? this.computeStatusBarHeight() : 0;
        }
        statusBarIsVisible(internalMetadata, cellUri) {
            const exe = this.notebookExecutionStateService.getCellExecution(cellUri);
            if (this._layoutConfiguration.showCellStatusBar === 'visible') {
                return true;
            }
            else if (this._layoutConfiguration.showCellStatusBar === 'visibleAfterExecute') {
                return typeof internalMetadata.lastRunSuccess === 'boolean' || exe !== undefined;
            }
            else {
                return false;
            }
        }
        computeWebviewOptions() {
            return {
                outputNodePadding: this._layoutConfiguration.cellOutputPadding,
                outputNodeLeftPadding: this._layoutConfiguration.cellOutputPadding,
                previewNodePadding: this._layoutConfiguration.markdownPreviewPadding,
                markdownLeftMargin: this._layoutConfiguration.markdownCellGutter + this._layoutConfiguration.markdownCellLeftMargin,
                leftMargin: this._layoutConfiguration.codeCellLeftMargin,
                rightMargin: this._layoutConfiguration.cellRightMargin,
                runGutter: this._layoutConfiguration.cellRunGutter,
                dragAndDropEnabled: this._layoutConfiguration.dragAndDropEnabled,
                fontSize: this._layoutConfiguration.fontSize,
                outputFontSize: this._layoutConfiguration.outputFontSize,
                outputFontFamily: this._layoutConfiguration.outputFontFamily,
                markupFontSize: this._layoutConfiguration.markupFontSize,
                outputLineHeight: this._layoutConfiguration.outputLineHeight,
                outputScrolling: this._layoutConfiguration.outputScrolling,
                outputWordWrap: this._layoutConfiguration.outputWordWrap,
                outputLineLimit: this._layoutConfiguration.outputLineLimit,
            };
        }
        computeDiffWebviewOptions() {
            return {
                outputNodePadding: this._layoutConfiguration.cellOutputPadding,
                outputNodeLeftPadding: 0,
                previewNodePadding: this._layoutConfiguration.markdownPreviewPadding,
                markdownLeftMargin: 0,
                leftMargin: 32,
                rightMargin: 0,
                runGutter: 0,
                dragAndDropEnabled: false,
                fontSize: this._layoutConfiguration.fontSize,
                outputFontSize: this._layoutConfiguration.outputFontSize,
                outputFontFamily: this._layoutConfiguration.outputFontFamily,
                markupFontSize: this._layoutConfiguration.markupFontSize,
                outputLineHeight: this._layoutConfiguration.outputLineHeight,
                outputScrolling: this._layoutConfiguration.outputScrolling,
                outputWordWrap: this._layoutConfiguration.outputWordWrap,
                outputLineLimit: this._layoutConfiguration.outputLineLimit,
            };
        }
        computeIndicatorPosition(totalHeight, foldHintHeight, viewType) {
            const { bottomToolbarGap } = this.computeBottomToolbarDimensions(viewType);
            return {
                bottomIndicatorTop: totalHeight - bottomToolbarGap - this._layoutConfiguration.cellBottomMargin - foldHintHeight,
                verticalIndicatorHeight: totalHeight - bottomToolbarGap - foldHintHeight
            };
        }
    }
    exports.NotebookOptions = NotebookOptions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tPcHRpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci9ub3RlYm9va09wdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBYWhHLE1BQU0sOEJBQThCLEdBQUcsRUFBRSxDQUFDO0lBRTFDLElBQUksa0JBQWtCLEdBQUcsRUFBRSxDQUFDO0lBQzVCLE1BQU0sNkJBQTZCLEdBQUcsSUFBSSxlQUFPLEVBQVEsQ0FBQztJQUUxRCxNQUFNLDJCQUEyQixHQUFHLDZCQUE2QixDQUFDLEtBQUssQ0FBQztJQUV4RSxTQUFnQixzQkFBc0IsQ0FBQyxHQUFXO1FBQ2pELGtCQUFrQixHQUFHLEdBQUcsQ0FBQztRQUN6Qiw2QkFBNkIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN0QyxDQUFDO0lBSEQsd0RBR0M7SUFFRCxTQUFnQixtQkFBbUI7UUFDbEMsT0FBTyxrQkFBa0IsQ0FBQztJQUMzQixDQUFDO0lBRkQsa0RBRUM7SUFFWSxRQUFBLDhCQUE4QixHQUFHLENBQUMsQ0FBQztJQTZFaEQsTUFBTSxzQkFBc0IsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQzVDLGtCQUFrQixFQUFFLEVBQUU7UUFDdEIsYUFBYSxFQUFFLEVBQUU7UUFDakIscUJBQXFCLEVBQUUsQ0FBQztRQUN4Qix3QkFBd0IsRUFBRSxDQUFDO1FBQzNCLHNCQUFzQixFQUFFLENBQUM7UUFDekIsa0JBQWtCLEVBQUUsRUFBRTtRQUN0Qix3QkFBd0IsRUFBRSxDQUFDO0tBQzNCLENBQUMsQ0FBQztJQUVILE1BQU0sc0JBQXNCLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUM1QyxrQkFBa0IsRUFBRSxDQUFDO1FBQ3JCLGFBQWEsRUFBRSxFQUFFO1FBQ2pCLHFCQUFxQixFQUFFLENBQUM7UUFDeEIsd0JBQXdC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