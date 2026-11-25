import * as categoryModel from '../models/categoryModel.js';

/**
 * Fetch all categories
 */
export async function fetchCategories() {
  try {
    const categories = await categoryModel.getCategories();
    return categories;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch categories');
  }
}

/**
 * Update a category
 */
export async function updateCategory(id, name, image_url) {
  try {
    if (!name && !image_url) {
      throw new Error('At least name or image_url is required');
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (image_url) updateData.image_url = image_url;

    const category = await categoryModel.updateCategory(id, updateData);
    
    if (!category) {
      throw new Error('Category not found');
    }

    return category;
  } catch (error) {
    throw new Error(error.message || 'Failed to update category');
  }
}
