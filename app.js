// --- ESTADO Y REFERENCIAS ---
let carrito = JSON.parse(localStorage.getItem('miCarrito')) || [];
const btnComprar = document.getElementById('btnComprar');
const cartTrigger = document.getElementById('cartTrigger');
const cartDropdown = document.getElementById('cartDropdown');
const container = document.getElementById('cartItemsContainer');
const countLabel = document.getElementById('cartCount');
const contenedorProductos = document.getElementById('contenedorProductos');

// --- CARGA DINAMICA DE PRODUCTOS ---

// FUNCION PARA CARGAS LOS PRODUCTOS 
async function cargarProductos() {
    try {
        const respuesta = await fetch('productos.json');
        const productos = await respuesta.json();
        renderizarCards(productos);
    } catch (error) {
        console.error("Error cargando los productos:", error);
        if(contenedorProductos) {
            contenedorProductos.innerHTML += "<p>Error al cargar el catalogo de productos.</p>";
        }
    }
}

// Funcion para generar el html de las cards
function renderizarCards(lista) {
    if (!contenedorProductos) return;
    contenedorProductos.innerHTML = '<h2>Productos disponibles</h2>';
    
    lista.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'card-product';
    
        card.innerHTML = `
            <img src="${producto.imagens}" alt="${producto.nombre}">
            <h3>${producto.nombre}</h3>
            <button class="btn-add" 
                    data-id="${producto.id}" 
                    data-nombre="${producto.nombre}" 
                    data-img="${producto.imagens}">
                Agregar al carrito
            </button>
            <button class="btn-ver-detalles" onclick="abrirDetalles('${producto.id}')">
                Ver fotos y detalles
            </button>
        `;
        contenedorProductos.appendChild(card);
    });
    asignarEventosBotones();
}

function asignarEventosBotones() {
    const botonesNuevos = document.querySelectorAll('.btn-add');
    botonesNuevos.forEach(boton => {
        boton.addEventListener('click', (e) => {
            const button = e.target.closest('.btn-add');
            const nuevoProducto = {
                id: button.getAttribute('data-id'),
                nombre: button.getAttribute('data-nombre'),
                img: button.getAttribute('data-img')
            };
            agregarAlCarrito(nuevoProducto);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    renderCarrito();
});

cartTrigger.addEventListener('click', () => {
    const isVisible = cartDropdown.style.display === 'flex';
    if (!isVisible) {
        cartDropdown.style.display = 'flex';
        if (window.innerWidth <= 768) {
            document.body.style.overflow = 'hidden';
        }
    } else {
        cartDropdown.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

const closeCart = document.getElementById('closeCart');
if (closeCart) {
    closeCart.addEventListener('click', () => {
        cartDropdown.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
}

window.addEventListener('click', (e) => {
    if (cartDropdown.style.display === 'flex' &&
        !cartDropdown.contains(e.target) &&
        !cartTrigger.contains(e.target)) {
            cartDropdown.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
});

function mostrarAviso(mensaje) {
    const containerToast = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = mensaje;
    containerToast.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 1000);
}

function agregarAlCarrito(producto) {
    const existe = carrito.find(item => item.id === producto.id);
    if (existe) {
        mostrarAviso(`⚠️ El producto "${producto.nombre}" ya está en tu carrito.`);
    } else {
        carrito.push(producto);
        renderCarrito();
        mostrarAviso(`✅ ${producto.nombre} agregado con éxito`);
    }
}

function renderCarrito() {
    localStorage.setItem('miCarrito', JSON.stringify(carrito));
    countLabel.innerText = carrito.length;

    if (carrito.length === 0) {
        container.innerHTML = '<p class="empty-msg">El carrito esta vacio</p>';
        return;    
    }
    container.innerHTML = carrito.map((prod, index) => `
    <div class="cart-product">
        <img src="${prod.img}" alt="${prod.nombre}" onerror="this.src='imagenes/placeholder.png'">
        <h3>${prod.nombre}</h3>
        <button class="btn-remove" onclick="eliminarDelCarrito(event, ${index})">X</button>
    </div>
    `).join('');
}

window.eliminarDelCarrito = function(event, index) {
    event.stopPropagation();
    carrito.splice(index, 1);
    renderCarrito();
    cartDropdown.style.display = 'flex';
};

const numeroWhatsApp = "573107843769";

if(btnComprar) {
    btnComprar.addEventListener('click', () => {
        if (carrito.length === 0) {
            mostrarAviso("❌ No puedes enviar una cotización vacía.")
            return;
        }
        let mensaje = "Hola me gustaria cotizar los siguientes productos de su catalogo: \n\n";
        carrito.forEach((prod, index) => {
            mensaje += `${index + 1}. ${prod.nombre}\n`;
        });
        mensaje += "\nQuedo atento a su respuesta. Gracias.";

        const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, '_blank');

        carrito = [];
        localStorage.removeItem('miCarrito');
        renderCarrito();
        cartDropdown.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
}

async function abrirDetalles(id) {
    const respuesta = await fetch('productos.json');
    const productos = await respuesta.json();
    const p = productos.find(item => item.id === id);

    if(p) {
        document.getElementById('modalTitle').innerText = p.nombre;
        document.getElementById('modalDesc').innerText = p.descripcion;

        const galeria = document.querySelector('.modal-gallery');
        galeria.innerHTML = '';

        if (p.imagen && Array.isArray(p.imagen)) {
            p.imagen.forEach(imgUrl => {
                const imgElement = document.createElement('img');
                imgElement.src = imgUrl;
                imgElement.alt = "Detalle real";
                imgElement.style.width = "100%";
                imgElement.style.marginBottom = "15px";
                imgElement.style.borderRadius = "8px";
                galeria.appendChild(imgElement);
            });
        } else {
            galeria.innerHTML = '<p style="color:#888;">No hay fotos adicionales disponibles.</p>';
        }
        
        const mensaje = `Hola Soultech, me interesa ver fotos reales de: ${p.nombre} (Ref: ${p.id})`;
        document.getElementById('btnWhaDirect').onclick = () => {
            window.open(`https://wa.me/573107843769?text=${encodeURIComponent(mensaje)}`, '_blank'); 
        };

        document.getElementById('productModal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    } 
}

document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('productModal').style.display = 'none';
    document.body.style.overflow = 'auto';
});

window.addEventListener('click', (e) => {
    const modal = document.getElementById('productModal');
    if (e.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

const aboutTrigger = document.getElementById('aboutTrigger');
const aboutModal = document.getElementById('aboutModal');
const closeAbout = document.getElementById('closeAbout');

// Abrir
aboutTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    aboutModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
});

// Cerrar con la X
closeAbout.addEventListener('click', () => {
    aboutModal.style.display = 'none';
    document.body.style.overflow = 'auto';
});

// Cerrar si hacen clic fuera
window.addEventListener('click', (e) => {
    if (e.target === aboutModal) {
        aboutModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// sw.js
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Fuerza la instalación inmediata
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activado');
});