'use strict';

import {pick} from 'd2/lib/utils';
import {checkType, isString} from 'd2/lib/check';
import Logger from 'd2/logger/Logger';
import model from 'd2/model/models';
import Api from 'd2/api/Api';

var logger = Logger.getLogger();

var d2 = {
    models: undefined,
    model: model,
    Api: Api
};

function d2Init(config) {
    var api = Api.getApi();

    if (config && checkType(config, 'object', 'Config parameter')) {
        processConfig(api, config);
    }

    model.ModelDefinition.prototype.api = api;

    d2.models = new model.ModelDefinitions();

    return api.get('schemas')
        .then(pick('schemas'))
        .then((schemas) => {
            schemas.forEach((schema) => {
                d2.models.add(model.ModelDefinition.createFromSchema(schema));
            });

            return d2;
        })
        .catch((error) => {
            logger.error('Unable to get schemas from the api', error);

            return Promise.reject(error);
        });
}

function processConfig(api, config) {
    if (isString(config.baseUrl)) {
        api.setBaseUrl(config.baseUrl);
    } else {
        api.setBaseUrl('/api');
    }
}

/* istanbul ignore next */
(function (global) {
    if (global.document) {
        global.d2 = d2Init;
    }

})(typeof window !== 'undefined' ? window : module.exports);

export default d2Init;
