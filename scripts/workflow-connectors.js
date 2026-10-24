(function (root) {
  function roundedPath(points) {
    if (!Array.isArray(points) || points.length < 2) return '';
    let path = `M${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length - 1; i++) {
      const previous = points[i - 1], corner = points[i], next = points[i + 1];
      const incoming = Math.hypot(corner.x - previous.x, corner.y - previous.y);
      const outgoing = Math.hypot(next.x - corner.x, next.y - corner.y);
      if (!incoming || !outgoing) { path += ` L${corner.x} ${corner.y}`; continue; }
      const radius = Math.min(10, incoming / 2, outgoing / 2);
      const before = { x: corner.x - (corner.x - previous.x) / incoming * radius, y: corner.y - (corner.y - previous.y) / incoming * radius };
      const after = { x: corner.x + (next.x - corner.x) / outgoing * radius, y: corner.y + (next.y - corner.y) / outgoing * radius };
      path += ` L${before.x} ${before.y} Q${corner.x} ${corner.y} ${after.x} ${after.y}`;
    }
    const last = points[points.length - 1];
    return `${path} L${last.x} ${last.y}`;
  }

  function arrowPath(points) {
    if (!Array.isArray(points) || points.length < 2) return '';
    const end = points[points.length - 1];
    return `M${end.x - 7} ${end.y + 5} L${end.x} ${end.y} L${end.x - 7} ${end.y - 5}`;
  }

  root.HFWorkflowConnectors = Object.freeze({ roundedPath, arrowPath });
})(typeof window === 'undefined' ? globalThis : window);
