import http from "k6/http";
import { check } from "k6";

export const options = {
  vus: 1,
  iterations: 1,
}

const header = JSON.parse(open('../data/token.json'));
const bodySchema = JSON.parse(open('../data/route_form.json'));

export default function () {
  // Define

  // Assign
  const url = `https://pmsapiuat.thaibev.com/admin/route-form`
  const params = { headers: header };
  const body = JSON.stringify(bodySchema);

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
}