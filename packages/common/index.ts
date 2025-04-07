import type { WebsiteStatus } from "@prisma/client";


export interface SignUpRequestMessageData {
    ip: string;
    publicKey: string;
    signedMessage: string;
    callbackId: string;
}


export interface SignUpResponseMessageData {
    validatorId: string;
    callbackId: string;
}


export interface ValidateRequestMessageData {
    url: string;
    websiteId: string;
    callbackId: string;
}


export interface ValidateResponseMessageData {  
    status: WebsiteStatus;
    callbackId: string;
    latency: number;
    signedMessage: string;
    websiteId: string;
    validatorId: string;
}
     

export type RequestMessage =  {
    origin: "validator";
    type: "signup";
    data: SignUpRequestMessageData;
} | {
    origin: "hub";
    type: "validate";
    data: ValidateRequestMessageData;
}


export type ResponseMessage = {
    origin: "hub";
    type: "signup";
    data: SignUpResponseMessageData;
} | {
    origin: "validator";
    type: "validate";
    data: ValidateResponseMessageData;
}



