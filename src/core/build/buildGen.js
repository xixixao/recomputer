export function generatedBy(url) {
  const relativeUrl = url.slice(url.lastIndexOf("/src"));
  return `// Generated by .${relativeUrl}\n`;
}
