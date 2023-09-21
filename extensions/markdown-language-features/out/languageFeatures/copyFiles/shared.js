"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEditForMediaFiles = exports.createUriListSnippet = exports.appendToLinkSnippet = exports.tryGetUriListSnippet = exports.validateLink = exports.checkSmartPaste = exports.createEditAddingLinksForUriList = exports.getPasteUrlAsFormattedLinkSetting = exports.PasteUrlAsFormattedLink = exports.mediaFileExtensions = exports.externalUriSchemes = void 0;
const path = require("path");
const vscode = require("vscode");
const URI = require("vscode-uri");
const arrays_1 = require("../../util/arrays");
const document_1 = require("../../util/document");
const mimes_1 = require("../../util/mimes");
const schemes_1 = require("../../util/schemes");
const copyFiles_1 = require("./copyFiles");
var MediaKind;
(function (MediaKind) {
    MediaKind[MediaKind["Image"] = 0] = "Image";
    MediaKind[MediaKind["Video"] = 1] = "Video";
    MediaKind[MediaKind["Audio"] = 2] = "Audio";
})(MediaKind || (MediaKind = {}));
exports.externalUriSchemes = [
    'http',
    'https',
    'mailto',
];
exports.mediaFileExtensions = new Map([
    // Images
    ['bmp', MediaKind.Image],
    ['gif', MediaKind.Image],
    ['ico', MediaKind.Image],
    ['jpe', MediaKind.Image],
    ['jpeg', MediaKind.Image],
    ['jpg', MediaKind.Image],
    ['png', MediaKind.Image],
    ['psd', MediaKind.Image],
    ['svg', MediaKind.Image],
    ['tga', MediaKind.Image],
    ['tif', MediaKind.Image],
    ['tiff', MediaKind.Image],
    ['webp', MediaKind.Image],
    // Videos
    ['ogg', MediaKind.Video],
    ['mp4', MediaKind.Video],
    // Audio Files
    ['mp3', MediaKind.Audio],
    ['aac', MediaKind.Audio],
    ['wav', MediaKind.Audio],
]);
const smartPasteRegexes = [
    { regex: /(\[[^\[\]]*](?:\([^\(\)]*\)|\[[^\[\]]*]))/g },
    { regex: /^```[\s\S]*?```$/gm },
    { regex: /^~~~[\s\S]*?~~~$/gm },
    { regex: /^\$\$[\s\S]*?\$\$$/gm },
    { regex: /`[^`]*`/g },
    { regex: /\$[^$]*\$/g }, // In inline math
];
var PasteUrlAsFormattedLink;
(function (PasteUrlAsFormattedLink) {
    PasteUrlAsFormattedLink["Always"] = "always";
    PasteUrlAsFormattedLink["Smart"] = "smart";
    PasteUrlAsFormattedLink["Never"] = "never";
})(PasteUrlAsFormattedLink || (exports.PasteUrlAsFormattedLink = PasteUrlAsFormattedLink = {}));
function getPasteUrlAsFormattedLinkSetting(document) {
    return vscode.workspace.getConfiguration('markdown', document).get('editor.pasteUrlAsFormattedLink.enabled', PasteUrlAsFormattedLink.Smart);
}
exports.getPasteUrlAsFormattedLinkSetting = getPasteUrlAsFormattedLinkSetting;
async function createEditAddingLinksForUriList(document, ranges, urlList, isExternalLink, useSmartPaste, token) {
    if (ranges.length === 0) {
        return;
    }
    const edits = [];
    let placeHolderValue = ranges.length;
    let label = '';
    let pasteAsMarkdownLink = true;
    let markdownLink = true;
    for (const range of ranges) {
        const selectedRange = new vscode.Range(new vscode.Position(range.start.line, document.offsetAt(range.start)), new vscode.Position(range.end.line, document.offsetAt(range.end)));
        if (useSmartPaste) {
            pasteAsMarkdownLink = checkSmartPaste(document, selectedRange, range);
            markdownLink = pasteAsMarkdownLink; // FIX: this will only match the last range
        }
        const snippet = await tryGetUriListSnippet(document, urlList, token, document.getText(range), placeHolderValue, pasteAsMarkdownLink, isExternalLink);
        if (!snippet) {
            return;
        }
        pasteAsMarkdownLink = true;
        placeHolderValue--;
        edits.push(new vscode.SnippetTextEdit(range, snippet.snippet));
        label = snippet.label;
    }
    const additionalEdits = new vscode.WorkspaceEdit();
    additionalEdits.set(document.uri, edits);
    return { additionalEdits, label, markdownLink };
}
exports.createEditAddingLinksForUriList = createEditAddingLinksForUriList;
function checkSmartPaste(document, selectedRange, range) {
    if (selectedRange.isEmpty || /^[\s\n]*$/.test(document.getText(range)) || validateLink(document.getText(range)).isValid) {
        return false;
    }
    if (/\[.*\]\(.*\)/.test(document.getText(range)) || /!\[.*\]\(.*\)/.test(document.getText(range))) {
        return false;
    }
    for (const regex of smartPasteRegexes) {
        const matches = [...document.getText().matchAll(regex.regex)];
        for (const match of matches) {
            if (match.index !== undefined) {
                const useDefaultPaste = selectedRange.start.character > match.index && selectedRange.end.character < match.index + match[0].length;
                if (useDefaultPaste) {
                    return false;
                }
            }
        }
    }
    return true;
}
exports.checkSmartPaste = checkSmartPaste;
function validateLink(urlList) {
    let isValid = false;
    let uri = undefined;
    const trimmedUrlList = urlList?.trim(); //remove leading and trailing whitespace and new lines
    try {
        uri = vscode.Uri.parse(trimmedUrlList);
    }
    catch (error) {
        return { isValid: false, cleanedUrlList: urlList };
    }
    const splitUrlList = trimmedUrlList.split(' ').filter(item => item !== ''); //split on spaces and remove empty strings
    if (uri) {
        isValid = splitUrlList.length === 1 && !splitUrlList[0].includes('\n') && exports.externalUriSchemes.includes(vscode.Uri.parse(splitUrlList[0]).scheme) && !!vscode.Uri.parse(splitUrlList[0]).authority;
    }
    return { isValid, cleanedUrlList: splitUrlList[0] };
}
exports.validateLink = validateLink;
async function tryGetUriListSnippet(document, urlList, token, title = '', placeHolderValue = 0, pasteAsMarkdownLink = true, isExternalLink = false) {
    if (token.isCancellationRequested) {
        return undefined;
    }
    const uriStrings = [];
    const uris = [];
    for (const resource of urlList.split(/\r?\n/g)) {
        try {
            uris.push(vscode.Uri.parse(resource));
            uriStrings.push(resource);
        }
        catch {
            // noop
        }
    }
    return createUriListSnippet(document, uris, uriStrings, title, placeHolderValue, pasteAsMarkdownLink, isExternalLink);
}
exports.tryGetUriListSnippet = tryGetUriListSnippet;
function appendToLinkSnippet(snippet, title, uriString, placeholderValue, isExternalLink) {
    snippet.appendText('[');
    snippet.appendPlaceholder(escapeBrackets(title) || 'Title', placeholderValue);
    snippet.appendText(`](${escapeMarkdownLinkPath(uriString, isExternalLink)})`);
    return snippet;
}
exports.appendToLinkSnippet = appendToLinkSnippet;
function createUriListSnippet(document, uris, uriStrings, title = '', placeholderValue = 0, pasteAsMarkdownLink = true, isExternalLink = false, options) {
    if (!uris.length) {
        return;
    }
    const documentDir = (0, document_1.getDocumentDir)(document.uri);
    let snippet = new vscode.SnippetString();
    let insertedLinkCount = 0;
    let insertedImageCount = 0;
    let insertedAudioVideoCount = 0;
    uris.forEach((uri, i) => {
        const mdPath = getMdPath(documentDir, uri);
        const ext = URI.Utils.extname(uri).toLowerCase().replace('.', '');
        const insertAsMedia = typeof options?.insertAsMedia === 'undefined' ? exports.mediaFileExtensions.has(ext) : !!options.insertAsMedia;
        const insertAsVideo = exports.mediaFileExtensions.get(ext) === MediaKind.Video;
        const insertAsAudio = exports.mediaFileExtensions.get(ext) === MediaKind.Audio;
        if (insertAsVideo) {
            insertedAudioVideoCount++;
            snippet.appendText(`<video src="${escapeHtmlAttribute(mdPath)}" controls title="`);
            snippet.appendPlaceholder(escapeBrackets(title) || 'Title', placeholderValue);
            snippet.appendText('"></video>');
        }
        else if (insertAsAudio) {
            insertedAudioVideoCount++;
            snippet.appendText(`<audio src="${escapeHtmlAttribute(mdPath)}" controls title="`);
            snippet.appendPlaceholder(escapeBrackets(title) || 'Title', placeholderValue);
            snippet.appendText('"></audio>');
        }
        else if (insertAsMedia) {
            if (insertAsMedia) {
                insertedImageCount++;
                if (pasteAsMarkdownLink) {
                    snippet.appendText('![');
                    const placeholderText = escapeBrackets(title) || options?.placeholderText || 'Alt text';
                    const placeholderIndex = typeof options?.placeholderStartIndex !== 'undefined' ? options?.placeholderStartIndex + i : (placeholderValue === 0 ? undefined : placeholderValue);
                    snippet.appendPlaceholder(placeholderText, placeholderIndex);
                    snippet.appendText(`](${escapeMarkdownLinkPath(mdPath, isExternalLink)})`);
                }
                else {
                    snippet.appendText(escapeMarkdownLinkPath(mdPath, isExternalLink));
                }
            }
        }
        else {
            insertedLinkCount++;
            if (uriStrings && isExternalLink) {
                snippet = appendToLinkSnippet(snippet, title, uriStrings[i], placeholderValue, isExternalLink);
            }
            else {
                snippet.appendText(escapeMarkdownLinkPath(mdPath, isExternalLink));
            }
        }
        if (i < uris.length - 1 && uris.length > 1) {
            snippet.appendText(options?.separator ?? ' ');
        }
    });
    let label;
    if (insertedAudioVideoCount > 0) {
        if (insertedLinkCount > 0) {
            label = vscode.l10n.t('Insert Markdown Media and Links');
        }
        else {
            label = vscode.l10n.t('Insert Markdown Media');
        }
    }
    else if (insertedImageCount > 0 && insertedLinkCount > 0) {
        label = vscode.l10n.t('Insert Markdown Images and Links');
    }
    else if (insertedImageCount > 0) {
        label = insertedImageCount > 1
            ? vscode.l10n.t('Insert Markdown Images')
            : vscode.l10n.t('Insert Markdown Image');
    }
    else {
        label = insertedLinkCount > 1
            ? vscode.l10n.t('Insert Markdown Links')
            : vscode.l10n.t('Insert Markdown Link');
    }
    return { snippet, label };
}
exports.createUriListSnippet = createUriListSnippet;
/**
 * Create a new edit from the image files in a data transfer.
 *
 * This tries copying files outside of the workspace into the workspace.
 */
async function createEditForMediaFiles(document, dataTransfer, token) {
    if (document.uri.scheme === schemes_1.Schemes.untitled) {
        return;
    }
    const pathGenerator = new copyFiles_1.NewFilePathGenerator();
    const fileEntries = (0, arrays_1.coalesce)(await Promise.all(Array.from(dataTransfer, async ([mime, item]) => {
        if (!mimes_1.mediaMimes.has(mime)) {
            return;
        }
        const file = item?.asFile();
        if (!file) {
            return;
        }
        if (file.uri) {
            // If the file is already in a workspace, we don't want to create a copy of it
            const workspaceFolder = vscode.workspace.getWorkspaceFolder(file.uri);
            if (workspaceFolder) {
                return { uri: file.uri };
            }
        }
        const newFile = await pathGenerator.getNewFilePath(document, file, token);
        if (!newFile) {
            return;
        }
        return { uri: newFile.uri, newFile: { contents: file, overwrite: newFile.overwrite } };
    })));
    if (!fileEntries.length) {
        return;
    }
    const workspaceEdit = new vscode.WorkspaceEdit();
    for (const entry of fileEntries) {
        if (entry.newFile) {
            workspaceEdit.createFile(entry.uri, {
                contents: entry.newFile.contents,
                overwrite: entry.newFile.overwrite,
            });
        }
    }
    const snippet = createUriListSnippet(document, fileEntries.map(entry => entry.uri));
    if (!snippet) {
        return;
    }
    return {
        snippet: snippet.snippet,
        label: snippet.label,
        additionalEdits: workspaceEdit,
    };
}
exports.createEditForMediaFiles = createEditForMediaFiles;
function getMdPath(dir, file) {
    if (dir && dir.scheme === file.scheme && dir.authority === file.authority) {
        if (file.scheme === schemes_1.Schemes.file) {
            // On windows, we must use the native `path.relative` to generate the relative path
            // so that drive-letters are resolved cast insensitively. However we then want to
            // convert back to a posix path to insert in to the document.
            const relativePath = path.relative(dir.fsPath, file.fsPath);
            return path.posix.normalize(relativePath.split(path.sep).join(path.posix.sep));
        }
        return path.posix.relative(dir.path, file.path);
    }
    return file.toString(false);
}
function escapeHtmlAttribute(attr) {
    return encodeURI(attr).replaceAll('"', '&quot;');
}
function escapeMarkdownLinkPath(mdPath, isExternalLink) {
    if (needsBracketLink(mdPath)) {
        return '<' + mdPath.replaceAll('<', '\\<').replaceAll('>', '\\>') + '>';
    }
    return isExternalLink ? mdPath : encodeURI(mdPath);
}
function escapeBrackets(value) {
    value = value.replace(/[\[\]]/g, '\\$&'); // CodeQL [SM02383] The Markdown is fully sanitized after being rendered.
    return value;
}
function needsBracketLink(mdPath) {
    // Links with whitespace or control characters must be enclosed in brackets
    if (mdPath.startsWith('<') || /\s|[\u007F\u0000-\u001f]/.test(mdPath)) {
        return true;
    }
    // Check if the link has mis-matched parens
    if (!/[\(\)]/.test(mdPath)) {
        return false;
    }
    let previousChar = '';
    let nestingCount = 0;
    for (const char of mdPath) {
        if (char === '(' && previousChar !== '\\') {
            nestingCount++;
        }
        else if (char === ')' && previousChar !== '\\') {
            nestingCount--;
        }
        if (nestingCount < 0) {
            return true;
        }
        previousChar = char;
    }
    return nestingCount > 0;
}
//# sourceMappingURL=shared.js.map