import Dexie from 'dexie'

// IndexedDB for offline storage
const db = new Dexie('KustomKoatsPOS')

db.version(1).stores({
  products: 'id, custom_id, name, price, stock',
  pendingSales: '++id, timestamp, synced',
  localStock: 'product_id, quantity'
})

// Global lock to prevent concurrent database operations
let dbLock = false

// Helper to wait for lock
async function waitForLock(maxWait = 5000) {
  const startTime = Date.now()
  while (dbLock) {
    if (Date.now() - startTime > maxWait) {
      throw new Error('Database lock timeout')
    }
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  dbLock = true
}

// Helper to release lock
function releaseLock() {
  dbLock = false
}

// Sync products to local DB
export async function syncProductsToLocal(products) {
  try {
    await waitForLock()
    await db.products.clear()
    await db.products.bulkAdd(products)
  } catch (error) {
    console.error('Error syncing products to local DB:', error)
  } finally {
    releaseLock()
  }
}

// Get all products from local DB
export async function getLocalProducts() {
  try {
    await waitForLock()
    const products = await db.products.toArray()
    return products
  } catch (error) {
    console.error('Error getting local products:', error)
    return []
  } finally {
    releaseLock()
  }
}

// Search products locally
export async function searchLocalProducts(query) {
  try {
    await waitForLock()
    const results = await db.products
      .filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        (p.custom_id && p.custom_id.toLowerCase().includes(query.toLowerCase()))
      )
      .toArray()
    return results
  } catch (error) {
    console.error('Error searching local products:', error)
    return []
  } finally {
    releaseLock()
  }
}

// Save pending sale (offline)
export async function savePendingSale(sale) {
  try {
    await waitForLock()
    const id = await db.pendingSales.add({
      ...sale,
      timestamp: Date.now(),
      synced: false
    })
    return id
  } catch (error) {
    console.error('Error saving pending sale:', error)
    throw error
  } finally {
    releaseLock()
  }
}

// Get all pending sales
export async function getPendingSales() {
  try {
    await waitForLock()
    const sales = await db.pendingSales.where('synced').equals(false).toArray()
    return sales
  } catch (error) {
    // Silently handle DB errors - return empty array
    // This can happen if DB is being accessed from multiple tabs
    return []
  } finally {
    releaseLock()
  }
}

// Mark sale as synced
export async function markSaleAsSynced(id) {
  try {
    await waitForLock()
    await db.pendingSales.update(id, { synced: true })
  } catch (error) {
    console.error('Error marking sale as synced:', error)
  } finally {
    releaseLock()
  }
}

// Update local stock
export async function updateLocalStock(productId, quantitySold) {
  try {
    await waitForLock()
    const product = await db.products.get(productId)
    if (product) {
      await db.products.update(productId, {
        stock: Math.max(0, product.stock - quantitySold)
      })
    }
  } catch (error) {
    console.error('Error updating local stock:', error)
  } finally {
    releaseLock()
  }
}

// Get local stock for a product
export async function getLocalStock(productId) {
  try {
    await waitForLock()
    const product = await db.products.get(productId)
    return product ? product.stock : 0
  } catch (error) {
    console.error('Error getting local stock:', error)
    return 0
  } finally {
    releaseLock()
  }
}

export default db
