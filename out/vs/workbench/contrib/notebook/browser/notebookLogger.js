/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.notebookDebug = void 0;
    // import * as DOM from 'vs/base/browser/dom';
    class NotebookLogger {
        constructor() {
            this._frameId = 0;
            this._domFrameLog();
        }
        _domFrameLog() {
            // DOM.scheduleAtNextAnimationFrame(() => {
            // 	this._frameId++;
            // 	this._domFrameLog();
            // }, 1000000);
        }
        debug(...args) {
            const date = new Date();
            console.log(`${date.getSeconds()}:${date.getMilliseconds().toString().padStart(3, '0')}`, `frame #${this._frameId}: `, ...args);
        }
    }
    const instance = new NotebookLogger();
    function notebookDebug(...args) {
        instance.debug(...args);
    }
    exports.notebookDebug = notebookDebug;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tMb2dnZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL25vdGVib29rTG9nZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUVoRyw4Q0FBOEM7SUFFOUMsTUFBTSxjQUFjO1FBQ25CO1lBR1EsYUFBUSxHQUFHLENBQUMsQ0FBQztZQUZwQixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDckIsQ0FBQztRQUVPLFlBQVk7WUFDbkIsMkNBQTJDO1lBQzNDLG9CQUFvQjtZQUVwQix3QkFBd0I7WUFDeEIsZUFBZTtRQUNoQixDQUFDO1FBRUQsS0FBSyxDQUFDLEdBQUcsSUFBVztZQUNuQixNQUFNLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1lBQ3hCLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxVQUFVLElBQUksQ0FBQyxRQUFRLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ2pJLENBQUM7S0FDRDtJQUVELE1BQU0sUUFBUSxHQUFHLElBQUksY0FBYyxFQUFFLENBQUM7SUFDdEMsU0FBZ0IsYUFBYSxDQUFDLEdBQUcsSUFBVztRQUMzQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDekIsQ0FBQztJQUZELHNDQUVDIn0=