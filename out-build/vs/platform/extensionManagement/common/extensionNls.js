/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/types", "vs/nls!vs/platform/extensionManagement/common/extensionNls"], function (require, exports, types_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$np = void 0;
    function $np(logger, extensionManifest, translations, fallbackTranslations) {
        try {
            replaceNLStrings(logger, extensionManifest, translations, fallbackTranslations);
        }
        catch (error) {
            logger.error(error?.message ?? error);
            /*Ignore Error*/
        }
        return extensionManifest;
    }
    exports.$np = $np;
    /**
     * This routine makes the following assumptions:
     * The root element is an object literal
     */
    function replaceNLStrings(logger, extensionManifest, messages, originalMessages) {
        const processEntry = (obj, key, command) => {
            const value = obj[key];
            if ((0, types_1.$jf)(value)) {
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
                            logger.warn(`[${extensionManifest.name}]: ${(0, nls_1.localize)(0, null, messageKey)}`);
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
            else if ((0, types_1.$lf)(value)) {
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
//# sourceMappingURL=extensionNls.js.map