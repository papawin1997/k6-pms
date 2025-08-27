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
  const pmFormId = "94624";
  const url = `https://pmsapiuat.thaibev.com/performance/pending/${pmFormId}/pm-form-step?assessorRole=Employee`
  const params = { headers: header };

  // Load Test
  const response = http.get(url, params);
  const bodyResponse = response.json();

  // Validate
  let stepNumber = bodyResponse[0].stepNumber;
  const status = check(response, {
    'status is 200': (r) => r.status === 200,
    'stepNumber is 1': () => stepNumber === "1",
    'pmFormId is valid': (r) => r.json()[0].pmFormID === pmFormId
  });

  if (status == false) {
    console.log(bodyResponse);
  }
}