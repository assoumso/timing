import { watch } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import readline from 'readline';

const execAsync = promisify(exec);
const srcDir = path.resolve('./src');

console.log(`\x1b[32m🚀 Démarrage de la surveillance Git interactive sur ${srcDir}...\x1b[0m`);
console.log('\x1b[33mLe script vous demandera confirmation à chaque modification. Ctrl+C pour arrêter.\x1b[0m');

let timeoutId = null;
let isPrompting = false;

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => rl.question(query, (ans) => {
    rl.close();
    resolve(ans.trim().toLowerCase());
  }));
}

watch(srcDir, { recursive: true }, (eventType, filename) => {
  if (!filename) return;
  
  if (
    filename.includes('node_modules') || 
    filename.includes('dist') || 
    filename.includes('.git') ||
    filename.endsWith('~')
  ) {
    return;
  }

  if (isPrompting) return;

  if (timeoutId) clearTimeout(timeoutId);

  timeoutId = setTimeout(async () => {
    isPrompting = true;
    console.log(`\n\x1b[36m⚡ Modification détectée dans : ${filename}\x1b[0m`);
    
    const response = await askQuestion('❓ Voulez-vous valider et envoyer ces modifications sur GitHub ? (o/n) [o] : ');
    
    if (response === 'o' || response === 'oui' || response === '') {
      try {
        console.log('📦 Transfert en cours...');
        await execAsync('git add .');
        const timeStr = new Date().toLocaleTimeString('fr-FR');
        await execAsync(`git commit -m "auto: mise a jour (${timeStr})"`);
        await execAsync('git push origin main');
        console.log('\x1b[32m✅ GitHub mis à jour avec succès !\x1b[0m\n');
      } catch (error) {
        if (error.message.includes('nothing to commit') || error.message.includes('clean')) {
          console.log('\x1b[33mℹ️ Aucun changement réel à valider.\x1b[0m\n');
        } else {
          console.error('\x1b[31m❌ Erreur Git :\x1b[0m', error.message.trim());
        }
      }
    } else {
      console.log('\x1b[33m🛑 Transfert annulé par l\'utilisateur.\x1b[0m\n');
    }
    
    isPrompting = false;
  }, 1000); // 1 second debounce
});
