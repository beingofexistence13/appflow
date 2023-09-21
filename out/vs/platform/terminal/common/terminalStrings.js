/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.formatMessageForTerminal = void 0;
    /**
     * Formats a message from the product to be written to the terminal.
     */
    function formatMessageForTerminal(message, options = {}) {
        let result = '';
        if (!options.excludeLeadingNewLine) {
            result += '\r\n';
        }
        result += '\x1b[0m\x1b[7m * ';
        if (options.loudFormatting) {
            result += '\x1b[0;104m';
        }
        else {
            result += '\x1b[0m';
        }
        result += ` ${message} \x1b[0m\n\r`;
        return result;
    }
    exports.formatMessageForTerminal = formatMessageForTerminal;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxTdHJpbmdzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdGVybWluYWwvY29tbW9uL3Rlcm1pbmFsU3RyaW5ncy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFjaEc7O09BRUc7SUFDSCxTQUFnQix3QkFBd0IsQ0FBQyxPQUFlLEVBQUUsVUFBeUMsRUFBRTtRQUNwRyxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDaEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRTtZQUNuQyxNQUFNLElBQUksTUFBTSxDQUFDO1NBQ2pCO1FBQ0QsTUFBTSxJQUFJLG1CQUFtQixDQUFDO1FBQzlCLElBQUksT0FBTyxDQUFDLGNBQWMsRUFBRTtZQUMzQixNQUFNLElBQUksYUFBYSxDQUFDO1NBQ3hCO2FBQU07WUFDTixNQUFNLElBQUksU0FBUyxDQUFDO1NBQ3BCO1FBQ0QsTUFBTSxJQUFJLElBQUksT0FBTyxjQUFjLENBQUM7UUFDcEMsT0FBTyxNQUFNLENBQUM7SUFDZixDQUFDO0lBYkQsNERBYUMifQ==