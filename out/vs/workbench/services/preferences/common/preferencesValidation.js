/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/color", "vs/base/common/types"], function (require, exports, nls, color_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getInvalidTypeError = exports.createValidator = void 0;
    function canBeType(propTypes, ...types) {
        return types.some(t => propTypes.includes(t));
    }
    function isNullOrEmpty(value) {
        return value === '' || (0, types_1.isUndefinedOrNull)(value);
    }
    function createValidator(prop) {
        const type = Array.isArray(prop.type) ? prop.type : [prop.type];
        const isNullable = canBeType(type, 'null');
        const isNumeric = (canBeType(type, 'number') || canBeType(type, 'integer')) && (type.length === 1 || type.length === 2 && isNullable);
        const numericValidations = getNumericValidators(prop);
        const stringValidations = getStringValidators(prop);
        const arrayValidator = getArrayValidator(prop);
        const objectValidator = getObjectValidator(prop);
        return value => {
            if (isNullable && isNullOrEmpty(value)) {
                return '';
            }
            const errors = [];
            if (arrayValidator) {
                const err = arrayValidator(value);
                if (err) {
                    errors.push(err);
                }
            }
            if (objectValidator) {
                const err = objectValidator(value);
                if (err) {
                    errors.push(err);
                }
            }
            if (prop.type === 'boolean' && value !== true && value !== false) {
                errors.push(nls.localize('validations.booleanIncorrectType', 'Incorrect type. Expected "boolean".'));
            }
            if (isNumeric) {
                if (isNullOrEmpty(value) || typeof value === 'boolean' || Array.isArray(value) || isNaN(+value)) {
                    errors.push(nls.localize('validations.expectedNumeric', "Value must be a number."));
                }
                else {
                    errors.push(...numericValidations.filter(validator => !validator.isValid(+value)).map(validator => validator.message));
                }
            }
            if (prop.type === 'string') {
                if (prop.enum && !(0, types_1.isStringArray)(prop.enum)) {
                    errors.push(nls.localize('validations.stringIncorrectEnumOptions', 'The enum options should be strings, but there is a non-string option. Please file an issue with the extension author.'));
                }
                else if (!(0, types_1.isString)(value)) {
                    errors.push(nls.localize('validations.stringIncorrectType', 'Incorrect type. Expected "string".'));
                }
                else {
                    errors.push(...stringValidations.filter(validator => !validator.isValid(value)).map(validator => validator.message));
                }
            }
            if (errors.length) {
                return prop.errorMessage ? [prop.errorMessage, ...errors].join(' ') : errors.join(' ');
            }
            return '';
        };
    }
    exports.createValidator = createValidator;
    /**
     * Returns an error string if the value is invalid and can't be displayed in the settings UI for the given type.
     */
    function getInvalidTypeError(value, type) {
        if (typeof type === 'undefined') {
            return;
        }
        const typeArr = Array.isArray(type) ? type : [type];
        if (!typeArr.some(_type => valueValidatesAsType(value, _type))) {
            return nls.localize('invalidTypeError', "Setting has an invalid type, expected {0}. Fix in JSON.", JSON.stringify(type));
        }
        return;
    }
    exports.getInvalidTypeError = getInvalidTypeError;
    function valueValidatesAsType(value, type) {
        const valueType = typeof value;
        if (type === 'boolean') {
            return valueType === 'boolean';
        }
        else if (type === 'object') {
            return value && !Array.isArray(value) && valueType === 'object';
        }
        else if (type === 'null') {
            return value === null;
        }
        else if (type === 'array') {
            return Array.isArray(value);
        }
        else if (type === 'string') {
            return valueType === 'string';
        }
        else if (type === 'number' || type === 'integer') {
            return valueType === 'number';
        }
        return true;
    }
    function getStringValidators(prop) {
        const uriRegex = /^(([^:/?#]+?):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
        let patternRegex;
        if (typeof prop.pattern === 'string') {
            patternRegex = new RegExp(prop.pattern);
        }
        return [
            {
                enabled: prop.maxLength !== undefined,
                isValid: ((value) => value.length <= prop.maxLength),
                message: nls.localize('validations.maxLength', "Value must be {0} or fewer characters long.", prop.maxLength)
            },
            {
                enabled: prop.minLength !== undefined,
                isValid: ((value) => value.length >= prop.minLength),
                message: nls.localize('validations.minLength', "Value must be {0} or more characters long.", prop.minLength)
            },
            {
                enabled: patternRegex !== undefined,
                isValid: ((value) => patternRegex.test(value)),
                message: prop.patternErrorMessage || nls.localize('validations.regex', "Value must match regex `{0}`.", prop.pattern)
            },
            {
                enabled: prop.format === 'color-hex',
                isValid: ((value) => color_1.Color.Format.CSS.parseHex(value)),
                message: nls.localize('validations.colorFormat', "Invalid color format. Use #RGB, #RGBA, #RRGGBB or #RRGGBBAA.")
            },
            {
                enabled: prop.format === 'uri' || prop.format === 'uri-reference',
                isValid: ((value) => !!value.length),
                message: nls.localize('validations.uriEmpty', "URI expected.")
            },
            {
                enabled: prop.format === 'uri' || prop.format === 'uri-reference',
                isValid: ((value) => uriRegex.test(value)),
                message: nls.localize('validations.uriMissing', "URI is expected.")
            },
            {
                enabled: prop.format === 'uri',
                isValid: ((value) => {
                    const matches = value.match(uriRegex);
                    return !!(matches && matches[2]);
                }),
                message: nls.localize('validations.uriSchemeMissing', "URI with a scheme is expected.")
            },
            {
                enabled: prop.enum !== undefined,
                isValid: ((value) => {
                    return prop.enum.includes(value);
                }),
                message: nls.localize('validations.invalidStringEnumValue', "Value is not accepted. Valid values: {0}.", prop.enum ? prop.enum.map(key => `"${key}"`).join(', ') : '[]')
            }
        ].filter(validation => validation.enabled);
    }
    function getNumericValidators(prop) {
        const type = Array.isArray(prop.type) ? prop.type : [prop.type];
        const isNullable = canBeType(type, 'null');
        const isIntegral = (canBeType(type, 'integer')) && (type.length === 1 || type.length === 2 && isNullable);
        const isNumeric = canBeType(type, 'number', 'integer') && (type.length === 1 || type.length === 2 && isNullable);
        if (!isNumeric) {
            return [];
        }
        let exclusiveMax;
        let exclusiveMin;
        if (typeof prop.exclusiveMaximum === 'boolean') {
            exclusiveMax = prop.exclusiveMaximum ? prop.maximum : undefined;
        }
        else {
            exclusiveMax = prop.exclusiveMaximum;
        }
        if (typeof prop.exclusiveMinimum === 'boolean') {
            exclusiveMin = prop.exclusiveMinimum ? prop.minimum : undefined;
        }
        else {
            exclusiveMin = prop.exclusiveMinimum;
        }
        return [
            {
                enabled: exclusiveMax !== undefined && (prop.maximum === undefined || exclusiveMax <= prop.maximum),
                isValid: ((value) => value < exclusiveMax),
                message: nls.localize('validations.exclusiveMax', "Value must be strictly less than {0}.", exclusiveMax)
            },
            {
                enabled: exclusiveMin !== undefined && (prop.minimum === undefined || exclusiveMin >= prop.minimum),
                isValid: ((value) => value > exclusiveMin),
                message: nls.localize('validations.exclusiveMin', "Value must be strictly greater than {0}.", exclusiveMin)
            },
            {
                enabled: prop.maximum !== undefined && (exclusiveMax === undefined || exclusiveMax > prop.maximum),
                isValid: ((value) => value <= prop.maximum),
                message: nls.localize('validations.max', "Value must be less than or equal to {0}.", prop.maximum)
            },
            {
                enabled: prop.minimum !== undefined && (exclusiveMin === undefined || exclusiveMin < prop.minimum),
                isValid: ((value) => value >= prop.minimum),
                message: nls.localize('validations.min', "Value must be greater than or equal to {0}.", prop.minimum)
            },
            {
                enabled: prop.multipleOf !== undefined,
                isValid: ((value) => value % prop.multipleOf === 0),
                message: nls.localize('validations.multipleOf', "Value must be a multiple of {0}.", prop.multipleOf)
            },
            {
                enabled: isIntegral,
                isValid: ((value) => value % 1 === 0),
                message: nls.localize('validations.expectedInteger', "Value must be an integer.")
            },
        ].filter(validation => validation.enabled);
    }
    function getArrayValidator(prop) {
        if (prop.type === 'array' && prop.items && !Array.isArray(prop.items)) {
            const propItems = prop.items;
            if (propItems && !Array.isArray(propItems.type)) {
                const withQuotes = (s) => `'` + s + `'`;
                return value => {
                    if (!value) {
                        return null;
                    }
                    let message = '';
                    if (!Array.isArray(value)) {
                        message += nls.localize('validations.arrayIncorrectType', 'Incorrect type. Expected an array.');
                        message += '\n';
                        return message;
                    }
                    const arrayValue = value;
                    if (prop.uniqueItems) {
                        if (new Set(arrayValue).size < arrayValue.length) {
                            message += nls.localize('validations.stringArrayUniqueItems', 'Array has duplicate items');
                            message += '\n';
                        }
                    }
                    if (prop.minItems && arrayValue.length < prop.minItems) {
                        message += nls.localize('validations.stringArrayMinItem', 'Array must have at least {0} items', prop.minItems);
                        message += '\n';
                    }
                    if (prop.maxItems && arrayValue.length > prop.maxItems) {
                        message += nls.localize('validations.stringArrayMaxItem', 'Array must have at most {0} items', prop.maxItems);
                        message += '\n';
                    }
                    if (propItems.type === 'string') {
                        if (!(0, types_1.isStringArray)(arrayValue)) {
                            message += nls.localize('validations.stringArrayIncorrectType', 'Incorrect type. Expected a string array.');
                            message += '\n';
                            return message;
                        }
                        if (typeof propItems.pattern === 'string') {
                            const patternRegex = new RegExp(propItems.pattern);
                            arrayValue.forEach(v => {
                                if (!patternRegex.test(v)) {
                                    message +=
                                        propItems.patternErrorMessage ||
                                            nls.localize('validations.stringArrayItemPattern', 'Value {0} must match regex {1}.', withQuotes(v), withQuotes(propItems.pattern));
                                }
                            });
                        }
                        const propItemsEnum = propItems.enum;
                        if (propItemsEnum) {
                            arrayValue.forEach(v => {
                                if (propItemsEnum.indexOf(v) === -1) {
                                    message += nls.localize('validations.stringArrayItemEnum', 'Value {0} is not one of {1}', withQuotes(v), '[' + propItemsEnum.map(withQuotes).join(', ') + ']');
                                    message += '\n';
                                }
                            });
                        }
                    }
                    else if (propItems.type === 'integer' || propItems.type === 'number') {
                        arrayValue.forEach(v => {
                            const errorMessage = getErrorsForSchema(propItems, v);
                            if (errorMessage) {
                                message += `${v}: ${errorMessage}\n`;
                            }
                        });
                    }
                    return message;
                };
            }
        }
        return null;
    }
    function getObjectValidator(prop) {
        if (prop.type === 'object') {
            const { properties, patternProperties, additionalProperties } = prop;
            return value => {
                if (!value) {
                    return null;
                }
                const errors = [];
                if (!(0, types_1.isObject)(value)) {
                    errors.push(nls.localize('validations.objectIncorrectType', 'Incorrect type. Expected an object.'));
                }
                else {
                    Object.keys(value).forEach((key) => {
                        const data = value[key];
                        if (properties && key in properties) {
                            const errorMessage = getErrorsForSchema(properties[key], data);
                            if (errorMessage) {
                                errors.push(`${key}: ${errorMessage}\n`);
                            }
                            return;
                        }
                        if (patternProperties) {
                            for (const pattern in patternProperties) {
                                if (RegExp(pattern).test(key)) {
                                    const errorMessage = getErrorsForSchema(patternProperties[pattern], data);
                                    if (errorMessage) {
                                        errors.push(`${key}: ${errorMessage}\n`);
                                    }
                                    return;
                                }
                            }
                        }
                        if (additionalProperties === false) {
                            errors.push(nls.localize('validations.objectPattern', 'Property {0} is not allowed.\n', key));
                        }
                        else if (typeof additionalProperties === 'object') {
                            const errorMessage = getErrorsForSchema(additionalProperties, data);
                            if (errorMessage) {
                                errors.push(`${key}: ${errorMessage}\n`);
                            }
                        }
                    });
                }
                if (errors.length) {
                    return prop.errorMessage ? [prop.errorMessage, ...errors].join(' ') : errors.join(' ');
                }
                return '';
            };
        }
        return null;
    }
    function getErrorsForSchema(propertySchema, data) {
        const validator = createValidator(propertySchema);
        const errorMessage = validator(data);
        return errorMessage;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZmVyZW5jZXNWYWxpZGF0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3ByZWZlcmVuY2VzL2NvbW1vbi9wcmVmZXJlbmNlc1ZhbGlkYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBVWhHLFNBQVMsU0FBUyxDQUFDLFNBQWlDLEVBQUUsR0FBRyxLQUF1QjtRQUMvRSxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUVELFNBQVMsYUFBYSxDQUFDLEtBQWM7UUFDcEMsT0FBTyxLQUFLLEtBQUssRUFBRSxJQUFJLElBQUEseUJBQWlCLEVBQUMsS0FBSyxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUVELFNBQWdCLGVBQWUsQ0FBQyxJQUFrQztRQUNqRSxNQUFNLElBQUksR0FBMkIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3hGLE1BQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDM0MsTUFBTSxTQUFTLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDO1FBRXRJLE1BQU0sa0JBQWtCLEdBQUcsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEQsTUFBTSxpQkFBaUIsR0FBRyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwRCxNQUFNLGNBQWMsR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMvQyxNQUFNLGVBQWUsR0FBRyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVqRCxPQUFPLEtBQUssQ0FBQyxFQUFFO1lBQ2QsSUFBSSxVQUFVLElBQUksYUFBYSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUFFLE9BQU8sRUFBRSxDQUFDO2FBQUU7WUFFdEQsTUFBTSxNQUFNLEdBQWEsRUFBRSxDQUFDO1lBQzVCLElBQUksY0FBYyxFQUFFO2dCQUNuQixNQUFNLEdBQUcsR0FBRyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ2xDLElBQUksR0FBRyxFQUFFO29CQUNSLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ2pCO2FBQ0Q7WUFFRCxJQUFJLGVBQWUsRUFBRTtnQkFDcEIsTUFBTSxHQUFHLEdBQUcsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNuQyxJQUFJLEdBQUcsRUFBRTtvQkFDUixNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUNqQjthQUNEO1lBRUQsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLFNBQVMsSUFBSSxLQUFLLEtBQUssSUFBSSxJQUFJLEtBQUssS0FBSyxLQUFLLEVBQUU7Z0JBQ2pFLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxrQ0FBa0MsRUFBRSxxQ0FBcUMsQ0FBQyxDQUFDLENBQUM7YUFDckc7WUFFRCxJQUFJLFNBQVMsRUFBRTtnQkFDZCxJQUFJLGFBQWEsQ0FBQyxLQUFLLENBQUMsSUFBSSxPQUFPLEtBQUssS0FBSyxTQUFTLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRTtvQkFDaEcsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLDZCQUE2QixFQUFFLHlCQUF5QixDQUFDLENBQUMsQ0FBQztpQkFDcEY7cUJBQU07b0JBQ04sTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7aUJBQ3ZIO2FBQ0Q7WUFFRCxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFO2dCQUMzQixJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFBLHFCQUFhLEVBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUMzQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsd0NBQXdDLEVBQUUsdUhBQXVILENBQUMsQ0FBQyxDQUFDO2lCQUM3TDtxQkFBTSxJQUFJLENBQUMsSUFBQSxnQkFBUSxFQUFDLEtBQUssQ0FBQyxFQUFFO29CQUM1QixNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsaUNBQWlDLEVBQUUsb0NBQW9DLENBQUMsQ0FBQyxDQUFDO2lCQUNuRztxQkFBTTtvQkFDTixNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsaUJBQWlCLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7aUJBQ3JIO2FBQ0Q7WUFFRCxJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUU7Z0JBQ2xCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLEdBQUcsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ3ZGO1lBRUQsT0FBTyxFQUFFLENBQUM7UUFDWCxDQUFDLENBQUM7SUFDSCxDQUFDO0lBeERELDBDQXdEQztJQUVEOztPQUVHO0lBQ0gsU0FBZ0IsbUJBQW1CLENBQUMsS0FBVSxFQUFFLElBQW1DO1FBQ2xGLElBQUksT0FBTyxJQUFJLEtBQUssV0FBVyxFQUFFO1lBQ2hDLE9BQU87U0FDUDtRQUVELE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwRCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLG9CQUFvQixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFO1lBQy9ELE9BQU8sR0FBRyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRSx5REFBeUQsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7U0FDekg7UUFFRCxPQUFPO0lBQ1IsQ0FBQztJQVhELGtEQVdDO0lBRUQsU0FBUyxvQkFBb0IsQ0FBQyxLQUFVLEVBQUUsSUFBWTtRQUNyRCxNQUFNLFNBQVMsR0FBRyxPQUFPLEtBQUssQ0FBQztRQUMvQixJQUFJLElBQUksS0FBSyxTQUFTLEVBQUU7WUFDdkIsT0FBTyxTQUFTLEtBQUssU0FBUyxDQUFDO1NBQy9CO2FBQU0sSUFBSSxJQUFJLEtBQUssUUFBUSxFQUFFO1lBQzdCLE9BQU8sS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxTQUFTLEtBQUssUUFBUSxDQUFDO1NBQ2hFO2FBQU0sSUFBSSxJQUFJLEtBQUssTUFBTSxFQUFFO1lBQzNCLE9BQU8sS0FBSyxLQUFLLElBQUksQ0FBQztTQUN0QjthQUFNLElBQUksSUFBSSxLQUFLLE9BQU8sRUFBRTtZQUM1QixPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDNUI7YUFBTSxJQUFJLElBQUksS0FBSyxRQUFRLEVBQUU7WUFDN0IsT0FBTyxTQUFTLEtBQUssUUFBUSxDQUFDO1NBQzlCO2FBQU0sSUFBSSxJQUFJLEtBQUssUUFBUSxJQUFJLElBQUksS0FBSyxTQUFTLEVBQUU7WUFDbkQsT0FBTyxTQUFTLEtBQUssUUFBUSxDQUFDO1NBQzlCO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQsU0FBUyxtQkFBbUIsQ0FBQyxJQUFrQztRQUM5RCxNQUFNLFFBQVEsR0FBRyw4REFBOEQsQ0FBQztRQUNoRixJQUFJLFlBQWdDLENBQUM7UUFDckMsSUFBSSxPQUFPLElBQUksQ0FBQyxPQUFPLEtBQUssUUFBUSxFQUFFO1lBQ3JDLFlBQVksR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDeEM7UUFFRCxPQUFPO1lBQ047Z0JBQ0MsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLEtBQUssU0FBUztnQkFDckMsT0FBTyxFQUFFLENBQUMsQ0FBQyxLQUF5QixFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxTQUFVLENBQUM7Z0JBQ3pFLE9BQU8sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLHVCQUF1QixFQUFFLDZDQUE2QyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7YUFDN0c7WUFDRDtnQkFDQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFNBQVMsS0FBSyxTQUFTO2dCQUNyQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEtBQXlCLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLFNBQVUsQ0FBQztnQkFDekUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsdUJBQXVCLEVBQUUsNENBQTRDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQzthQUM1RztZQUNEO2dCQUNDLE9BQU8sRUFBRSxZQUFZLEtBQUssU0FBUztnQkFDbkMsT0FBTyxFQUFFLENBQUMsQ0FBQyxLQUFhLEVBQUUsRUFBRSxDQUFDLFlBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3ZELE9BQU8sRUFBRSxJQUFJLENBQUMsbUJBQW1CLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsRUFBRSwrQkFBK0IsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDO2FBQ3JIO1lBQ0Q7Z0JBQ0MsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLEtBQUssV0FBVztnQkFDcEMsT0FBTyxFQUFFLENBQUMsQ0FBQyxLQUFhLEVBQUUsRUFBRSxDQUFDLGFBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDOUQsT0FBTyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMseUJBQXlCLEVBQUUsOERBQThELENBQUM7YUFDaEg7WUFDRDtnQkFDQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sS0FBSyxLQUFLLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxlQUFlO2dCQUNqRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEtBQWEsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7Z0JBQzVDLE9BQU8sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLHNCQUFzQixFQUFFLGVBQWUsQ0FBQzthQUM5RDtZQUNEO2dCQUNDLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxLQUFLLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLGVBQWU7Z0JBQ2pFLE9BQU8sRUFBRSxDQUFDLENBQUMsS0FBYSxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNsRCxPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRSxrQkFBa0IsQ0FBQzthQUNuRTtZQUNEO2dCQUNDLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxLQUFLLEtBQUs7Z0JBQzlCLE9BQU8sRUFBRSxDQUFDLENBQUMsS0FBYSxFQUFFLEVBQUU7b0JBQzNCLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ3RDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNsQyxDQUFDLENBQUM7Z0JBQ0YsT0FBTyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsOEJBQThCLEVBQUUsZ0NBQWdDLENBQUM7YUFDdkY7WUFDRDtnQkFDQyxPQUFPLEVBQUUsSUFBSSxDQUFDLElBQUksS0FBSyxTQUFTO2dCQUNoQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEtBQWEsRUFBRSxFQUFFO29CQUMzQixPQUFPLElBQUksQ0FBQyxJQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNuQyxDQUFDLENBQUM7Z0JBQ0YsT0FBTyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsb0NBQW9DLEVBQUUsMkNBQTJDLEVBQ3RHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO2FBQ2hFO1NBQ0QsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVELFNBQVMsb0JBQW9CLENBQUMsSUFBa0M7UUFDL0QsTUFBTSxJQUFJLEdBQTJCLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV4RixNQUFNLFVBQVUsR0FBRyxTQUFTLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzNDLE1BQU0sVUFBVSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksVUFBVSxDQUFDLENBQUM7UUFDMUcsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxVQUFVLENBQUMsQ0FBQztRQUNqSCxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ2YsT0FBTyxFQUFFLENBQUM7U0FDVjtRQUVELElBQUksWUFBZ0MsQ0FBQztRQUNyQyxJQUFJLFlBQWdDLENBQUM7UUFFckMsSUFBSSxPQUFPLElBQUksQ0FBQyxnQkFBZ0IsS0FBSyxTQUFTLEVBQUU7WUFDL0MsWUFBWSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1NBQ2hFO2FBQU07WUFDTixZQUFZLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDO1NBQ3JDO1FBRUQsSUFBSSxPQUFPLElBQUksQ0FBQyxnQkFBZ0IsS0FBSyxTQUFTLEVBQUU7WUFDL0MsWUFBWSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1NBQ2hFO2FBQU07WUFDTixZQUFZLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDO1NBQ3JDO1FBRUQsT0FBTztZQUNOO2dCQUNDLE9BQU8sRUFBRSxZQUFZLEtBQUssU0FBUyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sS0FBSyxTQUFTLElBQUksWUFBWSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUM7Z0JBQ25HLE9BQU8sRUFBRSxDQUFDLENBQUMsS0FBYSxFQUFFLEVBQUUsQ0FBQyxLQUFLLEdBQUcsWUFBYSxDQUFDO2dCQUNuRCxPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQywwQkFBMEIsRUFBRSx1Q0FBdUMsRUFBRSxZQUFZLENBQUM7YUFDeEc7WUFDRDtnQkFDQyxPQUFPLEVBQUUsWUFBWSxLQUFLLFNBQVMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEtBQUssU0FBUyxJQUFJLFlBQVksSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDO2dCQUNuRyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEtBQWEsRUFBRSxFQUFFLENBQUMsS0FBSyxHQUFHLFlBQWEsQ0FBQztnQkFDbkQsT0FBTyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsMEJBQTBCLEVBQUUsMENBQTBDLEVBQUUsWUFBWSxDQUFDO2FBQzNHO1lBQ0Q7Z0JBQ0MsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLEtBQUssU0FBUyxJQUFJLENBQUMsWUFBWSxLQUFLLFNBQVMsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztnQkFDbEcsT0FBTyxFQUFFLENBQUMsQ0FBQyxLQUFhLEVBQUUsRUFBRSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsT0FBUSxDQUFDO2dCQUNwRCxPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSwwQ0FBMEMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDO2FBQ2xHO1lBQ0Q7Z0JBQ0MsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLEtBQUssU0FBUyxJQUFJLENBQUMsWUFBWSxLQUFLLFNBQVMsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztnQkFDbEcsT0FBTyxFQUFFLENBQUMsQ0FBQyxLQUFhLEVBQUUsRUFBRSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsT0FBUSxDQUFDO2dCQUNwRCxPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSw2Q0FBNkMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDO2FBQ3JHO1lBQ0Q7Z0JBQ0MsT0FBTyxFQUFFLElBQUksQ0FBQyxVQUFVLEtBQUssU0FBUztnQkFDdEMsT0FBTyxFQUFFLENBQUMsQ0FBQyxLQUFhLEVBQUUsRUFBRSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsVUFBVyxLQUFLLENBQUMsQ0FBQztnQkFDNUQsT0FBTyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsd0JBQXdCLEVBQUUsa0NBQWtDLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQzthQUNwRztZQUNEO2dCQUNDLE9BQU8sRUFBRSxVQUFVO2dCQUNuQixPQUFPLEVBQUUsQ0FBQyxDQUFDLEtBQWEsRUFBRSxFQUFFLENBQUMsS0FBSyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzdDLE9BQU8sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLDZCQUE2QixFQUFFLDJCQUEyQixDQUFDO2FBQ2pGO1NBQ0QsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVELFNBQVMsaUJBQWlCLENBQUMsSUFBa0M7UUFDNUQsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLE9BQU8sSUFBSSxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDdEUsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUM3QixJQUFJLFNBQVMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNoRCxNQUFNLFVBQVUsR0FBRyxDQUFDLENBQVMsRUFBRSxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUM7Z0JBQ2hELE9BQU8sS0FBSyxDQUFDLEVBQUU7b0JBQ2QsSUFBSSxDQUFDLEtBQUssRUFBRTt3QkFDWCxPQUFPLElBQUksQ0FBQztxQkFDWjtvQkFFRCxJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7b0JBRWpCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO3dCQUMxQixPQUFPLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxnQ0FBZ0MsRUFBRSxvQ0FBb0MsQ0FBQyxDQUFDO3dCQUNoRyxPQUFPLElBQUksSUFBSSxDQUFDO3dCQUNoQixPQUFPLE9BQU8sQ0FBQztxQkFDZjtvQkFFRCxNQUFNLFVBQVUsR0FBRyxLQUFrQixDQUFDO29CQUN0QyxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7d0JBQ3JCLElBQUksSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUU7NEJBQ2pELE9BQU8sSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLG9DQUFvQyxFQUFFLDJCQUEyQixDQUFDLENBQUM7NEJBQzNGLE9BQU8sSUFBSSxJQUFJLENBQUM7eUJBQ2hCO3FCQUNEO29CQUVELElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxVQUFVLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUU7d0JBQ3ZELE9BQU8sSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLGdDQUFnQyxFQUFFLG9DQUFvQyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzt3QkFDL0csT0FBTyxJQUFJLElBQUksQ0FBQztxQkFDaEI7b0JBRUQsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLFVBQVUsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRTt3QkFDdkQsT0FBTyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsZ0NBQWdDLEVBQUUsbUNBQW1DLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO3dCQUM5RyxPQUFPLElBQUksSUFBSSxDQUFDO3FCQUNoQjtvQkFFRCxJQUFJLFNBQVMsQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFO3dCQUNoQyxJQUFJLENBQUMsSUFBQSxxQkFBYSxFQUFDLFVBQVUsQ0FBQyxFQUFFOzRCQUMvQixPQUFPLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxzQ0FBc0MsRUFBRSwwQ0FBMEMsQ0FBQyxDQUFDOzRCQUM1RyxPQUFPLElBQUksSUFBSSxDQUFDOzRCQUNoQixPQUFPLE9BQU8sQ0FBQzt5QkFDZjt3QkFFRCxJQUFJLE9BQU8sU0FBUyxDQUFDLE9BQU8sS0FBSyxRQUFRLEVBQUU7NEJBQzFDLE1BQU0sWUFBWSxHQUFHLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQzs0QkFDbkQsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtnQ0FDdEIsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0NBQzFCLE9BQU87d0NBQ04sU0FBUyxDQUFDLG1CQUFtQjs0Q0FDN0IsR0FBRyxDQUFDLFFBQVEsQ0FDWCxvQ0FBb0MsRUFDcEMsaUNBQWlDLEVBQ2pDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFDYixVQUFVLENBQUMsU0FBUyxDQUFDLE9BQVEsQ0FBQyxDQUM5QixDQUFDO2lDQUNIOzRCQUNGLENBQUMsQ0FBQyxDQUFDO3lCQUNIO3dCQUVELE1BQU0sYUFBYSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUM7d0JBQ3JDLElBQUksYUFBYSxFQUFFOzRCQUNsQixVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dDQUN0QixJQUFJLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7b0NBQ3BDLE9BQU8sSUFBSSxHQUFHLENBQUMsUUFBUSxDQUN0QixpQ0FBaUMsRUFDakMsNkJBQTZCLEVBQzdCLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFDYixHQUFHLEdBQUcsYUFBYSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUNwRCxDQUFDO29DQUNGLE9BQU8sSUFBSSxJQUFJLENBQUM7aUNBQ2hCOzRCQUNGLENBQUMsQ0FBQyxDQUFDO3lCQUNIO3FCQUNEO3lCQUFNLElBQUksU0FBUyxDQUFDLElBQUksS0FBSyxTQUFTLElBQUksU0FBUyxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7d0JBQ3ZFLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUU7NEJBQ3RCLE1BQU0sWUFBWSxHQUFHLGtCQUFrQixDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQzs0QkFDdEQsSUFBSSxZQUFZLEVBQUU7Z0NBQ2pCLE9BQU8sSUFBSSxHQUFHLENBQUMsS0FBSyxZQUFZLElBQUksQ0FBQzs2QkFDckM7d0JBQ0YsQ0FBQyxDQUFDLENBQUM7cUJBQ0g7b0JBRUQsT0FBTyxPQUFPLENBQUM7Z0JBQ2hCLENBQUMsQ0FBQzthQUNGO1NBQ0Q7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRCxTQUFTLGtCQUFrQixDQUFDLElBQWtDO1FBQzdELElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7WUFDM0IsTUFBTSxFQUFFLFVBQVUsRUFBRSxpQkFBaUIsRUFBRSxvQkFBb0IsRUFBRSxHQUFHLElBQUksQ0FBQztZQUNyRSxPQUFPLEtBQUssQ0FBQyxFQUFFO2dCQUNkLElBQUksQ0FBQyxLQUFLLEVBQUU7b0JBQ1gsT0FBTyxJQUFJLENBQUM7aUJBQ1o7Z0JBRUQsTUFBTSxNQUFNLEdBQWEsRUFBRSxDQUFDO2dCQUU1QixJQUFJLENBQUMsSUFBQSxnQkFBUSxFQUFDLEtBQUssQ0FBQyxFQUFFO29CQUNyQixNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsaUNBQWlDLEVBQUUscUNBQXFDLENBQUMsQ0FBQyxDQUFDO2lCQUNwRztxQkFBTTtvQkFDTixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQVcsRUFBRSxFQUFFO3dCQUMxQyxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQ3hCLElBQUksVUFBVSxJQUFJLEdBQUcsSUFBSSxVQUFVLEVBQUU7NEJBQ3BDLE1BQU0sWUFBWSxHQUFHLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQzs0QkFDL0QsSUFBSSxZQUFZLEVBQUU7Z0NBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLEtBQUssWUFBWSxJQUFJLENBQUMsQ0FBQzs2QkFDekM7NEJBQ0QsT0FBTzt5QkFDUDt3QkFFRCxJQUFJLGlCQUFpQixFQUFFOzRCQUN0QixLQUFLLE1BQU0sT0FBTyxJQUFJLGlCQUFpQixFQUFFO2dDQUN4QyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7b0NBQzlCLE1BQU0sWUFBWSxHQUFHLGtCQUFrQixDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO29DQUMxRSxJQUFJLFlBQVksRUFBRTt3Q0FDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsS0FBSyxZQUFZLElBQUksQ0FBQyxDQUFDO3FDQUN6QztvQ0FDRCxPQUFPO2lDQUNQOzZCQUNEO3lCQUNEO3dCQUVELElBQUksb0JBQW9CLEtBQUssS0FBSyxFQUFFOzRCQUNuQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsMkJBQTJCLEVBQUUsZ0NBQWdDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQzt5QkFDOUY7NkJBQU0sSUFBSSxPQUFPLG9CQUFvQixLQUFLLFFBQVEsRUFBRTs0QkFDcEQsTUFBTSxZQUFZLEdBQUcsa0JBQWtCLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLENBQUM7NEJBQ3BFLElBQUksWUFBWSxFQUFFO2dDQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxLQUFLLFlBQVksSUFBSSxDQUFDLENBQUM7NkJBQ3pDO3lCQUNEO29CQUNGLENBQUMsQ0FBQyxDQUFDO2lCQUNIO2dCQUVELElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRTtvQkFDbEIsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsR0FBRyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ3ZGO2dCQUVELE9BQU8sRUFBRSxDQUFDO1lBQ1gsQ0FBQyxDQUFDO1NBQ0Y7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRCxTQUFTLGtCQUFrQixDQUFDLGNBQTRDLEVBQUUsSUFBUztRQUNsRixNQUFNLFNBQVMsR0FBRyxlQUFlLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDbEQsTUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JDLE9BQU8sWUFBWSxDQUFDO0lBQ3JCLENBQUMifQ==