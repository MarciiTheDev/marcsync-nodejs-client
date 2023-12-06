import { Entry, EntryData, EntryNotFound } from "./Entry";
import { Unauthorized } from "./marcsync";

export class Collection<T extends EntryData> {

    private _accessToken: string;
    private _collectionName: string;

    /**
     * 
     * @param accessToken - The access token to use for communication with MarcSync
     * @param collectionName - The name of the collection to use
     * @returns A new instance of the MarcSync collection
     * 
     **/
    constructor(accessToken: string, collectionName: string) {
        this._accessToken = accessToken;
        this._collectionName = collectionName;
    }

    /**
     * 
     * **__warning: This method will delete the collection and all of its entries. This action cannot be undone.__**
     * 
     */
    async drop(): Promise<void> {
        try {
            const result = await fetch(`https://api.marcsync.dev/v0/collection/${this._collectionName}`, {
                method: "DELETE",
                headers: {
                    authorization: this._accessToken
                }
            })
            if (result.status === 401) throw new Unauthorized();
            const json = await result.json();
            if (!json.success) throw new Error();
        } catch (e) {
            if(e instanceof Unauthorized) throw new Unauthorized();
            throw new CollectionNotFound("Failed to drop collection");
        }
    }

    /**
     * 
     * @returns The name of the collection
     * 
     * @example
     * 
     * import { Client } from "marcsync";
     * 
     * const client = new Client("<my access token>");
     * const collection = client.getCollection("my-collection");
     * 
     * console.log(await collection.setName("my-new-collection-name"));
     * 
     */
    async setName(name: string): Promise<void> {
        try {
            const result = await fetch(`https://api.marcsync.dev/v0/collection/${this._collectionName}`, {
                method: "PUT",
                headers: {
                    authorization: this._accessToken,
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    collectionName: name
                })
            })
            if (result.status === 401) throw new Unauthorized();
            const json = await result.json();
            if (!json.success) throw new Error();
        } catch (e) {
            if(e instanceof Unauthorized) throw new Unauthorized();
            throw new CollectionNotFound("Failed to set collection name");
        }
    }

    /**
     * 
     * @returns The name of the collection
     * 
     * @example
     * 
     * import { Client } from "marcsync";
     * 
     * const client = new Client("<my access token>");
     * const collection = client.getCollection("my-collection");
     * 
     * console.log(await collection.getName());
     * 
     */
    getName(): string {
        return this._collectionName;
    }

    /**
     * 
     * @returns Whether or not the collection exists
     * 
     * @example
     * 
     * import { Client } from "marcsync";
     * 
     * const client = new Client("<my access token>");
     * const collection = client.getCollection("my-collection");
     * 
     * if (await collection.exists()) {
     *    console.log("Collection exists!");
     * } else {
     *   console.log("Collection does not exist!");
     * }
     * 
     * @remarks
     * This method is useful if you want to fetch the collection from the server to check if it exists before using it.
     * 
     */
    async exists(): Promise<boolean> {
        try {
            const result = await fetch(`https://api.marcsync.dev/v0/collection/${this._collectionName}`, {
                method: "GET",
                headers: {
                    authorization: this._accessToken
                }
            })
            if (result.status === 401) throw new Unauthorized();
            const json = await result.json();
            if (!json.success) throw new Error();
            return true;
        } catch (e) {
            if(e instanceof Unauthorized) throw new Unauthorized();
            return false;
        }
    }
    
    /**
     * 
     * @returns Creates an entry in the collection
     * 
     * @example
     * 
     * import { Client } from "marcsync";
     * 
     * const client = new Client("<my access token>");
     * const collection = client.getCollection("my-collection");
     * 
     * await collection.createEntry({
     *   name: "MarcSync",
     *   description: "A simple, easy to use database for your projects"
     * });
     * 
    */
    async createEntry(data: T): Promise<Entry<T>> {
        try {
            const result = await fetch(`https://api.marcsync.dev/v0/entries/${this._collectionName}`, {
                method: "POST",
                headers: {
                    authorization: this._accessToken,
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    data: data
                })
            })
            if (result.status === 401) throw new Unauthorized();
            const json = await result.json();
            if (!json.success) throw new Error();
            data._id = json.objectId;
            return new Entry(this._accessToken, this._collectionName, data);
        } catch (e) {
            if(e instanceof Unauthorized) throw new Unauthorized();
            throw new CollectionNotFound("Failed to create entry");
        }
    }

    /**
     * 
     * @returns The entry with the specified ID
     * 
     * @example
     * 
     * import { Client } from "marcsync";
     * 
     * const client = new Client("<my access token>");
     * const collection = client.getCollection("my-collection");
     * 
     * const entry = await collection.getEntryById("my-entry-id");
    */
    async getEntryById(id: string): Promise<Entry<T>> {
        try {
            const result = await fetch(`https://api.marcsync.dev/v1/entries/${this._collectionName}?methodOverwrite=GET`, {
                method: "PATCH",
                headers: {
                    authorization: this._accessToken,
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    filters: {
                        _id: id
                    }
                })
            })
            if (result.status === 401) throw new Unauthorized();
            const json = await result.json();
            if (!json.success) throw new Error();
            if(json.entries.length === 0) throw new EntryNotFound();
            return new Entry<T>(this._accessToken, this._collectionName, json.entries[0]);
        } catch (e) {
            if(e instanceof Unauthorized) throw new Unauthorized();
            if(e instanceof EntryNotFound) throw new EntryNotFound();
            throw new CollectionNotFound("Failed to fetch entry");
        }
    }

    /**
     * 
     * @returns The entries with the specified filter
     * 
     * @example
     * 
     * import { Client } from "marcsync";
     * 
     * const client = new Client("<my access token>");
     * const collection = client.getCollection("my-collection");
     * 
     * const entries = await collection.getEntries({
     *  name: "MarcSync"
     * });
     * 
     * console.log(entries);
     * 
     * @remarks
     * This method is useful if you want to fetch multiple entries from the server at once.
     * 
     * @see {@link getEntryById} if you want to fetch a single entry by its Id.
     * @see {@link Entry} for more information about entries.
     * @see {@link EntryData} for more information about entry data.
     * 
     */
    async getEntries(filter?: Partial<{ [K in keyof T]: T[K] }>): Promise<Entry<T>[]> {
        try {
            const result = await fetch(`https://api.marcsync.dev/v1/entries/${this._collectionName}?methodOverwrite=GET`, {
                method: "PATCH",
                headers: {
                    authorization: this._accessToken,
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    filters: filter || {}
                })
            })
            if (result.status === 401) throw new Unauthorized();
            const json = await result.json();
            if (!json.success) throw new Error();
            return json.entries.map((entry: EntryData) => new Entry(this._accessToken, this._collectionName, entry));
        } catch (e) {
            if(e instanceof Unauthorized) throw new Unauthorized();
            throw new CollectionNotFound("Failed to fetch entries");
        }
    }

    /**
     * 
     * @returns The Id of the deleted entry
     * 
     * **__warning: Will delete the entry from the collection. This action cannot be undone.__**
     * 
    */
    async deleteEntryById(id: string): Promise<string> {
        try {
            const result = await fetch(`https://api.marcsync.dev/v1/entries/${this._collectionName}`, {
                method: "DELETE",
                headers: {
                    authorization: this._accessToken,
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    filters: {
                        _id: id
                    }
                })
            })
            if (result.status === 401) throw new Unauthorized();
            const json = await result.json();
            if (!json.success) throw new Error();
            if(json.deletedEntries === 0) throw new EntryNotFound();
        } catch (e) {
            if(e instanceof Unauthorized) throw new Unauthorized();
            throw new EntryNotFound("Failed to delete entry");
        }
        return id;
    }

    /**
     * 
     * @returns The amount of deleted entries
     * 
     * **__warning: Will delete the entries from the collection. This action cannot be undone.__**
     * 
    */
    async deleteEntries(filter?: Partial<{ [K in keyof T]: T[K] }>): Promise<number> {
        try {
            const result = await fetch(`https://api.marcsync.dev/v1/entries/${this._collectionName}`, {
                method: "DELETE",
                headers: {
                    authorization: this._accessToken,
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    filters: filter
                })
            })
            if (result.status === 401) throw new Unauthorized();
            const json = await result.json();
            if (!json.success) throw new Error();
            return json.deletedEntries;
        } catch (e) {
            if(e instanceof Unauthorized) throw new Unauthorized();
            throw new EntryNotFound("Failed to delete entries");
        }
    }

    /**
     * 
     * @returns The Id of the updated entry
     * 
    */
    async updateEntryById(id: string, data: Partial<{ [K in keyof T]: T[K] }>): Promise<string> {
        try {
            const result = await fetch(`https://api.marcsync.dev/v1/entries/${this._collectionName}`, {
                method: "PUT",
                headers: {
                    authorization: this._accessToken,
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    filters: {
                        _id: id
                    },
                    data: data
                })
            })
            if (result.status === 401) throw new Unauthorized();
            const json = await result.json();
            if (!json.success) throw new Error();
            if(json.modifiedEntries === 0) throw new EntryNotFound();
            return id;
        } catch (e) {
            if(e instanceof Unauthorized) throw new Unauthorized();
            throw new EntryNotFound("Failed to update entry");
        }
    }

    /**
     * 
     * @returns The amount of updated entries
     * 
    */
    async updateEntries(filter: Partial<{ [K in keyof T]: T[K] }>, data: Partial<{ [K in keyof T]: T[K] }>): Promise<number> {
        try {
            const result = await fetch(`https://api.marcsync.dev/v1/entries/${this._collectionName}`, {
                method: "PUT",
                headers: {
                    authorization: this._accessToken,
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    filters: filter,
                    data: data
                })
            })
            if (result.status === 401) throw new Unauthorized();
            const json = await result.json();
            if (!json.success) throw new Error();
            return json.modifiedEntries;
        } catch (e) {
            if(e instanceof Unauthorized) throw new Unauthorized();
            throw new EntryNotFound("Failed to update entries");
        }
    }
}

export class CollectionNotFound extends Error {
    constructor(message: string = "Failed to fetch collection") {
        super(message);
    }
}

export class CollectionAlreadyExists extends Error {
    constructor(message: string = "Collection already exists") {
        super(message);
    }
}