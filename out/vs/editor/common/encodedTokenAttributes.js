/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TokenMetadata = exports.MetadataConsts = exports.StandardTokenType = exports.ColorId = exports.FontStyle = exports.LanguageId = void 0;
    /**
     * Open ended enum at runtime
     */
    var LanguageId;
    (function (LanguageId) {
        LanguageId[LanguageId["Null"] = 0] = "Null";
        LanguageId[LanguageId["PlainText"] = 1] = "PlainText";
    })(LanguageId || (exports.LanguageId = LanguageId = {}));
    /**
     * A font style. Values are 2^x such that a bit mask can be used.
     */
    var FontStyle;
    (function (FontStyle) {
        FontStyle[FontStyle["NotSet"] = -1] = "NotSet";
        FontStyle[FontStyle["None"] = 0] = "None";
        FontStyle[FontStyle["Italic"] = 1] = "Italic";
        FontStyle[FontStyle["Bold"] = 2] = "Bold";
        FontStyle[FontStyle["Underline"] = 4] = "Underline";
        FontStyle[FontStyle["Strikethrough"] = 8] = "Strikethrough";
    })(FontStyle || (exports.FontStyle = FontStyle = {}));
    /**
     * Open ended enum at runtime
     */
    var ColorId;
    (function (ColorId) {
        ColorId[ColorId["None"] = 0] = "None";
        ColorId[ColorId["DefaultForeground"] = 1] = "DefaultForeground";
        ColorId[ColorId["DefaultBackground"] = 2] = "DefaultBackground";
    })(ColorId || (exports.ColorId = ColorId = {}));
    /**
     * A standard token type.
     */
    var StandardTokenType;
    (function (StandardTokenType) {
        StandardTokenType[StandardTokenType["Other"] = 0] = "Other";
        StandardTokenType[StandardTokenType["Comment"] = 1] = "Comment";
        StandardTokenType[StandardTokenType["String"] = 2] = "String";
        StandardTokenType[StandardTokenType["RegEx"] = 3] = "RegEx";
    })(StandardTokenType || (exports.StandardTokenType = StandardTokenType = {}));
    /**
     * Helpers to manage the "collapsed" metadata of an entire StackElement stack.
     * The following assumptions have been made:
     *  - languageId < 256 => needs 8 bits
     *  - unique color count < 512 => needs 9 bits
     *
     * The binary format is:
     * - -------------------------------------------
     *     3322 2222 2222 1111 1111 1100 0000 0000
     *     1098 7654 3210 9876 5432 1098 7654 3210
     * - -------------------------------------------
     *     xxxx xxxx xxxx xxxx xxxx xxxx xxxx xxxx
     *     bbbb bbbb ffff ffff fFFF FBTT LLLL LLLL
     * - -------------------------------------------
     *  - L = LanguageId (8 bits)
     *  - T = StandardTokenType (2 bits)
     *  - B = Balanced bracket (1 bit)
     *  - F = FontStyle (4 bits)
     *  - f = foreground color (9 bits)
     *  - b = background color (9 bits)
     *
     */
    var MetadataConsts;
    (function (MetadataConsts) {
        MetadataConsts[MetadataConsts["LANGUAGEID_MASK"] = 255] = "LANGUAGEID_MASK";
        MetadataConsts[MetadataConsts["TOKEN_TYPE_MASK"] = 768] = "TOKEN_TYPE_MASK";
        MetadataConsts[MetadataConsts["BALANCED_BRACKETS_MASK"] = 1024] = "BALANCED_BRACKETS_MASK";
        MetadataConsts[MetadataConsts["FONT_STYLE_MASK"] = 30720] = "FONT_STYLE_MASK";
        MetadataConsts[MetadataConsts["FOREGROUND_MASK"] = 16744448] = "FOREGROUND_MASK";
        MetadataConsts[MetadataConsts["BACKGROUND_MASK"] = 4278190080] = "BACKGROUND_MASK";
        MetadataConsts[MetadataConsts["ITALIC_MASK"] = 2048] = "ITALIC_MASK";
        MetadataConsts[MetadataConsts["BOLD_MASK"] = 4096] = "BOLD_MASK";
        MetadataConsts[MetadataConsts["UNDERLINE_MASK"] = 8192] = "UNDERLINE_MASK";
        MetadataConsts[MetadataConsts["STRIKETHROUGH_MASK"] = 16384] = "STRIKETHROUGH_MASK";
        // Semantic tokens cannot set the language id, so we can
        // use the first 8 bits for control purposes
        MetadataConsts[MetadataConsts["SEMANTIC_USE_ITALIC"] = 1] = "SEMANTIC_USE_ITALIC";
        MetadataConsts[MetadataConsts["SEMANTIC_USE_BOLD"] = 2] = "SEMANTIC_USE_BOLD";
        MetadataConsts[MetadataConsts["SEMANTIC_USE_UNDERLINE"] = 4] = "SEMANTIC_USE_UNDERLINE";
        MetadataConsts[MetadataConsts["SEMANTIC_USE_STRIKETHROUGH"] = 8] = "SEMANTIC_USE_STRIKETHROUGH";
        MetadataConsts[MetadataConsts["SEMANTIC_USE_FOREGROUND"] = 16] = "SEMANTIC_USE_FOREGROUND";
        MetadataConsts[MetadataConsts["SEMANTIC_USE_BACKGROUND"] = 32] = "SEMANTIC_USE_BACKGROUND";
        MetadataConsts[MetadataConsts["LANGUAGEID_OFFSET"] = 0] = "LANGUAGEID_OFFSET";
        MetadataConsts[MetadataConsts["TOKEN_TYPE_OFFSET"] = 8] = "TOKEN_TYPE_OFFSET";
        MetadataConsts[MetadataConsts["BALANCED_BRACKETS_OFFSET"] = 10] = "BALANCED_BRACKETS_OFFSET";
        MetadataConsts[MetadataConsts["FONT_STYLE_OFFSET"] = 11] = "FONT_STYLE_OFFSET";
        MetadataConsts[MetadataConsts["FOREGROUND_OFFSET"] = 15] = "FOREGROUND_OFFSET";
        MetadataConsts[MetadataConsts["BACKGROUND_OFFSET"] = 24] = "BACKGROUND_OFFSET";
    })(MetadataConsts || (exports.MetadataConsts = MetadataConsts = {}));
    /**
     */
    class TokenMetadata {
        static getLanguageId(metadata) {
            return (metadata & 255 /* MetadataConsts.LANGUAGEID_MASK */) >>> 0 /* MetadataConsts.LANGUAGEID_OFFSET */;
        }
        static getTokenType(metadata) {
            return (metadata & 768 /* MetadataConsts.TOKEN_TYPE_MASK */) >>> 8 /* MetadataConsts.TOKEN_TYPE_OFFSET */;
        }
        static containsBalancedBrackets(metadata) {
            return (metadata & 1024 /* MetadataConsts.BALANCED_BRACKETS_MASK */) !== 0;
        }
        static getFontStyle(metadata) {
            return (metadata & 30720 /* MetadataConsts.FONT_STYLE_MASK */) >>> 11 /* MetadataConsts.FONT_STYLE_OFFSET */;
        }
        static getForeground(metadata) {
            return (metadata & 16744448 /* MetadataConsts.FOREGROUND_MASK */) >>> 15 /* MetadataConsts.FOREGROUND_OFFSET */;
        }
        static getBackground(metadata) {
            return (metadata & 4278190080 /* MetadataConsts.BACKGROUND_MASK */) >>> 24 /* MetadataConsts.BACKGROUND_OFFSET */;
        }
        static getClassNameFromMetadata(metadata) {
            const foreground = this.getForeground(metadata);
            let className = 'mtk' + foreground;
            const fontStyle = this.getFontStyle(metadata);
            if (fontStyle & 1 /* FontStyle.Italic */) {
                className += ' mtki';
            }
            if (fontStyle & 2 /* FontStyle.Bold */) {
                className += ' mtkb';
            }
            if (fontStyle & 4 /* FontStyle.Underline */) {
                className += ' mtku';
            }
            if (fontStyle & 8 /* FontStyle.Strikethrough */) {
                className += ' mtks';
            }
            return className;
        }
        static getInlineStyleFromMetadata(metadata, colorMap) {
            const foreground = this.getForeground(metadata);
            const fontStyle = this.getFontStyle(metadata);
            let result = `color: ${colorMap[foreground]};`;
            if (fontStyle & 1 /* FontStyle.Italic */) {
                result += 'font-style: italic;';
            }
            if (fontStyle & 2 /* FontStyle.Bold */) {
                result += 'font-weight: bold;';
            }
            let textDecoration = '';
            if (fontStyle & 4 /* FontStyle.Underline */) {
                textDecoration += ' underline';
            }
            if (fontStyle & 8 /* FontStyle.Strikethrough */) {
                textDecoration += ' line-through';
            }
            if (textDecoration) {
                result += `text-decoration:${textDecoration};`;
            }
            return result;
        }
        static getPresentationFromMetadata(metadata) {
            const foreground = this.getForeground(metadata);
            const fontStyle = this.getFontStyle(metadata);
            return {
                foreground: foreground,
                italic: Boolean(fontStyle & 1 /* FontStyle.Italic */),
                bold: Boolean(fontStyle & 2 /* FontStyle.Bold */),
                underline: Boolean(fontStyle & 4 /* FontStyle.Underline */),
                strikethrough: Boolean(fontStyle & 8 /* FontStyle.Strikethrough */),
            };
        }
    }
    exports.TokenMetadata = TokenMetadata;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW5jb2RlZFRva2VuQXR0cmlidXRlcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vZW5jb2RlZFRva2VuQXR0cmlidXRlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFFaEc7O09BRUc7SUFDSCxJQUFrQixVQUdqQjtJQUhELFdBQWtCLFVBQVU7UUFDM0IsMkNBQVEsQ0FBQTtRQUNSLHFEQUFhLENBQUE7SUFDZCxDQUFDLEVBSGlCLFVBQVUsMEJBQVYsVUFBVSxRQUczQjtJQUVEOztPQUVHO0lBQ0gsSUFBa0IsU0FPakI7SUFQRCxXQUFrQixTQUFTO1FBQzFCLDhDQUFXLENBQUE7UUFDWCx5Q0FBUSxDQUFBO1FBQ1IsNkNBQVUsQ0FBQTtRQUNWLHlDQUFRLENBQUE7UUFDUixtREFBYSxDQUFBO1FBQ2IsMkRBQWlCLENBQUE7SUFDbEIsQ0FBQyxFQVBpQixTQUFTLHlCQUFULFNBQVMsUUFPMUI7SUFFRDs7T0FFRztJQUNILElBQWtCLE9BSWpCO0lBSkQsV0FBa0IsT0FBTztRQUN4QixxQ0FBUSxDQUFBO1FBQ1IsK0RBQXFCLENBQUE7UUFDckIsK0RBQXFCLENBQUE7SUFDdEIsQ0FBQyxFQUppQixPQUFPLHVCQUFQLE9BQU8sUUFJeEI7SUFFRDs7T0FFRztJQUNILElBQWtCLGlCQUtqQjtJQUxELFdBQWtCLGlCQUFpQjtRQUNsQywyREFBUyxDQUFBO1FBQ1QsK0RBQVcsQ0FBQTtRQUNYLDZEQUFVLENBQUE7UUFDViwyREFBUyxDQUFBO0lBQ1YsQ0FBQyxFQUxpQixpQkFBaUIsaUNBQWpCLGlCQUFpQixRQUtsQztJQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FxQkc7SUFDSCxJQUFrQixjQTRCakI7SUE1QkQsV0FBa0IsY0FBYztRQUMvQiwyRUFBb0QsQ0FBQTtRQUNwRCwyRUFBb0QsQ0FBQTtRQUNwRCwwRkFBMkQsQ0FBQTtRQUMzRCw2RUFBb0QsQ0FBQTtRQUNwRCxnRkFBb0QsQ0FBQTtRQUNwRCxrRkFBb0QsQ0FBQTtRQUVwRCxvRUFBZ0QsQ0FBQTtRQUNoRCxnRUFBOEMsQ0FBQTtRQUM5QywwRUFBbUQsQ0FBQTtRQUNuRCxtRkFBdUQsQ0FBQTtRQUV2RCx3REFBd0Q7UUFDeEQsNENBQTRDO1FBQzVDLGlGQUF3RCxDQUFBO1FBQ3hELDZFQUFzRCxDQUFBO1FBQ3RELHVGQUEyRCxDQUFBO1FBQzNELCtGQUErRCxDQUFBO1FBQy9ELDBGQUE0RCxDQUFBO1FBQzVELDBGQUE0RCxDQUFBO1FBRTVELDZFQUFxQixDQUFBO1FBQ3JCLDZFQUFxQixDQUFBO1FBQ3JCLDRGQUE2QixDQUFBO1FBQzdCLDhFQUFzQixDQUFBO1FBQ3RCLDhFQUFzQixDQUFBO1FBQ3RCLDhFQUFzQixDQUFBO0lBQ3ZCLENBQUMsRUE1QmlCLGNBQWMsOEJBQWQsY0FBYyxRQTRCL0I7SUFFRDtPQUNHO0lBQ0gsTUFBYSxhQUFhO1FBRWxCLE1BQU0sQ0FBQyxhQUFhLENBQUMsUUFBZ0I7WUFDM0MsT0FBTyxDQUFDLFFBQVEsMkNBQWlDLENBQUMsNkNBQXFDLENBQUM7UUFDekYsQ0FBQztRQUVNLE1BQU0sQ0FBQyxZQUFZLENBQUMsUUFBZ0I7WUFDMUMsT0FBTyxDQUFDLFFBQVEsMkNBQWlDLENBQUMsNkNBQXFDLENBQUM7UUFDekYsQ0FBQztRQUVNLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxRQUFnQjtZQUN0RCxPQUFPLENBQUMsUUFBUSxtREFBd0MsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNqRSxDQUFDO1FBRU0sTUFBTSxDQUFDLFlBQVksQ0FBQyxRQUFnQjtZQUMxQyxPQUFPLENBQUMsUUFBUSw2Q0FBaUMsQ0FBQyw4Q0FBcUMsQ0FBQztRQUN6RixDQUFDO1FBRU0sTUFBTSxDQUFDLGFBQWEsQ0FBQyxRQUFnQjtZQUMzQyxPQUFPLENBQUMsUUFBUSxnREFBaUMsQ0FBQyw4Q0FBcUMsQ0FBQztRQUN6RixDQUFDO1FBRU0sTUFBTSxDQUFDLGFBQWEsQ0FBQyxRQUFnQjtZQUMzQyxPQUFPLENBQUMsUUFBUSxrREFBaUMsQ0FBQyw4Q0FBcUMsQ0FBQztRQUN6RixDQUFDO1FBRU0sTUFBTSxDQUFDLHdCQUF3QixDQUFDLFFBQWdCO1lBQ3RELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDaEQsSUFBSSxTQUFTLEdBQUcsS0FBSyxHQUFHLFVBQVUsQ0FBQztZQUVuQyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzlDLElBQUksU0FBUywyQkFBbUIsRUFBRTtnQkFDakMsU0FBUyxJQUFJLE9BQU8sQ0FBQzthQUNyQjtZQUNELElBQUksU0FBUyx5QkFBaUIsRUFBRTtnQkFDL0IsU0FBUyxJQUFJLE9BQU8sQ0FBQzthQUNyQjtZQUNELElBQUksU0FBUyw4QkFBc0IsRUFBRTtnQkFDcEMsU0FBUyxJQUFJLE9BQU8sQ0FBQzthQUNyQjtZQUNELElBQUksU0FBUyxrQ0FBMEIsRUFBRTtnQkFDeEMsU0FBUyxJQUFJLE9BQU8sQ0FBQzthQUNyQjtZQUVELE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFFTSxNQUFNLENBQUMsMEJBQTBCLENBQUMsUUFBZ0IsRUFBRSxRQUFrQjtZQUM1RSxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2hELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFOUMsSUFBSSxNQUFNLEdBQUcsVUFBVSxRQUFRLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQztZQUMvQyxJQUFJLFNBQVMsMkJBQW1CLEVBQUU7Z0JBQ2pDLE1BQU0sSUFBSSxxQkFBcUIsQ0FBQzthQUNoQztZQUNELElBQUksU0FBUyx5QkFBaUIsRUFBRTtnQkFDL0IsTUFBTSxJQUFJLG9CQUFvQixDQUFDO2FBQy9CO1lBQ0QsSUFBSSxjQUFjLEdBQUcsRUFBRSxDQUFDO1lBQ3hCLElBQUksU0FBUyw4QkFBc0IsRUFBRTtnQkFDcEMsY0FBYyxJQUFJLFlBQVksQ0FBQzthQUMvQjtZQUNELElBQUksU0FBUyxrQ0FBMEIsRUFBRTtnQkFDeEMsY0FBYyxJQUFJLGVBQWUsQ0FBQzthQUNsQztZQUNELElBQUksY0FBYyxFQUFFO2dCQUNuQixNQUFNLElBQUksbUJBQW1CLGNBQWMsR0FBRyxDQUFDO2FBRS9DO1lBQ0QsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO1FBRU0sTUFBTSxDQUFDLDJCQUEyQixDQUFDLFFBQWdCO1lBQ3pELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDaEQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUU5QyxPQUFPO2dCQUNOLFVBQVUsRUFBRSxVQUFVO2dCQUN0QixNQUFNLEVBQUUsT0FBTyxDQUFDLFNBQVMsMkJBQW1CLENBQUM7Z0JBQzdDLElBQUksRUFBRSxPQUFPLENBQUMsU0FBUyx5QkFBaUIsQ0FBQztnQkFDekMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxTQUFTLDhCQUFzQixDQUFDO2dCQUNuRCxhQUFhLEVBQUUsT0FBTyxDQUFDLFNBQVMsa0NBQTBCLENBQUM7YUFDM0QsQ0FBQztRQUNILENBQUM7S0FDRDtJQXBGRCxzQ0FvRkMifQ==