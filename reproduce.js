const fs = require('fs')
const path = require('path')

// Took this from https://stackoverflow.com/questions/18052762/remove-directory-which-is-not-empty (I know I messed up indentation)
    const deleteFolderRecursive = function (directoryPath) {
    if (fs.existsSync(directoryPath)) {
        fs.readdirSync(directoryPath).forEach((file, index) => {
          const curPath = path.join(directoryPath, file);
          if (fs.lstatSync(curPath).isDirectory()) {
           // recurse
            deleteFolderRecursive(curPath);
          } else {
            // delete file
            fs.unlinkSync(curPath);
          }
        });
        fs.rmdirSync(directoryPath);
      }
    };

// npm breaks when running more than once if we don't do this
deleteFolderRecursive('node_modules/minecraft-protocol');

const { execSync } = require('child_process')

execSync('npm i')

const shell = require('shelljs')
const minecraftFolder = require('minecraft-folder-path')

shell.rm('-r', 'node_modules/minecraft-protocol')

// You need git installed for this part
execSync('git clone https://github.com/Heath123/node-minecraft-protocol/ --branch fix-new-account --single-branch node_modules/minecraft-protocol')

// Copy launcher_accounts.json into current folder
shell.cp('-r', path.join(minecraftFolder, 'launcher_accounts.json'), './')

// Start of actual code

const mc = require('minecraft-protocol')

const client = mc.createClient({
  profilesFolder: './',

  // Change these
  username: 'circuit10',
  host: 'localhost',
  port: 29132
})
client.on('error', function (err) {
  console.error(err)
})

client.on('connect', function () {
  console.info('connected')
})
client.on('disconnect', function (packet) {
  console.log('disconnected: ' + packet.reason)
})
client.on('end', function () {
  console.log('Connection lost')
})
client.on('chat', function (packet) {
  const jsonMsg = JSON.parse(packet.message)
  if (jsonMsg.translate === 'chat.type.announcement' || jsonMsg.translate === 'chat.type.text') {
    const username = jsonMsg.with[0].text
    const msg = jsonMsg.with[1]
    if (username === client.username) return
    if (msg.text) client.write('chat', { message: msg.text })
    else client.write('chat', { message: msg })
  }
})
