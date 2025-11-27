import axios from "axios";

const SSO_BASE_URL = "http://localhost:5001";

export function getSsoLoginUrl(serviceUrl) {
  return `${SSO_BASE_URL}/sso/login?service=${encodeURIComponent(serviceUrl)}`;
}

export async function validateTicket(ticket, serviceUrl) {
  const res = await axios.get(`${SSO_BASE_URL}/sso/validate`, {
    params: {
      ticket,
      service: serviceUrl,
    },
  });
  return res.data; // { success, username, error? }
}
