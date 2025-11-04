let draggedPlant = null;
let topZIndex = 10; 

let offsetX = 0;
let offsetY = 0;

const plants = document.querySelectorAll(".plant");

plants.forEach(plant => {
  plant.addEventListener("dragstart", (event) => {
    draggedPlant = event.target;

    event.target.classList.add("dragging");
    event.dataTransfer.setData("text/plain", event.target.id);
    
    offsetX = event.clientX - event.target.getBoundingClientRect().left;
    offsetY = event.clientY - event.target.getBoundingClientRect().top;
  });

  plant.addEventListener("dragend", (event) => {
    event.target.classList.remove("dragging");
  });

  plant.addEventListener("click", () => {
    topZIndex++;
    plant.style.zIndex = topZIndex;
  });
});

const dropTarget = document.body;

dropTarget.addEventListener("dragover", (event) => {
  event.preventDefault();
});

dropTarget.addEventListener("drop", (event) => {
  event.preventDefault();

  dropTarget.appendChild(draggedPlant);

  const pageRect = dropTarget.getBoundingClientRect();
  let newLeft = event.clientX - pageRect.left - offsetX;
  let newTop = event.clientY - pageRect.top - offsetY;

  draggedPlant.style.left = newLeft + "px";
  draggedPlant.style.top = newTop + "px";

  topZIndex++;
  draggedPlant.style.zIndex = topZIndex;

  draggedPlant = null;
});
