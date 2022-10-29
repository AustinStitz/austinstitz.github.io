const {populateLangs, updateLangs} = (() => {
  const oldElements = Array.from(document.getElementsByTagName("input"));
  const elements = [];
  const hidden = document.createDocumentFragment();

  const list = document.getElementById("langs");

  let isPartial;

  function populateLangs(partial = true, callback = null) {
    isPartial = partial;

    fetch("/data/langs.json").then(n=>n.json()).then(n => {
      window.LANGS = n;
      list.innerHTML = "";

      for(let i in n) {
        const lang = n[i];
        const chk = document.createElement("input");
        chk.setAttribute("type", "checkbox");
        chk.setAttribute("id", "lang" + i);
        chk.setAttribute("name", "lang" + i);
        chk.setAttribute("value", lang);

        const label = document.createElement("label");
        label.setAttribute("for", "lang" + i);
        label.textContent = lang;
        chk.addEventListener("click", () => {
          window.history.replaceState(null, null, '?tags=' + Array.from(elements).map(n=>n[0]).concat(oldElements).filter(n => n.checked).map(n => encodeURIComponent(n.value)));
          refreshProjects();
          updateLangs(isPartial);
        });

        const entireCheckbox = [chk, label, document.createElement("BR")];
        elements.push(entireCheckbox);

        if(partial && i > 10) {
          hidden.append(...entireCheckbox);
        } else {
          list.append(...entireCheckbox);
        }
      }

      if(partial) {
        const btn = document.createElement("a");
        btn.href = "javascript:updateLangs(false);";
        btn.textContent = "Load more...";
        list.append(btn);
      } else {
        const btn = document.createElement("a");
        btn.href = "javascript:updateLangs();";
        btn.textContent = "Load less...";
        list.append(btn);
      }

      if(callback != null) callback(elements, oldElements);
    });
  }


  function updateLangs(partial = true, callback = null) {
    isPartial = partial;

    fetch("/data/langs.json").then(n=>n.json()).then(n => {
      const hiddenTemp = document.createDocumentFragment();
      hiddenTemp.append(...(Array.from(list.children).filter(el => el.tagName != "A")));
      hiddenTemp.append(...Array.from(hidden.children));
      list.innerHTML = "";

      let j = 0;
      for(let entireCheckbox of elements) {
        if(entireCheckbox[0].checked) {
          list.append(...entireCheckbox);
          j++;
        }
      }

      for(let entireCheckbox of elements) {
        if(entireCheckbox[0].checked) continue;

        if(partial && j > 10) {
          hidden.append(...entireCheckbox);
        } else {
          list.append(...entireCheckbox);
        }
        j++;
      }

      if(partial) {
        const btn = document.createElement("a");
        btn.href = "javascript:updateLangs(false);";
        btn.textContent = "Load more...";
        list.append(btn);
      } else {
        const btn = document.createElement("a");
        btn.href = "javascript:updateLangs();";
        btn.textContent = "Load less...";
        list.append(btn);
      }

      if(callback != null) callback(elements, oldElements);
    });
  }



  Array.from(document.getElementsByTagName("input")).forEach(checkbox => {
    checkbox.addEventListener("click", () => {
      window.history.replaceState(null, null, '?tags=' + Array.from(elements).map(n=>n[0]).concat(oldElements).filter(n => n.checked).map(n => encodeURIComponent(n.value)));
      refreshProjects();
    });
  });



  return {populateLangs, updateLangs};
})();


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
      icon: "/assets/category-icon.png",
      items: data.types
    }
  ].map(createDropup));

  if(data.langs.length > 0)
    tags.append(createDropup({
      icon: "/assets/lang-icon.png",
      items: data.langs
    }));


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

        if(["GitHub", "Scratch", "Repl.it", "Physical", "Unpublished"].filter(n => tags.includes(n)).length > 0) {
          let b = false;

          for(let site of item.websites) {
            if(tags.includes(site)) b = true;
          }

          if(!b) return false;
        }

        if(["Software", "Engineering", "Electronics", "Robotics", "Misc"].filter(n => tags.includes(n)).length > 0) {
          let b = false;

          for(let site of item.types) {
            if(tags.includes(site)) b = true;
          }

          if(!b) return false;
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


const parseQuery = ((elements, oldElements) => {
  const parsedQuery = location.search.replace("?", "").split("&").map(n=>n.split("=").map(n=>decodeURIComponent(n)));

  const query = {};

  for(let item of parsedQuery) {
    query[item[0]] = item[1];
  }

  if("tags" in query) {
    query.tags.split(",").forEach(tag => {
      const inputs = Array.from(elements).map(n => n[0]).concat(oldElements);

      const el = inputs.find(item => item.getAttribute("value") == tag);

      if(el)
        el.checked = true;
    });
  }

  updateLangs(true, refreshProjects);
});


populateLangs(true, parseQuery);
