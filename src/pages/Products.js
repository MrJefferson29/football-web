import React, { useState, useEffect, useRef } from 'react';
import { FaShoppingBag, FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaUpload, FaSpinner } from 'react-icons/fa';
import { productsAPI, uploadAPI } from '../utils/api';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'jersey',
    brand: '',
    price: '',
    originalPrice: '',
    thumbnail: '',
    images: [],
    sizes: [],
    colors: [],
    stock: '',
    isAvailable: true,
    isFeatured: false,
    isTrending: false,
    tags: [],
    specifications: {
      material: '',
      careInstructions: '',
      countryOfOrigin: '',
      warranty: ''
    }
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [uploading, setUploading] = useState({ thumbnail: false, images: false });
  const thumbnailInputRef = useRef(null);
  const imagesInputRef = useRef(null);

  const categories = ['jersey', 'shoes', 'accessories', 'equipment', 'merchandise', 'other'];
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', 'One Size'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getProducts();
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load products' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setShowForm(true);
    setEditing(null);
    setFormData({
      name: '',
      description: '',
      category: 'jersey',
      brand: '',
      price: '',
      originalPrice: '',
      thumbnail: '',
      images: [],
      sizes: [],
      colors: [],
      stock: '',
      isAvailable: true,
      isFeatured: false,
      isTrending: false,
      tags: [],
      specifications: {
        material: '',
        careInstructions: '',
        countryOfOrigin: '',
        warranty: ''
      }
    });
  };

  const handleEdit = (product) => {
    setEditing(product._id);
    setShowForm(true);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      category: product.category || 'jersey',
      brand: product.brand || '',
      price: product.price || '',
      originalPrice: product.originalPrice || '',
      thumbnail: product.thumbnail || '',
      images: product.images || [],
      sizes: product.sizes || [],
      colors: product.colors || [],
      stock: product.stock || '',
      isAvailable: product.isAvailable !== undefined ? product.isAvailable : true,
      isFeatured: product.isFeatured || false,
      isTrending: product.isTrending || false,
      tags: product.tags || [],
      specifications: product.specifications || {
        material: '',
        careInstructions: '',
        countryOfOrigin: '',
        warranty: ''
      }
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditing(null);
    setFormData({});
    setUploading({ thumbnail: false, images: false });
  };

  const handleImageUpload = async (e, type) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading({ ...uploading, [type]: true });
    try {
      if (type === 'thumbnail') {
        const response = await uploadAPI.uploadImage(files[0], 'products');
        if (response.success) {
          setFormData({ ...formData, thumbnail: response.data.url });
          setMessage({ type: 'success', text: 'Thumbnail uploaded successfully!' });
        } else {
          setMessage({ type: 'error', text: response.message || 'Image upload failed' });
        }
      } else if (type === 'images') {
        const uploadPromises = Array.from(files).map(file => uploadAPI.uploadImage(file, 'products'));
        const responses = await Promise.all(uploadPromises);
        const uploadedUrls = responses
          .filter(res => res.success)
          .map(res => res.data.url);
        
        if (uploadedUrls.length > 0) {
          setFormData({ ...formData, images: [...formData.images, ...uploadedUrls] });
          setMessage({ type: 'success', text: `${uploadedUrls.length} image(s) uploaded successfully!` });
        } else {
          setMessage({ type: 'error', text: 'Image upload failed' });
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Image upload failed' });
    } finally {
      setUploading({ ...uploading, [type]: false });
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const handleSizeToggle = (size) => {
    const newSizes = formData.sizes.includes(size)
      ? formData.sizes.filter(s => s !== size)
      : [...formData.sizes, size];
    setFormData({ ...formData, sizes: newSizes });
  };

  const handleColorAdd = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      const newColors = [...formData.colors, e.target.value.trim()];
      setFormData({ ...formData, colors: newColors });
      e.target.value = '';
    }
  };

  const handleColorRemove = (index) => {
    const newColors = formData.colors.filter((_, i) => i !== index);
    setFormData({ ...formData, colors: newColors });
  };

  const handleTagAdd = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      const newTags = [...formData.tags, e.target.value.trim()];
      setFormData({ ...formData, tags: newTags });
      e.target.value = '';
    }
  };

  const handleTagRemove = (index) => {
    const newTags = formData.tags.filter((_, i) => i !== index);
    setFormData({ ...formData, tags: newTags });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        stock: parseInt(formData.stock) || 0,
      };

      let response;
      if (editing) {
        response = await productsAPI.updateProduct(editing, productData);
      } else {
        response = await productsAPI.createProduct(productData);
      }

      if (response.success) {
        setMessage({ type: 'success', text: `Product ${editing ? 'updated' : 'created'} successfully!` });
        setShowForm(false);
        setEditing(null);
        setFormData({});
        fetchProducts();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || `Failed to ${editing ? 'update' : 'create'} product` });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await productsAPI.deleteProduct(id);
      if (response.success) {
        setMessage({ type: 'success', text: 'Product deleted successfully!' });
        fetchProducts();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to delete product' });
    }
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="products-page">
      <div className="page-header">
        <h1><FaShoppingBag /> Manage Shop Products</h1>
        <p>Create and manage sports items in the shop</p>
        <button className="btn-add" onClick={handleAdd}>
          <FaPlus /> Add New Product
        </button>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      {showForm && (
        <div className="product-form-card">
          <h3>{editing ? 'Edit Product' : 'Add New Product'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="4"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Brand</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Price *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Original Price (for discount)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Thumbnail Image</label>
              <div className="image-upload-section">
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'thumbnail')}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className="btn-upload"
                  onClick={() => thumbnailInputRef.current?.click()}
                  disabled={uploading.thumbnail}
                >
                  {uploading.thumbnail ? <FaSpinner className="spinner" /> : <FaUpload />}
                  {uploading.thumbnail ? 'Uploading...' : 'Upload Thumbnail'}
                </button>
                {formData.thumbnail && (
                  <div className="image-preview">
                    <img src={formData.thumbnail} alt="Thumbnail" />
                    <button
                      type="button"
                      className="btn-remove-image"
                      onClick={() => setFormData({ ...formData, thumbnail: '' })}
                    >
                      <FaTimes />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Product Images (Multiple)</label>
              <div className="image-upload-section">
                <input
                  ref={imagesInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageUpload(e, 'images')}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className="btn-upload"
                  onClick={() => imagesInputRef.current?.click()}
                  disabled={uploading.images}
                >
                  {uploading.images ? <FaSpinner className="spinner" /> : <FaUpload />}
                  {uploading.images ? 'Uploading...' : 'Upload Images'}
                </button>
                {formData.images.length > 0 && (
                  <div className="images-grid">
                    {formData.images.map((img, index) => (
                      <div key={index} className="image-preview">
                        <img src={img} alt={`Product ${index + 1}`} />
                        <button
                          type="button"
                          className="btn-remove-image"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Available Sizes</label>
              <div className="sizes-grid">
                {availableSizes.map(size => (
                  <label key={size} className="size-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.sizes.includes(size)}
                      onChange={() => handleSizeToggle(size)}
                    />
                    <span>{size}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Colors</label>
              <input
                type="text"
                placeholder="Press Enter to add color"
                onKeyPress={handleColorAdd}
              />
              {formData.colors.length > 0 && (
                <div className="tags-list">
                  {formData.colors.map((color, index) => (
                    <span key={index} className="tag">
                      {color}
                      <button type="button" onClick={() => handleColorRemove(index)}>
                        <FaTimes />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Tags</label>
              <input
                type="text"
                placeholder="Press Enter to add tag"
                onKeyPress={handleTagAdd}
              />
              {formData.tags.length > 0 && (
                <div className="tags-list">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                      <button type="button" onClick={() => handleTagRemove(index)}>
                        <FaTimes />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Specifications</label>
              <div className="form-row">
                <div className="form-group">
                  <label>Material</label>
                  <input
                    type="text"
                    value={formData.specifications.material}
                    onChange={(e) => setFormData({
                      ...formData,
                      specifications: { ...formData.specifications, material: e.target.value }
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>Country of Origin</label>
                  <input
                    type="text"
                    value={formData.specifications.countryOfOrigin}
                    onChange={(e) => setFormData({
                      ...formData,
                      specifications: { ...formData.specifications, countryOfOrigin: e.target.value }
                    })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Care Instructions</label>
                <textarea
                  value={formData.specifications.careInstructions}
                  onChange={(e) => setFormData({
                    ...formData,
                    specifications: { ...formData.specifications, careInstructions: e.target.value }
                  })}
                  rows="2"
                />
              </div>
              <div className="form-group">
                <label>Warranty</label>
                <input
                  type="text"
                  value={formData.specifications.warranty}
                  onChange={(e) => setFormData({
                    ...formData,
                    specifications: { ...formData.specifications, warranty: e.target.value }
                  })}
                />
              </div>
            </div>

            <div className="form-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                />
                Available
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                />
                Featured
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isTrending}
                  onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                />
                Trending
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-save">
                <FaSave /> {editing ? 'Update' : 'Create'} Product
              </button>
              <button type="button" className="btn-cancel" onClick={handleCancel}>
                <FaTimes /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="products-grid">
        {products.length === 0 ? (
          <div className="empty-state">
            <FaShoppingBag size={48} />
            <p>No products yet. Add your first product!</p>
          </div>
        ) : (
          products.map((product) => (
            <div key={product._id} className="product-card">
              <div className="product-image">
                {product.thumbnail ? (
                  <img src={product.thumbnail} alt={product.name} />
                ) : (
                  <div className="no-image">No Image</div>
                )}
                {product.isFeatured && <span className="badge featured">Featured</span>}
                {product.isTrending && <span className="badge trending">Trending</span>}
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-category">{product.category}</p>
                <p className="product-brand">{product.brand || 'No brand'}</p>
                <div className="product-price">
                  <span className="current-price">${product.price}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="original-price">${product.originalPrice}</span>
                  )}
                </div>
                <div className="product-meta">
                  <span>Stock: {product.stock}</span>
                  <span className={product.isAvailable ? 'available' : 'unavailable'}>
                    {product.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <div className="product-actions">
                  <button className="btn-edit" onClick={() => handleEdit(product)}>
                    <FaEdit /> Edit
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(product._id)}>
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Products;

