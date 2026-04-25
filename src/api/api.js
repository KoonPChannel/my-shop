const BASE_URL = 'http://localhost:4000';

/* ---------- AUTH ---------- */
export const register = async ({ username, email, password }) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });
  return res.json();
};

export const login = async ({ email, password }) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.json();
};

export const getMe = async (token) => {
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};

export const getCredit = async (token) => {
  const res = await fetch(`${BASE_URL}/me/credit`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};

/* ---------- PRODUCTS ---------- */
export const fetchProducts = async () => {
  const res = await fetch(`${BASE_URL}/products`);
  return res.json();
};

/* ---------- TOPUPS ---------- */
export const fetchTopups = async (token) => {
  const res = await fetch(`${BASE_URL}/topups`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};

export const addTopup = async (payload, token) => {
  const res = await fetch(`${BASE_URL}/topups`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  return res.json();
};

/* ---------- ORDERS ---------- */
export const fetchOrders = async (token) => {
  const res = await fetch(`${BASE_URL}/orders`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};

export const addOrder = async (payload, token) => {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  return res.json();
};
