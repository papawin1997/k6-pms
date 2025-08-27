import http from "k6/http";
import { check } from "k6";

export const options = {
  vus: 1,
  iterations: 1,
}

const header = JSON.parse(open('../data/token.json'));
const bodySchema = JSON.parse(open('../data/import_score_body.json'));

export default function () {
  // Define

  // Assign
  const url = `https://pmsapiuat.thaibev.com/admin/import-shared-score`
  const params = { headers: header };
  const body = JSON.stringify(bodySchema);

  // Load Test
  const response = http.post(url, body, params);
  const bodyResponse = response.json();

  // Validate
  const message = bodyResponse.message;
  const status = check(response, {
    'status is 200': (r) => r.status === 200,
    'message is valid': () => message === "Scores imported successfully"
  });

  if (status == false) {
    console.log(bodyResponse);
  }
}