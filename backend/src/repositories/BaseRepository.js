export class BaseRepository {
  constructor(entityName, initialData = [], idField = 'id') {
    this.entityName = entityName;
    this.idField = idField;
    this.items = new Map();
    initialData.forEach(item => this.items.set(item[this.idField], { ...item }));
  }
  async findAll(filterFn = null) {
    const all = Array.from(this.items.values());
    if (typeof filterFn === 'function') {
      return all.filter(filterFn);
    }
    return all;
  }
  async findById(id) {
    const item = this.items.get(id);
    return item ? { ...item } : null;
  }
  async create(data) {
    const id = data[this.idField] || `${this.entityName.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const record = { ...data, [this.idField]: id, createdAt: new Date().toISOString() };
    this.items.set(id, record);
    return { ...record };
  }
  async update(id, updateData) {
    const existing = this.items.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updateData, updatedAt: new Date().toISOString() };
    this.items.set(id, updated);
    return { ...updated };
  }
  async delete(id) {
    return this.items.delete(id);
  }
  async count(filterFn = null) {
    return (await this.findAll(filterFn)).length;
  }
}
