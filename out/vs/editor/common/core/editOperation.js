/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/range"], function (require, exports, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditOperation = void 0;
    class EditOperation {
        static insert(position, text) {
            return {
                range: new range_1.Range(position.lineNumber, position.column, position.lineNumber, position.column),
                text: text,
                forceMoveMarkers: true
            };
        }
        static delete(range) {
            return {
                range: range,
                text: null
            };
        }
        static replace(range, text) {
            return {
                range: range,
                text: text
            };
        }
        static replaceMove(range, text) {
            return {
                range: range,
                text: text,
                forceMoveMarkers: true
            };
        }
    }
    exports.EditOperation = EditOperation;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdE9wZXJhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vY29yZS9lZGl0T3BlcmF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXlCaEcsTUFBYSxhQUFhO1FBRWxCLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBa0IsRUFBRSxJQUFZO1lBQ3BELE9BQU87Z0JBQ04sS0FBSyxFQUFFLElBQUksYUFBSyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUM7Z0JBQzVGLElBQUksRUFBRSxJQUFJO2dCQUNWLGdCQUFnQixFQUFFLElBQUk7YUFDdEIsQ0FBQztRQUNILENBQUM7UUFFTSxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQVk7WUFDaEMsT0FBTztnQkFDTixLQUFLLEVBQUUsS0FBSztnQkFDWixJQUFJLEVBQUUsSUFBSTthQUNWLENBQUM7UUFDSCxDQUFDO1FBRU0sTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFZLEVBQUUsSUFBbUI7WUFDdEQsT0FBTztnQkFDTixLQUFLLEVBQUUsS0FBSztnQkFDWixJQUFJLEVBQUUsSUFBSTthQUNWLENBQUM7UUFDSCxDQUFDO1FBRU0sTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFZLEVBQUUsSUFBbUI7WUFDMUQsT0FBTztnQkFDTixLQUFLLEVBQUUsS0FBSztnQkFDWixJQUFJLEVBQUUsSUFBSTtnQkFDVixnQkFBZ0IsRUFBRSxJQUFJO2FBQ3RCLENBQUM7UUFDSCxDQUFDO0tBQ0Q7SUEvQkQsc0NBK0JDIn0=