const { execSync } = require('child_process');

function run(cmd){
  try{
    return execSync(cmd, { stdio: 'inherit' });
  }catch(e){
    console.error('Command failed:', cmd);
    process.exit(e.status||1);
  }
}

const msg = process.argv.slice(2).join(' ') || 'chore: save changes';

console.log('Staging all changes...');
run('git add -A');

try{
  console.log('Committing with message:', msg);
  execSync(`git commit -m "${msg.replace(/"/g,'\"')}"`, { stdio: 'inherit' });
}catch(e){
  console.log('No changes to commit or commit failed (see output).');
}

console.log('Pushing to remote...');
run('git push');

console.log('Done.');
