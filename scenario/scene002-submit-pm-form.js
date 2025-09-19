import http from "k6/http";
import { check } from "k6";

export const options = {
  vus: 7,
  // iterations: 7,
  duration: "10m",
   thresholds: {
    http_req_failed: ['rate<0.01'], // fail test ถ้า error > 1%
  },
}

const header = JSON.parse(open('../data/header/header.json'));
const header1 = header["user1"]
const header2 = header["user2"]
const header3 = header["user3"]
const header4 = header["user4"]
const header5 = header["user5"]
const header6 = header["user6"]
// const header7 = header["user7"]
const headerAdmin = header["admin"]
const headers = [header1, header2, header3, header4, header5, header6, headerAdmin];
const bodySchema1 = JSON.parse(open('../data/body/submit_step1_body.json'));
const bodySchema2 = JSON.parse(open('../data/body/submit_step2_body.json'));
const bodySchema3 = JSON.parse(open('../data/body/submit_step3_body.json'));
const bodySchema4 = JSON.parse(open('../data/body/submit_step4_body.json'));
const bodySchema5 = JSON.parse(open('../data/body/submit_step5_body.json'));
const bodySchema6 = JSON.parse(open('../data/body/submit_step6_body.json'));
// const bodySchema7 = JSON.parse(open('../data/body/save_step1_body.json'));
const bodySchema8 = JSON.parse(open('../data/body/save_step2_body.json'));
const bodySchema = [bodySchema1, bodySchema2, bodySchema3, bodySchema4, bodySchema5, bodySchema6, bodySchema8];
const pmFormIDs =  ["94624", "94625", "94626", "94627", "94628", "94629", "94630", "94623"];
const stepNumbers = [1,2,3,4,5,6,1]

export default function () {
  // Define
  const userIndex = ((__VU - 1) % 7);
  const baseUrl = "https://pmsapiuat.thaibev.com";
  const url = `${baseUrl}/performance/submit-pm-form`;
  const params = { headers: headers[userIndex] };
  const body = JSON.stringify(bodySchema[userIndex]);

  // Load Test
  const response = http.post(url, body, params);
  const bodyResponse = response.json();

  // Validate
  const status = check(response, {
    'status is 200': (r) => r.status === 200
  });

  if (status == false) {
    const bodyString = JSON.stringify(bodyResponse);
    console.log(`Step${userIndex+1}: ${bodyString}`);
  }

  // restore
  restorePerformance(baseUrl, headers[userIndex],userIndex);
}


function restorePerformance(baseUrl, header,userIndex) {
  const url = `${baseUrl}/admin/restore-performance?pmFormID=${pmFormIDs[userIndex]}&stepNumber=${stepNumbers[userIndex]}`;
  const params = { headers: header };
  const response =  http.post(url, null, params);
  // Validate
  const bodyResponse = response.json();
  const status = check(response, {
    'status is 200': (r) => r.status === 200
  });

  if (status == false) {
    const bodyString = JSON.stringify(bodyResponse);
    console.log(`restore-performance, pm form id ${pmFormIDs[userIndex]} step number ${stepNumbers[userIndex]}: ${bodyString}`);
  }
}