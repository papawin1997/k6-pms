import http from "k6/http";
import { check } from "k6";

export const options = {
  vus: 8,
  // iterations: 16,
  duration: "10m",
};

const header = JSON.parse(open("../data/header/header.json"));
const header1 = header["user1"];
const header2 = header["user2"];
const header3 = header["user3"];
const header4 = header["user4"];
const header5 = header["user5"];
const header6 = header["user6"];
const header7 = header["user7"];
const headerAdmin = header["admin"];

const headers = [
  header1,
  header2,
  header3,
  header4,
  header5,
  header6,
  header7,
  headerAdmin,
];

const pmFormIDs = [
  "94623",
  "94624",
  "94625",
  "94627",
  "94628",
  "94629",
  "94631",
  "94632",
];

const stepNumbers = [1, 1, 2, 4, 5, 6, 1, 1];

const body1 = JSON.parse(open("../data/body/route_form_body_94623.json"));
const body2 = JSON.parse(open("../data/body/route_form_body_94624.json"));
const body3 = JSON.parse(open("../data/body/route_form_body_94625.json"));
const body4 = JSON.parse(open("../data/body/route_form_body_94627.json"));
const body5 = JSON.parse(open("../data/body/route_form_body_94628.json"));
const body6 = JSON.parse(open("../data/body/route_form_body_94629.json"));
const body7 = JSON.parse(open("../data/body/route_form_body_94631.json"));
const body8 = JSON.parse(open("../data/body/route_form_body_94632.json"));
const bodySchema = [body1, body2, body3, body4, body5, body6, body7, body8];

export default function () {
  // Define
  const userIndex = (__VU - 1) % 8;
  const baseUrl = "https://pmsapiuat.thaibev.com";
  const url = `${baseUrl}/admin/route-form`;
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
  const bodyResponse = response.json();

  // Validate
  const status = check(response, {
    "status is 200": (r) => r.status === 200,
  });

  if (status == false) {
    console.log(bodyResponse);
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
