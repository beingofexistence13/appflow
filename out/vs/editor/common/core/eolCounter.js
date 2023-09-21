/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.countEOL = exports.StringEOL = void 0;
    var StringEOL;
    (function (StringEOL) {
        StringEOL[StringEOL["Unknown"] = 0] = "Unknown";
        StringEOL[StringEOL["Invalid"] = 3] = "Invalid";
        StringEOL[StringEOL["LF"] = 1] = "LF";
        StringEOL[StringEOL["CRLF"] = 2] = "CRLF";
    })(StringEOL || (exports.StringEOL = StringEOL = {}));
    function countEOL(text) {
        let eolCount = 0;
        let firstLineLength = 0;
        let lastLineStart = 0;
        let eol = 0 /* StringEOL.Unknown */;
        for (let i = 0, len = text.length; i < len; i++) {
            const chr = text.charCodeAt(i);
            if (chr === 13 /* CharCode.CarriageReturn */) {
                if (eolCount === 0) {
                    firstLineLength = i;
                }
                eolCount++;
                if (i + 1 < len && text.charCodeAt(i + 1) === 10 /* CharCode.LineFeed */) {
                    // \r\n... case
                    eol |= 2 /* StringEOL.CRLF */;
                    i++; // skip \n
                }
                else {
                    // \r... case
                    eol |= 3 /* StringEOL.Invalid */;
                }
                lastLineStart = i + 1;
            }
            else if (chr === 10 /* CharCode.LineFeed */) {
                // \n... case
                eol |= 1 /* StringEOL.LF */;
                if (eolCount === 0) {
                    firstLineLength = i;
                }
                eolCount++;
                lastLineStart = i + 1;
            }
        }
        if (eolCount === 0) {
            firstLineLength = text.length;
        }
        return [eolCount, firstLineLength, text.length - lastLineStart, eol];
    }
    exports.countEOL = countEOL;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW9sQ291bnRlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vY29yZS9lb2xDb3VudGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUloRyxJQUFrQixTQUtqQjtJQUxELFdBQWtCLFNBQVM7UUFDMUIsK0NBQVcsQ0FBQTtRQUNYLCtDQUFXLENBQUE7UUFDWCxxQ0FBTSxDQUFBO1FBQ04seUNBQVEsQ0FBQTtJQUNULENBQUMsRUFMaUIsU0FBUyx5QkFBVCxTQUFTLFFBSzFCO0lBRUQsU0FBZ0IsUUFBUSxDQUFDLElBQVk7UUFDcEMsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLElBQUksZUFBZSxHQUFHLENBQUMsQ0FBQztRQUN4QixJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUM7UUFDdEIsSUFBSSxHQUFHLDRCQUErQixDQUFDO1FBQ3ZDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDaEQsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUUvQixJQUFJLEdBQUcscUNBQTRCLEVBQUU7Z0JBQ3BDLElBQUksUUFBUSxLQUFLLENBQUMsRUFBRTtvQkFDbkIsZUFBZSxHQUFHLENBQUMsQ0FBQztpQkFDcEI7Z0JBQ0QsUUFBUSxFQUFFLENBQUM7Z0JBQ1gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsK0JBQXNCLEVBQUU7b0JBQ2hFLGVBQWU7b0JBQ2YsR0FBRywwQkFBa0IsQ0FBQztvQkFDdEIsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVO2lCQUNmO3FCQUFNO29CQUNOLGFBQWE7b0JBQ2IsR0FBRyw2QkFBcUIsQ0FBQztpQkFDekI7Z0JBQ0QsYUFBYSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDdEI7aUJBQU0sSUFBSSxHQUFHLCtCQUFzQixFQUFFO2dCQUNyQyxhQUFhO2dCQUNiLEdBQUcsd0JBQWdCLENBQUM7Z0JBQ3BCLElBQUksUUFBUSxLQUFLLENBQUMsRUFBRTtvQkFDbkIsZUFBZSxHQUFHLENBQUMsQ0FBQztpQkFDcEI7Z0JBQ0QsUUFBUSxFQUFFLENBQUM7Z0JBQ1gsYUFBYSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDdEI7U0FDRDtRQUNELElBQUksUUFBUSxLQUFLLENBQUMsRUFBRTtZQUNuQixlQUFlLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztTQUM5QjtRQUNELE9BQU8sQ0FBQyxRQUFRLEVBQUUsZUFBZSxFQUFFLElBQUksQ0FBQyxNQUFNLEdBQUcsYUFBYSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3RFLENBQUM7SUFwQ0QsNEJBb0NDIn0=