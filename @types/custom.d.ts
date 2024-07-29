import { Request } from "express";
import { IUser } from "../models/user.model";

declare global {
    namespace Express{
        interface Request{
            user?: IUser
        }
    }
}
declare module 'midtrans-client' {
    export interface TransactionDetails {
      order_id: string;
      gross_amount: number;
    }
  
    export interface CreditCard {
      secure: boolean;
    }
  
    export interface TransactionRequest {
      transaction_details: TransactionDetails;
      credit_card?: CreditCard;
    }
  
    export class Snap {
      constructor(options: {
        isProduction: boolean;
        serverKey: string;
      });
  
      createTransaction(transaction: TransactionRequest): Promise<any>;
    }
  }
  
  