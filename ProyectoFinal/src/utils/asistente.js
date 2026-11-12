function normalizar(texto = '') {
  return String(texto)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function elegirAlAzar(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

function ficha(lugar) {
  return {
    text: `${lugar.title}${lugar.club ? ` · ${lugar.club}` : ''}${lugar.city ? `\n${lugar.city}` : ''}\n${lugar.description || ''}`,
    action: { label: 'Ver ficha', lugar },
  };
}

export function saludoInicial() {
  return '¡Hola! Soy Suri, la guía de Punto Sur ✨ Puedo recomendarte un estadio, explicarte cómo moverte por el mapa o ayudarte a sumar tu propia cancha. ¿Por dónde arrancamos?';
}

export const SUGERENCIAS_ASISTENTE = [
  { icon: 'sparkles-outline', label: 'Recomendame uno', prompt: 'Recomiéndame un estadio' },
  { icon: 'add-circle-outline', label: 'Agregar estadio', prompt: '¿Cómo agrego un estadio?' },
  { icon: 'map-outline', label: 'Usar el mapa', prompt: '¿Cómo funciona el mapa?' },
  { icon: 'navigate-outline', label: 'Mi ubicación', prompt: '¿Cómo activo mi ubicación?' },
  { icon: 'phone-portrait-outline', label: 'Desde el celular', prompt: '¿Funciona en cualquier celular?' },
];

export function responderAsistente(texto, lugares = []) {
  const consulta = normalizar(texto);
  const tiene = (...palabras) => palabras.some((palabra) => consulta.includes(palabra));

  if (!consulta) {
    return { text: 'Escribime lo que necesites y te doy una mano con el mapa.' };
  }

  if (tiene('hola', 'buenas', 'buen dia', 'hey', 'que tal')) {
    return {
      text: '¡Hola! Qué bueno verte por acá. Puedo recomendarte un estadio para visitar, contarte cómo guardar uno nuevo o explicarte los detalles del mapa. ¿Qué te pinta?',
    };
  }

  if (tiene('gracias', 'genial', 'buenisimo', 'perfecto')) {
    return { text: '¡De nada! Si querés seguir explorando, decime “recomendame uno” y te tiro una idea.' };
  }

  if (tiene('agregar', 'agrego', 'sumar', 'sumo', 'nuevo', 'nueva', 'crear', 'creo', 'cargar', 'cargo', 'anotar')) {
    return {
      text: 'Para sumar una cancha, tocá el botón “+” en la parte de arriba. Completá el nombre, la descripción y las coordenadas, y si querés adjuntá una foto. Cuando guardes, el punto aparece en el mapa y queda en tu colección.',
    };
  }

  if (tiene('foto', 'imagen', 'camara', 'galeria')) {
    return {
      text: 'Dentro del formulario de “Nuevo estadio” vas a encontrar el botón “Agregar foto”. Podés elegir una imagen de tu galería; la vas a ver en la ficha y en el marcador del mapa.',
    };
  }

  if (tiene('ubicacion', 'gps', 'permiso', 'donde estoy', 'mi posicion')) {
    return {
      text: 'Tocá el botón de ubicación sobre el mapa y aceptá el permiso del navegador o del celular. El mapa se centra en tu posición y aparece un punto verde con tu ubicación actual.',
    };
  }

  if (tiene('web', 'navegador', 'computadora', 'computador', 'pc', 'escritorio')) {
    return {
      text: 'Sí: Punto Sur funciona en Android, iOS y también en el navegador. En la web vas a ver el mapa interactivo con todos los marcadores, las fotos y el asistente. Ideal para explorar desde la compu.',
    };
  }

  if (tiene('celular', 'telefono', 'android', 'iphone', 'ios', 'movil')) {
    return {
      text: 'Funciona en cualquier celular con Android o iPhone. En Android e iOS usás el mapa nativo; en la web se carga un mapa interactivo compatible con cualquier navegador moderno. No necesitás una app extra para la web.',
    };
  }

  if (tiene('mapa', 'marcador', 'pin', 'zoom', 'mover', 'navegar')) {
    return {
      text: 'En el mapa podés hacer zoom, arrastrar y tocar un marcador para abrir su ficha. Abajo (o al costado en la compu) tenés la lista de estadios y un buscador para filtrar por club, ciudad o nombre.',
    };
  }

  if (tiene('recomenda', 'recomienda', 'recomendame', 'sugeri', 'sugerime', 'sorpresa', 'cual veo', 'que visito', 'elegi')) {
    const candidatos = lugares.filter((lugar) => lugar && lugar.title && Number.isFinite(lugar.latitude));
    if (!candidatos.length) {
      return { text: 'Todavía no hay estadios cargados. Podés agregar el primero con el botón “+”.' };
    }
    const lugar = elegirAlAzar(candidatos);
    return {
      text: `Te propongo ${lugar.title}${lugar.club ? `, de ${lugar.club}` : ''}. ${lugar.city ? `Está en ${lugar.city}. ` : ''}${lugar.description || ''}`,
      action: { label: 'Ver ficha', lugar },
    };
  }

  if (tiene('cuantos', 'cantidad', 'lista', 'catalogo', 'todos los estadios')) {
    return {
      text: `Ahora mismo hay ${lugares.length} estadios en tu mapa. Podés verlos todos en la lista, buscar uno por club o ciudad, y tocar cada tarjeta para abrir su ficha completa.`,
    };
  }

  if (tiene('boca', 'river', 'racing', 'independiente', 'san lorenzo', 'rosario', 'newell', 'colon', 'union', 'talleres', 'estudiantes', 'tucuman', 'cordoba', 'mendoza')) {
    const lugar = lugares.find((item) => {
      const textoLugar = normalizar(`${item.title} ${item.club || ''} ${item.city || ''} ${item.description || ''}`);
      return consulta.split(/\s+/).some((palabra) => palabra.length > 3 && textoLugar.includes(palabra));
    });
    if (lugar) return ficha(lugar);
  }

  const lugarBuscado = lugares.find((item) => {
    const titulo = normalizar(item.title);
    return titulo.length > 4 && consulta.includes(titulo);
  });
  if (lugarBuscado) return ficha(lugarBuscado);

  if (tiene('que haces', 'que podes', 'ayuda', 'ayudame', 'opciones', 'como funciona', 'que puedo')) {
    return {
      text: 'Puedo ayudarte a: descubrir estadios, encontrar uno por club o ciudad, explicarte cómo agregar lugares y fotos, activar tu ubicación y contarte cómo usar el mapa en el celular o en la web. Probá con “recomendame uno”.',
    };
  }

  return {
    text: 'No estoy segura de haber entendido, pero puedo ayudarte con el mapa, tus estadios, las fotos o tu ubicación. Probá escribiendo “¿cómo agrego un estadio?” o “recomendame uno”.',
  };
}
