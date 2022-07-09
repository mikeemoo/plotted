export function promiseState(p: Promise<any>) {
  const t = {};
  return Promise.race([p, t])
    .then(v => (v === t)? "pending" : "fulfilled", () => "rejected");
}