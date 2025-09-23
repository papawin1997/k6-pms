import http from "k6/http";
import { check } from "k6";
import { abort } from "k6";

export const options = {
  vus: 50,
  // iterations: 8,
  duration: "30m",
  http_req_timeout: "120s",
  port: 6565,
};
const header = JSON.parse(open("../data/header/header.json"));
const headerAdmin = header["admin"];
const pmFormId = [
  {
    user_id: "90003001",
    form_id: "100944",
  },
  {
    user_id: "90003002",
    form_id: "100945",
  },
  {
    user_id: "90003003",
    form_id: "100946",
  },
  {
    user_id: "90003004",
    form_id: "100947",
  },
  {
    user_id: "90003005",
    form_id: "100948",
  },
  {
    user_id: "90003006",
    form_id: "100949",
  },
  {
    user_id: "90003007",
    form_id: "100950",
  },
  {
    user_id: "90003008",
    form_id: "100951",
  },
  {
    user_id: "90003009",
    form_id: "100952",
  },
  {
    user_id: "90003010",
    form_id: "100953",
  },
];

export default function () {
  // Define
  const userIndex = (__VU - 1) % 8;
  const baseUrl = "https://pmsapiuat.thaibev.com";
  const pmFormID = pmFormId[userIndex]["form_id"];
  const urls = [
    `${baseUrl}/performance/pending/${pmFormID}/global-value?languageID=1`,
    `${baseUrl}/performance/pending/${pmFormID}/kpi-categories?languageID=1&isViewer=0&assessorRole=Employee`,
    `${baseUrl}/performance/pending/${pmFormID}/pm-form-step?assessorRole=Employee`,
    `${baseUrl}/performance/pending/${pmFormID}/employee`,
    `${baseUrl}/performance/pending/pm-form-header/${pmFormID}?languageID=1`,
    `${baseUrl}/performance/pending/${pmFormID}/routemap?languageID=1`,
  ];

  const userID = pmFormId[userIndex]["user_id"];
  headerAdmin["x-client-proxy-id"] = userID;
  const params = {
    headers: headerAdmin,
  };

  // Load Test
  const batchRequests = urls.map((url) => ["GET", url, null, params]);
  const responses = http.batch(batchRequests);
  const [res1, res2, res3, res4, res5, res6] = responses;

  // Check HTTP status codes and stop execution if any request fails
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
        `❌ ERROR: ${endpoint_names[i]} API returned status ${responses_to_check[i].status} for userIndex ${userIndex}`
      );
      console.log(`Response body: ${responses_to_check[i].body}`);
      console.log(`Stopping entire test execution due to API error.`);
      abort();
    }
  }

  // Validate
  let body1;
  try {
    body1 = res1.json();
  } catch (error) {
    console.log(
      `❌ ERROR: Failed to parse JSON response from global-value API for userIndex ${userIndex}`
    );
    console.log(`Response body: ${res1.body}`);
    console.log(`Stopping entire test execution due to JSON parsing error.`);
    abort();
  }

  let globalValueList = body1.globalValueList;
  const status1 = check(res1, {
    "[GET global-value] status is 200": (r) => r.status === 200,
    "[GET global-value] globalValueList has items": () =>
      Array.isArray(globalValueList),
  });

  if (!status1) {
    console.log(
      `❌ ERROR: Validation failed for global-value API for userIndex ${userIndex}`
    );
    console.log(`Stopping entire test execution due to validation error.`);
    abort();
  }

  let body2;
  try {
    body2 = res2.json();
  } catch (error) {
    console.log(
      `❌ ERROR: Failed to parse JSON response from kpi-categories API for userIndex ${userIndex}`
    );
    console.log(`Response body: ${res2.body}`);
    console.log(`Stopping entire test execution due to JSON parsing error.`);
    abort();
  }

  let kpiList = body2[0].kpi;
  let kpiItem = kpiList.length;
  const status2 = check(res2, {
    "[GET kpi-categories] status is 200": (r) => r.status === 200,
    "[GET kpi-categories] response is an array": () => Array.isArray(body2),
    "[GET kpi-categories] kpi list has items": () => kpiItem > 0,
  });

  if (!status2) {
    console.log(
      `❌ ERROR: Validation failed for kpi-categories API for userIndex ${userIndex}`
    );
    console.log(`Stopping entire test execution due to validation error.`);
    abort();
  }

  let body3;
  try {
    body3 = res3.json();
  } catch (error) {
    console.log(
      `❌ ERROR: Failed to parse JSON response from pm-form-step API for userIndex ${userIndex}`
    );
    console.log(`Response body: ${res3.body}`);
    console.log(`Stopping entire test execution due to JSON parsing error.`);
    abort();
  }

  let stepNumber = body3[0].stepNumber;
  const status3 = check(res3, {
    "[GET pm-form-step] status is 200": (r) => r.status === 200,
    "[GET pm-form-step] response is an array": () => Array.isArray(body3),
    '[GET pm-form-step] stepNumber is "1"': () => stepNumber === "1",
    "[GET pm-form-step] pmFormId is valid": (r) =>
      r.json()[0].pmFormID === pmFormId[userIndex]["form_id"],
  });

  if (!status3) {
    console.log(
      `❌ ERROR: Validation failed for pm-form-step API for userIndex ${userIndex}`
    );
    console.log(`Stopping entire test execution due to validation error.`);
    abort();
  }

  let body4;
  try {
    body4 = res4.json();
  } catch (error) {
    console.log(
      `❌ ERROR: Failed to parse JSON response from employee API for userIndex ${userIndex}`
    );
    console.log(`Response body: ${res4.body}`);
    console.log(`Stopping entire test execution due to JSON parsing error.`);
    abort();
  }

  let id4 = body4.ID;
  let employeeId = body4.employeeID;
  const status4 = check(res4, {
    "[GET employee] status is 200": (r) => r.status === 200,
    "[GET employee] ID is not empty": () => id4 !== "",
    "[GET employee] employeeID is not empty": () => employeeId !== "",
  });

  if (!status4) {
    console.log(
      `❌ ERROR: Validation failed for employee API for userIndex ${userIndex}`
    );
    console.log(`Stopping entire test execution due to validation error.`);
    abort();
  }

  let body5;
  try {
    body5 = res5.json();
  } catch (error) {
    console.log(
      `❌ ERROR: Failed to parse JSON response from pm-form-header API for userIndex ${userIndex}`
    );
    console.log(`Response body: ${res5.body}`);
    console.log(`Stopping entire test execution due to JSON parsing error.`);
    abort();
  }

  let id5 = body5.ID;
  let resultTemplateSection = body5.resultTemplateSection;
  let resultTemplateItem = resultTemplateSection.length;
  const status5 = check(res5, {
    "[GET pm-form-header] status is 200": (r) => r.status === 200,
    "[GET pm-form-header] ID is not empty": () => id5 !== "",
    "[GET pm-form-header] resultTemplateSection has items": () =>
      resultTemplateItem > 0,
  });

  if (!status5) {
    console.log(
      `❌ ERROR: Validation failed for pm-form-header API for userIndex ${userIndex}`
    );
    console.log(`Stopping entire test execution due to validation error.`);
    abort();
  }

  let body6;
  try {
    body6 = res6.json();
  } catch (error) {
    console.log(
      `❌ ERROR: Failed to parse JSON response from routemap API for userIndex ${userIndex}`
    );
    console.log(`Response body: ${res6.body}`);
    console.log(`Stopping entire test execution due to JSON parsing error.`);
    abort();
  }

  let resultStepList = body6;
  let resultStepItem = resultStepList.length;
  const status6 = check(res6, {
    "[GET routemap] status is 200": (r) => r.status === 200,
    "[GET routemap] response is an array with items": () =>
      Array.isArray(resultStepList) && resultStepItem > 0,
    "[GET routemap] step1 is valid": (r) => r.json()[0].stepNumber === 1,
    "[GET routemap] step1 has name": (r) =>
      r.json()[0].stepName === "Self Assessment",
    "[GET routemap] step2 is valid": (r) => r.json()[1].stepNumber === 2,
    "[GET routemap] step2 has name": (r) =>
      r.json()[1].stepName === "Manager Assessment",
    "[GET routemap] step3 is valid": (r) => r.json()[2].stepNumber === 3,
    "[GET routemap] step3 has name": (r) =>
      r.json()[2].stepName === "Reviewer Assessment",
    "[GET routemap] step4 is valid": (r) => r.json()[3].stepNumber === 4,
    "[GET routemap] step4 has name": (r) =>
      r.json()[3].stepName === "Calibration",
    "[GET routemap] step5 is valid": (r) => r.json()[4].stepNumber === 5,
    "[GET routemap] step5 has name": (r) =>
      r.json()[4].stepName === "Performance Discussion",
    "[GET routemap] step6 is valid": (r) => r.json()[5].stepNumber === 6,
    "[GET routemap] step6 has name": (r) =>
      r.json()[5].stepName === "Employee Acknowledgement",
    "[GET routemap] step7 is valid": (r) => r.json()[6].stepNumber === 7,
    "[GET routemap] step7 has name": (r) =>
      r.json()[6].stepName === "Completed",
  });
}
