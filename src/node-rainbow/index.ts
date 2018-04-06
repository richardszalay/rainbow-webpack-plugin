import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import * as uuidv4 from "uuid/v4";

import { SitecoreItem, ItemField, OrphanSitecoreItem, ItemLanguage, ItemVersion } from "./types";
import { FILE } from "./fields";

export * from "./types";

export function loadItem(itemPath: string) {
    const str = fs.readFileSync(itemPath, "utf8");

    return parseItem(str);
}

export function parseItem(itemYaml: string): SitecoreItem {
    return yaml.safeLoad(itemYaml) as SitecoreItem;
}

export function formatItem(item: SitecoreItem) {
    const itemYaml = yaml.safeDump(item, { lineWidth: -1 });

    return fixGeneratedYaml(itemYaml);
}

export function saveItem(item: SitecoreItem, itemPath: string, reparent: boolean = true) {
    if (reparent) {
        item = reparentItem(item, itemPath, path.basename(itemPath, path.extname(itemPath)));
    }

    fs.writeFileSync(itemPath, formatItem(item), "utf8");
}

export function reparentItem(item: OrphanSitecoreItem, itemPath: string, itemName: string): SitecoreItem {

    const parentPath = getParentPath(itemPath);
    if (!fs.existsSync(parentPath)) {
        throw new Error(`Could not find parent Unicorn YML for ${itemPath}`);
    }

    const parentItem = loadItem(parentPath);

    item.Path = `${parentItem.Path}/${itemName}`;
    item.Parent = parentItem.ID;

    return item as SitecoreItem;
}

export function getParentPath(itemPath: string) {
    return path.dirname(itemPath) + ".yml";
}

export function updateField(fields: ItemField[], field: ItemField) {
    const existingField = fields.filter((f) => f.ID === field.ID)[0];

    if (existingField) {
        existingField.Value = field.Value;

        if (field.BlobID) {
            existingField.BlobID = field.BlobID;
        }
    } else {
        fields.push(field);
    }
}

export function formatDatetime(d: Date) {
    const pad = (n: number) => n < 10 ? "0" + n : n;

    return d.getUTCFullYear().toString()
         + pad(d.getUTCMonth() + 1)
         + pad(d.getUTCDate()) + "T"
         + pad(d.getUTCHours())
         + pad(d.getUTCMinutes())
         + pad(d.getUTCSeconds()) + "Z";
}

export function getValidItemName(name: string) {
    return name.replace(/\W/g, "-");
}

export function newID(): string {
    return uuidv4();
}

export function newItem(
    templateId: string,
    db: string = "master",
    language: string = "en",
    createdBy: string = "sitecore\\admin"
    ): OrphanSitecoreItem {

    return {
        ID: newID(),
        Template: templateId,
        DB: db,
        SharedFields: [],
        Languages: [
            newLanguage(language, createdBy)
        ]
    };
}

export function newLanguage(language: string, createdBy: string): ItemLanguage {
    return {
        Language: language,
        Versions: [
            newVersion(1, createdBy)
        ]
    };
}

export function newVersion(version: number, createdBy: string): ItemVersion {
    return {
        Version: version,
        Fields: [
            {
                ID: FILE.CREATED,
                Hint: "__Created",
                Value: formatDatetime(new Date(Date.now()))
            },
            {
                ID: FILE.CREATED_BY,
                Hint: "__Created by",
                Value: createdBy
            },
        ]
    };
}

// TODO: Unicorn requires this js-yaml
function fixGeneratedYaml(input: string) {
    return "---\n" + input;
}
