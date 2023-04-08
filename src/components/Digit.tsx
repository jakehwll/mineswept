const Digit = (digits: string) => {
  const el = document.createElement("div");
  el.className = "digit"

  digits.split("").map((v) => {digits.split("");
    const el2 = document.createElement("img");
    el2.setAttribute('src', `/digit/${v}.svg`)
    el.appendChild(el2);
  });

  return el
}

export { Digit }