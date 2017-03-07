import fs from 'fs';
import _config from './webpack.config.base.babel';

const config = Object.assign({}, _config);
Object.assign(config, {});

export default config;
