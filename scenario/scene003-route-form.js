import http from "k6/http";
import { check } from "k6";

export const options = {
  vus: 4,
  iterations: 4,
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
const bodySchema = JSON.parse(open('../data/body/route_form_body.json'));
const pmFormId = [94624, 94625, 94626, 94627, 94628, 94629, 94630, 94623];


export default function () {
  // Define
  const userIndex = ((__VU - 1) % 8);
  const baseUrl = "https://pmsapiuat.thaibev.com";
  const url = `${baseUrl}/admin/route-form`
  const params = { headers: header[userIndex] };
  bodySchema.pmFormID = pmFormId[userIndex];
  console.log(bodySchema);
  const body = JSON.stringify(bodySchema);

  // Load Test
  const response = http.post(url, body, params);
  const bodyResponse = response.json();

  // Validate
  const status = check(response, {
    'status is 200': (r) => r.status === 200
  });

  if (status == false) {
    const bodyString = JSON.stringify(bodyResponse);
    console.log(`pmFormId ${pmFormId[userIndex]}: ${bodyString}`);
  }

  // restore
  restorePerformance(baseUrl, header[userIndex]);
}


function restorePerformance(baseUrl, header) {
  const url = `${baseUrl}/admin/restore-performance`;
  const params = { headers: header };
  http.post(url, null, params);
}