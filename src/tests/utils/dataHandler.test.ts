import { utilities } from "../../utils";

describe("encryptData, decryptData", () => {
    const data = "Data needs to encrypt";

    it("should the data remain the same before and after encryption and decryption", () => {
        const encryptedData = utilities.encryptData(data, "key1");
        const decryptedData = utilities.decryptData(encryptedData, "key1").toString();
        expect(data).toBe(decryptedData);
    });

    it("should the data not be decrypted if the correct key is not used for encryption", () => {
        const encryptedData1 = utilities.encryptData(data);
        expect(() => utilities.decryptData(encryptedData1, "key2")).toThrow();

        const encryptedData2 = utilities.encryptData(data, "key1");
        expect(() => utilities.decryptData(encryptedData2)).toThrow();
    });
});

describe("isEmpty", () => {
    it("should return false if variables is not Empty", () => {
        expect(utilities.isEmpty({ prop1: "1", prop2: 2 })).toBe(false);
        expect(utilities.isEmpty(1)).toBe(false);
        expect(utilities.isEmpty(0)).toBe(false);
        expect(utilities.isEmpty("test")).toBe(false);
        expect(utilities.isEmpty(["test", 1, 2])).toBe(false);
        expect(utilities.isEmpty(true)).toBe(false);
        expect(utilities.isEmpty(false)).toBe(false);
        expect(utilities.isEmpty(() => {})).toBe(false);
        expect(utilities.isEmpty(Symbol("test"))).toBe(false);

    });

    it("should return true if variables is Empty", () => {
        expect(utilities.isEmpty(null)).toBe(true);
        expect(utilities.isEmpty([])).toBe(true);
        expect(utilities.isEmpty({})).toBe(true);
        expect(utilities.isEmpty("")).toBe(true);
        expect(utilities.isEmpty(new Map())).toBe(true);
        expect(utilities.isEmpty(new Set())).toBe(true);
    });
});
