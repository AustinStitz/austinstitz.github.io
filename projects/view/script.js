fetch("/data/projects.json").then(n => n.json()).then(n => {
  if(location.hash == "#" || location.hash == "") {
    location.hash = "#" + encodeURIComponent(n[0].title);
    location.refresh();
    return;
  }


  const title = decodeURIComponent(location.hash.slice(1));

  const project = n.find(n => n.title == title);

  if(!project) {
    alert("Error: Invalid project");
    return;
  }

  document.title = `${title} | Austin Stitz`;

  document.getElementById("projectName").textContent = title;
  document.getElementById("description").textContent = project.description;

  document.getElementById("thumb").src = project.thumbnail;

  const links = document.getElementById("links");

  if(project.links.length <= 0)
    document.getElementById("linksContainer").style.display = "none";
  else
    for(let link of project.links) {
      const label = link.label;
      const url = link.url;

      const item = document.createElement("li");
      item.textContent = label;
      const hyperlink = document.createElement("a");
      hyperlink.href = url;
      hyperlink.textContent = url;
      item.appendChild(hyperlink);

      links.appendChild(item);
    }


  if(project.images.length <= 0)
    document.getElementById("imgsContainer").style.display = "none";
  else
    generateSlides(project.images);

  function createSpan(text) {
    const span = document.createElement("span");
    span.textContent = text;
    return span;
  }

  document.getElementById("status").appendChild(createSpan(project.status));
  document.getElementById("websites").append(...project.websites.map(createSpan));
  document.getElementById("langs").append(...project.langs.map(createSpan));


  const spans = ["status", "websites", "langs"].map(n => Array.from(document.getElementById(n).children)).reduce((a, b) => a.concat(b))

  fetch("/data/colors.json").then(n => n.json()).then(n => {
    for(const el of spans) {
      const color = n.find(n => n.tag == el.textContent);

      if(color) {
        el.style.backgroundColor = color.color;
        if(color.text) {
          el.style.color = color.text;
          el.style.border = "1px solid " + color.text;
        }
      }

      el.addEventListener("click", () => {
        window.open("/projects/?tags=" + encodeURIComponent(el.textContent));
      });
    }

  });
});


function generateSlides(imgs) {
  const slideshow = document.getElementsByClassName("slideshow")[0];
  const dotsList = document.getElementById("dots");

  slideshow.innerHTML = `<div class="numbertext">? / ?</div>`;
  dotsList.innerHTML = "";

  for(let i in imgs) {
    const img = imgs[i];

    const div = document.createElement("div");
    div.className = "slide";
    const image = document.createElement("img");
    image.src = img;
    div.appendChild(image);

    slideshow.appendChild(div);

    const newDot = document.createElement("div");
    newDot.className = "dot";
    newDot.addEventListener("click", () => {
      slideIndex = i;
      showSlides(slideIndex);
    });

    dotsList.appendChild(newDot);
  }

  slideshow.innerHTML += `
  <a class="prev"><span>&lt;</span></a>
  <a class="next"><span>&gt;</span></a>
  `;

  const size = imgs.length;

  let slideIndex = 0;

  showSlides(slideIndex);

  function plusSlides(n) {
    showSlides(slideIndex += n);
  }

  function currentSlide(n) {
    showSlides(slideIndex = n);
  }

  document.getElementsByClassName("prev")[0].addEventListener("click", () => {
    slideIndex--;
    showSlides(slideIndex);
  });

  document.getElementsByClassName("next")[0].addEventListener("click", () => {
    slideIndex++;
    showSlides(slideIndex);
  });

  function showSlides(n) {
    let slides = document.getElementsByClassName("slide");
    let dots = document.getElementsByClassName("dot");


    if (n >= slides.length) slideIndex = 0;
    if (n < 0) slideIndex = slides.length - 1;

    for (const slide of Array.from(slides)) {
      slide.className = slide.className.replace(" visible", "");
    }
    for (const dot of Array.from(dots)) {
      dot.className = dot.className.replace(" active", "");
    }

    slides[slideIndex].className += " visible";
    dots[slideIndex].className += " active";

    document.getElementsByClassName("numbertext")[0].textContent = `${slideIndex + 1} / ${size}`;
  }
}
