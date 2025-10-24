Hooks.once('ready', () => {
  console.log('Compendios Vaesen [ESP] | Initializing');

  // Register settings
  game.settings.register('compendios-vaesen-esp', 'moduleActive', {
    name: 'Module Active',
    scope: 'world',
    config: false,
    type: Boolean,
    default: true,
    onChange: value => {
      if (value) {
        createCompendiumFolders();
      } else {
        // Optionally, you can add logic here to handle module deactivation
        // For simplicity, we won't remove the compendium folders now
      }
    }
  });
});

Hooks.once('ready', async function() {
  console.log('Compendios Vaesen [ESP] | Ready');

  // Create folders if module is active
  if (game.settings.get('compendios-vaesen-esp', 'moduleActive')) {
    createCompendiumFolders();
  }
});

// Function to create compendium folders
async function createCompendiumFolders() {
  const folderName = "Vaesen";
  let folder = game.folders.contents.find(f => f.name === folderName && f.type === "Compendium");
  if (!folder) {
    folder = await Folder.create({
      name: folderName,
      type: "Compendium",
      sorting: "m",
      color: "#5c330a"
    });
  }

  // Move packs into the folder
  const packsToMove = [
    "compendios-vaesen-esp.vaesen",
    "compendios-vaesen-esp.armas-armaduras-y-objetos",
    "compendios-vaesen-esp.magia-talentos-y-heridas-criticas",
    "compendios-vaesen-esp.tablas-de-tiradas",
    "compendios-vaesen-esp.enemigos",
    "compendios-vaesen-esp.aventuras",
    "compendios-vaesen-esp.mapas",
  ];

  for (const packId of packsToMove) {
    let pack = game.packs.get(packId);
    if (pack) {
      await pack.configure({ folder: folder.id });
    }
  }
}

// Hook into module enable/disable
Hooks.on('controlToken', () => {
  let activeModules = game.modules.filter(m => m.active).map(m => m.id);
  game.settings.set('compendios-vaesen-esp', 'moduleActive', activeModules.includes('compendios-vaesen-esp'));
});