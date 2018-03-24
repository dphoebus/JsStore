import { QueryExecutor } from '../query_executor';
import { Connection_Status } from '../enums';

export class IdbHelper {
    static _dbConnection;
    static _isDbDeletedByBrowser: boolean;
    static _transaction: IDBTransaction = null;

    static callDbDroppedByBrowser() {
        this._isDbDeletedByBrowser = QueryExecutor._dbStatus.ConStatus === Connection_Status.Connected ? true : false;
    }

    static createTransaction(tableNames, callBack: () => void, mode?) {
        if (this._transaction === null) {
            mode = mode ? mode : "readwrite";
            this._transaction = this._dbConnection.transaction(tableNames, mode);
            this._transaction.oncomplete = () => {
                this._transaction = null;
                callBack();
            };
            (this._transaction as any).ontimeout = function () {
                this._transaction = null;
                console.error('transaction timed out');
            };
        }
    }
}