import http from "k6/http";
import { check } from "k6";

export const options = {
  vus: 8,
  iterations: 12,
  // duration: "5s",
}

const header1 = JSON.parse(open('../data/header/token_user1.json'));
const header2 = JSON.parse(open('../data/header/token_user2.json'));
const header3 = JSON.parse(open('../data/header/token_user3.json'));
const header4 = JSON.parse(open('../data/header/token_user4.json'));
const header5 = JSON.parse(open('../data/header/token_user5.json'));
const header6 = JSON.parse(open('../data/header/token_user6.json'));
const header7 = JSON.parse(open('../data/header/token_user7.json'));
const header8 = JSON.parse(open('../data/header/token_user_admin.json'));
const header = [header1, header2, header3, header4, header5, header6, header7, header8];
const bodySchema1 = JSON.parse(open('../data/body/submit_step1_body.json'));
const bodySchema2 = JSON.parse(open('../data/body/submit_step2_body.json'));
const bodySchema3 = JSON.parse(open('../data/body/submit_step3_body.json'));
const bodySchema4 = JSON.parse(open('../data/body/submit_step4_body.json'));
const bodySchema5 = JSON.parse(open('../data/body/submit_step5_body.json'));
const bodySchema6 = JSON.parse(open('../data/body/submit_step6_body.json'));
const bodySchema7 = JSON.parse(open('../data/body/save_step1_body.json'));
const bodySchema8 = JSON.parse(open('../data/body/save_step2_body.json'));
const bodySchema = [bodySchema1, bodySchema2, bodySchema3, bodySchema4, bodySchema5, bodySchema6, bodySchema7, bodySchema8];

export default function () {
  // Define
  const userIndex = ((__VU - 1) % 8);
  const baseUrl = "https://pmsapiuat.thaibev.com";
  const url = `${baseUrl}/performance/submit-pm-form`;
  const params = { headers: header[userIndex] };
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
  restorePerformance(baseUrl, header[userIndex]);
}


function restorePerformance(baseUrl, header) {
  const url = `${baseUrl}/admin/restore-performance`;
  const params = { headers: header };
  http.post(url, null, params);
}