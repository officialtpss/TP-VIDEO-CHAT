// TODO: Refactor some of these into enums?
export const RESPONSE_CODE = {
    UNAUTHORISED: 401,
    INTERNAL_SERVER_ERROR: 500,
    NOT_FOUND: 404,
    SUCCESS: 200,
    CREATED: 201,
    NO_CONTENT_FOUND: 204,
    BAD_REQUEST: 400,
    FORBIDDEN: 403,
    REQUEST_TIMEOUT: 408,
    UNPROCESSABLE_ENTITY: 422,
};

export const LOG_OPERATION_TYPE = {
    DB_OPERATION: 'DB_OPERATION',
    DB_CONNECTION: 'DB_CONNECTION',
    FUNCTIONAL: 'FUNCTIONAL',
    HTTP_REQUEST: 'HTTP_REQUEST',
};

export const RESPONSE_SUCCESS = true;
export const RESPONSE_FAILURE = false; 

export const HTTP_REQUEST_TYPE = {
    POST: 'POST',
    GET: 'GET',
    PUT: 'PUT',
    DELETE: 'DELETE',
};

export const HTTP_REQUEST_HEADER_TYPE = {
    JSON: 'application/json',
    URL_ENCODED: 'application/x-www-form-urlencoded',
    MULTIPART_FORM_DATA: 'multipart/form-data',
};

export const CUSTOM_FIELD_MAX_CHARS = 200;
