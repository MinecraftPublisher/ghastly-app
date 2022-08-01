const fs = require('fs');

try { fs.unlinkSync('./last-deploy'); } catch {}
fs.writeFileSync('./last-deploy', (+new Date).toString());