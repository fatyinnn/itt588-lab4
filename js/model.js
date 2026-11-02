export class FamilyModel {
  constructor() { this.title = ""; this.people = []; }

  async load(url) {
    const res = await fetch(url);
    const data = await res.json();
    this.title = data.title;
    this.people = data.people;
  }

  getById(id) { return this.people.find(p => p.id === id) || null; }

  getFather(p) { return p.fatherId ? this.getById(p.fatherId) : null; }
  getMother(p) { return p.motherId ? this.getById(p.motherId) : null; }
  getParents(p) {
    return [this.getFather(p), this.getMother(p)].filter(Boolean);
    }

// Orang pertama dalam JSON jadi titik mula tree
getMainPerson() { return this.people[0]; }

  getSpouses(p) {
    return p.spouses.map(s => ({ person: this.getById(s.id), status: s.status }));
  }

  getChildren(p) {
    return this.people.filter(c => c.fatherId === p.id || c.motherId === p.id);
  }

  getSiblings(p) {
    return this.people.filter(o =>
      o.id !== p.id &&
      ((p.fatherId && o.fatherId === p.fatherId) ||
       (p.motherId && o.motherId === p.motherId)));
  }

  // Orang paling atas (tiada ibu bapa & bukan menantu) = root tree
  getRoots() {
    return this.people.filter(p => !p.fatherId && !p.motherId && !p.isInLaw);
  }

  filter({ text = "", gender = "all", address = "all", alive = "all" }) {
    return this.people.filter(p =>
      p.name.toLowerCase().includes(text.toLowerCase()) &&
      (gender === "all" || p.gender === gender) &&
      (address === "all" || p.address === address) &&
      (alive === "all" || (alive === "alive") === !p.dateOfDeath));
  }

  getAddresses() { return [...new Set(this.people.map(p => p.address))]; }

  getGenerations() {
    const depth = p => {
        const parents = this.getParents(p);
        return parents.length ? 1 + Math.max(...parents.map(depth)) : 1;
    };
    return Math.max(...this.people.map(depth));
    }
}