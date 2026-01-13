/* =====================================================
   PARÀMETRES URL
===================================================== */
const params = new URLSearchParams(window.location.search);
const projectId = params.get("project");

/* =====================================================
   ELEMENTS DOM
===================================================== */
const container = document.querySelector(".project-view");
const media = document.getElementById("media");
const counter = document.getElementById("counter");
const fakeCursor = document.getElementById("fakeCursor");
const backBtn = document.getElementById("backBtn");

const isProjectPage = !!container && !!media;
const isHomePage = document.body.classList.contains("home-page");

/* =====================================================
   VARIABLES
===================================================== */
let items = [];
let index = 0;
let isAnimating = false;

/* =====================================================
   PROJECT.HTML – CARREGAR PROJECTE
===================================================== */
if (isProjectPage && projectId) {
  fetch("projects.json")
    .then(res => res.json())
    .then(data => {
      const project = data[projectId];
      if (!project) return;

      // Header
      const titleEl = document.getElementById("projectTitle");
      const studioEl = document.getElementById("projectStudio");
      if (titleEl) titleEl.textContent = project.title;
      if (studioEl) studioEl.textContent = project.studio;

      items = project.items;
      index = 0;
      show(1); // primera imatge
    });
}

/* =====================================================
   MOSTRAR IMATGE / VIDEO (AMB TRANSICIÓ)
===================================================== */
function show(direction = 1) {
  if (!items.length || isAnimating) return;
  isAnimating = true;

  const file = items[index];
  const el = document.createElement(file.endsWith(".mp4") ? "video" : "img");
  el.classList.add("media-item");

  if (file.endsWith(".mp4")) {
    el.src = `images/${projectId}/${file}`;
    el.autoplay = true;
    el.muted = true;
    el.playsInline = true;
    el.loop = true;
  } else {
    el.src = `images/${projectId}/${file}`;
    el.draggable = false;
  }

  el.classList.add(direction === 1 ? "from-right" : "from-left");
  media.appendChild(el);

  requestAnimationFrame(() => {
    el.classList.remove("from-right", "from-left");
    el.classList.add("center");
  });

  const old = media.querySelector(".media-item:not(:last-child)");
  if (old) old.classList.add(direction === 1 ? "to-left" : "to-right");

  setTimeout(() => {
    if (old) old.remove();
    isAnimating = false;
    updateCounter();
  }, 450);
}

/* =====================================================
   NAVEGACIÓ
===================================================== */
function navigate(dir) {
  if (!items.length || isAnimating) return;
  index = (index + dir + items.length) % items.length;
  show(dir);
}

/* CLICK */
if (isProjectPage) {
  container.addEventListener("click", e => {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    navigate(x < rect.width / 2 ? -1 : 1);
  });
}

/* TECLAT */
document.addEventListener("keydown", e => {
  if (!isProjectPage) return;
  if (e.key === "ArrowLeft") navigate(-1);
  if (e.key === "ArrowRight") navigate(1);
});

/* =====================================================
   CURSOR PERSONALITZAT
===================================================== */
if (isProjectPage && fakeCursor) {

  // Quan entres al projecte → mostrar cursor
  container.addEventListener("mouseenter", () => {
    fakeCursor.style.display = "block";
  });

  // Quan surts del projecte → amagar cursor
  container.addEventListener("mouseleave", () => {
    fakeCursor.style.display = "none";
  });

  // Moure cursor
  container.addEventListener("mousemove", e => {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;

    fakeCursor.style.left = e.clientX + "px";
    fakeCursor.style.top = e.clientY + "px";

    fakeCursor.style.backgroundImage =
      x < rect.width / 2
        ? "url('cursors/esquerra.cur')"
        : "url('cursors/dreta.cur')";
  });
}


/* =====================================================
   COMPTADOR
===================================================== */
function updateCounter() {
  if (!counter) return;
  counter.textContent = `${index + 1} / ${items.length}`;
}

/* =====================================================
   BOTÓ X
===================================================== */
if (backBtn) {
  backBtn.addEventListener("click", () => {
    window.location.href = "index.html";
  });
}

/* =====================================================
   BLOQUEJOS
===================================================== */
document.addEventListener("contextmenu", e => e.preventDefault());
document.addEventListener("dragstart", e => e.preventDefault());

/* =====================================================
   HOME – GRID PROJECTES
===================================================== */
if (isHomePage) {
  fetch("projects.json")
    .then(res => res.json())
    .then(data => {
      const grid = document.getElementById("projectsGrid");
      Object.entries(data).forEach(([key, project]) => {
        const a = document.createElement("a");
        a.href = `project.html?project=${key}`;
        a.className = "project";
        a.innerHTML = `
          <img src="images/${project.folder}/portada.jpg">
          <div class="info">
            <div class="title">${project.title}</div>
            <div class="studio">${project.studio}</div>
          </div>
        `;
        grid.appendChild(a);
      });
    });
}
