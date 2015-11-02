import {checkType} from '../lib/check';
import jQuery from '../external/jquery';

function processSuccess(resolve) {
    return (data/* , textStatus, jqXHR */) => {
        resolve(data);
    };
}

function processFailure(reject) {
    return (jqXHR/* , textStatus, errorThrown */) => {
        if (jqXHR.responseJSON) {
            return reject(jqXHR.responseJSON);
        }

        delete jqXHR.then;
        reject(jqXHR);
    };
}

function getUrl(baseUrl, url) {
    // If we are dealing with an absolute url use that instead
    if (new RegExp('^(:?https?:)?//').test(url)) {
        return url;
    }

    const urlParts = [];

    if (baseUrl) {
        urlParts.push(baseUrl);
    }
    urlParts.push(url);

    return urlParts.join('/')
        .replace(new RegExp('(.(?:[^:]))\/\/+', 'g'), '$1/')
        .replace(new RegExp('\/$'), '');
}

class Api {
    constructor(jquery) {
        this.jquery = jquery;
        this.baseUrl = '/api';
        this.defaultRequestSettings = {
            data: {},
            contentType: 'application/json',
            type: undefined,
            url: undefined,
        };
    }

    get(url, data, options) {
        return this.request('GET', getUrl(this.baseUrl, url), data, options);
    }

    post(url, data, options) {
        // Pass data through JSON.stringify, unless options.contentType is 'text/plain' or false (meaning don't process)
        const
            payload = (options && options.contentType !== undefined && (options.contentType === 'text/plain' || options.contentType === false))
            ? data
            : JSON.stringify(data);
        return this.request('POST', getUrl(this.baseUrl, url), payload, options);
    }

    delete(url, options) {
        return this.request('DELETE', getUrl(this.baseUrl, url), undefined, options);
    }

    update(url, data) {
        return this.request('PUT', url, JSON.stringify(data));
    }

    request(type, url, data, options = {}) {
        checkType(type, 'string', 'Request type');
        checkType(url, 'string', 'Url');
        let requestUrl = url;

        if (data && data.filter) {
            const urlQueryParams = data.filter.reduce((str, filter) => { return str + (str.length ? '&' : '') + 'filter=' + filter;}, '');
            delete data.filter;
            requestUrl += '?' + urlQueryParams;
        }

        const api = this;

        function getOptions(mergeOptions, payload) {
            const resultOptions = Object.assign({}, api.defaultRequestSettings, mergeOptions);

            resultOptions.type = type;
            resultOptions.url = requestUrl;
            resultOptions.data = payload;
            resultOptions.dataType = options.dataType !== undefined ? options.dataType : 'json';
            resultOptions.contentType = options.contentType !== undefined ? options.contentType : 'application/json';

            return resultOptions;
        }

        return new Promise((resolve, reject) => {
            let payload = data;
            if (payload === undefined) {
                payload = {};
            } else if (payload === true || payload === false) {
                payload = payload.toString();
            }
            api.jquery
                .ajax(getOptions(options, payload))
                .then(processSuccess(resolve), processFailure(reject));
        });
    }

    setBaseUrl(baseUrl) {
        checkType(baseUrl, 'string', 'Base url');

        this.baseUrl = baseUrl;

        return this;
    }
}

function getApi() {
    if (getApi.api) {
        return getApi.api;
    }
    return (getApi.api = new Api(jQuery));
}

Api.getApi = getApi;

export default Api;
