/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/contrib/testing/common/testItemCollection"], function (require, exports, testItemCollection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getPrivateApiFor = exports.createPrivateApiFor = void 0;
    const eventPrivateApis = new WeakMap();
    const createPrivateApiFor = (impl, controllerId) => {
        const api = { controllerId };
        eventPrivateApis.set(impl, api);
        return api;
    };
    exports.createPrivateApiFor = createPrivateApiFor;
    /**
     * Gets the private API for a test item implementation. This implementation
     * is a managed object, but we keep a weakmap to avoid exposing any of the
     * internals to extensions.
     */
    const getPrivateApiFor = (impl) => {
        const api = eventPrivateApis.get(impl);
        if (!api) {
            throw new testItemCollection_1.InvalidTestItemError(impl?.id || '<unknown>');
        }
        return api;
    };
    exports.getPrivateApiFor = getPrivateApiFor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFRlc3RpbmdQcml2YXRlQXBpLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9jb21tb24vZXh0SG9zdFRlc3RpbmdQcml2YXRlQXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVdoRyxNQUFNLGdCQUFnQixHQUFHLElBQUksT0FBTyxFQUF3QyxDQUFDO0lBRXRFLE1BQU0sbUJBQW1CLEdBQUcsQ0FBQyxJQUFxQixFQUFFLFlBQW9CLEVBQUUsRUFBRTtRQUNsRixNQUFNLEdBQUcsR0FBd0IsRUFBRSxZQUFZLEVBQUUsQ0FBQztRQUNsRCxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2hDLE9BQU8sR0FBRyxDQUFDO0lBQ1osQ0FBQyxDQUFDO0lBSlcsUUFBQSxtQkFBbUIsdUJBSTlCO0lBRUY7Ozs7T0FJRztJQUNJLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxJQUFxQixFQUFFLEVBQUU7UUFDekQsTUFBTSxHQUFHLEdBQUcsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDVCxNQUFNLElBQUkseUNBQW9CLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxXQUFXLENBQUMsQ0FBQztTQUN4RDtRQUVELE9BQU8sR0FBRyxDQUFDO0lBQ1osQ0FBQyxDQUFDO0lBUFcsUUFBQSxnQkFBZ0Isb0JBTzNCIn0=