module JsStorage {
    export module Business {
        export module IndexDb {
            export class SelectLogic extends BaseSelectLogic {

                private executeWhereInLogic = function () {
                    if (Array.isArray(this.Query.WhereIn)) {
                        this.executeMultipleWhereInLogic(this.Query.WhereIn);
                    }
                    else {
                        this.executeSingleWhereInLogic(this.Query.WhereIn);
                    }
                }

                private executeWhereLogic = function () {
                    var Column,
                        SkipRecord = this.Query.Skip,
                        LimitRecord = this.Query.Limit,
                        That: SelectLogic = this,
                        ConditionLength = 0,
                        OnSuccessGetRequest = function () {
                            --ConditionLength;
                            if (ConditionLength == 0)
                                That.onSuccessRequest();
                        };

                    var executeInnerWhereLogic = function (column, value) {

                        if (That.ObjectStore.indexNames.contains(column)) {
                            var CursorOpenRequest = That.ObjectStore.index(column).openCursor(value);
                            CursorOpenRequest.onerror = function (e) {
                                That.ErrorOccured = true; ++That.ErrorCount;
                                That.onErrorRequest(e);
                            }
                            if (SkipRecord && LimitRecord) {
                                var RecordSkipped = 0;
                                CursorOpenRequest.onsuccess = function (e) {
                                    var Cursor: IDBCursorWithValue = (<any>e).target.result;
                                    if (Cursor) {
                                        if (RecordSkipped == SkipRecord) {
                                            if (That.Results.length != LimitRecord) {
                                                That.Results.push(Cursor);
                                                Cursor.continue();
                                            }
                                            else {
                                                OnSuccessGetRequest();
                                            }
                                        }
                                        else {
                                            ++RecordSkipped;
                                        }
                                    }
                                    else {
                                        OnSuccessGetRequest();
                                    }
                                }
                            }
                            else if (SkipRecord) { //skip exist
                                var RecordSkipped = 0;
                                CursorOpenRequest.onsuccess = function (e) {
                                    var Cursor: IDBCursorWithValue = (<any>e).target.result;
                                    if (Cursor) {
                                        if (RecordSkipped == SkipRecord) {
                                            That.Results.push(Cursor);
                                        }
                                        else {
                                            ++RecordSkipped;
                                        }
                                        Cursor.continue();
                                    }
                                    else {
                                        OnSuccessGetRequest();
                                    }
                                }
                            }
                            else if (LimitRecord) {
                                CursorOpenRequest.onsuccess = function (e) {
                                    var Cursor: IDBCursorWithValue = (<any>e).target.result;
                                    if (Cursor && That.Results.length != LimitRecord) {
                                        That.Results.push(Cursor.value);
                                        Cursor.continue();
                                    }
                                    else {
                                        OnSuccessGetRequest();
                                    }
                                }
                            }
                            else {
                                CursorOpenRequest.onsuccess = function (e) {
                                    var Cursor: IDBCursorWithValue = (<any>e).target.result;
                                    if (Cursor) {
                                        if (That.checkForWhereConditionMatch(That.Query.Where, Cursor.value)) {
                                            That.Results.push(Cursor.value);
                                        }
                                        Cursor.continue();
                                    }
                                    else {
                                        OnSuccessGetRequest();
                                    }
                                }
                            }
                        }
                        else {
                            UtilityLogic.getError(ErrorType.ColumnNotExist, true, { ColumnName: Column });
                            return false;
                        }

                    }

                    for (Column in this.Query.Where) {
                        if (Array.isArray(this.Query.Where[Column])) {
                            ConditionLength = this.Query.Where[Column].length;
                            for (var i = 0; i < this.Query.Where[Column].length; i++) {
                                var ExecutionStatus = executeInnerWhereLogic(Column, this.Query.Where[Column][i])
                                if (ExecutionStatus == false) {
                                    break;
                                }
                            }

                        }
                        else {
                            executeInnerWhereLogic(Column, this.Query.Where[Column]);
                        }
                        break;
                    }

                }

                private checkForWhereConditionMatch(where, value) {
                    var TempColumn;
                    for (TempColumn in where) {
                        if (Array.isArray(where[TempColumn])) {
                            var i, Status = true;
                            for (i = 0; i < TempColumn.length; i++) {
                                if (where[TempColumn][i] == value[TempColumn]) {
                                    Status = true;
                                    break;
                                }
                                else {
                                    Status = false;
                                }
                            };
                            if (!Status) {
                                return Status;
                            }
                        }
                        else {
                            if (where[TempColumn] != value[TempColumn]) {
                                return false;
                            }
                        }
                    }
                    return true;
                }

                private executeWhereUndefinedLogic = function () {
                    var That: SelectLogic = this,
                        CursorOpenRequest = this.ObjectStore.openCursor();

                    CursorOpenRequest.onsuccess = function (e) {
                        var Cursor = (<any>e).target.result;
                        if (Cursor) {
                            That.Results.push(Cursor.value);
                            (Cursor as any).continue();
                        }
                        else {
                            That.onSuccessRequest();
                        }
                    }
                    CursorOpenRequest.onerror = That.onErrorRequest;
                }

                constructor(query: ISelect, onSuccess: Function, onError: Function) {
                    super();
                    this.Query = query;
                    this.OnSuccess = onSuccess;
                    this.OnError = onError;
                    this.Transaction = DbConnection.transaction([query.From], "readonly");
                    this.ObjectStore = this.Transaction.objectStore(query.From);

                    if (query.WhereIn != undefined) {
                        if (query.Where != undefined) {
                            this.SendResultFlag = false;
                            this.executeWhereLogic();
                        }
                        this.SendResultFlag = true;
                        this.executeWhereInLogic();

                    }
                    else if (query.Where != undefined) {
                        this.executeWhereLogic();
                    }
                    else {

                        this.executeWhereUndefinedLogic();
                    }
                }

            }
        }

    }
}