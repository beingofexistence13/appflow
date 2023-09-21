/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/color", "vs/nls", "vs/platform/theme/common/colorRegistry"], function (require, exports, color_1, nls_1, colorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.testStatesToIconColors = exports.testMessageSeverityColors = exports.testingPeekHeaderBackground = exports.testingPeekBorder = exports.testingColorIconSkipped = exports.testingColorIconUnset = exports.testingColorIconQueued = exports.testingColorRunAction = exports.testingColorIconPassed = exports.testingColorIconErrored = exports.testingColorIconFailed = void 0;
    exports.testingColorIconFailed = (0, colorRegistry_1.registerColor)('testing.iconFailed', {
        dark: '#f14c4c',
        light: '#f14c4c',
        hcDark: '#f14c4c',
        hcLight: '#B5200D'
    }, (0, nls_1.localize)('testing.iconFailed', "Color for the 'failed' icon in the test explorer."));
    exports.testingColorIconErrored = (0, colorRegistry_1.registerColor)('testing.iconErrored', {
        dark: '#f14c4c',
        light: '#f14c4c',
        hcDark: '#f14c4c',
        hcLight: '#B5200D'
    }, (0, nls_1.localize)('testing.iconErrored', "Color for the 'Errored' icon in the test explorer."));
    exports.testingColorIconPassed = (0, colorRegistry_1.registerColor)('testing.iconPassed', {
        dark: '#73c991',
        light: '#73c991',
        hcDark: '#73c991',
        hcLight: '#007100'
    }, (0, nls_1.localize)('testing.iconPassed', "Color for the 'passed' icon in the test explorer."));
    exports.testingColorRunAction = (0, colorRegistry_1.registerColor)('testing.runAction', {
        dark: exports.testingColorIconPassed,
        light: exports.testingColorIconPassed,
        hcDark: exports.testingColorIconPassed,
        hcLight: exports.testingColorIconPassed
    }, (0, nls_1.localize)('testing.runAction', "Color for 'run' icons in the editor."));
    exports.testingColorIconQueued = (0, colorRegistry_1.registerColor)('testing.iconQueued', {
        dark: '#cca700',
        light: '#cca700',
        hcDark: '#cca700',
        hcLight: '#cca700'
    }, (0, nls_1.localize)('testing.iconQueued', "Color for the 'Queued' icon in the test explorer."));
    exports.testingColorIconUnset = (0, colorRegistry_1.registerColor)('testing.iconUnset', {
        dark: '#848484',
        light: '#848484',
        hcDark: '#848484',
        hcLight: '#848484'
    }, (0, nls_1.localize)('testing.iconUnset', "Color for the 'Unset' icon in the test explorer."));
    exports.testingColorIconSkipped = (0, colorRegistry_1.registerColor)('testing.iconSkipped', {
        dark: '#848484',
        light: '#848484',
        hcDark: '#848484',
        hcLight: '#848484'
    }, (0, nls_1.localize)('testing.iconSkipped', "Color for the 'Skipped' icon in the test explorer."));
    exports.testingPeekBorder = (0, colorRegistry_1.registerColor)('testing.peekBorder', {
        dark: colorRegistry_1.editorErrorForeground,
        light: colorRegistry_1.editorErrorForeground,
        hcDark: colorRegistry_1.contrastBorder,
        hcLight: colorRegistry_1.contrastBorder
    }, (0, nls_1.localize)('testing.peekBorder', 'Color of the peek view borders and arrow.'));
    exports.testingPeekHeaderBackground = (0, colorRegistry_1.registerColor)('testing.peekHeaderBackground', {
        dark: (0, colorRegistry_1.transparent)(colorRegistry_1.editorErrorForeground, 0.1),
        light: (0, colorRegistry_1.transparent)(colorRegistry_1.editorErrorForeground, 0.1),
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)('testing.peekBorder', 'Color of the peek view borders and arrow.'));
    exports.testMessageSeverityColors = {
        [0 /* TestMessageType.Error */]: {
            decorationForeground: (0, colorRegistry_1.registerColor)('testing.message.error.decorationForeground', { dark: colorRegistry_1.editorErrorForeground, light: colorRegistry_1.editorErrorForeground, hcDark: colorRegistry_1.editorForeground, hcLight: colorRegistry_1.editorForeground }, (0, nls_1.localize)('testing.message.error.decorationForeground', 'Text color of test error messages shown inline in the editor.')),
            marginBackground: (0, colorRegistry_1.registerColor)('testing.message.error.lineBackground', { dark: new color_1.Color(new color_1.RGBA(255, 0, 0, 0.2)), light: new color_1.Color(new color_1.RGBA(255, 0, 0, 0.2)), hcDark: null, hcLight: null }, (0, nls_1.localize)('testing.message.error.marginBackground', 'Margin color beside error messages shown inline in the editor.')),
        },
        [1 /* TestMessageType.Output */]: {
            decorationForeground: (0, colorRegistry_1.registerColor)('testing.message.info.decorationForeground', { dark: (0, colorRegistry_1.transparent)(colorRegistry_1.editorForeground, 0.5), light: (0, colorRegistry_1.transparent)(colorRegistry_1.editorForeground, 0.5), hcDark: (0, colorRegistry_1.transparent)(colorRegistry_1.editorForeground, 0.5), hcLight: (0, colorRegistry_1.transparent)(colorRegistry_1.editorForeground, 0.5) }, (0, nls_1.localize)('testing.message.info.decorationForeground', 'Text color of test info messages shown inline in the editor.')),
            marginBackground: (0, colorRegistry_1.registerColor)('testing.message.info.lineBackground', { dark: null, light: null, hcDark: null, hcLight: null }, (0, nls_1.localize)('testing.message.info.marginBackground', 'Margin color beside info messages shown inline in the editor.')),
        },
    };
    exports.testStatesToIconColors = {
        [6 /* TestResultState.Errored */]: exports.testingColorIconErrored,
        [4 /* TestResultState.Failed */]: exports.testingColorIconFailed,
        [3 /* TestResultState.Passed */]: exports.testingColorIconPassed,
        [1 /* TestResultState.Queued */]: exports.testingColorIconQueued,
        [0 /* TestResultState.Unset */]: exports.testingColorIconUnset,
        [5 /* TestResultState.Skipped */]: exports.testingColorIconSkipped,
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhlbWUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXN0aW5nL2Jyb3dzZXIvdGhlbWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBT25GLFFBQUEsc0JBQXNCLEdBQUcsSUFBQSw2QkFBYSxFQUFDLG9CQUFvQixFQUFFO1FBQ3pFLElBQUksRUFBRSxTQUFTO1FBQ2YsS0FBSyxFQUFFLFNBQVM7UUFDaEIsTUFBTSxFQUFFLFNBQVM7UUFDakIsT0FBTyxFQUFFLFNBQVM7S0FDbEIsRUFBRSxJQUFBLGNBQVEsRUFBQyxvQkFBb0IsRUFBRSxtREFBbUQsQ0FBQyxDQUFDLENBQUM7SUFFM0UsUUFBQSx1QkFBdUIsR0FBRyxJQUFBLDZCQUFhLEVBQUMscUJBQXFCLEVBQUU7UUFDM0UsSUFBSSxFQUFFLFNBQVM7UUFDZixLQUFLLEVBQUUsU0FBUztRQUNoQixNQUFNLEVBQUUsU0FBUztRQUNqQixPQUFPLEVBQUUsU0FBUztLQUNsQixFQUFFLElBQUEsY0FBUSxFQUFDLHFCQUFxQixFQUFFLG9EQUFvRCxDQUFDLENBQUMsQ0FBQztJQUU3RSxRQUFBLHNCQUFzQixHQUFHLElBQUEsNkJBQWEsRUFBQyxvQkFBb0IsRUFBRTtRQUN6RSxJQUFJLEVBQUUsU0FBUztRQUNmLEtBQUssRUFBRSxTQUFTO1FBQ2hCLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLE9BQU8sRUFBRSxTQUFTO0tBQ2xCLEVBQUUsSUFBQSxjQUFRLEVBQUMsb0JBQW9CLEVBQUUsbURBQW1ELENBQUMsQ0FBQyxDQUFDO0lBRTNFLFFBQUEscUJBQXFCLEdBQUcsSUFBQSw2QkFBYSxFQUFDLG1CQUFtQixFQUFFO1FBQ3ZFLElBQUksRUFBRSw4QkFBc0I7UUFDNUIsS0FBSyxFQUFFLDhCQUFzQjtRQUM3QixNQUFNLEVBQUUsOEJBQXNCO1FBQzlCLE9BQU8sRUFBRSw4QkFB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