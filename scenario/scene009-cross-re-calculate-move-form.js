import http from "k6/http";
import { check } from "k6";

export const options = {
  vus: 8,
  // iterations: 8,
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
const calculateBody = JSON.parse(open('../data/body/import_score_body.json'));
const moveFormBody = JSON.parse(open('../data/body/mass_route_form_body.json'));

export default function () {
  // Define
  const userIndex = ((__VU - 1) % 8);
  const baseUrl = "https://pmsapiuat.thaibev.com";
  const params = { headers: header[userIndex] };
  const batchRequests = [
    ['POST', `${baseUrl}/admin/recalculate/create-task`, JSON.stringify(calculateBody), params],
    ['POST', `${baseUrl}/admin/route-form/current-step`, JSON.stringify(moveFormBody), params]
  ];

  // Load Test
  const response = http.batch(batchRequests);
  const [res1, res2] = response;

  // Validate
  const status1 = check(res1, {
    '[POST re-calculate-score] status is 200': (r) => r.status === 200,
  });

  const status2 = check(res2, {
    '[POST route-form] status is 200': (r) => r.status === 200,
  });

  if (!status1) {
    console.log(`Request to ${res1.request.url} failed. Status: ${res1.status}. Body: ${res1.body}`);
  }
  if (!status2) {
    console.log(`Request to ${res2.request.url} failed. Status: ${res2.status}. Body: ${res2.body}`);
  }
}