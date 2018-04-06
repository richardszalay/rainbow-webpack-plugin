export interface OrphanSitecoreItem {
    ID: string;
    Parent?: string;
    Path?: string;
    Template: string;
    DB: string;
    SharedFields: ItemField[];
    Languages: ItemLanguage[];
}

export type SitecoreItem = OrphanSitecoreItem & {
    ID: string;
    Parent: string;
};

export interface ItemLanguage {
    Language: string;
    Versions: ItemVersion[];
}

export interface ItemVersion {
    Version: number;
    Fields: ItemField[];
}

export interface ItemField {
    ID: string;
    Hint: string;
    Value: string | number;
    BlobID?: string;
}
