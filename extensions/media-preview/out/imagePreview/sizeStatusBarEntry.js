"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.SizeStatusBarEntry = void 0;
const vscode = require("vscode");
const ownedStatusBarEntry_1 = require("../ownedStatusBarEntry");
class SizeStatusBarEntry extends ownedStatusBarEntry_1.PreviewStatusBarEntry {
    constructor() {
        super('status.imagePreview.size', vscode.l10n.t("Image Size"), vscode.StatusBarAlignment.Right, 101 /* to the left of editor status (100) */);
    }
    show(owner, text) {
        this.showItem(owner, text);
    }
}
exports.SizeStatusBarEntry = SizeStatusBarEntry;
//# sourceMappingURL=sizeStatusBarEntry.js.map