/*
Enunciado:

Diseñaremos un HTML que represente un cronómetro con el formato que queramos,
por ejemplo: 00:00.

Añadiremos los botones:
- Iniciar: Activará el cronómetro, incrementando el contador cada 1 segundo.
- Parar: Detiene el cronómetro.
- Continuar: Vuelve a activar el cronómetro.
- Contar hasta 10: Iniciará el cronómetro y lo parará a los 10 segundos (y para el crono).
- Guardar: Guarda el estado del crono en el momento que es pulsado (sin parar el crono).
- Ver tiempos: Mostrará el listado de tiempos divido en sesiones que guarda el Local Storage.

Queremos guardar en el Local Storage un conjunto de listado de tiempos divididos por sesiones,
si es la primera vez que accede el usuario a la página web, la sesión será la número 1
y así sucesivamente.

Añadiremos los botones pertinentes para borrar todos los datos del Local Storage
o solo los datos de una sesión en concreto. (si sobra tiempo) (editado)

Referencias:
https://www.w3schools.com/jsref/met_win_settimeout.asp
https://www.w3schools.com/jsref/met_win_setinterval.asp
https://lineadecodigo.com/html5/listar-el-contenido-de-local-storage-en-html5/
https://es.javascript.info/localstorage
*/

// Nota: La aplicación maneja sólo minutos y segundos. Máximo 3.599 segundos.

// Helper selectors
const elemento = (sel) => document.querySelector(sel);
const creaElem = (el) => document.createElement(el);

// Estado del cronómetro y temporizadores
let cronometro = null;
let tiempoInicio = 0;
let tiempoAcumulado = 0; // Guarda los ms transcurridos al pausar
let tiempoSegundos = 0;   // Segundos enteros mostrados
let modoCuenta10 = false;
let sesion = [];
let numSesion = numClave();

const btnInicia = elemento('#inicia');
const btnContin = elemento('#contin');
const btnParate = elemento('#parate');
const btnCuenta = elemento('#cuenta');
const btnGuarda = elemento('#guarda');
const btnHistor = elemento('#histor');
const btnBorrar = elemento('#borrar');
const elResulta = elemento('#resulta');
const elListado = elemento('#listado');

btnInicia.onclick = iniciaCrono;
btnContin.onclick = continCrono;
btnParate.onclick = parateCrono;
btnCuenta.onclick = cuentaCrono;
btnGuarda.onclick = guardaLocal;
btnHistor.onclick = historLocal;
btnBorrar.onclick = borrarLocal;

/* Estado inicial de botones */
btnInactivo(btnInicia, false);
btnInactivo(btnContin, true);
btnInactivo(btnParate, true);
btnInactivo(btnCuenta, false);
btnInactivo(btnGuarda, true);

if (existeClave('ultSesion')) {
    historLocal();
    btnInactivo(btnHistor, false);
    btnInactivo(btnBorrar, false);
} else {
    btnInactivo(btnHistor, true);
    btnInactivo(btnBorrar, true);
}

/* Inicia el cronómetro desde cero */
function iniciaCrono() {
    botonsCrono(btnInicia);
    poneBtnReinicio(true);
    modoCuenta10 = false;

    parateCrono();
    tiempoAcumulado = 0;
    tiempoSegundos = 0;
    actualizaPantalla(0);
    continCrono();
}

/* Continúa el cronómetro usando marcas de tiempo (preciso en todos los navegadores) */
function continCrono() {
    botonsCrono(btnContin);

    if (!cronometro) {
        tiempoInicio = Date.now() - tiempoAcumulado;

        cronometro = setInterval(() => {
            const msTranscurridos = Date.now() - tiempoInicio;

            if (modoCuenta10) {
                const msRestantes = 10000 - msTranscurridos;
                tiempoSegundos = Math.max(0, Math.ceil(msRestantes / 1000));
                actualizaCuenta(tiempoSegundos);

                if (msRestantes <= 0) {
                    parateCrono();
                    btnInactivo(btnContin, true);
                }
            } else {
                tiempoSegundos = Math.floor(msTranscurridos / 1000);
                actualizaPantalla(tiempoSegundos);

                if (tiempoSegundos >= 3599) { // Máximo 59 min 59 s
                    parateCrono();
                    btnInactivo(btnContin, true);
                }
            }
        }, 100);
    }
}

/* Detiene el cronómetro conservando el tiempo transcurrido */
function parateCrono() {
    botonsParate();

    if (cronometro) {
        clearInterval(cronometro);
        cronometro = null;
        if (tiempoInicio > 0) {
            tiempoAcumulado = Date.now() - tiempoInicio;
        }
    }

    if (tiempoSegundos === 0 && !tiempoAcumulado) {
        btnInactivo(btnGuarda, true);
    }
}

/* Inicia la cuenta de 10 a 0 segundos */
function cuentaCrono() {
    parateCrono();
    botonsCuenta();
    poneBtnReinicio(false);

    modoCuenta10 = true;
    tiempoAcumulado = 0;
    tiempoSegundos = 10;
    actualizaCuenta(10);

    continCrono();
}

/* Renderizado HTML con las mismas clases CSS originales */
function actualizaPantalla(t) {
    const minSeg = separa(t);
    let formato = `<span class="tiempo">${minSeg.segundos}</span><span class="medida"> s</span>`;

    if (parseInt(minSeg.minutos) > 0) {
        formato = `<span class="tiempo">${minSeg.minutos}</span>`
                + `<span class="medida"> min</span>`
                + `<span class="separa"> :</span>` + formato;
    }

    elResulta.innerHTML = formato;
}

function actualizaCuenta(t) {
    elResulta.innerHTML = `<span class="tiempo">${digitos(t)}</span><span class="medida"> s</span>`;
}

function digitos(numero) {
    return numero < 10 ? '0' + numero : numero;
}

function separa(tiempoSeg) {
    const minutos = Math.trunc(tiempoSeg / 60);
    const segundos = tiempoSeg % 60;
    return {
        minutos: digitos(minutos),
        segundos: digitos(segundos)
    };
}

/* Gestión de estados de botones */
function botonsCrono(boton) {
    btnInactivo(btnInicia, false);
    btnInactivo(btnContin, false);
    btnInactivo(btnParate, false);
    btnInactivo(btnCuenta, false);
    btnInactivo(btnGuarda, false);
    btnInactivo(boton, true);
}

function botonsCuenta() {
    btnInactivo(btnParate, false);
    btnInactivo(btnGuarda, false);
    btnInactivo(btnContin, true);
    btnInactivo(btnCuenta, true);
}

function botonsParate() {
    btnInactivo(btnParate, true);
    btnInactivo(btnContin, false);
}

function btnInactivo(boton, estado) {
    if (!boton) return;
    boton.disabled = estado;
    boton.setAttribute('aria-disabled', estado);
}

function poneBtnReinicio(estado) {
    const icono = elemento('#inicia i');
    if (!icono) return;
    if (estado) {
        icono.classList.remove('bi-play-fill');
        icono.classList.add('bi-arrow-clockwise');
    } else {
        icono.classList.remove('bi-arrow-clockwise');
        icono.classList.add('bi-play-fill');
    }
}

/* LocalStorage y Persistencia */
function numClave() {
    return existeClave('ultSesion') ? parseInt(localStorage.getItem('ultSesion')) + 1 : 1;
}

function existeClave(clave) {
    return localStorage.getItem(clave) !== null;
}

function guardaLocal() {
    const hoy = new Date();
    const fecha = `${digitos(hoy.getDate())}-${digitos(hoy.getMonth() + 1)}-${hoy.getFullYear()}`;
    const hora = `${digitos(hoy.getHours())}:${digitos(hoy.getMinutes())}:${digitos(hoy.getSeconds())}`;
    const fechaHora = `${fecha} ${hora}`;

    sesion.push({ segundos: tiempoSegundos, fechaHora: fechaHora });

    localStorage.setItem(numSesion, JSON.stringify(sesion));
    localStorage.setItem('ultSesion', numSesion);

    creaTabla('<i class="bi bi-stopwatch"></i>&nbsp; Sesión actual');
    creaFilas(numSesion, sesion);

    btnInactivo(btnBorrar, false);
    btnInactivo(btnHistor, false);
}

function historLocal() {
    btnInactivo(btnHistor, true);
    creaTabla('<i class="bi bi-list-ol"></i>&nbsp; Sesiones guardadas');

    const ult = parseInt(localStorage.getItem('ultSesion'));
    for (let i = ult; i > 0; i--) {
        const valor = JSON.parse(localStorage.getItem(i));
        if (valor) creaFilas(i, valor);
    }
}

function borrarLocal() {
    btnInactivo(btnBorrar, true);
    localStorage.clear();
    sesion = [];
    numSesion = 1;
    elListado.textContent = '';
    btnInactivo(btnHistor, true);
}

function borraClave(clave) {
    localStorage.removeItem(clave);
    const numSesiones = localStorage.length - 1;

    if (numSesiones > 0) {
        localStorage.setItem('ultSesion', numSesiones);
        if (numSesion === clave) {
            sesion = [];
        } else {
            ordenaClaves(clave, numSesiones + 1);
            numSesion--;
        }
        historLocal();
    } else {
        borrarLocal();
    }
}

function ordenaClaves(clave, totalSesiones) {
    for (let i = clave; i < totalSesiones; i++) {
        const valClave = localStorage.getItem(i + 1);
        localStorage.removeItem(i + 1);
        if (valClave) localStorage.setItem(i, valClave);
    }
}

/* Construcción de la tabla respetando atributos y clases originales */
function creaTabla(titulo) {
    let thead, tbody, tr, th, hr, caption, table;

    tr = creaElem('tr');

    const columnas = [
        { txt: 'Clave', clase: 'ancho' },
        { txt: 'Núm.', clase: 'ancho' },
        { txt: 'Crono', clase: 'crono' },
        { txt: 'Fecha / Hora', clase: 'fecha' },
        { txt: 'Borra', clase: 'ancho' }
    ];

    columnas.forEach(col => {
        th = creaElem('th');
        th.setAttribute('scope', 'col');
        th.classList.add(col.clase);
        th.innerHTML = `<small>${col.txt}</small>`;
        tr.appendChild(th);
    });

    thead = creaElem('thead');
    thead.appendChild(tr);

    tbody = creaElem('tbody');
    tbody.setAttribute('id', 'cuerpo');

    caption = creaElem('caption');
    caption.innerHTML = '<h2>' + titulo + '</h2>';

    table = creaElem('table');
    table.append(caption, thead, tbody);

    hr = creaElem('hr');

    elListado.textContent = '';
    elListado.append(hr, table);
}

function creaFilas(clave, valor) {
    let tr, th, td, minSeg, button, formato;

    valor.forEach((obj, i) => {
        tr = creaElem('tr');

        if (!i) {
            tr.setAttribute('id', `clave${clave}`);
            th = creaElem('th');
            th.setAttribute('rowspan', valor.length);
            th.setAttribute('scope', 'rowgroup');
            th.textContent = clave;
            tr.appendChild(th);
        }

        td = creaElem('td');
        td.textContent = i + 1;
        tr.appendChild(td);

        minSeg = separa(obj.segundos);
        formato = minSeg.segundos + 's';
        if (parseInt(minSeg.minutos) > 0) formato = minSeg.minutos + 'min, ' + formato;

        td = creaElem('td');
        td.innerHTML = '<strong>' + formato + '</strong>';
        tr.appendChild(td);

        td = creaElem('td');
        td.textContent = obj.fechaHora;
        tr.appendChild(td);

        if (!i) {
            button = creaElem('button');
            button.setAttribute('id', `borra${clave}`);
            button.setAttribute('title', `Borrar sesión ${clave}`);
            button.innerHTML = '<i class="bi bi-trash3"></i>';
            button.innerHTML += `<span class="sr">Borrar sesión ${clave}</span>`;

            td = creaElem('td');
            td.setAttribute('rowspan', valor.length);
            td.appendChild(button);
            tr.appendChild(td);
        }

        elemento('#cuerpo').appendChild(tr);
    });

    const btnBorraSesion = elemento(`#borra${clave}`);
    if (btnBorraSesion) {
        btnBorraSesion.onclick = () => borraClave(clave);
    }
}
