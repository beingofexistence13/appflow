/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/languages/languageConfiguration"], function (require, exports, languageConfiguration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.javascriptOnEnterRules = void 0;
    exports.javascriptOnEnterRules = [
        {
            // e.g. /** | */
            beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
            afterText: /^\s*\*\/$/,
            action: { indentAction: languageConfiguration_1.IndentAction.IndentOutdent, appendText: ' * ' }
        }, {
            // e.g. /** ...|
            beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
            action: { indentAction: languageConfiguration_1.IndentAction.None, appendText: ' * ' }
        }, {
            // e.g.  * ...|
            beforeText: /^(\t|[ ])*[ ]\*([ ]([^\*]|\*(?!\/))*)?$/,
            previousLineText: /(?=^(\s*(\/\*\*|\*)).*)(?=(?!(\s*\*\/)))/,
            action: { indentAction: languageConfiguration_1.IndentAction.None, appendText: '* ' }
        }, {
            // e.g.  */|
            beforeText: /^(\t|[ ])*[ ]\*\/\s*$/,
            action: { indentAction: languageConfiguration_1.IndentAction.None, removeText: 1 }
        },
        {
            // e.g.  *-----*/|
            beforeText: /^(\t|[ ])*[ ]\*[^/]*\*\/\s*$/,
            action: { indentAction: languageConfiguration_1.IndentAction.None, removeText: 1 }
        }
    ];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiamF2YXNjcmlwdE9uRW50ZXJSdWxlcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci90ZXN0L2NvbW1vbi9tb2Rlcy9zdXBwb3J0cy9qYXZhc2NyaXB0T25FbnRlclJ1bGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUluRixRQUFBLHNCQUFzQixHQUFHO1FBQ3JDO1lBQ0MsZ0JBQWdCO1lBQ2hCLFVBQVUsRUFBRSxvQ0FBb0M7WUFDaEQsU0FBUyxFQUFFLFdBQVc7WUFDdEIsTUFBTSxFQUFFLEVBQUUsWUFBWSxFQUFFLG9DQUFZLENBQUMsYUFBYSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUU7U0FDdkUsRUFBRTtZQUNGLGdCQUFnQjtZQUNoQixVQUFVLEVBQUUsb0NBQW9DO1lBQ2hELE1BQU0sRUFBRSxFQUFFLFlBQVksRUFBRSxvQ0FBWSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFO1NBQzlELEVBQUU7WUFDRixlQUFlO1lBQ2YsVUFBVSxFQUFFLHlDQUF5QztZQUNyRCxnQkFBZ0IsRUFBRSwwQ0FBMEM7WUFDNUQsTUFBTSxFQUFFLEVBQUUsWUFBWSxFQUFFLG9DQUFZLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUU7U0FDN0QsRUFBRTtZQUNGLFlBQVk7WUFDWixVQUFVLEVBQUUsdUJBQXVCO1lBQ25DLE1BQU0sRUFBRSxFQUFFLFlBQVksRUFBRSxvQ0FBWSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFO1NBQzFEO1FBQ0Q7WUFDQyxrQkFBa0I7WUFDbEIsVUFBVSxFQUFFLDhCQUE4QjtZQUMxQyxNQUFNLEVBQUUsRUFBRSxZQUFZLEVBQUUsb0NBQVksQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRTtTQUMxRDtLQUNELENBQUMifQ==