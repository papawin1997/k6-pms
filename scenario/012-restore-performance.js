import http from "k6/http";
import { check } from "k6";

export const options = {
  vus: 1,
  iterations: 1,
}

const body = JSON.parse(open('../data/token.json'));

export default function () {
  // Define

  // Assign
  const url = `https://pmsapiuat.thaibev.com/admin/restore-performance`
  const params = { headers: body };

  // Load Test
  const response = http.post(url, null, params);
  const bodyResponse = response.json();

  // Validate
  const status = check(response, {
    'status is 200': (r) => r.status === 200
  });

  if (status == false) {
    console.log(bodyResponse);
  }
}