import BaseError from '../errors/BaseError';

export default class InvalidBuildDataError extends BaseError {
    constructor(objectName: string) {
        super(`Invalid build data for ${objectName} generation`);
    }
}
