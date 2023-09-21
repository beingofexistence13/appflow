define(["require", "exports", "vs/base/common/color"], function (require, exports, color_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.computeDefaultDocumentColors = void 0;
    function _parseCaptureGroups(captureGroups) {
        const values = [];
        for (const captureGroup of captureGroups) {
            const parsedNumber = Number(captureGroup);
            if (parsedNumber || parsedNumber === 0 && captureGroup.replace(/\s/g, '') !== '') {
                values.push(parsedNumber);
            }
        }
        return values;
    }
    function _toIColor(r, g, b, a) {
        return {
            red: r / 255,
            blue: b / 255,
            green: g / 255,
            alpha: a
        };
    }
    function _findRange(model, match) {
        const index = match.index;
        const length = match[0].length;
        if (!index) {
            return;
        }
        const startPosition = model.positionAt(index);
        const range = {
            startLineNumber: startPosition.lineNumber,
            startColumn: startPosition.column,
            endLineNumber: startPosition.lineNumber,
            endColumn: startPosition.column + length
        };
        return range;
    }
    function _findHexColorInformation(range, hexValue) {
        if (!range) {
            return;
        }
        const parsedHexColor = color_1.Color.Format.CSS.parseHex(hexValue);
        if (!parsedHexColor) {
            return;
        }
        return {
            range: range,
            color: _toIColor(parsedHexColor.rgba.r, parsedHexColor.rgba.g, parsedHexColor.rgba.b, parsedHexColor.rgba.a)
        };
    }
    function _findRGBColorInformation(range, matches, isAlpha) {
        if (!range || matches.length !== 1) {
            return;
        }
        const match = matches[0];
        const captureGroups = match.values();
        const parsedRegex = _parseCaptureGroups(captureGroups);
        return {
            range: range,
            color: _toIColor(parsedRegex[0], parsedRegex[1], parsedRegex[2], isAlpha ? parsedRegex[3] : 1)
        };
    }
    function _findHSLColorInformation(range, matches, isAlpha) {
        if (!range || matches.length !== 1) {
            return;
        }
        const match = matches[0];
        const captureGroups = match.values();
        const parsedRegex = _parseCaptureGroups(captureGroups);
        const colorEquivalent = new color_1.Color(new color_1.HSLA(parsedRegex[0], parsedRegex[1] / 100, parsedRegex[2] / 100, isAlpha ? parsedRegex[3] : 1));
        return {
            range: range,
            color: _toIColor(colorEquivalent.rgba.r, colorEquivalent.rgba.g, colorEquivalent.rgba.b, colorEquivalent.rgba.a)
        };
    }
    function _findMatches(model, regex) {
        if (typeof model === 'string') {
            return [...model.matchAll(regex)];
        }
        else {
            return model.findMatches(regex);
        }
    }
    function computeColors(model) {
        const result = [];
        // Early validation for RGB and HSL
        const initialValidationRegex = /\b(rgb|rgba|hsl|hsla)(\([0-9\s,.\%]*\))|(#)([A-Fa-f0-9]{3})\b|(#)([A-Fa-f0-9]{4})\b|(#)([A-Fa-f0-9]{6})\b|(#)([A-Fa-f0-9]{8})\b/gm;
        const initialValidationMatches = _findMatches(model, initialValidationRegex);
        // Potential colors have been found, validate the parameters
        if (initialValidationMatches.length > 0) {
            for (const initialMatch of initialValidationMatches) {
                const initialCaptureGroups = initialMatch.filter(captureGroup => captureGroup !== undefined);
                const colorScheme = initialCaptureGroups[1];
                const colorParameters = initialCaptureGroups[2];
                if (!colorParameters) {
                    continue;
                }
                let colorInformation;
                if (colorScheme === 'rgb') {
                    const regexParameters = /^\(\s*(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\s*,\s*(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\s*,\s*(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\s*\)$/gm;
                    colorInformation = _findRGBColorInformation(_findRange(model, initialMatch), _findMatches(colorParameters, regexParameters), false);
                }
                else if (colorScheme === 'rgba') {
                    const regexParameters = /^\(\s*(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\s*,\s*(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\s*,\s*(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\s*,\s*(0[.][0-9]+|[.][0-9]+|[01][.]|[01])\s*\)$/gm;
                    colorInformation = _findRGBColorInformation(_findRange(model, initialMatch), _findMatches(colorParameters, regexParameters), true);
                }
                else if (colorScheme === 'hsl') {
                    const regexParameters = /^\(\s*(36[0]|3[0-5][0-9]|[12][0-9][0-9]|[1-9]?[0-9])\s*,\s*(100|\d{1,2}[.]\d*|\d{1,2})%\s*,\s*(100|\d{1,2}[.]\d*|\d{1,2})%\s*\)$/gm;
                    colorInformation = _findHSLColorInformation(_findRange(model, initialMatch), _findMatches(colorParameters, regexParameters), false);
                }
                else if (colorScheme === 'hsla') {
                    const regexParameters = /^\(\s*(36[0]|3[0-5][0-9]|[12][0-9][0-9]|[1-9]?[0-9])\s*,\s*(100|\d{1,2}[.]\d*|\d{1,2})%\s*,\s*(100|\d{1,2}[.]\d*|\d{1,2})%\s*,\s*(0[.][0-9]+|[.][0-9]+|[01][.]|[01])\s*\)$/gm;
                    colorInformation = _findHSLColorInformation(_findRange(model, initialMatch), _findMatches(colorParameters, regexParameters), true);
                }
                else if (colorScheme === '#') {
                    colorInformation = _findHexColorInformation(_findRange(model, initialMatch), colorScheme + colorParameters);
                }
                if (colorInformation) {
                    result.push(colorInformation);
                }
            }
        }
        return result;
    }
    /**
     * Returns an array of all default document colors in the provided document
     */
    function computeDefaultDocumentColors(model) {
        if (!model || typeof model.getValue !== 'function' || typeof model.positionAt !== 'function') {
            // Unknown caller!
            return [];
        }
        return computeColors(model);
    }
    exports.computeDefaultDocumentColors = computeDefaultDocumentColors;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdERvY3VtZW50Q29sb3JzQ29tcHV0ZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL2xhbmd1YWdlcy9kZWZhdWx0RG9jdW1lbnRDb2xvcnNDb21wdXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBZUEsU0FBUyxtQkFBbUIsQ0FBQyxhQUF1QztRQUNuRSxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDbEIsS0FBSyxNQUFNLFlBQVksSUFBSSxhQUFhLEVBQUU7WUFDekMsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzFDLElBQUksWUFBWSxJQUFJLFlBQVksS0FBSyxDQUFDLElBQUksWUFBWSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFO2dCQUNqRixNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO2FBQzFCO1NBQ0Q7UUFDRCxPQUFPLE1BQU0sQ0FBQztJQUNmLENBQUM7SUFFRCxTQUFTLFNBQVMsQ0FBQyxDQUFTLEVBQUUsQ0FBUyxFQUFFLENBQVMsRUFBRSxDQUFTO1FBQzVELE9BQU87WUFDTixHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUc7WUFDWixJQUFJLEVBQUUsQ0FBQyxHQUFHLEdBQUc7WUFDYixLQUFLLEVBQUUsQ0FBQyxHQUFHLEdBQUc7WUFDZCxLQUFLLEVBQUUsQ0FBQztTQUNSLENBQUM7SUFDSCxDQUFDO0lBRUQsU0FBUyxVQUFVLENBQUMsS0FBbUMsRUFBRSxLQUF1QjtRQUMvRSxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO1FBQzFCLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDL0IsSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNYLE9BQU87U0FDUDtRQUNELE1B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