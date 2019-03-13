// const key = {
//     GOOGLE_HTTP: process.env.GOOGLE_HTTP,
//     GOOGLE_IP: process.env.GOOGLE_IP
// }

const webpack = require('webpack');
const dotenv = require('dotenv');

function key() {
  // call dotenv and it will return an Object with a parsed key 
  const env = dotenv.config().parsed;
  
  // reduce it to a nice object, the same as before
  const envKeys = Object.keys(env).reduce((prev, next) => {
    prev[`process.env.${next}`] = JSON.stringify(env[next]);
    return prev;
  }, {});

  return {
    plugins: [
      new webpack.DefinePlugin(envKeys)
    ]
  }
}

export default key;
