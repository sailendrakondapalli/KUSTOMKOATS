import uow from '../db/uow.js';

function autoSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function isAdmin(user) {
  return user.role === 'admin' || user.email === process.env.ADMIN_EMAIL;
}

export const CategoryService = {
  // ── Main Categories ────────────────────────────────────────────

  async listCategories(activeOnly = true) {
    return uow.categories.findAll(activeOnly);
  },

  async getCategoryBySlug(slug) {
    const cat = await uow.categories.findBySlug(slug);
    if (!cat) throw Object.assign(new Error('Category not found'), { status: 404 });
    return cat;
  },

  async createCategory(payload, user) {
    if (!isAdmin(user)) throw Object.assign(new Error('Admin access required'), { status: 403 });
    const slug = payload.slug || autoSlug(payload.name);
    return uow.categories.create({ ...payload, slug });
  },

  async updateCategory(id, payload, user) {
    if (!isAdmin(user)) throw Object.assign(new Error('Admin access required'), { status: 403 });
    if (payload.name && !payload.slug) payload.slug = autoSlug(payload.name);
    return uow.categories.update(id, payload);
  },

  async deleteCategory(id, user) {
    if (!isAdmin(user)) throw Object.assign(new Error('Admin access required'), { status: 403 });
    const count = await uow.categories.countSubcategories(id);
    if (count > 0) {
      throw Object.assign(
        new Error(`Cannot delete: ${count} subcategorie(s) exist. Remove them first.`),
        { status: 409 }
      );
    }
    await uow.categories.delete(id);
  },

  // ── Category Banners ───────────────────────────────────────────

  async listCategoryBanners(categoryId) {
    return uow.categories.findBanners(categoryId);
  },

  async createCategoryBanner(categoryId, payload, user) {
    if (!isAdmin(user)) throw Object.assign(new Error('Admin access required'), { status: 403 });
    return uow.categories.createBanner({ ...payload, category_id: categoryId });
  },

  async updateCategoryBanner(categoryId, bannerId, payload, user) {
    if (!isAdmin(user)) throw Object.assign(new Error('Admin access required'), { status: 403 });
    return uow.categories.updateBanner(bannerId, categoryId, payload);
  },

  async deleteCategoryBanner(categoryId, bannerId, user) {
    if (!isAdmin(user)) throw Object.assign(new Error('Admin access required'), { status: 403 });
    await uow.categories.deleteBanner(bannerId, categoryId);
  },

  // ── Subcategories ──────────────────────────────────────────────

  async listSubcategories(filters) {
    return uow.categories.findSubcategories(filters);
  },

  async getSubcategoryBySlug(slug) {
    const sub = await uow.categories.findSubcategoryBySlug(slug);
    if (!sub) throw Object.assign(new Error('Subcategory not found'), { status: 404 });
    return sub;
  },

  async createSubcategory(payload, user) {
    if (!isAdmin(user)) throw Object.assign(new Error('Admin access required'), { status: 403 });
    const slug = payload.slug || autoSlug(payload.name);
    return uow.categories.createSubcategory({ ...payload, slug });
  },

  async updateSubcategory(id, payload, user) {
    if (!isAdmin(user)) throw Object.assign(new Error('Admin access required'), { status: 403 });
    if (payload.name && !payload.slug) payload.slug = autoSlug(payload.name);
    return uow.categories.updateSubcategory(id, payload);
  },

  async deleteSubcategory(id, user) {
    if (!isAdmin(user)) throw Object.assign(new Error('Admin access required'), { status: 403 });
    const count = await uow.categories.countProductsInSubcategory(id);
    if (count > 0) {
      throw Object.assign(
        new Error(`Cannot delete: ${count} product(s) assigned. Reassign them first.`),
        { status: 409 }
      );
    }
    await uow.categories.deleteSubcategory(id);
  },

  // ── Subcategory Banners ────────────────────────────────────────

  async listSubcategoryBanners(subcategoryId) {
    return uow.categories.findSubcategoryBanners(subcategoryId);
  },

  async createSubcategoryBanner(subcategoryId, payload, user) {
    if (!isAdmin(user)) throw Object.assign(new Error('Admin access required'), { status: 403 });
    return uow.categories.createSubcategoryBanner({ ...payload, subcategory_id: subcategoryId });
  },

  async updateSubcategoryBanner(subcategoryId, bannerId, payload, user) {
    if (!isAdmin(user)) throw Object.assign(new Error('Admin access required'), { status: 403 });
    return uow.categories.updateSubcategoryBanner(bannerId, subcategoryId, payload);
  },

  async deleteSubcategoryBanner(subcategoryId, bannerId, user) {
    if (!isAdmin(user)) throw Object.assign(new Error('Admin access required'), { status: 403 });
    await uow.categories.deleteSubcategoryBanner(bannerId, subcategoryId);
  },
};
