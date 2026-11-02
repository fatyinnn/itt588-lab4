export class FamilyView {
  constructor(root) { this.root = root; }

  card(p) {
    const died = p.dateOfDeath ? ` – ${p.dateOfDeath.slice(0, 4)}` : "";
    const status = p.dateOfDeath ? "deceased" : "";
    return `
        <a class="card ${p.gender} ${status}" href="member.html?id=${p.id}">
        <strong>${p.name}</strong>
        <small>${p.dob.slice(0, 4)}${died}</small>
        <small>${p.profession || ""}</small>
        </a>`;
    }

  // Satu node = person + spouse + anak (rekursif)
  node(p, model, seen = new Set()) {
    if (seen.has(p.id)) return "";
    seen.add(p.id);

    const spouses = model.getSpouses(p).map(s => s.person).filter(Boolean);
    spouses.forEach(s => seen.add(s.id));

    const children = model.getChildren(p)
      .filter((c, i, arr) => arr.findIndex(x => x.id === c.id) === i);

    return `
      <li>
        <div class="couple">
          ${this.card(p)}
          ${spouses.map(s => `<span class="heart">♥</span>${this.card(s)}`).join("")}
        </div>
        ${children.length
          ? `<ul>${children.map(c => this.node(c, model, seen)).join("")}</ul>`
          : ""}
      </li>`;
  }

  renderTree(model) {
  const main = model.getMainPerson();
  const spouse = model.getSpouses(main).map(s => s.person).filter(Boolean)[0] || null;

  const seen = new Set([main.id]);
  if (spouse) seen.add(spouse.id);

  // satu lajur = ibu bapa (kalau ada) di atas, garisan, kemudian kad orang tu
  const column = person => {
    const parents = model.getParents(person);
    return `
      <div class="col">
        ${parents.length ? `
          <div class="couple">
            ${parents.map(p => this.card(p)).join('<span class="heart">♥</span>')}
          </div>
          <div class="vline"></div>` : ""}
        ${this.card(person)}
      </div>`;
  };

  const children = model.getChildren(main);
  const kids = children.length
    ? `<ul class="tree">${children.map(c => this.node(c, model, seen)).join("")}</ul>`
    : "";

  this.root.innerHTML = `
    <div class="lineage">
      <div class="main-row">
        ${column(main)}
        ${spouse ? `<span class="heart">♥</span>${column(spouse)}` : ""}
      </div>
      ${kids}
    </div>`;
}

  renderList(people) {
    this.root.innerHTML = people.length
        ? `<div class="grid">${people.map(p => this.card(p)).join("")}</div>`
        : `<p>No members match your search. Try changing or resetting the filters.</p>`;
    }

    renderDetail(p, model) {
    const link = x => x ? `<a href="member.html?id=${x.id}">${x.name}</a>` : "-";
    const list = arr => arr.length ? arr.map(link).join(", ") : "-";
    this.root.innerHTML = `
        <h2>${p.name}</h2>
        <table>
        <tr><th>Date of birth</th><td>${p.dob}</td></tr>
        <tr><th>Date of death</th><td>${p.dateOfDeath || "-"}</td></tr>
        <tr><th>Occupation</th><td>${p.profession || "-"}</td></tr>
        <tr><th>Address</th><td>${p.address}</td></tr>
        <tr><th>Father</th><td>${link(model.getFather(p))}</td></tr>
        <tr><th>Mother</th><td>${link(model.getMother(p))}</td></tr>
        <tr><th>Spouse</th><td>${list(model.getSpouses(p).map(s => s.person))}</td></tr>
        <tr><th>Children</th><td>${list(model.getChildren(p))}</td></tr>
        <tr><th>Siblings</th><td>${list(model.getSiblings(p))}</td></tr>
        </table>`;
    }

    renderDirectory(people, key = "dob", dir = 1) {
    const th = (label, k) => {
        const arrow = k === key ? (dir === 1 ? " ▲" : " ▼") : "";
        return `<th><button type="button" class="sort-btn" data-sort="${k}">${label}${arrow}</button></th>`;
    };
    const rows = people.map(p => `
        <tr>
        <td><a href="member.html?id=${p.id}">${p.name}</a></td>
        <td>${p.gender === "male" ? "Male" : "Female"}</td>
        <td>${p.dob}</td>
        <td>${p.dateOfDeath ? "Deceased" : "Living"}</td>
        <td>${p.address}</td>
        <td>${p.profession || "-"}</td>
        </tr>`).join("");

    this.root.innerHTML = `
        <div class="table-wrap">
        <table class="directory">
            <thead>
            <tr>
                ${th("Name", "name")}
                <th>Gender</th>
                ${th("Date of birth", "dob")}
                <th>Status</th>
                ${th("Location", "address")}
                ${th("Occupation", "profession")}
            </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
        </div>`;
    }
}