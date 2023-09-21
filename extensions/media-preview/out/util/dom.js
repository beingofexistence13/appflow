"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNonce = exports.escapeAttribute = void 0;
function escapeAttribute(value) {
    return value.toString().replace(/"/g, '&quot;');
}
exports.escapeAttribute = escapeAttribute;
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 64; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
exports.getNonce = getNonce;
//# sourceMappingURL=dom.js.map