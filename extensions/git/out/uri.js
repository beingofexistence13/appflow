"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.toMergeUris = exports.toGitUri = exports.fromGitUri = exports.isGitUri = void 0;
function isGitUri(uri) {
    return /^git$/.test(uri.scheme);
}
exports.isGitUri = isGitUri;
function fromGitUri(uri) {
    return JSON.parse(uri.query);
}
exports.fromGitUri = fromGitUri;
// As a mitigation for extensions like ESLint showing warnings and errors
// for git URIs, let's change the file extension of these uris to .git,
// when `replaceFileExtension` is true.
function toGitUri(uri, ref, options = {}) {
    const params = {
        path: uri.fsPath,
        ref
    };
    if (options.submoduleOf) {
        params.submoduleOf = options.submoduleOf;
    }
    let path = uri.path;
    if (options.replaceFileExtension) {
        path = `${path}.git`;
    }
    else if (options.submoduleOf) {
        path = `${path}.diff`;
    }
    return uri.with({
        scheme: 'git',
        path,
        query: JSON.stringify(params)
    });
}
exports.toGitUri = toGitUri;
/**
 * Assuming `uri` is being merged it creates uris for `base`, `ours`, and `theirs`
 */
function toMergeUris(uri) {
    return {
        base: toGitUri(uri, ':1'),
        ours: toGitUri(uri, ':2'),
        theirs: toGitUri(uri, ':3'),
    };
}
exports.toMergeUris = toMergeUris;
//# sourceMappingURL=uri.js.map