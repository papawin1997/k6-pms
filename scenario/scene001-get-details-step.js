import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 100,
  // iterations: 1,
  duration: "10m",
};
const header = JSON.parse(open('../data/header/header.json'));
const header1 = header["user1"]
const header2 = header["user2"]
const header3 = header["user3"]
const header4 = header["user4"]
const header5 = header["user5"]
const header6 = header["user6"]
const header7 = header["user7"]
const headerAdmin = header["admin"]

// const header1 = JSON.parse(open('../data/header/token_user1.json'));
// const header2 = JSON.parse(open('../data/header/token_user2.json'));
// const header3 = JSON.parse(open('../data/header/token_user3.json'));
// const header4 = JSON.parse(open('../data/header/token_user4.json'));
// const header5 = JSON.parse(open('../data/header/token_user5.json'));
// const header6 = JSON.parse(open('../data/header/token_user6.json'));
// const header7 = JSON.parse(open('../data/header/token_user7.json'));
// const header8 = JSON.parse(open('../data/header/token_user_admin.json'));
const headers = [header1, header2, header3, header4, header5, header6, header7, headerAdmin];
const pmFormId = ["94624", "94625", "94626", "94627", "94628", "94629", "94630", "94623"];

export default function () {
  // Define
  const userIndex = ((__VU - 1) % 8);
  const baseUrl = 'https://pmsapiuat.thaibev.com';
  const urls = [
    `${baseUrl}/performance/pending/${pmFormId[userIndex]}/global-value?languageID=1`,
    `${baseUrl}/performance/pending/${pmFormId[userIndex]}/kpi-categories?languageID=1&isViewer=0&assessorRole=Employee`,
    `${baseUrl}/performance/pending/${pmFormId[userIndex]}/pm-form-step?assessorRole=Employee`,
    `${baseUrl}/performance/pending/${pmFormId[userIndex]}/employee`,
    `${baseUrl}/performance/pending/pm-form-header/${pmFormId[userIndex]}?languageID=1`,
    `${baseUrl}/performance/pending/${pmFormId[userIndex]}/routemap?languageID=1`
  ];
  const params = { headers: headers[userIndex] };

  // Load Test
  const batchRequests = urls.map(url => ['GET', url, null, params]);
  const responses = http.batch(batchRequests);
  const [res1, res2, res3, res4, res5, res6] = responses;

  // Validate
  const body1 = res1.json();
  let globalValueList = body1.globalValueList;
  const status1 = check(res1, {
    '[GET global-value] status is 200': (r) => r.status === 200,
    '[GET global-value] globalValueList has items': () => Array.isArray(globalValueList),
  });

  const body2 = res2.json();
  let kpiList = body2[0].kpi;
  let kpiItem = kpiList.length;
  const status2 = check(res2, {
    '[GET kpi-categories] status is 200': (r) => r.status === 200,
    '[GET kpi-categories] response is an array': () => Array.isArray(body2),
    '[GET kpi-categories] kpi list has items': () => kpiItem > 0,
  });

  const body3 = res3.json();
  let stepNumber = body3[0].stepNumber;
  const status3 = check(res3, {
    '[GET pm-form-step] status is 200': (r) => r.status === 200,
    '[GET pm-form-step] response is an array': () => Array.isArray(body3),
    '[GET pm-form-step] stepNumber is "1"': () => stepNumber === "1",
    '[GET pm-form-step] pmFormId is valid': (r) => r.json()[0].pmFormID === pmFormId[userIndex],
  });

  const body4 = res4.json();
  let id4 = body4.ID;
  let employeeId = body4.employeeID;
  const status4 = check(res4, {
    '[GET employee] status is 200': (r) => r.status === 200,
    '[GET employee] ID is not empty': () => id4 !== "",
    '[GET employee] employeeID is not empty': () => employeeId !== "",
  });

  const body5 = res5.json();
  let id5 = body5.ID;
  let resultTemplateSection = body5.resultTemplateSection;
  let resultTemplateItem = resultTemplateSection.length;
  const status5 = check(res5, {
    '[GET pm-form-header] status is 200': (r) => r.status === 200,
    '[GET pm-form-header] ID is not empty': () => id5 !== "",
    '[GET pm-form-header] resultTemplateSection has items': () => resultTemplateItem > 0,
  });

  const body6 = res6.json();
  let resultStepList = body6;
  let resultStepItem = resultStepList.length;
  const status6 = check(res6, {
    '[GET routemap] status is 200': (r) => r.status === 200,
    '[GET routemap] response is an array with items': () => Array.isArray(resultStepList) && resultStepItem > 0,
    '[GET routemap] step1 is valid': (r) => r.json()[0].stepNumber === 1,
    '[GET routemap] step1 has name': (r) => r.json()[0].stepName === "Self Assessment",
    '[GET routemap] step2 is valid': (r) => r.json()[1].stepNumber === 2,
    '[GET routemap] step2 has name': (r) => r.json()[1].stepName === "Manager Assessment",
    '[GET routemap] step3 is valid': (r) => r.json()[2].stepNumber === 3,
    '[GET routemap] step3 has name': (r) => r.json()[2].stepName === "Reviewer Assessment",
    '[GET routemap] step4 is valid': (r) => r.json()[3].stepNumber === 4,
    '[GET routemap] step4 has name': (r) => r.json()[3].stepName === "Calibration",
    '[GET routemap] step5 is valid': (r) => r.json()[4].stepNumber === 5,
    '[GET routemap] step5 has name': (r) => r.json()[4].stepName === "Performance Discussion",
    '[GET routemap] step6 is valid': (r) => r.json()[5].stepNumber === 6,
    '[GET routemap] step6 has name': (r) => r.json()[5].stepName === "Employee Acknowledgement",
    '[GET routemap] step7 is valid': (r) => r.json()[6].stepNumber === 7,
    '[GET routemap] step7 has name': (r) => r.json()[6].stepName === "Completed",
  });

  if (!status1) {
    console.log(`Request 001 [GET global-value] failed.\nStatus: ${res1.status}.\nBody: ${res1.body}`);
  }
  if (!status2) {
    console.log(`Request 002 [GET kpi-categories] failed.\nStatus: ${res2.status}.\nBody: ${res2.body}`);
  }
  if (!status3) {
    console.log(`Request 003 [GET pm-form-step] failed.\nStatus: ${res3.status}.\nBody: ${res3.body}`);
  }
  if (!status4) {
    console.log(`Request 004 [GET employee] failed.\nStatus: ${res4.status}.\nBody: ${res4.body}`);
  }
  if (!status5) {
    console.log(`Request 005 [GET pm-form-header] failed.\nStatus: ${res5.status}.\nBody: ${res5.body}`);
  }
  if (!status6) {
    console.log(`Request 006 [GET routemap] failed.\nStatus: ${res6.status}.\nBody: ${res6.body}`);
  }
}