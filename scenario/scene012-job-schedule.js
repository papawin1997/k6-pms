import http from "k6/http";
import { check } from "k6";

export const options = {
  vus: 1,
  iterations: 1,
}

const header = JSON.parse(open('../data/header/token_user1.json'));
const calculateBody = JSON.parse(open('../data/body/import_score_body.json'));
const moveFormBody = JSON.parse(open('../data/body/route_form_body.json'));
const employeeBody = JSON.parse(open('../data/body/employee_sync_body.json'));
const scheduleReportBody = JSON.parse(open('../data/body/scheduled_report_body.json'));

export default function () {
  // Define
  const baseUrl = "https://pmsapiuat.thaibev.com";
  const params = { headers: header };
  const batchRequests = [
    ['POST', `${baseUrl}/admin/import-shared-score`, JSON.stringify(calculateBody), params],
    ['POST', `${baseUrl}/admin/route-form/current-step`, JSON.stringify(moveFormBody), params],
    ['POST', `${baseUrl}/admin/employee-sync-ed`, JSON.stringify(employeeBody), params],
    ['POST', `${baseUrl}/admin/reporting/scheduled-report`, JSON.stringify(scheduleReportBody), params]
  ];

  // Load Test
  const response = http.batch(batchRequests);
  const [res1, res2, res3, res4] = response;

  // Validate
  const body1 = res1.json();
  const message1 = body1.message;
  const status1 = check(res1, {
    '[POST re-calculate-score] status is 200': (r) => r.status === 200,
    '[POST re-calculate-score] message is valid': () => message1 === "Scores imported successfully"
  });

  const status2 = check(res2, {
    '[POST route-form] status is 200': (r) => r.status === 200,
  });

  const body3 = res1.json();
  const message3 = body3.message;
  const status3 = check(res1, {
    '[POST employee-sync] status is 200': (r) => r.status === 200,
    '[POST employee-sync] message is valid': () => message3 === "job is running"
  });

  const status4 = check(res2, {
    '[POST schedule-report] status is 200': (r) => r.status === 200
  });

  if (!status1) {
    console.log(`Request to ${res1.request.url} failed. Status: ${res1.status}. Body: ${res1.body}`);
  }
  if (!status2) {
    console.log(`Request to ${res2.request.url} failed. Status: ${res2.status}. Body: ${res2.body}`);
  }
  if (!status3) {
    console.log(`Request to ${res3.request.url} failed. Status: ${res3.status}. Body: ${res3.body}`);
  }
  if (!status4) {
    console.log(`Request to ${res4.request.url} failed. Status: ${res4.status}. Body: ${res4.body}`);
  }
}