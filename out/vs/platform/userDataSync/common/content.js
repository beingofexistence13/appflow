/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/jsonEdit"], function (require, exports, jsonEdit_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getLineEndOffset = exports.getLineStartOffset = exports.edit = void 0;
    function edit(content, originalPath, value, formattingOptions) {
        const edit = (0, jsonEdit_1.setProperty)(content, originalPath, value, formattingOptions)[0];
        if (edit) {
            content = content.substring(0, edit.offset) + edit.content + content.substring(edit.offset + edit.length);
        }
        return content;
    }
    exports.edit = edit;
    function getLineStartOffset(content, eol, atOffset) {
        let lineStartingOffset = atOffset;
        while (lineStartingOffset >= 0) {
            if (content.charAt(lineStartingOffset) === eol.charAt(eol.length - 1)) {
                if (eol.length === 1) {
                    return lineStartingOffset + 1;
                }
            }
            lineStartingOffset--;
            if (eol.length === 2) {
                if (lineStartingOffset >= 0 && content.charAt(lineStartingOffset) === eol.charAt(0)) {
                    return lineStartingOffset + 2;
                }
            }
        }
        return 0;
    }
    exports.getLineStartOffset = getLineStartOffset;
    function getLineEndOffset(content, eol, atOffset) {
        let lineEndOffset = atOffset;
        while (lineEndOffset >= 0) {
            if (content.charAt(lineEndOffset) === eol.charAt(eol.length - 1)) {
                if (eol.length === 1) {
                    return lineEndOffset;
                }
            }
            lineEndOffset++;
            if (eol.length === 2) {
                if (lineEndOffset >= 0 && content.charAt(lineEndOffset) === eol.charAt(1)) {
                    return lineEndOffset;
                }
            }
        }
        return content.length - 1;
    }
    exports.getLineEndOffset = getLineEndOffset;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3VzZXJEYXRhU3luYy9jb21tb24vY29udGVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFPaEcsU0FBZ0IsSUFBSSxDQUFDLE9BQWUsRUFBRSxZQUFzQixFQUFFLEtBQVUsRUFBRSxpQkFBb0M7UUFDN0csTUFBTSxJQUFJLEdBQUcsSUFBQSxzQkFBVyxFQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0UsSUFBSSxJQUFJLEVBQUU7WUFDVCxPQUFPLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUMxRztRQUNELE9BQU8sT0FBTyxDQUFDO0lBQ2hCLENBQUM7SUFORCxvQkFNQztJQUVELFNBQWdCLGtCQUFrQixDQUFDLE9BQWUsRUFBRSxHQUFXLEVBQUUsUUFBZ0I7UUFDaEYsSUFBSSxrQkFBa0IsR0FBRyxRQUFRLENBQUM7UUFDbEMsT0FBTyxrQkFBa0IsSUFBSSxDQUFDLEVBQUU7WUFDL0IsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLEtBQUssR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxFQUFFO2dCQUN0RSxJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO29CQUNyQixPQUFPLGtCQUFrQixHQUFHLENBQUMsQ0FBQztpQkFDOUI7YUFDRDtZQUNELGtCQUFrQixFQUFFLENBQUM7WUFDckIsSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDckIsSUFBSSxrQkFBa0IsSUFBSSxDQUFDLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0JBQ3BGLE9BQU8sa0JBQWtCLEdBQUcsQ0FBQyxDQUFDO2lCQUM5QjthQUNEO1NBQ0Q7UUFDRCxPQUFPLENBQUMsQ0FBQztJQUNWLENBQUM7SUFoQkQsZ0RBZ0JDO0lBRUQsU0FBZ0IsZ0JBQWdCLENBQUMsT0FBZSxFQUFFLEdBQVcsRUFBRSxRQUFnQjtRQUM5RSxJQUFJLGFBQWEsR0FBRyxRQUFRLENBQUM7UUFDN0IsT0FBTyxhQUFhLElBQUksQ0FBQyxFQUFFO1lBQzFCLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsS0FBSyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUU7Z0JBQ2pFLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7b0JBQ3JCLE9BQU8sYUFBYSxDQUFDO2lCQUNyQjthQUNEO1lBQ0QsYUFBYSxFQUFFLENBQUM7WUFDaEIsSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDckIsSUFBSSxhQUFhLElBQUksQ0FBQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLEtBQUssR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRTtvQkFDMUUsT0FBTyxhQUFhLENBQUM7aUJBQ3JCO2FBQ0Q7U0FDRDtRQUNELE9BQU8sT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQWhCRCw0Q0FnQkMifQ==