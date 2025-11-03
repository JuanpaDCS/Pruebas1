# Gestor de Restaurantes - Frontend

Este es el frontend de la aplicación full-stack de reseñas de restaurantes. Es una **Aplicación de Página Única (SPA)** construida con **HTML, CSS y JavaScript puros** (ES6 Modules), diseñada para consumir la API del backend.

La aplicación presenta diferentes vistas y funcionalidades basadas en el rol del usuario (Visitante, Usuario Registrado, o Administrador).

## 🚀 Tecnologías

* **HTML5:** Para la estructura semántica.
* **CSS3:** Para todos los estilos, usando un enfoque de componentes y variables CSS.
* **JavaScript (ES6+):** Para toda la lógica de la aplicación, incluyendo:
    * **Módulos (Import/Export):** Para mantener el código organizado.
    * **Fetch API:** Para consumir la API del backend.
    * **Async/Await:** Para manejar la asincronía de forma limpia.
    * **DOM Manipulation:** Para "pintar" las vistas y componentes dinámicamente.
* **Live Server (Extensión de VS Code):** Necesario para servir los archivos y evitar errores `CORS` y de `file:///`.

---

## 🏛️ Arquitectura

Este proyecto no utiliza frameworks (como React o Vue). En su lugar, simula una arquitectura SPA moderna usando componentes cargados dinámicamente.

* **`index.html`:** Es un "caparazón" (shell) casi vacío. Solo contiene un `<main id="app-root"></main>` y carga el script principal.
* **`js/app.js`:** Es el "cerebro" y enrutador principal.
    * Decide qué página cargar (`loadPage`).
    * Maneja el estado (ej. `state.currentRestaurantId`).
    * Contiene todos los *event listeners* (manejadores de clics y formularios).
* **`/js/components/*.html`:** Son las "páginas" o "vistas" (ej. `public-home.html`, `admin.html`, `restaurant-detail.html`). `app.js` las carga usando `fetch` y las inyecta en el `#app-root`.
* **`/js/api/*.js`:** Capa de abstracción de red. Cada archivo (ej. `restaurant.api.js`) es responsable de las llamadas `fetch` a un conjunto de endpoints del backend.
* **`/js/services/auth.service.js`:** Un servicio para manejar la lógica de autenticación del lado del cliente, principalmente para guardar y leer el Token JWT del `localStorage`.

---

## 🛠️ Funcionamiento y Características

* **Página Pública:** Los visitantes ven una página de inicio (`public-home.html`) con una lista de restaurantes y un panel lateral de Iniciar Sesión/Registro.
* **Navegación por Roles:** La aplicación muestra diferentes páginas y botones según el rol:
    * **Visitante:** Ve todo (lectura), pero no ve botones para crear/editar/reseñar.
    * **Usuario:** Ve todo y tiene botones para crear/editar/eliminar *sus propias* reseñas.
    * **Admin:** Ve todo y tiene botones para gestionar *todo* (Restaurantes, Platillos, Categorías) y eliminar *cualquier* reseña.
* **Carga Dinámica:** Las páginas (componentes HTML) se cargan sin necesidad de recargar el navegador.
* **Modales (Pop-ups):** La edición (Restaurantes, Categorías) y las reseñas (Platillos) se manejan en modales dinámicos.
* **Gestión de Estado Simple:** Un objeto `state` en `app.js` rastrea información importante, como en qué restaurante estamos (`currentRestaurantId`) o a qué página volver (`previousPage`).

---

## 🔌 Instalación y Puesta en Marcha

Este proyecto es puramente estático, pero **requiere un servidor local** para funcionar debido al uso de Módulos de JavaScript y `fetch`.

**Requerimientos:**
1.  **Backend Corriendo:** La [API del Backend](link-a-tu-repo-de-backend) **debe** estar ejecutándose (normalmente en `http://localhost:3001`).
2.  **VS Code:** Es el editor recomendado.
3.  **Extensión "Live Server":** Es **obligatorio** usar la extensión [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) de Ritwick Dey.

**Pasos para Ejecutar:**

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/tu-usuario/tu-repositorio-frontend.git](https://github.com/tu-usuario/tu-repositorio-frontend.git)
    cd tu-repositorio-frontend
    ```

2.  **Abrir con VS Code:**
    ```bash
    code .
    ```

3.  **Instalar "Live Server":**
    * Ve a la pestaña de Extensiones en VS Code.
    * Busca e instala "Live Server" de Ritwick Dey.

4.  **Iniciar el servidor:**
    * En el explorador de archivos, haz clic derecho en `index.html`.
    * Selecciona **"Open with Live Server"**.

El navegador se abrirá automáticamente en una dirección como `http://127.0.0.1:5500`, y la aplicación funcionará.