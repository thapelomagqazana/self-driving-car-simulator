import Logger from './logger.js';

class ObjectFactory {
    static createObject(type, x, y) {
        switch (type) {
            case 'tree':
                return { x, y, type, color: 'green', width: 20, height: 40 };
            case 'barrier':
                return { x, y, type, color: 'gray', width: 20, height: 40 };
            case 'obstacle':
                return { x, y, type, color: 'black', width: 20, height: 40 };
            default:
                Logger.error(`Unknown object type: ${type}`);
                throw new Error(`Unknown object type: ${type}`);
        }
    }
}

export default ObjectFactory;