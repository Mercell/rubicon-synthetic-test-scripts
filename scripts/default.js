const synthetics = require('Synthetics');
// const log = require('SyntheticsLogger');

const syntheticsConfiguration = synthetics.getConfiguration();

const apiCanaryBlueprint = async function () {

  syntheticsConfiguration.setConfig({
    restrictedHeaders: [], // Value of these headers will be redacted from logs and reports
    restrictedUrlParameters: [] // Values of these url parameters will be redacted from logs and reports
  });

  // Handle validation for positive scenario
  const validateSuccessful = async function (res) {
    return new Promise((resolve, reject) => {
      if (res.statusCode < 200 || res.statusCode > 299) {
        throw new Error(res.statusCode + ' ' + res.statusMessage);
      }

      let responseBody = '';
      res.on('data', (d) => {
        responseBody += d;
      });

      res.on('end', () => {
        // Add validation on 'responseBody' here if required.
        resolve();
      });
    });
  };
  let hostname = process.env.HOSTNAME;
  let protocol = process.env.PROTOCOL || "https:";
  let port = process.env.PORT || "443";
  let path = process.env.PATH || "/";
  let method = process.env.METHOD || "GET";
  let body = process.env.BODY !== "undefined" ? JSON.parse(process.env.BODY) : null;
  let headers = process.env.HEADERS !== "" ? JSON.parse(process.env.HEADERS) : { "content-type": "application/json" };

  // Set request options
  let requestOptionsStep1 = {
    hostname,
    method,
    path,
    port,
    protocol,
    body,
    headers,
  };
  requestOptionsStep1['headers']['User-Agent'] = [synthetics.getCanaryUserAgentString(), requestOptionsStep1['headers']['User-Agent']].join(' ');

  // Set step config options
  let stepConfig1 = {
    includeRequestHeaders: true,
    includeResponseHeaders: true,
    includeRequestBody: true,
    includeResponseBody: true,
    continueOnHttpStepFailure: false
  };

  await synthetics.executeHttpStep(`Verify ${protocol}//${hostname}${path}`, requestOptionsStep1, validateSuccessful, stepConfig1);
};

exports.handler = async () => {
  return await apiCanaryBlueprint();
};
