/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/position"], function (require, exports, position_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$jW = void 0;
    class $jW {
        constructor(coordinatesConverter) {
            this.onKeyDown = null;
            this.onKeyUp = null;
            this.onContextMenu = null;
            this.onMouseMove = null;
            this.onMouseLeave = null;
            this.onMouseDown = null;
            this.onMouseUp = null;
            this.onMouseDrag = null;
            this.onMouseDrop = null;
            this.onMouseDropCanceled = null;
            this.onMouseWheel = null;
            this.a = coordinatesConverter;
        }
        emitKeyDown(e) {
            this.onKeyDown?.(e);
        }
        emitKeyUp(e) {
            this.onKeyUp?.(e);
        }
        emitContextMenu(e) {
            this.onContextMenu?.(this.b(e));
        }
        emitMouseMove(e) {
            this.onMouseMove?.(this.b(e));
        }
        emitMouseLeave(e) {
            this.onMouseLeave?.(this.b(e));
        }
        emitMouseDown(e) {
            this.onMouseDown?.(this.b(e));
        }
        emitMouseUp(e) {
            this.onMouseUp?.(this.b(e));
        }
        emitMouseDrag(e) {
            this.onMouseDrag?.(this.b(e));
        }
        emitMouseDrop(e) {
            this.onMouseDrop?.(this.b(e));
        }
        emitMouseDropCanceled() {
            this.onMouseDropCanceled?.();
        }
        emitMouseWheel(e) {
            this.onMouseWheel?.(e);
        }
        b(e) {
            if (e.target) {
                return {
                    event: e.event,
                    target: this.c(e.target)
                };
            }
            return e;
        }
        c(target) {
            return $jW.convertViewToModelMouseTarget(target, this.a);
        }
        static convertViewToModelMouseTarget(target, coordinatesConverter) {
            const result = { ...target };
            if (result.position) {
                result.position = coordinatesConverter.convertViewPositionToModelPosition(result.position);
            }
            if (result.range) {
                result.range = coordinatesConverter.convertViewRangeToModelRange(result.range);
            }
            if (result.type === 5 /* MouseTargetType.GUTTER_VIEW_ZONE */ || result.type === 8 /* MouseTargetType.CONTENT_VIEW_ZONE */) {
                result.detail = this.d(result.detail, coordinatesConverter);
            }
            return result;
        }
        static d(data, coordinatesConverter) {
            return {
                viewZoneId: data.viewZoneId,
                positionBefore: data.positionBefore ? coordinatesConverter.convertViewPositionToModelPosition(data.positionBefore) : data.positionBefore,
                positionAfter: data.positionAfter ? coordinatesConverter.convertViewPositionToModelPosition(data.positionAfter) : data.positionAfter,
                position: coordinatesConverter.convertViewPositionToModelPosition(data.position),
                afterLineNumber: coordinatesConverter.convertViewPositionToModelPosition(new position_1.$js(data.afterLineNumber, 1)).lineNumber,
            };
        }
    }
    exports.$jW = $jW;
});
//# sourceMappingURL=viewUserInputEvents.js.map