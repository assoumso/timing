import { watch } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);
const srcDir = path.resolve('./src');

console.log(`\x1b[32m🚀 Démarrage de la surveillance Git automatique sur ${srcDir}...\x1b[0m`);
console.log('\x1b[33mAppuyez sur Ctrl+C pour arrêter le script.\x1b[0m');

let timeoutId = null;

// Built-in recursive watch supported natively on Windows
watch(srcDir, { recursive: true }, (eventType, filename) => {
  if (!filename) return;
  
  // Ignore backup/editor temporary files and builds
  if (
    filename.includes('node_modules') || 
    filename.includes('dist') || 
    filename.includes('.git') ||
    filename.endsWith('~')
  ) {
    return;
  }

  // Debounce multiple fast saves into a single push
  if (timeoutId) clearTimeout(timeoutId);

  timeoutId = setTimeout(async () => {
    console.log(`\x1b[36m⚡ Modification détectée dans : ${filename}. Envoi vers GitHub...\x1b[0m`);
    try {
      await execAsync('git add .');
      const timeStr = new Date().toLocaleTimeString('fr-FR');
      await execAsync(`git commit -m "auto: mise a jour automatique (${timeStr})"`);
      await execAsync('git push origin main');
      console.log('\x1b[32m✅ GitHub mis à jour avec succès !\x1b[0m\n');
    } catch (error) {
      if (error.message.includes('nothing to commit') || error.message.includes('clean')) {
        // No action needed
      } else {
        console.error('\x1b[31m❌ Erreur Git :\x1b[0m', error.message.trim());
      }
    }
  }, 1500); // 1.5 seconds delay to allow file lock releases
});
