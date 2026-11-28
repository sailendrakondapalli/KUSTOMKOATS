import * as categoryService from '../services/categoryService.js';

/**
 * Get all categories
 */
export async function getCategories(req, res) {
  try {
    const data = await categoryService.fetchCategories();

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
}

/**
 * Update category (admin only)
 */
export async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, image_url } = req.body;

    const data = await categoryService.updateCategory(id, name, image_url);

    res.json({
      success: true,
      message: 'Category updated successfully',
      data
    });
  } catch (error) {
    console.error('Error updating category:', error);
    
    if (error.message === 'Category not found') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    if (error.message === 'At least name or image_url is required') {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update category'
    });
  }
}
