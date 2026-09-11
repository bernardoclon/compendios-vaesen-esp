// Definición del ID del módulo para consistencia
const MODULE_ID = "compendios-vaesen-esp";

// Define la configuración de tus compendios.
const compendiumBanners = [
    {
        dataPack: `${MODULE_ID}.vaesen`,
        colorText: "#ff5252", // Se mantiene para compatibilidad con estilos de texto si se desea
        iconText: "fa-solid fa-tint", // Se mantiene para compatibilidad con iconos si se desea
        bannerImage: `modules/${MODULE_ID}/art/banner1.png`,
    },
    {
        dataPack: `${MODULE_ID}.armas-armaduras-y-objetos`,
        colorText: "#ff5252",
        iconText: "fa-solid fa-dot-circle",
        bannerImage: `modules/${MODULE_ID}/art/banner2.png`,
    },
    {
        dataPack: `${MODULE_ID}.magia-talentos-y-heridas-criticas`,
        colorText: "#ff5252",
        iconText: "fa-solid fa-gavel",
        bannerImage: `modules/${MODULE_ID}/art/banner3.png`,
    },
    {
        dataPack: `${MODULE_ID}.tablas-de-tiradas`,
        colorText: "#ff5252",
        iconText: "fa-solid fa-user-secret",
        bannerImage: `modules/${MODULE_ID}/art/banner4.png`,
    },
    {
        dataPack: `${MODULE_ID}.enemigos`,
        colorText: "#ff5252",
        iconText: "fa-solid fa-user-secret",
        bannerImage: `modules/${MODULE_ID}/art/banner5.png`,
    },
    {
        dataPack: `${MODULE_ID}.aventuras`,
        colorText: "#ff5252",
        iconText: "fa-solid fa-user-secret",
        bannerImage: `modules/${MODULE_ID}/art/banner6.png`,
    },
    {
        dataPack: `${MODULE_ID}.mapas`,
        colorText: "#ff5252",
        iconText: "fa-solid fa-user-secret",
        bannerImage: `modules/${MODULE_ID}/art/banner7.png`,
    }
];

// Nuevo Map para almacenar los MutationObservers de cada banner de ventana emergente abierto
// Mapea el popoutId a su MutationObserver.
const bannerObservers = new Map();

// Nuevo Map para almacenar los elementos <style> inyectados dinámicamente
// Mapea el popoutId a su elemento <style> HTML.
const injectedStyles = new Map();

// Hook que se ejecuta una vez que Foundry VTT está completamente cargado y listo
Hooks.once('ready', async function() {
  console.log(`${MODULE_ID} | Módulo completamente listo y cargado.`);

  // Iniciar un observador global del DOM en el body para detectar ventanas emergentes
  console.log(`${MODULE_ID} | DEBUG GLOBAL: Iniciando observador global del DOM en document.body para detectar ventanas emergentes.`);
  const globalBodyObserver = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
              for (const node of mutation.addedNodes) {
                  // Solo procesar si el nodo es un elemento HTML
                  if (node.nodeType === Node.ELEMENT_NODE) {
                      // Verificar si el nodo añadido es una ventana emergente de compendio o la contiene
                      const popoutSection = node.matches('section[id^="Compendium-"].sidebar-popout') ? node : node.querySelector('section[id^="Compendium-"].sidebar-popout');
                      
                      // Si detectamos una sección de ventana emergente
                      if (popoutSection) {
                          console.log(`${MODULE_ID} | DEBUG GLOBAL: Detectada posible ventana emergente de compendio para banner: ${popoutSection.id}`);
                          applyCompendiumBanner(popoutSection); // Llamar a la función para aplicar el banner
                      }
                  }
              }
          }
      }
  });

  // Observar cambios en el cuerpo del documento (adición/eliminación de nodos hijos)
  // subtree: true para observar también cambios en los descendientes del body
  globalBodyObserver.observe(document.body, { childList: true, subtree: true });
});


// Lógica para cambiar el atributo 'src' de la imagen del banner en la barra lateral
Hooks.on("renderCompendiumDirectory", (app, html, data) => {
  console.log(`${MODULE_ID} | Renderizando Directorio de Compendios, intentando cambiar src de banners de imagen.`);
  
  const compendiumThemesMap = new Map(compendiumBanners.map(theme => [theme.dataPack, theme.bannerImage]));

  // Obtener el elemento raíz, asegurándose de que sea un HTMLElement
  const rootElement = html instanceof HTMLElement ? html : html[0];

  if (!rootElement) {
    console.warn(`${MODULE_ID} | No se pudo obtener el elemento raíz para el Directorio de Compendios.`);
    return;
  }

  // Iterar sobre todos los elementos de compendio en el HTML renderizado
  const compendiumItems = rootElement.querySelectorAll('li.directory-item.compendium');
  compendiumItems.forEach(compendiumItem => {
    const dataPack = compendiumItem.dataset.pack;
    const customBannerImage = compendiumThemesMap.get(dataPack);

    if (customBannerImage) {
      const bannerImg = compendiumItem.querySelector('img.compendium-banner');
      if (bannerImg) {
        bannerImg.src = customBannerImage; // Cambia el atributo src de la imagen
        console.log(`${MODULE_ID} | Estableciendo banner para ${dataPack} (sidebar): ${customBannerImage}`);
      } else {
        // En tu HTML, el elemento img en el sidebar no tiene la clase .compendium-banner por defecto.
        // Podría ser un <a> directamente, o la imagen está en un elemento diferente.
        // Si el img.compendium-banner no existe, Foundry usa un background-image en el <a>.
        // Vamos a aplicar el background-image al <a> si no encontramos el img.
        const compendiumLink = compendiumItem.querySelector('a.entry-name.compendium-name');
        if (compendiumLink) {
             compendiumLink.style.setProperty('background-image', `url('${customBannerImage}')`, 'important');
             compendiumLink.style.setProperty('background-size', 'cover', 'important');
             compendiumLink.style.setProperty('background-position', 'center', 'important');
             compendiumLink.style.setProperty('background-repeat', 'no-repeat', 'important');
             console.log(`${MODULE_ID} | Aplicando background-image al enlace del sidebar para ${dataPack}: ${customBannerImage}`);
        } else {
            console.log(`${MODULE_ID} | No se encontró ni 'img.compendium-banner' ni 'a.entry-name.compendium-name' para el paquete: ${dataPack} (sidebar).`);
        }
      }
    } else {
      // console.log(`${MODULE_ID} | No hay banner personalizado definido para el paquete: ${dataPack} (sidebar).`);
    }
  });
});


// FUNCIÓN PRINCIPAL: Aplica el banner a una ventana emergente de compendio
function applyCompendiumBanner(popoutSection) {
    const popoutId = popoutSection.id;

    console.log(`${MODULE_ID} | DEBUG: applyCompendiumBanner: Procesando ventana emergente de compendio: ${popoutId}`);
    
    const compendiumThemesMap = new Map(compendiumBanners.map(theme => [theme.dataPack, theme.bannerImage]));

    // Extraer el dataPack ID del ID del elemento HTML de la ventana emergente
    // La ID es "Compendium-MODULE_ID_PACK_NAME" (ej: "Compendium-compendios-vaesen-esp_vaesen")
    const fullIdString = popoutId.replace('Compendium-', '');
    
    // Buscar el último guion bajo para separar el MODULE_ID del PACK_NAME
    const lastUnderscoreIndex = fullIdString.lastIndexOf('_');
    
    let dataPackIdForPopout;
    if (lastUnderscoreIndex !== -1) {
        const moduleId = fullIdString.substring(0, lastUnderscoreIndex);
        const packName = fullIdString.substring(lastUnderscoreIndex + 1);
        dataPackIdForPopout = `${moduleId}.${packName}`;
    } else {
        // Fallback si no hay guion bajo
        dataPackIdForPopout = fullIdString.replace(/_/g, '.');
    }
    
    console.log(`${MODULE_ID} | DEBUG: applyCompendiumBanner: dataPackIdFromElementId para pop-out: ${dataPackIdForPopout}`);
    console.log(`${MODULE_ID} | DEBUG: Paquetes disponibles:`, compendiumBanners.map(b => b.dataPack).join(', '));

    const customBannerImage = compendiumThemesMap.get(dataPackIdForPopout);
    
    if (customBannerImage) {
      const headerBannerDiv = popoutSection.querySelector('.header-banner');
      console.log(`${MODULE_ID} | DEBUG: .header-banner encontrado: ${headerBannerDiv ? 'SÍ' : 'NO'}`);

      if (headerBannerDiv) {
        // Eliminar la imagen por defecto de Foundry VTT si existe
        const mainBannerImg = headerBannerDiv.querySelector('img');
        if (mainBannerImg) {
            mainBannerImg.remove(); 
            console.log(`${MODULE_ID} | DEBUG: Imagen por defecto eliminada para ${popoutId}.`);
        }

        // === APLICAR ESTILOS DIRECTAMENTE AL ELEMENTO ===
        console.log(`${MODULE_ID} | DEBUG: Aplicando estilos inline directamente...`);
        headerBannerDiv.style.setProperty('background-image', `url('${customBannerImage}')`, 'important');
        headerBannerDiv.style.setProperty('background-size', 'cover', 'important');
        headerBannerDiv.style.setProperty('background-position', 'center', 'important');
        headerBannerDiv.style.setProperty('background-repeat', 'no-repeat', 'important');
        console.log(`${MODULE_ID} | DEBUG: ✓ Estilos inline aplicados. Background: ${headerBannerDiv.style.getPropertyValue('background-image')}`);

        // === INYECTAR CSS GLOBAL COMO FALLBACK ===
        if (injectedStyles.has(popoutId)) {
            injectedStyles.get(popoutId).remove();
            injectedStyles.delete(popoutId);
        }

        const styleElement = document.createElement('style');
        styleElement.id = `compendium-banner-style-${popoutId}`;
        styleElement.textContent = `
            #${popoutId} .header-banner {
                background-image: url('${customBannerImage}') !important;
                background-size: cover !important;
                background-position: center !important;
                background-repeat: no-repeat !important;
            }
            #${popoutId} .header-banner img {
                display: none !important;
            }
        `;
        document.head.appendChild(styleElement);
        injectedStyles.set(popoutId, styleElement);
        console.log(`${MODULE_ID} | DEBUG: ✓ CSS global inyectado`);

        // === CONFIGURAR MUTATION OBSERVER ===
        if (bannerObservers.has(popoutId)) {
            bannerObservers.get(popoutId).disconnect();
            bannerObservers.delete(popoutId);
        }

        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    const imgInBanner = headerBannerDiv.querySelector('img');
                    if (imgInBanner) {
                        console.log(`${MODULE_ID} | DEBUG: Observer detectó imagen reinsertada, eliminando...`);
                        imgInBanner.remove();
                    }
                }
            }
        });

        // Observar cambios en los hijos directos del div.header-banner
        observer.observe(headerBannerDiv, { childList: true, subtree: false });
        bannerObservers.set(popoutId, observer);
        console.log(`${MODULE_ID} | DEBUG: ✓ Mutation Observer configurado`);
        
      } else {
        console.error(`${MODULE_ID} | ❌ ERROR: No se encontró '.header-banner' en ${popoutId}`);
      }
    } else {
      console.error(`${MODULE_ID} | ❌ ERROR: No hay banner para ${dataPackIdForPopout}`);
    }
}


// Hook para limpiar los observers Y LOS ESTILOS INYECTADOS cuando una aplicación se cierra
Hooks.on("closeApplication", (app) => {
    const closedAppId = app.element?.[0]?.id;
    if (closedAppId) {
        // Desconectar y eliminar observer si existe
        if (bannerObservers.has(closedAppId)) {
            bannerObservers.get(closedAppId).disconnect();
            bannerObservers.delete(closedAppId);
            console.log(`${MODULE_ID} | DEBUG: Observer para la ventana emergente ${closedAppId} desconectado y eliminado.`);
        }
        // Eliminar estilo inyectado si existe
        if (injectedStyles.has(closedAppId)) {
            injectedStyles.get(closedAppId).remove();
            injectedStyles.delete(closedAppId);
            console.log(`${MODULE_ID} | DEBUG: Estilo CSS inyectado para la ventana emergente ${closedAppId} eliminado.`);
        }
    }
});

// El hook renderApplication sigue siendo útil para el primer renderizado o para cuando
// una aplicación es completamente reconstruida por Foundry (ej. arrastrar entre monitores).
// Usamos setTimeout para dar tiempo a Foundry a renderizar antes de aplicar nuestros cambios.
Hooks.on("renderApplication", (app, html, data) => {
    const popoutSection = app.element?.[0];

    // Verificamos si la aplicación renderizada es una ventana emergente de compendio.
    if (popoutSection && popoutSection.id.startsWith('Compendium-') && popoutSection.classList.contains('sidebar-popout')) {
        const popoutId = popoutSection.id;
        console.log(`${MODULE_ID} | DEBUG: renderApplication hook DETECTADO para ID: ${popoutId}.`);

        // Programar la aplicación del banner con un pequeño retraso.
        // Esto permite que Foundry complete su ciclo de renderizado.
        setTimeout(() => {
            console.log(`${MODULE_ID} | DEBUG: Llamando a applyCompendiumBanner después de re-renderización con retardo para ID: ${popoutId}.`);
            applyCompendiumBanner(popoutSection);
        }, 100); 
    }
});
