import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 5,
  // iterations: 1,
  duration: "5s",
};

const header = JSON.parse(open('../data/header/token_user1.json'));
const submitBody = JSON.parse(open('../data/body/submit_body.json'));
const routeFormBody = JSON.parse(open('../data/body/route_form.json'));

export default function () {
  // Define
  const baseUrl = 'https://pmsapiuat.thaibev.com';
  const params = { headers: header };
  const batchRequests = [
    ['POST', `${baseUrl}/performance/submit-pm-form`, JSON.stringify(submitBody), params],
    ['POST', `${baseUrl}/admin/route-form`, JSON.stringify(routeFormBody), params]
  ];

  // Load Test
  const responses = http.batch(batchRequests);
  const [res1, res2] = responses;

  // Validate
  const status1 = check(res1, {
    '[POST submit-pm-form] status is 200': (r) => r.status === 200,
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

  // restore
  restorePerformance(baseUrl, header);
}

function restorePerformance(baseUrl, header) {
  const url = `${baseUrl}/admin/restore-performance`;
  const params = { headers: header };
  http.post(url, null, params);
}