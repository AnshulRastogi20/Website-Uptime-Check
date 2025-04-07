import type { ServerWebSocket } from "bun";
import type { RequestMessage, ResponseMessage, SignUpRequestMessageData, ValidateResponseMessageData } from "common/index";
import { prismaClient } from "db/client";
import { randomUUIDv7 } from "bun";
import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import nacl_util from "tweetnacl-util";
import axios from "axios";

const availableValidators: {
    validatorId: string;
    publicKey: string;
    socket: ServerWebSocket<unknown>;
}[] = [];


const CALLBACKS: {
    [callbackId: string] : (data: RequestMessage | ResponseMessage) => void
} = {};

const COST_PER_VALIDATION = 100; // 100 lAMPORTS = 0.0000001 SOL

Bun.serve({
    fetch(req, server) {
        if(server.upgrade(req)) {
            return;
        }
        
        return new Response("Failed", { status: 500 });
    },
    port: 8081,
    websocket: {
        async message(ws:ServerWebSocket<unknown>, message:string) {
            const data : RequestMessage = JSON.parse(message);
            if(data.type === "signup") {
                    const verified = await verifyMessage(
                        `Signed message for ${data.data.callbackId}, ${data.data.publicKey}`, 
                        data.data.signedMessage,
                        data.data.publicKey);

                    if(verified){
                        await  signUphandler(ws , data.data)
                    }
            } else if(data.type === "validate") {
                const callback = CALLBACKS[data.data.callbackId];
                if (callback) {
                    callback(data);
                    delete CALLBACKS[data.data.callbackId];
                }
            }
        },
        async close(ws:ServerWebSocket<unknown>) {
            availableValidators.splice(availableValidators.findIndex(v => v.socket === ws), 1);
        }
    }
})


async function verifyMessage(message:string, signature:string, publicKey:string) {
    const messageBytes = nacl_util.decodeUTF8(message);
    const result = nacl.sign.detached.verify(
        messageBytes, 
        new Uint8Array(JSON.parse(signature)), 
        new PublicKey(publicKey).toBytes()
    );

    return result;
}


async function signUphandler(ws:ServerWebSocket<unknown>, {ip , publicKey , signedMessage , callbackId}: SignUpRequestMessageData) {
    const validatorDb = await prismaClient.validator.findUnique({
        where: {
            publicKey
        }
    })

    if(validatorDb) {
        ws.send(JSON.stringify({
            type: "signup",
            data: {
                validatorId: validatorDb.id,
                callbackId
            }
        }))

        availableValidators.push({
            validatorId: validatorDb.id,
            publicKey: validatorDb.publicKey,
            socket: ws
        })

        return;
    } 

    
    const response = await axios.get(`https://ipwho.is/${ip}`);
    const {country} = response.data;
    
    const validatior = await prismaClient.validator.create({
        data: {
            publicKey,
            ip,
            location: `${country}`,
        }
    })

    availableValidators.push({
        validatorId: validatior.id,
        publicKey: validatior.publicKey,
        socket: ws
    }) 
}


setInterval(async() => {
    const websiteToMonitor = await prismaClient.website.findMany({
        where: {
            disabled: false,
        },
    });

    for(const website of websiteToMonitor) {
        availableValidators.forEach(validator => {
            const callbackId = randomUUIDv7();
            console.log(`sending validate to ${validator.validatorId} , ${website.url} with callbackId ${callbackId}`);
            CALLBACKS[callbackId] = (data:RequestMessage | ResponseMessage) => {
                console.log(`received validate response for validator ${validator.validatorId} to validate - ${website.url} with callbackId ${callbackId}`);
            };
            validator.socket.send(JSON.stringify({
                origin: "hub",
                type: "validate",
                data: {
                    callbackId,
                    websiteId: website.id,
                    url: website.url,
                }
            }))

            CALLBACKS[callbackId] = async (data: RequestMessage | ResponseMessage) => {
                if (data.type === 'validate' && data.origin === 'validator') {
                    const responseData = data.data as ValidateResponseMessageData;
                    const {validatorId, status, latency, signedMessage, websiteId} = responseData;

                    const verified = await verifyMessage(
                        `Replying to ${callbackId}`, 
                        signedMessage,
                        validator.publicKey);

                    if(!verified){
                        return;
                    }

                    await prismaClient.$transaction(async (tx) => {
                        await tx.websiteTick.create({
                            data: {
                                websiteId,
                                validatorId,
                                status,
                                latency,
                                createdAt: new Date()
                            } 
                        })
                        
                        await tx.validator.update({
                            where: { id: validatorId },
                            data: { 
                                pendingPayouts: {
                                    increment: COST_PER_VALIDATION
                                }
                            }
                        })
                    })
                }
            }
        });
    }
}, 1000 * 60 * 10);
    
    










