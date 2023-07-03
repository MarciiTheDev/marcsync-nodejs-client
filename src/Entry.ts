export class BaseEntry {

    private _data: EntryData;
    private _collectionName: string;

    constructor(private data: EntryData, private collectionName: string) {
        this._data = data;
        this._collectionName = collectionName;
    }

    /**
     * 
     * @returns The EntryData object of the entry
     * 
     * @example
     * 
     * import { Client } from "marcsync";
     * 
     * const client = new Client("<my access token>");
     * const collection = client.getCollection("my-collection");
     * 
     * const entry = await collection.getEntryById("my-entry-id");
     * 
     * const data = entry.getValues();
     * 
     * console.log(data);
     * 
     * @remarks
     * This method is useful if you want to get the values of the entry.
     * 
     * @see {@link EntryData} for more information about entry data.
     * 
    */
    getValues(): EntryData {
        return this._data;
    }
    
    /**
     * 
     * @param key - The key of the value to get
     * @returns The value of the specified key
     * 
     * @example
     * 
     * import { Client } from "marcsync";
     * 
     * const client = new Client("<my access token>");
     * const collection = client.getCollection("my-collection");
     * 
     * const entry = await collection.getEntryById("my-entry-id");
     * 
     * const name = entry.getValueAs<string>("name");
     * 
     * console.log(name);
     * 
     * @remarks
     * This method is useful if you want to get the value of a specific key as a specific type.
     * 
     * @see {@link EntryData} for more information about entry data.
     * 
    */
    getValueAs<T>(key: string): T {
        return this._data[key];
    }
    
    /**
     * 
     * @param key - The key of the value to get
     * @returns The value of the specified key
     * 
     * @example
     * 
     * import { Client } from "marcsync";
     * 
     * const client = new Client("<my access token>");
     * const collection = client.getCollection("my-collection");
     * 
     * const entry = await collection.getEntryById("my-entry-id");
     * 
     * const name = entry.getValue("name");
     * 
     * console.log(name);
     * 
     * @remarks
     * This method is useful if you want to get the value of a specific key without specifying the type.
     * 
     * @see {@link EntryData} for more information about entry data. 
     * 
    */
    getValue(key: string): any {
        return this._data[key];
    }

    /**
     * 
     * @returns The name of the collection of the entry
     * 
    */
    getCollectionName(): string {
        return this._collectionName;
    }

    protected _setData(data: EntryData) {
        this._data = data;
    }
}

export class Entry extends BaseEntry {

    private _accessToken: string;
    private _entryId: string;

    constructor(accessToken: string, collectionName: string, data: EntryData) {
        super(data, collectionName);
        this._accessToken = accessToken;
        this._entryId = data._id;
    }

    /**
     * 
     * @param key - The key of the value to update
     * @param value - The value to update
     * @returns The values of the entry after update
     * 
     * @example
     * 
     * import { Client } from "marcsync";
     * 
     * const client = new Client("<my access token>");
     * const collection = client.getCollection("my-collection");
     * 
     * const entry = await collection.getEntryById("my-entry-id");
     * 
     * const name = entry.updateValue("name", "MarcSync");
     * 
     * console.log(name);
     * 
     * @remarks
     * This method is useful if you want to update the value of a specific key.
     * 
    */
    async updateValue(key: string, value: any): Promise<EntryData> {
        try {
            const result = await fetch(`https://api.marcsync.dev/v1/entries/${this.getCollectionName()}`, {
                method: "PUT",
                headers: {
                    authorization: this._accessToken,
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    filters: {
                        _id: this._entryId
                    },
                    data: {
                        [key]: value
                    }
                })
            })
            if (result.status !== 200)
                throw new Error("Failed to update entry");
        } catch (err) {
            throw new EntryUpdateFailed(err);
        }
        const data = this.getValues();
        data[key] = value;
        this._setData(data);
        return data;
    }

    /**
     * 
     * @param values - The values to update
     * @returns The values of the entry after update
     * 
     * @example
     * 
     * import { Client } from "marcsync";
     * 
     * const client = new Client("<my access token>");
     * const collection = client.getCollection("my-collection");
     * 
     * const entry = await collection.getEntryById("my-entry-id");
     * 
     * await entry.updateValues({
     *    name: "MarcSync",
     *    age: 18
     * });
     * 
     * @remarks
     * This method is useful if you want to update multiple values of the entry.
     * 
     * @see {@link EntryData} for more information about entry data.
     * @see {@link updateValue} for more information about updating a single value.
     * 
     */
    async updateValues(values: EntryData): Promise<EntryData> {
        try {
            const result = await fetch(`https://api.marcsync.dev/v1/entries/${this.getCollectionName()}`, {
                method: "PUT",
                headers: {
                    authorization: this._accessToken,
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    filters: {
                        _id: this._entryId
                    },
                    data: values
                })
            })
            if (result.status !== 200)
                throw new Error("Failed to update entry");
        } catch (err) {
            throw new EntryUpdateFailed(err);
        }
        const data = this.getValues();
        for (const key in values) {
            data[key] = values[key];
        }
        this._setData(data);
        return data;
    }

    /**
     * 
     * **__warning: Will delete the entry from the collection. This action cannot be undone.__**
     * 
    */
    async delete(): Promise<void> {
        try {
            const result = await fetch(`https://api.marcsync.dev/v1/entries/${this.getCollectionName()}`, {
                method: "DELETE",
                headers: {
                    authorization: this._accessToken,
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    filters: {
                        _id: this._entryId
                    }
                })
            })
            if (result.status !== 200)
                throw new Error();
        } catch (err) {
            throw new EntryUpdateFailed("Could not delete entry");
        }
    }
}

export interface EntryData {
    [key: string]: any;
}

export class EntryNotFound extends Error {
    constructor(message: string = "Failed to fetch entry by Id") {
        super(message);
    }
}

export class EntryUpdateFailed extends Error {
    constructor(message: any = "Failed to update entry") {
        super(message);
    }
}