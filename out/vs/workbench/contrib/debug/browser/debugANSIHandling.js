/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/color", "vs/workbench/contrib/terminal/common/terminalColorRegistry"], function (require, exports, color_1, terminalColorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.calcANSI8bitColor = exports.appendStylizedStringToContainer = exports.handleANSIOutput = void 0;
    /**
     * @param text The content to stylize.
     * @returns An {@link HTMLSpanElement} that contains the potentially stylized text.
     */
    function handleANSIOutput(text, linkDetector, themeService, workspaceFolder) {
        const root = document.createElement('span');
        const textLength = text.length;
        let styleNames = [];
        let customFgColor;
        let customBgColor;
        let customUnderlineColor;
        let colorsInverted = false;
        let currentPos = 0;
        let buffer = '';
        while (currentPos < textLength) {
            let sequenceFound = false;
            // Potentially an ANSI escape sequence.
            // See http://ascii-table.com/ansi-escape-sequences.php & https://en.wikipedia.org/wiki/ANSI_escape_code
            if (text.charCodeAt(currentPos) === 27 && text.charAt(currentPos + 1) === '[') {
                const startPos = currentPos;
                currentPos += 2; // Ignore 'Esc[' as it's in every sequence.
                let ansiSequence = '';
                while (currentPos < textLength) {
                    const char = text.charAt(currentPos);
                    ansiSequence += char;
                    currentPos++;
                    // Look for a known sequence terminating character.
                    if (char.match(/^[ABCDHIJKfhmpsu]$/)) {
                        sequenceFound = true;
                        break;
                    }
                }
                if (sequenceFound) {
                    // Flush buffer with previous styles.
                    appendStylizedStringToContainer(root, buffer, styleNames, linkDetector, workspaceFolder, customFgColor, customBgColor, customUnderlineColor);
                    buffer = '';
                    /*
                     * Certain ranges that are matched here do not contain real graphics rendition sequences. For
                     * the sake of having a simpler expression, they have been included anyway.
                     */
                    if (ansiSequence.match(/^(?:[34][0-8]|9[0-7]|10[0-7]|[0-9]|2[1-5,7-9]|[34]9|5[8,9]|1[0-9])(?:;[349][0-7]|10[0-7]|[013]|[245]|[34]9)?(?:;[012]?[0-9]?[0-9])*;?m$/)) {
                        const styleCodes = ansiSequence.slice(0, -1) // Remove final 'm' character.
                            .split(';') // Separate style codes.
                            .filter(elem => elem !== '') // Filter empty elems as '34;m' -> ['34', ''].
                            .map(elem => parseInt(elem, 10)); // Convert to numbers.
                        if (styleCodes[0] === 38 || styleCodes[0] === 48 || styleCodes[0] === 58) {
                            // Advanced color code - can't be combined with formatting codes like simple colors can
                            // Ignores invalid colors and additional info beyond what is necessary
                            const colorType = (styleCodes[0] === 38) ? 'foreground' : ((styleCodes[0] === 48) ? 'background' : 'underline');
                            if (styleCodes[1] === 5) {
                                set8BitColor(styleCodes, colorType);
                            }
                            else if (styleCodes[1] === 2) {
                                set24BitColor(styleCodes, colorType);
                            }
                        }
                        else {
                            setBasicFormatters(styleCodes);
                        }
                    }
                    else {
                        // Unsupported sequence so simply hide it.
                    }
                }
                else {
                    currentPos = startPos;
                }
            }
            if (sequenceFound === false) {
                buffer += text.charAt(currentPos);
                currentPos++;
            }
        }
        // Flush remaining text buffer if not empty.
        if (buffer) {
            appendStylizedStringToContainer(root, buffer, styleNames, linkDetector, workspaceFolder, customFgColor, customBgColor, customUnderlineColor);
        }
        return root;
        /**
         * Change the foreground or background color by clearing the current color
         * and adding the new one.
         * @param colorType If `'foreground'`, will change the foreground color, if
         * 	`'background'`, will change the background color, and if `'underline'`
         * will set the underline color.
         * @param color Color to change to. If `undefined` or not provided,
         * will clear current color without adding a new one.
         */
        function changeColor(colorType, color) {
            if (colorType === 'foreground') {
                customFgColor = color;
            }
            else if (colorType === 'background') {
                customBgColor = color;
            }
            else if (colorType === 'underline') {
                customUnderlineColor = color;
            }
            styleNames = styleNames.filter(style => style !== `code-${colorType}-colored`);
            if (color !== undefined) {
                styleNames.push(`code-${colorType}-colored`);
            }
        }
        /**
         * Swap foreground and background colors.  Used for color inversion.  Caller should check
         * [] flag to make sure it is appropriate to turn ON or OFF (if it is already inverted don't call
         */
        function reverseForegroundAndBackgroundColors() {
            const oldFgColor = customFgColor;
            changeColor('foreground', customBgColor);
            changeColor('background', oldFgColor);
        }
        /**
         * Calculate and set basic ANSI formatting. Supports ON/OFF of bold, italic, underline,
         * double underline,  crossed-out/strikethrough, overline, dim, blink, rapid blink,
         * reverse/invert video, hidden, superscript, subscript and alternate font codes,
         * clearing/resetting of foreground, background and underline colors,
         * setting normal foreground and background colors, and bright foreground and
         * background colors. Not to be used for codes containing advanced colors.
         * Will ignore invalid codes.
         * @param styleCodes Array of ANSI basic styling numbers, which will be
         * applied in order. New colors and backgrounds clear old ones; new formatting
         * does not.
         * @see {@link https://en.wikipedia.org/wiki/ANSI_escape_code#SGR }
         */
        function setBasicFormatters(styleCodes) {
            for (const code of styleCodes) {
                switch (code) {
                    case 0: { // reset (everything)
                        styleNames = [];
                        customFgColor = undefined;
                        customBgColor = undefined;
                        break;
                    }
                    case 1: { // bold
                        styleNames = styleNames.filter(style => style !== `code-bold`);
                        styleNames.push('code-bold');
                        break;
                    }
                    case 2: { // dim
                        styleNames = styleNames.filter(style => style !== `code-dim`);
                        styleNames.push('code-dim');
                        break;
                    }
                    case 3: { // italic
                        styleNames = styleNames.filter(style => style !== `code-italic`);
                        styleNames.push('code-italic');
                        break;
                    }
                    case 4: { // underline
                        styleNames = styleNames.filter(style => (style !== `code-underline` && style !== `code-double-underline`));
                        styleNames.push('code-underline');
                        break;
                    }
                    case 5: { // blink
                        styleNames = styleNames.filter(style => style !== `code-blink`);
                        styleNames.push('code-blink');
                        break;
                    }
                    case 6: { // rapid blink
                        styleNames = styleNames.filter(style => style !== `code-rapid-blink`);
                        styleNames.push('code-rapid-blink');
                        break;
                    }
                    case 7: { // invert foreground and background
                        if (!colorsInverted) {
                            colorsInverted = true;
                            reverseForegroundAndBackgroundColors();
                        }
                        break;
                    }
                    case 8: { // hidden
                        styleNames = styleNames.filter(style => style !== `code-hidden`);
                        styleNames.push('code-hidden');
                        break;
                    }
                    case 9: { // strike-through/crossed-out
                        styleNames = styleNames.filter(style => style !== `code-strike-through`);
                        styleNames.push('code-strike-through');
                        break;
                    }
                    case 10: { // normal default font
                        styleNames = styleNames.filter(style => !style.startsWith('code-font'));
                        break;
                    }
                    case 11:
                    case 12:
                    case 13:
                    case 14:
                    case 15:
                    case 16:
                    case 17:
                    case 18:
                    case 19:
                    case 20: { // font codes (and 20 is 'blackletter' font code)
                        styleNames = styleNames.filter(style => !style.startsWith('code-font'));
                        styleNames.push(`code-font-${code - 10}`);
                        break;
                    }
                    case 21: { // double underline
                        styleNames = styleNames.filter(style => (style !== `code-underline` && style !== `code-double-underline`));
                        styleNames.push('code-double-underline');
                        break;
                    }
                    case 22: { // normal intensity (bold off and dim off)
                        styleNames = styleNames.filter(style => (style !== `code-bold` && style !== `code-dim`));
                        break;
                    }
                    case 23: { // Neither italic or blackletter (font 10)
                        styleNames = styleNames.filter(style => (style !== `code-italic` && style !== `code-font-10`));
                        break;
                    }
                    case 24: { // not underlined (Neither singly nor doubly underlined)
                        styleNames = styleNames.filter(style => (style !== `code-underline` && style !== `code-double-underline`));
                        break;
                    }
                    case 25: { // not blinking
                        styleNames = styleNames.filter(style => (style !== `code-blink` && style !== `code-rapid-blink`));
                        break;
                    }
                    case 27: { // not reversed/inverted
                        if (colorsInverted) {
                            colorsInverted = false;
                            reverseForegroundAndBackgroundColors();
                        }
                        break;
                    }
                    case 28: { // not hidden (reveal)
                        styleNames = styleNames.filter(style => style !== `code-hidden`);
                        break;
                    }
                    case 29: { // not crossed-out
                        styleNames = styleNames.filter(style => style !== `code-strike-through`);
                        break;
                    }
                    case 53: { // overlined
                        styleNames = styleNames.filter(style => style !== `code-overline`);
                        styleNames.push('code-overline');
                        break;
                    }
                    case 55: { // not overlined
                        styleNames = styleNames.filter(style => style !== `code-overline`);
                        break;
                    }
                    case 39: { // default foreground color
                        changeColor('foreground', undefined);
                        break;
                    }
                    case 49: { // default background color
                        changeColor('background', undefined);
                        break;
                    }
                    case 59: { // default underline color
                        changeColor('underline', undefined);
                        break;
                    }
                    case 73: { // superscript
                        styleNames = styleNames.filter(style => (style !== `code-superscript` && style !== `code-subscript`));
                        styleNames.push('code-superscript');
                        break;
                    }
                    case 74: { // subscript
                        styleNames = styleNames.filter(style => (style !== `code-superscript` && style !== `code-subscript`));
                        styleNames.push('code-subscript');
                        break;
                    }
                    case 75: { // neither superscript or subscript
                        styleNames = styleNames.filter(style => (style !== `code-superscript` && style !== `code-subscript`));
                        break;
                    }
                    default: {
                        setBasicColor(code);
                        break;
                    }
                }
            }
        }
        /**
         * Calculate and set styling for complicated 24-bit ANSI color codes.
         * @param styleCodes Full list of integer codes that make up the full ANSI
         * sequence, including the two defining codes and the three RGB codes.
         * @param colorType If `'foreground'`, will set foreground color, if
         * `'background'`, will set background color, and if it is `'underline'`
         * will set the underline color.
         * @see {@link https://en.wikipedia.org/wiki/ANSI_escape_code#24-bit }
         */
        function set24BitColor(styleCodes, colorType) {
            if (styleCodes.length >= 5 &&
                styleCodes[2] >= 0 && styleCodes[2] <= 255 &&
                styleCodes[3] >= 0 && styleCodes[3] <= 255 &&
                styleCodes[4] >= 0 && styleCodes[4] <= 255) {
                const customColor = new color_1.RGBA(styleCodes[2], styleCodes[3], styleCodes[4]);
                changeColor(colorType, customColor);
            }
        }
        /**
         * Calculate and set styling for advanced 8-bit ANSI color codes.
         * @param styleCodes Full list of integer codes that make up the ANSI
         * sequence, including the two defining codes and the one color code.
         * @param colorType If `'foreground'`, will set foreground color, if
         * `'background'`, will set background color and if it is `'underline'`
         * will set the underline color.
         * @see {@link https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit }
         */
        function set8BitColor(styleCodes, colorType) {
            let colorNumber = styleCodes[2];
            const color = calcANSI8bitColor(colorNumber);
            if (color) {
                changeColor(colorType, color);
            }
            else if (colorNumber >= 0 && colorNumber <= 15) {
                if (colorType === 'underline') {
                    // for underline colors we just decode the 0-15 color number to theme color, set and return
                    const theme = themeService.getColorTheme();
                    const colorName = terminalColorRegistry_1.ansiColorIdentifiers[colorNumber];
                    const color = theme.getColor(colorName);
                    if (color) {
                        changeColor(colorType, color.rgba);
                    }
                    return;
                }
                // Need to map to one of the four basic color ranges (30-37, 90-97, 40-47, 100-107)
                colorNumber += 30;
                if (colorNumber >= 38) {
                    // Bright colors
                    colorNumber += 52;
                }
                if (colorType === 'background') {
                    colorNumber += 10;
                }
                setBasicColor(colorNumber);
            }
        }
        /**
         * Calculate and set styling for basic bright and dark ANSI color codes. Uses
         * theme colors if available. Automatically distinguishes between foreground
         * and background colors; does not support color-clearing codes 39 and 49.
         * @param styleCode Integer color code on one of the following ranges:
         * [30-37, 90-97, 40-47, 100-107]. If not on one of these ranges, will do
         * nothing.
         */
        function setBasicColor(styleCode) {
            const theme = themeService.getColorTheme();
            let colorType;
            let colorIndex;
            if (styleCode >= 30 && styleCode <= 37) {
                colorIndex = styleCode - 30;
                colorType = 'foreground';
            }
            else if (styleCode >= 90 && styleCode <= 97) {
                colorIndex = (styleCode - 90) + 8; // High-intensity (bright)
                colorType = 'foreground';
            }
            else if (styleCode >= 40 && styleCode <= 47) {
                colorIndex = styleCode - 40;
                colorType = 'background';
            }
            else if (styleCode >= 100 && styleCode <= 107) {
                colorIndex = (styleCode - 100) + 8; // High-intensity (bright)
                colorType = 'background';
            }
            if (colorIndex !== undefined && colorType) {
                const colorName = terminalColorRegistry_1.ansiColorIdentifiers[colorIndex];
                const color = theme.getColor(colorName);
                if (color) {
                    changeColor(colorType, color.rgba);
                }
            }
        }
    }
    exports.handleANSIOutput = handleANSIOutput;
    /**
     * @param root The {@link HTMLElement} to append the content to.
     * @param stringContent The text content to be appended.
     * @param cssClasses The list of CSS styles to apply to the text content.
     * @param linkDetector The {@link LinkDetector} responsible for generating links from {@param stringContent}.
     * @param customTextColor If provided, will apply custom color with inline style.
     * @param customBackgroundColor If provided, will apply custom backgroundColor with inline style.
     * @param customUnderlineColor If provided, will apply custom textDecorationColor with inline style.
     */
    function appendStylizedStringToContainer(root, stringContent, cssClasses, linkDetector, workspaceFolder, customTextColor, customBackgroundColor, customUnderlineColor) {
        if (!root || !stringContent) {
            return;
        }
        const container = linkDetector.linkify(stringContent, true, workspaceFolder);
        container.className = cssClasses.join(' ');
        if (customTextColor) {
            container.style.color =
                color_1.Color.Format.CSS.formatRGB(new color_1.Color(customTextColor));
        }
        if (customBackgroundColor) {
            container.style.backgroundColor =
                color_1.Color.Format.CSS.formatRGB(new color_1.Color(customBackgroundColor));
        }
        if (customUnderlineColor) {
            container.style.textDecorationColor =
                color_1.Color.Format.CSS.formatRGB(new color_1.Color(customUnderlineColor));
        }
        root.appendChild(container);
    }
    exports.appendStylizedStringToContainer = appendStylizedStringToContainer;
    /**
     * Calculate the color from the color set defined in the ANSI 8-bit standard.
     * Standard and high intensity colors are not defined in the standard as specific
     * colors, so these and invalid colors return `undefined`.
     * @see {@link https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit } for info.
     * @param colorNumber The number (ranging from 16 to 255) referring to the color
     * desired.
     */
    function calcANSI8bitColor(colorNumber) {
        if (colorNumber % 1 !== 0) {
            // Should be integer
            return;
        }
        if (colorNumber >= 16 && colorNumber <= 231) {
            // Converts to one of 216 RGB colors
            colorNumber -= 16;
            let blue = colorNumber % 6;
            colorNumber = (colorNumber - blue) / 6;
            let green = colorNumber % 6;
            colorNumber = (colorNumber - green) / 6;
            let red = colorNumber;
            // red, green, blue now range on [0, 5], need to map to [0,255]
            const convFactor = 255 / 5;
            blue = Math.round(blue * convFactor);
            green = Math.round(green * convFactor);
            red = Math.round(red * convFactor);
            return new color_1.RGBA(red, green, blue);
        }
        else if (colorNumber >= 232 && colorNumber <= 255) {
            // Converts to a grayscale value
            colorNumber -= 232;
            const colorLevel = Math.round(colorNumber / 23 * 255);
            return new color_1.RGBA(colorLevel, colorLevel, colorLevel);
        }
        else {
            return;
        }
    }
    exports.calcANSI8bitColor = calcANSI8bitColor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdBTlNJSGFuZGxpbmcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9kZWJ1Zy9icm93c2VyL2RlYnVnQU5TSUhhbmRsaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVFoRzs7O09BR0c7SUFDSCxTQUFnQixnQkFBZ0IsQ0FBQyxJQUFZLEVBQUUsWUFBMEIsRUFBRSxZQUEyQixFQUFFLGVBQTZDO1FBRXBKLE1BQU0sSUFBSSxHQUFvQixRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzdELE1BQU0sVUFBVSxHQUFXLElBQUksQ0FBQyxNQUFNLENBQUM7UUFFdkMsSUFBSSxVQUFVLEdBQWEsRUFBRSxDQUFDO1FBQzlCLElBQUksYUFBK0IsQ0FBQztRQUNwQyxJQUFJLGFBQStCLENBQUM7UUFDcEMsSUFBSSxvQkFBc0MsQ0FBQztRQUMzQyxJQUFJLGNBQWMsR0FBWSxLQUFLLENBQUM7UUFDcEMsSUFBSSxVQUFVLEdBQVcsQ0FBQyxDQUFDO1FBQzNCLElBQUksTUFBTSxHQUFXLEVBQUUsQ0FBQztRQUV4QixPQUFPLFVBQVUsR0FBRyxVQUFVLEVBQUU7WUFFL0IsSUFBSSxhQUFhLEdBQVksS0FBSyxDQUFDO1lBRW5DLHVDQUF1QztZQUN2Qyx3R0FBd0c7WUFDeEcsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUU7Z0JBRTlFLE1BQU0sUUFBUSxHQUFXLFVBQVUsQ0FBQztnQkFDcEMsVUFBVSxJQUFJLENBQUMsQ0FBQyxDQUFDLDJDQUEyQztnQkFFNUQsSUFBSSxZQUFZLEdBQVcsRUFBRSxDQUFDO2dCQUU5QixPQUFPLFVBQVUsR0FBRyxVQUFVLEVBQUU7b0JB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