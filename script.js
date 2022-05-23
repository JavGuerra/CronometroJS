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

let cronometro, parada10s;
let sesion = [];
let numSesion = numClave();
let tiempo = 0;

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

/* Botones al inicio */
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


/* Inicia el cronómetro */
function iniciaCrono() {
    botonsCrono(btnInicia);
    poneBtnReinicio(true);

    parateCrono();
    tiempo = -1; // Porque sumaCrono() le suma 1.
    sumaCrono();
    continCrono();
}


/* Continua el cronómetro tras la pausa */
function continCrono() {
    botonsCrono(btnContin);

    cronometro = setInterval(sumaCrono, 1000);
}


/* Para el cronómetro o el tiempo */
function parateCrono() {
    botonsCrono(btnParate);

    if (cronometro) {
        clearInterval(cronometro);
        cronometro = null;
    }
    if (parada10s ) {
        clearInterval(parada10s );
        parada10s  = null;
        btnInactivo(btnContin, true);
    } 
    if (!tiempo) btnInactivo(btnGuarda, true);
}


/* Inicia la cuenta hasta 10 */
function cuentaCrono() {
    parateCrono();
    botonsCuenta();
    poneBtnReinicio(false);

    tiempo = 11; // Porque restaCuenta() le resta 1.
    restaCuenta();
    cronometro = setInterval(restaCuenta, 1000);
    parada10s  = setTimeout( parateCrono, limite(10000));
}


/* Milisegundos según navegador */
function limite(miliSeg) {
    return navigator.userAgent.indexOf("Firefox") > -1 ? miliSeg + 1000 : miliSeg;
}


/* Suma y muestra minutos y segundos */
function sumaCrono() {
    let minSeg, formato;

    tiempo++;
    minSeg = separa(tiempo);

    formato = `<span class="tiempo">${minSeg.segundos}</span>` 
            + '<span class="medida"> s</span>';
    if (minSeg.minutos) {
            formato = `<span class="tiempo">${minSeg.minutos}</span>`
            + '<span class="medida"> min</span>'
            + '<span class="separa"> :</span>' + formato;
    }

    elResulta.innerHTML = formato;

    if (minSeg.minutos == 59 && minSeg.segundos == 59) {
        parateCrono();
        btnInactivo(btnContin, true);
    }
}


/* Resta y muestra el tiempo */
function restaCuenta() {
    let formato;

    tiempo--;

    formato = `<span class="tiempo">${digitos(tiempo)}</span>`
            + '<span class="medida"> s</span>';  
     
    elResulta.innerHTML = formato;
}


/* Devuelve dos dígitos */
function digitos(numero) {
    return numero < 10 ? '0' + numero : numero ;
}


/* Devuelve un objeto con los minutos y segundos */
function separa(tiempo) {
    let minutos, segundos;

    if (tiempo  >= 60) {
        minutos  = digitos(Math.trunc(tiempo / 60));
        segundos = digitos(tiempo % 60);
    } else {
        minutos  = 0;
        segundos = digitos(tiempo);
    }

    return {'minutos': minutos, 'segundos': segundos};
}


/* Activa y desactiva botones según cronómetro */
function botonsCrono(boton) {
    btnInactivo(btnInicia, false);
    btnInactivo(btnContin, false);
    btnInactivo(btnParate, false);
    btnInactivo(btnCuenta, false);
    btnInactivo(btnGuarda, false);
    btnInactivo(boton, true);
}


/* Activa y desactiva botones según contador */
function botonsCuenta() {
    btnInactivo(btnParate, false);
    btnInactivo(btnGuarda, false);
    btnInactivo(btnContin, true);
    btnInactivo(btnCuenta, true);
}


/* Cambia el estado de un botón dado */
function btnInactivo(boton, estado) {
    if (estado) {
      boton.disabled = true;
      boton.setAttribute('aria-disabled', 'true');
    } else {
      boton.disabled = false;
      boton.setAttribute('aria-disabled', 'false');
    }
}

/* Cambia el icono del botón de inicio/reiniciar */
function poneBtnReinicio(estado) {
    let icono = elemento('#inicia i');
    if (estado) {
        icono.classList.remove('bi-play-fill');
        icono.classList.add('bi-arrow-clockwise');
    } else {
        icono.classList.remove('bi-arrow-clockwise');
        icono.classList.add('bi-play-fill');
    }
}


/* Obtiene la última clave en localStorage */
function numClave() {
    return existeClave('ultSesion') ? parseInt(localStorage.ultSesion) + 1 : 1;
}


/* ¿Existe la clave en localStorage? Devuelve un booleano */
function existeClave(clave) {
    return localStorage.getItem(clave) !== undefined && localStorage.getItem(clave);
}


/* Guarda en localStorage las sesiones */
function guardaLocal() {
    let hoy, fecha, hora, fechaHora;
    btnInactivo(btnGuarda, true);
    
    hoy = new Date();
    fecha = `${digitos(hoy.getDate())}-${digitos(hoy.getMonth() + 1)}-${hoy.getFullYear()}`;
    hora = `${digitos(hoy.getHours())}:${digitos(hoy.getMinutes())}:${digitos(hoy.getSeconds())}`;
    fechaHora = fecha + ' ' + hora;

    sesion.push({'segundos': tiempo, 'fechaHora': fechaHora});

    localStorage.setItem(numSesion, JSON.stringify(sesion));
    localStorage.ultSesion = numSesion;

    creaTabla('<i class="bi bi-stopwatch"></i>&nbsp; Sesión actual');
    creaFilas(numSesion, sesion);

    btnInactivo(btnBorrar, false);
    btnInactivo(btnHistor, false);
    if (cronometro || parada10s) btnInactivo(btnGuarda, false);
}


/* Muestra el contenido de localStorage */
function historLocal() {
    let i, valor;
    btnInactivo(btnHistor, true);

    creaTabla('<i class="bi bi-list-ol"></i>&nbsp; Sesiones guardadas');

    for (i = parseInt(localStorage.ultSesion); i > 0; i--) { 
        valor = JSON.parse(localStorage.getItem(i));
        creaFilas(i, valor);
    }
}


/* Borra el contenido de localStorage */
function borrarLocal() {
    btnInactivo(btnBorrar, true);
    // Procede usar if(confirm('pregunta')), pero para el crono hasta confirmar 

    localStorage.clear();
    sesion = [];
    numSesion = 1;
    elListado.textContent = '';

    btnInactivo(btnHistor, true);
    
}


/* Borra la clave de localStorage */
function borraClave(clave) {
    localStorage.removeItem(clave);
    let numSesiones = localStorage.length - 1;  // Menos la clave 'ultSesion'.

    if (numSesiones) {
        localStorage.ultSesion = numSesiones;

        if (numSesion == clave) {
            sesion = [];
        } else {
            // Para evitar huecos...
            ordenaClaves(clave, numSesiones + 1); // +1 sesión que quitamos.
            numSesion--;
        }

        historLocal();
        
    } else {
        borrarLocal();
    }
}


/* Ordena los números de las sesiones por encima de la clave eliminada */
function ordenaClaves(clave, numSesiones) {
    let i, valClave;

    for (i = clave; i < numSesiones; i++) {
        valClave = localStorage.getItem(i + 1);
        localStorage.removeItem(i + 1);
        localStorage.setItem(i, valClave);
    }
}


/* Crea una tabla con caption que sustituye a la que hubiera */
function creaTabla(titulo) {
    let thead, tbody, tr, th, hr;

    tr = creaElem('tr');

    th = creaElem('th');
    th.setAttribute('scope', 'col');
    th.classList.add('ancho');
    th.innerHTML = '<small>Clave</small>';
    tr.appendChild(th);

    th = creaElem('th');
    th.setAttribute('scope', 'col');
    th.classList.add('ancho');
    th.innerHTML = '<small>Núm.</small>';
    tr.appendChild(th);

    th = creaElem('th');
    th.setAttribute('scope', 'col');
    th.classList.add('crono');
    th.innerHTML = '<small>Crono</small>';
    tr.appendChild(th);

    th = creaElem('th');
    th.setAttribute('scope', 'col');
    th.classList.add('fecha');
    th.innerHTML = '<small>Fecha / Hora</small>';
    tr.appendChild(th);

    th = creaElem('th');
    th.setAttribute('scope', 'col');
    th.classList.add('ancho');
    th.innerHTML = '<small>Borra</small>';
    tr.appendChild(th);

    thead = creaElem('thead');
    thead.appendChild(tr);

    tbody = creaElem('tbody');
    tbody.setAttribute("id", "cuerpo");

    caption = creaElem('caption');
    caption.innerHTML = '<h2>' + titulo + '</h2>';

    table = creaElem('table');
    table.append(caption, thead, tbody);

    hr = creaElem('hr');

    elListado.textContent = '';
    elListado.append(hr, table);
}

/* Crea filas en tbody por cada valor del cronómetro guardado en la sesión */
function creaFilas(clave, valor) {
    let tr, th, td, minSeg, button;

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
        if (minSeg.minutos) formato = minSeg.minutos + 'min, ' + formato;
        td = creaElem('td');
        td.innerHTML = '<strong>' + formato + '</strong>';
        tr.appendChild(td);

        td = creaElem('td');
        td.textContent = obj.fechaHora;
        tr.appendChild(td);

        if (!i) {
            button = creaElem('button');
            button.setAttribute('id', `borra${clave}`);
            button.innerHTML = '<i class="bi bi-trash3"></i>';
            button.innerHTML += `<span class="sr">Borrar sesión ${clave}</span>`;
            td = creaElem('td');
            td.setAttribute('rowspan', valor.length);
            td.appendChild(button);
            tr.appendChild(td);
        }

        elemento('#cuerpo').appendChild(tr);
    });

    elemento(`#borra${clave}`).onclick = () => borraClave(clave);
}


/* Devuelve un elemento */
function elemento(sel) { return document.querySelector(sel); }


/* Crea y un elemento y lo devuelve */
function creaElem(el)  { return document.createElement(el);  }
