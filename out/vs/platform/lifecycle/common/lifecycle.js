/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async"], function (require, exports, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.handleVetos = void 0;
    // Shared veto handling across main and renderer
    function handleVetos(vetos, onError) {
        if (vetos.length === 0) {
            return Promise.resolve(false);
        }
        const promises = [];
        let lazyValue = false;
        for (const valueOrPromise of vetos) {
            // veto, done
            if (valueOrPromise === true) {
                return Promise.resolve(true);
            }
            if ((0, async_1.isThenable)(valueOrPromise)) {
                promises.push(valueOrPromise.then(value => {
                    if (value) {
                        lazyValue = true; // veto, done
                    }
                }, err => {
                    onError(err); // error, treated like a veto, done
                    lazyValue = true;
                }));
            }
        }
        return async_1.Promises.settled(promises).then(() => lazyValue);
    }
    exports.handleVetos = handleVetos;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vbGlmZWN5Y2xlL2NvbW1vbi9saWZlY3ljbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBSWhHLGdEQUFnRDtJQUNoRCxTQUFnQixXQUFXLENBQUMsS0FBcUMsRUFBRSxPQUErQjtRQUNqRyxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ3ZCLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUM5QjtRQUVELE1BQU0sUUFBUSxHQUFvQixFQUFFLENBQUM7UUFDckMsSUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDO1FBRXRCLEtBQUssTUFBTSxjQUFjLElBQUksS0FBSyxFQUFFO1lBRW5DLGFBQWE7WUFDYixJQUFJLGNBQWMsS0FBSyxJQUFJLEVBQUU7Z0JBQzVCLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUM3QjtZQUVELElBQUksSUFBQSxrQkFBVSxFQUFDLGNBQWMsQ0FBQyxFQUFFO2dCQUMvQixRQUFRLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBQ3pDLElBQUksS0FBSyxFQUFFO3dCQUNWLFNBQVMsR0FBRyxJQUFJLENBQUMsQ0FBQyxhQUFhO3FCQUMvQjtnQkFDRixDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUU7b0JBQ1IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsbUNBQW1DO29CQUNqRCxTQUFTLEdBQUcsSUFBSSxDQUFDO2dCQUNsQixDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ0o7U0FDRDtRQUVELE9BQU8sZ0JBQVEsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUE1QkQsa0NBNEJDIn0=