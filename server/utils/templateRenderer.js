function renderTemplateString(template, variables = {}) {
  if (!template) return "";
  return String(template).replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (Object.prototype.hasOwnProperty.call(variables, key)) {
      const value = variables[key];
      return value == null ? "" : String(value);
    }
    return match;
  });
}

module.exports = {
  renderTemplateString,
};
