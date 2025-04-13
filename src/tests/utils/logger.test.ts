import { logger } from "../../utils";


describe("Logger", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let logSpy: jest.MockedFunction<any>;
    afterEach(function(){
        (logSpy as jest.Mock).mockRestore();
    });

    it("logSystemInfo should log system infomation", () => {
        logSpy = jest.spyOn(logger.system, "info").mockImplementation();
        const event = "server-event-1";
        const parameters = {param1: "value1", param2: "value2"};
        const description = "Some infomation for the system";
        logger.system.info(event, parameters, description);
        expect(logSpy).toHaveBeenCalled();
    });
    it("logSystemError should log system error", () => {
        logSpy = jest.spyOn(logger.system, "error").mockImplementation();
        const event = "server-event-2";
        const parameters = {param1: "value1", param2: "value2"};
        const description = "An error occurred during processing";
        logger.system.error(event, parameters, description);
        expect(logSpy).toHaveBeenCalled();
    });
    it("logSystemWarn should log system warning", () => {
        logSpy = jest.spyOn(logger.system, "warn").mockImplementation();
        const event = "server-event-3";
        const parameters = {param1: "value1", param2: "value2"};
        const description = "A warning occurred during processing";
        logger.system.warn(event, parameters, description);
        expect(logSpy).toHaveBeenCalled();
    });
    it("logSystemDebug should log system debugging", () => {
        logSpy = jest.spyOn(logger.system, "debug").mockImplementation();
        const event = "server-event-4";
        const parameters = {param1: "value1", param2: "value2"};
        const description = "A debug is occurring";
        logger.system.debug(event, parameters, description);
        expect(logSpy).toHaveBeenCalled();
    });
});
