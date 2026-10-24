(() => {
  const profiles = {
    "sample-a": { claude: 28, codex: 19, opencode: 9, vibe: 4 },
    "sample-b": { claude: 13, codex: 31, opencode: 22, vibe: 4 }
  };
  const modelCounts = {
    "sample-a": { claude: { "anthropic/claude-sonnet-4-5": 34, "anthropic/claude-opus-4-1": 17 }, codex: { "openai/gpt-5.2-codex": 21, "openai/gpt-5.2": 11 }, opencode: { "openai/gpt-5.2": 8, "anthropic/claude-sonnet-4-5": 5 } },
    "sample-b": { claude: { "anthropic/claude-sonnet-4-5": 12, "anthropic/claude-opus-4-1": 18 }, codex: { "openai/gpt-5.2-codex": 9, "openai/gpt-5.2": 20 }, opencode: { "openai/gpt-5.2": 19, "anthropic/claude-sonnet-4-5": 6 } }
  };
  const agents = [
    { id: "claude", name: "Claude", models: [
      { id: "anthropic/claude-sonnet-4-5", name: "Anthropic · Claude Sonnet 4.5" },
      { id: "anthropic/claude-opus-4-1", name: "Anthropic · Claude Opus 4.1" }
    ] },
    { id: "codex", name: "Codex", models: [
      { id: "openai/gpt-5.2-codex", name: "OpenAI · GPT-5.2 Codex" },
      { id: "openai/gpt-5.2", name: "OpenAI · GPT-5.2" }
    ] },
    { id: "opencode", name: "OpenCode", models: [
      { id: "openai/gpt-5.2", name: "OpenAI · GPT-5.2" },
      { id: "anthropic/claude-sonnet-4-5", name: "Anthropic · Claude Sonnet 4.5" }
    ] },
    { id: "vibe", name: "Vibe", models: [] }
  ];
  const surfaces = [...document.querySelectorAll("[data-surface]")];
  const appearances = [...document.querySelectorAll("[data-appearance]")];
  const stateSelect = document.querySelector("#state-select");
  const profileSelect = document.querySelector("#profile-select");
  const orchestratorSelect = document.querySelector("#orchestrator-select");
  const agentSelect = document.querySelector("#agent-select");
  const modelSelect = document.querySelector("#model-select");
  const usageList = document.querySelector("#usage-list");
  const selectionNote = document.querySelector("#selection-note");
  const surfaceTitle = document.querySelector("#surface-title");
  const surfaceEyebrow = document.querySelector("#surface-eyebrow");
  let surface = "new-session";
  let state = "populated";
  let profile = "sample-a";
  let orchestrator = "claude";
  let agent = "claude";
  let model = "default";
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  let appearance = "system";
  try { appearance = localStorage.getItem("harflow-proposal-appearance") || "system"; } catch (_) { /* file:// storage can be unavailable */ }

  function renderAppearance() {
    const theme = appearance === "system" ? (systemTheme.matches ? "dark" : "light") : appearance;
    document.documentElement.dataset.theme = theme;
    appearances.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.appearance === appearance)));
  }

  function countForAgent(id) { return state === "tied" ? 6 : state === "empty" ? 0 : (profiles[profile][id] || 0); }
  function countForModel(id, modelId) { return state === "tied" ? 6 : state === "empty" ? 0 : ((modelCounts[profile][id] || {})[modelId] || 0); }
  function activeAgent() { return agents.find(item => item.id === agent); }
  function stableCompare(a, b) { return a < b ? -1 : a > b ? 1 : 0; }
  function orchestratorModel() {
    return { claude: "anthropic/claude-sonnet-4-5", codex: "openai/gpt-5.2-codex", opencode: "openai/gpt-5.2" }[orchestrator];
  }

  function renderSelectors() {
    const catalogUnavailable = state === "loading" || state === "error";
    document.querySelector(".orchestrator-control").hidden = surface !== "workflow-node";
    const surfaceCopy = {
      "new-session": ["New Session", "Choose a harness"],
      orchestrator: ["Orchestrator", "Choose an orchestrator harness"],
      "workflow-node": ["Workflow node", "Configure the node harness"]
    }[surface];
    surfaceEyebrow.textContent = surfaceCopy[0];
    surfaceTitle.textContent = surfaceCopy[1];
    agentSelect.disabled = catalogUnavailable;
    modelSelect.disabled = catalogUnavailable;
    let ordered = [...agents].sort((a, b) => countForAgent(b.id) - countForAgent(a.id) || stableCompare(a.id, b.id));
    if (surface === "workflow-node") {
      const preferred = agents.find(item => item.id === orchestrator);
      ordered = [preferred, ...ordered.filter(item => item.id !== orchestrator)];
    }
    agentSelect.replaceChildren(...ordered.map(item => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item.id === orchestrator && surface === "workflow-node" ? `${item.name} · Orchestrator` : item.name;
      return option;
    }));
    agentSelect.value = agent;

    const current = activeAgent();
    const configuredModel = surface === "workflow-node" ? orchestratorModel() : null;
    const compatibleOrchestratorModel = configuredModel && current.models.some(item => item.id === configuredModel)
      ? configuredModel : null;
    let orderedModels = [...current.models].sort((a, b) => countForModel(agent, b.id) - countForModel(agent, a.id) || stableCompare(a.id, b.id));
    if (compatibleOrchestratorModel && orderedModels.some(item => item.id === compatibleOrchestratorModel)) {
      orderedModels = [orderedModels.find(item => item.id === compatibleOrchestratorModel), ...orderedModels.filter(item => item.id !== compatibleOrchestratorModel)];
    }
    const defaultOption = document.createElement("option");
    defaultOption.value = "default";
    defaultOption.textContent = "Default";
    const modelOptions = orderedModels.map(item => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item.name;
      return option;
    });
    if (compatibleOrchestratorModel) {
      const preferredModel = modelOptions.find(option => option.value === compatibleOrchestratorModel);
      const remainingModels = modelOptions.filter(option => option.value !== compatibleOrchestratorModel);
      modelSelect.replaceChildren(preferredModel, defaultOption, ...remainingModels);
    } else {
      modelSelect.replaceChildren(defaultOption, ...modelOptions);
    }
    modelSelect.disabled = catalogUnavailable || orderedModels.length === 0;
    if (model !== "default" && !orderedModels.some(item => item.id === model)) model = "default";
    modelSelect.value = model;
    document.querySelector(".model-row").hidden = orderedModels.length === 0;
    selectionNote.textContent = catalogUnavailable
      ? state === "loading" ? "The harness catalog is loading; picker controls are unavailable." : "The harness catalog could not be loaded; picker controls are unavailable."
      : surface === "workflow-node"
        ? compatibleOrchestratorModel ? "The orchestrator model leads this compatible model list. Default remains available." : "The configured orchestrator model is not available for this harness; choices stay unchanged."
        : orderedModels.length === 0 ? `${current.name} has no model picker in this fixture.` : "Changing the ranking sample or orchestrator preserves the selected harness and model.";

    usageList.replaceChildren();
    if (state === "loading" || state === "error") {
      const message = document.createElement("div");
      message.className = "state-message";
      message.setAttribute("role", state === "error" ? "alert" : "status");
      message.textContent = state === "loading" ? "Loading the available catalog and shared usage sample…" : "The available catalog could not be loaded. Retry would be offered by the native surface.";
      usageList.append(message);
      return;
    }
    if (state === "empty") {
      const message = document.createElement("div");
      message.className = "state-message";
      message.setAttribute("role", "status");
      message.textContent = "No successful submissions recorded yet. Available harnesses remain in stable alphabetical order.";
      usageList.append(message);
      return;
    }
    const ranking = [...agents].sort((a, b) => countForAgent(b.id) - countForAgent(a.id) || stableCompare(a.id, b.id));
    ranking.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "usage-item";
      const dot = document.createElement("span");
      dot.className = `backend-dot ${item.id}`;
      dot.setAttribute("aria-hidden", "true");
      const rank = document.createElement("span");
      rank.className = "rank";
      rank.textContent = `${index + 1}.`;
      const name = document.createElement("span");
      name.className = "usage-name";
      name.textContent = item.name;
      const count = document.createElement("span");
      count.className = "count";
      count.textContent = countForAgent(item.id);
      row.append(dot, rank, name, count);
      usageList.append(row);
    });
  }

  surfaces.forEach(button => button.addEventListener("click", () => {
    surface = button.dataset.surface;
    surfaces.forEach(item => item.setAttribute("aria-pressed", String(item === button)));
    renderSelectors();
  }));
  appearances.forEach(button => button.addEventListener("click", () => {
    appearance = button.dataset.appearance;
    try { localStorage.setItem("harflow-proposal-appearance", appearance); } catch (_) { /* preview still updates in memory */ }
    renderAppearance();
  }));
  agentSelect.addEventListener("change", () => { agent = agentSelect.value; model = "default"; renderSelectors(); });
  modelSelect.addEventListener("change", () => { model = modelSelect.value; });
  stateSelect.addEventListener("change", () => { state = stateSelect.value; renderSelectors(); });
  profileSelect.addEventListener("change", () => { profile = profileSelect.value; renderSelectors(); });
  orchestratorSelect.addEventListener("change", () => { orchestrator = orchestratorSelect.value; renderSelectors(); });
  systemTheme.addEventListener("change", () => { if (appearance === "system") renderAppearance(); });
  renderAppearance();
  renderSelectors();
})();
