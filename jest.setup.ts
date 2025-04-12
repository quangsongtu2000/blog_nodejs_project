import { logger } from "./src/utils";

jest.spyOn(logger.system, "info").mockImplementation();
jest.spyOn(logger.system, "error").mockImplementation();
jest.spyOn(logger.system, "debug").mockImplementation();
jest.spyOn(logger.system, "warn").mockImplementation();