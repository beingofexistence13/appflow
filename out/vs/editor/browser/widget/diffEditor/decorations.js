/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/base/common/htmlContent", "vs/base/common/themables", "vs/editor/common/model/textModel", "vs/nls", "vs/platform/theme/common/iconRegistry"], function (require, exports, codicons_1, htmlContent_1, themables_1, textModel_1, nls_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.arrowRevertChange = exports.diffDeleteDecorationEmpty = exports.diffWholeLineDeleteDecoration = exports.diffDeleteDecoration = exports.diffAddDecorationEmpty = exports.diffWholeLineAddDecoration = exports.diffAddDecoration = exports.diffLineDeleteDecorationBackground = exports.diffLineAddDecorationBackground = exports.diffLineDeleteDecorationBackgroundWithIndicator = exports.diffLineAddDecorationBackgroundWithIndicator = exports.diffRemoveIcon = exports.diffInsertIcon = void 0;
    exports.diffInsertIcon = (0, iconRegistry_1.registerIcon)('diff-insert', codicons_1.Codicon.add, (0, nls_1.localize)('diffInsertIcon', 'Line decoration for inserts in the diff editor.'));
    exports.diffRemoveIcon = (0, iconRegistry_1.registerIcon)('diff-remove', codicons_1.Codicon.remove, (0, nls_1.localize)('diffRemoveIcon', 'Line decoration for removals in the diff editor.'));
    exports.diffLineAddDecorationBackgroundWithIndicator = textModel_1.ModelDecorationOptions.register({
        className: 'line-insert',
        description: 'line-insert',
        isWholeLine: true,
        linesDecorationsClassName: 'insert-sign ' + themables_1.ThemeIcon.asClassName(exports.diffInsertIcon),
        marginClassName: 'gutter-insert',
    });
    exports.diffLineDeleteDecorationBackgroundWithIndicator = textModel_1.ModelDecorationOptions.register({
        className: 'line-delete',
        description: 'line-delete',
        isWholeLine: true,
        linesDecorationsClassName: 'delete-sign ' + themables_1.ThemeIcon.asClassName(exports.diffRemoveIcon),
        marginClassName: 'gutter-delete',
    });
    exports.diffLineAddDecorationBackground = textModel_1.ModelDecorationOptions.register({
        className: 'line-insert',
        description: 'line-insert',
        isWholeLine: true,
        marginClassName: 'gutter-insert',
    });
    exports.diffLineDeleteDecorationBackground = textModel_1.ModelDecorationOptions.register({
        className: 'line-delete',
        description: 'line-delete',
        isWholeLine: true,
        marginClassName: 'gutter-delete',
    });
    exports.diffAddDecoration = textModel_1.ModelDecorationOptions.register({
        className: 'char-insert',
        description: 'char-insert',
        shouldFillLineOnLineBreak: true,
    });
    exports.diffWholeLineAddDecoration = textModel_1.ModelDecorationOptions.register({
        className: 'char-insert',
        description: 'char-insert',
        isWholeLine: true,
    });
    exports.diffAddDecorationEmpty = textModel_1.ModelDecorationOptions.register({
        className: 'char-insert diff-range-empty',
        description: 'char-insert diff-range-empty',
    });
    exports.diffDeleteDecoration = textModel_1.ModelDecorationOptions.register({
        className: 'char-delete',
        description: 'char-delete',
        shouldFillLineOnLineBreak: true,
    });
    exports.diffWholeLineDeleteDecoration = textModel_1.ModelDecorationOptions.register({
        className: 'char-delete',
        description: 'char-delete',
        isWholeLine: true,
    });
    exports.diffDeleteDecorationEmpty = textModel_1.ModelDecorationOptions.register({
        className: 'char-delete diff-range-empty',
        description: 'char-delete diff-range-empty',
    });
    exports.arrowRevertChange = textModel_1.ModelDecorationOptions.register({
        description: 'diff-editor-arrow-revert-change',
        glyphMarginHoverMessage: new htmlContent_1.MarkdownString(undefined, { isTrusted: true, supportThemeIcons: true })
            .appendMarkdown((0, nls_1.localize)('revertChangeHoverMessage', 'Click to revert change')),
        glyphMarginClassName: 'arrow-revert-change ' + themables_1.ThemeIcon.asClassName(codicons_1.Codicon.arrowRight),
        zIndex: 10001,
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVjb3JhdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvYnJvd3Nlci93aWRnZXQvZGlmZkVkaXRvci9kZWNvcmF0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFTbkYsUUFBQSxjQUFjLEdBQUcsSUFBQSwyQkFBWSxFQUFDLGFBQWEsRUFBRSxrQkFBTyxDQUFDLEdBQUcsRUFBRSxJQUFBLGNBQVEsRUFBQyxnQkFBZ0IsRUFBRSxpREFBaUQsQ0FBQyxDQUFDLENBQUM7SUFDekksUUFBQSxjQUFjLEdBQUcsSUFBQSwyQkFBWSxFQUFDLGFBQWEsRUFBRSxrQkFBTyxDQUFDLE1BQU0sRUFBRSxJQUFBLGNBQVEsRUFBQyxnQkFBZ0IsRUFBRSxrREFBa0QsQ0FBQyxDQUFDLENBQUM7SUFFN0ksUUFBQSw0Q0FBNEMsR0FBRyxrQ0FBc0IsQ0FBQyxRQUFRLENBQUM7UUFDM0YsU0FBUyxFQUFFLGFBQWE7UUFDeEIsV0FBVyxFQUFFLGFBQWE7UUFDMUIsV0FBVyxFQUFFLElBQUk7UUFDakIseUJBQXlCLEVBQUUsY0FBYyxHQUFHLHFCQUFTLENBQUMsV0FBVyxDQUFDLHNCQUFjLENBQUM7UUFDakYsZUFBZSxFQUFFLGVBQWU7S0FDaEMsQ0FBQyxDQUFDO0lBRVUsUUFBQSwrQ0FBK0MsR0FBRyxrQ0FBc0IsQ0FBQyxRQUFRLENBQUM7UUFDOUYsU0FBUyxFQUFFLGFBQWE7UUFDeEIsV0FBVyxFQUFFLGFBQWE7UUFDMUIsV0FBVyxFQUFFLElBQUk7UUFDakIseUJBQXlCLEVBQUUsY0FBYyxHQUFHLHFCQUFTLENBQUMsV0FBVyxDQUFDLHNCQUFjLENBQUM7UUFDakYsZUFBZSxFQUFFLGVBQWU7S0FDaEMsQ0FBQyxDQUFDO0lBRVUsUUFBQSwrQkFBK0IsR0FBRyxrQ0FBc0IsQ0FBQyxRQUFRLENBQUM7UUFDOUUsU0FBUyxFQUFFLGFBQWE7UUFDeEIsV0FBVyxFQUFFLGFBQWE7UUFDMUIsV0FBVyxFQUFFLElBQUk7UUFDakIsZUFBZSxFQUFFLGVBQWU7S0FDaEMsQ0FBQyxDQUFDO0lBRVUsUUFBQSxrQ0FBa0MsR0FBRyxrQ0FBc0IsQ0FBQyxRQUFRLENBQUM7UUFDakYsU0FBUyxFQUFFLGFBQWE7UUFDeEIsV0FBVyxFQUFFLGFBQWE7UUFDMUIsV0FBVyxFQUFFLElBQUk7UUFDakIsZUFBZSxFQUFFLGVBQWU7S0FDaEMsQ0FBQyxDQUFDO0lBRVUsUUFBQSxpQkFBaUIsR0FBRyxrQ0FBc0IsQ0FBQyxRQUFRLENBQUM7UUFDaEUsU0FBUyxFQUFFLGFBQWE7UUFDeEIsV0FBVyxFQUFFLGFBQWE7UUFDMUIseUJBQXlCLEVBQUUsSUFBSTtLQUMvQixDQUFDLENBQUM7SUFFVSxRQUFBLDBCQUEwQixHQUFHLGtDQUFzQixDQUFDLFFBQVEsQ0FBQztRQUN6RSxTQUFTLEVBQUUsYUFBYTtRQUN4QixXQUFXLEVBQUUsYUFBYTtRQUMxQixXQUFXLEVBQUUsSUFBSTtLQUNqQixDQUFDLENBQUM7SUFFVSxRQUFBLHNCQUFzQixHQUFHLGtDQUFzQixDQUFDLFFBQVEsQ0FBQztRQUNyRSxTQUFTLEVBQUUsOEJBQThCO1FBQ3pDLFdBQVcsRUFBRSw4QkFBOEI7S0FDM0MsQ0FBQyxDQUFDO0lBRVUsUUFBQSxvQkFBb0IsR0FBRyxrQ0FBc0IsQ0FBQyxRQUFRLENBQUM7UUFDbkUsU0FBUyxFQUFFLGFBQWE7UUFDeEIsV0FBVyxFQUFFLGFBQWE7UUFDMUIseUJBQXlCLEVBQUUsSUFBSTtLQUMvQixDQUFDLENBQUM7SUFFVSxRQUFBLDZCQUE2QixHQUFHLGtDQUFzQixDQUFDLFFBQVEsQ0FBQztRQUM1RSxTQUFTLEVBQUUsYUFBYTtRQUN4QixXQUFXLEVBQUUsYUFBYTtRQUMxQixXQUFXLEVBQUUsSUFBSTtLQUNqQixDQUFDLENBQUM7SUFFVSxRQUFBLHlCQUF5QixHQUFHLGtDQUFzQixDQUFDLFFBQVEsQ0FBQztRQUN4RSxTQUFTLEVBQUUsOEJBQThCO1FBQ3pDLFdBQVcsRUFBRSw4QkFBOEI7S0FDM0MsQ0FBQyxDQUFDO0lBR1UsUUFBQSxpQkFBaUIsR0FBRyxrQ0FBc0IsQ0FBQyxRQUFRLENBQUM7UUFDaEUsV0FBVyxFQUFFLGlDQUFpQztRQUM5Qyx1QkFBdUIsRUFBRSxJQUFJLDRCQUFjLENBQUMsU0FBUyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxpQkFBaUIsRUFBRSxJQUFJLEVBQUUsQ0FBQzthQUNsRyxjQUFjLENBQUMsSUFBQSxjQUFRLEVBQUMsMEJBQTBCLEVBQUUsd0JBQXdCLENBQUMsQ0FBQztRQUNoRixvQkFBb0IsRUFBRSxzQkFBc0IsR0FBRyxxQkFBUyxDQUFDLFdBQVcsQ0FBQyxrQkFBTyxDQUFDLFVBQVUsQ0FBQztRQUN4RixNQUFNLEVBQUUsS0FBSztLQUNiLENBQUMsQ0FBQyJ9