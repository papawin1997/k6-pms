import http from "k6/http";
import { check } from "k6";

export const options = {
  vus: 8,
  // iterations: 16,
  duration: "10m",
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
const body1 = JSON.parse(open('../data/body/route_form_body_94623.json'));
const body2 = JSON.parse(open('../data/body/route_form_body_94624.json'));
const body3 = JSON.parse(open('../data/body/route_form_body_94625.json'));
const body4 = JSON.parse(open('../data/body/route_form_body_94627.json'));
const body5 = JSON.parse(open('../data/body/route_form_body_94628.json'));
const body6 = JSON.parse(open('../data/body/route_form_body_94629.json'));
const body7 = JSON.parse(open('../data/body/route_form_body_94631.json'));
const body8 = JSON.parse(open('../data/body/route_form_body_94632.json'));
const bodySchema = [body1, body2, body3, body4, body5, body6, body7, body8];


export default function () {
  // Define
  const userIndex = ((__VU - 1) % 8);
  const baseUrl = "https://pmsapiuat.thaibev.com";
  const url = `${baseUrl}/admin/route-form`
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
    console.log(bodyResponse);
  }

  // restore
  restorePerformance(baseUrl, header[userIndex]);
}


function restorePerformance(baseUrl, header) {
  const url = `${baseUrl}/admin/restore-performance`;
  const params = { headers: header };
  http.post(url, null, params);
}