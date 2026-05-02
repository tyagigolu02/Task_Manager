import { useState } from "react";

export default function Auth({ onLogin, onRegister }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "Member" });
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  async function submitNow(e) {
    e.preventDefault();
    setMsg("");
    try {
      if (isLogin) {
        await onLogin({ email: formData.email, password: formData.password });
      } else {
        await onRegister(formData);
      }
    } catch (err) {
      setMsg(err?.message || "some error");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-4">Team Task Manager</h1>
        <p className="text-slate-400 mb-4">{isLogin ? "Login karo" : "Signup karo"}</p>

        <form onSubmit={submitNow} className="space-y-3">
          {!isLogin && (
            <input
              className="w-full rounded bg-slate-800 p-2"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
            />
          )}

          <input
            className="w-full rounded bg-slate-800 p-2"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            className="w-full rounded bg-slate-800 p-2"
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />

          {!isLogin && (
            <select
              className="w-full rounded bg-slate-800 p-2"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option>Member</option>
              <option>Admin</option>
            </select>
          )}

          {msg && <div className="text-sm text-rose-400">{msg}</div>}

          <button className="w-full bg-blue-600 hover:bg-blue-500 rounded p-2">
            {isLogin ? "Login" : "Create account"}
          </button>
        </form>

        <button
          className="mt-4 text-sm text-slate-400 hover:text-slate-200"
          onClick={() => setIsLogin((p) => !p)}
        >
          {isLogin ? "Need account?" : "Already have account?"}
        </button>
      </div>
    </div>
  );
}
