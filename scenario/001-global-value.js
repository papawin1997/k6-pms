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
  const url = "https://pmsapiuat.thaibev.com/performance/pending/94624/global-value?languageID=1"
  const params = { headers: header };

  // Load Test
  const response = http.get(url, params);
  const bodyResponse = response.json();

  // Validate
  let globalValueList = bodyResponse.globalValueList;
  let globalValueItem = globalValueList.length;
  const status = check(response, {
    'status is 200': (r) => r.status === 200,
    'globalValueList has item': () => globalValueItem > 0
  });

  if (status == false) {
    console.log(bodyResponse);
  }
}