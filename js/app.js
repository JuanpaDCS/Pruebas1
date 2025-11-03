// js/app.js

// --- Imports de API ---
import { registerUser, loginUser } from './api/auth.api.js';
import { getCategories, createCategory, getCategoryById, updateCategory, deleteCategory } from './api/category.api.js';
import { createRestaurant, getRestaurants, deleteRestaurant, getRestaurantById, updateRestaurant } from './api/restaurant.api.js';
import { getDishesByRestaurant, createDish, getDishById, updateDish, deleteDish } from './api/dish.api.js';
import { getReviewsByDish, createDishReview, updateDishReview, deleteDishReview } from './api/dishReview.api.js';
import { getReviewsByRestaurant, createRestaurantReview, updateRestaurantReview, deleteRestaurantReview } from './api/review.api.js';
import AuthService from './services/auth.service.js';

// --- Contenedor Principal y Estado ---
const appRoot = document.getElementById('app-root');
const state = {
  currentRestaurantId: null,
  editingDishId: null,
  currentDishReviewModal: { 
    dishId: null,
    dishName: null,
    editingReviewId: null
  },
  editingRestaurantReviewId: null, 
  previousPage: 'login'
};

// --- FUNCIÓN AUXILIAR DE RENDERIZADO DE IMAGEN ---
function renderImage(imageUrl, altText, placeholderClass = 'dish-image-placeholder') {
  if (imageUrl) {
    return `
      <div class="${placeholderClass.replace('placeholder', 'container')}">
        <img 
          src="${imageUrl}" 
          alt="${altText}" 
          class="${placeholderClass.replace('placeholder', 'image')}" 
          onerror="this.outerHTML = '<div class=\\'${placeholderClass}\\'>URL inválida</div>'"
        >
      </div>`;
  } else {
    return `
      <div class="${placeholderClass.replace('placeholder', 'container')}">
        <div class="${placeholderClass}">Sin imagen</div>
      </div>`;
  }
}

// ... (loadPage, initRegisterPage, initLoginPage, initAdminPage, initRestaurantsPage, initRestaurantDetailPage, initAdminCategoriesPage se quedan igual) ...
async function loadPage(page) {
  try {
    const response = await fetch(`./js/components/${page}.html`); 
    if (!response.ok) throw new Error(`No se pudo cargar ${page}.html`);
    const html = await response.text();
    appRoot.innerHTML = html;
    
    if (page === 'register') {
      initRegisterPage();
    } else if (page === 'login') {
      initLoginPage();
    } else if (page === 'admin') {
      initAdminPage();
    } else if (page === 'restaurant-detail') { 
      initRestaurantDetailPage();
    } else if (page === 'admin-categories') { 
      initAdminCategoriesPage();
    } else if (page === 'restaurants') { 
      initRestaurantsPage();
    }
  } catch (error) {
    console.error('Error al cargar la página:', error);
    appRoot.innerHTML = '<h1>Error al cargar el contenido.</h1>';
  }
}
function initRegisterPage() {
  const registerForm = document.getElementById('registerForm');
  const showLoginLink = document.getElementById('showLoginLink');
  registerForm.addEventListener('submit', handleRegisterSubmit);
  showLoginLink.addEventListener('click', (e) => { e.preventDefault(); loadPage('login'); });
}
function initLoginPage() {
  const loginForm = document.getElementById('loginForm');
  const showRegisterLink = document.getElementById('showRegisterLink2');
  loginForm.addEventListener('submit', handleLoginSubmit);
  showRegisterLink.addEventListener('click', (e) => { e.preventDefault(); loadPage('register'); });
}
function initAdminPage() {
  state.previousPage = 'admin'; 
  const createRestaurantForm = document.getElementById('createRestaurantForm');
  const logoutButtons = document.querySelectorAll('.logout-btn');
  const manageCategoriesBtn = document.getElementById('manageCategoriesBtn'); 
  
  createRestaurantForm.addEventListener('submit', handleCreateRestaurantSubmit);
  logoutButtons.forEach(btn => btn.addEventListener('click', handleLogout));
  manageCategoriesBtn.addEventListener('click', () => loadPage('admin-categories')); 
  
  const editModal = document.getElementById('editModal');
  const editForm = document.getElementById('editRestaurantForm');
  const closeModalBtn = editModal.querySelector('.modal-close-btn');
  closeModalBtn.addEventListener('click', () => {
    editModal.style.display = 'none';
  });
  editForm.addEventListener('submit', handleEditRestaurantSubmit);
  
  loadAdminDashboard();
}
function initRestaurantsPage() {
  state.previousPage = 'restaurants';
  const logoutButtons = document.querySelectorAll('.logout-btn');
  logoutButtons.forEach(btn => btn.addEventListener('click', handleLogout));
  renderUserRestaurants();
}
function initRestaurantDetailPage() {
  loadRestaurantDetailData();
  
  const backBtn = document.getElementById('backToAdminBtn');
  backBtn.textContent = `← Volver a ${state.previousPage === 'admin' ? 'Panel' : 'Restaurantes'}`;
  backBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loadPage(state.previousPage); 
  });

  const userRole = AuthService.getUserRole();
  const addDishBtn = document.getElementById('addDishBtn');
  const addReviewBtn = document.getElementById('addReviewBtn'); 

  if (userRole === 'administrador') {
    addDishBtn.style.display = 'block';
    addReviewBtn.style.display = 'none'; 
  } else {
    addDishBtn.style.display = 'none'; 
    addReviewBtn.style.display = 'block'; 
  }

  const cancelDishBtn = document.getElementById('cancelDishBtn');
  const addDishFormEl = document.getElementById('addDishForm');
  const dishForm = document.getElementById('dishForm'); 
  addDishBtn.addEventListener('click', () => {
    resetDishForm(); 
    addDishFormEl.style.display = 'block'; 
  });
  cancelDishBtn.addEventListener('click', () => {
    addDishFormEl.style.display = 'none'; 
    resetDishForm();
  });
  dishForm.addEventListener('submit', handleDishFormSubmit); 

  const dishReviewModal = document.getElementById('dishReviewModal');
  const closeReviewModalBtn = dishReviewModal.querySelector('.modal-close-btn');
  const dishReviewForm = document.getElementById('dishReviewForm');
  closeReviewModalBtn.addEventListener('click', () => {
    dishReviewModal.style.display = 'none';
  });
  dishReviewForm.addEventListener('submit', handleDishReviewFormSubmit);
  initStarRating(document.getElementById('dishReviewRatingStars'), document.getElementById('dishReviewRating'));
  document.getElementById('cancelDishReviewEditBtn').addEventListener('click', resetDishReviewForm);
  
  const addReviewFormEl = document.getElementById('addReviewForm');
  const restaurantReviewForm = document.getElementById('restaurantReviewForm');
  const cancelRestaurantReviewBtn = document.getElementById('cancelRestaurantReviewEditBtn');

  addReviewBtn.addEventListener('click', () => {
    resetRestaurantReviewForm();
    addReviewFormEl.style.display = 'block';
  });
  cancelRestaurantReviewBtn.addEventListener('click', () => {
    addReviewFormEl.style.display = 'none';
    resetRestaurantReviewForm();
  });
  restaurantReviewForm.addEventListener('submit', handleRestaurantReviewFormSubmit);
  initStarRating(document.getElementById('restaurantReviewRatingStars'), document.getElementById('restaurantReviewRating'));
}
function initAdminCategoriesPage() {
  const backBtn = document.getElementById('backToAdminBtn');
  backBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loadPage('admin'); 
  });
  const createCategoryForm = document.getElementById('createCategoryForm');
  createCategoryForm.addEventListener('submit', handleCreateCategorySubmit);
  const editModal = document.getElementById('categoryEditModal');
  const editForm = document.getElementById('editCategoryForm');
  const closeModalBtn = editModal.querySelector('.modal-close-btn');
  closeModalBtn.addEventListener('click', () => {
    editModal.style.display = 'none';
  });
  editForm.addEventListener('submit', handleEditCategorySubmit);
  renderCategories(); 
}

// ... (Lógica de Autenticación, Navegación, Panel de Admin, Panel de Usuario, Detalle...
// ... y Lógica de Platillos se quedan igual) ...
async function handleRegisterSubmit(event) {
  event.preventDefault(); 
  const registerForm = event.target;
  const formData = new FormData(registerForm);
  const data = Object.fromEntries(formData.entries());
  if (data.password !== data.confirmPassword) {
    alert('Las contraseñas no coinciden.');
    return;
  }
  const userData = {
      username: data.fullName,
      email: data.email,
      password: data.password
  };
  try {
    const result = await registerUser(userData);
    AuthService.saveToken(result.token);
    alert('¡Registro exitoso! Por favor, inicia sesión.');
    loadPage('login'); 
  } catch (error) {
    console.error('Error en el registro:', error);
    alert(error.message);
  }
}
async function handleLoginSubmit(event) {
    event.preventDefault();
    const loginForm = event.target;
    const formData = new FormData(loginForm);
    const credentials = Object.fromEntries(formData.entries());
    try {
      const result = await loginUser(credentials);
      AuthService.saveToken(result.token);
      checkUserRoleAndNavigate(); 
    } catch (error) {
      console.error('Error en el login:', error);
      alert(error.message);
    }
}
function handleLogout() {
  AuthService.logout();
  alert('Has cerrado sesión.');
  loadPage('login'); 
}
function checkUserRoleAndNavigate() {
  const role = AuthService.getUserRole();
  if (role === 'administrador') {
    loadPage('admin');
  } else if (role === 'usuario') {
    loadPage('restaurants'); 
  } else {
    loadPage('register'); 
  }
}
async function loadAdminDashboard() {
  try {
    const categories = await getCategories();
    await populateCategoryDropdown(categories, 'select[name="restaurantCategory"]');
    await populateCategoryDropdown(categories, 'select[name="editRestaurantCategory"]');
  } catch (error) {
    console.error('Error al cargar categorías para admin:', error);
  }
  await renderAdminRestaurants(); 
}
async function populateCategoryDropdown(categories, selector) {
  try {
    const categorySelect = appRoot.querySelector(selector);
    if (!categorySelect) return; 
    categorySelect.innerHTML = '<option value="">Selecciona una categoría</option>';
    if (!categories || categories.length === 0) {
      categorySelect.innerHTML += '<option value="" disabled>No hay categorías creadas.</option>';
      return;
    }
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category._id; 
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error populando categorías:', error);
  }
}
async function renderAdminRestaurants() {
  try {
    const restaurants = await getRestaurants();
    const listContainer = document.getElementById('adminRestaurantsList');
    if (!listContainer) return; 
    listContainer.innerHTML = ''; 
    if (restaurants.length === 0) {
      listContainer.innerHTML = '<p class="no-restaurants">Aún no has creado ningún restaurante.</p>';
      return;
    }
    restaurants.forEach(restaurant => {
      const card = document.createElement('div');
      card.className = 'restaurant-card admin-card';
      card.dataset.id = restaurant._id; 
      card.innerHTML = `
        ${renderImage(restaurant.imageUrl, restaurant.name, 'restaurant-card-placeholder')}
        <div class="restaurant-info">
            <h3 class="restaurant-title">${restaurant.name}</h3>
            <p>${restaurant.description}</p>
            <div class="restaurant-details">
                <span class="category">${restaurant.categoryDetails?.name || 'Sin Categoría'}</span>
                <span class="location">📍 ${restaurant.location || 'Sin Ubicación'}</span>
            </div>
            <div class="admin-actions">
                <button class="btn-edit" data-id="${restaurant._id}">✏️ Editar</button>
                <button class="btn-delete" data-id="${restaurant._id}">🗑️ Eliminar</button>
            </div>
        </div>
      `;
      listContainer.appendChild(card);
    });
    listContainer.querySelectorAll('.btn-delete').forEach(button => {
      button.addEventListener('click', handleDeleteRestaurant);
    });
    listContainer.querySelectorAll('.btn-edit').forEach(button => {
      button.addEventListener('click', handleOpenEditModal); 
    });
    listContainer.querySelectorAll('.restaurant-title').forEach(title => {
      title.addEventListener('click', handleNavigateToDetail); 
    });
  } catch (error) {
    console.error('Error al renderizar restaurantes:', error);
    alert(error.message);
  }
}
async function handleCreateRestaurantSubmit(event) {
  event.preventDefault(); 
  const createRestaurantForm = event.target;
  const formData = new FormData(createRestaurantForm);
  const data = Object.fromEntries(formData.entries());
  const restaurantData = {
      name: data.restaurantName,
      description: data.restaurantDescription,
      categoryId: data.restaurantCategory,
      location: data.restaurantLocation,
      imageUrl: data.restaurantImageUrl 
  };
  if (!restaurantData.categoryId) {
      alert('Por favor, selecciona una categoría.');
      return;
  }
  try {
      const newRestaurant = await createRestaurant(restaurantData);
      alert(`¡Restaurante "${newRestaurant.name}" creado exitosamente!`);
      createRestaurantForm.reset(); 
      await renderAdminRestaurants(); 
  } catch (error) {
      console.error('Error al crear restaurante:', error);
      alert(error.message);
  }
}
async function handleDeleteRestaurant(event) {
  event.stopPropagation(); 
  const button = event.target;
  const restaurantId = button.dataset.id; 
  if (!confirm('¿Estás seguro de que quieres eliminar este restaurante?')) {
    return;
  }
  try {
    await deleteRestaurant(restaurantId);
    alert('Restaurante eliminado exitosamente.');
    await renderAdminRestaurants(); 
  } catch (error) {
    console.error('Error al eliminar restaurante:', error);
    alert(error.message);
  }
}
async function handleOpenEditModal(event) {
  event.stopPropagation(); 
  const button = event.target;
  const restaurantId = button.dataset.id;
  try {
    const restaurant = await getRestaurantById(restaurantId);
    const editModal = document.getElementById('editModal');
    const editForm = document.getElementById('editRestaurantForm');
    editForm.elements['editRestaurantId'].value = restaurant._id;
    editForm.elements['editRestaurantName'].value = restaurant.name;
    editForm.elements['editRestaurantDescription'].value = restaurant.description;
    editForm.elements['editRestaurantLocation'].value = restaurant.location;
    editForm.elements['editRestaurantCategory'].value = restaurant.categoryId;
    editForm.elements['editRestaurantImageUrl'].value = restaurant.imageUrl || ''; 
    editModal.style.display = 'flex';
  } catch (error) {
    console.error('Error al abrir modal de edición:', error);
    alert(error.message);
  }
}
async function handleEditRestaurantSubmit(event) {
  event.preventDefault();
  const editForm = event.target;
  const formData = new FormData(editForm);
  const restaurantId = formData.get('editRestaurantId');
  const restaurantData = {
      name: formData.get('editRestaurantName'),
      description: formData.get('editRestaurantDescription'),
      categoryId: formData.get('editRestaurantCategory'),
      location: formData.get('editRestaurantLocation'),
      imageUrl: formData.get('editRestaurantImageUrl') 
  };
  try {
    await updateRestaurant(restaurantId, restaurantData);
    alert('Restaurante actualizado exitosamente.');
    document.getElementById('editModal').style.display = 'none';
    await renderAdminRestaurants();
  } catch (error) {
    console.error('Error al actualizar restaurante:', error);
    alert(error.message);
  }
}
async function renderUserRestaurants() {
  try {
    const restaurants = await getRestaurants(); 
    const listContainer = document.getElementById('userRestaurantsList');
    if (!listContainer) return; 

    listContainer.innerHTML = ''; 
    if (restaurants.length === 0) {
      listContainer.innerHTML = '<p class="no-restaurants">Aún no hay restaurantes creados.</p>';
      return;
    }
    restaurants.forEach(restaurant => {
      const card = document.createElement('div');
      card.className = 'restaurant-card'; 
      card.dataset.id = restaurant._id; 
      card.innerHTML = `
        ${renderImage(restaurant.imageUrl, restaurant.name, 'restaurant-card-placeholder')}
        <div class="restaurant-info">
            <h3 class="restaurant-title">${restaurant.name}</h3>
            <p>${restaurant.description}</p>
            <div class="restaurant-details">
                <span class="category">${restaurant.categoryDetails?.name || 'Sin Categoría'}</span>
                <span class="location">📍 ${restaurant.location || 'Sin Ubicación'}</span>
            </div>
        </div>
      `;
      card.style.cursor = 'pointer';
      card.addEventListener('click', handleNavigateToDetail); 
      listContainer.appendChild(card);
    });
  } catch (error) {
    console.error('Error al renderizar restaurantes:', error);
    alert(error.message);
  }
}
function handleNavigateToDetail(event) {
  const card = event.target.closest('.restaurant-card'); 
  state.currentRestaurantId = card.dataset.id; 
  loadPage('restaurant-detail'); 
}
async function loadRestaurantDetailData() {
  if (!state.currentRestaurantId) {
    alert('Error: No se ha seleccionado ningún restaurante.');
    loadPage(state.previousPage);
    return;
  }
  try {
    const restaurant = await getRestaurantById(state.currentRestaurantId);
    const imageContainer = document.getElementById('restaurantDetailImage');
    imageContainer.innerHTML = renderImage(restaurant.imageUrl, restaurant.name, 'restaurant-image-header-placeholder');
    document.getElementById('restaurantDetailName').textContent = restaurant.name;
    document.getElementById('restaurantDetailDescription').textContent = restaurant.description;
    document.getElementById('restaurantDetailCategory').textContent = restaurant.categoryDetails?.name || 'Sin Categoría';
    document.getElementById('restaurantDetailLocation').textContent = `📍 ${restaurant.location}`;
    
    await renderDishes(state.currentRestaurantId);
    await renderRestaurantReviews(state.currentRestaurantId); // <-- ¡AÑADIDO!
  } catch (error) {
    console.error('Error al cargar datos del restaurante:', error);
    alert(error.message);
  }
}
async function renderDishes(restaurantId) {
  try {
    const dishes = await getDishesByRestaurant(restaurantId);
    const listContainer = document.getElementById('dishesList');
    if (!listContainer) return;
    listContainer.innerHTML = '';
    if (dishes.length === 0) {
      listContainer.innerHTML = '<p class="no-items">Este restaurante aún no tiene platillos.</p>';
      return;
    }
    const userRole = AuthService.getUserRole();
    dishes.forEach(dish => {
      const card = document.createElement('div');
      card.className = 'dish-card';
      const renderImage = (imageUrl, dishName) => {
        if (imageUrl) {
          return `<div class="dish-image-container"><img src="${imageUrl}" alt="${dishName}" class="dish-image" onerror="this.outerHTML = '<div class=\\'dish-image-placeholder\\'>URL inválida</div>'"></div>`;
        } else {
          return `<div class="dish-image-container"><div class="dish-image-placeholder">Sin imagen</div></div>`;
        }
      };
      card.innerHTML = `
        ${renderImage(dish.imageUrl, dish.name)} 
        <div class="dish-info">
            <h4>${dish.name}</h4>
            <p class="dish-description">${dish.description}</p>
            <div class="dish-details">
                <span class="dish-category">${dish.category}</span>
                <span class="dish-price">$${dish.price.toFixed(2)}</span>
            </div>
        </div>
        <div class="dish-actions">
            <button class="btn-reviews-small" data-id="${dish._id}" data-name="${dish.name}">💬 Reseñas</button>
            <button class="btn-edit-small" data-id="${dish._id}" style="display: ${userRole === 'administrador' ? 'flex' : 'none'};">✏️</button>
            <button class="btn-delete-small" data-id="${dish._id}" style="display: ${userRole === 'administrador' ? 'flex' : 'none'};">🗑️</button>
        </div>
      `;
      listContainer.appendChild(card);
    });
    if (userRole === 'administrador') {
      listContainer.querySelectorAll('.btn-edit-small').forEach(button => {
        button.addEventListener('click', handleOpenEditDishForm);
      });
      listContainer.querySelectorAll('.btn-delete-small').forEach(button => {
        button.addEventListener('click', handleDeleteDish);
      });
    }
    listContainer.querySelectorAll('.btn-reviews-small').forEach(button => {
      button.addEventListener('click', handleOpenDishReviewModal);
    });
  } catch (error) {
    console.error('Error al renderizar platillos:', error);
    alert(error.message);
  }
}
function resetDishForm() {
  const dishForm = document.getElementById('dishForm');
  const formTitle = document.getElementById('dishFormTitle');
  const formButton = document.getElementById('submitDishFormBtn');
  if (!dishForm) return;
  dishForm.reset();
  state.editingDishId = null;
  formTitle.textContent = 'Nuevo Platillo';
  formButton.textContent = 'Crear Platillo';
}
async function handleOpenEditDishForm(event) {
  const button = event.target;
  const dishId = button.dataset.id;
  try {
    const dish = await getDishById(dishId);
    const addDishFormEl = document.getElementById('addDishForm');
    const dishForm = document.getElementById('dishForm');
    const formTitle = document.getElementById('dishFormTitle');
    const formButton = document.getElementById('submitDishFormBtn');
    dishForm.elements['dishId'].value = dish._id;
    dishForm.elements['dishName'].value = dish.name;
    dishForm.elements['dishDescription'].value = dish.description;
    dishForm.elements['dishPrice'].value = dish.price;
    dishForm.elements['dishImageUrl'].value = dish.imageUrl || '';
    dishForm.elements['dishCategory'].value = dish.category;
    state.editingDishId = dish._id;
    formTitle.textContent = 'Editar Platillo';
    formButton.textContent = 'Actualizar Platillo';
    addDishFormEl.style.display = 'block';
  } catch (error) {
    console.error('Error al cargar datos del platillo:', error);
    alert(error.message);
  }
}
async function handleDeleteDish(event) {
  const button = event.target;
  const dishId = button.dataset.id;
  if (!confirm('¿Estás seguro de que quieres eliminar este platillo?')) {
    return;
  }
  try {
    await deleteDish(dishId);
    alert('Platillo eliminado exitosamente.');
    await renderDishes(state.currentRestaurantId); 
  } catch (error) {
    console.error('Error al eliminar platillo:', error);
    alert(error.message);
  }
}
async function handleDishFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const dishData = {
    name: formData.get('dishName'),
    description: formData.get('dishDescription'),
    price: parseFloat(formData.get('dishPrice')),
    category: formData.get('dishCategory'),
    imageUrl: formData.get('dishImageUrl')
  };
  if (!dishData.category) {
    alert('Por favor selecciona una categoría para el platillo.');
    return;
  }
  try {
    if (state.editingDishId) {
      await updateDish(state.editingDishId, dishData);
      alert('Platillo actualizado exitosamente.');
    } else {
      await createDish(state.currentRestaurantId, dishData);
      alert('Platillo creado exitosamente.');
    }
    document.getElementById('addDishForm').style.display = 'none';
    resetDishForm();
    await renderDishes(state.currentRestaurantId);
  } catch (error) {
    console.error('Error al guardar platillo:', error);
    alert(error.message);
  }
}

// --- LÓGICA DE RESEÑAS DE PLATILLO ---

async function handleOpenDishReviewModal(event) {
  const button = event.target;
  const dishId = button.dataset.id;
  const dishName = button.dataset.name;
  state.currentDishReviewModal.dishId = dishId;
  const modal = document.getElementById('dishReviewModal');
  document.getElementById('dishReviewModalTitle').textContent = `Reseñas de: ${dishName}`;
  await renderDishReviews(dishId);
  resetDishReviewForm();
  modal.style.display = 'flex';
}

/**
 * ¡ACTUALIZADO! Muestra el nombre de usuario
 */
async function renderDishReviews(dishId) {
  const listContainer = document.getElementById('dishReviewList');
  if (!listContainer) return;
  try {
    const reviews = await getReviewsByDish(dishId);
    listContainer.innerHTML = '';
    if (reviews.length === 0) {
      listContainer.innerHTML = '<p class="no-items">Este platillo aún no tiene reseñas.</p>';
      return;
    }
    const token = AuthService.getToken();
    const payload = AuthService.parseToken(token);
    const currentUserId = payload ? payload.sub : null;
    const currentUserRole = payload ? payload.role : null;
    reviews.forEach(review => {
      const card = document.createElement('div');
      card.className = 'review-card';
      const isOwner = review.userId === currentUserId;
      const isAdmin = currentUserRole === 'administrador';
      let actionsHTML = '';
      if (isOwner) {
        actionsHTML = `
          <button class="btn-edit-small" data-id="${review._id}">✏️</button>
          <button class="btn-delete-small" data-id="${review._id}">🗑️</button>
        `;
      } else if (isAdmin) {
        actionsHTML = `
          <button class="btn-delete-small" data-id="${review._id}">🗑️ (Admin)</button>
        `;
      }
      card.innerHTML = `
        <div class="review-header">
          <span class="review-author">${review.user?.username || 'Usuario Anónimo'}</span> 
          <span class="review-rating">${'⭐'.repeat(review.rating)}</span>
        </div>
        <p class="review-comment">${review.comment}</p>
        <div class="review-footer">
          <span class="review-date">${new Date(review.createdAt).toLocaleDateString()}</span>
          <div class="review-actions">
            ${actionsHTML}
          </div>
        </div>
      `;
      if (isOwner) {
        card.querySelector('.btn-edit-small').addEventListener('click', handleOpenEditDishReviewForm);
      }
      if (isOwner || isAdmin) {
        card.querySelector('.btn-delete-small').addEventListener('click', handleDeleteDishReview);
      }
      listContainer.appendChild(card);
    });
  } catch (error) {
    console.error('Error al renderizar reseñas de platillo:', error);
    listContainer.innerHTML = '<p>Error al cargar reseñas.</p>';
  }
}

function resetDishReviewForm() {
  const form = document.getElementById('dishReviewForm');
  if (!form) return;
  form.reset();
  state.currentDishReviewModal.editingReviewId = null;
  document.getElementById('dishReviewFormTitle').textContent = 'Deja tu reseña';
  document.getElementById('submitDishReviewBtn').textContent = 'Publicar';
  document.getElementById('cancelDishReviewEditBtn').style.display = 'none';
  document.querySelectorAll('#dishReviewRatingStars .star').forEach(s => s.style.opacity = '0.3');
  document.getElementById('dishReviewRating').value = '';
}
function initStarRating(starsContainer, ratingInput) {
  if (!starsContainer || !ratingInput) return;
  const stars = starsContainer.querySelectorAll('.star');
  stars.forEach(star => {
    star.style.opacity = '0.3'; 
    star.addEventListener('click', () => {
      const rating = star.dataset.rating;
      ratingInput.value = rating;
      stars.forEach(s => {
        s.style.opacity = s.dataset.rating <= rating ? '1' : '0.3';
      });
    });
  });
}
async function handleDishReviewFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const reviewData = {
    comment: formData.get('reviewComment'),
    rating: parseInt(formData.get('reviewRating'), 10)
  };
  if (!reviewData.rating) {
    alert('Por favor, selecciona una calificación.');
    return;
  }
  try {
    if (state.currentDishReviewModal.editingReviewId) {
      await updateDishReview(state.currentDishReviewModal.editingReviewId, reviewData);
      alert('Reseña actualizada exitosamente.');
    } else {
      await createDishReview(state.currentDishReviewModal.dishId, reviewData);
      alert('Reseña creada exitosamente.');
    }
    await renderDishReviews(state.currentDishReviewModal.dishId);
    resetDishReviewForm();
  } catch (error) {
    console.error('Error al guardar la reseña:', error);
    alert(error.message);
  }
}
function handleOpenEditDishReviewForm(event) {
  const button = event.target;
  const reviewId = button.dataset.id;
  const card = button.closest('.review-card');
  const comment = card.querySelector('.review-comment').textContent;
  const rating = card.querySelector('.review-rating').textContent.length;
  const form = document.getElementById('dishReviewForm');
  form.elements['reviewId'].value = reviewId;
  form.elements['reviewComment'].value = comment;
  form.elements['reviewRating'].value = rating;
  document.querySelectorAll('#dishReviewRatingStars .star').forEach(star => {
    star.style.opacity = star.dataset.rating <= rating ? '1' : '0.3';
  });
  state.currentDishReviewModal.editingReviewId = reviewId;
  document.getElementById('dishReviewFormTitle').textContent = 'Editar tu reseña';
  document.getElementById('submitDishReviewBtn').textContent = 'Actualizar';
  document.getElementById('cancelDishReviewEditBtn').style.display = 'block';
}
async function handleDeleteDishReview(event) {
  const button = event.target;
  const reviewId = button.dataset.id;
  if (!confirm('¿Estás seguro de que quieres eliminar esta reseña?')) {
    return;
  }
  try {
    await deleteDishReview(reviewId);
    alert('Reseña eliminada exitosamente.');
    await renderDishReviews(state.currentDishReviewModal.dishId);
  } catch (error) {
    console.error('Error al eliminar la reseña:', error);
    alert(error.message);
  }
}

// ... (Lógica de Gestión de Categorías se queda igual) ...
async function renderCategories() {
  try {
    const categories = await getCategories();
    const listContainer = document.getElementById('categoryListContainer');
    if (!listContainer) return;

    listContainer.innerHTML = '';
    if (categories.length === 0) {
      listContainer.innerHTML = '<p class="no-items">No hay categorías creadas.</p>';
      return;
    }
    categories.forEach(category => {
      const card = document.createElement('div');
      card.className = 'category-card'; 
      card.innerHTML = `
        <div class="category-info">
          <h3>${category.name}</h3>
          <p>${category.description || 'Sin descripción'}</p>
        </div>
        <div class="admin-actions">
          <button class="btn-edit" data-id="${category._id}">✏️ Editar</button>
          <button class="btn-delete" data-id="${category._id}">🗑️ Eliminar</button>
        </div>
      `;
      listContainer.appendChild(card);
    });
    listContainer.querySelectorAll('.btn-edit').forEach(button => {
      button.addEventListener('click', handleOpenEditCategoryModal);
    });
    listContainer.querySelectorAll('.btn-delete').forEach(button => {
      button.addEventListener('click', handleDeleteCategory);
    });
  } catch (error) {
    console.error('Error al renderizar categorías:', error);
    alert(error.message);
  }
}
async function handleCreateCategorySubmit(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const categoryData = {
    name: formData.get('categoryName'),
    description: formData.get('categoryDescription')
  };
  try {
    await createCategory(categoryData);
    alert('Categoría creada exitosamente.');
    form.reset();
    await renderCategories(); 
  } catch (error) {
    console.error('Error al crear categoría:', error);
    alert(error.message);
  }
}
async function handleOpenEditCategoryModal(event) {
  const button = event.target;
  const categoryId = button.dataset.id;
  try {
    const category = await getCategoryById(categoryId);
    const editModal = document.getElementById('categoryEditModal');
    const editForm = document.getElementById('editCategoryForm');
    editForm.elements['editCategoryId'].value = category._id;
    editForm.elements['editCategoryName'].value = category.name;
    editForm.elements['editCategoryDescription'].value = category.description || '';
    editModal.style.display = 'flex';
  } catch (error) {
    console.error('Error al cargar categoría:', error);
    alert(error.message);
  }
}
async function handleEditCategorySubmit(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const categoryId = formData.get('editCategoryId');
  const categoryData = {
    name: formData.get('editCategoryName'),
    description: formData.get('editCategoryDescription')
  };
  try {
    await updateCategory(categoryId, categoryData);
    alert('Categoría actualizada exitosamente.');
    document.getElementById('categoryEditModal').style.display = 'none';
    await renderCategories();
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    alert(error.message);
  }
}
async function handleDeleteCategory(event) {
  const button = event.target;
  const categoryId = button.dataset.id;
  if (!confirm('¿Estás seguro de que quieres eliminar esta categoría? (Esto puede afectar a restaurantes existentes)')) {
    return;
  }
  try {
    await deleteCategory(categoryId);
    alert('Categoría eliminada exitosamente.');
    await renderCategories();
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    alert(error.message);
  }
}

// --- ¡NUEVO! LÓGICA DE RESEÑAS DE RESTAURANTE ---

/**
 * Carga y "pinta" las reseñas del restaurante
 */
async function renderRestaurantReviews(restaurantId) {
  const listContainer = document.getElementById('reviewsList');
  if (!listContainer) return;
  
  try {
    const reviews = await getReviewsByRestaurant(restaurantId);
    listContainer.innerHTML = '';
    
    if (reviews.length === 0) {
      listContainer.innerHTML = '<p class="no-items">Este restaurante aún no tiene reseñas.</p>';
      return;
    }
    
    const token = AuthService.getToken();
    const payload = AuthService.parseToken(token);
    const currentUserId = payload ? payload.sub : null;
    const currentUserRole = payload ? payload.role : null;

    reviews.forEach(review => {
      const card = document.createElement('div');
      card.className = 'review-card';
      
      const isOwner = review.userId === currentUserId;
      const isAdmin = currentUserRole === 'administrador';
      let actionsHTML = '';
      
      if (isOwner) {
        actionsHTML = `
          <button class="btn-edit-small" data-id="${review._id}">✏️</button>
          <button class="btn-delete-small" data-id="${review._id}">🗑️</button>
        `;
      } else if (isAdmin) {
        actionsHTML = `
          <button class="btn-delete-small" data-id="${review._id}">🗑️ (Admin)</button>
        `;
      }

      card.innerHTML = `
        <div class="review-header">
          <span class="review-author">${review.user?.username || 'Usuario Anónimo'}</span>
          <span class="review-rating">${'⭐'.repeat(review.rating)}</span>
        </div>
        <p class="review-comment">${review.comment}</p>
        <div class="review-footer">
          <span class="review-date">${new Date(review.createdAt).toLocaleDateString()}</span>
          <div class="review-actions">
            ${actionsHTML}
          </div>
        </div>
      `;
      
      // Conectar los botones
      if (isOwner) {
        card.querySelector('.btn-edit-small').addEventListener('click', handleOpenEditRestaurantReviewForm);
      }
      if (isOwner || isAdmin) {
        card.querySelector('.btn-delete-small').addEventListener('click', handleDeleteRestaurantReview);
      }
      
      listContainer.appendChild(card);
    });

  } catch (error) {
    console.error('Error al renderizar reseñas de restaurante:', error);
    listContainer.innerHTML = '<p>Error al cargar reseñas.</p>';
  }
}

/**
 * Resetea el formulario de reseña de restaurante
 */
function resetRestaurantReviewForm() {
  const form = document.getElementById('restaurantReviewForm');
  if (!form) return;
  
  form.reset();
  state.editingRestaurantReviewId = null;
  document.getElementById('restaurantReviewFormTitle').textContent = 'Deja tu reseña';
  document.getElementById('submitRestaurantReviewBtn').textContent = 'Publicar';
  document.getElementById('cancelRestaurantReviewEditBtn').style.display = 'none';
  
  document.querySelectorAll('#restaurantReviewRatingStars .star').forEach(s => s.style.opacity = '0.3');
  document.getElementById('restaurantReviewRating').value = '';
}

/**
 * Maneja el envío del formulario de reseña de restaurante (Crear o Editar)
 */
async function handleRestaurantReviewFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  
  const reviewData = {
    comment: formData.get('reviewComment'),
    rating: parseInt(formData.get('reviewRating'), 10)
  };

  if (!reviewData.rating) {
    alert('Por favor, selecciona una calificación.');
    return;
  }

  try {
    if (state.editingRestaurantReviewId) {
      // --- MODO ACTUALIZAR ---
      await updateRestaurantReview(state.editingRestaurantReviewId, reviewData);
      alert('Reseña actualizada exitosamente.');
    } else {
      // --- MODO CREAR ---
      await createRestaurantReview(state.currentRestaurantId, reviewData);
      alert('Reseña creada exitosamente.');
    }
    
    await renderRestaurantReviews(state.currentRestaurantId);
    resetRestaurantReviewForm();
    document.getElementById('addReviewForm').style.display = 'none'; // Ocultar formulario
    
  } catch (error) {
    console.error('Error al guardar la reseña:', error);
    alert(error.message);
  }
}

/**
 * Abre el formulario para editar una reseña de restaurante
 */
function handleOpenEditRestaurantReviewForm(event) {
  const button = event.target;
  const reviewId = button.dataset.id;

  const card = button.closest('.review-card');
  const comment = card.querySelector('.review-comment').textContent;
  const rating = card.querySelector('.review-rating').textContent.length;
  
  const formContainer = document.getElementById('addReviewForm');
  const form = document.getElementById('restaurantReviewForm');
  
  // Llenar el formulario
  form.elements['reviewId'].value = reviewId;
  form.elements['reviewComment'].value = comment;
  form.elements['reviewRating'].value = rating;

  // Actualizar estrellas
  document.querySelectorAll('#restaurantReviewRatingStars .star').forEach(star => {
    star.style.opacity = star.dataset.rating <= rating ? '1' : '0.3';
  });

  // Cambiar a modo "Editar"
  state.editingRestaurantReviewId = reviewId;
  document.getElementById('restaurantReviewFormTitle').textContent = 'Editar tu reseña';
  document.getElementById('submitRestaurantReviewBtn').textContent = 'Actualizar';
  document.getElementById('cancelRestaurantReviewEditBtn').style.display = 'block';
  
  // Mostrar el formulario
  formContainer.style.display = 'block';
}

/**
 * Maneja la eliminación de una reseña de restaurante
 */
async function handleDeleteRestaurantReview(event) {
  const button = event.target;
  const reviewId = button.dataset.id;

  if (!confirm('¿Estás seguro de que quieres eliminar esta reseña?')) {
    return;
  }
  
  try {
    await deleteRestaurantReview(reviewId);
    alert('Reseña eliminada exitosamente.');
    await renderRestaurantReviews(state.currentRestaurantId);
  } catch (error) {
    console.error('Error al eliminar la reseña:', error);
    alert(error.message);
  }
}

// --- INICIALIZACIÓN DE LA APP ---
document.addEventListener('DOMContentLoaded', () => {
  checkUserRoleAndNavigate();
});