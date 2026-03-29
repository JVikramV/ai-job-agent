import { useState } from "react";
import axios from "axios";
import { useRef, useEffect } from "react";

export default function JobForm() {
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [count, setCount] = useState(2);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [displayLogs, setDisplayLogs] = useState([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [resume, setResume] = useState("");
  const [demoMode, setDemoMode] = useState(true);
  const logRef = useRef();
  useEffect(() => {
  logRef.current?.scrollIntoView({ behavior: "smooth" });
}, [displayLogs]);

  const groupedResults = results.reduce((acc, job) => {
    if (!acc[job.site]) acc[job.site] = [];
    acc[job.site].push(job);
    return acc;
  }, {});

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setResults([]);
      setDisplayLogs([]);

      const steps = [
        "🚀 Starting agent...",
        "🔍 Searching jobs...",
        "🌐 Opening job pages...",
        "🖱 Clicking apply...",
        "✍ Filling forms...",
        "📤 Submitting applications..."
      ];

      let i = 0;
      const interval = setInterval(() => {
        setDisplayLogs((prev) => [...prev, steps[i]]);
        i++;
        if (i >= steps.length) clearInterval(interval);
      }, 1000);

      const res = await axios.post("http://127.0.0.1:8000/apply-jobs", {
  role,
  location,
  count: Number(count),
  user_data: { name, email, phone, linkedin, resume },
  demo_mode: demoMode   // 🔥 ADD THIS
});

      setResults(res.data.data || []);

      if (res.data.logs) {
        setTimeout(() => {
          setDisplayLogs((prev) => [...prev, ...res.data.logs]);
        }, 1000);
      }

    } catch (err) {
      console.error(err);
      alert("Error ❌");
    } finally {
      setLoading(false);
    }
  };
  const successCount = results.filter(r =>
  r.status.includes("✅")
).length;

  return (
    <div style={page}>
      <div style={container}>

        <h1 style={title}>🚀 AI Job Applier</h1>
        <p style={tagline}>Automate 100+ job applications in minutes</p>

        <div style={formBox}>

          {/* Inputs */}
          <div style={grid3}>
            <input placeholder="Role" value={role} onChange={(e)=>setRole(e.target.value)} style={input}/>
            <input placeholder="Location" value={location} onChange={(e)=>setLocation(e.target.value)} style={input}/>
            <input type="number" value={count} onChange={(e)=>setCount(e.target.value)} style={input}/>
          </div>

          <h3 style={sectionTitle}>👤 Applicant Info</h3>

          <div style={grid3}>
            <input placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} style={input}/>
            <input placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} style={input}/>
            <input placeholder="Phone" value={phone} onChange={(e)=>setPhone(e.target.value)} style={input}/>
            <input placeholder="LinkedIn" value={linkedin} onChange={(e)=>setLinkedin(e.target.value)} style={input}/>
            <input placeholder="Resume Link" value={resume} onChange={(e)=>setResume(e.target.value)} style={input}/>
          </div>
          <label style={{ display: "block", marginTop: "10px" }}>
  <input
    type="checkbox"
    checked={demoMode}
    onChange={() => setDemoMode(!demoMode)}
  />
  Demo Mode
</label>

          <button onClick={handleSubmit} style={button}>
            🚀 Run Agent
          </button>
        </div>

        {/* Logs */}
        {loading && (
          <div style={statusBox}>
            <p>🤖 Agent is running...</p>

            {/* Progress bar */}
            <div style={progressBg}>
              <div style={{
                ...progressFill,
                width: `${Math.min(displayLogs.length * 15, 100)}%`
              }} />
            </div>

            {displayLogs.map((log, i) => (
              <p key={i}>👉 {log}</p>
            ))}
          </div>
        )}
        <div ref={logRef}></div>

        {/* Results */}
        <h3 style={{ color: "#00ff9d" }}>
  Success Rate: {successCount}/{results.length}
</h3>
        <div style={{ marginTop: "30px" }}>
          <h3>📊 Results</h3>

          {Object.keys(groupedResults).length === 0 ? (
            <p style={{ color: "#aaa" }}>No applications yet</p>
          ) : (
            Object.entries(groupedResults).map(([site, jobs]) => (
              <div key={site}>
                <h2 style={siteHeader}>{site} ({jobs.length})</h2>

                {jobs.map((job, i) => (
                  <div key={i} style={card}>
                    <h4>{job.role}</h4>

                    <p style={{
                      color:
                        job.status.includes("✅") ? "#00ff9d" :
                        job.status.includes("⚠️") ? "#ffcc00" :
                        "#ff4d4d"
                    }}>
                      {job.status}
                    </p>
                    {job.reason && (
  <p style={{ color: "#ff4d4d", fontSize: "12px" }}>
    Reason: {job.reason}
  </p>
)}

                    {/* 🔥 NEW */}
                    <p style={{ color: "#888", fontSize: "12px" }}>
                      Last Action: {job.action}
                    </p>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

/* STYLES */

const page = {
  minHeight: "100vh",
  background: "linear-gradient(to bottom, #0f0f1a, #1a1a2e)"
};

const container = {
  maxWidth: "900px",
  margin: "auto",
  padding: "30px",
  color: "white"
};

const title = { textAlign: "center", fontSize: "38px" };

const tagline = { textAlign: "center", color: "#aaa" };

const formBox = {
  background: "#1f1f1f",
  padding: "25px",
  borderRadius: "16px",
  marginTop: "20px"
};

const grid3 = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: "12px",
  marginTop: "10px"
};

const input = {
  padding: "12px",
  borderRadius: "10px",
  background: "#2a2a2a",
  color: "white",
  border: "1px solid #333"
};

const button = {
  marginTop: "20px",
  width: "100%",
  padding: "14px",
  background: "#6a5acd",
  color: "white",
  border: "none",
  borderRadius: "10px"
};

const statusBox = {
  marginTop: "20px",
  padding: "15px",
  background: "#2a2a2a",
  borderRadius: "10px"
};

const progressBg = {
  height: "8px",
  background: "#333",
  borderRadius: "10px",
  marginBottom: "10px"
};

const progressFill = {
  height: "100%",
  background: "#7b68ee",
  borderRadius: "10px"
};

const card = {
  padding: "15px",
  marginTop: "10px",
  borderRadius: "10px",
  background: "#1f1f1f"
};

const siteHeader = {
  marginTop: "20px",
  borderBottom: "1px solid #444"
};

const sectionTitle = {
  marginTop: "15px"
};