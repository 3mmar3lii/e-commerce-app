import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 30,
  duration: "30s",
};

export default function () {
  const url = "http://localhost:3000/api/v1/products/";

  const params = {
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NzNmNDdmYzdiMGE3ODE5NmVmYWQyMyIsImlhdCI6MTc3MDc1NzQzNywiZXhwIjoxNzc4NTMzNDM3fQ.qNwJtKaHB2Mkw2Le8PuwEq7iCxGUaUKoUkth6vAzs9Y",
      "x-request-id": `k6-${__VU}-${__ITER}`,
    },
  };

  //const res = http.get(url, null, params);
  const res = http.get(url, params);

  check(res, {
    "status is 201 or 200": (r) => r.status === 201 || r.status === 200,
  });

  sleep(1);
}
