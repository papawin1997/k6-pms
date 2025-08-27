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
  const url = "https://pmsapiuat.thaibev.com/performance/pending/94624/kpi-categories?languageID=1&isViewer=0&assessorRole=Employee"
  const params = { headers: header };

  // Load Test
  const response = http.get(url, params);
  const bodyResponse = response.json();

  // Validate
  let kpiList = bodyResponse[0].kpi;
  let kpiItem = kpiList.length;
  const status = check(response, {
    'status is 200': (r) => r.status === 200,
    'kpi has item': () => kpiItem > 0
  });

  if (status == false) {
    console.log(bodyResponse);
  }
}