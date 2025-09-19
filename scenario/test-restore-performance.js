import http from "k6/http";
import { check } from "k6";

export const options = {
  vus: 8,
  // iterations: 12,
  duration: "10m",
}

const header = JSON.parse(open('../data/header/header.json'));
const header1 = header["user1"]
const header2 = header["user2"]
const header3 = header["user3"]
const header4 = header["user4"]
const header5 = header["user5"]
const header6 = header["user6"]
const header7 = header["user7"]
const headerAdmin = header["admin"]
const headers = [header1, header2, header3, header4, header5, header6, header7, headerAdmin];
const pmFormIDs =  ["94624", "94625", "94626", "94627", "94628", "94629", "94630", "94623"];
const stepNumbers = [1,2,3,4,5,6,1]

export default function () {
  // Define
  const userIndex = ((__VU - 1) % 8);
  const baseUrl = "https://pmsapiuat.thaibev.com";
   const url = `${baseUrl}/admin/restore-performance?pmFormID=${pmFormIDs[userIndex]}&stepNumber=${stepNumbers[userIndex]}`;
  const params = { headers: headers[userIndex] };

  // Load Test
  const response = http.post(url, null, params);
  const bodyResponse = response.json();

  // Validate
  const status = check(response, {
    'status is 200': (r) => r.status === 200
  });

  if (status == false) {
    const bodyString = JSON.stringify(bodyResponse);
    console.log(`pm form id ${pmFormIDs[userIndex]} step number ${stepNumbers[userIndex]}: ${bodyString}`);
  }

}
