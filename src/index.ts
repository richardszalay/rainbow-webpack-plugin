import * as fs from "fs";
import * as path from "path";

import { RawSource, Source } from "webpack-sources";
import { compilation, Compiler } from "webpack";

import {
    SitecoreItem,
    formatDatetime,
    updateField,
    getValidItemName,
    reparentItem,
    newItem,
    OrphanSitecoreItem,
    loadItem,
    formatItem,
    newID
} from "./node-rainbow";

const FIELD_IDS = {
    ICON: "06d5295c-ed2f-4a54-9bf2-26228d113318",
    BLOB: "40e50ed9-ba07-4702-992e-a912738d32dc",
    SIZE: "6954b7c7-2487-423f-8600-436cb3b6dc0e",
    MIME_TYPE: "6f47a0a5-9c94-4b48-abeb-42d38def6054",
    EXTENSION: "c06867fe-9a43-4c7d-b739-48780492d06f",
    SORT_ORDER: "ba3f86a2-4a1c-4d78-b63d-91c2779c1b5e",
    CREATED: "25bed78c-4957-4165-998a-ca1b52f67497",
    CREATED_BY: "5dd74568-4d4b-44c1-b513-0af5f4cda34f",
};

const TEMPLATE_IDS = {
    FILE: "962b53c4-f93b-4df9-9821-415c867b8903",
};

interface WebpackAsset {
    source(): string | Buffer;
}

export interface RainbowPluginOptions {
    getFileTypeInfo?(assetPath: string, info: FileTypeInfo): FileTypeInfo | undefined;

    populateSitecoreItem?(item: SitecoreItem): void;
}

export class RainbowPlugin {

    private options: RainbowPluginOptions;

    constructor(options?: RainbowPluginOptions) {
        this.options = options || {};
    }

    apply(compiler: Compiler) {
        compiler.hooks.emit.tapAsync("UnicornPlugin", this.emit);
    }

    emit(comp: compilation.Compilation, callback: () => void) {

        const { assets } = comp;

        for (const file of Object.keys(assets)) {
            const fileInfo = getFileTypeInfo(file, this.options);
            const unicornItem = getTargetItem(fileInfo, comp.outputOptions.path);

            updateSitecoreItem(unicornItem, assets[file] as WebpackAsset, fileInfo, this.options);
            assets[fileInfo.filename] = createSourceFromItem(unicornItem);
            delete assets[file];
        }

        callback();
    }
}

function createSourceFromItem(item: SitecoreItem): Source {
    const outputYaml = formatItem(item);

    return (Buffer.alloc) ?
        new RawSource(Buffer.from(outputYaml) as any as string) :
        new RawSource(outputYaml); // Older node versions
}

function getTargetItem(info: FileTypeInfo, outputPath: string): SitecoreItem {
    const outputFile = path.join(outputPath, info.filename);

    const partialItem = (fs.existsSync(outputFile)) ?
        loadItem(outputFile) :
        newItem(info.templateId);

    const unicornItem = reparentItem(partialItem, outputFile, info.name);

    return unicornItem;
}

function updateSitecoreItem(item: SitecoreItem, asset: WebpackAsset,
                            fileInfo: FileTypeInfo, options: RainbowPluginOptions) {

    let input = asset.source();

    if (!Buffer.isBuffer(input)) {
        if (typeof input === "string") {
            input = new Buffer(input); // Older node versions
        } else {
            input = Buffer.from(input);
        }
    }

    if (!item.SharedFields) {
        item.SharedFields = [];
    }

    if (fileInfo.icon) {
        updateField(item.SharedFields, {
            ID: FIELD_IDS.ICON,
            Hint: "__Icon",
            Value: fileInfo.icon
        });
    }

    updateField(item.SharedFields, {
        ID: FIELD_IDS.BLOB,
        Hint: "Blob",
        BlobID: newID(),
        Value: input.toString("base64")
    });

    updateField(item.SharedFields, {
        ID: FIELD_IDS.SIZE,
        Hint: "Size",
        Value: input.length
    });

    updateField(item.SharedFields, {
        ID: FIELD_IDS.MIME_TYPE,
        Hint: "Mime Type",
        Value: fileInfo.mimeType
    });

    updateField(item.SharedFields, {
        ID: FIELD_IDS.SORT_ORDER,
        Hint: "__Sortorder",
        Value: 10
    });

    updateField(item.SharedFields, {
        ID: FIELD_IDS.EXTENSION,
        Hint: "Extension",
        Value: fileInfo.extension
    });

    if (options.populateSitecoreItem) {
        options.populateSitecoreItem(item);
    }
}

export interface FileTypeInfo {
    filename: string;
    name: string;
    extension: string;
    mimeType: string;
    templateId: string;
    icon?: string;
}

const KnownMimeTypes: {[name: string]: string} = {
    ".js": "application/x-javascript",
    ".css": "text/css",
    ".map": "application/json"
};

function getFileTypeInfo(filename: string, options: RainbowPluginOptions): FileTypeInfo {

    const targetFile = changeExtension(filename, ".yml");
    const extension = path.extname(filename);
    const name = getValidItemName(path.basename(filename, extension));

    const info = {
        filename: targetFile,
        name,
        extension: extension.replace(/\.(.+)/, "$1"),
        templateId: TEMPLATE_IDS.FILE,
        mimeType: KnownMimeTypes[extension] || "application/octet-stream"
    };

    if (options.getFileTypeInfo) {
        return options.getFileTypeInfo(filename, info) || info;
    }

    return info;
}

function changeExtension(source: string, ext: string) {
    const basename = path.basename(source, path.extname(source)) + ext;
    return path.join(path.dirname(source), basename);
}
