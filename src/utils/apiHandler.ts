// import { Response } from "express";
// import { performance } from "perf_hooks";
// import { v4 as uuidv4 } from "uuid";

// // import utilities from "@duress-24-app-api/utils";

// import { APIResponse, CustomRequest } from "./types";
// import utilities from "./decryptData";

// /**
//  * Method to write response to the client, write logs,
//  * and calculate performance execution.
//  * @param req API request
//  * @param res API response
//  * @param status status of response
//  * @param arrayResult result returned after executing API
//  * @param format format of API response (json/xml)
//  */
// function API_RETURN_MESSAGE<ResultType>(req: CustomRequest, res: Response,
//         { status, result, format = "json" }: APIResponse<ResultType>): void {

//     // Check whether response has already been sent to avoid error when resending response
//     if (res.headersSent) {
//         return;
//     }

//     // Handle loading time
//     // Mark end point to measure loading time when response for request API
//     const endPoint = `total_execution_time_endbf-${req.baseUrl + req.path}-${uuidv4()}`;
//     // Get start point which saved at middleware monitorPerf.setUpMeasure
//     const startPoint = req.startPoint;
//     performance.mark(endPoint);
//     // Calculate load times and convert them from milliseconds to seconds
//     const loadingTime = (performance.measure(startPoint, startPoint, endPoint).duration / 1000)
//         .toFixed(4);

//     // Handle memory usage
//     // Get the memory used after the task
//     const currentMemoUsage = process.memoryUsage().heapUsed;
//     // Get initial memory usage which saved at middleware monitorPerf.setUpMeasure
//     const initialMemoUsage = req.initialMemoUsage;
//     // Calculate the difference and convert to MB
//     const memUsage = Math.round(((currentMemoUsage - initialMemoUsage) / 1024 / 1024) * 1000) / 1000;

//     const returnData = { status, loadingTime, memUsage, result };
//     let output: string;
//     let contentType: string;

//     if (format === "xml") {
//         output = utilities.createXML(returnData);
//         contentType = "text/xml";
//     } else {
//         output = JSON.stringify(returnData, null, 2);
//         contentType = "application/json";
//     }

//     // This code might be needed in the future, so we can’t delete it
//     // const cleanOutput = output.replace(/\s+/g, "%20%").trim();
//     // utilities.writeLog(`responseData: ${cleanOutput}`, req.originalUrl);

//     // Encrypt output before return to client if needed
//     const encryptedOutput = utilities.NG_ENCRYPT(output, {
//         httpUserAgent: req.get("User-Agent"),
//         httpPostmanToken: req.get("Postman-Token")
//     });

//     // Set Content-Type for response header
//     res.type(contentType);
//     res.send(encryptedOutput);

//     // Clean mark points and measure
//     performance.clearMarks(endPoint);
//     performance.clearMarks(startPoint);
//     performance.clearMeasures(startPoint);
// };

// export { API_RETURN_MESSAGE };