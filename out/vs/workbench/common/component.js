/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/common/memento", "vs/platform/theme/common/themeService"], function (require, exports, memento_1, themeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Component = void 0;
    class Component extends themeService_1.Themable {
        constructor(id, themeService, storageService) {
            super(themeService);
            this.id = id;
            this.id = id;
            this.memento = new memento_1.Memento(this.id, storageService);
            this._register(storageService.onWillSaveState(() => {
                // Ask the component to persist state into the memento
                this.saveState();
                // Then save the memento into storage
                this.memento.saveMemento();
            }));
        }
        getId() {
            return this.id;
        }
        getMemento(scope, target) {
            return this.memento.getMemento(scope, target);
        }
        saveState() {
            // Subclasses to implement for storing state
        }
    }
    exports.Component = Component;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbW1vbi9jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTWhHLE1BQWEsU0FBVSxTQUFRLHVCQUFRO1FBSXRDLFlBQ2tCLEVBQVUsRUFDM0IsWUFBMkIsRUFDM0IsY0FBK0I7WUFFL0IsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBSkgsT0FBRSxHQUFGLEVBQUUsQ0FBUTtZQU0zQixJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztZQUNiLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxpQkFBTyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFFcEQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDLEdBQUcsRUFBRTtnQkFFbEQsc0RBQXNEO2dCQUN0RCxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBRWpCLHFDQUFxQztnQkFDckMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUM1QixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVELEtBQUs7WUFDSixPQUFPLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDaEIsQ0FBQztRQUVTLFVBQVUsQ0FBQyxLQUFtQixFQUFFLE1BQXFCO1lBQzlELE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFFUyxTQUFTO1lBQ2xCLDRDQUE0QztRQUM3QyxDQUFDO0tBQ0Q7SUFuQ0QsOEJBbUNDIn0=