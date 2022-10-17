function populateLangs(partial = true) {
  const list = document.getElementById("langs");

  fetch("/data/langs.json").then(n=>n.json()).then(n => {
    window.LANGS = n;
    const tags = Array.from(document.getElementsByTagName("input")).filter(n=>n.checked).map(n=>n.value).filter(n => window.LANGS.includes(n));

    list.innerHTML = "";

    for(let i in n) {
      const lang = n[i];
      const chk = document.createElement("input");
      chk.setAttribute("type", "checkbox");
      chk.setAttribute("id", "lang" + i);
      chk.setAttribute("name", "lang" + i);
      chk.setAttribute("value", lang);
      if(tags.includes(lang)) chk.checked = true;

      const label = document.createElement("label");
      label.setAttribute("for", "lang" + i);
      label.textContent = lang;
      list.append(chk, label, document.createElement("BR"));
      chk.addEventListener("click", refreshProjects);

      if(partial && i > 10) break;
    }

    if(partial) {
      const btn = document.createElement("a");
      btn.href = "javascript:populateLangs(false);";
      btn.textContent = "Load more...";
      list.append(btn);
    } else {
      const btn = document.createElement("a");
      btn.href = "javascript:populateLangs();";
      btn.textContent = "Load less...";
      list.append(btn);
    }
  });
}



function createTile(data) {
  const outer = document.createElement("div");
  outer.setAttribute("class", "tile");

  const content = document.createElement("div");
  content.setAttribute("class", "tile-content");
  const thumb = document.createElement("img");
  thumb.src = data.thumbnail;
  const title = document.createElement("h2");
  title.textContent = data.title;
  content.append(thumb, title);

  content.addEventListener("click", () => {
    window.open("/projects/view#"+encodeURIComponent(data.title));
  });


  const tags = document.createElement("div");
  tags.setAttribute("class", "tags");

  function createDropup({icon, items}) {
    const dropup = document.createElement("div");
    dropup.setAttribute("class", "dropup");
    const btn = document.createElement("img");
    btn.src = icon;
    btn.setAttribute("class", "dropupbtn");
    const list = document.createElement("div");
    list.setAttribute("class", "dropup-content");
    for(let item of items) {
      const itemEl = document.createElement("a");
      itemEl.textContent = item;
      list.appendChild(itemEl);
    }

    dropup.append(btn, list);

    return dropup;
  }

  tags.append(...[
    {
      icon: "/assets/website-icon.png",
      items: data.websites
    },
    {
      icon: "/assets/status-icon.png",
      items: [data.status]
    },
    {
      icon: "/assets/lang-icon.png",
      items: data.langs
    }
  ].map(createDropup));


  outer.append(content, tags);

  return outer;
}

function refreshProjects() {
  document.getElementsByClassName("main")[0].innerHTML = "";
  fetch("/data/projects.json").then(n=>n.json()).then(n => n.sort((a, b) => b.score - a.score)).then(n => {
    const tags = Array.from(document.getElementsByTagName("input")).filter(n=>n.checked).map(n=>n.value);

    if(tags.length == 0)
      document.getElementsByClassName("main")[0].append(...n.map(createTile));
    else {
      const filtered = n.filter(item => {
        if(["GitHub", "Scratch", "Repl.it"].filter(n => tags.includes(n)).length > 0)
          for(let site of item.websites) {
            if(!tags.includes(site)) return false;
          }

        if(["Maintained", "Abandoned", "In-Progress", "Completed"].filter(n => tags.includes(n)).length > 0)
          if(!tags.includes(item.status)) return false;

        let langs = 1;
        if(window.LANGS.filter(n => tags.includes(n)).length > 0) {
          langs = 0;
          for(let lang of item.langs) {
            if(tags.includes(lang)) langs++;
          }
        }

        return langs > 0;
      });

      document.getElementsByClassName("main")[0].append(...filtered.map(createTile));
    }

  });
}


Array.from(document.getElementsByTagName("input")).forEach(checkbox => {
  checkbox.addEventListener("click", refreshProjects);
});


populateLangs();
refreshProjects();
