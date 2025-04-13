import { DEFAULT_KEY } from "../config/config";
import crypto from "crypto";

const utilities = {
    /**
     * Method to encrypt data with a secret key using 'aes-256-cbc' algorithm
     * @param data data needs encryption
     * @param key secret key, if it not provide, use DEFAULT_KEY
     * @returns buffer data is encrypted
     */
    encryptData: (data: string, key: string | null = null): Buffer => {
        // Initialize a buffer with 16 zero bytes
        const iv = Buffer.alloc(16, 0);

        // Cipher algorithm "aes-256-cbc" only accepts a 32-character or 256-bytes key
        const keyBuffer = Buffer.alloc(32);
        // Copy the key into the buffer
        keyBuffer.write(key ?? DEFAULT_KEY!);

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
     * @param key secret key, if it not provide, use DEFAULT_KEY
     * @returns buffer data is decrypted
     */
    decryptData: (encryptedData: Buffer, key: string | null = null): Buffer => {
        // Initialize a buffer with 16 zero bytes
        const iv = Buffer.alloc(16, 0);

        // Cipher algorithm "aes-256-cbc" only accepts a 32-character or 256-bytes key
        const keyBuffer = Buffer.alloc(32);
        // Copy the key into the buffer
        keyBuffer.write(key ?? DEFAULT_KEY!);

        // Create the decipher object
        const decipher = crypto.createDecipheriv("aes-256-cbc", keyBuffer, iv);
        // Decrypt data
        let decrypted = decipher.update(encryptedData);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return decrypted;
    },
    /**
     * Method is used to check if value is an empty Array, empty String,
     * empty Map, empty Set or empty Object
     * @param value value is checked
     * @returns boolean
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isEmpty: (value: any): boolean => {
        // Check for null and undefined
        if (value == null) {
            return true;
        }

        // Check for boolean, number or function
        if (typeof value === "boolean" || typeof value === "number" || typeof value === "function") {
            return false;
        }

        // Check for string, array or similar type Array (arguments)
        if (typeof value === "string" || Array.isArray(value) ||
            (typeof value === "object" && "length" in value)) {
            return (value as { length: number }).length === 0;
        }

        // Check for Map and Set
        if (value instanceof Map || value instanceof Set) {
            return value.size === 0;
        }

        // Check for Object
        if (typeof value === "object") {
            for (const key in value) {
                if (Object.prototype.hasOwnProperty.call(value, key)) {
                    return false;
                }
            }
            return true;
        }

        // In others case, considered non-empty
        return false;
    },
}

export default utilities;
