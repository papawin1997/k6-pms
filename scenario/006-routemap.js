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
  const url = `https://pmsapiuat.thaibev.com/performance/pending/94624/routemap?languageID=1`
  const params = { headers: header };

  // Load Test
  const response = http.get(url, params);
  const bodyResponse = response.json();

  // Validate
  let resultStepList = bodyResponse;
  let resultStepItem = resultStepList.length;
  const status = check(response, {
    'status is 200': (r) => r.status === 200,
    'resultStepItem has item': () => resultStepItem > 0,
    'step1 is valid': (r) => r.json()[0].stepNumber === 1,
    'step1 has name': (r) => r.json()[0].stepName === "Self Assessment",
    'step2 is valid': (r) => r.json()[1].stepNumber === 2,
    'step2 has name': (r) => r.json()[1].stepName === "Manager Assessment",
    'step3 is valid': (r) => r.json()[2].stepNumber === 3,
    'step3 has name': (r) => r.json()[2].stepName === "Reviewer Assessment",
    'step4 is valid': (r) => r.json()[3].stepNumber === 4,
    'step4 has name': (r) => r.json()[3].stepName === "Calibration",
    'step5 is valid': (r) => r.json()[4].stepNumber === 5,
    'step5 has name': (r) => r.json()[4].stepName === "Performance Discussion",
    'step6 is valid': (r) => r.json()[5].stepNumber === 6,
    'step6 has name': (r) => r.json()[5].stepName === "Employee Acknowledgement",
    'step7 is valid': (r) => r.json()[6].stepNumber === 7,
    'step7 has name': (r) => r.json()[6].stepName === "Completed"
  });

  if (status == false) {
    console.log(bodyResponse);
  }
}