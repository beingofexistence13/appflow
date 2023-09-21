/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/browser/config/fontMeasurements", "vs/editor/common/config/fontInfo", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, browser_1, event_1, lifecycle_1, fontMeasurements_1, fontInfo_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Gbb = exports.$Fbb = exports.$Ebb = exports.$Dbb = void 0;
    const SCROLLABLE_ELEMENT_PADDING_TOP = 18;
    let EDITOR_TOP_PADDING = 12;
    const editorTopPaddingChangeEmitter = new event_1.$fd();
    const EditorTopPaddingChangeEvent = editorTopPaddingChangeEmitter.event;
    function $Dbb(top) {
        EDITOR_TOP_PADDING = top;
        editorTopPaddingChangeEmitter.fire();
    }
    exports.$Dbb = $Dbb;
    function $Ebb() {
        return EDITOR_TOP_PADDING;
    }
    exports.$Ebb = $Ebb;
    exports.$Fbb = 4;
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
    class $Gbb extends lifecycle_1.$kc {
        constructor(c, f, g, h) {
            super();
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.b = this.B(new event_1.$fd());
            this.onDidChangeOptions = this.b.event;
            const showCellStatusBar = this.c.getValue(notebookCommon_1.$7H.showCellStatusBar);
            const globalToolbar = h?.globalToolbar ?? this.c.getValue(notebookCommon_1.$7H.globalToolbar) ?? true;
            const stickyScroll = h?.stickyScroll ?? this.c.getValue(notebookCommon_1.$7H.stickyScroll) ?? false;
            const consolidatedOutputButton = this.c.getValue(notebookCommon_1.$7H.consolidatedOutputButton) ?? true;
            const consolidatedRunButton = this.c.getValue(notebookCommon_1.$7H.consolidatedRunButton) ?? false;
            const dragAndDropEnabled = h?.dragAndDropEnabled ?? this.c.getValue(notebookCommon_1.$7H.dragAndDropEnabled) ?? true;
            const cellToolbarLocation = this.c.getValue(notebookCommon_1.$7H.cellToolbarLocation) ?? { 'default': 'right' };
            const cellToolbarInteraction = h?.cellToolbarInteraction ?? this.c.getValue(notebookCommon_1.$7H.cellToolbarVisibility);
            const compactView = this.c.getValue(notebookCommon_1.$7H.compactView) ?? true;
            const focusIndicator = this.u();
            const insertToolbarPosition = this.r(this.g);
            const insertToolbarAlignment = this.s();
            const showFoldingControls = this.t();
            // const { bottomToolbarGap, bottomToolbarHeight } = this._computeBottomToolbarDimensions(compactView, insertToolbarPosition, insertToolbarAlignment);
            const fontSize = this.c.getValue('editor.fontSize');
            const markupFontSize = this.c.getValue(notebookCommon_1.$7H.markupFontSize);
            const editorOptionsCustomizations = this.c.getValue(notebookCommon_1.$7H.cellEditorOptionsCustomizations);
            const interactiveWindowCollapseCodeCells = this.c.getValue(notebookCommon_1.$7H.interactiveWindowCollapseCodeCells);
            // TOOD @rebornix remove after a few iterations of deprecated setting
            let outputLineHeightSettingValue;
            const deprecatedOutputLineHeightSetting = this.c.getValue(notebookCommon_1.$7H.outputLineHeightDeprecated);
            if (deprecatedOutputLineHeightSetting !== undefined) {
                this.j(notebookCommon_1.$7H.outputLineHeightDeprecated, notebookCommon_1.$7H.outputLineHeight);
                outputLineHeightSettingValue = deprecatedOutputLineHeightSetting;
            }
            else {
                outputLineHeightSettingValue = this.c.getValue(notebookCommon_1.$7H.outputLineHeight);
            }
            let outputFontSize;
            const deprecatedOutputFontSizeSetting = this.c.getValue(notebookCommon_1.$7H.outputFontSizeDeprecated);
            if (deprecatedOutputFontSizeSetting !== undefined) {
                this.j(notebookCommon_1.$7H.outputFontSizeDeprecated, notebookCommon_1.$7H.outputFontSize);
                outputFontSize = deprecatedOutputFontSizeSetting;
            }
            else {
                outputFontSize = this.c.getValue(notebookCommon_1.$7H.outputFontSize) || fontSize;
            }
            let outputFontFamily;
            const deprecatedOutputFontFamilySetting = this.c.getValue(notebookCommon_1.$7H.outputFontFamilyDeprecated);
            if (deprecatedOutputFontFamilySetting !== undefined) {
                this.j(notebookCommon_1.$7H.outputFontFamilyDeprecated, notebookCommon_1.$7H.outputFontFamily);
                outputFontFamily = deprecatedOutputFontFamilySetting;
            }
            else {
                outputFontFamily = this.c.getValue(notebookCommon_1.$7H.outputFontFamily);
            }
            let outputScrolling;
            const deprecatedOutputScrollingSetting = this.c.getValue(notebookCommon_1.$7H.outputScrollingDeprecated);
            if (deprecatedOutputScrollingSetting !== undefined) {
                this.j(notebookCommon_1.$7H.outputScrollingDeprecated, notebookCommon_1.$7H.outputScrolling);
                outputScrolling = deprecatedOutputScrollingSetting;
            }
            else {
                outputScrolling = this.c.getValue(notebookCommon_1.$7H.outputScrolling);
            }
            const outputLineHeight = this.m(outputLineHeightSettingValue, outputFontSize);
            const outputWordWrap = this.c.getValue(notebookCommon_1.$7H.outputWordWrap);
            const outputLineLimit = this.c.getValue(notebookCommon_1.$7H.textOutputLineLimit) ?? 30;
            this.a = {
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
            this.B(this.c.onDidChangeConfiguration(e => {
                this.n(e);
            }));
            this.B(EditorTopPaddingChangeEvent(() => {
                const configuration = Object.assign({}, this.a);
                configuration.editorTopPadding = $Ebb();
                this.a = configuration;
                this.b.fire({ editorTopPadding: true });
            }));
        }
        updateOptions(isReadonly) {
            if (this.g !== isReadonly) {
                this.g = isReadonly;
                this.n({
                    affectsConfiguration(configuration) {
                        return configuration === notebookCommon_1.$7H.insertToolbarLocation;
                    },
                    source: 7 /* ConfigurationTarget.DEFAULT */,
                    affectedKeys: new Set([notebookCommon_1.$7H.insertToolbarLocation]),
                    change: { keys: [notebookCommon_1.$7H.insertToolbarLocation], overrides: [] },
                    sourceConfig: undefined
                });
            }
        }
        j(deprecatedKey, key) {
            const deprecatedSetting = this.c.inspect(deprecatedKey);
            if (deprecatedSetting.application !== undefined) {
                this.c.updateValue(deprecatedKey, undefined, 1 /* ConfigurationTarget.APPLICATION */);
                this.c.updateValue(key, deprecatedSetting.application.value, 1 /* ConfigurationTarget.APPLICATION */);
            }
            if (deprecatedSetting.user !== undefined) {
                this.c.updateValue(deprecatedKey, undefined, 2 /* ConfigurationTarget.USER */);
                this.c.updateValue(key, deprecatedSetting.user.value, 2 /* ConfigurationTarget.USER */);
            }
            if (deprecatedSetting.userLocal !== undefined) {
                this.c.updateValue(deprecatedKey, undefined, 3 /* ConfigurationTarget.USER_LOCAL */);
                this.c.updateValue(key, deprecatedSetting.userLocal.value, 3 /* ConfigurationTarget.USER_LOCAL */);
            }
            if (deprecatedSetting.userRemote !== undefined) {
                this.c.updateValue(deprecatedKey, undefined, 4 /* ConfigurationTarget.USER_REMOTE */);
                this.c.updateValue(key, deprecatedSetting.userRemote.value, 4 /* ConfigurationTarget.USER_REMOTE */);
            }
            if (deprecatedSetting.workspace !== undefined) {
                this.c.updateValue(deprecatedKey, undefined, 5 /* ConfigurationTarget.WORKSPACE */);
                this.c.updateValue(key, deprecatedSetting.workspace.value, 5 /* ConfigurationTarget.WORKSPACE */);
            }
            if (deprecatedSetting.workspaceFolder !== undefined) {
                this.c.updateValue(deprecatedKey, undefined, 6 /* ConfigurationTarget.WORKSPACE_FOLDER */);
                this.c.updateValue(key, deprecatedSetting.workspaceFolder.value, 6 /* ConfigurationTarget.WORKSPACE_FOLDER */);
            }
        }
        m(lineHeight, outputFontSize) {
            const minimumLineHeight = 8;
            if (lineHeight === 0) {
                // use editor line height
                const editorOptions = this.c.getValue('editor');
                const fontInfo = fontMeasurements_1.$zU.readFontInfo(fontInfo_1.$Rr.createFromRawSettings(editorOptions, browser_1.$WN.value));
                lineHeight = fontInfo.lineHeight;
            }
            else if (lineHeight < minimumLineHeight) {
                // Values too small to be line heights in pixels are in ems.
                let fontSize = outputFontSize;
                if (fontSize === 0) {
                    fontSize = this.c.getValue('editor.fontSize');
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
        n(e) {
            const cellStatusBarVisibility = e.affectsConfiguration(notebookCommon_1.$7H.showCellStatusBar);
            const cellToolbarLocation = e.affectsConfiguration(notebookCommon_1.$7H.cellToolbarLocation);
            const cellToolbarInteraction = e.affectsConfiguration(notebookCommon_1.$7H.cellToolbarVisibility);
            const compactView = e.affectsConfiguration(notebookCommon_1.$7H.compactView);
            const focusIndicator = e.affectsConfiguration(notebookCommon_1.$7H.focusIndicator);
            const insertToolbarPosition = e.affectsConfiguration(notebookCommon_1.$7H.insertToolbarLocation);
            const insertToolbarAlignment = e.affectsConfiguration(notebookCommon_1.$7H.experimentalInsertToolbarAlignment);
            const globalToolbar = e.affectsConfiguration(notebookCommon_1.$7H.globalToolbar);
            const stickyScroll = e.affectsConfiguration(notebookCommon_1.$7H.stickyScroll);
            const consolidatedOutputButton = e.affectsConfiguration(notebookCommon_1.$7H.consolidatedOutputButton);
            const consolidatedRunButton = e.affectsConfiguration(notebookCommon_1.$7H.consolidatedRunButton);
            const showFoldingControls = e.affectsConfiguration(notebookCommon_1.$7H.showFoldingControls);
            const dragAndDropEnabled = e.affectsConfiguration(notebookCommon_1.$7H.dragAndDropEnabled);
            const fontSize = e.affectsConfiguration('editor.fontSize');
            const outputFontSize = e.affectsConfiguration(notebookCommon_1.$7H.outputFontSize);
            const markupFontSize = e.affectsConfiguration(notebookCommon_1.$7H.markupFontSize);
            const fontFamily = e.affectsConfiguration('editor.fontFamily');
            const outputFontFamily = e.affectsConfiguration(notebookCommon_1.$7H.outputFontFamily);
            const editorOptionsCustomizations = e.affectsConfiguration(notebookCommon_1.$7H.cellEditorOptionsCustomizations);
            const interactiveWindowCollapseCodeCells = e.affectsConfiguration(notebookCommon_1.$7H.interactiveWindowCollapseCodeCells);
            const outputLineHeight = e.affectsConfiguration(notebookCommon_1.$7H.outputLineHeight);
            const outputScrolling = e.affectsConfiguration(notebookCommon_1.$7H.outputScrolling);
            const outputWordWrap = e.affectsConfiguration(notebookCommon_1.$7H.outputWordWrap);
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
            let configuration = Object.assign({}, this.a);
            if (cellStatusBarVisibility) {
                configuration.showCellStatusBar = this.c.getValue(notebookCommon_1.$7H.showCellStatusBar);
            }
            if (cellToolbarLocation) {
                configuration.cellToolbarLocation = this.c.getValue(notebookCommon_1.$7H.cellToolbarLocation) ?? { 'default': 'right' };
            }
            if (cellToolbarInteraction && !this.h?.cellToolbarInteraction) {
                configuration.cellToolbarInteraction = this.c.getValue(notebookCommon_1.$7H.cellToolbarVisibility);
            }
            if (focusIndicator) {
                configuration.focusIndicator = this.u();
            }
            if (compactView) {
                const compactViewValue = this.c.getValue(notebookCommon_1.$7H.compactView) ?? true;
                configuration = Object.assign(configuration, {
                    ...(compactViewValue ? compactConfigConstants : defaultConfigConstants),
                });
                configuration.compactView = compactViewValue;
            }
            if (insertToolbarAlignment) {
                configuration.insertToolbarAlignment = this.s();
            }
            if (insertToolbarPosition) {
                configuration.insertToolbarPosition = this.r(this.g);
            }
            if (globalToolbar && this.h?.globalToolbar === undefined) {
                configuration.globalToolbar = this.c.getValue(notebookCommon_1.$7H.globalToolbar) ?? true;
            }
            if (stickyScroll && this.h?.stickyScroll === undefined) {
                configuration.stickyScroll = this.c.getValue(notebookCommon_1.$7H.stickyScroll) ?? false;
            }
            if (consolidatedOutputButton) {
                configuration.consolidatedOutputButton = this.c.getValue(notebookCommon_1.$7H.consolidatedOutputButton) ?? true;
            }
            if (consolidatedRunButton) {
                configuration.consolidatedRunButton = this.c.getValue(notebookCommon_1.$7H.consolidatedRunButton) ?? true;
            }
            if (showFoldingControls) {
                configuration.showFoldingControls = this.t();
            }
            if (dragAndDropEnabled) {
                configuration.dragAndDropEnabled = this.c.getValue(notebookCommon_1.$7H.dragAndDropEnabled) ?? true;
            }
            if (fontSize) {
                configuration.fontSize = this.c.getValue('editor.fontSize');
            }
            if (outputFontSize) {
                configuration.outputFontSize = this.c.getValue(notebookCommon_1.$7H.outputFontSize) || configuration.fontSize;
            }
            if (markupFontSize) {
                configuration.markupFontSize = this.c.getValue(notebookCommon_1.$7H.markupFontSize);
            }
            if (outputFontFamily) {
                configuration.outputFontFamily = this.c.getValue(notebookCommon_1.$7H.outputFontFamily);
            }
            if (editorOptionsCustomizations) {
                configuration.editorOptionsCustomizations = this.c.getValue(notebookCommon_1.$7H.cellEditorOptionsCustomizations);
            }
            if (interactiveWindowCollapseCodeCells) {
                configuration.interactiveWindowCollapseCodeCells = this.c.getValue(notebookCommon_1.$7H.interactiveWindowCollapseCodeCells);
            }
            if (outputLineHeight || fontSize || outputFontSize) {
                const lineHeight = this.c.getValue(notebookCommon_1.$7H.outputLineHeight);
                configuration.outputLineHeight = this.m(lineHeight, configuration.outputFontSize);
            }
            if (outputWordWrap) {
                configuration.outputWordWrap = this.c.getValue(notebookCommon_1.$7H.outputWordWrap);
            }
            if (outputScrolling) {
                configuration.outputScrolling = this.c.getValue(notebookCommon_1.$7H.outputScrolling);
            }
            this.a = Object.freeze(configuration);
            // trigger event
            this.b.fire({
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
        r(isReadOnly) {
            return isReadOnly ? 'hidden' : this.c.getValue(notebookCommon_1.$7H.insertToolbarLocation) ?? 'both';
        }
        s() {
            return this.c.getValue(notebookCommon_1.$7H.experimentalInsertToolbarAlignment) ?? 'center';
        }
        t() {
            return this.c.getValue(notebookCommon_1.$7H.showFoldingControls) ?? 'mouseover';
        }
        u() {
            return this.c.getValue(notebookCommon_1.$7H.focusIndicator) ?? 'gutter';
        }
        getCellCollapseDefault() {
            return this.a.interactiveWindowCollapseCodeCells === 'never' ?
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
            return this.a;
        }
        computeCollapsedMarkdownCellHeight(viewType) {
            const { bottomToolbarGap } = this.computeBottomToolbarDimensions(viewType);
            return this.a.markdownCellTopMargin
                + this.a.collapsedIndicatorHeight
                + bottomToolbarGap
                + this.a.markdownCellBottomMargin;
        }
        computeBottomToolbarOffset(totalHeight, viewType) {
            const { bottomToolbarGap, bottomToolbarHeight } = this.computeBottomToolbarDimensions(viewType);
            return totalHeight
                - bottomToolbarGap
                - bottomToolbarHeight / 2;
        }
        computeCodeCellEditorWidth(outerWidth) {
            return outerWidth - (this.a.codeCellLeftMargin
                + this.a.cellRunGutter
                + this.a.cellRightMargin);
        }
        computeMarkdownCellEditorWidth(outerWidth) {
            return outerWidth
                - this.a.markdownCellGutter
                - this.a.markdownCellLeftMargin
                - this.a.cellRightMargin;
        }
        computeStatusBarHeight() {
            return this.a.cellStatusBarHeight;
        }
        w(compactView, insertToolbarPosition, insertToolbarAlignment, cellToolbar) {
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
            const configuration = this.a;
            const cellToolbarPosition = this.computeCellToolbarLocation(viewType);
            const { bottomToolbarGap, bottomToolbarHeight } = this.w(configuration.compactView, configuration.insertToolbarPosition, configuration.insertToolbarAlignment, cellToolbarPosition);
            return {
                bottomToolbarGap,
                bottomToolbarHeight
            };
        }
        computeCellToolbarLocation(viewType) {
            const cellToolbarLocation = this.a.cellToolbarLocation;
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
            if (this.a.insertToolbarPosition === 'betweenCells' || this.a.insertToolbarPosition === 'both') {
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
                top: $Ebb(),
                bottom: this.y(internalMetadata, cellUri)
                    ? this.a.editorBottomPadding
                    : this.a.editorBottomPaddingWithoutStatusBar
            };
        }
        computeEditorStatusbarHeight(internalMetadata, cellUri) {
            return this.y(internalMetadata, cellUri) ? this.computeStatusBarHeight() : 0;
        }
        y(internalMetadata, cellUri) {
            const exe = this.f.getCellExecution(cellUri);
            if (this.a.showCellStatusBar === 'visible') {
                return true;
            }
            else if (this.a.showCellStatusBar === 'visibleAfterExecute') {
                return typeof internalMetadata.lastRunSuccess === 'boolean' || exe !== undefined;
            }
            else {
                return false;
            }
        }
        computeWebviewOptions() {
            return {
                outputNodePadding: this.a.cellOutputPadding,
                outputNodeLeftPadding: this.a.cellOutputPadding,
                previewNodePadding: this.a.markdownPreviewPadding,
                markdownLeftMargin: this.a.markdownCellGutter + this.a.markdownCellLeftMargin,
                leftMargin: this.a.codeCellLeftMargin,
                rightMargin: this.a.cellRightMargin,
                runGutter: this.a.cellRunGutter,
                dragAndDropEnabled: this.a.dragAndDropEnabled,
                fontSize: this.a.fontSize,
                outputFontSize: this.a.outputFontSize,
                outputFontFamily: this.a.outputFontFamily,
                markupFontSize: this.a.markupFontSize,
                outputLineHeight: this.a.outputLineHeight,
                outputScrolling: this.a.outputScrolling,
                outputWordWrap: this.a.outputWordWrap,
                outputLineLimit: this.a.outputLineLimit,
            };
        }
        computeDiffWebviewOptions() {
            return {
                outputNodePadding: this.a.cellOutputPadding,
                outputNodeLeftPadding: 0,
                previewNodePadding: this.a.markdownPreviewPadding,
                markdownLeftMargin: 0,
                leftMargin: 32,
                rightMargin: 0,
                runGutter: 0,
                dragAndDropEnabled: false,
                fontSize: this.a.fontSize,
                outputFontSize: this.a.outputFontSize,
                outputFontFamily: this.a.outputFontFamily,
                markupFontSize: this.a.markupFontSize,
                outputLineHeight: this.a.outputLineHeight,
                outputScrolling: this.a.outputScrolling,
                outputWordWrap: this.a.outputWordWrap,
                outputLineLimit: this.a.outputLineLimit,
            };
        }
        computeIndicatorPosition(totalHeight, foldHintHeight, viewType) {
            const { bottomToolbarGap } = this.computeBottomToolbarDimensions(viewType);
            return {
                bottomIndicatorTop: totalHeight - bottomToolbarGap - this.a.cellBottomMargin - foldHintHeight,
                verticalIndicatorHeight: totalHeight - bottomToolbarGap - foldHintHeight
            };
        }
    }
    exports.$Gbb = $Gbb;
});
//# sourceMappingURL=notebookOptions.js.map