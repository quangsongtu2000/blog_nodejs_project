import { DEFAULTKEY } from "../config/config";
import crypto from "crypto";
import { CheckListForEncryption, DataConvertedToXML } from "./types";

const utilities = {
    // /**
    //  * Generates an XML document from a array/object Javascript
    //  * @param data data is converted to XML
    //  * @param level XML element level, default starts at 0
    //  * @returns XML format reponse
    //  */
    // createXML: function (data: DataConvertedToXML, level: number = 0): string {
    //     let xml = (level === 0) ? "<?xml version=\"1.0\" encoding=\"ISO-8859-1\"?>\n" : "";

    //     const tab = "  ".repeat(level);

    //     for (const node in data) {
    //         if (Object.prototype.hasOwnProperty.call(data, node)) {
    //             const value = data[node];
    //             xml += `${tab}<${node}>`;
    //             if (!Array.isArray(value) && !this.isObject(value)) {
    //                 xml += String(value ?? "");
    //             } else {
    //                 // If the value is an object, recursively call createXML
    //                 const newValue = JSON.parse(JSON.stringify(value)) as DataConvertedToXML; // Convert object to JSON and back to ensure it is a plain object
    //                 xml += "\n" + this.createXML(newValue, level + 1) + tab;
    //             }
    //             xml += `</${node}>\n`;
    //         }
    //     }

    //     return xml;
    // },
    /**
     * Method to encrypt API response if needed
     * @param data data needs decryption
     * @param checkList list used to check whether response needs to be encrypted or not
     * @param key secret key, if it not provide, use DEFAULTKEY
     * @returns data is encrypted and in base64
     */
    NG_ENCRYPT: function (data: string, checkList: CheckListForEncryption,
        key: string | null = null): string {
        let isEnc = false;

        const skippedUserAgentList: string[] = ["RPT-HTTPClient/0.3-3E",
            "Apache-HttpClient/4.2.6 (java 1.5)", "curl/7.43.0"];
        if (checkList.httpUserAgent && skippedUserAgentList.includes(checkList.httpUserAgent)) {
            isEnc = false;
        }

        if (checkList.httpPostmanToken) {
            isEnc = false;
        }

        return isEnc ? this.encryptData(data, key).toString("base64") : data;
    },
    /**
     * Method to encrypt data with a secret key using 'aes-256-cbc' algorithm
     * @param data data needs encryption
     * @param key secret key, if it not provide, use DEFAULTKEY
     * @returns buffer data is encrypted
     */
    encryptData: (data: string, key: string | null = null): Buffer => {
        // Initialize a buffer with 16 zero bytes
        const iv = Buffer.alloc(16, 0);

        // Cipher algorithm "aes-256-cbc" only accepts a 32-character or 256-bytes key
        const keyBuffer = Buffer.alloc(32);
        // Copy the key into the buffer
        keyBuffer.write(key ?? DEFAULTKEY!);

        // Create the cipher object
        const cipher = crypto.createCipheriv("aes-256-cbc", keyBuffer, iv);
        // Encrypt data
        let encrypted = cipher.update(data);
        encrypted = Buffer.concat([encrypted, cipher.final()]);

        return encrypted;
    },
    /**
     * Method to decrypt data with a secret key using 'aes-256-cbc' algorithm
     * @param data data needs decryption
     * @param key secret key, if it not provide, use DEFAULTKEY
     * @returns buffer data is decrypted
     */
    decryptData: (encryptedData: Buffer, key: string | null = null): Buffer => {
        // Initialize a buffer with 16 zero bytes
        const iv = Buffer.alloc(16, 0);

        // Cipher algorithm "aes-256-cbc" only accepts a 32-character or 256-bytes key
        const keyBuffer = Buffer.alloc(32);
        // Copy the key into the buffer
        keyBuffer.write(key ?? DEFAULTKEY!);

        // Create the decipher object
        const decipher = crypto.createDecipheriv("aes-256-cbc", keyBuffer, iv);
        // Decrypt data
        let decrypted = decipher.update(encryptedData);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return decrypted;
    }
}

export default utilities;