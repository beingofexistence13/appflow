/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/css!./aria"], function (require, exports, dom) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.status = exports.alert = exports.setARIAContainer = void 0;
    // Use a max length since we are inserting the whole msg in the DOM and that can cause browsers to freeze for long messages #94233
    const MAX_MESSAGE_LENGTH = 20000;
    let ariaContainer;
    let alertContainer;
    let alertContainer2;
    let statusContainer;
    let statusContainer2;
    function setARIAContainer(parent) {
        ariaContainer = document.createElement('div');
        ariaContainer.className = 'monaco-aria-container';
        const createAlertContainer = () => {
            const element = document.createElement('div');
            element.className = 'monaco-alert';
            element.setAttribute('role', 'alert');
            element.setAttribute('aria-atomic', 'true');
            ariaContainer.appendChild(element);
            return element;
        };
        alertContainer = createAlertContainer();
        alertContainer2 = createAlertContainer();
        const createStatusContainer = () => {
            const element = document.createElement('div');
            element.className = 'monaco-status';
            element.setAttribute('aria-live', 'polite');
            element.setAttribute('aria-atomic', 'true');
            ariaContainer.appendChild(element);
            return element;
        };
        statusContainer = createStatusContainer();
        statusContainer2 = createStatusContainer();
        parent.appendChild(ariaContainer);
    }
    exports.setARIAContainer = setARIAContainer;
    /**
     * Given the provided message, will make sure that it is read as alert to screen readers.
     */
    function alert(msg) {
        if (!ariaContainer) {
            return;
        }
        // Use alternate containers such that duplicated messages get read out by screen readers #99466
        if (alertContainer.textContent !== msg) {
            dom.clearNode(alertContainer2);
            insertMessage(alertContainer, msg);
        }
        else {
            dom.clearNode(alertContainer);
            insertMessage(alertContainer2, msg);
        }
    }
    exports.alert = alert;
    /**
     * Given the provided message, will make sure that it is read as status to screen readers.
     */
    function status(msg) {
        if (!ariaContainer) {
            return;
        }
        if (statusContainer.textContent !== msg) {
            dom.clearNode(statusContainer2);
            insertMessage(statusContainer, msg);
        }
        else {
            dom.clearNode(statusContainer);
            insertMessage(statusContainer2, msg);
        }
    }
    exports.status = status;
    function insertMessage(target, msg) {
        dom.clearNode(target);
        if (msg.length > MAX_MESSAGE_LENGTH) {
            msg = msg.substr(0, MAX_MESSAGE_LENGTH);
        }
        target.textContent = msg;
        // See https://www.paciellogroup.com/blog/2012/06/html5-accessibility-chops-aria-rolealert-browser-support/
        target.style.visibility = 'hidden';
        target.style.visibility = 'visible';
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJpYS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvYnJvd3Nlci91aS9hcmlhL2FyaWEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBS2hHLGtJQUFrSTtJQUNsSSxNQUFNLGtCQUFrQixHQUFHLEtBQUssQ0FBQztJQUNqQyxJQUFJLGFBQTBCLENBQUM7SUFDL0IsSUFBSSxjQUEyQixDQUFDO0lBQ2hDLElBQUksZUFBNEIsQ0FBQztJQUNqQyxJQUFJLGVBQTRCLENBQUM7SUFDakMsSUFBSSxnQkFBNkIsQ0FBQztJQUNsQyxTQUFnQixnQkFBZ0IsQ0FBQyxNQUFtQjtRQUNuRCxhQUFhLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM5QyxhQUFhLENBQUMsU0FBUyxHQUFHLHVCQUF1QixDQUFDO1FBRWxELE1BQU0sb0JBQW9CLEdBQUcsR0FBRyxFQUFFO1lBQ2pDLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDOUMsT0FBTyxDQUFDLFNBQVMsR0FBRyxjQUFjLENBQUM7WUFDbkMsT0FBTyxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDdEMsT0FBTyxDQUFDLFlBQVksQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDNUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNuQyxPQUFPLE9BQU8sQ0FBQztRQUNoQixDQUFDLENBQUM7UUFDRixjQUFjLEdBQUcsb0JBQW9CLEVBQUUsQ0FBQztRQUN4QyxlQUFlLEdBQUcsb0JBQW9CLEVBQUUsQ0FBQztRQUV6QyxNQUFNLHFCQUFxQixHQUFHLEdBQUcsRUFBRTtZQUNsQyxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzlDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsZUFBZSxDQUFDO1lBQ3BDLE9BQU8sQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQzVDLE9BQU8sQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzVDLGFBQWEsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbkMsT0FBTyxPQUFPLENBQUM7UUFDaEIsQ0FBQyxDQUFDO1FBQ0YsZUFBZSxHQUFHLHFCQUFxQixFQUFFLENBQUM7UUFDMUMsZ0JBQWdCLEdBQUcscUJBQXFCLEVBQUUsQ0FBQztRQUUzQyxNQUFNLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUEzQkQsNENBMkJDO0lBQ0Q7O09BRUc7SUFDSCxTQUFnQixLQUFLLENBQUMsR0FBVztRQUNoQyxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ25CLE9BQU87U0FDUDtRQUVELCtGQUErRjtRQUMvRixJQUFJLGNBQWMsQ0FBQyxXQUFXLEtBQUssR0FBRyxFQUFFO1lBQ3ZDLEdBQUcsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDL0IsYUFBYSxDQUFDLGNBQWMsRUFBRSxHQUFHLENBQUMsQ0FBQztTQUNuQzthQUFNO1lBQ04sR0FBRyxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUM5QixhQUFhLENBQUMsZUFBZSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQ3BDO0lBQ0YsQ0FBQztJQWJELHNCQWFDO0lBRUQ7O09BRUc7SUFDSCxTQUFnQixNQUFNLENBQUMsR0FBVztRQUNqQyxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ25CLE9BQU87U0FDUDtRQUVELElBQUksZUFBZSxDQUFDLFdBQVcsS0FBSyxHQUFHLEVBQUU7WUFDeEMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ2hDLGFBQWEsQ0FBQyxlQUFlLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDcEM7YUFBTTtZQUNOLEdBQUcsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDL0IsYUFBYSxDQUFDLGdCQUFnQixFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQ3JDO0lBQ0YsQ0FBQztJQVpELHdCQVlDO0lBRUQsU0FBUyxhQUFhLENBQUMsTUFBbUIsRUFBRSxHQUFXO1FBQ3RELEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdEIsSUFBSSxHQUFHLENBQUMsTUFBTSxHQUFHLGtCQUFrQixFQUFFO1lBQ3BDLEdBQUcsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1NBQ3hDO1FBQ0QsTUFBTSxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUM7UUFFekIsMkdBQTJHO1FBQzNHLE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQztRQUNuQyxNQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7SUFDckMsQ0FBQyJ9