import uow from '../db/uow.js';

const SAFE_FIELDS = [
  'id', 'name', 'description', 'price', 'original_price',
  'category', 'subcategory', 'subcategory_id', 'stock',
  'images', 'custom_id', 'status', 'is_featured', 'tags', 'size',
];

function shape(product, includePrivate = false) {
  if (!product) return null;
  if (!includePrivate) {
    return Object.fromEntries(
      SAFE_FIELDS.filter(k => k in product).map(k => [k, product[k]])
    );
  }
  return product;
}

export const ProductService = {
  async list(filters, user) {
    const { products, count } = await uow.products.findAll(filters);
    return { products: products.map(p => shape(p)), count };
  },

  async get(id) {
    const product = await uow.products.findById(id);
    if (!product) throw Object.assign(new Error('Product not found'), { status: 404 });
    return shape(product, true);
  },

  async create(payload, user) {
    if (user.role !== 'admin' && user.email !== process.env.ADMIN_EMAIL) {
      throw Object.assign(new Error('Admin access required'), { status: 403 });
    }
    const product = await uow.products.create({ ...payload, created_by: user.id });
    return product;
  },

  async update(id, payload, user) {
    if (user.role !== 'admin' && user.email !== process.env.ADMIN_EMAIL) {
      throw Object.assign(new Error('Admin access required'), { status: 403 });
    }
    const product = await uow.products.update(id, payload);
    if (!product) throw Object.assign(new Error('Product not found'), { status: 404 });
    return product;
  },

  async remove(id, user) {
    if (user.role !== 'admin' && user.email !== process.env.ADMIN_EMAIL) {
      throw Object.assign(new Error('Admin access required'), { status: 403 });
    }
    const result = await uow.products.delete(id);
    if (!result) throw Object.assign(new Error('Product not found'), { status: 404 });
    return true;
  },

  async getBundles(productId) {
    return uow.products.getBundles(productId);
  },

  async replaceBundles(productId, bundleIds, user) {
    if (user.role !== 'admin' && user.email !== process.env.ADMIN_EMAIL) {
      throw Object.assign(new Error('Admin access required'), { status: 403 });
    }
    await uow.products.replaceBundles(productId, bundleIds);
    return true;
  },
};
