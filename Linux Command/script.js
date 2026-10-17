const commands = {
  pwd: { command: "pwd", output: "/home/student/ossp-project", base: 1.8 },
  date: { command: "date", output: "Sat Oct 17 10:42:08 IST 2026", base: 2.4 },
  whoami: { command: "whoami", output: "student", base: 1.5 },
  uname: { command: "uname -a", output: "Linux lab-machine 6.8.0-generic #1 SMP x86_64 GNU/Linux", base: 2.9 },
  ls: { command: "ls -la", output: "total 32\ndrwxr-xr-x  5 student student 4096 Oct 17 10:20 .\ndrwxr-xr-x 12 student student 4096 Oct 17 09:00 ..\n-rw-r--r--  1 student student  842 README.md\ndrwxr-xr-x  2 student student 4096 src\n-rw-r--r--  1 student student  318 package.json", base: 4.7 },
  df: { command: "df -h", output: "Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1       100G   42G   58G  43% /\ntmpfs            4G  1.2M    4G   1% /run", base: 6.2 },
  free: { command: "free -h", output: "               total        used        free\nMem:            15Gi       6.2Gi       5.1Gi\nSwap:          2.0Gi       0.0Gi       2.0Gi", base: 3.8 },
  uptime: { command: "uptime", output: "10:42:08 up 3 days,  4:16,  2 users,  load average: 0.12, 0.08, 0.04", base: 2.6 }
};
const $ = (id) => document.getElementById(id);
const commandSelect = $("commandSelect");
let history = [];
let latestOutput = "";
function updatePreview() { $("commandPreview").textContent = commands[commandSelect.value].command; }
commandSelect.addEventListener("change", updatePreview);

function runProfiler() {
  const key = commandSelect.value;
  const preset = commands[key];
  const count = Number($("runs").value);
  const btn = $("runBtn");
  btn.disabled = true;
  btn.innerHTML = '<span>◌</span> Measuring…';
  $("output").textContent = "$ " + preset.command + "\n\n" + preset.output + "\n\n[Demo] Measuring execution duration…";
  setTimeout(() => {
    // Illustrative values only: no shell command is executed by this browser demo.
    const values = Array.from({ length: count }, (_, i) =>
      Math.max(0.6, +(preset.base * (0.78 + Math.random() * 0.48) + (i * 0.07)).toFixed(2))
    );
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const fastest = Math.min(...values);
    $("avgTime").innerHTML = avg.toFixed(2) + "<small> ms</small>";
    $("fastTime").innerHTML = fastest.toFixed(2) + "<small> ms</small>";
    $("totalRuns").textContent = values.length;
    drawChart(values);
    latestOutput = "$ " + preset.command + "\n\n" + preset.output +
      "\n\n--- DEMO MEASUREMENT ---\nRuns: " + values.length +
      "\nAverage: " + avg.toFixed(2) + " ms\nFastest: " + fastest.toFixed(2) +
      " ms\n\nNote: Illustrative timings generated in the browser. No actual Linux command was executed.";
    $("output").textContent = latestOutput;
    history.unshift({ command: preset.command, avg: avg.toFixed(2), time: new Date().toLocaleTimeString([], {hour:"2-digit", minute:"2-digit", second:"2-digit"}) });
    history = history.slice(0, 5);
    renderHistory();
    btn.disabled = false;
    btn.innerHTML = '<span>▶</span> Run profiler <kbd>↵</kbd>';
  }, 420);
}
function drawChart(values) {
  const chart = $("chart");
  chart.innerHTML = "";
  const max = Math.max(...values) * 1.25 || 1;
  values.forEach((value, i) => {
    const item = document.createElement("div"); item.className = "bar-item";
    const bar = document.createElement("div"); bar.className = "bar";
    const height = Math.max(7, value / max * 100);
    bar.style.height = height + "%"; bar.style.setProperty("--bar-height", height + "%");
    const valueLabel = document.createElement("span"); valueLabel.className = "bar-value"; valueLabel.textContent = value.toFixed(2);
    bar.appendChild(valueLabel);
    const label = document.createElement("span"); label.className = "bar-label"; label.textContent = "RUN " + (i + 1);
    item.append(bar, label); chart.appendChild(item);
  });
}
function renderHistory() {
  const root = $("history");
  if (!history.length) { root.innerHTML = '<div class="history-empty">Your recent measurements will appear here.</div>'; return; }
  root.innerHTML = "";
  history.forEach(item => {
    const row = document.createElement("div"); row.className = "history-item";
    row.innerHTML = '<span class="history-icon">⌁</span><div class="history-info"><strong></strong><small></small></div><span class="history-time"></span>';
    row.querySelector("strong").textContent = item.command;
    row.querySelector("small").textContent = item.time;
    row.querySelector(".history-time").textContent = item.avg + " ms";
    root.appendChild(row);
  });
}
$("runBtn").addEventListener("click", runProfiler);
$("clearBtn").addEventListener("click", () => { history = []; renderHistory(); });
$("copyBtn").addEventListener("click", async () => {
  if (!latestOutput) { $("copyBtn").textContent = "Run a command first"; setTimeout(() => $("copyBtn").textContent = "Copy output ↗", 1400); return; }
  try { await navigator.clipboard.writeText(latestOutput); $("copyBtn").textContent = "Copied ✓"; }
  catch { $("copyBtn").textContent = "Select output to copy"; }
  setTimeout(() => $("copyBtn").textContent = "Copy output ↗", 1500);
});
document.addEventListener("keydown", e => { if (e.key === "Enter" && !e.target.matches("select")) runProfiler(); });
updatePreview();
