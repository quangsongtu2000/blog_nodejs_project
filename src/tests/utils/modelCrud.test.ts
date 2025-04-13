import { modelCrud } from "../../utils";

describe("Insert data into the database tests", () => {

    it("should inserted data into the database", async () => {
        // Mock the Sequelize model and its create function
        const mockModel = {
            create: jest.fn().mockResolvedValue({ id: 1, name: "Test" }),
        };
        // Call the insertData function with the mock model and data
        const data = { name: "Test" };
        const result = await modelCrud.insertData(mockModel, data);

        // Assert that the create function was called with the correct data
        expect(mockModel.create).toHaveBeenCalledWith(data, {
            logging: false
        });

        // Assert that the function returns the created object
        expect(result).toEqual({ id: 1, name: "Test" });
    });

    it("should return an error if create function fails", async () => {
        // Mock the Sequelize model and its create function
        const mockModel = {
            create: jest.fn().mockRejectedValue(new Error("Database error")),
        };
        // Call the insertData function with valid data
        const data = { name: "Test" };
        try {
            await modelCrud.insertData(mockModel, data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            // Assert that the function throws an error
            expect(error.message).toEqual("Database error");
        }
    });
});

describe("Update data into the database tests", () => {

    it("should updated data in the database", async () => {
        // Mock the Sequelize model and its update function
        const mockModel = {
            update: jest.fn().mockResolvedValue([1]),
        };

        // Call the updateData function with the mock model, data, and id
        const data = { name: "Test" };
        const id = 1;
        const result = await modelCrud.updateData(mockModel, data, {id});

        // Assert that the update function was called with the correct data and ID
        expect(mockModel.update).toHaveBeenCalledWith(data, { where: { id },
            logging: false });

        // Assert that the function returns the number of updated rows
        expect(result[0]).toEqual(1);
    });

    it("should return null on error", async () => {
        // Mock the Sequelize model and its update function to throw an error
        const mockModel = {
          update: jest.fn().mockImplementation(() => {
            throw new Error("Update error");
          }),
        };

        // Call the updateData function with the mock model and data
        const data = { name: "Test" };
        const id  = 1;
        const result = await modelCrud.updateData(mockModel, data, { id });

        // Assert that the function returns null on error
        expect(result).toBeNull();
    });
});

describe("Delete data into the database tests", () => {

    it("should deleted data in the database", async () => {
        // Mock the Sequelize model and its update function
        const mockModel = {
            destroy: jest.fn().mockResolvedValue([1]),
        };

        // Call the updateData function with the mock model and id
        const id = 1;
        const result = await modelCrud.deleteData(mockModel, { id });

        // Assert that the delete function was called with the correct data and ID
        expect(mockModel.destroy).toHaveBeenCalledWith({ where: { id },
            logging: false });

        // Assert that the function returns the number of effected rows
        expect(result[0]).toEqual(1);
    });

    it("should return null on error", async () => {
        // Mock the Sequelize model and its destroy function to throw an error
        const mockModel = {
          destroy: jest.fn().mockImplementation(() => {
            throw new Error("Update error");
          }),
        };

        // Call the deleteData function with the mock model and data
        const id  = 1;
        const result = await modelCrud.deleteData(mockModel, { id });

        // Assert that the function returns null on error
        expect(result).toBeNull();
    });
});
