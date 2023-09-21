/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/services/preferences/common/preferencesValidation", "vs/base/common/color", "vs/base/common/types"], function (require, exports, nls, color_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$qE = exports.$pE = void 0;
    function canBeType(propTypes, ...types) {
        return types.some(t => propTypes.includes(t));
    }
    function isNullOrEmpty(value) {
        return value === '' || (0, types_1.$sf)(value);
    }
    function $pE(prop) {
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
                errors.push(nls.localize(0, null));
            }
            if (isNumeric) {
                if (isNullOrEmpty(value) || typeof value === 'boolean' || Array.isArray(value) || isNaN(+value)) {
                    errors.push(nls.localize(1, null));
                }
                else {
                    errors.push(...numericValidations.filter(validator => !validator.isValid(+value)).map(validator => validator.message));
                }
            }
            if (prop.type === 'string') {
                if (prop.enum && !(0, types_1.$kf)(prop.enum)) {
                    errors.push(nls.localize(2, null));
                }
                else if (!(0, types_1.$jf)(value)) {
                    errors.push(nls.localize(3, null));
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
    exports.$pE = $pE;
    /**
     * Returns an error string if the value is invalid and can't be displayed in the settings UI for the given type.
     */
    function $qE(value, type) {
        if (typeof type === 'undefined') {
            return;
        }
        const typeArr = Array.isArray(type) ? type : [type];
        if (!typeArr.some(_type => valueValidatesAsType(value, _type))) {
            return nls.localize(4, null, JSON.stringify(type));
        }
        return;
    }
    exports.$qE = $qE;
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
                message: nls.localize(5, null, prop.maxLength)
            },
            {
                enabled: prop.minLength !== undefined,
                isValid: ((value) => value.length >= prop.minLength),
                message: nls.localize(6, null, prop.minLength)
            },
            {
                enabled: patternRegex !== undefined,
                isValid: ((value) => patternRegex.test(value)),
                message: prop.patternErrorMessage || nls.localize(7, null, prop.pattern)
            },
            {
                enabled: prop.format === 'color-hex',
                isValid: ((value) => color_1.$Os.Format.CSS.parseHex(value)),
                message: nls.localize(8, null)
            },
            {
                enabled: prop.format === 'uri' || prop.format === 'uri-reference',
                isValid: ((value) => !!value.length),
                message: nls.localize(9, null)
            },
            {
                enabled: prop.format === 'uri' || prop.format === 'uri-reference',
                isValid: ((value) => uriRegex.test(value)),
                message: nls.localize(10, null)
            },
            {
                enabled: prop.format === 'uri',
                isValid: ((value) => {
                    const matches = value.match(uriRegex);
                    return !!(matches && matches[2]);
                }),
                message: nls.localize(11, null)
            },
            {
                enabled: prop.enum !== undefined,
                isValid: ((value) => {
                    return prop.enum.includes(value);
                }),
                message: nls.localize(12, null, prop.enum ? prop.enum.map(key => `"${key}"`).join(', ') : '[]')
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
                message: nls.localize(13, null, exclusiveMax)
            },
            {
                enabled: exclusiveMin !== undefined && (prop.minimum === undefined || exclusiveMin >= prop.minimum),
                isValid: ((value) => value > exclusiveMin),
                message: nls.localize(14, null, exclusiveMin)
            },
            {
                enabled: prop.maximum !== undefined && (exclusiveMax === undefined || exclusiveMax > prop.maximum),
                isValid: ((value) => value <= prop.maximum),
                message: nls.localize(15, null, prop.maximum)
            },
            {
                enabled: prop.minimum !== undefined && (exclusiveMin === undefined || exclusiveMin < prop.minimum),
                isValid: ((value) => value >= prop.minimum),
                message: nls.localize(16, null, prop.minimum)
            },
            {
                enabled: prop.multipleOf !== undefined,
                isValid: ((value) => value % prop.multipleOf === 0),
                message: nls.localize(17, null, prop.multipleOf)
            },
            {
                enabled: isIntegral,
                isValid: ((value) => value % 1 === 0),
                message: nls.localize(18, null)
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
                        message += nls.localize(19, null);
                        message += '\n';
                        return message;
                    }
                    const arrayValue = value;
                    if (prop.uniqueItems) {
                        if (new Set(arrayValue).size < arrayValue.length) {
                            message += nls.localize(20, null);
                            message += '\n';
                        }
                    }
                    if (prop.minItems && arrayValue.length < prop.minItems) {
                        message += nls.localize(21, null, prop.minItems);
                        message += '\n';
                    }
                    if (prop.maxItems && arrayValue.length > prop.maxItems) {
                        message += nls.localize(22, null, prop.maxItems);
                        message += '\n';
                    }
                    if (propItems.type === 'string') {
                        if (!(0, types_1.$kf)(arrayValue)) {
                            message += nls.localize(23, null);
                            message += '\n';
                            return message;
                        }
                        if (typeof propItems.pattern === 'string') {
                            const patternRegex = new RegExp(propItems.pattern);
                            arrayValue.forEach(v => {
                                if (!patternRegex.test(v)) {
                                    message +=
                                        propItems.patternErrorMessage ||
                                            nls.localize(24, null, withQuotes(v), withQuotes(propItems.pattern));
                                }
                            });
                        }
                        const propItemsEnum = propItems.enum;
                        if (propItemsEnum) {
                            arrayValue.forEach(v => {
                                if (propItemsEnum.indexOf(v) === -1) {
                                    message += nls.localize(25, null, withQuotes(v), '[' + propItemsEnum.map(withQuotes).join(', ') + ']');
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
                if (!(0, types_1.$lf)(value)) {
                    errors.push(nls.localize(26, null));
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
                            errors.push(nls.localize(27, null, key));
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
        const validator = $pE(propertySchema);
        const errorMessage = validator(data);
        return errorMessage;
    }
});
//# sourceMappingURL=preferencesValidation.js.map