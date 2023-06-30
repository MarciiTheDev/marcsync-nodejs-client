import { Collection, CollectionAlreadyExists, CollectionNotFound } from "./Collection";
import { Entry, EntryData } from "./Entry";

export class Client {

    private _accessToken: string;

    /**
     * 
     * @param accessToken - The access token to use for communication with MarcSync
     * @returns A new instance of the MarcSync client
     * 
     */
    constructor(accessToken: string) {
        this._accessToken = accessToken;
    }

    /**
     * 
     * @param collectionName - The name of the collection to use
     * @returns A new instance of the MarcSync collection
     * 
     * @example
     * 
     * import { Client } from "marcsync";
     * 
     * const client = new Client("<my access token>");
     * const collection = client.getCollection("my-collection");
     * 
    */
    getCollection(collectionName: string) {
        return new Collection(this._accessToken, collectionName);
    }

    /**
     * 
     * @param collectionName - The name of the collection to use
     * @returns A new instance of the MarcSync collection
     * 
     * @example
     * 
     * import { Client } from "marcsync";
     * 
     * const client = new Client("<my access token>");
     * const collection = client.fetchCollection("my-collection");
     * 
     * @remarks
     * This method is useful if you want to fetch the collection from the server to check if it exists before using it.
     * 
    */
    async fetchCollection(collectionName: string): Promise<Collection> {
        try {
            const result = await fetch(`https://api.marcsync.dev/v0/collection/${collectionName}`, {
                method: "GET",
                headers: {
                    authorization: this._accessToken
                }
            })
            if (result.status === 401) throw new Unauthorized();
            const json = await result.json();
            if (!json.success) throw new Error();
        } catch (e) {
            if (e instanceof Unauthorized) throw new Unauthorized();
            throw new CollectionNotFound();
        }
        return new Collection(this._accessToken, collectionName);
    }

    /**
     *  
     * @param collectionName - The name of the collection to create
     * @returns A new instance of the MarcSync collection
     * 
     * @example
     * 
     * import { Client } from "marcsync";
     * 
     * const client = new Client("<my access token>");
     * const collection = client.createCollection("my-collection");
     * 
     * @remarks
    */
    async createCollection(collectionName: string): Promise<Collection> {
        try {
            const result = await fetch(`https://api.marcsync.dev/v0/collection/${collectionName}`, {
                method: "POST",
                headers: {
                    authorization: this._accessToken
                }
            })
            if (result.status === 401) throw new Unauthorized();
            const json = await result.json();
            if (!json.success) throw new Error();
        } catch (e) {
            if (e instanceof Unauthorized) throw new Unauthorized();
            throw new CollectionAlreadyExists();
        }
        return new Collection(this._accessToken, collectionName);
    }
}

export class Unauthorized extends Error {
    constructor(message: string = "Invalid access token") {
        super(message);
    }
}