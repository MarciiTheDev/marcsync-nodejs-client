import { Collection, CollectionAlreadyExists, CollectionNotFound } from "./Collection";
import { BaseEntry, Entry, EntryData } from "./Entry";
import { SubscriptionManager } from "./SubscriptionManager";

export class Client {

    private _accessToken: string;
    private _subscriptions: SubscriptionManager;

    /**
     * 
     * @param accessToken - The access token to use for communication with MarcSync
     * @returns A new instance of the MarcSync client
     * 
     */
    constructor(accessToken: string) {
        this._subscriptions = new SubscriptionManager(accessToken);
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
    getCollection<T extends EntryData = EntryData>(collectionName: string): Collection<T> {
        return new Collection<T>(this._accessToken, collectionName);
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
    async fetchCollection<T extends EntryData = EntryData>(collectionName: string): Promise<Collection<T>> {
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
        return new Collection<T>(this._accessToken, collectionName);
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
    async createCollection<T extends EntryData = EntryData>(collectionName: string): Promise<Collection<T>> {
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

    /**
     * 
     * @param event - The event to listen to
     * @param listener - The listener to call when the event is emitted
     * @returns The client instance
     * 
    */
    public on<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => void): this {
        this._subscriptions.subscribe(event, listener);
        return this;
    };
}

export class Unauthorized extends Error {
    constructor(message: string = "Invalid access token") {
        super(message);
    }
}

export interface ClientEvents {
    entryCreated: [entry: Entry<EntryData>, databaseId: string, timestamp: number];
    entryUpdated: [oldEntry: BaseEntry<EntryData>, newEntry: Entry<EntryData>, databaseId: string, timestamp: number];
    entryDeleted: [entry: BaseEntry<EntryData>, databaseId: string, timestamp: number];
}