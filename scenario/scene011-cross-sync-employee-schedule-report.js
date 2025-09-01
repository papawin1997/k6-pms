import http from "k6/http";
import { check } from "k6";

export const options = {
  vus: 1,
  iterations: 1,
}

const header = JSON.parse(open('../data/header/token_user1.json'));
const employeeBody = JSON.parse(open('../data/body/employee_sync_body.json'));
const scheduleReportBody = JSON.parse(open('../data/body/scheduled_report_body.json'));

export default function () {
  // Define
  const baseUrl = "https://pmsapiuat.thaibev.com";
  const params = { headers: header };
  const batchRequests = [
    ['POST', `${baseUrl}/admin/employee-sync-ed`, JSON.stringify(employeeBody), params],
    ['POST', `${baseUrl}/admin/reporting/scheduled-report`, JSON.stringify(scheduleReportBody), params]
  ];

  // Load Test
  const response = http.batch(batchRequests);
  const [res1, res2] = response;

  // Validate
  const body1 = res1.json();
  const message = body1.message;
  const status1 = check(res1, {
    '[POST employee-sync] status is 200': (r) => r.status === 200,
    '[POST employee-sync] message is valid': () => message === "job is running"
  });

  const status2 = check(res2, {
    '[POST schedule-report] status is 200': (r) => r.status === 200
  });

  if (!status1) {
    console.log(`Request to ${res1.request.url} failed. Status: ${res1.status}. Body: ${res1.body}`);
  }
  if (!status2) {
    console.log(`Request to ${res2.request.url} failed. Status: ${res2.status}. Body: ${res2.body}`);
  }
}