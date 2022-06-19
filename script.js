const colors =
  localStorage.getItem("colors").length > 0
    ? JSON.parse(localStorage.getItem("colors"))?.slice(0, 18)
    : [];

const createElement = (tag, data) => {
  const ele = document.createElement(tag);
  for (const key in data) {
    if (key != "innerText") ele.setAttribute(key, data[key]);
    else ele.innerText = data[key];
  }
  return ele;
};

const grid = document.querySelector(".grid");
const clearBtn = document.querySelector(".clear-color");

clearBtn.onclick = () => {
  localStorage.setItem("colors", "[]");
  grid.innerHTML = `<div style="grid-column: span 12;text-align: center;color: #ccc;" title="No colors yet">No colors yet</div>`;
};

if (colors.length > 0)
  colors?.slice(0, 18)?.forEach((color) => {
    const colorDiv = createElement("div", {
      class: "color-box",
      style: `background-color: ${color}`,
      title: `Copy to clipboard: ${color}`,
      "data-color": color,
    });
    grid.appendChild(colorDiv);
  });
else {
  const colorDiv = createElement("div", {
    style: "grid-column: span 12;text-align: center;",
    innerText: "No colors yet",
    title: "No colors yet",
  });
  grid.appendChild(colorDiv);
}

const button = document.querySelector("button");
const resultEle = document.querySelector(".result");

const colorPic = async () => {
  const eyeDropper = new EyeDropper();
  return await eyeDropper?.open();
};

button.onclick = async () => {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  chrome.scripting.executeScript(
    {
      target: {
        tabId: tab?.id,
      },
      function: colorPic,
    },
    async (res) => {
      const [data] = res;
      if (data?.result) {
        const colorDiv = createElement("div", {
          class: "color-box",
          style: `background-color: ${data?.result?.sRGBHex}`,
          title: `Copy to clipboard: ${data?.result?.sRGBHex}`,
          "data-color": data?.result?.sRGBHex,
        });

        localStorage.setItem(
          "colors",
          JSON.stringify([data?.result?.sRGBHex, ...colors])
        );

        navigator.clipboard.writeText(data?.result?.sRGBHex);
        resultEle.innerText = `${data?.result?.sRGBHex} Copied to clipboard`;

        grid.prepend(colorDiv);

        if (colors.length >= 18) grid.lastChild.remove();
      }
    }
  );
};

const container = document.querySelector(".container");
const toggleBtn = document.querySelector(".toggle");
toggleBtn.onclick = () => container.classList.toggle("dark");

document.querySelectorAll(".color-box").forEach((ele) => {
  ele.onclick = () => {
    const colorValue = ele.getAttribute("data-color");
    navigator.clipboard.writeText(colorValue);
    resultEle.innerText = `${colorValue} Copied to clipboard`;
  };
});
