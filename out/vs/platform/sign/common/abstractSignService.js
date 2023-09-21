/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractSignService = void 0;
    class AbstractSignService {
        constructor() {
            this.validators = new Map();
        }
        static { this._nextId = 1; }
        async createNewMessage(value) {
            try {
                const validator = await this.getValidator();
                if (validator) {
                    const id = String(AbstractSignService._nextId++);
                    this.validators.set(id, validator);
                    return {
                        id: id,
                        data: validator.createNewMessage(value)
                    };
                }
            }
            catch (e) {
                // ignore errors silently
            }
            return { id: '', data: value };
        }
        async validate(message, value) {
            if (!message.id) {
                return true;
            }
            const validator = this.validators.get(message.id);
            if (!validator) {
                return false;
            }
            this.validators.delete(message.id);
            try {
                return (validator.validate(value) === 'ok');
            }
            catch (e) {
                // ignore errors silently
                return false;
            }
            finally {
                validator.dispose?.();
            }
        }
        async sign(value) {
            try {
                return await this.signValue(value);
            }
            catch (e) {
                // ignore errors silently
            }
            return value;
        }
    }
    exports.AbstractSignService = AbstractSignService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJzdHJhY3RTaWduU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3NpZ24vY29tbW9uL2Fic3RyYWN0U2lnblNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBY2hHLE1BQXNCLG1CQUFtQjtRQUF6QztZQUlrQixlQUFVLEdBQUcsSUFBSSxHQUFHLEVBQTBCLENBQUM7UUFrRGpFLENBQUM7aUJBbkRlLFlBQU8sR0FBRyxDQUFDLEFBQUosQ0FBSztRQU1wQixLQUFLLENBQUMsZ0JBQWdCLENBQUMsS0FBYTtZQUMxQyxJQUFJO2dCQUNILE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUM1QyxJQUFJLFNBQVMsRUFBRTtvQkFDZCxNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztvQkFDakQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDO29CQUNuQyxPQUFPO3dCQUNOLEVBQUUsRUFBRSxFQUFFO3dCQUNOLElBQUksRUFBRSxTQUFTLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDO3FCQUN2QyxDQUFDO2lCQUNGO2FBQ0Q7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDWCx5QkFBeUI7YUFDekI7WUFDRCxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUM7UUFDaEMsQ0FBQztRQUVELEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBaUIsRUFBRSxLQUFhO1lBQzlDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFO2dCQUNoQixPQUFPLElBQUksQ0FBQzthQUNaO1lBRUQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2xELElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQ2YsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUNELElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNuQyxJQUFJO2dCQUNILE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDO2FBQzVDO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1gseUJBQXlCO2dCQUN6QixPQUFPLEtBQUssQ0FBQzthQUNiO29CQUFTO2dCQUNULFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO2FBQ3RCO1FBQ0YsQ0FBQztRQUVELEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBYTtZQUN2QixJQUFJO2dCQUNILE9BQU8sTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ25DO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1gseUJBQXlCO2FBQ3pCO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDOztJQXJERixrREFzREMifQ==