export class Entry {

    private _accessToken: string;
    private _collectionName: string;
    private _entryId: string;
    private _data: EntryData;

    constructor(accessToken: string, collectionName: string, data: EntryData) {
        this._accessToken = accessToken;
        this._collectionName = collectionName;
        this._entryId = data._id;
        this._data = data;
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
            const result = await fetch(`https://api.marcsync.dev/v1/entries/${this._collectionName}`, {
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
        this._data[key] = value;
        return this._data;
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
            const result = await fetch(`https://api.marcsync.dev/v1/entries/${this._collectionName}`, {
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
        for (const key in values) {
            this._data[key] = values[key];
        }
        return this._data;
    }

    /**
     * 
     * **__warning: Will delete the entry from the collection. This action cannot be undone.__**
     * 
    */
    async delete(): Promise<void> {
        try {
            const result = await fetch(`https://api.marcsync.dev/v1/entries/${this._collectionName}`, {
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