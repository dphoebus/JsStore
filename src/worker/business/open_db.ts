import { IError } from "../interfaces";
import { CONNECTION_STATUS, ERROR_TYPE } from "../enums";
import { LogHelper } from "../log_helper";
import { BaseDb } from "./base_db";

export class OpenDb extends BaseDb {


    constructor(onSuccess: () => void, onError: (err: IError) => void) {
        super();
        this.onSuccess = onSuccess;
        this.onError = onError;
    }


    execute() {
        if (this.isNullOrEmpty(this.dbName)) {
            const error = new LogHelper(ERROR_TYPE.UndefinedDbName);
            this.onError(error.get());
        }
        else {
            const dbRequest = indexedDB.open(this.dbName, this.dbVersion);

            dbRequest.onerror = (event: any) => {
                if (this.onError != null) {
                    this.onError(event.target.error);
                }
            };

            dbRequest.onsuccess = (event) => {
                this.dbStatus.conStatus = CONNECTION_STATUS.Connected;
                this.dbConnection = dbRequest.result;
                (this.dbConnection as any).onclose = this.onDbClose.bind(this);

                this.dbConnection.onversionchange = this.onDbVersionChange.bind(this);

                this.dbConnection.onerror = this.onDbConError.bind(this);

                if (this.onSuccess != null) {
                    this.onSuccess();
                }
                this.setPrimaryKey_();
            };
        }
    }

    private setPrimaryKey_() {
        this.activeDb.tables.forEach((table, index) => {
            table.columns.every(item => {
                this.activeDb.tables[index].primaryKey = item.primaryKey ? item.name : "";
                return !item.primaryKey;
            });
        });
    }
}