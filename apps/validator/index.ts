import { Keypair } from "@solana/web3.js";
import { randomUUIDv7 } from "bun";
import type { RequestMessage, ResponseMessage, SignUpRequestMessageData, ValidateResponseMessageData, ValidateRequestMessageData, SignUpResponseMessageData } from "common/index";
import nacl from "tweetnacl";
import nacl_util from "tweetnacl-util";

const CALLBACKS: {
    [callbackId: string] : (data: RequestMessage | ResponseMessage) => void
} = {};


let validatorId: string | null = null;

async function main() {
    const keypair = Keypair.fromSecretKey(
        Uint8Array.from(JSON.parse(process.env.PRIVATE_KEY!))
    );
    const ws = new WebSocket("ws://localhost:8081");

    ws.onmessage = async (event) => {
        const data: RequestMessage | ResponseMessage = JSON.parse(event.data);
        
        if (data.type === 'signup' && data.origin === 'hub') {
            const callback = CALLBACKS[data.data.callbackId];
            if (callback) {
                callback(data);
                delete CALLBACKS[data.data.callbackId];
            } 
        } else if (data.type === 'validate' && data.origin === 'hub') {
            await validateHandler(ws, data.data , keypair);
        }
    }

    ws.onopen = async () => {
        const callbackId = randomUUIDv7();
        CALLBACKS[callbackId] = (data: RequestMessage | ResponseMessage) => {
            if (data.type === 'signup' && 'validatorId' in data.data) {
                validatorId = data.data.validatorId;
            }
        }
        const signedMessage = await signMessage(`Signed message for ${callbackId}, ${keypair.publicKey}`, keypair);

        ws.send(JSON.stringify({
            type: 'signup',
            data: {
                callbackId,
                ip: '127.0.0.1',
                publicKey: keypair.publicKey,
                signedMessage,
            },
        }));
    }
}

async function validateHandler(ws: WebSocket, { url, callbackId, websiteId }: ValidateRequestMessageData, keypair: Keypair) {
    console.log(`Validating ${url}`);
    const startTime = Date.now();
    const signature = await signMessage(`Replying to ${callbackId}`, keypair);

    try {
        const response = await fetch(url);
        const endTime = Date.now();
        const latency = endTime - startTime;
        const status = response.status;

        console.log(url);
        console.log(status);
        ws.send(JSON.stringify({
            type: 'validate',
            origin: "validator",
            data: {
                callbackId,
                status: status === 200 ? 'Good' : 'Bad',
                latency,
                websiteId,
                validatorId,
                signedMessage: signature,
            },
        }));
    } catch (error) {
        ws.send(JSON.stringify({
            type: 'validate',
            origin: "validator",
            data: {
                callbackId,
                status:'Bad',
                latency: 1000,
                websiteId,
                validatorId,
                signedMessage: signature,
            },
        }));
        console.error(error);
    }
}

async function signMessage(message: string, keypair: Keypair) {
    const messageBytes = nacl_util.decodeUTF8(message);
    const signature = nacl.sign.detached(messageBytes, keypair.secretKey);

    return JSON.stringify(Array.from(signature));
}

main();

setInterval(async () => {
    
}, 10000);