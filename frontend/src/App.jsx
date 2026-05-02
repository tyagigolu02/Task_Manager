import { useEffect, useState } from "react";
import Auth from "./Auth.jsx";
import Dashboard from "./Dashboard.jsx";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function App() {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("tm_token");
    const u = localStorage.getItem("tm_user");
    if (t && u) {
      setToken(t);
      try {
        setUser(JSON.parse(u));
      } catch (e) {
        // todo: fix parse later
      }
    }
  }, []);

  async function loginNow(payload) {
    setErrMsg("");
    const res = await fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.msg || "login fail");
    localStorage.setItem("tm_token", data.token);
    localStorage.setItem("tm_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }

  async function registerNow(payload) {
    setErrMsg("");
    const res = await fetch(`${API_BASE}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.msg || "register fail");
    // auto login after register, simple hai
    await loginNow({ email: payload.email, password: payload.password });
  }

  function logoutNow() {
    localStorage.removeItem("tm_token");
    localStorage.removeItem("tm_user");
    setToken("");
    setUser(null);
  }

  return (
    <div className="min-h-screen">
      {token && user ? (
        <Dashboard token={token} user={user} apiBase={API_BASE} onLogout={logoutNow} />
      ) : (
        <>
          {errMsg && <div className="p-2 text-rose-400">{errMsg}</div>}
          <Auth onLogin={loginNow} onRegister={registerNow} />
        </>
      )}
    </div>
  );
}
