export class FamilyController {
  constructor(model, view) { this.model = model; this.view = view; }

  async initIndex() {
    await this.model.load("data/people.json");
    document.querySelector("h1").textContent = this.model.title;
    const gens = this.model.getGenerations();
document.getElementById("summary").textContent =
  `${gens} ${gens === 1 ? "generation" : "generations"}`;

    // isi dropdown alamat
    const sel = document.getElementById("address");
    this.model.getAddresses().forEach(a => sel.add(new Option(a, a)));

    this.view.renderTree(this.model);
    ["search", "gender", "address", "alive"].forEach(id =>
      document.getElementById(id).addEventListener("input", () => this.applyFilter()));
    document.getElementById("reset").addEventListener("click", () => this.reset());
  }

  applyFilter() {
    const f = {
      text: document.getElementById("search").value,
      gender: document.getElementById("gender").value,
      address: document.getElementById("address").value,
      alive: document.getElementById("alive").value
    };
    const isDefault = !f.text && f.gender === "all" && f.address === "all" && f.alive === "all";
    isDefault ? this.view.renderTree(this.model)
              : this.view.renderList(this.model.filter(f));
  }

  reset() {
    document.querySelectorAll("#filters input, #filters select")
      .forEach(el => el.value = el.tagName === "SELECT" ? "all" : "");
    this.view.renderTree(this.model);
  }

  async initMember() {
    await this.model.load("data/people.json");
    const id = new URLSearchParams(location.search).get("id");
    const p = this.model.getById(id);
    p ? this.view.renderDetail(p, this.model)
      : (document.getElementById("app").innerHTML = "<p>Member not found.</p>");
  }

    async initDirectory() {
    await this.model.load("data/people.json");
    this.sortKey = "dob";
    this.sortDir = 1;

    const n = this.model.people.length;
    document.getElementById("summary").textContent = `${n} ${n === 1 ? "member" : "members"}`;

    this.drawDirectory();
    this.view.root.addEventListener("click", e => {
        const btn = e.target.closest("button[data-sort]");
        if (!btn) return;
        const key = btn.dataset.sort;
        this.sortDir = key === this.sortKey ? -this.sortDir : 1;
        this.sortKey = key;
        this.drawDirectory();
    });
    }

    drawDirectory() {
    const k = this.sortKey, d = this.sortDir;
    const sorted = [...this.model.people]
        .sort((a, b) => String(a[k] || "").localeCompare(String(b[k] || "")) * d);
    this.view.renderDirectory(sorted, k, d);
    }
}