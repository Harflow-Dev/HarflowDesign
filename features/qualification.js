(() => {
  const $ = id => document.getElementById(id);
  const original = { name: "Codex", version: "0.107.0", key: "fixture-codex-original" };
  const replacement = { name: "Codex", version: "0.108.0", key: "fixture-codex-replacement" };
  let identity = original;
  let state = "unknown";
  let generation = 0;
  let attempt = null;
  let oldAttempt = null;
  const copy = {
    unknown: ["Not checked", "Check required features", "This executable has no saved result for the features this launch needs."],
    loading: ["Qualifying…", "Checking required features…", "The app stays available while this harness is checked. No task has started."],
    success: ["Ready", "Required features are ready", "These saved results match the selected executable. The engine checks launch requirements again."],
    failed: ["Failed", "A required feature did not pass", "Resolve the reason below, then retry qualification explicitly."],
    runtime: ["Failed at runtime", "A runtime failure invalidated the result", "Earlier success no longer authorizes the dependent feature bundle."],
    missing: ["Unavailable", "Harness executable unavailable", "Install this harness or select another installed harness before checking."],
    unsupported: ["Unsupported", "Engine 0.0.4 cannot report qualification", "The app-paired engine does not support these checks. A supporting engine must be explicitly released and selected; no version is assumed."],
    cancelled: ["Not checked", "Check cancelled", "This UI attempt was cancelled. A late result cannot enable launch; check again when ready."],
    stale: ["Not checked", "The installed harness changed", "Saved results for the previous executable do not apply. Check this version before launch."]
  };
  const features = ["Caller write tools", "Caller approvals"];
  function rows() {
    return features.map((name, index) => {
      let result = "Unavailable", ok = null;
      if (state === "success") { result = index === 0 ? "Ready · seeded" : "Ready · auto-probed"; ok = true; }
      if (state === "loading") result = "Checking…";
      if (state === "failed") {
        result = index === 0 ? "Ready · seeded" : "Failed · failed";
        ok = index === 0;
      }
      if (state === "runtime") { result = "Failed · failed-at-runtime"; ok = false; }
      const row = document.createElement("li");
      const label = document.createElement("span"); label.textContent = name;
      const value = document.createElement("span"); value.className = "feature-result"; value.textContent = result;
      if (ok !== null) value.dataset.ok = String(ok);
      row.append(label, value); return row;
    });
  }
  function render() {
    const surface = $("surface").value;
    const [badge, title, description] = copy[state];
    $("state").value = state;
    document.querySelector(".qualification").dataset.status = state;
    $("identity").textContent = `${identity.name} · ${identity.version}`;
    $("status-badge").textContent = badge; $("status-title").textContent = title; $("status-description").textContent = description;
    $("feature-list").replaceChildren(...rows());
    $("feature-list").hidden = state === "missing" || state === "unsupported";
    $("reason").hidden = state !== "failed" && state !== "runtime";
    $("reason").textContent = state === "runtime" ? "Caller approvals: the installed harness rejected the approval response. Its dependent qualification bundle was invalidated." : "Caller approvals: the isolated self-test did not receive an approval request before its deadline.";
    $("cancel-check").hidden = state !== "loading";
    $("qualify").hidden = state === "loading";
    $("qualify").disabled = state === "missing" || state === "unsupported";
    $("qualify").textContent = state === "failed" || state === "runtime" || state === "cancelled" ? "Retry qualification" : state === "success" ? "Check again" : "Check harness";
    $("surface-label").textContent = { session: "New session", workflow: "Run workflow", settings: "Settings · Harnesses" }[surface];
    $("surface-title").textContent = { session: "Start a task", workflow: "Run a workflow", settings: "Installed harness" }[surface];
    $("surface-description").textContent = { session: "Choose a harness and describe the work.", workflow: "Review the selected candidate before starting the workflow.", settings: "Inspect saved feature results or run an explicit check." }[surface];
    $("launch-fields").hidden = surface === "settings";
    $("launch-footer").hidden = surface === "settings";
    $("launch").textContent = surface === "workflow" ? "Run workflow" : "Start task";
    $("launch").disabled = state !== "success";
    $("complete-success").disabled = !attempt; $("complete-failure").disabled = !attempt;
  }
  function invalidate() { oldAttempt = attempt || oldAttempt; attempt = null; generation += 1; $("launch-note").textContent = ""; }
  function start() {
    invalidate(); attempt = { key: identity.key, generation }; state = "loading";
    $("simulation-note").textContent = "Check in progress. Deliver a fixture result or cancel."; render();
  }
  function complete(token, success) {
    if (!token || !attempt || token.key !== identity.key || token.generation !== generation) {
      $("simulation-note").textContent = "Ignored a stale result. The selected executable and current qualification state are unchanged."; return;
    }
    oldAttempt = attempt; attempt = null; state = success ? "success" : "failed";
    $("simulation-note").textContent = "Applied the current executable's result. No task was started."; render();
  }
  $("qualify").addEventListener("click", start);
  $("cancel-check").addEventListener("click", () => { invalidate(); state = "cancelled"; render(); });
  $("state").addEventListener("change", () => { invalidate(); state = $("state").value; if (state === "loading") attempt = { key: identity.key, generation }; render(); });
  $("surface").addEventListener("change", () => { invalidate(); state = "unknown"; render(); });
  $("theme").addEventListener("change", () => { document.documentElement.dataset.theme = $("theme").value; });
  $("harness").addEventListener("change", () => { invalidate(); identity = $("harness").value === "original" ? original : replacement; state = "stale"; render(); });
  $("complete-success").addEventListener("click", () => complete(attempt, true));
  $("complete-failure").addEventListener("click", () => complete(attempt, false));
  $("old-success").addEventListener("click", () => complete(oldAttempt || { key: "old-binary", generation: -1 }, true));
  $("launch").addEventListener("click", () => { $("launch-note").textContent = "Fixture only: launch would now perform the engine's gated preflight."; });
  $("cancel-launch").addEventListener("click", () => { invalidate(); state = "unknown"; $("launch-note").textContent = "Fixture only: the launch surface would close."; render(); });
  $("reset").addEventListener("click", () => { invalidate(); identity = original; state = "unknown"; oldAttempt = null; $("harness").value = "original"; $("surface").value = "session"; $("simulation-note").textContent = "Completion controls are catalog fixtures, outside the app surface."; render(); });
  render();
})();
