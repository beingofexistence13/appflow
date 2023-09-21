/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalWidgetManager = void 0;
    class TerminalWidgetManager {
        constructor() {
            this._attached = new Map();
        }
        attachToElement(terminalWrapper) {
            if (!this._container) {
                this._container = document.createElement('div');
                this._container.classList.add('terminal-widget-container');
                terminalWrapper.appendChild(this._container);
            }
        }
        dispose() {
            if (this._container && this._container.parentElement) {
                this._container.parentElement.removeChild(this._container);
                this._container = undefined;
            }
        }
        attachWidget(widget) {
            if (!this._container) {
                return;
            }
            this._attached.get(widget.id)?.dispose();
            widget.attach(this._container);
            this._attached.set(widget.id, widget);
            return {
                dispose: () => {
                    const current = this._attached.get(widget.id);
                    if (current === widget) {
                        this._attached.delete(widget.id);
                        widget.dispose();
                    }
                }
            };
        }
    }
    exports.TerminalWidgetManager = TerminalWidgetManager;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0TWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsL2Jyb3dzZXIvd2lkZ2V0cy93aWRnZXRNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUtoRyxNQUFhLHFCQUFxQjtRQUFsQztZQUVTLGNBQVMsR0FBaUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQWtDN0QsQ0FBQztRQWhDQSxlQUFlLENBQUMsZUFBNEI7WUFDM0MsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQ3JCLElBQUksQ0FBQyxVQUFVLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDaEQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLDJCQUEyQixDQUFDLENBQUM7Z0JBQzNELGVBQWUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQzdDO1FBQ0YsQ0FBQztRQUVELE9BQU87WUFDTixJQUFJLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLEVBQUU7Z0JBQ3JELElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQzNELElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO2FBQzVCO1FBQ0YsQ0FBQztRQUVELFlBQVksQ0FBQyxNQUF1QjtZQUNuQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDckIsT0FBTzthQUNQO1lBQ0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDO1lBQ3pDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQy9CLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDdEMsT0FBTztnQkFDTixPQUFPLEVBQUUsR0FBRyxFQUFFO29CQUNiLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDOUMsSUFBSSxPQUFPLEtBQUssTUFBTSxFQUFFO3dCQUN2QixJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7d0JBQ2pDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztxQkFDakI7Z0JBQ0YsQ0FBQzthQUNELENBQUM7UUFDSCxDQUFDO0tBQ0Q7SUFwQ0Qsc0RBb0NDIn0=