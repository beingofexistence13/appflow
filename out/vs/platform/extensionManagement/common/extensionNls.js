/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/types", "vs/nls"], function (require, exports, types_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.localizeManifest = void 0;
    function localizeManifest(logger, extensionManifest, translations, fallbackTranslations) {
        try {
            replaceNLStrings(logger, extensionManifest, translations, fallbackTranslations);
        }
        catch (error) {
            logger.error(error?.message ?? error);
            /*Ignore Error*/
        }
        return extensionManifest;
    }
    exports.localizeManifest = localizeManifest;
    /**
     * This routine makes the following assumptions:
     * The root element is an object literal
     */
    function replaceNLStrings(logger, extensionManifest, messages, originalMessages) {
        const processEntry = (obj, key, command) => {
            const value = obj[key];
            if ((0, types_1.isString)(value)) {
                const str = value;
                const length = str.length;
                if (length > 1 && str[0] === '%' && str[length - 1] === '%') {
                    const messageKey = str.substr(1, length - 2);
                    let translated = messages[messageKey];
                    // If the messages come from a language pack they might miss some keys
                    // Fill them from the original messages.
                    if (translated === undefined && originalMessages) {
                        translated = originalMessages[messageKey];
                    }
                    const message = typeof translated === 'string' ? translated : translated?.message;
                    // This branch returns ILocalizedString's instead of Strings so that the Command Palette can contain both the localized and the original value.
                    const original = originalMessages?.[messageKey];
                    const originalMessage = typeof original === 'string' ? original : original?.message;
                    if (!message) {
                        if (!originalMessage) {
                            logger.warn(`[${extensionManifest.name}]: ${(0, nls_1.localize)('missingNLSKey', "Couldn't find message for key {0}.", messageKey)}`);
                        }
                        return;
                    }
                    if (
                    // if we are translating the title or category of a command
                    command && (key === 'title' || key === 'category') &&
                        // and the original value is not the same as the translated value
                        originalMessage && originalMessage !== message) {
                        const localizedString = {
                            value: message,
                            original: originalMessage
                        };
                        obj[key] = localizedString;
                    }
                    else {
                        obj[key] = message;
                    }
                }
            }
            else if ((0, types_1.isObject)(value)) {
                for (const k in value) {
                    if (value.hasOwnProperty(k)) {
                        k === 'commands' ? processEntry(value, k, true) : processEntry(value, k, command);
                    }
                }
            }
            else if (Array.isArray(value)) {
                for (let i = 0; i < value.length; i++) {
                    processEntry(value, i, command);
                }
            }
        };
        for (const key in extensionManifest) {
            if (extensionManifest.hasOwnProperty(key)) {
                processEntry(extensionManifest, key);
            }
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uTmxzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vZXh0ZW5zaW9uTWFuYWdlbWVudC9jb21tb24vZXh0ZW5zaW9uTmxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVloRyxTQUFnQixnQkFBZ0IsQ0FBQyxNQUFlLEVBQUUsaUJBQXFDLEVBQUUsWUFBMkIsRUFBRSxvQkFBb0M7UUFDekosSUFBSTtZQUNILGdCQUFnQixDQUFDLE1BQU0sRUFBRSxpQkFBaUIsRUFBRSxZQUFZLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztTQUNoRjtRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ2YsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsT0FBTyxJQUFJLEtBQUssQ0FBQyxDQUFDO1lBQ3RDLGdCQUFnQjtTQUNoQjtRQUNELE9BQU8saUJBQWlCLENBQUM7SUFDMUIsQ0FBQztJQVJELDRDQVFDO0lBRUQ7OztPQUdHO0lBQ0gsU0FBUyxnQkFBZ0IsQ0FBQyxNQUFlLEVBQUUsaUJBQXFDLEVBQUUsUUFBdUIsRUFBRSxnQkFBZ0M7UUFDMUksTUFBTSxZQUFZLEdBQUcsQ0FBQyxHQUFRLEVBQUUsR0FBb0IsRUFBRSxPQUFpQixFQUFFLEVBQUU7WUFDMUUsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZCLElBQUksSUFBQSxnQkFBUSxFQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNwQixNQUFNLEdBQUcsR0FBVyxLQUFLLENBQUM7Z0JBQzFCLE1BQU0sTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUM7Z0JBQzFCLElBQUksTUFBTSxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFO29CQUM1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