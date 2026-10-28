(() => {
  const $ = id => document.getElementById(id);
  const tabs = ["activity", "summary", "prompt"];
  const at = "2026-10-28T09:58:00Z";
  let state = "surviving", tab = "activity", generation = 1;
  let observations = new Set(["fixture-task:observer-generation-1"]);
  let returnFocus = null;
  const healthy = () => ["surviving", "details", "invalid-time"].includes(state);
  const adopted = () => !["normal", "absent", "unsupported"].includes(state);
  function inspector(open, focus = false) {
    $("inspector").hidden = !open;
    $("toggle-inspector").textContent = open ? "Hide inspector" : "Show inspector";
    $("toggle-inspector").setAttribute("aria-expanded", String(open));
    if (focus) {
      returnFocus = document.activeElement;
      $("technical").open = true;
      $("supervision").focus();
    }
  }
  function renderTab() {
    tabs.forEach(name => {
      const active = tab === name;
      $("tab-" + name).setAttribute("aria-selected", String(active));
      $("tab-" + name).tabIndex = active ? 0 : -1;
    });
    $("pane").setAttribute("aria-labelledby", "tab-" + tab);
    $("pane-title").textContent = tab[0].toUpperCase() + tab.slice(1);
    $("pane-copy").textContent = {
      activity: state === "completed" ? "Persistence checks finished successfully." : "Checking persisted task records and recovery boundaries.",
      summary: state === "completed" ? "Verified persistence and recovery behavior." : "The task has not supplied a final summary yet.",
      prompt: "Implement persistence checks and verify the recovery boundaries."
    }[tab];
  }
  function render() {
    $("continuity").hidden = !healthy();
    $("status").textContent = state === "completed" ? "Completed" : "Running";
    $("status-dot").className = state === "completed" ? "completed" : "";
    $("elapsed").textContent = state === "completed" ? "12m 40s" : "12m 34s";
    const warnings = [];
    if (state === "uncertain") warnings.push("Task connection is uncertain");
    if (["capture", "both"].includes(state)) warnings.push("Output capture stopped");
    if (["input", "both"].includes(state)) warnings.push("Messages can no longer be delivered");
    $("warnings").hidden = !warnings.length;
    $("warning-count").hidden = !warnings.length;
    $("warning-count").textContent = `${warnings.length} warning${warnings.length === 1 ? "" : "s"}`;
    $("warning-list").replaceChildren(...warnings.map(text => { const li = document.createElement("li"); li.textContent = text; return li; }));
    $("restart-history").hidden = !adopted();
    $("restart-history").textContent = `${observations.size} distinct restart observation${observations.size === 1 ? "" : "s"}. Execution ownership did not change.`;
    $("history-list").replaceChildren(...Array.from(observations, identity => {
      const li = document.createElement("li"); li.textContent = identity; return li;
    }));
    $("history-list").hidden = !adopted();
    const validTime = adopted() && state !== "invalid-time";
    $("observed-at").hidden = !validTime;
    const parentObserver = $("observer").value === "parent_process";
    $("observed-at").textContent = validTime ? (parentObserver ? "Observing process started at " : "Observing server started at ") + new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(new Date(at)) : "";
    const evidence = {
      Owner: state === "unsupported" ? "unavailable" : state === "uncertain" ? "unknown" : "alive",
      Process: state === "unsupported" ? "unavailable" : state === "completed" ? "exited" : "alive",
      Capture: state === "unsupported" ? "unavailable" : ["capture", "both"].includes(state) ? "lost_with_owner" : "live",
      "Live input": state === "unsupported" ? "unavailable" : ["input", "both"].includes(state) ? "closed_with_owner" : "open"
    };
    if (adopted()) {
      evidence["Previous server"] = "pid 4100 · generation fixture-previous";
      evidence[parentObserver ? "Current observing process" : "Current server"] = `pid 5200 · start fixture-${generation}`;
      evidence["Observer kind"] = parentObserver ? "parent_process" : "server";
    }
    $("evidence").replaceChildren(...Object.entries(evidence).flatMap(([key, value]) => {
      const dt = document.createElement("dt"), dd = document.createElement("dd"); dt.textContent = key; dd.textContent = value; return [dt, dd];
    }));
    $("generation").disabled = !adopted();
    renderTab();
  }
  tabs.forEach((name, index) => {
    $("tab-" + name).addEventListener("click", () => { tab = name; renderTab(); });
    $("tab-" + name).addEventListener("keydown", event => {
      let next;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault(); tab = tabs[next]; renderTab(); $("tab-" + tab).focus();
    });
  });
  $("warning-count").addEventListener("click", () => {
    returnFocus = document.activeElement;
    inspector(true);
    $("warnings").tabIndex = -1;
    $("warnings").focus();
  });
  $("show-details").addEventListener("click", () => inspector(true, true));
  $("toggle-inspector").addEventListener("click", () => inspector($("inspector").hidden));
  $("close-inspector").addEventListener("click", () => { inspector(false); (returnFocus && !returnFocus.closest("[hidden]") ? returnFocus : $("toggle-inspector")).focus(); });
  $("state").addEventListener("change", () => {
    state = $("state").value; generation = 1; observations = new Set(adopted() ? ["fixture-task:observer-generation-1"] : []);
    $("technical").open = false; inspector(["details", "uncertain", "capture", "input", "both", "completed"].includes(state)); render();
  });
  $("observer").addEventListener("change", render);
  $("theme").addEventListener("change", () => { document.documentElement.dataset.theme = $("theme").value; });
  $("poll").addEventListener("click", () => { render(); $("simulation-note").textContent = "Identical poll: no added history entry or continuity announcement."; });
  $("generation").addEventListener("click", () => { generation += 1; observations.add(`fixture-task:observer-generation-${generation}`); render(); $("simulation-note").textContent = `${observations.size} distinct restart observations; one compact continuity row.`; });
  $("reset").addEventListener("click", () => { state = "surviving"; tab = "activity"; generation = 1; observations = new Set(["fixture-task:observer-generation-1"]); $("state").value = state; $("observer").value = "parent_process"; $("technical").open = false; returnFocus = null; inspector(false); $("simulation-note").textContent = "One distinct restart observation."; render(); });
  render();
})();
