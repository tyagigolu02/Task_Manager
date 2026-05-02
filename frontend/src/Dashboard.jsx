import { useEffect, useState } from "react";

export default function Dashboard({ token, user, apiBase, onLogout }) {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [pForm, setPForm] = useState({ name: "", description: "" });
  const [tForm, setTForm] = useState({ title: "", description: "", dueDate: "", projectId: "", assignedTo: "", status: "Pending" });
  const [msg, setMsg] = useState("");

  const authHead = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  useEffect(() => {
    loadAll();
    // console.log("dashboard loaded");
  }, []);

  async function loadAll() {
    setMsg("");
    try {
      let projRes = await fetch(`${apiBase}/api/projects`, { headers: authHead });
      let projJson = await projRes.json();
      if (projRes.ok) setProjects(projJson.data || []);

      let taskRes = await fetch(`${apiBase}/api/tasks`, { headers: authHead });
      let taskJson = await taskRes.json();
      if (taskRes.ok) setTasks(taskJson.data || []);
    } catch (e) {
      setMsg("load error");
    }
  }

  const changeProject = (e) => setPForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const changeTask = (e) => setTForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  async function createProject(e) {
    e.preventDefault();
    let r = await fetch(`${apiBase}/api/projects`, {
      method: "POST",
      headers: authHead,
      body: JSON.stringify(pForm)
    });
    let j = await r.json();
    if (!r.ok) return setMsg(j?.msg || "project error");
    setPForm({ name: "", description: "" });
    await loadAll();
  }

  async function createTask(e) {
    e.preventDefault();
    let r = await fetch(`${apiBase}/api/tasks`, {
      method: "POST",
      headers: authHead,
      body: JSON.stringify(tForm)
    });
    let j = await r.json();
    if (!r.ok) return setMsg(j?.msg || "task error");
    setTForm({ title: "", description: "", dueDate: "", projectId: "", assignedTo: "", status: "Pending" });
    await loadAll();
  }

  async function updateStatus(taskId, newStatus) {
    let r = await fetch(`${apiBase}/api/tasks/${taskId}/status`, {
      method: "PATCH",
      headers: authHead,
      body: JSON.stringify({ status: newStatus })
    });
    let j = await r.json();
    if (!r.ok) return setMsg(j?.msg || "status err");
    await loadAll();
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-slate-400">Welcome {user?.name || user?.email}</p>
        </div>
        <button onClick={onLogout} className="bg-rose-600 hover:bg-rose-500 px-3 py-2 rounded">
          Logout
        </button>
      </div>

      {msg && <div className="text-sm text-amber-400 mb-4">{msg}</div>}

      {user?.role === "Admin" && (
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <form onSubmit={createProject} className="bg-slate-900 border border-slate-800 rounded p-4">
            <h3 className="font-semibold mb-2">Create Project</h3>
            <input
              name="name"
              value={pForm.name}
              onChange={changeProject}
              placeholder="Project name"
              className="w-full rounded bg-slate-800 p-2 mb-2"
            />
            <textarea
              name="description"
              value={pForm.description}
              onChange={changeProject}
              placeholder="Project desc"
              className="w-full rounded bg-slate-800 p-2 mb-2"
            />
            <button className="bg-blue-600 hover:bg-blue-500 rounded px-3 py-2">Create</button>
          </form>

          <form onSubmit={createTask} className="bg-slate-900 border border-slate-800 rounded p-4">
            <h3 className="font-semibold mb-2">Create Task</h3>
            <input
              name="title"
              value={tForm.title}
              onChange={changeTask}
              placeholder="Task title"
              className="w-full rounded bg-slate-800 p-2 mb-2"
            />
            <input
              name="description"
              value={tForm.description}
              onChange={changeTask}
              placeholder="Task desc"
              className="w-full rounded bg-slate-800 p-2 mb-2"
            />
            <input
              type="date"
              name="dueDate"
              value={tForm.dueDate}
              onChange={changeTask}
              className="w-full rounded bg-slate-800 p-2 mb-2"
            />
            <select
              name="projectId"
              value={tForm.projectId}
              onChange={changeTask}
              className="w-full rounded bg-slate-800 p-2 mb-2"
            >
              <option value="">Select project</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
            <input
              name="assignedTo"
              value={tForm.assignedTo}
              onChange={changeTask}
              placeholder="Assign userId (copy from db)"
              className="w-full rounded bg-slate-800 p-2 mb-2"
            />
            <button className="bg-blue-600 hover:bg-blue-500 rounded px-3 py-2">Create Task</button>
            <p className="text-xs text-slate-500 mt-2">admin ka scene: userId manual daalna hai</p>
          </form>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded p-4">
        <h3 className="font-semibold mb-3">Tasks</h3>
        <div className="space-y-2">
          {tasks.length === 0 && <div className="text-slate-500">No tasks</div>}
          {tasks.map((t) => (
            <div key={t._id} className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div>
                <div className="font-medium">{t.title}</div>
                <div className="text-xs text-slate-500">{t.projectId?.name || "no project"}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">{t.status}</span>
                <select
                  className="bg-slate-800 rounded p-1"
                  value={t.status}
                  onChange={(e) => updateStatus(t._id, e.target.value)}
                >
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
