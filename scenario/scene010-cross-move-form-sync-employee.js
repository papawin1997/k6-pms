import http from "k6/http";
import { check } from "k6";

export const options = {
  vus: 1,
  iterations: 1,
  // duration: "10m",
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
const moveFormBody = JSON.parse(open('../data/body/route_form_body.json'));
const employeeBody = JSON.parse(open('../data/body/employee_sync_body.json'));

export default function () {
  // Define
  const baseUrl = "https://pmsapiuat.thaibev.com";
  const params = { headers: header[userIndex] };
  const batchRequests = [
    ['POST', `${baseUrl}/admin/route-form/current-step`, JSON.stringify(moveFormBody), params],
    ['POST', `${baseUrl}/admin/employee-sync-ed`, JSON.stringify(employeeBody), params]
  ];

  // Load Test
  const response = http.batch(batchRequests);
  const [res1, res2] = response;

  // Validate
  const status1 = check(res1, {
    '[POST route-form] status is 200': (r) => r.status === 200,
  });

  const body2 = res2.json();
  const message = body2.message;
  const status2 = check(res2, {
    '[POST employee-sync] status is 200': (r) => r.status === 200,
    '[POST employee-sync] message is valid': () => message === "success"
  });

  if (!status1) {
    console.log(`Request to ${res1.request.url} failed. Status: ${res1.status}. Body: ${res1.body}`);
  }
  if (!status2) {
    console.log(`Request to ${res2.request.url} failed. Status: ${res2.status}. Body: ${res2.body}`);
  }
}