import { Error_Type } from "./enums";

export interface IError {
    _type: Error_Type;
    _message: string;
}

export interface IWebWorkerRequest {
    Name: string;
    Query: any;
    OnSuccess?: (results) => void;
    OnError?: (err: IError) => void;
}

export interface IDbInfo {
    DbName: string;
    Table: {
        Name: string,
        Version: number
    };
}

export interface IDataBaseOption {
    Name: string;
    Tables: ITableOption[];
}

export interface ITableOption {
    Name: string;
    Columns: IColumnOption[];
    Version?: number;
}

export interface IColumnOption {
    Name: string;
    PrimaryKey?: boolean;
    AutoIncrement?: boolean;
    Unique?: boolean;
    NotNull?: boolean;
    DataType?: string;
    Default?: any;
    MultiEntry?: boolean;
    EnableSearch?: boolean;
}

export interface ISelect {
    From: any;
    Where?: any;
    Skip?: number;
    Limit?: number;
    OnSuccess?: (results: any[]) => void;
    OnError?: (error: IError) => void;
    Order?: IOrder;
    GroupBy?: any;
    Aggregate?: IAggregate;
    IgnoreCase?: boolean;
    Distinct?: boolean;
}

export interface IAggregate {
    Max?: any[];
    Min?: any[];
    Sum?: any[];
    Count?: any[];
    Avg?: any[];
}

export interface IOrder {
    By: string; // Column name
    Type: string;
}

export interface ICount {
    From: any;
    IgnoreCase?: boolean;
    Where?: any;
    OnSuccess?: (noOfRecord: number) => void;
    OnError?: (error: IError) => void;
}

export interface IRemove {
    From: string;
    IgnoreCase?: boolean;
    Where?: any;
    OnSuccess?: (rowsDeleted: number) => void;
    OnError?: (error: IError) => void;
}

export interface IUpdate {
    In: string;
    IgnoreCase?: boolean;
    Set: any;
    Where?: any;
    OnSuccess?: (rowsUpdated: number) => void;
    OnError?: (error: IError) => void;
}

export interface IInsert {
    Into: string;
    Values: any[];
    Return?: boolean;
    OnSuccess?: (rowsInserted: number) => void;
    OnError?: (error: IError) => void;
    SkipDataCheck?: boolean;
}

export interface IWebWorkerResult {
    ErrorOccured: boolean;
    ErrorDetails: any;
    ReturnedValue: any;
    ThrowError: boolean;
}