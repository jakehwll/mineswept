const Row = (children: HTMLElement[], id: string) => {
  const el = document.createElement("div");
  el.id = `row-${id}`;
  children.map((v) => el.appendChild(v));
  return el;
};

export { Row }