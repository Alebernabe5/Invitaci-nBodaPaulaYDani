document.addEventListener("DOMContentLoaded", function () {
  // Control de la cuenta regresiva
  const countdownDate = new Date("2025-09-20T12:30:00").getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = countdownDate - now;

    if (distance < 0) {
      document.getElementById("countdown-timer").innerHTML = "<p>¡Ya es el gran día!</p>";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("days").textContent = days.toString().padStart(2, "0");
    document.getElementById("hours").textContent = hours.toString().padStart(2, "0");
    document.getElementById("minutes").textContent = minutes.toString().padStart(2, "0");
    document.getElementById("seconds").textContent = seconds.toString().padStart(2, "0");
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // 🎵 Música
  const audio = document.getElementById("musica");
  const boton = document.getElementById("toggleMusica");
  const icono = boton.querySelector("i");

  const imagenPantalla = document.getElementById('imagenPantallaCompleta');
  const contenidoPagina = document.getElementById('contenidoPagina');

  let estaSonando = false;

  imagenPantalla.addEventListener('click', function () {
    imagenPantalla.style.display = 'none';
    contenidoPagina.style.display = 'block';

    audio.play().then(() => {
      estaSonando = true;
      icono.classList.remove("fa-play");
      icono.classList.add("fa-pause");
    }).catch(err => {
      console.warn("No se pudo reproducir el audio automáticamente:", err);
    });
  });

  boton.addEventListener("click", () => {
    if (estaSonando) {
      audio.pause();
      icono.classList.remove("fa-pause");
      icono.classList.add("fa-play");
    } else {
      audio.play().then(() => {
        icono.classList.remove("fa-play");
        icono.classList.add("fa-pause");
      }).catch(err => {
        console.warn("No se pudo reproducir el audio:", err);
      });
    }
    estaSonando = !estaSonando;
  });

  


// Lógica del formulario de asistencia
const form = document.getElementById("formulario-asistencia");
const asistenciaRadios = form.elements["asistencia"];

const noAsisteCampo = document.getElementById("no-asiste-campo");
const siAsisteCampos = document.getElementById("si-asiste-campos");

const nombresNo = document.getElementById("nombres_no");
const nombresSi = document.getElementById("nombres_si");

const totalPersonas = document.getElementById("total_personas");
const adultosInput = document.getElementById("adultos");
const ninosInput = document.getElementById("ninos");

const botonEnviar = document.getElementById("enviar-asistencia");

// Desactivar autocompletado
const formFields = document.querySelectorAll('#formulario-asistencia input, #formulario-asistencia select, #formulario-asistencia textarea');
formFields.forEach(field => {
  field.setAttribute('autocomplete', 'off');
});

// Mostrar/ocultar campos dinámicamente y required
form.addEventListener("change", () => {
  const asistencia = form.elements["asistencia"].value;

  const mostrarNo = asistencia === "no";
  const mostrarSi = asistencia === "si";

  noAsisteCampo.style.display = mostrarNo ? "block" : "none";
  siAsisteCampos.style.display = mostrarSi ? "block" : "none";

  nombresNo.required = mostrarNo;
  nombresSi.required = mostrarSi;
  totalPersonas.required = mostrarSi;
  adultosInput.required = mostrarSi;
  ninosInput.required = mostrarSi;

  revisarEstadoFormulario();
});

// Validación y envío del formulario
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const asistencia = form.elements["asistencia"].value;

  if (!asistencia) {
    alert("Por favor, indica si asistirás.");
    return;
  }

  if (asistencia === "no") {
    if (nombresNo.value.trim() === "") {
      alert("Por favor, introduce los nombres de los que no asistirán.");
      return;
    }
  }

  if (asistencia === "si") {
    if (nombresSi.value.trim() === "") {
      alert("Por favor, introduce los nombres de los asistentes.");
      return;
    }

    if (totalPersonas.value === "" || parseInt(totalPersonas.value) < 1) {
      alert("Por favor, indica cuántas personas asistirán.");
      return;
    }

    const adultos = parseInt(adultosInput.value) || 0;
    const ninos = parseInt(ninosInput.value) || 0;
    const total = parseInt(totalPersonas.value);

    if (adultos + ninos !== total) {
      alert("La suma de adultos y niños debe coincidir con el total de personas.");
      return;
    }
  }

  // Recolección de datos para enviar
  const data = {
    asistencia,
    nombres: asistencia === "si" ? nombresSi.value.trim() : nombresNo.value.trim(),
    total_personas: totalPersonas.value || "",
    adultos: adultosInput.value || "0",
    ninos: ninosInput.value || "0",
    alergia: form.elements["alergia"]?.value || "",
    cancion: form.elements["cancion"]?.value || "",
    mensaje: form.elements["mensaje"]?.value || ""
  };

  // Enviar datos al servidor
  fetch("https://script.google.com/macros/s/AKfycbyWTwPpBmY7ZZqqqi1g3cIU9ny4uu9cMiPuWZfFevpuPs9q4Qr6Kk7PQDhvblH_OWo/exec", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error en la respuesta del servidor: ${response.status}`);
      }
      return response.json().catch(() => ({})); // En caso de que no devuelva JSON
    })
    .then(() => {
      alert("¡Gracias por confirmar!");
      form.reset();
      siAsisteCampos.style.display = "none";
      noAsisteCampo.style.display = "none";
      revisarEstadoFormulario();
    })
    .catch((err) => {
      console.error("Error al enviar", err);
      alert("Hubo un problema al enviar tu respuesta.");
    });
});

// Activar/desactivar el botón según validez
function revisarEstadoFormulario() {
  const asistencia = form.elements["asistencia"].value;

  if (!asistencia) {
    botonEnviar.disabled = true;
    return;
  }

  if (asistencia === "no") {
    botonEnviar.disabled = nombresNo.value.trim() === "";
    return;
  }

  if (asistencia === "si") {
    const nombresOk = nombresSi.value.trim() !== "";
    const totalOk = totalPersonas.value !== "" && parseInt(totalPersonas.value) > 0;
    botonEnviar.disabled = !(nombresOk && totalOk);
  }
}

// Ejecutar revisión al cargar la página
revisarEstadoFormulario();

// Revisión dinámica en cada input o select para validar botón
form.querySelectorAll("input, textarea, select").forEach(el => {
  el.addEventListener("input", revisarEstadoFormulario);
  el.addEventListener("change", revisarEstadoFormulario);
});


});
