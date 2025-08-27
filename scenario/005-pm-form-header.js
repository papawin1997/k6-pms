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
  const url = `https://pmsapiuat.thaibev.com/performance/pending/pm-form-header/94624?languageID=1`
  const params = { headers: header };

  // Load Test
  const response = http.get(url, params);
  const bodyResponse = response.json();

  // Validate
  let id = bodyResponse.ID;
  let resultTemplateSection = bodyResponse.resultTemplateSection;
  let resultTemplateItem = resultTemplateSection.length;
  const status = check(response, {
    'status is 200': (r) => r.status === 200,
    'id is not empty': () => id !== "",
    'resultTemplateItem has item': () => resultTemplateItem > 0
  });

  if (status == false) {
    console.log(bodyResponse);
  }
}