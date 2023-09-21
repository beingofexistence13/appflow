/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkHelpers"], function (require, exports, terminalLinkHelpers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalExternalLinkDetector = void 0;
    class TerminalExternalLinkDetector {
        constructor(id, xterm, _provideLinks) {
            this.id = id;
            this.xterm = xterm;
            this._provideLinks = _provideLinks;
            this.maxLinkLength = 2000;
        }
        async detect(lines, startLine, endLine) {
            // Get the text representation of the wrapped line
            const text = (0, terminalLinkHelpers_1.getXtermLineContent)(this.xterm.buffer.active, startLine, endLine, this.xterm.cols);
            if (text === '' || text.length > this.maxLinkLength) {
                return [];
            }
            const externalLinks = await this._provideLinks(text);
            if (!externalLinks) {
                return [];
            }
            const result = externalLinks.map(link => {
                const bufferRange = (0, terminalLinkHelpers_1.convertLinkRangeToBuffer)(lines, this.xterm.cols, {
                    startColumn: link.startIndex + 1,
                    startLineNumber: 1,
                    endColumn: link.startIndex + link.length + 1,
                    endLineNumber: 1
                }, startLine);
                const matchingText = text.substring(link.startIndex, link.startIndex + link.length) || '';
                const l = {
                    text: matchingText,
                    label: link.label,
                    bufferRange,
                    type: { id: this.id },
                    activate: link.activate
                };
                return l;
            });
            return result;
        }
    }
    exports.TerminalExternalLinkDetector = TerminalExternalLinkDetector;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxFeHRlcm5hbExpbmtEZXRlY3Rvci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsQ29udHJpYi9saW5rcy9icm93c2VyL3Rlcm1pbmFsRXh0ZXJuYWxMaW5rRGV0ZWN0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBT2hHLE1BQWEsNEJBQTRCO1FBR3hDLFlBQ1UsRUFBVSxFQUNWLEtBQWUsRUFDUCxhQUEwRTtZQUZsRixPQUFFLEdBQUYsRUFBRSxDQUFRO1lBQ1YsVUFBSyxHQUFMLEtBQUssQ0FBVTtZQUNQLGtCQUFhLEdBQWIsYUFBYSxDQUE2RDtZQUxuRixrQkFBYSxHQUFHLElBQUksQ0FBQztRQU85QixDQUFDO1FBRUQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFvQixFQUFFLFNBQWlCLEVBQUUsT0FBZTtZQUNwRSxrREFBa0Q7WUFDbEQsTUFBTSxJQUFJLEdBQUcsSUFBQSx5Q0FBbUIsRUFBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2hHLElBQUksSUFBSSxLQUFLLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxhQUFhLEVBQUU7Z0JBQ3BELE9BQU8sRUFBRSxDQUFDO2FBQ1Y7WUFFRCxNQUFNLGFBQWEsR0FBRyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDckQsSUFBSSxDQUFDLGFBQWEsRUFBRTtnQkFDbkIsT0FBTyxFQUFFLENBQUM7YUFDVjtZQUVELE1BQU0sTUFBTSxHQUFHLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3ZDLE1BQU0sV0FBVyxHQUFHLElBQUEsOENBQXdCLEVBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFO29CQUNwRSxXQUFXLEVBQUUsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDO29CQUNoQyxlQUFlLEVBQUUsQ0FBQztvQkFDbEIsU0FBUyxFQUFFLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDO29CQUM1QyxhQUFhLEVBQUUsQ0FBQztpQkFDaEIsRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDZCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUUxRixNQUFNLENBQUMsR0FBd0I7b0JBQzlCLElBQUksRUFBRSxZQUFZO29CQUNsQixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7b0JBQ2pCLFdBQVc7b0JBQ1gsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUU7b0JBQ3JCLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtpQkFDdkIsQ0FBQztnQkFDRixPQUFPLENBQUMsQ0FBQztZQUNWLENBQUMsQ0FBQyxDQUFDO1lBRUgsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO0tBQ0Q7SUEzQ0Qsb0VBMkNDIn0=