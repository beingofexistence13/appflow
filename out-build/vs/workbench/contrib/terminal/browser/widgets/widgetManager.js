/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$AKb = void 0;
    class $AKb {
        constructor() {
            this.b = new Map();
        }
        attachToElement(terminalWrapper) {
            if (!this.a) {
                this.a = document.createElement('div');
                this.a.classList.add('terminal-widget-container');
                terminalWrapper.appendChild(this.a);
            }
        }
        dispose() {
            if (this.a && this.a.parentElement) {
                this.a.parentElement.removeChild(this.a);
                this.a = undefined;
            }
        }
        attachWidget(widget) {
            if (!this.a) {
                return;
            }
            this.b.get(widget.id)?.dispose();
            widget.attach(this.a);
            this.b.set(widget.id, widget);
            return {
                dispose: () => {
                    const current = this.b.get(widget.id);
                    if (current === widget) {
                        this.b.delete(widget.id);
                        widget.dispose();
                    }
                }
            };
        }
    }
    exports.$AKb = $AKb;
});
//# sourceMappingURL=widgetManager.js.map