import http from "k6/http";
import { check } from "k6";
import { abort } from "k6";
import { Counter, Rate } from "k6/metrics";

// Custom metrics for counting operations
const getDetailsCounter = new Counter("get_details_count");
const submitFormCounter = new Counter("submit_form_count");
const restorePerformanceCounter = new Counter("restore_performance_count");

// Alternative metrics using Rate
const getDetailsRate = new Rate("get_details_rate");
const submitFormRate = new Rate("submit_form_rate");
const restorePerformanceRate = new Rate("restore_performance_rate");

export const options = {
  vus: 6,
  // iterations: 1,
  duration: "10m",
  // ใช้ port 6567 สำหรับ scene013
  port: 6567,
};

// Load headers
const header = JSON.parse(open("../data/header/header.json"));
const header1 = header["user1"];
const header2 = header["user2"];
const header3 = header["user3"];
const header4 = header["user4"];
const header5 = header["user5"];
const header6 = header["user6"];

const headers = [
  header1,
  header2,
  header3,
  header4,
  header5,
  header6,
];

// Load submit body schemas
const bodySchema1 = JSON.parse(open("../data/body/submit_step1_body.json"));
const bodySchema2 = JSON.parse(open("../data/body/submit_step2_body.json"));
const bodySchema3 = JSON.parse(open("../data/body/submit_step3_body.json"));
const bodySchema4 = JSON.parse(open("../data/body/submit_step4_body.json"));
const bodySchema5 = JSON.parse(open("../data/body/submit_step5_body.json"));
const bodySchema6 = JSON.parse(open("../data/body/submit_step6_body.json"));

const bodySchema = [
  bodySchema1,
  bodySchema2,
  bodySchema3,
  bodySchema4,
  bodySchema5,
  bodySchema6,
];

const pmFormId = [
  "94624",
  "94625",
  "94626",
  "94627",
  "94628",
  "94629",
];

const stepNumbers = [1, 2, 3, 4, 5, 6, 7];

export default function () {
  // Define
  const userIndex = (__VU - 1) % options.vus;
  const baseUrl = "https://pmsapiuat.thaibev.com";

  // ===== PHASE 1: GET DETAILS (from scene 1) =====

  const urls = [
    `${baseUrl}/performance/pending/${pmFormId[userIndex]}/global-value?languageID=1`,
    `${baseUrl}/performance/pending/${pmFormId[userIndex]}/kpi-categories?languageID=1&isViewer=0&assessorRole=Employee`,
    `${baseUrl}/performance/pending/${pmFormId[userIndex]}/pm-form-step?assessorRole=Employee`,
    `${baseUrl}/performance/pending/${pmFormId[userIndex]}/employee`,
    `${baseUrl}/performance/pending/pm-form-header/${pmFormId[userIndex]}?languageID=1`,
    `${baseUrl}/performance/pending/${pmFormId[userIndex]}/routemap?languageID=1`,
  ];
  const params = {
    headers: headers[userIndex],
    timeout: "300s", // 5 minutes timeout
  };

  // Load Test - Get Details
  const batchRequests = urls.map((url) => ["GET", url, null, params]);
  const responses = http.batch(batchRequests);
  const [res1, res2, res3, res4, res5, res6] = responses;

  // Count GET operations (1 batch = 1 count)
  getDetailsCounter.add(1);
  getDetailsRate.add(1); // Mark as successful

  // Check HTTP status codes for GET requests
  const responses_to_check = [res1, res2, res3, res4, res5, res6];
  const endpoint_names = [
    "global-value",
    "kpi-categories",
    "pm-form-step",
    "employee",
    "pm-form-header",
    "routemap",
  ];

  for (let i = 0; i < responses_to_check.length; i++) {
    if (responses_to_check[i].status !== 200) {
      console.log(`❌ GET API ERROR - ${endpoint_names[i].toUpperCase()}`);
      console.log(
        `🔍 User Info: userIndex ${userIndex} (VU ${__VU}, User ${
          userIndex + 1
        })`
      );
      console.log(`📡 Endpoint: ${endpoint_names[i]}`);
      console.log(`📊 Status Code: ${responses_to_check[i].status}`);
      console.log(`📄 Response Body: ${responses_to_check[i].body}`);
      console.log(`🛑 Stopping entire test execution due to API error.`);
      console.log("=".repeat(80) + "\n");
      abort();
    }
  }

  // Validate GET responses
  let body1, body2, body3, body4, body5, body6;

  try {
    body1 = res1.json();
    body2 = res2.json();
    body3 = res3.json();
    body4 = res4.json();
    body5 = res5.json();
    body6 = res6.json();
  } catch (error) {
    console.log(`❌ JSON PARSING ERROR - GET APIs`);
    console.log(
      `🔍 User Info: userIndex ${userIndex} (VU ${__VU}, User ${userIndex + 1})`
    );
    console.log(`📡 Operation: Parse JSON response from GET APIs`);
    console.log(`❌ Error: ${error.message}`);
    console.log(`🛑 Stopping entire test execution due to JSON parsing error.`);
    console.log("=".repeat(80) + "\n");
    abort();
  }

  // Debug: Log response bodies to understand the structure
  // console.log(`Debug - res2.body for userIndex ${userIndex}:`, res2.body);
  // console.log(
  //   `Debug - body2 for userIndex ${userIndex}:`,
  //   JSON.stringify(body2)
  // );

  // Validate GET responses
  const getValidationStatus =
    check(res1, {
      "[GET] global-value status is 200": (r) => r.status === 200,
      "[GET] global-value has globalValueList": () =>
        Array.isArray(body1.globalValueList),
    }) &&
    check(res2, {
      "[GET] kpi-categories status is 200": (r) => r.status === 200,
      "[GET] kpi-categories has kpi items": () =>
        Array.isArray(body2) &&
        body2[0] &&
        body2[0].kpi &&
        body2[0].kpi.length > 0,
    }) &&
    check(res3, {
      "[GET] pm-form-step status is 200": (r) => r.status === 200,
      "[GET] pm-form-step stepNumber is 1": () => body3[0].stepNumber === "1",
    }) &&
    check(res4, {
      "[GET] employee status is 200": (r) => r.status === 200,
      "[GET] employee has ID": () => body4.ID !== "",
    }) &&
    check(res5, {
      "[GET] pm-form-header status is 200": (r) => r.status === 200,
      "[GET] pm-form-header has ID": () => body5.ID !== "",
    }) &&
    check(res6, {
      "[GET] routemap status is 200": (r) => r.status === 200,
      "[GET] routemap has steps": () =>
        Array.isArray(body6) && body6.length > 0,
    });

  if (!getValidationStatus) {
    console.log(`❌ VALIDATION ERROR - GET APIs`);
    console.log(
      `🔍 User Info: userIndex ${userIndex} (VU ${__VU}, User ${userIndex + 1})`
    );
    console.log(`📡 Operation: Validate GET API responses`);
    console.log(`❌ Issue: One or more GET API validations failed`);
    console.log(`🛑 Stopping entire test execution due to validation error.`);
    console.log("=".repeat(80) + "\n");
    abort();
  }

  // ===== PHASE 2: RESTORE PERFORMANCE (from scene 2) =====

  const restoreSuccess = restorePerformance(
    baseUrl,
    headers[userIndex],
    userIndex
  );
  if (!restoreSuccess) {
    console.log(`❌ RESTORE PERFORMANCE ERROR`);
    console.log(
      `🔍 User Info: userIndex ${userIndex} (VU ${__VU}, User ${userIndex + 1})`
    );
    console.log(`📡 Operation: Restore Performance`);
    console.log(`❌ Issue: restore-performance function returned false`);
    console.log(
      `🛑 Stopping entire test execution due to restore-performance failure.`
    );
    console.log("=".repeat(80) + "\n");
    abort();
  }

  // ===== PHASE 3: SUBMIT FORM (from scene 2) =====

  const submitUrl = `${baseUrl}/performance/submit-pm-form`;
  const submitParams = {
    headers: headers[userIndex],
    timeout: "300s", // 5 minutes timeout
  };
  const submitBody = JSON.stringify(bodySchema[userIndex]);

  // Load Test - Submit Form
  const submitResponse = http.post(submitUrl, submitBody, submitParams);

  // Count SUBMIT operation
  submitFormCounter.add(1);
  submitFormRate.add(1); // Mark as successful

  // Check HTTP status code for submit request
  if (submitResponse.status !== 200) {
    console.log(`❌ SUBMIT API ERROR - SUBMIT PM FORM`);
    console.log(
      `🔍 User Info: userIndex ${userIndex} (VU ${__VU}, User ${userIndex + 1})`
    );
    console.log(`📡 Endpoint: submit-pm-form`);
    console.log(`📊 Status Code: ${submitResponse.status}`);
    console.log(`📄 Response Body: ${submitResponse.body}`);
    console.log(`🛑 Stopping entire test execution due to API error.`);
    console.log("=".repeat(80) + "\n");
    abort();
  }

  // Parse JSON response for submit
  let submitBodyResponse;
  try {
    submitBodyResponse = submitResponse.json();
  } catch (error) {
    console.log(`❌ JSON PARSING ERROR - SUBMIT PM FORM`);
    console.log(
      `🔍 User Info: userIndex ${userIndex} (VU ${__VU}, User ${userIndex + 1})`
    );
    console.log(`📡 Operation: Parse JSON response from submit-pm-form API`);
    console.log(`❌ Error: ${error.message}`);
    console.log(`📄 Response Body: ${submitResponse.body}`);
    console.log(`🛑 Stopping entire test execution due to JSON parsing error.`);
    console.log("=".repeat(80) + "\n");
    abort();
  }

  // Validate submit response
  const submitValidationStatus = check(submitResponse, {
    "[SUBMIT] status is 200": (r) => r.status === 200,
  });

  if (!submitValidationStatus) {
    const bodyString = JSON.stringify(submitBodyResponse);
    console.log(`❌ VALIDATION ERROR - SUBMIT PM FORM`);
    console.log(
      `🔍 User Info: userIndex ${userIndex} (VU ${__VU}, User ${userIndex + 1})`
    );
    console.log(`📡 Operation: Validate submit-pm-form API response`);
    console.log(`❌ Issue: Submit validation failed`);
    console.log(`📄 Response Data: Step${userIndex + 1}: ${bodyString}`);
    console.log(`🛑 Stopping entire test execution due to validation error.`);
    console.log("=".repeat(80) + "\n");
    abort();
  }
}

function restorePerformance(baseUrl, header, userIndex) {
  const url = `${baseUrl}/admin/restore-performance?pmFormID=${pmFormId[userIndex]}&stepNumber=${stepNumbers[userIndex]}`;
  const params = {
    headers: header,
    timeout: "300s", // 5 minutes timeout
  };
  const response = http.post(url, null, params);

  // Count RESTORE PERFORMANCE operation
  restorePerformanceCounter.add(1);
  restorePerformanceRate.add(1); // Mark as successful

  // Check HTTP status code and stop execution if request fails
  if (response.status !== 200) {
    console.log(`❌ RESTORE API ERROR - RESTORE PERFORMANCE`);
    console.log(
      `🔍 User Info: userIndex ${userIndex} (VU ${__VU}, User ${userIndex + 1})`
    );
    console.log(`📡 Endpoint: restore-performance`);
    console.log(`📊 Status Code: ${response.status}`);
    console.log(`📄 Response Body: ${response.body}`);
    console.log(`🛑 Stopping entire test execution due to API error.`);
    console.log("=".repeat(80) + "\n");
    abort();
  }

  // Parse JSON response with error handling
  let bodyResponse;
  try {
    bodyResponse = response.json();
  } catch (error) {
    console.log(`❌ JSON PARSING ERROR - RESTORE PERFORMANCE`);
    console.log(
      `🔍 User Info: userIndex ${userIndex} (VU ${__VU}, User ${userIndex + 1})`
    );
    console.log(
      `📡 Operation: Parse JSON response from restore-performance API`
    );
    console.log(`❌ Error: ${error.message}`);
    console.log(`📄 Response Body: ${response.body}`);
    console.log(`🛑 Stopping entire test execution due to JSON parsing error.`);
    console.log("=".repeat(80) + "\n");
    abort();
  }

  // Validate
  const status = check(response, {
    "status is 200": (r) => r.status === 200,
  });

  if (!status) {
    const bodyString = JSON.stringify(bodyResponse);
    console.log(`❌ VALIDATION ERROR - RESTORE PERFORMANCE`);
    console.log(
      `🔍 User Info: userIndex ${userIndex} (VU ${__VU}, User ${userIndex + 1})`
    );
    console.log(`📡 Operation: Validate restore-performance API response`);
    console.log(`❌ Issue: Restore validation failed`);
    console.log(
      `📋 Details: pm form id ${pmFormId[userIndex]} step number ${stepNumbers[userIndex]}`
    );
    console.log(`📄 Response Data: ${bodyString}`);
    console.log(`🛑 Stopping entire test execution due to validation error.`);
    console.log("=".repeat(80) + "\n");
    abort();
  }

  return true;
}

// Summary function to display results at the end
export function handleSummary(data) {
  // Try Counter metrics first (they might have 'values' property)
  const getDetailsCount = data.metrics.get_details_count?.values?.count || 0;
  const submitFormCount = data.metrics.submit_form_count?.values?.count || 0;
  const restorePerformanceCount =
    data.metrics.restore_performance_count?.values?.count || 0;

  // Try Rate metrics as alternative (they have 'passes' property)
  const getDetailsRateCount = data.metrics.get_details_rate?.passes || 0;
  const submitFormRateCount = data.metrics.submit_form_rate?.passes || 0;
  const restorePerformanceRateCount =
    data.metrics.restore_performance_rate?.passes || 0;

  // Use Counter if available, otherwise use Rate
  const finalGetDetailsCount =
    getDetailsCount > 0 ? getDetailsCount : getDetailsRateCount;
  const finalSubmitFormCount =
    submitFormCount > 0 ? submitFormCount : submitFormRateCount;
  const finalRestorePerformanceCount =
    restorePerformanceCount > 0
      ? restorePerformanceCount
      : restorePerformanceRateCount;

  const summary = `
============================================================
📊 SCENE013 COMBINED TEST SUMMARY
============================================================
📥 GET Details Operations: ${finalGetDetailsCount} times
📝 Submit Form Operations: ${finalSubmitFormCount} times
🔄 Restore Performance Operations: ${finalRestorePerformanceCount} times
============================================================
`;

  console.log(summary);

  return {
    stdout: summary,
  };
}
