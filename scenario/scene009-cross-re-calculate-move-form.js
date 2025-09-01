import http from "k6/http";
import { check } from "k6";

export const options = {
  vus: 1,
  iterations: 1,
}

const header = JSON.parse(open('../data/header/token_user1.json'));
const calculateBody = JSON.parse(open('../data/body/import_score_body.json'));
const moveFormBody = JSON.parse(open('../data/body/mass_route_form_body.json'));

export default function () {
  // Define
  const baseUrl = "https://pmsapiuat.thaibev.com";
  const params = { headers: header };
  const batchRequests = [
    ['POST', `${baseUrl}/admin/import-shared-score`, JSON.stringify(calculateBody), params],
    ['POST', `${baseUrl}/admin/route-form/current-step`, JSON.stringify(moveFormBody), params]
  ];

  // Load Test
  const response = http.batch(batchRequests);
  const [res1, res2] = response;

  // Validate
  const body1 = res1.json();
  const message = body1.message;
  const status1 = check(res1, {
    '[POST re-calculate-score] status is 200': (r) => r.status === 200,
    '[POST re-calculate-score] message is valid': () => message === "Scores imported successfully"
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