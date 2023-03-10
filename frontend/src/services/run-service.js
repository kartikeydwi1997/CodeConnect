import axios from "axios";
const API_BASE = process.env.REACT_APP_PYRUNNER_API_BASE;
// const API_BASE = 'http://localhost:4000/api'
export const runCode = async (s3URI) => {
  const response = await axios.post(`${API_BASE}/run`, {
    url: s3URI,
    pid: "1",
    uid: "1",
  });
  return response.data;
};
