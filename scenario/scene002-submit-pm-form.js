import http from "k6/http";
import { check } from "k6";
import { sleep } from "k6";
import { abort } from "k6";

export const options = {
  vus: 7,
  // iterations: 1,
  duration: "10m",
  //  thresholds: {
  //   http_req_failed: ['rate<0.01'], // fail test ถ้า error > 1%
  // },
  http_req_timeout: "120s",
  // ใช้ port 6566 สำหรับ scene002
  port: 6566,
};
const header = JSON.parse(open("../data/header/header.json"));
const header1 = header["user1"];
const header2 = header["user2"];
const header3 = header["user3"];
const header4 = header["user4"];
const header5 = header["user5"];
const header6 = header["user6"];
// const header7 = header["user7"]
const headerAdmin = header["admin"];
const headers = [
  header1,
  header2,
  header3,
  header4,
  header5,
  header6,
  headerAdmin,
];
const bodySchema1 = JSON.parse(open("../data/body/submit_step1_body.json"));
const bodySchema2 = JSON.parse(open("../data/body/submit_step2_body.json"));
const bodySchema3 = JSON.parse(open("../data/body/submit_step3_body.json"));
const bodySchema4 = JSON.parse(open("../data/body/submit_step4_body.json"));
const bodySchema5 = JSON.parse(open("../data/body/submit_step5_body.json"));
const bodySchema6 = JSON.parse(open("../data/body/submit_step6_body.json"));
// const bodySchema7 = JSON.parse(open('../data/body/save_step1_body.json'));
const bodySchema8 = JSON.parse(open("../data/body/save_step2_body.json"));
const bodySchema = [
  bodySchema1,
  bodySchema2,
  bodySchema3,
  bodySchema4,
  bodySchema5,
  bodySchema6,
  bodySchema8,
];
const pmFormIDs = [
  "94624",
  "94625",
  "94626",
  "94627",
  "94628",
  "94629",
  "94630",
  "94623",
];
const stepNumbers = [1, 2, 3, 4, 5, 6, 7];
// const headers = [header1];
// const bodySchema = [bodySchema1];
// const pmFormIDs =  ["94624"];
// const stepNumbers = [1]

export default function () {
  // Define
  const userIndex = (__VU - 1) % options.vus;

  const baseUrl = "https://pmsapiuat.thaibev.com";
  const url = `${baseUrl}/performance/submit-pm-form`;
  const params = { headers: headers[userIndex] };
  const body = JSON.stringify(bodySchema[userIndex]);

  // restore
  const restoreSuccess = restorePerformance(
    baseUrl,
    headers[userIndex],
    userIndex
  );
  if (!restoreSuccess) {
    console.log(
      `❌ ERROR: restore-performance failed for userIndex ${userIndex}`
    );
    console.log(
      `Stopping entire test execution due to restore-performance failure.`
    );
    abort();
  }

  // Load Test
  const response = http.post(url, body, params);

  // Check HTTP status code and stop execution if request fails
  if (response.status !== 200) {
    console.log(
      `❌ ERROR: submit-pm-form API returned status ${response.status} for userIndex ${userIndex}`
    );
    console.log(`Response body: ${response.body}`);
    console.log(`Stopping entire test execution due to API error.`);
    abort();
  }

  // Parse JSON response with error handling
  let bodyResponse;
  try {
    bodyResponse = response.json();
  } catch (error) {
    console.log(
      `❌ ERROR: Failed to parse JSON response from submit-pm-form API for userIndex ${userIndex}`
    );
    console.log(`Response body: ${response.body}`);
    console.log(`Stopping entire test execution due to JSON parsing error.`);
    abort();
  }

  // Validate
  const status = check(response, {
    "status is 200": (r) => r.status === 200,
  });

  if (!status) {
    const bodyString = JSON.stringify(bodyResponse);
    console.log(
      `❌ ERROR: Validation failed for submit-pm-form API for userIndex ${userIndex}`
    );
    console.log(`Step${userIndex + 1}: ${bodyString}`);
    console.log(`Stopping entire test execution due to validation error.`);
    abort();
  }
}

function restorePerformance(baseUrl, header, userIndex) {
  const url = `${baseUrl}/admin/restore-performance?pmFormID=${pmFormIDs[userIndex]}&stepNumber=${stepNumbers[userIndex]}`;
  const params = { headers: header };
  const response = http.post(url, null, params);

  // Check HTTP status code and stop execution if request fails
  if (response.status !== 200) {
    console.log(
      `❌ ERROR: restore-performance API returned status ${response.status} for userIndex ${userIndex}`
    );
    console.log(`Response body: ${response.body}`);
    console.log(`Stopping entire test execution due to API error.`);
    abort();
  }

  // Parse JSON response with error handling
  let bodyResponse;
  try {
    bodyResponse = response.json();
  } catch (error) {
    console.log(
      `❌ ERROR: Failed to parse JSON response from restore-performance API for userIndex ${userIndex}`
    );
    console.log(`Response body: ${response.body}`);
    console.log(`Stopping entire test execution due to JSON parsing error.`);
    abort();
  }

  // Validate
  const status = check(response, {
    "status is 200": (r) => r.status === 200,
  });

  if (!status) {
    const bodyString = JSON.stringify(bodyResponse);
    console.log(
      `❌ ERROR: Validation failed for restore-performance API for userIndex ${userIndex}`
    );
    console.log(
      `restore-performance, pm form id ${pmFormIDs[userIndex]} step number ${stepNumbers[userIndex]}: ${bodyString}`
    );
    console.log(`Stopping entire test execution due to validation error.`);
    abort();
  }

  return true;
}
