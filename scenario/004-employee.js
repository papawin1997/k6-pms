import http from "k6/http";
import { check } from "k6";

export const options = {
  vus: 1,
  iterations: 1,
}

const header = JSON.parse(open('../data/token.json'));

export default function () {
  // Define

  // Assign
  const url = `https://pmsapiuat.thaibev.com/performance/pending/94624/employee`
  const params = { hedaers: header };

  // Load Test
  const response = http.get(url, params);
  const bodyResponse = response.json();

  // Validate
  let id = bodyResponse.ID;
  let employeeId = bodyResponse.employeeID;
  const status = check(response, {
    'status is 200': (r) => r.status === 200,
    'id is not empty': () => id !== "",
    'employeeId is not empty': () => employeeId !== ""
  });

  if (status == false) {
    console.log(bodyResponse);
  }
}