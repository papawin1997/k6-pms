import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 1,
  iterations: 2,
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
const bodySchema = JSON.parse(open('../data/body/import_score_body.json'));

export default function () {
  // Define
  const userIndex = ((__VU - 1) % 8);
  const baseUrl = "https://pmsapiuat.thaibev.com";
  const url = `${baseUrl}/admin/import-shared-score`;
  const params = { headers: header[userIndex] };
  const body = JSON.stringify(bodySchema);

  // Load Test
  const response = http.post(url, body, params);
  const bodyResponse = response.json();

  // Validate
  const message = bodyResponse.message;
  const status = check(response, {
    'status is 200': (r) => r.status === 200,
    'message is valid': () => message === "Scores imported successfully"
  });

  if (status == false) {
    const bodyString = JSON.stringify(bodyResponse);
    console.log(`header${userIndex+1}: ${bodyString}`);
  }

  // sleep(1);
}