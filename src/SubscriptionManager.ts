import { BaseEntry, Entry, EntryData } from "./Entry";
import { ClientEvents } from "./marcsync";
import * as signalR from "@microsoft/signalr";

export class SubscriptionManager {

    private _subscriptions: Record<keyof ClientEvents, ((...args: any) => void)[]>;
    private _hubConnection: signalR.HubConnection;
    private _accessToken: string;

    
    constructor(accessToken: string) {
        this._accessToken = accessToken;
        this._subscriptions = {} as Record<keyof ClientEvents, ((...args: any) => void)[]>;
        this._hubConnection = new signalR.HubConnectionBuilder()
            .withUrl("https://ws.marcsync.dev/websocket?access_token=Bearer " + accessToken, {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            .configureLogging(signalR.LogLevel.None)
            .build();
        this._hubConnection.start()
        .catch(err => {
            console.error(err.toString());
            process.exit(1);
        });
        this.handleSubscriptions();
    }

    subscribe(subscription: keyof ClientEvents, callback: () => void) {
        if (!this._subscriptions[subscription]) this._subscriptions[subscription] = [];
        this._subscriptions[subscription].push(callback); 
    }

    private async handleSubscriptions() {
        this._hubConnection.on("entryCreated", (e: string) => {
            let d = JSON.parse(e) as EntryCreatedEvent;
            this._subscriptions.entryCreated.forEach(callback => { try { callback(new Entry(this._accessToken, d.data.collectionName, d.data.values), d.databaseId, d.timestamp) } catch(e) {console.error(e)} });
        });
        this._hubConnection.on("entryDeleted", (e: string) => {
            let d = JSON.parse(e) as EntryDeletedEvent;
            this._subscriptions.entryDeleted.forEach(callback => { try { callback(new BaseEntry(d.data.values, d.data.collectionName), d.databaseId, d.timestamp) } catch(e) {console.error(e)} });
        })
        this._hubConnection.on("entryUpdated", (e: string) => {
            let d = JSON.parse(e) as EntryUpdatedEvent;
            this._subscriptions.entryUpdated.forEach(callback => { try { callback(new BaseEntry(d.data.oldValues, d.data.collectionName), new Entry(this._accessToken, d.data.collectionName, d.data.newValues), d.databaseId, d.timestamp) } catch(e) {console.error(e)} });
        })
    }

}

export interface BaseEvent {
    databaseId: string;
    timestamp: number;
    type: number;
}

export interface EntryCreatedEvent extends BaseEvent {
    data: {
        collectionName: string;
        values: EntryData;
    };
}

export interface EntryDeletedEvent extends BaseEvent {
    data: {
        collectionName: string;
        values: EntryData;
    };
}

export interface EntryUpdatedEvent extends BaseEvent {
    data: {
        collectionName: string;
        oldValues: EntryData;
        newValues: EntryData;
    };
}