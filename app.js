const cards = document.getElementById('cards');
const items = document.getElementById('items');
const footer = document.getElementById('footer');
const templateCard = document.getElementById('template-card').content;
const fragment = document.createDocumentFragment();
const templateFooter = document.getElementById('template-footer').content;
const templateCarrito = document.getElementById('template-carrito').content;
let carrito = {};

document.addEventListener('DOMContentLoaded', fetchData);
if(localStorage.getItem('carrito')){
    carrito = JSON.parse(localStorage.getItem('carrito'))
    pintarCarrito()
}

cards.addEventListener('click', addCarrito);

items.addEventListener('click', (e) => {
    btnAccion(e);
});

async function fetchData() {
    try {
        const res = await fetch('api.json');
        const data = await res.json();
        pintarCards(data);
    } catch (error) {
        console.log(error);
    }
}

function pintarCards(data) {
    data.forEach((producto) => {
        const clone = templateCard.cloneNode(true);
        clone.querySelector('h5').textContent = producto.title;
        clone.querySelector('p').textContent = producto.precio;
        clone.querySelector('img').src = producto.thumbnailUrl;
        clone.querySelector('.btn-dark').dataset.id = producto.id;
        fragment.appendChild(clone);
    });
    cards.appendChild(fragment);
}

function addCarrito(e) {
    if (e.target.classList.contains('btn-dark')) {
        const card = e.target.closest('.card');
        setCarrito(card);
    }
    e.stopPropagation();
}

function setCarrito(card) {
    const producto = {
        id: card.querySelector('.btn-dark').dataset.id,
        title: card.querySelector('h5').textContent,
        precio: card.querySelector('p').textContent,
        cantidad: 1,
    };

    if (carrito.hasOwnProperty(producto.id)) {
        producto.cantidad = carrito[producto.id].cantidad + 1;
    }

    carrito[producto.id] = { ...producto };

    pintarCarrito();
}

function pintarCarrito() {
    items.innerHTML = '';
    Object.values(carrito).forEach((producto) => {
        const clone = templateCarrito.cloneNode(true);
        clone.querySelector('th').textContent = producto.id;
        clone.querySelectorAll('td')[0].textContent = producto.title;
        clone.querySelectorAll('td')[1].textContent = producto.cantidad;
        clone.querySelector('.btn-info').dataset.id = producto.id;
        clone.querySelector('.btn-danger').dataset.id = producto.id;
        clone.querySelector('span').textContent =
            producto.cantidad * producto.precio;
        fragment.appendChild(clone);
    });
    items.appendChild(fragment);

    pintarFooter();

    localStorage.setItem('carrito', JSON.stringify(carrito))
}

function pintarFooter() {
    footer.innerHTML = '';
    if (Object.keys(carrito).length === 0) {
        footer.innerHTML = `<th scope="row" colspan="5">Carrito vacío - ¡comience a comprar!</th>`;
        return;
    }

    const nCantidad = Object.values(carrito).reduce(
        (acc, { cantidad }) => acc + cantidad,
        0
    );
    const nPrecio = Object.values(carrito).reduce(
        (acc, { cantidad, precio }) => acc + cantidad * precio,
        0
    );

    templateFooter.querySelectorAll('td')[0].textContent = nCantidad;
    templateFooter.querySelector('span').textContent = nPrecio;

    const clone = templateFooter.cloneNode(true);
    fragment.appendChild(clone);
    footer.appendChild(fragment);

    const btnVaciar = document.getElementById('vaciar-carrito');
    btnVaciar.addEventListener('click', () => {
        carrito = {};
        pintarCarrito();
    });
}

const btnAccion = (e) => {
    console.log(e.target);


    if (e.target.classList.contains('btn-info')) {
        console.log(carrito[e.target.dataset.id])

        const producto = carrito[e.target.dataset.id]
        producto.cantidad++
        carrito[e.target.dataset.id] = { ...producto }
        pintarCarrito()
    }

    if (e.target.classList.contains('btn-danger')) {
        const producto = carrito[e.target.dataset.id]
        producto.cantidad--
        if (producto.cantidad === 0) {
            delete carrito[e.target.dataset.id] 
        }
        pintarCarrito()
    }

    e.stopPropagation()
}


