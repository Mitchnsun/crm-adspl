export function render(current, options = {}) {
  if (options[current.value]) return options[current.value]();
  return null;
}
