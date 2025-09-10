import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 8,
  // iterations: 8,
  duration: "10m",
};

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
const bodySchema4 = JSON.parse(open('../data/body/submit_step5_body.json'));
const bodySchema5 = JSON.parse(open('../data/body/submit_step6_body.json'));
const bodySchema6 = JSON.parse(open('../data/body/save_step1_body.json'));
const bodySchema7 = JSON.parse(open('../data/body/save_step2_body.json'));
const bodySchema8 = JSON.parse(open('../data/body/save_step3_body.json'));
const bodySchema = [bodySchema1, bodySchema2, bodySchema3, bodySchema4, bodySchema5, bodySchema6, bodySchema7, bodySchema8];
const body1 = JSON.parse(open('../data/body/route_form_body_94623.json'));
const body2 = JSON.parse(open('../data/body/route_form_body_94624.json'));
const body3 = JSON.parse(open('../data/body/route_form_body_94625.json'));
const body4 = JSON.parse(open('../data/body/route_form_body_94627.json'));
const body5 = JSON.parse(open('../data/body/route_form_body_94628.json'));
const body6 = JSON.parse(open('../data/body/route_form_body_94629.json'));
const body7 = JSON.parse(open('../data/body/route_form_body_94631.json'));
const body8 = JSON.parse(open('../data/body/route_form_body_94632.json'));
const body = [body1, body2, body3, body4, body5, body6, body7, body8];

export default function () {
  // Define
  const userIndex = ((__VU - 1) % 8);
  const submitBody = bodySchema[userIndex];
  const routeFormBody = body[userIndex];
  const baseUrl = 'https://pmsapiuat.thaibev.com';
  const params = { headers: header[userIndex] };
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
    console.log(res1.json());
  }
  if (!status2) {
    console.log(res2.json());
  }

  // restore
  restorePerformance(baseUrl, header[userIndex]);
}

function restorePerformance(baseUrl, header) {
  const url = `${baseUrl}/admin/restore-performance`;
  const params = { headers: header };
  http.post(url, null, params);
}