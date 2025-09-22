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

// Load headers from individual token files
const header1 = JSON.parse(open("../data/header/token_user1.json"));
const header2 = JSON.parse(open("../data/header/token_user2.json"));
const header3 = JSON.parse(open("../data/header/token_user3.json"));
const header4 = JSON.parse(open("../data/header/token_user4.json"));
const header5 = JSON.parse(open("../data/header/token_user5.json"));
const header6 = JSON.parse(open("../data/header/token_user6.json"));

const headers = [header1, header2, header3, header4, header5, header6];

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

// PM Form IDs (same as scene 1 and 2)
const pmFormId = ["94624", "94625", "94626", "94627", "94628", "94629"];

const stepNumbers = [1, 2, 3, 4, 5, 6];

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
  const params = { headers: headers[userIndex] };

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
      console.log(
        `❌ ERROR: ${endpoint_names[i]} API returned status ${
          responses_to_check[i].status
        } for userIndex ${userIndex} (VU ${__VU}, User ${userIndex + 1})`
      );
      console.log(`Response body: ${responses_to_check[i].body}`);
      console.log(`Stopping entire test execution due to API error.`);
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
    console.log(
      `❌ ERROR: Failed to parse JSON response from GET APIs for userIndex ${userIndex} (VU ${__VU}, User ${
        userIndex + 1
      })`
    );
    console.log(`Stopping entire test execution due to JSON parsing error.`);
    abort();
  }

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
        Array.isArray(body2) && body2[0].kpi.length > 0,
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
    console.log(
      `❌ ERROR: Validation failed for GET APIs for userIndex ${userIndex} (VU ${__VU}, User ${
        userIndex + 1
      })`
    );
    console.log(`Stopping entire test execution due to validation error.`);
    abort();
  }

  // ===== PHASE 2: RESTORE PERFORMANCE (from scene 2) =====

  const restoreSuccess = restorePerformance(
    baseUrl,
    headers[userIndex],
    userIndex
  );
  if (!restoreSuccess) {
    console.log(
      `❌ ERROR: restore-performance failed for userIndex ${userIndex} (VU ${__VU}, User ${
        userIndex + 1
      })`
    );
    console.log(
      `Stopping entire test execution due to restore-performance failure.`
    );
    abort();
  }

  // ===== PHASE 3: SUBMIT FORM (from scene 2) =====

  const submitUrl = `${baseUrl}/performance/submit-pm-form`;
  const submitParams = { headers: headers[userIndex] };
  const submitBody = JSON.stringify(bodySchema[userIndex]);

  const submitResponse = http.post(submitUrl, submitBody, submitParams);

  submitFormCounter.add(1);
  submitFormRate.add(1); // Mark as successful

  if (submitResponse.status !== 200) {
    console.log(
      `❌ ERROR: submit-pm-form API returned status ${
        submitResponse.status
      } for userIndex ${userIndex} (VU ${__VU}, User ${userIndex + 1})`
    );
    console.log(`Response body: ${submitResponse.body}`);
    console.log(`Stopping entire test execution due to API error.`);
    abort();
  }

  let submitBodyResponse;
  try {
    submitBodyResponse = submitResponse.json();
  } catch (error) {
    console.log(
      `❌ ERROR: Failed to parse JSON response from submit-pm-form API for userIndex ${userIndex} (VU ${__VU}, User ${
        userIndex + 1
      })`
    );
    console.log(`Response body: ${submitResponse.body}`);
    console.log(`Stopping entire test execution due to JSON parsing error.`);
    abort();
  }

  const submitValidationStatus = check(submitResponse, {
    "[SUBMIT] status is 200": (r) => r.status === 200,
  });

  if (!submitValidationStatus) {
    const bodyString = JSON.stringify(submitBodyResponse);
    console.log(
      `❌ ERROR: Validation failed for submit-pm-form API for userIndex ${userIndex} (VU ${__VU}, User ${
        userIndex + 1
      })`
    );
    console.log(`Step${userIndex + 1}: ${bodyString}`);
    console.log(`Stopping entire test execution due to validation error.`);
    abort();
  }
}

function restorePerformance(baseUrl, header, userIndex) {
  const url = `${baseUrl}/admin/restore-performance?pmFormID=${pmFormId[userIndex]}&stepNumber=${stepNumbers[userIndex]}`;
  const params = { headers: header };
  const response = http.post(url, null, params);

  restorePerformanceCounter.add(1);
  restorePerformanceRate.add(1);

  if (response.status !== 200) {
    console.log(
      `❌ ERROR: restore-performance API returned status ${
        response.status
      } for userIndex ${userIndex} (VU ${__VU}, User ${userIndex + 1})`
    );
    console.log(`Response body: ${response.body}`);
    console.log(`Stopping entire test execution due to API error.`);
    abort();
  }

  let bodyResponse;
  try {
    bodyResponse = response.json();
  } catch (error) {
    console.log(
      `❌ ERROR: Failed to parse JSON response from restore-performance API for userIndex ${userIndex} (VU ${__VU}, User ${
        userIndex + 1
      })`
    );
    console.log(`Response body: ${response.body}`);
    console.log(`Stopping entire test execution due to JSON parsing error.`);
    abort();
  }

  const status = check(response, {
    "status is 200": (r) => r.status === 200,
  });

  if (!status) {
    const bodyString = JSON.stringify(bodyResponse);
    console.log(
      `❌ ERROR: Validation failed for restore-performance API for userIndex ${userIndex} (VU ${__VU}, User ${
        userIndex + 1
      })`
    );
    console.log(
      `restore-performance, pm form id ${pmFormId[userIndex]} step number ${stepNumbers[userIndex]}: ${bodyString}`
    );
    console.log(`Stopping entire test execution due to validation error.`);
    abort();
  }

  return true;
}

export function handleSummary(data) {
  const getDetailsCount = data.metrics.get_details_count?.values?.count || 0;
  const submitFormCount = data.metrics.submit_form_count?.values?.count || 0;
  const restorePerformanceCount =
    data.metrics.restore_performance_count?.values?.count || 0;

  const getDetailsRateCount = data.metrics.get_details_rate?.passes || 0;
  const submitFormRateCount = data.metrics.submit_form_rate?.passes || 0;
  const restorePerformanceRateCount =
    data.metrics.restore_performance_rate?.passes || 0;

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
